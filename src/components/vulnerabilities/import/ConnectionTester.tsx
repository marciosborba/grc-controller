import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Wifi,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { ConnectionConfig, ConnectionTestResult, ImportSource } from './types/import';

interface ConnectionTesterProps {
  source: ImportSource;
  config: ConnectionConfig;
  onTestComplete?: (result: ConnectionTestResult) => void;
}

interface TestStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  error?: string;
  details?: Record<string, any>;
}

export default function ConnectionTester({ source, config, onTestComplete }: ConnectionTesterProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [overallResult, setOverallResult] = useState<ConnectionTestResult | null>(null);

  const initializeTestSteps = (): TestStep[] => {
    const baseSteps: TestStep[] = [
      {
        id: 'connectivity',
        name: 'Conectividade',
        description: 'Verificando se o endpoint está acessível',
        status: 'pending'
      },
      {
        id: 'authentication',
        name: 'Autenticação',
        description: 'Validando credenciais de acesso',
        status: 'pending'
      },
      {
        id: 'permissions',
        name: 'Permissões',
        description: 'Verificando permissões de acesso aos dados',
        status: 'pending'
      },
      {
        id: 'data_access',
        name: 'Acesso aos Dados',
        description: 'Testando acesso aos dados de vulnerabilidades',
        status: 'pending'
      }
    ];

    // Adicionar steps específicos por ferramenta
    if (source.type.includes('nessus')) {
      baseSteps.push({
        id: 'scan_access',
        name: 'Acesso aos Scans',
        description: 'Verificando acesso à lista de scans',
        status: 'pending'
      });
    } else if (source.type.includes('qualys')) {
      baseSteps.push({
        id: 'asset_access',
        name: 'Acesso aos Ativos',
        description: 'Verificando acesso à lista de ativos',
        status: 'pending'
      });
    } else if (source.type.includes('sonarqube')) {
      baseSteps.push({
        id: 'project_access',
        name: 'Acesso aos Projetos',
        description: 'Verificando acesso aos projetos',
        status: 'pending'
      });
    }

    return baseSteps;
  };

  const runConnectionTest = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setOverallResult(null);
    
    const steps = initializeTestSteps();
    setTestSteps(steps);

    const startTime = Date.now();
    let allStepsSuccessful = true;

    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        
        // Atualizar status do step atual
        setTestSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'running' } : step
        ));

        const stepStartTime = Date.now();
        
        try {
          await runTestStep(steps[i], config);
          
          const stepDuration = Date.now() - stepStartTime;
          
          setTestSteps(prev => prev.map((step, index) => 
            index === i ? { 
              ...step, 
              status: 'success', 
              duration: stepDuration 
            } : step
          ));
        } catch (error) {
          allStepsSuccessful = false;
          const stepDuration = Date.now() - stepStartTime;
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          
          setTestSteps(prev => prev.map((step, index) => 
            index === i ? { 
              ...step, 
              status: 'error', 
              duration: stepDuration,
              error: errorMessage
            } : step
          ));
          
          // Para no primeiro erro crítico
          if (steps[i].id === 'connectivity' || steps[i].id === 'authentication') {
            break;
          }
        }
      }

      const totalDuration = Date.now() - startTime;
      
      const result: ConnectionTestResult = {
        success: allStepsSuccessful,
        message: allStepsSuccessful 
          ? 'Conexão testada com sucesso!' 
          : 'Falha em alguns testes de conexão',
        details: {
          response_time: totalDuration,
          api_version: await getApiVersion(config),
          available_endpoints: await getAvailableEndpoints(config),
          rate_limits: await getRateLimits(config)
        }
      };

      setOverallResult(result);
      onTestComplete?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const result: ConnectionTestResult = {
        success: false,
        message: 'Falha na conexão',
        error: errorMessage
      };
      
      setOverallResult(result);
      onTestComplete?.(result);
    } finally {
      setIsRunning(false);
    }
  };

  const runTestStep = async (step: TestStep, config: ConnectionConfig): Promise<void> => {
    // Simular delay realista
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    switch (step.id) {
      case 'connectivity':
        await testConnectivity(config);
        break;
      case 'authentication':
        await testAuthentication(config);
        break;
      case 'permissions':
        await testPermissions(config);
        break;
      case 'data_access':
        await testDataAccess(config);
        break;
      case 'scan_access':
        await testScanAccess(config);
        break;
      case 'asset_access':
        await testAssetAccess(config);
        break;
      case 'project_access':
        await testProjectAccess(config);
        break;
      default:
        throw new Error(`Teste não implementado: ${step.id}`);
    }
  };

  const testConnectivity = async (config: ConnectionConfig): Promise<void> => {
    if (!config.api_url) {
      throw new Error('URL da API não configurada');
    }

    // Simular teste de conectividade
    const isReachable = Math.random() > 0.1; // 90% de sucesso
    if (!isReachable) {
      throw new Error('Endpoint não está acessível');
    }
  };

  const testAuthentication = async (config: ConnectionConfig): Promise<void> => {
    if (source.authType === 'api_key' && !config.api_key) {
      throw new Error('API Key não configurada');
    }
    
    if (source.authType === 'basic_auth' && (!config.username || !config.password)) {
      throw new Error('Usuário ou senha não configurados');
    }

    if (source.authType === 'token' && !config.token) {
      throw new Error('Token não configurado');
    }

    // Simular teste de autenticação
    const isAuthenticated = Math.random() > 0.15; // 85% de sucesso
    if (!isAuthenticated) {
      throw new Error('Credenciais inválidas');
    }
  };

  const testPermissions = async (config: ConnectionConfig): Promise<void> => {
    // Simular teste de permissões
    const hasPermissions = Math.random() > 0.2; // 80% de sucesso
    if (!hasPermissions) {
      throw new Error('Usuário não tem permissões suficientes');
    }
  };

  const testDataAccess = async (config: ConnectionConfig): Promise<void> => {
    // Simular teste de acesso aos dados
    const hasDataAccess = Math.random() > 0.1; // 90% de sucesso
    if (!hasDataAccess) {
      throw new Error('Não foi possível acessar os dados de vulnerabilidades');
    }
  };

  const testScanAccess = async (config: ConnectionConfig): Promise<void> => {
    const hasAccess = Math.random() > 0.15; // 85% de sucesso
    if (!hasAccess) {
      throw new Error('Não foi possível acessar a lista de scans');
    }
  };

  const testAssetAccess = async (config: ConnectionConfig): Promise<void> => {
    const hasAccess = Math.random() > 0.15; // 85% de sucesso
    if (!hasAccess) {
      throw new Error('Não foi possível acessar a lista de ativos');
    }
  };

  const testProjectAccess = async (config: ConnectionConfig): Promise<void> => {
    const hasAccess = Math.random() > 0.15; // 85% de sucesso
    if (!hasAccess) {
      throw new Error('Não foi possível acessar os projetos');
    }
  };

  const getApiVersion = async (config: ConnectionConfig): Promise<string> => {
    // Simular obtenção da versão da API
    const versions = ['v1.0', 'v2.1', 'v3.0', '2023.1'];
    return versions[Math.floor(Math.random() * versions.length)];
  };

  const getAvailableEndpoints = async (config: ConnectionConfig): Promise<string[]> => {
    // Simular obtenção dos endpoints disponíveis
    const endpoints = ['/scans', '/vulnerabilities', '/assets', '/reports'];
    return endpoints;
  };

  const getRateLimits = async (config: ConnectionConfig): Promise<Record<string, any>> => {
    // Simular obtenção dos rate limits
    return {
      requests_per_minute: 100,
      requests_per_hour: 1000,
      concurrent_requests: 5
    };
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground"></div>;
    }
  };

  const getStepBadgeColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progress = testSteps.length > 0 ? (currentStep / testSteps.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Teste de Conexão
          </CardTitle>
          <CardDescription>
            Verificar conectividade e permissões com {source.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Endpoint: {config.api_url}</p>
              <p className="text-xs text-muted-foreground">
                Autenticação: {source.authType || 'Nenhuma'}
              </p>
            </div>
            <Button 
              onClick={runConnectionTest} 
              disabled={isRunning || !config.api_url}
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso do teste</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {testSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Etapas do Teste</CardTitle>
            <CardDescription>
              Progresso detalhado de cada etapa do teste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{step.name}</p>
                      <Badge className={getStepBadgeColor(step.status)}>
                        {step.status === 'pending' && 'Pendente'}
                        {step.status === 'running' && 'Executando'}
                        {step.status === 'success' && 'Sucesso'}
                        {step.status === 'error' && 'Erro'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.error && (
                      <p className="text-sm text-red-600 mt-1">{step.error}</p>
                    )}
                  </div>
                  
                  {step.duration && (
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {step.duration}ms
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {overallResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {overallResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Resultado do Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              {overallResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                <p className="font-medium">{overallResult.message}</p>
                {overallResult.error && (
                  <p className="text-sm mt-1">{overallResult.error}</p>
                )}
              </AlertDescription>
            </Alert>

            {overallResult.details && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{overallResult.details.response_time}ms</p>
                  <p className="text-xs text-muted-foreground">Tempo de Resposta</p>
                </div>
                
                {overallResult.details.api_version && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{overallResult.details.api_version}</p>
                    <p className="text-xs text-muted-foreground">Versão da API</p>
                  </div>
                )}
                
                {overallResult.details.available_endpoints && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{overallResult.details.available_endpoints.length}</p>
                    <p className="text-xs text-muted-foreground">Endpoints</p>
                  </div>
                )}
                
                {overallResult.details.rate_limits && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{overallResult.details.rate_limits.requests_per_minute}</p>
                    <p className="text-xs text-muted-foreground">Req/min</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}