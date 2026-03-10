import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Shield, AlertCircle, CheckCircle, Database, Copy } from 'lucide-react';
import { toast } from 'sonner';

const UserPermissionsDebug: React.FC = () => {
  const { user, session } = useAuth();
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sqlGenerated, setSqlGenerated] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadUserRoles();
      generateSQL();
    }
  }, [user?.id]);

  const loadUserRoles = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar roles:', error);
        toast.error('Erro ao carregar roles do usuário');
      } else {
        setUserRoles(roles || []);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const generateSQL = () => {
    if (!user?.id) return;
    
    const sql = `-- Script para adicionar platform_admin ao usuário
-- Execute no SQL Editor do Supabase

-- Verificar usuário atual
SELECT id, email FROM auth.users WHERE id = '${user.id}';

-- Verificar roles atuais
SELECT role FROM user_roles WHERE user_id = '${user.id}';

-- Adicionar platform_admin
INSERT INTO user_roles (user_id, role)
VALUES ('${user.id}', 'platform_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar resultado
SELECT ur.role, ur.created_at 
FROM user_roles ur 
WHERE ur.user_id = '${user.id}' 
ORDER BY ur.created_at DESC;`;
    
    setSqlGenerated(sql);
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sqlGenerated);
    toast.success('SQL copiado para a área de transferência!');
  };

  const addPlatformAdminRole = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'platform_admin'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('Usuário já possui a role platform_admin');
        } else {
          console.error('Erro ao adicionar role:', error);
          toast.error('Erro ao adicionar role: ' + error.message);
        }
      } else {
        toast.success('Role platform_admin adicionada com sucesso!');
        await loadUserRoles(); // Recarregar roles
        
        // Sugerir logout/login
        toast.info('Faça logout e login novamente para aplicar as mudanças', {
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao adicionar role');
    } finally {
      setLoading(false);
    }
  };

  const hasPlatformAdmin = userRoles.some(role => 
    ['admin', 'super_admin', 'platform_admin'].includes(role.role)
  );

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Debug de Permissões do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados do Usuário */}
          <div>
            <h3 className="font-semibold mb-3">Dados do Usuário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>ID:</strong> {user?.id || 'N/A'}
              </div>
              <div>
                <strong>Email:</strong> {user?.email || 'N/A'}
              </div>
              <div>
                <strong>Nome:</strong> {user?.name || 'N/A'}
              </div>
              <div>
                <strong>Tenant ID:</strong> {user?.tenantId || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <strong>Platform Admin:</strong>
                {user?.isPlatformAdmin ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{user?.isPlatformAdmin ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex items-center gap-2">
                <strong>Sessão Ativa:</strong>
                {session ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{session ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>

          {/* Roles do Usuário */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Roles do Usuário</h3>
              <Button 
                onClick={loadUserRoles} 
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? 'Carregando...' : 'Recarregar'}
              </Button>
            </div>
            
            {userRoles.length > 0 ? (
              <div className="space-y-2">
                {userRoles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <Badge 
                      variant={role.role === 'platform_admin' ? 'default' : 'secondary'}
                    >
                      {role.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(role.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
                <p className="text-yellow-700">⚠️ Nenhuma role encontrada para este usuário</p>
              </div>
            )}
          </div>

          {/* Status de Acesso */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Status de Acesso ao AI Manager
            </h3>
            
            {hasPlatformAdmin ? (
              <div className="text-green-700 bg-green-50 p-3 rounded">
                ✅ Usuário tem permissão para acessar o AI Manager
                <div className="mt-2 text-sm">
                  Roles administrativas encontradas: {userRoles.filter(r => 
                    ['admin', 'super_admin', 'platform_admin'].includes(r.role)
                  ).map(r => r.role).join(', ')}
                </div>
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

          {/* Ações */}
          {!hasPlatformAdmin && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">Solução Rápida</h4>
                <p className="text-blue-700 mb-3">
                  Clique no botão abaixo para adicionar automaticamente a role platform_admin:
                </p>
                <Button 
                  onClick={addPlatformAdminRole}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Adicionando...' : 'Adicionar Role Platform Admin'}
                </Button>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Solução Manual (SQL)
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Ou execute este SQL no Supabase Dashboard:
                </p>
                <div className="relative">
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {sqlGenerated}
                  </pre>
                  <Button
                    onClick={copySQL}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-800 mb-2">Após Adicionar a Role</h4>
            <ol className="text-green-700 text-sm space-y-1">
              <li>1. Faça logout do sistema</li>
              <li>2. Faça login novamente</li>
              <li>3. Acesse: <code>http://localhost:8080/admin/ai-management</code></li>
              <li>4. A página do AI Manager deve carregar normalmente</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPermissionsDebug;