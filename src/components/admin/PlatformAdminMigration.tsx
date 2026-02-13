/**
 * MIGRAÇÃO DE SEGURANÇA: PLATFORM ADMINS
 * 
 * Componente para migrar usuários administrativos para a tabela platform_admins
 * e implementar as recomendações de segurança.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Trash2,
  Download,
  Upload,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

interface AdminUser {
  user_id: string;
  full_name: string;
  email: string;
  roles?: string[];
  in_platform_table: boolean;
  in_roles_table: boolean;
  created_at?: string;
}

interface MigrationStats {
  platform_admins_count: number;
  admin_roles_count: number;
  users_to_migrate: number;
  orphaned_roles: number;
}

const PlatformAdminMigration: React.FC = () => {
  const { user } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const hasPermission = user?.isPlatformAdmin || false;

  // Carregar dados atuais
  const loadCurrentState = async () => {
    try {
      setLoading(true);

      // Buscar usuários na tabela platform_admins
      const { data: platformAdmins, error: platformError } = await supabase
        .from('platform_admins')
        .select('user_id, created_at');

      if (platformError) throw platformError;

      // Buscar usuários com roles administrativas
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'super_admin']);

      if (rolesError) throw rolesError;

      // Buscar perfis dos usuários
      const allUserIds = [
        ...new Set([
          ...(platformAdmins?.map(pa => pa.user_id) || []),
          ...(adminRoles?.map(ar => ar.user_id) || [])
        ])
      ];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', allUserIds);

      if (profilesError) throw profilesError;

      // Combinar dados
      const combinedUsers: AdminUser[] = profiles?.map(profile => {
        const platformAdmin = platformAdmins?.find(pa => pa.user_id === profile.user_id);
        const userRoles = adminRoles?.filter(ar => ar.user_id === profile.user_id);

        return {
          user_id: profile.user_id,
          full_name: profile.full_name || 'Nome não informado',
          email: profile.email || 'Email não informado',
          roles: userRoles?.map(ur => ur.role) || [],
          in_platform_table: !!platformAdmin,
          in_roles_table: (userRoles?.length || 0) > 0,
          created_at: platformAdmin?.created_at
        };
      }) || [];

      setAdminUsers(combinedUsers);

      // Calcular estatísticas
      const migrationStats: MigrationStats = {
        platform_admins_count: platformAdmins?.length || 0,
        admin_roles_count: adminRoles?.length || 0,
        users_to_migrate: combinedUsers.filter(u => u.in_roles_table && !u.in_platform_table).length,
        orphaned_roles: combinedUsers.filter(u => u.in_roles_table && !u.in_platform_table).length
      };

      setStats(migrationStats);

      console.log('📊 [MIGRATION] Current state loaded:', {
        combinedUsers,
        migrationStats
      });

    } catch (error: any) {
      console.error('❌ [MIGRATION] Error loading current state:', error);
      toast.error('Erro ao carregar estado atual: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Executar migração
  const executeMigration = async () => {
    try {
      setMigrating(true);

      // Buscar usuários que precisam ser migrados
      const usersToMigrate = adminUsers.filter(u => u.in_roles_table && !u.in_platform_table);

      if (usersToMigrate.length === 0) {
        toast.info('Nenhum usuário precisa ser migrado');
        return;
      }

      console.log('🚀 [MIGRATION] Starting migration for users:', usersToMigrate);

      // Inserir usuários na tabela platform_admins
      const { error: insertError } = await supabase
        .from('platform_admins')
        .insert(
          usersToMigrate.map(user => ({
            user_id: user.user_id,

            created_at: new Date().toISOString()
          }))
        );

      if (insertError) throw insertError;

      toast.success(`✅ Migração concluída! ${usersToMigrate.length} usuários migrados para platform_admins`);

      // Recarregar dados
      await loadCurrentState();

    } catch (error: any) {
      console.error('❌ [MIGRATION] Migration failed:', error);
      toast.error('Erro na migração: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  // Limpeza de roles (após migração)
  const executeCleanup = async () => {
    try {
      setCleaning(true);

      // Verificar se todos os usuários com roles admin estão na tabela platform_admins
      const usersWithOrphanedRoles = adminUsers.filter(u => u.in_roles_table && !u.in_platform_table);

      if (usersWithOrphanedRoles.length > 0) {
        toast.error(`❌ Não é possível fazer limpeza: ${usersWithOrphanedRoles.length} usuários com roles admin não estão na tabela platform_admins`);
        return;
      }

      // Remover roles administrativas redundantes
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .in('role', ['admin', 'super_admin'])
        .in('user_id', adminUsers.filter(u => u.in_platform_table).map(u => u.user_id));

      if (deleteError) throw deleteError;

      toast.success('✅ Limpeza concluída! Roles administrativas redundantes removidas');

      // Recarregar dados
      await loadCurrentState();

    } catch (error: any) {
      console.error('❌ [MIGRATION] Cleanup failed:', error);
      toast.error('Erro na limpeza: ' + error.message);
    } finally {
      setCleaning(false);
    }
  };

  // Remover role de super_admin
  const handleRemoveSuperAdmin = async (userId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'super_admin');

      if (error) throw error;

      toast.success('Role super_admin removida com sucesso');
      await loadCurrentState();
    } catch (error: any) {
      console.error('Error removing super_admin:', error);
      toast.error('Erro ao remover super_admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remover acesso de platform_admin
  const handleRemovePlatformAdmin = async (userId: string) => {
    // Prevenir auto-remoção
    if (userId === user?.id) {
      toast.error('Por segurança, você não pode remover seu próprio acesso de administrador por aqui.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('platform_admins')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Acesso de Platform Admin removido com sucesso');
      await loadCurrentState();
    } catch (error: any) {
      console.error('Error removing platform_admin:', error);
      toast.error('Erro ao remover acesso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (hasPermission) {
      loadCurrentState();
    }
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="mx-auto h-12 w-12 mb-4" />
            <p>Acesso restrito a administradores da plataforma.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Migração de Platform Admins
          </h2>
          <p className="text-muted-foreground">
            Migração de segurança para tabela platform_admins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCurrentState}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-500">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Database className="h-24 w-24 text-blue-500" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Admins</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.platform_admins_count}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-green-500">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="h-24 w-24 text-green-500" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Roles</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.admin_roles_count}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-orange-500">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Upload className="h-24 w-24 text-orange-500" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                <Upload className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Para Migrar</p>
                <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-500">{stats.users_to_migrate}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertTriangle className="h-24 w-24 text-red-500" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Roles Órfãs</p>
                <h3 className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.orphaned_roles}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Administrativos</CardTitle>
          <CardDescription>
            Gerencie individualmente a migração e limpeza de cada usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum usuário administrativo encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminUsers.map((adminUser) => (
                <div
                  key={adminUser.user_id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{adminUser.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                      </div>
                    </div>

                    {adminUser.roles && adminUser.roles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {adminUser.roles.map((role, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badges */}
                    {adminUser.in_platform_table ? (
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Platform Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Apenas Role
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 ml-4 border-l pl-4">
                      {/* 1. MIGRAR: Se tem role mas não tá na tabela */}
                      {adminUser.in_roles_table && !adminUser.in_platform_table && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={async () => {
                            try {
                              setLoading(true);
                              const { error } = await supabase.from('platform_admins').insert({
                                user_id: adminUser.user_id,
                                created_at: new Date().toISOString()
                              });
                              if (error) throw error;
                              toast.success('Usuário migrado com sucesso!');
                              await loadCurrentState();
                            } catch (e: any) {
                              toast.error('Erro ao migrar: ' + e.message);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Migrar
                        </Button>
                      )}

                      {/* 2. LIMPAR: Se tá na tabela, mas ainda tem roles antigas */}
                      {adminUser.in_platform_table && adminUser.in_roles_table && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={async () => {
                            try {
                              setLoading(true);
                              const { error } = await supabase.from('user_roles').delete()
                                .eq('user_id', adminUser.user_id)
                                .in('role', ['admin', 'super_admin']);
                              if (error) throw error;
                              toast.success('Roles legadas removidas!');
                              await loadCurrentState();
                            } catch (e: any) {
                              toast.error('Erro ao limpar: ' + e.message);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Limpar Legacy
                        </Button>
                      )}

                      {/* 3. REMOVER SUPER ADMIN */}
                      {adminUser.roles && adminUser.roles.includes('super_admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveSuperAdmin(adminUser.user_id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover Super
                        </Button>
                      )}

                      {/* 4. REMOVER PLATFORM ADMIN */}
                      {adminUser.in_platform_table && user?.id !== adminUser.user_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 border-l border-red-200 ml-2 pl-2"
                          onClick={() => handleRemovePlatformAdmin(adminUser.user_id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover Admin
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAdminMigration;