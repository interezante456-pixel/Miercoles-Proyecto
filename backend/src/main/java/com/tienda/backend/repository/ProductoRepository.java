package com.tienda.backend.repository;

import com.tienda.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Producto> findByActivoTrue();

    List<Producto> findByCategoriaId(Long categoriaId);

    // JPQL — búsqueda por nombre o código
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Producto> buscar(@Param("q") String q);

    // JPQL — productos con stock bajo (stock_actual <= stock_minimo)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.stockActual <= p.stockMinimo")
    List<Producto> findProductosStockBajo();

    // JPQL — productos por categoría activos
    @Query("SELECT p FROM Producto p WHERE p.categoria.id = :catId AND p.activo = true")
    List<Producto> findByCategoriaActivos(@Param("catId") Long catId);

    // JPQL — conteo de productos por categoría
    @Query("SELECT p.categoria.nombre, COUNT(p) FROM Producto p WHERE p.activo = true GROUP BY p.categoria.nombre")
    List<Object[]> countByCategorias();
}
