import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

const QuickAIManagerTest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const testNavigation = () => {
    console.log('🧪 [QUICK TEST] === TESTE RÁPIDO DE NAVEGAÇÃO ===');
    console.log('📍 [QUICK TEST] Localização atual:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    });
    console.log('👤 [QUICK TEST] Usuário:', {
      id: user?.id,
      isPlatformAdmin: user?.isPlatformAdmin,
      roles: user?.roles
    });
    
    console.log('🚀 [QUICK TEST] Executando navigate("/ai-management")');
    navigate('/ai-management');
    console.log('✅ [QUICK TEST] Comando navigate executado');
    
    // Verificar após um tempo
    setTimeout(() => {
      console.log('🔍 [QUICK TEST] Verificação pós-navegação:', {
        windowPathname: window.location.pathname,
        locationPathname: location.pathname,
        expectedPath: '/ai-management',
        success: window.location.pathname === '/ai-management'
      });
    }, 1000);
  };

  // Só mostrar se o usuário for platform admin
  if (!user?.isPlatformAdmin) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={testNavigation}
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        size="sm"
      >
        <Brain className="h-4 w-4 mr-2" />
        Teste AI Manager
      </Button>
    </div>
  );
};

export default QuickAIManagerTest;