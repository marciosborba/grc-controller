import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AvailableTenant {
  id: string;
  name: string;
  slug: string;
  subscription_plan: string;
  is_active: boolean;
  created_at: string;
}

interface TenantSelectorContextType {
  // Estado atual
  selectedTenantId: string;
  availableTenants: AvailableTenant[];
  loadingTenants: boolean;
  
  // Ações
  setSelectedTenantId: (tenantId: string) => void;
  refreshTenants: () => Promise<void>;
  
  // Helpers
  getSelectedTenant: () => AvailableTenant | null;
  isGlobalTenantSelection: boolean;
}

const TenantSelectorContext = createContext<TenantSelectorContextType | undefined>(undefined);

const STORAGE_KEY = 'grc-selected-tenant-id';

export const TenantSelectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedTenantId, setSelectedTenantIdState] = useState<string>('');
  const [availableTenants, setAvailableTenants] = useState<AvailableTenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const isPlatformAdmin = user?.isPlatformAdmin || user?.roles?.includes('platform_admin');
  const isGlobalTenantSelection = isPlatformAdmin;

  // Determinar tenant ID efetivo
  const getEffectiveTenantId = (): string => {
    if (isPlatformAdmin) {
      return selectedTenantId || user?.tenantId || '';
    }
    return user?.tenantId || '';
  };

  // Persistir seleção no localStorage
  const setSelectedTenantId = (tenantId: string) => {
    setSelectedTenantIdState(tenantId);
    if (isPlatformAdmin && tenantId) {
      localStorage.setItem(STORAGE_KEY, tenantId);
    }
  };

  // Carregar tenants disponíveis
  const loadAvailableTenants = async () => {
    if (!isPlatformAdmin) return;
    
    try {
      setLoadingTenants(true);
      console.log('🔄 [TENANT_SELECTOR] Carregando tenants disponíveis...');
      
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, name, slug, subscription_plan, is_active, created_at')
        .eq('is_active', true)
        .order('name');
        
      if (error) {
        console.error('❌ [TENANT_SELECTOR] Erro ao carregar tenants:', error);
        toast.error('Erro ao carregar organizações disponíveis');
        return;
      }

      const validTenants = (tenants || []).filter(t => t.id && t.name);
      setAvailableTenants(validTenants);
      
      console.log(`✅ [TENANT_SELECTOR] ${validTenants.length} tenants carregados`);
      
      // Auto-selecionar primeira tenant se não houver seleção
      if (validTenants.length > 0 && !selectedTenantId) {
        // Tentar recuperar do localStorage primeiro
        const savedTenantId = localStorage.getItem(STORAGE_KEY);
        const tenantToSelect = validTenants.find(t => t.id === savedTenantId) 
          ? savedTenantId 
          : validTenants[0].id;
          
        if (tenantToSelect) {
          console.log('🎯 [TENANT_SELECTOR] Auto-selecionando tenant:', tenantToSelect);
          setSelectedTenantId(tenantToSelect);
        }
      }
      
    } catch (error) {
      console.error('❌ [TENANT_SELECTOR] Erro inesperado:', error);
    } finally {
      setLoadingTenants(false);
    }
  };

  // Buscar tenant selecionado
  const getSelectedTenant = (): AvailableTenant | null => {
    return availableTenants.find(t => t.id === selectedTenantId) || null;
  };

  // Carregar tenants quando usuário for platform admin
  useEffect(() => {
    if (isPlatformAdmin) {
      loadAvailableTenants();
    } else if (user?.tenantId) {
      // Para usuários normais, usar o tenant ID do usuário
      setSelectedTenantIdState(user.tenantId);
    }
  }, [isPlatformAdmin, user?.tenantId]);

  // Recuperar seleção salva do localStorage
  useEffect(() => {
    if (isPlatformAdmin) {
      const savedTenantId = localStorage.getItem(STORAGE_KEY);
      if (savedTenantId && !selectedTenantId) {
        setSelectedTenantIdState(savedTenantId);
      }
    }
  }, [isPlatformAdmin]);

  const value: TenantSelectorContextType = {
    selectedTenantId: getEffectiveTenantId(),
    availableTenants,
    loadingTenants,
    setSelectedTenantId,
    refreshTenants: loadAvailableTenants,
    getSelectedTenant,
    isGlobalTenantSelection
  };

  return (
    <TenantSelectorContext.Provider value={value}>
      {children}
    </TenantSelectorContext.Provider>
  );
};

export const useTenantSelector = () => {
  const context = useContext(TenantSelectorContext);
  if (context === undefined) {
    throw new Error('useTenantSelector must be used within a TenantSelectorProvider');
  }
  return context;
};

// Hook para obter o tenant ID efetivo
export const useCurrentTenantId = (): string => {
  const { selectedTenantId } = useTenantSelector();
  return selectedTenantId;
};

// Hook para verificar se é platform admin com seleção global
export const useGlobalTenantSelection = () => {
  const { isGlobalTenantSelection, availableTenants, selectedTenantId, setSelectedTenantId } = useTenantSelector();
  return {
    isEnabled: isGlobalTenantSelection,
    availableTenants,
    selectedTenantId,
    setSelectedTenantId
  };
};