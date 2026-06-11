package com.tienda.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CompraRequest {

    @NotNull
    private Long proveedorId;

    private String observaciones;

    private LocalDate fechaEsperada;

    @NotEmpty @Valid
    private List<DetalleCompraRequest> detalles;

    @Data
    public static class DetalleCompraRequest {
        @NotNull
        private Long productoId;

        @NotNull @Min(1)
        private Integer cantidad;

        @NotNull @DecimalMin("0.0")
        private java.math.BigDecimal precioUnitario;
    }
}
