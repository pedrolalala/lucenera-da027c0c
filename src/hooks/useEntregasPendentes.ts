import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EntregaPendente, TipoProblema } from '@/types/separacao';

interface CreatePendenciaData {
  separacao_id: string;
  codigo_obra: string;
  cliente: string;
  endereco?: string;
  responsavel?: string;
  telefone?: string;
  tipo_problema: TipoProblema | string;
  descricao_problema: string;
  fotos_urls?: string[];
  registrado_por: string;
  registrado_por_user_id?: string;
}

export function useEntregasPendentes() {
  const [pendentes, setPendentes] = useState<EntregaPendente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendentes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('entregas_pendentes')
        .select('*')
        .in('status_pendencia', ['aguardando_resolucao', 'em_analise'])
        .order('data_registro', { ascending: false });

      if (fetchError) throw fetchError;
      
      setPendentes((data as EntregaPendente[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pendências';
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

  const createPendencia = async (data: CreatePendenciaData): Promise<boolean> => {
    try {
      // Create pendencia record
      const { error: insertError } = await supabase
        .from('entregas_pendentes')
        .insert({
          separacao_id: data.separacao_id,
          codigo_obra: data.codigo_obra,
          cliente: data.cliente,
          endereco: data.endereco || null,
          responsavel: data.responsavel || null,
          telefone: data.telefone || null,
          tipo_problema: data.tipo_problema,
          descricao_problema: data.descricao_problema,
          fotos_urls: data.fotos_urls || [],
          registrado_por: data.registrado_por,
          registrado_por_user_id: data.registrado_por_user_id || null,
        });

      if (insertError) throw insertError;

      // Update separacao status to pendente
      const { error: updateError } = await supabase
        .from('separacoes')
        .update({ status: 'pendente' })
        .eq('id', data.separacao_id);

      if (updateError) throw updateError;

      toast({
        title: 'Pendência registrada',
        description: 'O problema foi registrado e a separação foi marcada como pendente.',
        className: 'bg-amber-500 text-white border-none',
      });

      await fetchPendentes();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar pendência';
      toast({
        title: 'Erro ao registrar',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const resolvePendencia = async (id: string, resolvedBy: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('entregas_pendentes')
        .update({
          status_pendencia: 'resolvido',
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Pendência resolvida!',
        description: 'A entrega pode ser finalizada normalmente agora.',
        className: 'bg-success text-success-foreground border-none',
      });

      await fetchPendentes();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao resolver pendência';
      toast({
        title: 'Erro ao resolver',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPendentes();
  }, []);

  return {
    pendentes,
    isLoading,
    error,
    createPendencia,
    resolvePendencia,
    refetch: fetchPendentes,
  };
}
