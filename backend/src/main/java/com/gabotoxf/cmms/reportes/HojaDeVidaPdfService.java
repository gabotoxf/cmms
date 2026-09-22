package com.gabotoxf.cmms.reportes;

import com.gabotoxf.cmms.common.ClockConfig;
import com.gabotoxf.cmms.equipo.Equipo;
import com.gabotoxf.cmms.equipo.EquipoNoEncontradoException;
import com.gabotoxf.cmms.equipo.EquipoRepository;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimiento;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimientoRepository;
import com.gabotoxf.cmms.mantenimiento.RegistroMantenimiento;
import com.gabotoxf.cmms.mantenimiento.RegistroMantenimientoRepository;
import com.gabotoxf.cmms.orden.OrdenTrabajo;
import com.gabotoxf.cmms.orden.OrdenTrabajoRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.HeaderFooter;
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
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Fase 6: genera la hoja de vida de un equipo en PDF (historial completo:
 * datos del equipo, plan preventivo, ejecuciones y órdenes de trabajo).
 * Es el documento que exige la trazabilidad de la Resolución 3100 de 2019.
 */
@Service
public class HojaDeVidaPdfService {

    private static final Font FUENTE_TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font FUENTE_SECCION = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font FUENTE_NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 9);
    private static final Font FUENTE_CELDA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
    private static final java.awt.Color COLOR_SECCION = new java.awt.Color(235, 240, 245);

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final EquipoRepository equipoRepository;
    private final PlanMantenimientoRepository planRepository;
    private final RegistroMantenimientoRepository registroRepository;
    private final OrdenTrabajoRepository ordenRepository;
    private final Clock clock;

    public HojaDeVidaPdfService(EquipoRepository equipoRepository,
                                PlanMantenimientoRepository planRepository,
                                RegistroMantenimientoRepository registroRepository,
                                OrdenTrabajoRepository ordenRepository,
                                Clock clock) {
        this.equipoRepository = equipoRepository;
        this.planRepository = planRepository;
        this.registroRepository = registroRepository;
        this.ordenRepository = ordenRepository;
        this.clock = clock;
    }

    /**
     * Genera el PDF en memoria (byte[]). El controller lo entrega como descarga.
     * readOnly: solo consulta datos, nunca escribe.
     */
    @Transactional(readOnly = true)
    public byte[] generar(Long equipoId) {
        Equipo equipo = equipoRepository.findById(equipoId)
                .orElseThrow(() -> new EquipoNoEncontradoException(equipoId));

        PlanMantenimiento plan = planRepository.findByEquipoId(equipoId).orElse(null);
        List<RegistroMantenimiento> registros = (plan != null)
                ? registroRepository.findByPlanIdOrderByFechaEjecucionDesc(plan.getId())
                : List.of();
        List<OrdenTrabajo> ordenes = ordenRepository.findByEquipoIdOrderByFechaProgramadaDesc(equipoId);

        Document documento = new Document(PageSize.LETTER, 36, 36, 48, 48);
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream()) {
            PdfWriter.getInstance(documento, salida);
            documento.addCreationDate();
            documento.setFooter(new HeaderFooter(
                    new Phrase("CMMS - Hoja de vida - " + equipo.getSerial(), FUENTE_NORMAL), false));

            documento.open();

            documento.add(new Paragraph("HOJA DE VIDA DEL EQUIPO", FUENTE_TITULO));
            Paragraph contexto = new Paragraph(
                    "Sistema de gestión de mantenimiento - Resolución 3100 de 2019 (habilitación de servicios de salud)",
                    FUENTE_NORMAL);
            contexto.setSpacingAfter(12);
            documento.add(contexto);

            // ===== Datos del equipo =====
            agregarSeccion(documento, "1. Datos del equipo");
            PdfPTable datos = new PdfPTable(2);
            datos.setWidthPercentage(100f);
            filaClaveValor(datos, "Serial", equipo.getSerial());
            filaClaveValor(datos, "Nombre", equipo.getNombre());
            filaClaveValor(datos, "Marca", equipo.getMarca());
            filaClaveValor(datos, "Modelo", equipo.getModelo());
            filaClaveValor(datos, "Ubicación", equipo.getUbicacion());
            filaClaveValor(datos, "Clasificación de riesgo (Res. 3100)", equipo.getClasificacionRiesgo().name());
            filaClaveValor(datos, "Fecha de adquisición",
                    equipo.getFechaAdquisicion() != null ? equipo.getFechaAdquisicion().format(FECHA) : "-");
            filaClaveValor(datos, "Periodicidad de mantenimiento",
                    equipo.getPeriodicidadMantenimientoDias() + " días");
            filaClaveValor(datos, "Estado", equipo.getEstado().name());
            documento.add(datos);

            // ===== Plan de mantenimiento preventivo =====
            agregarSeccion(documento, "2. Plan de mantenimiento preventivo");
            if (plan == null) {
                documento.add(new Paragraph("(El equipo no tiene plan de mantenimiento registrado)", FUENTE_NORMAL));
            } else {
                PdfPTable tablaPlan = new PdfPTable(2);
                tablaPlan.setWidthPercentage(100f);
                filaClaveValor(tablaPlan, "Frecuencia", plan.getFrecuenciaDias() + " días");
                filaClaveValor(tablaPlan, "Última ejecución",
                        plan.getUltimaEjecucion() != null ? plan.getUltimaEjecucion().format(FECHA) : "-");
                filaClaveValor(tablaPlan, "Próxima fecha", plan.getProximaFecha().format(FECHA));
                documento.add(tablaPlan);

                agregarSeccion(documento, "3. Historial de ejecuciones del plan");
                if (registros.isEmpty()) {
                    documento.add(new Paragraph("(Sin ejecuciones registradas)", FUENTE_NORMAL));
                } else {
                    PdfPTable tablaRegistros = new PdfPTable(new float[]{2f, 3f, 7f});
                    tablaRegistros.setWidthPercentage(100f);
                    encabezado(tablaRegistros, "Fecha", "Técnico", "Descripción");
                    for (RegistroMantenimiento r : registros.stream().limit(10).toList()) {
                        tablaRegistros.addCell(celda(r.getFechaEjecucion().format(FECHA), FUENTE_NORMAL, false));
                        tablaRegistros.addCell(celda(nulo(r.getTecnico()), FUENTE_NORMAL, false));
                        tablaRegistros.addCell(celda(nulo(r.getDescripcion()), FUENTE_NORMAL, false));
                    }
                    documento.add(tablaRegistros);
                }
            }

            // ===== Órdenes de trabajo =====
            agregarSeccion(documento, "4. Órdenes de trabajo");
            if (ordenes.isEmpty()) {
                documento.add(new Paragraph("(Sin órdenes de trabajo registradas)", FUENTE_NORMAL));
            } else {
                PdfPTable tablaOrdenes = new PdfPTable(new float[]{1.2f, 2.2f, 2f, 2f, 2.4f, 5f});
                tablaOrdenes.setWidthPercentage(100f);
                encabezado(tablaOrdenes, "Orden", "Tipo", "Estado", "Programada", "Completada", "Título");
                for (OrdenTrabajo o : ordenes) {
                    tablaOrdenes.addCell(celda("#" + o.getId(), FUENTE_NORMAL, false));
                    tablaOrdenes.addCell(celda(o.getTipo().name(), FUENTE_NORMAL, false));
                    tablaOrdenes.addCell(celda(o.getEstado().name(), FUENTE_NORMAL, false));
                    tablaOrdenes.addCell(celda(o.getFechaProgramada().format(FECHA), FUENTE_NORMAL, false));
                    tablaOrdenes.addCell(celda(
                            o.getCompletadaEn() != null
                                    ? o.getCompletadaEn().atZone(ClockConfig.ZONA).format(FECHA_HORA)
                                    : "-",
                            FUENTE_NORMAL, false));
                    tablaOrdenes.addCell(celda(nulo(o.getTitulo()), FUENTE_NORMAL, false));
                }
                documento.add(tablaOrdenes);
            }

            ZonedDateTime generado = ZonedDateTime.now(clock).withZoneSameInstant(ClockConfig.ZONA);
            documento.add(new Paragraph(" "));
            documento.add(new Paragraph("Documento generado el " + generado.format(FECHA_HORA)
                    + " por el CMMS.", FUENTE_NORMAL));

            documento.close();
            return salida.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo generar la hoja de vida del equipo " + equipoId, ex);
        }
    }

    // ===== Helpers de construcción =====

    private void agregarSeccion(Document documento, String titulo) throws Exception {
        Paragraph p = new Paragraph(titulo, FUENTE_SECCION);
        p.setSpacingBefore(14);
        p.setSpacingAfter(6);
        documento.add(p);
    }

    private void filaClaveValor(PdfPTable tabla, String clave, String valor) {
        tabla.addCell(celda(clave, FUENTE_CELDA, true));
        tabla.addCell(celda(nulo(valor), FUENTE_NORMAL, false));
    }

    private void encabezado(PdfPTable tabla, String... titulos) {
        for (String titulo : titulos) {
            tabla.addCell(celda(titulo, FUENTE_CELDA, true));
        }
    }

    private PdfPCell celda(String texto, Font fuente, boolean fondo) {
        PdfPCell celda = new PdfPCell(new Phrase(texto, fuente));
        celda.setPadding(4);
        if (fondo) {
            celda.setBackgroundColor(COLOR_SECCION);
        }
        return celda;
    }

    private String nulo(String valor) {
        return (valor == null || valor.isBlank()) ? "-" : valor;
    }
}
