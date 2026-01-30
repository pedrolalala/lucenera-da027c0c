import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DeliveryType = 'flexible' | 'scheduled';

export interface Separacao {
  id: string;
  cliente: string;
  codigo_obra: string;
  data_entrega: string;
  responsavel_recebimento: string;
  telefone: string;
  endereco: string;
  status: 'separando' | 'separado' | 'finalizado';
  material_tipo: 'texto' | 'imagem' | 'pdf' | 'tabela' | 'arquivos';
  material_conteudo: string;
  delivery_type: DeliveryType;
  scheduled_time: string | null;
  order_in_route: number | null;
  created_at: string;
  updated_at: string;
}

export function useSeparacoes() {
  const [separacoes, setSeparacoes] = useState<Separacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSeparacoes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('separacoes')
        .select('*')
        .in('status', ['separando', 'separado'])
        .order('data_entrega', { ascending: true });

      if (fetchError) throw fetchError;
      
      setSeparacoes((data as Separacao[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar separações';
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

  const updateStatus = async (id: string, newStatus: 'separando' | 'separado') => {
    // Optimistic update
    const previousSeparacoes = [...separacoes];
    setSeparacoes(prev =>
      prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
    );

    try {
      const { error: updateError } = await supabase
        .from('separacoes')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Status atualizado!',
        description: `Ordem marcada como "${newStatus === 'separado' ? 'Separado' : 'Separando'}"`,
        className: 'bg-success text-success-foreground border-none',
      });
    } catch (err) {
      // Rollback on error
      setSeparacoes(previousSeparacoes);
      
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      toast({
        title: 'Erro ao atualizar',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const findByCodigoObra = async (codigo: string): Promise<Separacao | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('separacoes')
        .select('*')
        .eq('codigo_obra', codigo)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      return data as Separacao | null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar obra';
      toast({
        title: 'Erro na busca',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchSeparacoes();
  }, []);

  return {
    separacoes,
    isLoading,
    error,
    updateStatus,
    findByCodigoObra,
    refetch: fetchSeparacoes,
  };
}
