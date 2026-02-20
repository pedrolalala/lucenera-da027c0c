import { useState, useMemo } from 'react';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { EntregaFinalizadaRow } from '@/components/finalizadas/EntregaFinalizadaRow';
import { EntregaDetalhesModal } from '@/components/finalizadas/EntregaDetalhesModal';
import { FinalizadasListSkeleton } from '@/components/finalizadas/FinalizadasListSkeleton';
import { EmptyState } from '@/components/separacao/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEntregasFinalizadas, EntregaFinalizada } from '@/hooks/useEntregasFinalizadas';
import { FiltroSegmento } from '@/types/separacao';
import { subDays, subMonths, isAfter, startOfDay, parseISO, format } from 'date-fns';

export default function EntregasFinalizadasPage() {
  const [filtro, setFiltro] = useState<FiltroSegmento>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaFinalizada | null>(null);
  const { entregas, isLoading, error, refetch } = useEntregasFinalizadas();

  const filteredEntregas = useMemo(() => {
    const today = startOfDay(new Date());
    let startDate: Date | null = null;

    switch (filtro) {
      case 'ultima-semana': startDate = subDays(today, 7); break;
      case 'ultimo-mes': startDate = subMonths(today, 1); break;
      case 'ultimos-3-meses': startDate = subMonths(today, 3); break;
      case 'ultimos-6-meses': startDate = subMonths(today, 6); break;
      default: startDate = null;
    }

    return entregas
      .filter((e) => {
        if (startDate) {
          const entregaDate = startOfDay(parseISO(e.data_entrega_real));
          if (!isAfter(entregaDate, startDate) &&
              format(entregaDate, 'yyyy-MM-dd') !== format(startDate, 'yyyy-MM-dd')) {
            return false;
          }
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          return (
            e.cliente.toLowerCase().includes(query) ||
            e.codigo_obra.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.data_entrega_real).getTime() - new Date(a.data_entrega_real).getTime());
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
        {isLoading ? (
          <FinalizadasListSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-sm text-muted-foreground">Erro ao carregar entregas</p>
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        ) : filteredEntregas.length === 0 ? (
          <EmptyState
            title="Nenhuma entrega finalizada encontrada"
            subtitle="Ajuste os filtros ou realize uma busca diferente"
          />
        ) : (
          <div className="bg-card rounded-xl overflow-hidden border border-border">
            {filteredEntregas.map((entrega) => (
              <EntregaFinalizadaRow
                key={entrega.id}
                entrega={entrega}
                onOpenDetails={setSelectedEntrega}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      <EntregaDetalhesModal
        entrega={selectedEntrega}
        open={!!selectedEntrega}
        onClose={() => setSelectedEntrega(null)}
      />
    </AppLayout>
  );
}
