package com.gabotoxf.cmms.common;

/**
 * Excepción base para conflictos de datos (duplicados). Traducida a HTTP 409
 * por el GlobalExceptionHandler.
 */
public class ConflictoDatosException extends RuntimeException {

    public ConflictoDatosException(String mensaje) {
        super(mensaje);
    }
}
