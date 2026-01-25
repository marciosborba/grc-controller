import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

export default function ActionPlansDebugSimple() {
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testQueries = async () => {
    setLoading(true);
    const results: any = {};

    try {
      console.log('🔍 Testando queries com tenant:', effectiveTenantId);
      
      // Test 1: Assessments
      console.log('📊 Teste 1: Assessments');
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id, codigo, titulo, status')
        .eq('tenant_id', effectiveTenantId)
        .limit(5);
      
      results.assessments = {
        count: assessments?.length || 0,
        data: assessments,
        error: assessmentsError
      };
      console.log('Assessments:', results.assessments);

      // Test 2: Gaps (assessment_responses)
      console.log('📊 Teste 2: Gaps');
      const { data: gaps, error: gapsError } = await supabase
        .from('assessment_responses')
        .select('id, assessment_id, criticidade_gap, justificativa, gap_identificado')
        .eq('tenant_id', effectiveTenantId)
        .eq('gap_identificado', true)
        .limit(10);
      
      results.gaps = {
        count: gaps?.length || 0,
        data: gaps,
        error: gapsError
      };
      console.log('Gaps:', results.gaps);

      // Test 3: Action Plans
      console.log('📊 Teste 3: Action Plans');
      const { data: plans, error: plansError } = await supabase
        .from('assessment_action_plans')
        .select('id, codigo, titulo, assessment_id, status')
        .eq('tenant_id', effectiveTenantId)
        .limit(10);
      
      results.plans = {
        count: plans?.length || 0,
        data: plans,
        error: plansError
      };
      console.log('Plans:', results.plans);

      // Test 4: Action Items
      console.log('📊 Teste 4: Action Items');
      const { data: items, error: itemsError } = await supabase
        .from('assessment_action_items')
        .select('id, codigo, titulo, action_plan_id, status')
        .eq('tenant_id', effectiveTenantId)
        .limit(10);
      
      results.items = {
        count: items?.length || 0,
        data: items,
        error: itemsError
      };
      console.log('Items:', results.items);

      // Test 5: Gaps com JOIN
      if (assessments && assessments.length > 0) {
        const firstAssessmentId = assessments[0].id;
        console.log('📊 Teste 5: Gaps com JOIN para assessment:', firstAssessmentId);
        
        const { data: gapsWithJoin, error: gapsJoinError } = await supabase
          .from('assessment_responses')
          .select(`
            id,
            assessment_id,
            criticidade_gap,
            justificativa,
            percentual_conformidade,
            control:assessment_controls(titulo, codigo, criticidade)
          `)
          .eq('assessment_id', firstAssessmentId)
          .eq('tenant_id', effectiveTenantId)
          .eq('gap_identificado', true);
        
        results.gapsWithJoin = {
          assessmentId: firstAssessmentId,
          count: gapsWithJoin?.length || 0,
          data: gapsWithJoin,
          error: gapsJoinError
        };
        console.log('Gaps with JOIN:', results.gapsWithJoin);
      }

      // Test 6: Items com JOIN
      if (plans && plans.length > 0) {
        const firstPlanId = plans[0].id;
        console.log('📊 Teste 6: Items com JOIN para plano:', firstPlanId);
        
        const { data: itemsWithJoin, error: itemsJoinError } = await supabase
          .from('assessment_action_items')
          .select(`
            id,
            codigo,
            titulo,
            status,
            action_plan_id,
            responsavel_profile:profiles!assessment_action_items_responsavel_fkey(full_name)
          `)
          .eq('action_plan_id', firstPlanId)
          .eq('tenant_id', effectiveTenantId);
        
        results.itemsWithJoin = {
          planId: firstPlanId,
          count: itemsWithJoin?.length || 0,
          data: itemsWithJoin,
          error: itemsJoinError
        };
        console.log('Items with JOIN:', results.itemsWithJoin);
      }

      setDebugInfo(results);
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error);
      results.generalError = error;
      setDebugInfo(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveTenantId) {
      testQueries();
    }
  }, [effectiveTenantId]);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>User ID:</strong> {user?.id || 'N/A'}
            </div>
            <div>
              <strong>Is Platform Admin:</strong> {user?.isPlatformAdmin ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>Selected Tenant ID:</strong> {selectedTenantId || 'N/A'}
            </div>
            <div>
              <strong>User Tenant ID:</strong> {user?.tenantId || 'N/A'}
            </div>
            <div>
              <strong>Effective Tenant ID:</strong> {effectiveTenantId || 'N/A'}
            </div>
            
            <Button onClick={testQueries} disabled={loading}>
              {loading ? 'Testando...' : 'Executar Testes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {Object.keys(debugInfo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugInfo.assessments && (
                <div>
                  <h4 className="font-semibold">Assessments:</h4>
                  <p>Count: {debugInfo.assessments.count}</p>
                  {debugInfo.assessments.error && (
                    <p className="text-red-600">Erro: {JSON.stringify(debugInfo.assessments.error)}</p>
                  )}
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.assessments.data, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.gaps && (
                <div>
                  <h4 className="font-semibold">Gaps (assessment_responses):</h4>
                  <p>Count: {debugInfo.gaps.count}</p>
                  {debugInfo.gaps.error && (
                    <p className="text-red-600">Erro: {JSON.stringify(debugInfo.gaps.error)}</p>
                  )}
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.gaps.data, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.plans && (
                <div>
                  <h4 className="font-semibold">Action Plans:</h4>
                  <p>Count: {debugInfo.plans.count}</p>
                  {debugInfo.plans.error && (
                    <p className="text-red-600">Erro: {JSON.stringify(debugInfo.plans.error)}</p>
                  )}
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.plans.data, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.items && (
                <div>
                  <h4 className="font-semibold">Action Items:</h4>
                  <p>Count: {debugInfo.items.count}</p>
                  {debugInfo.items.error && (
                    <p className="text-red-600">Erro: {JSON.stringify(debugInfo.items.error)}</p>
                  )}
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.items.data, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.gapsWithJoin && (
                <div>
                  <h4 className="font-semibold">Gaps com JOIN (Assessment: {debugInfo.gapsWithJoin.assessmentId}):</h4>
                  <p>Count: {debugInfo.gapsWithJoin.count}</p>
                  {debugInfo.gapsWithJoin.error && (
                    <p className="text-red-600">Erro: {JSON.stringify(debugInfo.gapsWithJoin.error)}</p>
                  )}
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.gapsWithJoin.data, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.itemsWithJoin && (
                <div>
                  <h4 className="font-semibold">Items com JOIN (Plano: {debugInfo.itemsWithJoin.planId}):</h4>
                  <p>Count: {debugInfo.itemsWithJoin.count}</p>
                  {debugInfo.itemsWithJoin.error && (
                    <p className="text-red-600">Erro: {JSON.stringify(debugInfo.itemsWithJoin.error)}</p>
                  )}
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.itemsWithJoin.data, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.generalError && (
                <div>
                  <h4 className="font-semibold text-red-600">Erro Geral:</h4>
                  <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.generalError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}