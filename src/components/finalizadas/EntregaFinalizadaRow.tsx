import { Eye, User, Clock } from 'lucide-react';
import { EntregaFinalizada } from '@/hooks/useEntregasFinalizadas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, differenceInDays } from 'date-fns';

interface EntregaFinalizadaRowProps {
  entrega: EntregaFinalizada;
  onOpenDetails: (entrega: EntregaFinalizada) => void;
}

export function EntregaFinalizadaRow({ entrega, onOpenDetails }: EntregaFinalizadaRowProps) {
  const formattedDate = format(parseISO(entrega.data_entrega_real), 'dd/MM/yyyy');

  const diasParaEntrega = entrega.data_solicitacao
    ? differenceInDays(parseISO(entrega.data_entrega_real), parseISO(entrega.data_solicitacao))
    : null;

  return (
    <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card hover:bg-muted/50 transition-colors">
      {/* Badge Finalizado */}
      <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
        Finalizado
      </span>

      {/* Número Entrega */}
      {entrega.numero_entrega && (
        <span className="shrink-0 text-xs font-mono font-bold text-primary">
          {entrega.numero_entrega}
        </span>
      )}

      {/* Cliente */}
      <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
        {entrega.cliente}
      </span>

      {/* Data */}
      <span className="hidden sm:block shrink-0 text-[13px] text-muted-foreground">
        {formattedDate}
      </span>

      {/* Tempo solicitação → entrega */}
      {diasParaEntrega !== null && (
        <Badge variant="outline" className="hidden sm:flex items-center gap-1 shrink-0 text-[11px] bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3" />
          {diasParaEntrega === 0 ? 'No mesmo dia' : `${diasParaEntrega}d`}
        </Badge>
      )}

      {/* Gestora */}
      {entrega.gestora_equipe && (
        <span className="hidden md:flex items-center gap-1 shrink-0 text-[13px] text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          {entrega.gestora_equipe}
        </span>
      )}

      {/* Botão Detalhes */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenDetails(entrega)}
        className="shrink-0 h-8 text-[13px] border-border hover:bg-muted"
      >
        <Eye className="w-3.5 h-3.5 mr-1.5" />
        Detalhes
      </Button>
    </div>
  );
}
