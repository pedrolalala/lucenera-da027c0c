import { Phone, MapPin, User, Check, RotateCcw } from 'lucide-react';
import { Separacao } from '@/hooks/useSeparacoes';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeparacaoCardProps {
  separacao: Separacao;
  onStatusChange: (id: string, newStatus: 'separando' | 'separado') => void;
}

export function SeparacaoCard({ separacao, onStatusChange }: SeparacaoCardProps) {
  const handleStatusChange = () => {
    const newStatus = separacao.status === 'separando' ? 'separado' : 'separando';
    onStatusChange(separacao.id, newStatus);
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${separacao.telefone.replace(/\D/g, '')}`;
  };

  const handleMapClick = () => {
    const encodedAddress = encodeURIComponent(separacao.endereco);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl shadow-card p-5 transition-all duration-300 hover:shadow-card-hover',
        separacao.status === 'separando' ? 'card-separando' : 'card-separado'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <StatusBadge status={separacao.status} />
        <span className="text-sm font-medium text-muted-foreground">
          Código: {separacao.codigo_obra}
        </span>
      </div>

      {/* Client Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Cliente */}
        <div>
          <p className="field-label mb-1">Cliente</p>
          <p className="field-value">{separacao.cliente}</p>
        </div>

        {/* Responsável */}
        <div>
          <p className="field-label mb-1">Responsável</p>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <p className="field-value">{separacao.responsavel_recebimento}</p>
          </div>
        </div>

        {/* Telefone */}
        <div>
          <p className="field-label mb-1">Telefone</p>
          <button
            onClick={handlePhoneClick}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="field-value">{separacao.telefone}</span>
          </button>
        </div>

        {/* Endereço */}
        <div>
          <p className="field-label mb-1">Endereço de Entrega</p>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="field-value text-sm">{separacao.endereco}</p>
              <button
                onClick={handleMapClick}
                className="text-xs text-primary hover:text-primary-dark transition-colors mt-1"
              >
                Ver no mapa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Material */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-foreground mb-2">Material a Entregar</p>
        {separacao.material_tipo === 'texto' && (
          <div className="bg-muted rounded-lg p-3">
            <pre className="text-sm text-secondary-foreground whitespace-pre-wrap font-sans">
              {separacao.material_conteudo}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          onClick={handleStatusChange}
          variant={separacao.status === 'separando' ? 'default' : 'outline'}
          className={cn(
            'transition-all duration-200',
            separacao.status === 'separando'
              ? 'bg-success hover:bg-success-dark text-success-foreground'
              : 'border-primary text-primary hover:bg-primary-light'
          )}
        >
          {separacao.status === 'separando' ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Marcar como Separado
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              Voltar para Separando
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
