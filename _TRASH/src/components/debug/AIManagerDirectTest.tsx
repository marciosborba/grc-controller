import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Navigation, User, Shield } from 'lucide-react';

const AIManagerDirectTest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const testDirectNavigation = () => {
    console.log('🧪 [DIRECT TEST] === TESTE DE NAVEGAÇÃO DIRETA ===');
    console.log('👤 [DIRECT TEST] Usuário atual:', {
      id: user?.id,
      isPlatformAdmin: user?.isPlatformAdmin,
      roles: user?.roles,
      permissions: user?.permissions
    });
    
    console.log('🚀 [DIRECT TEST] Executando navigate("/admin/ai-management")');
    navigate('/admin/ai-management');
    console.log('✅ [DIRECT TEST] Comando navigate executado');
  };

  const testWindowLocation = () => {
    console.log('🧪 [WINDOW TEST] === TESTE COM WINDOW.LOCATION ===');
    console.log('🚀 [WINDOW TEST] Executando window.location.href = "/admin/ai-management"');
    window.location.href = '/admin/ai-management';
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Teste Direto de Navegação - AI Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Status do Usuário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>ID: {user?.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Platform Admin: {user?.isPlatformAdmin ? '✅ Sim' : '❌ Não'}</span>
              </div>
              <div className="col-span-2">
                <span>Roles: {user?.roles?.join(', ') || 'Nenhuma'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Testes de Navegação</h3>
            
            <Button 
              onClick={testDirectNavigation}
              className="w-full flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Teste 1: navigate('/admin/ai-management')
            </Button>
            
            <Button 
              onClick={testWindowLocation}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Teste 2: window.location.href
            </Button>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">Instruções</h4>
            <ol className="text-yellow-700 text-sm space-y-1">
              <li>1. Abra o console do navegador (F12)</li>
              <li>2. Clique em um dos botões de teste</li>
              <li>3. Observe os logs no console</li>
              <li>4. Verifique se a navegação acontece</li>
              <li>5. Se redirecionar, veja para onde vai</li>
            </ol>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800 mb-2">URLs de Teste</h4>
            <div className="text-green-700 text-sm space-y-1">
              <div><strong>Destino:</strong> /admin/ai-management</div>
              <div><strong>Teste direto:</strong> <a href="/admin/ai-management" className="underline">/admin/ai-management</a></div>
              <div><strong>Teste debug:</strong> <a href="/admin/ai-debug" className="underline">/admin/ai-debug</a></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIManagerDirectTest;