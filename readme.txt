========================================================================
🛒 SISTEMA DE GESTIÓN DE TIENDA (MIERCOLES PROYECTO)
========================================================================

Este proyecto es una aplicación web full-stack para la gestión integral de una tienda. Incluye control de inventarios, ventas, compras, clientes, proveedores, categorías de productos, reportes avanzados, panel de administración (dashboard) y seguridad mediante tokens JWT con control de acceso basado en roles (RBAC).

------------------------------------------------------------------------
1. ARQUITECTURA DEL PROYECTO
------------------------------------------------------------------------

El sistema está dividido en tres componentes principales:

* BACKEND: API REST construida con Java y Spring Boot. Maneja toda la lógica de negocio, persistencia de datos con JPA/Hibernate, seguridad con Spring Security y tokens JWT.
* FRONTEND: Aplicación de cliente SPA moderna desarrollada en Angular v22 con TypeScript, utilizando servicios reactivos, interceptores para la gestión de tokens y vistas optimizadas.
* BASE DE DATOS: Base de datos relacional MySQL 8.0 montada en un contenedor Docker con phpMyAdmin para la administración visual.

------------------------------------------------------------------------
2. TECNOLOGÍAS UTILIZADAS
------------------------------------------------------------------------

Backend (API REST):
- Java JDK 17
- Spring Boot 3.x
- Spring Security & JWT (JSON Web Tokens)
- Spring Data JPA / Hibernate
- Lombok
- Gestores de construcción soportados: Gradle y Maven

Frontend (Cliente SPA):
- Angular v22.0.0
- TypeScript
- RxJS
- Vitest (Pruebas unitarias)
- TailwindCSS / Vanilla CSS

DevOps y Base de Datos:
- Docker y Docker Compose
- MySQL 8.0
- phpMyAdmin (Consola web de gestión)

------------------------------------------------------------------------
3. ESTRUCTURA DE DIRECTORIOS
------------------------------------------------------------------------

miercoles-proyecto/
├── Frontend/                 # Aplicación de cliente Angular
│   ├── src/                  # Código fuente de Angular (componentes, servicios, etc.)
│   ├── package.json          # Dependencias y scripts de Frontend
│   └── tsconfig.json         # Configuración de TypeScript
├── backend/                  # API REST de Spring Boot
│   ├── src/main/java/        # Código fuente Java por capas (entity, repository, etc.)
│   ├── src/main/resources/   # Propiedades y archivos de configuración
│   ├── build.gradle          # Configuración de Gradle
│   └── pom.xml               # Configuración de Maven (alternativa)
├── database/                 # Scripts SQL iniciales de base de datos
│   ├── schema.sql            # Creación de tablas y estructura
│   └── data.sql              # Datos semilla iniciales y usuarios de prueba
└── docker-compose.yml        # Configuración de contenedores Docker (MySQL + phpMyAdmin)

------------------------------------------------------------------------
4. GUÍA DE CONFIGURACIÓN Y EJECUCIÓN
------------------------------------------------------------------------

Requisitos Previos:
- Docker Desktop instalado y en ejecución.
- Java JDK 17 o superior instalado.
- Node.js (v18 o v20) instalado.
- Un IDE o editor de código (VS Code, IntelliJ, etc.).

--- PASO 1: INICIAR LA BASE DE DATOS (DOCKER) ---

1. Abre una terminal en la raíz del proyecto.
2. Ejecuta el siguiente comando para levantar los servicios en segundo plano:
   
   docker compose up -d

3. Esto iniciará automáticamente:
   - MySQL en el puerto 3306 (con el esquema y datos iniciales cargados).
   - phpMyAdmin en el puerto 8081. Puedes acceder en http://localhost:8081 con:
     Usuario: root
     Contraseña: tienda123

--- PASO 2: INICIAR EL BACKEND (SPRING BOOT) ---

1. Dirígete a la carpeta del backend:
   
   cd backend

2. Ejecuta la aplicación utilizando Gradle:
   - En Windows:
     ./gradlew.bat bootRun
   - En Linux/macOS:
     ./gradlew bootRun
   - Opcional (si usas Maven):
     mvn spring-boot:run

3. El servidor iniciará en el puerto 8080. El contexto de la API es http://localhost:8080/api.

--- PASO 3: INICIAR EL FRONTEND (ANGULAR) ---

1. Dirígete a la carpeta del frontend:
   
   cd Frontend

2. Instala las dependencias necesarias:
   
   npm install

3. Inicia el servidor de desarrollo:
   
   npm start
   (o bien: ng serve)

4. Abre tu navegador y accede a la aplicación en http://localhost:4200.

------------------------------------------------------------------------
5. CREDENCIALES DE PRUEBA
------------------------------------------------------------------------

Puedes iniciar sesión utilizando las siguientes cuentas por defecto cargadas en la base de datos:

* Rol Administrador:
  - Identificador (DNI): 12345678
  - Contraseña: admin123
  - Descripción: Acceso completo a todo el sistema, reportes y gestión de usuarios.

* Rol Usuario / Vendedor:
  - Identificador (DNI): 87654321
  - Contraseña: user1234
  - Descripción: Acceso limitado a tareas transaccionales (ventas, compras, stock).

------------------------------------------------------------------------
6. DOCUMENTACIÓN ADICIONAL
------------------------------------------------------------------------

Puedes consultar los detalles de diseño específicos en la carpeta "backend/":
- backend/Proyecto_Estructura_Directorios.md
- backend/API_REST_JWT_Documentacion.md
- backend/JPA_Relaciones_Modelos.md
- backend/JPA_Validaciones_Modelos.md
- backend/Proyecto_Usuarios_Prueba.md
========================================================================
