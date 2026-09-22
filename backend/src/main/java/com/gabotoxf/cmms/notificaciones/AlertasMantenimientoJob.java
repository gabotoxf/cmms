package com.gabotoxf.cmms.notificaciones;

import com.gabotoxf.cmms.common.EventoAlertaMantenimiento;
import com.gabotoxf.cmms.common.Notificador;
import com.gabotoxf.cmms.common.PublicadorEventos;
import com.gabotoxf.cmms.mantenimiento.EstadoPlan;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimientoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Fase 5: job diario (2:15 a.m., entre la revisión de planes y la generación
 * de órdenes) que consolida las alertas de mantenimiento en un solo correo
 * para el buzón de operaciones (app.alertas.destinatario).
 *
 * Además publica EventoAlertaMantenimiento por cada plan vencido, para que
 * otros listeners reaccionen si hace falta (patrón ya usado por los demás módulos).
 */
@Component
public class AlertasMantenimientoJob {

    private static final Logger log = LoggerFactory.getLogger(AlertasMantenimientoJob.class);
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final PlanMantenimientoService planService;
    private final Notificador notificador;
    private final PublicadorEventos publicadorEventos;
    private final Clock clock;
    private final String destinatarioAlertas;

    public AlertasMantenimientoJob(PlanMantenimientoService planService,
                                   Notificador notificador,
                                   PublicadorEventos publicadorEventos,
                                   Clock clock,
                                   @Value("${app.alertas.destinatario:}") String destinatarioAlertas) {
        this.planService = planService;
        this.notificador = notificador;
        this.publicadorEventos = publicadorEventos;
        this.clock = clock;
        this.destinatarioAlertas = destinatarioAlertas;
    }

    @Scheduled(cron = "${app.alertas.job-cron:0 15 2 * * *}", zone = "America/Bogota")
    public void enviarAlertasDiarias() {
        if (destinatarioAlertas == null || destinatarioAlertas.isBlank()) {
            log.debug("Job de alertas omitido: no hay destinatario configurado (app.alertas.destinatario)");
            return;
        }

        log.info("=== Job diario de alertas de mantenimiento iniciado ===");
        List<PlanMantenimientoService.PlanResumen> pendientes = planService.pendientesResumen();

        if (pendientes.isEmpty()) {
            log.info("Sin alertas: ningún plan vencido o próximo a vencer");
            return;
        }

        long vencidos = pendientes.stream().filter(p -> p.estadoPlan() == EstadoPlan.VENCIDO).count();
        long proximos = pendientes.size() - vencidos;

        StringBuilder cuerpo = new StringBuilder("""
                Resumen diario de alertas de mantenimiento preventivo

                """);

        cuerpo.append("VENCIDOS (").append(vencidos).append("):\n");
        pendientes.stream()
                .filter(p -> p.estadoPlan() == EstadoPlan.VENCIDO)
                .forEach(p -> cuerpo.append(String.format("  - %s - %s | próxima fecha: %s%n",
                        p.equipoSerial(), p.equipoNombre(), p.proximaFecha().format(FORMATO_FECHA))));

        if (proximos > 0) {
            cuerpo.append("\nPRÓXIMOS A VENCER (").append(proximos).append("):\n");
            pendientes.stream()
                    .filter(p -> p.estadoPlan() != EstadoPlan.VENCIDO)
                    .forEach(p -> cuerpo.append(String.format("  - %s - %s | próxima fecha: %s%n",
                            p.equipoSerial(), p.equipoNombre(), p.proximaFecha().format(FORMATO_FECHA))));
        }

        cuerpo.append("\n-- Enviado automáticamente por el CMMS");

        notificador.enviar(destinatarioAlertas,
                "[CMMS] Alertas de mantenimiento: " + vencidos + " vencidos, " + proximos + " próximos",
                cuerpo.toString());

        // Publica el evento de alerta por cada plan vencido (listeners futuros)
        Instant ahora = Instant.now(clock);
        pendientes.stream()
                .filter(p -> p.estadoPlan() == EstadoPlan.VENCIDO)
                .forEach(p -> publicadorEventos.publicar(new EventoAlertaMantenimiento(
                        p.planId(), p.equipoId(), p.equipoSerial(), p.equipoNombre(),
                        p.estadoPlan(), p.proximaFecha(), ahora)));

        log.info("=== Job de alertas finalizado: {} vencidos, {} próximos ===", vencidos, proximos);
    }
}
