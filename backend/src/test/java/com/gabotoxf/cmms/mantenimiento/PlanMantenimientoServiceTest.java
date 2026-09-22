package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.equipo.Equipo;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.mantenimiento.dto.EjecucionRequest;
import com.gabotoxf.cmms.mantenimiento.dto.PlanResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Fase 10: lógica de negocio del módulo de mantenimiento, aislada con Mockito
 * (sin BD, sin Spring). Cubre el upsert de planes, la validación de fechas
 * y el registro de ejecuciones desde órdenes preventivas completadas.
 */
class PlanMantenimientoServiceTest {

    private static final LocalDate HOY = LocalDate.of(2026, 9, 20);

    private PlanMantenimientoRepository planRepository;
    private RegistroMantenimientoRepository registroRepository;
    private EquipoRepository equipoRepository;
    private PlanMantenimientoService planService;

    private Equipo equipo;

    @BeforeEach
    void setUp() {
        planRepository = mock(PlanMantenimientoRepository.class);
        registroRepository = mock(RegistroMantenimientoRepository.class);
        equipoRepository = mock(EquipoRepository.class);
        Clock clock = Clock.fixed(Instant.parse("2026-09-20T10:00:00Z"), ZoneId.of("America/Bogota"));
        planService = new PlanMantenimientoService(planRepository, registroRepository,
                equipoRepository, clock, 15);

        equipo = nuevoEquipo();
        equipo.setSerial("EQ-001");
        equipo.setNombre("Monitor de signos vitales");
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(equipo));
    }

    /** Equipo tiene el constructor protegido (entidad JPA); se instancia vía reflexión. */
    private Equipo nuevoEquipo() {
        try {
            java.lang.reflect.Constructor<Equipo> ctor = Equipo.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            return ctor.newInstance();
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Test
    @DisplayName("crearPlanSiFalta crea el plan cuando el equipo no lo tiene")
    void crearPlanSiFalta() {
        when(planRepository.existsByEquipoId(1L)).thenReturn(false);

        planService.crearPlanSiFalta(1L, 30);

        ArgumentCaptor<PlanMantenimiento> captor = ArgumentCaptor.forClass(PlanMantenimiento.class);
        verify(planRepository).save(captor.capture());
        assertThat(captor.getValue().getFrecuenciaDias()).isEqualTo(30);
        assertThat(captor.getValue().getProximaFecha()).isEqualTo(HOY.plusDays(30));
    }

    @Test
    @DisplayName("crearPlanSiFalta no duplica si ya existe el plan")
    void crearPlanSiFaltaNoDuplica() {
        when(planRepository.existsByEquipoId(1L)).thenReturn(true);

        planService.crearPlanSiFalta(1L, 30);

        verify(planRepository, never()).save(any());
    }

    @Test
    @DisplayName("crearPlanSiFalta ignora periodicidad nula (equipo sin mantenimiento definido)")
    void crearPlanSiFaltaSinPeriodicidad() {
        planService.crearPlanSiFalta(1L, null);

        verify(planRepository, never()).save(any());
    }

    @Test
    @DisplayName("sincronizarFrecuencia alinea el plan con la nueva periodicidad del equipo")
    void sincronizarFrecuencia() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY.minusDays(5));
        when(planRepository.findByEquipoId(1L)).thenReturn(Optional.of(plan));

        planService.sincronizarFrecuencia(1L, 90);

        assertThat(plan.getFrecuenciaDias()).isEqualTo(90);
        assertThat(plan.getProximaFecha()).isEqualTo(HOY.plusDays(90));
    }

    @Test
    @DisplayName("registrarEjecucion rechaza fechas futuras")
    void registrarEjecucionFutura() {
        EjecucionRequest request = new EjecucionRequest(HOY.plusDays(1), "x", "Técnico");

        assertThatThrownBy(() -> planService.registrarEjecucion(1L, request))
                .isInstanceOf(FechaInvalidaException.class)
                .hasMessageContaining("futura");
    }

    @Test
    @DisplayName("registrarEjecucion guarda el plan actualizado y el registro histórico")
    void registrarEjecucionValida() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY.minusDays(20));
        when(planRepository.findById(5L)).thenReturn(Optional.of(plan));

        PlanResponse response = planService.registrarEjecucion(
                5L, new EjecucionRequest(HOY, "Mantenimiento preventivo completo", "Técnico Demo"));

        assertThat(response.proximaFecha()).isEqualTo(HOY.plusDays(30));
        verify(planRepository).save(plan);
        ArgumentCaptor<RegistroMantenimiento> captor = ArgumentCaptor.forClass(RegistroMantenimiento.class);
        verify(registroRepository).save(captor.capture());
        assertThat(captor.getValue().getFechaEjecucion()).isEqualTo(HOY);
        assertThat(captor.getValue().getTecnico()).isEqualTo("Técnico Demo");
    }

    @Test
    @DisplayName("registrarEjecucionDesdeOrden actualiza el plan del equipo tras completar una preventiva")
    void registrarEjecucionDesdeOrden() {
        PlanMantenimiento plan = new PlanMantenimiento(equipo, 30, HOY.minusDays(40));
        when(planRepository.findByEquipoId(1L)).thenReturn(Optional.of(plan));

        planService.registrarEjecucionDesdeOrden(1L, HOY, "Preventiva realizada", "sistema");

        assertThat(plan.getProximaFecha()).isEqualTo(HOY.plusDays(30));
        verify(registroRepository).save(any(RegistroMantenimiento.class));
    }

    @Test
    @DisplayName("revisar cuenta vencidos y próximos con counts en SQL")
    void revisar() {
        when(planRepository.countByProximaFechaLessThanEqualAndEquipoEstadoNot(HOY,
                com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA)).thenReturn(3L);
        when(planRepository.countByProximaFechaLessThanEqualAndEquipoEstadoNot(HOY.plusDays(15),
                com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA)).thenReturn(7L);

        PlanMantenimientoService.ResumenRevision resumen = planService.revisar();

        assertThat(resumen.vencidos()).isEqualTo(3);
        assertThat(resumen.proximos()).isEqualTo(4);
        assertThat(resumen.diasAlerta()).isEqualTo(15);
    }

    @Test
    @DisplayName("cambiarFrecuencia rechaza frecuencias menores a 1 día")
    void cambiarFrecuenciaInvalida() {
        assertThatThrownBy(() -> planService.cambiarFrecuencia(1L, 0))
                .isInstanceOf(FechaInvalidaException.class)
                .hasMessageContaining("al menos 1 día");
    }
}
