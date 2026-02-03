import { useState } from 'react';
import { Phone, MapPin, User, Check, RotateCcw, Pencil, Clock, AlertTriangle, Star, Loader2, FileText, Truck, Package, Building, Mail, Flame, Zap, CheckCircle } from 'lucide-react';
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

  // Border colors for the 3 main statuses only
  const getBorderClass = () => {
    switch (separacao.status) {
      case 'material_solicitado':
        return 'border-l-4 border-l-purple-500';
      case 'em_separacao':
        return 'border-l-6 border-l-blue-500';
      case 'separado':
        return 'border-l-6 border-l-green-500';
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

  // LINEAR 3-STATUS FLOW: Material Solicitado → Em Separação → Separado
  const getActionButton = () => {
    switch (separacao.status) {
      case 'material_solicitado':
        // Single button: Iniciar Separação (green, full width)
        return (
          <Button
            onClick={() => onStatusChange(separacao.id, 'em_separacao')}
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Iniciar Separação
          </Button>
        );
      case 'em_separacao':
        // Two buttons side by side: Voltar | Separado
        return (
          <div className="flex gap-2 w-full">
            <Button
              onClick={() => onStatusChange(separacao.id, 'material_solicitado')}
              variant="outline"
              className="flex-1 h-12 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={() => onStatusChange(separacao.id, 'separado')}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
            >
              <Check className="w-4 h-4 mr-2" />
              Separado
            </Button>
          </div>
        );
      case 'separado':
        // Single button: Voltar para Em Separação (blue outline, full width)
        return (
          <Button
            onClick={() => onStatusChange(separacao.id, 'em_separacao')}
            variant="outline"
            className="w-full h-12 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Voltar para Em Separação
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
        {/* Números da Venda - Now array displayed as chips */}
        {separacao.numero_venda && separacao.numero_venda.length > 0 && (
          <div className="md:col-span-2">
            <p className="field-label mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-500" />
              Vendas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(separacao.numero_venda) ? separacao.numero_venda : [separacao.numero_venda]).slice(0, 3).map((venda, idx) => (
                <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-xl">
                  {venda}
                </Badge>
              ))}
              {Array.isArray(separacao.numero_venda) && separacao.numero_venda.length > 3 && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-xl">
                  +{separacao.numero_venda.length - 3} mais
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Separações Parciais - Now displayed inline with vendas */}
        {separacao.separacoes_parciais && separacao.separacoes_parciais.length > 0 && (
          <div className="md:col-span-2">
            <p className="field-label mb-1.5 flex items-center gap-1">
              <span className="w-3 h-3 text-green-500">🏷️</span>
              Parciais
            </p>
            <div className="flex flex-wrap gap-1.5">
              {separacao.separacoes_parciais.slice(0, 3).map((parcial, idx) => (
                <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-xl">
                  {parcial}
                </Badge>
              ))}
              {separacao.separacoes_parciais.length > 3 && (
                <Badge variant="secondary" className="bg-green-50 text-green-600 text-xs px-2.5 py-1 rounded-xl">
                  +{separacao.separacoes_parciais.length - 3} mais
                </Badge>
              )}
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
