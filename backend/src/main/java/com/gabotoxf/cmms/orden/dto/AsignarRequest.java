package com.gabotoxf.cmms.orden.dto;

import jakarta.validation.constraints.NotNull;

public record AsignarRequest(
        @NotNull(message = "El id del técnico es obligatorio")
        Long tecnicoId
) {
}
