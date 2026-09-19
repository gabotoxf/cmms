package com.gabotoxf.cmms.mantenimiento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PlanMantenimientoRepository extends JpaRepository<PlanMantenimiento, Long>,
        JpaSpecificationExecutor<PlanMantenimiento> {

    Optional<PlanMantenimiento> findByEquipoId(Long equipoId);

    boolean existsByEquipoId(Long equipoId);

    /**
     * Planes cuya próxima fecha vence antes o igual a la fecha dada,
     * excluyendo los de equipos dados de baja (ya no requieren mantenimiento).
     */
    @Query("""
            select p from PlanMantenimiento p
            where p.proximaFecha <= :fecha
              and p.equipo.estado <> com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA
            """)
    List<PlanMantenimiento> findPendientesHasta(@Param("fecha") LocalDate fecha);
}
