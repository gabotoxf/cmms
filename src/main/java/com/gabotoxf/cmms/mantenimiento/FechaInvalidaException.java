package com.gabotoxf.cmms.mantenimiento;

public class FechaInvalidaException extends RuntimeException {

    private final String motivo;

    public FechaInvalidaException(String motivo) {
        super(motivo);
        this.motivo = motivo;
    }

    public String getMotivo() {
        return motivo;
    }
}
