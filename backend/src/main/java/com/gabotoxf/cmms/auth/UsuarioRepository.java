package com.gabotoxf.cmms.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Usuarios activos de un rol (selector de técnicos del frontend). */
    List<Usuario> findByRolAndActivoTrue(Rol rol);

    /** Todos los usuarios activos. */
    List<Usuario> findByActivoTrue();
}
