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

    // TODO: SOLO PARA TESTEO (asigna un stock aleatorio de 10 a 50 usando el ID como semilla)
    private void aplicarStockAleatorioDePrueba(Producto p) {
        if (p != null) {
            long seed = p.getId() != null ? p.getId() : 0;
            int randomStock = 10 + (int)((seed * 31 + 17) % 41);
            p.setStockActual(randomStock);
        }
    }

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
        productos.getContent().forEach(this::aplicarStockAleatorioDePrueba);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscar(@RequestParam String q) {
        List<Producto> productos = productoRepository.buscar(q);
        productos.forEach(this::aplicarStockAleatorioDePrueba);
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
        aplicarStockAleatorioDePrueba(producto);
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
                .activo(request.getActivo())
                .build();
        return ResponseEntity.ok(productoRepository.save(producto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACENERO')")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecioCompra(request.getPrecioCompra());
        producto.setPrecioVenta(request.getPrecioVenta());
        producto.setStockMinimo(request.getStockMinimo());
        if (request.getStockActual() != null) producto.setStockActual(request.getStockActual());
        producto.setImagenUrl(request.getImagenUrl());
        producto.setCategoria(categoria);
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setUnidadMedida(request.getUnidadMedida());
        producto.setMoneda(request.getMoneda());
        if (request.getActivo() != null) producto.setActivo(request.getActivo());

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
            if (req.getCodigo() == null || req.getCodigo().trim().isEmpty() || req.getNombre() == null || req.getNombre().trim().isEmpty()) {
                continue; // Skip invalid rows
            }
            
            // 1. Resolve Category
            Categoria categoria = null;
            if (req.getCategoriaId() != null) {
                categoria = categoriaRepository.findById(req.getCategoriaId()).orElse(null);
            }
            if (categoria == null && req.getCategoriaNombre() != null && !req.getCategoriaNombre().trim().isEmpty()) {
                String nombreCat = req.getCategoriaNombre().trim();
                categoria = categoriaRepository.findByNombre(nombreCat)
                        .orElseGet(() -> {
                            Categoria nueva = new Categoria();
                            nueva.setNombre(nombreCat);
                            nueva.setActivo(true);
                            return categoriaRepository.save(nueva);
                        });
            }
            if (categoria == null) {
                // fall back to default "Abarrotes" category
                categoria = categoriaRepository.findByNombre("Abarrotes")
                        .orElseGet(() -> {
                            Categoria nueva = new Categoria();
                            nueva.setNombre("Abarrotes");
                            nueva.setActivo(true);
                            return categoriaRepository.save(nueva);
                        });
            }

            // 2. Resolve Product (Upsert)
            Optional<Producto> existenteOpt = productoRepository.findByCodigo(req.getCodigo().trim());
            Producto producto;
            if (existenteOpt.isPresent()) {
                producto = existenteOpt.get();
                producto.setNombre(req.getNombre().trim());
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
}
