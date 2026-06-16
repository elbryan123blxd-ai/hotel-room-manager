export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  assignedRoomId: string | null;
  minStock: number;
}

export const INVENTORY_CATEGORIES = [
  'Blancos',
  'Aseo',
  'Minibar',
  'Electrónicos',
  'Muebles',
  'Otros',
];
