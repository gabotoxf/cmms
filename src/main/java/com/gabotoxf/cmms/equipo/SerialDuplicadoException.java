package com.gabotoxf.cmms.equipo;

public class SerialDuplicadoException extends RuntimeException {

    public SerialDuplicadoException(String serial) {
        super("Ya existe un equipo con el serial: " + serial);
    }
}
