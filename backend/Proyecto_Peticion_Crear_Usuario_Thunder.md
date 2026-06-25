# Plan de Petición HTTP para Creación de Usuario (Thunder Client / Postman)

Este documento detalla la petición HTTP `POST` requerida para registrar un nuevo usuario en la base de datos del sistema a través de herramientas de prueba de API como **Thunder Client** o **Postman**.

---

## 1. Detalles de la Petición

### URL y Método
* **Método:** `POST`
* **URL:** `http://localhost:8080/api/usuarios`

### Encabezados (Headers)
Debe incluir el token JWT de autenticación de un usuario con rol **ADMIN** (ya que la ruta [UsuarioController.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/controller/UsuarioController.java) está protegida con `@PreAuthorize("hasRole('ADMIN')")`):

```http
Content-Type: application/json
Authorization: Bearer <TOKEN_JWT_DEL_ADMINISTRADOR>
```

---

## 2. Cuerpo de la Petición (Request Body)

El cuerpo debe enviarse en formato JSON crudo (raw JSON) respetando las reglas de Bean Validation (nombre y apellido obligatorios, correo válido, contraseña de al menos 6 caracteres y un `rolId` válido):

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "username": "juanperez",
  "email": "juan.perez@example.com",
  "password": "user1234",
  "telefono": "987654321",
  "rolId": 2,
  "activo": true
}
```

### Descripción de Campos del JSON:
* **nombre / apellido:** Obligatorios (máx 100 caracteres).
* **username:** Nombre de inicio de sesión único (máx 50 caracteres).
* **email:** Correo electrónico válido y único (máx 150 caracteres).
* **password:** Contraseña en texto plano. Se encriptará automáticamente con BCrypt antes de persistir (mínimo 6 caracteres).
* **telefono:** Opcional (máx 20 caracteres).
* **rolId:** ID del rol asignado (ejemplo: `1` para ADMIN, `2` para USER, `3` para ALMACENERO, etc. según la tabla de roles de tu base de datos).
* **activo:** Booleano opcional (por defecto se guarda como `true`).

---

## 3. Ejemplo de Flujo de Trabajo en Thunder Client

1. **Obtener Token de Administrador:**
   * Enviar petición `POST` a `http://localhost:8080/api/auth/login` con el JSON de credenciales de administrador (ej: username `12345678` y password `admin123`).
   * Copiar el valor del campo `token` recibido en la respuesta JSON.
2. **Configurar Petición de Creación:**
   * Abrir una nueva pestaña en Thunder Client.
   * Seleccionar método `POST` e ingresar la URL `http://localhost:8080/api/usuarios`.
   * En la pestaña **Headers**, agregar la clave `Authorization` con valor `Bearer <Token_Copiado>`.
   * En la pestaña **Body**, seleccionar **JSON** e ingresar el cuerpo del JSON indicado arriba.
   * Presionar **Send**. De ser exitoso, se retornará un estado HTTP **200 OK** con la entidad del usuario recién creada (excluyendo la contraseña por seguridad).
