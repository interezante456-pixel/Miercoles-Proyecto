package com.tienda.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoRequest {

    @NotBlank @Size(max = 50)
    private String codigo;

    @NotBlank @Size(max = 150)
    private String nombre;

    private String descripcion;

    @NotNull @DecimalMin("0.0")
    private BigDecimal precioCompra;

    @NotNull @DecimalMin("0.0")
    private BigDecimal precioVenta;

    @Min(0)
    private Integer stockActual = 0;

    @Min(0)
    private Integer stockMinimo = 5;

    private String imagenUrl;

    private Long categoriaId;

    private Long almacenId;

    private String categoriaNombre;

    @Size(max = 50)
    private String codigoBarras;

    @Size(max = 50)
    private String unidadMedida = "UNIDADES";

    @Size(max = 10)
    private String moneda = "PEN";

    private Boolean activo = true;
}
