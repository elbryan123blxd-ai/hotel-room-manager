import { Hotel, BedDouble, CheckCircle, XCircle } from 'lucide-react';
import { Room, isRoomAvailable } from '@/types/room';

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
    </header>
  );
}
