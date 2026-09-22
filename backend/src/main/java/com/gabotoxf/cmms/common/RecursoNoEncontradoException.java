package com.gabotoxf.cmms.common;

/**
 * Excepción base para recursos inexistentes. Los módulos la extienden
 * (EquipoNoEncontradoException, PlanNoEncontradoException, ...) y el
 * GlobalExceptionHandler las traduce a HTTP 404 sin conocerlas una por una.
 */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
