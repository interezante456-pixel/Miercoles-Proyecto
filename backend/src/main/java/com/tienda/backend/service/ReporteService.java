package com.tienda.backend.service;

import com.tienda.backend.entity.Venta;
import com.tienda.backend.entity.DetalleVenta;
import com.tienda.backend.entity.Producto;
import com.tienda.backend.repository.ProductoRepository;
import com.tienda.backend.repository.VentaRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    // Paleta de colores
    private static final BaseColor COLOR_HEADER = new BaseColor(99, 102, 241);    // Índigo
    private static final BaseColor COLOR_SUBHEADER = new BaseColor(30, 41, 59);   // Slate 800
    private static final BaseColor COLOR_ROW_ALT = new BaseColor(241, 245, 249);  // Slate 100
    private static final Font FONT_TITLE = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.WHITE);
    private static final Font FONT_HEADER = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
    private static final Font FONT_BODY = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.DARK_GRAY);
    private static final Font FONT_BOLD = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.DARK_GRAY);

    public byte[] generarReporteVentas() throws DocumentException {
        List<Venta> ventas = ventaRepository.findAll();

        Document doc = new Document(PageSize.A4.rotate(), 30, 30, 40, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Header
        agregarHeader(doc, "REPORTE DE VENTAS");

        // Tabla
        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setSpacingBefore(15f);
        float[] widths = {1f, 1.5f, 2f, 2f, 1.2f, 1.2f, 1.2f, 1.5f};
        table.setWidths(widths);

        String[] headers = {"#", "N° Venta", "Cliente", "Usuario", "Subtotal", "IGV", "Total", "Estado"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FONT_HEADER));
            cell.setBackgroundColor(COLOR_HEADER);
            cell.setPadding(6f);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        int i = 1;
        for (Venta v : ventas) {
            BaseColor bg = (i % 2 == 0) ? COLOR_ROW_ALT : BaseColor.WHITE;
            addCell(table, String.valueOf(i++), bg, Element.ALIGN_CENTER);
            addCell(table, v.getNumeroVenta(), bg, Element.ALIGN_CENTER);
            addCell(table, v.getCliente().getNombres() + " " + v.getCliente().getApellidos(), bg, Element.ALIGN_LEFT);
            addCell(table, v.getUsuario().getNombre() + " " + v.getUsuario().getApellido(), bg, Element.ALIGN_LEFT);
            addCell(table, "S/ " + v.getSubtotal(), bg, Element.ALIGN_RIGHT);
            addCell(table, "S/ " + v.getIgv(), bg, Element.ALIGN_RIGHT);
            addCell(table, "S/ " + v.getTotal(), bg, Element.ALIGN_RIGHT);
            addCell(table, v.getEstado().name(), bg, Element.ALIGN_CENTER);
        }

        doc.add(table);
        agregarFooter(doc, "Total ventas: " + ventas.size());
        doc.close();
        return out.toByteArray();
    }

    public byte[] generarReporteInventario() throws DocumentException {
        List<Producto> productos = productoRepository.findAll();

        Document doc = new Document(PageSize.A4, 30, 30, 40, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();

        agregarHeader(doc, "REPORTE DE INVENTARIO");

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setSpacingBefore(15f);
        float[] widths = {1.5f, 2f, 2f, 1.2f, 1.2f, 1.2f, 1.5f};
        table.setWidths(widths);

        String[] headers = {"Código", "Nombre", "Categoría", "Stock Act.", "Stock Mín.", "P. Venta", "Estado"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FONT_HEADER));
            cell.setBackgroundColor(COLOR_HEADER);
            cell.setPadding(6f);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        int i = 1;
        for (Producto p : productos) {
            BaseColor bg = (i++ % 2 == 0) ? COLOR_ROW_ALT : BaseColor.WHITE;
            boolean stockBajo = p.getStockActual() <= p.getStockMinimo();
            addCell(table, p.getCodigo(), bg, Element.ALIGN_CENTER);
            addCell(table, p.getNombre(), bg, Element.ALIGN_LEFT);
            addCell(table, p.getCategoria().getNombre(), bg, Element.ALIGN_LEFT);
            addCell(table, String.valueOf(p.getStockActual()), stockBajo ? new BaseColor(254, 226, 226) : bg, Element.ALIGN_CENTER);
            addCell(table, String.valueOf(p.getStockMinimo()), bg, Element.ALIGN_CENTER);
            addCell(table, "S/ " + p.getPrecioVenta(), bg, Element.ALIGN_RIGHT);
            addCell(table, stockBajo ? "STOCK BAJO" : "OK", stockBajo ? new BaseColor(254, 226, 226) : bg, Element.ALIGN_CENTER);
        }

        doc.add(table);
        agregarFooter(doc, "Total productos: " + productos.size());
        doc.close();
        return out.toByteArray();
    }

    private void agregarHeader(Document doc, String titulo) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase(titulo, FONT_TITLE));
        cell.setBackgroundColor(COLOR_SUBHEADER);
        cell.setPadding(12f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorder(Rectangle.NO_BORDER);
        headerTable.addCell(cell);
        doc.add(headerTable);
    }

    private void agregarFooter(Document doc, String texto) throws DocumentException {
        Paragraph footer = new Paragraph(texto, FONT_BOLD);
        footer.setSpacingBefore(10f);
        footer.setAlignment(Element.ALIGN_RIGHT);
        doc.add(footer);
    }

    private void addCell(PdfPTable table, String text, BaseColor bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_BODY));
        cell.setBackgroundColor(bg);
        cell.setPadding(5f);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }
}
