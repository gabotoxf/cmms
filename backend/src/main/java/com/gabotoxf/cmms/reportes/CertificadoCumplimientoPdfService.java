package com.gabotoxf.cmms.reportes;

import com.gabotoxf.cmms.common.ClockConfig;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.mantenimiento.EstadoPlan;
import com.gabotoxf.cmms.mantenimiento.dto.PlanResponse;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimientoService;
import com.gabotoxf.cmms.orden.OrdenTrabajoRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Fase 6: certificado de cumplimiento de mantenimientos preventivos, orientado
 * a auditoría (Resolución 3100 de 2019): resume el estado del parque de equipos
 * y lista los planes vencidos o próximos a vencer a la fecha de emisión.
 */
@Service
public class CertificadoCumplimientoPdfService {

    private static final Font FUENTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font FUENTE_SECCION = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font FUENTE_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 9);
    private static final Font FUENTE_CELDA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
    private static final java.awt.Color COLOR_SECCION = new java.awt.Color(235, 240, 245);

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final PlanMantenimientoService planService;
    private final EquipoRepository equipoRepository;
    private final OrdenTrabajoRepository ordenRepository;
    private final Clock clock;

    public CertificadoCumplimientoPdfService(PlanMantenimientoService planService,
                                             EquipoRepository equipoRepository,
                                             OrdenTrabajoRepository ordenRepository,
                                             Clock clock) {
        this.planService = planService;
        this.equipoRepository = equipoRepository;
        this.ordenRepository = ordenRepository;
        this.clock = clock;
    }

    /**
     * Certificado global del parque de equipos. Si equipoId es distinto de null,
     * el certificado se emite solo para ese equipo.
     */
    @Transactional(readOnly = true)
    public byte[] generar(Long equipoId) {
        LocalDate hoy = LocalDate.now(clock);
        List<PlanResponse> pendientes = planService.pendientes(null);
        if (equipoId != null) {
            pendientes = pendientes.stream()
                    .filter(p -> p.equipoId().equals(equipoId))
                    .toList();
        }
        long vencidos = pendientes.stream().filter(p -> p.estado() == EstadoPlan.VENCIDO).count();
        long proximos = pendientes.size() - vencidos;
        long totalEquipos = equipoRepository.count();

        Document documento = new Document(PageSize.LETTER, 48, 48, 56, 48);
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            PdfWriter.getInstance(documento, salida);
            documento.open();

            documento.add(new Paragraph("CERTIFICADO DE CUMPLIMIENTO", FUENTE_TITULO));
            Paragraph subtitulo = new Paragraph(
                    "Mantenimiento preventivo de equipos biomédicos - Resolución 3100 de 2019", FUENTE_NORMAL);
            subtitulo.setSpacingAfter(12);
            documento.add(subtitulo);

            PdfPTable resumen = new PdfPTable(2);
            resumen.setWidthPercentage(100f);
            fila(resumen, "Fecha de emisión", hoy.format(FECHA));
            fila(resumen, "Alcance", equipoId != null ? "Equipo individual (id " + equipoId + ")" : "Parque completo de equipos");
            fila(resumen, "Total de equipos activos", String.valueOf(totalEquipos));
            fila(resumen, "Planes vencidos", String.valueOf(vencidos));
            fila(resumen, "Planes próximos a vencer (umbral de alerta)", String.valueOf(proximos));
            documento.add(resumen);

            documento.add(new Paragraph(" "));
            Paragraph concepto = new Paragraph(
                    "Con base en el estado de los planes de mantenimiento preventivo al " + hoy.format(FECHA)
                            + ", el sistema registra " + vencidos + " plan(es) vencido(s) y " + proximos
                            + " plan(es) próximo(s) a vencer dentro del umbral de alerta configurado.",
                    FUENTE_NORMAL);
            concepto.setSpacingAfter(10);
            documento.add(concepto);

            if (!pendientes.isEmpty()) {
                Paragraph tituloTabla = new Paragraph("Detalle de planes pendientes", FUENTE_SECCION);
                tituloTabla.setSpacingBefore(8);
                tituloTabla.setSpacingAfter(6);
                documento.add(tituloTabla);

                PdfPTable tabla = new PdfPTable(new float[]{2f, 4f, 2.2f, 2f});
                tabla.setWidthPercentage(100f);
                for (String h : new String[]{"Serial", "Equipo", "Próxima fecha", "Estado"}) {
                    PdfPCell c = new PdfPCell(new Phrase(h, FUENTE_CELDA));
                    c.setBackgroundColor(COLOR_SECCION);
                    c.setPadding(4);
                    tabla.addCell(c);
                }
                for (PlanResponse p : pendientes.stream().limit(30).toList()) {
                    tabla.addCell(celda(p.equipoSerial()));
                    tabla.addCell(celda(p.equipoNombre()));
                    tabla.addCell(celda(p.proximaFecha().format(FECHA)));
                    tabla.addCell(celda(p.estado().name()));
                }
                documento.add(tabla);
            }

            ZonedDateTime generado = ZonedDateTime.now(clock).withZoneSameInstant(ClockConfig.ZONA);
            documento.add(new Paragraph(" "));
            documento.add(new Paragraph("Documento generado el " + generado.format(FECHA_HORA)
                    + " por el CMMS. Válido para acompañamiento en procesos de auditoría interna.",
                    FUENTE_NORMAL));

            documento.close();
            return salida.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo generar el certificado de cumplimiento", ex);
        }
    }

    private void fila(PdfPTable tabla, String clave, String valor) {
        PdfPCell claveCell = new PdfPCell(new Phrase(clave, FUENTE_CELDA));
        claveCell.setBackgroundColor(COLOR_SECCION);
        claveCell.setPadding(4);
        tabla.addCell(claveCell);
        tabla.addCell(celda(valor));
    }

    private PdfPCell celda(String texto) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, FUENTE_NORMAL));
        celda.setPadding(4);
        return celda;
    }
}
