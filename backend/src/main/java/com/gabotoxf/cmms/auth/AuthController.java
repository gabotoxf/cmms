package com.gabotoxf.cmms.auth;

import com.gabotoxf.cmms.auth.dto.LoginRequest;
import com.gabotoxf.cmms.auth.dto.PerfilRequest;
import com.gabotoxf.cmms.auth.dto.RegistroRequest;
import com.gabotoxf.cmms.auth.dto.TokenResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/registro")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TokenResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        TokenResponse response = authService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/perfil")
    @PreAuthorize("isAuthenticated()")
    public TokenResponse actualizarPerfil(@Valid @RequestBody PerfilRequest request,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        return authService.actualizarPerfil(userDetails.getUsername(), request);
    }

    @GetMapping("/perfil/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> miAvatar(@AuthenticationPrincipal UserDetails userDetails) {
        return avatarDe(authService.buscarPorEmail(userDetails.getUsername()));
    }

    @PutMapping("/perfil/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> subirMiAvatar(@RequestParam("archivo") MultipartFile archivo,
                                              @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        authService.guardarAvatar(authService.buscarPorEmail(userDetails.getUsername()),
                archivo.getContentType(), archivo.getOriginalFilename(), archivo.getBytes());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/perfil/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> quitarMiAvatar(@AuthenticationPrincipal UserDetails userDetails) {
        authService.eliminarAvatar(authService.buscarPorEmail(userDetails.getUsername()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/recuperar")
    public ResponseEntity<Void> recuperar(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email != null && !email.isBlank()) authService.solicitarRecuperacion(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/restablecer")
    public ResponseEntity<Void> restablecer(@RequestBody java.util.Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");
        authService.restablecerPassword(token, password);
        return ResponseEntity.ok().build();
    }

    private ResponseEntity<byte[]> avatarDe(Usuario usuario) {
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
}
