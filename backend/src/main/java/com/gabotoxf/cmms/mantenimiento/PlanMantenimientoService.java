package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.equipo.Equipo;
import com.gabotoxf.cmms.equipo.EquipoNoEncontradoException;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.equipo.EstadoEquipo;
import com.gabotoxf.cmms.mantenimiento.dto.EjecucionRequest;
import com.gabotoxf.cmms.mantenimiento.dto.PlanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * Lógica de negocio del mantenimiento preventivo.
 * Ya no la llama EquipoService directamente: reacciona a eventos de dominio
 * (ver PlanEquipoEventListener), lo que deja los módulos desacoplados.
 * Todas las fechas pasan por el Clock inyectable (testeable, zona Bogotá).
 */
@Service
public class PlanMantenimientoService {

    private static final Logger log = LoggerFactory.getLogger(PlanMantenimientoService.class);

    private final PlanMantenimientoRepository planRepository;
    private final RegistroMantenimientoRepository registroRepository;
    private final EquipoRepository equipoRepository;
    private final Clock clock;
    private final int diasAlerta;

    public PlanMantenimientoService(PlanMantenimientoRepository planRepository,
                                    RegistroMantenimientoRepository registroRepository,
                                    EquipoRepository equipoRepository,
                                    Clock clock,
                                    @Value("${app.mantenimiento.dias-alerta:15}") int diasAlerta) {
        this.planRepository = planRepository;
        this.registroRepository = registroRepository;
        this.equipoRepository = equipoRepository;
        this.clock = clock;
        this.diasAlerta = diasAlerta;
    }

    // ===== Sincronización con el ciclo de vida del equipo (invocada por eventos) =====

    /**
     * Crea el plan de un equipo si no existe. La llama el listener de EventoEquipoCreado
     * dentro de la misma transacción de la creación del equipo.
     */
    @Transactional
    public void crearPlanSiFalta(Long equipoId, Integer periodicidadDias) {
        if (periodicidadDias == null || planRepository.existsByEquipoId(equipoId)) {
            return;
        }
        Equipo equipo = equipoRepository.findById(equipoId)
                .orElseThrow(() -> new EquipoNoEncontradoException(equipoId));
        planRepository.save(new PlanMantenimiento(equipo, periodicidadDias, LocalDate.now(clock)));
        log.info("Plan creado para equipo {} ({})", equipo.getSerial(), equipo.getNombre());
    }

    /**
     * Alinea la frecuencia del plan con la periodicidad vigente del equipo.
     * La llama el listener de EventoEquipoActualizado.
     */
    @Transactional
    public void sincronizarFrecuencia(Long equipoId, Integer periodicidadDias) {
        if (periodicidadDias == null) {
            return;
        }
        planRepository.findByEquipoId(equipoId).ifPresent(plan -> {
            if (!plan.getFrecuenciaDias().equals(periodicidadDias)) {
                plan.cambiarFrecuencia(periodicidadDias, clock);
                log.info("Frecuencia del plan del equipo {} actualizada a {} días", equipoId, periodicidadDias);
            }
        });
    }

    /**
     * Backfill: crea los planes que falten para equipos activos sin plan.
     * Lo ejecuta el seeder al arrancar. Idempotente.
     */
    @Transactional
    public int sincronizarTodos() {
        int creados = 0;
        for (Equipo equipo : equipoRepository.findAll()) {
            if (equipo.getEstado() == EstadoEquipo.DADO_DE_BAJA) {
                continue;
            }
            if (!planRepository.existsByEquipoId(equipo.getId())) {
                planRepository.save(new PlanMantenimiento(equipo, equipo.getPeriodicidadMantenimientoDias(),
                        LocalDate.now(clock)));
                creados++;
            }
        }
        if (creados > 0) {
            log.info("Backfill: {} planes de mantenimiento creados", creados);
        }
        return creados;
    }

    // ===== Consultas =====

    /**
     * Listado paginado con filtros resueltos en SQL (antes filtraba en memoria
     * después de paginar: páginas incompletas y totales inconsistentes).
     */
    @Transactional(readOnly = true)
    public PaginaResponse<PlanResponse> listar(Pageable pageable, EstadoPlan estado, Long equipoId) {
        LocalDate hoy = LocalDate.now(clock);
        Page<PlanMantenimiento> page = planRepository.findAll(
                PlanMantenimientoRepository.conFiltros(equipoId, hoy, diasAlerta, estado), pageable);
        List<PlanResponse> contenido = page.getContent().stream()
                .map(plan -> PlanResponse.from(plan, estadoDe(plan), hoy))
                .toList();
        return PaginaResponse.from(page, contenido);
    }

    @Transactional(readOnly = true)
    public PlanResponse obtenerPorId(Long id) {
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));
        return PlanResponse.from(plan, estadoDe(plan), LocalDate.now(clock));
    }

    @Transactional(readOnly = true)
    public PlanResponse obtenerPorEquipo(Long equipoId) {
        PlanMantenimiento plan = planRepository.findByEquipoId(equipoId)
                .orElseThrow(() -> new EquipoNoEncontradoException(equipoId));
        return PlanResponse.from(plan, estadoDe(plan), LocalDate.now(clock));
    }

    /**
     * Planes con mantenimiento vencido o próximo a vencer (según umbral).
     * estado filtra VENCIDO o PROXIMO; null trae ambos.
     */
    @Transactional(readOnly = true)
    public List<PlanResponse> pendientes(EstadoPlan estado) {
        LocalDate hoy = LocalDate.now(clock);
        List<PlanMantenimiento> planes = planRepository
                .findByProximaFechaLessThanEqualAndEquipoEstadoNot(hoy.plusDays(diasAlerta), EstadoEquipo.DADO_DE_BAJA);
        return planes.stream()
                .map(plan -> PlanResponse.from(plan, estadoDe(plan), hoy))
                .filter(dto -> estado == null || dto.estado() == estado)
                .sorted(Comparator.comparing(PlanResponse::proximaFecha))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanResponse> vencidos() {
        return pendientes(EstadoPlan.VENCIDO);
    }

    /** Proyección liviana de un plan pendiente, para jobs y notificaciones (Fase 5). */
    public record PlanResumen(Long planId, Long equipoId, String equipoSerial, String equipoNombre,
                              EstadoPlan estadoPlan, LocalDate proximaFecha) {
    }

    /**
     * Planes vencidos o próximos a vencer en forma liviana (sin paginar).
     * La consume el job de alertas de la Fase 5.
     */
    @Transactional(readOnly = true)
    public List<PlanResumen> pendientesResumen() {
        return pendientes(null).stream()
                .map(dto -> new PlanResumen(dto.id(), dto.equipoId(), dto.equipoSerial(),
                        dto.equipoNombre(), dto.estado(), dto.proximaFecha()))
                .toList();
    }

    // ===== Operaciones =====

    @Transactional
    public PlanResponse cambiarFrecuencia(Long id, Integer nuevaFrecuencia) {
        if (nuevaFrecuencia == null || nuevaFrecuencia < 1) {
            throw new FechaInvalidaException("La frecuencia debe ser de al menos 1 día");
        }
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));
        plan.cambiarFrecuencia(nuevaFrecuencia, clock);
        return PlanResponse.from(planRepository.save(plan), estadoDe(plan), LocalDate.now(clock));
    }

    @Transactional
    public PlanResponse registrarEjecucion(Long id, EjecucionRequest request) {
        LocalDate fecha = request.fechaEjecucion();
        if (fecha == null) {
            throw new FechaInvalidaException("La fecha de ejecución es obligatoria");
        }
        if (fecha.isAfter(LocalDate.now(clock))) {
            throw new FechaInvalidaException("No se puede registrar una ejecución futura: " + fecha);
        }
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));

        plan.registrarEjecucion(fecha);
        planRepository.save(plan);

        registroRepository.save(new RegistroMantenimiento(plan, fecha, request.descripcion(), request.tecnico()));
        log.info("Ejecución registrada para plan {}: próxima fecha {}", id, plan.getProximaFecha());
        return PlanResponse.from(plan, estadoDe(plan), LocalDate.now(clock));
    }

    @Transactional(readOnly = true)
    public List<RegistroMantenimiento> historial(Long id) {
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));
        return registroRepository.findByPlanIdOrderByFechaEjecucionDesc(plan.getId());
    }

    /**
     * Registra la ejecución del plan de un equipo a partir de una orden preventiva
     * completada (la llama el listener de EventoOrdenCompletada).
     */
    @Transactional
    public void registrarEjecucionDesdeOrden(Long equipoId, LocalDate fechaEjecucion,
                                             String descripcion, String tecnico) {
        PlanMantenimiento plan = planRepository.findByEquipoId(equipoId)
                .orElseThrow(() -> new PlanNoEncontradoException(equipoId));
        plan.registrarEjecucion(fechaEjecucion);
        planRepository.save(plan);
        registroRepository.save(new RegistroMantenimiento(plan, fechaEjecucion, descripcion, tecnico));
        log.info("Plan del equipo {} actualizado: próxima fecha {}", equipoId, plan.getProximaFecha());
    }

    /**
     * Revisión de planes: cuántos vencidos y cuántos próximos (umbral configurable).
     * Con counts en SQL: no carga entidades a memoria. La invoca el job diario.
     */
    @Transactional(readOnly = true)
    public ResumenRevision revisar() {
        LocalDate hoy = LocalDate.now(clock);
        long vencidos = planRepository.countByProximaFechaLessThanEqualAndEquipoEstadoNot(
                hoy, EstadoEquipo.DADO_DE_BAJA);
        long totalHastaLimite = planRepository.countByProximaFechaLessThanEqualAndEquipoEstadoNot(
                hoy.plusDays(diasAlerta), EstadoEquipo.DADO_DE_BAJA);
        long proximos = totalHastaLimite - vencidos;
        return new ResumenRevision(hoy, diasAlerta, vencidos, proximos);
    }

    /**
     * Estado derivado, consistente con los filtros SQL del repositorio:
     * VENCIDO si proximaFecha <= hoy; PROXIMO si cae dentro del umbral; AL_DIA después.
     */
    private EstadoPlan estadoDe(PlanMantenimiento plan) {
        LocalDate hoy = LocalDate.now(clock);
        if (!plan.getProximaFecha().isAfter(hoy)) {
            return EstadoPlan.VENCIDO;
        }
        if (!plan.getProximaFecha().isAfter(hoy.plusDays(diasAlerta))) {
            return EstadoPlan.PROXIMO;
        }
        return EstadoPlan.AL_DIA;
    }

    public record ResumenRevision(LocalDate fechaRevision, int diasAlerta, long vencidos, long proximos) {
    }
}
