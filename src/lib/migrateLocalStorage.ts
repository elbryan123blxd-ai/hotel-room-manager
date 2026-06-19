import { supabase } from './supabaseClient';

function getFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export async function migrateLocalStorageToSupabase() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Debes iniciar sesión primero para migrar los datos.');
    return { success: false, error: 'No authenticated user' };
  }

  const userId = user.id;
  const results: Record<string, { inserted: number; errors: number }> = {};
  let hasErrors = false;

  // 1. Migrar pisos
  const floors = getFromLocalStorage<{ id: string; name: string; cantidadCuartos: number }[]>('hr-floors', []);
  if (floors.length > 0) {
    const floorsToInsert = floors.map(f => ({
      id: f.id,
      name: f.name,
      cantidad_cuartos: f.cantidadCuartos,
      user_id: userId,
    }));
    const { error } = await supabase.from('pisos').upsert(floorsToInsert, { onConflict: 'id' });
    results.pisos = { inserted: error ? 0 : floorsToInsert.length, errors: error ? 1 : 0 };
    if (error) { console.error('Error migrando pisos:', error); hasErrors = true; }
  }

  // 2. Migrar habitaciones
  const rooms = getFromLocalStorage<{
    id: string; name: string; type: string; pricePerNight: number;
    features: string[]; occupancyStart: string | null; occupancyEnd: string | null;
    floorId: string; roomNumber: number;
  }[]>('hr-rooms', []);
  if (rooms.length > 0) {
    const roomsToInsert = rooms.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      price_per_night: r.pricePerNight,
      features: r.features,
      occupancy_start: r.occupancyStart,
      occupancy_end: r.occupancyEnd,
      floor_id: r.floorId,
      room_number: r.roomNumber,
      user_id: userId,
    }));
    const { error } = await supabase.from('habitaciones').upsert(roomsToInsert, { onConflict: 'id' });
    results.habitaciones = { inserted: error ? 0 : roomsToInsert.length, errors: error ? 1 : 0 };
    if (error) { console.error('Error migrando habitaciones:', error); hasErrors = true; }
  }

  // 3. Migrar clientes
  const clients = getFromLocalStorage<{
    id: string; name: string; email: string; phone: string;
    idNumber: string; assignedRoomId: string | null;
    checkIn: string | null; checkOut: string | null; notes: string;
  }[]>('hr-clients', []);
  if (clients.length > 0) {
    const clientsToInsert = clients.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      id_number: c.idNumber,
      assigned_room_id: c.assignedRoomId,
      check_in: c.checkIn,
      check_out: c.checkOut,
      notes: c.notes,
      user_id: userId,
    }));
    const { error } = await supabase.from('clientes').upsert(clientsToInsert, { onConflict: 'id' });
    results.clientes = { inserted: error ? 0 : clientsToInsert.length, errors: error ? 1 : 0 };
    if (error) { console.error('Error migrando clientes:', error); hasErrors = true; }
  }

  // 4. Migrar inventario
  const inventory = getFromLocalStorage<{
    id: string; name: string; quantity: number; category: string;
    assignedRoomId: string | null; minStock: number;
  }[]>('hr-inventory', []);
  if (inventory.length > 0) {
    const inventoryToInsert = inventory.map(i => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      category: i.category,
      assigned_room_id: i.assignedRoomId,
      min_stock: i.minStock,
      user_id: userId,
    }));
    const { error } = await supabase.from('inventario').upsert(inventoryToInsert, { onConflict: 'id' });
    results.inventario = { inserted: error ? 0 : inventoryToInsert.length, errors: error ? 1 : 0 };
    if (error) { console.error('Error migrando inventario:', error); hasErrors = true; }
  }

  console.log('Resultado de la migración:', results);
  return { success: !hasErrors, results };
}
