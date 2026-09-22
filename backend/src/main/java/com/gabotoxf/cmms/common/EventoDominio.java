package com.gabotoxf.cmms.common;

import java.time.Instant;

/**
 * Evento de dominio base: comunica que algo relevante ocurrió en un módulo,
 * sin acoplar al emisor con los módulos que reaccionan.
 * Los listeners deben usar @TransactionalEventListener para ejecutarse
 * dentro de la misma transacción (o AFTER_COMMIT si no tocan la BD).
 */
public abstract class EventoDominio {
    private final Instant ocurridoEn;

    protected EventoDominio(Instant ocurridoEn) {
        this.ocurridoEn = ocurridoEn;
    }

    public Instant getOcurridoEn() {
        return ocurridoEn;
    }
}
