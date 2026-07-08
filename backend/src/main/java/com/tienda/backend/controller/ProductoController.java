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
                importados.add(productoRepository.save(producto));
            }
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
        java.util.List<Long> ventasAfectadas = jdbcTemplate.queryForList("SELECT DISTINCT venta_id FROM detalles_venta WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)", Long.class);
        java.util.List<Long> comprasAfectadas = jdbcTemplate.queryForList("SELECT DISTINCT compra_id FROM detalles_compra WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)", Long.class);
        
        // 3. Borrar detalles
        int detVentasDeleted = jdbcTemplate.update("DELETE FROM detalles_venta WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)");
        int detComprasDeleted = jdbcTemplate.update("DELETE FROM detalles_compra WHERE producto_id IN (SELECT id FROM productos WHERE activo = 0)");
        
        // 4. Borrar ventas y compras vacías (opcional, pero el usuario pidió borrarlas)
        int ventasDeleted = 0;
        if (!ventasAfectadas.isEmpty()) {
            String inSql = String.join(",", java.util.Collections.nCopies(ventasAfectadas.size(), "?"));
            jdbcTemplate.update("DELETE FROM detalles_venta WHERE venta_id IN (" + inSql + ")", ventasAfectadas.toArray());
            ventasDeleted = jdbcTemplate.update("DELETE FROM ventas WHERE id IN (" + inSql + ")", ventasAfectadas.toArray());
        }
        
        int comprasDeleted = 0;
        if (!comprasAfectadas.isEmpty()) {
            String inSql = String.join(",", java.util.Collections.nCopies(comprasAfectadas.size(), "?"));
            jdbcTemplate.update("DELETE FROM detalles_compra WHERE compra_id IN (" + inSql + ")", comprasAfectadas.toArray());
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
