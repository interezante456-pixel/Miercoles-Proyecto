package com.tienda.backend.controller;

import com.tienda.backend.entity.Proveedor;
import com.tienda.backend.exception.ResourceNotFoundException;
import com.tienda.backend.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
public class ProveedorController {
    private final ProveedorRepository proveedorRepository;

    @GetMapping
    public ResponseEntity<List<Proveedor>> listar() {
        return ResponseEntity.ok(proveedorRepository.findByActivoTrue());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Proveedor>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(proveedorRepository.buscar(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> findById(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id)));
    }

    @PostMapping
    public ResponseEntity<Proveedor> crear(@RequestBody Proveedor proveedor) {
        return ResponseEntity.ok(proveedorRepository.save(proveedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizar(@PathVariable Long id, @RequestBody Proveedor datos) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id));
        p.setRazonSocial(datos.getRazonSocial());
        p.setRuc(datos.getRuc());
        p.setEmail(datos.getEmail());
        p.setTelefono(datos.getTelefono());
        p.setDireccion(datos.getDireccion());
        p.setContacto(datos.getContacto());
        return ResponseEntity.ok(proveedorRepository.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id));
        p.setActivo(false);
        proveedorRepository.save(p);
        return ResponseEntity.noContent().build();
    }
}
