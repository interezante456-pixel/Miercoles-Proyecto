package com.tienda.backend.service;

import com.tienda.backend.dto.request.VentaRequest;
import com.tienda.backend.entity.*;
import com.tienda.backend.exception.ResourceNotFoundException;
import com.tienda.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioRepository inventarioRepository;

    @Transactional(readOnly = true)
    public List<Venta> findAll() {
        return ventaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Venta findById(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + id));
    }

    @Transactional
    public Venta registrarVenta(VentaRequest request) {
        // Obtener usuario autenticado
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + request.getClienteId()));

        // Construir detalles y calcular totales
        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (VentaRequest.DetalleVentaRequest d : request.getDetalles()) {
            Producto producto = productoRepository.findById(d.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + d.getProductoId()));

            if (producto.getStockActual() < d.getCantidad()) {
                throw new IllegalStateException("Stock insuficiente para: " + producto.getNombre()
                        + ". Disponible: " + producto.getStockActual());
            }

            BigDecimal descPct = d.getDescuento() != null ? d.getDescuento() : BigDecimal.ZERO;
            BigDecimal factor = BigDecimal.ONE.subtract(descPct.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            BigDecimal subDet = d.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(d.getCantidad()))
                    .multiply(factor)
                    .setScale(2, RoundingMode.HALF_UP);

            DetalleVenta detalle = DetalleVenta.builder()
                    .producto(producto)
                    .cantidad(d.getCantidad())
                    .precioUnitario(d.getPrecioUnitario())
                    .descuento(descPct)
                    .subtotal(subDet)
                    .build();
            detalles.add(detalle);
            subtotal = subtotal.add(subDet);
        }

        BigDecimal igv = subtotal.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(igv);

        // Generar número de venta
        String numeroVenta = generarNumero("V");

        Venta venta = Venta.builder()
                .numeroVenta(numeroVenta)
                .tipoComprobante(Venta.TipoComprobante.valueOf(request.getTipoComprobante()))
                .estado(Venta.EstadoVenta.COMPLETADA)
                .cliente(cliente)
                .usuario(usuario)
                .subtotal(subtotal)
                .igv(igv)
                .total(total)
                .observaciones(request.getObservaciones())
                .build();

        // Relacionar detalles con venta
        for (DetalleVenta d : detalles) {
            d.setVenta(venta);
            venta.getDetalles().add(d);
        }

        Venta ventaGuardada = ventaRepository.save(venta);

        // Descontar stock y registrar movimiento de inventario
        for (DetalleVenta d : detalles) {
            Producto p = d.getProducto();
            int stockAnterior = p.getStockActual();
            int stockNuevo = stockAnterior - d.getCantidad();
            p.setStockActual(stockNuevo);
            productoRepository.save(p);

            Inventario mov = Inventario.builder()
                    .tipo(Inventario.TipoMovimiento.SALIDA)
                    .cantidad(d.getCantidad())
                    .stockAnterior(stockAnterior)
                    .stockNuevo(stockNuevo)
                    .motivo("Venta " + ventaGuardada.getNumeroVenta())
                    .referenciaId(ventaGuardada.getId())
                    .referenciaTipo("VENTA")
                    .producto(p)
                    .usuario(usuario)
                    .build();
            inventarioRepository.save(mov);
        }

        return ventaGuardada;
    }

    @Transactional
    public Venta anularVenta(Long id) {
        Venta venta = findById(id);
        if (venta.getEstado() == Venta.EstadoVenta.ANULADA) {
            throw new IllegalStateException("La venta ya está anulada");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Revertir stock
        for (DetalleVenta d : venta.getDetalles()) {
            Producto p = d.getProducto();
            int stockAnterior = p.getStockActual();
            int stockNuevo = stockAnterior + d.getCantidad();
            p.setStockActual(stockNuevo);
            productoRepository.save(p);

            Inventario mov = Inventario.builder()
                    .tipo(Inventario.TipoMovimiento.ENTRADA)
                    .cantidad(d.getCantidad())
                    .stockAnterior(stockAnterior)
                    .stockNuevo(stockNuevo)
                    .motivo("Anulación venta " + venta.getNumeroVenta())
                    .referenciaId(venta.getId())
                    .referenciaTipo("VENTA")
                    .producto(p)
                    .usuario(usuario)
                    .build();
            inventarioRepository.save(mov);
        }

        venta.setEstado(Venta.EstadoVenta.ANULADA);
        return ventaRepository.save(venta);
    }

    private String generarNumero(String prefijo) {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = ventaRepository.count() + 1;
        return prefijo + "-" + fecha + "-" + String.format("%04d", count);
    }
}
