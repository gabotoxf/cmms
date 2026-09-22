package com.gabotoxf.cmms.equipo;

/**
 * Proyección de conteo por estado (interface-based projection de Spring Data).
 * La llena el @Query agrupado del EquipoRepository para el dashboard (Fase 7).
 */
public interface ConteoEstadoEquipos {

    EstadoEquipo getEstado();

    long getTotal();
}
