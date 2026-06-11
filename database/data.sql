-- ============================================================
--  DATOS INICIALES (seed data)
-- ============================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
('ADMIN',       'Administrador del sistema con acceso total'),
('VENDEDOR',    'Puede registrar ventas y gestionar clientes'),
('ALMACENERO',  'Puede gestionar inventario y órdenes de compra');

-- Usuarios (password = "admin123" bcrypt hasheado)
INSERT INTO usuarios (nombre, apellido, username, email, password, telefono, rol_id) VALUES
('Admin',    'Sistema',    'admin',    'admin@tienda.com',    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTkVPex5the', '999000001', 1),
('Juan',     'Pérez',      'jperez',   'jperez@tienda.com',   '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTkVPex5the', '999000002', 2),
('María',    'García',     'mgarcia',  'mgarcia@tienda.com',  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTkVPex5the', '999000003', 3);

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica',     'Dispositivos electrónicos y accesorios'),
('Ropa',            'Prendas de vestir y accesorios de moda'),
('Alimentos',       'Productos alimenticios y bebidas'),
('Hogar',           'Artículos para el hogar'),
('Herramientas',    'Herramientas y equipos de trabajo');

-- Almacenes
INSERT INTO almacenes (nombre, ubicacion, responsable) VALUES
('Almacén Principal',  'Zona A - Piso 1', 'María García'),
('Almacén Secundario', 'Zona B - Piso 2', 'Carlos López');

-- Productos de ejemplo
INSERT INTO productos (codigo, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, categoria_id, almacen_id) VALUES
('ELEC-001', 'Laptop HP 15"',          'Laptop HP Core i5, 8GB RAM, 512GB SSD',  2500.00, 3200.00, 15, 3, 1, 1),
('ELEC-002', 'Mouse Inalámbrico',      'Mouse inalámbrico Logitech 2.4GHz',          25.00,   45.00, 50, 10, 1, 1),
('ELEC-003', 'Teclado Mecánico',       'Teclado mecánico RGB USB',                   80.00,  130.00, 30, 5,  1, 1),
('ROPA-001', 'Polo Deportivo',         'Polo 100% algodón, tallas S-XL',              15.00,   35.00, 100, 20, 2, 2),
('ROPA-002', 'Jeans Slim Fit',         'Jeans stretch, tallas 28-40',                 40.00,   90.00, 60,  15, 2, 2),
('ALIM-001', 'Café Premium 500g',      'Café molido premium 500 gramos',              12.00,   22.00, 80,  20, 3, 1),
('ALIM-002', 'Chocolate Bitter 200g',  'Chocolate amargo premium 200 gramos',          8.00,   15.00, 120, 30, 3, 1),
('HOGA-001', 'Set Ollas Antiadherente','Set 5 ollas antiadherentes con tapa',         65.00,  120.00, 25,  5,  4, 2),
('HERR-001', 'Taladro Percutor 750W',  'Taladro percutor 750W con accesorios',        90.00,  160.00, 20,  5,  5, 2);

-- Clientes de ejemplo
INSERT INTO clientes (nombres, apellidos, tipo_doc, nro_doc, email, telefono, direccion) VALUES
('Carlos',    'Rodríguez',  'DNI', '12345678', 'carlos.r@email.com',  '987654321', 'Av. Lima 123, Lima'),
('Ana',       'Martínez',   'DNI', '87654321', 'ana.m@email.com',     '987654322', 'Jr. Cusco 456, Lima'),
('Tech S.A.', 'Corp',       'RUC', '20123456789', 'tech@corp.com',   '01-1234567', 'Av. Javier Prado 789'),
('Pedro',     'Quispe',     'DNI', '11223344', 'pedro.q@email.com',   '987654323', 'Calle San Martín 10'),
('Lucia',     'Flores',     'DNI', '44332211', 'lucia.f@email.com',   '987654324', 'Jr. Arequipa 55');

-- Proveedores de ejemplo
INSERT INTO proveedores (razon_social, ruc, email, telefono, direccion, contacto) VALUES
('Distribuidora Tech S.A.C.',   '20100000001', 'ventas@disttech.com',  '01-5550001', 'Av. Argentina 100, Lima',     'Roberto Silva'),
('Importaciones El Comercio',   '20100000002', 'ventas@elcomercio.com','01-5550002', 'Av. Colonial 200, Lima',      'Sandra Vega'),
('Proveedor Alimentos Peru S.A.','20100000003', 'info@alimperu.com',   '01-5550003', 'Av. Venezuela 300, Lima',     'Diego Torres'),
('Moda & Estilo S.A.C.',         '20100000004', 'ventas@modaestilo.com','01-5550004', 'Jr. Gamarra 400, La Victoria','Patricia Huanca');
