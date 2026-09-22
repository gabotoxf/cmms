package com.gabotoxf.cmms.notificaciones;

import com.gabotoxf.cmms.common.EventoOrdenAsignada;
import com.gabotoxf.cmms.common.Notificador;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listener del evento OrdenAsignada (Fase 5): avisa al técnico asignado.
 * AFTER_COMMIT: el correo es efecto secundario, nunca revierte la asignación.
 */
@Component
public class NotificacionAsignacionListener {

    private static final Logger log = LoggerFactory.getLogger(NotificacionAsignacionListener.class);

    private final Notificador notificador;

    public NotificacionAsignacionListener(Notificador notificador) {
        this.notificador = notificador;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(EventoOrdenAsignada evento) {
        try {
            String asunto = "[CMMS] Orden #" + evento.getOrdenId() + " asignada a tu nombre";
            String cuerpo = """
                    Hola %s,

                    Se te asignó una orden de trabajo.

                    Orden:  #%d - %s

                    Recuerda gestionarla: iniciarla al llegar al equipo y completarla
                    registrando el resultado del trabajo.

                    -- Enviado automáticamente por el CMMS""".formatted(
                    evento.getTecnicoNombre(), evento.getOrdenId(), evento.getTitulo());

            notificador.enviar(evento.getTecnicoEmail(), asunto, cuerpo);
        } catch (Exception ex) {
            log.error("Error notificando la asignación de la orden {}: {}",
                    evento.getOrdenId(), ex.getMessage());
        }
    }
}
