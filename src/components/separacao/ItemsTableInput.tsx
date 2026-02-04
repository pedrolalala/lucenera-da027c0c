import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface TableItem {
  id: string;
  ordem: number;
  id_lote: string;
  codigo_produto: string;
  referencia: string;
  descricao: string;
  quantidade: number;
  local?: string;
  marca?: string;
}

interface ItemsTableInputProps {
  items: TableItem[];
  onItemsChange: (items: TableItem[]) => void;
}

export function ItemsTableInput({ items, onItemsChange }: ItemsTableInputProps) {
  const [newItem, setNewItem] = useState({
    id_lote: '',
    codigo_produto: '',
    referencia: '',
    descricao: '',
    quantidade: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateItem = () => {
    const newErrors: Record<string, string> = {};
    
    if (newItem.codigo_produto.length < 3) {
      newErrors.codigo_produto = 'Mínimo 3 caracteres';
    }
    if (newItem.referencia.length < 3) {
      newErrors.referencia = 'Mínimo 3 caracteres';
    }
    if (newItem.descricao.length < 5) {
      newErrors.descricao = 'Mínimo 5 caracteres';
    }
    const qty = parseFloat(newItem.quantidade.replace(',', '.'));
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantidade = 'Quantidade inválida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    if (!validateItem()) return;

    const item: TableItem = {
      id: crypto.randomUUID(),
      ordem: items.length + 1,
      id_lote: newItem.id_lote,
      codigo_produto: newItem.codigo_produto,
      referencia: newItem.referencia,
      descricao: newItem.descricao,
      quantidade: parseFloat(newItem.quantidade.replace(',', '.')),
    };

    onItemsChange([...items, item]);
    setNewItem({
      id_lote: '',
      codigo_produto: '',
      referencia: '',
      descricao: '',
      quantidade: '',
    });
    setErrors({});
  };

  const removeItem = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    const reordered = filtered.map((item, index) => ({
      ...item,
      ordem: index + 1,
    }));
    onItemsChange(reordered);
  };

  const updateItem = (id: string, field: keyof TableItem, value: string | number) => {
    onItemsChange(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Item Form */}
      <div className="flex flex-wrap gap-2 items-start p-4 bg-muted/50 rounded-lg">
        <div className="flex flex-col">
          <Input
            placeholder="ID Lote"
            value={newItem.id_lote}
            onChange={e => setNewItem({ ...newItem, id_lote: e.target.value })}
            className="w-20 h-12"
          />
        </div>
        <div className="flex flex-col">
          <Input
            placeholder="Código *"
            value={newItem.codigo_produto}
            onChange={e => setNewItem({ ...newItem, codigo_produto: e.target.value })}
            onKeyPress={handleKeyPress}
            className={`w-28 h-12 ${errors.codigo_produto ? 'border-destructive' : ''}`}
          />
          {errors.codigo_produto && (
            <span className="text-xs text-destructive mt-1">{errors.codigo_produto}</span>
          )}
        </div>
        <div className="flex flex-col">
          <Input
            placeholder="Referência *"
            value={newItem.referencia}
            onChange={e => setNewItem({ ...newItem, referencia: e.target.value })}
            onKeyPress={handleKeyPress}
            className={`w-36 h-12 ${errors.referencia ? 'border-destructive' : ''}`}
          />
          {errors.referencia && (
            <span className="text-xs text-destructive mt-1">{errors.referencia}</span>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-[200px]">
          <Input
            placeholder="Descrição *"
            value={newItem.descricao}
            onChange={e => setNewItem({ ...newItem, descricao: e.target.value })}
            onKeyPress={handleKeyPress}
            className={`h-12 ${errors.descricao ? 'border-destructive' : ''}`}
          />
          {errors.descricao && (
            <span className="text-xs text-destructive mt-1">{errors.descricao}</span>
          )}
        </div>
        <div className="flex flex-col">
          <Input
            placeholder="Qtde *"
            value={newItem.quantidade}
            onChange={e => setNewItem({ ...newItem, quantidade: e.target.value })}
            onKeyPress={handleKeyPress}
            className={`w-24 h-12 ${errors.quantidade ? 'border-destructive' : ''}`}
          />
          {errors.quantidade && (
            <span className="text-xs text-destructive mt-1">{errors.quantidade}</span>
          )}
        </div>
        <Button
          type="button"
          onClick={addItem}
          className="h-12 w-12 bg-success hover:bg-success-dark"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Items Table */}
      {items.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                  <th className="p-3 text-left w-8"></th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Código</th>
                  <th className="p-3 text-left">Referência</th>
                  <th className="p-3 text-left">Descrição</th>
                  <th className="p-3 text-right">Qtde</th>
                  <th className="p-3 text-center w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-t ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'} hover:bg-primary-light/50 transition-colors`}
                  >
                    <td className="p-3 text-muted-foreground">
                      <GripVertical className="w-4 h-4 cursor-grab" />
                    </td>
                    <td className="p-3 text-sm">{item.id_lote || '-'}</td>
                    <td className="p-3 text-sm font-medium">{item.codigo_produto}</td>
                    <td className="p-3 text-sm">{item.referencia}</td>
                    <td className="p-3 text-sm max-w-xs truncate">{item.descricao}</td>
                    <td className="p-3 text-sm font-bold text-right">{item.quantidade.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                          className="p-1.5 text-primary hover:bg-primary-light rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted border-t">
                  <td colSpan={5} className="p-3 text-right font-bold text-sm">
                    Total de itens:
                  </td>
                  <td className="p-3 text-right font-bold text-sm flex items-center justify-end gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    {items.length}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum item adicionado</p>
          <p className="text-sm">Adicione itens usando o formulário acima</p>
        </div>
      )}
    </div>
  );
}
