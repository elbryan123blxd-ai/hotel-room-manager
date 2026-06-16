import { Client } from '@/types/client';

export const sampleClients: Client[] = [
  {
    id: 'c1',
    name: 'María García López',
    email: 'maria@email.com',
    phone: '+52 55 1234 5678',
    idNumber: 'DNI 12345678A',
    assignedRoomId: '2',
    checkIn: '2026-02-28',
    checkOut: '2026-03-05',
    notes: 'Cliente frecuente, prefiere habitación silenciosa',
  },
  {
    id: 'c2',
    name: 'Carlos Mendoza Ruiz',
    email: 'carlos@email.com',
    phone: '+52 55 9876 5432',
    idNumber: 'DNI 87654321B',
    assignedRoomId: '3',
    checkIn: '2026-03-01',
    checkOut: '2026-03-10',
    notes: 'Solicitó cuna para bebé',
  },
  {
    id: 'c3',
    name: 'Ana Torres Pérez',
    email: 'ana@email.com',
    phone: '+52 55 4567 8901',
    idNumber: 'DNI 45678901C',
    assignedRoomId: null,
    checkIn: null,
    checkOut: null,
    notes: '',
  },
];
