package com.tienda.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "almacenes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Almacen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(length = 200)
    private String ubicacion;

    @Column(length = 150)
    private String responsable;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "almacen", fetch = FetchType.LAZY)
    private List<Producto> productos;
}
