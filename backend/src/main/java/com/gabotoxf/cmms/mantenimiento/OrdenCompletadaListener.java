package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.EventoOrdenCompletada;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Cierra el círculo preventivo: cuando se completa una orden PREVENTIVO,
 * registra la ejecución en el plan del equipo (recalcula próxima fecha)
 * dentro de la misma transacción. Si la orden es CORRECTIVO, no toca el plan.
 */
@Component
public class OrdenCompletadaListener {

    private static final Logger log = LoggerFactory.getLogger(OrdenCompletadaListener.class);

    private final PlanMantenimientoService planService;

    public OrdenCompletadaListener(PlanMantenimientoService planService) {
        this.planService = planService;
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void on(EventoOrdenCompletada evento) {
        if (evento.getTipo() != com.gabotoxf.cmms.orden.TipoOrden.PREVENTIVO) {
            return;
        }
        planService.registrarEjecucionDesdeOrden(
                evento.getEquipoId(),
                evento.getFechaEjecucion(),
                evento.getResultado(),
                evento.getTecnicoNombre() != null ? evento.getTecnicoNombre() : "sistema");
        log.info("Ejecución de plan registrada desde orden {} del equipo {}",
                evento.getOrdenId(), evento.getEquipoId());
    }
}
