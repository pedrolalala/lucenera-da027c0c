import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import luceneraVertical from '@/assets/logos/lucenera-vertical.png';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [shake, setShake] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || '/separacao';

  const validateForm = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setPassword('');

        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Email ou senha incorretos',
            description: 'Verifique suas credenciais e tente novamente.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro de conexão',
            description: 'Verifique sua internet e tente novamente.',
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
        className: 'bg-success text-success-foreground border-none',
      });

      navigate(from, { replace: true });
    } catch (err) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary-light px-4">
      <div
        className={cn(
          'w-full max-w-[420px] bg-card rounded-2xl shadow-lg p-8 sm:p-12 transition-all',
          shake && 'animate-shake'
        )}
      >
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <img 
            src={luceneraVertical} 
            alt="Lucenera" 
            className="w-[140px] sm:w-[180px] h-auto mx-auto mb-3"
          />
          <p className="text-muted-foreground text-sm">Sistema de Entregas</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu.email@lucenera.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateForm()}
                disabled={isLoading}
                className={cn(
                  'h-14 pl-12 text-base border-2 rounded-xl',
                  errors.email ? 'border-destructive' : 'border-border'
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validateForm()}
                disabled={isLoading}
                className={cn(
                  'h-14 pl-12 pr-12 text-base border-2 rounded-xl',
                  errors.password ? 'border-destructive' : 'border-border'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="#"
              className="text-sm text-primary hover:underline font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-base font-bold rounded-xl bg-primary hover:bg-primary-dark shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        {/* Help Text */}
        <p className="text-center mt-6 text-xs text-muted-foreground">
          Acesso restrito a funcionários Lucenera
        </p>
      </div>
    </div>
  );
}
