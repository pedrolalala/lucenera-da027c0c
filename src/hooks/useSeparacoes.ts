import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StatusSeparacao, NivelComplexidade, TipoEntrega } from '@/types/separacao';

export type DeliveryType = 'flexible' | 'scheduled';

export interface Separacao {
  id: string;
  cliente: string;
  codigo_obra: string;
  data_entrega: string;
  responsavel_recebimento: string;
  telefone: string;
  endereco: string;
  status: StatusSeparacao;
  material_tipo: 'texto' | 'imagem' | 'pdf' | 'tabela' | 'arquivos';
  material_conteudo: string;
  delivery_type: DeliveryType;
  scheduled_time: string | null;
  order_in_route: number | null;
  observacoes_internas: string | null;
  gestora_equipe: string;
  numero_pedido: string | null;
  vendedor: string | null;
  separacoes_parciais: string[];
  nivel_complexidade: NivelComplexidade;
  tipo_entrega: TipoEntrega;
  transportadora_nome: string | null;
  codigo_rastreamento: string | null;
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
        .in('status', ['material_solicitado', 'em_separacao', 'separado', 'matheus_separacao_garantia', 'pendente'])
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

  const updateStatus = async (id: string, newStatus: StatusSeparacao) => {
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

      const statusLabels: Record<StatusSeparacao, string> = {
        material_solicitado: 'Material Solicitado',
        em_separacao: 'Em Separação',
        separado: 'Separado',
        matheus_separacao_garantia: 'Garantia - Matheus',
        pendente: 'Pendente',
        finalizado: 'Finalizado',
      };

      toast({
        title: 'Status atualizado!',
        description: `Ordem marcada como "${statusLabels[newStatus]}"`,
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
