import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Shield, AlertCircle, UserPlus, LogIn, Eye, EyeOff, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import { useSecureInput, validationRules } from '@/hooks/useSecureInput';
import { logSuspiciousActivity } from '@/utils/securityLogger';
import { supabase } from '@/integrations/supabase/client';

const LoginPage = () => {
  const [step, setStep] = useState<'email' | 'password' | 'sso'>('email');
  const [ssoProvider, setSsoProvider] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [knownEmail, setKnownEmail] = useState('');

  const { login, signup, isLoading } = useAuth();

  // Secure input hooks
  const emailInput = useSecureInput({ validation: validationRules.email });
  const passwordInput = useSecureInput({ validation: validationRules.password });
  const nameInput = useSecureInput({ validation: validationRules.name });
  const jobTitleInput = useSecureInput({ validation: { maxLength: 100 } });

  // Rate limiting
  const isRateLimited = attemptCount >= 5 && Date.now() - lastAttempt > 300000;

  useEffect(() => {
    if (attemptCount > 0 && Date.now() - lastAttempt > 300000) {
      setAttemptCount(0);
    }
  }, [attemptCount, lastAttempt]);

  const handleEmailStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailInput.isValid) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsSubmitting(true);
    const email = emailInput.value;
    const domain = email.split('@')[1];

    try {
      // 1. Check for SSO Configuration via RPC
      const { data, error } = await supabase.rpc('get_sso_provider', { domain_name: domain });

      if (data && data.exists) {
        console.log('🏢 Domínio SSO detectado:', data.provider);
        setSsoProvider(data);
        setStep('sso');
        setKnownEmail(email);
      } else {
        // No SSO, proceed to password
        setStep('password');
        setKnownEmail(email);
        // Focus password field logic could go here
      }
    } catch (err) {
      console.error('Erro ao verificar SSO:', err);
      // Fallback to password if check fails
      setStep('password');
      setKnownEmail(email);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSsoLogin = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithSSO({
        domain: ssoProvider.domain || knownEmail.split('@')[1],
        providerId: ssoProvider.azure_tenant, // Optional depending on provider
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError('Erro ao iniciar login SSO: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) return;

    if (!passwordInput.isValid) {
      setError('Senha inválida.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Check Lockout before attempting (Client-side pre-check, server enforces clearly)
      // Note: The AuthContext or RPC usually handles this, but we can do a quick check if needed.
      // For now, rely on login() to throw if locked.

      await login(knownEmail, passwordInput.value);
      setAttemptCount(0);
    } catch (err: any) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      setLastAttempt(Date.now());
      // Use RPC to log failure if not handled by context? 
      // Context Optimized handleLogin normally does logging.
      setError('Credenciais inválidas ou conta bloqueada.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const resetFlow = () => {
    setStep('email');
    setError('');
    setSsoProvider(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center flex flex-col items-center">
          <div className="flex justify-center mb-0 text-center items-center flex-col">
            <img src="/logo-login.png?v=4" alt="GEPRIV Logo" className="h-[150px] sm:h-[200px] w-auto object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png?v=4'; }} />
          </div>
          <p className="mt-1 text-sm sm:text-base font-semibold text-muted-foreground">Governança, Risco e Conformidade</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <CardTitle>Acesso Corporativo</CardTitle>
            <CardDescription>
              Faça login para acessar suas ferramentas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {step === 'email' && (
                <form onSubmit={handleEmailStep} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@empresa.com"
                      value={emailInput.value}
                      onChange={e => emailInput.onChange(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || !emailInput.value}>
                    {isSubmitting ? 'Verificando...' : 'Continuar'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      <span>{knownEmail}</span>
                      <button type="button" onClick={resetFlow} className="text-primary hover:underline text-xs">Alterar</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput.value}
                        onChange={e => passwordInput.onChange(e.target.value)}
                        autoFocus
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              )}

              {step === 'sso' && (
                <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
                  <div className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <Building2 className="h-10 w-10 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Login Corporativo Identificado</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Sua organização utiliza login único ({ssoProvider.provider}).
                    </p>
                  </div>

                  <Button onClick={handleSsoLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                    Entrar com {ssoProvider.provider === 'azure' ? 'Microsoft' : ssoProvider.provider === 'google' ? 'Google' : 'SSO'}
                  </Button>

                  <Button variant="ghost" onClick={resetFlow} className="text-xs text-muted-foreground">
                    Voltar e usar outra conta
                  </Button>
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;