package com.gabotoxf.cmms.equipo;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "equipos", indexes = {
        @Index(name = "idx_equipos_estado", columnList = "estado"),
        @Index(name = "idx_equipos_riesgo", columnList = "clasificacion_riesgo"),
        @Index(name = "idx_equipos_ubicacion", columnList = "ubicacion")
})
@EntityListeners(AuditingEntityListener.class)
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String serial;

    @Column(nullable = false)
    private String nombre;

    private String marca;

    private String modelo;

    @Column(nullable = false)
    private String ubicacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ClasificacionRiesgo clasificacionRiesgo;

    private LocalDate fechaAdquisicion;

    @Column(nullable = false)
    private Integer periodicidadMantenimientoDias;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoEquipo estado = EstadoEquipo.OPERATIVO;

    /**
     * Locking optimista: si dos usuarios editan el mismo equipo a la vez,
     * el segundo recibe un error en vez de sobrescribir en silencio.
     */
    @Version
    private Long version;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant creadoEn;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant actualizadoEn;

    protected Equipo() {
    }

    public Long getId() {
        return id;
    }

    public String getSerial() {
        return serial;
    }

    public void setSerial(String serial) {
        this.serial = serial;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public ClasificacionRiesgo getClasificacionRiesgo() {
        return clasificacionRiesgo;
    }

    public void setClasificacionRiesgo(ClasificacionRiesgo clasificacionRiesgo) {
        this.clasificacionRiesgo = clasificacionRiesgo;
    }

    public LocalDate getFechaAdquisicion() {
        return fechaAdquisicion;
    }

    public void setFechaAdquisicion(LocalDate fechaAdquisicion) {
        this.fechaAdquisicion = fechaAdquisicion;
    }

    public Integer getPeriodicidadMantenimientoDias() {
        return periodicidadMantenimientoDias;
    }

    public void setPeriodicidadMantenimientoDias(Integer periodicidadMantenimientoDias) {
        this.periodicidadMantenimientoDias = periodicidadMantenimientoDias;
    }

    public EstadoEquipo getEstado() {
        return estado;
    }

    public void setEstado(EstadoEquipo estado) {
        this.estado = estado;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }

    public Instant getActualizadoEn() {
        return actualizadoEn;
    }
}
