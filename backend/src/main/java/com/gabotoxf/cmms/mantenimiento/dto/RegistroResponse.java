package com.gabotoxf.cmms.mantenimiento.dto;

import com.gabotoxf.cmms.mantenimiento.RegistroMantenimiento;

import java.time.Instant;
import java.time.LocalDate;

public record RegistroResponse(
        Long id,
        Long planId,
        LocalDate fechaEjecucion,
        String descripcion,
        String tecnico,
        Instant creadoEn
) {
    public static RegistroResponse from(RegistroMantenimiento registro) {
        return new RegistroResponse(
                registro.getId(),
                registro.getPlan().getId(),
                registro.getFechaEjecucion(),
                registro.getDescripcion(),
                registro.getTecnico(),
                registro.getCreadoEn());
    }
}
