import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import { Room, AVAILABLE_FEATURES, Floor, createRoom } from '@/types/room';
import { Client, createClient } from '@/types/client';
import { InventoryItem, createInventoryItem } from '@/types/inventory';
import {
  pisoToFloor,
  habitacionToRoom,
  roomToHabitacionInsert,
  roomToHabitacionUpdate,
  huespedToClient,
  clientToHuespedInsert,
  inventarioToItem,
  itemToInventarioInsert,
  itemToInventarioUpdate,
} from '@/types/mapper';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import type { Piso, Habitacion, Huesped, Inventario, Reserva } from '@/types/database';

interface HotelData {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  logo_url: string | null;
}

interface HotelContextValue {
  rooms: Room[];
  clients: Client[];
  inventory: InventoryItem[];
  floors: Floor[];
  availableFeatures: string[];
  setAvailableFeatures: (value: string[] | ((prev: string[]) => string[])) => void;
  setFloors: (value: Floor[] | ((prev: Floor[]) => Floor[])) => void;
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  loading: boolean;
  hotelId: string | null;
  hotelName: string;
  hotelData: HotelData | null;
  updateHotel: (data: Partial<HotelData>) => Promise<void>;
  addRoom: (data: Parameters<typeof createRoom>[0]) => Promise<void>;
  updateRoom: (id: string, data: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  toggleRoomStatus: (id: string) => Promise<void>;
  addClient: (data: Parameters<typeof createClient>[0]) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInventoryItem: (data: Parameters<typeof createInventoryItem>[0]) => Promise<void>;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
}

const HotelContext = createContext<HotelContextValue | null>(null);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [floors, setFloorsState] = useState<Floor[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>(AVAILABLE_FEATURES);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [hotelData, setHotelData] = useState<HotelData | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const { toast } = useToast();

  // ── Load data from Supabase ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get or create hotel for this user
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('hotel_id')
        .eq('auth_user_id', user.id)
        .single();

      let currentHotelId: string;

      if (!usuario) {
        // Create a default hotel for this user
        const { data: newHotel } = await supabase
          .from('hoteles')
          .insert({ nombre: 'Mi Hotel' })
          .select()
          .single();

        if (!newHotel) {
          setLoading(false);
          return;
        }

        currentHotelId = newHotel.id;

        // Create usuario record
        await supabase.from('usuarios').insert({
          auth_user_id: user.id,
          hotel_id: currentHotelId,
          nombre: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          rol: 'admin',
        });
        setHotelId(currentHotelId);

        // Seed sample data for the new hotel
        await supabase.rpc('seed_hotel_data', { p_hotel_id: currentHotelId });
      } else {
        currentHotelId = usuario.hotel_id;
        setHotelId(currentHotelId);
      }

      // Load all data in parallel
      const [hotelRes, pisosRes, habitacionesRes, huespedesRes, inventarioRes, reservasRes] = await Promise.all([
        supabase.from('hoteles').select('*').eq('id', currentHotelId).single(),
        supabase.from('pisos').select('*').eq('hotel_id', currentHotelId),
        supabase.from('habitaciones').select('*').eq('hotel_id', currentHotelId),
        supabase.from('huespedes').select('*').eq('hotel_id', currentHotelId),
        supabase.from('inventario').select('*').eq('hotel_id', currentHotelId),
        supabase.from('reservas').select('*').eq('hotel_id', currentHotelId),
      ]);
      if (hotelRes.data) setHotelData(hotelRes.data);

      // Map data to frontend types
      const mappedFloors = (pisosRes.data || []).map(pisoToFloor);
      const mappedRooms = (habitacionesRes.data || []).map(habitacionToRoom);
      const mappedReservas = reservasRes.data || [];
      setReservas(mappedReservas);

      // Map huespedes to clients with their active reservations
      const mappedClients = (huespedesRes.data || []).map((huesped) => {
        const activeReserva = mappedReservas.find(
          (r) => r.huesped_id === huesped.id && r.estado !== 'cancelada' && r.estado !== 'checked_out'
        );
        return huespedToClient(huesped, activeReserva);
      });

      const mappedInventory = (inventarioRes.data || []).map(inventarioToItem);

      setFloorsState(mappedFloors);
      setRooms(mappedRooms);
      setClients(mappedClients);
      setInventory(mappedInventory);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Computed values ──
  const hotelName = hotelData?.nombre ?? 'Hotel';
  const lowStockItems = inventory.filter((i) => i.quantity <= i.minStock && i.quantity > 0);
  const outOfStockItems = inventory.filter((i) => i.quantity === 0);

  // ── Room actions ──
  const addRoom = useCallback(async (data: Parameters<typeof createRoom>[0]) => {
    if (!hotelId) return;
    const newRoom = createRoom(data);
    const insertData = roomToHabitacionInsert(newRoom, hotelId);

    const { error } = await supabase.from('habitaciones').insert(insertData);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo agregar el cuarto.', variant: 'destructive' });
      return;
    }

    setRooms((prev) => [...prev, newRoom]);
    toast({ title: 'Cuarto agregado', description: `"${data.name}" se ha registrado correctamente.` });
  }, [hotelId, toast]);

  const updateRoom = useCallback(async (id: string, data: Partial<Room>) => {
    const updateData = roomToHabitacionUpdate(data);
    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase.from('habitaciones').update(updateData).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el cuarto.', variant: 'destructive' });
      return;
    }

    setRooms((prev) => prev.map((r) => r.id === id ? { ...r, ...data } as Room : r));
    toast({ title: 'Cuarto actualizado', description: `Se ha editado correctamente.` });
  }, [toast]);

  const deleteRoom = useCallback(async (id: string) => {
    const room = rooms.find((r) => r.id === id);
    const { error } = await supabase.from('habitaciones').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el cuarto.', variant: 'destructive' });
      return;
    }

    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (room) {
      toast({ title: 'Cuarto eliminado', description: `"${room.name}" se ha eliminado.`, variant: 'destructive' });
    }
  }, [rooms, toast]);

  const toggleRoomStatus = useCallback(async (id: string) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;

    const newEstado = room.occupancyStart ? 'limpia' : 'ocupada';
    const { error } = await supabase.from('habitaciones').update({ estado: newEstado }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo cambiar el estado.', variant: 'destructive' });
      return;
    }

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (newEstado === 'ocupada') {
          const start = new Date().toISOString().split('T')[0];
          const end = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
          return { ...r, occupancyStart: start, occupancyEnd: end };
        } else {
          return { ...r, occupancyStart: null, occupancyEnd: null };
        }
      })
    );
  }, [rooms, toast]);

  // ── Client actions ──
  const addClient = useCallback(async (data: Parameters<typeof createClient>[0]) => {
    if (!hotelId) return;
    const newClient = createClient(data);
    const huespedData = clientToHuespedInsert(newClient, hotelId);

    const { error } = await supabase.from('huespedes').insert(huespedData);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo agregar el cliente.', variant: 'destructive' });
      return;
    }

    // Create reservation if room is assigned
    if (data.assignedRoomId && data.checkIn && data.checkOut) {
      const { error: reservaError } = await supabase.from('reservas').insert({
        habitacion_id: data.assignedRoomId,
        huesped_id: newClient.id,
        hotel_id: hotelId,
        fecha_checkin: data.checkIn,
        fecha_checkout: data.checkOut,
        estado: 'checked_in',
      });
      if (reservaError) {
        console.error('Error creating reservation:', reservaError);
      }
    }

    setClients((prev) => [...prev, newClient]);
    if (data.assignedRoomId) {
      setRooms((prev) => prev.map((r) =>
        r.id === data.assignedRoomId
          ? { ...r, occupancyStart: data.checkIn ?? new Date().toISOString().split('T')[0], occupancyEnd: data.checkOut ?? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }
          : r
      ));
    }
    toast({ title: 'Cliente agregado', description: `"${data.name}" se ha registrado correctamente.` });
  }, [hotelId, toast]);

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    const prev = clients.find((c) => c.id === id);
    const nameParts = (data.name || prev?.name || '').split(' ');
    const updateData = {
      nombre: nameParts[0],
      apellido: nameParts.slice(1).join(' ') || nameParts[0],
      email: data.email ?? prev?.email,
      telefono: data.phone ?? prev?.phone,
      numero_documento: data.idNumber ?? prev?.idNumber,
      notas: data.notes ?? prev?.notes,
    };

    const { error } = await supabase.from('huespedes').update(updateData).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el cliente.', variant: 'destructive' });
      return;
    }

    // Handle reservation changes
    const newRoomId = data.assignedRoomId;
    const prevRoomId = prev?.assignedRoomId;

    if (newRoomId && newRoomId !== prevRoomId && hotelId) {
      // Create new reservation
      await supabase.from('reservas').insert({
        habitacion_id: newRoomId,
        huesped_id: id,
        hotel_id: hotelId,
        fecha_checkin: data.checkIn ?? new Date().toISOString().split('T')[0],
        fecha_checkout: data.checkOut ?? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        estado: 'checked_in',
      });
    }

    setClients((prevClients) => prevClients.map((c) => c.id === id ? { ...c, ...data } as Client : c));
    if (newRoomId && newRoomId !== prevRoomId) {
      setRooms((prevRooms) => prevRooms.map((r) =>
        r.id === newRoomId
          ? { ...r, occupancyStart: data.checkIn ?? new Date().toISOString().split('T')[0], occupancyEnd: data.checkOut ?? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }
          : r
      ));
    }
    if (prevRoomId && newRoomId !== prevRoomId) {
      setRooms((prevRooms) => prevRooms.map((r) =>
        r.id === prevRoomId ? { ...r, occupancyStart: null, occupancyEnd: null } : r
      ));
    }
    toast({ title: 'Cliente actualizado', description: `"${data.name ?? prev?.name}" se ha editado correctamente.` });
  }, [clients, hotelId, toast]);

  const deleteClient = useCallback(async (id: string) => {
    const client = clients.find((c) => c.id === id);

    // Delete related reservations first
    await supabase.from('reservas').delete().eq('huesped_id', id);

    const { error } = await supabase.from('huespedes').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el cliente.', variant: 'destructive' });
      return;
    }

    setClients((prev) => prev.filter((c) => c.id !== id));
    if (client) {
      if (client.assignedRoomId) {
        setRooms((prev) => prev.map((r) =>
          r.id === client.assignedRoomId ? { ...r, occupancyStart: null, occupancyEnd: null } : r
        ));
      }
      toast({ title: 'Cliente eliminado', description: `"${client.name}" se ha eliminado.`, variant: 'destructive' });
    }
  }, [clients, toast]);

  // ── Inventory actions ──
  const addInventoryItem = useCallback(async (data: Parameters<typeof createInventoryItem>[0]) => {
    if (!hotelId) return;
    const newItem = createInventoryItem(data);
    const insertData = itemToInventarioInsert(newItem, hotelId);

    const { error } = await supabase.from('inventario').insert(insertData);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo agregar el artículo.', variant: 'destructive' });
      return;
    }

    setInventory((prev) => [...prev, newItem]);
    toast({ title: 'Artículo agregado', description: `"${data.name}" se ha registrado correctamente.` });
  }, [hotelId, toast]);

  const updateInventoryItem = useCallback(async (id: string, data: Partial<InventoryItem>) => {
    const updateData = itemToInventarioUpdate(data);
    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase.from('inventario').update(updateData).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el artículo.', variant: 'destructive' });
      return;
    }

    setInventory((prev) => prev.map((i) => i.id === id ? { ...i, ...data } as InventoryItem : i));
    toast({ title: 'Artículo actualizado', description: `Se ha editado correctamente.` });
  }, [toast]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    const item = inventory.find((i) => i.id === id);
    const { error } = await supabase.from('inventario').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el artículo.', variant: 'destructive' });
      return;
    }

    setInventory((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      toast({ title: 'Artículo eliminado', description: `"${item.name}" se ha eliminado.`, variant: 'destructive' });
    }
  }, [inventory, toast]);

  // ── Floor management ──
  const syncFloorsToSupabase = async (newFloors: Floor[], currentHotelId: string) => {
    // Get existing floors from DB
    const { data: existingFloors } = await supabase
      .from('pisos')
      .select('id')
      .eq('hotel_id', currentHotelId);

    const existingIds = new Set((existingFloors || []).map((f) => f.id));
    const newIds = new Set(newFloors.map((f) => f.id));

    // Delete floors that were removed
    for (const id of existingIds) {
      if (!newIds.has(id)) {
        await supabase.from('pisos').delete().eq('id', id);
      }
    }

    // Upsert floors
    for (const floor of newFloors) {
      await supabase.from('pisos').upsert({
        id: floor.id,
        nombre: floor.name,
        hotel_id: currentHotelId,
        cantidad_cuartos: floor.cantidadCuartos,
      });
    }
  };

  const setFloors = useCallback((value: Floor[] | ((prev: Floor[]) => Floor[])) => {
    setFloorsState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (hotelId) {
        syncFloorsToSupabase(next, hotelId);
      }
      return next;
    });
  }, [hotelId]);

  const updateHotel = useCallback(async (data: Partial<HotelData>) => {
    if (!hotelId) return;
    const { error } = await supabase.from('hoteles').update(data).eq('id', hotelId);
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el hotel.', variant: 'destructive' });
      return;
    }
    setHotelData((prev) => prev ? { ...prev, ...data } : prev);
    toast({ title: 'Hotel actualizado', description: 'Los datos del hotel se guardaron correctamente.' });
  }, [hotelId, toast]);

  return (
    <HotelContext.Provider value={{
      rooms, clients, inventory, floors,
      availableFeatures, setAvailableFeatures,
      setFloors,
      lowStockItems, outOfStockItems,
      loading, hotelId, hotelName, hotelData, updateHotel,
      addRoom, updateRoom, deleteRoom, toggleRoomStatus,
      addClient, updateClient, deleteClient,
      addInventoryItem, updateInventoryItem, deleteInventoryItem,
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel(): HotelContextValue {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
}
