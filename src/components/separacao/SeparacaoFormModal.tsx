import { useState, useEffect, useRef } from 'react';
import { X, Tag, FileText as FileTextIcon, User, Phone, MapPin, Calendar, Check, Loader2, Table2, Paperclip, Clipboard, Pencil, Clock, CalendarClock, AlertTriangle, MessageSquare, Star, Truck, Package, Building, Mail, Zap, Flame, CheckCircle, MinusCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateSeparacao, MaterialTipo, SeparacaoItem, DeliveryType } from '@/hooks/useCreateSeparacao';
import { useUpdateSeparacao } from '@/hooks/useUpdateSeparacao';
import { useSeparacaoItens } from '@/hooks/useSeparacaoItens';
import { useSeparacaoArquivos, SeparacaoArquivo } from '@/hooks/useSeparacaoArquivos';
import { formatPhoneBR, isValidPhoneBR } from '@/lib/constants';
import { ItemsTableInput, TableItem } from './ItemsTableInput';
import { PdfExtractorUploader } from './PdfExtractorUploader';
import { PasteListInput } from './PasteListInput';
import { MultiFileUploader, FileItem } from './MultiFileUploader';
import { Separacao } from '@/hooks/useSeparacoes';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SeparacaoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Separacao | null;
}

type MaterialMethod = 'digitar' | 'arquivos' | 'colar' | 'extrair_pdf' | 'sem_material' | null;

type NivelComplexidade = 'facil' | 'medio' | 'dificil';
type TipoEntrega = 'lucenera_entrega' | 'transportadora' | 'cliente_retira' | 'correios';

interface FormErrors {
  codigo_obra?: string;
  numeros_venda?: string;
  cliente?: string;
  responsavel?: string;
  telefone?: string;
  endereco?: string;
  data_entrega?: string;
  material?: string;
  gestora_equipe?: string;
  nivel_complexidade?: string;
  tipo_entrega?: string;
  transportadora_nome?: string;
}

type CodigoStatus = 'empty' | 'valid' | 'invalid' | 'duplicate' | 'checking';

export function SeparacaoFormModal({ isOpen, onClose, onSuccess, editData }: SeparacaoFormModalProps) {
  const { createSeparacao, isSubmitting: isCreating } = useCreateSeparacao();
  const { updateSeparacao, isSubmitting: isUpdating } = useUpdateSeparacao();
  const { fetchItems } = useSeparacaoItens();
  const { fetchArquivos, uploadArquivo, saveArquivos, deleteArquivo, checkCodigoDuplicado } = useSeparacaoArquivos();
  const { toast } = useToast();
  
  const isEditMode = !!editData;
  const isSubmitting = isCreating || isUpdating;
  const codigoInputRef = useRef<HTMLInputElement>(null);
  const vendaInputRef = useRef<HTMLInputElement>(null);
  const parcialInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [codigoObra, setCodigoObra] = useState('');
  const [codigoStatus, setCodigoStatus] = useState<CodigoStatus>('empty');
  const [codigoChanged, setCodigoChanged] = useState(false);
  
  // DYNAMIC LISTS for Números da Venda and Separações Parciais
  const [numerosVenda, setNumerosVenda] = useState<string[]>([]);
  const [vendaInput, setVendaInput] = useState('');
  const [separacoesParciais, setSeparacoesParciais] = useState<string[]>([]);
  const [parcialInput, setParcialInput] = useState('');
  
  const [solicitante, setSolicitante] = useState('');
  const [gestoraEquipe, setGestoraEquipe] = useState('');
  const [cliente, setCliente] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('flexible');
  const [scheduledTime, setScheduledTime] = useState('');
  const [observacoesInternas, setObservacoesInternas] = useState('');
  
  // New fields
  const [nivelComplexidade, setNivelComplexidade] = useState<NivelComplexidade>('medio');
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('lucenera_entrega');
  const [transportadoraNome, setTransportadoraNome] = useState('');
  const [codigoRastreamento, setCodigoRastreamento] = useState('');
  
  const GESTORAS = ['Thais Gomes', 'Thairine Silva', 'Marina Pousa'];
  
  // Material state
  const [materialMethod, setMaterialMethod] = useState<MaterialMethod>(null);
  const [items, setItems] = useState<TableItem[]>([]);
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Validation
  const [errors, setErrors] = useState<FormErrors>({});

  // Load data when opening modal
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        loadEditData();
      } else {
        // Focus on codigo field for create mode
        setTimeout(() => {
          codigoInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, editData]);

  const loadEditData = async () => {
    if (!editData) return;
    
    setIsLoadingData(true);
    
    // Set basic fields
    setCodigoObra(editData.codigo_obra);
    setCodigoStatus('valid');
    setCodigoChanged(false);
    
    // Handle numero_venda as array
    const vendaData = (editData as any).numero_venda;
    if (Array.isArray(vendaData)) {
      setNumerosVenda(vendaData);
    } else if (vendaData) {
      setNumerosVenda([vendaData]);
    } else {
      setNumerosVenda([]);
    }
    
    setSeparacoesParciais((editData as any).separacoes_parciais || []);
    setSolicitante((editData as any).solicitante || (editData as any).vendedor || '');
    setGestoraEquipe(editData.gestora_equipe || '');
    setCliente(editData.cliente);
    setResponsavel(editData.responsavel_recebimento);
    setTelefone(editData.telefone ? formatPhoneBR(editData.telefone) : '');
    setEndereco(editData.endereco);
    setDataEntrega(editData.data_entrega);
    setDeliveryType((editData as any).delivery_type || 'flexible');
    setScheduledTime((editData as any).scheduled_time?.slice(0, 5) || '');
    setObservacoesInternas((editData as any).observacoes_internas || '');
    
    // New fields
    setNivelComplexidade((editData as any).nivel_complexidade || 'medio');
    setTipoEntrega((editData as any).tipo_entrega || 'lucenera_entrega');
    setTransportadoraNome((editData as any).transportadora_nome || '');
    setCodigoRastreamento((editData as any).codigo_rastreamento || '');
    
    // Set material method based on tipo
    // Cast to string to handle legacy values ('pdf', 'imagem', 'texto') from old records
    const tipoStr = editData.material_tipo as string | null;
    if (!tipoStr) {
      setMaterialMethod('sem_material');
    } else if (tipoStr === 'tabela') {
      setMaterialMethod('digitar');
      const loadedItems = await fetchItems(editData.id);
      const tableItems: TableItem[] = loadedItems.map(item => ({
        id: item.id,
        ordem: item.ordem,
        id_lote: item.id_lote || '',
        codigo_produto: item.codigo_produto,
        referencia: item.referencia,
        descricao: item.descricao,
        quantidade: item.quantidade,
        local: (item as any).local || '',
        marca: (item as any).marca || '',
      }));
      setItems(tableItems);
    } else if (tipoStr === 'arquivos' || tipoStr === 'pdf' || tipoStr === 'imagem' || tipoStr === 'texto') {
      // Handle both new 'arquivos' type and legacy types
      setMaterialMethod('arquivos');
      const existingFiles = await fetchArquivos(editData.id);
      const fileItemsList: FileItem[] = existingFiles.map(f => ({
        id: f.id,
        nome_arquivo: f.nome_arquivo,
        tipo_arquivo: f.tipo_arquivo,
        tamanho_bytes: f.tamanho_bytes,
        ordem: f.ordem,
        url_arquivo: f.url_arquivo,
        status: 'existing',
        progress: 100,
      }));
      
      // Handle legacy records that stored file URL in material_conteudo
      if ((tipoStr === 'pdf' || tipoStr === 'imagem') && editData.material_conteudo && fileItemsList.length === 0) {
        const fileName = editData.material_conteudo.split('/').pop() || 'arquivo';
        fileItemsList.push({
          id: 'legacy-1',
          nome_arquivo: fileName,
          tipo_arquivo: tipoStr === 'pdf' ? 'pdf' : 'imagem',
          tamanho_bytes: 0,
          ordem: 1,
          url_arquivo: editData.material_conteudo,
          status: 'existing',
          progress: 100,
        });
      }
      
      setFileItems(fileItemsList);
    }
    
    setIsLoadingData(false);
  };

  const handleCodigoChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCodigoObra(numericValue);
    
    if (isEditMode && numericValue !== editData?.codigo_obra) {
      setCodigoChanged(true);
    } else if (isEditMode) {
      setCodigoChanged(false);
    }
    
    if (numericValue.length === 0) {
      setCodigoStatus('empty');
    } else if (numericValue.length < 5) {
      setCodigoStatus('invalid');
    } else {
      setCodigoStatus('valid');
    }
  };

  const handleCodigoBlur = async () => {
    if (codigoObra.length < 5) {
      if (codigoObra.length > 0) {
        setCodigoStatus('invalid');
        setErrors(prev => ({ ...prev, codigo_obra: 'Código deve ter 5 ou 6 dígitos' }));
      }
      return;
    }
    
    setCodigoStatus('checking');
    setErrors(prev => ({ ...prev, codigo_obra: undefined }));
    
    const { exists } = await checkCodigoDuplicado(codigoObra, editData?.id);
    
    if (exists) {
      setCodigoStatus('duplicate');
    } else {
      setCodigoStatus('valid');
    }
  };

  const handlePhoneChange = (value: string) => {
    setTelefone(formatPhoneBR(value));
  };

  // DYNAMIC LIST HANDLERS - Números da Venda
  const handleAddVenda = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return;
    e?.preventDefault();
    
    const trimmed = vendaInput.trim();
    if (trimmed.length >= 3 && !numerosVenda.includes(trimmed)) {
      setNumerosVenda([...numerosVenda, trimmed]);
      setVendaInput('');
      setErrors(prev => ({ ...prev, numeros_venda: undefined }));
    } else if (trimmed.length > 0 && trimmed.length < 3) {
      setErrors(prev => ({ ...prev, numeros_venda: 'Mínimo 3 caracteres' }));
    }
  };

  const handleRemoveVenda = (venda: string) => {
    setNumerosVenda(numerosVenda.filter(v => v !== venda));
  };

  // DYNAMIC LIST HANDLERS - Separações Parciais
  const handleAddParcial = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return;
    e?.preventDefault();
    
    const trimmed = parcialInput.trim();
    if (trimmed && !separacoesParciais.includes(trimmed)) {
      setSeparacoesParciais([...separacoesParciais, trimmed]);
      setParcialInput('');
    }
  };

  const handleRemoveParcial = (parcial: string) => {
    setSeparacoesParciais(separacoesParciais.filter(p => p !== parcial));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (codigoObra.length < 5) {
      newErrors.codigo_obra = 'Código obrigatório (5-6 dígitos)';
    }
    if (numerosVenda.length === 0) {
      newErrors.numeros_venda = 'Adicione pelo menos 1 número de venda';
    }
    if (!gestoraEquipe) {
      newErrors.gestora_equipe = 'Selecione a gestora responsável';
    }
    if (cliente.length < 3) {
      newErrors.cliente = 'Mínimo 3 caracteres';
    }
    if (responsavel.length < 3) {
      newErrors.responsavel = 'Mínimo 3 caracteres';
    }
    if (telefone && !isValidPhoneBR(telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }
    if (endereco.length < 10) {
      newErrors.endereco = 'Mínimo 10 caracteres';
    }
    if (!dataEntrega) {
      newErrors.data_entrega = 'Data obrigatória';
    }
    
    if (deliveryType === 'scheduled' && !scheduledTime) {
      newErrors.data_entrega = 'Horário obrigatório para entregas com hora marcada';
    }
    
    if (!nivelComplexidade) {
      newErrors.nivel_complexidade = 'Selecione o nível de complexidade';
    }
    
    if (!tipoEntrega) {
      newErrors.tipo_entrega = 'Selecione o tipo de entrega';
    }
    
    if (tipoEntrega === 'transportadora' && !transportadoraNome.trim()) {
      newErrors.transportadora_nome = 'Nome da transportadora obrigatório';
    }

    // BUG 3 FIX: Material is OPTIONAL - only validate when user actively selected a method that requires content
    if (materialMethod === 'digitar' || materialMethod === 'colar') {
      if (items.length === 0) {
        newErrors.material = 'Adicione pelo menos 1 item';
      }
    } else if (materialMethod === 'extrair_pdf') {
      const hasFiles = fileItems.filter(f => !f.markedForDeletion).length > 0;
      if (items.length === 0 && !hasFiles) {
        newErrors.material = 'Anexe um PDF ou adicione itens';
      }
    } else if (materialMethod === 'arquivos') {
      const visibleFiles = fileItems.filter(f => !f.markedForDeletion);
      if (visibleFiles.length === 0) {
        newErrors.material = 'Adicione pelo menos 1 arquivo';
      }
    }
    // If materialMethod is null or 'sem_material', NO validation needed - material is optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // BUG 1 FIX: Ensure material_tipo is ONLY 'tabela', 'arquivos', or null
    // CRITICAL: Determine material_tipo based on user selection
    let materialTipo: MaterialTipo | null = null;
    let materialConteudo: string | null = null;

    if (materialMethod === 'digitar' || materialMethod === 'colar') {
      materialTipo = 'tabela';
      materialConteudo = null;
    } else if (materialMethod === 'extrair_pdf') {
      // If items were extracted, save as tabela; files are also uploaded separately
      // If no items but files exist, save as arquivos
      materialTipo = items.length > 0 ? 'tabela' : 'arquivos';
      materialConteudo = null;
    } else if (materialMethod === 'arquivos') {
      materialTipo = 'arquivos';
      materialConteudo = null;
    } else {
      // 'sem_material', null, or any other value = null (no material)
      materialTipo = null;
      materialConteudo = null;
    }
    
    // SAFETY CHECK: Ensure materialTipo is valid before insert
    if (materialTipo !== null && materialTipo !== 'tabela' && materialTipo !== 'arquivos') {
      console.error('[SeparacaoForm] Invalid material_tipo detected:', materialTipo);
      materialTipo = null; // Fallback to null
    }

    // DEBUG: Log values before saving
    console.log('[SeparacaoForm] Preparando dados para salvar:');
    console.log('  material_tipo:', materialTipo, '| typeof:', typeof materialTipo);
    console.log('  numero_venda:', numerosVenda);
    console.log('  separacoes_parciais:', separacoesParciais);
    console.log('  nivel_complexidade:', nivelComplexidade);

    const formItems = (materialMethod === 'digitar' || materialMethod === 'colar' || materialMethod === 'extrair_pdf') 
      ? items.map((item): SeparacaoItem => ({
          id: item.id,
          ordem: item.ordem,
          id_lote: item.id_lote,
          codigo_produto: item.codigo_produto,
          referencia: item.referencia,
          descricao: item.descricao,
          quantidade: item.quantidade,
          // Include new fields if present
          ...(('local' in item) ? { local: (item as any).local } : {}),
          ...(('marca' in item) ? { marca: (item as any).marca } : {}),
        }))
      : undefined;

    let success: boolean;
    let separacaoId: string | undefined;

    if (isEditMode && editData) {
      success = await updateSeparacao({
        id: editData.id,
        codigo_obra: codigoObra,
        numero_venda: numerosVenda,
        separacoes_parciais: separacoesParciais,
        solicitante: solicitante || undefined,
        gestora_equipe: gestoraEquipe,
        cliente,
        data_entrega: dataEntrega,
        responsavel_recebimento: responsavel,
        telefone: telefone ? telefone.replace(/\D/g, '') : null,
        endereco,
        material_tipo: materialTipo,
        material_conteudo: materialConteudo,
        delivery_type: deliveryType,
        scheduled_time: deliveryType === 'scheduled' ? scheduledTime : null,
        observacoes_internas: observacoesInternas.trim() || null,
        nivel_complexidade: nivelComplexidade,
        tipo_entrega: tipoEntrega,
        transportadora_nome: tipoEntrega === 'transportadora' ? transportadoraNome : null,
        codigo_rastreamento: tipoEntrega === 'correios' ? codigoRastreamento : null,
        items: formItems,
      });
      separacaoId = editData.id;
    } else {
      // CREATE MODE - Build the data object
      const insertData = {
        codigo_obra: codigoObra,
        numero_venda: numerosVenda,
        separacoes_parciais: separacoesParciais,
        solicitante: solicitante || null,
        gestora_equipe: gestoraEquipe,
        cliente,
        data_entrega: dataEntrega,
        responsavel_recebimento: responsavel,
        telefone: telefone ? telefone.replace(/\D/g, '') : null,
        endereco,
        material_tipo: materialTipo, // 'tabela', 'arquivos', or null
        material_conteudo: materialConteudo || '',
        delivery_type: deliveryType,
        scheduled_time: deliveryType === 'scheduled' ? scheduledTime : null,
        observacoes_internas: observacoesInternas.trim() || null,
        status: 'material_solicitado',
        nivel_complexidade: nivelComplexidade,
        tipo_entrega: tipoEntrega,
        transportadora_nome: tipoEntrega === 'transportadora' ? transportadoraNome : null,
        codigo_rastreamento: tipoEntrega === 'correios' ? codigoRastreamento : null,
      };

      // DEBUG: Log full insert data
      console.log('[SeparacaoForm] INSERT data:', JSON.stringify(insertData, null, 2));

      const { data: newSeparacao, error } = await supabase
        .from('separacoes')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('[SeparacaoForm] INSERT ERROR:', error);
        toast({
          title: 'Erro ao criar separação',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      separacaoId = newSeparacao.id;
      console.log('[SeparacaoForm] Separação criada com ID:', separacaoId);

      if (materialTipo === 'tabela' && formItems && formItems.length > 0) {
        const itemsToInsert = formItems.map((item, index) => ({
          separacao_id: separacaoId,
          ordem: index + 1,
          id_lote: item.id_lote || null,
          codigo_produto: item.codigo_produto,
          referencia: item.referencia,
          descricao: item.descricao,
          quantidade: item.quantidade,
        }));

        const { error: itemsError } = await supabase
          .from('separacao_itens')
          .insert(itemsToInsert);

        if (itemsError) {
          await supabase.from('separacoes').delete().eq('id', separacaoId);
          toast({
            title: 'Erro ao salvar itens',
            description: itemsError.message,
            variant: 'destructive',
          });
          return;
        }
      }

      success = true;
      toast({
        title: `Separação ${codigoObra} criada com sucesso! 📦`,
        description: 'A nova separação foi adicionada à lista.',
        className: 'bg-success text-success-foreground border-none',
      });

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    }

    if (!success || !separacaoId) return;

    if (materialMethod === 'arquivos' || (materialMethod === 'extrair_pdf' && fileItems.filter(f => !f.markedForDeletion).length > 0)) {
      setIsUploadingFiles(true);

      const filesToDelete = fileItems.filter(f => f.markedForDeletion && f.status === 'existing');
      for (const file of filesToDelete) {
        await deleteArquivo(file.id);
      }

      const newFiles = fileItems.filter(f => f.status === 'pending' && f.file && !f.markedForDeletion);
      const uploadedFiles: { nome_arquivo: string; tipo_arquivo: 'pdf' | 'imagem'; url_arquivo: string; tamanho_bytes: number; ordem: number }[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        try {
          setFileItems(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'uploading', progress: 10 } : f
          ));

          const url = await uploadArquivo(file.file!, codigoObra, file.ordem, (progress) => {
            setFileItems(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            ));
          });

          setFileItems(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'uploaded', progress: 100, url_arquivo: url } : f
          ));

          uploadedFiles.push({
            nome_arquivo: file.nome_arquivo,
            tipo_arquivo: file.tipo_arquivo,
            url_arquivo: url,
            tamanho_bytes: file.tamanho_bytes,
            ordem: file.ordem,
          });
        } catch (error) {
          setFileItems(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error', error: 'Falha no upload' } : f
          ));
        }
      }

      if (uploadedFiles.length > 0) {
        await saveArquivos(separacaoId, uploadedFiles);
      }

      setIsUploadingFiles(false);
    }

    resetForm();
    setTimeout(() => {
      onClose();
      onSuccess();
    }, 300);
  };

  const resetForm = () => {
    setCodigoObra('');
    setCodigoStatus('empty');
    setCodigoChanged(false);
    setNumerosVenda([]);
    setVendaInput('');
    setSeparacoesParciais([]);
    setParcialInput('');
    setSolicitante('');
    setGestoraEquipe('');
    setCliente('');
    setResponsavel('');
    setTelefone('');
    setEndereco('');
    setDataEntrega('');
    setDeliveryType('flexible');
    setScheduledTime('');
    setObservacoesInternas('');
    setNivelComplexidade('medio');
    setTipoEntrega('lucenera_entrega');
    setTransportadoraNome('');
    setCodigoRastreamento('');
    setMaterialMethod(null);
    setItems([]);
    setFileItems([]);
    setErrors({});
  };

  const handleClose = () => {
    const hasChanges = isEditMode 
      ? (cliente !== editData?.cliente || responsavel !== editData?.responsavel_recebimento || codigoChanged)
      : (codigoObra || cliente || responsavel || telefone || endereco || items.length > 0 || fileItems.length > 0 || numerosVenda.length > 0);
      
    if (hasChanges) {
      if (window.confirm('Descartar alterações?')) {
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  const handlePastedItems = (parsedItems: TableItem[]) => {
    setItems(parsedItems);
  };

  const isFormValid = () => {
    const visibleFiles = fileItems.filter(f => !f.markedForDeletion).length > 0;
    const hasMaterial = materialMethod === 'sem_material' || !materialMethod ||
      ((materialMethod === 'digitar' || materialMethod === 'colar') && items.length > 0) ||
      (materialMethod === 'extrair_pdf' && (items.length > 0 || visibleFiles)) ||
      (materialMethod === 'arquivos' && visibleFiles);
    
    const hasValidSchedule = deliveryType === 'flexible' || (deliveryType === 'scheduled' && scheduledTime);
    const hasValidCodigo = codigoObra.length >= 5 && codigoStatus !== 'invalid';
    const hasValidTransportadora = tipoEntrega !== 'transportadora' || transportadoraNome.trim();
    
    return !!(
      hasValidCodigo &&
      numerosVenda.length >= 1 &&
      gestoraEquipe &&
      cliente.length >= 3 &&
      responsavel.length >= 3 &&
      (!telefone || isValidPhoneBR(telefone)) &&
      endereco.length >= 10 &&
      dataEntrega &&
      hasValidSchedule &&
      nivelComplexidade &&
      tipoEntrega &&
      hasValidTransportadora &&
      hasMaterial
    );
  };

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (codigoObra.length < 5 || codigoStatus === 'invalid') missing.push('Código da Obra');
    if (numerosVenda.length < 1) missing.push('Nº da Venda');
    if (!gestoraEquipe) missing.push('Gestora');
    if (cliente.length < 3) missing.push('Cliente');
    if (responsavel.length < 3) missing.push('Responsável');
    if (telefone && !isValidPhoneBR(telefone)) missing.push('Telefone inválido');
    if (endereco.length < 10) missing.push('Endereço');
    if (!dataEntrega) missing.push('Data de Entrega');
    if (deliveryType === 'scheduled' && !scheduledTime) missing.push('Horário');
    if (!nivelComplexidade) missing.push('Complexidade');
    if (!tipoEntrega) missing.push('Tipo de Entrega');
    if (tipoEntrega === 'transportadora' && !transportadoraNome.trim()) missing.push('Transportadora');
    
    const visibleFiles = fileItems.filter(f => !f.markedForDeletion).length > 0;
    if (materialMethod === 'digitar' || materialMethod === 'colar') {
      if (items.length === 0) missing.push('Material (itens)');
    } else if (materialMethod === 'extrair_pdf') {
      if (items.length === 0 && !visibleFiles) missing.push('Material (PDF)');
    } else if (materialMethod === 'arquivos') {
      if (!visibleFiles) missing.push('Material (arquivos)');
    }
    return missing;
  };

  const materialOptions = [
    { id: 'digitar' as const, icon: Table2, label: 'Digitar Itens', sublabel: 'Item por item' },
    { id: 'extrair_pdf' as const, icon: FileTextIcon, label: 'Extrair / Anexar PDF', sublabel: 'Extrai dados + anexa' },
    { id: 'colar' as const, icon: Clipboard, label: 'Colar Lista', sublabel: 'De Excel/planilha' },
    { id: 'arquivos' as const, icon: Paperclip, label: 'Anexar Arquivos', sublabel: 'PDFs/Imagens' },
    { id: 'sem_material' as const, icon: MinusCircle, label: 'Sem Material', sublabel: 'Não anexar agora' },
  ];

  const getCodigoBorderClass = () => {
    switch (codigoStatus) {
      case 'valid':
        return 'border-green-500 focus-within:ring-green-500';
      case 'duplicate':
        return 'border-amber-500 focus-within:ring-amber-500';
      case 'invalid':
        return 'border-destructive focus-within:ring-destructive';
      case 'checking':
        return 'border-primary focus-within:ring-primary';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Pencil className="w-5 h-5 text-primary" />
                  Editar Separação
                </>
              ) : (
                'Nova Separação'
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando dados...</span>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-8">
              {/* Section 1: Dados da Obra */}
              <section>
                <h3 className="text-base font-semibold mb-5">Dados do Pedido</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Código da Obra */}
                  <div>
                    <Label className="field-label">Código da Obra *</Label>
                    <div className={cn(
                      "relative mt-1.5 rounded-[10px] border-2 transition-all",
                      getCodigoBorderClass()
                    )}>
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                      <Input
                        ref={codigoInputRef}
                        value={codigoObra}
                        onChange={(e) => handleCodigoChange(e.target.value)}
                        onBlur={handleCodigoBlur}
                        placeholder="Digite o código da obra (Ex: 26001)"
                        inputMode="numeric"
                        className="h-14 pl-12 text-lg font-semibold border-0 focus-visible:ring-0"
                      />
                      {codigoStatus === 'checking' && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                      )}
                    </div>
                    {codigoStatus === 'invalid' && codigoObra.length > 0 && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Código deve ter 5 ou 6 dígitos numéricos
                      </p>
                    )}
                    {codigoStatus === 'duplicate' && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Já existe separação com este código.
                      </p>
                    )}
                    {errors.codigo_obra && (
                      <p className="text-xs text-destructive mt-1">{errors.codigo_obra}</p>
                    )}
                  </div>

                  {/* Data de Entrega */}
                  <div>
                    <Label className="field-label">Data de Entrega Prevista *</Label>
                    <div className="relative mt-1.5">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="date"
                        value={dataEntrega}
                        onChange={e => setDataEntrega(e.target.value)}
                        className={`h-14 pl-11 ${errors.data_entrega ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.data_entrega && (
                      <p className="text-xs text-destructive mt-1">{errors.data_entrega}</p>
                    )}
                  </div>

                  {/* === NÚMEROS DA VENDA + SEPARAÇÃO PARCIAL (SIDE BY SIDE) === */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Números da Venda - REQUIRED - DYNAMIC LIST */}
                      <div>
                        <Label className="field-label">Números da Venda *</Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                          Adicione um ou mais números de venda
                        </p>
                        
                        {/* List of added vendas */}
                        {numerosVenda.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {numerosVenda.map((venda, idx) => (
                              <div
                                key={idx}
                                className="h-[52px] flex items-center gap-3 px-4 rounded-lg bg-blue-50 border border-blue-500"
                              >
                                <FileTextIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <span className="flex-1 text-[15px] font-semibold text-blue-800">
                                  {venda}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVenda(venda)}
                                  className="p-1.5 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Input to add new venda */}
                        <div className="relative">
                          <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                          <Input
                            ref={vendaInputRef}
                            value={vendaInput}
                            onChange={e => setVendaInput(e.target.value)}
                            onKeyDown={handleAddVenda}
                            onBlur={() => handleAddVenda()}
                            placeholder="Digite o número da venda"
                            className={cn(
                              "h-[52px] pl-11 pr-4 rounded-lg border-2",
                              errors.numeros_venda ? 'border-destructive' : 'border-input'
                            )}
                          />
                        </div>
                        
                        {errors.numeros_venda && (
                          <p className="text-xs text-destructive mt-1">{errors.numeros_venda}</p>
                        )}
                      </div>

                      {/* Separação Parcial - OPTIONAL - DYNAMIC LIST */}
                      <div>
                        <Label className="field-label">Separação Parcial</Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                          Códigos de separação parcial (opcional)
                        </p>
                        
                        {/* List of added parciais */}
                        {separacoesParciais.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {separacoesParciais.map((parcial, idx) => (
                              <div
                                key={idx}
                                className="h-[52px] flex items-center gap-3 px-4 rounded-lg bg-green-50 border border-green-500"
                              >
                                <Tag className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="flex-1 text-[15px] font-semibold text-green-800">
                                  {parcial}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveParcial(parcial)}
                                  className="p-1.5 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                          <Input
                            ref={parcialInputRef}
                            value={parcialInput}
                            onChange={e => setParcialInput(e.target.value)}
                            onKeyDown={handleAddParcial}
                            onBlur={() => handleAddParcial()}
                            placeholder="Digite o código parcial"
                            className="h-[52px] pl-11 pr-4 rounded-lg border-2 border-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solicitante (renamed from Vendedor) */}
                  <div>
                    <Label className="field-label">Solicitante (Opcional)</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={solicitante}
                        onChange={e => setSolicitante(e.target.value)}
                        placeholder="Quem solicitou a separação"
                        className="h-12 pl-11"
                      />
                    </div>
                  </div>

                  {/* Gestora da Equipe */}
                  <div>
                    <Label className="field-label">Gestora da Equipe *</Label>
                    <div className="relative mt-1.5">
                      <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                      <select
                        value={gestoraEquipe}
                        onChange={e => setGestoraEquipe(e.target.value)}
                        className={cn(
                          "w-full h-14 pl-11 pr-4 text-base rounded-[10px] border-2 bg-background cursor-pointer appearance-none",
                          errors.gestora_equipe ? 'border-destructive' : 'border-input',
                          !gestoraEquipe && 'text-muted-foreground'
                        )}
                      >
                        <option value="">Selecione a gestora...</option>
                        {GESTORAS.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.gestora_equipe && (
                      <p className="text-xs text-destructive mt-1">{errors.gestora_equipe}</p>
                    )}
                  </div>

                  {/* Tipo de Entrega (Flexível / Hora Marcada) */}
                  <div className="md:col-span-2">
                    <Label className="field-label">Horário de Entrega *</Label>
                    <RadioGroup 
                      value={deliveryType} 
                      onValueChange={(v) => setDeliveryType(v as DeliveryType)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"
                    >
                      <label
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${deliveryType === 'flexible' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-border hover:border-blue-300'
                          }
                        `}
                      >
                        <RadioGroupItem value="flexible" id="flexible" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Flexível</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pode entregar a qualquer horário do dia
                          </p>
                        </div>
                      </label>
                      
                      <label
                        className={`
                          flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${deliveryType === 'scheduled' 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-border hover:border-orange-300'
                          }
                        `}
                      >
                        <RadioGroupItem value="scheduled" id="scheduled" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">Hora Marcada</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente tem horário específico
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Horário Agendado */}
                  {deliveryType === 'scheduled' && (
                    <div className="md:col-span-2 animate-in slide-in-from-top-2 duration-200">
                      <Label className="field-label">Horário Combinado *</Label>
                      <div className="relative mt-1.5">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={e => setScheduledTime(e.target.value)}
                          className="h-14 pl-11 max-w-xs border-orange-300 focus:border-orange-500"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 2: Informações do Cliente - moved up for easier flow */}
              <section>
                <h3 className="text-base font-semibold mb-5">Informações do Cliente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cliente */}
                  <div>
                    <Label className="field-label">Cliente *</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={cliente}
                        onChange={e => setCliente(e.target.value)}
                        placeholder="Nome completo ou razão social"
                        className={`h-14 pl-11 ${errors.cliente ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.cliente && (
                      <p className="text-xs text-destructive mt-1">{errors.cliente}</p>
                    )}
                  </div>

                  {/* Responsável */}
                  <div>
                    <Label className="field-label">Responsável na Obra *</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={responsavel}
                        onChange={e => setResponsavel(e.target.value)}
                        placeholder="Nome de quem receberá"
                        className={`h-14 pl-11 ${errors.responsavel ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.responsavel && (
                      <p className="text-xs text-destructive mt-1">{errors.responsavel}</p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div>
                    <Label className="field-label">Telefone de Contato (Opcional)</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={telefone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        placeholder="(16) 99999-9999"
                        className={`h-14 pl-11 ${errors.telefone ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.telefone && (
                      <p className="text-xs text-destructive mt-1">{errors.telefone}</p>
                    )}
                  </div>

                  {/* Endereço */}
                  <div className="md:col-span-2">
                    <Label className="field-label">Endereço de Entrega *</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-4 w-5 h-5 text-muted-foreground" />
                      <Textarea
                        value={endereco}
                        onChange={e => setEndereco(e.target.value)}
                        placeholder="Rua, número, complemento, bairro, cidade - UF"
                        className={`min-h-[80px] pl-11 pt-3 resize-none ${errors.endereco ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.endereco && (
                      <p className="text-xs text-destructive mt-1">{errors.endereco}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section: Nível de Complexidade */}
              <section>
                <h3 className="text-base font-semibold mb-2">Nível de Complexidade da Entrega *</h3>
                <p className="text-xs text-muted-foreground mb-4">Classifique baseado no volume e dificuldade</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Fácil */}
                  <button
                    type="button"
                    onClick={() => setNivelComplexidade('facil')}
                    className={cn(
                      "relative h-[110px] flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all",
                      nivelComplexidade === 'facil'
                        ? 'border-green-500 bg-green-50 border-[4px]'
                        : 'border-border hover:border-green-400 hover:bg-green-50/50'
                    )}
                  >
                    {nivelComplexidade === 'facil' && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <CheckCircle className={cn("w-10 h-10", nivelComplexidade === 'facil' ? 'text-green-600' : 'text-green-400')} />
                    <span className={cn("text-lg font-bold", nivelComplexidade === 'facil' ? 'text-green-700' : 'text-green-600')}>
                      FÁCIL
                    </span>
                    <span className="text-xs text-muted-foreground">Poucos itens</span>
                  </button>

                  {/* Médio */}
                  <button
                    type="button"
                    onClick={() => setNivelComplexidade('medio')}
                    className={cn(
                      "relative h-[110px] flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all",
                      nivelComplexidade === 'medio'
                        ? 'border-yellow-500 bg-yellow-50 border-[4px]'
                        : 'border-border hover:border-yellow-400 hover:bg-yellow-50/50'
                    )}
                  >
                    {nivelComplexidade === 'medio' && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <Zap className={cn("w-10 h-10", nivelComplexidade === 'medio' ? 'text-yellow-600' : 'text-yellow-400')} />
                    <span className={cn("text-lg font-bold", nivelComplexidade === 'medio' ? 'text-yellow-700' : 'text-yellow-600')}>
                      MÉDIO
                    </span>
                    <span className="text-xs text-muted-foreground">Volume normal</span>
                  </button>

                  {/* Difícil */}
                  <button
                    type="button"
                    onClick={() => setNivelComplexidade('dificil')}
                    className={cn(
                      "relative h-[110px] flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all",
                      nivelComplexidade === 'dificil'
                        ? 'border-red-500 bg-red-50 border-[4px]'
                        : 'border-border hover:border-red-400 hover:bg-red-50/50'
                    )}
                  >
                    {nivelComplexidade === 'dificil' && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <Flame className={cn("w-10 h-10", nivelComplexidade === 'dificil' ? 'text-red-600' : 'text-red-400')} />
                    <span className={cn("text-lg font-bold", nivelComplexidade === 'dificil' ? 'text-red-700' : 'text-red-600')}>
                      DIFÍCIL
                    </span>
                    <span className="text-xs text-muted-foreground">Grande volume/complexo</span>
                  </button>
                </div>
                {errors.nivel_complexidade && (
                  <p className="text-xs text-destructive mt-2">{errors.nivel_complexidade}</p>
                )}
              </section>

              {/* Section: Forma de Entrega */}
              <section>
                <h3 className="text-base font-semibold mb-2">Forma de Entrega *</h3>
                <p className="text-xs text-muted-foreground mb-4">Como o material será entregue</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Lucenera Entrega */}
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('lucenera_entrega')}
                    className={cn(
                      "relative p-4 flex items-start gap-3 rounded-lg border-2 transition-all text-left",
                      tipoEntrega === 'lucenera_entrega'
                        ? 'border-blue-500 bg-blue-50 border-[3px]'
                        : 'border-border hover:border-blue-400 hover:bg-blue-50/50'
                    )}
                  >
                    <Truck className={cn("w-6 h-6 mt-0.5 flex-shrink-0", tipoEntrega === 'lucenera_entrega' ? 'text-blue-600' : 'text-blue-400')} />
                    <div>
                      <span className={cn("text-sm font-semibold", tipoEntrega === 'lucenera_entrega' ? 'text-blue-700' : 'text-foreground')}>
                        Lucenera Entrega
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">Equipe Lucenera realiza a entrega</p>
                    </div>
                  </button>

                  {/* Transportadora */}
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('transportadora')}
                    className={cn(
                      "relative p-4 flex items-start gap-3 rounded-lg border-2 transition-all text-left",
                      tipoEntrega === 'transportadora'
                        ? 'border-orange-500 bg-orange-50 border-[3px]'
                        : 'border-border hover:border-orange-400 hover:bg-orange-50/50'
                    )}
                  >
                    <Package className={cn("w-6 h-6 mt-0.5 flex-shrink-0", tipoEntrega === 'transportadora' ? 'text-orange-600' : 'text-orange-400')} />
                    <div>
                      <span className={cn("text-sm font-semibold", tipoEntrega === 'transportadora' ? 'text-orange-700' : 'text-foreground')}>
                        Transportadora
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">Enviado via transportadora externa</p>
                    </div>
                  </button>

                  {/* Cliente Retira */}
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('cliente_retira')}
                    className={cn(
                      "relative p-4 flex items-start gap-3 rounded-lg border-2 transition-all text-left",
                      tipoEntrega === 'cliente_retira'
                        ? 'border-green-500 bg-green-50 border-[3px]'
                        : 'border-border hover:border-green-400 hover:bg-green-50/50'
                    )}
                  >
                    <Building className={cn("w-6 h-6 mt-0.5 flex-shrink-0", tipoEntrega === 'cliente_retira' ? 'text-green-600' : 'text-green-400')} />
                    <div>
                      <span className={cn("text-sm font-semibold", tipoEntrega === 'cliente_retira' ? 'text-green-700' : 'text-foreground')}>
                        Cliente Retira
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">Cliente busca no estoque</p>
                    </div>
                  </button>

                  {/* Correios/Sedex */}
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('correios')}
                    className={cn(
                      "relative p-4 flex items-start gap-3 rounded-lg border-2 transition-all text-left",
                      tipoEntrega === 'correios'
                        ? 'border-yellow-500 bg-yellow-50 border-[3px]'
                        : 'border-border hover:border-yellow-400 hover:bg-yellow-50/50'
                    )}
                  >
                    <Mail className={cn("w-6 h-6 mt-0.5 flex-shrink-0", tipoEntrega === 'correios' ? 'text-yellow-600' : 'text-yellow-400')} />
                    <div>
                      <span className={cn("text-sm font-semibold", tipoEntrega === 'correios' ? 'text-yellow-700' : 'text-foreground')}>
                        Correios/Sedex
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">Envio via Correios</p>
                    </div>
                  </button>
                </div>

                {/* Conditional inputs */}
                {tipoEntrega === 'transportadora' && (
                  <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                    <Label className="field-label">Nome da Transportadora *</Label>
                    <Input
                      value={transportadoraNome}
                      onChange={e => setTransportadoraNome(e.target.value)}
                      placeholder="Ex: Jadlog, Total Express, Braspress"
                      className={cn("h-12 mt-1.5", errors.transportadora_nome && 'border-destructive')}
                    />
                    {errors.transportadora_nome && (
                      <p className="text-xs text-destructive mt-1">{errors.transportadora_nome}</p>
                    )}
                  </div>
                )}

                {tipoEntrega === 'correios' && (
                  <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                    <Label className="field-label">Código de Rastreamento (Opcional)</Label>
                    <Input
                      value={codigoRastreamento}
                      onChange={e => setCodigoRastreamento(e.target.value)}
                      placeholder="Ex: AA123456789BR"
                      className="h-12 mt-1.5"
                    />
                  </div>
                )}

                {errors.tipo_entrega && (
                  <p className="text-xs text-destructive mt-2">{errors.tipo_entrega}</p>
                )}
              </section>



              {/* Section 3: Observações */}
              <section>
                <div className="mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Observações da Entrega (Opcional)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Informações importantes sobre esta entrega
                  </p>
                </div>
                
                <div className="relative">
                  <Textarea
                    value={observacoesInternas}
                    onChange={e => {
                      if (e.target.value.length <= 2000) {
                        setObservacoesInternas(e.target.value);
                      }
                    }}
                    placeholder={`Exemplos de observações:
• Obra com acesso difícil - ligar 30 min antes
• Portaria fecha às 17h
• Elevador de serviço quebrado - usar escada`}
                    className="min-h-[100px] max-h-[200px] resize-y text-[15px] leading-relaxed"
                  />
                  <div className={`absolute bottom-2 right-2 text-xs ${observacoesInternas.length >= 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {observacoesInternas.length} / 2000
                  </div>
                </div>
              </section>

              {/* Section 4: Material para Separação - Optional */}
              <section>
                <h3 className="text-base font-semibold mb-2">Material para Separação</h3>
                <p className="text-xs text-muted-foreground mb-4">Opcional - pode criar sem anexar material</p>
                
                {/* Material Method Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                  {materialOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (materialMethod !== option.id) {
                          setMaterialMethod(option.id);
                          if (!isEditMode || option.id !== materialMethod) {
                            setItems([]);
                            setFileItems([]);
                          }
                        }
                      }}
                      className={cn(
                        "h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all",
                        materialMethod === option.id
                          ? option.id === 'sem_material'
                            ? 'border-gray-400 bg-gray-50 border-[3px]'
                            : 'border-primary bg-primary-light border-[3px]'
                          : 'border-border hover:border-primary hover:bg-muted/50'
                      )}
                    >
                      <option.icon className={cn(
                        "w-7 h-7",
                        materialMethod === option.id
                          ? option.id === 'sem_material' ? 'text-gray-500' : 'text-primary'
                          : 'text-muted-foreground'
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        materialMethod === option.id
                          ? option.id === 'sem_material' ? 'text-gray-700' : 'text-primary'
                          : 'text-foreground'
                      )}>
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                    </button>
                  ))}
                </div>

                {errors.material && (
                  <p className="text-xs text-destructive mb-4">{errors.material}</p>
                )}

                {/* Material Content based on method */}
                {materialMethod === 'digitar' && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <ItemsTableInput items={items} onItemsChange={setItems} />
                  </div>
                )}

                {materialMethod === 'extrair_pdf' && (
                  <div className="animate-in slide-in-from-top-2 duration-200 space-y-4">
                    <PdfExtractorUploader
                      onItemsExtracted={setItems}
                      existingItems={items}
                      onFilesSelected={(files) => {
                        // Also attach the PDFs as files
                        const newFileItems: FileItem[] = files.map((file, idx) => ({
                          id: crypto.randomUUID(),
                          nome_arquivo: file.name,
                          tipo_arquivo: 'pdf' as const,
                          tamanho_bytes: file.size,
                          ordem: fileItems.length + idx + 1,
                          url_arquivo: '',
                          status: 'pending' as const,
                          progress: 0,
                          file,
                        }));
                        setFileItems(prev => [...prev, ...newFileItems]);
                      }}
                    />
                    {items.length > 0 && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Check className="w-4 h-4 text-success" />
                          {items.length} itens extraídos para salvar
                        </h4>
                      </div>
                    )}
                    {fileItems.filter(f => !f.markedForDeletion).length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          {fileItems.filter(f => !f.markedForDeletion).length} arquivo(s) anexado(s)
                        </h4>
                        <div className="space-y-1">
                          {fileItems.filter(f => !f.markedForDeletion).map(f => (
                            <div key={f.id} className="flex items-center justify-between text-xs text-blue-700">
                              <span>{f.nome_arquivo}</span>
                              <button
                                type="button"
                                onClick={() => setFileItems(prev => prev.filter(fi => fi.id !== f.id))}
                                className="p-1 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {materialMethod === 'colar' && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <PasteListInput onItemsParsed={handlePastedItems} />
                    {items.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Itens importados ({items.length}):</h4>
                        <ItemsTableInput items={items} onItemsChange={setItems} />
                      </div>
                    )}
                  </div>
                )}

                {materialMethod === 'arquivos' && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <MultiFileUploader
                      files={fileItems}
                      onFilesChange={setFileItems}
                      maxFiles={20}
                      maxSizeMB={15}
                    />
                  </div>
                )}

                {materialMethod === 'sem_material' && (
                  <div className="animate-in slide-in-from-top-2 duration-200 bg-gray-50 rounded-lg p-6 text-center">
                    <MinusCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Nenhum material será anexado</p>
                    <p className="text-sm text-gray-500 mt-1">Você poderá adicionar material posteriormente editando a separação</p>
                  </div>
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t p-6 space-y-2">
              {!isFormValid() && (
                <div className="text-xs text-muted-foreground flex flex-wrap gap-1 items-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium">Faltam:</span>
                  {getMissingFields().map((field, i) => (
                    <span key={field} className="text-amber-600 font-medium">
                      {field}{i < getMissingFields().length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting || isUploadingFiles}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isFormValid() || isSubmitting || isUploadingFiles}
                  className="min-w-[160px]"
                >
                  {isSubmitting || isUploadingFiles ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploadingFiles ? 'Enviando arquivos...' : 'Salvando...'}
                    </>
                  ) : isEditMode ? (
                    'Salvar Alterações'
                  ) : (
                    'Criar Separação'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}