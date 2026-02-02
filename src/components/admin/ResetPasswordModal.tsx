import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Copy, 
  Check,
  AlertTriangle,
  Loader2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    user_id: string;
    email: string;
    nome_completo: string | null;
  } | null;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  criteria: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

function calculatePasswordStrength(password: string): PasswordStrength {
  const criteria = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metCriteria = Object.values(criteria).filter(Boolean).length;
  const score = (metCriteria / 5) * 100;

  let label: string;
  let color: string;

  if (score <= 40) {
    label = 'Fraca';
    color = 'bg-destructive';
  } else if (score <= 70) {
    label = 'Média';
    color = 'bg-orange-500';
  } else {
    label = 'Forte';
    color = 'bg-green-500';
  }

  return { score, label, color, criteria };
}

function generateStrongPassword(): string {
  const prefixes = ['Lucenera', 'Entrega', 'Sistema', 'Acesso'];
  const year = new Date().getFullYear();
  const symbols = ['!', '@', '#', '$', '%', '&', '*'];
  const alphanumeric = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    suffix += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  
  return `${prefix}${year}${symbol}${suffix}`;
}

export function ResetPasswordModal({ isOpen, onClose, user }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const passwordStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValidPassword = newPassword.length >= 8 && passwordsMatch;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setCopied(false);
    }
  }, [isOpen]);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não selecionado');

      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId: user.user_id,
          newPassword,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      // Copy password to clipboard
      navigator.clipboard.writeText(newPassword).then(() => {
        toast.success('Senha redefinida com sucesso!', {
          description: `Senha de ${user?.nome_completo || user?.email} alterada e copiada para área de transferência.`,
        });
      }).catch(() => {
        toast.success('Senha redefinida com sucesso!', {
          description: `Comunique ${user?.nome_completo || user?.email} sobre a nova senha.`,
        });
      });
      onClose();
    },
    onError: (error: Error) => {
      toast.error('Erro ao redefinir senha', {
        description: error.message,
      });
    },
  });

  const handleGeneratePassword = () => {
    const password = generateStrongPassword();
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Senha copiada!');
    } catch {
      toast.error('Erro ao copiar senha');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-500">
            <Key className="w-5 h-5" />
            Redefinir Senha
          </DialogTitle>
          <DialogDescription>
            Usuário: {user?.nome_completo || 'Sem nome'} ({user?.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info Card */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {(user?.nome_completo || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{user?.nome_completo || user?.email?.split('@')[0]}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wide">
              Nova Senha
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite a nova senha (mín. 8 caracteres)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(
                    "pl-10 pr-10 h-14",
                    newPassword.length > 0 && (
                      passwordStrength.score <= 40 ? "border-destructive" :
                      passwordStrength.score <= 70 ? "border-orange-500" : "border-green-500"
                    )
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-14 px-4"
                onClick={handleGeneratePassword}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Gerar
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", passwordStrength.color)}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    passwordStrength.score <= 40 ? "text-destructive" :
                    passwordStrength.score <= 70 ? "text-orange-500" : "text-green-500"
                  )}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className={passwordStrength.criteria.minLength ? "text-green-600" : "text-muted-foreground"}>
                    {passwordStrength.criteria.minLength ? "✓" : "○"} Mínimo 8 caracteres
                  </span>
                  <span className={passwordStrength.criteria.hasUppercase ? "text-green-600" : "text-muted-foreground"}>
                    {passwordStrength.criteria.hasUppercase ? "✓" : "○"} Letra maiúscula
                  </span>
                  <span className={passwordStrength.criteria.hasLowercase ? "text-green-600" : "text-muted-foreground"}>
                    {passwordStrength.criteria.hasLowercase ? "✓" : "○"} Letra minúscula
                  </span>
                  <span className={passwordStrength.criteria.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                    {passwordStrength.criteria.hasNumber ? "✓" : "○"} Número
                  </span>
                  <span className={passwordStrength.criteria.hasSpecial ? "text-green-600" : "text-muted-foreground"}>
                    {passwordStrength.criteria.hasSpecial ? "✓" : "○"} Caractere especial
                  </span>
                </div>
              </div>
            )}

            {/* Copy Button */}
            {newPassword.length >= 8 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleCopyPassword}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Senha Copiada!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Senha
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wide">
              Confirmar Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "pl-10 pr-10 h-14",
                  confirmPassword.length > 0 && (
                    passwordsMatch ? "border-green-500" : "border-destructive"
                  )
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={cn(
                "text-sm",
                passwordsMatch ? "text-green-600" : "text-destructive"
              )}>
                {passwordsMatch ? "✓ Senhas coincidem" : "✗ Senhas não coincidem"}
              </p>
            )}
          </div>

          {/* Security Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Aviso de Segurança</p>
              <p>O usuário precisará fazer login novamente com a nova senha. Comunique a mudança.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!isValidPassword || resetPasswordMutation.isPending}
            onClick={() => resetPasswordMutation.mutate()}
          >
            {resetPasswordMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redefinindo...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Redefinir Senha
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
