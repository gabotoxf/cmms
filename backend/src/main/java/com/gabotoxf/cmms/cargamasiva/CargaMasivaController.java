package com.gabotoxf.cmms.cargamasiva;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Fase 8: subida del inventario en archivo (CSV o Excel).
 * Solo ADMIN/INGENIERO: crear equipos es una operación de inventario.
 */
@RestController
@RequestMapping("/api/equipos/carga-masiva")
@Tag(name = "Carga masiva", description = "Importación de inventario de equipos desde CSV o Excel")
@PreAuthorize("isAuthenticated()")
public class CargaMasivaController {

    private final CargaMasivaService cargaService;

    public CargaMasivaController(CargaMasivaService cargaService) {
        this.cargaService = cargaService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Importa equipos desde un archivo CSV o Excel (.xlsx)",
            description = """
                    Cada fila se procesa de forma independiente: las filas válidas se crean aunque haya errores en otras. \
                    Columnas esperadas (encabezado): serial, nombre, marca, modelo, ubicacion, riesgo, \
                    fechaAdquisicion (AAAA-MM-DD), periodicidadDias, estado. \
                    La respuesta trae el reporte de errores fila a fila.""")
    public ResultadoCarga importar(@RequestParam("archivo") MultipartFile archivo) {
        return cargaService.procesar(archivo);
    }
}
