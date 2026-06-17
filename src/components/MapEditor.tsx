import { useState } from 'react';
import { Floor, findRoomAt, isRoomAvailable } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3x3 } from 'lucide-react';
import { RoomCellDialog } from './RoomCellDialog';
import { useHotel } from '@/contexts/HotelContext';

export function MapEditor() {
  const { rooms, floors, updateRoom, deleteRoom } = useHotel();
  const [dialogData, setDialogData] = useState<{
    room: ReturnType<typeof findRoomAt> | null;
    floor: Floor;
    roomNumber: number;
    position: string;
  } | null>(null);

  const maxCols = Math.max(1, ...floors.map((f) => f.cantidadCuartos));

  const handleCellClick = (floor: Floor, roomNumber: number) => {
    const found = findRoomAt(rooms, floor.id, roomNumber) ?? null;
    const position = `${floor.name} - Nº ${roomNumber}`;
    setDialogData({ room: found, floor, roomNumber, position });
  };

  const handleAssign = (roomId: string) => {
    if (!dialogData) return;
    const existing = findRoomAt(rooms, dialogData.floor.id, dialogData.roomNumber);
    if (existing && existing.id !== roomId) {
      updateRoom(existing.id, { floorId: '', roomNumber: 0 });
    }
    updateRoom(roomId, { floorId: dialogData.floor.id, roomNumber: dialogData.roomNumber });
    setDialogData(null);
  };

  const handleUnassign = (roomId: string) => {
    updateRoom(roomId, { floorId: '', roomNumber: 0 });
    setDialogData(null);
  };

  const totalRooms = rooms.length;
  const availableCount = rooms.filter(isRoomAvailable).length;
  const occupiedCount = totalRooms - availableCount;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-accent" />
          <CardTitle className="font-display text-xl">Editor del Mapa de Cuartos</CardTitle>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{totalRooms} cuartos</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-success" />
            {availableCount} disponibles
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {occupiedCount} ocupados
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Haz clic en una celda vacía para asignarle un cuarto existente. Haz clic en un cuarto asignado para ver sus detalles, desasignarlo o eliminarlo.
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
                  const available = room ? isRoomAvailable(room) : false;
                  return (
                    <div
                      key={colIndex}
                      className={`aspect-square flex items-center justify-center rounded text-[10px] font-semibold border transition-all ${
                        room
                          ? available
                            ? 'bg-success/10 text-success border-success/30 hover:bg-success/20 cursor-pointer'
                            : 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 cursor-pointer'
                          : isFilled
                            ? 'bg-muted/30 text-muted-foreground/30 border-dashed border-muted-foreground/20 hover:bg-muted/50 cursor-pointer'
                            : 'bg-transparent border-transparent cursor-default'
                      }`}
                      onClick={() => isFilled && handleCellClick(floor, roomNumber)}
                    >
                      {room?.name ?? (isFilled ? `${floor.name.slice(-1)}${('0' + roomNumber).slice(-2)}` : '')}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {dialogData && (
          <RoomCellDialog
            open={!!dialogData}
            onOpenChange={() => setDialogData(null)}
            room={dialogData.room}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onDelete={deleteRoom}
            allRooms={rooms}
            position={dialogData.position}
          />
        )}
      </CardContent>
    </Card>
  );
}
