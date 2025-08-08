import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DebugUserInfo: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug - Informações do Usuário</CardTitle>
          <CardDescription>Verificar dados carregados na aplicação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Dados do Usuário:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Verificações:</h4>
                <div className="space-y-1">
                  <div className={`p-2 rounded ${user ? 'bg-green-100' : 'bg-red-100'}`}>
                    ✓ Usuário carregado: {user ? '✅ SIM' : '❌ NÃO'}
                  </div>
                  <div className={`p-2 rounded ${user?.isPlatformAdmin ? 'bg-green-100' : 'bg-red-100'}`}>
                    ✓ É Platform Admin: {user?.isPlatformAdmin ? '✅ SIM' : '❌ NÃO'}
                  </div>
                  <div className={`p-2 rounded ${user?.permissions?.includes('tenants.manage') ? 'bg-green-100' : 'bg-red-100'}`}>
                    ✓ Tem permissão tenants.manage: {user?.permissions?.includes('tenants.manage') ? '✅ SIM' : '❌ NÃO'}
                  </div>
                  <div className={`p-2 rounded ${user?.tenant ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    ✓ Dados do Tenant: {user?.tenant ? '✅ CARREGADO' : '⚠️ NÃO CARREGADO'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Dados Resumidos:</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>ID:</strong> {user?.id || 'N/A'}</div>
                  <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
                  <div><strong>Nome:</strong> {user?.name || 'N/A'}</div>
                  <div><strong>Tenant ID:</strong> {user?.tenantId || 'N/A'}</div>
                  <div><strong>Roles:</strong> {user?.roles?.join(', ') || 'Nenhuma'}</div>
                  <div><strong>Permissões:</strong> {user?.permissions?.length || 0} permissões</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Permissões Completas:</h4>
              <div className="bg-blue-50 p-3 rounded">
                {user?.permissions?.map((perm, index) => (
                  <span key={index} className="inline-block bg-blue-200 rounded px-2 py-1 text-xs mr-1 mb-1">
                    {perm}
                  </span>
                )) || 'Nenhuma permissão carregada'}
              </div>
            </div>

            {user?.tenant && (
              <div>
                <h4 className="font-semibold mb-2">Dados do Tenant:</h4>
                <div className="bg-green-50 p-3 rounded text-sm">
                  <div><strong>Nome:</strong> {user.tenant.name}</div>
                  <div><strong>Slug:</strong> {user.tenant.slug}</div>
                  <div><strong>Usuários:</strong> {user.tenant.current_users_count}/{user.tenant.max_users}</div>
                  <div><strong>Ativo:</strong> {user.tenant.is_active ? '✅ SIM' : '❌ NÃO'}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugUserInfo;