import { Room, isRoomAvailable } from '@/types/room';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pencil, Trash2, CalendarDays, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const typeIcons: Record<Room['type'], string> = {
  Suite: '👑',
  Doble: '🛏️',
  Sencilla: '🛌',
};

export function RoomCard({ room, onEdit, onDelete, onToggleStatus }: RoomCardProps) {
  const available = isRoomAvailable(room);

  return (
    <Card className="group relative overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      {/* Status strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          available ? 'bg-success' : 'bg-destructive'
        }`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{typeIcons[room.type]}</span>
              <h3 className="font-display text-xl font-bold text-foreground">
                {room.name}
              </h3>
            </div>
            <Badge variant="secondary" className="text-xs font-medium">
              {room.type}
            </Badge>
          </div>
          <Badge
            className={`text-xs font-semibold cursor-pointer transition-colors ${
              available
                ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
            }`}
            variant="outline"
            onClick={() => onToggleStatus(room.id)}
          >
            {available ? (
              <><ToggleRight className="h-3.5 w-3.5 mr-1" /> Disponible</>
            ) : (
              <><ToggleLeft className="h-3.5 w-3.5 mr-1" /> Ocupado</>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center gap-2 text-foreground">
          <DollarSign className="h-4 w-4 text-accent" />
          <span className="text-2xl font-bold font-display">
            ${room.pricePerNight.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">/ noche</span>
        </div>

        {/* Occupancy dates */}
        {room.occupancyStart && room.occupancyEnd && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-lg bg-muted/50 p-2.5">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>
              {format(new Date(room.occupancyStart), "d MMM yyyy", { locale: es })}
              {' → '}
              {format(new Date(room.occupancyEnd), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          {room.features.map((feature) => (
            <Badge
              key={feature}
              variant="outline"
              className="text-xs bg-secondary/50 border-border"
            >
              {feature}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(room)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(room.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
