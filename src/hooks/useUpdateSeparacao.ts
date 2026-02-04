import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MaterialTipo, SeparacaoItem, DeliveryType } from './useCreateSeparacao';

export interface UpdateSeparacaoData {
  id: string;
  codigo_obra: string;
  numero_venda?: string[];  // Changed to array
  separacoes_parciais?: string[];
  solicitante?: string;
  gestora_equipe: string;
  cliente: string;
  data_entrega: string;
  responsavel_recebimento: string;
  telefone: string | null;
  endereco: string;
  material_tipo: MaterialTipo | null;
  material_conteudo: string | null;
  delivery_type: DeliveryType;
  scheduled_time?: string | null;
  observacoes_internas?: string | null;
  nivel_complexidade?: 'facil' | 'medio' | 'dificil';
  tipo_entrega?: 'lucenera_entrega' | 'transportadora' | 'cliente_retira' | 'correios';
  transportadora_nome?: string | null;
  codigo_rastreamento?: string | null;
  items?: SeparacaoItem[];
}

export function useUpdateSeparacao() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const uploadMaterial = async (
    file: File,
    codigoObra: string,
    tipo: 'pdf' | 'imagem'
  ): Promise<string> => {
    const extension = file.name.split('.').pop() || (tipo === 'pdf' ? 'pdf' : 'jpg');
    const timestamp = Date.now();
    const filePath = `${codigoObra}/material_${timestamp}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('materiais-separacao')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('materiais-separacao')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const updateSeparacao = async (data: UpdateSeparacaoData): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Step 1: Update main separacao record
      const { error: updateError } = await supabase
        .from('separacoes')
        .update({
          codigo_obra: data.codigo_obra,
          numero_venda: data.numero_venda || [],
          separacoes_parciais: data.separacoes_parciais || [],
          solicitante: data.solicitante || null,
          gestora_equipe: data.gestora_equipe,
          cliente: data.cliente,
          data_entrega: data.data_entrega,
          responsavel_recebimento: data.responsavel_recebimento,
          telefone: data.telefone || '',
          endereco: data.endereco,
          material_tipo: data.material_tipo,
          material_conteudo: data.material_conteudo || '',
          delivery_type: data.delivery_type,
          scheduled_time: data.delivery_type === 'scheduled' ? data.scheduled_time : null,
          observacoes_internas: data.observacoes_internas || null,
          nivel_complexidade: data.nivel_complexidade || 'medio',
          tipo_entrega: data.tipo_entrega || 'lucenera_entrega',
          transportadora_nome: data.transportadora_nome || null,
          codigo_rastreamento: data.codigo_rastreamento || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (updateError) {
        throw new Error(`Erro ao atualizar separação: ${updateError.message}`);
      }

      // Step 2: If material_tipo is 'tabela', update items
      if (data.material_tipo === 'tabela' && data.items) {
        // First, delete existing items
        const { error: deleteError } = await supabase
          .from('separacao_itens')
          .delete()
          .eq('separacao_id', data.id);

        if (deleteError) {
          throw new Error(`Erro ao remover itens antigos: ${deleteError.message}`);
        }

        // Then insert new items if any
        if (data.items.length > 0) {
          const itemsToInsert = data.items.map((item, index) => ({
            separacao_id: data.id,
            ordem: index + 1,
            id_lote: item.id_lote || null,
            codigo_produto: item.codigo_produto,
            referencia: item.referencia,
            descricao: item.descricao,
            quantidade: item.quantidade,
            local: (item as any).local || null,
            marca: (item as any).marca || null,
          }));

          const { error: itemsError } = await supabase
            .from('separacao_itens')
            .insert(itemsToInsert);

          if (itemsError) {
            throw new Error(`Erro ao salvar itens: ${itemsError.message}`);
          }
        }
      }

      // Success!
      toast({
        title: `Separação ${data.codigo_obra} atualizada! ✏️`,
        description: 'As alterações foram salvas.',
        className: 'bg-success text-success-foreground border-none',
      });

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar separação';
      toast({
        title: 'Erro ao atualizar separação',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    updateSeparacao,
    uploadMaterial,
    isSubmitting,
  };
}
