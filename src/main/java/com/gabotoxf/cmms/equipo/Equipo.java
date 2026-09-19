package com.gabotoxf.cmms.equipo;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipos")
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
    @Column(nullable = false)
    private ClasificacionRiesgo clasificacionRiesgo;

    private LocalDate fechaAdquisicion;

    @Column(nullable = false)
    private Integer periodicidadMantenimientoDias;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEquipo estado = EstadoEquipo.OPERATIVO;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @PrePersist
    void alCrear() {
        this.creadoEn = LocalDateTime.now();
    }

    protected Equipo() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }
}
