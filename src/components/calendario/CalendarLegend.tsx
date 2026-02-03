import { Check, Shield, AlertTriangle } from 'lucide-react';

export function CalendarLegend() {
  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg text-sm">
      {/* Status Legend */}
      <div>
        <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 block">Status:</span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full border-2 border-gray-400 bg-transparent" />
            <span className="text-muted-foreground text-xs">Solicitado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full border-2 border-gray-400 bg-gray-200" />
            <span className="text-muted-foreground text-xs">Em Separação</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gray-400" />
            <span className="text-muted-foreground text-xs">Separado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </span>
            <span className="text-muted-foreground text-xs">Garantia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-red-500 border-2 border-dashed border-red-300 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-3 h-3 text-white" />
            </span>
            <span className="text-muted-foreground text-xs">Pendente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center opacity-60">
              <Check className="w-3 h-3 text-white" />
            </span>
            <span className="text-muted-foreground text-xs">Finalizado</span>
          </div>
        </div>
      </div>
      
      {/* Complexity Legend */}
      <div>
        <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 block">Nível de Complexidade:</span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-green-500" />
            <span className="text-muted-foreground text-xs">Fácil</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground text-xs">Médio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-red-500" />
            <span className="text-muted-foreground text-xs">Difícil</span>
          </div>
        </div>
      </div>
    </div>
  );
}
