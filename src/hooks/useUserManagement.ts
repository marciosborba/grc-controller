import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type {
  ExtendedUser,
  UserManagementFilters,
  UserManagementStats,
  CreateUserRequest,
  UpdateUserRequest,
  BulkUserAction,
  UserActivitySummary,
  AppRole
} from '@/types/user-management';

export const useUserManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserManagementFilters>({});

  // Verificar permissões do usuário
  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || user?.roles?.includes('admin') || false;
  };

  // Buscar usuários com filtros
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: async (): Promise<ExtendedUser[]> => {
      if (!hasPermission('users.read')) {
        return [];
      }

      try {
        // Primeiro, buscar apenas os profiles básicos
        let query = supabase
          .from('profiles')
          .select('*');

        // Aplicar filtros básicos
        if (filters.search) {
          query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        if (filters.status === 'active') {
          query = query.eq('is_active', true);
        } else if (filters.status === 'inactive') {
          query = query.eq('is_active', false);
        }

        if (filters.department) {
          query = query.eq('department', filters.department);
        }

        if (filters.mfa_enabled !== undefined) {
          query = query.eq('two_factor_enabled', filters.mfa_enabled);
        }

        if (filters.last_login_days) {
          const date = new Date();
          date.setDate(date.getDate() - filters.last_login_days);
          query = query.gte('last_login_at', date.toISOString());
        }

        const { data: profiles, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar profiles:', error);
          return [];
        }

        if (!profiles || profiles.length === 0) {
          return [];
        }

        // Buscar roles para cada usuário
        const userIds = profiles.map(p => p.user_id);
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        // Transformar dados para o formato ExtendedUser
        return profiles.map((profile: any) => {
          const roles = userRoles?.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role) || [];
          
          // Filtrar por role se especificado
          if (filters.role && !roles.includes(filters.role)) {
            return null;
          }

          return {
            id: profile.user_id,
            email: profile.email || `user-${profile.user_id}@example.com`,
            profile: {
              ...profile,
              // Garantir que campos obrigatórios existam
              full_name: profile.full_name || 'Nome não definido',
              is_active: profile.is_active ?? true,
              two_factor_enabled: profile.two_factor_enabled ?? false,
              login_count: profile.login_count ?? 0,
              failed_login_attempts: profile.failed_login_attempts ?? 0,
              timezone: profile.timezone || 'America/Sao_Paulo',
              language: profile.language || 'pt-BR',
              notification_preferences: profile.notification_preferences || {
                email: true,
                push: true,
                sms: false
              }
            },
            roles,
            permissions: profile.permissions || [],
            mfa: null, // Será carregado separadamente se necessário
            sessions: [], // Será carregado separadamente se necessário
            tenant: null, // Será carregado separadamente se necessário
            last_activity: profile.last_login_at,
            is_online: false
          };
        }).filter(Boolean) as ExtendedUser[];
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Buscar estatísticas de usuários
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<UserManagementStats> => {
      if (!hasPermission('users.read')) {
        return {
          total_users: 0,
          active_users: 0,
          inactive_users: 0,
          locked_users: 0,
          mfa_enabled_users: 0,
          users_by_role: {
            admin: 0,
            ciso: 0,
            risk_manager: 0,
            compliance_officer: 0,
            auditor: 0,
            user: 0
          },
          recent_logins: 0,
          failed_login_attempts: 0
        };
      }

      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('is_active, locked_until, two_factor_enabled, last_login_at, failed_login_attempts, user_id');

        if (error) {
          console.error('Erro ao buscar estatísticas:', error);
          return {
            total_users: 0,
            active_users: 0,
            inactive_users: 0,
            locked_users: 0,
            mfa_enabled_users: 0,
            users_by_role: {
              admin: 0,
              ciso: 0,
              risk_manager: 0,
              compliance_officer: 0,
              auditor: 0,
              user: 0
            },
            recent_logins: 0,
            failed_login_attempts: 0
          };
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const stats: UserManagementStats = {
          total_users: profiles?.length || 0,
          active_users: profiles?.filter(p => p.is_active && (!p.locked_until || new Date(p.locked_until) <= now)).length || 0,
          inactive_users: profiles?.filter(p => !p.is_active).length || 0,
          locked_users: profiles?.filter(p => p.locked_until && new Date(p.locked_until) > now).length || 0,
          mfa_enabled_users: profiles?.filter(p => p.two_factor_enabled).length || 0,
          users_by_role: {
            admin: 0,
            ciso: 0,
            risk_manager: 0,
            compliance_officer: 0,
            auditor: 0,
            user: 0
          },
          recent_logins: profiles?.filter(p => 
            p.last_login_at && new Date(p.last_login_at) > sevenDaysAgo
          ).length || 0,
          failed_login_attempts: profiles?.reduce((sum, p) => sum + (p.failed_login_attempts || 0), 0) || 0
        };

        // Buscar roles separadamente
        try {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role');

          userRoles?.forEach((ur: any) => {
            if (ur.role in stats.users_by_role) {
              stats.users_by_role[ur.role as AppRole]++;
            }
          });
        } catch (roleError) {
          console.warn('Erro ao buscar roles para estatísticas:', roleError);
        }

        return stats;
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
          total_users: 0,
          active_users: 0,
          inactive_users: 0,
          locked_users: 0,
          mfa_enabled_users: 0,
          users_by_role: {
            admin: 0,
            ciso: 0,
            risk_manager: 0,
            compliance_officer: 0,
            auditor: 0,
            user: 0
          },
          recent_logins: 0,
          failed_login_attempts: 0
        };
      }
    },
    enabled: !!user
  });

  // Criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      if (!hasPermission('users.create')) {
        throw new Error('Sem permissão para criar usuários');
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.send_invitation ? undefined : 'temp-password-123',
        email_confirm: !userData.send_invitation,
        user_metadata: {
          full_name: userData.full_name,
          job_title: userData.job_title
        }
      });

      if (authError) throw authError;

      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: userData.full_name,
          job_title: userData.job_title,
          department: userData.department,
          phone: userData.phone,
          tenant_id: userData.tenant_id,
          permissions: userData.permissions || [],
          must_change_password: userData.must_change_password || userData.send_invitation
        });

      if (profileError) throw profileError;

      // Atribuir roles
      if (userData.roles.length > 0) {
        const roleInserts = userData.roles.map(role => ({
          user_id: authData.user.id,
          role
        }));

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(roleInserts);

        if (rolesError) throw rolesError;
      }

      // Log da atividade
      try {
        await supabase.rpc('rpc_log_activity', {
          p_user_id: user?.id,
          p_action: 'user_created',
          p_resource_type: 'users',
          p_resource_id: authData.user.id,
          p_details: {
            created_user_email: userData.email,
            roles: userData.roles
          }
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('Usuário criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    }
  });

  // Atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: UpdateUserRequest }) => {
      if (!hasPermission('users.update')) {
        throw new Error('Sem permissão para editar usuários');
      }

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update(userData)
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Atualizar roles se fornecidas
      if (userData.roles) {
        // Remover roles existentes
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Adicionar novas roles
        if (userData.roles.length > 0) {
          const roleInserts = userData.roles.map(role => ({
            user_id: userId,
            role
          }));

          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleInserts);

          if (rolesError) throw rolesError;
        }
      }

      // Log da atividade
      try {
        await supabase.rpc('rpc_log_activity', {
          p_user_id: user?.id,
          p_action: 'user_updated',
          p_resource_type: 'users',
          p_resource_id: userId,
          p_details: userData as any
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    }
  });

  // Excluir usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!hasPermission('users.delete')) {
        throw new Error('Sem permissão para excluir usuários');
      }

      // Excluir do Supabase Auth (cascata para outras tabelas)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      // Log da atividade
      try {
        await supabase.rpc('rpc_log_activity', {
          p_user_id: user?.id,
          p_action: 'user_deleted',
          p_resource_type: 'users',
          p_resource_id: userId
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('Usuário excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    }
  });

  // Ação em lote
  const bulkActionMutation = useMutation({
    mutationFn: async (action: BulkUserAction) => {
      if (!hasPermission('users.update')) {
        throw new Error('Sem permissão para executar ações em lote');
      }

      const results = [];

      for (const userId of action.user_ids) {
        try {
          switch (action.action) {
            case 'activate':
              await supabase
                .from('profiles')
                .update({ is_active: true, locked_until: null })
                .eq('user_id', userId);
              break;

            case 'deactivate':
              await supabase
                .from('profiles')
                .update({ is_active: false })
                .eq('user_id', userId);
              break;

            case 'unlock':
              await supabase
                .from('profiles')
                .update({ locked_until: null, failed_login_attempts: 0 })
                .eq('user_id', userId);
              break;

            case 'reset_password':
              await supabase.auth.admin.updateUserById(userId, {
                password: action.parameters?.new_password || 'temp-password-123'
              });
              await supabase
                .from('profiles')
                .update({ must_change_password: true })
                .eq('user_id', userId);
              break;

            case 'assign_role':
              if (action.parameters?.role) {
                await supabase
                  .from('user_roles')
                  .insert({ user_id: userId, role: action.parameters.role });
              }
              break;

            case 'delete':
              await supabase.auth.admin.deleteUser(userId);
              break;
          }

          results.push({ userId, success: true });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }

      // Log da atividade
      try {
        await supabase.rpc('rpc_log_activity', {
          p_user_id: user?.id,
          p_action: `bulk_${action.action}`,
          p_resource_type: 'users',
          p_details: {
            action: action.action,
            user_ids: action.user_ids,
            results
          }
        });
      } catch (logError) {
        console.warn('Erro ao registrar log:', logError);
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed === 0) {
        toast.success(`Ação executada com sucesso em ${successful} usuários`);
      } else {
        toast.warning(`Ação executada em ${successful} usuários. ${failed} falharam.`);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro na ação em lote: ${error.message}`);
    }
  });

  // Buscar atividade do usuário
  const getUserActivity = async (userId: string): Promise<UserActivitySummary> => {
    if (!hasPermission('logs.read')) {
      return {
        user_id: userId,
        total_logins: 0,
        last_login: '',
        failed_attempts: 0,
        active_sessions: 0,
        recent_activities: []
      };
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('login_count, last_login_at, failed_login_attempts')
        .eq('user_id', userId)
        .single();

      let sessions = [];
      let activities = [];

      // Tentar buscar sessões (pode não existir a tabela)
      try {
        // Por enquanto não temos tabela de sessões, deixar vazio
        sessions = [];
      } catch (sessionError) {
        console.warn('Tabela user_sessions não encontrada:', sessionError);
      }

      // Tentar buscar atividades (pode não existir a tabela)
      try {
        const { data: activitiesData } = await supabase
          .from('activity_logs')
          .select('action, created_at, ip_address, details')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        activities = activitiesData || [];
      } catch (activityError) {
        console.warn('Erro ao buscar activity_logs:', activityError);
      }

      return {
        user_id: userId,
        total_logins: profile?.login_count || 0,
        last_login: profile?.last_login_at || '',
        failed_attempts: profile?.failed_login_attempts || 0,
        active_sessions: sessions.length,
        recent_activities: activities.map(activity => ({
          action: activity.action,
          timestamp: activity.created_at,
          ip_address: activity.ip_address,
          details: activity.details
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar atividade do usuário:', error);
      return {
        user_id: userId,
        total_logins: 0,
        last_login: '',
        failed_attempts: 0,
        active_sessions: 0,
        recent_activities: []
      };
    }
  };

  return {
    // Data
    users,
    stats,
    filters,
    
    // Loading states
    isLoadingUsers,
    isLoadingStats,
    
    // Errors
    usersError,
    
    // Actions
    setFilters,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    bulkAction: bulkActionMutation.mutate,
    getUserActivity,
    
    // Loading states for mutations
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isBulkActionLoading: bulkActionMutation.isPending,
    
    // Permissions
    hasPermission
  };
};