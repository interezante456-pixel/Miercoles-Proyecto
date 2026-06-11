package com.tienda.backend.repository;

import com.tienda.backend.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    Optional<Proveedor> findByRuc(String ruc);
    boolean existsByRuc(String ruc);
    List<Proveedor> findByActivoTrue();

    @Query("SELECT p FROM Proveedor p WHERE p.activo = true AND " +
           "(LOWER(p.razonSocial) LIKE LOWER(CONCAT('%', :q, '%')) OR p.ruc LIKE CONCAT('%', :q, '%'))")
    List<Proveedor> buscar(@Param("q") String q);
}
