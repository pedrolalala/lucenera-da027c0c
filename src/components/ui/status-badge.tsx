import { cn } from '@/lib/utils';
import { StatusSeparacao } from '@/types/separacao';
import { Check } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusSeparacao | 'finalizado';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    separando: {
      label: 'Separando',
      className: 'badge-separando',
      icon: null,
    },
    separado: {
      label: 'Separado',
      className: 'badge-separado',
      icon: null,
    },
    finalizado: {
      label: 'Finalizado',
      className: 'bg-gray-100 text-gray-600 border border-gray-300 px-2 py-0.5 rounded-md text-xs font-medium inline-flex items-center gap-1',
      icon: <Check className="w-3 h-3" />,
    },
  };

  const config = statusConfig[status];

  return (
    <span className={cn(config.className, className)}>
      {config.icon}
      {config.label}
    </span>
  );
}
