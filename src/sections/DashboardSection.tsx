import { DashboardHeader } from '@/components/DashboardHeader';
import { useHotel } from '@/contexts/HotelContext';

export function DashboardSection() {
  const { rooms, clients, floors } = useHotel();

  return (
    <div key="dashboard" className="animate-slide-up">
      <DashboardHeader rooms={rooms} clients={clients} floors={floors} />
    </div>
  );
}
