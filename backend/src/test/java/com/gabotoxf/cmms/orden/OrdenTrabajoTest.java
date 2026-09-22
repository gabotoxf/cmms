package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.auth.Rol;
import com.gabotoxf.cmms.auth.Usuario;
import com.gabotoxf.cmms.equipo.Equipo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Fase 10: la máquina de estados es la regla de negocio más importante del CMMS.
 * Se prueba directamente sobre la entidad (sin Spring, sin BD): rápida y determinista.
 */
class OrdenTrabajoTest {

    private Clock clock;
    private OrdenTrabajo orden;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-09-20T10:00:00Z"), ZoneId.of("America/Bogota"));
        orden = new OrdenTrabajo(mock(Equipo.class), TipoOrden.CORRECTIVO,
                "Cambio de batería", "La batería no carga", LocalDate.now(clock));
    }

    @Test
    @DisplayName("Una orden nueva nace PENDIENTE")
    void nacePendiente() {
        assertThat(orden.getEstado()).isEqualTo(EstadoOrden.PENDIENTE);
        assertThat(orden.getTecnico()).isNull();
    }

    @Test
    @DisplayName("asignar pasa a ASIGNADA y registra al técnico")
    void asignar() {
        orden.asignar(tecnico(), clock);

        assertThat(orden.getEstado()).isEqualTo(EstadoOrden.ASIGNADA);
        assertThat(orden.getTecnico()).isNotNull();
        assertThat(orden.getAsignadaEn()).isEqualTo(Instant.now(clock));
    }

    @Test
    @DisplayName("No se puede asignar un técnico nulo")
    void noAsignarTecnicoNulo() {
        assertThatThrownBy(() -> orden.asignar(null, clock))
                .isInstanceOf(TransicionInvalidaException.class)
                .hasMessageContaining("obligatorio");
    }

    @Test
    @DisplayName("No se puede iniciar una orden sin asignar (PENDIENTE → EN_PROCESO está prohibido)")
    void noIniciarSinAsignar() {
        assertThatThrownBy(() -> orden.iniciar(clock))
                .isInstanceOf(TransicionInvalidaException.class)
                .hasMessageContaining("ASIGNADA");
    }

    @Test
    @DisplayName("iniciar solo funciona desde ASIGNADA")
    void iniciarDesdeAsignada() {
        orden.asignar(tecnico(), clock);
        orden.iniciar(clock);

        assertThat(orden.getEstado()).isEqualTo(EstadoOrden.EN_PROCESO);
        assertThat(orden.getIniciadaEn()).isEqualTo(Instant.now(clock));
    }

    @Test
    @DisplayName("No se puede completar sin resultado (trazabilidad Res. 3100)")
    void noCompletarSinResultado() {
        orden.asignar(tecnico(), clock);
        orden.iniciar(clock);

        assertThatThrownBy(() -> orden.completar("   ", clock))
                .isInstanceOf(TransicionInvalidaException.class)
                .hasMessageContaining("resultado");
    }

    @Test
    @DisplayName("completar desde EN_PROCESO guarda el resultado")
    void completar() {
        orden.asignar(tecnico(), clock);
        orden.iniciar(clock);
        orden.completar("Batería reemplazada y calibrada", clock);

        assertThat(orden.getEstado()).isEqualTo(EstadoOrden.COMPLETADA);
        assertThat(orden.getResultado()).isEqualTo("Batería reemplazada y calibrada");
        assertThat(orden.getCompletadaEn()).isEqualTo(Instant.now(clock));
    }

    @Test
    @DisplayName("No se puede completar desde PENDIENTE (salto de estados prohibido)")
    void noCompletarDesdePendiente() {
        assertThatThrownBy(() -> orden.completar("resultado", clock))
                .isInstanceOf(TransicionInvalidaException.class)
                .hasMessageContaining("EN_PROCESO");
    }

    @Test
    @DisplayName("cancelar desde PENDIENTE guarda el motivo")
    void cancelarDesdePendiente() {
        orden.cancelar("Equipo retirado del servicio", clock);

        assertThat(orden.getEstado()).isEqualTo(EstadoOrden.CANCELADA);
        assertThat(orden.getResultado()).isEqualTo("Equipo retirado del servicio");
        assertThat(orden.getCanceladaEn()).isEqualTo(Instant.now(clock));
    }

    @Test
    @DisplayName("cancelar sin motivo registra un texto por defecto")
    void cancelarSinMotivo() {
        orden.cancelar(null, clock);

        assertThat(orden.getEstado()).isEqualTo(EstadoOrden.CANCELADA);
        assertThat(orden.getResultado()).contains("sin motivo");
    }

    @Test
    @DisplayName("No se puede cancelar una orden COMPLETADA")
    void noCancelarCompletada() {
        orden.asignar(tecnico(), clock);
        orden.iniciar(clock);
        orden.completar("listo", clock);

        assertThatThrownBy(() -> orden.cancelar("motivo", clock))
                .isInstanceOf(TransicionInvalidaException.class)
                .hasMessageContaining("COMPLETADA");
    }

    @Test
    @DisplayName("No se puede reasignar una orden ya asignada")
    void noReasignar() {
        orden.asignar(tecnico(), clock);

        assertThatThrownBy(() -> orden.asignar(tecnico(), clock))
                .isInstanceOf(TransicionInvalidaException.class);
    }

    private Usuario tecnico() {
        return new Usuario("tecnico@cmms.local", "hash", Rol.TECNICO, "Técnico", "Demo", "3000000003");
    }
}
