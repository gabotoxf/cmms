package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.auth.Usuario;
import com.gabotoxf.cmms.equipo.Equipo;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Orden de trabajo: el corazón operativo del CMMS.
 * La máquina de estados vive AQUÍ (no en el service): la entidad protege sus propias
 * invariantes y es imposible crear una transición inválida desde otro módulo.
 *
 *   PENDIENTE → ASIGNADA → EN_PROCESO → COMPLETADA
 *        ↘__________ ↘ ↗__________ ↗
 *              CANCELADA (solo desde PENDIENTE/ASIGNADA/EN_PROCESO)
 */
@Entity
@Table(name = "ordenes_trabajo", indexes = {
        @Index(name = "idx_ordenes_estado", columnList = "estado"),
        @Index(name = "idx_ordenes_tipo", columnList = "tipo"),
        @Index(name = "idx_ordenes_tecnico", columnList = "tecnico_id"),
        @Index(name = "idx_ordenes_equipo", columnList = "equipo_id")
})
@EntityListeners(AuditingEntityListener.class)
public class OrdenTrabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_id", nullable = false)
    private Equipo equipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private TipoOrden tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private EstadoOrden estado = EstadoOrden.PENDIENTE;

    /** Título corto y descriptivo del trabajo. */
    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 2000)
    private String descripcion;

    /** Técnico asignado. FK real a Usuario: la trazabilidad 3100 exige saber quién hizo qué. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    @Column(length = 2000)
    private String resultado;

    /** Fechas clave del ciclo de vida (Instant, zona UTC en BD, reloj de la app para lógica). */
    private Instant asignadaEn;
    private Instant iniciadaEn;
    private Instant completadaEn;
    private Instant canceladaEn;

    @Column(nullable = false)
    private LocalDate fechaProgramada;

    @Version
    private Long version;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant creadoEn;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant actualizadoEn;

    protected OrdenTrabajo() {
    }

    public OrdenTrabajo(Equipo equipo, TipoOrden tipo, String titulo, String descripcion, LocalDate fechaProgramada) {
        this.equipo = equipo;
        this.tipo = tipo;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaProgramada = fechaProgramada;
    }

    // ===== Máquina de estados (la entidad valida sus transiciones) =====

    public void asignar(Usuario tecnico, Clock clock) {
        exigirEstado(EstadoOrden.PENDIENTE, "asignar");
        if (tecnico == null) {
            throw new TransicionInvalidaException("El técnico a asignar es obligatorio");
        }
        this.tecnico = tecnico;
        this.estado = EstadoOrden.ASIGNADA;
        this.asignadaEn = Instant.now(clock);
    }

    public void iniciar(Clock clock) {
        exigirEstado(EstadoOrden.ASIGNADA, "iniciar");
        this.estado = EstadoOrden.EN_PROCESO;
        this.iniciadaEn = Instant.now(clock);
    }

    /**
     * Completa la orden. Exige observaciones del trabajo realizado (trazabilidad).
     */
    public void completar(String resultado, Clock clock) {
        exigirEstado(EstadoOrden.EN_PROCESO, "completar");
        if (resultado == null || resultado.isBlank()) {
            throw new TransicionInvalidaException("El resultado del mantenimiento es obligatorio al completar");
        }
        this.resultado = resultado.trim();
        this.estado = EstadoOrden.COMPLETADA;
        this.completadaEn = Instant.now(clock);
    }

    public void cancelar(String motivo, Clock clock) {
        if (this.estado == EstadoOrden.COMPLETADA || this.estado == EstadoOrden.CANCELADA) {
            throw new TransicionInvalidaException(
                    "No se puede cancelar una orden en estado " + this.estado);
        }
        this.resultado = (motivo == null || motivo.isBlank()) ? "Cancelada sin motivo registrado" : motivo.trim();
        this.estado = EstadoOrden.CANCELADA;
        this.canceladaEn = Instant.now(clock);
    }

    private void exigirEstado(EstadoOrden requerido, String accion) {
        if (this.estado != requerido) {
            throw new TransicionInvalidaException(
                    "No se puede " + accion + " una orden en estado " + this.estado
                            + " (se requiere " + requerido + ")");
        }
    }

    // ===== Getters =====

    public Long getId() {
        return id;
    }

    public Equipo getEquipo() {
        return equipo;
    }

    public TipoOrden getTipo() {
        return tipo;
    }

    public EstadoOrden getEstado() {
        return estado;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public Usuario getTecnico() {
        return tecnico;
    }

    public String getResultado() {
        return resultado;
    }

    public Instant getAsignadaEn() {
        return asignadaEn;
    }

    public Instant getIniciadaEn() {
        return iniciadaEn;
    }

    public Instant getCompletadaEn() {
        return completadaEn;
    }

    public Instant getCanceladaEn() {
        return canceladaEn;
    }

    public LocalDate getFechaProgramada() {
        return fechaProgramada;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }

    public Instant getActualizadoEn() {
        return actualizadoEn;
    }
}
