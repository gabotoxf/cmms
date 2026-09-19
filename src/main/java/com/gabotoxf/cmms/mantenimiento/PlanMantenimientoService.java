package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.equipo.Equipo;
import com.gabotoxf.cmms.equipo.EquipoNoEncontradoException;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.mantenimiento.dto.EjecucionRequest;
import com.gabotoxf.cmms.mantenimiento.dto.PlanResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PlanMantenimientoService {

    private static final Logger log = LoggerFactory.getLogger(PlanMantenimientoService.class);

    private final PlanMantenimientoRepository planRepository;
    private final RegistroMantenimientoRepository registroRepository;
    private final EquipoRepository equipoRepository;
    private final int diasAlerta;

    public PlanMantenimientoService(PlanMantenimientoRepository planRepository,
                                    RegistroMantenimientoRepository registroRepository,
                                    EquipoRepository equipoRepository,
                                    @Value("${app.mantenimiento.dias-alerta:15}") int diasAlerta) {
        this.planRepository = planRepository;
        this.registroRepository = registroRepository;
        this.equipoRepository = equipoRepository;
        this.diasAlerta = diasAlerta;
    }

    // ===== Sincronización con el ciclo de vida del equipo =====

    /**
     * Crea (o actualiza) el plan de un equipo. Se invoca al crear un equipo
     * y cuando cambia su periodicidad. La próxima fecha se recalcula desde
     * la última ejecución, o desde hoy si el plan es nuevo.
     */
    @Transactional
    public void sincronizarPlan(Equipo equipo) {
        if (equipo.getPeriodicidadMantenimientoDias() == null) {
            return;
        }
        PlanMantenimiento plan = planRepository.findByEquipoId(equipo.getId()).orElse(null);
        if (plan == null) {
            planRepository.save(new PlanMantenimiento(equipo, equipo.getPeriodicidadMantenimientoDias(), LocalDate.now()));
            log.info("Plan creado para equipo {} ({})", equipo.getSerial(), equipo.getNombre());
        } else if (!plan.getFrecuenciaDias().equals(equipo.getPeriodicidadMantenimientoDias())) {
            plan.cambiarFrecuencia(equipo.getPeriodicidadMantenimientoDias());
            log.info("Frecuencia del plan del equipo {} actualizada a {} días", equipo.getSerial(), plan.getFrecuenciaDias());
        }
    }

    /**
     * Elimina el plan de un equipo (solo cuando se borra físicamente).
     */
    @Transactional
    public void eliminarPlanDeEquipo(Long equipoId) {
        planRepository.findByEquipoId(equipoId).ifPresent(planRepository::delete);
    }

    /**
     * Backfill: crea los planes que falten para equipos que aún no tienen uno.
     * Lo ejecuta el seeder al arrancar y puede invocarse manualmente.
     */
    @Transactional
    public int sincronizarTodos() {
        int creados = 0;
        for (Equipo equipo : equipoRepository.findAll()) {
            if (equipo.getEstado() == com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA) {
                continue;
            }
            if (!planRepository.existsByEquipoId(equipo.getId())) {
                planRepository.save(new PlanMantenimiento(equipo, equipo.getPeriodicidadMantenimientoDias(), LocalDate.now()));
                creados++;
            }
        }
        if (creados > 0) {
            log.info("Backfill: {} planes de mantenimiento creados", creados);
        }
        return creados;
    }

    // ===== Consultas =====

    @Transactional(readOnly = true)
    public PaginaResponse<PlanResponse> listar(Pageable pageable, EstadoPlan estado, Long equipoId) {
        Page<PlanMantenimiento> page = planRepository.findAll(pageable);
        List<PlanResponse> contenido = new ArrayList<>();
        for (PlanMantenimiento plan : page.getContent()) {
            PlanResponse dto = PlanResponse.from(plan, estadoDe(plan));
            if (estado == null || dto.estado() == estado) {
                if (equipoId == null || dto.equipoId().equals(equipoId)) {
                    contenido.add(dto);
                }
            }
        }
        return new PaginaResponse<>(contenido, page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
    }

    @Transactional(readOnly = true)
    public PlanResponse obtenerPorId(Long id) {
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));
        return PlanResponse.from(plan, estadoDe(plan));
    }

    @Transactional(readOnly = true)
    public PlanResponse obtenerPorEquipo(Long equipoId) {
        PlanMantenimiento plan = planRepository.findByEquipoId(equipoId)
                .orElseThrow(() -> new EquipoNoEncontradoException(equipoId));
        return PlanResponse.from(plan, estadoDe(plan));
    }

    /**
     * Equipos con mantenimiento próximo a vencer o vencido.
     * estado: VENCIDO o PROXIMO filtra; null trae ambos.
     */
    @Transactional(readOnly = true)
    public List<PlanResponse> pendientes(EstadoPlan estado) {
        LocalDate limite = LocalDate.now().plusDays(diasAlerta);
        List<PlanResponse> resultado = new ArrayList<>();
        for (PlanMantenimiento plan : planRepository.findPendientesHasta(limite)) {
            PlanResponse dto = PlanResponse.from(plan, estadoDe(plan));
            if (estado == null || dto.estado() == estado) {
                resultado.add(dto);
            }
        }
        resultado.sort((a, b) -> a.proximaFecha().compareTo(b.proximaFecha()));
        return resultado;
    }

    @Transactional(readOnly = true)
    public List<PlanResponse> vencidos() {
        return pendientes(EstadoPlan.VENCIDO);
    }

    // ===== Operaciones =====

    @Transactional
    public PlanResponse cambiarFrecuencia(Long id, Integer nuevaFrecuencia) {
        if (nuevaFrecuencia == null || nuevaFrecuencia < 1) {
            throw new FechaInvalidaException("La frecuencia debe ser de al menos 1 día");
        }
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));
        plan.cambiarFrecuencia(nuevaFrecuencia);
        return PlanResponse.from(planRepository.save(plan), estadoDe(plan));
    }

    @Transactional
    public PlanResponse registrarEjecucion(Long id, EjecucionRequest request) {
        LocalDate fecha = request.fechaEjecucion();
        if (fecha == null) {
            throw new FechaInvalidaException("La fecha de ejecución es obligatoria");
        }
        if (fecha.isAfter(LocalDate.now())) {
            throw new FechaInvalidaException("No se puede registrar una ejecución futura: " + fecha);
        }
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));

        plan.registrarEjecucion(fecha);
        planRepository.save(plan);

        registroRepository.save(new RegistroMantenimiento(plan, fecha, request.descripcion(), request.tecnico()));
        log.info("Ejecución registrada para plan {}: próxima fecha {}", id, plan.getProximaFecha());
        return PlanResponse.from(plan, estadoDe(plan));
    }

    @Transactional(readOnly = true)
    public List<RegistroMantenimiento> historial(Long id) {
        PlanMantenimiento plan = planRepository.findById(id)
                .orElseThrow(() -> new PlanNoEncontradoException(id));
        return registroRepository.findByPlanIdOrderByFechaEjecucionDesc(plan.getId());
    }

    /**
     * Revisión de planes: calcula cuántos están vencidos y cuántos próximos.
     * La invoca el job diario y también el endpoint manual.
     */
    @Transactional(readOnly = true)
    public ResumenRevision revisar() {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(diasAlerta);
        long vencidos = planRepository.findPendientesHasta(hoy).size();
        long proximos = planRepository.findPendientesHasta(limite).size() - vencidos;
        return new ResumenRevision(hoy, diasAlerta, vencidos, proximos);
    }

    private EstadoPlan estadoDe(PlanMantenimiento plan) {
        LocalDate hoy = LocalDate.now();
        if (plan.getProximaFecha().isBefore(hoy)) {
            return EstadoPlan.VENCIDO;
        }
        if (plan.getProximaFecha().isBefore(hoy.plusDays(diasAlerta + 1L))) {
            return EstadoPlan.PROXIMO;
        }
        return EstadoPlan.AL_DIA;
    }

    public record ResumenRevision(LocalDate fechaRevision, int diasAlerta, long vencidos, long proximos) {
    }
}
