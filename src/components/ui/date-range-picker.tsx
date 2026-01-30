import * as React from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Filtrar por período...",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleQuickFilter = (type: 'today' | 'week' | 'month' | 'next30') => {
    const today = new Date();
    let from: Date;
    let to: Date;

    switch (type) {
      case 'today':
        from = today;
        to = today;
        break;
      case 'week':
        from = today;
        to = addDays(today, 7);
        break;
      case 'month':
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'next30':
        from = today;
        to = addDays(today, 30);
        break;
    }

    onChange({ from, to });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const formatDateRange = () => {
    if (!value?.from) return null;
    
    if (value.to) {
      if (format(value.from, 'yyyy-MM-dd') === format(value.to, 'yyyy-MM-dd')) {
        return format(value.from, "dd/MM/yyyy", { locale: ptBR });
      }
      return `${format(value.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(value.to, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    
    return format(value.from, "dd/MM/yyyy", { locale: ptBR });
  };

  const hasValue = value?.from;
  const dayCount = value?.from && value?.to 
    ? Math.ceil((value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : value?.from ? 1 : 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] h-11 justify-start text-left font-normal border-2",
            hasValue ? "border-primary" : "border-border",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {hasValue ? (
            <span className="flex items-center gap-2 flex-1">
              <span className="truncate">{formatDateRange()}</span>
              {dayCount > 0 && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {dayCount} {dayCount === 1 ? 'dia' : 'dias'}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {hasValue && (
            <X 
              className="ml-auto h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer" 
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 p-3 border-b border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter('today')}
            className="text-xs"
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter('week')}
            className="text-xs"
          >
            Esta Semana
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter('month')}
            className="text-xs"
          >
            Este Mês
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter('next30')}
            className="text-xs"
          >
            Próximos 30 dias
          </Button>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={1}
          locale={ptBR}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
