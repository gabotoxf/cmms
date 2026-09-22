package com.gabotoxf.cmms.common;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

/**
 * Paginación defensiva: nunca confiamos en el "orden" ni el "tamano" que manda el cliente.
 * - El orden solo se permite sobre campos whitelisted (evita PropertyReferenceException -> 500
 *   y también queries arbitrarias sobre columnas no pensadas para sort).
 * - El tamaño de página se acota (evita que un cliente pida 1M de filas y sature memoria).
 */
public final class PageableUtils {

    private PageableUtils() {
    }

    public static final int TAMANO_MAXIMO = 100;

    public static Pageable sanitizar(int pagina, int tamano, String orden,
                                     Set<String> camposOrdenables, String campoPorDefecto) {
        int paginaSegura = Math.max(0, pagina);
        int tamanoSeguro = Math.clamp(tamano, 1, TAMANO_MAXIMO);

        Sort sort = Sort.by(Sort.Direction.ASC, campoPorDefecto);
        if (orden != null && !orden.isBlank()) {
            String campo = orden.trim();
            Sort.Direction direccion = Sort.Direction.ASC;
            if (campo.startsWith("-")) {
                direccion = Sort.Direction.DESC;
                campo = campo.substring(1);
            }
            if (camposOrdenables.contains(campo)) {
                sort = Sort.by(direccion, campo);
            }
        }
        return PageRequest.of(paginaSegura, tamanoSeguro, sort);
    }
}
