import { InventoryItem } from '@/types/inventory';

export const sampleInventory: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Toallas',
    quantity: 30,
    category: 'Blancos',
    assignedRoomId: null,
    minStock: 10,
  },
  {
    id: 'i2',
    name: 'Jabón de baño',
    quantity: 50,
    category: 'Aseo',
    assignedRoomId: null,
    minStock: 20,
  },
  {
    id: 'i3',
    name: 'Champú',
    quantity: 8,
    category: 'Aseo',
    assignedRoomId: null,
    minStock: 15,
  },
  {
    id: 'i4',
    name: 'Coca-Cola',
    quantity: 24,
    category: 'Minibar',
    assignedRoomId: null,
    minStock: 12,
  },
  {
    id: 'i5',
    name: 'Agua embotellada',
    quantity: 40,
    category: 'Minibar',
    assignedRoomId: null,
    minStock: 20,
  },
  {
    id: 'i6',
    name: 'Sábanas extra',
    quantity: 15,
    category: 'Blancos',
    assignedRoomId: null,
    minStock: 5,
  },
];
