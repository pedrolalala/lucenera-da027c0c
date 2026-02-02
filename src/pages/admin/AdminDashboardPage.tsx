import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  CheckCircle2, 
  Server,
  UserPlus,
  PackagePlus,
  Calendar,
  Settings,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { userName } = useUserRole();
  const navigate = useNavigate();
  const now = new Date();

  // Fetch stats
  const { data: userCount } = useQuery({
    queryKey: ['admin-stats-users'],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: separacoesCount } = useQuery({
    queryKey: ['admin-stats-separacoes'],
    queryFn: async () => {
      const { count } = await supabase
        .from('separacoes')
        .select('*', { count: 'exact', head: true })
        .in('status', ['separando', 'pronto']);
      return count || 0;
    },
  });

  const { data: entregasCount } = useQuery({
    queryKey: ['admin-stats-entregas'],
    queryFn: async () => {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase
        .from('entregas_finalizadas')
        .select('*', { count: 'exact', head: true })
        .gte('data_entrega_real', startOfMonth);
      return count || 0;
    },
  });

  // Recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ['admin-recent-activities'],
    queryFn: async () => {
      const { data: separacoes } = await supabase
        .from('separacoes')
        .select('id, cliente, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: entregas } = await supabase
        .from('entregas_finalizadas')
        .select('id, cliente, data_entrega_real')
        .order('data_entrega_real', { ascending: false })
        .limit(5);

      const activities = [
        ...(separacoes?.map(s => ({
          type: 'separacao' as const,
          message: `Separação criada: ${s.cliente}`,
          timestamp: new Date(s.created_at),
          icon: Package,
          color: 'text-blue-500',
        })) || []),
        ...(entregas?.map(e => ({
          type: 'entrega' as const,
          message: `Entrega finalizada: ${e.cliente}`,
          timestamp: new Date(e.data_entrega_real),
          icon: CheckCircle2,
          color: 'text-green-500',
        })) || []),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

      return activities;
    },
  });

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Agora';
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days === 1) return 'Ontem';
    return format(date, "dd/MM 'às' HH:mm");
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-700">
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo, {userName}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(now, "EEEE, dd 'de' MMMM 'de' yyyy - HH:mm", { locale: ptBR })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-purple-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/usuarios')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Cadastrados</p>
                <p className="text-4xl font-bold text-purple-700">{userCount ?? '-'}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2 hover:underline">Ver todos →</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/separacao')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Separações Pendentes</p>
                <p className="text-4xl font-bold text-blue-600">{separacoesCount ?? '-'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2 hover:underline">Ver separações →</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregas do Mês</p>
                <p className="text-4xl font-bold text-green-600">{entregasCount ?? '-'}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {format(now, 'MMMM', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status do Sistema</p>
                <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Server className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Uptime: 99.9%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 ${activity.color}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {!recentActivities?.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma atividade recente
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/admin/logs')}
              >
                Ver todos os logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/admin/usuarios')}
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-xs">Adicionar Usuário</span>
            </Button>
            <Button 
              className="h-auto py-4 flex flex-col gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/separacao')}
            >
              <PackagePlus className="w-5 h-5" />
              <span className="text-xs">Nova Separação</span>
            </Button>
            <Button 
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/calendario')}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Ver Calendário</span>
            </Button>
            <Button 
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/admin/configuracoes')}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Configurações</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
