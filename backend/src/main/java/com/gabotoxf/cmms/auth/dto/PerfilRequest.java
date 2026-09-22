package com.gabotoxf.cmms.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PerfilRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        String apellido,

        @Size(max = 20, message = "El celular no puede superar 20 caracteres")
        String celular,

        @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
        String passwordActual,

        @Size(min = 8, message = "La nueva contraseña debe tener al menos 8 caracteres")
        String passwordNueva
) {
}
