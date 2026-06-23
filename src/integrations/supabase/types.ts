export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      hoteles: {
        Row: {
          id: string;
          nombre: string;
          direccion: string | null;
          email: string | null;
          logo_url: string | null;
          ruc: string | null;
          telefono: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          direccion?: string | null;
          email?: string | null;
          logo_url?: string | null;
          ruc?: string | null;
          telefono?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          direccion?: string | null;
          email?: string | null;
          logo_url?: string | null;
          ruc?: string | null;
          telefono?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pisos: {
        Row: {
          id: string;
          nombre: string;
          hotel_id: string;
          cantidad_cuartos: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          hotel_id: string;
          cantidad_cuartos?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          hotel_id?: string;
          cantidad_cuartos?: number;
          created_at?: string;
        };
      };
      habitaciones: {
        Row: {
          id: string;
          numero: number;
          nombre: string | null;
          estado: Database['public']['Enums']['estado_habitacion'];
          precio_por_noche: number;
          caracteristicas: string[] | null;
          hotel_id: string;
          piso_id: string;
          tipo_habitacion_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero: number;
          nombre?: string | null;
          estado?: Database['public']['Enums']['estado_habitacion'];
          precio_por_noche?: number;
          caracteristicas?: string[] | null;
          hotel_id: string;
          piso_id: string;
          tipo_habitacion_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          nombre?: string | null;
          estado?: Database['public']['Enums']['estado_habitacion'];
          precio_por_noche?: number;
          caracteristicas?: string[] | null;
          hotel_id?: string;
          piso_id?: string;
          tipo_habitacion_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      huespedes: {
        Row: {
          id: string;
          nombre: string;
          apellido: string;
          tipo_documento: string;
          numero_documento: string | null;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          pais: string | null;
          notas: string | null;
          hotel_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          apellido: string;
          tipo_documento?: string;
          numero_documento?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          pais?: string | null;
          notas?: string | null;
          hotel_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          apellido?: string;
          tipo_documento?: string;
          numero_documento?: string | null;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          pais?: string | null;
          notas?: string | null;
          hotel_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservas: {
        Row: {
          id: string;
          habitacion_id: string;
          huesped_id: string;
          hotel_id: string;
          fecha_checkin: string;
          fecha_checkout: string;
          estado: Database['public']['Enums']['estado_reserva'];
          total: number;
          deposito: number | null;
          notas: string | null;
          usuario_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          habitacion_id: string;
          huesped_id: string;
          hotel_id: string;
          fecha_checkin: string;
          fecha_checkout: string;
          estado?: Database['public']['Enums']['estado_reserva'];
          total?: number;
          deposito?: number | null;
          notas?: string | null;
          usuario_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          habitacion_id?: string;
          huesped_id?: string;
          hotel_id?: string;
          fecha_checkin?: string;
          fecha_checkout?: string;
          estado?: Database['public']['Enums']['estado_reserva'];
          total?: number;
          deposito?: number | null;
          notas?: string | null;
          usuario_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transacciones_pagos: {
        Row: {
          id: string;
          reserva_id: string;
          monto: number;
          metodo: Database['public']['Enums']['metodo_pago'];
          referencia: string | null;
          notas: string | null;
          usuario_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reserva_id: string;
          monto: number;
          metodo?: Database['public']['Enums']['metodo_pago'];
          referencia?: string | null;
          notas?: string | null;
          usuario_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reserva_id?: string;
          monto?: number;
          metodo?: Database['public']['Enums']['metodo_pago'];
          referencia?: string | null;
          notas?: string | null;
          usuario_id?: string | null;
          created_at?: string;
        };
      };
      cargos_extra: {
        Row: {
          id: string;
          reserva_id: string;
          concepto: string;
          cantidad: number;
          monto: number;
          notas: string | null;
          usuario_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reserva_id: string;
          concepto: string;
          cantidad?: number;
          monto: number;
          notas?: string | null;
          usuario_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reserva_id?: string;
          concepto?: string;
          cantidad?: number;
          monto?: number;
          notas?: string | null;
          usuario_id?: string | null;
          created_at?: string;
        };
      };
      inventario: {
        Row: {
          id: string;
          nombre: string;
          categoria: string;
          cantidad: number;
          min_stock: number;
          hotel_id: string;
          habitacion_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          categoria?: string;
          cantidad?: number;
          min_stock?: number;
          hotel_id: string;
          habitacion_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          categoria?: string;
          cantidad?: number;
          min_stock?: number;
          hotel_id?: string;
          habitacion_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          rol: Database['public']['Enums']['rol_usuario'];
          activo: boolean;
          auth_user_id: string | null;
          hotel_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          email: string;
          rol?: Database['public']['Enums']['rol_usuario'];
          activo?: boolean;
          auth_user_id?: string | null;
          hotel_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string;
          rol?: Database['public']['Enums']['rol_usuario'];
          activo?: boolean;
          auth_user_id?: string | null;
          hotel_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      log_actividades: {
        Row: {
          id: string;
          usuario_id: string | null;
          accion: string;
          tabla_afectada: string | null;
          registro_id: string | null;
          detalles: Json | null;
          ip_address: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string | null;
          accion: string;
          tabla_afectada?: string | null;
          registro_id?: string | null;
          detalles?: Json | null;
          ip_address?: unknown;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string | null;
          accion?: string;
          tabla_afectada?: string | null;
          registro_id?: string | null;
          detalles?: Json | null;
          ip_address?: unknown;
          created_at?: string;
        };
      };
      tareas_housekeeping: {
        Row: {
          id: string;
          habitacion_id: string;
          usuario_id: string | null;
          estado: Database['public']['Enums']['estado_tarea_housekeeping'];
          fecha_asignacion: string;
          fecha_completado: string | null;
          notas: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habitacion_id: string;
          usuario_id?: string | null;
          estado?: Database['public']['Enums']['estado_tarea_housekeeping'];
          fecha_asignacion?: string;
          fecha_completado?: string | null;
          notas?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          habitacion_id?: string;
          usuario_id?: string | null;
          estado?: Database['public']['Enums']['estado_tarea_housekeeping'];
          fecha_asignacion?: string;
          fecha_completado?: string | null;
          notas?: string | null;
          created_at?: string;
        };
      };
      incidencias: {
        Row: {
          id: string;
          habitacion_id: string;
          titulo: string;
          descripcion: string | null;
          estado: string;
          prioridad: Database['public']['Enums']['prioridad_incidencia'];
          usuario_id: string | null;
          resuelta_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habitacion_id: string;
          titulo: string;
          descripcion?: string | null;
          estado?: string;
          prioridad?: Database['public']['Enums']['prioridad_incidencia'];
          usuario_id?: string | null;
          resuelta_en?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          habitacion_id?: string;
          titulo?: string;
          descripcion?: string | null;
          estado?: string;
          prioridad?: Database['public']['Enums']['prioridad_incidencia'];
          usuario_id?: string | null;
          resuelta_en?: string | null;
          created_at?: string;
        };
      };
      tipos_habitacion: {
        Row: {
          id: string;
          hotel_id: string;
          nombre: string;
          descripcion: string | null;
          capacidad: number;
          precio_base: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          nombre: string;
          descripcion?: string | null;
          capacidad?: number;
          precio_base?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          nombre?: string;
          descripcion?: string | null;
          capacidad?: number;
          precio_base?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      vista_dashboard_habitaciones: {
        Row: {
          hotel_id: string | null;
          hotel_nombre: string | null;
          habitacion_id: string | null;
          numero_habitacion: number | null;
          nombre_habitacion: string | null;
          estado_habitacion: Database['public']['Enums']['estado_habitacion'] | null;
          tipo_habitacion: string | null;
          piso: string | null;
          precio_por_noche: number | null;
          caracteristicas: string[] | null;
          reserva_actual_id: string | null;
          huesped_nombre: string | null;
          huesped_telefono: string | null;
          fecha_checkin: string | null;
          fecha_checkout: string | null;
          estado_reserva: Database['public']['Enums']['estado_reserva'] | null;
          reserva_total: number | null;
          cargos_extras: number | null;
          total_pagado: number | null;
          saldo_pendiente: number | null;
        };
      };
    };
    Enums: {
      estado_habitacion: 'limpia' | 'sucia' | 'mantenimiento' | 'ocupada';
      estado_reserva: 'pendiente' | 'confirmada' | 'checked_in' | 'checked_out' | 'cancelada';
      rol_usuario: 'admin' | 'recepcionista' | 'housekeeping';
      metodo_pago: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'yape' | 'plin';
      prioridad_incidencia: 'baja' | 'media' | 'alta' | 'critica';
      estado_tarea_housekeeping: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
    };
  };
}
