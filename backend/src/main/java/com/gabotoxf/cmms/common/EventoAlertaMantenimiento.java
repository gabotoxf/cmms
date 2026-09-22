package com.gabotoxf.cmms.common;

import com.gabotoxf.cmms.mantenimiento.EstadoPlan;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Publicado por el módulo de mantenimiento cuando un plan pasa a estar
 * vencido o próximo a vencer. Lo escucha la Fase 5 para alertar por correo.
 */
public final class EventoAlertaMantenimiento extends EventoDominio {

    private final Long planId;
    private final Long equipoId;
    private final String equipoSerial;
    private final String equipoNombre;
    private final EstadoPlan estadoPlan;
    private final LocalDate proximaFecha;

    public EventoAlertaMantenimiento(Long planId, Long equipoId, String equipoSerial, String equipoNombre,
                                     EstadoPlan estadoPlan, LocalDate proximaFecha, Instant ocurridoEn) {
        super(ocurridoEn);
        this.planId = planId;
        this.equipoId = equipoId;
        this.equipoSerial = equipoSerial;
        this.equipoNombre = equipoNombre;
        this.estadoPlan = estadoPlan;
        this.proximaFecha = proximaFecha;
    }

    public Long getPlanId() {
        return planId;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getEquipoSerial() {
        return equipoSerial;
    }

    public String getEquipoNombre() {
        return equipoNombre;
    }

    public EstadoPlan getEstadoPlan() {
        return estadoPlan;
    }

    public LocalDate getProximaFecha() {
        return proximaFecha;
    }
}
