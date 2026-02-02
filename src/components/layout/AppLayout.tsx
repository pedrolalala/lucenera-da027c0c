import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, Truck, LogOut, User, Route, CalendarDays, Shield } from 'lucide-react';
import luceneraHorizontal from '@/assets/logos/lucenera-horizontal.png';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    label: 'Separação',
    href: '/separacao',
    icon: Package,
  },
  {
    label: 'Calendário',
    href: '/calendario',
    icon: CalendarDays,
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
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

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
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Admin Link - only for admins */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
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
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                  {user?.email?.split('@')[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
