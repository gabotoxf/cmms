package com.gabotoxf.cmms.dashboard;

import com.gabotoxf.cmms.equipo.ConteoEstadoEquipos;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimientoService;
import com.gabotoxf.cmms.orden.ConteoEstadoOrdenes;
import com.gabotoxf.cmms.orden.EstadoOrden;
import com.gabotoxf.cmms.orden.OrdenTrabajoRepository;
import com.gabotoxf.cmms.orden.TipoOrden;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Fase 7: indicadores agregados para el dashboard del frontend.
 * Todo se calcula con counts/agregados en SQL (los datos crecen, la respuesta no).
 *
 * - MTTR (Mean Time To Repair): duración media de las correctivas completadas
 *   en los últimos 30 días, desde que se inició (o asignó) hasta que se completó.
 * - Cumplimiento del mes: preventivas completadas / preventivas programadas
 *   del mes en curso (excluye canceladas). Null si no hay programadas.
 */
@Service
public class DashboardService {

    private static final int DIAS_VENTANA_MTTR = 30;

    private final EquipoRepository equipoRepository;
    private final OrdenTrabajoRepository ordenRepository;
    private final PlanMantenimientoService planService;
    private final Clock clock;

    public DashboardService(EquipoRepository equipoRepository,
                            OrdenTrabajoRepository ordenRepository,
                            PlanMantenimientoService planService,
                            Clock clock) {
        this.equipoRepository = equipoRepository;
        this.ordenRepository = ordenRepository;
        this.planService = planService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public ResumenDashboard resumen() {
        LocalDate hoy = LocalDate.now(clock);
        PlanMantenimientoService.ResumenRevision revision = planService.revisar();

        return new ResumenDashboard(
                equiposPorEstado(),
                ordenesPorEstado(),
                ordenRepository.countByEstadoIn(
                        List.of(EstadoOrden.PENDIENTE, EstadoOrden.ASIGNADA, EstadoOrden.EN_PROCESO)),
                revision.vencidos(),
                revision.proximos(),
                mttrHoras(),
                cumplimientoMes(hoy),
                hoy);
    }

    private Map<String, Long> equiposPorEstado() {
        Map<String, Long> mapa = new LinkedHashMap<>();
        for (ConteoEstadoEquipos fila : equipoRepository.contarPorEstado()) {
            mapa.put(fila.getEstado().name(), fila.getTotal());
        }
        return mapa;
    }

    private Map<String, Long> ordenesPorEstado() {
        Map<String, Long> mapa = new LinkedHashMap<>();
        for (ConteoEstadoOrdenes fila : ordenRepository.contarPorEstado()) {
            mapa.put(fila.getEstado().name(), fila.getTotal());
        }
        return mapa;
    }

    /** MTTR en horas de las correctivas completadas en la ventana; null si no hay datos. */
    private Double mttrHoras() {
        Instant hasta = Instant.now(clock);
        Instant desde = hasta.minus(java.time.Duration.ofDays(DIAS_VENTANA_MTTR));

        List<com.gabotoxf.cmms.orden.OrdenTrabajo> correctivas = ordenRepository
                .findByTipoAndEstadoAndCompletadaEnBetween(
                        TipoOrden.CORRECTIVO, EstadoOrden.COMPLETADA, desde, hasta);

        return correctivas.stream()
                .map(o -> {
                    Instant inicio = (o.getIniciadaEn() != null) ? o.getIniciadaEn() : o.getAsignadaEn();
                    return (inicio != null) ? Duration.between(inicio, o.getCompletadaEn()) : null;
                })
                .filter(d -> d != null && !d.isNegative())
                .mapToDouble(Duration::toMillis)
                .average()
                .stream()
                .map(promedioMs -> Math.round(promedioMs / 3_600_000.0 * 10) / 10.0)
                .boxed()
                .findFirst()
                .orElse(null);
    }

    /** % de preventivas completadas del mes en curso; null si no hay programadas. */
    private Double cumplimientoMes(LocalDate hoy) {
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDate finMes = inicioMes.plusMonths(1).minusDays(1);

        long programadas = ordenRepository.countByTipoAndFechaProgramadaBetweenAndEstadoNot(
                TipoOrden.PREVENTIVO, inicioMes, finMes, EstadoOrden.CANCELADA);
        if (programadas == 0) {
            return null;
        }
        long completadas = ordenRepository.countByTipoAndFechaProgramadaBetweenAndEstado(
                TipoOrden.PREVENTIVO, inicioMes, finMes, EstadoOrden.COMPLETADA);
        return Math.round(100.0 * completadas / programadas * 10) / 10.0;
    }

    /**
     * Resumen del dashboard. Los mapas son nombre de estado -> cantidad
     * (claves estables para graficar; los estados sin órdenes simplemente no aparecen).
     */
    public record ResumenDashboard(
            Map<String, Long> equiposPorEstado,
            Map<String, Long> ordenesPorEstado,
            long ordenesAbiertas,
            long planesVencidos,
            long planesProximos,
            Double mttrHoras,
            Double cumplimientoMesPct,
            LocalDate generadoEn
    ) {
    }
}
