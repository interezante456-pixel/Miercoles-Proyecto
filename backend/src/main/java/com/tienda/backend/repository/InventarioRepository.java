package com.tienda.backend.repository;

import com.tienda.backend.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    List<Inventario> findByProductoIdOrderByFechaDesc(Long productoId);
    List<Inventario> findByFechaBetweenOrderByFechaDesc(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT i FROM Inventario i WHERE i.tipo = :tipo ORDER BY i.fecha DESC")
    List<Inventario> findByTipo(@Param("tipo") Inventario.TipoMovimiento tipo);
}
