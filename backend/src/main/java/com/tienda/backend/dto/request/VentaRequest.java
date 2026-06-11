package com.tienda.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class VentaRequest {

    @NotNull
    private Long clienteId;

    @NotBlank
    private String tipoComprobante;  // BOLETA, FACTURA, TICKET

    private String observaciones;

    @NotEmpty
    @Valid
    private List<DetalleVentaRequest> detalles;

    @Data
    public static class DetalleVentaRequest {
        @NotNull
        private Long productoId;

        @NotNull @Min(1)
        private Integer cantidad;

        @NotNull @DecimalMin("0.0")
        private java.math.BigDecimal precioUnitario;

        @DecimalMin("0.0") @DecimalMax("100.0")
        private java.math.BigDecimal descuento = java.math.BigDecimal.ZERO;
    }
}
