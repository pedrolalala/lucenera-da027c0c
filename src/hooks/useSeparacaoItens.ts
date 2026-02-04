import { useState, useEffect, useCallback } from 'react';
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
  local?: string | null;
  marca?: string | null;
  created_at: string;
}

export function useSeparacaoItens(separacaoId?: string | null) {
  const [items, setItems] = useState<SeparacaoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItemsById = useCallback(async (id: string): Promise<SeparacaoItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('separacao_itens')
        .select('*')
        .eq('separacao_id', id)
        .order('ordem', { ascending: true });

      if (fetchError) throw fetchError;

      const fetchedItems = (data as SeparacaoItem[]) || [];
      setItems(fetchedItems);
      return fetchedItems;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar itens';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    if (!separacaoId) {
      setItems([]);
      return;
    }
    await fetchItemsById(separacaoId);
  }, [separacaoId, fetchItemsById]);

  useEffect(() => {
    if (separacaoId) {
      fetchItems();
    }
  }, [separacaoId]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    fetchItems: fetchItemsById,
  };
}
