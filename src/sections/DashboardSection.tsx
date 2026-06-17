import { Room, Floor } from '@/types/room';
import { Client } from '@/types/client';
import { DashboardHeader } from '@/components/DashboardHeader';

interface DashboardSectionProps {
  rooms: Room[];
  clients: Client[];
  floors: Floor[];
}

export function DashboardSection({ rooms, clients, floors }: DashboardSectionProps) {
  return (
    <div key="dashboard" className="animate-slide-up">
      <DashboardHeader rooms={rooms} clients={clients} floors={floors} />
    </div>
  );
}
