import { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Calendar, MapPin, User, Star, FileText, Camera, AlertTriangle,
  Save, Loader2, X, Plus,
} from 'lucide-react';
import { EntregaFinalizada } from '@/hooks/useEntregasFinalizadas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoGallery } from './PhotoGallery';
import { MaterialDisplay } from '@/components/separacao/MaterialDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useSignedUrls } from '@/hooks/useSignedUrls';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EntregaDetalhesModalProps {
  entrega: EntregaFinalizada | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

interface FormData {
  cliente: string;
  codigo_obra: string;
  endereco: string;
  recebido_por: string;
  telefone: string;
  gestora_equipe: string;
  numero_pedido: string;
  vendedor: string;
  observacoes: string;
  observacoes_internas: string;
}

export function EntregaDetalhesModal({ entrega, open, onClose, onUpdated }: EntregaDetalhesModalProps) {
  const [activeTab, setActiveTab] = useState('detalhes');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState<FormData>({
    cliente: '', codigo_obra: '', endereco: '', recebido_por: '',
    telefone: '', gestora_equipe: '', numero_pedido: '', vendedor: '',
    observacoes: '', observacoes_internas: '',
  });

  // Photo state: existing paths kept + paths to delete + new files to upload
  const [existingPhotoPaths, setExistingPhotoPaths] = useState<string[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Signed URLs for existing photos in edit mode
  const { signedUrls: existingSignedUrls, isLoading: isLoadingUrls } = useSignedUrls(
    existingPhotoPaths,
    'entregas-fotos'
  );

  // Reset when entrega changes
  useEffect(() => {
    if (entrega) {
      setForm({
        cliente: entrega.cliente || '',
        codigo_obra: entrega.codigo_obra || '',
        endereco: entrega.endereco || '',
        recebido_por: entrega.recebido_por || '',
        telefone: entrega.telefone || '',
        gestora_equipe: entrega.gestora_equipe || '',
        numero_pedido: entrega.numero_pedido || '',
        vendedor: entrega.vendedor || '',
        observacoes: entrega.observacoes || '',
        observacoes_internas: entrega.observacoes_internas || '',
      });
      setExistingPhotoPaths([...(entrega.fotos_urls || [])]);
      setRemovedPaths([]);
      setNewFiles([]);
      setActiveTab('detalhes');
    }
  }, [entrega]);

  if (!entrega) return null;

  const formattedDate = format(
    parseISO(entrega.data_entrega_real),
    "dd/MM/yyyy 'às' HH:mm",
    { locale: ptBR }
  );

  const vendas = entrega.numero_pedido
    ? entrega.numero_pedido.split(', ').filter((v) => v.trim())
    : [];

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Photo management ──
  const handleRemoveExisting = (index: number) => {
    const path = existingPhotoPaths[index];
    setRemovedPaths((prev) => [...prev, path]);
    setExistingPhotoPaths((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    const valid = Array.from(files).filter((f) => validTypes.includes(f.type));
    setNewFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Extract file path from any URL format ──
  const extractFilePath = (url: string): string => {
    if (url.includes('/sign/') && url.includes('token=')) {
      const match = url.match(/\/sign\/[^/]+\/(.+?)\?/);
      if (match) return decodeURIComponent(match[1]);
    } else if (url.includes('/storage/v1/object/public/')) {
      const match = url.match(/\/public\/[^/]+\/(.+)$/);
      if (match) return decodeURIComponent(match[1]);
    }
    return url;
  };

  // ── Save ──
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Delete removed photos from storage
      if (removedPaths.length > 0) {
        const pathsToDelete = removedPaths.map(extractFilePath);
        await supabase.storage.from('entregas-fotos').remove(pathsToDelete);
      }

      // 2. Upload new files
      const uploadedPaths: string[] = [];
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const filePath = `${entrega.codigo_obra}/${Date.now()}_new_${i}.${file.name.split('.').pop()}`;
        const { error: uploadErr } = await supabase.storage
          .from('entregas-fotos')
          .upload(filePath, file, { upsert: false });
        if (uploadErr) throw uploadErr;
        uploadedPaths.push(filePath);
      }

      // 3. Build final photo list (existing kept paths as raw paths + new uploaded paths)
      const keptPaths = existingPhotoPaths.map(extractFilePath);
      const finalPhotos = [...keptPaths, ...uploadedPaths];

      // 4. Update record
      const { error } = await supabase
        .from('entregas_finalizadas')
        .update({
          cliente: form.cliente,
          codigo_obra: form.codigo_obra,
          endereco: form.endereco,
          recebido_por: form.recebido_por,
          telefone: form.telefone,
          gestora_equipe: form.gestora_equipe || null,
          numero_pedido: form.numero_pedido || null,
          vendedor: form.vendedor || null,
          observacoes: form.observacoes || null,
          observacoes_internas: form.observacoes_internas || null,
          fotos_urls: finalPhotos,
        })
        .eq('id', entrega.id);

      if (error) throw error;

      toast({ title: '✅ Entrega atualizada com sucesso!' });
      onUpdated?.();
      onClose();
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalPhotos = existingPhotoPaths.length + newFiles.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Detalhes da Entrega</DialogTitle>
          <DialogDescription>
            {entrega.cliente} — {format(parseISO(entrega.data_entrega_real), 'dd/MM/yyyy')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="detalhes" className="flex-1">Detalhes</TabsTrigger>
            <TabsTrigger value="editar" className="flex-1">Editar</TabsTrigger>
          </TabsList>

          {/* ── ABA DETALHES ── */}
          <TabsContent value="detalhes" className="space-y-5 mt-4">
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
                {entrega.data_solicitacao && (
                  <div>
                    <p className="field-label mb-1">Data da Solicitação</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-sm text-foreground">
                        {format(parseISO(entrega.data_solicitacao), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      {(() => {
                        const dias = differenceInCalendarDays(parseISO(entrega.data_entrega_real), parseISO(entrega.data_solicitacao));
                        return dias === 0 ? 'Entregue no mesmo dia' : `${dias} dia${dias !== 1 ? 's' : ''} até a entrega`;
                      })()}
                    </p>
                  </div>
                )}
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
                {entrega.numero_entrega && (
                  <div>
                    <p className="field-label mb-1">Nº Entrega</p>
                    <p className="text-sm font-mono font-bold text-primary">{entrega.numero_entrega}</p>
                  </div>
                )}
                <div>
                  <p className="field-label mb-1">Código da Obra</p>
                  <p className="text-sm font-mono text-foreground">{entrega.codigo_obra}</p>
                </div>
              </div>
            </div>

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

            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Itens Entregues</p>
              <MaterialDisplay
                separacaoId={entrega.separacao_id}
                materialTipo={entrega.material_tipo}
                materialConteudo={entrega.material_conteudo}
              />
            </div>

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

            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
            </div>
          </TabsContent>

          {/* ── ABA EDITAR ── */}
          <TabsContent value="editar" className="space-y-4 mt-4">
            {/* Registro Fotográfico */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Registro Fotográfico</Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic,image/webp"
                multiple
                onChange={handleAddFiles}
                className="hidden"
              />

              {totalPhotos === 0 && !isLoadingUrls ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-full h-28 border-2 border-dashed border-muted-foreground/30 rounded-xl',
                    'flex flex-col items-center justify-center gap-2',
                    'bg-card hover:bg-muted/50 transition-colors'
                  )}
                >
                  <Camera className="w-10 h-10 text-primary" />
                  <span className="text-sm text-muted-foreground">Adicionar Fotos</span>
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {/* Existing photos */}
                    {existingPhotoPaths.map((_, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                        {isLoadingUrls ? (
                          <div className="w-full h-full skeleton-pulse" />
                        ) : (
                          <img
                            src={existingSignedUrls[index] || '/placeholder.svg'}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(index)}
                          className={cn(
                            'absolute top-1 right-1 w-5 h-5 rounded-full',
                            'bg-destructive text-destructive-foreground',
                            'flex items-center justify-center',
                            'opacity-0 group-hover:opacity-100 transition-opacity',
                            'hover:bg-destructive/90 focus:opacity-100'
                          )}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* New files */}
                    {newFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted group ring-2 ring-green-400">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Nova foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[10px] text-center py-0.5 font-bold">
                          NOVA
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNew(index)}
                          className={cn(
                            'absolute top-1 right-1 w-5 h-5 rounded-full',
                            'bg-destructive text-destructive-foreground',
                            'flex items-center justify-center',
                            'opacity-0 group-hover:opacity-100 transition-opacity',
                            'hover:bg-destructive/90 focus:opacity-100'
                          )}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-10 border-2 border-dashed"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar mais fotos
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    {existingPhotoPaths.length} existente{existingPhotoPaths.length !== 1 ? 's' : ''}
                    {newFiles.length > 0 && (
                      <span className="text-success font-medium"> + {newFiles.length} nova{newFiles.length !== 1 ? 's' : ''}</span>
                    )}
                    {removedPaths.length > 0 && (
                      <span className="text-destructive font-medium"> − {removedPaths.length} removida{removedPaths.length !== 1 ? 's' : ''}</span>
                    )}
                  </p>
                </>
              )}
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="edit-cliente">Cliente</Label>
                <Input id="edit-cliente" value={form.cliente} onChange={(e) => handleFieldChange('cliente', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-codigo">Código da Obra</Label>
                <Input id="edit-codigo" value={form.codigo_obra} onChange={(e) => handleFieldChange('codigo_obra', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-recebido">Quem Recebeu</Label>
                <Input id="edit-recebido" value={form.recebido_por} onChange={(e) => handleFieldChange('recebido_por', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-telefone">Telefone</Label>
                <Input id="edit-telefone" value={form.telefone} onChange={(e) => handleFieldChange('telefone', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-gestora">Gestora</Label>
                <Input id="edit-gestora" value={form.gestora_equipe} onChange={(e) => handleFieldChange('gestora_equipe', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edit-endereco">Endereço</Label>
                <Input id="edit-endereco" value={form.endereco} onChange={(e) => handleFieldChange('endereco', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-vendas">Vendas (separadas por vírgula)</Label>
                <Input id="edit-vendas" value={form.numero_pedido} onChange={(e) => handleFieldChange('numero_pedido', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-vendedor">Solicitante</Label>
                <Input id="edit-vendedor" value={form.vendedor} onChange={(e) => handleFieldChange('vendedor', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edit-obs">Observações</Label>
                <Textarea id="edit-obs" rows={3} value={form.observacoes} onChange={(e) => handleFieldChange('observacoes', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edit-obs-int">Observações Internas</Label>
                <Textarea id="edit-obs-int" rows={3} value={form.observacoes_internas} onChange={(e) => handleFieldChange('observacoes_internas', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Alterações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
