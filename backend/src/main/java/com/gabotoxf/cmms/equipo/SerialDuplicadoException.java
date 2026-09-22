package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.common.ConflictoDatosException;

public class SerialDuplicadoException extends ConflictoDatosException {

    public SerialDuplicadoException(String serial) {
        super("Ya existe un equipo con el serial: " + serial);
    }
}
