import { useState, useMemo } from 'react';
import { Room, isRoomAvailable } from '@/types/room';
import { RoomCard } from '@/components/RoomCard';
import { RoomFormDialog } from '@/components/RoomFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUpDown, Download, Search, BedDouble } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHotel } from '@/contexts/HotelContext';
import type { RoomFormData } from '@/types/room';
import { usePagination, PaginationControls } from '@/hooks/use-pagination';

type StatusFilter = 'all' | 'available' | 'occupied';

export function RoomsSection() {
  const { rooms, clients, availableFeatures, addRoom, updateRoom, deleteRoom, toggleRoomStatus } = useHotel();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('default');
  const [roomSearch, setRoomSearch] = useState('');

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

  const { pageItems, ...pag } = usePagination(filteredRooms);

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setDialogOpen(true);
  };

  const handleSave = (data: RoomFormData & { id?: string }) => {
    if (data.id) {
      updateRoom(data.id, data);
    } else {
      addRoom(data);
    }
    setEditingRoom(null);
    setDialogOpen(false);
  };

  const handleNewRoom = () => {
    setEditingRoom(null);
    setDialogOpen(true);
  };

  return (
    <section key="rooms" className="animate-slide-up">
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
              <SelectItem value="name">Nombre</SelectItem>
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
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <BedDouble className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-medium text-foreground">
            {roomSearch || typeFilter !== 'all'
              ? 'Sin resultados'
              : filter === 'all'
                ? 'No hay cuartos todavía'
                : `No hay cuartos ${filter === 'available' ? 'disponibles' : 'ocupados'}`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            {roomSearch || typeFilter !== 'all' ? 'Intenta con otros filtros o términos de búsqueda' : filter === 'all' ? 'Agrega tu primer cuarto para empezar a gestionar' : 'Cambia el filtro para ver otros cuartos'}
          </p>
          {filter === 'all' && !roomSearch && typeFilter === 'all' && (
            <Button onClick={handleNewRoom} className="mt-5 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              Agregar Cuarto
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                clients={clients}
                onEdit={handleEdit}
                onDelete={deleteRoom}
                onToggleStatus={toggleRoomStatus}
              />
            ))}
          </div>
          <PaginationControls {...pag} total={filteredRooms.length} />
        </>
      )}

      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingRoom(null); }}
        room={editingRoom}
        onSave={handleSave}
        availableFeatures={availableFeatures}
      />
    </section>
  );
}
