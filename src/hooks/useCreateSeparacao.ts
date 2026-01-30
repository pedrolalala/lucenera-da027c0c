import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateObraCode } from '@/lib/constants';

export type MaterialTipo = 'texto' | 'tabela' | 'pdf' | 'imagem';

export interface SeparacaoItem {
  id: string;
  ordem: number;
  id_lote: string;
  codigo_produto: string;
  referencia: string;
  descricao: string;
  quantidade: number;
}

export type DeliveryType = 'flexible' | 'scheduled';

export interface CreateSeparacaoData {
  codigo_obra: string;
  numero_pedido?: string;
  vendedor?: string;
  cliente: string;
  data_entrega: string;
  responsavel_recebimento: string;
  telefone: string;
  endereco: string;
  material_tipo: MaterialTipo;
  material_conteudo: string | null;
  delivery_type: DeliveryType;
  scheduled_time?: string | null;
  items?: SeparacaoItem[];
}

export function useCreateSeparacao() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const generateNextCode = async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    const yearPrefix = String(currentYear).slice(-2);
    
    const { data, error } = await supabase
      .from('separacoes')
      .select('codigo_obra')
      .like('codigo_obra', `${yearPrefix}%`)
      .order('codigo_obra', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last code:', error);
      return `${yearPrefix}001`;
    }

    const lastCode = data?.[0]?.codigo_obra || null;
    return generateObraCode(lastCode);
  };

  const uploadMaterial = async (
    file: File,
    codigoObra: string,
    tipo: 'pdf' | 'imagem'
  ): Promise<string> => {
    const extension = file.name.split('.').pop() || (tipo === 'pdf' ? 'pdf' : 'jpg');
    const filePath = `${codigoObra}/material.${extension}`;

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

  const createSeparacao = async (data: CreateSeparacaoData): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Step 1: Insert main separacao record
      const { data: separacaoData, error: insertError } = await supabase
        .from('separacoes')
        .insert({
          codigo_obra: data.codigo_obra,
          numero_pedido: data.numero_pedido || null,
          vendedor: data.vendedor || null,
          cliente: data.cliente,
          data_entrega: data.data_entrega,
          responsavel_recebimento: data.responsavel_recebimento,
          telefone: data.telefone,
          endereco: data.endereco,
          material_tipo: data.material_tipo,
          material_conteudo: data.material_conteudo || '',
          delivery_type: data.delivery_type,
          scheduled_time: data.delivery_type === 'scheduled' ? data.scheduled_time : null,
          status: 'separando',
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Erro ao criar separação: ${insertError.message}`);
      }

      // Step 2: If material_tipo is 'tabela', insert items
      if (data.material_tipo === 'tabela' && data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map((item, index) => ({
          separacao_id: separacaoData.id,
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
          // Rollback: delete the separacao
          await supabase.from('separacoes').delete().eq('id', separacaoData.id);
          throw new Error(`Erro ao salvar itens: ${itemsError.message}`);
        }
      }

      // Success!
      toast({
        title: `Separação ${data.codigo_obra} criada com sucesso! 📦`,
        description: 'A nova separação foi adicionada à lista.',
        className: 'bg-success text-success-foreground border-none',
      });

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar separação';
      toast({
        title: 'Erro ao criar separação',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createSeparacao,
    generateNextCode,
    uploadMaterial,
    isSubmitting,
  };
}
