package com.gabotoxf.cmms.mantenimiento;

/**
 * Estado derivado del plan según su próxima fecha:
 * - VENCIDO: la próxima fecha ya pasó
 * - PROXIMO: vence dentro del umbral de alerta (configurable, 15 días por defecto)
 * - AL_DIA: vence más allá del umbral
 */
public enum EstadoPlan {
    VENCIDO, PROXIMO, AL_DIA
}
