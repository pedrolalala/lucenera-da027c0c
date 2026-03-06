import { useMemo, useState, useEffect } from 'react';
import { Plus, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { AppLayout } from '@/components/layout/AppLayout';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateSection } from '@/components/separacao/DateSection';
import { SeparacaoCard } from '@/components/separacao/SeparacaoCard';
import { EmptyState } from '@/components/separacao/EmptyState';
import { LoadingSkeleton } from '@/components/separacao/LoadingSkeleton';
import { SeparacaoFormModal } from '@/components/separacao/SeparacaoFormModal';
import { CreateRouteModal } from '@/components/separacao/CreateRouteModal';
import { Button } from '@/components/ui/button';
import { useSeparacoes, Separacao } from '@/hooks/useSeparacoes';
import { FiltroSegmento, StatusSeparacao } from '@/types/separacao';
import { useUserRole } from '@/hooks/useUserRole';
import { format, subDays, subMonths, isAfter, isBefore, startOfDay, parseISO, isEqual, eachDayOfInterval } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Scissors, PackageCheck, ShieldCheck } from 'lucide-react';

export default function SeparacaoPage() {
  const navigate = useNavigate();
  const { separacoes, isLoading, updateStatus, deleteSeparacao, refetch } = useSeparacoes();
  const { isAdmin } = useUserRole();
  const [filtro, setFiltro] = useState<FiltroSegmento>('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | StatusSeparacao>('todos');
  const [tipoPedidoFilter, setTipoPedidoFilter] = useState<'todos' | 'normal' | 'garantia'>('todos');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSeparacao, setEditingSeparacao] = useState<Separacao | null>(null);
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

  // Filter logic - combines segment filter and date range filter
  const filteredSeparacoes = useMemo(() => {
    const today = startOfDay(new Date());
    
    return separacoes.filter((s) => {
      const entregaDate = startOfDay(parseISO(s.data_entrega));
      
      // Apply status filter
      if (statusFilter !== 'todos' && s.status !== statusFilter) return false;
      
      // Apply tipo pedido filter
      if (tipoPedidoFilter !== 'todos') {
        const tipo = s.tipo_pedido || 'normal';
        if (tipoPedidoFilter === 'garantia' && tipo !== 'garantia' && !s.inclui_garantia) return false;
        if (tipoPedidoFilter === 'normal' && (tipo === 'garantia' || s.inclui_garantia)) return false;
      }
      
      // Apply date range filter first if active
      if (dateRange?.from) {
        const rangeStart = startOfDay(dateRange.from);
        const rangeEnd = dateRange.to ? startOfDay(dateRange.to) : rangeStart;
        
        const inRange = (isAfter(entregaDate, rangeStart) || isEqual(entregaDate, rangeStart)) &&
                        (isBefore(entregaDate, rangeEnd) || isEqual(entregaDate, rangeEnd));
        
        if (!inRange) return false;
      }
      
      // Apply segment filter
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

      if (!startDate) return true;
      return isAfter(entregaDate, startDate) || isEqual(entregaDate, startDate);
    });
  }, [separacoes, filtro, dateRange, statusFilter, tipoPedidoFilter]);

  // Group by date - expand "em_separacao" entries across days from updated_at to data_entrega
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: Separacao[] } = {};
    const today = startOfDay(new Date());
    
    const addToGroup = (dateKey: string, s: Separacao) => {
      if (!groups[dateKey]) groups[dateKey] = [];
      if (!groups[dateKey].some(existing => existing.id === s.id)) {
        groups[dateKey].push(s);
      }
    };
    
    filteredSeparacoes.forEach((s) => {
      if (s.status === 'em_separacao' && s.data_inicio_separacao) {
        // Show on every day from data_inicio_separacao to data_entrega
        const statusChangedAt = startOfDay(parseISO(s.data_inicio_separacao));
        const deliveryDate = startOfDay(parseISO(s.data_entrega));
        const rangeStart = isAfter(statusChangedAt, today) ? today : statusChangedAt;
        
        if (!isAfter(rangeStart, deliveryDate)) {
          const days = eachDayOfInterval({ start: rangeStart, end: deliveryDate });
          days.forEach(day => {
            addToGroup(format(day, 'yyyy-MM-dd'), s);
          });
        } else {
          addToGroup(s.data_entrega, s);
        }
      } else {
        addToGroup(s.data_entrega, s);
      }
    });

    // Sort by date (ascending - closest first)
    return Object.entries(groups)
      .filter(([dateStr]) => {
        const d = parseISO(dateStr);
        return !isNaN(d.getTime());
      })
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateStr, items]) => ({
        date: parseISO(dateStr),
        items,
      }));
  }, [filteredSeparacoes]);

  const handleStatusChange = (id: string, newStatus: StatusSeparacao) => {
    updateStatus(id, newStatus);
  };

  const handleFormSuccess = () => {
    refetch();
    setEditingSeparacao(null);
  };

  const handleOpenCreate = () => {
    setEditingSeparacao(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (separacao: Separacao) => {
    setEditingSeparacao(separacao);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingSeparacao(null);
  };

  const handleCreateRoute = (date: Date, deliveries: Separacao[]) => {
    setRouteModalData({ isOpen: true, date, deliveries });
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">Separação e Entregas</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={handleOpenCreate}
                  className="bg-success hover:bg-success-dark text-success-foreground"
                >
                  <Plus className="w-5 h-5 mr-2 sm:mr-2" />
                  <span className="hidden sm:inline">Nova Separação</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/calendario')}
                  className="gap-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver em Calendário</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="w-full sm:w-auto">
                <TabsList className="h-9">
                  <TabsTrigger value="todos" className="text-xs px-3 gap-1.5">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="material_solicitado" className="text-xs px-3 gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Solicitado</span>
                  </TabsTrigger>
                  <TabsTrigger value="em_separacao" className="text-xs px-3 gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Em Separação</span>
                  </TabsTrigger>
                  <TabsTrigger value="separado" className="text-xs px-3 gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Separado</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={tipoPedidoFilter} onValueChange={(v) => setTipoPedidoFilter(v as typeof tipoPedidoFilter)}>
                <SelectTrigger className="w-[160px] bg-card border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="garantia">Garantia</SelectItem>
                </SelectContent>
              </Select>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-auto"
              />
              <FilterDropdown value={filtro} onChange={setFiltro} />
              {filteredSeparacoes.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  Mostrando {filteredSeparacoes.length} {filteredSeparacoes.length === 1 ? 'entrega' : 'entregas'}
                </span>
              )}
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
              onCreateRoute={() => handleCreateRoute(date, items.filter(s => s.tipo_entrega !== 'cliente_retira'))}
            >
              {items.map((separacao) => (
                <SeparacaoCard
                  key={separacao.id}
                  separacao={separacao}
                  onStatusChange={handleStatusChange}
                  onEdit={handleOpenEdit}
                  isHighlighted={separacao.id === highlightedId}
                />
              ))}
            </DateSection>
          ))
        )}
      </div>

      {/* Separacao Form Modal (Create/Edit) */}
      <SeparacaoFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleFormSuccess}
        editData={editingSeparacao}
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
