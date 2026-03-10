import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PermissionCheck {
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
  canManageUsers: boolean;
  canAccessTenant: (tenantId: string) => boolean;
  userTenantId: string | null;
  isLoading: boolean;
}

export const usePermissions = (): PermissionCheck => {
  const [permissions, setPermissions] = useState<PermissionCheck>({
    isPlatformAdmin: false,
    isTenantAdmin: false,
    canManageUsers: false,
    canAccessTenant: () => false,
    userTenantId: null,
    isLoading: true
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPermissions(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Buscar profile do usuário
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Buscar roles do usuário
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      // Verificar se é platform admin
      const { data: platformAdmin } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const isPlatformAdmin = !!platformAdmin;
      const isTenantAdmin = userRoles?.some(r => ['admin', 'tenant_admin'].includes(r.role)) || false;
      const canManageUsers = isPlatformAdmin || isTenantAdmin;
      const userTenantId = userProfile?.tenant_id || null;

      const canAccessTenant = (tenantId: string): boolean => {
        // Platform Admin pode acessar qualquer tenant
        if (isPlatformAdmin) return true;
        
        // Tenant Admin só pode acessar sua própria tenant
        if (isTenantAdmin && userTenantId === tenantId) return true;
        
        return false;
      };

      setPermissions({
        isPlatformAdmin,
        isTenantAdmin,
        canManageUsers,
        canAccessTenant,
        userTenantId,
        isLoading: false
      });

    } catch (error) {
      console.error('❌ [PERMISSIONS] Erro ao verificar permissões:', error);
      setPermissions(prev => ({ ...prev, isLoading: false }));
    }
  };

  return permissions;
};