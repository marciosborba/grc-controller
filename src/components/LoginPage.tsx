
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertCircle, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { useSecureInput, validationRules } from '@/hooks/useSecureInput';
import { logSuspiciousActivity } from '@/utils/securityLogger';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const { login, signup, isLoading } = useAuth();

  // Secure input hooks
  const emailInput = useSecureInput({ validation: validationRules.email });
  const passwordInput = useSecureInput({ validation: validationRules.password });
  const nameInput = useSecureInput({ validation: validationRules.name });
  const jobTitleInput = useSecureInput({ validation: { maxLength: 100 } });

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
    
    if (isRateLimited) {
      await logSuspiciousActivity('rate_limit_exceeded', { 
        attempts: attemptCount,
        email: emailInput.value 
      });
      return;
    }

    if (!emailInput.isValid || !passwordInput.isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(emailInput.value, passwordInput.value);
      setAttemptCount(0); // Reset on success
    } catch (err: any) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      setLastAttempt(Date.now());
      
      if (newAttemptCount >= 3) {
        await logSuspiciousActivity('multiple_failed_logins', {
          attempts: newAttemptCount,
          email: emailInput.value
        });
      }
      
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInput.isValid || !passwordInput.isValid || !nameInput.isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await signup(
        emailInput.value, 
        passwordInput.value, 
        nameInput.value, 
        jobTitleInput.value
      );
      
      // Reset form and show success
      emailInput.reset();
      passwordInput.reset();
      nameInput.reset();
      jobTitleInput.reset();
      setIsSignup(false);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    // Log demo account usage
    logSuspiciousActivity('demo_account_used', { demo_email: demoEmail });
    
    emailInput.onChange(demoEmail);
    passwordInput.onChange('demo123');
    setIsSignup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CyberGuard GRC</h1>
          <p className="text-gray-600 mt-2">Plataforma de Gestão de Riscos Cibernéticos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso à Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            {isRateLimited && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Muitas tentativas de login. Tente novamente em 5 minutos.
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={isSignup ? 'signup' : 'login'} onValueChange={(value) => setIsSignup(value === 'signup')}>
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
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={emailInput.value}
                      onChange={(e) => emailInput.onChange(e.target.value)}
                      disabled={isSubmitting || isRateLimited}
                      className={emailInput.error ? 'border-red-500' : ''}
                      required
                    />
                    {emailInput.error && (
                      <p className="text-sm text-red-600">{emailInput.error}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={passwordInput.value}
                        onChange={(e) => passwordInput.onChange(e.target.value)}
                        disabled={isSubmitting || isRateLimited}
                        className={passwordInput.error ? 'border-red-500' : ''}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordInput.error && (
                      <p className="text-sm text-red-600">{passwordInput.error}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || isLoading || isRateLimited || !emailInput.isValid || !passwordInput.isValid}
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={nameInput.value}
                      onChange={(e) => nameInput.onChange(e.target.value)}
                      disabled={isSubmitting}
                      className={nameInput.error ? 'border-red-500' : ''}
                      required
                    />
                    {nameInput.error && (
                      <p className="text-sm text-red-600">{nameInput.error}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-job">Cargo (opcional)</Label>
                    <Input
                      id="signup-job"
                      type="text"
                      placeholder="Seu cargo"
                      value={jobTitleInput.value}
                      onChange={(e) => jobTitleInput.onChange(e.target.value)}
                      disabled={isSubmitting}
                      className={jobTitleInput.error ? 'border-red-500' : ''}
                    />
                    {jobTitleInput.error && (
                      <p className="text-sm text-red-600">{jobTitleInput.error}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={emailInput.value}
                      onChange={(e) => emailInput.onChange(e.target.value)}
                      disabled={isSubmitting}
                      className={emailInput.error ? 'border-red-500' : ''}
                      required
                    />
                    {emailInput.error && (
                      <p className="text-sm text-red-600">{emailInput.error}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={passwordInput.value}
                        onChange={(e) => passwordInput.onChange(e.target.value)}
                        disabled={isSubmitting}
                        className={passwordInput.error ? 'border-red-500' : ''}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordInput.error && (
                      <p className="text-sm text-red-600">{passwordInput.error}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || isLoading || !emailInput.isValid || !passwordInput.isValid || !nameInput.isValid}
                  >
                    {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Para Demonstração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-600 mb-3">
              Use as contas demo abaixo ou registre uma nova conta. 
              <strong> Senha das contas demo: demo123</strong>
            </p>
            <div className="space-y-2">
              <button
                onClick={() => fillDemoAccount('admin@cyberguard.com')}
                className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border text-xs"
                disabled={isSubmitting || isRateLimited}
              >
                <div className="font-medium">admin@cyberguard.com</div>
                <div className="text-gray-600">Admin/CISO</div>
              </button>
              <button
                onClick={() => fillDemoAccount('risk@cyberguard.com')}
                className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border text-xs"
                disabled={isSubmitting || isRateLimited}
              >
                <div className="font-medium">risk@cyberguard.com</div>
                <div className="text-gray-600">Risk Manager</div>
              </button>
              <button
                onClick={() => fillDemoAccount('compliance@cyberguard.com')}
                className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border text-xs"
                disabled={isSubmitting || isRateLimited}
              >
                <div className="font-medium">compliance@cyberguard.com</div>
                <div className="text-gray-600">Compliance Officer</div>
              </button>
              <button
                onClick={() => fillDemoAccount('auditor@cyberguard.com')}
                className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border text-xs"
                disabled={isSubmitting || isRateLimited}
              >
                <div className="font-medium">auditor@cyberguard.com</div>
                <div className="text-gray-600">Auditor</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
