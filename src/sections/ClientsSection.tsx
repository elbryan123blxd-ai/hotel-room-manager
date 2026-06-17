import { Client } from '@/types/client';
import { Room } from '@/types/room';
import { ClientCard } from '@/components/ClientCard';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { Button } from '@/components/ui/button';
import { Plus, Download, Users } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';

interface ClientsSectionProps {
  clients: Client[];
  rooms: Room[];
  onSave: (data: Omit<Client, 'id'> & { id?: string }) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  editingClient: Client | null;
  onNewClient: () => void;
}

export function ClientsSection({ clients, rooms, onSave, onEdit, onDelete, dialogOpen, onDialogOpenChange, editingClient, onNewClient }: ClientsSectionProps) {
  return (
    <section key="clients" className="animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Clientes</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => downloadCSV(clients.map((c) => ({
              Nombre: c.name,
              Email: c.email,
              Teléfono: c.phone,
              Documento: c.idNumber,
              'Cuarto Asignado': rooms.find((r) => r.id === c.assignedRoomId)?.name ?? '',
              'Check-in': c.checkIn ?? '',
              'Check-out': c.checkOut ?? '',
              Notas: c.notes,
            })), 'clientes')}
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button onClick={onNewClient} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Total: {clients.length} clientes
      </p>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Users className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-medium text-foreground">No hay clientes registrados</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">Agrega tu primer cliente para llevar el control de hospedajes</p>
          <Button onClick={onNewClient} className="mt-5 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              assignedRoom={rooms.find((r) => r.id === client.assignedRoomId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        client={editingClient}
        rooms={rooms}
        onSave={onSave}
      />
    </section>
  );
}
