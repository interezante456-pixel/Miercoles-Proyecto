package com.tienda.backend.repository;

import com.tienda.backend.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    Optional<Compra> findByNumeroCompra(String numeroCompra);
    List<Compra> findByProveedorId(Long proveedorId);
    List<Compra> findByFechaCompraBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT c FROM Compra c WHERE c.estado = 'PENDIENTE' ORDER BY c.fechaCompra DESC")
    List<Compra> findComprasPendientes();

    @Query("SELECT MONTH(c.fechaCompra), SUM(c.total) FROM Compra c " +
           "WHERE c.estado = 'RECIBIDA' AND YEAR(c.fechaCompra) = :anio " +
           "GROUP BY MONTH(c.fechaCompra)")
    List<Object[]> totalComprasPorMes(@Param("anio") int anio);
}
