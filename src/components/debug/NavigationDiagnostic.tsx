/**
 * NAVIGATION DIAGNOSTIC - Componente para diagnosticar problemas de navegação
 * 
 * Monitora e reporta problemas de navegação e autenticação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Loader2, 
  RefreshCw,
  Bug,
  Info,
  Navigation,
  User,
  Wifi,
  WifiOff
} from 'lucide-react';

interface DiagnosticData {
  timestamp: string;
  auth: {
    isAuthenticated: boolean;
    userId: string | null;
    sessionExists: boolean;
    sessionExpiry: string | null;
    lastAuthChange: string | null;
  };
  navigation: {
    currentPath: string;
    previousPath: string | null;
    navigationCount: number;
    lastNavigationTime: string | null;
  };
  network: {
    isOnline: boolean;
    lastConnectionCheck: string | null;
    supabaseConnected: boolean;
  };
  performance: {
    renderCount: number;
    lastRenderTime: string | null;
    memoryUsage: number | null;
  };
}

const NavigationDiagnostic: React.FC = () => {
  const { user, session, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [renderCount, setRenderCount] = useState(0);
  const [lastAuthChange, setLastAuthChange] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitorar renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Monitorar mudanças de rota
  useEffect(() => {
    const currentPath = location.pathname;
    setNavigationHistory(prev => {
      const newHistory = [...prev, `${new Date().toISOString()}: ${currentPath}`];
      return newHistory.slice(-10); // Manter apenas os últimos 10
    });
  }, [location.pathname]);

  // Monitorar mudanças de auth
  useEffect(() => {
    if (user) {
      setLastAuthChange(new Date().toISOString());
    }
  }, [user]);

  // Monitorar status de rede
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    
    try {
      // Testar conexão com Supabase
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const supabaseConnected = !healthError;
      
      // Verificar sessão atual
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      // Obter informações de memória (se disponível)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || null;
      
      const diagnostic: DiagnosticData = {
        timestamp: new Date().toISOString(),
        auth: {
          isAuthenticated: !!user,
          userId: user?.id || null,
          sessionExists: !!currentSession && !sessionError,
          sessionExpiry: currentSession?.expires_at || null,
          lastAuthChange
        },
        navigation: {
          currentPath: location.pathname,
          previousPath: navigationHistory[navigationHistory.length - 2]?.split(': ')[1] || null,
          navigationCount: navigationHistory.length,
          lastNavigationTime: navigationHistory[navigationHistory.length - 1]?.split(': ')[0] || null
        },
        network: {
          isOnline,
          lastConnectionCheck: new Date().toISOString(),
          supabaseConnected
        },
        performance: {
          renderCount,
          lastRenderTime: new Date().toISOString(),
          memoryUsage
        }
      };
      
      setDiagnosticData(diagnostic);
      console.log('🔍 [NAVIGATION DIAGNOSTIC] Dados coletados:', diagnostic);
      
    } catch (error) {
      console.error('❌ [NAVIGATION DIAGNOSTIC] Erro:', error);
      toast.error('Erro ao executar diagnóstico');
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const testNavigation = (path: string) => {
    console.log(`🧪 [NAVIGATION TEST] Testando navegação para: ${path}`);
    navigate(path);
    toast.info(`Navegando para ${path}`);
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Bug className="h-5 w-5" />
            Diagnóstico de Navegação
            <Badge className="bg-blue-200 text-blue-800">
              Debug Tool
            </Badge>
          </CardTitle>
          <p className="text-blue-700">
            Ferramenta para diagnosticar problemas de navegação e logout automático
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={runDiagnostic}
              disabled={isRunningDiagnostic}
              className="flex items-center gap-2"
            >
              {isRunningDiagnostic ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunningDiagnostic ? 'Executando...' : 'Executar Diagnóstico'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setNavigationHistory([])}
            >
              Limpar Histórico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Status Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!user)}
              <span className="text-sm">
                Autenticado: {user ? 'Sim' : 'Não'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(!!session)}
              <span className="text-sm">
                Sessão: {session ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(isOnline)}
              {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              <span className="text-sm">
                Rede: {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(!isLoading)}
              <span className="text-sm">
                Loading: {isLoading ? 'Sim' : 'Não'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Rota Atual:</strong> {location.pathname}
            </div>
            <div>
              <strong>Renders:</strong> {renderCount}
            </div>
            <div>
              <strong>Usuário ID:</strong> {user?.id || 'N/A'}
            </div>
            <div>
              <strong>Navegações:</strong> {navigationHistory.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testes de Navegação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Testes de Navegação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testNavigation('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testNavigation('/assessments')}
            >
              Assessments
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testNavigation('/risks')}
            >
              Riscos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              // onClick={() => testNavigation('/compliance')} - removido
            >
              Compliance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Navegação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Navegação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {navigationHistory.length > 0 ? (
              navigationHistory.map((entry, index) => (
                <div key={index} className="text-xs text-gray-600 font-mono">
                  {entry}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma navegação registrada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dados do Diagnóstico */}
      {diagnosticData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Resultado do Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Autenticação */}
              <div>
                <h4 className="font-semibold mb-2">Autenticação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticData.auth.isAuthenticated)}
                    <span>Autenticado: {diagnosticData.auth.isAuthenticated ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticData.auth.sessionExists)}
                    <span>Sessão Válida: {diagnosticData.auth.sessionExists ? 'Sim' : 'Não'}</span>
                  </div>
                  <div>
                    <span>User ID: {diagnosticData.auth.userId || 'N/A'}</span>
                  </div>
                  <div>
                    <span>Expira em: {diagnosticData.auth.sessionExpiry ? new Date(diagnosticData.auth.sessionExpiry).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Rede */}
              <div>
                <h4 className="font-semibold mb-2">Conectividade</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticData.network.isOnline)}
                    <span>Online: {diagnosticData.network.isOnline ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnosticData.network.supabaseConnected)}
                    <span>Supabase: {diagnosticData.network.supabaseConnected ? 'Conectado' : 'Desconectado'}</span>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div>
                <h4 className="font-semibold mb-2">Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span>Renders: {diagnosticData.performance.renderCount}</span>
                  </div>
                  <div>
                    <span>Navegações: {diagnosticData.navigation.navigationCount}</span>
                  </div>
                  <div>
                    <span>Memória: {diagnosticData.performance.memoryUsage ? `${Math.round(diagnosticData.performance.memoryUsage / 1024 / 1024)}MB` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="pt-4 border-t text-xs text-gray-500">
                Diagnóstico executado em: {new Date(diagnosticData.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NavigationDiagnostic;