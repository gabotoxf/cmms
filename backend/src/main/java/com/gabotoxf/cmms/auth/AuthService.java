package com.gabotoxf.cmms.auth;

import com.gabotoxf.cmms.auth.dto.LoginRequest;
import com.gabotoxf.cmms.auth.dto.PerfilRequest;
import com.gabotoxf.cmms.auth.dto.RegistroRequest;
import com.gabotoxf.cmms.auth.dto.TokenResponse;
import com.gabotoxf.cmms.auth.dto.UsuarioAdminRequest;
import com.gabotoxf.cmms.auth.dto.UsuarioResponse;
import com.gabotoxf.cmms.common.Notificador;
import com.gabotoxf.cmms.common.RecursoNoEncontradoException;
import com.gabotoxf.cmms.common.ReglasNegocioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import java.io.IOException;
import java.nio.file.Files;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final AvatarStorage avatarStorage;
    private final Notificador notificador;
    private final String appUrl;
    private final Map<String, TokenInfo> resetTokens = new ConcurrentHashMap<>();

    private record TokenInfo(String email, Instant expira) {}

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UsuarioRepository usuarioRepository,
                       org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                       AvatarStorage avatarStorage,
                       Notificador notificador,
                       @Value("${app.frontend.url:http://127.0.0.1:4200}") String appUrl) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.avatarStorage = avatarStorage;
        this.notificador = notificador;
        this.appUrl = appUrl;
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
        try {
            notificador.enviar(email, "[CMMS] Bienvenido a BIOCMMS",
                    "Hola " + guardado.getNombre() + ",\n\nTu cuenta ha sido creada con rol " + guardado.getRol() + ". Ya puedes ingresar en " + appUrl + "/login con tu correo y contraseña.\n\n— Equipo BIOCMMS (Res. 3100 de 2019)");
        } catch (Exception ex) {
            log.warn("No se pudo enviar correo de bienvenida a {}: {}", email, ex.getMessage());
        }
        return construirRespuesta(guardado);
    }

    public void solicitarRecuperacion(String emailRaw) {
        String email = emailRaw.toLowerCase().trim();
        var opt = usuarioRepository.findByEmail(email);
        // No filtrar si existe o no — siempre responde 200 para no enumerar usuarios
        if (opt.isEmpty()) {
            log.info("Recuperación solicitada para email inexistente: {}", email);
            return;
        }
        String token = UUID.randomUUID().toString();
        resetTokens.put(token, new TokenInfo(email, Instant.now().plusSeconds(30 * 60)));
        String enlace = appUrl + "/restablecer?token=" + token;
        try {
            notificador.enviar(email, "[CMMS] Recupera tu contraseña",
                    "Hola,\n\nSolicitaste restablecer tu contraseña. Usa este enlace (válido 30 min):\n" + enlace + "\n\nSi no lo solicitaste, ignora este correo.\n\n— Equipo BIOCMMS");
            log.info("Token de recuperación generado para {}: {}", email, token);
        } catch (Exception ex) {
            log.warn("No se pudo enviar correo de recuperación a {}: {}", email, ex.getMessage());
        }
    }

    @Transactional
    public void restablecerPassword(String token, String nuevaPassword) {
        TokenInfo info = resetTokens.get(token);
        if (info == null || Instant.now().isAfter(info.expira())) {
            resetTokens.remove(token);
            throw new ReglasNegocioException("El enlace de recuperación es inválido o ha expirado");
        }
        if (nuevaPassword == null || nuevaPassword.length() < 8) {
            throw new ReglasNegocioException("La contraseña debe tener al menos 8 caracteres");
        }
        Usuario usuario = usuarioRepository.findByEmail(info.email())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
        resetTokens.remove(token);
        log.info("Contraseña restablecida para {}", info.email());
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

    /** Edición total por el ADMIN (incluye email). */
    @Transactional
    public UsuarioResponse actualizarUsuario(Long id, UsuarioAdminRequest request) {
        Usuario usuario = buscarPorId(id);
        String nuevoEmail = request.email().toLowerCase().trim();
        if (!nuevoEmail.equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(nuevoEmail)) {
                throw new EmailDuplicadoException(nuevoEmail);
            }
            usuario.setEmail(nuevoEmail);
        }
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

    /** Avatar en filesystem: solo imágenes de hasta 2 MB. El tipo se infiere de la extensión si el cliente no lo manda. */
    @Transactional
    public void guardarAvatar(Usuario usuario, String contentType, String nombreArchivo, byte[] bytes) {
        String tipo = (contentType != null && contentType.startsWith("image/")) ? contentType : tipoPorExtension(nombreArchivo);
        if (tipo == null) {
            throw new ReglasNegocioException("El avatar debe ser una imagen");
        }
        if (bytes == null || bytes.length == 0 || bytes.length > 2L * 1024 * 1024) {
            throw new ReglasNegocioException("El avatar debe pesar entre 1 byte y 2 MB");
        }
        try {
            avatarStorage.guardar(usuario.getId(), tipo, bytes);
        } catch (IOException e) {
            throw new ReglasNegocioException("No se pudo guardar el avatar: " + e.getMessage());
        }
        usuario.setAvatar(null); // ya no se guarda en BYTEA
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
            case "heic", "heif" -> "image/heic";
            case "avif" -> "image/avif";
            case "bmp" -> "image/bmp";
            case "tiff", "tif" -> "image/tiff";
            case "svg" -> "image/svg+xml";
            default -> null;
        };
    }

    @Transactional
    public void eliminarAvatar(Usuario usuario) {
        try { avatarStorage.borrar(usuario.getId()); } catch (IOException ignored) {}
        usuario.setAvatar(null);
        usuario.setAvatarTipo(null);
        usuarioRepository.save(usuario);
    }

    /** Lee avatar: primero filesystem, fallback a BYTEA legacy. */
    public byte[] cargarAvatarBytes(Usuario usuario) {
        try {
            byte[] fs = avatarStorage.cargar(usuario.getId());
            if (fs != null) return fs;
        } catch (IOException ignored) {}
        return usuario.getAvatar();
    }

    public String resolverAvatarTipo(Usuario usuario) {
        try {
            String fsTipo = avatarStorage.tipoDe(usuario.getId());
            if (fsTipo != null) return fsTipo;
        } catch (IOException ignored) {}
        return usuario.getAvatarTipo();
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
