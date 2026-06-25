# 📦 API REST JWT — Documentación Técnica
## Sistema de Gestión de Tienda (`tienda-backend`)

> **Base URL:** `http://localhost:8080/api`
> **Versión:** Spring Boot 3.3.4 · Java 21 · MySQL 8
> **Autenticación:** JWT (Bearer Token) — JJWT 0.12.6

---

## 📋 Tabla de Contenidos

1. [Autenticación JWT](#1-autenticación-jwt)
2. [Roles y Permisos](#2-roles-y-permisos)
3. [Módulo: Auth](#3-módulo-auth)
4. [Módulo: Usuarios](#4-módulo-usuarios)
5. [Módulo: Roles](#5-módulo-roles)
6. [Módulo: Categorías](#6-módulo-categorías)
7. [Módulo: Productos](#7-módulo-productos)
8. [Módulo: Clientes](#8-módulo-clientes)
9. [Módulo: Proveedores](#9-módulo-proveedores)
10. [Módulo: Ventas](#10-módulo-ventas)
11. [Módulo: Compras](#11-módulo-compras)
12. [Módulo: Inventario](#12-módulo-inventario)
13. [Módulo: Dashboard](#13-módulo-dashboard)
14. [Módulo: Reportes](#14-módulo-reportes)
15. [Manejo de Errores](#15-manejo-de-errores)
16. [Configuración CORS](#16-configuración-cors)

---

## 1. Autenticación JWT

El sistema utiliza **JWT (JSON Web Token)** con firma HMAC-SHA256.

### Configuración de tokens (`application.properties`)

| Propiedad | Valor |
|-----------|-------|
| `app.jwt.expiration` | `86400000` ms (24 horas) |
| `app.jwt.refresh-expiration` | `604800000` ms (7 días) |
| Algoritmo | HMAC-SHA256 |

### Cómo usar el token

Incluir el token en el header `Authorization` de cada petición protegida:

```
Authorization: Bearer <token>
```

### Rutas públicas (sin autenticación)

| Ruta | Método |
|------|--------|
| `/api/auth/**` | Todos |
| `/api/actuator/**` | Todos |

### Claims del JWT

El token contiene:
- **subject**: `username` del usuario
- **roles**: lista de roles (ej. `["ROLE_ADMIN"]`)
- **iat**: fecha de emisión
- **exp**: fecha de expiración

---

## 2. Roles y Permisos

El sistema maneja 3 roles principales:

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Acceso total a todos los módulos |
| `VENDEDOR` | Puede registrar ventas |
| `ALMACENERO` | Puede gestionar productos y compras |

### Matriz de permisos por endpoint

| Módulo | Operación | ADMIN | VENDEDOR | ALMACENERO |
|--------|-----------|:-----:|:--------:|:----------:|
| Auth | Login | ✅ | ✅ | ✅ |
| Usuarios | CRUD completo | ✅ | ❌ | ❌ |
| Roles | Listar | ✅ | ✅ | ✅ |
| Categorías | Listar / Ver | ✅ | ✅ | ✅ |
| Categorías | Crear / Editar / Eliminar | ✅ | ❌ | ❌ |
| Productos | Listar / Ver / Buscar | ✅ | ✅ | ✅ |
| Productos | Crear / Editar | ✅ | ❌ | ✅ |
| Productos | Eliminar | ✅ | ❌ | ❌ |
| Clientes | CRUD completo | ✅ | ✅ | ✅ |
| Proveedores | CRUD completo | ✅ | ✅ | ✅ |
| Ventas | Listar / Ver | ✅ | ✅ | ✅ |
| Ventas | Registrar | ✅ | ✅ | ❌ |
| Ventas | Anular | ✅ | ❌ | ❌ |
| Compras | Listar / Ver | ✅ | ✅ | ✅ |
| Compras | Crear / Recibir | ✅ | ❌ | ✅ |
| Inventario | Listar | ✅ | ✅ | ✅ |
| Dashboard | Stats | ✅ | ✅ | ✅ |
| Reportes | PDF Ventas / Inventario | ✅ | ❌ | ❌ |

---

## 3. Módulo: Auth

**Base path:** `/api/auth`
**Autenticación requerida:** ❌ No

---

### POST `/api/auth/login`

Autentica al usuario y retorna los tokens JWT.

#### Request Body

```json
{
  "username": "admin",
  "password": "123456"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `username` | `String` | ✅ | Nombre de usuario |
| `password` | `String` | ✅ | Contraseña |

#### Response `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIl0...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9...",
  "username": "admin",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "admin@tienda.com",
  "rol": "ADMIN"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `token` | `String` | Access token JWT (válido 24h) |
| `refreshToken` | `String` | Refresh token JWT (válido 7 días) |
| `username` | `String` | Nombre de usuario |
| `nombre` | `String` | Nombre del usuario |
| `apellido` | `String` | Apellido del usuario |
| `email` | `String` | Correo electrónico |
| `rol` | `String` | Rol asignado (`ADMIN`, `VENDEDOR`, `ALMACENERO`) |

#### Response `401 Unauthorized`

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Credenciales inválidas"
}
```

---

## 4. Módulo: Usuarios

**Base path:** `/api/usuarios`
**Autenticación requerida:** ✅ Sí
**Rol requerido:** `ADMIN`

---

### GET `/api/usuarios`

Lista todos los usuarios activos del sistema.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "username": "admin",
    "email": "admin@tienda.com",
    "telefono": "987654321",
    "activo": true,
    "rol": {
      "id": 1,
      "nombre": "ADMIN",
      "descripcion": "Administrador del sistema"
    },
    "createdAt": "2024-01-01T08:00:00",
    "updatedAt": "2024-01-15T10:00:00"
  }
]
```

---

### GET `/api/usuarios/{id}`

Obtiene un usuario por su ID.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `Long` | ID del usuario |

#### Response `200 OK`

```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "username": "admin",
  "email": "admin@tienda.com",
  "telefono": "987654321",
  "activo": true,
  "rol": {
    "id": 1,
    "nombre": "ADMIN"
  },
  "createdAt": "2024-01-01T08:00:00",
  "updatedAt": "2024-01-15T10:00:00"
}
```

#### Response `404 Not Found`

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Usuario no encontrado: 99"
}
```

---

### POST `/api/usuarios`

Crea un nuevo usuario en el sistema.

#### Request Body

```json
{
  "nombre": "María",
  "apellido": "García",
  "username": "mgarcia",
  "email": "maria@tienda.com",
  "password": "segura123",
  "telefono": "912345678",
  "rolId": 2,
  "activo": true
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|:---------:|------------|-------------|
| `nombre` | `String` | ✅ | max=100 | Nombre del usuario |
| `apellido` | `String` | ✅ | max=100 | Apellido del usuario |
| `username` | `String` | ✅ | max=50 | Nombre de usuario único |
| `email` | `String` | ✅ | formato email | Correo electrónico único |
| `password` | `String` | ⬜ | min=6, max=100 | Contraseña (se encripta con BCrypt) |
| `telefono` | `String` | ⬜ | max=20 | Teléfono de contacto |
| `rolId` | `Long` | ✅ | — | ID del rol asignado |
| `activo` | `Boolean` | ⬜ | — | Estado activo/inactivo |

#### Response `200 OK`

Retorna el objeto `Usuario` creado (sin el campo `password`).

---

### PUT `/api/usuarios/{id}`

Actualiza los datos de un usuario existente.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `Long` | ID del usuario a actualizar |

#### Request Body

Igual que POST. Si `password` se omite o es vacío, no se modifica la contraseña actual.

#### Response `200 OK`

Retorna el objeto `Usuario` actualizado.

---

### DELETE `/api/usuarios/{id}`

Desactiva un usuario (borrado lógico — establece `activo = false`).

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `Long` | ID del usuario a eliminar |

#### Response `204 No Content`

Sin cuerpo en la respuesta.

---

## 5. Módulo: Roles

**Base path:** `/api/roles`
**Autenticación requerida:** ✅ Sí
**Rol requerido:** Cualquier rol autenticado

---

### GET `/api/roles`

Lista todos los roles disponibles en el sistema.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "nombre": "ADMIN",
    "descripcion": "Administrador del sistema"
  },
  {
    "id": 2,
    "nombre": "VENDEDOR",
    "descripcion": "Vendedor de la tienda"
  },
  {
    "id": 3,
    "nombre": "ALMACENERO",
    "descripcion": "Encargado de almacén"
  }
]
```

---

## 6. Módulo: Categorías

**Base path:** `/api/categorias`
**Autenticación requerida:** ✅ Sí

---

### GET `/api/categorias`

Lista todas las categorías activas.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "nombre": "Electrónica",
    "descripcion": "Dispositivos electrónicos y accesorios",
    "activo": true,
    "createdAt": "2024-01-01T08:00:00"
  }
]
```

---

### GET `/api/categorias/{id}`

Obtiene una categoría por su ID.

#### Response `200 OK`

```json
{
  "id": 1,
  "nombre": "Electrónica",
  "descripcion": "Dispositivos electrónicos y accesorios",
  "activo": true,
  "createdAt": "2024-01-01T08:00:00"
}
```

---

### POST `/api/categorias`

**Rol requerido:** `ADMIN`

Crea una nueva categoría.

#### Request Body

```json
{
  "nombre": "Ropa",
  "descripcion": "Prendas de vestir para toda la familia"
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|:---------:|------------|-------------|
| `nombre` | `String` | ✅ | max=100, único | Nombre de la categoría |
| `descripcion` | `String` | ⬜ | max=300 | Descripción de la categoría |

#### Response `200 OK`

Retorna la categoría creada.

---

### PUT `/api/categorias/{id}`

**Rol requerido:** `ADMIN`

Actualiza una categoría existente.

#### Request Body

```json
{
  "nombre": "Ropa y Calzado",
  "descripcion": "Prendas de vestir y calzado"
}
```

#### Response `200 OK`

Retorna la categoría actualizada.

---

### DELETE `/api/categorias/{id}`

**Rol requerido:** `ADMIN`

Desactiva una categoría (borrado lógico).

#### Response `204 No Content`

---

## 7. Módulo: Productos

**Base path:** `/api/productos`
**Autenticación requerida:** ✅ Sí

---

### GET `/api/productos`

Lista todos los productos activos.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "codigo": "PROD-001",
    "nombre": "Laptop HP 15",
    "descripcion": "Laptop HP 15 pulgadas, Intel Core i5",
    "precioCompra": 2500.00,
    "precioVenta": 3200.00,
    "stockActual": 10,
    "stockMinimo": 5,
    "imagenUrl": "http://example.com/imagen.jpg",
    "activo": true,
    "categoria": {
      "id": 1,
      "nombre": "Electrónica"
    },
    "almacen": {
      "id": 1,
      "nombre": "Almacén Principal"
    },
    "createdAt": "2024-01-01T08:00:00",
    "updatedAt": "2024-01-15T10:00:00"
  }
]
```

---

### GET `/api/productos/buscar?q={término}`

Busca productos por nombre, código o descripción.

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|:---------:|-------------|
| `q` | `String` | ✅ | Término de búsqueda |

#### Ejemplo

```
GET /api/productos/buscar?q=laptop
```

---

### GET `/api/productos/stock-bajo`

Lista los productos cuyo stock actual está por debajo del stock mínimo.

#### Response `200 OK`

Lista de productos con stock bajo.

---

### GET `/api/productos/{id}`

Obtiene un producto por su ID.

#### Response `404 Not Found`

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Producto no encontrado: 99"
}
```

---

### POST `/api/productos`

**Rol requerido:** `ADMIN` o `ALMACENERO`

Crea un nuevo producto.

#### Request Body

```json
{
  "codigo": "PROD-002",
  "nombre": "Mouse Logitech M185",
  "descripcion": "Mouse inalámbrico compacto",
  "precioCompra": 45.00,
  "precioVenta": 75.00,
  "stockActual": 50,
  "stockMinimo": 10,
  "imagenUrl": "https://example.com/mouse.jpg",
  "categoriaId": 1,
  "almacenId": 1,
  "activo": true
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|:---------:|------------|-------------|
| `codigo` | `String` | ✅ | max=50, único | Código único del producto |
| `nombre` | `String` | ✅ | max=150 | Nombre del producto |
| `descripcion` | `String` | ⬜ | TEXT | Descripción detallada |
| `precioCompra` | `BigDecimal` | ✅ | >= 0.0 | Precio de compra |
| `precioVenta` | `BigDecimal` | ✅ | >= 0.0 | Precio de venta |
| `stockActual` | `Integer` | ⬜ | >= 0, default=0 | Stock actual disponible |
| `stockMinimo` | `Integer` | ⬜ | >= 0, default=5 | Stock mínimo requerido |
| `imagenUrl` | `String` | ⬜ | max=500 | URL de la imagen del producto |
| `categoriaId` | `Long` | ✅ | — | ID de la categoría |
| `almacenId` | `Long` | ⬜ | — | ID del almacén (opcional) |
| `activo` | `Boolean` | ⬜ | default=true | Estado del producto |

#### Response `200 OK`

Retorna el objeto `Producto` creado.

---

### PUT `/api/productos/{id}`

**Rol requerido:** `ADMIN` o `ALMACENERO`

Actualiza un producto existente. No modifica el `stockActual` (se gestiona por ventas/compras).

#### Response `200 OK`

Retorna el objeto `Producto` actualizado.

---

### DELETE `/api/productos/{id}`

**Rol requerido:** `ADMIN`

Desactiva un producto (borrado lógico).

#### Response `204 No Content`

---

## 8. Módulo: Clientes

**Base path:** `/api/clientes`
**Autenticación requerida:** ✅ Sí
**Rol requerido:** Cualquier rol autenticado

---

### GET `/api/clientes`

Lista todos los clientes activos.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "nombres": "Carlos Alberto",
    "apellidos": "Rodríguez Silva",
    "tipoDoc": "DNI",
    "nroDoc": "12345678",
    "email": "carlos@email.com",
    "telefono": "987654321",
    "direccion": "Av. Principal 123, Lima",
    "activo": true,
    "createdAt": "2024-01-01T08:00:00",
    "updatedAt": "2024-01-15T10:00:00"
  }
]
```

---

### GET `/api/clientes/buscar?q={término}`

Busca clientes por nombre, apellido o número de documento.

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|:---------:|-------------|
| `q` | `String` | ✅ | Término de búsqueda |

---

### GET `/api/clientes/{id}`

Obtiene un cliente por su ID.

---

### POST `/api/clientes`

Crea un nuevo cliente.

#### Request Body

```json
{
  "nombres": "Ana Lucía",
  "apellidos": "Torres Mendoza",
  "tipoDoc": "DNI",
  "nroDoc": "87654321",
  "email": "ana@email.com",
  "telefono": "912345678",
  "direccion": "Jr. Los Olivos 456, Miraflores"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `nombres` | `String` | ✅ | Nombres del cliente (max=100) |
| `apellidos` | `String` | ✅ | Apellidos del cliente (max=100) |
| `tipoDoc` | `String` | ✅ | `DNI`, `RUC`, `PASAPORTE`, `CE` |
| `nroDoc` | `String` | ✅ | Número de documento único (max=20) |
| `email` | `String` | ⬜ | Correo electrónico (max=150) |
| `telefono` | `String` | ⬜ | Teléfono (max=20) |
| `direccion` | `String` | ⬜ | Dirección (max=300) |

#### Response `200 OK`

Retorna el objeto `Cliente` creado.

---

### PUT `/api/clientes/{id}`

Actualiza los datos de un cliente.

#### Response `200 OK`

---

### DELETE `/api/clientes/{id}`

Desactiva un cliente (borrado lógico).

#### Response `204 No Content`

---

## 9. Módulo: Proveedores

**Base path:** `/api/proveedores`
**Autenticación requerida:** ✅ Sí
**Rol requerido:** Cualquier rol autenticado

---

### GET `/api/proveedores`

Lista todos los proveedores activos.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "razonSocial": "Distribuidora Tech SAC",
    "ruc": "20123456789",
    "email": "ventas@techsac.com",
    "telefono": "014567890",
    "direccion": "Av. Industrial 789, Ate",
    "contacto": "Roberto Flores",
    "activo": true,
    "createdAt": "2024-01-01T08:00:00",
    "updatedAt": "2024-01-15T10:00:00"
  }
]
```

---

### GET `/api/proveedores/buscar?q={término}`

Busca proveedores por razón social, RUC o contacto.

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|:---------:|-------------|
| `q` | `String` | ✅ | Término de búsqueda |

---

### GET `/api/proveedores/{id}`

Obtiene un proveedor por su ID.

---

### POST `/api/proveedores`

Crea un nuevo proveedor.

#### Request Body

```json
{
  "razonSocial": "Importaciones XYZ EIRL",
  "ruc": "20987654321",
  "email": "contacto@xyzimport.com",
  "telefono": "016789012",
  "direccion": "Calle Comercio 321, San Isidro",
  "contacto": "Patricia Vega"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `razonSocial` | `String` | ✅ | Razón social de la empresa (max=200) |
| `ruc` | `String` | ✅ | RUC único de la empresa (max=20) |
| `email` | `String` | ⬜ | Correo electrónico (max=150) |
| `telefono` | `String` | ⬜ | Teléfono (max=20) |
| `direccion` | `String` | ⬜ | Dirección (max=300) |
| `contacto` | `String` | ⬜ | Persona de contacto (max=150) |

#### Response `200 OK`

Retorna el objeto `Proveedor` creado.

---

### PUT `/api/proveedores/{id}`

Actualiza los datos de un proveedor.

#### Response `200 OK`

---

### DELETE `/api/proveedores/{id}`

Desactiva un proveedor (borrado lógico).

#### Response `204 No Content`

---

## 10. Módulo: Ventas

**Base path:** `/api/ventas`
**Autenticación requerida:** ✅ Sí

---

### GET `/api/ventas`

Lista todas las ventas registradas.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "numeroVenta": "VNT-00001",
    "tipoComprobante": "BOLETA",
    "estado": "COMPLETADA",
    "subtotal": 2711.86,
    "igv": 488.14,
    "total": 3200.00,
    "observaciones": null,
    "cliente": {
      "id": 1,
      "nombres": "Carlos Alberto",
      "apellidos": "Rodríguez Silva",
      "nroDoc": "12345678"
    },
    "usuario": {
      "id": 2,
      "nombre": "Luis",
      "apellido": "Mendoza",
      "username": "lmendoza"
    },
    "fechaVenta": "2024-01-15T14:30:00"
  }
]
```

---

### GET `/api/ventas/{id}`

Obtiene una venta por su ID.

---

### POST `/api/ventas`

**Rol requerido:** `ADMIN` o `VENDEDOR`

Registra una nueva venta. Descuenta el stock automáticamente y genera el movimiento de inventario.

#### Request Body

```json
{
  "clienteId": 1,
  "tipoComprobante": "BOLETA",
  "observaciones": "Venta a crédito 30 días",
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 1,
      "precioUnitario": 3200.00,
      "descuento": 0.00
    },
    {
      "productoId": 2,
      "cantidad": 3,
      "precioUnitario": 75.00,
      "descuento": 5.00
    }
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `clienteId` | `Long` | ✅ | ID del cliente |
| `tipoComprobante` | `String` | ✅ | `BOLETA`, `FACTURA` o `TICKET` |
| `observaciones` | `String` | ⬜ | Observaciones adicionales |
| `detalles` | `Array` | ✅ | Lista de productos vendidos (mín. 1) |
| `detalles[].productoId` | `Long` | ✅ | ID del producto |
| `detalles[].cantidad` | `Integer` | ✅ | Cantidad (mín. 1) |
| `detalles[].precioUnitario` | `BigDecimal` | ✅ | Precio unitario (>= 0.0) |
| `detalles[].descuento` | `BigDecimal` | ⬜ | Descuento en % (0.0 a 100.0, default=0) |

#### Response `200 OK`

Retorna el objeto `Venta` registrado con número generado automáticamente.

#### Response `400 Bad Request`

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Stock insuficiente para el producto: Laptop HP 15"
}
```

---

### PATCH `/api/ventas/{id}/anular`

**Rol requerido:** `ADMIN`

Anula una venta y revierte el stock de los productos involucrados.

#### Response `200 OK`

Retorna la venta con estado `ANULADA`.

---

## 11. Módulo: Compras

**Base path:** `/api/compras`
**Autenticación requerida:** ✅ Sí

---

### GET `/api/compras`

Lista todas las compras registradas.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "numeroCompra": "CMP-00001",
    "estado": "PENDIENTE",
    "subtotal": 2118.64,
    "igv": 381.36,
    "total": 2500.00,
    "observaciones": "Pedido urgente",
    "proveedor": {
      "id": 1,
      "razonSocial": "Distribuidora Tech SAC",
      "ruc": "20123456789"
    },
    "usuario": {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "fechaCompra": "2024-01-15T09:00:00",
    "fechaEsperada": "2024-01-20"
  }
]
```

---

### GET `/api/compras/{id}`

Obtiene una compra por su ID.

---

### POST `/api/compras`

**Rol requerido:** `ADMIN` o `ALMACENERO`

Registra una nueva orden de compra. Queda inicialmente en estado `PENDIENTE`.

#### Request Body

```json
{
  "proveedorId": 1,
  "observaciones": "Pedido mensual de reposición",
  "fechaEsperada": "2024-01-25",
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 5,
      "precioUnitario": 2500.00
    },
    {
      "productoId": 2,
      "cantidad": 20,
      "precioUnitario": 45.00
    }
  ]
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|:---------:|-------------|
| `proveedorId` | `Long` | ✅ | ID del proveedor |
| `observaciones` | `String` | ⬜ | Observaciones adicionales |
| `fechaEsperada` | `String` | ⬜ | Fecha esperada de recepción (`YYYY-MM-DD`) |
| `detalles` | `Array` | ✅ | Lista de productos a comprar (mín. 1) |
| `detalles[].productoId` | `Long` | ✅ | ID del producto |
| `detalles[].cantidad` | `Integer` | ✅ | Cantidad (mín. 1) |
| `detalles[].precioUnitario` | `BigDecimal` | ✅ | Precio unitario (>= 0.0) |

#### Response `200 OK`

Retorna el objeto `Compra` con número generado automáticamente y estado `PENDIENTE`.

---

### PATCH `/api/compras/{id}/recibir`

**Rol requerido:** `ADMIN` o `ALMACENERO`

Marca una compra como recibida. Incrementa el stock de los productos y genera el movimiento de inventario.

#### Response `200 OK`

Retorna la compra con estado `RECIBIDA`.

#### Response `400 Bad Request`

Si la compra ya fue recibida o está anulada.

---

## 12. Módulo: Inventario

**Base path:** `/api/inventario`
**Autenticación requerida:** ✅ Sí
**Rol requerido:** Cualquier rol autenticado

---

### GET `/api/inventario`

Lista todos los movimientos de inventario.

#### Response `200 OK`

```json
[
  {
    "id": 1,
    "tipo": "SALIDA",
    "cantidad": 1,
    "stockAnterior": 11,
    "stockNuevo": 10,
    "motivo": "Venta registrada",
    "referenciaId": 1,
    "referenciaTipo": "VENTA",
    "producto": {
      "id": 1,
      "codigo": "PROD-001",
      "nombre": "Laptop HP 15"
    },
    "usuario": {
      "id": 2,
      "nombre": "Luis",
      "apellido": "Mendoza"
    },
    "fecha": "2024-01-15T14:30:00"
  }
]
```

| Campo | Descripción |
|-------|-------------|
| `tipo` | Tipo de movimiento: `ENTRADA`, `SALIDA`, `AJUSTE` |
| `referenciaTipo` | Origen: `VENTA`, `COMPRA`, `AJUSTE` |

---

### GET `/api/inventario/producto/{productoId}`

Historial de movimientos de un producto específico, ordenado por fecha descendente.

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `productoId` | `Long` | ID del producto |

#### Response `200 OK`

Lista de movimientos del producto ordenados por fecha descendente.

---

## 13. Módulo: Dashboard

**Base path:** `/api/dashboard`
**Autenticación requerida:** ✅ Sí
**Rol requerido:** Cualquier rol autenticado

---

### GET `/api/dashboard/stats`

Retorna estadísticas generales del sistema.

#### Response `200 OK`

```json
{
  "totalVentasHoy": 5,
  "montoVentasHoy": 15750.00,
  "totalProductos": 48,
  "productosStockBajo": 3,
  "totalClientes": 120,
  "ventasMes": 87,
  "montoVentasMes": 245680.00,
  "comprasPendientes": 2
}
```

---

## 14. Módulo: Reportes

**Base path:** `/api/reportes`
**Autenticación requerida:** ✅ Sí
**Rol requerido:** `ADMIN`

Los reportes se generan como archivos **PDF** (iTextPDF 5.5.13).

---

### GET `/api/reportes/ventas`

Genera y descarga el reporte de ventas en PDF.

#### Response Headers

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename=reporte-ventas.pdf` |

---

### GET `/api/reportes/inventario`

Genera y descarga el reporte de inventario en PDF.

#### Response Headers

| Header | Valor |
|--------|-------|
| `Content-Type` | `application/pdf` |
| `Content-Disposition` | `attachment; filename=reporte-inventario.pdf` |

---

## 15. Manejo de Errores

### Formato de Error Estándar

```json
{
  "timestamp": "2024-01-15T10:30:00.123",
  "status": 404,
  "error": "Descripción del error"
}
```

### Errores de Validación (`400 Bad Request`)

```json
{
  "timestamp": "2024-01-15T10:30:00.123",
  "status": 400,
  "error": "Validación fallida",
  "campos": {
    "nombre": "must not be blank",
    "email": "must be a well-formed email address",
    "password": "size must be between 6 and 100"
  }
}
```

### Tabla de Códigos HTTP

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| `200 OK` | Operación exitosa | GET, POST, PUT, PATCH exitosos |
| `204 No Content` | Sin contenido | DELETE exitoso |
| `400 Bad Request` | Solicitud inválida | Validación fallida, estado inválido |
| `401 Unauthorized` | No autenticado | Token ausente, inválido o expirado |
| `403 Forbidden` | Sin permisos | Rol insuficiente para la operación |
| `404 Not Found` | No encontrado | Recurso no existe o fue eliminado |
| `500 Internal Server Error` | Error del servidor | Error inesperado |

---

## 16. Configuración CORS

| Configuración | Valor |
|---------------|-------|
| `allowed-origins` | `http://localhost:4200` (Angular dev) |
| `allowed-methods` | `GET, POST, PUT, DELETE, PATCH, OPTIONS` |
| `allowed-headers` | `*` (todos) |
| `allow-credentials` | `true` |

---

## 📌 Apéndice: Enumeraciones del Sistema

### TipoDocumento (Cliente)

| Valor | Descripción |
|-------|-------------|
| `DNI` | Documento Nacional de Identidad |
| `RUC` | Registro Único de Contribuyentes |
| `PASAPORTE` | Pasaporte |
| `CE` | Carné de Extranjería |

### TipoComprobante (Venta)

| Valor | Descripción |
|-------|-------------|
| `BOLETA` | Boleta de venta |
| `FACTURA` | Factura electrónica |
| `TICKET` | Ticket simple |

### EstadoVenta

| Valor | Descripción |
|-------|-------------|
| `PENDIENTE` | Venta pendiente |
| `COMPLETADA` | Venta realizada exitosamente |
| `ANULADA` | Venta anulada |

### EstadoCompra

| Valor | Descripción |
|-------|-------------|
| `PENDIENTE` | Orden enviada, esperando recepción |
| `RECIBIDA` | Mercadería recibida en almacén |
| `PARCIAL` | Recepción parcial |
| `ANULADA` | Orden anulada |

### TipoMovimiento (Inventario)

| Valor | Descripción |
|-------|-------------|
| `ENTRADA` | Ingreso de stock (compra recibida) |
| `SALIDA` | Salida de stock (venta registrada) |
| `AJUSTE` | Ajuste manual de inventario |

---

## 🔧 Información del Servidor

| Parámetro | Valor |
|-----------|-------|
| Puerto | `8080` |
| Context Path | `/api` |
| Base URL | `http://localhost:8080/api` |
| Base de datos | MySQL 8 — `tienda_db` |
| Framework | Spring Boot 3.3.4 |
| Java | 21 |

---

*Documentación generada desde el código fuente del proyecto `com.tienda.backend`.*
