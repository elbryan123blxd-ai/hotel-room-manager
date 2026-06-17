import { Room, Floor } from '@/types/room';
import { FeaturesConfig } from '@/components/FeaturesConfig';
import { FloorsConfig } from '@/components/FloorsConfig';
import { MapEditor } from '@/components/MapEditor';

interface ConfigSectionProps {
  availableFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  floors: Floor[];
  onFloorsChange: (floors: Floor[]) => void;
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
  onDeleteRoom: (id: string) => void;
}

export function ConfigSection({ availableFeatures, onFeaturesChange, floors, onFloorsChange, rooms, onRoomsChange, onDeleteRoom }: ConfigSectionProps) {
  return (
    <section key="config" className="animate-slide-up">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Configuración</h2>
      <div className="space-y-6">
        <FeaturesConfig features={availableFeatures} onFeaturesChange={onFeaturesChange} />
        <FloorsConfig floors={floors} onFloorsChange={onFloorsChange} />
        <MapEditor rooms={rooms} onRoomsChange={onRoomsChange} floors={floors} availableFeatures={availableFeatures} onDeleteRoom={onDeleteRoom} />
      </div>
    </section>
  );
}
