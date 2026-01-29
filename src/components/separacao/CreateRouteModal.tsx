import { useState } from 'react';
import { X, Warehouse, MapPin, GripVertical, Navigation, ExternalLink, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ENDERECO_ESTOQUE } from '@/lib/constants';
import { Separacao } from '@/hooks/useSeparacoes';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  deliveries: Separacao[];
}

export function CreateRouteModal({ isOpen, onClose, date, deliveries }: CreateRouteModalProps) {
  const [orderedDeliveries, setOrderedDeliveries] = useState<Separacao[]>(deliveries);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const generateGoogleMapsUrl = () => {
    const origin = encodeURIComponent(ENDERECO_ESTOQUE.completo);
    const waypoints = orderedDeliveries
      .map(d => encodeURIComponent(d.endereco))
      .join('|');
    
    // Using directions API format
    const destination = orderedDeliveries.length > 0 
      ? encodeURIComponent(orderedDeliveries[orderedDeliveries.length - 1].endereco)
      : origin;

    const waypointsParam = orderedDeliveries.length > 1
      ? `&waypoints=${orderedDeliveries.slice(0, -1).map(d => encodeURIComponent(d.endereco)).join('|')}`
      : '';

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam}&travelmode=driving`;
  };

  const generateWazeUrl = () => {
    // Waze only supports single destination, use first delivery
    if (orderedDeliveries.length === 0) return '';
    
    const destination = encodeURIComponent(orderedDeliveries[0].endereco);
    return `https://waze.com/ul?q=${destination}&navigate=yes`;
  };

  const handleOpenGoogleMaps = () => {
    window.open(generateGoogleMapsUrl(), '_blank');
  };

  const handleOpenWaze = () => {
    const url = generateWazeUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleCopyList = () => {
    const text = [
      `ROTA DE ENTREGAS - ${capitalizedDate}`,
      '',
      `ORIGEM: ${ENDERECO_ESTOQUE.completo}`,
      '',
      'DESTINOS:',
      ...orderedDeliveries.map((d, i) => 
        `${i + 1}. ${d.cliente}\n   ${d.endereco}\n   Código: ${d.codigo_obra}`
      ),
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: 'Lista copiada!',
        description: 'A rota foi copiada para a área de transferência.',
        className: 'bg-success text-success-foreground border-none',
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-bold">
            Criar Rota de Entregas - {capitalizedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Origin */}
          <div>
            <p className="field-label mb-3">Ponto de Partida</p>
            <div className="p-4 bg-primary-light rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Warehouse className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-primary tracking-wide">
                    ESTOQUE LUCENERA
                  </p>
                  <p className="text-sm text-foreground mt-1">{ENDERECO_ESTOQUE.completo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <p className="field-label mb-3">Entregas do Dia ({orderedDeliveries.length})</p>
            <div className="space-y-3">
              {orderedDeliveries.map((delivery, index) => (
                <div
                  key={delivery.id}
                  className="p-4 bg-card border rounded-xl flex items-start gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{delivery.cliente}</p>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{delivery.endereco}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Código: {delivery.codigo_obra}
                    </p>
                  </div>
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 p-6 pt-4 border-t bg-background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={handleOpenGoogleMaps}
              className="h-12 bg-primary hover:bg-primary-dark"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Google Maps
            </Button>
            <Button
              onClick={handleOpenWaze}
              variant="outline"
              className="h-12 border-primary text-primary hover:bg-primary-light"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Waze
            </Button>
            <Button
              onClick={handleCopyList}
              variant="outline"
              className="h-12"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-success" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Lista
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="h-12"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
