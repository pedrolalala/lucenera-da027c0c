import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList, 
  Search,
  Package,
  CheckCircle2,
  UserPlus,
  Settings,
  Pencil,
  Trash2,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  type: 'separacao_created' | 'entrega_finished' | 'separacao_updated' | 'separacao_deleted';
  message: string;
  timestamp: Date;
  details?: string;
}

export default function AdminLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch activity logs from separacoes and entregas
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const [separacoesRes, entregasRes] = await Promise.all([
        supabase
          .from('separacoes')
          .select('id, cliente, codigo_obra, created_at, status, updated_at')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('entregas_finalizadas')
          .select('id, cliente, codigo_obra, data_entrega_real, recebido_por')
          .order('data_entrega_real', { ascending: false })
          .limit(50),
      ]);

      const activities: ActivityLog[] = [];

      // Map separacoes to activities
      separacoesRes.data?.forEach(s => {
        activities.push({
          id: `sep-${s.id}`,
          type: 'separacao_created',
          message: `Separação criada: ${s.cliente}`,
          timestamp: new Date(s.created_at),
          details: `Obra: ${s.codigo_obra} | Status: ${s.status}`,
        });
      });

      // Map entregas to activities
      entregasRes.data?.forEach(e => {
        activities.push({
          id: `ent-${e.id}`,
          type: 'entrega_finished',
          message: `Entrega finalizada: ${e.cliente}`,
          timestamp: new Date(e.data_entrega_real),
          details: `Obra: ${e.codigo_obra} | Recebido por: ${e.recebido_por}`,
        });
      });

      // Sort by timestamp descending
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
  });

  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'separacao_created':
        return <Package className="w-4 h-4" />;
      case 'entrega_finished':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'separacao_updated':
        return <Pencil className="w-4 h-4" />;
      case 'separacao_deleted':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'separacao_created':
        return 'bg-blue-100 text-blue-600';
      case 'entrega_finished':
        return 'bg-green-100 text-green-600';
      case 'separacao_updated':
        return 'bg-orange-100 text-orange-600';
      case 'separacao_deleted':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeBadge = (type: ActivityLog['type']) => {
    switch (type) {
      case 'separacao_created':
        return <Badge className="bg-blue-100 text-blue-700">Separação</Badge>;
      case 'entrega_finished':
        return <Badge className="bg-green-100 text-green-700">Entrega</Badge>;
      case 'separacao_updated':
        return <Badge className="bg-orange-100 text-orange-700">Atualização</Badge>;
      case 'separacao_deleted':
        return <Badge className="bg-red-100 text-red-700">Exclusão</Badge>;
      default:
        return <Badge variant="secondary">Sistema</Badge>;
    }
  };

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-700">
            Logs de Auditoria
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico de atividades do sistema
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {logs?.filter(l => l.type === 'separacao_created').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Separações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {logs?.filter(l => l.type === 'entrega_finished').length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Entregas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Logs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredLogs?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Filtrados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="separacao_created">Separações criadas</SelectItem>
                <SelectItem value="entrega_finished">Entregas finalizadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs?.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(log.type)}`}>
                    {getIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{log.message}</p>
                      {getTypeBadge(log.type)}
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(log.timestamp, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
              {!filteredLogs?.length && (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
