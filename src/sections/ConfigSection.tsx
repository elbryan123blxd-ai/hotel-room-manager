import { useState, useEffect } from 'react';
import { FeaturesConfig } from '@/components/FeaturesConfig';
import { FloorsConfig } from '@/components/FloorsConfig';
import { MapEditor } from '@/components/MapEditor';
import { useHotel } from '@/contexts/HotelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Save } from 'lucide-react';

export function ConfigSection() {
  const { availableFeatures, setAvailableFeatures, floors, setFloors, hotelData, hotelId, updateHotel } = useHotel();
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [ruc, setRuc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hotelData) {
      setNombre(hotelData.nombre ?? '');
      setDireccion(hotelData.direccion ?? '');
      setTelefono(hotelData.telefono ?? '');
      setEmail(hotelData.email ?? '');
      setRuc(hotelData.ruc ?? '');
    }
  }, [hotelData]);

  const handleSaveHotel = async () => {
    setSaving(true);
    await updateHotel({ nombre, direccion, telefono, email, ruc });
    setSaving(false);
  };

  return (
    <section key="config" className="animate-slide-up">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Configuración</h2>
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold">Información del Hotel</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hotel-name">Nombre del hotel</Label>
              <Input id="hotel-name" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Mi Hotel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-ruc">RUC</Label>
              <Input id="hotel-ruc" value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="20123456789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-phone">Teléfono</Label>
              <Input id="hotel-phone" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+51 1 234 5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-email">Email</Label>
              <Input id="hotel-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@hotel.com" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hotel-address">Dirección</Label>
              <Input id="hotel-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Principal 123" />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSaveHotel} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
        <FeaturesConfig features={availableFeatures} onFeaturesChange={setAvailableFeatures} />
        <FloorsConfig floors={floors} onFloorsChange={setFloors} />
        <MapEditor />
      </div>
    </section>
  );
}
