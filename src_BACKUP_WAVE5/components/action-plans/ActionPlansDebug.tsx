import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

export default function ActionPlansDebug() {
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  const navigate = useNavigate();
  
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveTenantId) {
      testQueries();
    }
  }, [effectiveTenantId]);

  const testQueries = async () => {
    try {
      setLoading(true);
      
      // Teste 1: Query simples
      console.log('🔍 Teste 1: Query simples de planos de ação');
      const { data: simpleData, error: simpleError } = await supabase
        .from('assessment_action_plans')
        .select('*')
        .eq('tenant_id', effectiveTenantId);
      
      console.log('Simple query result:', { data: simpleData, error: simpleError });
      
      // Teste 2: Query com JOIN assessment
      console.log('🔍 Teste 2: Query com JOIN assessment');
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_action_plans')
        .select(`
          *,
          assessment:assessments(titulo, codigo)
        `)
        .eq('tenant_id', effectiveTenantId);
      
      console.log('Assessment query result:', { data: assessmentData, error: assessmentError });
      
      // Teste 3: Query com JOIN profiles
      console.log('🔍 Teste 3: Query com JOIN profiles');
      const { data: profileData, error: profileError } = await supabase
        .from('assessment_action_plans')
        .select(`
          *,
          responsavel_profile:profiles!assessment_action_plans_responsavel_plano_fkey(full_name)
        `)
        .eq('tenant_id', effectiveTenantId);
      
      console.log('Profile query result:', { data: profileData, error: profileError });
      
      // Teste 4: Query completa
      console.log('🔍 Teste 4: Query completa');
      const { data: fullData, error: fullError } = await supabase
        .from('assessment_action_plans')
        .select(`
          *,
          assessment:assessments(titulo, codigo),
          responsavel_profile:profiles!assessment_action_plans_responsavel_plano_fkey(full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
      
      console.log('Full query result:', { data: fullData, error: fullError });
      
      // Teste 5: Estatísticas
      console.log('🔍 Teste 5: Query de estatísticas');
      const { data: statsData, error: statsError } = await supabase
        .from('assessment_action_plans')
        .select('status, percentual_conclusao, orcamento_estimado, data_fim_planejada')
        .eq('tenant_id', effectiveTenantId);
      
      console.log('Stats query result:', { data: statsData, error: statsError });
      
      setDebugInfo({
        effectiveTenantId,
        user: {
          id: user?.id,
          email: user?.email,
          isPlatformAdmin: user?.isPlatformAdmin,
          tenantId: user?.tenantId
        },
        selectedTenantId,
        tests: {
          simple: { data: simpleData, error: simpleError },
          assessment: { data: assessmentData, error: assessmentError },
          profile: { data: profileData, error: profileError },
          full: { data: fullData, error: fullError },
          stats: { data: statsData, error: statsError }
        }
      });
      
    } catch (error) {
      console.error('Erro nos testes:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Executando testes de debug...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/action-plans')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="border-l border-muted-foreground/20 pl-4">
          <h1 className="text-2xl font-bold">Debug - Planos de Ação</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {debugInfo.tests?.simple?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Planos de Ação Encontrados (Query Simples)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {debugInfo.tests.simple.data.length} planos</p>
            {debugInfo.tests.simple.data.map((plan: any) => (
              <div key={plan.id} className="border p-2 mb-2 rounded">
                <p><strong>Título:</strong> {plan.titulo}</p>
                <p><strong>Código:</strong> {plan.codigo}</p>
                <p><strong>Status:</strong> {plan.status}</p>
                <p><strong>Progresso:</strong> {plan.percentual_conclusao}%</p>
                <p><strong>Assessment ID:</strong> {plan.assessment_id}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}