import { Room } from '@/types/room';

export const sampleRooms: Room[] = [
  {
    id: '1',
    name: '101',
    type: 'Sencilla',
    pricePerNight: 850,
    features: ['Wi-Fi', 'Aire Acondicionado', 'TV'],
    occupancyStart: null,
    occupancyEnd: null,
  },
  {
    id: '2',
    name: '205',
    type: 'Doble',
    pricePerNight: 1500,
    features: ['Wi-Fi', 'Aire Acondicionado', 'Minibar', 'Vista al Mar'],
    occupancyStart: '2026-02-28',
    occupancyEnd: '2026-03-05',
  },
  {
    id: '3',
    name: '301 - Royal',
    type: 'Suite',
    pricePerNight: 3200,
    features: ['Wi-Fi', 'Aire Acondicionado', 'Minibar', 'Vista al Mar', 'Jacuzzi', 'Balcón'],
    occupancyStart: '2026-03-01',
    occupancyEnd: '2026-03-10',
  },
  {
    id: '4',
    name: '102',
    type: 'Sencilla',
    pricePerNight: 750,
    features: ['Wi-Fi', 'TV'],
    occupancyStart: '2026-02-20',
    occupancyEnd: '2026-02-25',
  },
  {
    id: '5',
    name: '208',
    type: 'Doble',
    pricePerNight: 1400,
    features: ['Wi-Fi', 'Aire Acondicionado', 'Caja Fuerte'],
    occupancyStart: null,
    occupancyEnd: null,
  },
];
