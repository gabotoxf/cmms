package com.gabotoxf.cmms.auth;

import com.gabotoxf.cmms.auth.dto.LoginRequest;
import com.gabotoxf.cmms.auth.dto.RegistroRequest;
import com.gabotoxf.cmms.auth.dto.TokenResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final long VIDA_TOKEN_SEGUNDOS = 8 * 60 * 60;

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
                request.nombre().trim());
        Usuario guardado = usuarioRepository.save(usuario);
        return construirRespuesta(guardado);
    }

    private TokenResponse construirRespuesta(Usuario usuario) {
        return new TokenResponse(
                jwtService.generarToken(usuario),
                "Bearer",
                VIDA_TOKEN_SEGUNDOS,
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getRol().name());
    }
}
