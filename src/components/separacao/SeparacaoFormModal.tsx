import { useState, useEffect } from 'react';
import { X, Tag, FileText as FileTextIcon, User, Phone, MapPin, Calendar, RefreshCw, Check, Loader2, Table2, Image, FileText, Clipboard, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateSeparacao, MaterialTipo, SeparacaoItem } from '@/hooks/useCreateSeparacao';
import { useUpdateSeparacao } from '@/hooks/useUpdateSeparacao';
import { useSeparacaoItens } from '@/hooks/useSeparacaoItens';
import { formatPhoneBR, isValidPhoneBR } from '@/lib/constants';
import { ItemsTableInput, TableItem } from './ItemsTableInput';
import { PasteListInput } from './PasteListInput';
import { FileUploader } from './FileUploader';
import { Separacao } from '@/hooks/useSeparacoes';

interface SeparacaoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Separacao | null;
}

type MaterialMethod = 'digitar' | 'pdf' | 'imagem' | 'colar' | null;

interface FormErrors {
  cliente?: string;
  responsavel?: string;
  telefone?: string;
  endereco?: string;
  data_entrega?: string;
  material?: string;
}

export function SeparacaoFormModal({ isOpen, onClose, onSuccess, editData }: SeparacaoFormModalProps) {
  const { createSeparacao, generateNextCode, uploadMaterial: uploadCreate, isSubmitting: isCreating } = useCreateSeparacao();
  const { updateSeparacao, uploadMaterial: uploadUpdate, isSubmitting: isUpdating } = useUpdateSeparacao();
  const { fetchItems } = useSeparacaoItens();
  
  const isEditMode = !!editData;
  const isSubmitting = isCreating || isUpdating;
  
  // Form state
  const [codigoObra, setCodigoObra] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [cliente, setCliente] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  
  // Material state
  const [materialMethod, setMaterialMethod] = useState<MaterialMethod>(null);
  const [items, setItems] = useState<TableItem[]>([]);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [existingMaterialUrl, setExistingMaterialUrl] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Validation
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Load data when opening modal
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        loadEditData();
      } else {
        loadNextCode();
      }
    }
  }, [isOpen, editData]);

  const loadEditData = async () => {
    if (!editData) return;
    
    setIsLoadingData(true);
    
    // Set basic fields
    setCodigoObra(editData.codigo_obra);
    setNumeroPedido((editData as any).numero_pedido || '');
    setVendedor((editData as any).vendedor || '');
    setCliente(editData.cliente);
    setResponsavel(editData.responsavel_recebimento);
    setTelefone(formatPhoneBR(editData.telefone));
    setEndereco(editData.endereco);
    setDataEntrega(editData.data_entrega);
    
    // Set material method based on tipo
    const tipo = editData.material_tipo as MaterialTipo;
    if (tipo === 'tabela') {
      setMaterialMethod('digitar');
      // Load items
      const loadedItems = await fetchItems(editData.id);
      const tableItems: TableItem[] = loadedItems.map(item => ({
        id: item.id,
        ordem: item.ordem,
        id_lote: item.id_lote || '',
        codigo_produto: item.codigo_produto,
        referencia: item.referencia,
        descricao: item.descricao,
        quantidade: item.quantidade,
      }));
      setItems(tableItems);
    } else if (tipo === 'pdf') {
      setMaterialMethod('pdf');
      setExistingMaterialUrl(editData.material_conteudo);
    } else if (tipo === 'imagem') {
      setMaterialMethod('imagem');
      setExistingMaterialUrl(editData.material_conteudo);
    }
    
    setIsLoadingData(false);
  };

  const loadNextCode = async () => {
    setIsGeneratingCode(true);
    try {
      const code = await generateNextCode();
      setCodigoObra(code);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setTelefone(formatPhoneBR(value));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (cliente.length < 3) {
      newErrors.cliente = 'Mínimo 3 caracteres';
    }
    if (responsavel.length < 3) {
      newErrors.responsavel = 'Mínimo 3 caracteres';
    }
    if (!isValidPhoneBR(telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }
    if (endereco.length < 10) {
      newErrors.endereco = 'Mínimo 10 caracteres';
    }
    if (!dataEntrega) {
      newErrors.data_entrega = 'Data obrigatória';
    }

    // Material validation
    if (!materialMethod) {
      newErrors.material = 'Selecione um método de material';
    } else if ((materialMethod === 'digitar' || materialMethod === 'colar') && items.length === 0) {
      newErrors.material = 'Adicione pelo menos 1 item';
    } else if ((materialMethod === 'pdf' || materialMethod === 'imagem') && !materialFile && !existingMaterialUrl) {
      newErrors.material = 'Selecione um arquivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    let materialTipo: MaterialTipo = 'texto';
    let materialConteudo: string | null = existingMaterialUrl;

    // Handle file upload if new file selected
    if ((materialMethod === 'pdf' || materialMethod === 'imagem') && materialFile) {
      setIsUploadingFile(true);
      try {
        const uploadFn = isEditMode ? uploadUpdate : uploadCreate;
        materialConteudo = await uploadFn(materialFile, codigoObra, materialMethod);
        materialTipo = materialMethod;
      } catch (error) {
        setIsUploadingFile(false);
        return;
      }
      setIsUploadingFile(false);
    } else if ((materialMethod === 'pdf' || materialMethod === 'imagem') && existingMaterialUrl) {
      materialTipo = materialMethod;
      materialConteudo = existingMaterialUrl;
    } else if (materialMethod === 'digitar' || materialMethod === 'colar') {
      materialTipo = 'tabela';
      materialConteudo = null;
    }

    const formItems = (materialMethod === 'digitar' || materialMethod === 'colar') 
      ? items.map((item): SeparacaoItem => ({
          id: item.id,
          ordem: item.ordem,
          id_lote: item.id_lote,
          codigo_produto: item.codigo_produto,
          referencia: item.referencia,
          descricao: item.descricao,
          quantidade: item.quantidade,
        }))
      : undefined;

    let success: boolean;

    if (isEditMode && editData) {
      success = await updateSeparacao({
        id: editData.id,
        codigo_obra: codigoObra,
        numero_pedido: numeroPedido || undefined,
        vendedor: vendedor || undefined,
        cliente,
        data_entrega: dataEntrega,
        responsavel_recebimento: responsavel,
        telefone: telefone.replace(/\D/g, ''),
        endereco,
        material_tipo: materialTipo,
        material_conteudo: materialConteudo,
        items: formItems,
      });
    } else {
      success = await createSeparacao({
        codigo_obra: codigoObra,
        numero_pedido: numeroPedido || undefined,
        vendedor: vendedor || undefined,
        cliente,
        data_entrega: dataEntrega,
        responsavel_recebimento: responsavel,
        telefone: telefone.replace(/\D/g, ''),
        endereco,
        material_tipo: materialTipo,
        material_conteudo: materialConteudo,
        items: formItems,
      });
    }

    if (success) {
      resetForm();
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 500);
    }
  };

  const resetForm = () => {
    setCodigoObra('');
    setNumeroPedido('');
    setVendedor('');
    setCliente('');
    setResponsavel('');
    setTelefone('');
    setEndereco('');
    setDataEntrega('');
    setMaterialMethod(null);
    setItems([]);
    setMaterialFile(null);
    setExistingMaterialUrl(null);
    setErrors({});
  };

  const handleClose = () => {
    const hasChanges = isEditMode 
      ? (cliente !== editData?.cliente || responsavel !== editData?.responsavel_recebimento)
      : (cliente || responsavel || telefone || endereco || items.length > 0 || materialFile);
      
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
    const hasMaterial = 
      ((materialMethod === 'digitar' || materialMethod === 'colar') && items.length > 0) ||
      ((materialMethod === 'pdf' || materialMethod === 'imagem') && (materialFile || existingMaterialUrl));
    
    return (
      cliente.length >= 3 &&
      responsavel.length >= 3 &&
      isValidPhoneBR(telefone) &&
      endereco.length >= 10 &&
      dataEntrega &&
      materialMethod &&
      hasMaterial
    );
  };

  const materialOptions = [
    { id: 'digitar' as const, icon: Table2, label: 'Digitar Itens', sublabel: 'Item por item' },
    { id: 'pdf' as const, icon: FileText, label: 'Enviar PDF', sublabel: 'Lista pronta' },
    { id: 'imagem' as const, icon: Image, label: 'Enviar Imagem', sublabel: 'Foto da lista' },
    { id: 'colar' as const, icon: Clipboard, label: 'Colar Lista', sublabel: 'De Excel/planilha' },
  ];

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
                <h3 className="text-base font-semibold mb-5">Dados da Obra</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Código da Obra */}
                  <div>
                    <Label className="field-label">Código da Obra</Label>
                    <div className="relative mt-1.5">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                      <Input
                        value={codigoObra}
                        readOnly
                        className="h-14 pl-11 text-lg font-bold text-primary bg-muted"
                      />
                      {!isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={loadNextCode}
                          disabled={isGeneratingCode}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>
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

                  {/* Número do Pedido */}
                  <div>
                    <Label className="field-label">Nº Pedido (Opcional)</Label>
                    <div className="relative mt-1.5">
                      <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={numeroPedido}
                        onChange={e => setNumeroPedido(e.target.value)}
                        placeholder="Ex: 0003667/0005182"
                        className="h-12 pl-11"
                      />
                    </div>
                  </div>

                  {/* Vendedor */}
                  <div>
                    <Label className="field-label">Vendedor (Opcional)</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={vendedor}
                        onChange={e => setVendedor(e.target.value)}
                        placeholder="Ex: MURILLO, FILIPPO"
                        className="h-12 pl-11"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Informações do Cliente */}
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
                    <Label className="field-label">Telefone de Contato *</Label>
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

              {/* Section 3: Material para Separação */}
              <section>
                <h3 className="text-base font-semibold mb-5">Material para Separação</h3>
                
                {/* Material Method Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {materialOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (materialMethod !== option.id) {
                          setMaterialMethod(option.id);
                          if (!isEditMode || option.id !== materialMethod) {
                            setItems([]);
                            setMaterialFile(null);
                            if (option.id !== 'pdf' && option.id !== 'imagem') {
                              setExistingMaterialUrl(null);
                            }
                          }
                        }
                      }}
                      className={`
                        h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 transition-all
                        ${materialMethod === option.id
                          ? 'border-primary bg-primary-light border-[3px]'
                          : 'border-border hover:border-primary hover:bg-muted/50'
                        }
                      `}
                    >
                      <option.icon className={`w-8 h-8 ${materialMethod === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${materialMethod === option.id ? 'text-primary' : ''}`}>
                        {option.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                    </button>
                  ))}
                </div>

                {errors.material && (
                  <p className="text-xs text-destructive mb-4">{errors.material}</p>
                )}

                {/* Material Input Area */}
                {materialMethod === 'digitar' && (
                  <ItemsTableInput items={items} onItemsChange={setItems} />
                )}

                {materialMethod === 'pdf' && (
                  <FileUploader
                    type="pdf"
                    file={materialFile}
                    onFileChange={(file) => {
                      setMaterialFile(file);
                      if (file) setExistingMaterialUrl(null);
                    }}
                    isUploading={isUploadingFile}
                    existingUrl={existingMaterialUrl}
                  />
                )}

                {materialMethod === 'imagem' && (
                  <FileUploader
                    type="imagem"
                    file={materialFile}
                    onFileChange={(file) => {
                      setMaterialFile(file);
                      if (file) setExistingMaterialUrl(null);
                    }}
                    isUploading={isUploadingFile}
                    existingUrl={existingMaterialUrl}
                  />
                )}

                {materialMethod === 'colar' && (
                  <>
                    {items.length === 0 ? (
                      <PasteListInput onItemsParsed={handlePastedItems} />
                    ) : (
                      <ItemsTableInput items={items} onItemsChange={setItems} />
                    )}
                  </>
                )}
              </section>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 p-6 pt-4 border-t bg-background flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-12 px-6"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting || isUploadingFile}
                className="h-14 px-8 bg-success hover:bg-success-dark text-success-foreground"
              >
                {isSubmitting || isUploadingFile ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isEditMode ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {isEditMode ? 'Salvar Alterações' : 'Criar Separação'}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
