export interface Room {
  id: string;
  name: string;
  type: 'Suite' | 'Doble' | 'Sencilla';
  pricePerNight: number;
  features: string[];
  occupancyStart: string | null;
  occupancyEnd: string | null;
  floorId: string;
  roomNumber: number;
}

export interface Floor {
  id: string;
  name: string;
  cantidadCuartos: number;
}

export const DEFAULT_CANTIDAD_CUARTOS = 8;

export const DEFAULT_FLOORS: Floor[] = Array.from({ length: 8 }, (_, i) => ({
  id: `f-${i + 1}`,
  name: `Piso ${i + 1}`,
  cantidadCuartos: DEFAULT_CANTIDAD_CUARTOS,
}));

export const ROOM_TYPES: Room['type'][] = ['Suite', 'Doble', 'Sencilla'];

export const AVAILABLE_FEATURES = [
  'Wi-Fi',
  'Aire Acondicionado',
  'Vista al Mar',
  'Minibar',
  'TV',
  'Balcón',
  'Jacuzzi',
  'Caja Fuerte',
  'Servicio a la Habitación',
];

export function isRoomAvailable(room: Room): boolean {
  if (!room.occupancyStart || !room.occupancyEnd) return true;
  const now = new Date();
  const start = new Date(room.occupancyStart);
  const end = new Date(room.occupancyEnd);
  return now < start || now > end;
}

export function findRoomAt(rooms: Room[], floorId: string, roomNumber: number): Room | undefined {
  return rooms.find((r) => r.floorId === floorId && r.roomNumber === roomNumber);
}
