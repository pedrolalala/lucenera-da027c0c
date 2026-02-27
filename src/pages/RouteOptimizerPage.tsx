import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Truck, 
  Calendar, 
  ArrowLeft, 
  Navigation2, 
  Timer,
  AlertCircle,
  Route,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeparacoes, Separacao } from '@/hooks/useSeparacoes';
import { useOptimizeRoute, OptimizedRouteResult } from '@/hooks/useOptimizeRoute';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ESTOQUE_LUCENERA = 'R. Dr. Hugo Fortes, 1010 - Ribeirão Preto, SP';

export default function RouteOptimizerPage() {
  const navigate = useNavigate();
  const { separacoes, isLoading } = useSeparacoes();
  const { optimizeRoute, isOptimizing } = useOptimizeRoute();
  const [optimizedResult, setOptimizedResult] = useState<OptimizedRouteResult | null>(null);

  // Filter today's deliveries
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todaysDeliveries = useMemo(() => {
    return separacoes.filter(s => s.data_entrega === todayStr && s.status === 'separado');
  }, [separacoes, todayStr]);

  // Sort deliveries: scheduled first (by time), then flexible
  const sortedDeliveries = useMemo(() => {
    if (optimizedResult) {
      // Use optimized order
      const orderMap = new Map(
        optimizedResult.rota_otimizada.map(item => [item.id, item.ordem])
      );
      return [...todaysDeliveries].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? 999;
        const orderB = orderMap.get(b.id) ?? 999;
        return orderA - orderB;
      });
    }

    // Default sort: scheduled first by time, then flexible
    return [...todaysDeliveries].sort((a, b) => {
      const aScheduled = a.delivery_type === 'scheduled';
      const bScheduled = b.delivery_type === 'scheduled';
      
      if (aScheduled && !bScheduled) return -1;
      if (!aScheduled && bScheduled) return 1;
      
      if (aScheduled && bScheduled) {
        return (a.scheduled_time || '').localeCompare(b.scheduled_time || '');
      }
      
      return 0;
    });
  }, [todaysDeliveries, optimizedResult]);

  const scheduledCount = todaysDeliveries.filter(d => d.delivery_type === 'scheduled').length;
  const flexibleCount = todaysDeliveries.filter(d => d.delivery_type === 'flexible').length;

  const handleOptimize = async () => {
    const result = await optimizeRoute(ESTOQUE_LUCENERA, todaysDeliveries);
    if (result) {
      setOptimizedResult(result);
    }
  };

  const openInGoogleMaps = () => {
    const addresses = sortedDeliveries.map(d => encodeURIComponent(d.endereco));
    const origin = encodeURIComponent(ESTOQUE_LUCENERA);
    const destination = addresses[addresses.length - 1];
    const waypoints = addresses.slice(0, -1).join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getOptimizedInfo = (deliveryId: string) => {
    if (!optimizedResult) return null;
    return optimizedResult.rota_otimizada.find(item => item.id === deliveryId);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/separacao')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Route className="w-6 h-6 text-primary" />
                    Otimizador de Rota
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {sortedDeliveries.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={openInGoogleMaps}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir no Maps
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Route List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Origin Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <Navigation2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Ponto de Partida
                    </p>
                    <p className="font-semibold text-blue-900">Estoque Lucenera</p>
                    <p className="text-sm text-blue-700">{ESTOQUE_LUCENERA}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-card rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{todaysDeliveries.length}</p>
                  <p className="text-xs text-muted-foreground">Entregas</p>
                </div>
                <div className="bg-card rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-orange-500">{scheduledCount}</p>
                  <p className="text-xs text-muted-foreground">Hora Marcada</p>
                </div>
                <div className="bg-card rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-blue-500">{flexibleCount}</p>
                  <p className="text-xs text-muted-foreground">Flexíveis</p>
                </div>
              </div>

              {/* Optimized Metrics */}
              {optimizedResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                    Métricas da Rota
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-green-700">Distância:</span>
                      <span className="font-bold text-green-900 ml-1">
                        {optimizedResult.metricas.distancia_total_km.toFixed(1)} km
                      </span>
                    </div>
                    <div>
                      <span className="text-green-700">Tempo total:</span>
                      <span className="font-bold text-green-900 ml-1">
                        {Math.floor(optimizedResult.metricas.tempo_total_min / 60)}h {optimizedResult.metricas.tempo_total_min % 60}min
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-green-700">Previsão de término:</span>
                      <span className="font-bold text-green-900 ml-1">
                        {optimizedResult.metricas.horario_conclusao}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Optimize Button */}
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing || todaysDeliveries.length === 0}
                className="w-full h-14 bg-success hover:bg-success-dark text-success-foreground font-semibold"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Otimizando...
                  </>
                ) : (
                  <>
                    <Route className="w-5 h-5 mr-2" />
                    Otimizar Rota com IA
                  </>
                )}
              </Button>

              {/* Deliveries List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Entregas Ordenadas
                </h3>
                
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                ) : sortedDeliveries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma entrega para hoje</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate('/separacao')}
                      className="mt-2"
                    >
                      Ver todas as separações
                    </Button>
                  </div>
                ) : (
                  sortedDeliveries.map((delivery, index) => {
                    const optimizedInfo = getOptimizedInfo(delivery.id);
                    const isScheduled = delivery.delivery_type === 'scheduled';
                    
                    return (
                      <div
                        key={delivery.id}
                        className={`
                          rounded-xl border-2 p-4 transition-all
                          ${isScheduled 
                            ? 'bg-orange-50 border-orange-200' 
                            : 'bg-card border-border'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* Order Badge */}
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg
                            ${isScheduled 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-blue-500 text-white'
                            }
                          `}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold truncate">{delivery.cliente}</p>
                              {isScheduled && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 shrink-0">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {delivery.scheduled_time?.slice(0, 5)} FIXO
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{delivery.endereco}</span>
                            </p>
                            
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {delivery.codigo_obra}
                            </p>

                            {/* Optimized info */}
                            {optimizedInfo && (
                              <div className="flex items-center gap-3 mt-2 text-xs text-green-600">
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  Chegada: {optimizedInfo.horario_chegada}
                                </span>
                                <span>
                                  ~{optimizedInfo.tempo_deslocamento_min} min
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main - Map Placeholder */}
            <div className="lg:col-span-2">
              <div className="bg-muted rounded-2xl h-[600px] flex flex-col items-center justify-center text-muted-foreground">
                <MapPin className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Mapa será integrado com Google Maps API</p>
                <p className="text-sm mt-2">
                  Por enquanto, use o botão "Abrir no Maps" para visualizar a rota
                </p>
              </div>

              {/* Justification */}
              {optimizedResult && (
                <div className="mt-4 bg-card rounded-xl border p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    Justificativa da Otimização
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {optimizedResult.justificativa}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
