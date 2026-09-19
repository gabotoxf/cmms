package com.gabotoxf.cmms.common;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Envoltorio estable de paginación para el frontend.
 * Serializa siempre a la misma forma JSON, independiente de la implementación de Page.
 */
public record PaginaResponse<T>(
        List<T> contenido,
        long totalElementos,
        int totalPaginas,
        int pagina,
        int tamano
) {
    public static <T, E> PaginaResponse<T> from(Page<E> page, List<T> contenido) {
        return new PaginaResponse<>(contenido, page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
    }
}
