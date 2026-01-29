import { useRef, KeyboardEvent } from 'react';
import { ScanLine, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: () => void;
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
      onValidate();
    }
  };

  const handleScan = () => {
    // In production: open camera/scanner
    // For now, just focus input
    inputRef.current?.focus();
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
        Código da Obra
      </label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          inputMode="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onValidate}
          placeholder="Digite ou escaneie o código"
          disabled={validationState === 'loading'}
          className={cn(
            'h-14 text-lg pr-24 border-2 rounded-xl transition-all',
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
            className="h-10 w-10 p-0 text-primary hover:text-primary-dark hover:bg-primary-light"
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
