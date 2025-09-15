import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

export function UniversoAuditavelTest() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId(); // Para Super Admin
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Para Super Admin: usar tenant selecionado no header
    // Para usuários normais: usar o tenant_id do usuário
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenant?.id;
    
    if (effectiveTenantId) {
      loadData();
    } else {
      console.log('⚠️ Aguardando tenant ser carregado...', { 
        user: user?.email, 
        isPlatformAdmin: user?.isPlatformAdmin,
        selectedTenantId,
        userTenantId: user?.tenant?.id,
        effectiveTenantId
      });
    }
  }, [user?.tenant?.id, user?.isPlatformAdmin, selectedTenantId]);

  const loadData = async () => {
    try {
      // Determinar o tenant ID efetivo baseado no tipo de usuário
      const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenant?.id;
      
      console.log('🔍 Carregando dados para tenant:', effectiveTenantId);
      console.log('👤 Usuário completo:', user);
      console.log('🏢 Tenant ID efetivo:', { 
        isPlatformAdmin: user?.isPlatformAdmin,
        selectedTenantId,
        userTenantId: user?.tenant?.id,
        effectiveTenantId
      });
      
      if (!effectiveTenantId) {
        setError('Tenant não encontrado. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }
      
      const { data: result, error } = await supabase
        .from('universo_auditavel')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('nivel', { ascending: false });

      console.log('📊 Resultado:', { result, error, count: result?.length });

      if (error) {
        setError(error.message);
        console.error('❌ Erro:', error);
      } else {
        setData(result || []);
        console.log('✅ Dados carregados:', result?.length, 'itens');
      }
    } catch (err) {
      console.error('❌ Erro exception:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Erro: {error}</p>
          <p className="text-sm mt-2">Tenant ID: {user?.tenant?.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Universo Auditável - Teste</h2>
        <p className="text-muted-foreground">
          Tenant Efetivo: {user?.isPlatformAdmin ? selectedTenantId : user?.tenant?.id}
        </p>
        <p className="text-muted-foreground">
          Tipo de Usuário: {user?.isPlatformAdmin ? 'Super Admin' : 'Usuário Normal'}
        </p>
        <p className="text-muted-foreground">Total de itens: {data.length}</p>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum item encontrado no universo auditável</p>
              <button 
                onClick={loadData}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Recarregar
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.slice(0, 5).map((item, index) => (
            <Card key={item.id || index}>
              <CardHeader>
                <CardTitle className="text-lg">{item.nome || 'Sem nome'}</CardTitle>
                <CardDescription>
                  {item.codigo} - {item.tipo} - {item.criticidade}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.descricao}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Nível: {item.nivel} | Frequência: {item.frequencia_auditoria} meses
                </div>
              </CardContent>
            </Card>
          ))}
          
          {data.length > 5 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  ... e mais {data.length - 5} itens
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default UniversoAuditavelTest;