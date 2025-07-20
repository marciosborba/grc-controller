import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Brain, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à plataforma Controller GRC."
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const demoAccounts = [
    { email: 'admin@grc.com', role: 'CISO', name: 'Ana Silva' },
    { email: 'risk@grc.com', role: 'Chief Risk Officer', name: 'Carlos Santos' },
    { email: 'compliance@grc.com', role: 'Compliance Officer', name: 'Maria Costa' },
    { email: 'auditor@grc.com', role: 'Internal Auditor', name: 'João Oliveira' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 grc-hero-gradient">
        <div className="max-w-md text-center text-white">
          <div className="mb-8">
            <Shield className="h-20 w-20 mx-auto mb-4 grc-shadow-glow" />
            <h1 className="text-4xl font-bold mb-4">Controller GRC</h1>
            <p className="text-xl opacity-90">
              Plataforma de próxima geração para Governança, Riscos e Compliance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <Brain className="h-8 w-8" />
              <div className="text-left">
                <h3 className="font-semibold">IA Integrada</h3>
                <p className="text-sm opacity-80">Análise preditiva e automação inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <Target className="h-8 w-8" />
              <div className="text-left">
                <h3 className="font-semibold">Gestão de Riscos</h3>
                <p className="text-sm opacity-80">Identificação proativa e mitigação</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <Users className="h-8 w-8" />
              <div className="text-left">
                <h3 className="font-semibold">Colaboração</h3>
                <p className="text-sm opacity-80">Workflows inteligentes e em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Acesso à Plataforma</h2>
            <p className="mt-2 text-muted-foreground">
              Entre com suas credenciais para acessar o Controller GRC
            </p>
          </div>

          <Card className="grc-card">
            <CardHeader>
              <h3 className="text-lg font-semibold">Login</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full grc-button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="grc-card bg-warning/5 border-warning/30">
            <CardHeader>
              <h3 className="text-lg font-semibold text-warning">⚡ Contas de Demonstração</h3>
              <p className="text-sm text-muted-foreground">
                <strong className="text-warning">SENHA PARA TODAS AS CONTAS: demo123</strong><br/>
                Clique em uma conta abaixo para preencher automaticamente:
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('demo123');
                    }}
                    className="text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm">{account.name}</div>
                    <div className="text-xs text-muted-foreground">{account.role}</div>
                    <div className="text-xs text-primary">{account.email}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;