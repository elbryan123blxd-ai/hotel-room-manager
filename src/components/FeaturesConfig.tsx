import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Settings, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeaturesConfigProps {
  features: string[];
  onFeaturesChange: (features: string[]) => void;
}

export function FeaturesConfig({ features, onFeaturesChange }: FeaturesConfigProps) {
  const [newFeature, setNewFeature] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (features.includes(trimmed)) {
      toast({ title: 'Ya existe', description: `"${trimmed}" ya está en la lista.`, variant: 'destructive' });
      return;
    }
    onFeaturesChange([...features, trimmed]);
    setNewFeature('');
    toast({ title: 'Característica agregada', description: `"${trimmed}" se ha añadido.` });
  };

  const handleRemove = (feature: string) => {
    onFeaturesChange(features.filter((f) => f !== feature));
    toast({ title: 'Característica eliminada', description: `"${feature}" se ha removido.` });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent" />
          <CardTitle className="font-display text-xl">Características Disponibles</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Configura las opciones que podrás asignar a cada cuarto.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new */}
        <div className="flex gap-2">
          <Input
            placeholder="Nueva característica..."
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleAdd}
            disabled={!newFeature.trim()}
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>

        {/* List */}
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay características configuradas
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="gap-1.5 py-1.5 px-3 text-sm"
              >
                <Tag className="h-3 w-3" />
                {feature}
                <button
                  onClick={() => handleRemove(feature)}
                  className="ml-1 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
