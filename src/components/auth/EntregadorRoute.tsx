import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface EntregadorRouteProps {
  children: ReactNode;
  /** Routes allowed only for non-entregador users */
  blockEntregador?: boolean;
}

/**
 * Blocks entregador users from accessing internal routes.
 * Redirects them to /otimizar-rota (their home page).
 */
export function EntregadorRoute({ children, blockEntregador = true }: EntregadorRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isEntregador, isLoading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (blockEntregador && isEntregador) {
    return <Navigate to="/otimizar-rota" replace />;
  }

  return <>{children}</>;
}
