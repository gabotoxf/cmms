package com.gabotoxf.cmms.orden;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backfill al arrancar: genera preventivas para planes ya vencidos/próximos
 * (p. ej. si el servidor estuvo apagado varios días). Idempotente.
 */
@Component
@Order(3)
public class OrdenesBackfillSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(OrdenesBackfillSeeder.class);

    private final OrdenTrabajoService ordenService;

    public OrdenesBackfillSeeder(OrdenTrabajoService ordenService) {
        this.ordenService = ordenService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        int creadas = ordenService.generarPreventivasPendientes();
        if (creadas > 0) {
            log.info("Backfill de órdenes preventivas: {} creadas al arrancar", creadas);
        }
    }
}
