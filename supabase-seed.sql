-- ============================================================
-- HOTEL ROOM MANAGER - Datos de ejemplo (nuevo esquema PMS)
-- Pega esto en el SQL Editor de Supabase y da Run
-- ============================================================

-- Usamos un hotel fijo para los ejemplos
WITH hotel AS (
  INSERT INTO hoteles (id, nombre, direccion, telefono, email, ruc)
  VALUES ('00000000-0000-0000-0000-000000000001', 'Hotel Paraíso', 'Av. Principal 123', '+51 1 234 5678', 'contacto@hotelparaiso.com', '20123456789')
  ON CONFLICT (id) DO NOTHING
  RETURNING id
),
tipos AS (
  INSERT INTO tipos_habitacion (id, hotel_id, nombre, descripcion, capacidad, precio_base) VALUES
    ('t1', (SELECT id FROM hotel), 'Sencilla', 'Habitación individual con baño privado', 1, 850),
    ('t2', (SELECT id FROM hotel), 'Doble', 'Habitación para dos personas', 2, 1500),
    ('t3', (SELECT id FROM hotel), 'Suite', 'Suite de lujo con jacuzzi y balcón', 4, 3200)
  ON CONFLICT (id) DO NOTHING
),
pisos AS (
  INSERT INTO pisos (id, hotel_id, nombre, cantidad_cuartos) VALUES
    ('p1', (SELECT id FROM hotel), 'Piso 1', 8),
    ('p2', (SELECT id FROM hotel), 'Piso 2', 8),
    ('p3', (SELECT id FROM hotel), 'Piso 3', 8),
    ('p4', (SELECT id FROM hotel), 'Piso 4', 8)
  ON CONFLICT (id) DO NOTHING
),
habitaciones AS (
  INSERT INTO habitaciones (id, hotel_id, tipo_habitacion_id, piso_id, numero, nombre, estado, precio_por_noche, caracteristicas) VALUES
    ('h1', (SELECT id FROM hotel), 't1', 'p1', 101, '101', 'limpia', 850,   ARRAY['Wi-Fi', 'Aire Acondicionado', 'TV']),
    ('h2', (SELECT id FROM hotel), 't2', 'p2', 205, '205', 'ocupada', 1500, ARRAY['Wi-Fi', 'Aire Acondicionado', 'Minibar', 'Vista al Mar']),
    ('h3', (SELECT id FROM hotel), 't3', 'p3', 301, '301', 'ocupada', 3200, ARRAY['Wi-Fi', 'Aire Acondicionado', 'Minibar', 'Vista al Mar', 'Jacuzzi', 'Balcón']),
    ('h4', (SELECT id FROM hotel), 't1', 'p1', 102, '102', 'limpia', 750,   ARRAY['Wi-Fi', 'TV']),
    ('h5', (SELECT id FROM hotel), 't2', 'p2', 208, '208', 'limpia', 1400,  ARRAY['Wi-Fi', 'Aire Acondicionado', 'Caja Fuerte'])
  ON CONFLICT (id) DO NOTHING
),
huespedes AS (
  INSERT INTO huespedes (id, hotel_id, nombre, apellido, tipo_documento, numero_documento, email, telefono, notas) VALUES
    ('hu1', (SELECT id FROM hotel), 'María', 'García López', 'DNI', '12345678', 'maria@email.com', '+51 999 111 222', 'Cliente frecuente, prefiere habitación silenciosa'),
    ('hu2', (SELECT id FROM hotel), 'Carlos', 'Mendoza Ruiz', 'DNI', '87654321', 'carlos@email.com', '+51 999 333 444', 'Solicitó cuna para bebé'),
    ('hu3', (SELECT id FROM hotel), 'Ana', 'Torres Pérez', 'DNI', '45678901', 'ana@email.com', '+51 999 555 666', '')
  ON CONFLICT (id) DO NOTHING
),
reservas AS (
  INSERT INTO reservas (id, hotel_id, habitacion_id, huesped_id, fecha_checkin, fecha_checkout, estado, total) VALUES
    ('r1', (SELECT id FROM hotel), 'h2', 'hu1', '2026-02-28', '2026-03-05', 'checked_in', 7500),
    ('r2', (SELECT id FROM hotel), 'h3', 'hu2', '2026-03-01', '2026-03-10', 'checked_in', 28800)
  ON CONFLICT (id) DO NOTHING
)
INSERT INTO inventario (id, hotel_id, nombre, cantidad, categoria, min_stock) VALUES
  ('i1', (SELECT id FROM hotel), 'Toallas',          30, 'Blancos', 10),
  ('i2', (SELECT id FROM hotel), 'Jabón de baño',    50, 'Aseo',   20),
  ('i3', (SELECT id FROM hotel), 'Champú',            8, 'Aseo',   15),
  ('i4', (SELECT id FROM hotel), 'Coca-Cola',        24, 'Minibar', 12),
  ('i5', (SELECT id FROM hotel), 'Agua embotellada', 40, 'Minibar', 20),
  ('i6', (SELECT id FROM hotel), 'Sábanas extra',    15, 'Blancos',  5)
ON CONFLICT (id) DO NOTHING;
