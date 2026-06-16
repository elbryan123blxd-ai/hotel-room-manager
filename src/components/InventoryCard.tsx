import { InventoryItem } from '@/types/inventory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const isLowStock = item.quantity <= item.minStock;
  const isOutOfStock = item.quantity === 0;

  return (
    <Card className="group relative overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isOutOfStock ? 'bg-destructive' : isLowStock ? 'bg-warning' : 'bg-success'
        }`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-accent" />
              <h3 className="font-display text-xl font-bold text-foreground">
                {item.name}
              </h3>
            </div>
            <Badge variant="secondary" className="text-xs font-medium">
              {item.category}
            </Badge>
          </div>
          {isLowStock && (
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                isOutOfStock
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : 'bg-warning/10 text-warning border-warning/20'
              }`}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {isOutOfStock ? 'Sin stock' : 'Stock bajo'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold font-display ${
            isOutOfStock ? 'text-destructive' : isLowStock ? 'text-warning' : 'text-foreground'
          }`}>
            {item.quantity}
          </span>
          <span className="text-sm text-muted-foreground">unidades</span>
          {item.assignedRoomId && (
            <span className="text-xs text-muted-foreground ml-auto">
              Cuarto {item.assignedRoomId}
            </span>
          )}
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isOutOfStock ? 'bg-destructive' : isLowStock ? 'bg-warning' : 'bg-success'
            }`}
            style={{
              width: `${Math.min(100, (item.quantity / (item.minStock * 2)) * 100)}%`,
            }}
          />
        </div>

        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
