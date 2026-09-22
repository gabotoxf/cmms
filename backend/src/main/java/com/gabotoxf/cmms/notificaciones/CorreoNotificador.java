package com.gabotoxf.cmms.notificaciones;

import com.gabotoxf.cmms.common.Notificador;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * Implementación por correo del puerto Notificador (Fase 5).
 *
 * La API no debe caerse porque el SMTP no respondió: una notificación es
 * un efecto secundario, no parte de la transacción de negocio. Por eso
 * cualquier error se registra y se degrada a log, sin propagar la excepción.
 *
 * Se registra en NotificacionesConfig solo si hay JavaMailSender en el contexto
 * (es decir, si MAIL_HOST está configurado); si no, el fallback a log toma su lugar.
 */
public class CorreoNotificador implements Notificador {

    private static final Logger log = LoggerFactory.getLogger(CorreoNotificador.class);

    private final JavaMailSender mailSender;
    private final String remitente;

    public CorreoNotificador(JavaMailSender mailSender, String remitente) {
        this.mailSender = mailSender;
        this.remitente = remitente;
    }

    @Override
    public void enviar(String destinatario, String asunto, String cuerpo) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(remitente);
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            log.info("Correo enviado a {}: {}", destinatario, asunto);
        } catch (Exception ex) {
            log.error("No se pudo enviar el correo a {} (asunto: {}): {}",
                    destinatario, asunto, ex.getMessage());
        }
    }
}
