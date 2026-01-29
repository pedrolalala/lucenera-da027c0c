import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SeparacaoItem {
  id: string;
  separacao_id: string;
  ordem: number;
  id_lote: string | null;
  codigo_produto: string;
  referencia: string;
  descricao: string;
  quantidade: number;
  created_at: string;
}

export function useSeparacaoItens(separacaoId: string | null) {
  const [items, setItems] = useState<SeparacaoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!separacaoId) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('separacao_itens')
        .select('*')
        .eq('separacao_id', separacaoId)
        .order('ordem', { ascending: true });

      if (fetchError) throw fetchError;

      setItems((data as SeparacaoItem[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar itens';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [separacaoId]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
  };
}
