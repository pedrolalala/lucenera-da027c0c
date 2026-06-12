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
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
  ArrowRightLeft,
  AlertTriangle,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  description: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_META: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  created: { label: 'Criação', color: 'bg-blue-100 text-blue-700', icon: <Package className="w-4 h-4" /> },
  status_changed: { label: 'Status', color: 'bg-orange-100 text-orange-700', icon: <ArrowRightLeft className="w-4 h-4" /> },
  updated: { label: 'Edição', color: 'bg-amber-100 text-amber-700', icon: <Pencil className="w-4 h-4" /> },
  deleted: { label: 'Exclusão', color: 'bg-red-100 text-red-700', icon: <Trash2 className="w-4 h-4" /> },
  delivered: { label: 'Entrega', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  reverted: { label: 'Reversão', color: 'bg-purple-100 text-purple-700', icon: <ArrowRightLeft className="w-4 h-4" /> },
  pendency_created: { label: 'Pendência', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-4 h-4" /> },
  pendency_status_changed: { label: 'Pendência', color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-4 h-4" /> },
};

function metaFor(action: string) {
  return ACTION_META[action] || { label: action, color: 'bg-gray-100 text-gray-700', icon: <ClipboardList className="w-4 h-4" /> };
}

export default function AdminLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as ActivityLog[];
    },
  });

  const filteredLogs = logs?.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      log.description.toLowerCase().includes(term) ||
      log.user_email?.toLowerCase().includes(term) ||
      log.entity_label?.toLowerCase().includes(term);
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const counts = {
    total: logs?.length || 0,
    created: logs?.filter((l) => l.action === 'created').length || 0,
    status: logs?.filter((l) => l.action === 'status_changed').length || 0,
    delivered: logs?.filter((l) => l.action === 'delivered').length || 0,
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-700">Logs de Auditoria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico detalhado de todas as ações dos usuários
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.total}</p>
              <p className="text-xs text-muted-foreground">Total registros</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.created}</p>
              <p className="text-xs text-muted-foreground">Criações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.status}</p>
              <p className="text-xs text-muted-foreground">Mudanças de Status</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{counts.delivered}</p>
              <p className="text-xs text-muted-foreground">Entregas finalizadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição, usuário ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="created">Criação</SelectItem>
                <SelectItem value="status_changed">Mudança de status</SelectItem>
                <SelectItem value="updated">Edição</SelectItem>
                <SelectItem value="deleted">Exclusão</SelectItem>
                <SelectItem value="delivered">Entrega finalizada</SelectItem>
                <SelectItem value="reverted">Reversão</SelectItem>
                <SelectItem value="pendency_created">Pendência criada</SelectItem>
                <SelectItem value="pendency_status_changed">Pendência atualizada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="separacao">Separação</SelectItem>
                <SelectItem value="entrega">Entrega</SelectItem>
                <SelectItem value="pendencia">Pendência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Histórico de Atividades
            <Badge variant="secondary" className="ml-2">{filteredLogs?.length || 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs?.map((log) => {
                const meta = metaFor(log.action);
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{log.description}</p>
                        <Badge className={meta.color}>{meta.label}</Badge>
                        {log.entity_label && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {log.entity_label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">{log.user_email || 'Sistema'}</span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1 font-mono break-all">
                          {Object.entries(log.details)
                            .map(([k, v]) => `${k}: ${v ?? '-'}`)
                            .join(' • ')}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(log.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
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