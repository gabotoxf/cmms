package com.gabotoxf.cmms.notificaciones;

import com.gabotoxf.cmms.common.EventoOrdenCreada;
import com.gabotoxf.cmms.common.Notificador;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.orden.TipoOrden;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listener del evento OrdenCreada (Fase 5): notifica al técnico asignado
 * que tiene una nueva orden de trabajo.
 *
 * AFTER_COMMIT y no BEFORE_COMMIT: el correo es un efecto secundario; si el SMTP
 * falla no debe revertir la creación de la orden (a diferencia del plan, que sí
 * es parte de la transacción de negocio).
 *
 * Nota: el evento no carga el equipo (para mantenerlo liviano), así que el serial
 * se consulta aquí, ya fuera de la transacción del emisor.
 */
@Component
public class NotificacionOrdenListener {

    private static final Logger log = LoggerFactory.getLogger(NotificacionOrdenListener.class);

    private final Notificador notificador;
    private final EquipoRepository equipoRepository;
    private final String buzonOperaciones;

    public NotificacionOrdenListener(Notificador notificador,
                                     EquipoRepository equipoRepository,
                                     @Value("${app.alertas.destinatario:operaciones@cmms.local}") String buzonOperaciones) {
        this.notificador = notificador;
        this.equipoRepository = equipoRepository;
        this.buzonOperaciones = buzonOperaciones;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(EventoOrdenCreada evento) {
        try {
            String serial = equipoRepository.findById(evento.getEquipoId())
                    .map(e -> e.getSerial())
                    .orElse("N/A");

            String tipo = (evento.getTipo() == TipoOrden.PREVENTIVO)
                    ? "Mantenimiento preventivo"
                    : "Mantenimiento correctivo";
            String asunto = "[CMMS] " + tipo + " - orden #" + evento.getOrdenId();

            String cuerpo = """
                    Hola,

                    Se ha creado una nueva orden de trabajo.

                    Orden:      #%d - %s
                    Tipo:       %s
                    Equipo:     %s

                    Ingresa al sistema CMMS para revisarla y gestionarla.

                    -- Enviado automáticamente por el CMMS""".formatted(
                    evento.getOrdenId(), evento.getTitulo(), tipo, serial);

            notificador.enviar(destinatario(evento), asunto, cuerpo);
        } catch (Exception ex) {
            // La notificación nunca debe romper el flujo de negocio
            log.error("Error notificando la creación de la orden {}: {}", evento.getOrdenId(), ex.getMessage());
        }
    }

    /** Destinatario: el email del técnico si el evento lo trae; fallback al buzón configurado. */
    private String destinatario(EventoOrdenCreada evento) {
        if (evento.getTecnicoEmail() != null && !evento.getTecnicoEmail().isBlank()) {
            return evento.getTecnicoEmail();
        }
        return (buzonOperaciones != null && !buzonOperaciones.isBlank())
                ? buzonOperaciones
                : "operaciones@cmms.local";
    }
}
