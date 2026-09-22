package com.gabotoxf.cmms.repositorios;

import com.gabotoxf.cmms.equipo.ClasificacionRiesgo;
import com.gabotoxf.cmms.equipo.Equipo;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.equipo.EstadoEquipo;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimiento;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimientoRepository;
import com.gabotoxf.cmms.orden.OrdenTrabajo;
import com.gabotoxf.cmms.orden.OrdenTrabajoRepository;
import com.gabotoxf.cmms.orden.TipoOrden;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Fase 10: tests de repositorios contra un Postgres REAL en Docker
 * (no una base en memoria: se prueban constraints, tipos y SQL de verdad).
 * Flyway corre las migraciones sobre el contenedor, igual que en producción.
 *
 * Si Docker no está disponible (CI ligera, máquina del revisor), la clase se
 * omite automáticamente en vez de fallar.
 */
@SpringBootTest(properties = {
        "logging.level.org.hibernate.SQL=INFO",
        "spring.jpa.show-sql=false"
})
@Testcontainers(disabledWithoutDocker = true)
@Tag("testcontainers")
@Transactional
class RepositoriosTestcontainersTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine");

    @Autowired
    EquipoRepository equipoRepository;

    @Autowired
    PlanMantenimientoRepository planRepository;

    @Autowired
    OrdenTrabajoRepository ordenRepository;

    @Autowired
    EntityManager entityManager;

    private static final LocalDate HOY = LocalDate.of(2026, 9, 20);

    private Equipo crearEquipo(String serial, EstadoEquipo estado) {
        Equipo equipo;
        try {
            java.lang.reflect.Constructor<Equipo> ctor = Equipo.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            equipo = ctor.newInstance();
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException(ex);
        }
        equipo.setSerial(serial);
        equipo.setNombre("Equipo " + serial);
        equipo.setUbicacion("UCI");
        equipo.setClasificacionRiesgo(ClasificacionRiesgo.IIB);
        equipo.setPeriodicidadMantenimientoDias(30);
        equipo.setEstado(estado);
        return equipoRepository.save(equipo);
    }

    @Test
    @DisplayName("La auditoría automática llena creadoEn/actualizadoEn (Instant) al persistir")
    void auditoriaAutomatica() {
        Equipo guardado = crearEquipo("EQ-AUD-1", EstadoEquipo.OPERATIVO);
        entityManager.flush();

        assertThat(guardado.getId()).isNotNull();
        assertThat(guardado.getCreadoEn()).isNotNull();
        assertThat(guardado.getActualizadoEn()).isNotNull();
    }

    @Test
    @DisplayName("El serial único de BD lanza violación de integridad (defensa bajo concurrencia)")
    void serialUnico() {
        crearEquipo("EQ-DUP", EstadoEquipo.OPERATIVO);
        entityManager.flush();

        crearEquipo("EQ-DUP", EstadoEquipo.OPERATIVO);

        assertThatThrownBy(() -> entityManager.flush())
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Query de planes pendientes excluye equipos dados de baja")
    void planesPendientesExcluyeBajas() {
        Equipo activo = crearEquipo("EQ-ACT", EstadoEquipo.OPERATIVO);
        Equipo baja = crearEquipo("EQ-BAJA", EstadoEquipo.DADO_DE_BAJA);

        planRepository.save(new PlanMantenimiento(activo, 30, HOY.minusDays(40))); // vencido
        planRepository.save(new PlanMantenimiento(baja, 30, HOY.minusDays(40)));   // vencido pero dado de baja
        entityManager.flush();

        var pendientes = planRepository
                .findByProximaFechaLessThanEqualAndEquipoEstadoNot(HOY, EstadoEquipo.DADO_DE_BAJA);

        assertThat(pendientes)
                .extracting(p -> p.getEquipo().getSerial())
                .containsExactly("EQ-ACT");
    }

    @Test
    @DisplayName("La Specification de filtros traduce VENCIDO/PROXIMO/AL_DIA a rangos de fecha")
    void especificacionConFiltros() {
        Equipo equipo = crearEquipo("EQ-SPEC", EstadoEquipo.OPERATIVO);

        planRepository.save(new PlanMantenimiento(equipo, 30, HOY.minusDays(60)));   // vencido (fecha pasada)
        PlanMantenimiento alDia = new PlanMantenimiento(equipo, 30, HOY);            // vence a +30
        planRepository.save(alDia);
        entityManager.flush();
        entityManager.clear();

        var vencidos = planRepository.findAll(
                PlanMantenimientoRepository.conFiltros(null, HOY, 15,
                        com.gabotoxf.cmms.mantenimiento.EstadoPlan.VENCIDO));
        var alDiaLista = planRepository.findAll(
                PlanMantenimientoRepository.conFiltros(null, HOY, 15,
                        com.gabotoxf.cmms.mantenimiento.EstadoPlan.AL_DIA));

        assertThat(vencidos).hasSize(1);
        assertThat(alDiaLista).extracting(PlanMantenimiento::getId).containsExactly(alDia.getId());
    }

    @Test
    @DisplayName("Las órdenes de un equipo se consultan por equipoId ordenadas por fecha programada")
    void ordenesPorEquipo() {
        Equipo equipo = crearEquipo("EQ-ORD", EstadoEquipo.OPERATIVO);

        ordenRepository.save(new OrdenTrabajo(equipo, TipoOrden.CORRECTIVO,
                "Correctiva", "desc", HOY.minusDays(5)));
        ordenRepository.save(new OrdenTrabajo(equipo, TipoOrden.PREVENTIVO,
                "Preventiva", "desc", HOY));
        entityManager.flush();

        var ordenes = ordenRepository.findByEquipoIdOrderByFechaProgramadaDesc(equipo.getId());

        assertThat(ordenes).hasSize(2);
        assertThat(ordenes.get(0).getTitulo()).isEqualTo("Preventiva");
        assertThat(ordenes.get(0).getEquipo().getSerial()).isEqualTo("EQ-ORD");
    }
}
