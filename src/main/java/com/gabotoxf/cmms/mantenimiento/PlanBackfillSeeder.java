package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.mantenimiento.PlanMantenimientoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backfill al arrancar: sincroniza los planes de todos los equipos
 * (crea los que falten). Idempotente: no duplica planes existentes.
 */
@Component
@Order(2)
public class PlanBackfillSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PlanBackfillSeeder.class);

    private final PlanMantenimientoService planService;
    private final PlanMantenimientoRepository planRepository;

    public PlanBackfillSeeder(PlanMantenimientoService planService, PlanMantenimientoRepository planRepository) {
        this.planService = planService;
        this.planRepository = planRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (planRepository.count() == 0) {
            int creados = planService.sincronizarTodos();
            log.info("Backfill de planes completado: {} planes creados", creados);
        }
    }
}
