import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separacao } from '@/hooks/useSeparacoes';

interface FinalizarEntregaData {
  separacao: Separacao;
  recebidoPor: string;
  fotos: File[];
  observacoes: string;
}

export function useFinalizarEntrega() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const finalizarEntrega = async (data: FinalizarEntregaData): Promise<boolean> => {
    const { separacao, recebidoPor, fotos, observacoes } = data;
    
    setIsSubmitting(true);

    try {
      // ETAPA 1: Upload de fotos para o Storage
      const fotosUrls: string[] = [];
      
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        const timestamp = Date.now();
        const extension = foto.name.split('.').pop() || 'jpg';
        const filePath = `${separacao.codigo_obra}/${timestamp}_${i}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('entregas-fotos')
          .upload(filePath, foto);

        if (uploadError) {
          throw new Error(`Erro ao enviar foto ${i + 1}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('entregas-fotos')
          .getPublicUrl(filePath);

        fotosUrls.push(urlData.publicUrl);
      }

      // ETAPA 2: Inserir registro em entregas_finalizadas
      const { error: insertError } = await supabase
        .from('entregas_finalizadas')
        .insert({
          separacao_id: separacao.id,
          cliente: separacao.cliente,
          codigo_obra: separacao.codigo_obra,
          endereco: separacao.endereco,
          recebido_por: recebidoPor,
          telefone: separacao.telefone,
          material_tipo: separacao.material_tipo,
          material_conteudo: separacao.material_conteudo,
          fotos_urls: fotosUrls,
          observacoes: observacoes.trim() || null,
          observacoes_internas: (separacao as any).observacoes_internas || null,
          gestora_equipe: separacao.gestora_equipe || null,
        });

      if (insertError) {
        throw new Error(`Erro ao salvar entrega: ${insertError.message}`);
      }

      // ETAPA 3: Atualizar status da separação para 'finalizado'
      const { error: updateError } = await supabase
        .from('separacoes')
        .update({ status: 'finalizado' })
        .eq('id', separacao.id);

      if (updateError) {
        throw new Error(`Erro ao atualizar status: ${updateError.message}`);
      }

      // ETAPA 4: Sucesso!
      toast({
        title: 'Entrega finalizada com sucesso! ✓',
        description: 'A entrega foi registrada no sistema.',
        className: 'bg-success text-success-foreground border-none',
      });

      // Vibrar dispositivo se disponível
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao finalizar entrega';
      toast({
        title: 'Erro ao finalizar',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    finalizarEntrega,
    isSubmitting,
  };
}
