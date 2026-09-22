package com.gabotoxf.cmms.auth.dto;

import com.gabotoxf.cmms.auth.Usuario;

/**
 * Datos públicos de un usuario. Nunca expone passwordHash.
 * La consume el frontend para asignar técnicos a las órdenes.
 */
public record UsuarioResponse(
        Long id,
        String email,
        String nombre,
        String apellido,
        String celular,
        String rol,
        boolean activo
) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getEmail(), u.getNombre(), u.getApellido(),
                u.getCelular(), u.getRol().name(), u.isActivo());
    }
}
