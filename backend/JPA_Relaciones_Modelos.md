# Plan de Relaciones entre Modelos JPA del Proyecto Backend

Este documento detalla todas las relaciones JPA configuradas entre las entidades en el proyecto. Se organizan en relaciones bidireccionales y relaciones unidireccionales, describiendo la cardinalidad, el comportamiento de carga (fetch), las claves foráneas (@JoinColumn) y las opciones de propagación (cascade).

---

## 1. Relaciones Bidireccionales (OneToMany ↔ ManyToOne)

En estas relaciones, ambas entidades se conocen mutuamente. Una de ellas es dueña de la relación (posee la clave foránea en la base de datos) y la otra mapea la relación de manera inversa.

### Relación: Rol y Usuario

[Rol.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Rol.java) ↔ [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java)

* **OneToMany — Un rol tiene muchos usuarios:**
  * La entidad [Rol.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Rol.java) contiene una `List<Usuario>` anotada con `@OneToMany(mappedBy = "rol", fetch = FetchType.LAZY)`.
  * `mappedBy = "rol"` indica que la clase `Usuario` es la dueña de la relación (tiene la clave foránea).
  * `fetch = FetchType.LAZY` se usa para cargar los usuarios solo cuando sea necesario en lugar de cargarlos inmediatamente.
  * Tiene la anotación `@JsonIgnore` para evitar bucles infinitos durante la serialización JSON.

* **ManyToOne — Muchos usuarios pertenecen a un rol:**
  * La entidad [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java) tiene un campo `Rol` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "rol_id", nullable = false)` define la columna de clave foránea en la tabla `usuarios` y especifica que es obligatoria.
  * `fetch = FetchType.EAGER` carga el rol junto con el usuario de manera automática cuando se recupera al usuario.

---

### Relación: Categoría y Producto

[Categoria.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Categoria.java) ↔ [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java)

* **OneToMany — Una categoría tiene muchos productos:**
  * La entidad [Categoria.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Categoria.java) contiene una `List<Producto>` anotada con `@OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)`.
  * `mappedBy = "categoria"` indica que la clase `Producto` es la dueña de la relación.
  * `fetch = FetchType.LAZY` retrasa la carga de los productos hasta que sean accedidos.
  * Está decorada con `@JsonIgnore` para evitar recursión circular al serializar a formato JSON.

* **ManyToOne — Muchos productos pertenecen a una categoría:**
  * La entidad [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java) tiene un campo `Categoria` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "categoria_id", nullable = false)` define la columna de clave foránea `categoria_id` en la tabla `productos` y restringe la nulabilidad.
  * `fetch = FetchType.EAGER` carga la categoría de forma inmediata al recuperar un producto.

---

### Relación: Almacén y Producto

[Almacen.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Almacen.java) ↔ [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java)

* **OneToMany — Un almacén tiene muchos productos:**
  * La entidad [Almacen.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Almacen.java) contiene una `List<Producto>` anotada con `@OneToMany(mappedBy = "almacen", fetch = FetchType.LAZY)`.
  * `mappedBy = "almacen"` establece que `Producto` gestiona la clave foránea.
  * `fetch = FetchType.LAZY` indica que los productos se cargan bajo demanda.
  * Tiene la anotación `@JsonIgnore` para omitir la lista de productos de la serialización directa de la entidad.

* **ManyToOne — Muchos productos pertenecen a un almacén:**
  * La entidad [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java) tiene un campo `Almacen` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "almacen_id")` define la clave foránea `almacen_id` en la tabla `productos`. Al no especificar `nullable = false`, se permite que un producto no pertenezca a ningún almacén (sea nulo).
  * `fetch = FetchType.EAGER` carga automáticamente los datos del almacén asociado con el producto.

---

### Relación: Cliente y Venta

[Cliente.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Cliente.java) ↔ [Venta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Venta.java)

* **OneToMany — Un cliente realiza muchas ventas:**
  * La entidad [Cliente.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Cliente.java) contiene una `List<Venta>` anotada con `@OneToMany(mappedBy = "cliente", fetch = FetchType.LAZY)`.
  * `mappedBy = "cliente"` indica que `Venta` es dueña de la relación.
  * `fetch = FetchType.LAZY` optimiza la consulta evitando la carga innecesaria del historial de ventas de un cliente.
  * Contiene `@JsonIgnore` para prevenir recursividad JSON.

* **ManyToOne — Muchas ventas pertenecen a un cliente:**
  * La entidad [Venta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Venta.java) tiene un campo `Cliente` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "cliente_id", nullable = false)` especifica que la clave foránea `cliente_id` es obligatoria en la tabla `ventas`.
  * `fetch = FetchType.EAGER` recupera al cliente de forma conjunta con la información de la venta.

---

### Relación: Proveedor y Compra

[Proveedor.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Proveedor.java) ↔ [Compra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Compra.java)

* **OneToMany — Un proveedor realiza / provee muchas compras:**
  * La entidad [Proveedor.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Proveedor.java) contiene una `List<Compra>` anotada con `@OneToMany(mappedBy = "proveedor", fetch = FetchType.LAZY)`.
  * `mappedBy = "proveedor"` define que `Compra` posee la columna de clave foránea.
  * `fetch = FetchType.LAZY` difiere el procesamiento de las compras asociadas a cuando se soliciten explícitamente.
  * Utiliza `@com.fasterxml.jackson.annotation.JsonIgnore` para evitar serializaciones cíclicas.

* **ManyToOne — Muchas compras pertenecen a un proveedor:**
  * La entidad [Compra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Compra.java) tiene un campo `Proveedor` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "proveedor_id", nullable = false)` define la columna de clave foránea `proveedor_id` en la tabla `compras`, siendo obligatoria.
  * `fetch = FetchType.EAGER` carga la entidad proveedor conjuntamente con la compra.

---

### Relación: Venta y DetalleVenta

[Venta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Venta.java) ↔ [DetalleVenta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleVenta.java)

* **OneToMany — Una venta tiene muchos detalles:**
  * La entidad [Venta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Venta.java) contiene una `List<DetalleVenta>` anotada con `@OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)`.
  * `mappedBy = "venta"` define a la entidad `DetalleVenta` como dueña de la relación.
  * `cascade = CascadeType.ALL` propaga todas las operaciones de persistencia, borrado y actualización desde el padre (`Venta`) a los hijos (`DetalleVenta`).
  * `orphanRemoval = true` elimina automáticamente de la base de datos aquellos detalles que sean removidos de la colección en memoria.
  * Tiene la anotación `@JsonIgnore` para evitar que la serialización de detalles cause un ciclo infinito.

* **ManyToOne — Muchos detalles pertenecen a una venta:**
  * La entidad [DetalleVenta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleVenta.java) contiene un campo `Venta` anotado con `@ManyToOne(fetch = FetchType.LAZY)`.
  * `@JoinColumn(name = "venta_id", nullable = false)` asocia la clave foránea en la tabla `detalle_ventas`.
  * `fetch = FetchType.LAZY` optimiza el rendimiento cargando la venta solo cuando se requiera explícitamente (al contrario de `EAGER` para evitar consultas redundantes de ventas).
  * También cuenta con `@JsonIgnore` para mitigar la recursión bidireccional.

---

### Relación: Compra y DetalleCompra

[Compra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Compra.java) ↔ [DetalleCompra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleCompra.java)

* **OneToMany — Una compra tiene muchos detalles:**
  * La entidad [Compra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Compra.java) contiene una `List<DetalleCompra>` anotada con `@OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)`.
  * `mappedBy = "compra"` indica que `DetalleCompra` gestiona la relación a nivel físico.
  * `cascade = CascadeType.ALL` asegura la sincronización CRUD completa de los detalles cuando se modifica la compra.
  * `orphanRemoval = true` garantiza que cualquier detalle borrado de la lista se elimine de la base de datos.
  * Tiene `@JsonIgnore` para controlar la serialización de datos.

* **ManyToOne — Muchos detalles pertenecen a una compra:**
  * La entidad [DetalleCompra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleCompra.java) tiene un campo `Compra` anotado con `@ManyToOne(fetch = FetchType.LAZY)`.
  * `@JoinColumn(name = "compra_id", nullable = false)` define la columna de enlace en la base de datos.
  * `fetch = FetchType.LAZY` carga los datos de la compra solo si son requeridos en el código.
  * Decorado con `@JsonIgnore` para evitar loops en respuestas JSON.

---

## 2. Relaciones Unidireccionales (ManyToOne)

En estas relaciones, la entidad origen conoce a la entidad destino mediante una clave foránea, pero la entidad destino no mantiene ninguna lista o referencia de vuelta a la entidad origen.

### Relación: Usuario y Compra

[Compra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Compra.java) → [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java)

* **ManyToOne — Muchas compras son registradas por un usuario:**
  * La entidad [Compra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Compra.java) tiene un campo `Usuario` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "usuario_id", nullable = false)` define la columna de clave foránea `usuario_id` en la tabla `compras`.
  * `fetch = FetchType.EAGER` carga la información del usuario automáticamente al consultar una compra.
  * *Nota: La entidad [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java) no tiene referencia a `Compra`.*

---

### Relación: Usuario y Venta

[Venta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Venta.java) → [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java)

* **ManyToOne — Muchas ventas son registradas por un usuario:**
  * La entidad [Venta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Venta.java) tiene un campo `Usuario` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "usuario_id", nullable = false)` define la columna de clave foránea `usuario_id` en la tabla `ventas`.
  * `fetch = FetchType.EAGER` obtiene los datos del vendedor adjuntos al registro de la venta.
  * *Nota: La entidad [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java) no tiene referencia a `Venta`.*

---

### Relación: Usuario e Inventario

[Inventario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Inventario.java) → [Usuario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Usuario.java)

* **ManyToOne — Muchos movimientos de inventario son realizados por un usuario:**
  * La entidad [Inventario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Inventario.java) tiene un campo `Usuario` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "usuario_id", nullable = false)` define la clave foránea `usuario_id` en la tabla `inventario`.
  * `fetch = FetchType.EAGER` carga inmediatamente el usuario que ejecutó la transacción de inventario.

---

### Relación: Producto e Inventario

[Inventario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Inventario.java) → [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java)

* **ManyToOne — Muchos movimientos de inventario corresponden a un producto:**
  * La entidad [Inventario.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Inventario.java) tiene un campo `Producto` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "producto_id", nullable = false)` define la clave foránea `producto_id` en la tabla `inventario`.
  * `fetch = FetchType.EAGER` trae la información del producto asociado a cada movimiento en el stock.

---

### Relación: Producto y DetalleVenta

[DetalleVenta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleVenta.java) → [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java)

* **ManyToOne — Muchos detalles de venta corresponden a un producto:**
  * La entidad [DetalleVenta.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleVenta.java) tiene un campo `Producto` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "producto_id", nullable = false)` define la columna de clave foránea en la tabla `detalle_ventas`.
  * `fetch = FetchType.EAGER` asocia y recupera el producto vendido directamente con el detalle de la venta.

---

### Relación: Producto y DetalleCompra

[DetalleCompra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleCompra.java) → [Producto.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/Producto.java)

* **ManyToOne — Muchos detalles de compra corresponden a un producto:**
  * La entidad [DetalleCompra.java](file:///c:/Users/Dell/Documents/Miercoles-Proyecto/backend/src/main/java/com/tienda/backend/entity/DetalleCompra.java) tiene un campo `Producto` anotado con `@ManyToOne(fetch = FetchType.EAGER)`.
  * `@JoinColumn(name = "producto_id", nullable = false)` define la columna de clave foránea en la tabla `detalle_compras`.
  * `fetch = FetchType.EAGER` carga automáticamente los datos del producto adquirido dentro del detalle de la compra.
