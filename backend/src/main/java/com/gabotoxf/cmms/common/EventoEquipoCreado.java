package com.gabotoxf.cmms.common;

import java.time.Instant;

/**
 * Publicado cuando se crea un equipo nuevo.
 * Lo escucha el módulo de mantenimiento para crear su plan de mantenimiento.
 */
public final class EventoEquipoCreado extends EventoDominio {

    private final Long equipoId;
    private final String serial;
    private final Integer periodicidadMantenimientoDias;

    public EventoEquipoCreado(Long equipoId, String serial, Integer periodicidadMantenimientoDias, Instant ocurridoEn) {
        super(ocurridoEn);
        this.equipoId = equipoId;
        this.serial = serial;
        this.periodicidadMantenimientoDias = periodicidadMantenimientoDias;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getSerial() {
        return serial;
    }

    public Integer getPeriodicidadMantenimientoDias() {
        return periodicidadMantenimientoDias;
    }
}
