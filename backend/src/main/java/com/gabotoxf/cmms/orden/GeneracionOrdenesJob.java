package com.gabotoxf.cmms.orden;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job diario (2:30 a.m., después de la revisión de planes) que genera
 * órdenes de trabajo preventivas para los planes vencidos o próximos a vencer.
 * Idempotente: si ya existe una preventiva abierta para el equipo, no duplica.
 */
@Component
public class GeneracionOrdenesJob {

    private static final Logger log = LoggerFactory.getLogger(GeneracionOrdenesJob.class);

    private final OrdenTrabajoService ordenService;

    public GeneracionOrdenesJob(OrdenTrabajoService ordenService) {
        this.ordenService = ordenService;
    }

    @Scheduled(cron = "${app.ordenes.job-cron:0 30 2 * * *}", zone = "America/Bogota")
    public void generar() {
        log.info("=== Job diario de generación de órdenes preventivas iniciado ===");
        int creadas = ordenService.generarPreventivasPendientes();
        log.info("=== Job finalizado: {} órdenes preventivas creadas ===", creadas);
    }
}
