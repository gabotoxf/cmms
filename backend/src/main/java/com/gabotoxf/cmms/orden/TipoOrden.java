package com.gabotoxf.cmms.orden;

/**
 * Tipo de orden de trabajo: PREVENTIVO nace del plan de mantenimiento
 * (generada por el job o manualmente) y CORRECTIVO nace de una falla.
 */
public enum TipoOrden {
    PREVENTIVO,
    CORRECTIVO
}
