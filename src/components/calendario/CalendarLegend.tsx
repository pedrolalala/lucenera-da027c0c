import { Check, Package, Loader2, Shield, AlertTriangle } from 'lucide-react';

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
      <span className="text-xs uppercase font-semibold text-muted-foreground">Legenda:</span>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-purple-100 flex items-center justify-center">
          <Package className="w-2.5 h-2.5 text-purple-700" />
        </span>
        <span className="text-muted-foreground">Solicitado</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center">
          <Loader2 className="w-2.5 h-2.5 text-blue-700" />
        </span>
        <span className="text-muted-foreground">Em Separação</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-800">
          N
        </span>
        <span className="text-muted-foreground">Separado</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-orange-100 flex items-center justify-center">
          <Shield className="w-2.5 h-2.5 text-orange-700" />
        </span>
        <span className="text-muted-foreground">Garantia</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-2.5 h-2.5 text-red-700" />
        </span>
        <span className="text-muted-foreground">Pendente</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300 flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-gray-500" />
        </span>
        <span className="text-muted-foreground">Finalizado</span>
      </div>
    </div>
  );
}
