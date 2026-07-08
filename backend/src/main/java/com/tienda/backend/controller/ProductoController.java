package com.tienda.backend.controller;

import com.tienda.backend.entity.Producto;
import com.tienda.backend.dto.request.ProductoRequest;
import com.tienda.backend.entity.Almacen;
import com.tienda.backend.entity.Categoria;
import com.tienda.backend.exception.ResourceNotFoundException;
import com.tienda.backend.repository.AlmacenRepository;
import com.tienda.backend.repository.CategoriaRepository;
import com.tienda.backend.repository.ProductoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final AlmacenRepository almacenRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Page<Producto>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String q) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by("nombre").ascending());
        Page<Producto> productos;
        if (q != null && !q.isBlank()) {
            productos = productoRepository.buscarPaginado(q.trim(), pageable);
        } else {
            productos = productoRepository.findByActivoTrue(pageable);
        }
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/todos")
    public ResponseEntity<List<Producto>> listarTodos() {
        List<Producto> productos = productoRepository.findByActivoTrue();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscar(@RequestParam String q) {
        List<Producto> productos = productoRepository.buscar(q);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<Map<String, Long>> stockBajo() {
        long count = productoRepository.countProductosStockBajo();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> findById(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        return ResponseEntity.ok(producto);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACENERO')")
    public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        Almacen almacen = request.getAlmacenId() != null
                ? almacenRepository.findById(request.getAlmacenId()).orElse(null) : null;

        Producto producto = Producto.builder()
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .precioCompra(request.getPrecioCompra())
                .precioVenta(request.getPrecioVenta())
                .stockActual(request.getStockActual())
                .stockMinimo(request.getStockMinimo())
                .imagenUrl(request.getImagenUrl())
                .codigoBarras(request.getCodigoBarras())
                .unidadMedida(request.getUnidadMedida())
                .moneda(request.getMoneda())
                .categoria(categoria)
                .almacen(almacen)
                .activo(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(productoRepository.save(producto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACENERO')")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        Almacen almacen = request.getAlmacenId() != null
                ? almacenRepository.findById(request.getAlmacenId()).orElse(null) : null;

        producto.setCodigo(request.getCodigo());
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecioCompra(request.getPrecioCompra());
        producto.setPrecioVenta(request.getPrecioVenta());
        producto.setStockActual(request.getStockActual());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setImagenUrl(request.getImagenUrl());
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setUnidadMedida(request.getUnidadMedida());
        producto.setMoneda(request.getMoneda());
        producto.setCategoria(categoria);
        producto.setAlmacen(almacen);

        return ResponseEntity.ok(productoRepository.save(producto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        producto.setActivo(false);
        productoRepository.save(producto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/importar")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACENERO')")
    public ResponseEntity<List<Producto>> importar(@RequestBody List<ProductoRequest> requests) {
        List<Producto> importados = new ArrayList<>();
        for (ProductoRequest req : requests) {
            Categoria categoria;
            if (req.getCategoriaNombre() != null && !req.getCategoriaNombre().trim().isEmpty()) {
                categoria = categoriaRepository.findByNombre(req.getCategoriaNombre().trim())
                        .orElseGet(() -> categoriaRepository.save(
                                Categoria.builder()
                                        .nombre(req.getCategoriaNombre().trim())
                                        .descripcion("Categoría creada por importación")
                                        .activo(true)
                                        .build()
                        ));
            } else {
                categoria = categoriaRepository.findByNombre("Sin Categoría")
                        .orElseGet(() -> categoriaRepository.save(
                                Categoria.builder()
                                        .nombre("Sin Categoría")
                                        .activo(true)
                                        .build()
                        ));
            }

            Optional<Producto> existente = productoRepository.findByCodigo(req.getCodigo().trim());
            Producto producto;

            if (existente.isPresent()) {
                producto = existente.get();
                if (req.getNombre() != null) producto.setNombre(req.getNombre().trim());
                if (req.getDescripcion() != null) producto.setDescripcion(req.getDescripcion().trim());
                producto.setPrecioCompra(req.getPrecioCompra());
                producto.setPrecioVenta(req.getPrecioVenta());
                if (req.getStockActual() != null) producto.setStockActual(req.getStockActual());
                if (req.getStockMinimo() != null) producto.setStockMinimo(req.getStockMinimo());
                if (req.getImagenUrl() != null) producto.setImagenUrl(req.getImagenUrl().trim());
                if (req.getCodigoBarras() != null) producto.setCodigoBarras(req.getCodigoBarras().trim());
                if (req.getUnidadMedida() != null) producto.setUnidadMedida(req.getUnidadMedida().trim());
                if (req.getMoneda() != null) producto.setMoneda(req.getMoneda().trim());
                producto.setCategoria(categoria);
            } else {
                producto = Producto.builder()
                        .codigo(req.getCodigo().trim())
                        .nombre(req.getNombre().trim())
                        .descripcion(req.getDescripcion() != null ? req.getDescripcion().trim() : null)
                        .precioCompra(req.getPrecioCompra() != null ? req.getPrecioCompra() : java.math.BigDecimal.ZERO)
                        .precioVenta(req.getPrecioVenta() != null ? req.getPrecioVenta() : java.math.BigDecimal.ZERO)
                        .stockActual(req.getStockActual() != null ? req.getStockActual() : 0)
                        .stockMinimo(req.getStockMinimo() != null ? req.getStockMinimo() : 5)
                        .imagenUrl(req.getImagenUrl() != null ? req.getImagenUrl().trim() : null)
                        .codigoBarras(req.getCodigoBarras() != null ? req.getCodigoBarras().trim() : null)
                        .unidadMedida(req.getUnidadMedida() != null && !req.getUnidadMedida().trim().isEmpty() ? req.getUnidadMedida().trim() : "UNIDADES")
                        .moneda(req.getMoneda() != null && !req.getMoneda().trim().isEmpty() ? req.getMoneda().trim() : "PEN")
                        .categoria(categoria)
                        .activo(true)
                        .build();
            }
            importados.add(productoRepository.save(producto));
        }
        return ResponseEntity.ok(importados);
    }

    @DeleteMapping("/hard-purge")
    @PreAuthorize("hasRole('ADMIN')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, String>> hardPurge() {
        // Ejecutar borrado en cascada nativo para todos los productos con activo = false
        // 1. Borrar inventario
        int invDeleted = jdbcTemplate.update("DELETE FROM inventario WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)");
        
        // 2. Obtener IDs de ventas y compras afectadas
        java.util.List<Long> ventasAfectadas = jdbcTemplate.queryForList("SELECT DISTINCT venta_id FROM detalle_ventas WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)", Long.class);
        java.util.List<Long> comprasAfectadas = jdbcTemplate.queryForList("SELECT DISTINCT compra_id FROM detalle_compras WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)", Long.class);
        
        // 3. Borrar detalles
        int detVentasDeleted = jdbcTemplate.update("DELETE FROM detalle_ventas WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)");
        int detComprasDeleted = jdbcTemplate.update("DELETE FROM detalle_compras WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)");
        
        // 4. Borrar ventas y compras vacías (opcional, pero el usuario pidió borrarlas)
        int ventasDeleted = 0;
        if (!ventasAfectadas.isEmpty()) {
            String inSql = String.join(",", java.util.Collections.nCopies(ventasAfectadas.size(), "?"));
            jdbcTemplate.update("DELETE FROM detalle_ventas WHERE venta_id IN (" + inSql + ")", ventasAfectadas.toArray());
            ventasDeleted = jdbcTemplate.update("DELETE FROM ventas WHERE id IN (" + inSql + ")", ventasAfectadas.toArray());
        }
        
        int comprasDeleted = 0;
        if (!comprasAfectadas.isEmpty()) {
            String inSql = String.join(",", java.util.Collections.nCopies(comprasAfectadas.size(), "?"));
            jdbcTemplate.update("DELETE FROM detalle_compras WHERE compra_id IN (" + inSql + ")", comprasAfectadas.toArray());
            comprasDeleted = jdbcTemplate.update("DELETE FROM compras WHERE id IN (" + inSql + ")", comprasAfectadas.toArray());
        }

        // 5. Borrar productos
        int prodsDeleted = jdbcTemplate.update("DELETE FROM productos WHERE activo = 0");

        Map<String, String> response = new java.util.HashMap<>();
        response.put("mensaje", "Purga completada.");
        response.put("productosBorrados", String.valueOf(prodsDeleted));
        response.put("ventasBorradas", String.valueOf(ventasDeleted));
        response.put("comprasBorradas", String.valueOf(comprasDeleted));
        
        return ResponseEntity.ok(response);
    }
}
