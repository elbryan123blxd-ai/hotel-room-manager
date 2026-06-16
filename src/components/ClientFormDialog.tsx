import { useState, useEffect } from 'react';
import { Client } from '@/types/client';
import { Room } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  rooms: Room[];
  onSave: (client: Omit<Client, 'id'> & { id?: string }) => void;
}

export function ClientFormDialog({ open, onOpenChange, client, rooms, onSave }: ClientFormDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [assignedRoomId, setAssignedRoomId] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone);
      setIdNumber(client.idNumber);
      setAssignedRoomId(client.assignedRoomId);
      setCheckIn(client.checkIn || '');
      setCheckOut(client.checkOut || '');
      setNotes(client.notes);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setIdNumber('');
      setAssignedRoomId(null);
      setCheckIn('');
      setCheckOut('');
      setNotes('');
    }
  }, [client, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    onSave({
      ...(client ? { id: client.id } : {}),
      name,
      email,
      phone,
      idNumber,
      assignedRoomId,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      notes,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="client-name">Nombre Completo</Label>
            <Input
              id="client-name"
              placeholder="Ej: María García López"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Teléfono</Label>
              <Input
                id="client-phone"
                placeholder="+52 55 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-id">ID / Documento</Label>
            <Input
              id="client-id"
              placeholder="DNI, Pasaporte..."
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Asignar a Cuarto</Label>
            <Select
              value={assignedRoomId || 'none'}
              onValueChange={(v) => setAssignedRoomId(v === 'none' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cuarto</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} — {room.type} (${room.pricePerNight}/noche)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="client-checkin">Fecha Check-in</Label>
              <Input
                id="client-checkin"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-checkout">Fecha Check-out</Label>
              <Input
                id="client-checkout"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-notes">Notas</Label>
            <Textarea
              id="client-notes"
              placeholder="Preferencias, solicitudes especiales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {client ? 'Guardar Cambios' : 'Agregar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
