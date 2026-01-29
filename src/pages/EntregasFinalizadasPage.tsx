import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { EntregaFinalizadaCard } from '@/components/finalizadas/EntregaFinalizadaCard';
import { EmptyState } from '@/components/separacao/EmptyState';
import { Input } from '@/components/ui/input';
import { mockEntregasFinalizadas } from '@/data/mockData';
import { EntregaFinalizada, FiltroSegmento } from '@/types/separacao';
import { subDays, subMonths, isAfter, startOfDay, format } from 'date-fns';

export default function EntregasFinalizadasPage() {
  const [filtro, setFiltro] = useState<FiltroSegmento>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [entregas] = useState<EntregaFinalizada[]>(mockEntregasFinalizadas);

  // Filter logic
  const filteredEntregas = useMemo(() => {
    const today = startOfDay(new Date());
    let startDate: Date | null = null;

    switch (filtro) {
      case 'ultima-semana':
        startDate = subDays(today, 7);
        break;
      case 'ultimo-mes':
        startDate = subMonths(today, 1);
        break;
      case 'ultimos-3-meses':
        startDate = subMonths(today, 3);
        break;
      case 'ultimos-6-meses':
        startDate = subMonths(today, 6);
        break;
      default:
        startDate = null;
    }

    return entregas
      .filter((e) => {
        // Date filter
        if (startDate) {
          const entregaDate = startOfDay(e.dataEntregaReal);
          if (!isAfter(entregaDate, startDate) && 
              format(entregaDate, 'yyyy-MM-dd') !== format(startDate, 'yyyy-MM-dd')) {
            return false;
          }
        }

        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return (
            e.cliente.toLowerCase().includes(query) ||
            e.codigoObra.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => b.dataEntregaReal.getTime() - a.dataEntregaReal.getTime());
  }, [entregas, filtro, searchQuery]);

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-success">Entregas Finalizadas</h1>
              <FilterDropdown value={filtro} onChange={setFiltro} />
            </div>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por cliente ou obra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredEntregas.length === 0 ? (
          <EmptyState 
            title="Nenhuma entrega finalizada encontrada"
            subtitle="Ajuste os filtros ou realize uma busca diferente"
          />
        ) : (
          <div className="space-y-5">
            {filteredEntregas.map((entrega) => (
              <EntregaFinalizadaCard key={entrega.id} entrega={entrega} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
