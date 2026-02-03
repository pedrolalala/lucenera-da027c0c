export function CalendarLegend() {
  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg text-sm">
      {/* Progressive Status Legend - 3 status only */}
      <div>
        <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 block">Status (Progressivo):</span>
        <div className="flex flex-wrap items-center gap-4">
          {/* Material Solicitado - Outline only, 50% opacity */}
          <div className="flex items-center gap-1.5">
            <span 
              className="w-6 h-6 rounded-full border-2 border-gray-500 bg-transparent opacity-50"
              style={{ borderStyle: 'solid' }}
            />
            <span className="text-muted-foreground text-xs">Material Solicitado</span>
          </div>
          {/* Em Separação - Outline + light fill, 75% opacity */}
          <div className="flex items-center gap-1.5">
            <span 
              className="w-7 h-7 rounded-full border-[3px] border-gray-500 opacity-75"
              style={{ background: 'rgba(128, 128, 128, 0.2)' }}
            />
            <span className="text-muted-foreground text-xs">Em Separação</span>
          </div>
          {/* Separado - Solid fill, 100% opacity */}
          <div className="flex items-center gap-1.5">
            <span 
              className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white shadow-sm"
            />
            <span className="text-muted-foreground text-xs">Separado</span>
          </div>
        </div>
      </div>
      
      {/* Complexity Legend - Colors */}
      <div>
        <span className="text-[11px] uppercase font-semibold text-muted-foreground mb-2 block">Nível de Complexidade (Cor):</span>
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
