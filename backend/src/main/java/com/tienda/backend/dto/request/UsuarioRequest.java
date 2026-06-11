package com.tienda.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UsuarioRequest {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotBlank
    @Size(max = 100)
    private String apellido;

    @NotBlank
    @Size(max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 20)
    private String telefono;

    @NotNull
    private Long rolId;

    private Boolean activo;
}
