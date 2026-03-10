import React from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const AuthDebugComponent: React.FC = () => {
  const { user, isLoading, session } = useAuth();

  console.log('🔍 [AUTH DEBUG] Dados do usuário:', {
    user,
    isLoading,
    hasSession: !!session,
    isPlatformAdmin: user?.isPlatformAdmin,
    roles: user?.roles,
    permissions: user?.permissions
  });

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Debug de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status de Loading */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span>Loading: {isLoading ? 'Sim' : 'Não'}</span>
          </div>

          {/* Status de Usuário */}
          <div className="flex items-center gap-2">
            {user ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Usuário Logado: {user ? 'Sim' : 'Não'}</span>
          </div>

          {/* Status de Sessão */}
          <div className="flex items-center gap-2">
            {session ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Sessão Ativa: {session ? 'Sim' : 'Não'}</span>
          </div>

          {/* Platform Admin Status */}
          <div className="flex items-center gap-2">
            {user?.isPlatformAdmin ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Platform Admin: {user?.isPlatformAdmin ? 'Sim' : 'Não'}</span>
          </div>

          {/* Dados do Usuário */}
          {user && (
            <div className="space-y-2">
              <h4 className="font-semibold">Dados do Usuário:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>ID: {user.id}</div>
                <div>Email: {user.email}</div>
                <div>Nome: {user.name}</div>
                <div>Tenant ID: {user.tenantId}</div>
              </div>
            </div>
          )}

          {/* Roles */}
          {user?.roles && user.roles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Roles:</h4>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role, index) => (
                  <Badge 
                    key={index} 
                    variant={role === 'platform_admin' ? 'default' : 'secondary'}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Permissões */}
          {user?.permissions && user.permissions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Permissões:</h4>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Acesso ao AI Manager */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Acesso ao AI Manager
            </h4>
            
            {user?.isPlatformAdmin ? (
              <div className="text-green-700 bg-green-50 p-3 rounded">
                ✅ Usuário tem permissão para acessar o AI Manager
              </div>
            ) : (
              <div className="text-red-700 bg-red-50 p-3 rounded">
                ❌ Usuário NÃO tem permissão para acessar o AI Manager
                <div className="mt-2 text-sm">
                  Para acessar, o usuário precisa ter uma das roles:
                  <ul className="list-disc list-inside mt-1">
                    <li>admin</li>
                    <li>super_admin</li>
                    <li>platform_admin</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Teste */}
          <div className="pt-4">
            <button
              onClick={() => {
                console.log('🧪 [AUTH DEBUG] Dados completos:', {
                  user,
                  session,
                  isLoading,
                  timestamp: new Date().toISOString()
                });
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Log Dados no Console
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugComponent;