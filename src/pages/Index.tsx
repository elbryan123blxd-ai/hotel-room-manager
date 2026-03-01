import { useState, useMemo } from 'react';
import { Room, isRoomAvailable } from '@/types/room';
import { sampleRooms } from '@/data/sampleRooms';
import { RoomCard } from '@/components/RoomCard';
import { RoomFormDialog } from '@/components/RoomFormDialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type StatusFilter = 'all' | 'available' | 'occupied';

const Index = () => {
  const [rooms, setRooms] = useState<Room[]>(sampleRooms);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const { toast } = useToast();

  const filteredRooms = useMemo(() => {
    if (filter === 'all') return rooms;
    return rooms.filter((r) =>
      filter === 'available' ? isRoomAvailable(r) : !isRoomAvailable(r)
    );
  }, [rooms, filter]);

  const handleSave = (data: Omit<Room, 'id'> & { id?: string }) => {
    if (data.id) {
      setRooms((prev) => prev.map((r) => (r.id === data.id ? { ...r, ...data } as Room : r)));
      toast({ title: 'Cuarto actualizado', description: `"${data.name}" se ha editado correctamente.` });
    } else {
      const newRoom: Room = { ...data, id: crypto.randomUUID() } as Room;
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
          // Mark as occupied (today + 7 days)
          const start = new Date().toISOString().split('T')[0];
          const end = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
          return { ...r, occupancyStart: start, occupancyEnd: end };
        } else {
          // Mark as available
          return { ...r, occupancyStart: null, occupancyEnd: null };
        }
      })
    );
  };

  const handleNewRoom = () => {
    setEditingRoom(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader rooms={rooms} />

        <section className="mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Cuartos</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <ToggleGroup
                type="single"
                value={filter}
                onValueChange={(v) => v && setFilter(v as StatusFilter)}
                className="bg-muted rounded-lg p-0.5"
              >
                <ToggleGroupItem value="all" className="text-xs px-3 data-[state=on]:bg-card data-[state=on]:shadow-sm rounded-md">
                  Todos
                </ToggleGroupItem>
                <ToggleGroupItem value="available" className="text-xs px-3 data-[state=on]:bg-success/15 data-[state=on]:text-success data-[state=on]:shadow-sm rounded-md">
                  Disponibles
                </ToggleGroupItem>
                <ToggleGroupItem value="occupied" className="text-xs px-3 data-[state=on]:bg-destructive/15 data-[state=on]:text-destructive data-[state=on]:shadow-sm rounded-md">
                  Ocupados
                </ToggleGroupItem>
              </ToggleGroup>
              <Button onClick={handleNewRoom} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" />
                Agregar Cuarto
              </Button>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                {filter === 'all' ? 'No hay cuartos registrados' : `No hay cuartos ${filter === 'available' ? 'disponibles' : 'ocupados'}`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === 'all' ? 'Comienza agregando tu primer cuarto' : 'Prueba cambiando el filtro'}
              </p>
              {filter === 'all' && (
                <Button onClick={handleNewRoom} className="mt-4 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="h-4 w-4" />
                  Agregar Cuarto
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
              ))}
            </div>
          )}
        </section>

        <RoomFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          room={editingRoom}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default Index;
