package com.tienda.backend.repository;

import com.tienda.backend.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByNumeroVenta(String numeroVenta);

    List<Venta> findByClienteId(Long clienteId);

    List<Venta> findByFechaVentaBetween(LocalDateTime inicio, LocalDateTime fin);

    // JPQL — ventas del día
    @Query("SELECT v FROM Venta v WHERE v.estado = 'COMPLETADA' AND " +
           "DATE(v.fechaVenta) = CURRENT_DATE ORDER BY v.fechaVenta DESC")
    List<Venta> findVentasHoy();

    // JPQL — total de ventas por mes (para gráfico dashboard)
    @Query("SELECT MONTH(v.fechaVenta), SUM(v.total) FROM Venta v " +
           "WHERE v.estado = 'COMPLETADA' AND YEAR(v.fechaVenta) = :anio " +
           "GROUP BY MONTH(v.fechaVenta) ORDER BY MONTH(v.fechaVenta)")
    List<Object[]> totalVentasPorMes(@Param("anio") int anio);

    // JPQL — monto total vendido hoy
    @Query("SELECT COALESCE(SUM(v.total), 0) FROM Venta v WHERE v.estado = 'COMPLETADA' AND DATE(v.fechaVenta) = CURRENT_DATE")
    BigDecimal totalVentasHoy();

    // JPQL — conteo de ventas por estado
    @Query("SELECT v.estado, COUNT(v) FROM Venta v GROUP BY v.estado")
    List<Object[]> countByEstado();
}
