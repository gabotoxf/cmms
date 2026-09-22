package com.gabotoxf.cmms.cargamasiva;

import com.gabotoxf.cmms.common.ReglasNegocioException;
import com.gabotoxf.cmms.equipo.SerialDuplicadoException;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

/**
 * Fase 8: carga masiva del inventario de equipos (CSV o Excel .xlsx).
 *
 * Estrategia "procesa todo lo que puedas, reporta lo que no":
 * - Cada fila se valida y se persiste independientemente (transacción propia en
 *   EquipoFilaWriter): un error de una fila no revierte las demás.
 * - La respuesta trae el reporte: filas leídas, equipos creados y la lista de
 *   errores fila a fila con su motivo, para corregir y volver a subir.
 */
@Service
public class CargaMasivaService {

    private static final Logger log = LoggerFactory.getLogger(CargaMasivaService.class);

    private static final List<String> EXTENSIONES_CSV = List.of("csv", "txt");
    private static final List<String> EXTENSIONES_EXCEL = List.of("xlsx", "xlsm");

    private final EquipoFilaWriter filaWriter;
    private final int maxFilas;
    private final long maxArchivoBytes;

    public CargaMasivaService(EquipoFilaWriter filaWriter,
                              @Value("${cmms.carga-masiva.max-filas:2000}") int maxFilas,
                              @Value("${cmms.carga-masiva.max-archivo-bytes:5242880}") long maxArchivoBytes) {
        this.filaWriter = filaWriter;
        this.maxFilas = maxFilas;
        this.maxArchivoBytes = maxArchivoBytes;
    }

    public ResultadoCarga procesar(MultipartFile archivo) {
        validarArchivo(archivo);
        String nombre = (archivo.getOriginalFilename() == null)
                ? ""
                : archivo.getOriginalFilename().toLowerCase(Locale.ROOT);
        boolean esExcel = EXTENSIONES_EXCEL.stream().anyMatch(nombre::endsWith);
        boolean esCsv = EXTENSIONES_CSV.stream().anyMatch(nombre::endsWith);

        if (!esExcel && !esCsv) {
            throw new ReglasNegocioException(
                    "Formato no soportado: sube un archivo .csv o .xlsx (nombre detectado: " + nombre + ")");
        }

        try {
            ResultadoCarga resultado = esExcel ? procesarExcel(archivo) : procesarCsv(archivo);
            log.info("Carga masiva: {} filas leídas, {} equipos creados, {} errores",
                    resultado.filasLeidas(), resultado.equiposCreados(), resultado.errores().size());
            return resultado;
        } catch (IOException ex) {
            throw new ReglasNegocioException("No se pudo leer el archivo: " + ex.getMessage());
        }
    }

    // ===== Lectura de archivos =====

    private ResultadoCarga procesarCsv(MultipartFile archivo) throws IOException {
        CSVFormat formato = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreEmptyLines(true)
                .setTrim(true)
                .build();

        ResultadoCarga resultado = ResultadoCarga.vacia();
        try (BufferedReader lector = new BufferedReader(
                new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8))) {
            int numero = 1; // la fila 1 es el encabezado
            for (CSVRecord record : formato.parse(lector)) {
                numero++;
                if (registrosLeidos(resultado) >= maxFilas) {
                    throw new ReglasNegocioException(
                            "El archivo supera el máximo de " + maxFilas + " filas");
                }
                String[] celdas = new String[FilaEquipoParser.ENCABEZADO.length];
                for (int i = 0; i < celdas.length; i++) {
                    celdas[i] = (i < record.size()) ? record.get(i) : null;
                }
                resultado = procesarFila(resultado, numero, celdas);
            }
        }
        return resultado;
    }

    private ResultadoCarga procesarExcel(MultipartFile archivo) throws IOException {
        ResultadoCarga resultado = ResultadoCarga.vacia();
        try (Workbook workbook = new XSSFWorkbook(archivo.getInputStream())) {
            Sheet hoja = workbook.getSheetAt(0);
            int ultimaFila = hoja.getLastRowNum();
            if (ultimaFila > maxFilas) {
                throw new ReglasNegocioException(
                        "El archivo supera el máximo de " + maxFilas + " filas");
            }
            for (int i = 1; i <= ultimaFila; i++) { // la fila 0 de POI es el encabezado
                Row fila = hoja.getRow(i);
                if (fila == null) {
                    continue;
                }
                String[] celdas = new String[FilaEquipoParser.ENCABEZADO.length];
                for (int c = 0; c < celdas.length; c++) {
                    celdas[c] = textoCelda(fila.getCell(c));
                }
                resultado = procesarFila(resultado, i + 1, celdas);
            }
        }
        return resultado;
    }

    /** Contador de filas ya procesadas (leídas con o sin éxito). */
    private int registrosLeidos(ResultadoCarga resultado) {
        return resultado.filasLeidas();
    }

    /** Extrae el texto de una celda de Excel de forma tolerante (texto, número, fecha o fórmula). */
    private String textoCelda(Cell celda) {
        if (celda == null) {
            return null;
        }
        return switch (celda.getCellType()) {
            case STRING -> celda.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(celda)) {
                    yield celda.getLocalDateTimeCellValue().toLocalDate().toString(); // AAAA-MM-DD
                }
                double valor = celda.getNumericCellValue();
                yield (valor == Math.floor(valor) && !Double.isInfinite(valor))
                        ? String.valueOf((long) valor)
                        : String.valueOf(valor);
            }
            case FORMULA -> celda.getCellFormula();
            case BOOLEAN -> String.valueOf(celda.getBooleanCellValue());
            case BLANK, _NONE -> null;
            case ERROR -> null; // celda corrupta: se trata como vacía y la validación de la fila reporta el motivo
        };
    }

    // ===== Procesamiento fila a fila =====

    private ResultadoCarga procesarFila(ResultadoCarga acumulado, int numeroFila, String[] celdas) {
        if (esFilaVacia(celdas)) {
            return acumulado; // las filas en blanco no cuentan ni fallan
        }
        try {
            EquipoRequest request = FilaEquipoParser.parsear(numeroFila, celdas);
            filaWriter.guardar(request);
            return ResultadoCarga.conExito(acumulado);
        } catch (SerialDuplicadoException ex) {
            return ResultadoCarga.conError(acumulado, numeroFila, serialDe(celdas), ex.getMessage());
        } catch (IllegalArgumentException ex) {
            // Mensajes de validación de FilaEquipoParser (motivo puro, sin prefijo de fila)
            return ResultadoCarga.conError(acumulado, numeroFila, serialDe(celdas), ex.getMessage());
        }
    }

    /** Serial de la fila (primera columna), para identificarla en el reporte de errores. */
    private String serialDe(String[] celdas) {
        return (celdas != null && celdas.length > 0 && celdas[0] != null) ? celdas[0].trim() : null;
    }

    private boolean esFilaVacia(String[] celdas) {
        return celdas == null || java.util.Arrays.stream(celdas).allMatch(c -> c == null || c.isBlank());
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ReglasNegocioException("El archivo está vacío");
        }
        if (archivo.getSize() > maxArchivoBytes) {
            throw new ReglasNegocioException(
                    "El archivo supera el tamaño máximo de " + (maxArchivoBytes / 1024 / 1024) + " MB");
        }
    }
}
