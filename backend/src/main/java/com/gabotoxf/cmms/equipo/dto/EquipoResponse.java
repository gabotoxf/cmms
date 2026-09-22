package com.gabotoxf.cmms.equipo.dto;

import com.gabotoxf.cmms.equipo.ClasificacionRiesgo;
import com.gabotoxf.cmms.equipo.EstadoEquipo;

import java.time.Instant;
import java.time.LocalDate;

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
        Instant creadoEn,
        Instant actualizadoEn
) {
    public static EquipoResponse from(com.gabotoxf.cmms.equipo.Equipo e) {
        return new EquipoResponse(
                e.getId(),
                e.getSerial(),
                e.getNombre(),
                e.getMarca(),
                e.getModelo(),
                e.getUbicacion(),
                e.getClasificacionRiesgo(),
                e.getFechaAdquisicion(),
                e.getPeriodicidadMantenimientoDias(),
                e.getEstado(),
                e.getCreadoEn(),
                e.getActualizadoEn());
    }
}
