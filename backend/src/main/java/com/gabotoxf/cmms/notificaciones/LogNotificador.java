package com.gabotoxf.cmms.notificaciones;

import com.gabotoxf.cmms.common.Notificador;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Fallback cuando no hay canal de correo configurado (sin MAIL_HOST, demo, CI):
 * registra la notificación en el log para que la funcionalidad nunca falle por
 * falta de SMTP. Se registra en NotificacionesConfig solo si no existe un
 * CorreoNotificador.
 */
public class LogNotificador implements Notificador {

    private static final Logger log = LoggerFactory.getLogger(LogNotificador.class);

    @Override
    public void enviar(String destinatario, String asunto, String cuerpo) {
        log.info("[NOTIFICACION - sin SMTP configurado] Para: {} | Asunto: {} | Cuerpo: {}",
                destinatario, asunto, cuerpo.replace('\n', ' '));
    }
}
