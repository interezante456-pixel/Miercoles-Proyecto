package com.tienda.backend.controller;

import com.tienda.backend.entity.Inventario;
import com.tienda.backend.repository.InventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioRepository inventarioRepository;

    @GetMapping
    public ResponseEntity<List<Inventario>> listar() {
        return ResponseEntity.ok(inventarioRepository.findAll());
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Inventario>> porProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioRepository.findByProductoIdOrderByFechaDesc(productoId));
    }
}
