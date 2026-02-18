import { useState, useCallback } from 'react';
import { Truck, Loader2, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CodeInput } from '@/components/registrar/CodeInput';
import { ObraResumoCard } from '@/components/registrar/ObraResumoCard';
import { PhotoUploader } from '@/components/registrar/PhotoUploader';
import { ReceiverInput } from '@/components/registrar/ReceiverInput';
import { ObservationsField } from '@/components/registrar/ObservationsField';
import { RegisterProblemModal } from '@/components/registrar/RegisterProblemModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSeparacoes, Separacao } from '@/hooks/useSeparacoes';
import { useFinalizarEntrega } from '@/hooks/useFinalizarEntrega';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type ValidationState = 'idle' | 'loading' | 'success' | 'error';

export default function RegistrarEntregaPage() {
  const [codigoObra, setCodigoObra] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [obraData, setObraData] = useState<Separacao | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [recebidoPor, setRecebidoPor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // New fields
  const [quemEntregou, setQuemEntregou] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');
  const [dataEntrega, setDataEntrega] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Problem modal
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);

  const { findByCodigoObra } = useSeparacoes();
  const { finalizarEntrega, isSubmitting } = useFinalizarEntrega();
  const { user } = useAuth();
  const { toast } = useToast();

  // Validate code: numeric 5-6 digits (codigo_obra) OR LUC-NNNN format (numero_entrega)
  const isValidCodeFormat = (code: string) =>
    /^[0-9]{5,6}$/.test(code) || /^LUC-\d{1,6}$/i.test(code);

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
      setErrorMessage('Código inválido. Use: LUC-0001 (número da entrega) ou 26001 (código da obra)');
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

    // Check status - allow 'separado' and 'em_separacao'
    const allowedStatuses = ['separado', 'em_separacao', 'matheus_separacao_garantia'];
    
    if (separacao.status === 'material_solicitado') {
      setValidationState('error');
      setErrorMessage('⚠️ Esta obra ainda está aguardando material. Aguarde ou fale com o escritório.');
      setObraData(null);
      return;
    }

    if (separacao.status === 'pendente') {
      setValidationState('error');
      setErrorMessage('⚠️ Esta obra está com pendência registrada. Resolva a pendência primeiro.');
      setObraData(null);
      return;
    }

    if (separacao.status === 'finalizado') {
      setValidationState('error');
      setErrorMessage('Esta obra já foi entregue anteriormente.');
      setObraData(null);
      return;
    }

    // Success - obra found and status is valid
    setValidationState('success');
    setObraData(separacao);
    setRecebidoPor(separacao.responsavel_recebimento);
    setTelefoneContato(separacao.telefone || '');
    setQuemEntregou(user?.email?.split('@')[0] || '');
    
    toast({
      title: 'Obra encontrada! ✓',
      description: separacao.cliente,
      className: 'bg-success text-success-foreground border-none',
    });
  }, [codigoObra, findByCodigoObra, toast, user]);

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

    if (!quemEntregou.trim() || quemEntregou.trim().length < 2) {
      toast({
        title: 'Campo obrigatório',
        description: 'Informe quem realizou a entrega.',
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
      setQuemEntregou('');
      setTelefoneContato('');
      setDataEntrega(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  const handleProblemSuccess = () => {
    // Reset form after registering problem
    setCodigoObra('');
    setValidationState('idle');
    setObraData(null);
    setFotos([]);
    setRecebidoPor('');
    setObservacoes('');
    setQuemEntregou('');
    setTelefoneContato('');
    setDataEntrega(format(new Date(), 'yyyy-MM-dd'));
  };

  const canSubmit = obraData && fotos.length > 0 && recebidoPor.trim().length >= 3 && quemEntregou.trim().length >= 2 && !isSubmitting;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
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

          {/* Step 4: Quem Entregou */}
          {obraData && (
            <div className="bg-card rounded-xl p-5 shadow-card">
              <Label className="field-label mb-2 block">Quem Realizou a Entrega *</Label>
              <Input
                value={quemEntregou}
                onChange={(e) => setQuemEntregou(e.target.value)}
                placeholder="Nome do entregador"
                className="h-14"
              />
            </div>
          )}

          {/* Step 5: Receiver Confirmation */}
          {obraData && (
            <ReceiverInput
              value={recebidoPor}
              onChange={setRecebidoPor}
            />
          )}

          {/* Step 6: Telefone (editable) */}
          {obraData && (
            <div className="bg-card rounded-xl p-5 shadow-card">
              <Label className="field-label mb-2 block">Telefone de Contato</Label>
              <Input
                type="tel"
                value={telefoneContato}
                onChange={(e) => setTelefoneContato(e.target.value)}
                placeholder="(16) 99999-9999"
                className="h-14"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pode editar se o telefone mudou
              </p>
            </div>
          )}

          {/* Step 7: Data da Entrega (editable) */}
          {obraData && (
            <div className="bg-card rounded-xl p-5 shadow-card">
              <Label className="field-label mb-2 block">Data Real da Entrega</Label>
              <Input
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="h-14"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Altere se a entrega foi em outro dia
              </p>
            </div>
          )}

          {/* Step 8: Observations */}
          {obraData && (
            <ObservationsField
              value={observacoes}
              onChange={setObservacoes}
            />
          )}
        </div>
      </div>

      {/* Fixed Submit Buttons */}
      {obraData && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                'flex-1 h-16 text-lg font-bold rounded-xl transition-all',
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
            <Button
              onClick={() => setIsProblemModalOpen(true)}
              variant="destructive"
              className="flex-1 h-16 text-lg font-bold rounded-xl"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Registrar Problema
            </Button>
          </div>
        </div>
      )}

      {/* Problem Modal */}
      {obraData && (
        <RegisterProblemModal
          isOpen={isProblemModalOpen}
          onClose={() => setIsProblemModalOpen(false)}
          separacao={obraData}
          onSuccess={handleProblemSuccess}
        />
      )}
    </AppLayout>
  );
}
