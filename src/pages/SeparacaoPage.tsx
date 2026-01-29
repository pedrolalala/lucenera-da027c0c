import { useMemo, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { DateSection } from '@/components/separacao/DateSection';
import { SeparacaoCard } from '@/components/separacao/SeparacaoCard';
import { EmptyState } from '@/components/separacao/EmptyState';
import { LoadingSkeleton } from '@/components/separacao/LoadingSkeleton';
import { CreateSeparacaoModal } from '@/components/separacao/CreateSeparacaoModal';
import { CreateRouteModal } from '@/components/separacao/CreateRouteModal';
import { Button } from '@/components/ui/button';
import { useSeparacoes, Separacao } from '@/hooks/useSeparacoes';
import { FiltroSegmento } from '@/types/separacao';
import { format, subDays, subMonths, isAfter, startOfDay, parseISO } from 'date-fns';

export default function SeparacaoPage() {
  const { separacoes, isLoading, updateStatus, refetch } = useSeparacoes();
  const [filtro, setFiltro] = useState<FiltroSegmento>('todas');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  // Route modal state
  const [routeModalData, setRouteModalData] = useState<{
    isOpen: boolean;
    date: Date;
    deliveries: Separacao[];
  } | null>(null);

  // Clear highlight after 2 seconds
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  // Filter logic
  const filteredSeparacoes = useMemo(() => {
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

    return separacoes.filter((s) => {
      if (!startDate) return true;
      const entregaDate = startOfDay(parseISO(s.data_entrega));
      return isAfter(entregaDate, startDate) || 
             format(entregaDate, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
    });
  }, [separacoes, filtro]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: Separacao[] } = {};
    
    filteredSeparacoes.forEach((s) => {
      const dateKey = s.data_entrega;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(s);
    });

    // Sort by date (ascending - closest first)
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateStr, items]) => ({
        date: parseISO(dateStr),
        items,
      }));
  }, [filteredSeparacoes]);

  const handleStatusChange = (id: string, newStatus: 'separando' | 'separado') => {
    updateStatus(id, newStatus);
  };

  const handleCreateSuccess = () => {
    refetch();
    // Highlight the newest separacao
    if (separacoes.length > 0) {
      const newestId = separacoes[0]?.id;
      if (newestId) {
        setHighlightedId(newestId);
      }
    }
  };

  const handleCreateRoute = (date: Date, deliveries: Separacao[]) => {
    setRouteModalData({ isOpen: true, date, deliveries });
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Separação e Entregas</h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-success hover:bg-success-dark text-success-foreground"
              >
                <Plus className="w-5 h-5 mr-2 sm:mr-2" />
                <span className="hidden sm:inline">Nova Separação</span>
                <span className="sm:hidden">Nova</span>
              </Button>
              <FilterDropdown value={filtro} onChange={setFiltro} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : groupedByDate.length === 0 ? (
          <EmptyState />
        ) : (
          groupedByDate.map(({ date, items }) => (
            <DateSection 
              key={date.toISOString()} 
              date={date} 
              count={items.length}
              onCreateRoute={() => handleCreateRoute(date, items)}
            >
              {items.map((separacao) => (
                <SeparacaoCard
                  key={separacao.id}
                  separacao={separacao}
                  onStatusChange={handleStatusChange}
                  isHighlighted={separacao.id === highlightedId}
                />
              ))}
            </DateSection>
          ))
        )}
      </div>

      {/* Create Separacao Modal */}
      <CreateSeparacaoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Create Route Modal */}
      {routeModalData && (
        <CreateRouteModal
          isOpen={routeModalData.isOpen}
          onClose={() => setRouteModalData(null)}
          date={routeModalData.date}
          deliveries={routeModalData.deliveries}
        />
      )}
    </AppLayout>
  );
}