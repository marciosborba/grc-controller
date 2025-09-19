import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

export default function AssessmentsListDebug() {
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
      console.log('🔍 Teste 1: Query simples');
      const { data: simpleData, error: simpleError } = await supabase
        .from('assessments')
        .select('*')
        .eq('tenant_id', effectiveTenantId);
      
      console.log('Simple query result:', { data: simpleData, error: simpleError });
      
      // Teste 2: Query com JOIN frameworks
      console.log('🔍 Teste 2: Query com JOIN frameworks');
      const { data: frameworkData, error: frameworkError } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(id, nome, tipo_framework)
        `)
        .eq('tenant_id', effectiveTenantId);
      
      console.log('Framework query result:', { data: frameworkData, error: frameworkError });
      
      // Teste 3: Query com JOIN profiles
      console.log('🔍 Teste 3: Query com JOIN profiles');
      const { data: profileData, error: profileError } = await supabase
        .from('assessments')
        .select(`
          *,
          responsavel_profile:profiles!assessments_responsavel_assessment_fkey(id, full_name)
        `)
        .eq('tenant_id', effectiveTenantId);
      
      console.log('Profile query result:', { data: profileData, error: profileError });
      
      // Teste 4: Query completa original
      console.log('🔍 Teste 4: Query completa original');
      const { data: fullData, error: fullError } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(id, nome, tipo_framework),
          responsavel_profile:profiles!assessments_responsavel_assessment_fkey(id, full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
      
      console.log('Full query result:', { data: fullData, error: fullError });
      
      // Teste 5: Query alternativa sem foreign key constraint
      console.log('🔍 Teste 5: Query alternativa');
      const { data: altData, error: altError } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(id, nome, tipo_framework),
          responsavel_profile:profiles(id, full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
      
      console.log('Alternative query result:', { data: altData, error: altError });
      
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
          framework: { data: frameworkData, error: frameworkError },
          profile: { data: profileData, error: profileError },
          full: { data: fullData, error: fullError },
          alternative: { data: altData, error: altError }
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
        <Button variant="ghost" onClick={() => navigate('/assessments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="border-l border-muted-foreground/20 pl-4">
          <h1 className="text-2xl font-bold">Debug - Lista de Assessments</h1>
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
            <CardTitle>Assessments Encontrados (Query Simples)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {debugInfo.tests.simple.data.length} assessments</p>
            {debugInfo.tests.simple.data.map((assessment: any) => (
              <div key={assessment.id} className="border p-2 mb-2 rounded">
                <p><strong>Título:</strong> {assessment.titulo}</p>
                <p><strong>Código:</strong> {assessment.codigo}</p>
                <p><strong>Status:</strong> {assessment.status}</p>
                <p><strong>Framework ID:</strong> {assessment.framework_id}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}