package com.gabotoxf.cmms.reportes;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

/**
 * Fase 6: descarga de reportes en PDF.
 * Se devuelve el binario con Content-Disposition: attachment para que el
 * navegador lo descargue (los clientes API lo consumen como byte stream).
 */
@RestController
@RequestMapping("/api/reportes")
@Tag(name = "Reportes", description = "Documentos PDF: hoja de vida y certificado de cumplimiento (Res. 3100)")
@PreAuthorize("isAuthenticated()")
public class ReportesController {

    private final HojaDeVidaPdfService hojaDeVidaService;
    private final CertificadoCumplimientoPdfService certificadoService;

    public ReportesController(HojaDeVidaPdfService hojaDeVidaService,
                              CertificadoCumplimientoPdfService certificadoService) {
        this.hojaDeVidaService = hojaDeVidaService;
        this.certificadoService = certificadoService;
    }

    @GetMapping("/equipos/{id}/hoja-de-vida")
    @Operation(summary = "Descarga la hoja de vida del equipo en PDF (historial completo)")
    public ResponseEntity<byte[]> hojaDeVida(@PathVariable Long id) {
        byte[] pdf = hojaDeVidaService.generar(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, adjunto("hoja-de-vida-" + id + ".pdf"))
                .body(pdf);
    }

    @GetMapping("/certificado-cumplimiento")
    @Operation(summary = "Descarga el certificado de cumplimiento de mantenimientos (parque completo o un equipo)")
    public ResponseEntity<byte[]> certificado(@RequestParam(required = false) Long equipoId) {
        byte[] pdf = certificadoService.generar(equipoId);
        String nombre = (equipoId != null) ? "certificado-cumplimiento-equipo-" + equipoId + ".pdf"
                : "certificado-cumplimiento-parque.pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, adjunto(nombre))
                .body(pdf);
    }

    private String adjunto(String nombreArchivo) {
        return ContentDisposition.attachment()
                .filename(nombreArchivo, StandardCharsets.UTF_8)
                .build()
                .toString();
    }
}
