import { useState, useEffect } from 'react';
import { InventoryItem, INVENTORY_CATEGORIES } from '@/types/inventory';
import { Room } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InventoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  rooms: Room[];
  onSave: (item: Omit<InventoryItem, 'id'> & { id?: string }) => void;
}

export function InventoryFormDialog({ open, onOpenChange, item, rooms, onSave }: InventoryFormDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(INVENTORY_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('0');
  const [minStock, setMinStock] = useState('5');
  const [assignedRoomId, setAssignedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity.toString());
      setMinStock(item.minStock.toString());
      setAssignedRoomId(item.assignedRoomId);
    } else {
      setName('');
      setCategory(INVENTORY_CATEGORIES[0]);
      setQuantity('0');
      setMinStock('5');
      setAssignedRoomId(null);
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSave({
      ...(item ? { id: item.id } : {}),
      name,
      category,
      quantity: parseInt(quantity, 10) || 0,
      minStock: parseInt(minStock, 10) || 0,
      assignedRoomId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {item ? 'Editar Artículo' : 'Nuevo Artículo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="item-name">Nombre del Artículo</Label>
            <Input
              id="item-name"
              placeholder="Ej: Toallas, Jabón, Coca-Cola..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="item-quantity">Cantidad</Label>
              <Input
                id="item-quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-minstock">Stock Mínimo</Label>
              <Input
                id="item-minstock"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asignar a Cuarto (opcional)</Label>
            <Select
              value={assignedRoomId || 'none'}
              onValueChange={(v) => setAssignedRoomId(v === 'none' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Inventario general" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Inventario general</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Cuarto {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {item ? 'Guardar Cambios' : 'Agregar Artículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
