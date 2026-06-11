package com.tienda.backend.repository;

import com.tienda.backend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNroDoc(String nroDoc);
    boolean existsByNroDoc(String nroDoc);
    List<Cliente> findByActivoTrue();

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND " +
           "(LOWER(c.nombres) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " LOWER(c.apellidos) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           " c.nroDoc LIKE CONCAT('%', :q, '%'))")
    List<Cliente> buscar(@Param("q") String q);
}
