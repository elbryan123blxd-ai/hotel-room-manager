import { Client } from '@/types/client';
import { Room } from '@/types/room';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pencil, Trash2, Mail, Phone, Key, CalendarDays, MessageSquare } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  assignedRoom?: Room;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export function ClientCard({ client, assignedRoom, onEdit, onDelete }: ClientCardProps) {
  const isCheckedIn = client.checkIn && client.checkOut
    && new Date() >= new Date(client.checkIn)
    && new Date() <= new Date(client.checkOut);

  return (
    <Card className="group relative overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className={`absolute top-0 left-0 right-0 h-1 ${isCheckedIn ? 'bg-success' : 'bg-muted-foreground/30'}`} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-display text-xl font-bold text-foreground">
              {client.name}
            </h3>
            <Badge variant="secondary" className="text-xs font-medium">
              {client.idNumber}
            </Badge>
          </div>
          <Badge
            variant={isCheckedIn ? 'default' : 'secondary'}
            className={`text-xs font-semibold ${
              isCheckedIn
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-muted/30 text-muted-foreground border-muted'
            }`}
          >
            {isCheckedIn ? 'Check-in' : 'Disponible'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
          {client.assignedRoomId && (
            <div className="flex items-center gap-2 text-sm">
              <Key className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Cuarto {assignedRoom?.name || client.assignedRoomId}</span>
            </div>
          )}
          {client.checkIn && client.checkOut && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{client.checkIn} → {client.checkOut}</span>
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground italic">{client.notes}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(client)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(client.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
