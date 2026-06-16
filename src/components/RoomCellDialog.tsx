import { useState, useEffect } from 'react';
import { Room, ROOM_TYPES } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { X, Trash2 } from 'lucide-react';

interface RoomCellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onSave: (data: Omit<Room, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  availableFeatures: string[];
  floorId: string;
  roomNumber: number;
  suggestedName: string;
}

export function RoomCellDialog({ open, onOpenChange, room, onSave, onDelete, availableFeatures, floorId, roomNumber, suggestedName }: RoomCellDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Room['type']>('Sencilla');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [isOccupied, setIsOccupied] = useState(false);

  useEffect(() => {
    if (room) {
      setName(room.name);
      setType(room.type);
      setPrice(room.pricePerNight.toString());
      setFeatures(room.features);
      setIsOccupied(!!room.occupancyStart);
    } else {
      setName(suggestedName);
      setType('Sencilla');
      setPrice('');
      setFeatures([]);
      setIsOccupied(false);
    }
  }, [room, open, suggestedName]);

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    onSave({
      ...(room ? { id: room.id } : {}),
      name,
      type,
      pricePerNight: parseFloat(price),
      features,
      floorId,
      roomNumber,
      occupancyStart: isOccupied ? new Date().toISOString().split('T')[0] : null,
      occupancyEnd: isOccupied ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {room ? `Editar: ${room.name}` : `Nuevo cuarto en ${suggestedName}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cell-name">Nombre</Label>
            <Input
              id="cell-name"
              placeholder="Ej: 101, Suite..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as Room['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cell-price">Precio por Noche ($)</Label>
            <Input
              id="cell-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cell-occupied"
              checked={isOccupied}
              onChange={(e) => setIsOccupied(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            <Label htmlFor="cell-occupied" className="text-sm">Ocupado</Label>
          </div>

          <div className="space-y-2">
            <Label>Servicios</Label>
            <div className="flex flex-wrap gap-1.5">
              {availableFeatures.map((feature) => (
                <Badge
                  key={feature}
                  variant={features.includes(feature) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all select-none ${
                    features.includes(feature)
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => toggleFeature(feature)}
                >
                  {feature}
                  {features.includes(feature) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {room && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="gap-1 mr-auto"
                onClick={() => { onDelete(room.id); onOpenChange(false); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {room ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
