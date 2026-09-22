package com.gabotoxf.cmms.orden;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;

public interface OrdenTrabajoRepository extends JpaRepository<OrdenTrabajo, Long>,
        JpaSpecificationExecutor<OrdenTrabajo> {

    @Override
    @EntityGraph(attributePaths = {"equipo", "tecnico"})
    Page<OrdenTrabajo> findAll(Specification<OrdenTrabajo> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"equipo", "tecnico"})
    List<OrdenTrabajo> findAll(Specification<OrdenTrabajo> spec);

    @Override
    @EntityGraph(attributePaths = {"equipo", "tecnico"})
    List<OrdenTrabajo> findAll();

    /** Órdenes preventivas aún abiertas para un equipo (evita duplicar generaciones del job). */
    @EntityGraph(attributePaths = {"equipo", "tecnico"})
    List<OrdenTrabajo> findByEquipoIdAndTipoAndEstadoIn(Long equipoId, TipoOrden tipo, List<EstadoOrden> estados);

    /** Para MTTR (Fase 7): duración de órdenes correctivas completadas en un rango. */
    @EntityGraph(attributePaths = {"equipo", "tecnico"})
    List<OrdenTrabajo> findByTipoAndEstadoAndCompletadaEnBetween(TipoOrden tipo, EstadoOrden estado,
                                                                 Instant desde, Instant hasta);

    /** Órdenes de un equipo, más recientes primero (hoja de vida, Fase 6). */
    @EntityGraph(attributePaths = {"equipo", "tecnico"})
    List<OrdenTrabajo> findByEquipoIdOrderByFechaProgramadaDesc(Long equipoId);

    /** Fase 7: conteo de órdenes por estado para el dashboard (agregado en SQL). */
    @org.springframework.data.jpa.repository.Query("select o.estado as estado, count(o) as total from OrdenTrabajo o group by o.estado")
    List<ConteoEstadoOrdenes> contarPorEstado();

    /** Fase 7: órdenes abiertas (pendientes + asignadas + en proceso). */
    long countByEstadoIn(List<EstadoOrden> estados);

    /** Fase 7: preventivas programadas en el mes, excluyendo un estado (canceladas). */
    long countByTipoAndFechaProgramadaBetweenAndEstadoNot(TipoOrden tipo, java.time.LocalDate desde,
                                                          java.time.LocalDate hasta, EstadoOrden estado);

    /** Fase 7: preventivas completadas dentro del mes programado. */
    long countByTipoAndFechaProgramadaBetweenAndEstado(TipoOrden tipo, java.time.LocalDate desde,
                                                       java.time.LocalDate hasta, EstadoOrden estado);

    long countByEstado(EstadoOrden estado);
}
