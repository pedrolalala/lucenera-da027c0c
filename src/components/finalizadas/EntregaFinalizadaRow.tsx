import { Eye, User } from 'lucide-react';
import { EntregaFinalizada } from '@/hooks/useEntregasFinalizadas';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';

interface EntregaFinalizadaRowProps {
  entrega: EntregaFinalizada;
  onOpenDetails: (entrega: EntregaFinalizada) => void;
}

export function EntregaFinalizadaRow({ entrega, onOpenDetails }: EntregaFinalizadaRowProps) {
  const formattedDate = format(parseISO(entrega.data_entrega_real), 'dd/MM/yyyy');

  return (
    <div className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card hover:bg-muted/50 transition-colors">
      {/* Badge Finalizado */}
      <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
        Finalizado
      </span>

      {/* Cliente */}
      <span className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
        {entrega.cliente}
      </span>

      {/* Data */}
      <span className="hidden sm:block shrink-0 text-[13px] text-muted-foreground">
        {formattedDate}
      </span>

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
