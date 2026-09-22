package com.gabotoxf.cmms.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea usuarios de demo la primera vez que arranca la app (tabla vacía),
 * para poder probar la API sin registrar nada a mano.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(new Usuario("admin@cmms.local", passwordEncoder.encode("admin123"), Rol.ADMIN, "Admin", "Sistema", "3000000001"));
            usuarioRepository.save(new Usuario("ingeniero@cmms.local", passwordEncoder.encode("ingeniero123"), Rol.INGENIERO, "Ingeniero", "Demo", "3000000002"));
            usuarioRepository.save(new Usuario("tecnico@cmms.local", passwordEncoder.encode("tecnico123"), Rol.TECNICO, "Técnico", "Demo", "3000000003"));
            usuarioRepository.save(new Usuario("auditor@cmms.local", passwordEncoder.encode("auditor123"), Rol.AUDITOR, "Auditor", "Demo", "3000000004"));
            log.info("Usuarios de demo creados: admin@cmms.local / admin123 (y ingeniero, tecnico, auditor @cmms.local)");
        }
        // Demo para presentaciones — siempre asegurado, da muy buena impresión
        if (usuarioRepository.findByEmail("demo@cmms.com").isEmpty()) {
            Usuario demo = new Usuario("demo@cmms.com", passwordEncoder.encode("demo123"), Rol.ADMIN, "Demo", "CMMS", "3000000010");
            usuarioRepository.save(demo);
            log.info("Usuario DEMO creado: demo@cmms.com / demo123 (ADMIN · Demo CMMS) — listo para presentaciones");
        }
    }
}
