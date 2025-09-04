/**
 * ALEX TEMPLATE DEBUG - Componente de debug para templates de assessment
 * 
 * Componente temporário para diagnosticar problemas de carregamento de templates
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useAlexAssessment } from '@/hooks/useAlexAssessment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Loader2, 
  RefreshCw,
  Bug,
  Info,
  BookOpen
} from 'lucide-react';

const AlexTemplateDebug: React.FC = () => {
  const { user } = useAuth();
  const { assessmentTemplates, isTemplatesLoading, templatesError } = useAlexAssessment();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  useEffect(() => {
    console.log('🐛 [TEMPLATE DEBUG] Estado atual:', {
      user: user?.id,
      tenant: user?.user_metadata?.tenant_id,
      assessmentTemplates: assessmentTemplates?.length,
      isLoading: isTemplatesLoading,
      error: templatesError
    });
  }, [user, assessmentTemplates, isTemplatesLoading, templatesError]);

  const runDiagnostic = async () => {
    setIsDebugging(true);
    const diagnostic: any = {
      timestamp: new Date().toISOString(),
      user_info: {
        id: user?.id,
        email: user?.email,
        tenant_id: user?.user_metadata?.tenant_id,
        role: user?.user_metadata?.role
      },
      hook_state: {
        assessmentTemplates_length: assessmentTemplates?.length || 0,
        isTemplatesLoading,
        templatesError: templatesError?.message
      },
      direct_query_results: null,
      table_info: null
    };

    try {
      // Teste 1: Query direta na tabela
      console.log('🔍 [DEBUG] Executando query direta em assessment_templates...');
      const { data: directTemplates, error: directError } = await supabase
        .from('assessment_templates')
        .select('id, name, category, is_global, is_active, tenant_id, created_at')
        .limit(10);

      diagnostic.direct_query_results = {
        success: !directError,
        error: directError?.message,
        count: directTemplates?.length || 0,
        templates: directTemplates?.map(template => ({
          id: template.id,
          name: template.name,
          category: template.category,
          is_global: template.is_global,
          is_active: template.is_active,
          tenant_id: template.tenant_id
        }))
      };

      // Teste 2: Informações da tabela
      const { count, error: countError } = await supabase
        .from('assessment_templates')
        .select('*', { count: 'exact', head: true });

      diagnostic.table_info = {
        total_count: count,
        count_error: countError?.message
      };

      // Teste 3: Verificar RLS para templates
      const { data: rlsTest, error: rlsError } = await supabase
        .from('assessment_templates')
        .select('id, name, is_global, tenant_id')
        .eq('is_active', true)
        .limit(5);

      diagnostic.rls_test = {
        success: !rlsError,
        error: rlsError?.message,
        accessible_templates_count: rlsTest?.length || 0,
        global_templates: rlsTest?.filter(t => t.is_global).length || 0,
        tenant_templates: rlsTest?.filter(t => t.tenant_id === user?.user_metadata?.tenant_id).length || 0
      };

      setDebugInfo(diagnostic);
      console.log('🐛 [DEBUG] Diagnóstico completo:', diagnostic);

    } catch (error: any) {
      diagnostic.unexpected_error = error.message;
      setDebugInfo(diagnostic);
      console.error('🐛 [DEBUG] Erro inesperado:', error);
    } finally {
      setIsDebugging(false);
    }
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
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Bug className="h-5 w-5" />
            Template Selector Debug
            <Badge className="bg-orange-200 text-orange-800">
              Diagnóstico
            </Badge>
          </CardTitle>
          <p className="text-orange-700">
            Ferramenta de diagnóstico para identificar problemas no seletor de templates
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDiagnostic}
            disabled={isDebugging}
            className="flex items-center gap-2"
          >
            {isDebugging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isDebugging ? 'Executando Diagnóstico...' : 'Executar Diagnóstico'}
          </Button>
        </CardContent>
      </Card>

      {/* Estado do Hook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Estado do Hook useAlexAssessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(!isTemplatesLoading)}
              <span className="text-sm">
                Loading: {isTemplatesLoading ? 'Sim' : 'Não'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(!templatesError)}
              <span className="text-sm">
                Erro: {templatesError ? 'Sim' : 'Não'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(assessmentTemplates && assessmentTemplates.length > 0)}
              <span className="text-sm">
                Templates: {assessmentTemplates?.length || 0}
              </span>
            </div>
          </div>

          {templatesError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">
                <strong>Erro:</strong> {templatesError.message}
              </p>
            </div>
          )}

          {assessmentTemplates && assessmentTemplates.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700 mb-2">
                <strong>Templates carregados via hook:</strong>
              </p>
              <div className="space-y-1">
                {assessmentTemplates.slice(0, 5).map((template, idx) => (
                  <div key={template.id} className="text-xs text-green-600">
                    {idx + 1}. {template.name} ({template.category})
                  </div>
                ))}
                {assessmentTemplates.length > 5 && (
                  <div className="text-xs text-green-600">
                    ... e mais {assessmentTemplates.length - 5} templates
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>ID:</strong> {user?.id || 'Não logado'}
            </div>
            <div>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </div>
            <div>
              <strong>Tenant ID:</strong> {user?.user_metadata?.tenant_id || 'N/A'}
            </div>
            <div>
              <strong>Role:</strong> {user?.user_metadata?.role || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados do Diagnóstico */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Resultados do Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Query Direta */}
            <div>
              <h4 className="font-semibold mb-2">1. Query Direta na Tabela assessment_templates</h4>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(debugInfo.direct_query_results?.success)}
                <Badge className={getStatusColor(debugInfo.direct_query_results?.success)}>
                  {debugInfo.direct_query_results?.success ? 'Sucesso' : 'Falha'}
                </Badge>
                <span className="text-sm">
                  {debugInfo.direct_query_results?.count || 0} templates encontrados
                </span>
              </div>
              
              {debugInfo.direct_query_results?.error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  Erro: {debugInfo.direct_query_results.error}
                </div>
              )}

              {debugInfo.direct_query_results?.templates && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium mb-1">Templates encontrados:</p>
                  {debugInfo.direct_query_results.templates.map((template: any, idx: number) => (
                    <div key={template.id} className="text-xs text-blue-700">
                      {idx + 1}. {template.name} ({template.category}) - 
                      {template.is_global ? ' Global' : ` Tenant: ${template.tenant_id}`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contagem Total */}
            <div>
              <h4 className="font-semibold mb-2">2. Contagem Total</h4>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.table_info?.total_count > 0)}
                <span className="text-sm">
                  Total na tabela: {debugInfo.table_info?.total_count || 0}
                </span>
              </div>
            </div>

            {/* Teste RLS */}
            <div>
              <h4 className="font-semibold mb-2">3. Teste de RLS (Row Level Security)</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(debugInfo.rls_test?.success)}
                  <span className="text-sm">
                    Templates acessíveis: {debugInfo.rls_test?.accessible_templates_count || 0}
                  </span>
                </div>
                <div className="text-sm text-gray-600 ml-6">
                  • Templates globais: {debugInfo.rls_test?.global_templates || 0}
                </div>
                <div className="text-sm text-gray-600 ml-6">
                  • Templates do tenant: {debugInfo.rls_test?.tenant_templates || 0}
                </div>
              </div>
              
              {debugInfo.rls_test?.error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  Erro RLS: {debugInfo.rls_test.error}
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="pt-4 border-t text-xs text-gray-500">
              Diagnóstico executado em: {new Date(debugInfo.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações de Correção */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Possíveis Soluções</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-700">
          <div>• Verifique se as migrações foram executadas: <code>supabase migration up</code></div>
          <div>• Confirme se existem templates na tabela assessment_templates</div>
          <div>• Verifique as políticas RLS na tabela assessment_templates</div>
          <div>• Execute o reset do banco se necessário: <code>supabase db reset</code></div>
          <div>• Verifique se o usuário tem acesso aos templates globais</div>
          <div>• Confirme se o tenant_id está correto para templates personalizados</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlexTemplateDebug;