package com.gabotoxf.cmms.mantenimiento;

public class PlanNoEncontradoException extends RuntimeException {

    private final Long id;

    public PlanNoEncontradoException(Long id) {
        super("No existe un plan de mantenimiento con id: " + id);
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
