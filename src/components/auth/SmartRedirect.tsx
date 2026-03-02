import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

/**
 * Redirects users to their appropriate home page based on role.
 * - entregador → /otimizar-rota
 * - admin/user → /separacao
 */
export function SmartRedirect() {
  const { isEntregador, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isEntregador) {
    return <Navigate to="/otimizar-rota" replace />;
  }

  return <Navigate to="/separacao" replace />;
}
