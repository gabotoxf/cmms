package com.gabotoxf.cmms.mantenimiento;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job diario (2:00 a.m.) que revisa los planes de mantenimiento:
 * identifica vencidos y próximos a vencer. Más adelante (Fase 5)
 * desde aquí se dispararán las notificaciones por correo.
 */
@Component
public class RevisionMantenimientoJob {

    private static final Logger log = LoggerFactory.getLogger(RevisionMantenimientoJob.class);

    private final PlanMantenimientoService planService;

    public RevisionMantenimientoJob(PlanMantenimientoService planService) {
        this.planService = planService;
    }

    @Scheduled(cron = "${app.mantenimiento.job-cron:0 0 2 * * *}", zone = "America/Bogota")
    public void revisarDiariamente() {
        log.info("=== Job diario de revisión de mantenimientos iniciado ===");
        PlanMantenimientoService.ResumenRevision resumen = planService.revisar();
        log.info("Resultado: {} vencidos, {} próximos a vencer (umbral {} días)",
                resumen.vencidos(), resumen.proximos(), resumen.diasAlerta());
        log.info("=== Job diario de revisión de mantenimientos finalizado ===");
    }
}
