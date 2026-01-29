import { useState, useCallback } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CodeInput } from '@/components/registrar/CodeInput';
import { ObraResumoCard } from '@/components/registrar/ObraResumoCard';
import { PhotoUploader } from '@/components/registrar/PhotoUploader';
import { ReceiverInput } from '@/components/registrar/ReceiverInput';
import { ObservationsField } from '@/components/registrar/ObservationsField';
import { Button } from '@/components/ui/button';
import { useSeparacoes, Separacao } from '@/hooks/useSeparacoes';
import { useFinalizarEntrega } from '@/hooks/useFinalizarEntrega';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ValidationState = 'idle' | 'loading' | 'success' | 'error';

export default function RegistrarEntregaPage() {
  const [codigoObra, setCodigoObra] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [obraData, setObraData] = useState<Separacao | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [recebidoPor, setRecebidoPor] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const { findByCodigoObra } = useSeparacoes();
  const { finalizarEntrega, isSubmitting } = useFinalizarEntrega();
  const { toast } = useToast();

  // Validate code format: AANNNN (5-6 digits only)
  const isValidCodeFormat = (code: string) => /^[0-9]{5,6}$/.test(code);

  const validateCode = useCallback(async () => {
    const trimmedCode = codigoObra.trim();
    
    if (!trimmedCode) {
      setValidationState('idle');
      setObraData(null);
      return;
    }

    // Validate format
    if (!isValidCodeFormat(trimmedCode)) {
      setValidationState('error');
      setErrorMessage('Código inválido. Use formato: 26001 (5-6 dígitos)');
      setObraData(null);
      return;
    }

    setValidationState('loading');
    setErrorMessage('');

    const separacao = await findByCodigoObra(trimmedCode);

    if (!separacao) {
      setValidationState('error');
      setErrorMessage('Código não encontrado. Verifique e tente novamente.');
      setObraData(null);
      return;
    }

    if (separacao.status === 'separando') {
      setValidationState('error');
      setErrorMessage('⚠️ Esta obra ainda está em separação. Aguarde ou fale com o escritório.');
      setObraData(null);
      return;
    }

    if (separacao.status === 'finalizado') {
      setValidationState('error');
      setErrorMessage('Esta obra já foi entregue anteriormente.');
      setObraData(null);
      return;
    }

    // Success - obra found and status is 'separado'
    setValidationState('success');
    setObraData(separacao);
    setRecebidoPor(separacao.responsavel_recebimento);
    
    toast({
      title: 'Obra encontrada! ✓',
      description: separacao.cliente,
      className: 'bg-success text-success-foreground border-none',
    });
  }, [codigoObra, findByCodigoObra, toast]);

  const handleSubmit = async () => {
    if (!obraData) {
      toast({
        title: 'Código inválido',
        description: 'Digite um código de obra válido.',
        variant: 'destructive',
      });
      return;
    }

    if (fotos.length === 0) {
      toast({
        title: 'Fotos obrigatórias',
        description: 'Adicione pelo menos uma foto da entrega.',
        variant: 'destructive',
      });
      return;
    }

    if (!recebidoPor.trim() || recebidoPor.trim().length < 3) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe quem recebeu a entrega (mínimo 3 caracteres).',
        variant: 'destructive',
      });
      return;
    }

    const success = await finalizarEntrega({
      separacao: obraData,
      recebidoPor: recebidoPor.trim(),
      fotos,
      observacoes: observacoes.trim(),
    });

    if (success) {
      // Reset form
      setCodigoObra('');
      setValidationState('idle');
      setObraData(null);
      setFotos([]);
      setRecebidoPor('');
      setObservacoes('');
    }
  };

  const canSubmit = obraData && fotos.length > 0 && recebidoPor.trim().length >= 3 && !isSubmitting;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Registrar Entrega</h1>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Step 1: Code Input */}
          <CodeInput
            value={codigoObra}
            onChange={setCodigoObra}
            onValidate={validateCode}
            validationState={validationState}
            errorMessage={errorMessage}
          />

          {/* Step 2: Obra Summary (when validated) */}
          {obraData && <ObraResumoCard separacao={obraData} />}

          {/* Step 3: Photo Upload */}
          {obraData && (
            <PhotoUploader
              fotos={fotos}
              onFotosChange={setFotos}
            />
          )}

          {/* Step 4: Receiver Confirmation */}
          {obraData && (
            <ReceiverInput
              value={recebidoPor}
              onChange={setRecebidoPor}
            />
          )}

          {/* Step 5: Observations */}
          {obraData && (
            <ObservationsField
              value={observacoes}
              onChange={setObservacoes}
            />
          )}
        </div>
      </div>

      {/* Fixed Submit Button */}
      {obraData && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg p-4">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'w-full h-16 text-lg font-bold rounded-xl transition-all',
                canSubmit
                  ? 'bg-success hover:bg-success-dark text-success-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                '✓ Finalizar Entrega'
              )}
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
