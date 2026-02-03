import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MonthData, DayData } from '@/hooks/useCalendarData';
import { Flame, Check, AlertTriangle, Shield } from 'lucide-react';

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  monthData: MonthData;
  isLoading: boolean;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Progressive badge styles based on status and complexity
function getProgressiveBadge(
  status: 'material_solicitado' | 'em_separacao' | 'separado',
  nivel: 'facil' | 'medio' | 'dificil' | null,
  count: number,
  isSelected: boolean
) {
  const complexity = nivel || 'medio';
  
  // Color palette based on complexity
  const colors = {
    facil: {
      border: '#10b981', // green-500
      bgLight: 'rgba(16, 185, 129, 0.2)',
      bgSolid: '#10b981',
      text: '#065f46', // green-800
      textLight: '#d1fae5',
    },
    medio: {
      border: '#f59e0b', // yellow-500
      bgLight: 'rgba(245, 158, 11, 0.2)',
      bgSolid: '#f59e0b',
      text: '#92400e', // yellow-800
      textLight: '#fef3c7',
    },
    dificil: {
      border: '#ef4444', // red-500
      bgLight: 'rgba(239, 68, 68, 0.2)',
      bgSolid: '#ef4444',
      text: '#991b1b', // red-800
      textLight: '#fee2e2',
    },
  };

  const c = colors[complexity];

  // Status-based styling (progressive)
  const styles: Record<typeof status, React.CSSProperties> = {
    material_solicitado: {
      width: '30px',
      height: '30px',
      border: `2px solid ${c.border}`,
      background: 'transparent',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: c.text,
      fontSize: '12px',
      fontWeight: 'bold',
      opacity: 0.6,
    },
    em_separacao: {
      width: '34px',
      height: '34px',
      border: `3px solid ${c.border}`,
      background: c.bgLight,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: c.text,
      fontSize: '13px',
      fontWeight: 'bold',
      opacity: 0.8,
    },
    separado: {
      width: '38px',
      height: '38px',
      border: `2px solid white`,
      background: c.bgSolid,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: `0 2px 4px ${c.bgLight}`,
    },
  };

  if (isSelected) {
    return {
      ...styles[status],
      background: status === 'separado' ? c.bgSolid : 'rgba(255,255,255,0.9)',
      color: status === 'separado' ? 'white' : c.text,
    };
  }

  return styles[status];
}

export function CalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  monthData,
  isLoading,
}: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getDayData = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return monthData[dateKey];
  };

  // Group deliveries by status and get dominant complexity
  const getGroupedBadges = (dayData: DayData, isSelected: boolean) => {
    const badges: JSX.Element[] = [];
    
    // Get the dominant complexity from entregas (most common or default to medio)
    const getDominantComplexity = (entregas: any[]) => {
      const counts = { facil: 0, medio: 0, dificil: 0 };
      entregas.forEach(e => {
        const nivel = e.nivel_complexidade || 'medio';
        if (counts[nivel as keyof typeof counts] !== undefined) {
          counts[nivel as keyof typeof counts]++;
        }
      });
      return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as 'facil' | 'medio' | 'dificil') || 'medio';
    };

    // Material Solicitado
    if (dayData.materialSolicitado > 0) {
      const entregas = dayData.entregas.filter(e => e.status === 'material_solicitado');
      const nivel = getDominantComplexity(entregas);
      badges.push(
        <div
          key="solicitado"
          style={getProgressiveBadge('material_solicitado', nivel, dayData.materialSolicitado, isSelected)}
        >
          {dayData.materialSolicitado}
        </div>
      );
    }

    // Em Separação
    if (dayData.emSeparacao > 0) {
      const entregas = dayData.entregas.filter(e => e.status === 'em_separacao');
      const nivel = getDominantComplexity(entregas);
      badges.push(
        <div
          key="separacao"
          style={getProgressiveBadge('em_separacao', nivel, dayData.emSeparacao, isSelected)}
        >
          {dayData.emSeparacao}
        </div>
      );
    }

    // Separado
    if (dayData.separado > 0) {
      const entregas = dayData.entregas.filter(e => e.status === 'separado');
      const nivel = getDominantComplexity(entregas);
      badges.push(
        <div
          key="separado"
          style={getProgressiveBadge('separado', nivel, dayData.separado, isSelected)}
        >
          {dayData.separado}
        </div>
      );
    }

    // Garantia - Orange solid
    if (dayData.garantia > 0) {
      badges.push(
        <div
          key="garantia"
          className={cn(
            'w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-xs',
            isSelected ? 'bg-white/90 text-orange-700' : 'bg-orange-500 text-white'
          )}
        >
          <Shield className="w-3 h-3 mr-0.5" />
          {dayData.garantia}
        </div>
      );
    }

    // Pendente - Red with pulse
    if (dayData.pendente > 0) {
      badges.push(
        <div
          key="pendente"
          className={cn(
            'w-[34px] h-[34px] rounded-full flex items-center justify-center font-bold text-xs animate-pulse border-2 border-dashed',
            isSelected
              ? 'bg-white/90 text-red-700 border-red-400'
              : 'bg-red-500 text-white border-red-300'
          )}
        >
          <AlertTriangle className="w-3 h-3 mr-0.5" />
          {dayData.pendente}
        </div>
      );
    }

    // Finalizado - Gray
    if (dayData.finalizado > 0) {
      badges.push(
        <div
          key="finalizado"
          className={cn(
            'w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-[11px] opacity-60',
            isSelected
              ? 'bg-white/90 text-gray-600'
              : 'bg-gray-400 text-white'
          )}
        >
          {dayData.finalizado}
          <Check className="w-2.5 h-2.5 ml-0.5" />
        </div>
      );
    }

    return badges;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="h-8 bg-muted rounded" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="select-none">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs uppercase font-medium text-muted-foreground py-2 bg-muted/50 rounded"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const dayData = getDayData(day);
          const hasDeliveries = dayData && dayData.total > 0;
          const isHighDensity = dayData && dayData.total >= 7;

          return (
            <div
              key={day.toISOString()}
              onClick={() => hasDeliveries && isCurrentMonth && onSelectDate(day)}
              className={cn(
                'min-h-[80px] md:min-h-[100px] p-1 md:p-2 rounded-lg border transition-all duration-200 flex flex-col items-center',
                !isCurrentMonth && 'opacity-40 cursor-default',
                isCurrentMonth && !hasDeliveries && 'cursor-default',
                isCurrentMonth && hasDeliveries && 'cursor-pointer hover:bg-primary/5 hover:border-primary',
                isSelected && 'bg-primary text-primary-foreground border-primary',
                isTodayDate && !isSelected && 'border-2 border-primary bg-primary/5',
                !isSelected && !isTodayDate && 'border-border bg-card'
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  'text-sm md:text-base font-semibold mb-1',
                  !isCurrentMonth && 'text-muted-foreground',
                  isCurrentMonth && !hasDeliveries && 'text-muted-foreground',
                  isCurrentMonth && hasDeliveries && 'text-foreground',
                  isSelected && 'text-primary-foreground'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Progressive Badges */}
              {hasDeliveries && isCurrentMonth && (
                <div className="flex flex-col gap-1 items-center">
                  {getGroupedBadges(dayData, !!isSelected)}
                  {isHighDensity && !isSelected && (
                    <Flame className="w-3 h-3 text-orange-500 mt-0.5" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}