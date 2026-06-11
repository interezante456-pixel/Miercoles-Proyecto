package com.tienda.backend.repository;

import com.tienda.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<Usuario> findByActivoTrue();

    // JPQL — buscar por nombre o apellido
    @Query("SELECT u FROM Usuario u WHERE LOWER(u.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Usuario> buscarPorNombre(@Param("q") String q);

    // JPQL — usuarios por rol
    @Query("SELECT u FROM Usuario u WHERE u.rol.nombre = :rolNombre AND u.activo = true")
    List<Usuario> findByRolNombre(@Param("rolNombre") String rolNombre);
}
