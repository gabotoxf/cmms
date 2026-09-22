package com.gabotoxf.cmms.mantenimiento;

import com.gabotoxf.cmms.common.RecursoNoEncontradoException;

public class PlanNoEncontradoException extends RecursoNoEncontradoException {

    private final Long id;

    public PlanNoEncontradoException(Long id) {
        super("No existe un plan de mantenimiento con id: " + id);
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
