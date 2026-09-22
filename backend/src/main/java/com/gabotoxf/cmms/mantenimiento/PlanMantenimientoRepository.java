package com.gabotoxf.cmms.mantenimiento;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PlanMantenimientoRepository extends JpaRepository<PlanMantenimiento, Long>,
        JpaSpecificationExecutor<PlanMantenimiento> {

    @Override
    @EntityGraph(attributePaths = "equipo")
    Page<PlanMantenimiento> findAll(Specification<PlanMantenimiento> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = "equipo")
    List<PlanMantenimiento> findAll(Specification<PlanMantenimiento> spec);

    @Override
    @EntityGraph(attributePaths = "equipo")
    Optional<PlanMantenimiento> findById(Long id);

    Optional<PlanMantenimiento> findByEquipoId(Long equipoId);

    boolean existsByEquipoId(Long equipoId);

    /**
     * Planes cuya próxima fecha vence antes o igual a la fecha dada,
     * excluyendo los de equipos dados de baja (ya no requieren mantenimiento).
     */
    @EntityGraph(attributePaths = "equipo")
    List<PlanMantenimiento> findByProximaFechaLessThanEqualAndEquipoEstadoNot(LocalDate fecha, com.gabotoxf.cmms.equipo.EstadoEquipo estado);

    /** Cuenta planes vencidos a una fecha, excluyendo equipos dados de baja. */
    long countByProximaFechaLessThanEqualAndEquipoEstadoNot(LocalDate fecha, com.gabotoxf.cmms.equipo.EstadoEquipo estado);

    /** Cuenta planes que vencen estrictamente después de la fecha dada (no vencidos aún). */
    long countByProximaFechaAfterAndEquipoEstadoNot(LocalDate fecha, com.gabotoxf.cmms.equipo.EstadoEquipo estado);

    /**
     * Specification reutilizable: planes pendientes hasta una fecha (equipo activo).
     * Combina con filtros de estado derivado en memoria solo cuando el cliente lo pide;
     * el caso base (sin filtro) se resuelve 100% en SQL.
     */
    static Specification<PlanMantenimiento> pendientesHasta(LocalDate limite) {
        return (root, query, cb) -> {
            Predicate fecha = cb.lessThanOrEqualTo(root.get("proximaFecha"), limite);
            Predicate noBaja = cb.notEqual(root.get("equipo").get("estado"),
                    com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA);
            return cb.and(fecha, noBaja);
        };
    }

    /**
     * Specification para el listado paginado: filtro opcional por equipo.
     * El estado derivado (VENCIDO/PROXIMO/AL_DIA) no es columna, así que se
     * traduce a rangos de fechas sobre proximaFecha usando el umbral de alerta.
     */
    static Specification<PlanMantenimiento> conFiltros(Long equipoId, LocalDate hoy, int diasAlerta,
                                                       EstadoPlan estado) {
        return (root, query, cb) -> {
            List<Predicate> where = new java.util.ArrayList<>();
            if (equipoId != null) {
                where.add(cb.equal(root.get("equipo").get("id"), equipoId));
            }
            if (estado == EstadoPlan.VENCIDO) {
                where.add(cb.lessThan(root.get("proximaFecha"), hoy));
            } else if (estado == EstadoPlan.PROXIMO) {
                where.add(cb.greaterThanOrEqualTo(root.get("proximaFecha"), hoy));
                where.add(cb.lessThan(root.get("proximaFecha"), hoy.plusDays(diasAlerta + 1L)));
            } else if (estado == EstadoPlan.AL_DIA) {
                where.add(cb.greaterThanOrEqualTo(root.get("proximaFecha"), hoy.plusDays(diasAlerta + 1L)));
            }
            Predicate noBaja = cb.notEqual(root.get("equipo").get("estado"),
                    com.gabotoxf.cmms.equipo.EstadoEquipo.DADO_DE_BAJA);
            where.add(noBaja);
            return cb.and(where.toArray(new Predicate[0]));
        };
    }
}
