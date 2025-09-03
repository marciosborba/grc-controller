import React, { useEffect, useState } from 'react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const UserDebugInfo: React.FC = () => {
  const { user, session } = useAuth();
  const [platformAdminData, setPlatformAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkPlatformAdmin = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔍 Verificando platform admin para:', user.id);
      
      const { data, error } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('📋 Resultado platform_admins:', { data, error });
      setPlatformAdminData({ data, error });
    } catch (err) {
      console.error('❌ Erro ao verificar platform admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkPlatformAdmin();
    }
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Usuário não autenticado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Informações do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <strong>ID:</strong> {user.id}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Nome:</strong> {user.name}
            </div>
            <div>
              <strong>É Platform Admin:</strong> 
              <Badge variant={user.isPlatformAdmin ? "default" : "destructive"}>
                {user.isPlatformAdmin ? 'SIM' : 'NÃO'}
              </Badge>
            </div>
            <div>
              <strong>Roles:</strong>
              <div className="flex gap-2 mt-1">
                {user.roles.map(role => (
                  <Badge key={role} variant="secondary">{role}</Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Permissions:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.permissions.map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Tenant ID:</strong> {user.tenantId}
            </div>
            {user.tenant && (
              <div>
                <strong>Tenant:</strong> {user.tenant.name} ({user.tenant.slug})
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div>
              <strong>Session existe:</strong> {session ? 'SIM' : 'NÃO'}
            </div>
            {session && (
              <>
                <div>
                  <strong>Access Token:</strong> {session.access_token.substring(0, 50)}...
                </div>
                <div>
                  <strong>Expires at:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Admin Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={checkPlatformAdmin} disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Platform Admin'}
            </Button>
            
            {platformAdminData && (
              <div className="space-y-2">
                <div>
                  <strong>Query Error:</strong> {platformAdminData.error ? JSON.stringify(platformAdminData.error) : 'Nenhum erro'}
                </div>
                <div>
                  <strong>Data:</strong>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto text-gray-900 dark:text-gray-100">
                    {JSON.stringify(platformAdminData.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDebugInfo;