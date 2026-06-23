-- ============================================================
-- MIGRATION: Sistema PMS Hotelero Completo
-- ============================================================

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE estado_habitacion AS ENUM ('limpia', 'sucia', 'mantenimiento', 'ocupada');
CREATE TYPE estado_reserva AS ENUM ('pendiente', 'confirmada', 'checked_in', 'checked_out', 'cancelada');
CREATE TYPE rol_usuario AS ENUM ('admin', 'recepcionista', 'housekeeping');
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'yape', 'plin');
CREATE TYPE prioridad_incidencia AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE estado_tarea_housekeeping AS ENUM ('pendiente', 'en_progreso', 'completada', 'cancelada');

-- ============================================================
-- 2. HOTELES
-- ============================================================

CREATE TABLE hoteles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  ruc TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TIPOS DE HABITACION
-- ============================================================

CREATE TABLE tipos_habitacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hoteles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  capacidad INTEGER NOT NULL DEFAULT 2,
  precio_base NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tipos_habitacion_hotel ON tipos_habitacion(hotel_id);

-- ============================================================
-- 4. PISOS
-- ============================================================

CREATE TABLE pisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hoteles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cantidad_cuartos INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pisos_hotel ON pisos(hotel_id);

-- ============================================================
-- 5. HABITACIONES
-- ============================================================

CREATE TABLE habitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hoteles(id) ON DELETE CASCADE,
  tipo_habitacion_id UUID REFERENCES tipos_habitacion(id) ON DELETE SET NULL,
  piso_id UUID NOT NULL REFERENCES pisos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  nombre TEXT,
  estado estado_habitacion NOT NULL DEFAULT 'limpia',
  precio_por_noche NUMERIC(10,2) NOT NULL DEFAULT 0,
  caracteristicas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(piso_id, numero)
);

CREATE INDEX idx_habitaciones_hotel ON habitaciones(hotel_id);
CREATE INDEX idx_habitaciones_piso ON habitaciones(piso_id);
CREATE INDEX idx_habitaciones_estado ON habitaciones(estado);
CREATE INDEX idx_habitaciones_tipo ON habitaciones(tipo_habitacion_id);

-- ============================================================
-- 6. HUESPEDES
-- ============================================================

CREATE TABLE huespedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hoteles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  tipo_documento TEXT NOT NULL DEFAULT 'DNI',
  numero_documento TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  pais TEXT DEFAULT 'Peru',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_huespedes_hotel ON huespedes(hotel_id);
CREATE INDEX idx_huespedes_documento ON huespedes(tipo_documento, numero_documento);
CREATE INDEX idx_huespedes_nombre ON huespedes(nombre, apellido);

-- ============================================================
-- 7. USUARIOS (con roles y vinculacion a auth)
-- ============================================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES hoteles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'recepcionista',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuarios_hotel ON usuarios(hotel_id);
CREATE INDEX idx_usuarios_auth ON usuarios(auth_user_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ============================================================
-- 8. RESERVAS
-- ============================================================

CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hoteles(id) ON DELETE CASCADE,
  habitacion_id UUID NOT NULL REFERENCES habitaciones(id) ON DELETE RESTRICT,
  huesped_id UUID NOT NULL REFERENCES huespedes(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha_checkin DATE NOT NULL,
  fecha_checkout DATE NOT NULL,
  estado estado_reserva NOT NULL DEFAULT 'pendiente',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposito NUMERIC(10,2) DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fecha_checkout > fecha_checkin)
);

CREATE INDEX idx_reservas_hotel ON reservas(hotel_id);
CREATE INDEX idx_reservas_habitacion ON reservas(habitacion_id);
CREATE INDEX idx_reservas_huesped ON reservas(huesped_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_fechas ON reservas(fecha_checkin, fecha_checkout);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);

-- ============================================================
-- 9. TRANSACCIONES / PAGOS
-- ============================================================

CREATE TABLE transacciones_pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  monto NUMERIC(10,2) NOT NULL,
  metodo metodo_pago NOT NULL DEFAULT 'efectivo',
  referencia TEXT,
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagos_reserva ON transacciones_pagos(reserva_id);
CREATE INDEX idx_pagos_fecha ON transacciones_pagos(created_at);

-- ============================================================
-- 10. CARGOS EXTRA
-- ============================================================

CREATE TABLE cargos_extra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  notas TEXT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cargos_reserva ON cargos_extra(reserva_id);

-- ============================================================
-- 11. LOG DE ACTIVIDADES (auditoria)
-- ============================================================

CREATE TABLE log_actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL,
  tabla_afectada TEXT,
  registro_id UUID,
  detalles JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_log_usuario ON log_actividades(usuario_id);
CREATE INDEX idx_log_tabla ON log_actividades(tabla_afectada);
CREATE INDEX idx_log_fecha ON log_actividades(created_at);
CREATE INDEX idx_log_accion ON log_actividades(accion);

-- ============================================================
-- 12. TAREAS DE HOUSEKEEPING
-- ============================================================

CREATE TABLE tareas_housekeeping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion_id UUID NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  estado estado_tarea_housekeeping NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_completado TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tareas_habitacion ON tareas_housekeeping(habitacion_id);
CREATE INDEX idx_tareas_usuario ON tareas_housekeeping(usuario_id);
CREATE INDEX idx_tareas_estado ON tareas_housekeeping(estado);

-- ============================================================
-- 13. INCIDENCIAS
-- ============================================================

CREATE TABLE incidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion_id UUID NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad prioridad_incidencia NOT NULL DEFAULT 'media',
  estado TEXT NOT NULL DEFAULT 'abierta',
  resuelta_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidencias_habitacion ON incidencias(habitacion_id);
CREATE INDEX idx_incidencias_estado ON incidencias(estado);
CREATE INDEX idx_incidencias_prioridad ON incidencias(prioridad);

-- ============================================================
-- 14. UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hoteles_updated_at BEFORE UPDATE ON hoteles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_habitaciones_updated_at BEFORE UPDATE ON habitaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_huespedes_updated_at BEFORE UPDATE ON huespedes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reservas_updated_at BEFORE UPDATE ON reservas FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE hoteles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_habitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE pisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE huespedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones_pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas_housekeeping ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;

-- Helper: obtener hotel_id del usuario autenticado
CREATE OR REPLACE FUNCTION auth.user_hotel_id()
RETURNS UUID AS $$
  SELECT hotel_id FROM usuarios WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: verificar si el usuario es admin
CREATE OR REPLACE FUNCTION auth.is_hotel_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_user_id = auth.uid() AND rol = 'admin' AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: verificar si el usuario es staff (cualquier rol activo)
CREATE OR REPLACE FUNCTION auth.is_hotel_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_user_id = auth.uid() AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── hoteles ──
CREATE POLICY "Staff ve su hotel"
  ON hoteles FOR SELECT TO authenticated
  USING (id = auth.user_hotel_id());

CREATE POLICY "Admin gestiona hoteles"
  ON hoteles FOR ALL TO authenticated
  USING (auth.is_hotel_admin());

-- ── tipos_habitacion ──
CREATE POLICY "Staff ve tipos de su hotel"
  ON tipos_habitacion FOR SELECT TO authenticated
  USING (hotel_id = auth.user_hotel_id());

CREATE POLICY "Admin gestiona tipos"
  ON tipos_habitacion FOR ALL TO authenticated
  USING (auth.is_hotel_admin());

-- ── pisos ──
CREATE POLICY "Staff ve pisos de su hotel"
  ON pisos FOR SELECT TO authenticated
  USING (hotel_id = auth.user_hotel_id());

CREATE POLICY "Admin gestiona pisos"
  ON pisos FOR ALL TO authenticated
  USING (auth.is_hotel_admin());

-- ── habitaciones ──
CREATE POLICY "Staff ve habitaciones de su hotel"
  ON habitaciones FOR SELECT TO authenticated
  USING (hotel_id = auth.user_hotel_id());

CREATE POLICY "Admin gestiona habitaciones"
  ON habitaciones FOR ALL TO authenticated
  USING (auth.is_hotel_admin());

CREATE POLICY "Housekeeping actualiza estado"
  ON habitaciones FOR UPDATE TO authenticated
  USING (hotel_id = auth.user_hotel_id() AND auth.uid() IN (
    SELECT auth_user_id FROM usuarios WHERE rol = 'housekeeping' AND activo = true
  ))
  WITH CHECK (hotel_id = auth.user_hotel_id());

-- ── huespedes ──
CREATE POLICY "Staff ve huespedes de su hotel"
  ON huespedes FOR SELECT TO authenticated
  USING (hotel_id = auth.user_hotel_id());

CREATE POLICY "Recepcionista gestiona huespedes"
  ON huespedes FOR ALL TO authenticated
  USING (auth.uid() IN (
    SELECT auth_user_id FROM usuarios
    WHERE hotel_id = auth.user_hotel_id() AND rol IN ('admin', 'recepcionista') AND activo = true
  ));

-- ── usuarios ──
CREATE POLICY "Staff ve usuarios de su hotel"
  ON usuarios FOR SELECT TO authenticated
  USING (hotel_id = auth.user_hotel_id());

CREATE POLICY "Admin gestiona usuarios"
  ON usuarios FOR ALL TO authenticated
  USING (auth.is_hotel_admin());

-- ── reservas ──
CREATE POLICY "Staff ve reservas de su hotel"
  ON reservas FOR SELECT TO authenticated
  USING (hotel_id = auth.user_hotel_id());

CREATE POLICY "Recepcionista gestiona reservas"
  ON reservas FOR ALL TO authenticated
  USING (auth.uid() IN (
    SELECT auth_user_id FROM usuarios
    WHERE hotel_id = auth.user_hotel_id() AND rol IN ('admin', 'recepcionista') AND activo = true
  ));

-- ── transacciones_pagos ──
CREATE POLICY "Staff ve pagos de su hotel"
  ON transacciones_pagos FOR SELECT TO authenticated
  USING (reserva_id IN (
    SELECT id FROM reservas WHERE hotel_id = auth.user_hotel_id()
  ));

CREATE POLICY "Recepcionista registra pagos"
  ON transacciones_pagos FOR INSERT TO authenticated
  WITH CHECK (reserva_id IN (
    SELECT id FROM reservas WHERE hotel_id = auth.user_hotel_id()
  ));

-- ── cargos_extra ──
CREATE POLICY "Staff ve cargos de su hotel"
  ON cargos_extra FOR SELECT TO authenticated
  USING (reserva_id IN (
    SELECT id FROM reservas WHERE hotel_id = auth.user_hotel_id()
  ));

CREATE POLICY "Recepcionista registra cargos"
  ON cargos_extra FOR INSERT TO authenticated
  WITH CHECK (reserva_id IN (
    SELECT id FROM reservas WHERE hotel_id = auth.user_hotel_id()
  ));

-- ── log_actividades ──
CREATE POLICY "Admin ve log de su hotel"
  ON log_actividades FOR SELECT TO authenticated
  USING (auth.is_hotel_admin() AND usuario_id IN (
    SELECT id FROM usuarios WHERE hotel_id = auth.user_hotel_id()
  ));

CREATE POLICY "Staff registra log"
  ON log_actividades FOR INSERT TO authenticated
  WITH CHECK (usuario_id IN (
    SELECT id FROM usuarios WHERE hotel_id = auth.user_hotel_id()
  ));

-- ── tareas_housekeeping ──
CREATE POLICY "Staff ve tareas de su hotel"
  ON tareas_housekeeping FOR SELECT TO authenticated
  USING (habitacion_id IN (
    SELECT id FROM habitaciones WHERE hotel_id = auth.user_hotel_id()
  ));

CREATE POLICY "Housekeeping gestiona sus tareas"
  ON tareas_housekeeping FOR ALL TO authenticated
  USING (auth.uid() IN (
    SELECT auth_user_id FROM usuarios
    WHERE hotel_id = auth.user_hotel_id() AND rol IN ('admin', 'housekeeping') AND activo = true
  ));

-- ── incidencias ──
CREATE POLICY "Staff ve incidencias de su hotel"
  ON incidencias FOR SELECT TO authenticated
  USING (habitacion_id IN (
    SELECT id FROM habitaciones WHERE hotel_id = auth.user_hotel_id()
  ));

CREATE POLICY "Staff registra incidencias"
  ON incidencias FOR ALL TO authenticated
  USING (habitacion_id IN (
    SELECT id FROM habitaciones WHERE hotel_id = auth.user_hotel_id()
  ));

-- ============================================================
-- 16. GRANTS PARA DATA API (anon/authenticated)
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON hoteles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tipos_habitacion TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pisos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON habitaciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON huespedes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reservas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transacciones_pagos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cargos_extra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON log_actividades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tareas_housekeeping TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON incidencias TO authenticated;

-- ============================================================
-- 17. CONSULTA DE DASHBOARD: Estado de habitaciones
-- ============================================================

-- Vista para dashboard: estado de todas las habitaciones con huesped actual
CREATE OR REPLACE VIEW vista_dashboard_habitaciones AS
SELECT
  h.id AS hotel_id,
  h.nombre AS hotel_nombre,
  hab.id AS habitacion_id,
  hab.numero AS numero_habitacion,
  hab.nombre AS nombre_habitacion,
  hab.estado AS estado_habitacion,
  th.nombre AS tipo_habitacion,
  p.nombre AS piso,
  hab.precio_por_noche,
  hab.caracteristicas,
  r.id AS reserva_actual_id,
  hu.nombre || ' ' || hu.apellido AS huesped_nombre,
  hu.telefono AS huesped_telefono,
  r.fecha_checkin,
  r.fecha_checkout,
  r.estado AS estado_reserva,
  r.total AS reserva_total,
  (SELECT COalesce(SUM(ce.monto * ce.cantidad), 0)
   FROM cargos_extra ce WHERE ce.reserva_id = r.id) AS cargos_extras,
  (SELECT COalesce(SUM(tp.monto), 0)
   FROM transacciones_pagos tp WHERE tp.reserva_id = r.id) AS total_pagado,
  r.total
    + (SELECT COalesce(SUM(ce.monto * ce.cantidad), 0)
       FROM cargos_extra ce WHERE ce.reserva_id = r.id)
    - (SELECT COalesce(SUM(tp.monto), 0)
       FROM transacciones_pagos tp WHERE tp.reserva_id = r.id)
    AS saldo_pendiente
FROM habitaciones hab
JOIN pisos p ON p.id = hab.piso_id
JOIN hoteles h ON h.id = hab.hotel_id
LEFT JOIN tipos_habitacion th ON th.id = hab.tipo_habitacion_id
LEFT JOIN reservas r ON r.habitacion_id = hab.id
  AND r.estado IN ('checked_in', 'confirmada')
  AND CURRENT_DATE >= r.fecha_checkin
  AND CURRENT_DATE < r.fecha_checkout
LEFT JOIN huespedes hu ON hu.id = r.huesped_id
ORDER BY p.nombre, hab.numero;
