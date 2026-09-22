package com.gabotoxf.cmms.orden.dto;

import com.gabotoxf.cmms.orden.EstadoOrden;
import com.gabotoxf.cmms.orden.OrdenTrabajo;
import com.gabotoxf.cmms.orden.TipoOrden;

import java.time.Instant;
import java.time.LocalDate;

public record OrdenResponse(
        Long id,
        Long equipoId,
        String equipoSerial,
        String equipoNombre,
        TipoOrden tipo,
        EstadoOrden estado,
        String titulo,
        String descripcion,
        Long tecnicoId,
        String tecnicoNombre,
        String resultado,
        LocalDate fechaProgramada,
        Instant asignadaEn,
        Instant iniciadaEn,
        Instant completadaEn,
        Instant canceladaEn,
        Instant creadoEn,
        Instant actualizadoEn
) {
    public static OrdenResponse from(OrdenTrabajo o) {
        return new OrdenResponse(
                o.getId(),
                o.getEquipo().getId(),
                o.getEquipo().getSerial(),
                o.getEquipo().getNombre(),
                o.getTipo(),
                o.getEstado(),
                o.getTitulo(),
                o.getDescripcion(),
                o.getTecnico() != null ? o.getTecnico().getId() : null,
                o.getTecnico() != null ? o.getTecnico().getNombreCompleto() : null,
                o.getResultado(),
                o.getFechaProgramada(),
                o.getAsignadaEn(),
                o.getIniciadaEn(),
                o.getCompletadaEn(),
                o.getCanceladaEn(),
                o.getCreadoEn(),
                o.getActualizadoEn());
    }
}
