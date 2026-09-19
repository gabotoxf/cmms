package com.gabotoxf.cmms.auth.dto;

public record TokenResponse(
        String accessToken,
        String tokenType,
        long expiraEnSegundos,
        String email,
        String nombre,
        String rol
) {
}
