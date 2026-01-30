import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, MapPin, User, Phone, Edit, Eye, Map, Check, Clock, AlertTriangle } from 'lucide-react';
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
  const navigate = useNavigate();
  
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

  // Group by status
  const separando = dayData.entregas.filter(e => e.status === 'separando');
  const separado = dayData.entregas.filter(e => e.status === 'separado');
  const finalizado = dayData.entregas.filter(e => e.status === 'finalizado');

  const renderEntregaCard = (entrega: Separacao, index: number) => {
    const isFinalizado = entrega.status === 'finalizado';
    
    return (
      <div
        key={entrega.id}
        className={cn(
          'bg-card border rounded-lg p-4 shadow-sm transition-all duration-200',
          'border-l-4',
          entrega.status === 'separando' && 'border-l-blue-500',
          entrega.status === 'separado' && 'border-l-green-500',
          entrega.status === 'finalizado' && 'border-l-gray-400 opacity-90 bg-gray-50'
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

        {/* Observations warning */}
        {entrega.observacoes_internas && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-1.5">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{entrega.observacoes_internas}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          {isFinalizado ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => navigate('/entregas-finalizadas')}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Ver Detalhes
            </Button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  };

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

      {/* Delivery cards by group */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {/* Separando group */}
        {separando.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-blue-700">
                Separando ({separando.length})
              </span>
            </div>
            <div className="space-y-3">
              {separando.map((e, i) => renderEntregaCard(e, i))}
            </div>
          </div>
        )}

        {/* Separado group */}
        {separado.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-700">
                Separado ({separado.length})
              </span>
            </div>
            <div className="space-y-3">
              {separado.map((e, i) => renderEntregaCard(e, i))}
            </div>
          </div>
        )}

        {/* Finalizado group */}
        {finalizado.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-600">
                Finalizadas ({finalizado.length})
              </span>
            </div>
            <div className="space-y-3">
              {finalizado.map((e, i) => renderEntregaCard(e, i))}
            </div>
          </div>
        )}
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
          <div>
            <span className="block text-2xl font-bold text-gray-500">{dayData.finalizado}</span>
            <span className="text-xs text-muted-foreground">Finalizado</span>
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
