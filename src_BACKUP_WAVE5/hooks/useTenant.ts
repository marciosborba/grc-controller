import { useCurrentTenantId, useTenantSelector } from '@/contexts/TenantSelectorContext';
import { useAuth } from '@/contexts/AuthContextOptimized';

/**
 * Hook para obter informações do tenant atual de forma global
 * Este hook deve ser usado em todos os componentes que precisam do tenant ID
 * para garantir consistência entre todas as páginas
 */
export const useTenant = () => {
  const { user } = useAuth();
  const { selectedTenantId, getSelectedTenant, isGlobalTenantSelection } = useTenantSelector();
  
  const isPlatformAdmin = user?.isPlatformAdmin || user?.roles?.includes('platform_admin');
  const selectedTenant = getSelectedTenant();
  
  return {
    // ID do tenant atual (considerando seleção global para platform admins)
    tenantId: selectedTenantId,
    
    // Informações do tenant selecionado (se disponível)
    tenant: selectedTenant,
    
    // Se o usuário é platform admin e pode selecionar tenants
    canSelectTenant: isPlatformAdmin,
    
    // Se a seleção global está ativa
    isGlobalSelection: isGlobalTenantSelection,
    
    // Dados do usuário autenticado
    user
  };
};

/**
 * Hook simplificado que retorna apenas o tenant ID atual
 * Útil para componentes que só precisam do ID
 */
export const useTenantId = (): string => {
  return useCurrentTenantId();
};

/**
 * Hook para validar se o tenant atual é válido
 * Retorna informações sobre a validade do tenant
 */
export const useTenantValidation = () => {
  const { tenantId, tenant, user } = useTenant();
  
  const isValid = Boolean(tenantId);
  const hasData = Boolean(tenant);
  const isUserTenant = tenantId === user?.tenantId;
  
  return {
    isValid,
    hasData,
    isUserTenant,
    tenantId,
    validationMessage: !isValid 
      ? 'Nenhum tenant selecionado' 
      : !hasData 
        ? 'Dados do tenant não disponíveis' 
        : 'Tenant válido'
  };
};