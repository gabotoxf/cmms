package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.equipo.Equipo;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Plan de mantenimiento preventivo de un equipo.
 * proximaFecha se calcula siempre como ultimaEjecucion + frecuenciaDias
 * (o desde la fecha base del equipo si nunca se ha ejecutado).
 */
@Entity
@Table(name = "planes_mantenimiento", indexes = {
        @Index(name = "idx_planes_proxima_fecha", columnList = "proxima_fecha"),
        @Index(name = "idx_planes_frecuencia", columnList = "frecuencia_dias")
})
@EntityListeners(AuditingEntityListener.class)
public class PlanMantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_id", nullable = false, unique = true)
    private Equipo equipo;

    @Column(nullable = false)
    private Integer frecuenciaDias;

    private LocalDate ultimaEjecucion;

    @Column(nullable = false, name = "proxima_fecha")
    private LocalDate proximaFecha;

    @Version
    private Long version;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant creadoEn;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant actualizadoEn;

    protected PlanMantenimiento() {
    }

    public PlanMantenimiento(Equipo equipo, Integer frecuenciaDias, LocalDate baseCalculo) {
        this.equipo = equipo;
        this.frecuenciaDias = frecuenciaDias;
        this.ultimaEjecucion = null;
        this.proximaFecha = baseCalculo.plusDays(frecuenciaDias);
    }

    /**
     * Registra una ejecución del mantenimiento y recalcula la próxima fecha.
     */
    public void registrarEjecucion(LocalDate fechaEjecucion) {
        this.ultimaEjecucion = fechaEjecucion;
        this.proximaFecha = fechaEjecucion.plusDays(this.frecuenciaDias);
    }

    /**
     * Actualiza la frecuencia y recalcula la próxima fecha.
     * Si nunca se ha ejecutado, se toma hoy (según el Clock de la app) como base.
     */
    public void cambiarFrecuencia(Integer nuevaFrecuencia, Clock clock) {
        this.frecuenciaDias = nuevaFrecuencia;
        LocalDate base = (this.ultimaEjecucion != null)
                ? this.ultimaEjecucion
                : LocalDate.now(clock);
        this.proximaFecha = base.plusDays(nuevaFrecuencia);
    }

    public Long getId() {
        return id;
    }

    public Equipo getEquipo() {
        return equipo;
    }

    public Integer getFrecuenciaDias() {
        return frecuenciaDias;
    }

    public LocalDate getUltimaEjecucion() {
        return ultimaEjecucion;
    }

    public LocalDate getProximaFecha() {
        return proximaFecha;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }

    public Instant getActualizadoEn() {
        return actualizadoEn;
    }
}
