import { type Room, type Floor } from './room';
import { type Client } from './client';
import { type InventoryItem } from './inventory';
import {
  type Habitacion,
  type Piso,
  type Huesped,
  type Inventario,
  type Reserva,
} from './database';

// ── Piso <-> Floor ──

export function pisoToFloor(piso: Piso): Floor {
  return {
    id: piso.id,
    name: piso.nombre,
    cantidadCuartos: piso.cantidad_cuartos,
  };
}

export function floorToPisoInsert(floor: Floor, hotelId: string) {
  return {
    id: floor.id,
    nombre: floor.name,
    hotel_id: hotelId,
    cantidad_cuartos: floor.cantidadCuartos,
  };
}

// ── Habitacion <-> Room ──

export function habitacionToRoom(hab: Habitacion): Room {
  return {
    id: hab.id,
    name: hab.nombre || `${hab.numero}`,
    type: mapTipoHabitacion(hab.tipo_habitacion_id),
    pricePerNight: hab.precio_por_noche,
    features: hab.caracteristicas || [],
    occupancyStart: null,
    occupancyEnd: null,
    floorId: hab.piso_id,
    roomNumber: hab.numero,
  };
}

export function roomToHabitacionInsert(room: Room, hotelId: string) {
  return {
    id: room.id,
    numero: room.roomNumber,
    nombre: room.name,
    hotel_id: hotelId,
    piso_id: room.floorId,
    precio_por_noche: room.pricePerNight,
    caracteristicas: room.features,
    estado: 'limpia' as const,
  };
}

export function roomToHabitacionUpdate(room: Partial<Room>) {
  const update: Record<string, unknown> = {};
  if (room.name !== undefined) update.nombre = room.name;
  if (room.pricePerNight !== undefined) update.precio_por_noche = room.pricePerNight;
  if (room.features !== undefined) update.caracteristicas = room.features;
  if (room.roomNumber !== undefined) update.numero = room.roomNumber;
  if (room.floorId !== undefined) update.piso_id = room.floorId;
  return update;
}

function mapTipoHabitacion(tipoId: string | null): Room['type'] {
  if (!tipoId) return 'Sencilla';
  if (tipoId.includes('suite') || tipoId.includes('Suite')) return 'Suite';
  if (tipoId.includes('doble') || tipoId.includes('Doble')) return 'Doble';
  return 'Sencilla';
}

// ── Huesped <-> Client ──

export function huespedToClient(huesped: Huesped, reserva?: Reserva): Client {
  return {
    id: huesped.id,
    name: `${huesped.nombre} ${huesped.apellido}`,
    email: huesped.email || '',
    phone: huesped.telefono || '',
    idNumber: huesped.numero_documento || '',
    assignedRoomId: reserva?.habitacion_id || null,
    checkIn: reserva?.fecha_checkin || null,
    checkOut: reserva?.fecha_checkout || null,
    notes: huesped.notas || '',
  };
}

export function clientToHuespedInsert(client: Client, hotelId: string) {
  const nameParts = client.name.split(' ');
  const nombre = nameParts[0] || client.name;
  const apellido = nameParts.slice(1).join(' ') || nombre;

  return {
    id: client.id,
    nombre,
    apellido,
    email: client.email || null,
    telefono: client.phone || null,
    numero_documento: client.idNumber || null,
    notas: client.notes || null,
    hotel_id: hotelId,
  };
}

// ── Inventario <-> InventoryItem ──

export function inventarioToItem(inv: Inventario): InventoryItem {
  return {
    id: inv.id,
    name: inv.nombre,
    quantity: inv.cantidad,
    category: inv.categoria,
    assignedRoomId: inv.habitacion_id || null,
    minStock: inv.min_stock,
  };
}

export function itemToInventarioInsert(item: InventoryItem, hotelId: string) {
  return {
    id: item.id,
    nombre: item.name,
    cantidad: item.quantity,
    categoria: item.category,
    habitacion_id: item.assignedRoomId || null,
    min_stock: item.minStock,
    hotel_id: hotelId,
  };
}

export function itemToInventarioUpdate(item: Partial<InventoryItem>) {
  const update: Record<string, unknown> = {};
  if (item.name !== undefined) update.nombre = item.name;
  if (item.quantity !== undefined) update.cantidad = item.quantity;
  if (item.category !== undefined) update.categoria = item.category;
  if (item.assignedRoomId !== undefined) update.habitacion_id = item.assignedRoomId;
  if (item.minStock !== undefined) update.min_stock = item.minStock;
  return update;
}
