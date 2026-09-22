package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.common.RecursoNoEncontradoException;

/**
 * Orden de trabajo inexistente (HTTP 404).
 */
public class OrdenNoEncontradaException extends RecursoNoEncontradoException {

    public OrdenNoEncontradaException(Long id) {
        super("No existe una orden de trabajo con id: " + id);
    }
}
