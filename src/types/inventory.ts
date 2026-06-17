import { z } from 'zod';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  assignedRoomId: string | null;
  minStock: number;
}

export const inventorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  quantity: z.number().min(0, 'La cantidad no puede ser negativa'),
  category: z.string().min(1, 'Selecciona una categoría'),
  assignedRoomId: z.string().nullable().optional(),
  minStock: z.number().min(0),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;

export const INVENTORY_CATEGORIES = [
  'Blancos',
  'Aseo',
  'Minibar',
  'Electrónicos',
  'Muebles',
  'Otros',
];

export function createInventoryItem(data: InventoryFormData & { id?: string }): InventoryItem {
  return {
    id: data.id ?? crypto.randomUUID(),
    name: data.name,
    quantity: data.quantity,
    category: data.category,
    assignedRoomId: data.assignedRoomId ?? null,
    minStock: data.minStock,
  };
}
