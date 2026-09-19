package com.gabotoxf.cmms.equipo.dto;

import com.gabotoxf.cmms.equipo.ClasificacionRiesgo;
import com.gabotoxf.cmms.equipo.EstadoEquipo;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EquipoResponse(
        Long id,
        String serial,
        String nombre,
        String marca,
        String modelo,
        String ubicacion,
        ClasificacionRiesgo clasificacionRiesgo,
        LocalDate fechaAdquisicion,
        Integer periodicidadMantenimientoDias,
        EstadoEquipo estado,
        LocalDateTime creadoEn
) {
}
