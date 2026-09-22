package com.gabotoxf.cmms.notificaciones;

import com.gabotoxf.cmms.common.EventoAlertaMantenimiento;
import com.gabotoxf.cmms.common.Notificador;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.format.DateTimeFormatter;

/**
 * Listener del evento AlertaMantenimiento (Fase 5): alerta por correo
 * cuando un plan está vencido o próximo a vencer.
 *
 * AFTER_COMMIT: la alerta no es parte de la transacción de negocio.
 * (Hoy los detectores de alertas son jobs/seeders, pero el patrón queda
 * listo para emitirse desde cualquier transacción.)
 */
@Component
public class NotificacionAlertaListener {

    private static final Logger log = LoggerFactory.getLogger(NotificacionAlertaListener.class);
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final Notificador notificador;
    private final String destinatarioAlertas;

    public NotificacionAlertaListener(Notificador notificador,
                                      @Value("${app.alertas.destinatario:}") String destinatarioAlertas) {
        this.notificador = notificador;
        this.destinatarioAlertas = destinatarioAlertas;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(EventoAlertaMantenimiento evento) {
        if (destinatarioAlertas == null || destinatarioAlertas.isBlank()) {
            log.debug("Alerta del plan {} sin destinatario configurado (app.alertas.destinatario)", evento.getPlanId());
            return;
        }
        try {
            String estado = evento.getEstadoPlan() == com.gabotoxf.cmms.mantenimiento.EstadoPlan.VENCIDO
                    ? "VENCIDO"
                    : "PRÓXIMO A VENCER";
            String asunto = "[CMMS] Mantenimiento " + estado + " - equipo " + evento.getEquipoSerial();

            String cuerpo = """
                    Alerta de mantenimiento preventivo

                    Estado:         %s
                    Equipo:         %s - %s
                    Próxima fecha:  %s

                    Revisa el plan de mantenimiento en el sistema CMMS.

                    -- Enviado automáticamente por el CMMS""".formatted(
                    estado,
                    evento.getEquipoSerial(),
                    evento.getEquipoNombre(),
                    evento.getProximaFecha().format(FORMATO_FECHA));

            notificador.enviar(destinatarioAlertas, asunto, cuerpo);
        } catch (Exception ex) {
            log.error("Error notificando la alerta del plan {}: {}", evento.getPlanId(), ex.getMessage());
        }
    }
}
