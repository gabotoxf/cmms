package com.gabotoxf.cmms.common;

import com.gabotoxf.cmms.orden.TipoOrden;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Publicado al completar una orden de trabajo.
 * El módulo de mantenimiento lo escucha: si la orden era PREVENTIVO,
 * registra la ejecución en el plan y recalcula la próxima fecha.
 */
public final class EventoOrdenCompletada extends EventoDominio {

    private final Long ordenId;
    private final Long equipoId;
    private final TipoOrden tipo;
    private final String resultado;
    private final String tecnicoNombre;
    private final LocalDate fechaEjecucion;

    public EventoOrdenCompletada(Long ordenId, Long equipoId, TipoOrden tipo, String resultado,
                                 String tecnicoNombre, Instant ocurridoEn) {
        super(ocurridoEn);
        this.ordenId = ordenId;
        this.equipoId = equipoId;
        this.tipo = tipo;
        this.resultado = resultado;
        this.tecnicoNombre = tecnicoNombre;
        this.fechaEjecucion = ocurridoEn.atZone(ClockConfig.ZONA).toLocalDate();
    }

    public Long getOrdenId() {
        return ordenId;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public TipoOrden getTipo() {
        return tipo;
    }

    public String getResultado() {
        return resultado;
    }

    public String getTecnicoNombre() {
        return tecnicoNombre;
    }

    public LocalDate getFechaEjecucion() {
        return fechaEjecucion;
    }
}
