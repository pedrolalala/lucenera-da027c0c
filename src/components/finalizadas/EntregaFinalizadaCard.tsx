import { Calendar, MapPin, User } from 'lucide-react';
import { EntregaFinalizada } from '@/hooks/useEntregasFinalizadas';
import { StatusBadge } from '@/components/ui/status-badge';
import { PhotoGallery } from './PhotoGallery';
import { MaterialDisplay } from '@/components/separacao/MaterialDisplay';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EntregaFinalizadaCardProps {
  entrega: EntregaFinalizada;
}

export function EntregaFinalizadaCard({ entrega }: EntregaFinalizadaCardProps) {
  const formattedDate = format(
    parseISO(entrega.data_entrega_real), 
    "dd/MM/yyyy 'às' HH:mm", 
    { locale: ptBR }
  );

  return (
    <div className="bg-card rounded-xl shadow-card p-6 card-finalizado">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <StatusBadge status="finalizado" />
        <span className="text-sm font-medium text-muted-foreground">
          Código: {entrega.codigo_obra}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Cliente */}
        <div>
          <p className="field-label mb-1">Cliente</p>
          <p className="field-value">{entrega.cliente}</p>
        </div>

        {/* Data da Entrega */}
        <div>
          <p className="field-label mb-1">Entregue em</p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-success-light flex items-center justify-center">
              <Calendar className="w-3 h-3 text-success" />
            </div>
            <p className="field-value">{formattedDate}</p>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <p className="field-label mb-1">Endereço</p>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="field-value text-sm">{entrega.endereco}</p>
          </div>
        </div>

        {/* Recebido por */}
        <div>
          <p className="field-label mb-1">Quem Recebeu</p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-success-light flex items-center justify-center">
              <User className="w-3 h-3 text-success" />
            </div>
            <p className="field-value text-success">{entrega.recebido_por}</p>
          </div>
        </div>
      </div>

      {/* Material Display */}
      <MaterialDisplay
        separacaoId={entrega.separacao_id}
        materialTipo={entrega.material_tipo}
        materialConteudo={entrega.material_conteudo}
      />

      {/* Photo Gallery */}
      {entrega.fotos_urls.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground mb-3">Registro Fotográfico</p>
          <PhotoGallery photos={entrega.fotos_urls} />
        </div>
      )}

      {/* Observations */}
      <div className="mt-5">
        <p className="text-sm font-semibold text-foreground mb-2">Observações</p>
        <div className="bg-muted rounded-lg p-4 border border-border">
          {entrega.observacoes ? (
            <p className="text-sm text-secondary-foreground">{entrega.observacoes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhuma observação registrada</p>
          )}
        </div>
      </div>
    </div>
  );
}