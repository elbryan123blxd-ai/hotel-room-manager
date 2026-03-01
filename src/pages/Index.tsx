import { useState } from 'react';
import { Room } from '@/types/room';
import { sampleRooms } from '@/data/sampleRooms';
import { RoomCard } from '@/components/RoomCard';
import { RoomFormDialog } from '@/components/RoomFormDialog';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [rooms, setRooms] = useState<Room[]>(sampleRooms);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const { toast } = useToast();

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

  const handleNewRoom = () => {
    setEditingRoom(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader rooms={rooms} />

        <section className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Cuartos</h2>
            <Button onClick={handleNewRoom} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              Agregar Cuarto
            </Button>
          </div>

          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No hay cuartos registrados
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Comienza agregando tu primer cuarto
              </p>
              <Button onClick={handleNewRoom} className="mt-4 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" />
                Agregar Cuarto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} />
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
