import { ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface DateSectionProps {
  date: Date;
  count: number;
  children: ReactNode;
}

export function DateSection({ date, count, children }: DateSectionProps) {
  const { toast } = useToast();
  
  const formattedDate = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const handleCreateRoute = () => {
    toast({
      title: 'Rota em desenvolvimento',
      description: 'A integração com Google Maps/Waze será implementada em breve.',
    });
  };

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-primary">{capitalizedDate}</h2>
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary-light text-primary-dark">
            {count} {count === 1 ? 'entrega' : 'entregas'}
          </span>
        </div>
        <Button
          onClick={handleCreateRoute}
          className="bg-primary hover:bg-primary-dark text-primary-foreground self-start sm:self-auto"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Criar Rota
        </Button>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
