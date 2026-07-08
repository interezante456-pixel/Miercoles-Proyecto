package com.tienda.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(contact = @Contact(name = "Equipo de Desarrollo"),

                description = "Documentación oficial de los endpoints de la API REST para el sistema Tiendas Mi Cholo S.A.C.<br><br>**Integrantes del Equipo:**<br>• BOÑON FERNANDEZ, JOSUE SAMUEL (100%)<br>• HUANGAL BRIONES, GIBSON BELIZARIO (100%)<br>• LLANOS MENDOZA, LENIS JHONATAN (100%)<br>• MEDINA ATALAYA, EDMAR ARLEN (100%)", title = "API REST - Tiendas Mi Cholo", version = "1.0"), servers = {
                                @Server(description = "Producción (Nube - Render)", url = "https://tienda-backend-9mau.onrender.com/api"),
                                @Server(description = "Entorno Local", url = "http://localhost:8080/api")
                }, security = {
                                @SecurityRequirement(name = "bearerAuth")
                })
@SecurityScheme(name = "bearerAuth", description = "Ingresa tu token JWT generado al iniciar sesión para probar las rutas protegidas.", scheme = "bearer", type = SecuritySchemeType.HTTP, bearerFormat = "JWT", in = SecuritySchemeIn.HEADER)
public class OpenApiConfig {
}
