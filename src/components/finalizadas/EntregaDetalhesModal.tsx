import { Calendar, MapPin, User, Star, FileText, Camera, AlertTriangle } from 'lucide-react';
import { EntregaFinalizada } from '@/hooks/useEntregasFinalizadas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PhotoGallery } from './PhotoGallery';
import { MaterialDisplay } from '@/components/separacao/MaterialDisplay';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EntregaDetalhesModalProps {
  entrega: EntregaFinalizada | null;
  open: boolean;
  onClose: () => void;
}

export function EntregaDetalhesModal({ entrega, open, onClose }: EntregaDetalhesModalProps) {
  if (!entrega) return null;

  const formattedDate = format(
    parseISO(entrega.data_entrega_real),
    "dd/MM/yyyy 'às' HH:mm",
    { locale: ptBR }
  );

  const vendas = entrega.numero_pedido
    ? entrega.numero_pedido.split(', ').filter((v) => v.trim())
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Detalhes da Entrega</DialogTitle>
          <DialogDescription>
            {entrega.cliente} — {format(parseISO(entrega.data_entrega_real), 'dd/MM/yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Seção 1 — Fotos */}
          {entrega.fotos_urls.length > 0 ? (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Registro Fotográfico</p>
              <PhotoGallery photos={entrega.fotos_urls} maxVisible={4} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-muted rounded-lg">
              <Camera className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Sem foto disponível</p>
            </div>
          )}

          {/* Seção 2 — Informações gerais */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Informações Gerais</p>
            <div className="grid grid-cols-2 gap-3">
              {entrega.gestora_equipe && (
                <div>
                  <p className="field-label mb-1">Gestora responsável</p>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-purple-500" />
                    <p className="text-sm font-medium text-foreground">{entrega.gestora_equipe}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="field-label mb-1">Data de entrega</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm text-foreground">{formattedDate}</p>
                </div>
              </div>

              <div>
                <p className="field-label mb-1">Status</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                  Finalizado
                </span>
              </div>

              <div>
                <p className="field-label mb-1">Quem recebeu</p>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm text-foreground">{entrega.recebido_por}</p>
                </div>
              </div>

              <div className="col-span-2">
                <p className="field-label mb-1">Endereço</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{entrega.endereco}</p>
                </div>
              </div>

              <div className="col-span-2">
                <p className="field-label mb-1">Código da Obra</p>
                <p className="text-sm font-mono text-foreground">{entrega.codigo_obra}</p>
              </div>
            </div>
          </div>

          {/* Vendas */}
          {vendas.length > 0 && (
            <div>
              <p className="field-label mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-blue-500" />
                Vendas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {vendas.map((venda, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-xl">
                    {venda}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Seção 3 — Material / Itens */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Itens Entregues</p>
            <MaterialDisplay
              separacaoId={entrega.separacao_id}
              materialTipo={entrega.material_tipo}
              materialConteudo={entrega.material_conteudo}
            />
          </div>

          {/* Seção 4 — Observações */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Ocorrências e Observações</p>
            {entrega.observacoes ? (
              <div className="bg-muted rounded-lg p-3 border border-border">
                <p className="text-sm text-secondary-foreground">{entrega.observacoes}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhuma ocorrência registrada</p>
            )}

            {entrega.observacoes_internas && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 border-l-[3px] border-l-amber-500 rounded-r-md p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Observação Interna</p>
                </div>
                <p className="text-sm text-amber-900 dark:text-amber-200">{entrega.observacoes_internas}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="mx-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
