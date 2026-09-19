package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.mantenimiento.dto.EjecucionRequest;
import com.gabotoxf.cmms.mantenimiento.dto.PlanResponse;
import com.gabotoxf.cmms.mantenimiento.dto.RegistroResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

@RestController
@RequestMapping("/api/planes-mantenimiento")
@PreAuthorize("isAuthenticated()")
public class PlanMantenimientoController {

    private final PlanMantenimientoService planService;

    public PlanMantenimientoController(PlanMantenimientoService planService) {
        this.planService = planService;
    }

    @GetMapping
    public PaginaResponse<PlanResponse> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @RequestParam(required = false) EstadoPlan estado,
            @RequestParam(required = false) Long equipoId) {
        Pageable pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.ASC, "proximaFecha"));
        return planService.listar(pageable, estado, equipoId);
    }

    @GetMapping("/{id}")
    public PlanResponse obtenerPorId(@PathVariable Long id) {
        return planService.obtenerPorId(id);
    }

    @GetMapping("/equipo/{equipoId}")
    public PlanResponse obtenerPorEquipo(@PathVariable Long equipoId) {
        return planService.obtenerPorEquipo(equipoId);
    }

    @GetMapping("/pendientes")
    public List<PlanResponse> pendientes(@RequestParam(required = false) EstadoPlan estado) {
        return planService.pendientes(estado);
    }

    @GetMapping("/vencidos")
    public List<PlanResponse> vencidos() {
        return planService.vencidos();
    }

    @GetMapping("/revision")
    public PlanMantenimientoService.ResumenRevision revision() {
        return planService.revisar();
    }

    @PatchMapping("/{id}/frecuencia")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public PlanResponse cambiarFrecuencia(@PathVariable Long id, @RequestBody Integer nuevaFrecuencia) {
        return planService.cambiarFrecuencia(id, nuevaFrecuencia);
    }

    @PostMapping("/{id}/ejecuciones")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO','TECNICO')")
    public ResponseEntity<PlanResponse> registrarEjecucion(@PathVariable Long id,
                                                           @Valid @RequestBody EjecucionRequest request) {
        PlanResponse response = planService.registrarEjecucion(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/historial")
    public List<RegistroResponse> historial(@PathVariable Long id) {
        return planService.historial(id).stream().map(RegistroResponse::from).toList();
    }
}
