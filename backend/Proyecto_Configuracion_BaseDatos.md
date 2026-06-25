# Plan de Configuración de la Base de Datos

Este documento detalla la configuración exacta de la base de datos relacional (MySQL) y las herramientas de administración de base de datos del proyecto, basadas en el archivo de orquestación [docker-compose.yml](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/docker-compose.yml) y el archivo de propiedades del backend [application.properties](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/resources/application.properties).

---

## 1. Configuración de Base de Datos y Backend

| Parámetro | Valor Real del Proyecto | Descripción |
| :--- | :--- | :--- |
| **Motor de Base de Datos** | MySQL 8.0 | Ejecutándose en un contenedor Docker (`tienda-mysql`). |
| **Nombre de la Base de Datos** | `tienda_db` | Base de datos principal creada al levantar el contenedor. |
| **JDBC URL** | `jdbc:mysql://localhost:3306/tienda_db?useSSL=false&serverTimezone=America/Lima` | Cadena de conexión JDBC configurada en el backend. |
| **Usuario de Conexión** | `tienda_user` | Usuario de base de datos con privilegios para la aplicación backend. |
| **Contraseña del Usuario** | `tienda123` | Clave del usuario de base de datos `tienda_user`. |
| **Contraseña de Root** | `tienda123` | Clave del superusuario (`root`) para administración directa de MySQL. |
| **Puerto MySQL** | `3306` | Puerto de escucha en el host local y dentro del contenedor. |
| **Puerto del Backend** | `8080` | Puerto de escucha del servidor web embebido (Tomcat) de Spring Boot. |
| **Context Path del Backend** | `/api` | Prefijo para todos los endpoints (ej: `http://localhost:8080/api/productos`). |

---

## 2. Herramientas de Administración (phpMyAdmin)

El archivo de docker-compose también orquesta un panel web de phpMyAdmin para visualización y depuración de la base de datos de manera gráfica:

* **Contenedor:** `tienda-phpmyadmin`
* **URL de Acceso:** `http://localhost:8081`
* **Usuario:** `root`
* **Contraseña:** `tienda123`

---

## 3. Inicialización Automática de Datos

Al levantar el contenedor Docker mediante el comando `docker compose up -d`, la base de datos se inicializa automáticamente ejecutando los siguientes scripts en orden:
1. **[schema.sql](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/database/schema.sql):** Crea las tablas, restricciones de clave primaria, clave foránea e índices.
2. **[data.sql](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/database/data.sql):** Carga los roles iniciales, usuarios de prueba por defecto, categorías y productos iniciales.
