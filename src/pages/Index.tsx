import { useState, useMemo, useEffect } from 'react';
import { Room, isRoomAvailable, AVAILABLE_FEATURES, Floor, DEFAULT_FLOORS } from '@/types/room';
import { Client } from '@/types/client';
import { InventoryItem } from '@/types/inventory';
import { sampleRooms } from '@/data/sampleRooms';
import { sampleClients } from '@/data/sampleClients';
import { sampleInventory } from '@/data/sampleInventory';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { RoomCard } from '@/components/RoomCard';
import { RoomFormDialog } from '@/components/RoomFormDialog';
import { ClientCard } from '@/components/ClientCard';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { InventoryCard } from '@/components/InventoryCard';
import { InventoryFormDialog } from '@/components/InventoryFormDialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { FeaturesConfig } from '@/components/FeaturesConfig';
import { MapEditor } from '@/components/MapEditor';
import { FloorsConfig } from '@/components/FloorsConfig';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUpDown, Download, Search } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

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

  // Keyboard shortcuts
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
    setRooms((prev) => prev.filter((r) => r.id !== id));
    toast({
      title: 'Cuarto eliminado',
      description: `"${room?.name}" se ha eliminado del inventario.`,
      variant: 'destructive',
    });
  };

  const handleToggleStatus = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const available = !r.occupancyStart || new Date() < new Date(r.occupancyStart) || new Date() > new Date(r.occupancyEnd!);
        if (available) {
          const start = new Date().toISOString().split('T')[0];
          const end = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
          return { ...r, occupancyStart: start, occupancyEnd: end };
        } else {
          return { ...r, occupancyStart: null, occupancyEnd: null };
        }
      })
    );
  };

  const handleSaveClient = (data: Omit<Client, 'id'> & { id?: string }) => {
    if (data.id) {
      setClients((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } as Client : c)));
      toast({ title: 'Cliente actualizado', description: `"${data.name}" se ha editado correctamente.` });
    } else {
      const newClient: Client = { ...data, id: crypto.randomUUID() } as Client;
      setClients((prev) => [...prev, newClient]);
      toast({ title: 'Cliente agregado', description: `"${data.name}" se ha registrado correctamente.` });
    }
    setEditingClient(null);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientDialogOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast({
      title: 'Cliente eliminado',
      description: `"${client?.name}" se ha eliminado.`,
      variant: 'destructive',
    });
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
    setInventory((prev) => prev.filter((i) => i.id !== id));
    toast({
      title: 'Artículo eliminado',
      description: `"${item?.name}" se ha eliminado.`,
      variant: 'destructive',
    });
  };

  const lowStockItems = useMemo(() => inventory.filter((i) => i.quantity <= i.minStock && i.quantity > 0), [inventory]);
  const outOfStockItems = useMemo(() => inventory.filter((i) => i.quantity === 0), [inventory]);

  const handleNewRoom = () => {
    setEditingRoom(null);
    setDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger />
            <span className="ml-3 text-sm font-medium text-muted-foreground capitalize">
              {activeSection === 'dashboard' ? 'Dashboard' : activeSection === 'rooms' ? 'Cuartos' : activeSection === 'clients' ? 'Clientes' : activeSection === 'inventory' ? 'Inventario' : 'Configuración'}
            </span>
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
                <DashboardHeader rooms={rooms} clients={clients} floors={floors} />
              )}

              {activeSection === 'rooms' && (
                <section>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="font-display text-2xl font-bold text-foreground">Cuartos</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="relative w-40">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          data-search
                          placeholder="Buscar cuarto..."
                          value={roomSearch}
                          onChange={(e) => setRoomSearch(e.target.value)}
                          className="pl-7 h-9 text-xs"
                        />
                      </div>
                      <ToggleGroup
                        type="single"
                        value={filter}
                        onValueChange={(v) => v && setFilter(v as StatusFilter)}
                        className="bg-muted rounded-lg p-0.5"
                      >
                        <ToggleGroupItem value="all" className="text-xs px-3 data-[state=on]:bg-foreground/10 data-[state=on]:shadow-sm rounded-md">
                          Todos
                        </ToggleGroupItem>
                        <ToggleGroupItem value="available" className="text-xs px-3 data-[state=on]:bg-success/15 data-[state=on]:text-success data-[state=on]:shadow-sm rounded-md">
                          Disponibles
                        </ToggleGroupItem>
                        <ToggleGroupItem value="occupied" className="text-xs px-3 data-[state=on]:bg-destructive/15 data-[state=on]:text-destructive data-[state=on]:shadow-sm rounded-md">
                          Ocupados
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[110px] h-9 text-xs">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Suite">Suite</SelectItem>
                          <SelectItem value="Doble">Doble</SelectItem>
                          <SelectItem value="Sencilla">Sencilla</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[130px] h-9 text-xs">
                          <ArrowUpDown className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Por defecto</SelectItem>
                          <SelectItem value="price-asc">Menor precio</SelectItem>
                          <SelectItem value="price-desc">Mayor precio</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => downloadCSV(rooms.map((r) => ({
                          Nombre: r.name,
                          Tipo: r.type,
                          'Precio/Noche': r.pricePerNight,
                          Características: r.features.join('; '),
                          'Ocupación Inicio': r.occupancyStart ?? '',
                          'Ocupación Fin': r.occupancyEnd ?? '',
                          Disponible: isRoomAvailable(r) ? 'Sí' : 'No',
                        })), 'cuartos')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        CSV
                      </Button>
                      <Button onClick={handleNewRoom} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                        <Plus className="h-4 w-4" />
                        Agregar Cuarto
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Mostrando {filteredRooms.length} de {rooms.length} cuartos
                  </p>

                  {filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center">
                      <p className="text-lg font-medium text-muted-foreground">
                        {roomSearch || typeFilter !== 'all'
                          ? 'No hay cuartos con esos filtros'
                          : filter === 'all'
                            ? 'No hay cuartos registrados'
                            : `No hay cuartos ${filter === 'available' ? 'disponibles' : 'ocupados'}`}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {roomSearch || typeFilter !== 'all' ? 'Prueba cambiando los filtros' : filter === 'all' ? 'Comienza agregando tu primer cuarto' : 'Prueba cambiando el filtro'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredRooms.map((room) => (
                        <RoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeSection === 'clients' && (
                <section>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="font-display text-2xl font-bold text-foreground">Clientes</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => downloadCSV(clients.map((c) => ({
                          Nombre: c.name,
                          Email: c.email,
                          Teléfono: c.phone,
                          Documento: c.idNumber,
                          'Cuarto Asignado': rooms.find((r) => r.id === c.assignedRoomId)?.name ?? '',
                          'Check-in': c.checkIn ?? '',
                          'Check-out': c.checkOut ?? '',
                          Notas: c.notes,
                        })), 'clientes')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        CSV
                      </Button>
                      <Button onClick={() => { setEditingClient(null); setClientDialogOpen(true); }} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                        <Plus className="h-4 w-4" />
                        Agregar Cliente
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Total: {clients.length} clientes
                  </p>

                  {clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center">
                      <p className="text-lg font-medium text-muted-foreground">No hay clientes registrados</p>
                      <p className="mt-1 text-sm text-muted-foreground">Comienza agregando tu primer cliente</p>
                      <Button onClick={() => { setEditingClient(null); setClientDialogOpen(true); }} className="mt-4 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                        <Plus className="h-4 w-4" />
                        Agregar Cliente
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {clients.map((client) => (
                        <ClientCard
                          key={client.id}
                          client={client}
                          assignedRoom={rooms.find((r) => r.id === client.assignedRoomId)}
                          onEdit={handleEditClient}
                          onDelete={handleDeleteClient}
                        />
                      ))}
                    </div>
                  )}

                  <ClientFormDialog
                    open={clientDialogOpen}
                    onOpenChange={setClientDialogOpen}
                    client={editingClient}
                    rooms={rooms}
                    onSave={handleSaveClient}
                  />
                </section>
              )}

              {activeSection === 'inventory' && (
                <section>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-2xl font-bold text-foreground">Inventario</h2>
                      {lowStockItems.length > 0 && (
                        <span className="text-xs bg-warning/15 text-warning border border-warning/30 rounded-full px-2.5 py-0.5 font-medium">
                          {lowStockItems.length} stock bajo
                        </span>
                      )}
                      {outOfStockItems.length > 0 && (
                        <span className="text-xs bg-destructive/15 text-destructive border border-destructive/30 rounded-full px-2.5 py-0.5 font-medium">
                          {outOfStockItems.length} sin stock
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => downloadCSV(inventory.map((i) => ({
                          Nombre: i.name,
                          Categoría: i.category,
                          Cantidad: i.quantity,
                          'Stock Mínimo': i.minStock,
                          'Cuarto Asignado': rooms.find((r) => r.id === i.assignedRoomId)?.name ?? 'General',
                        })), 'inventario')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        CSV
                      </Button>
                      <Button onClick={() => { setEditingInventory(null); setInventoryDialogOpen(true); }} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                        <Plus className="h-4 w-4" />
                        Agregar Artículo
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Total: {inventory.length} artículos
                  </p>

                  {inventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center">
                      <p className="text-lg font-medium text-muted-foreground">No hay artículos en inventario</p>
                      <p className="mt-1 text-sm text-muted-foreground">Comienza agregando tu primer artículo</p>
                      <Button onClick={() => { setEditingInventory(null); setInventoryDialogOpen(true); }} className="mt-4 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                        <Plus className="h-4 w-4" />
                        Agregar Artículo
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {inventory.map((item) => (
                        <InventoryCard
                          key={item.id}
                          item={item}
                          onEdit={handleEditInventory}
                          onDelete={handleDeleteInventory}
                        />
                      ))}
                    </div>
                  )}

                  <InventoryFormDialog
                    open={inventoryDialogOpen}
                    onOpenChange={setInventoryDialogOpen}
                    item={editingInventory}
                    rooms={rooms}
                    onSave={handleSaveInventory}
                  />
                </section>
              )}

              {activeSection === 'config' && (
                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">Configuración</h2>
                  <div className="space-y-6">
                    <FeaturesConfig features={availableFeatures} onFeaturesChange={setAvailableFeatures} />
                    <FloorsConfig floors={floors} onFloorsChange={setFloors} />
                    <MapEditor rooms={rooms} onRoomsChange={setRooms} floors={floors} availableFeatures={availableFeatures} onDeleteRoom={handleDelete} />
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>

        <RoomFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          room={editingRoom}
          onSave={handleSave}
          availableFeatures={availableFeatures}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
