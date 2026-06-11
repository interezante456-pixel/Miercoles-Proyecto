package com.tienda.backend.service;

import com.tienda.backend.dto.request.CompraRequest;
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
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioRepository inventarioRepository;

    @Transactional(readOnly = true)
    public List<Compra> findAll() { return compraRepository.findAll(); }

    @Transactional(readOnly = true)
    public Compra findById(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada: " + id));
    }

    @Transactional
    public Compra crearCompra(CompraRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Proveedor proveedor = proveedorRepository.findById(request.getProveedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + request.getProveedorId()));

        List<DetalleCompra> detalles = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CompraRequest.DetalleCompraRequest d : request.getDetalles()) {
            Producto producto = productoRepository.findById(d.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + d.getProductoId()));

            BigDecimal sub = d.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(d.getCantidad()))
                    .setScale(2, RoundingMode.HALF_UP);

            DetalleCompra detalle = DetalleCompra.builder()
                    .producto(producto)
                    .cantidad(d.getCantidad())
                    .precioUnitario(d.getPrecioUnitario())
                    .subtotal(sub)
                    .build();
            detalles.add(detalle);
            subtotal = subtotal.add(sub);
        }

        BigDecimal igv = subtotal.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(igv);

        String numeroCompra = generarNumero();

        Compra compra = Compra.builder()
                .numeroCompra(numeroCompra)
                .estado(Compra.EstadoCompra.PENDIENTE)
                .proveedor(proveedor)
                .usuario(usuario)
                .subtotal(subtotal)
                .igv(igv)
                .total(total)
                .observaciones(request.getObservaciones())
                .fechaEsperada(request.getFechaEsperada())
                .build();

        for (DetalleCompra d : detalles) {
            d.setCompra(compra);
            compra.getDetalles().add(d);
        }

        return compraRepository.save(compra);
    }

    @Transactional
    public Compra recibirCompra(Long id) {
        Compra compra = findById(id);
        if (compra.getEstado() != Compra.EstadoCompra.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden recibir compras PENDIENTES");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Aumentar stock y registrar movimiento
        for (DetalleCompra d : compra.getDetalles()) {
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
                    .motivo("Recepción compra " + compra.getNumeroCompra())
                    .referenciaId(compra.getId())
                    .referenciaTipo("COMPRA")
                    .producto(p)
                    .usuario(usuario)
                    .build();
            inventarioRepository.save(mov);
        }

        compra.setEstado(Compra.EstadoCompra.RECIBIDA);
        return compraRepository.save(compra);
    }

    private String generarNumero() {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        long count = compraRepository.count() + 1;
        return "C-" + fecha + "-" + String.format("%04d", count);
    }
}
