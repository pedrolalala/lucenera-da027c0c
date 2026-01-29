import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { DateSection } from '@/components/separacao/DateSection';
import { SeparacaoCard } from '@/components/separacao/SeparacaoCard';
import { EmptyState } from '@/components/separacao/EmptyState';
import { mockSeparacoes } from '@/data/mockData';
import { Separacao, FiltroSegmento } from '@/types/separacao';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subMonths, isAfter, isBefore, startOfDay } from 'date-fns';

export default function SeparacaoPage() {
  const [separacoes, setSeparacoes] = useState<Separacao[]>(mockSeparacoes);
  const [filtro, setFiltro] = useState<FiltroSegmento>('todas');
  const { toast } = useToast();

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
      return isAfter(startOfDay(s.dataEntrega), startDate) || 
             format(s.dataEntrega, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
    });
  }, [separacoes, filtro]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: Separacao[] } = {};
    
    filteredSeparacoes.forEach((s) => {
      const dateKey = format(s.dataEntrega, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(s);
    });

    // Sort by date (ascending - closest first)
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateStr, items]) => ({
        date: new Date(dateStr),
        items,
      }));
  }, [filteredSeparacoes]);

  const handleStatusChange = (id: string, newStatus: Separacao['status']) => {
    setSeparacoes((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: newStatus, updatedAt: new Date() } : s
      )
    );

    toast({
      title: 'Status atualizado com sucesso!',
      description: `A ordem foi marcada como "${newStatus === 'separado' ? 'Separado' : 'Separando'}"`,
      className: 'bg-success text-success-foreground border-none',
    });
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
        {groupedByDate.length === 0 ? (
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
