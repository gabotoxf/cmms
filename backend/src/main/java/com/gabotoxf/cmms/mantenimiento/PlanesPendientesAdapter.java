package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.orden.OrdenTrabajoService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Adaptador del puerto OrdenTrabajoService.PlanesProvider.
 * El módulo orden define QUÉ necesita; el módulo mantenimiento define CÓMO obtenerlo.
 * Así orden nunca importa clases internas de mantenimiento (hexagonal ligero).
 */
@Component
public class PlanesPendientesAdapter implements OrdenTrabajoService.PlanesProvider {

    private final PlanMantenimientoService planService;

    public PlanesPendientesAdapter(PlanMantenimientoService planService) {
        this.planService = planService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenTrabajoService.PlanPendienteDTO> planesVencidosOProximos() {
        return planService.pendientes(null).stream()
                .map(dto -> new OrdenTrabajoService.PlanPendienteDTO(
                        dto.equipoId(), dto.equipoSerial(), dto.estado().name(), dto.proximaFecha()))
                .toList();
    }
}
