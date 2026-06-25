# Plan de Validaciones de Datos en DTOs y Controladores

Este documento detalla el plan de validación de datos del lado del servidor implementado en el backend utilizando **Jakarta Bean Validation** (anteriormente JSR 380). Se describe el propósito de las anotaciones utilizadas, su aplicación en los DTOs del proyecto, la activación de las validaciones en los controladores y el manejo centralizado de excepciones para retornar respuestas de error amigables en formato JSON (HTTP 400).

---

## 1. Anotaciones de Validación Utilizadas

El sistema emplea las siguientes anotaciones para verificar que los datos enviados por los clientes cumplan con las reglas de negocio:

* **@NotBlank:** Valida que el campo de tipo String no sea nulo y que su longitud sea mayor a cero, ignorando los espacios en blanco.
* **@NotNull:** Valida que el campo no sea nulo (aplica a cualquier tipo de dato, como IDs numéricos o listas).
* **@NotEmpty:** Valida que la colección, mapa o arreglo no sea nulo y contenga al menos un elemento.
* **@Size(min=X, max=Y):** Define el límite de longitud mínima y/o máxima permitida para cadenas de caracteres o colecciones.
* **@Email:** Valida que la cadena de texto tenga una estructura de dirección de correo electrónico correcta.
* **@Min(value=X):** Establece el valor entero mínimo permitido para un campo numérico.
* **@DecimalMin(value=X):** Establece el valor decimal mínimo permitido (adecuado para campos de tipo `BigDecimal`).
* **@DecimalMax(value=X):** Establece el valor decimal máximo permitido.
* **@Valid:** Habilita la validación recursiva o en cascada para colecciones u objetos aninados (por ejemplo, para validar cada detalle de una venta o compra contenido dentro de una lista).

---

## 2. Validación en DTOs (Data Transfer Objects)

Las reglas de validación se aplican directamente en las clases de solicitud (Request DTOs) que reciben datos de entrada desde los controladores:

### [LoginRequest.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/request/LoginRequest.java)
* **username:**
  * `@NotBlank(message = "El username es requerido")` — Asegura que se proporcione el identificador del usuario.
* **password:**
  * `@NotBlank(message = "La contraseña es requerida")` — Asegura que se proporcione la clave del usuario.

---

### [UsuarioRequest.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/request/UsuarioRequest.java)
* **nombre:**
  * `@NotBlank` y `@Size(max = 100)` — Obligatorio, máximo 100 caracteres.
* **apellido:**
  * `@NotBlank` y `@Size(max = 100)` — Obligatorio, máximo 100 caracteres.
* **username:**
  * `@NotBlank` y `@Size(max = 50)` — Obligatorio, máximo 50 caracteres.
* **email:**
  * `@NotBlank` y `@Email` — Obligatorio, formato de correo electrónico estructurado.
* **password:**
  * `@Size(min = 6, max = 100)` — Contraseña opcional en actualizaciones, pero de proporcionarse debe poseer mínimo 6 y máximo 100 caracteres.
* **telefono:**
  * `@Size(max = 20)` — Máximo 20 caracteres.
* **rolId:**
  * `@NotNull` — Identificador del rol obligatorio.

---

### [ProductoRequest.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/request/ProductoRequest.java)
* **codigo:**
  * `@NotBlank` y `@Size(max = 50)` — Obligatorio, máximo 50 caracteres.
* **nombre:**
  * `@NotBlank` y `@Size(max = 150)` — Obligatorio, máximo 150 caracteres.
* **precioCompra:**
  * `@NotNull` y `@DecimalMin("0.0")` — Obligatorio, no puede ser negativo.
* **precioVenta:**
  * `@NotNull` y `@DecimalMin("0.0")` — Obligatorio, no puede ser negativo.
* **stockActual:**
  * `@Min(0)` — No puede ser menor a cero.
* **stockMinimo:**
  * `@Min(0)` — No puede ser menor a cero (por defecto es 5).
* **categoriaId:**
  * `@NotNull` — Identificador de categoría obligatorio.

---

### [CompraRequest.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/request/CompraRequest.java)
* **proveedorId:**
  * `@NotNull` — Identificador del proveedor obligatorio.
* **detalles:**
  * `@NotEmpty` y `@Valid` — La lista de detalles de la compra no puede estar vacía y cada elemento dentro de ella debe validarse de forma individual según las reglas especificadas en su clase estática interna `DetalleCompraRequest`:
    * **productoId:** `@NotNull`
    * **cantidad:** `@NotNull` y `@Min(1)` — Mínimo 1 unidad por item comprado.
    * **precioUnitario:** `@NotNull` y `@DecimalMin("0.0")` — No puede ser negativo.

---

### [VentaRequest.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/dto/request/VentaRequest.java)
* **clienteId:**
  * `@NotNull` — Identificador del cliente obligatorio.
* **tipoComprobante:**
  * `@NotBlank` — Obligatorio (ej: BOLETA, FACTURA, TICKET).
* **detalles:**
  * `@NotEmpty` y `@Valid` — Requiere que la lista contenga al menos un item de venta y valida individualmente cada item según `DetalleVentaRequest`:
    * **productoId:** `@NotNull`
    * **cantidad:** `@NotNull` y `@Min(1)` — Mínimo 1 unidad vendida.
    * **precioUnitario:** `@NotNull` y `@DecimalMin("0.0")` — Debe ser positivo.
    * **descuento:** `@DecimalMin("0.0")` y `@DecimalMax("100.0")` — Límite de porcentaje de descuento entre 0% y 100%.

---

## 3. Activación en Controladores

Para que las reglas de validación se ejecuten, se requiere usar la anotación `@Valid` delante del parámetro anotado con `@RequestBody` en los métodos correspondientes de los controladores. Por ejemplo:

```java
// Ejemplo en AuthController.java
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) { ... }

// Ejemplo en ProductoController.java
@PostMapping
public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoRequest request) { ... }
```

Si el payload enviado por el cliente contiene datos que violan alguna anotación de validación, Spring Boot detiene la ejecución del método y lanza una excepción `MethodArgumentNotValidException`.

---

## 4. Gestión y Formateo Centralizado de Errores de Validación

Para evitar que el cliente reciba una traza de error de servidor (HTTP 500) o una respuesta por defecto poco clara, el proyecto incluye un manejador global de excepciones: [GlobalExceptionHandler.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/exception/GlobalExceptionHandler.java).

Este manejador intercepta `MethodArgumentNotValidException` y extrae cada campo fallido junto con su respectivo mensaje de error para retornar una respuesta estructurada con código de estado **HTTP 400 Bad Request**:

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getAllErrors().forEach(error -> {
        String field = ((FieldError) error).getField();
        errors.put(field, error.getDefaultMessage());
    });
    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", LocalDateTime.now().toString());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Validación fallida");
    body.put("campos", errors);
    return ResponseEntity.badRequest().body(body);
}
```

### Ejemplo de Respuesta JSON de Error (HTTP 400)
Cuando un cliente intenta registrar un producto sin `codigo`, sin `nombre` y con `precioCompra` negativo, el servidor responde automáticamente:

```json
{
  "timestamp": "2026-06-18T01:30:00.123456",
  "status": 400,
  "error": "Validación fallida",
  "campos": {
    "codigo": "must not be blank",
    "nombre": "must not be blank",
    "precioCompra": "must be greater than or equal to 0.0"
  }
}
```
