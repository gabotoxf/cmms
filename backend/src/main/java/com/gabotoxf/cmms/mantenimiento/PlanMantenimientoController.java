package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.common.PageableUtils;
import com.gabotoxf.cmms.mantenimiento.dto.EjecucionRequest;
import com.gabotoxf.cmms.mantenimiento.dto.PlanResponse;
import com.gabotoxf.cmms.mantenimiento.dto.RegistroResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/planes-mantenimiento")
@Tag(name = "Planes de mantenimiento", description = "Mantenimiento preventivo por equipo")
@PreAuthorize("isAuthenticated()")
public class PlanMantenimientoController {

    private static final Set<String> CAMPOS_ORDENABLES = Set.of("id", "proximaFecha", "frecuenciaDias", "creadoEn");

    private final PlanMantenimientoService planService;

    public PlanMantenimientoController(PlanMantenimientoService planService) {
        this.planService = planService;
    }

    @GetMapping
    @Operation(summary = "Lista planes con paginación y filtros opcionales")
    public PaginaResponse<PlanResponse> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @RequestParam(defaultValue = "proximaFecha") String orden,
            @RequestParam(required = false) EstadoPlan estado,
            @RequestParam(required = false) Long equipoId) {

        Pageable pageable = PageableUtils.sanitizar(pagina, tamano, orden, CAMPOS_ORDENABLES, "proximaFecha");
        return planService.listar(pageable, estado, equipoId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene un plan por id")
    public PlanResponse obtenerPorId(@PathVariable Long id) {
        return planService.obtenerPorId(id);
    }

    @GetMapping("/equipo/{equipoId}")
    @Operation(summary = "Obtiene el plan de un equipo")
    public PlanResponse obtenerPorEquipo(@PathVariable Long equipoId) {
        return planService.obtenerPorEquipo(equipoId);
    }

    @GetMapping("/pendientes")
    @Operation(summary = "Planes vencidos o próximos a vencer")
    public List<PlanResponse> pendientes(@RequestParam(required = false) EstadoPlan estado) {
        return planService.pendientes(estado);
    }

    @GetMapping("/vencidos")
    @Operation(summary = "Planes vencidos")
    public List<PlanResponse> vencidos() {
        return planService.vencidos();
    }

    @GetMapping("/revision")
    @Operation(summary = "Resumen de revisión (vencidos / próximos) con counts en SQL")
    public PlanMantenimientoService.ResumenRevision revision() {
        return planService.revisar();
    }

    @PostMapping("/revision")
    @Operation(summary = "Ejecuta la revisión manualmente (el job diario la corre a las 2 a.m.)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public PlanMantenimientoService.ResumenRevision ejecutarRevision() {
        return planService.revisar();
    }

    @PatchMapping("/{id}/frecuencia")
    @Operation(summary = "Cambia la frecuencia del plan (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public PlanResponse cambiarFrecuencia(@PathVariable Long id, @RequestBody Integer nuevaFrecuencia) {
        return planService.cambiarFrecuencia(id, nuevaFrecuencia);
    }

    @PostMapping("/{id}/ejecuciones")
    @Operation(summary = "Registra una ejecución del mantenimiento (ADMIN, INGENIERO o TECNICO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO','TECNICO')")
    public ResponseEntity<PlanResponse> registrarEjecucion(@PathVariable Long id,
                                                           @Valid @RequestBody EjecucionRequest request) {
        PlanResponse response = planService.registrarEjecucion(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/historial")
    @Operation(summary = "Historial de ejecuciones del plan")
    public List<RegistroResponse> historial(@PathVariable Long id) {
        return planService.historial(id).stream().map(RegistroResponse::from).toList();
    }
}
