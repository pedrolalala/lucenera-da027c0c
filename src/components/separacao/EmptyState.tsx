import { Package } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function EmptyState({ 
  title = 'Nenhuma entrega encontrada',
  subtitle = 'Selecione outro período no filtro acima'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Package className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-muted-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground/70">{subtitle}</p>
    </div>
  );
}
