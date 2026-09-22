package com.gabotoxf.cmms.equipo.dto;

import com.gabotoxf.cmms.equipo.ClasificacionRiesgo;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EquipoRequest(

        @NotBlank(message = "El serial es obligatorio")
        @Size(max = 60, message = "El serial no puede superar 60 caracteres")
        String serial,

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        String marca,

        String modelo,

        @NotBlank(message = "La ubicación es obligatoria")
        String ubicacion,

        @NotNull(message = "La clasificación de riesgo es obligatoria")
        ClasificacionRiesgo clasificacionRiesgo,

        LocalDate fechaAdquisicion,

        @NotNull(message = "La periodicidad de mantenimiento es obligatoria")
        @Min(value = 1, message = "La periodicidad debe ser de al menos 1 día")
        Integer periodicidadMantenimientoDias
) {
}
