package com.gabotoxf.cmms.equipo;

public class EquipoNoEncontradoException extends RuntimeException {

    public EquipoNoEncontradoException(Long id) {
        super("No existe un equipo con id: " + id);
    }
}
