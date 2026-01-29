import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { DateSection } from '@/components/separacao/DateSection';
import { SeparacaoCard } from '@/components/separacao/SeparacaoCard';
import { EmptyState } from '@/components/separacao/EmptyState';
import { LoadingSkeleton } from '@/components/separacao/LoadingSkeleton';
import { useSeparacoes, Separacao } from '@/hooks/useSeparacoes';
import { FiltroSegmento } from '@/types/separacao';
import { format, subDays, subMonths, isAfter, startOfDay, parseISO } from 'date-fns';
import { useState } from 'react';

export default function SeparacaoPage() {
  const { separacoes, isLoading, updateStatus } = useSeparacoes();
  const [filtro, setFiltro] = useState<FiltroSegmento>('todas');

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

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Separação e Entregas</h1>
            <FilterDropdown value={filtro} onChange={setFiltro} />
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
            <DateSection key={date.toISOString()} date={date} count={items.length}>
              {items.map((separacao) => (
                <SeparacaoCard
                  key={separacao.id}
                  separacao={separacao}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </DateSection>
          ))
        )}
      </div>
    </AppLayout>
  );
}
