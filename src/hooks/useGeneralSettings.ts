// ============================================================================
// HOOK: CONFIGURAÇÕES GERAIS
// ============================================================================
// Hook principal para gerenciar todas as integrações do módulo

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Integration,
  IntegrationStats,
  IntegrationLog,
  IntegrationType,
  IntegrationStatus,
  ConnectionTestResult
} from '@/types/general-settings';

export interface UseGeneralSettingsReturn {
  // Estado
  integrations: Integration[];
  stats: IntegrationStats | null;
  recentLogs: IntegrationLog[];
  isLoading: boolean;
  error: string | null;
  
  // Ações
  loadIntegrations: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadRecentLogs: () => Promise<void>;
  updateIntegrationStatus: (id: string, status: IntegrationStatus, error?: string) => Promise<void>;
  deleteIntegration: (id: string) => Promise<boolean>;
  testConnection: (integrationId: string) => Promise<ConnectionTestResult>;
  refreshAll: () => Promise<void>;
}

export const useGeneralSettings = (): UseGeneralSettingsReturn => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<IntegrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Verificar se usuário tem tenant_id
  if (!user?.tenantId) {
    return {
      integrations: [],
      stats: null,
      recentLogs: [],
      isLoading: false,
      error: 'Usuário não possui tenant válido',
      loadIntegrations: async () => {},
      loadStats: async () => {},
      loadRecentLogs: async () => {},
      updateIntegrationStatus: async () => {},
      deleteIntegration: async () => false,
      testConnection: async () => ({ success: false, error_message: 'Usuário não autenticado' }),
      refreshAll: async () => {}
    };
  }

  // Carregar integrações
  const loadIntegrations = useCallback(async () => {
    try {
      setError(null);
      
      const { data, error: queryError } = await supabase
        .from('integrations')
        .select('*')
        .eq('tenant_id', user.tenantId) // FILTRO CRÍTICO POR TENANT
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setIntegrations(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar integrações';
      setError(errorMessage);
      console.error('Error loading integrations:', err);
    }
  }, [user.tenantId]);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      // Buscar dados para calcular estatísticas - FILTRADO POR TENANT
      const { data, error: queryError } = await supabase
        .from('integrations')
        .select('type, status, uptime_percentage')
        .eq('tenant_id', user.tenantId); // FILTRO CRÍTICO POR TENANT

      if (queryError) throw queryError;

      if (data) {
        // Calcular estatísticas
        const total = data.length;
        const connected = data.filter(i => i.status === 'connected').length;
        const disconnected = data.filter(i => i.status === 'disconnected').length;
        const error = data.filter(i => i.status === 'error').length;
        const pending = data.filter(i => i.status === 'pending').length;
        
        const avgUptime = data.length > 0 
          ? data.reduce((sum, i) => sum + (i.uptime_percentage || 0), 0) / data.length 
          : 0;

        // Agrupar por tipo
        const byType = data.reduce((acc, item) => {
          acc[item.type as IntegrationType] = (acc[item.type as IntegrationType] || 0) + 1;
          return acc;
        }, {} as Record<IntegrationType, number>);

        setStats({
          total_integrations: total,
          connected,
          disconnected,
          error,
          pending,
          avg_uptime: Math.round(avgUptime * 100) / 100,
          by_type: byType
        });
      }
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  }, [user.tenantId]);

  // Carregar logs recentes
  const loadRecentLogs = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('integration_logs')
        .select(`
          *,
          integrations!inner (
            name,
            tenant_id
          )
        `)
        .eq('tenant_id', user.tenantId) // FILTRO CRÍTICO POR TENANT
        .order('created_at', { ascending: false })
        .limit(50);

      if (queryError) throw queryError;

      setRecentLogs(data || []);
    } catch (err: any) {
      console.error('Error loading recent logs:', err);
    }
  }, [user.tenantId]);

  // Atualizar status da integração
  const updateIntegrationStatus = useCallback(async (
    id: string, 
    status: IntegrationStatus, 
    error?: string
  ): Promise<void> => {
    try {
      const updateData: any = {
        status,
        last_sync: status === 'connected' ? new Date().toISOString() : undefined
      };

      if (status === 'error' && error) {
        updateData.last_error = error;
        // Incrementar contador de erro via SQL
        const { data: currentIntegration } = await supabase
          .from('integrations')
          .select('error_count')
          .eq('id', id)
          .eq('tenant_id', user.tenantId)
          .single();
        
        updateData.error_count = (currentIntegration?.error_count || 0) + 1;
      } else if (status === 'connected') {
        updateData.last_error = null;
        updateData.error_count = 0;
      }

      const { error: updateError } = await supabase
        .from('integrations')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', user.tenantId); // VERIFICAÇÃO DE TENANT NA ATUALIZAÇÃO

      if (updateError) throw updateError;

      // Atualizar estado local
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              status, 
              last_error: error || null,
              last_sync: status === 'connected' ? new Date().toISOString() : integration.last_sync
            }
          : integration
      ));

      // Log da ação
      await supabase.from('integration_logs').insert({
        integration_id: id,
        log_type: 'sync',
        level: status === 'error' ? 'error' : 'info',
        message: `Status updated to ${status}`,
        details: error ? { error } : null,
        tenant_id: user.tenantId // GARANTIR TENANT NO LOG
      });

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar status da integração';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  }, [toast, user.tenantId]);

  // Deletar integração
  const deleteIntegration = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id)
        .eq('tenant_id', user.tenantId); // VERIFICAÇÃO DE TENANT NA DELEÇÃO

      if (deleteError) throw deleteError;

      // Remover do estado local
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Integração removida com sucesso'
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao remover integração';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, user.tenantId]);

  // Testar conexão
  const testConnection = useCallback(async (integrationId: string): Promise<ConnectionTestResult> => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) {
        throw new Error('Integração não encontrada');
      }

      // Log do início do teste
      await supabase.from('integration_logs').insert({
        integration_id: integrationId,
        log_type: 'request',
        level: 'info',
        message: 'Starting connection test',
        tenant_id: user.tenantId // GARANTIR TENANT NO LOG
      });

      // Simular teste de conexão baseado no tipo
      const startTime = Date.now();
      
      // Simulação realística de teste
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      const responseTime = Date.now() - startTime;
      const success = Math.random() > 0.1; // 90% de chance de sucesso

      let result: ConnectionTestResult;

      if (success) {
        result = {
          success: true,
          response_time_ms: responseTime,
          status_code: 200,
          details: {
            message: 'Connection successful',
            timestamp: new Date().toISOString()
          }
        };

        // Atualizar status para conectado
        await updateIntegrationStatus(integrationId, 'connected');
      } else {
        const errorMessages = [
          'Connection timeout',
          'Invalid credentials',
          'Service unavailable',
          'Rate limit exceeded'
        ];
        const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

        result = {
          success: false,
          response_time_ms: responseTime,
          error_message: errorMessage,
          details: {
            error_code: 'CONNECTION_FAILED',
            timestamp: new Date().toISOString()
          }
        };

        // Atualizar status para erro
        await updateIntegrationStatus(integrationId, 'error', errorMessage);
      }

      // Log do resultado
      await supabase.from('integration_logs').insert({
        integration_id: integrationId,
        log_type: success ? 'response' : 'error',
        level: success ? 'info' : 'error',
        message: success ? 'Connection test successful' : `Connection test failed: ${result.error_message}`,
        response_status: result.status_code,
        response_time_ms: responseTime,
        details: result.details,
        tenant_id: user.tenantId // GARANTIR TENANT NO LOG
      });

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao testar conexão';
      
      const result: ConnectionTestResult = {
        success: false,
        error_message: errorMessage
      };

      // Log do erro
      await supabase.from('integration_logs').insert({
        integration_id: integrationId,
        log_type: 'error',
        level: 'error',
        message: `Connection test error: ${errorMessage}`,
        details: { error: errorMessage },
        tenant_id: user.tenantId // GARANTIR TENANT NO LOG
      });

      return result;
    }
  }, [integrations, updateIntegrationStatus, user.tenantId]);

  // Refresh de todos os dados
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadIntegrations(),
      loadStats(),
      loadRecentLogs()
    ]);
    setIsLoading(false);
  }, [loadIntegrations, loadStats, loadRecentLogs]);

  // Carregar dados iniciais
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Configurar real-time subscriptions com filtro por tenant
  useEffect(() => {
    if (!user.tenantId) return;

    // Subscription para mudanças na tabela integrations do tenant específico
    const integrationSubscription = supabase
      .channel(`integrations_changes_${user.tenantId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'integrations',
        filter: `tenant_id=eq.${user.tenantId}` // FILTRO CRÍTICO POR TENANT
      }, (payload: any) => {
        console.log('Integration change detected for tenant:', user.tenantId, payload);
        // Recarregar apenas se a mudança é do tenant atual
        const newTenantId = payload.new?.tenant_id;
        const oldTenantId = payload.old?.tenant_id;
        
        if (newTenantId === user.tenantId || oldTenantId === user.tenantId) {
          loadIntegrations();
          loadStats();
        }
      })
      .subscribe();

    // Subscription para logs de integração do tenant específico
    const logsSubscription = supabase
      .channel(`integration_logs_changes_${user.tenantId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'integration_logs',
        filter: `tenant_id=eq.${user.tenantId}` // FILTRO CRÍTICO POR TENANT
      }, (payload: any) => {
        console.log('Integration log change detected for tenant:', user.tenantId, payload);
        // Recarregar apenas se o log é do tenant atual
        const newTenantId = payload.new?.tenant_id;
        
        if (newTenantId === user.tenantId) {
          loadRecentLogs();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(integrationSubscription);
      supabase.removeChannel(logsSubscription);
    };
  }, [loadIntegrations, loadStats, loadRecentLogs, user.tenantId]);

  return {
    // Estado
    integrations,
    stats,
    recentLogs,
    isLoading,
    error,
    
    // Ações
    loadIntegrations,
    loadStats,
    loadRecentLogs,
    updateIntegrationStatus,
    deleteIntegration,
    testConnection,
    refreshAll
  };
};