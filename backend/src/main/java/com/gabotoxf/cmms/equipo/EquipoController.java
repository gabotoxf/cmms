package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.common.PageableUtils;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import com.gabotoxf.cmms.equipo.dto.EquipoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Set;

@RestController
@RequestMapping("/api/equipos")
@Tag(name = "Equipos", description = "Inventario de equipos biomédicos (hoja de vida)")
@PreAuthorize("isAuthenticated()")
public class EquipoController {

    /** Campos sobre los que el cliente puede pedir ordenamiento. Cualquier otro se ignora. */
    private static final Set<String> CAMPOS_ORDENABLES =
            Set.of("id", "serial", "nombre", "ubicacion", "clasificacionRiesgo", "estado",
                    "fechaAdquisicion", "creadoEn");

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @PostMapping
    @Operation(summary = "Crea un equipo (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public ResponseEntity<EquipoResponse> crear(@Valid @RequestBody EquipoRequest request) {
        EquipoResponse response = equipoService.crear(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "Lista equipos con paginación y filtros opcionales")
    public PaginaResponse<EquipoResponse> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @RequestParam(defaultValue = "id") String orden,
            @RequestParam(required = false) String ubicacion,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ClasificacionRiesgo riesgo,
            @RequestParam(required = false) EstadoEquipo estado) {

        Pageable pageable = PageableUtils.sanitizar(pagina, tamano, orden, CAMPOS_ORDENABLES, "id");
        // q es búsqueda genérica (serial/nombre/ubicacion/marca); ubicacion mantiene compat.
        String term = (q != null && !q.isBlank()) ? q : ubicacion;
        return equipoService.listar(pageable, term, q != null && !q.isBlank(), riesgo, estado);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene un equipo por id")
    public EquipoResponse obtenerPorId(@PathVariable Long id) {
        return equipoService.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualiza un equipo (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public EquipoResponse actualizar(@PathVariable Long id, @Valid @RequestBody EquipoRequest request) {
        return equipoService.actualizar(id, request);
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambia el estado de un equipo (ADMIN, INGENIERO o TECNICO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO','TECNICO')")
    public EquipoResponse cambiarEstado(@PathVariable Long id, @RequestBody EstadoEquipo estado) {
        return equipoService.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Da de baja un equipo (borrado lógico, ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public EquipoResponse darDeBaja(@PathVariable Long id) {
        return equipoService.darDeBaja(id);
    }
}
