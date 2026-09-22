package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.common.RecursoNoEncontradoException;

public class EquipoNoEncontradoException extends RecursoNoEncontradoException {

    public EquipoNoEncontradoException(Long id) {
        super("No existe un equipo con id: " + id);
    }
}
