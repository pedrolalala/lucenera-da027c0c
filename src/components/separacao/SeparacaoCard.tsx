import { useState } from 'react';
import { Phone, MapPin, User, Check, RotateCcw, Pencil, Clock, CalendarClock, AlertTriangle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Separacao } from '@/hooks/useSeparacoes';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaterialDisplay } from './MaterialDisplay';
import { cn } from '@/lib/utils';

interface SeparacaoCardProps {
  separacao: Separacao;
  onStatusChange: (id: string, newStatus: 'separando' | 'separado') => void;
  onEdit: (separacao: Separacao) => void;
  isHighlighted?: boolean;
}

export function SeparacaoCard({ separacao, onStatusChange, onEdit, isHighlighted }: SeparacaoCardProps) {
  const [showFullObservacoes, setShowFullObservacoes] = useState(false);
  const isScheduled = separacao.delivery_type === 'scheduled';
  
  const handleStatusChange = () => {
    const newStatus = separacao.status === 'separando' ? 'separado' : 'separando';
    onStatusChange(separacao.id, newStatus);
  };

  const handleEdit = () => {
    onEdit(separacao);
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
        separacao.status === 'separando' ? 'card-separando' : 'card-separado',
        isScheduled && 'border-l-4 border-l-orange-500',
        isHighlighted && 'ring-2 ring-primary ring-offset-2 animate-pulse'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={separacao.status} />
          {isScheduled && (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              <Clock className="w-3 h-3 mr-1" />
              {separacao.scheduled_time?.slice(0, 5)} FIXO
            </Badge>
          )}
        </div>
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

        {/* Gestora */}
        <div>
          <p className="field-label mb-1">Gestora</p>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-500" />
            <p className="field-value text-purple-600 font-medium">{separacao.gestora_equipe}</p>
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
        <div className="md:col-span-2">
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

      {/* Observations Section */}
      {separacao.observacoes_internas && (
        <div className="mb-4">
          <p className="field-label mb-1 text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Observações
          </p>
          <div className="bg-amber-50 border-l-[3px] border-l-amber-500 rounded-r-md p-3">
            <p className="text-sm text-amber-900">
              {separacao.observacoes_internas.length > 200 && !showFullObservacoes ? (
                <>
                  {separacao.observacoes_internas.slice(0, 200)}...
                  <button
                    onClick={() => setShowFullObservacoes(true)}
                    className="text-amber-600 font-medium ml-1 hover:underline"
                  >
                    Ver mais
                  </button>
                </>
              ) : (
                <>
                  {separacao.observacoes_internas}
                  {separacao.observacoes_internas.length > 200 && (
                    <button
                      onClick={() => setShowFullObservacoes(false)}
                      className="text-amber-600 font-medium ml-1 hover:underline"
                    >
                      Ver menos
                    </button>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Material Display */}
      <MaterialDisplay
        separacaoId={separacao.id}
        materialTipo={separacao.material_tipo}
        materialConteudo={separacao.material_conteudo}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-5">
        <Button
          onClick={handleEdit}
          variant="outline"
          size="sm"
          className="border-primary text-primary hover:bg-primary-light"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
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