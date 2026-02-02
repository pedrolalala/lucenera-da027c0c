import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'user';
  nome_completo: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useUserRole() {
  const { user } = useAuth();

  const { data: userRole, isLoading, error } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data as UserRole;
    },
    enabled: !!user?.id,
  });

  return {
    userRole,
    isAdmin: userRole?.role === 'admin',
    isUser: userRole?.role === 'user',
    isLoading,
    error,
    userName: userRole?.nome_completo || user?.email?.split('@')[0] || 'Usuário',
  };
}
