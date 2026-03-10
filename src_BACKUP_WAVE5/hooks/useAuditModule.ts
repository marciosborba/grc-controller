import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeObject, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';
import { toast } from 'sonner';

export interface UseAuditModuleOptions {
  tableName: string;
  enableRateLimit?: boolean;
  enableAuditLog?: boolean;
}

export interface AuditModuleState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  effectiveTenantId: string | undefined;
}

export interface AuditModuleActions {
  create: (data: any) => Promise<boolean>;
  update: (id: string, data: any) => Promise<boolean>;
  delete: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  handleError: (error: any, operation: string) => void;
}

export function useAuditModule<T = any>(options: UseAuditModuleOptions) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  const rateLimitCRUD = useCRUDRateLimit();

  const [state, setState] = useState<AuditModuleState<T>>({
    data: [],
    loading: true,
    error: null,
    effectiveTenantId
  });

  // Função de loading compartilhada
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setData = useCallback((data: T[]) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  // Carregar dados
  const loadData = useCallback(async (additionalFilters: any = {}) => {
    if (!effectiveTenantId) return;

    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from(options.tableName)
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      // Aplicar filtros adicionais
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query.eq(key, value);
        }
      });

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setData(data || []);
    } catch (error: any) {
      handleError(error, 'load');
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, options.tableName, setLoading, setError, setData]);

  // Manipulação de erros padronizada
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Erro na operação ${operation}:`, error);
    const errorMessage = error?.message || `Erro ao ${operation} dados`;
    setError(errorMessage);
    toast.error(errorMessage);
  }, [setError]);

  // Rate limiting check
  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    if (!options.enableRateLimit) return true;

    try {
      await rateLimitCRUD.check();
      return true;
    } catch (error) {
      toast.error('Muitas operações. Tente novamente em alguns segundos.');
      return false;
    }
  }, [options.enableRateLimit, rateLimitCRUD]);

  // CRUD Operations com segurança aprimorada
  const create = useCallback(async (formData: any): Promise<boolean> => {
    if (!effectiveTenantId || !user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    if (!(await checkRateLimit())) return false;

    try {
      // Sanitizar dados de entrada
      const sanitizedData = sanitizeObject({
        ...formData,
        tenant_id: effectiveTenantId,
        created_by: user.id
      });

      const { data, error } = await supabase
        .from(options.tableName)
        .insert(sanitizedData)
        .select()
        .single();

      if (error) throw error;

      // Log de auditoria
      if (options.enableAuditLog && data) {
        auditLog(options.tableName, 'create', {
          record_id: data.id,
          user_id: user.id,
          tenant_id: effectiveTenantId,
          new_data: sanitizedData
        });
      }

      toast.success('Registro criado com sucesso!');
      await loadData();
      return true;
    } catch (error: any) {
      handleError(error, 'criar');
      return false;
    }
  }, [effectiveTenantId, user?.id, checkRateLimit, options, loadData, handleError]);

  const update = useCallback(async (id: string, formData: any): Promise<boolean> => {
    if (!effectiveTenantId || !user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    if (!(await checkRateLimit())) return false;

    try {
      // Buscar dados atuais para auditoria
      const { data: currentData } = await supabase
        .from(options.tableName)
        .select('*')
        .eq('id', id)
        .single();

      const sanitizedData = sanitizeObject({
        ...formData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from(options.tableName)
        .update(sanitizedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log de auditoria
      if (options.enableAuditLog && currentData && data) {
        auditLog(options.tableName, 'update', {
          record_id: id,
          user_id: user.id,
          tenant_id: effectiveTenantId,
          old_data: currentData,
          new_data: data
        });
      }

      toast.success('Registro atualizado com sucesso!');
      await loadData();
      return true;
    } catch (error: any) {
      handleError(error, 'atualizar');
      return false;
    }
  }, [effectiveTenantId, user?.id, checkRateLimit, options, loadData, handleError]);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    if (!effectiveTenantId || !user?.id) {
      toast.error('Usuário não autenticado');
      return false;
    }

    if (!(await checkRateLimit())) return false;

    try {
      // Buscar dados para auditoria
      const { data: currentData } = await supabase
        .from(options.tableName)
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from(options.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log de auditoria
      if (options.enableAuditLog && currentData) {
        auditLog(options.tableName, 'delete', {
          record_id: id,
          user_id: user.id,
          tenant_id: effectiveTenantId,
          old_data: currentData
        });
      }

      toast.success('Registro excluído com sucesso!');
      await loadData();
      return true;
    } catch (error: any) {
      handleError(error, 'excluir');
      return false;
    }
  }, [effectiveTenantId, user?.id, checkRateLimit, options, loadData, handleError]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId, loadData]);

  // Helper functions para UI (sem JSX)
  const getLoadingMessage = () => "Carregando dados de auditoria...";
  const getErrorMessage = (error: string) => `Erro no módulo de auditoria: ${error}`;

  return {
    // State
    ...state,
    
    // Actions
    create,
    update,
    delete: deleteRecord,
    refresh: () => loadData(),
    loadData,
    handleError,
    
    // Helper functions
    getLoadingMessage,
    getErrorMessage,
    
    // Utilities
    setLoading,
    setError,
    setData
  };
}

// Hook específico para dados de auditoria com configurações padrão
export function useSecureAuditData<T = any>(tableName: string) {
  return useAuditModule<T>({
    tableName,
    enableRateLimit: true,
    enableAuditLog: true
  });
}