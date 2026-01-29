import { useState, useCallback } from 'react';
import { Truck, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CodeInput } from '@/components/registrar/CodeInput';
import { ObraResumoCard } from '@/components/registrar/ObraResumoCard';
import { PhotoUploader } from '@/components/registrar/PhotoUploader';
import { ReceiverInput } from '@/components/registrar/ReceiverInput';
import { ObservationsField } from '@/components/registrar/ObservationsField';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separacao } from '@/types/separacao';
import { mockSeparacoes } from '@/data/mockData';

export default function RegistrarEntregaPage() {
  const { toast } = useToast();
  const [codigoObra, setCodigoObra] = useState('');
  const [obraEncontrada, setObraEncontrada] = useState<Separacao | null>(null);
  const [validationState, setValidationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [recebidoPor, setRecebidoPor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCodeChange = useCallback((value: string) => {
    setCodigoObra(value);
    setValidationState('idle');
    setErrorMessage('');
    setObraEncontrada(null);
  }, []);

  const handleValidateCode = useCallback(() => {
    if (!codigoObra.trim()) return;

    setValidationState('loading');
    
    // Simulating API call with timeout
    setTimeout(() => {
      const obra = mockSeparacoes.find(
        (s) => s.codigoObra.toLowerCase() === codigoObra.toLowerCase()
      );

      if (!obra) {
        setValidationState('error');
        setErrorMessage('Código não encontrado. Verifique e tente novamente.');
        return;
      }

      if (obra.status === 'separando') {
        setValidationState('error');
        setErrorMessage('⚠️ Esta obra ainda está em separação. Aguarde ou fale com o escritório.');
        return;
      }

      if (obra.status === 'finalizado') {
        setValidationState('error');
        setErrorMessage('Esta obra já foi entregue anteriormente.');
        return;
      }

      setObraEncontrada(obra);
      setRecebidoPor(obra.responsavelRecebimento);
      setValidationState('success');
      
      toast({
        title: 'Obra encontrada! ✓',
        className: 'bg-success text-success-foreground border-none',
      });
    }, 800);
  }, [codigoObra, toast]);

  const handleAddPhoto = useCallback((photoUrl: string) => {
    setPhotos((prev) => [...prev, photoUrl]);
  }, []);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const canSubmit = validationState === 'success' && photos.length > 0 && recebidoPor.trim().length >= 3;

  const handleFinalize = useCallback(() => {
    if (!canSubmit || !obraEncontrada) return;

    setIsSubmitting(true);

    // Simulating API call
    setTimeout(() => {
      // In real app: upload photos, create entrega_finalizada record, update separacao status
      
      toast({
        title: 'Entrega finalizada com sucesso! ✓',
        description: `Obra ${obraEncontrada.codigoObra} registrada.`,
        className: 'bg-success text-success-foreground border-none',
      });

      // Reset form
      setCodigoObra('');
      setObraEncontrada(null);
      setValidationState('idle');
      setPhotos([]);
      setRecebidoPor('');
      setObservacoes('');
      setIsSubmitting(false);
    }, 1500);
  }, [canSubmit, obraEncontrada, toast]);

  return (
    <AppLayout>
      {/* Compact Header */}
      <div className="bg-card border-b border-border shadow-header">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Registrar Entrega</h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Code Input Section */}
        <section>
          <CodeInput
            value={codigoObra}
            onChange={handleCodeChange}
            onValidate={handleValidateCode}
            validationState={validationState}
            errorMessage={errorMessage}
          />
        </section>

        {/* Obra Resume Card */}
        {obraEncontrada && validationState === 'success' && (
          <section className="animate-slide-in">
            <ObraResumoCard obra={obraEncontrada} />
          </section>
        )}

        {/* Photo Upload Section */}
        {validationState === 'success' && (
          <section className="animate-fade-in">
            <PhotoUploader
              photos={photos}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
            />
          </section>
        )}

        {/* Receiver Input Section */}
        {validationState === 'success' && (
          <section className="animate-fade-in">
            <ReceiverInput
              value={recebidoPor}
              onChange={setRecebidoPor}
              defaultValue={obraEncontrada?.responsavelRecebimento || ''}
            />
          </section>
        )}

        {/* Observations Section */}
        {validationState === 'success' && (
          <section className="animate-fade-in">
            <ObservationsField
              value={observacoes}
              onChange={setObservacoes}
            />
          </section>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {validationState === 'success' && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Button
              onClick={handleFinalize}
              disabled={!canSubmit || isSubmitting}
              className="w-full h-14 text-lg font-bold bg-success hover:bg-success/90 text-success-foreground disabled:bg-muted disabled:text-muted-foreground"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin mr-2" />
                  Finalizando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Finalizar Entrega
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
