package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.auth.Usuario;
import com.gabotoxf.cmms.auth.UserDetailsServiceImpl;
import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.common.PageableUtils;
import com.gabotoxf.cmms.orden.dto.AsignarRequest;
import com.gabotoxf.cmms.orden.dto.CompletarRequest;
import com.gabotoxf.cmms.orden.dto.CrearOrdenRequest;
import com.gabotoxf.cmms.orden.dto.OrdenResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Set;

@RestController
@RequestMapping("/api/ordenes-trabajo")
@Tag(name = "Órdenes de trabajo", description = "Ciclo de vida de órdenes preventivas y correctivas")
@PreAuthorize("isAuthenticated()")
public class OrdenTrabajoController {

    private static final Set<String> CAMPOS_ORDENABLES =
            Set.of("id", "estado", "tipo", "fechaProgramada", "creadoEn");

    private final OrdenTrabajoService ordenService;
    private final com.gabotoxf.cmms.auth.UsuarioRepository usuarioRepository;

    public OrdenTrabajoController(OrdenTrabajoService ordenService,
                                  com.gabotoxf.cmms.auth.UsuarioRepository usuarioRepository) {
        this.ordenService = ordenService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    @Operation(summary = "Crea una orden de trabajo (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public ResponseEntity<OrdenResponse> crear(@Valid @RequestBody CrearOrdenRequest request) {
        OrdenResponse response = ordenService.crear(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista órdenes con filtros (estado, tipo, equipo, técnico)")
    public PaginaResponse<OrdenResponse> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @RequestParam(defaultValue = "id") String orden,
            @RequestParam(required = false) EstadoOrden estado,
            @RequestParam(required = false) TipoOrden tipo,
            @RequestParam(required = false) Long equipoId,
            @RequestParam(required = false) Long tecnicoId) {

        Pageable pageable = PageableUtils.sanitizar(pagina, tamano, orden, CAMPOS_ORDENABLES, "id");
        return ordenService.listar(pageable, estado, tipo, equipoId, tecnicoId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene una orden por id")
    public OrdenResponse obtenerPorId(@PathVariable Long id) {
        return ordenService.obtenerPorId(id);
    }

    @PatchMapping("/{id}/asignar")
    @Operation(summary = "Asigna un técnico (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public OrdenResponse asignar(@PathVariable Long id, @Valid @RequestBody AsignarRequest request) {
        return ordenService.asignar(id, request);
    }

    @PatchMapping("/{id}/iniciar")
    @Operation(summary = "Pasa la orden a EN_PROCESO (solo el técnico asignado, o ADMIN/INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO','TECNICO')")
    public OrdenResponse iniciar(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        ordenService.exigirPuedeTrabajar(id, userDetails.getUsername());
        return ordenService.iniciar(id);
    }

    @PatchMapping("/{id}/completar")
    @Operation(summary = "Completa la orden con resultado (solo el técnico asignado, o ADMIN/INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO','TECNICO')")
    public OrdenResponse completar(@PathVariable Long id,
                                   @Valid @RequestBody CompletarRequest request,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        ordenService.exigirPuedeTrabajar(id, userDetails.getUsername());
        return ordenService.completar(id, request);
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancela la orden (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public OrdenResponse cancelar(@PathVariable Long id, @RequestBody(required = false) String motivo) {
        return ordenService.cancelar(id, motivo);
    }

    @PostMapping("/generar-preventivas")
    @Operation(summary = "Ejecuta manualmente la generación de preventivas (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public java.util.Map<String, Integer> generarPreventivas() {
        int creadas = ordenService.generarPreventivasPendientes();
        return java.util.Map.of("ordenesCreadas", creadas);
    }
}
