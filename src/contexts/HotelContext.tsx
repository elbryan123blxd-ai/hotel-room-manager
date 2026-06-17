import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { Room, isRoomAvailable, AVAILABLE_FEATURES, Floor, DEFAULT_FLOORS, createRoom } from '@/types/room';
import { Client, createClient } from '@/types/client';
import { InventoryItem, createInventoryItem } from '@/types/inventory';
import { sampleRooms } from '@/data/sampleRooms';
import { sampleClients } from '@/data/sampleClients';
import { sampleInventory } from '@/data/sampleInventory';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

interface HotelContextValue {
  rooms: Room[];
  setRooms: (value: Room[] | ((prev: Room[]) => Room[])) => void;
  clients: Client[];
  setClients: (value: Client[] | ((prev: Client[]) => Client[])) => void;
  inventory: InventoryItem[];
  setInventory: (value: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => void;
  floors: Floor[];
  setFloors: (value: Floor[] | ((prev: Floor[]) => Floor[])) => void;
  availableFeatures: string[];
  setAvailableFeatures: (value: string[] | ((prev: string[]) => string[])) => void;
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  addRoom: (data: Parameters<typeof createRoom>[0]) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  toggleRoomStatus: (id: string) => void;
  addClient: (data: Parameters<typeof createClient>[0]) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addInventoryItem: (data: Parameters<typeof createInventoryItem>[0]) => void;
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
}

const HotelContext = createContext<HotelContextValue | null>(null);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useLocalStorage<Room[]>('hr-rooms', sampleRooms);
  const [clients, setClients] = useLocalStorage<Client[]>('hr-clients', sampleClients);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('hr-inventory', sampleInventory);
  const [floors, setFloors] = useLocalStorage<Floor[]>('hr-floors', DEFAULT_FLOORS, (data) =>
    Array.isArray(data) && typeof data[0] === 'string'
      ? (data as string[]).map((name, i) => ({ id: `f-${i + 1}`, name, cantidadCuartos: 8 }))
      : Array.isArray(data) && typeof data[0] === 'object' && 'maxRooms' in (data[0] ?? {})
        ? (data as { name: string; maxRooms: number }[]).map((f, i) => ({ id: `f-${i + 1}`, name: f.name, cantidadCuartos: f.maxRooms }))
        : data as Floor[]
  );
  const [availableFeatures, setAvailableFeatures] = useLocalStorage<string[]>('hr-features', AVAILABLE_FEATURES);
  const { toast } = useToast();

  const lowStockItems = inventory.filter((i) => i.quantity <= i.minStock && i.quantity > 0);
  const outOfStockItems = inventory.filter((i) => i.quantity === 0);

  const addRoom = useCallback((data: Parameters<typeof createRoom>[0]) => {
    const newRoom = createRoom(data);
    setRooms((prev) => [...prev, newRoom]);
    toast({ title: 'Cuarto agregado', description: `"${data.name}" se ha registrado correctamente.` });
  }, [setRooms, toast]);

  const updateRoom = useCallback((id: string, data: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => r.id === id ? { ...r, ...data } as Room : r));
    toast({ title: 'Cuarto actualizado', description: `Se ha editado correctamente.` });
  }, [setRooms, toast]);

  const deleteRoom = useCallback((id: string) => {
    const room = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (room) {
      toast({ title: 'Cuarto eliminado', description: `"${room.name}" se ha eliminado.`, variant: 'destructive' });
    }
  }, [rooms, setRooms, toast]);

  const toggleRoomStatus = useCallback((id: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const available = !r.occupancyStart || new Date() < new Date(r.occupancyStart) || new Date() > new Date(r.occupancyEnd!);
        if (available) {
          const start = new Date().toISOString().split('T')[0];
          const end = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
          return { ...r, occupancyStart: start, occupancyEnd: end };
        } else {
          return { ...r, occupancyStart: null, occupancyEnd: null };
        }
      })
    );
  }, [setRooms]);

  const addClient = useCallback((data: Parameters<typeof createClient>[0]) => {
    const newClient = createClient(data);
    setClients((prev) => [...prev, newClient]);
    if (data.assignedRoomId) {
      setRooms((prev) => prev.map((r) =>
        r.id === data.assignedRoomId
          ? { ...r, occupancyStart: data.checkIn ?? new Date().toISOString().split('T')[0], occupancyEnd: data.checkOut ?? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }
          : r
      ));
    }
    toast({ title: 'Cliente agregado', description: `"${data.name}" se ha registrado correctamente.` });
  }, [setClients, setRooms, toast]);

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    const prev = clients.find((c) => c.id === id);
    setClients((prevClients) => prevClients.map((c) => c.id === id ? { ...c, ...data } as Client : c));
    const newRoomId = data.assignedRoomId;
    const prevRoomId = prev?.assignedRoomId;
    if (newRoomId && newRoomId !== prevRoomId) {
      const clientData = data as Partial<Client>;
      setRooms((prevRooms) => prevRooms.map((r) =>
        r.id === newRoomId
          ? { ...r, occupancyStart: clientData.checkIn ?? new Date().toISOString().split('T')[0], occupancyEnd: clientData.checkOut ?? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] }
          : r
      ));
    }
    if (prevRoomId && newRoomId !== prevRoomId) {
      setRooms((prevRooms) => prevRooms.map((r) =>
        r.id === prevRoomId ? { ...r, occupancyStart: null, occupancyEnd: null } : r
      ));
    }
    toast({ title: 'Cliente actualizado', description: `"${data.name ?? prev?.name}" se ha editado correctamente.` });
  }, [clients, setClients, setRooms, toast]);

  const deleteClient = useCallback((id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (client) {
      if (client.assignedRoomId) {
        setRooms((prev) => prev.map((r) =>
          r.id === client.assignedRoomId ? { ...r, occupancyStart: null, occupancyEnd: null } : r
        ));
      }
      toast({ title: 'Cliente eliminado', description: `"${client.name}" se ha eliminado.`, variant: 'destructive' });
    }
  }, [clients, setClients, setRooms, toast]);

  const addInventoryItem = useCallback((data: Parameters<typeof createInventoryItem>[0]) => {
    const newItem = createInventoryItem(data);
    setInventory((prev) => [...prev, newItem]);
    toast({ title: 'Artículo agregado', description: `"${data.name}" se ha registrado correctamente.` });
  }, [setInventory, toast]);

  const updateInventoryItem = useCallback((id: string, data: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((i) => i.id === id ? { ...i, ...data } as InventoryItem : i));
    toast({ title: 'Artículo actualizado', description: `Se ha editado correctamente.` });
  }, [setInventory, toast]);

  const deleteInventoryItem = useCallback((id: string) => {
    const item = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      toast({ title: 'Artículo eliminado', description: `"${item.name}" se ha eliminado.`, variant: 'destructive' });
    }
  }, [inventory, setInventory, toast]);

  return (
    <HotelContext.Provider value={{
      rooms, setRooms,
      clients, setClients,
      inventory, setInventory,
      floors, setFloors,
      availableFeatures, setAvailableFeatures,
      lowStockItems, outOfStockItems,
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
