import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { Shield, AlertCircle, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { useSecureInput, validationRules } from '@/hooks/useSecureInput';
import { logSuspiciousActivity } from '@/utils/securityLogger';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const {
    login,
    signup,
    isLoading
  } = useAuth();

  // Secure input hooks
  const emailInput = useSecureInput({
    validation: validationRules.email
  });
  const passwordInput = useSecureInput({
    validation: validationRules.password
  });
  const nameInput = useSecureInput({
    validation: validationRules.name
  });
  const jobTitleInput = useSecureInput({
    validation: {
      maxLength: 100
    }
  });

  // Rate limiting
  const isRateLimited = attemptCount >= 5 && Date.now() - lastAttempt < 300000; // 5 minutes

  useEffect(() => {
    // Reset rate limiting after 5 minutes
    if (attemptCount > 0 && Date.now() - lastAttempt > 300000) {
      setAttemptCount(0);
    }
  }, [attemptCount, lastAttempt]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpar erro anterior
    
    console.log('🔐 Tentativa de login iniciada:', {
      email: emailInput.value,
      isRateLimited,
      isValid: emailInput.isValid && passwordInput.isValid
    });
    
    if (isRateLimited) {
      setError('Muitas tentativas de login. Tente novamente em 5 minutos.');
      await logSuspiciousActivity('rate_limit_exceeded', {
        attempts: attemptCount,
        email: emailInput.value
      });
      return;
    }
    
    if (!emailInput.isValid || !passwordInput.isValid) {
      setError('Por favor, verifique os dados inseridos.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🔐 Chamando função de login...');
      await login(emailInput.value, passwordInput.value);
      console.log('✅ Login realizado com sucesso!');
      setAttemptCount(0); // Reset on success
      setError('');
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      setLastAttempt(Date.now());
      
      // Definir mensagem de erro mais específica
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login.');
      } else if (err.message?.includes('Too many requests')) {
        setError('Muitas tentativas. Tente novamente em alguns minutos.');
      } else {
        setError(err.message || 'Erro ao fazer login. Tente novamente.');
      }
      
      if (newAttemptCount >= 3) {
        await logSuspiciousActivity('multiple_failed_logins', {
          attempts: newAttemptCount,
          email: emailInput.value
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpar erro anterior
    
    if (!emailInput.isValid || !passwordInput.isValid || !nameInput.isValid) {
      setError('Por favor, verifique os dados inseridos.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(emailInput.value, passwordInput.value, nameInput.value, jobTitleInput.value);

      // Reset form and show success
      emailInput.reset();
      passwordInput.reset();
      nameInput.reset();
      jobTitleInput.reset();
      setIsSignup(false);
      setError('');
    } catch (err: any) {
      console.error('❌ Erro no signup:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">GRC Controller</h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">Gestão de Governança, Riscos e Compliance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso à Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            {(isRateLimited || error) && <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isRateLimited ? 'Muitas tentativas de login. Tente novamente em 5 minutos.' : error}
                </AlertDescription>
              </Alert>}

            <Tabs value={isSignup ? 'signup' : 'login'} onValueChange={value => setIsSignup(value === 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Registro
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="seu@email.com" value={emailInput.value} onChange={e => emailInput.onChange(e.target.value)} disabled={isSubmitting || isRateLimited} className={emailInput.error ? 'border-red-500' : ''} required />
                    {emailInput.error && <p className="text-sm text-red-600">{emailInput.error}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="********" value={passwordInput.value} onChange={e => passwordInput.onChange(e.target.value)} disabled={isSubmitting || isRateLimited} className={passwordInput.error ? 'border-red-500' : ''} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" disabled={isSubmitting}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordInput.error && <p className="text-sm text-red-600">{passwordInput.error}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting || isLoading || isRateLimited || !emailInput.isValid || !passwordInput.isValid}>
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>

                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input id="signup-name" type="text" placeholder="Seu nome completo" value={nameInput.value} onChange={e => nameInput.onChange(e.target.value)} disabled={isSubmitting} className={nameInput.error ? 'border-red-500' : ''} required />
                    {nameInput.error && <p className="text-sm text-red-600">{nameInput.error}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-job">Cargo (opcional)</Label>
                    <Input id="signup-job" type="text" placeholder="Seu cargo" value={jobTitleInput.value} onChange={e => jobTitleInput.onChange(e.target.value)} disabled={isSubmitting} className={jobTitleInput.error ? 'border-red-500' : ''} />
                    {jobTitleInput.error && <p className="text-sm text-red-600">{jobTitleInput.error}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="seu@email.com" value={emailInput.value} onChange={e => emailInput.onChange(e.target.value)} disabled={isSubmitting} className={emailInput.error ? 'border-red-500' : ''} required />
                    {emailInput.error && <p className="text-sm text-red-600">{emailInput.error}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={passwordInput.value} onChange={e => passwordInput.onChange(e.target.value)} disabled={isSubmitting} className={passwordInput.error ? 'border-red-500' : ''} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" disabled={isSubmitting}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordInput.error && <p className="text-sm text-red-600">{passwordInput.error}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting || isLoading || !emailInput.isValid || !passwordInput.isValid || !nameInput.isValid}>
                    {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>


      </div>
    </div>;
};
export default LoginPage;