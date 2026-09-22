package com.gabotoxf.cmms.auth;

import com.gabotoxf.cmms.common.ConflictoDatosException;

public class EmailDuplicadoException extends ConflictoDatosException {

    public EmailDuplicadoException(String email) {
        super("Ya existe un usuario con el email: " + email);
    }
}
