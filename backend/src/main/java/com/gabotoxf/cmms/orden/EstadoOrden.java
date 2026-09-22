package com.gabotoxf.cmms.orden;

/**
 * Estados del ciclo de vida de una orden de trabajo.
 * Las transiciones válidas se validan en la entidad OrdenTrabajo.
 */
public enum EstadoOrden {
    PENDIENTE,
    ASIGNADA,
    EN_PROCESO,
    COMPLETADA,
    CANCELADA
}
