import { useState } from 'react';
import type { Client } from '@/types/client';
import { ClientCard } from '@/components/ClientCard';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { Button } from '@/components/ui/button';
import { Plus, Download, Users } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';
import { useHotel } from '@/contexts/HotelContext';
import { usePagination, PaginationControls } from '@/hooks/use-pagination';

export function ClientsSection() {
  const { clients, rooms, addClient, updateClient, deleteClient } = useHotel();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { pageItems, ...pag } = usePagination(clients, 9);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Client, 'id'> & { id?: string }) => {
    if (data.id) {
      updateClient(data.id, data);
    } else {
      addClient(data);
    }
    setEditingClient(null);
    setDialogOpen(false);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

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
          <Button onClick={handleNewClient} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
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
          <Button onClick={handleNewClient} className="mt-5 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                assignedRoom={rooms.find((r) => r.id === client.assignedRoomId)}
                onEdit={handleEdit}
                onDelete={deleteClient}
              />
            ))}
          </div>
          <PaginationControls {...pag} total={clients.length} />
        </>
      )}

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingClient(null); }}
        client={editingClient}
        rooms={rooms}
        onSave={handleSave}
      />
    </section>
  );
}
