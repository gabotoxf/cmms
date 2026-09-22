package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.EventoEquipoActualizado;
import com.gabotoxf.cmms.common.EventoEquipoCreado;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Traduce eventos de dominio del módulo equipo a operaciones de mantenimiento.
 * Así el módulo equipo no conoce a mantenimiento (inversión de dependencias vía eventos):
 * EquipoService publica y olvida; este listener reacciona en la misma transacción.
 *
 * BEFORE_COMMIT (y no AFTER_COMMIT) para que si la creación del plan falla,
 * se revierte también la creación del equipo: consistencia fuerte.
 */
@Component
public class PlanEquipoEventListener {

    private static final Logger log = LoggerFactory.getLogger(PlanEquipoEventListener.class);

    private final PlanMantenimientoService planService;

    public PlanEquipoEventListener(PlanMantenimientoService planService) {
        this.planService = planService;
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onEquipoCreado(EventoEquipoCreado evento) {
        planService.crearPlanSiFalta(evento.getEquipoId(), evento.getPeriodicidadMantenimientoDias());
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onEquipoActualizado(EventoEquipoActualizado evento) {
        planService.sincronizarFrecuencia(evento.getEquipoId(), evento.getPeriodicidadMantenimientoDias());
    }
}
