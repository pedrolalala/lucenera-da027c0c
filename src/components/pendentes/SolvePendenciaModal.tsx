import { useState } from 'react';
import { CheckCircle2, X, Camera, Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { EntregaPendente } from '@/types/separacao';

interface SolvePendenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendencia: EntregaPendente;
  onSuccess: () => void;
}

export function SolvePendenciaModal({ isOpen, onClose, pendencia, onSuccess }: SolvePendenciaModalProps) {
  const [fotos, setFotos] = useState<File[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFotos(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (observacoes.trim().length < 10) {
      toast({
        title: 'Observação muito curta',
        description: 'Descreva o que foi feito para resolver a pendência (mínimo 10 caracteres).',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload fotos de resolução
      const fotosUrls: string[] = [];
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        const timestamp = Date.now();
        const extension = foto.name.split('.').pop() || 'jpg';
        const filePath = `resolucoes/${pendencia.codigo_obra}/${timestamp}_${i}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('entregas-fotos')
          .upload(filePath, foto);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('entregas-fotos')
            .getPublicUrl(filePath);
          fotosUrls.push(urlData.publicUrl);
        }
      }

      // Resolver pendência com fotos e observações
      const { error: updateError } = await supabase
        .from('entregas_pendentes')
        .update({
          status_pendencia: 'resolvido',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.email?.split('@')[0] || 'admin',
          fotos_resolucao: fotosUrls,
          observacoes_resolucao: observacoes.trim(),
        } as Record<string, unknown>)
        .eq('id', pendencia.id);

      if (updateError) throw updateError;

      toast({
        title: '✅ Pendência resolvida!',
        description: 'A resolução foi registrada. A entrega segue em acompanhamento.',
        className: 'bg-success text-success-foreground border-none',
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao resolver pendência';
      toast({
        title: 'Erro ao registrar resolução',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFotos([]);
    setObservacoes('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const isValid = observacoes.trim().length >= 10;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-success/10">
          <DialogTitle className="text-xl font-bold text-success flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Solucionar Pendência
          </DialogTitle>
          <p className="text-sm text-success/80 mt-1">
            Obra #{pendencia.codigo_obra} — {pendencia.cliente}
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Resumo da pendência */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-xs font-semibold text-destructive uppercase mb-1">Problema Registrado</p>
            <p className="text-sm font-medium text-destructive">{pendencia.tipo_problema.replace(/_/g, ' ')}</p>
            <p className="text-sm text-foreground mt-1">{pendencia.descricao_problema}</p>
          </div>

          {/* Observações da resolução */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Como o problema foi solucionado? *
            </Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value.slice(0, 500))}
              placeholder="Descreva o que foi feito para resolver a pendência, quais medidas foram tomadas..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">Mínimo 10 caracteres</p>
              <p className={`text-xs ${observacoes.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {observacoes.length} / 500
              </p>
            </div>
          </div>

          {/* Fotos da resolução */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Fotos da Resolução (Opcional)
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {fotos.map((foto, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(foto)}
                    alt={`Foto ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeFoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {fotos.length < 5 && (
              <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-success/50 transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Adicionar comprovante ({fotos.length}/5)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Aviso informativo */}
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground font-medium">Importante</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ao solucionar, a pendência será arquivada em "Resolvidas" para fins de auditoria.
                A entrega não será finalizada automaticamente — acesse "Registrar Entrega" para concluir.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Resolução
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
