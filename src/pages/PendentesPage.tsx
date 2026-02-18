import { useState } from 'react';
import { AlertTriangle, Search, CheckCircle2, Phone, MapPin, User, Calendar, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEntregasPendentes } from '@/hooks/useEntregasPendentes';
import { useAuth } from '@/contexts/AuthContext';
import { SolvePendenciaModal } from '@/components/pendentes/SolvePendenciaModal';
import { EntregaPendente } from '@/types/separacao';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_PROBLEMA_LABELS: Record<string, string> = {
  falta_material: '🔴 Falta de material/peça',
  material_defeito: '🔴 Material com defeito',
  cliente_ausente: '🔴 Cliente ausente',
  endereco_incorreto: '🔴 Endereço incorreto/não encontrado',
  acesso_bloqueado: '🔴 Acesso bloqueado à obra',
  problema_tecnico: '🔴 Problema técnico na instalação',
  outros: '🔴 Outros',
};

function PendenciaCard({ pendencia, onSolveClick, isResolved }: {
  pendencia: EntregaPendente & { fotos_resolucao?: string[]; observacoes_resolucao?: string };
  onSolveClick?: () => void;
  isResolved?: boolean;
}) {
  return (
    <Card className={`border-l-[6px] shadow-lg ${isResolved ? 'border-l-success opacity-90' : 'border-l-destructive'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className={isResolved ? 'text-success' : 'text-destructive'}>
                #{pendencia.codigo_obra}
              </span>
              {isResolved ? (
                <Badge variant="outline" className="border-success text-success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  RESOLVIDA
                </Badge>
              ) : (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  PENDENTE
                </Badge>
              )}
            </CardTitle>
            <p className="text-base font-medium text-foreground mt-1">{pendencia.cliente}</p>
          </div>
          {!isResolved && onSolveClick && (
            <Button
              size="sm"
              onClick={onSolveClick}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Solucionar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Motivo da Pendência */}
        <div className="bg-destructive/10 border-2 border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-bold uppercase text-destructive">Motivo da Pendência</span>
          </div>
          <p className="text-base font-semibold text-destructive mb-1">
            {TIPO_PROBLEMA_LABELS[pendencia.tipo_problema] || pendencia.tipo_problema}
          </p>
          <p className="text-sm text-foreground">{pendencia.descricao_problema}</p>
        </div>

        {/* Resolução (se resolvida) */}
        {isResolved && pendencia.observacoes_resolucao && (
          <div className="bg-success/10 border-2 border-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-bold uppercase text-success">Como foi resolvido</span>
            </div>
            <p className="text-sm text-foreground">{pendencia.observacoes_resolucao}</p>
            {(pendencia as any).fotos_resolucao?.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {((pendencia as any).fotos_resolucao as string[]).map((url: string, i: number) => (
                  <img key={i} src={url} alt={`Comprovante ${i + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border shrink-0" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {pendencia.endereco && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">{pendencia.endereco}</span>
            </div>
          )}
          {pendencia.responsavel && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{pendencia.responsavel}</span>
            </div>
          )}
          {pendencia.telefone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{pendencia.telefone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(parseISO(pendencia.data_registro!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Fotos do problema */}
        {pendencia.fotos_urls && pendencia.fotos_urls.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
              Fotos do problema ({pendencia.fotos_urls.length})
            </p>
            <div className="flex gap-2 overflow-x-auto">
              {pendencia.fotos_urls.map((url, index) => (
                <img key={index} src={url} alt={`Foto ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border shrink-0" />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
          <span>Registrado por: <strong>{pendencia.registrado_por}</strong></span>
          {isResolved && pendencia.resolved_by && (
            <span className="flex items-center gap-1 text-success">
              <Clock className="w-3 h-3" />
              Resolvido por {pendencia.resolved_by}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PendentesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPendencia, setSelectedPendencia] = useState<EntregaPendente | null>(null);
  const { pendentes, resolvedPendentes, isLoading, refetch } = useEntregasPendentes();
  const { user } = useAuth();

  const filterList = (list: EntregaPendente[]) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(p =>
      p.cliente.toLowerCase().includes(query) ||
      p.codigo_obra.toLowerCase().includes(query)
    );
  };

  const filteredPendentes = filterList(pendentes);
  const filteredResolvidas = filterList(resolvedPendentes);

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-destructive/5 border-b border-destructive/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-destructive">Entregas Pendentes</h1>
                  <p className="text-sm text-muted-foreground">Entregas com problemas ou impedimentos</p>
                </div>
              </div>
              {pendentes.length > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-lg px-4 py-1">
                  {pendentes.length} {pendentes.length === 1 ? 'pendência' : 'pendências'}
                </Badge>
              )}
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por cliente ou obra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pendentes">
          <TabsList className="mb-6">
            <TabsTrigger value="pendentes" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Aguardando Resolução
              {pendentes.length > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                  {pendentes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolvidas" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Resolvidas
              {resolvedPendentes.length > 0 && (
                <span className="ml-1 bg-success text-success-foreground text-xs rounded-full px-2 py-0.5">
                  {resolvedPendentes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Aba Aguardando */}
          <TabsContent value="pendentes">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : filteredPendentes.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma pendência!</h3>
                <p className="text-muted-foreground">Todas as entregas estão em dia 🎉</p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredPendentes.map(p => (
                  <PendenciaCard
                    key={p.id}
                    pendencia={p}
                    onSolveClick={() => setSelectedPendencia(p)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aba Resolvidas */}
          <TabsContent value="resolvidas">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : filteredResolvidas.length === 0 ? (
              <div className="text-center py-16">
                <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma resolução ainda</h3>
                <p className="text-muted-foreground">Pendências solucionadas aparecerão aqui para auditoria.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredResolvidas.map(p => (
                  <PendenciaCard
                    key={p.id}
                    pendencia={p}
                    isResolved
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de resolução */}
      {selectedPendencia && (
        <SolvePendenciaModal
          isOpen={!!selectedPendencia}
          onClose={() => setSelectedPendencia(null)}
          pendencia={selectedPendencia}
          onSuccess={() => {
            setSelectedPendencia(null);
            refetch();
          }}
        />
      )}
    </AppLayout>
  );
}
