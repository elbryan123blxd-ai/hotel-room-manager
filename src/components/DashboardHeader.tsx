import { Hotel, BedDouble, CheckCircle, XCircle } from 'lucide-react';
import { Room, isRoomAvailable } from '@/types/room';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface DashboardHeaderProps {
  rooms: Room[];
}

export function DashboardHeader({ rooms }: DashboardHeaderProps) {
  const available = rooms.filter(isRoomAvailable).length;
  const occupied = rooms.length - available;

  const stats = [
    { label: 'Total Cuartos', value: rooms.length, icon: BedDouble, color: 'text-accent' },
    { label: 'Disponibles', value: available, icon: CheckCircle, color: 'text-success' },
    { label: 'Ocupados', value: occupied, icon: XCircle, color: 'text-destructive' },
  ];

  // Build 8x8 grid cells from room names
  const cells: string[] = [];
  for (let i = 0; i < 64; i++) {
    cells.push(i < rooms.length ? rooms[i].name : '');
  }
  const rows: string[][] = [];
  for (let r = 0; r < 8; r++) {
    rows.push(cells.slice(r * 8, r * 8 + 8));
  }

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card border border-border"
          >
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Mapa de Cuartos</h3>
        <div className="grid grid-cols-8 gap-2 max-w-md">
          {cells.map((name, i) => (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold border ${
                name
                  ? rooms.find((r) => r.name === name) && isRoomAvailable(rooms.find((r) => r.name === name)!)
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-destructive/10 text-destructive border-destructive/30'
                  : 'bg-muted/30 text-muted-foreground/20 border-transparent'
              }`}
            >
              {name || ''}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
