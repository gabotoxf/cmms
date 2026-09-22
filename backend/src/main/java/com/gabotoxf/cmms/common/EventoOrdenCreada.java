package com.gabotoxf.cmms.common;

import com.gabotoxf.cmms.orden.TipoOrden;

import java.time.Instant;

/**
 * Publicado al crear una orden de trabajo (manual o generada por el job).
 * Lo escucha la Fase 5 para notificar al técnico asignado.
 */
public final class EventoOrdenCreada extends EventoDominio {

    private final Long ordenId;
    private final Long equipoId;
    private final TipoOrden tipo;
    private final String titulo;
    private final String tecnicoEmail;

    public EventoOrdenCreada(Long ordenId, Long equipoId, TipoOrden tipo, String titulo,
                             String tecnicoEmail, Instant ocurridoEn) {
        super(ocurridoEn);
        this.ordenId = ordenId;
        this.equipoId = equipoId;
        this.tipo = tipo;
        this.titulo = titulo;
        this.tecnicoEmail = tecnicoEmail;
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

    public String getTitulo() {
        return titulo;
    }

    public String getTecnicoEmail() {
        return tecnicoEmail;
    }
}
