import { useState, useEffect } from 'react';
import { 
  Warehouse, 
  MapPin, 
  GripVertical, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check,
  Sparkles,
  Clock,
  Route,
  Timer,
  Flag,
  Loader2,
  Hand
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ENDERECO_ESTOQUE } from '@/lib/constants';
import { Separacao } from '@/hooks/useSeparacoes';
import { useOptimizeRoute, OptimizedDelivery, RouteMetrics } from '@/hooks/useOptimizeRoute';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  deliveries: Separacao[];
}

export function CreateRouteModal({ isOpen, onClose, date, deliveries }: CreateRouteModalProps) {
  const [orderedDeliveries, setOrderedDeliveries] = useState<(Separacao & Partial<OptimizedDelivery>)[]>([]);
  const [copied, setCopied] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null);
  const [justificativa, setJustificativa] = useState<string>('');
  const [startTime, setStartTime] = useState('08:00');
  const [timePerDelivery, setTimePerDelivery] = useState(30);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { optimizeRoute, isOptimizing } = useOptimizeRoute();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrderedDeliveries(deliveries.map((d, i) => ({ ...d, ordem: i + 1 })));
      setIsOptimized(false);
      setMetrics(null);
      setJustificativa('');
    }
  }, [isOpen, deliveries]);

  const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const handleOptimize = async () => {
    const result = await optimizeRoute(
      ENDERECO_ESTOQUE.completo,
      deliveries,
      startTime,
      timePerDelivery
    );

    if (result) {
      // Map optimized results back to deliveries
      const optimizedMap = new Map(result.rota_otimizada.map(r => [r.id, r]));
      const newOrder = result.rota_otimizada.map(r => {
        const original = deliveries.find(d => d.id === r.id);
        return original ? { ...original, ...r } : null;
      }).filter(Boolean) as (Separacao & Partial<OptimizedDelivery>)[];

      setOrderedDeliveries(newOrder);
      setMetrics(result.metricas);
      setJustificativa(result.justificativa);
      setIsOptimized(true);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...orderedDeliveries];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);

    // Update ordem numbers
    newOrder.forEach((item, i) => {
      item.ordem = i + 1;
    });

    setOrderedDeliveries(newOrder);
    setDraggedIndex(index);
    setIsOptimized(false); // Mark as manually ordered
    setMetrics(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const generateGoogleMapsUrl = () => {
    const origin = encodeURIComponent(ENDERECO_ESTOQUE.completo);
    
    if (orderedDeliveries.length === 0) return '';

    const destination = encodeURIComponent(orderedDeliveries[orderedDeliveries.length - 1].endereco);
    const waypoints = orderedDeliveries.length > 1
      ? `&waypoints=${orderedDeliveries.slice(0, -1).map(d => encodeURIComponent(d.endereco)).join('|')}`
      : '';

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
  };

  const generateWazeUrl = () => {
    if (orderedDeliveries.length === 0) return '';
    const destination = encodeURIComponent(orderedDeliveries[0].endereco);
    return `https://waze.com/ul?q=${destination}&navigate=yes`;
  };

  const handleCopyList = () => {
    const header = isOptimized 
      ? `ROTA DE ENTREGAS - ${capitalizedDate}\nOtimizada com IA • ${orderedDeliveries.length} entregas${metrics ? ` • ${metrics.distancia_total_km.toFixed(1)} km • Conclusão: ${metrics.horario_conclusao}` : ''}`
      : `ROTA DE ENTREGAS - ${capitalizedDate}\n${orderedDeliveries.length} entregas`;

    const text = [
      header,
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      `🏭 SAÍDA (${startTime})`,
      'Estoque Lucenera',
      ENDERECO_ESTOQUE.completo,
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      ...orderedDeliveries.flatMap((d, i) => [
        `${['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][i] || `${i + 1}.`} ENTREGA ${i + 1}${d.horario_chegada ? ` - Chegada ~${d.horario_chegada}` : ''}`,
        `Cliente: ${d.cliente}`,
        `Endereço: ${d.endereco}`,
        `Código: ${d.codigo_obra}`,
        `Contato: ${d.responsavel_recebimento} • ${d.telefone}`,
        `Tempo na obra: ${timePerDelivery} min`,
        '',
      ]),
      metrics ? `🏁 RETORNO AO ESTOQUE - Chegada ~${metrics.horario_conclusao}` : '',
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

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Criar Rota Otimizada - {capitalizedDate}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {orderedDeliveries.length} entregas agendadas
              </p>
            </div>
            {isOptimized && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-light text-success-dark text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Otimização com IA
              </span>
            )}
          </div>
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

          {/* Route Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="field-label">Horário de Saída</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setIsOptimized(false);
                }}
                className="h-12 mt-1"
              />
            </div>
            <div>
              <Label className="field-label">Tempo por Entrega (min)</Label>
              <Input
                type="number"
                value={timePerDelivery}
                onChange={(e) => {
                  setTimePerDelivery(parseInt(e.target.value) || 30);
                  setIsOptimized(false);
                }}
                min={5}
                max={120}
                className="h-12 mt-1"
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || orderedDeliveries.length === 0}
              className={cn(
                "h-12 gap-2",
                isOptimized 
                  ? "bg-success hover:bg-success-dark" 
                  : "bg-success hover:bg-success-dark"
              )}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Otimizando...
                </>
              ) : isOptimized ? (
                <>
                  <Check className="w-4 h-4" />
                  Rota Otimizada
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Otimizar Rota com IA
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOptimized(false);
                setMetrics(null);
              }}
              className="h-12 gap-2"
            >
              <Hand className="w-4 h-4" />
              Ordenar Manualmente
            </Button>
          </div>

          {/* Destinations */}
          <div>
            <p className="field-label mb-3">Entregas do Dia ({orderedDeliveries.length})</p>
            <div className="space-y-3">
              {orderedDeliveries.map((delivery, index) => (
                <div
                  key={delivery.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "p-4 bg-card border rounded-xl flex items-start gap-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                    draggedIndex === index && "opacity-50 scale-[0.98]"
                  )}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm",
                    isOptimized ? "bg-success" : "bg-primary"
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{delivery.cliente}</p>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {delivery.codigo_obra}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{delivery.endereco}</p>
                    </div>
                    
                    {/* Metrics (shown after optimization) */}
                    {isOptimized && delivery.distancia_anterior_km !== undefined && (
                      <div className="flex flex-wrap gap-3 mt-2 text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Route className="w-3.5 h-3.5" />
                          {delivery.distancia_anterior_km?.toFixed(1)} km
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Timer className="w-3.5 h-3.5" />
                          ~{delivery.tempo_deslocamento_min} min
                        </span>
                        <span className="inline-flex items-center gap-1 text-warning font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {timePerDelivery} min na obra
                        </span>
                        {delivery.horario_chegada && (
                          <span className="inline-flex items-center gap-1 text-primary font-semibold">
                            <Flag className="w-3.5 h-3.5" />
                            Chegada: {delivery.horario_chegada}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Summary (after optimization) */}
          {isOptimized && metrics && (
            <div className="p-6 bg-success-light rounded-xl border-l-4 border-success">
              <h4 className="font-semibold text-success-dark mb-4">Resumo da Rota</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs uppercase font-semibold text-success-dark opacity-70">
                    Distância Total
                  </p>
                  <p className="text-xl font-bold text-success-dark">
                    {metrics.distancia_total_km.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-success-dark opacity-70">
                    Tempo em Trânsito
                  </p>
                  <p className="text-xl font-bold text-success-dark">
                    {formatMinutes(metrics.tempo_transito_min)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-warning opacity-70">
                    Tempo de Entrega
                  </p>
                  <p className="text-xl font-bold text-warning">
                    {formatMinutes(metrics.tempo_entregas_min)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-primary opacity-70">
                    Conclusão Estimada
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {metrics.horario_conclusao}
                  </p>
                </div>
              </div>
              {justificativa && (
                <p className="text-xs text-success-dark/70 mt-4 italic">
                  * {justificativa}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 p-6 pt-4 border-t bg-background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => window.open(generateGoogleMapsUrl(), '_blank')}
              className="h-12 bg-primary hover:bg-primary-dark"
              disabled={orderedDeliveries.length === 0}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Google Maps
            </Button>
            <Button
              onClick={() => window.open(generateWazeUrl(), '_blank')}
              variant="outline"
              className="h-12 border-primary text-primary hover:bg-primary-light"
              disabled={orderedDeliveries.length === 0}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Waze
            </Button>
            <Button
              onClick={handleCopyList}
              variant="outline"
              className="h-12"
              disabled={orderedDeliveries.length === 0}
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
