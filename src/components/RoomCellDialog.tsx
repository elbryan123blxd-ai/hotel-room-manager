import { useMemo, useState } from 'react';
import { Room, isRoomAvailable } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Trash2, XCircle, BedDouble } from 'lucide-react';

interface RoomCellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onAssign: (roomId: string) => void;
  onUnassign: (roomId: string) => void;
  onDelete: (roomId: string) => void;
  allRooms: Room[];
  position: string;
}

export function RoomCellDialog({ open, onOpenChange, room, onAssign, onUnassign, onDelete, allRooms, position }: RoomCellDialogProps) {
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const availableRooms = useMemo(() =>
    allRooms.filter((r) => (r.floorId === '' || r.floorId === undefined) && r.id !== room?.id),
    [allRooms, room]
  );

  const isExisting = !!room;
  const available = room ? isRoomAvailable(room) : true;

  const handleAssign = () => {
    if (!selectedRoomId) return;
    onAssign(selectedRoomId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isExisting ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="font-display text-xl">{room!.name}</DialogTitle>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    available
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  {available ? 'Disponible' : 'Ocupado'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {room!.type} · <DollarSign className="inline h-3 w-3" />{room!.pricePerNight}/noche
              </p>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-lg bg-muted/30 p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Ubicación</p>
                <p className="text-sm font-medium">{position}</p>
              </div>

              {room!.features.length > 0 && (
                <div className="rounded-lg bg-muted/30 p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Servicios</p>
                  <div className="flex flex-wrap gap-1.5">
                    {room!.features.map((f) => (
                      <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                onClick={() => { onUnassign(room!.id); onOpenChange(false); }}
              >
                <XCircle className="h-3.5 w-3.5" />
                Desasignar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={() => { onDelete(room!.id); onOpenChange(false); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Asignar cuarto a {position}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Selecciona un cuarto existente para colocarlo en esta posición.
              </p>
            </DialogHeader>

            <div className="space-y-2">
              <Label>Cuarto disponible</Label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un cuarto..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} — {r.type} (${r.pricePerNight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableRooms.length === 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                  <BedDouble className="h-3 w-3" />
                  No hay cuartos sin asignar. Crea uno nuevo en la sección Cuartos.
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedRoomId}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Asignar a {position}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
