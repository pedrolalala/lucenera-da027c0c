import { cn } from '@/lib/utils';
import { StatusSeparacao } from '@/types/separacao';
import { Check, Shield, AlertTriangle, Package, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusSeparacao;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<StatusSeparacao, { label: string; className: string; icon: React.ReactNode }> = {
    material_solicitado: {
      label: 'Material Solicitado',
      className: 'bg-purple-100 text-purple-700 border border-purple-300',
      icon: <Package className="w-3 h-3" />,
    },
    em_separacao: {
      label: 'Em Separação',
      className: 'bg-blue-100 text-blue-700 border border-blue-300',
      icon: <Loader2 className="w-3 h-3" />,
    },
    separado: {
      label: 'Separado',
      className: 'bg-green-100 text-green-700 border border-green-300',
      icon: <Check className="w-3 h-3" />,
    },
    matheus_separacao_garantia: {
      label: 'Garantia - Matheus',
      className: 'bg-orange-100 text-orange-700 border border-orange-300',
      icon: <Shield className="w-3 h-3" />,
    },
    pendente: {
      label: 'Pendente',
      className: 'bg-red-100 text-red-700 border border-red-300 animate-pulse',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    finalizado: {
      label: 'Finalizado',
      className: 'bg-gray-100 text-gray-600 border border-gray-300',
      icon: <Check className="w-3 h-3" />,
    },
  };

  const config = statusConfig[status] || statusConfig.material_solicitado;

  return (
    <span className={cn(
      'px-2 py-0.5 rounded-md text-xs font-medium inline-flex items-center gap-1',
      config.className,
      className
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}
