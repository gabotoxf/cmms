package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.equipo.Equipo;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Plan de mantenimiento preventivo de un equipo.
 * proximaFecha se calcula siempre como ultimaEjecucion + frecuenciaDias
 * (o desde la fecha base del equipo si nunca se ha ejecutado).
 */
@Entity
@Table(name = "planes_mantenimiento")
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

    @Column(nullable = false)
    private LocalDate proximaFecha;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(nullable = false)
    private LocalDateTime actualizadoEn;

    @PrePersist
    void alCrear() {
        this.creadoEn = LocalDateTime.now();
        this.actualizadoEn = this.creadoEn;
    }

    @PreUpdate
    void alModificar() {
        this.actualizadoEn = LocalDateTime.now();
    }

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
     * Si nunca se ha ejecutado, se toma hoy como base de cálculo.
     */
    public void cambiarFrecuencia(Integer nuevaFrecuencia) {
        this.frecuenciaDias = nuevaFrecuencia;
        LocalDate base = (this.ultimaEjecucion != null) ? this.ultimaEjecucion : LocalDate.now();
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

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setProximaFecha(LocalDate proximaFecha) {
        this.proximaFecha = proximaFecha;
    }
}
