import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import { Separacao } from './useSeparacoes';

export interface DayData {
  total: number;
  separando: number;
  separado: number;
  entregas: Separacao[];
}

export interface MonthData {
  [dateKey: string]: DayData;
}

export function useCalendarData(year: number, month: number) {
  const [data, setData] = useState<MonthData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMonthData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const startDate = startOfMonth(new Date(year, month));
      const endDate = endOfMonth(new Date(year, month));

      const { data: entregas, error: fetchError } = await supabase
        .from('separacoes')
        .select('*')
        .gte('data_entrega', format(startDate, 'yyyy-MM-dd'))
        .lte('data_entrega', format(endDate, 'yyyy-MM-dd'))
        .in('status', ['separando', 'separado'])
        .order('data_entrega', { ascending: true });

      if (fetchError) throw fetchError;

      // Group by date
      const grouped: MonthData = {};
      
      (entregas as Separacao[] || []).forEach((entrega) => {
        const dateKey = entrega.data_entrega;
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            total: 0,
            separando: 0,
            separado: 0,
            entregas: [],
          };
        }

        grouped[dateKey].total++;
        if (entrega.status === 'separando') {
          grouped[dateKey].separando++;
        } else if (entrega.status === 'separado') {
          grouped[dateKey].separado++;
        }
        grouped[dateKey].entregas.push(entrega);
      });

      setData(grouped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados do calendário';
      setError(message);
      toast({
        title: 'Erro ao carregar calendário',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [year, month]);

  const totalEntregas = useMemo(() => {
    return Object.values(data).reduce((sum, day) => sum + day.total, 0);
  }, [data]);

  return {
    data,
    isLoading,
    error,
    totalEntregas,
    refetch: fetchMonthData,
  };
}
