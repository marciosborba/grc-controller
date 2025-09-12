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
        .in('role', ['admin', 'super_admin', 'platform_admin']);

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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
        .in('role', ['admin', 'super_admin', 'platform_admin'])
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platform Admins</p>
                  <p className="text-2xl font-bold">{stats.platform_admins_count}</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admin Roles</p>
                  <p className="text-2xl font-bold">{stats.admin_roles_count}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Para Migrar</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.users_to_migrate}</p>
                </div>
                <Upload className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Roles Órfãs</p>
                  <p className="text-2xl font-bold text-red-600">{stats.orphaned_roles}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Migração</CardTitle>
          <CardDescription>
            Execute as ações na ordem recomendada para garantir segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={executeMigration}
              disabled={migrating || !stats || stats.users_to_migrate === 0}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {migrating ? 'Migrando...' : `Migrar Usuários (${stats?.users_to_migrate || 0})`}
            </Button>

            <Button
              variant="outline"
              onClick={executeCleanup}
              disabled={cleaning || !stats || stats.orphaned_roles > 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {cleaning ? 'Limpando...' : 'Limpar Roles Redundantes'}
            </Button>
          </div>

          {stats && stats.orphaned_roles > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Atenção</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Execute primeiro a migração antes de fazer a limpeza das roles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Administrativos</CardTitle>
          <CardDescription>
            Status atual dos usuários com permissões administrativas
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
                    {adminUser.in_platform_table ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Platform Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Apenas Role
                      </Badge>
                    )}
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