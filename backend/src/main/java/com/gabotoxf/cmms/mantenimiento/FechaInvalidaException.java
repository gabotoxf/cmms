package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.ReglasNegocioException;

public class FechaInvalidaException extends ReglasNegocioException {

    private final String motivo;

    public FechaInvalidaException(String motivo) {
        super(motivo);
        this.motivo = motivo;
    }

    public String getMotivo() {
        return motivo;
    }
}
