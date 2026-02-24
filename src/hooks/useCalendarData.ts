import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, format, parseISO, eachDayOfInterval, startOfDay, isBefore, isAfter, isEqual } from 'date-fns';
import { Separacao } from './useSeparacoes';

export interface DayData {
  total: number;
  materialSolicitado: number;
  emSeparacao: number;
  separado: number;
  garantia: number;
  pendente: number;
  finalizado: number;
  // Keep legacy names for backwards compatibility
  separando: number;
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

      // Fetch entregas for the month AND any "em_separacao" entries whose delivery date is in the future
      // (they may have updated_at before this month)
      const monthStart = format(startDate, 'yyyy-MM-dd');
      const monthEnd = format(endDate, 'yyyy-MM-dd');

      const [monthResult, emSeparacaoResult] = await Promise.all([
        supabase
          .from('separacoes')
          .select('*')
          .gte('data_entrega', monthStart)
          .lte('data_entrega', monthEnd)
          .order('data_entrega', { ascending: true }),
        // Also fetch em_separacao entries whose delivery date is >= month start
        // and whose updated_at (status change) is <= month end
        supabase
          .from('separacoes')
          .select('*')
          .eq('status', 'em_separacao')
          .gte('data_entrega', monthStart)
          .lte('updated_at', monthEnd + 'T23:59:59')
      ]);

      if (monthResult.error) throw monthResult.error;

      // Merge both results, deduplicating by id
      const allEntregas = new Map<string, Separacao>();
      ((monthResult.data || []) as Separacao[]).forEach(e => allEntregas.set(e.id, e));
      if (!emSeparacaoResult.error) {
        ((emSeparacaoResult.data || []) as Separacao[]).forEach(e => allEntregas.set(e.id, e));
      }

      // Group by date, expanding "em_separacao" entries across days
      const grouped: MonthData = {};

      const addToDay = (dateKey: string, entrega: Separacao) => {
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            total: 0,
            materialSolicitado: 0,
            emSeparacao: 0,
            separado: 0,
            garantia: 0,
            pendente: 0,
            finalizado: 0,
            separando: 0,
            entregas: [],
          };
        }
        // Avoid duplicates in the same day
        if (grouped[dateKey].entregas.some(e => e.id === entrega.id)) return;

        grouped[dateKey].total++;
        switch (entrega.status) {
          case 'material_solicitado':
            grouped[dateKey].materialSolicitado++;
            grouped[dateKey].separando++;
            break;
          case 'em_separacao':
            grouped[dateKey].emSeparacao++;
            grouped[dateKey].separando++;
            break;
          case 'separado':
            grouped[dateKey].separado++;
            break;
          case 'matheus_separacao_garantia':
            grouped[dateKey].garantia++;
            break;
          case 'pendente':
            grouped[dateKey].pendente++;
            break;
          case 'finalizado':
            grouped[dateKey].finalizado++;
            break;
        }
        grouped[dateKey].entregas.push(entrega);
      };
      
      allEntregas.forEach((entrega) => {
        if (entrega.status === 'em_separacao') {
          // Show on every day from updated_at (status change) to data_entrega, clamped to current month
          const statusChangedAt = startOfDay(parseISO(entrega.updated_at));
          const deliveryDate = startOfDay(parseISO(entrega.data_entrega));
          
          const rangeStart = isAfter(statusChangedAt, startDate) ? statusChangedAt : startDate;
          const rangeEnd = isBefore(deliveryDate, endDate) ? deliveryDate : endDate;
          
          if (!isAfter(rangeStart, rangeEnd)) {
            const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
            days.forEach(day => {
              addToDay(format(day, 'yyyy-MM-dd'), entrega);
            });
          }
        } else {
          // Normal: only show on delivery date
          addToDay(entrega.data_entrega, entrega);
        }
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
