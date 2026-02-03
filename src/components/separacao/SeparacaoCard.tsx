import { useState } from 'react';
import { Phone, MapPin, User, Check, RotateCcw, Pencil, Clock, AlertTriangle, Star, Shield, Loader2, FileText, Truck, Package, Building, Mail, Flame, Zap, CheckCircle } from 'lucide-react';
import { Separacao } from '@/hooks/useSeparacoes';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaterialDisplay } from './MaterialDisplay';
import { StatusSeparacao } from '@/types/separacao';
import { cn } from '@/lib/utils';

interface SeparacaoCardProps {
  separacao: Separacao;
  onStatusChange: (id: string, newStatus: StatusSeparacao) => void;
  onEdit: (separacao: Separacao) => void;
  isHighlighted?: boolean;
}

export function SeparacaoCard({ separacao, onStatusChange, onEdit, isHighlighted }: SeparacaoCardProps) {
  const [showFullObservacoes, setShowFullObservacoes] = useState(false);
  const isScheduled = separacao.delivery_type === 'scheduled';
  
  const getNextStatus = (): StatusSeparacao | null => {
    switch (separacao.status) {
      case 'material_solicitado':
        return 'em_separacao';
      case 'em_separacao':
        return 'separado';
      case 'separado':
        return 'em_separacao';
      case 'matheus_separacao_garantia':
        return 'separado';
      case 'pendente':
        return 'em_separacao';
      default:
        return null;
    }
  };

  const handleStatusChange = () => {
    const nextStatus = getNextStatus();
    if (nextStatus) {
      onStatusChange(separacao.id, nextStatus);
    }
  };

  const handleGarantia = () => {
    onStatusChange(separacao.id, 'matheus_separacao_garantia');
  };

  const handleEdit = () => {
    onEdit(separacao);
  };

  const handlePhoneClick = () => {
    if (separacao.telefone) {
      window.location.href = `tel:${separacao.telefone.replace(/\D/g, '')}`;
    }
  };

  const handleMapClick = () => {
    const encodedAddress = encodeURIComponent(separacao.endereco);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const getBorderClass = () => {
    switch (separacao.status) {
      case 'material_solicitado':
        return 'border-l-4 border-l-purple-500';
      case 'em_separacao':
        return 'border-l-4 border-l-blue-500';
      case 'separado':
        return 'border-l-4 border-l-green-500';
      case 'matheus_separacao_garantia':
        return 'border-l-4 border-l-orange-500';
      case 'pendente':
        return 'border-l-4 border-l-red-500';
      default:
        return '';
    }
  };

  const getNivelBadge = () => {
    const nivel = separacao.nivel_complexidade;
    if (!nivel) return null;
    
    const configs = {
      facil: { label: 'FÁCIL', icon: CheckCircle, bgClass: 'bg-green-100', textClass: 'text-green-700' },
      medio: { label: 'MÉDIO', icon: Zap, bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
      dificil: { label: 'DIFÍCIL', icon: Flame, bgClass: 'bg-red-100', textClass: 'text-red-700' },
    };
    
    const config = configs[nivel];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={cn("border-0 font-semibold", config.bgClass, config.textClass)}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTipoEntregaDisplay = () => {
    const tipo = separacao.tipo_entrega;
    if (!tipo) return null;
    
    const configs = {
      lucenera_entrega: { label: 'Lucenera Entrega', icon: Truck, color: 'text-blue-600' },
      transportadora: { label: `Transportadora${separacao.transportadora_nome ? `: ${separacao.transportadora_nome}` : ''}`, icon: Package, color: 'text-orange-600' },
      cliente_retira: { label: 'Cliente Retira', icon: Building, color: 'text-green-600' },
      correios: { label: `Correios${separacao.codigo_rastreamento ? ` (${separacao.codigo_rastreamento})` : ''}`, icon: Mail, color: 'text-yellow-600' },
    };
    
    const config = configs[tipo];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <div className={cn("flex items-center gap-1.5 text-sm", config.color)}>
        <Icon className="w-4 h-4" />
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  const getActionButton = () => {
    switch (separacao.status) {
      case 'material_solicitado':
        return (
          <Button
            onClick={handleStatusChange}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Iniciar Separação
          </Button>
        );
      case 'em_separacao':
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleStatusChange}
              className="bg-success hover:bg-success-dark text-success-foreground"
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar como Separado
            </Button>
            <Button
              onClick={handleGarantia}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Garantia
            </Button>
          </div>
        );
      case 'separado':
        return (
          <Button
            onClick={handleStatusChange}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Voltar para Separação
          </Button>
        );
      case 'matheus_separacao_garantia':
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleStatusChange}
              className="bg-success hover:bg-success-dark text-success-foreground"
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar como Separado
            </Button>
            <Button
              onClick={() => onStatusChange(separacao.id, 'em_separacao')}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        );
      case 'pendente':
        return (
          <Button
            onClick={handleStatusChange}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retomar Separação
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl shadow-card p-5 transition-all duration-300 hover:shadow-card-hover',
        getBorderClass(),
        isScheduled && 'ring-2 ring-orange-200',
        isHighlighted && 'ring-2 ring-primary ring-offset-2 animate-pulse'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={separacao.status} />
          {isScheduled && (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              <Clock className="w-3 h-3 mr-1" />
              {separacao.scheduled_time?.slice(0, 5)} FIXO
            </Badge>
          )}
          {getNivelBadge()}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          Código: {separacao.codigo_obra}
        </span>
      </div>

      {/* Client Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Número da Venda */}
        {separacao.numero_venda && (
          <div>
            <p className="field-label mb-1">Venda</p>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <p className="field-value text-blue-600 font-semibold">{separacao.numero_venda}</p>
            </div>
          </div>
        )}

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

        {/* Tipo de Entrega */}
        {separacao.tipo_entrega && (
          <div>
            <p className="field-label mb-1">Forma de Entrega</p>
            {getTipoEntregaDisplay()}
          </div>
        )}

        {/* Telefone */}
        <div>
          <p className="field-label mb-1">Telefone</p>
          {separacao.telefone ? (
            <button
              onClick={handlePhoneClick}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="field-value">{separacao.telefone}</span>
            </button>
          ) : (
            <span className="text-sm text-muted-foreground">Não informado</span>
          )}
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

        {/* Separações Parciais */}
        {separacao.separacoes_parciais && separacao.separacoes_parciais.length > 0 && (
          <div className="md:col-span-2">
            <p className="field-label mb-1">Separações Parciais</p>
            <div className="flex flex-wrap gap-1.5">
              {separacao.separacoes_parciais.map((parcial, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                  {parcial}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
      {separacao.material_tipo && (
        <MaterialDisplay
          separacaoId={separacao.id}
          materialTipo={separacao.material_tipo}
          materialConteudo={separacao.material_conteudo}
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-5 flex-wrap">
        <Button
          onClick={handleEdit}
          variant="outline"
          size="sm"
          className="border-primary text-primary hover:bg-primary-light"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
        {getActionButton()}
      </div>
    </div>
  );
}
