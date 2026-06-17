import { useState, useMemo } from 'react';
import { InventoryItem, INVENTORY_CATEGORIES } from '@/types/inventory';
import { Room } from '@/types/room';
import { InventoryCard } from '@/components/InventoryCard';
import { InventoryFormDialog } from '@/components/InventoryFormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Search, Package } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InventorySectionProps {
  inventory: InventoryItem[];
  onSave: (data: Omit<InventoryItem, 'id'> & { id?: string }) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  editingItem: InventoryItem | null;
  rooms: Room[];
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  onNewItem: () => void;
}

export function InventorySection({ inventory, onSave, onEdit, onDelete, dialogOpen, onDialogOpenChange, editingItem, rooms, lowStockItems, outOfStockItems, onNewItem }: InventorySectionProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = inventory;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category === categoryFilter);
    }
    return result;
  }, [inventory, search, categoryFilter]);

  return (
    <section key="inventory" className="animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold text-foreground">Inventario</h2>
          {lowStockItems.length > 0 && (
            <span className="text-xs bg-warning/15 text-warning border border-warning/30 rounded-full px-2.5 py-0.5 font-medium">
              {lowStockItems.length} stock bajo
            </span>
          )}
          {outOfStockItems.length > 0 && (
            <span className="text-xs bg-destructive/15 text-destructive border border-destructive/30 rounded-full px-2.5 py-0.5 font-medium">
              {outOfStockItems.length} sin stock
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => downloadCSV(inventory.map((i) => ({
              Nombre: i.name,
              Categoría: i.category,
              Cantidad: i.quantity,
              'Stock Mínimo': i.minStock,
              'Cuarto Asignado': rooms.find((r) => r.id === i.assignedRoomId)?.name ?? 'General',
            })), 'inventario')}
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button onClick={onNewItem} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Agregar Artículo
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-48">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar artículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-9 text-xs"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {INVENTORY_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {search || categoryFilter !== 'all' ? `Mostrando ${filtered.length} de ${inventory.length} artículos` : `Total: ${inventory.length} artículos`}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-16 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Package className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-medium text-foreground">
            {search || categoryFilter !== 'all' ? 'Sin resultados' : 'No hay artículos en inventario'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            {search || categoryFilter !== 'all' ? 'Intenta con otros filtros' : 'Agrega artículos para mantener el control de suministros del hotel'}
          </p>
          {!search && categoryFilter === 'all' && (
            <Button onClick={onNewItem} className="mt-5 gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4" />
              Agregar Artículo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              rooms={rooms}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <InventoryFormDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        item={editingItem}
        rooms={rooms}
        onSave={onSave}
      />
    </section>
  );
}
