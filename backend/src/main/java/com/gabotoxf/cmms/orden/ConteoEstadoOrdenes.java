package com.gabotoxf.cmms.orden;

/**
 * Proyección de conteo por estado (interface-based projection de Spring Data).
 * La llena el @Query agrupado del OrdenTrabajoRepository para el dashboard (Fase 7).
 */
public interface ConteoEstadoOrdenes {

    EstadoOrden getEstado();

    long getTotal();
}
