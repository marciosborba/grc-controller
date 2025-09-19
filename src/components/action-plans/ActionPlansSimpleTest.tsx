import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

export default function ActionPlansSimpleTest() {
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  const navigate = useNavigate();
  
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (effectiveTenantId) {
      loadPlans();
    }
  }, [effectiveTenantId]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Carregando planos para tenant:', effectiveTenantId);
      console.log('👤 Usuário:', {
        id: user?.id,
        email: user?.email,
        isPlatformAdmin: user?.isPlatformAdmin,
        tenantId: user?.tenantId
      });

      // Query mais simples possível
      const { data, error } = await supabase
        .from('assessment_action_plans')
        .select('id, codigo, titulo, status, percentual_conclusao, created_at')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      console.log('📊 Resultado da query:', { data, error });

      if (error) {
        console.error('❌ Erro na query:', error);
        setError(error.message);
        return;
      }

      console.log('✅ Dados carregados:', data?.length || 0, 'planos');
      setPlans(data || []);
      
    } catch (error) {
      console.error('💥 Erro geral:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando planos de ação...</p>
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
          <h1 className="text-2xl font-bold">Teste Simples - Planos de Ação</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Tenant Efetivo:</strong> {effectiveTenantId}</p>
            <p><strong>Usuário ID:</strong> {user?.id}</p>
            <p><strong>É Platform Admin:</strong> {user?.isPlatformAdmin ? 'Sim' : 'Não'}</p>
            <p><strong>Tenant do Usuário:</strong> {user?.tenantId}</p>
            <p><strong>Tenant Selecionado:</strong> {selectedTenantId}</p>
            <p><strong>Total de Planos:</strong> {plans.length}</p>
            {error && <p className="text-red-600"><strong>Erro:</strong> {error}</p>}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-red-600">
              <h3 className="text-lg font-medium">Erro ao carregar dados</h3>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium">Nenhum plano encontrado</h3>
            <p className="text-sm text-muted-foreground">
              A query retornou 0 resultados
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Planos de Ação Encontrados ({plans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="border p-4 rounded-lg">
                  <h4 className="font-medium">{plan.titulo}</h4>
                  <p className="text-sm text-muted-foreground">
                    {plan.codigo} • Status: {plan.status} • Progresso: {plan.percentual_conclusao}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {plan.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(plan.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ações de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={loadPlans}>
              Recarregar Dados
            </Button>
            <Button variant="outline" onClick={() => console.log('Current state:', { plans, error, effectiveTenantId })}>
              Log Estado Atual
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}