import { type Database } from '../integrations/supabase/types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Table row types
export type Hotel = Tables<'hoteles'>;
export type Piso = Tables<'pisos'>;
export type Habitacion = Tables<'habitaciones'>;
export type Huesped = Tables<'huespedes'>;
export type Reserva = Tables<'reservas'>;
export type TransaccionPago = Tables<'transacciones_pagos'>;
export type CargoExtra = Tables<'cargos_extra'>;
export type Inventario = Tables<'inventario'>;
export type Usuario = Tables<'usuarios'>;
export type LogActividad = Tables<'log_actividades'>;
export type TareaHousekeeping = Tables<'tareas_housekeeping'>;
export type Incidencia = Tables<'incidencias'>;

// Enum types
export type EstadoHabitacion = Enums<'estado_habitacion'>;
export type EstadoReserva = Enums<'estado_reserva'>;
export type RolUsuario = Enums<'rol_usuario'>;
export type MetodoPago = Enums<'metodo_pago'>;
export type PrioridadIncidencia = Enums<'prioridad_incidencia'>;
export type EstadoTareaHousekeeping = Enums<'estado_tarea_housekeeping'>;

// Insert types
export type HotelInsert = Database['public']['Tables']['hoteles']['Insert'];
export type PisoInsert = Database['public']['Tables']['pisos']['Insert'];
export type HabitacionInsert = Database['public']['Tables']['habitaciones']['Insert'];
export type HuespedInsert = Database['public']['Tables']['huespedes']['Insert'];
export type ReservaInsert = Database['public']['Tables']['reservas']['Insert'];
export type InventarioInsert = Database['public']['Tables']['inventario']['Insert'];

// Update types
export type HabitacionUpdate = Database['public']['Tables']['habitaciones']['Update'];
export type HuespedUpdate = Database['public']['Tables']['huespedes']['Update'];
export type ReservaUpdate = Database['public']['Tables']['reservas']['Update'];
export type InventarioUpdate = Database['public']['Tables']['inventario']['Update'];
export type PisoUpdate = Database['public']['Tables']['pisos']['Update'];

// View types
export type VistaDashboard = Database['public']['Views']['vista_dashboard_habitaciones']['Row'];
