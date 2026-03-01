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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onSave: (room: Omit<Room, 'id'> & { id?: string }) => void;
  availableFeatures: string[];
}

export function RoomFormDialog({ open, onOpenChange, room, onSave, availableFeatures }: RoomFormDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Room['type']>('Sencilla');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (room) {
      setName(room.name);
      setType(room.type);
      setPrice(room.pricePerNight.toString());
      setFeatures(room.features);
      setStartDate(room.occupancyStart ? new Date(room.occupancyStart) : undefined);
      setEndDate(room.occupancyEnd ? new Date(room.occupancyEnd) : undefined);
    } else {
      setName('');
      setType('Sencilla');
      setPrice('');
      setFeatures([]);
      setStartDate(undefined);
      setEndDate(undefined);
    }
  }, [room, open]);

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
      occupancyStart: startDate ? format(startDate, 'yyyy-MM-dd') : null,
      occupancyEnd: endDate ? format(endDate, 'yyyy-MM-dd') : null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {room ? 'Editar Cuarto' : 'Nuevo Cuarto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="room-name">Nombre o Número</Label>
            <Input
              id="room-name"
              placeholder="Ej: 101, Suite Imperial..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo de Habitación</Label>
            <Select value={type} onValueChange={(v) => setType(v as Room['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="room-price">Precio por Noche ($)</Label>
            <Input
              id="room-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Características</Label>
            <div className="flex flex-wrap gap-2">
              {availableFeatures.map((feature) => (
                <Badge
                  key={feature}
                  variant={features.includes(feature) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all select-none',
                    features.includes(feature)
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'hover:bg-secondary'
                  )}
                  onClick={() => toggleFeature(feature)}
                >
                  {feature}
                  {features.includes(feature) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Occupancy dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fecha Inicio Ocupación</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'Seleccionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin Ocupación</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'Seleccionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {room ? 'Guardar Cambios' : 'Agregar Cuarto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
