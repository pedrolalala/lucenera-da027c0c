import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EntregaFinalizada {
  id: string;
  separacao_id: string;
  cliente: string;
  codigo_obra: string;
  data_entrega_real: string;
  endereco: string;
  recebido_por: string;
  telefone: string;
  material_tipo: 'texto' | 'imagem' | 'pdf' | 'tabela' | 'arquivos';
  material_conteudo: string;
  fotos_urls: string[];
  observacoes: string | null;
  observacoes_internas: string | null;
  gestora_equipe: string | null;
  numero_pedido: string | null;
  vendedor: string | null;
  numero_entrega: string | null;
  data_solicitacao: string | null;
  created_at: string;
  tipo_pedido?: string;
}

export function useEntregasFinalizadas() {
  const [entregas, setEntregas] = useState<EntregaFinalizada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEntregas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('entregas_finalizadas')
        .select('*, separacoes:separacao_id(tipo_pedido)')
        .order('data_entrega_real', { ascending: false });

      if (fetchError) throw fetchError;
      
      const mapped = (data || []).map((row: any) => ({
        ...row,
        tipo_pedido: row.separacoes?.tipo_pedido || 'normal',
        separacoes: undefined,
      })) as EntregaFinalizada[];
      setEntregas(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar entregas';
      setError(message);
      toast({
        title: 'Erro ao carregar dados',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntregas();
  }, []);

  return {
    entregas,
    isLoading,
    error,
    refetch: fetchEntregas,
  };
}
