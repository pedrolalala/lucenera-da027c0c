import { useState } from 'react';
import { AlertTriangle, Search, CheckCircle2, X, Phone, MapPin, User, Calendar, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEntregasPendentes } from '@/hooks/useEntregasPendentes';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TIPO_PROBLEMA_LABELS: Record<string, string> = {
  falta_material: '🔴 Falta de material/peça',
  material_defeito: '🔴 Material com defeito',
  cliente_ausente: '🔴 Cliente ausente',
  endereco_incorreto: '🔴 Endereço incorreto/não encontrado',
  acesso_bloqueado: '🔴 Acesso bloqueado à obra',
  problema_tecnico: '🔴 Problema técnico na instalação',
  outros: '🔴 Outros',
};

export default function PendentesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { pendentes, isLoading, resolvePendencia } = useEntregasPendentes();
  const { user } = useAuth();

  const filteredPendentes = pendentes.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.cliente.toLowerCase().includes(query) ||
      p.codigo_obra.toLowerCase().includes(query)
    );
  });

  const handleResolve = async (id: string) => {
    if (!user) return;
    if (window.confirm('Confirma que esta pendência foi resolvida?')) {
      await resolvePendencia(id, user.email || 'admin');
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="sticky top-16 z-40 bg-red-50 border-b border-red-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-red-700">Entregas Pendentes</h1>
                  <p className="text-sm text-red-600">Entregas com problemas ou impedimentos</p>
                </div>
              </div>
              {pendentes.length > 0 && (
                <Badge className="bg-red-500 text-white text-lg px-4 py-1">
                  {pendentes.length} {pendentes.length === 1 ? 'pendência' : 'pendências'}
                </Badge>
              )}
            </div>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
              <Input
                type="text"
                placeholder="Buscar por cliente ou obra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-red-200 focus:border-red-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredPendentes.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma pendência encontrada
            </h3>
            <p className="text-muted-foreground">
              Todas as entregas estão em dia! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPendentes.map((pendencia) => (
              <Card key={pendencia.id} className="border-l-[6px] border-l-red-500 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <span className="text-red-600">#{pendencia.codigo_obra}</span>
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          PENDENTE
                        </Badge>
                      </CardTitle>
                      <p className="text-base font-medium text-foreground mt-1">
                        {pendencia.cliente}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleResolve(pendencia.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Resolver
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Motivo da Pendência */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-bold uppercase text-red-700">
                        Motivo da Pendência
                      </span>
                    </div>
                    <p className="text-base font-semibold text-red-800 mb-1">
                      {TIPO_PROBLEMA_LABELS[pendencia.tipo_problema] || pendencia.tipo_problema}
                    </p>
                    <p className="text-sm text-red-700">
                      {pendencia.descricao_problema}
                    </p>
                  </div>

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
                        Registrado em {format(parseISO(pendencia.data_registro), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  {/* Fotos */}
                  {pendencia.fotos_urls && pendencia.fotos_urls.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                        Fotos do problema ({pendencia.fotos_urls.length})
                      </p>
                      <div className="flex gap-2 overflow-x-auto">
                        {pendencia.fotos_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Foto ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                    <span>Registrado por: {pendencia.registrado_por}</span>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {pendencia.status_pendencia === 'aguardando_resolucao' ? 'Aguardando resolução' : 'Em análise'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
