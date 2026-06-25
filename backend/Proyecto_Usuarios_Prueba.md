# Plan de Usuarios de Prueba del Sistema

Este documento detalla las credenciales y perfiles de los usuarios configurados para realizar pruebas de autenticación, autorización y flujos de trabajo en el sistema (login, ventas, compras, etc.).

---

## 1. Tabla de Usuarios de Prueba

| Campo | Usuario Admin | Usuario Normal | Descripcion |
| :--- | :--- | :--- | :--- |
| **DNI** | 12345678 | 87654321 | Nombre de usuario para login |
| **Contraseña** | admin123 | user1234 | Mínimo 6 caracteres |
| **Rol** | ADMIN | USER | Rol asignado al usuario |

---

## 2. Detalles de los Perfiles de Prueba

* **Usuario Administrador (Rol: ADMIN):**
  * **Nombre de Usuario (DNI):** `12345678`
  * **Contraseña:** `admin123`
  * **Permisos:** Acceso completo a todos los endpoints del sistema, incluyendo la gestión de usuarios, roles, reportes avanzados de auditoría, almacenes, categorías, compras y ventas.
  
* **Usuario Estándar (Rol: USER / VENDEDOR / ALMACENERO):**
  * **Nombre de Usuario (DNI):** `87654321`
  * **Contraseña:** `user1234`
  * **Permisos:** Acceso limitado a operaciones transaccionales comunes según el subrol específico (por ejemplo, registro de ventas o actualización de stock de productos), con denegación de acceso a secciones administrativas de usuarios y reportes financieros confidenciales.
