package com.gabotoxf.cmms.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Reloj de la aplicación, inyectable y por tanto sustituible en tests
 * (Clock.fixed) para probar lógica dependiente de fechas de forma determinista.
 * Toda la lógica de negocio usa este reloj en vez de LocalDate.now() disperso.
 */
@Configuration
public class ClockConfig {

    /** Zona de operación del CMMS (Colombia). Úsala para derivar LocalDate de Instant. */
    public static final ZoneId ZONA = ZoneId.of("America/Bogota");

    @Bean
    public Clock clock(@Value("${app.zona-horaria:America/Bogota}") String zona) {
        return Clock.system(ZoneId.of(zona));
    }
}
