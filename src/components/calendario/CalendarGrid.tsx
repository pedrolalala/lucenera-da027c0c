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
import { MonthData } from '@/hooks/useCalendarData';
import { Flame, Check } from 'lucide-react';

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  monthData: MonthData;
  isLoading: boolean;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="h-8 bg-muted rounded" />
          ))}
        </div>
        {/* Days skeleton */}
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
                'aspect-square p-1 md:p-2 rounded-lg border transition-all duration-200 flex flex-col items-center justify-start',
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
                  'text-sm md:text-base font-semibold',
                  !isCurrentMonth && 'text-muted-foreground',
                  isCurrentMonth && !hasDeliveries && 'text-muted-foreground',
                  isCurrentMonth && hasDeliveries && 'text-foreground',
                  isSelected && 'text-primary-foreground'
                )}
              >
                {format(day, 'd')}
              </span>

                {/* Badges */}
                {hasDeliveries && isCurrentMonth && (
                  <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                    {dayData.separando > 0 && (
                      <span
                        className={cn(
                          'text-[10px] md:text-xs font-bold px-1 md:px-1.5 py-0.5 rounded',
                          isSelected
                            ? 'bg-white/90 text-blue-700'
                            : 'bg-blue-100 text-blue-800'
                        )}
                      >
                        {dayData.separando}
                      </span>
                    )}
                    {dayData.separado > 0 && (
                      <span
                        className={cn(
                          'text-[10px] md:text-xs font-bold px-1 md:px-1.5 py-0.5 rounded',
                          isSelected
                            ? 'bg-white/90 text-green-700'
                            : 'bg-green-100 text-green-800'
                        )}
                      >
                        {dayData.separado}
                      </span>
                    )}
                    {dayData.finalizado > 0 && (
                      <span
                        className={cn(
                          'text-[10px] md:text-xs font-bold px-1 md:px-1.5 py-0.5 rounded flex items-center gap-0.5',
                          isSelected
                            ? 'bg-white/90 text-gray-600'
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        )}
                      >
                        {dayData.finalizado}
                        <Check className="w-2 h-2" />
                      </span>
                    )}
                    {isHighDensity && !isSelected && (
                      <Flame className="w-3 h-3 text-orange-500" />
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
