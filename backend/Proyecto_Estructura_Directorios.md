# Plan de Estructura de Directorios y Arquitectura del Proyecto

Este documento detalla la estructura organizativa de los archivos y paquetes del backend, explicando el propósito de cada capa arquitectónica implementada en la aplicación Spring Boot.

---

## 1. Árbol Completo del Proyecto

```
backend/
├── build.gradle
├── pom.xml
├── settings.gradle
├── API_REST_JWT_Documentacion.md
├── JPA_Relaciones_Modelos.md
├── JPA_Validaciones_Modelos.md
└── src/
    ├── main/
    │   ├── java/com/tienda/backend/
    │   │   ├── BackendApplication.java
    │   │   ├── config/
    │   │   │   └── SecurityConfig.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── CategoriaController.java
    │   │   │   ├── ClienteController.java
    │   │   │   ├── CompraController.java
    │   │   │   ├── DashboardController.java
    │   │   │   ├── InventarioController.java
    │   │   │   ├── ProductoController.java
    │   │   │   ├── ProveedorController.java
    │   │   │   ├── ReporteController.java
    │   │   │   ├── RolController.java
    │   │   │   ├── UsuarioController.java
    │   │   │   └── VentaController.java
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   │   ├── CompraRequest.java
    │   │   │   │   ├── LoginRequest.java
    │   │   │   │   ├── ProductoRequest.java
    │   │   │   │   ├── UsuarioRequest.java
    │   │   │   │   └── VentaRequest.java
    │   │   │   └── response/
    │   │   │       └── AuthResponse.java
    │   │   ├── entity/
    │   │   │   ├── Almacen.java
    │   │   │   ├── Categoria.java
    │   │   │   ├── Cliente.java
    │   │   │   ├── Compra.java
    │   │   │   ├── DetalleCompra.java
    │   │   │   ├── DetalleVenta.java
    │   │   │   ├── Inventario.java
    │   │   │   ├── Producto.java
    │   │   │   ├── Proveedor.java
    │   │   │   ├── Rol.java
    │   │   │   ├── Usuario.java
    │   │   │   └── Venta.java
    │   │   ├── exception/
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   ├── repository/
    │   │   │   ├── AlmacenRepository.java
    │   │   │   ├── CategoriaRepository.java
    │   │   │   ├── ClienteRepository.java
    │   │   │   ├── CompraRepository.java
    │   │   │   ├── DetalleCompraRepository.java
    │   │   │   ├── DetalleVentaRepository.java
    │   │   │   ├── InventarioRepository.java
    │   │   │   ├── ProductoRepository.java
    │   │   │   ├── ProveedorRepository.java
    │   │   │   ├── RolRepository.java
    │   │   │   ├── UsuarioRepository.java
    │   │   │   └── VentaRepository.java
    │   │   ├── security/
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   └── JwtService.java
    │   │   └── service/
    │   │       ├── AuthService.java
    │   │       ├── CompraService.java
    │   │       ├── DashboardService.java
    │   │       ├── ReporteService.java
    │   │       └── VentaService.java
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/tienda/backend/
            ├── BackendApplicationTests.java
            └── BCryptTest.java
```

---

## 2. Descripción de Componentes por Capas

El backend está organizado siguiendo el patrón arquitectónico clásico de capas sobre Spring Boot:

### Raíz del Proyecto
* **Configuración de Dependencias y Construcción:**
  * [build.gradle](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/build.gradle) / [pom.xml](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/pom.xml): Definen las dependencias del proyecto (Lombok, Spring Security, JWT, JPA, MySQL).
  * [settings.gradle](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/settings.gradle): Configura el nombre del proyecto Gradle.
* **Documentación del Backend:**
  * [API_REST_JWT_Documentacion.md](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/API_REST_JWT_Documentacion.md): Documentación de los endpoints HTTP expuestos.
  * [JPA_Relaciones_Modelos.md](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/JPA_Relaciones_Modelos.md): Detalles de las cardinalidades entre entidades JPA.
  * [JPA_Validaciones_Modelos.md](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/JPA_Validaciones_Modelos.md): Resumen de validaciones aplicadas a DTOs.

### Capa de Configuración (config)
* **[SecurityConfig.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/config/SecurityConfig.java):** Configura la cadena de filtros de seguridad (SecurityFilterChain), la autenticación sin estado (stateless), políticas CORS, encriptación BCrypt y restricciones de acceso a los endpoints basándose en roles.

### Capa de Controladores (controller)
Actúan como puntos de entrada HTTP, reciben las solicitudes del cliente y despachan respuestas serializadas en JSON.
* **Ejemplos:** [ProductoController.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/controller/ProductoController.java), [VentaController.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/controller/VentaController.java), [AuthController.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/controller/AuthController.java).

### Capa de DTOs (dto)
Objetos de Transferencia de Datos utilizados para desacoplar el payload de red del modelo interno de base de datos y aplicar validaciones mediante anotaciones.
* **Peticiones (request):** [CompraRequest.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/request/CompraRequest.java), [ProductoRequest.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/request/ProductoRequest.java).
* **Respuestas (response):** [AuthResponse.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/response/AuthResponse.java).

### Capa de Entidades de Base de Datos (entity)
Clases Java anotadas con `@Entity` que se mapean directamente con tablas de la base de datos relacional MySQL.
* **Ejemplos:** [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java), [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java), [Venta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Venta.java).

### Capa de Excepciones (exception)
Manejo centralizado de excepciones web.
* **[GlobalExceptionHandler.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/exception/GlobalExceptionHandler.java):** Captura errores de validación, credenciales inválidas y entidades no encontradas, convirtiéndolos en respuestas estructuradas en formato JSON.

### Capa de Repositorios (repository)
Interfaces que extienden `JpaRepository` para proporcionar operaciones CRUD out-of-the-box e implementar consultas personalizadas JPQL/Nativas sobre MySQL.
* **Ejemplos:** [ProductoRepository.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/repository/ProductoRepository.java), [VentaRepository.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/repository/VentaRepository.java).

### Capa de Seguridad (security)
Contiene componentes específicos de la lógica de autenticación JWT.
* **[JwtAuthenticationFilter.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/security/JwtAuthenticationFilter.java):** Filtro HTTP que intercepta el encabezado Authorization, extrae el token Bearer y establece la autenticación en el contexto de Spring Security.
* **[JwtService.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/security/JwtService.java):** Servicio encargado de firmar, parsear y validar la vigencia de los tokens JWT.

### Capa de Servicios (service)
Contiene la lógica de negocio del sistema, integrando múltiples repositorios y transacciones.
* **Ejemplos:** [VentaService.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/service/VentaService.java), [ReporteService.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/service/ReporteService.java).
