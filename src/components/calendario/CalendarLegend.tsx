export function CalendarLegend() {
  return (
    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
      <span className="text-xs uppercase font-semibold text-muted-foreground">Legenda:</span>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800">
          N
        </span>
        <span className="text-muted-foreground">Separando</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-800">
          N
        </span>
        <span className="text-muted-foreground">Separado</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded border border-border bg-card" />
        <span className="text-muted-foreground">Sem entregas</span>
      </div>
    </div>
  );
}
