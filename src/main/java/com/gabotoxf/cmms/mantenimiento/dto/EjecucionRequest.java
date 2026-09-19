package com.gabotoxf.cmms.mantenimiento.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EjecucionRequest(
        @NotNull(message = "La fecha de ejecución es obligatoria")
        LocalDate fechaEjecucion,

        @Size(max = 1000, message = "La descripción no puede superar 1000 caracteres")
        String descripcion,

        @NotBlank(message = "El técnico es obligatorio")
        @Size(max = 120, message = "El nombre del técnico no puede superar 120 caracteres")
        String tecnico
) {
}
