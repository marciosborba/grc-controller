import React from 'react';
import { useAuth } from '@/contexts/AuthContextSimple';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';

export default function UserTenantDebug() {
  const { user, isLoading } = useAuth();
  const { selectedTenantId, availableTenants, loadingTenants, isGlobalTenantSelection } = useTenantSelector();

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
        🔍 DEBUG: Usuário e Tenant
      </h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2>👤 Dados do Usuário</h2>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          <p><strong>isLoading:</strong> {String(isLoading)}</p>
          <p><strong>user:</strong> {user ? 'Existe' : 'null'}</p>
          {user && (
            <>
              <p><strong>user.id:</strong> {user.id}</p>
              <p><strong>user.email:</strong> {user.email}</p>
              <p><strong>user.name:</strong> {user.name}</p>
              <p><strong>user.tenantId:</strong> {user.tenantId}</p>
              <p><strong>user.roles:</strong> {JSON.stringify(user.roles)}</p>
              <p><strong>user.isPlatformAdmin:</strong> {String(user.isPlatformAdmin)}</p>
              <p><strong>user.permissions:</strong> {JSON.stringify(user.permissions)}</p>
            </>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h2>🏢 Dados do Tenant</h2>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          <p><strong>selectedTenantId:</strong> {selectedTenantId || 'null'}</p>
          <p><strong>loadingTenants:</strong> {String(loadingTenants)}</p>
          <p><strong>isGlobalTenantSelection:</strong> {String(isGlobalTenantSelection)}</p>
          <p><strong>availableTenants.length:</strong> {availableTenants.length}</p>
          {availableTenants.length > 0 && (
            <div>
              <p><strong>availableTenants:</strong></p>
              <ul style={{ marginLeft: '20px' }}>
                {availableTenants.map(tenant => (
                  <li key={tenant.id}>
                    {tenant.name} (ID: {tenant.id}) - {tenant.is_active ? 'Ativo' : 'Inativo'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>🎯 Diagnóstico</h2>
        <div style={{ fontSize: '14px' }}>
          {isLoading && <p style={{ color: '#f59e0b' }}>⏳ Carregando dados do usuário...</p>}
          {!isLoading && !user && <p style={{ color: '#ef4444' }}>❌ Usuário não logado</p>}
          {!isLoading && user && !user.tenantId && <p style={{ color: '#ef4444' }}>❌ Usuário sem tenant_id</p>}
          {!isLoading && user && user.tenantId === 'default' && <p style={{ color: '#f59e0b' }}>⚠️ Usuário usando tenant padrão</p>}
          {!isLoading && user && user.tenantId && user.tenantId !== 'default' && <p style={{ color: '#10b981' }}>✅ Usuário com tenant válido</p>}
          {!isLoading && user && user.isPlatformAdmin && <p style={{ color: '#8b5cf6' }}>👑 Usuário é Platform Admin</p>}
          {loadingTenants && <p style={{ color: '#f59e0b' }}>⏳ Carregando tenants...</p>}
          {!loadingTenants && isGlobalTenantSelection && availableTenants.length === 0 && <p style={{ color: '#ef4444' }}>❌ Platform Admin sem tenants disponíveis</p>}
          {!loadingTenants && isGlobalTenantSelection && availableTenants.length > 0 && !selectedTenantId && <p style={{ color: '#f59e0b' }}>⚠️ Platform Admin sem tenant selecionado</p>}
          {!loadingTenants && selectedTenantId && <p style={{ color: '#10b981' }}>✅ Tenant selecionado: {selectedTenantId}</p>}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#dcfce7', borderLeft: '4px solid #16a34a' }}>
        <h3>💡 Possíveis Soluções:</h3>
        <ul style={{ marginLeft: '20px', fontSize: '14px' }}>
          <li>Se o usuário não tem tenant_id válido, precisa ser configurado no banco</li>
          <li>Se é Platform Admin sem tenants, precisa criar tenants no sistema</li>
          <li>Se é Platform Admin sem seleção, precisa selecionar um tenant</li>
          <li>Verificar se o usuário tem as permissões necessárias</li>
        </ul>
      </div>
    </div>
  );
}