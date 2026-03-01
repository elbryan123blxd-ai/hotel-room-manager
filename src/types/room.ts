export interface Room {
  id: string;
  name: string;
  type: 'Suite' | 'Doble' | 'Sencilla';
  pricePerNight: number;
  features: string[];
  occupancyStart: string | null;
  occupancyEnd: string | null;
}

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
