package com.gabotoxf.cmms.mantenimiento;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.Instant;

/**
 * Registro histórico de una ejecución de mantenimiento preventivo.
 * Conserva la trazabilidad aunque el plan cambie de frecuencia.
 */
@Entity
@Table(name = "registros_mantenimiento", indexes = {
        @Index(name = "idx_registros_plan", columnList = "plan_id"),
        @Index(name = "idx_registros_fecha", columnList = "fecha_ejecucion")
})
@EntityListeners(AuditingEntityListener.class)
public class RegistroMantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private PlanMantenimiento plan;

    @Column(name = "fecha_ejecucion", nullable = false)
    private LocalDate fechaEjecucion;

    @Column(length = 1000)
    private String descripcion;

    @Column(nullable = false, length = 120)
    private String tecnico;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant creadoEn;

    protected RegistroMantenimiento() {
    }

    public RegistroMantenimiento(PlanMantenimiento plan, LocalDate fechaEjecucion, String descripcion, String tecnico) {
        this.plan = plan;
        this.fechaEjecucion = fechaEjecucion;
        this.descripcion = descripcion;
        this.tecnico = tecnico;
    }

    public Long getId() {
        return id;
    }

    public PlanMantenimiento getPlan() {
        return plan;
    }

    public LocalDate getFechaEjecucion() {
        return fechaEjecucion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public String getTecnico() {
        return tecnico;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }
}
