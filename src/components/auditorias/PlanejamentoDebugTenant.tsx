import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId, useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

export function PlanejamentoDebugTenant() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const { availableTenants, loadingTenants, getSelectedTenant } = useTenantSelector();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [debugInfo, setDebugInfo] = useState({
    databaseTest: null as any,
    timestamp: new Date().toISOString()
  });

  // Teste de query de banco para verificar o tenant_id
  const testDatabaseQuery = async () => {
    if (!effectiveTenantId) {
      setDebugInfo(prev => ({
        ...prev,
        databaseTest: { error: 'Nenhum effectiveTenantId disponível' }
      }));
      return;
    }

    try {
      const { data, error, count } = await supabase
        .from('planos_estrategicos')
        .select('*', { count: 'exact' })
        .eq('tenant_id', effectiveTenantId)
        .limit(5);

      setDebugInfo(prev => ({
        ...prev,
        databaseTest: { data, error, count, tenantUsed: effectiveTenantId }
      }));
    } catch (err) {
      setDebugInfo(prev => ({
        ...prev,
        databaseTest: { error: err }
      }));
    }
  };

  useEffect(() => {
    if (effectiveTenantId) {
      testDatabaseQuery();
    }
  }, [effectiveTenantId]);

  const selectedTenant = getSelectedTenant();

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f1f5f9',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#0f172a'
      }}>
        🔍 DEBUG - Tenant ID Investigation
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Informações do Usuário */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#1e40af', marginBottom: '12px' }}>👤 User Information</h3>
          <div style={{ lineHeight: '1.6' }}>
            <p><strong>isPlatformAdmin:</strong> {user?.isPlatformAdmin ? '✅ YES' : '❌ NO'}</p>
            <p><strong>user.tenantId:</strong> {user?.tenantId || '❌ NULL'}</p>
            <p><strong>user.roles:</strong> {JSON.stringify(user?.roles)}</p>
            <p><strong>user.email:</strong> {user?.email}</p>
          </div>
        </div>

        {/* Informações do Tenant Selector */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#059669', marginBottom: '12px' }}>🎯 Tenant Selector</h3>
          <div style={{ lineHeight: '1.6' }}>
            <p><strong>selectedTenantId:</strong> {selectedTenantId || '❌ NULL'}</p>
            <p><strong>effectiveTenantId:</strong> {effectiveTenantId || '❌ NULL'}</p>
            <p><strong>loadingTenants:</strong> {loadingTenants ? '⏳ YES' : '✅ NO'}</p>
            <p><strong>availableTenants count:</strong> {availableTenants.length}</p>
            <p><strong>selectedTenant name:</strong> {selectedTenant?.name || '❌ NULL'}</p>
          </div>
        </div>

        {/* Teste de Database */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          gridColumn: 'span 2'
        }}>
          <h3 style={{ color: '#dc2626', marginBottom: '12px' }}>🗄️ Database Query Test</h3>
          {debugInfo.databaseTest ? (
            <div style={{ lineHeight: '1.6' }}>
              <p><strong>Tenant usado na query:</strong> {debugInfo.databaseTest.tenantUsed}</p>
              <p><strong>Registros encontrados:</strong> {debugInfo.databaseTest.count ?? 'N/A'}</p>
              <p><strong>Erro:</strong> {debugInfo.databaseTest.error ? '❌ ' + JSON.stringify(debugInfo.databaseTest.error) : '✅ Nenhum'}</p>
              <p><strong>Dados (primeiros 2):</strong></p>
              <pre style={{ 
                backgroundColor: '#f8fafc', 
                padding: '8px', 
                borderRadius: '4px', 
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(debugInfo.databaseTest.data?.slice(0, 2), null, 2)}
              </pre>
            </div>
          ) : (
            <p>⏳ Aguardando teste de database...</p>
          )}
        </div>

        {/* Tenants Disponíveis */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          gridColumn: 'span 2'
        }}>
          <h3 style={{ color: '#7c3aed', marginBottom: '12px' }}>🏢 Available Tenants</h3>
          {availableTenants.length > 0 ? (
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {availableTenants.map(tenant => (
                <div key={tenant.id} style={{ 
                  padding: '8px', 
                  marginBottom: '4px',
                  backgroundColor: tenant.id === selectedTenantId ? '#ecfdf5' : '#f8fafc',
                  borderRadius: '4px',
                  border: tenant.id === selectedTenantId ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <strong>{tenant.name}</strong> ({tenant.id})
                  {tenant.id === selectedTenantId && <span style={{ color: '#10b981' }}> ← SELECIONADO</span>}
                </div>
              ))}
            </div>
          ) : (
            <p>❌ Nenhum tenant disponível</p>
          )}
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        backgroundColor: effectiveTenantId ? '#dcfce7' : '#fef2f2',
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        <h4 style={{ 
          color: effectiveTenantId ? '#166534' : '#991b1b',
          marginBottom: '8px'
        }}>
          {effectiveTenantId ? '✅ TENANT ID DISPONÍVEL' : '❌ TENANT ID FALTANDO'}
        </h4>
        <p><strong>effectiveTenantId para queries:</strong> {effectiveTenantId || 'NULL'}</p>
        <p style={{ fontSize: '10px', color: '#6b7280' }}>
          Última atualização: {debugInfo.timestamp}
        </p>
      </div>
    </div>
  );
}