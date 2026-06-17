import { useState, useMemo, useEffect, useCallback } from 'react';
import { Room, isRoomAvailable, AVAILABLE_FEATURES, Floor, DEFAULT_FLOORS } from '@/types/room';
import { Client } from '@/types/client';
import { InventoryItem } from '@/types/inventory';
import { sampleRooms } from '@/data/sampleRooms';
import { sampleClients } from '@/data/sampleClients';
import { sampleInventory } from '@/data/sampleInventory';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DashboardSection } from '@/sections/DashboardSection';
import { RoomsSection } from '@/sections/RoomsSection';
import { ClientsSection } from '@/sections/ClientsSection';
import { InventorySection } from '@/sections/InventorySection';
import { ConfigSection } from '@/sections/ConfigSection';

type StatusFilter = 'all' | 'available' | 'occupied';

const Index = () => {
  const [rooms, setRooms] = useLocalStorage<Room[]>('hr-rooms', sampleRooms);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [availableFeatures, setAvailableFeatures] = useLocalStorage<string[]>('hr-features', AVAILABLE_FEATURES);
  const [activeSection, setActiveSection] = useState('dashboard');

  const [clients, setClients] = useLocalStorage<Client[]>('hr-clients', sampleClients);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('hr-inventory', sampleInventory);
  const [floors, setFloors] = useLocalStorage<Floor[]>('hr-floors', DEFAULT_FLOORS, (data) =>
    Array.isArray(data) && typeof data[0] === 'string'
      ? (data as string[]).map((name, i) => ({ id: `f-${i + 1}`, name, cantidadCuartos: 8 }))
      : Array.isArray(data) && typeof data[0] === 'object' && 'maxRooms' in (data[0] ?? {})
        ? (data as { name: string; maxRooms: number }[]).map((f, i) => ({ id: `f-${i + 1}`, name: f.name, cantidadCuartos: f.maxRooms }))
        : data as Floor[]
  );
  const [sortBy, setSortBy] = useState('default');
  const { theme, setTheme } = useTheme();
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [roomSearch, setRoomSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'room' | 'client' | 'inventory'; id: string; name: string } | null>(null);

  const { toast } = useToast();

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (filter !== 'all') {
      result = result.filter((r) =>
        filter === 'available' ? isRoomAvailable(r) : !isRoomAvailable(r)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((r) => r.type === typeFilter);
    }
    if (roomSearch.trim()) {
      const q = roomSearch.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-asc') return [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === 'price-desc') return [...result].sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (sortBy === 'name') return [...result].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return result;
  }, [rooms, filter, sortBy, roomSearch, typeFilter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') { e.preventDefault(); handleNewRoom(); }
        if (e.key === 'f') { e.preventDefault(); document.querySelector<HTMLInputElement>('[data-search]')?.focus(); }
        if (e.key === '1') { e.preventDefault(); setActiveSection('dashboard'); }
        if (e.key === '2') { e.preventDefault(); setActiveSection('rooms'); }
        if (e.key === '3') { e.preventDefault(); setActiveSection('clients'); }
        if (e.key === '4') { e.preventDefault(); setActiveSection('inventory'); }
        if (e.key === '5') { e.preventDefault(); setActiveSection('config'); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleSave = (data: Omit<Room, 'id'> & { id?: string }) => {
    if (data.id) {
      setRooms((prev) => prev.map((r) => (r.id === data.id ? { ...r, ...data } as Room : r)));
      toast({ title: 'Cuarto actualizado', description: `"${data.name}" se ha editado correctamente.` });
    } else {
      const newRoom: Room = { ...data, floorId: data.floorId ?? '', roomNumber: data.roomNumber ?? 0, id: crypto.randomUUID() } as Room;
      setRooms((prev) => [...prev, newRoom]);
      toast({ title: 'Cuarto agregado', description: `"${data.name}" se ha registrado correctamente.` });
    }
    setEditingRoom(null);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    setConfirmDelete({ type: 'room', id, name: room?.name ?? '' });
  };

  const executeDelete = useCallback(() => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'room') {
      setRooms((prev) => prev.filter((r) => r.id !== confirmDelete.id));
      toast({ title: 'Cuarto eliminado', description: `"${confirmDelete.name}" se ha eliminado.`, variant: 'destructive' });
    } else if (confirmDelete.type === 'client') {
      setClients((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      toast({ title: 'Cliente eliminado', description: `"${confirmDelete.name}" se ha eliminado.`, variant: 'destructive' });
    } else if (confirmDelete.type === 'inventory') {
      setInventory((prev) => prev.filter((i) => i.id !== confirmDelete.id));
      toast({ title: 'Artículo eliminado', description: `"${confirmDelete.name}" se ha eliminado.`, variant: 'destructive' });
    }
    setConfirmDelete(null);
  }, [confirmDelete, setRooms, setClients, setInventory, toast]);

  const handleToggleStatus = (id: string) => {
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
  };

  const handleSaveClient = (data: Omit<Client, 'id'> & { id?: string }) => {
    const prevRoomId = data.id ? clients.find((c) => c.id === data.id)?.assignedRoomId : null;
    const newRoomId = data.assignedRoomId;

    if (data.id) {
      setClients((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } as Client : c)));
      toast({ title: 'Cliente actualizado', description: `"${data.name}" se ha editado correctamente.` });
    } else {
      const newClient: Client = { ...data, id: crypto.randomUUID() } as Client;
      setClients((prev) => [...prev, newClient]);
      toast({ title: 'Cliente agregado', description: `"${data.name}" se ha registrado correctamente.` });
    }

    if (newRoomId && newRoomId !== prevRoomId) {
      const start = new Date().toISOString().split('T')[0];
      const end = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      setRooms((prev) => prev.map((r) => r.id === newRoomId ? { ...r, occupancyStart: start, occupancyEnd: end } as Room : r));
    }
    if (prevRoomId && newRoomId !== prevRoomId) {
      setRooms((prev) => prev.map((r) => r.id === prevRoomId ? { ...r, occupancyStart: null, occupancyEnd: null } as Room : r));
    }
    setEditingClient(null);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientDialogOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setConfirmDelete({ type: 'client', id, name: client?.name ?? '' });
  };

  const handleSaveInventory = (data: Omit<InventoryItem, 'id'> & { id?: string }) => {
    if (data.id) {
      setInventory((prev) => prev.map((i) => (i.id === data.id ? { ...i, ...data } as InventoryItem : i)));
      toast({ title: 'Artículo actualizado', description: `"${data.name}" se ha editado correctamente.` });
    } else {
      const newItem: InventoryItem = { ...data, id: crypto.randomUUID() } as InventoryItem;
      setInventory((prev) => [...prev, newItem]);
      toast({ title: 'Artículo agregado', description: `"${data.name}" se ha registrado correctamente.` });
    }
    setEditingInventory(null);
  };

  const handleEditInventory = (item: InventoryItem) => {
    setEditingInventory(item);
    setInventoryDialogOpen(true);
  };

  const handleDeleteInventory = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    setConfirmDelete({ type: 'inventory', id, name: item?.name ?? '' });
  };

  const lowStockItems = useMemo(() => inventory.filter((i) => i.quantity <= i.minStock && i.quantity > 0), [inventory]);
  const outOfStockItems = useMemo(() => inventory.filter((i) => i.quantity === 0), [inventory]);

  const handleNewRoom = () => {
    setEditingRoom(null);
    setDialogOpen(true);
  };

  const sectionLabel = activeSection === 'dashboard' ? 'Dashboard'
    : activeSection === 'rooms' ? 'Cuartos'
    : activeSection === 'clients' ? 'Clientes'
    : activeSection === 'inventory' ? 'Inventario'
    : 'Configuración';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger />
            <span className="ml-3 text-sm font-medium text-muted-foreground capitalize">{sectionLabel}</span>
            <div className="ml-auto flex items-center gap-2">
              <kbd className="hidden lg:inline-flex text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded gap-1">
                <span className="font-semibold">Ctrl+1-5</span> navegar
              </kbd>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 rounded-full"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </header>

          <main className="flex-1 bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {activeSection === 'dashboard' && (
                <DashboardSection rooms={rooms} clients={clients} floors={floors} />
              )}

              {activeSection === 'rooms' && (
                <RoomsSection
                  rooms={rooms}
                  filteredRooms={filteredRooms}
                  roomSearch={roomSearch}
                  onRoomSearchChange={setRoomSearch}
                  filter={filter}
                  onFilterChange={setFilter}
                  typeFilter={typeFilter}
                  onTypeFilterChange={setTypeFilter}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  onNewRoom={handleNewRoom}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  clients={clients}
                  onEditClient={handleEditClient}
                  dialogOpen={dialogOpen}
                  onDialogOpenChange={setDialogOpen}
                  editingRoom={editingRoom}
                  onSave={handleSave}
                  availableFeatures={availableFeatures}
                />
              )}

              {activeSection === 'clients' && (
                <ClientsSection
                  clients={clients}
                  rooms={rooms}
                  onSave={handleSaveClient}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                  dialogOpen={clientDialogOpen}
                  onDialogOpenChange={setClientDialogOpen}
                  editingClient={editingClient}
                  onNewClient={() => { setEditingClient(null); setClientDialogOpen(true); }}
                />
              )}

              {activeSection === 'inventory' && (
                <InventorySection
                  inventory={inventory}
                  onSave={handleSaveInventory}
                  onEdit={handleEditInventory}
                  onDelete={handleDeleteInventory}
                  dialogOpen={inventoryDialogOpen}
                  onDialogOpenChange={setInventoryDialogOpen}
                  editingItem={editingInventory}
                  rooms={rooms}
                  lowStockItems={lowStockItems}
                  outOfStockItems={outOfStockItems}
                  onNewItem={() => { setEditingInventory(null); setInventoryDialogOpen(true); }}
                />
              )}

              {activeSection === 'config' && (
                <ConfigSection
                  availableFeatures={availableFeatures}
                  onFeaturesChange={setAvailableFeatures}
                  floors={floors}
                  onFloorsChange={setFloors}
                  rooms={rooms}
                  onRoomsChange={setRooms}
                  onDeleteRoom={handleDelete}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title={confirmDelete?.type === 'room' ? 'Eliminar cuarto' : confirmDelete?.type === 'client' ? 'Eliminar cliente' : 'Eliminar artículo'}
        description={`¿Estás seguro? Se eliminará "${confirmDelete?.name ?? ''}" permanentemente.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={executeDelete}
      />
    </SidebarProvider>
  );
};

export default Index;
