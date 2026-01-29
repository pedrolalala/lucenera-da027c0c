import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ObservationsFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function ObservationsField({ 
  value, 
  onChange, 
  maxLength = 1000 
}: ObservationsFieldProps) {
  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars < 100;
  const isAtLimit = remainingChars <= 0;

  const handleChange = (newValue: string) => {
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-semibold text-foreground">
          Observações (Opcional)
        </label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Registre problemas ou informações importantes
        </p>
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Ex: Cliente solicitou mudança de posição de um spot, teto não estava pronto para instalação completa, etc."
          className={cn(
            'min-h-[120px] text-base border-2 rounded-xl resize-none',
            'focus-visible:ring-primary/20',
            isAtLimit && 'border-destructive'
          )}
        />
        
        {/* Character counter */}
        <div 
          className={cn(
            'absolute bottom-3 right-3 text-xs',
            isAtLimit ? 'text-destructive font-medium' : 
            isNearLimit ? 'text-warning' : 
            'text-muted-foreground'
          )}
        >
          {value.length} / {maxLength}
        </div>
      </div>
    </div>
  );
}
