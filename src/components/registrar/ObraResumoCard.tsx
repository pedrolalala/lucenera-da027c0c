import { Check, MapPin, User, Phone } from 'lucide-react';
import { Separacao } from '@/hooks/useSeparacoes';

interface ObraResumoCardProps {
  separacao: Separacao;
}

export function ObraResumoCard({ separacao }: ObraResumoCardProps) {
  const handleCall = () => {
    window.open(`tel:${separacao.telefone.replace(/\D/g, '')}`, '_self');
  };

  return (
    <div className="relative bg-primary-light border-2 border-primary rounded-xl p-5 animate-slide-down">
      {/* Success Check Badge */}
      <div className="absolute -top-3 -right-3 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-md">
        <Check className="w-5 h-5 text-success-foreground" />
      </div>

      <div className="space-y-4">
        {/* Cliente */}
        <div>
          <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
            Cliente
          </p>
          <p className="text-base font-semibold text-foreground">
            {separacao.cliente}
          </p>
        </div>

        {/* Endereço */}
        <div>
          <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
            Endereço
          </p>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{separacao.endereco}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Responsável */}
          <div>
            <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
              Responsável
            </p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm font-medium text-foreground">
                {separacao.responsavel_recebimento}
              </p>
            </div>
          </div>

          {/* Telefone */}
          <div>
            <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-1">
              Telefone
            </p>
            <button
              onClick={handleCall}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium underline">
                {separacao.telefone}
              </p>
            </button>
          </div>
        </div>

        {/* Material */}
        <div>
          <p className="text-xs uppercase font-semibold text-primary-dark/70 tracking-wide mb-2">
            Material Esperado
          </p>
          <div className="bg-card rounded-lg p-3 border border-border">
            <pre className="text-sm text-secondary-foreground whitespace-pre-wrap font-sans">
              {separacao.material_conteudo}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
