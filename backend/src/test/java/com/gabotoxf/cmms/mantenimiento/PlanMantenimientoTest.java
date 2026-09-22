package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.equipo.Equipo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * Fase 10: la próxima fecha del plan es la lógica que dispara todo el ciclo
 * preventivo (órdenes automáticas, alertas). Se prueba contra un Clock fijo.
 */
class PlanMantenimientoTest {

    private static final LocalDate HOY = LocalDate.of(2026, 9, 20);

    private Clock clock;
    private Equipo equipo;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-09-20T10:00:00Z"), ZoneId.of("America/Bogota"));
        equipo = mock(Equipo.class);
    }

    @Test
    @DisplayName("Al crear el plan, la próxima fecha es base + frecuencia")
    void proximaFechaInicial() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY);

        assertThat(plan.getProximaFecha()).isEqualTo(HOY.plusDays(30));
        assertThat(plan.getUltimaEjecucion()).isNull();
    }

    @Test
    @DisplayName("registrarEjecucion fija la última ejecución y recalcula la próxima fecha")
    void registrarEjecucion() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY);
        LocalDate ejecucion = HOY.plusDays(28);

        plan.registrarEjecucion(ejecucion);

        assertThat(plan.getUltimaEjecucion()).isEqualTo(ejecucion);
        assertThat(plan.getProximaFecha()).isEqualTo(ejecucion.plusDays(30));
    }

    @Test
    @DisplayName("cambiarFrecuencia con ejecución previa recalcula desde la última ejecución")
    void cambiarFrecuenciaConHistorial() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY);
        LocalDate ejecucion = HOY.plusDays(28);
        plan.registrarEjecucion(ejecucion);

        plan.cambiarFrecuencia(90, clock);

        assertThat(plan.getFrecuenciaDias()).isEqualTo(90);
        assertThat(plan.getProximaFecha()).isEqualTo(ejecucion.plusDays(90));
    }

    @Test
    @DisplayName("cambiarFrecuencia sin ejecuciones previas recalcula desde hoy (Clock)")
    void cambiarFrecuenciaSinHistorial() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY.minusDays(10));

        plan.cambiarFrecuencia(15, clock);

        assertThat(plan.getProximaFecha()).isEqualTo(HOY.plusDays(15));
    }

    @Test
    @DisplayName("Una ejecución tardía no deja el plan vencido: recalcula desde la fecha real")
    void ejecucionTardia() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY.minusDays(60));
        // el plan debería haberse ejecutado hace 30 días; hoy se pone al día
        plan.registrarEjecucion(HOY);

        assertThat(plan.getProximaFecha()).isEqualTo(HOY.plusDays(30));
    }
}
