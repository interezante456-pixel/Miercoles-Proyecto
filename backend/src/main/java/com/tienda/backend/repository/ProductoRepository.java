package com.tienda.backend.repository;

import com.tienda.backend.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // Versión PAGINADA de findByActivoTrue
    Page<Producto> findByActivoTrue(Pageable pageable);

    List<Producto> findByCategoriaId(Long categoriaId);

    // JPQL — búsqueda por nombre, código o código de barras
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " (p.codigoBarras IS NOT NULL AND LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :q, '%'))))")
    List<Producto> buscar(@Param("q") String q);

    // Versión PAGINADA de buscar
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND " +
           "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " (p.codigoBarras IS NOT NULL AND LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :q, '%'))))")
    Page<Producto> buscarPaginado(@Param("q") String q, Pageable pageable);

    // JPQL — productos con stock bajo (stock_actual <= stock_minimo)
    @Query("SELECT p FROM Producto p WHERE p.activo = true AND p.stockActual <= p.stockMinimo")
    List<Producto> findProductosStockBajo();

    // Conteo de productos con stock bajo (para el badge, sin cargar datos)
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.activo = true AND p.stockActual <= p.stockMinimo")
    long countProductosStockBajo();

    // Conteo total de productos activos
    long countByActivoTrue();

    // JPQL — productos por categoría activos
    @Query("SELECT p FROM Producto p WHERE p.categoria.id = :catId AND p.activo = true")
    List<Producto> findByCategoriaActivos(@Param("catId") Long catId);

    // JPQL — conteo de productos por categoría
    @Query("SELECT p.categoria.nombre, COUNT(p) FROM Producto p WHERE p.activo = true GROUP BY p.categoria.nombre")
    List<Object[]> countByCategorias();
}
