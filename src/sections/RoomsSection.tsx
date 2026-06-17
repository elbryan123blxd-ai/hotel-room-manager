import { Room, isRoomAvailable } from '@/types/room';
import { Client } from '@/types/client';
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

type StatusFilter = 'all' | 'available' | 'occupied';

interface RoomsSectionProps {
  rooms: Room[];
  filteredRooms: Room[];
  roomSearch: string;
  onRoomSearchChange: (v: string) => void;
  filter: StatusFilter;
  onFilterChange: (v: StatusFilter) => void;
  typeFilter: string;
  onTypeFilterChange: (v: string) => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  onNewRoom: () => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  clients: Client[];
  onEditClient: (client: Client) => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  editingRoom: Room | null;
  onSave: (data: Omit<Room, 'id'> & { id?: string }) => void;
  availableFeatures: string[];
}

export function RoomsSection({ rooms, filteredRooms, roomSearch, onRoomSearchChange, filter, onFilterChange, typeFilter, onTypeFilterChange, sortBy, onSortByChange, onNewRoom, onEdit, onDelete, onToggleStatus, clients, onEditClient, dialogOpen, onDialogOpenChange, editingRoom, onSave, availableFeatures }: RoomsSectionProps) {
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
              onChange={(e) => onRoomSearchChange(e.target.value)}
              className="pl-7 h-9 text-xs"
            />
          </div>
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(v) => v && onFilterChange(v as StatusFilter)}
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
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
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
          <Select value={sortBy} onValueChange={onSortByChange}>
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
          <Button onClick={onNewRoom} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
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
            <Button onClick={onNewRoom} className="mt-5 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              Agregar Cuarto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              clients={clients}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onEditClient={onEditClient}
            />
          ))}
        </div>
      )}

      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        room={editingRoom}
        onSave={onSave}
        availableFeatures={availableFeatures}
      />
    </section>
  );
}
