package com.gabotoxf.cmms.dashboard;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Fase 7: endpoints agregados para alimentar los gráficos del frontend.
 * Un solo payload con todo lo que la vista principal necesita (una llamada, cero N+1).
 */
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Indicadores agregados: estados, MTTR y cumplimiento del mes")
@PreAuthorize("isAuthenticated()")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/resumen")
    @Operation(summary = "Resumen de indicadores: equipos y órdenes por estado, planes vencidos, MTTR y cumplimiento")
    public DashboardService.ResumenDashboard resumen() {
        return dashboardService.resumen();
    }
}
