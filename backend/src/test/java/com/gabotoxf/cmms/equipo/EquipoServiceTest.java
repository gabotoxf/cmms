package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.common.EventoEquipoCreado;
import com.gabotoxf.cmms.common.PublicadorEventos;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import com.gabotoxf.cmms.equipo.dto.EquipoResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Fase 10: casos de uso del inventario de equipos con Mockito (sin BD).
 * Cubre la regla de serial único, la baja lógica (no se borra nada en un CMMS)
 * y la publicación del evento que dispara la creación del plan preventivo.
 */
class EquipoServiceTest {

    private EquipoRepository equipoRepository;
    private PublicadorEventos publicadorEventos;
    private EquipoService equipoService;

    @BeforeEach
    void setUp() {
        equipoRepository = mock(EquipoRepository.class);
        publicadorEventos = mock(PublicadorEventos.class);
        equipoService = new EquipoService(equipoRepository, publicadorEventos);
    }

    private EquipoRequest request(String serial) {
        return new EquipoRequest(serial, "Ventilador mecánico", "Brand", "X100",
                "UCI", ClasificacionRiesgo.IIB, null, 180);
    }

    private Equipo equipoExistente(String serial) {
        // Equipo tiene constructor protegido (entidad JPA): se instancia vía reflexión en tests
        try {
            java.lang.reflect.Constructor<Equipo> ctor = Equipo.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            Equipo equipo = ctor.newInstance();
            equipo.setSerial(serial);
            return equipo;
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Test
    @DisplayName("crear guarda el equipo y publica el evento que crea su plan de mantenimiento")
    void crear() {
        when(equipoRepository.existsBySerial("EQ-001")).thenReturn(false);
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(inv -> {
            Equipo e = inv.getArgument(0);
            try {
                java.lang.reflect.Field id = Equipo.class.getDeclaredField("id");
                id.setAccessible(true);
                id.set(e, 1L);
            } catch (ReflectiveOperationException ignored) {
            }
            return e;
        });

        EquipoResponse response = equipoService.crear(request("EQ-001"));

        assertThat(response.serial()).isEqualTo("EQ-001");
        assertThat(response.estado()).isEqualTo(EstadoEquipo.OPERATIVO);
        verify(publicadorEventos).publicar(any(EventoEquipoCreado.class));
    }

    @Test
    @DisplayName("crear con serial duplicado lanza excepción de conflicto sin publicar evento")
    void crearSerialDuplicado() {
        when(equipoRepository.existsBySerial("EQ-001")).thenReturn(true);

        assertThatThrownBy(() -> equipoService.crear(request("EQ-001")))
                .isInstanceOf(SerialDuplicadoException.class)
                .hasMessageContaining("EQ-001");

        verify(equipoRepository, never()).save(any());
        verify(publicadorEventos, never()).publicar(any());
    }

    @Test
    @DisplayName("crear normaliza el serial (espacios fuera)")
    void crearNormalizaSerial() {
        when(equipoRepository.existsBySerial("EQ-001")).thenReturn(false);
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(inv -> inv.getArgument(0));

        equipoService.crear(request("  EQ-001  "));

        ArgumentCaptor<Equipo> captor = ArgumentCaptor.forClass(Equipo.class);
        verify(equipoRepository).save(captor.capture());
        assertThat(captor.getValue().getSerial()).isEqualTo("EQ-001");
        assertThat(captor.getValue().getUbicacion()).isEqualTo("UCI");
    }

    @Test
    @DisplayName("actualizar permite mantener el mismo serial del propio equipo")
    void actualizarMismoSerial() {
        Equipo existente = equipoExistente("EQ-001");
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(inv -> inv.getArgument(0));

        EquipoResponse response = equipoService.actualizar(1L, request("EQ-001"));

        assertThat(response.nombre()).isEqualTo("Ventilador mecánico");
        verify(equipoRepository, never()).existsBySerial("EQ-001");
    }

    @Test
    @DisplayName("actualizar con el serial de OTRO equipo lanza conflicto")
    void actualizarSerialDeOtro() {
        Equipo existente = equipoExistente("EQ-001");
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(equipoRepository.existsBySerial("EQ-002")).thenReturn(true);

        assertThatThrownBy(() -> equipoService.actualizar(1L, request("EQ-002")))
                .isInstanceOf(SerialDuplicadoException.class);
    }

    @Test
    @DisplayName("darDeBaja no borra el equipo: marca el estado (trazabilidad)")
    void darDeBaja() {
        Equipo existente = equipoExistente("EQ-001");
        when(equipoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(equipoRepository.save(any(Equipo.class))).thenAnswer(inv -> inv.getArgument(0));

        EquipoResponse response = equipoService.darDeBaja(1L);

        assertThat(response.estado()).isEqualTo(EstadoEquipo.DADO_DE_BAJA);
        verify(equipoRepository, never()).delete(any(Equipo.class));
    }

    @Test
    @DisplayName("operaciones sobre un equipo inexistente lanzan 404 de dominio")
    void equipoInexistente() {
        when(equipoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> equipoService.obtenerPorId(99L))
                .isInstanceOf(EquipoNoEncontradoException.class);
    }
}
