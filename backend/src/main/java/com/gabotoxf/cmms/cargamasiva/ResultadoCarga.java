package com.gabotoxf.cmms.cargamasiva;

import java.util.ArrayList;
import java.util.List;

/**
 * Fase 8: reporte de la carga masiva. El frontend recibe qué filas fallaron
 * y por qué, para corregir solo esas y volver a subir el archivo.
 */
public record ResultadoCarga(
        int filasLeidas,
        int equiposCreados,
        List<ErrorFila> errores
) {

    public static ResultadoCarga vacia() {
        return new ResultadoCarga(0, 0, new ArrayList<>());
    }

    /** Resultado de procesar una fila con éxito. */
    public static ResultadoCarga conExito(ResultadoCarga anterior) {
        return new ResultadoCarga(anterior.filasLeidas() + 1, anterior.equiposCreados() + 1, anterior.errores());
    }

    /** Resultado de procesar una fila con error. */
    public static ResultadoCarga conError(ResultadoCarga anterior, int fila, String serial, String motivo) {
        List<ErrorFila> errores = new ArrayList<>(anterior.errores());
        errores.add(new ErrorFila(fila, serial, motivo));
        return new ResultadoCarga(anterior.filasLeidas() + 1, anterior.equiposCreados(), errores);
    }

    /** Error de una fila: número de fila (1-based, encabezado = fila 1) y motivo. */
    public record ErrorFila(int fila, String serial, String motivo) {
    }
}
