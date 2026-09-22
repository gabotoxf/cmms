package com.gabotoxf.cmms.cargamasiva;

import com.gabotoxf.cmms.equipo.ClasificacionRiesgo;
import com.gabotoxf.cmms.equipo.EstadoEquipo;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Locale;

/**
 * Fase 8: parseo y validación de una fila del archivo (CSV o Excel).
 * Devuelve un EquipoRequest ya validado o lanza IllegalArgumentException
 * con un mensaje claro en español, listo para el reporte de errores.
 */
public final class FilaEquipoParser {

    private FilaEquipoParser() {
    }

    /** Columnas esperadas: serial, nombre, marca, modelo, ubicacion, riesgo, fechaAdquisicion, periodicidadDias, estado */
    public static final String[] ENCABEZADO = {
            "serial", "nombre", "marca", "modelo", "ubicacion",
            "riesgo", "fechaAdquisicion", "periodicidadDias", "estado"
    };

    public static EquipoRequest parsear(int numeroFila, String[] celdas) {
        String[] f = normalizar(celdas);
        String serial = texto(f, 0);
        String nombre = texto(f, 1);
        String marca = opcional(f, 2);
        String modelo = opcional(f, 3);
        String ubicacion = texto(f, 4);
        String riesgo = texto(f, 5);
        String fecha = opcional(f, 6);
        String periodicidad = texto(f, 7);
        String estado = opcional(f, 8);

        if (serial == null) {
            throw error(numeroFila, "el serial es obligatorio");
        }
        if (serial.length() > 60) {
            throw error(numeroFila, "el serial no puede superar 60 caracteres");
        }
        if (nombre == null) {
            throw error(numeroFila, "el nombre es obligatorio");
        }
        if (ubicacion == null) {
            throw error(numeroFila, "la ubicación es obligatoria");
        }
        if (riesgo == null) {
            throw error(numeroFila, "la clasificación de riesgo es obligatoria (I, IIA, IIB o III)");
        }

        ClasificacionRiesgo riesgoEnum;
        try {
            riesgoEnum = ClasificacionRiesgo.valueOf(riesgo);
        } catch (IllegalArgumentException ex) {
            throw error(numeroFila, "riesgo inválido: '" + riesgo + "' (usar I, IIA, IIB o III)");
        }

        LocalDate fechaAdquisicion = null;
        if (fecha != null) {
            try {
                fechaAdquisicion = LocalDate.parse(fecha);
            } catch (DateTimeParseException ex) {
                throw error(numeroFila, "fecha de adquisición inválida: '" + fecha + "' (formato esperado: AAAA-MM-DD)");
            }
        }

        Integer periodicidadDias;
        try {
            periodicidadDias = Integer.valueOf(periodicidad);
        } catch (NumberFormatException ex) {
            throw error(numeroFila, "periodicidad inválida: '" + periodicidad + "' (debe ser un número de días)");
        }
        if (periodicidadDias < 1) {
            throw error(numeroFila, "la periodicidad debe ser de al menos 1 día");
        }

        EstadoEquipo estadoEnum = EstadoEquipo.OPERATIVO;
        if (estado != null) {
            try {
                estadoEnum = EstadoEquipo.valueOf(estado);
            } catch (IllegalArgumentException ex) {
                throw error(numeroFila, "estado inválido: '" + estado
                        + "' (usar OPERATIVO, EN_MANTENIMIENTO, FUERA_DE_SERVICIO o DADO_DE_BAJA)");
            }
        }

        return new EquipoRequest(serial, nombre, marca, modelo, ubicacion,
                riesgoEnum, fechaAdquisicion, periodicidadDias);
    }

    private static String[] normalizar(String[] celdas) {
        String[] f = new String[ENCABEZADO.length];
        for (int i = 0; i < ENCABEZADO.length; i++) {
            f[i] = (celdas != null && i < celdas.length && celdas[i] != null) ? celdas[i].trim() : null;
        }
        return f;
    }

    private static String texto(String[] f, int i) {
        String valor = f[i];
        return (valor == null || valor.isBlank()) ? null : valor;
    }

    private static String opcional(String[] f, int i) {
        return texto(f, i); // los campos opcionales se leen igual; null si vienen vacíos
    }

    private static IllegalArgumentException error(int fila, String motivo) {
        // El número de fila lo registra el reporte (ErrorFila.fila); aquí solo el motivo
        return new IllegalArgumentException(motivo);
    }
}
