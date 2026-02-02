import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, ShieldX } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-muted-foreground max-w-md">
            Você não tem permissão para acessar o painel administrativo.
            Entre em contato com um administrador se acredita que isso é um erro.
          </p>
          <a 
            href="/separacao" 
            className="mt-4 text-primary hover:underline"
          >
            ← Voltar ao sistema
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
