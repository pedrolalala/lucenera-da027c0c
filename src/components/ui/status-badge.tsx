import { cn } from '@/lib/utils';
import { StatusSeparacao } from '@/types/separacao';

interface StatusBadgeProps {
  status: StatusSeparacao | 'finalizado';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    separando: {
      label: 'Separando',
      className: 'badge-separando',
    },
    separado: {
      label: 'Separado',
      className: 'badge-separado',
    },
    finalizado: {
      label: 'Finalizado',
      className: 'badge-finalizado',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
