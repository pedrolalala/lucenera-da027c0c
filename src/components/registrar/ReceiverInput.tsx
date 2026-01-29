import { useState } from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ReceiverInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultValue: string;
}

export function ReceiverInput({ value, onChange, defaultValue }: ReceiverInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isEdited = value !== defaultValue;
  const isValid = value.trim().length >= 3;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        Quem Recebeu
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Nome de quem recebeu"
          className={cn(
            'h-14 text-lg pl-12 border-2 rounded-xl transition-all',
            !isFocused && !isEdited && 'bg-muted',
            isFocused && 'bg-card',
            !isValid && value.length > 0 && 'border-destructive'
          )}
        />
      </div>

      {!isValid && value.length > 0 && value.length < 3 && (
        <p className="text-xs text-destructive">
          O nome deve ter pelo menos 3 caracteres
        </p>
      )}
    </div>
  );
}
