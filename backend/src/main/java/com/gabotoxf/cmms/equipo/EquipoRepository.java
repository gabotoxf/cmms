package com.gabotoxf.cmms.equipo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EquipoRepository extends JpaRepository<Equipo, Long>, JpaSpecificationExecutor<Equipo> {

    boolean existsBySerial(String serial);

    /** Fase 7: conteo de equipos por estado para el dashboard (agregado en SQL). */
    @Query("select e.estado as estado, count(e) as total from Equipo e group by e.estado")
    List<ConteoEstadoEquipos> contarPorEstado();
}
