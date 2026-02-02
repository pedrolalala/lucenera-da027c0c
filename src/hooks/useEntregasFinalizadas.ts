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
  created_at: string;
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
        .select('*')
        .order('data_entrega_real', { ascending: false });

      if (fetchError) throw fetchError;
      
      setEntregas((data as EntregaFinalizada[]) || []);
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
