-- ============================================================
--  SISTEMA DE GESTIÓN DE TIENDA — Schema MySQL 8 (3FN)
--  Orden: sin dependencias → con dependencias
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. ROLES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(50)   NOT NULL UNIQUE,   -- ADMIN, VENDEDOR, ALMACENERO
    descripcion VARCHAR(200),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. USUARIOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100)  NOT NULL,
    apellido    VARCHAR(100)  NOT NULL,
    username    VARCHAR(50)   NOT NULL UNIQUE,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    telefono    VARCHAR(20),
    activo      TINYINT(1)    NOT NULL DEFAULT 1,
    rol_id      BIGINT        NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. CATEGORIAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100)  NOT NULL UNIQUE,
    descripcion VARCHAR(300),
    activo      TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. ALMACENES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS almacenes (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100)  NOT NULL UNIQUE,
    ubicacion   VARCHAR(200),
    responsable VARCHAR(150),
    activo      TINYINT(1)    NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. PRODUCTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(50)     NOT NULL UNIQUE,
    nombre          VARCHAR(150)    NOT NULL,
    descripcion     TEXT,
    precio_compra   DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    precio_venta    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    stock_actual    INT             NOT NULL DEFAULT 0,
    stock_minimo    INT             NOT NULL DEFAULT 5,
    imagen_url      VARCHAR(500),
    codigo_barras   VARCHAR(50)     NULL,
    unidad_medida   VARCHAR(50)     NOT NULL DEFAULT 'UNIDADES',
    moneda          VARCHAR(10)     NOT NULL DEFAULT 'PEN',
    activo          TINYINT(1)      NOT NULL DEFAULT 1,
    categoria_id    BIGINT          NOT NULL,
    almacen_id      BIGINT,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT fk_producto_almacen   FOREIGN KEY (almacen_id)   REFERENCES almacenes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 6. CLIENTES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    nombres     VARCHAR(100)  NOT NULL,
    apellidos   VARCHAR(100)  NOT NULL,
    tipo_doc    ENUM('DNI','RUC','PASAPORTE','CE') NOT NULL DEFAULT 'DNI',
    nro_doc     VARCHAR(20)   NOT NULL UNIQUE,
    email       VARCHAR(150),
    telefono    VARCHAR(20),
    direccion   VARCHAR(300),
    activo      TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 7. PROVEEDORES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedores (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    razon_social VARCHAR(200) NOT NULL,
    ruc         VARCHAR(20)   NOT NULL UNIQUE,
    email       VARCHAR(150),
    telefono    VARCHAR(20),
    direccion   VARCHAR(300),
    contacto    VARCHAR(150),
    activo      TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 8. VENTAS (cabecera)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    numero_venta    VARCHAR(20)     NOT NULL UNIQUE,   -- e.g. V-2024-0001
    tipo_comprobante ENUM('BOLETA','FACTURA','TICKET') NOT NULL DEFAULT 'BOLETA',
    estado          ENUM('PENDIENTE','COMPLETADA','ANULADA') NOT NULL DEFAULT 'COMPLETADA',
    subtotal        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    igv             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,  -- 18%
    total           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    observaciones   TEXT,
    cliente_id      BIGINT          NOT NULL,
    usuario_id      BIGINT          NOT NULL,
    fecha_venta     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_venta_cliente  FOREIGN KEY (cliente_id)  REFERENCES clientes(id),
    CONSTRAINT fk_venta_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 9. DETALLE VENTA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    cantidad        INT             NOT NULL,
    precio_unitario DECIMAL(12,2)   NOT NULL,
    descuento       DECIMAL(5,2)    NOT NULL DEFAULT 0.00,  -- porcentaje
    subtotal        DECIMAL(12,2)   NOT NULL,
    venta_id        BIGINT          NOT NULL,
    producto_id     BIGINT          NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dv_venta    FOREIGN KEY (venta_id)    REFERENCES ventas(id) ON DELETE CASCADE,
    CONSTRAINT fk_dv_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 10. COMPRAS / ÓRDENES DE COMPRA (cabecera)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compras (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    numero_compra   VARCHAR(20)     NOT NULL UNIQUE,   -- e.g. C-2024-0001
    estado          ENUM('PENDIENTE','RECIBIDA','PARCIAL','ANULADA') NOT NULL DEFAULT 'PENDIENTE',
    subtotal        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    igv             DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    total           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    observaciones   TEXT,
    proveedor_id    BIGINT          NOT NULL,
    usuario_id      BIGINT          NOT NULL,
    fecha_compra    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_esperada  DATE,
    PRIMARY KEY (id),
    CONSTRAINT fk_compra_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    CONSTRAINT fk_compra_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 11. DETALLE COMPRA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_compras (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    cantidad        INT             NOT NULL,
    precio_unitario DECIMAL(12,2)   NOT NULL,
    subtotal        DECIMAL(12,2)   NOT NULL,
    compra_id       BIGINT          NOT NULL,
    producto_id     BIGINT          NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dc_compra   FOREIGN KEY (compra_id)   REFERENCES compras(id) ON DELETE CASCADE,
    CONSTRAINT fk_dc_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 12. INVENTARIO (movimientos de stock)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventario (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    tipo            ENUM('ENTRADA','SALIDA','AJUSTE') NOT NULL,
    cantidad        INT             NOT NULL,
    stock_anterior  INT             NOT NULL,
    stock_nuevo     INT             NOT NULL,
    motivo          VARCHAR(300),
    referencia_id   BIGINT,                          -- ID de venta o compra relacionada
    referencia_tipo VARCHAR(20),                     -- 'VENTA' | 'COMPRA' | 'AJUSTE'
    producto_id     BIGINT          NOT NULL,
    usuario_id      BIGINT          NOT NULL,
    fecha           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_inv_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_inv_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- ÍNDICES adicionales para búsquedas frecuentes
-- ------------------------------------------------------------
CREATE INDEX idx_productos_categoria  ON productos(categoria_id);
CREATE INDEX idx_productos_stock      ON productos(stock_actual);
CREATE INDEX idx_ventas_fecha         ON ventas(fecha_venta);
CREATE INDEX idx_ventas_cliente       ON ventas(cliente_id);
CREATE INDEX idx_compras_fecha        ON compras(fecha_compra);
CREATE INDEX idx_inventario_producto  ON inventario(producto_id);
CREATE INDEX idx_inventario_fecha     ON inventario(fecha);

SET FOREIGN_KEY_CHECKS = 1;
