import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';
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
    // Admins da plataforma têm todas as permissões
    if (user?.isPlatformAdmin) {
      console.log(`[hasPermission] Platform admin has permission: ${permission}`);
      return true;
    }
    
    const hasDirectPermission = user?.permissions?.includes(permission);
    const isSystemAdmin = user?.roles?.includes('admin');
    
    console.log(`[hasPermission] Checking permission "${permission}": direct=${hasDirectPermission}, isAdmin=${isSystemAdmin}, roles=${JSON.stringify(user?.roles)}`);
    
    return hasDirectPermission || isSystemAdmin || false;
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

        // Filtrar por tenant se não for admin da plataforma
        if (!user?.isPlatformAdmin) {
          query = query.eq('tenant_id', user?.tenantId);
        }

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

        // Buscar dados de tenant para os usuários
        const uniqueTenantIds = [...new Set(profiles.map(p => p.tenant_id).filter(Boolean))];
        const { data: tenants } = uniqueTenantIds.length > 0 ? await supabase
          .from('tenants')
          .select('id, name, slug, contact_email, max_users, current_users_count, subscription_plan, is_active')
          .in('id', uniqueTenantIds)
        : { data: [] };

        // Transformar dados para o formato ExtendedUser
        return profiles.map((profile: any) => {
          const roles = userRoles?.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role) || [];
          
          // Filtrar por role se especificado
          if (filters.role && !roles.includes(filters.role)) {
            return null;
          }

          // Encontrar tenant correspondente
          const tenant = profile.tenant_id 
            ? tenants?.find(t => t.id === profile.tenant_id) || null
            : null;

          // Debug específico para Marcio Borba
          if (profile.email === 'adm@grc-controller.com' || profile.full_name === 'Marcio Borba') {
            console.log('🔍 DEBUG Marcio Borba - Dados do banco:', {
              user_id: profile.user_id,
              full_name: profile.full_name,
              email: profile.email,
              login_count: profile.login_count,
              last_login_at: profile.last_login_at,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            });
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
            tenant,
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
        let query = supabase
          .from('profiles')
          .select('is_active, locked_until, two_factor_enabled, last_login_at, failed_login_attempts, user_id, tenant_id');

        // Filtrar por tenant se não for admin da plataforma
        if (!user?.isPlatformAdmin) {
          query = query.eq('tenant_id', user?.tenantId);
        }

        const { data: profiles, error } = await query;

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

        // Carregar dados reais de autenticação do Supabase Auth
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUsersList = authUsers?.users || [];

        // Calcular usuários realmente logados (últimas 24 horas)
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentlyLoggedIn = authUsersList.filter(authUser => 
          authUser.last_sign_in_at && new Date(authUser.last_sign_in_at) > last24Hours
        ).length;

        // Calcular usuários ativos baseado na combinação de profiles ativos E auth users
        const totalUsers = profiles?.length || 0;
        const activeProfileUsers = profiles?.filter(p => p.is_active && (!p.locked_until || new Date(p.locked_until) <= now)).length || 0;
        const lockedUsers = profiles?.filter(p => p.locked_until && new Date(p.locked_until) > now).length || 0;
        
        // Verificar usuários bloqueados no auth
        const bannedAuthUsers = authUsersList.filter(authUser => authUser.banned_until).length;
        const totalLockedUsers = lockedUsers + bannedAuthUsers;

        const stats: UserManagementStats = {
          total_users: totalUsers,
          active_users: activeProfileUsers,
          inactive_users: (profiles?.filter(p => !p.is_active).length || 0),
          locked_users: totalLockedUsers,
          mfa_enabled_users: profiles?.filter(p => p.two_factor_enabled).length || 0,
          users_by_role: {
            admin: 0,
            ciso: 0,
            risk_manager: 0,
            compliance_officer: 0,
            auditor: 0,
            user: 0
          },
          recent_logins: recentlyLoggedIn, // Agora usa dados reais do auth
          failed_login_attempts: profiles?.reduce((sum, p) => sum + (p.failed_login_attempts || 0), 0) || 0
        };

        // Buscar roles separadamente e filtrar por tenant se necessário
        try {
          let roleQuery = supabase
            .from('user_roles')
            .select('role, user_id');

          // Se não for platform admin, filtrar pelos usuários do tenant
          if (!user?.isPlatformAdmin && profiles) {
            const userIdsInTenant = profiles.map(p => p.user_id);
            roleQuery = roleQuery.in('user_id', userIdsInTenant);
          }

          const { data: userRoles } = await roleQuery;

          // Contar roles únicos por usuário
          const roleCountMap = new Map<string, Set<string>>();
          
          userRoles?.forEach((ur: any) => {
            if (!roleCountMap.has(ur.user_id)) {
              roleCountMap.set(ur.user_id, new Set());
            }
            roleCountMap.get(ur.user_id)!.add(ur.role);
          });

          // Contar usuários por role (um usuário pode ter múltiplos roles)
          roleCountMap.forEach((roles) => {
            roles.forEach((role) => {
              if (role in stats.users_by_role) {
                stats.users_by_role[role as AppRole]++;
              }
            });
          });
          
          // Contar usuários sem role definida como 'user'
          const usersWithRoles = roleCountMap.size;
          const usersWithoutRoles = Math.max(0, totalUsers - usersWithRoles);
          stats.users_by_role.user += usersWithoutRoles;
          
        } catch (roleError) {
          console.warn('Erro ao buscar roles para estatísticas:', roleError);
          // Se falhar, assumir que todos são usuários básicos
          stats.users_by_role.user = totalUsers;
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
      console.log(`[createUser] Checking permissions - isPlatformAdmin: ${user?.isPlatformAdmin}`);
      console.log(`[createUser] User roles: ${JSON.stringify(user?.roles)}`);
      console.log(`[createUser] User permissions: ${JSON.stringify(user?.permissions)}`);
      
      if (!hasPermission('users.create')) {
        console.error('[createUser] Permission denied - missing users.create permission');
        throw new Error('Sem permissão para criar usuários. Verifique se você é administrador da plataforma ou possui a role admin.');
      }

      // Determinar tenant_id
      let targetTenantId = userData.tenant_id;
      
      // Se não for admin da plataforma, usar o tenant do usuário atual
      if (!user?.isPlatformAdmin) {
        targetTenantId = user?.tenantId;
      }

      if (!targetTenantId) {
        throw new Error('Tenant ID é obrigatório');
      }

      // Verificar limite de usuários do tenant (apenas para não-admins da plataforma)
      if (!user?.isPlatformAdmin) {
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('max_users, current_users_count')
          .eq('id', targetTenantId)
          .single();

        if (tenantError) throw new Error('Erro ao verificar limites do tenant');

        if (tenant.current_users_count >= tenant.max_users) {
          throw new Error(`Limite de usuários atingido (${tenant.max_users}). Contate o administrador da plataforma.`);
        }
      }

      // Preparar dados para Edge Function
      const functionData = {
        email: userData.email,
        password: userData.send_invitation ? undefined : 'temp-password-123',
        full_name: userData.full_name,
        job_title: userData.job_title,
        department: userData.department,
        phone: userData.phone,
        tenant_id: targetTenantId,
        roles: userData.roles,
        permissions: userData.permissions || [],
        send_invitation: userData.send_invitation,
        must_change_password: userData.must_change_password
      };
      
      console.log('[createUser] Calling Edge Function with data:', {
        email: functionData.email,
        full_name: functionData.full_name,
        tenant_id: functionData.tenant_id,
        roles: functionData.roles,
        send_invitation: functionData.send_invitation
      });

      // Criar usuário usando Edge Function (necessário para auth.admin.createUser)
      const { data: result, error: functionError } = await supabase.functions.invoke('create-user-admin', {
        body: functionData
      });

      if (functionError) {
        console.error('[createUser] Edge function error:', functionError);
        console.error('[createUser] Error type:', typeof functionError);
        console.error('[createUser] Error properties:', Object.keys(functionError));
        
        if (functionError.context) {
          console.error('[createUser] Error context status:', functionError.context.status);
          console.error('[createUser] Error context statusText:', functionError.context.statusText);
          
          // Tentar ler corpo da resposta
          try {
            if (functionError.context.clone) {
              const errorBody = await functionError.context.clone().text();
              console.error('[createUser] Error response body:', errorBody);
              
              // Tentar parsear como JSON
              try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.error) {
                  throw new Error(`Erro na criação do usuário: ${errorJson.error}`);
                }
              } catch (parseError) {
                // Se não conseguir parsear, usar mensagem padrão
              }
            }
          } catch (bodyError) {
            console.error('[createUser] Erro ao ler corpo da resposta:', bodyError);
          }
        }
        
        throw new Error(`Erro na criação do usuário: ${functionError.message || 'Edge Function retornou erro'}`);
      }

      if (!result?.success) {
        const errorMsg = result?.error || 'Erro desconhecido na criação do usuário';
        console.error('[createUser] Edge function returned error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[createUser] Usuário criado com sucesso via Edge Function:', result.user);
      return result.user;
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

      // Verificar se o usuário pertence ao mesmo tenant (exceto platform admins)
      if (!user?.isPlatformAdmin) {
        const { data: targetUser, error: checkError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', userId)
          .single();
        
        if (checkError) {
          throw new Error('Usuário não encontrado');
        }
        
        if (targetUser.tenant_id !== user?.tenantId) {
          throw new Error('Sem permissão para editar usuários de outro tenant');
        }
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

      // Verificar se o usuário pertence ao mesmo tenant (exceto platform admins)
      if (!user?.isPlatformAdmin) {
        const { data: targetUser, error: checkError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', userId)
          .single();
        
        if (checkError) {
          throw new Error('Usuário não encontrado');
        }
        
        if (targetUser.tenant_id !== user?.tenantId) {
          throw new Error('Sem permissão para excluir usuários de outro tenant');
        }
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

      // Verificar se todos os usuários pertencem ao mesmo tenant (exceto platform admins)
      if (!user?.isPlatformAdmin) {
        const { data: targetUsers, error: checkError } = await supabase
          .from('profiles')
          .select('user_id, tenant_id')
          .in('user_id', action.user_ids);
        
        if (checkError) {
          throw new Error('Erro ao verificar usuários');
        }
        
        const invalidUsers = targetUsers?.filter(u => u.tenant_id !== user?.tenantId) || [];
        if (invalidUsers.length > 0) {
          throw new Error(`Sem permissão para editar ${invalidUsers.length} usuário(s) de outro tenant`);
        }
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