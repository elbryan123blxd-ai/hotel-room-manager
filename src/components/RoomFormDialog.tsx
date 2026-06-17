import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Room, ROOM_TYPES, roomSchema, type RoomFormData } from '@/types/room';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { useHotel } from '@/contexts/HotelContext';

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onSave: (data: RoomFormData & { id?: string }) => void;
  availableFeatures: string[];
}

export function RoomFormDialog({ open, onOpenChange, room, onSave, availableFeatures }: RoomFormDialogProps) {
  const { floors } = useHotel();

  const form = useForm<RoomFormData & { id?: string }>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
      type: 'Sencilla',
      pricePerNight: 0,
      features: [],
      occupancyStart: null,
      occupancyEnd: null,
      floorId: '',
      roomNumber: 1,
    },
    values: room ? {
      id: room.id,
      name: room.name,
      type: room.type,
      pricePerNight: room.pricePerNight,
      features: room.features,
      occupancyStart: room.occupancyStart,
      occupancyEnd: room.occupancyEnd,
      floorId: room.floorId || floors[0]?.id || '',
      roomNumber: room.roomNumber || 1,
    } : undefined,
  });

  const { watch, setValue } = form;
  const selectedFloorId = watch('floorId');
  const selectedFloor = floors.find((f) => f.id === selectedFloorId);

  const handleSubmit = (data: RoomFormData & { id?: string }) => {
    onSave(data);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre o Número</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 101, Suite Imperial..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Habitación</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROOM_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="floorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Piso</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {floors.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Cuarto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={selectedFloor?.cantidadCuartos ?? 20}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pricePerNight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio por Noche ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Características</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {availableFeatures.map((feature) => (
                        <Badge
                          key={feature}
                          variant={field.value.includes(feature) ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer transition-all select-none',
                            field.value.includes(feature)
                              ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                              : 'hover:bg-secondary'
                          )}
                          onClick={() => {
                            const next = field.value.includes(feature)
                              ? field.value.filter((f) => f !== feature)
                              : [...field.value, feature];
                            field.onChange(next);
                          }}
                        >
                          {feature}
                          {field.value.includes(feature) && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha Inicio Ocupación</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !watch('occupancyStart') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('occupancyStart') ? format(new Date(watch('occupancyStart')!), 'dd/MM/yyyy') : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch('occupancyStart') ? new Date(watch('occupancyStart')!) : undefined}
                      onSelect={(date) => setValue('occupancyStart', date ? format(date, 'yyyy-MM-dd') : null)}
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
                        !watch('occupancyEnd') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('occupancyEnd') ? format(new Date(watch('occupancyEnd')!), 'dd/MM/yyyy') : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch('occupancyEnd') ? new Date(watch('occupancyEnd')!) : undefined}
                      onSelect={(date) => setValue('occupancyEnd', date ? format(date, 'yyyy-MM-dd') : null)}
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
