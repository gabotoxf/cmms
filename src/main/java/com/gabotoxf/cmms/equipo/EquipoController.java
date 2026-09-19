package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import com.gabotoxf.cmms.equipo.dto.EquipoResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

@RestController
@RequestMapping("/api/equipos")
@PreAuthorize("isAuthenticated()")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @PostMapping
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
    public PaginaResponse<EquipoResponse> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @RequestParam(defaultValue = "id") String orden,
            @RequestParam(required = false) String ubicacion,
            @RequestParam(required = false) ClasificacionRiesgo riesgo,
            @RequestParam(required = false) EstadoEquipo estado) {

        Pageable pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.ASC, orden));
        return equipoService.listar(pageable, ubicacion, riesgo, estado);
    }

    @GetMapping("/{id}")
    public EquipoResponse obtenerPorId(@PathVariable Long id) {
        return equipoService.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public EquipoResponse actualizar(@PathVariable Long id, @Valid @RequestBody EquipoRequest request) {
        return equipoService.actualizar(id, request);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO','TECNICO')")
    public EquipoResponse cambiarEstado(@PathVariable Long id, @RequestBody EstadoEquipo estado) {
        return equipoService.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public EquipoResponse darDeBaja(@PathVariable Long id) {
        return equipoService.darDeBaja(id);
    }
}
