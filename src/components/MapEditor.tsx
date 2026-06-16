import { useState, useMemo } from 'react';
import { Room, Floor, findRoomAt } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3x3 } from 'lucide-react';
import { RoomCellDialog } from './RoomCellDialog';

interface MapEditorProps {
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
  floors: Floor[];
  availableFeatures: string[];
  onDeleteRoom?: (id: string) => void;
}

export function MapEditor({ rooms, onRoomsChange, floors, availableFeatures, onDeleteRoom }: MapEditorProps) {
  const [dialog, setDialog] = useState<{ floor: Floor; roomNumber: number } | null>(null);

  const maxCols = Math.max(1, ...floors.map((f) => f.cantidadCuartos));

  const dialogRoom = useMemo(() => {
    if (!dialog) return null;
    return findRoomAt(rooms, dialog.floor.id, dialog.roomNumber) ?? null;
  }, [rooms, dialog]);

  const handleSave = (data: Omit<Room, 'id'> & { id?: string }) => {
    if (data.id) {
      onRoomsChange((prev) => prev.map((r) => (r.id === data.id ? { ...r, ...data } as Room : r)));
    } else {
      const newRoom: Room = { ...data, id: crypto.randomUUID() } as Room;
      onRoomsChange((prev) => [...prev, newRoom]);
    }
    setDialog(null);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-accent" />
          <CardTitle className="font-display text-xl">Editor del Mapa de Cuartos</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Haz clic en una celda para configurar el cuarto.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {floors.map((floor) => (
            <div key={floor.id} className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground w-14 shrink-0 text-right leading-tight">{floor.name}</span>
              <div className="grid gap-1.5 flex-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
                {Array.from({ length: maxCols }).map((_, colIndex) => {
                  const isFilled = colIndex < floor.cantidadCuartos;
                  const roomNumber = colIndex + 1;
                  const room = isFilled ? findRoomAt(rooms, floor.id, roomNumber) : undefined;
                  return (
                    <div
                      key={colIndex}
                      className={`aspect-square flex items-center justify-center rounded text-[10px] font-semibold border transition-all group ${
                        room
                          ? 'bg-accent/15 text-accent border-accent/30 hover:bg-accent/25 cursor-pointer'
                          : isFilled
                            ? 'bg-muted/30 text-muted-foreground/30 border-dashed border-muted hover:bg-muted/50 cursor-pointer'
                            : 'bg-transparent border-transparent cursor-default'
                      }`}
                      onClick={() => isFilled && setDialog({ floor, roomNumber })}
                    >
                      {room?.name ?? (isFilled ? `${floor.name.slice(-1)}${('0' + roomNumber).slice(-2)}` : '')}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {dialog && (
          <RoomCellDialog
            open={!!dialog}
            onOpenChange={() => setDialog(null)}
            room={dialogRoom}
            onSave={handleSave}
            onDelete={onDeleteRoom}
            availableFeatures={availableFeatures}
            floorId={dialog.floor.id}
            roomNumber={dialog.roomNumber}
            suggestedName={`${dialog.floor.name.slice(-1)}${('0' + dialog.roomNumber).slice(-2)}`}
          />
        )}
      </CardContent>
    </Card>
  );
}
