package com.gabotoxf.cmms.common;

import java.time.Instant;

/**
 * Publicado cuando se asigna un técnico a una orden de trabajo.
 * Lo escucha la Fase 5 para avisarle al técnico que tiene una orden pendiente.
 */
public final class EventoOrdenAsignada extends EventoDominio {

    private final Long ordenId;
    private final Long equipoId;
    private final String titulo;
    private final String tecnicoEmail;
    private final String tecnicoNombre;

    public EventoOrdenAsignada(Long ordenId, Long equipoId, String titulo,
                               String tecnicoEmail, String tecnicoNombre, Instant ocurridoEn) {
        super(ocurridoEn);
        this.ordenId = ordenId;
        this.equipoId = equipoId;
        this.titulo = titulo;
        this.tecnicoEmail = tecnicoEmail;
        this.tecnicoNombre = tecnicoNombre;
    }

    public Long getOrdenId() {
        return ordenId;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getTecnicoEmail() {
        return tecnicoEmail;
    }

    public String getTecnicoNombre() {
        return tecnicoNombre;
    }
}
