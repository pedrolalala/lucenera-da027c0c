import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separacao } from '@/hooks/useSeparacoes';

export interface OptimizedDelivery {
  ordem: number;
  id: string;
  codigo_obra: string;
  cliente: string;
  endereco: string;
  responsavel_recebimento?: string;
  telefone?: string;
  distancia_anterior_km: number;
  tempo_deslocamento_min: number;
  horario_chegada: string;
  horario_saida: string;
}

export interface RouteMetrics {
  distancia_total_km: number;
  tempo_transito_min: number;
  tempo_entregas_min: number;
  tempo_total_min: number;
  horario_conclusao: string;
}

export interface OptimizedRouteResult {
  rota_otimizada: OptimizedDelivery[];
  metricas: RouteMetrics;
  justificativa: string;
}

export function useOptimizeRoute() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const optimizeRoute = async (
    origin: string,
    deliveries: Separacao[],
    startTime: string = "08:00",
    timePerDelivery: number = 30
  ): Promise<OptimizedRouteResult | null> => {
    setIsOptimizing(true);

    try {
      const { data, error } = await supabase.functions.invoke('optimize-route', {
        body: {
          origin,
          deliveries: deliveries.map(d => ({
            id: d.id,
            codigo_obra: d.codigo_obra,
            cliente: d.cliente,
            endereco: d.endereco,
            responsavel_recebimento: d.responsavel_recebimento,
            telefone: d.telefone,
          })),
          startTime,
          timePerDelivery,
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao otimizar rota');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Calculate savings message
      const originalDistance = deliveries.length * 5; // Rough estimate
      const optimizedDistance = data.metricas?.distancia_total_km || 0;
      const savings = Math.max(0, originalDistance - optimizedDistance).toFixed(1);

      toast({
        title: 'Rota otimizada! 🚀',
        description: `Economia estimada de ${savings} km`,
        className: 'bg-success text-success-foreground border-none',
      });

      return data as OptimizedRouteResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao otimizar rota';
      toast({
        title: 'Erro na otimização',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    optimizeRoute,
    isOptimizing,
  };
}
