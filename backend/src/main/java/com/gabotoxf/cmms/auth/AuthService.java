package com.gabotoxf.cmms.auth;

import com.gabotoxf.cmms.auth.dto.LoginRequest;
import com.gabotoxf.cmms.auth.dto.PerfilRequest;
import com.gabotoxf.cmms.auth.dto.RegistroRequest;
import com.gabotoxf.cmms.auth.dto.TokenResponse;
import com.gabotoxf.cmms.auth.dto.UsuarioAdminRequest;
import com.gabotoxf.cmms.auth.dto.UsuarioResponse;
import com.gabotoxf.cmms.common.RecursoNoEncontradoException;
import com.gabotoxf.cmms.common.ReglasNegocioException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UsuarioRepository usuarioRepository,
                       org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public TokenResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        Usuario usuario = usuarioRepository.findByEmail(request.email()).orElseThrow();
        return construirRespuesta(usuario);
    }

    @Transactional
    public TokenResponse registrar(RegistroRequest request) {
        String email = request.email().toLowerCase().trim();

        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailDuplicadoException(email);
        }

        Usuario usuario = new Usuario(
                email,
                passwordEncoder.encode(request.password()),
                request.rol(),
                request.nombre().trim(),
                request.apellido().trim(),
                request.celular());
        Usuario guardado = usuarioRepository.save(usuario);
        return construirRespuesta(guardado);
    }

    @Transactional
    public TokenResponse actualizarPerfil(String email, PerfilRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        usuario.setNombre(request.nombre().trim());
        usuario.setApellido(request.apellido().trim());
        usuario.setCelular(request.celular());

        if (request.passwordNueva() != null && !request.passwordNueva().isBlank()) {
            if (request.passwordActual() == null
                    || !passwordEncoder.matches(request.passwordActual(), usuario.getPasswordHash())) {
                throw new ReglasNegocioException("La contraseña actual no es correcta");
            }
            usuario.setPasswordHash(passwordEncoder.encode(request.passwordNueva()));
        }
        // Se emite un token fresco porque el JWT incluye el nombre del usuario.
        return construirRespuesta(usuarioRepository.save(usuario));
    }

    /** Edición total por el ADMIN. El email no se modifica nunca. */
    @Transactional
    public UsuarioResponse actualizarUsuario(Long id, UsuarioAdminRequest request) {
        Usuario usuario = buscarPorId(id);
        usuario.setNombre(request.nombre().trim());
        usuario.setApellido(request.apellido().trim());
        usuario.setCelular(request.celular());
        usuario.setRol(request.rol());
        usuario.setActivo(request.activo());
        if (request.passwordNueva() != null && !request.passwordNueva().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(request.passwordNueva()));
        }
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }

    /** Avatar: solo imágenes de hasta 2 MB. El tipo se infiere de la extensión si el cliente no lo manda. */
    @Transactional
    public void guardarAvatar(Usuario usuario, String contentType, String nombreArchivo, byte[] bytes) {
        String tipo = (contentType != null && contentType.startsWith("image/")) ? contentType : tipoPorExtension(nombreArchivo);
        if (tipo == null) {
            throw new ReglasNegocioException("El avatar debe ser una imagen");
        }
        if (bytes == null || bytes.length == 0 || bytes.length > 2L * 1024 * 1024) {
            throw new ReglasNegocioException("El avatar debe pesar entre 1 byte y 2 MB");
        }
        usuario.setAvatar(bytes);
        usuario.setAvatarTipo(tipo);
        usuarioRepository.save(usuario);
    }

    private String tipoPorExtension(String nombreArchivo) {
        if (nombreArchivo == null) return null;
        String ext = nombreArchivo.contains(".")
                ? nombreArchivo.substring(nombreArchivo.lastIndexOf('.') + 1).toLowerCase()
                : "";
        return switch (ext) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "gif" -> "image/gif";
            default -> null;
        };
    }

    @Transactional
    public void eliminarAvatar(Usuario usuario) {
        usuario.setAvatar(null);
        usuario.setAvatarTipo(null);
        usuarioRepository.save(usuario);
    }

    private TokenResponse construirRespuesta(Usuario usuario) {        return new TokenResponse(
                jwtService.generarToken(usuario),
                "Bearer",
                jwtService.getVidaTokenSegundos(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCelular(),
                usuario.getRol().name());
    }
}
