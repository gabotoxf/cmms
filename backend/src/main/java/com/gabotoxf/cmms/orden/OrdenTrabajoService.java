package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.auth.Rol;
import com.gabotoxf.cmms.auth.Usuario;
import com.gabotoxf.cmms.auth.UsuarioRepository;
import com.gabotoxf.cmms.common.EventoOrdenAsignada;
import com.gabotoxf.cmms.common.EventoOrdenCreada;
import com.gabotoxf.cmms.common.EventoOrdenCompletada;
import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.common.PublicadorEventos;
import com.gabotoxf.cmms.equipo.Equipo;
import com.gabotoxf.cmms.equipo.EquipoNoEncontradoException;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.orden.dto.AsignarRequest;
import com.gabotoxf.cmms.orden.dto.CompletarRequest;
import com.gabotoxf.cmms.orden.dto.CrearOrdenRequest;
import com.gabotoxf.cmms.orden.dto.OrdenResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

/**
 * Casos de uso de órdenes de trabajo.
 * Las reglas de transición viven en la entidad OrdenTrabajo; aquí solo orquestamos:
 * validaciones de datos, publicación de eventos y persistencia.
 *
 * Para generar preventivas NO depende del módulo de mantenimiento: define la
 * interfaz PlanesProvider (puerto) y mantenimiento la implementa (adaptador).
 */
@Service
public class OrdenTrabajoService {

    private static final Logger log = LoggerFactory.getLogger(OrdenTrabajoService.class);

    /** Proyección mínima de un plan para decidir si genera orden preventiva. */
    public record PlanPendienteDTO(Long equipoId, String equipoSerial, String estadoPlan, LocalDate proximaFecha) {
    }

    /** Puerto hacia el módulo de mantenimiento (lo implementa PlanesPendientesAdapter). */
    public interface PlanesProvider {
        List<PlanPendienteDTO> planesVencidosOProximos();
    }

    private final OrdenTrabajoRepository ordenRepository;
    private final EquipoRepository equipoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PublicadorEventos publicadorEventos;
    private final PlanesProvider planesProvider;
    private final Clock clock;

    public OrdenTrabajoService(OrdenTrabajoRepository ordenRepository,
                               EquipoRepository equipoRepository,
                               UsuarioRepository usuarioRepository,
                               PublicadorEventos publicadorEventos,
                               PlanesProvider planesProvider,
                               Clock clock) {
        this.ordenRepository = ordenRepository;
        this.equipoRepository = equipoRepository;
        this.usuarioRepository = usuarioRepository;
        this.publicadorEventos = publicadorEventos;
        this.planesProvider = planesProvider;
        this.clock = clock;
    }

    // ===== Creación =====

    /**
     * Crea una orden manual (correctiva de una falla, o preventiva puntual).
     * Publica EventoOrdenCreada (listeners: notificaciones en Fase 5).
     */
    @Transactional
    public OrdenResponse crear(CrearOrdenRequest request) {
        Equipo equipo = equipoRepository.findById(request.equipoId())
                .orElseThrow(() -> new EquipoNoEncontradoException(request.equipoId()));
        if (equipo.getEstado() == com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA) {
            throw new ReglasNegocioOrdenException("No se pueden crear órdenes para un equipo dado de baja");
        }

        LocalDate fechaProgramada = (request.fechaProgramada() != null)
                ? request.fechaProgramada()
                : LocalDate.now(clock);

        OrdenTrabajo orden = new OrdenTrabajo(equipo, request.tipo(),
                request.titulo().trim(), request.descripcion(), fechaProgramada);
        OrdenTrabajo guardada = ordenRepository.save(orden);

        publicadorEventos.publicar(new EventoOrdenCreada(
                guardada.getId(), equipo.getId(), guardada.getTipo(),
                guardada.getTitulo(), null, Instant.now(clock)));
        log.info("Orden {} creada para equipo {} ({})", guardada.getId(), equipo.getSerial(), guardada.getTipo());
        return OrdenResponse.from(guardada);
    }

    /**
     * Genera (si no existe ya una abierta) la orden preventiva de cada equipo cuyo
     * plan está vencido o próximo a vencer. La invoca el job diario y el endpoint manual.
     * Idempotente: dos ejecuciones el mismo día no duplican órdenes.
     */
    @Transactional
    public int generarPreventivasPendientes() {
        LocalDate hoy = LocalDate.now(clock);
        int creadas = 0;

        for (PlanPendienteDTO plan : planesProvider.planesVencidosOProximos()) {
            List<OrdenTrabajo> abiertas = ordenRepository.findByEquipoIdAndTipoAndEstadoIn(
                    plan.equipoId(), TipoOrden.PREVENTIVO,
                    List.of(EstadoOrden.PENDIENTE, EstadoOrden.ASIGNADA, EstadoOrden.EN_PROCESO));
            if (!abiertas.isEmpty()) {
                continue; // ya hay una preventiva abierta para este equipo
            }
            Equipo equipo = equipoRepository.findById(plan.equipoId()).orElse(null);
            if (equipo == null || equipo.getEstado() == com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA) {
                continue;
            }
            OrdenTrabajo orden = new OrdenTrabajo(
                    equipo, TipoOrden.PREVENTIVO,
                    "Mantenimiento preventivo - " + plan.equipoSerial(),
                    "Generada automáticamente: mantenimiento " + plan.estadoPlan()
                            + " (próxima fecha " + plan.proximaFecha() + ")",
                    hoy);
            OrdenTrabajo guardada = ordenRepository.save(orden);
            publicadorEventos.publicar(new EventoOrdenCreada(
                    guardada.getId(), equipo.getId(), guardada.getTipo(),
                    guardada.getTitulo(), null, Instant.now(clock)));
            creadas++;
        }

        if (creadas > 0) {
            log.info("Generación de preventivas: {} órdenes creadas", creadas);
        }
        return creadas;
    }

    // ===== Consultas =====

    @Transactional(readOnly = true)
    public PaginaResponse<OrdenResponse> listar(Pageable pageable, EstadoOrden estado, TipoOrden tipo,
                                                Long equipoId, Long tecnicoId) {
        return listar(pageable, estado, tipo, equipoId, tecnicoId, null);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<OrdenResponse> listar(Pageable pageable, EstadoOrden estado, TipoOrden tipo,
                                                Long equipoId, Long tecnicoId, String q) {
        Specification<OrdenTrabajo> spec = (root, query, cb) -> cb.conjunction();
        if (estado != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("estado"), estado));
        }
        if (tipo != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tipo"), tipo));
        }
        if (equipoId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("equipo").get("id"), equipoId));
        }
        if (tecnicoId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tecnico").get("id"), tecnicoId));
        }
        if (q != null && !q.isBlank()) {
            String like = "%" + q.toLowerCase().trim() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("titulo")), like),
                    cb.like(cb.lower(root.get("descripcion")), like),
                    cb.like(cb.lower(root.get("equipo").get("serial")), like),
                    cb.like(cb.lower(root.get("equipo").get("nombre")), like)));
        }

        Page<OrdenTrabajo> page = ordenRepository.findAll(spec, pageable);
        List<OrdenResponse> contenido = page.getContent().stream().map(OrdenResponse::from).toList();
        return PaginaResponse.from(page, contenido);
    }

    @Transactional(readOnly = true)
    public OrdenResponse obtenerPorId(Long id) {
        return OrdenResponse.from(buscarOrden(id));
    }

    // ===== Transiciones de la máquina de estados =====

    @Transactional
    public OrdenResponse asignar(Long id, AsignarRequest request) {
        OrdenTrabajo orden = buscarOrden(id);
        Usuario tecnico = buscarTecnicoValido(request.tecnicoId());
        orden.asignar(tecnico, clock);
        OrdenTrabajo guardada = ordenRepository.save(orden);

        // Fase 5: el técnico se entera por correo de que tiene una orden asignada
        publicadorEventos.publicar(new EventoOrdenAsignada(
                guardada.getId(), guardada.getEquipo().getId(), guardada.getTitulo(),
                tecnico.getEmail(), tecnico.getNombreCompleto(), Instant.now(clock)));
        return OrdenResponse.from(guardada);
    }

    @Transactional
    public OrdenResponse iniciar(Long id) {
        OrdenTrabajo orden = buscarOrden(id);
        orden.iniciar(clock);
        return OrdenResponse.from(ordenRepository.save(orden));
    }

    /**
     * Completa la orden. Publica EventoOrdenCompletada: el módulo de mantenimiento
     * la escucha y registra la ejecución en el plan si la orden era preventiva.
     */
    @Transactional
    public OrdenResponse completar(Long id, CompletarRequest request) {
        OrdenTrabajo orden = buscarOrden(id);
        orden.completar(request.resultado(), clock);
        OrdenTrabajo guardada = ordenRepository.save(orden);

        publicadorEventos.publicar(new EventoOrdenCompletada(
                guardada.getId(), guardada.getEquipo().getId(), guardada.getTipo(),
                guardada.getResultado(),
                guardada.getTecnico() != null ? guardada.getTecnico().getNombreCompleto() : null,
                Instant.now(clock)));
        log.info("Orden {} completada", guardada.getId());
        return OrdenResponse.from(guardada);
    }

    @Transactional
    public OrdenResponse cancelar(Long id, String motivo) {
        OrdenTrabajo orden = buscarOrden(id);
        orden.cancelar(motivo, clock);
        return OrdenResponse.from(ordenRepository.save(orden));
    }

    /**
     * Regla de autorización funcional: sobre una orden, un TECNICO solo puede
     * trabajar (iniciar/completar) la suya; ADMIN/INGENIERO pueden trabajar cualquiera.
     * Lo llama el controller antes de las transiciones.
     */
    @Transactional(readOnly = true)
    public void exigirPuedeTrabajar(Long ordenId, String emailUsuario) {
        OrdenTrabajo orden = buscarOrden(ordenId);
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new TecnicoInvalidoException("Usuario autenticado no encontrado: " + emailUsuario));
        boolean esSuperior = usuario.getRol() == Rol.ADMIN || usuario.getRol() == Rol.INGENIERO;
        boolean esSuOrden = orden.getTecnico() != null && emailUsuario.equals(orden.getTecnico().getEmail());
        if (!esSuperior && !esSuOrden) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Solo el técnico asignado puede trabajar esta orden");
        }
    }

    // ===== Helpers =====

    private OrdenTrabajo buscarOrden(Long id) {
        return ordenRepository.findById(id)
                .orElseThrow(() -> new OrdenNoEncontradaException(id));
    }

    private Usuario buscarTecnicoValido(Long tecnicoId) {
        Usuario usuario = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new TecnicoInvalidoException("No existe un usuario con id: " + tecnicoId));
        if (!usuario.isActivo()) {
            throw new TecnicoInvalidoException("El usuario " + usuario.getEmail() + " está inactivo");
        }
        if (usuario.getRol() != Rol.TECNICO && usuario.getRol() != Rol.INGENIERO && usuario.getRol() != Rol.ADMIN) {
            throw new TecnicoInvalidoException("El usuario " + usuario.getEmail()
                    + " no tiene rol de técnico (rol actual: " + usuario.getRol() + ")");
        }
        return usuario;
    }

    public static class ReglasNegocioOrdenException extends com.gabotoxf.cmms.common.ReglasNegocioException {
        public ReglasNegocioOrdenException(String mensaje) {
            super(mensaje);
        }
    }
}
