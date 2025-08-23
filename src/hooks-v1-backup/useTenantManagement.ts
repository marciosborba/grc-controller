import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  billing_email?: string;
  max_users: number;
  current_users_count: number;
  subscription_plan: string;
  subscription_status: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  contact_email: string;
  contact_phone?: string;
  billing_email?: string;
  max_users: number;
  subscription_plan: string;
  settings?: Record<string, any>;
}

export interface UpdateTenantRequest {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  billing_email?: string;
  max_users?: number;
  subscription_plan?: string;
  subscription_status?: string;
  is_active?: boolean;
  settings?: Record<string, any>;
}

export interface TenantStats {
  total_tenants: number;
  active_tenants: number;
  inactive_tenants: number;
  total_users_across_tenants: number;
  tenants_by_plan: Record<string, number>;
  tenants_near_user_limit: Tenant[];
}

export const useTenantManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Verificar se usuário tem permissão
  const hasPermission = (): boolean => {
    return user?.isPlatformAdmin || false;
  };

  // Buscar todos os tenants
  const {
    data: tenants = [],
    isLoading: isLoadingTenants,
    error: tenantsError
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: async (): Promise<Tenant[]> => {
      if (!hasPermission()) {
        return [];
      }

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && hasPermission()
  });

  // Buscar estatísticas de tenants
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['tenant-stats'],
    queryFn: async (): Promise<TenantStats> => {
      if (!hasPermission()) {
        return {
          total_tenants: 0,
          active_tenants: 0,
          inactive_tenants: 0,
          total_users_across_tenants: 0,
          tenants_by_plan: {},
          tenants_near_user_limit: []
        };
      }

      const { data: tenantData, error } = await supabase
        .from('tenants')
        .select('*');

      if (error) throw error;

      const tenants = tenantData || [];
      const stats: TenantStats = {
        total_tenants: tenants.length,
        active_tenants: tenants.filter(t => t.is_active).length,
        inactive_tenants: tenants.filter(t => !t.is_active).length,
        total_users_across_tenants: tenants.reduce((sum, t) => sum + t.current_users_count, 0),
        tenants_by_plan: {},
        tenants_near_user_limit: tenants.filter(t => 
          t.current_users_count >= t.max_users * 0.9 && t.is_active
        )
      };

      // Contar por plano
      tenants.forEach(tenant => {
        const plan = tenant.subscription_plan || 'unknown';
        stats.tenants_by_plan[plan] = (stats.tenants_by_plan[plan] || 0) + 1;
      });

      return stats;
    },
    enabled: !!user && hasPermission()
  });

  // Buscar tenant específico
  const getTenant = async (tenantId: string): Promise<Tenant | null> => {
    if (!hasPermission()) {
      throw new Error('Sem permissão para buscar tenant');
    }

    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  // Buscar usuários de um tenant
  const getTenantUsers = async (tenantId: string) => {
    if (!hasPermission()) {
      throw new Error('Sem permissão para buscar usuários do tenant');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        full_name,
        email,
        job_title,
        department,
        is_active,
        created_at,
        last_login_at
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  // Criar tenant
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: CreateTenantRequest) => {
      if (!hasPermission()) {
        throw new Error('Sem permissão para criar tenant');
      }

      const { data, error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'create',
        tenant_data: tenantData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-stats'] });
      toast.success('Tenant criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar tenant: ${error.message}`);
    }
  });

  // Atualizar tenant
  const updateTenantMutation = useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: UpdateTenantRequest }) => {
      if (!hasPermission()) {
        throw new Error('Sem permissão para atualizar tenant');
      }

      const { data: result, error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'update',
        tenant_data: data,
        tenant_id_param: tenantId
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-stats'] });
      toast.success('Tenant atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar tenant: ${error.message}`);
    }
  });

  // Excluir tenant
  const deleteTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      if (!hasPermission()) {
        throw new Error('Sem permissão para excluir tenant');
      }

      const { data, error } = await supabase.rpc('rpc_manage_tenant', {
        action: 'delete',
        tenant_id_param: tenantId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-stats'] });
      toast.success('Tenant excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir tenant: ${error.message}`);
    }
  });

  // Ativar/desativar tenant
  const toggleTenantStatusMutation = useMutation({
    mutationFn: async ({ tenantId, isActive }: { tenantId: string; isActive: boolean }) => {
      return updateTenantMutation.mutateAsync({
        tenantId,
        data: { is_active: isActive }
      });
    }
  });

  // Buscar slugs disponíveis (para validação)
  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    if (!hasPermission()) {
      return false;
    }

    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return !data;
  };

  // Gerar relatório de uso
  const generateUsageReport = async (tenantId?: string) => {
    if (!hasPermission()) {
      throw new Error('Sem permissão para gerar relatório');
    }

    let query = supabase
      .from('profiles')
      .select(`
        tenant_id,
        tenants:tenant_id (
          name,
          max_users,
          subscription_plan
        )
      `);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Processar dados para relatório
    const report = data?.reduce((acc, profile) => {
      const tenantId = profile.tenant_id;
      if (!acc[tenantId]) {
        acc[tenantId] = {
          tenant: profile.tenants,
          user_count: 0,
          utilization_percentage: 0
        };
      }
      acc[tenantId].user_count++;
      return acc;
    }, {} as Record<string, any>);

    // Calcular porcentagem de utilização
    Object.values(report || {}).forEach((item: any) => {
      if (item.tenant?.max_users) {
        item.utilization_percentage = Math.round(
          (item.user_count / item.tenant.max_users) * 100
        );
      }
    });

    return report;
  };

  return {
    // Data
    tenants,
    stats,
    
    // Loading states
    isLoadingTenants,
    isLoadingStats,
    
    // Errors
    tenantsError,
    
    // Actions
    createTenant: createTenantMutation.mutate,
    updateTenant: updateTenantMutation.mutate,
    deleteTenant: deleteTenantMutation.mutate,
    toggleTenantStatus: toggleTenantStatusMutation.mutate,
    
    // Loading states for mutations
    isCreatingTenant: createTenantMutation.isPending,
    isUpdatingTenant: updateTenantMutation.isPending,
    isDeletingTenant: deleteTenantMutation.isPending,
    isTogglingStatus: toggleTenantStatusMutation.isPending,
    
    // Utility functions
    getTenant,
    getTenantUsers,
    checkSlugAvailability,
    generateUsageReport,
    hasPermission
  };
};