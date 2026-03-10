import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

const EthicsDiagnostic: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // Teste 1: Verificar se a tabela ethics_reports existe
    try {
      const { data, error } = await supabase
        .from('ethics_reports')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        diagnostics.push({
          test: 'Tabela ethics_reports',
          status: 'error',
          message: 'Erro ao acessar tabela',
          details: error.message
        });
      } else {
        diagnostics.push({
          test: 'Tabela ethics_reports',
          status: 'success',
          message: `Tabela acessivel (${data?.length || 0} registros)`
        });
      }
    } catch (error) {
      diagnostics.push({
        test: 'Tabela ethics_reports',
        status: 'error',
        message: 'Erro inesperado',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Teste 2: Verificar permissões do usuário
    try {
      if (user) {
        diagnostics.push({
          test: 'Autenticacao do usuario',
          status: 'success',
          message: `Usuario autenticado: ${user.email}`,
          details: `Tenant: ${user.tenantId}, Roles: ${user.roles.join(', ')}`
        });
      } else {
        diagnostics.push({
          test: 'Autenticacao do usuario',
          status: 'error',
          message: 'Usuario nao autenticado'
        });
      }
    } catch (error) {
      diagnostics.push({
        test: 'Autenticacao do usuario',
        status: 'error',
        message: 'Erro ao verificar autenticacao',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Teste 3: Verificar se consegue inserir um registro de teste
    try {
      const testReport = {
        title: 'Teste de Diagnostico',
        description: 'Este e um registro de teste criado pelo diagnostico do sistema',
        category: 'other',
        severity: 'low',
        status: 'open',
        is_anonymous: true
      };

      const { data, error } = await supabase
        .from('ethics_reports')
        .insert([testReport])
        .select()
        .single();

      if (error) {
        diagnostics.push({
          test: 'Insercao de dados',
          status: 'error',
          message: 'Erro ao inserir registro de teste',
          details: error.message
        });
      } else {
        // Limpar o registro de teste
        await supabase
          .from('ethics_reports')
          .delete()
          .eq('id', data.id);

        diagnostics.push({
          test: 'Insercao de dados',
          status: 'success',
          message: 'Insercao e remocao de teste bem-sucedida'
        });
      }
    } catch (error) {
      diagnostics.push({
        test: 'Insercao de dados',
        status: 'error',
        message: 'Erro inesperado na insercao',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Teste 4: Verificar se a rota está configurada
    try {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/ethics') || currentPath.includes('/admin/system-diagnostic')) {
        diagnostics.push({
          test: 'Roteamento',
          status: 'success',
          message: 'Rota acessivel',
          details: `Caminho atual: ${currentPath}`
        });
      } else {
        diagnostics.push({
          test: 'Roteamento',
          status: 'warning',
          message: 'Teste executado fora da rota de etica',
          details: `Caminho atual: ${currentPath}`
        });
      }
    } catch (error) {
      diagnostics.push({
        test: 'Roteamento',
        status: 'error',
        message: 'Erro ao verificar rota',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
      case 'loading':
        return <Badge variant="outline">Carregando...</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnostico do Modulo de Etica</h2>
          <p className="text-muted-foreground">
            Verificacao de funcionamento e conectividade do modulo de etica
          </p>
        </div>
        <Button onClick={runDiagnostics} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executando...
            </>
          ) : (
            'Executar Diagnostico'
          )}
        </Button>
      </div>

      {/* Resumo */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasErrors ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : hasWarnings ? (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Resumo do Diagnostico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Avisos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Erros</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados detalhados */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{result.test}</h3>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                  {result.details && (
                    <div className="text-xs bg-muted p-2 rounded font-mono">
                      {result.details}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recomendacoes */}
      {hasErrors && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Acoes Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {results.filter(r => r.status === 'error').map((result, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>
                    <strong>{result.test}:</strong> {result.message}
                    {result.details && (
                      <span className="text-muted-foreground"> - {result.details}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EthicsDiagnostic;