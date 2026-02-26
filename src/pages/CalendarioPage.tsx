import { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Package, List, CalendarDays, Scissors, PackageCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarGrid } from '@/components/calendario/CalendarGrid';
import { DayDetails } from '@/components/calendario/DayDetails';
import { CalendarLegend } from '@/components/calendario/CalendarLegend';
import { SeparacaoFormModal } from '@/components/separacao/SeparacaoFormModal';
import { CreateRouteModal } from '@/components/separacao/CreateRouteModal';
import { useCalendarData, MonthData, DayData } from '@/hooks/useCalendarData';
import { Separacao } from '@/hooks/useSeparacoes';
import { StatusSeparacao } from '@/types/separacao';

export default function CalendarioPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<'todos' | StatusSeparacao>('todos');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSeparacao, setEditingSeparacao] = useState<Separacao | null>(null);
  const [routeModalData, setRouteModalData] = useState<{
    isOpen: boolean;
    date: Date;
    deliveries: Separacao[];
  } | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const { data: monthData, isLoading, totalEntregas, refetch } = useCalendarData(year, month);

  // Filter monthData by status
  const filteredMonthData = useMemo(() => {
    if (statusFilter === 'todos') return monthData;
    
    const filtered: MonthData = {};
    Object.entries(monthData).forEach(([dateKey, dayData]) => {
      const filteredEntregas = dayData.entregas.filter(e => e.status === statusFilter);
      if (filteredEntregas.length > 0) {
        filtered[dateKey] = {
          total: filteredEntregas.length,
          materialSolicitado: filteredEntregas.filter(e => e.status === 'material_solicitado').length,
          emSeparacao: filteredEntregas.filter(e => e.status === 'em_separacao').length,
          separado: filteredEntregas.filter(e => e.status === 'separado').length,
          garantia: filteredEntregas.filter(e => e.status === 'matheus_separacao_garantia').length,
          pendente: filteredEntregas.filter(e => e.status === 'pendente').length,
          finalizado: filteredEntregas.filter(e => e.status === 'finalizado').length,
          separando: filteredEntregas.filter(e => e.status === 'material_solicitado' || e.status === 'em_separacao').length,
          entregas: filteredEntregas,
        };
      }
    });
    return filtered;
  }, [monthData, statusFilter]);

  const filteredTotalEntregas = useMemo(() => {
    return Object.values(filteredMonthData).reduce((sum, day) => sum + day.total, 0);
  }, [filteredMonthData]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return filteredMonthData[dateKey] || null;
  }, [selectedDate, filteredMonthData]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
    setSelectedDate(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleOpenCreate = () => {
    setEditingSeparacao(null);
    setIsFormModalOpen(true);
  };

  const handleEditSeparacao = (separacao: Separacao) => {
    setEditingSeparacao(separacao);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingSeparacao(null);
  };

  const handleFormSuccess = () => {
    refetch();
    setEditingSeparacao(null);
  };

  const handleCreateRoute = () => {
    if (selectedDate && selectedDayData) {
      setRouteModalData({
        isOpen: true,
        date: selectedDate,
        deliveries: selectedDayData.entregas,
      });
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="sticky top-16 z-40 bg-card border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Calendário de Entregas</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualize todas as entregas organizadas por data
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/separacao')}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Ver em Lista</span>
                </Button>
                <Button
                  onClick={handleOpenCreate}
                  className="bg-success hover:bg-success-dark text-success-foreground"
                >
                  <Plus className="w-5 h-5 mr-2 sm:mr-2" />
                  <span className="hidden sm:inline">Nova Separação</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calendar Section (60%) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Calendar Header */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <Package className="w-4 h-4" />
                    {filteredTotalEntregas} {filteredTotalEntregas === 1 ? 'entrega' : 'entregas'} neste mês
                  </p>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex justify-center mb-4">
                <Button variant="outline" size="sm" onClick={handleToday}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Hoje
                </Button>
              </div>

              {/* Calendar Grid */}
              <CalendarGrid
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                monthData={filteredMonthData}
                isLoading={isLoading}
              />
            </div>

            {/* Legend */}
            <CalendarLegend />
          </div>

          {/* Details Section (40%) */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm min-h-[500px] lg:sticky lg:top-36">
              <DayDetails
                selectedDate={selectedDate}
                dayData={selectedDayData}
                onEditSeparacao={handleEditSeparacao}
                onCreateRoute={handleCreateRoute}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Separacao Form Modal */}
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
