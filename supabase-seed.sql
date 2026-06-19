-- ============================================================
-- HOTEL ROOM MANAGER - Datos de ejemplo
-- Pega esto en el SQL Editor de Supabase y da Run
-- ============================================================

-- 1. QUITAMOS FK de user_id temporalmente para poder insertar
ALTER TABLE pisos DROP CONSTRAINT IF EXISTS pisos_user_id_fkey;
ALTER TABLE habitaciones DROP CONSTRAINT IF EXISTS habitaciones_user_id_fkey;
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_user_id_fkey;
ALTER TABLE inventario DROP CONSTRAINT IF EXISTS inventario_user_id_fkey;

-- 2. PISOS (8 pisos)
INSERT INTO pisos (id, name, cantidad_cuartos) VALUES
  ('f-1', 'Piso 1', 8),
  ('f-2', 'Piso 2', 8),
  ('f-3', 'Piso 3', 8),
  ('f-4', 'Piso 4', 8),
  ('f-5', 'Piso 5', 8),
  ('f-6', 'Piso 6', 8),
  ('f-7', 'Piso 7', 8),
  ('f-8', 'Piso 8', 8)
ON CONFLICT (id) DO NOTHING;

-- 3. HABITACIONES (5 habitaciones de ejemplo)
INSERT INTO habitaciones (id, name, type, price_per_night, features, occupancy_start, occupancy_end, floor_id, room_number) VALUES
  ('1', '101', 'Sencilla', 850,   ARRAY['Wi-Fi', 'Aire Acondicionado', 'TV'],                                            NULL,            NULL,           'f-1', 1),
  ('2', '205', 'Doble',   1500,  ARRAY['Wi-Fi', 'Aire Acondicionado', 'Minibar', 'Vista al Mar'],                         '2026-02-28',    '2026-03-05',  'f-2', 2),
  ('3', '301', 'Suite',   3200,  ARRAY['Wi-Fi', 'Aire Acondicionado', 'Minibar', 'Vista al Mar', 'Jacuzzi', 'Balcón'],    '2026-03-01',    '2026-03-10',  'f-3', 3),
  ('4', '102', 'Sencilla', 750,  ARRAY['Wi-Fi', 'TV'],                                                                     '2026-02-20',    '2026-02-25',  'f-1', 2),
  ('5', '208', 'Doble',   1400,  ARRAY['Wi-Fi', 'Aire Acondicionado', 'Caja Fuerte'],                                     NULL,            NULL,           'f-2', 3)
ON CONFLICT (id) DO NOTHING;

-- 4. CLIENTES (3 clientes de ejemplo)
INSERT INTO clientes (id, name, email, phone, id_number, assigned_room_id, check_in, check_out, notes) VALUES
  ('c1', 'María García López',   'maria@email.com',  '+52 55 1234 5678', 'DNI 12345678A', '2', '2026-02-28', '2026-03-05', 'Cliente frecuente, prefiere habitación silenciosa'),
  ('c2', 'Carlos Mendoza Ruiz',  'carlos@email.com', '+52 55 9876 5432', 'DNI 87654321B', '3', '2026-03-01', '2026-03-10', 'Solicitó cuna para bebé'),
  ('c3', 'Ana Torres Pérez',     'ana@email.com',    '+52 55 4567 8901', 'DNI 45678901C', NULL, NULL,          NULL,         '')
ON CONFLICT (id) DO NOTHING;

-- 5. INVENTARIO (6 artículos de ejemplo)
INSERT INTO inventario (id, name, quantity, category, assigned_room_id, min_stock) VALUES
  ('i1', 'Toallas',           30, 'Blancos',    NULL, 10),
  ('i2', 'Jabón de baño',     50, 'Aseo',       NULL, 20),
  ('i3', 'Champú',             8, 'Aseo',       NULL, 15),
  ('i4', 'Coca-Cola',         24, 'Minibar',    NULL, 12),
  ('i5', 'Agua embotellada',  40, 'Minibar',    NULL, 20),
  ('i6', 'Sábanas extra',     15, 'Blancos',    NULL,  5)
ON CONFLICT (id) DO NOTHING;

-- 6. RESTAURAMOS FK de user_id
ALTER TABLE pisos ADD CONSTRAINT pisos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE habitaciones ADD CONSTRAINT habitaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE clientes ADD CONSTRAINT clientes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE inventario ADD CONSTRAINT inventario_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
