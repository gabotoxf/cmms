package com.gabotoxf.cmms.common;

import java.time.Instant;

/**
 * Publicado cuando se actualiza un equipo (incluido cambio de estado).
 * Lo escucha mantenimiento para sincronizar la frecuencia del plan y,
 * más adelante, notificaciones para avisar cambios relevantes.
 */
public final class EventoEquipoActualizado extends EventoDominio {

    private final Long equipoId;
    private final String serial;
    private final Integer periodicidadMantenimientoDias;
    private final String estado;

    public EventoEquipoActualizado(Long equipoId, String serial, Integer periodicidadMantenimientoDias,
                                   String estado, Instant ocurridoEn) {
        super(ocurridoEn);
        this.equipoId = equipoId;
        this.serial = serial;
        this.periodicidadMantenimientoDias = periodicidadMantenimientoDias;
        this.estado = estado;
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

    public String getEstado() {
        return estado;
    }
}
