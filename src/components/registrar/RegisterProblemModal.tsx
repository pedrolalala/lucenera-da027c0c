import { useState } from 'react';
import { AlertTriangle, X, Camera, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEntregasPendentes } from '@/hooks/useEntregasPendentes';
import { useAuth } from '@/contexts/AuthContext';
import { Separacao } from '@/hooks/useSeparacoes';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface RegisterProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  separacao: Separacao;
  onSuccess: () => void;
}

const PROBLEM_TYPES = [
  { id: 'falta_material', label: '🔴 Falta de material/peça', description: 'Algum item está faltando' },
  { id: 'material_defeito', label: '🔴 Material com defeito', description: 'Produto danificado ou com problema' },
  { id: 'cliente_ausente', label: '🔴 Cliente ausente', description: 'Ninguém no local para receber' },
  { id: 'endereco_incorreto', label: '🔴 Endereço incorreto', description: 'Local não encontrado' },
  { id: 'acesso_bloqueado', label: '🔴 Acesso bloqueado', description: 'Obra fechada ou sem acesso' },
  { id: 'problema_tecnico', label: '🔴 Problema técnico', description: 'Erro na instalação/montagem' },
  { id: 'outros', label: '🔴 Outros', description: 'Outro tipo de problema' },
];

export function RegisterProblemModal({ isOpen, onClose, separacao, onSuccess }: RegisterProblemModalProps) {
  const [tipoProblema, setTipoProblema] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPendencia } = useEntregasPendentes();
  const { user } = useAuth();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFotos(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 photos
    }
  };

  const removeFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!tipoProblema || descricao.trim().length < 20) return;
    
    setIsSubmitting(true);

    try {
      // Upload photos first
      const fotosUrls: string[] = [];
      
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        const timestamp = Date.now();
        const extension = foto.name.split('.').pop() || 'jpg';
        const filePath = `pendencias/${separacao.codigo_obra}/${timestamp}_${i}.${extension}`;

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

      // Create pendencia
      const success = await createPendencia({
        separacao_id: separacao.id,
        codigo_obra: separacao.codigo_obra,
        cliente: separacao.cliente,
        endereco: separacao.endereco,
        responsavel: separacao.responsavel_recebimento,
        telefone: separacao.telefone,
        tipo_problema: tipoProblema,
        descricao_problema: descricao.trim(),
        fotos_urls: fotosUrls,
        registrado_por: user?.email?.split('@')[0] || 'Desconhecido',
        registrado_por_user_id: user?.id,
      });

      if (success) {
        onSuccess();
        onClose();
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTipoProblema('');
    setDescricao('');
    setFotos([]);
  };

  const isValid = tipoProblema && descricao.trim().length >= 20;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-red-50">
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Registrar Problema
          </DialogTitle>
          <p className="text-sm text-red-500 mt-1">
            Entrega: #{separacao.codigo_obra} - {separacao.cliente}
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* User Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{separacao.cliente}</strong>
              <br />
              {separacao.endereco}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Você está prestes a registrar um problema com esta entrega
            </p>
          </div>

          {/* Problem Type Selection */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">
              Selecione o tipo de problema *
            </Label>
            <RadioGroup value={tipoProblema} onValueChange={setTipoProblema}>
              <div className="grid gap-2">
                {PROBLEM_TYPES.map((type) => (
                  <label
                    key={type.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      tipoProblema === type.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-border hover:border-red-300'
                    )}
                  >
                    <RadioGroupItem value={type.id} />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{type.label}</span>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Descreva o problema em detalhes *
            </Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Explique o que aconteceu, quais peças faltaram, qual foi o problema específico..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Mínimo 20 caracteres
              </p>
              <p className={cn(
                'text-xs',
                descricao.length < 20 ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {descricao.length} / 1000
              </p>
            </div>
          </div>

          {/* Photos */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Fotos do Problema (Opcional)
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
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {fotos.length < 5 && (
              <label className="flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-red-300 transition-colors">
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Adicionar fotos ({fotos.length}/5)
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

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Atenção
              </p>
              <p className="text-xs text-amber-700">
                Ao registrar este problema, a separação será marcada como pendente e aparecerá na lista de pendências.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Registrar Pendência
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
