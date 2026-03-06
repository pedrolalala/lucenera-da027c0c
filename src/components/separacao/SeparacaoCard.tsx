import { useState } from 'react';
import {
  Phone, MapPin, User, Check, RotateCcw, Pencil, Clock,
  AlertTriangle, Star, Loader2, FileText, Truck, Package,
  Building, Mail, Flame, Zap, CheckCircle, ChevronDown, ChevronUp, CalendarPlus, Trash2, Shield
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separacao } from '@/hooks/useSeparacoes';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaterialDisplay } from './MaterialDisplay';
import { StatusSeparacao } from '@/types/separacao';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SeparacaoCardProps {
  separacao: Separacao;
  onStatusChange: (id: string, newStatus: StatusSeparacao) => void;
  onEdit: (separacao: Separacao) => void;
  onDelete?: (id: string) => void;
  isHighlighted?: boolean;
  isAdmin?: boolean;
}

export function SeparacaoCard({ separacao, onStatusChange, onEdit, onDelete, isHighlighted, isAdmin }: SeparacaoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullObservacoes, setShowFullObservacoes] = useState(false);
  const isScheduled = separacao.delivery_type === 'scheduled';
  const isGarantia = separacao.tipo_pedido === 'garantia';
  const hasGarantiaAddon = separacao.inclui_garantia === true;

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
      case 'material_solicitado': return 'border-l-4 border-l-purple-500';
      case 'em_separacao':       return 'border-l-4 border-l-blue-500';
      case 'separado':           return 'border-l-4 border-l-green-500';
      default:                   return '';
    }
  };

  const getNivelBadge = () => {
    const nivel = separacao.nivel_complexidade;
    if (!nivel) return null;
    const configs = {
      facil:   { label: 'FÁCIL',   icon: CheckCircle, bgClass: 'bg-green-100',  textClass: 'text-green-700' },
      medio:   { label: 'MÉDIO',   icon: Zap,         bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
      dificil: { label: 'DIFÍCIL', icon: Flame,       bgClass: 'bg-red-100',    textClass: 'text-red-700' },
    };
    const config = configs[nivel as keyof typeof configs];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={cn("border-0 font-semibold text-xs", config.bgClass, config.textClass)}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTipoEntregaDisplay = () => {
    const tipo = separacao.tipo_entrega;
    if (!tipo) return null;
    const configs = {
      lucenera_entrega: { label: 'Lucenera Entrega', icon: Truck,    color: 'text-blue-600' },
      transportadora:   { label: `Transportadora${separacao.transportadora_nome ? `: ${separacao.transportadora_nome}` : ''}`, icon: Package, color: 'text-orange-600' },
      cliente_retira:   { label: 'Cliente Retira',   icon: Building, color: 'text-green-600' },
      correios:         { label: `Correios${separacao.codigo_rastreamento ? ` (${separacao.codigo_rastreamento})` : ''}`, icon: Mail, color: 'text-yellow-600' },
    };
    const config = configs[tipo as keyof typeof configs];
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
            onClick={() => onStatusChange(separacao.id, 'em_separacao')}
            className="h-9 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4"
          >
            <Loader2 className="w-4 h-4 mr-1.5" />
            Iniciar Separação
          </Button>
        );
      case 'em_separacao':
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => onStatusChange(separacao.id, 'material_solicitado')}
              variant="outline"
              className="h-9 border-blue-500 text-blue-600 hover:bg-blue-50 text-sm px-3"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Voltar
            </Button>
            <Button
              onClick={() => onStatusChange(separacao.id, 'separado')}
              className="h-9 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Separado
            </Button>
          </div>
        );
      case 'separado':
        return (
          <Button
            onClick={() => onStatusChange(separacao.id, 'em_separacao')}
            variant="outline"
            className="h-9 border-blue-500 text-blue-600 hover:bg-blue-50 text-sm px-3"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Voltar
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl shadow-card transition-all duration-300 hover:shadow-card-hover overflow-hidden',
        getBorderClass(),
        isScheduled && 'ring-2 ring-orange-200',
        (isGarantia || hasGarantiaAddon) && 'ring-2 ring-orange-300 bg-orange-50/30',
        isHighlighted && 'ring-2 ring-primary ring-offset-2 animate-pulse'
      )}
    >
      {/* ── COMPACT ROW (always visible) ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status badge */}
        <StatusBadge status={separacao.status} />

        {/* Scheduled time */}
        {isScheduled && (
          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 shrink-0">
            <Clock className="w-3 h-3 mr-1" />
            {separacao.scheduled_time?.slice(0, 5)}
          </Badge>
        )}

        {/* Complexity */}
        {getNivelBadge()}

        {/* Client name + code */}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-foreground truncate block">{separacao.cliente}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {separacao.numero_entrega && (
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {separacao.numero_entrega}
              </span>
            )}
            <span className="text-xs text-muted-foreground">Obra: {separacao.codigo_obra}</span>
            {separacao.created_at && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <CalendarPlus className="w-2.5 h-2.5" />
                {format(parseISO(separacao.created_at), 'dd/MM/yy')}
              </span>
            )}
          </div>
        </div>

        {/* Gestora (small, subtle) */}
        <span className="hidden sm:block text-xs text-muted-foreground shrink-0">{separacao.gestora_equipe}</span>

        {/* Action button */}
        <div className="shrink-0">
          {getActionButton()}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
        >
          {isExpanded ? (
            <>Fechar <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Detalhes <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      {/* ── EXPANDED DETAILS ── */}
      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-4 space-y-4 animate-fade-in">

          {/* Números da Venda */}
          {separacao.numero_venda && separacao.numero_venda.length > 0 && (
            <div>
              <p className="field-label mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-blue-500" />
                Vendas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(separacao.numero_venda) ? separacao.numero_venda : [separacao.numero_venda]).map((venda, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-xl">
                    {venda}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Separações Parciais */}
          {separacao.separacoes_parciais && separacao.separacoes_parciais.length > 0 && (
            <div>
              <p className="field-label mb-1.5">🏷️ Parciais</p>
              <div className="flex flex-wrap gap-1.5">
                {separacao.separacoes_parciais.map((parcial, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-xl">
                    {parcial}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Horário do Pedido */}
            {separacao.created_at && (
              <div>
                <p className="field-label mb-1">Data do Pedido</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="field-value">
                    {format(parseISO(separacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="field-label mb-1">Responsável</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="field-value">{separacao.responsavel_recebimento}</p>
              </div>
            </div>

            <div>
              <p className="field-label mb-1">Gestora</p>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-500" />
                <p className="field-value text-purple-600 font-medium">{separacao.gestora_equipe}</p>
              </div>
            </div>

            {separacao.tipo_entrega && (
              <div>
                <p className="field-label mb-1">Forma de Entrega</p>
                {getTipoEntregaDisplay()}
              </div>
            )}

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

            <div className="sm:col-span-2">
              <p className="field-label mb-1">Endereço de Entrega</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
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

          {/* Observações */}
          {separacao.observacoes_internas && (
            <div>
              <p className="field-label mb-1 text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Observações
              </p>
              <div className="bg-amber-50 border-l-[3px] border-l-amber-500 rounded-r-md p-3">
                <p className="text-sm text-amber-900">
                  {separacao.observacoes_internas.length > 200 && !showFullObservacoes ? (
                    <>
                      {separacao.observacoes_internas.slice(0, 200)}...
                      <button onClick={() => setShowFullObservacoes(true)} className="text-amber-600 font-medium ml-1 hover:underline">
                        Ver mais
                      </button>
                    </>
                  ) : (
                    <>
                      {separacao.observacoes_internas}
                      {separacao.observacoes_internas.length > 200 && (
                        <button onClick={() => setShowFullObservacoes(false)} className="text-amber-600 font-medium ml-1 hover:underline">
                          Ver menos
                        </button>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Material */}
          {separacao.material_tipo && (
            <MaterialDisplay
              separacaoId={separacao.id}
              materialTipo={separacao.material_tipo}
              materialConteudo={separacao.material_conteudo}
            />
          )}

          {/* Edit + Delete buttons */}
          <div className="flex justify-end gap-2 pt-1">
            {isAdmin && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a excluir o pedido de <strong>{separacao.cliente}</strong> 
                      {separacao.numero_entrega && <> ({separacao.numero_entrega})</>}. 
                      Esta ação é irreversível e removerá todos os itens e arquivos associados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(separacao.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sim, excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              onClick={() => onEdit(separacao)}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary-light"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
