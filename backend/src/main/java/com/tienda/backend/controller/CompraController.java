package com.tienda.backend.controller;

import com.tienda.backend.dto.request.CompraRequest;
import com.tienda.backend.entity.Compra;
import com.tienda.backend.service.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    public ResponseEntity<List<Compra>> listar() {
        return ResponseEntity.ok(compraService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compra> findById(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACENERO')")
    public ResponseEntity<Compra> crear(@Valid @RequestBody CompraRequest request) {
        return ResponseEntity.ok(compraService.crearCompra(request));
    }

    @PatchMapping("/{id}/recibir")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACENERO')")
    public ResponseEntity<Compra> recibir(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.recibirCompra(id));
    }
}
