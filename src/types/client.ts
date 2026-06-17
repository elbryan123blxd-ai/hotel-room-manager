import { z } from 'zod';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  assignedRoomId: string | null;
  checkIn: string | null;
  checkOut: string | null;
  notes: string;
}

export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
  idNumber: z.string(),
  assignedRoomId: z.string().nullable().optional(),
  checkIn: z.string().nullable().optional(),
  checkOut: z.string().nullable().optional(),
  notes: z.string(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export function createClient(data: ClientFormData & { id?: string }): Client {
  return {
    id: data.id ?? crypto.randomUUID(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    idNumber: data.idNumber,
    assignedRoomId: data.assignedRoomId ?? null,
    checkIn: data.checkIn ?? null,
    checkOut: data.checkOut ?? null,
    notes: data.notes,
  };
}
