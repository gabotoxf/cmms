package com.gabotoxf.cmms.orden.dto;

import com.gabotoxf.cmms.orden.TipoOrden;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CrearOrdenRequest(

        @NotNull(message = "El equipo es obligatorio")
        Long equipoId,

        @NotNull(message = "El tipo de orden es obligatorio")
        TipoOrden tipo,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título no puede superar 150 caracteres")
        String titulo,

        @Size(max = 2000, message = "La descripción no puede superar 2000 caracteres")
        String descripcion,

        LocalDate fechaProgramada
) {
}
