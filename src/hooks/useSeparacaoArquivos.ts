import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SeparacaoArquivo {
  id: string;
  separacao_id: string;
  nome_arquivo: string;
  tipo_arquivo: 'pdf' | 'imagem';
  url_arquivo: string;
  tamanho_bytes: number;
  ordem: number;
  created_at: string;
}

export interface PendingFile {
  id: string;
  file: File;
  nome_arquivo: string;
  tipo_arquivo: 'pdf' | 'imagem';
  tamanho_bytes: number;
  ordem: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  url_arquivo?: string;
  error?: string;
}

export function useSeparacaoArquivos() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchArquivos = async (separacaoId: string): Promise<SeparacaoArquivo[]> => {
    const { data, error } = await supabase
      .from('separacao_arquivos')
      .select('*')
      .eq('separacao_id', separacaoId)
      .order('ordem', { ascending: true });

    if (error) {
      console.error('Error fetching arquivos:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      tipo_arquivo: item.tipo_arquivo as 'pdf' | 'imagem',
    }));
  };

  const uploadArquivo = async (
    file: File,
    codigoObra: string,
    index: number,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const timestamp = Date.now();
    const filePath = `${codigoObra}/material_${timestamp}_${index}.${extension}`;

    // Supabase doesn't support progress tracking natively, so we simulate it
    onProgress?.(10);

    const { error: uploadError } = await supabase.storage
      .from('materiais-separacao')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);
    }

    onProgress?.(90);

    // Bucket is private — use signed URL (7 days expiry)
    const { data: urlData, error: signError } = await supabase.storage
      .from('materiais-separacao')
      .createSignedUrl(filePath, 604800); // 7 days

    if (signError) {
      throw new Error(`Erro ao gerar URL do arquivo: ${signError.message}`);
    }

    onProgress?.(100);

    return urlData.signedUrl;
  };

  const saveArquivos = async (
    separacaoId: string,
    arquivos: { nome_arquivo: string; tipo_arquivo: 'pdf' | 'imagem'; url_arquivo: string; tamanho_bytes: number; ordem: number }[]
  ): Promise<boolean> => {
    if (arquivos.length === 0) return true;

    const { error } = await supabase
      .from('separacao_arquivos')
      .insert(
        arquivos.map(arq => ({
          separacao_id: separacaoId,
          nome_arquivo: arq.nome_arquivo,
          tipo_arquivo: arq.tipo_arquivo,
          url_arquivo: arq.url_arquivo,
          tamanho_bytes: arq.tamanho_bytes,
          ordem: arq.ordem,
        }))
      );

    if (error) {
      console.error('Error saving arquivos:', error);
      toast({
        title: 'Erro ao salvar arquivos',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const deleteArquivo = async (arquivoId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('separacao_arquivos')
      .delete()
      .eq('id', arquivoId);

    if (error) {
      console.error('Error deleting arquivo:', error);
      return false;
    }

    return true;
  };

  const updateOrdem = async (
    arquivos: { id: string; ordem: number }[]
  ): Promise<boolean> => {
    for (const arq of arquivos) {
      const { error } = await supabase
        .from('separacao_arquivos')
        .update({ ordem: arq.ordem })
        .eq('id', arq.id);

      if (error) {
        console.error('Error updating ordem:', error);
        return false;
      }
    }

    return true;
  };

  const checkCodigoDuplicado = async (
    codigo: string,
    excludeId?: string
  ): Promise<{ exists: boolean; id?: string }> => {
    let query = supabase
      .from('separacoes')
      .select('id')
      .eq('codigo_obra', codigo);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error checking codigo:', error);
      return { exists: false };
    }

    return { exists: (data?.length || 0) > 0, id: data?.[0]?.id };
  };

  return {
    fetchArquivos,
    uploadArquivo,
    saveArquivos,
    deleteArquivo,
    updateOrdem,
    checkCodigoDuplicado,
    isLoading,
    setIsLoading,
  };
}
