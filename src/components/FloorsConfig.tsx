import { useState } from 'react';
import { Floor, DEFAULT_CANTIDAD_CUARTOS } from '@/types/room';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Building2 } from 'lucide-react';

interface FloorsConfigProps {
  floors: Floor[];
  onFloorsChange: (floors: Floor[]) => void;
}

export function FloorsConfig({ floors, onFloorsChange }: FloorsConfigProps) {
  const [newFloor, setNewFloor] = useState('');

  const addFloor = () => {
    const name = newFloor.trim();
    if (!name) return;
    if (floors.some((f) => f.name === name)) return;
    onFloorsChange([...floors, { id: crypto.randomUUID(), name, cantidadCuartos: DEFAULT_CANTIDAD_CUARTOS }]);
    setNewFloor('');
  };

  const removeFloor = (index: number) => {
    onFloorsChange(floors.filter((_, i) => i !== index));
  };

  const updateCantidad = (index: number, cantidad: number) => {
    const updated = floors.map((f, i) =>
      i === index ? { ...f, cantidadCuartos: Math.max(1, cantidad) } : f
    );
    onFloorsChange(updated);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-accent" />
          <CardTitle className="font-display text-xl">Pisos Disponibles</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Define los pisos y cuántos cuartos tiene cada uno.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Ej: Piso 1, Planta Baja..."
            value={newFloor}
            onChange={(e) => setNewFloor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFloor()}
            className="h-9 text-sm"
          />
          <Button onClick={addFloor} size="sm" className="gap-1 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>

        {floors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay pisos configurados. Agrega al menos uno para ver el mapa.
          </p>
        ) : (
          <div className="space-y-2">
            {floors.map((floor, i) => (
              <div
                key={floor.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground min-w-0">
                  {i + 1}. {floor.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">
                    Cuartos:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={floor.cantidadCuartos}
                    onChange={(e) => updateCantidad(i, parseInt(e.target.value) || 1)}
                    className="h-8 w-16 text-xs text-center"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFloor(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
