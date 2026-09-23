package com.gabotoxf.cmms.auth;

import com.gabotoxf.cmms.auth.dto.UsuarioAdminRequest;
import com.gabotoxf.cmms.auth.dto.UsuarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Consulta de usuarios para el frontend (selector de técnicos en las órdenes)
 * y administración total por el ADMIN: cualquier campo de cualquier perfil.
 */
@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Consulta y administración de usuarios del sistema")
@PreAuthorize("isAuthenticated()")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;

    public UsuarioController(UsuarioRepository usuarioRepository, AuthService authService) {
        this.usuarioRepository = usuarioRepository;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Lista usuarios, opcionalmente filtrados por rol y estado (ADMIN o INGENIERO)")
    @PreAuthorize("hasAnyRole('ADMIN','INGENIERO')")
    public List<UsuarioResponse> listar(@RequestParam(required = false) Rol rol,
                                        @RequestParam(required = false) Boolean activo) {
        List<Usuario> usuarios;
        if (rol != null && activo != null) usuarios = usuarioRepository.findByRolAndActivo(rol, activo);
        else if (rol != null) usuarios = usuarioRepository.findByRol(rol);
        else if (activo != null) usuarios = usuarioRepository.findByActivo(activo);
        else usuarios = usuarioRepository.findAll();
        return usuarios.stream().map(UsuarioResponse::from).toList();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Edición total de un usuario (solo ADMIN; el email no se toca)")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody UsuarioAdminRequest request) {
        return authService.actualizarUsuario(id, request);
    }

    @GetMapping("/{id}/avatar")
    @Operation(summary = "Avatar de un usuario (solo ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> avatar(@PathVariable Long id) {
        Usuario usuario = authService.buscarPorId(id);
        byte[] bytes = authService.cargarAvatarBytes(usuario);
        String tipoStr = authService.resolverAvatarTipo(usuario);
        if (bytes == null || bytes.length == 0) {
            return ResponseEntity.noContent().build();
        }
        MediaType tipo;
        try {
            tipo = MediaType.parseMediaType(tipoStr);
        } catch (Exception e) {
            tipo = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok().contentType(tipo).body(bytes);
    }

    @PutMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cambia el avatar de un usuario (solo ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> subirAvatar(@PathVariable Long id,
                                            @RequestParam("archivo") MultipartFile archivo) throws IOException {
        authService.guardarAvatar(authService.buscarPorId(id),
                archivo.getContentType(), archivo.getOriginalFilename(), archivo.getBytes());
        return ResponseEntity.noContent().build();
    }
}
