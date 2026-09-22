package com.gabotoxf.cmms.notificaciones;

import com.gabotoxf.cmms.common.Notificador;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.util.StringUtils;

/**
 * Elige la implementación del puerto Notificador:
 * - Con SMTP configurado (MAIL_HOST con valor): correo real.
 * - Sin SMTP: log (la app funciona completa en demo/CI sin correo).
 *
 * Se decide aquí en lugar de con @ConditionalOnBean porque Boot puede crear un
 * JavaMailSender aunque el host quede en blanco; lo que importa es que haya host.
 */
@Configuration
public class NotificacionesConfig {

    @Bean
    public Notificador notificador(ObjectProvider<JavaMailSender> mailSenderProvider,
                                   Environment environment,
                                   @Value("${app.alertas.remitente:cmms@localhost}") String remitente) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        String host = environment.getProperty("spring.mail.host");
        boolean haySmtp = mailSender != null && StringUtils.hasText(host);

        if (haySmtp) {
            return new CorreoNotificador(mailSender, remitente);
        }
        return new LogNotificador();
    }
}
