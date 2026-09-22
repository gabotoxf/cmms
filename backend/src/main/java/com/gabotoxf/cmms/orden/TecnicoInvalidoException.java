package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.common.ConflictoDatosException;

/**
 * Error de asignación: técnico inexistente, inactivo o sin rol TECNICO (HTTP 409/400).
 */
public class TecnicoInvalidoException extends ConflictoDatosException {

    public TecnicoInvalidoException(String mensaje) {
        super(mensaje);
    }
}
