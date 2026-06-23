import { useCallback } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useHotel } from '@/contexts/HotelContext';

export function DashboardSection() {
  const { rooms, clients, floors, updateClient } = useHotel();

  const handleAssignClient = useCallback((clientId: string, roomId: string | null) => {
    updateClient(clientId, { assignedRoomId: roomId });
  }, [updateClient]);

  return (
    <div key="dashboard" className="animate-slide-up">
      <DashboardHeader rooms={rooms} clients={clients} floors={floors} onAssignClient={handleAssignClient} />
    </div>
  );
}
