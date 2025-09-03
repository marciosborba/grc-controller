import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, LogIn, Key, Copy, Check } from 'lucide-react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

export function DevAuthHelper() {
  const { user, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState(false);

  // Se usuário já está logado, não mostrar nada
  if (user) {
    return null;
  }

  const handleDevLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login('dev@grc.local', 'dev123456');
    } catch (error) {
      console.error('Erro no login de desenvolvimento:', error);
      setShowCredentials(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const copyCredentials = () => {
    const credentials = 'Email: dev@grc.local\nSenha: dev123456';
    navigator.clipboard.writeText(credentials);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Modo Desenvolvimento:</strong> Para acessar os dados dos submódulos LGPD, você precisa estar autenticado.
        </AlertDescription>
      </Alert>

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Key className="w-5 h-5" />
            Acesso de Desenvolvimento
          </CardTitle>
          <CardDescription>
            Use as credenciais abaixo para testar os submódulos LGPD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCredentials ? (
            <Button 
              onClick={handleDevLogin}
              disabled={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Fazendo login...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login Automático de Desenvolvimento
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Credenciais de Desenvolvimento:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Email:</strong> dev@grc.local</p>
                  <p><strong>Senha:</strong> dev123456</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCredentials}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Credenciais
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/login'}
                  size="sm"
                  className="flex-1"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Ir para Login
                </Button>
              </div>
            </div>
          )}
          
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800 text-xs">
              <strong>Nota:</strong> Este usuário foi criado automaticamente para desenvolvimento. 
              Em produção, use credenciais apropriadas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}