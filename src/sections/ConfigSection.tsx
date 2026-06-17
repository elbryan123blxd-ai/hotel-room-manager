import { FeaturesConfig } from '@/components/FeaturesConfig';
import { FloorsConfig } from '@/components/FloorsConfig';
import { MapEditor } from '@/components/MapEditor';
import { useHotel } from '@/contexts/HotelContext';

export function ConfigSection() {
  const { availableFeatures, setAvailableFeatures, floors, setFloors } = useHotel();

  return (
    <section key="config" className="animate-slide-up">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Configuración</h2>
      <div className="space-y-6">
        <FeaturesConfig features={availableFeatures} onFeaturesChange={setAvailableFeatures} />
        <FloorsConfig floors={floors} onFloorsChange={setFloors} />
        <MapEditor />
      </div>
    </section>
  );
}
