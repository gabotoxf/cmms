package com.gabotoxf.cmms.orden.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompletarRequest(
        @NotBlank(message = "El resultado del trabajo es obligatorio")
        @Size(max = 2000, message = "El resultado no puede superar 2000 caracteres")
        String resultado
) {
}
