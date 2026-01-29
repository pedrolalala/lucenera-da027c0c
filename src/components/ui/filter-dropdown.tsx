import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FiltroSegmento } from '@/types/separacao';

interface FilterDropdownProps {
  value: FiltroSegmento;
  onChange: (value: FiltroSegmento) => void;
}

const filterOptions: { value: FiltroSegmento; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'ultima-semana', label: 'Última semana' },
  { value: 'ultimo-mes', label: 'Último mês' },
  { value: 'ultimos-3-meses', label: 'Últimos 3 meses' },
  { value: 'ultimos-6-meses', label: 'Últimos 6 meses' },
];

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px] bg-card border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {filterOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
