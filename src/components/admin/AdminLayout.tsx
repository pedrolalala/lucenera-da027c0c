import { ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Code2, 
  ClipboardList,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    exact: true,
  },
  {
    title: 'Usuários',
    icon: Users,
    path: '/admin/usuarios',
    badge: 'count',
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/admin/configuracoes',
  },
  {
    title: 'Desenvolvimento',
    icon: Code2,
    path: '/admin/desenvolvimento',
    badge: 'DEV',
    badgeColor: 'bg-yellow-500',
  },
  {
    title: 'Logs de Auditoria',
    icon: ClipboardList,
    path: '/admin/logs',
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  
  const { data: userCount } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-purple-700 text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Lucenera</h2>
            <span className="text-[11px] uppercase tracking-wider font-bold text-purple-200 bg-purple-600/50 px-2 py-0.5 rounded">
              Admin Panel
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 mx-3 px-4 py-3 rounded-lg transition-all',
                'text-white/80 hover:bg-white/10',
                active && 'bg-white/20 text-white border-l-4 border-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
              {item.badge === 'count' && userCount !== undefined && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {userCount}
                </span>
              )}
              {item.badge && item.badge !== 'count' && (
                <span className={cn(
                  'ml-auto text-[10px] font-bold px-2 py-0.5 rounded',
                  item.badgeColor || 'bg-purple-500'
                )}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="outline"
          asChild
          className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white"
        >
          <NavLink to="/separacao" onClick={onNavigate}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Sistema
          </NavLink>
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userName } = useUserRole();

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 shadow-xl">
        <div className="fixed w-64 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-purple-700 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
