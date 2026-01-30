import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Package, MapPin, User, Phone, Edit, Eye, Map, Truck } from 'lucide-react';
import { DayData } from '@/hooks/useCalendarData';
import { Separacao } from '@/hooks/useSeparacoes';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

interface DayDetailsProps {
  selectedDate: Date | null;
  dayData: DayData | null;
  onEditSeparacao: (separacao: Separacao) => void;
  onCreateRoute: () => void;
}

export function DayDetails({
  selectedDate,
  dayData,
  onEditSeparacao,
  onCreateRoute,
}: DayDetailsProps) {
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          Selecione uma data no calendário
        </h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Clique em qualquer dia com entregas para ver detalhes
        </p>
      </div>
    );
  }

  if (!dayData || dayData.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <div className="relative">
          <Calendar className="w-12 h-12 text-muted-foreground/50" />
          <span className="absolute -top-1 -right-1 text-lg">✕</span>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Nenhuma entrega agendada para este dia
        </p>
      </div>
    );
  }

  const formattedDate = format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const hasReadyDeliveries = dayData.separado > 0;

  // Sort: separando first, then separado
  const sortedEntregas = [...dayData.entregas].sort((a, b) => {
    if (a.status === 'separando' && b.status !== 'separando') return -1;
    if (a.status !== 'separando' && b.status === 'separando') return 1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary capitalize">
          {formattedDate}
        </h3>
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <Package className="w-4 h-4" />
          {dayData.total} {dayData.total === 1 ? 'entrega' : 'entregas'}
        </span>
      </div>

      {/* Delivery cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {sortedEntregas.map((entrega, index) => (
          <div
            key={entrega.id}
            className={cn(
              'bg-card border rounded-lg p-4 shadow-sm transition-all duration-200',
              'border-l-4',
              entrega.status === 'separando'
                ? 'border-l-blue-500'
                : 'border-l-green-500'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={entrega.status} className="text-xs" />
              <span className="text-xs font-medium text-muted-foreground">
                #{entrega.codigo_obra}
              </span>
            </div>

            {/* Client name */}
            <h4 className="font-semibold text-foreground mb-2 line-clamp-1">
              {entrega.cliente}
            </h4>

            {/* Details */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{entrega.responsavel_recebimento}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{entrega.endereco}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onEditSeparacao(entrega)}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Ver Detalhes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={() => onEditSeparacao(entrega)}
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-around text-center">
          <div>
            <span className="block text-2xl font-bold text-foreground">{dayData.total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-blue-600">{dayData.separando}</span>
            <span className="text-xs text-muted-foreground">Separando</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-green-600">{dayData.separado}</span>
            <span className="text-xs text-muted-foreground">Separado</span>
          </div>
        </div>
      </div>

      {/* Create Route Button */}
      {hasReadyDeliveries && (
        <Button
          onClick={onCreateRoute}
          className="w-full mt-4 bg-success hover:bg-success-dark text-success-foreground"
        >
          <Map className="w-4 h-4 mr-2" />
          Criar Rota - {format(selectedDate, 'dd/MM', { locale: ptBR })}
        </Button>
      )}
    </div>
  );
}
