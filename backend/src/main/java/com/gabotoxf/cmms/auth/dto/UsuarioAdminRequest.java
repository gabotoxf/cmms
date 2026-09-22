package com.gabotoxf.cmms.auth.dto;

import com.gabotoxf.cmms.auth.Rol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Edición total de un usuario por el ADMIN (el email no se toca nunca). */
public record UsuarioAdminRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        String apellido,

        @Size(max = 20, message = "El celular no puede superar 20 caracteres")
        String celular,

        @NotNull(message = "El rol es obligatorio")
        Rol rol,

        @NotNull(message = "El estado es obligatorio")
        Boolean activo,

        @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
        String passwordNueva
) {
}
