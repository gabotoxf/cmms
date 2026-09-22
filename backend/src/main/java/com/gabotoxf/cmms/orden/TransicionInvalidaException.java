package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.common.ReglasNegocioException;

/**
 * Violación de la máquina de estados de la orden de trabajo (HTTP 400).
 */
public class TransicionInvalidaException extends ReglasNegocioException {

    public TransicionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
