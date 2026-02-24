import { useRef, KeyboardEvent } from 'react';
import { ScanLine, Check, AlertCircle, Loader2, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: (force?: boolean) => void;
  validationState: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export function CodeInput({ 
  value, 
  onChange, 
  onValidate, 
  validationState,
  errorMessage 
}: CodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onValidate(true);
    }
  };

  const handleScan = () => {
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow numeric (codigo_obra) or LUC-XXXX format (numero_entrega)
    if (/^LUC/i.test(raw)) {
      // Format as LUC- prefix
      onChange(raw.toUpperCase());
    } else {
      // Allow only digits for codigo_obra
      onChange(raw.replace(/\D/g, ''));
    }
  };

  const getBorderClass = () => {
    switch (validationState) {
      case 'success':
        return 'border-success focus-visible:ring-success/20';
      case 'error':
        return 'border-destructive focus-visible:ring-destructive/20 animate-shake';
      default:
        return 'border-border focus-visible:ring-primary/20';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">
        Código de Busca
      </label>
      <p className="text-xs text-muted-foreground -mt-1">
        Digite o número da entrega <span className="font-mono font-bold text-primary">LUC-0001</span> ou o código da obra <span className="font-mono font-bold">26001</span>
      </p>
      
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          inputMode="text"
          maxLength={10}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => onValidate()}
          placeholder="Ex: LUC-0001 ou 26001"
          disabled={validationState === 'loading'}
          className={cn(
            'h-14 text-lg pr-24 border-2 rounded-xl transition-all font-mono',
            getBorderClass()
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {validationState === 'loading' && (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
          
          {validationState === 'success' && (
            <Check className="w-5 h-5 text-success" />
          )}
          
          {validationState === 'error' && (
            <AlertCircle className="w-5 h-5 text-destructive" />
          )}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleScan}
            disabled={validationState === 'loading'}
            className="h-10 w-10 p-0 text-primary hover:text-primary hover:bg-primary/10"
          >
            <ScanLine className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {errorMessage && validationState === 'error' && (
        <p className="text-sm text-destructive animate-fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
