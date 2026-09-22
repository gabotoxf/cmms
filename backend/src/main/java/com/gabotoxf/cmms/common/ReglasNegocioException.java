package com.gabotoxf.cmms.common;

/**
 * Excepción base para violaciones de reglas de negocio. Traducida a HTTP 400
 * (o 422 si se prefiere semántica más fina) por el GlobalExceptionHandler.
 */
public class ReglasNegocioException extends RuntimeException {

    public ReglasNegocioException(String mensaje) {
        super(mensaje);
    }
}
