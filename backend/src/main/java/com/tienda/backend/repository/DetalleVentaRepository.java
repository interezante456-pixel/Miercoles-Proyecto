package com.tienda.backend.repository;

import com.tienda.backend.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {
    List<DetalleVenta> findByVentaId(Long ventaId);

    // Top 5 productos más vendidos
    @Query("SELECT d.producto.nombre, SUM(d.cantidad) FROM DetalleVenta d " +
           "JOIN d.venta v WHERE v.estado = 'COMPLETADA' " +
           "GROUP BY d.producto.nombre ORDER BY SUM(d.cantidad) DESC LIMIT 5")
    List<Object[]> topProductosMasVendidos();
}
