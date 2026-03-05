import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, Truck, LogOut, User, Route, CalendarDays, Shield, AlertTriangle, KeyRound, ChevronDown } from 'lucide-react';
import luceneraHorizontal from '@/assets/logos/lucenera-horizontal.png';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

interface AppLayoutProps {
  children: ReactNode;
}

const allNavItems = [
  {
    label: 'Separação',
    href: '/separacao',
    icon: Package,
    hideForEntregador: true,
  },
  {
    label: 'Calendário',
    href: '/calendario',
    icon: CalendarDays,
    hideForEntregador: true,
  },
  {
    label: 'Pendentes',
    href: '/pendentes',
    icon: AlertTriangle,
    highlight: true,
    hideForEntregador: true,
  },
  {
    label: 'Registrar',
    href: '/registrar-entrega',
    icon: Truck,
  },
  {
    label: 'Finalizadas',
    href: '/entregas-finalizadas',
    icon: CheckCircle2,
  },
  {
    label: 'Rota',
    href: '/otimizar-rota',
    icon: Route,
  },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, isEntregador, userRole, userName } = useUserRole();
  const { toast } = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você foi desconectado com sucesso.',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src={luceneraHorizontal} 
                alt="Lucenera" 
                className="h-7 sm:h-9 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {allNavItems
                .filter(item => !(isEntregador && item.hideForEntregador))
                .map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                      isActive
                        ? item.highlight 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-primary-light text-primary-dark'
                        : item.highlight
                          ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn('w-4 h-4', item.highlight && 'text-red-500')} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Admin Link - only for admins */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    location.pathname.startsWith('/admin')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[120px] truncate">
                      {userName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-0">
                  <div className="p-4 space-y-1">
                    <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-muted text-muted-foreground">
                      {userRole?.role === 'admin' ? '🛡️ Administrador' : userRole?.role === 'entregador' ? '🚚 Entregador' : '👤 Usuário'}
                    </span>
                  </div>
                  <Separator />
                  <div className="p-1.5">
                    <button
                      onClick={() => setShowChangePassword(true)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-foreground"
                    >
                      <KeyRound className="w-4 h-4" />
                      Alterar senha
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-destructive/10 transition-colors text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
