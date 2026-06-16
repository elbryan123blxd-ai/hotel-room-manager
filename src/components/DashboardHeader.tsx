import { useState } from 'react';
import {
  Hotel, BedDouble, CheckCircle, XCircle, Search, User,
  TrendingUp, CalendarCheck, DollarSign,
} from 'lucide-react';
import { Room, isRoomAvailable, Floor, findRoomAt } from '@/types/room';
import { Client } from '@/types/client';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  rooms: Room[];
  clients: Client[];
  floors: Floor[];
}

export function DashboardHeader({ rooms, clients, floors }: DashboardHeaderProps) {
  const [search, setSearch] = useState('');

  const available = rooms.filter(isRoomAvailable).length;
  const occupied = rooms.length - available;
  const occupancyRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
  const dailyRevenue = rooms
    .filter((r) => !isRoomAvailable(r))
    .reduce((sum, r) => sum + r.pricePerNight, 0);

  const upcomingCheckIns = clients.filter((c) => {
    if (!c.checkIn) return false;
    return new Date(c.checkIn) >= new Date();
  }).length;

  const stats = [
    { label: 'Total Cuartos', value: rooms.length, icon: BedDouble, color: 'text-accent' },
    { label: 'Disponibles', value: available, icon: CheckCircle, color: 'text-success' },
    { label: 'Ocupados', value: occupied, icon: XCircle, color: 'text-destructive' },
    { label: 'Ocupación', value: `${occupancyRate}%`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Ingresos/día', value: `$${dailyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-accent' },
    { label: 'Próximos check-ins', value: upcomingCheckIns, icon: CalendarCheck, color: 'text-primary' },
  ];

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.idNumber.toLowerCase().includes(search.toLowerCase())
  );

  const maxCols = Math.max(1, ...floors.map((f) => f.cantidadCuartos));

  return (
    <header className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Hotel className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground text-sm">
            Gestión de inventario hotelero
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card border border-border"
          >
            <stat.icon className={`h-6 w-6 shrink-0 ${stat.color}`} />
            <div className="min-w-0">
              <p className="text-lg font-bold font-display text-foreground truncate">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Clientes + Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Listado de Clientes</h3>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No se encontraron clientes</p>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.idNumber}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Mapa de Cuartos</h3>
          <div className="space-y-2">
            {floors.map((floor) => (
              <div key={floor.id} className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-muted-foreground w-14 shrink-0 text-right leading-tight">{floor.name}</span>
                <div className="grid gap-1.5 flex-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
                  {Array.from({ length: maxCols }).map((_, colIndex) => {
                    const isFilled = colIndex < floor.cantidadCuartos;
                    const roomNumber = colIndex + 1;
                    const room = isFilled ? findRoomAt(rooms, floor.id, roomNumber) : undefined;
                    return (
                      <div
                        key={colIndex}
                        className={`aspect-square flex items-center justify-center rounded text-[10px] font-semibold border ${
                          room
                            ? isRoomAvailable(room)
                              ? 'bg-success/10 text-success border-success/30'
                              : 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-muted/30 text-muted-foreground/20 border-transparent'
                        }`}
                      >
                        {room?.name ?? ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
