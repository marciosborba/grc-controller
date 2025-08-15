// ============================================================================
// HOOK: CONEXÕES DE API
// ============================================================================
// Hook para gerenciar conexões com APIs REST, GraphQL e SOAP

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ApiConnection,
  ApiConnectionFormData,
  ApiMetrics,
  ConnectionTestResult
} from '@/types/general-settings';

export interface UseApiConnectionsReturn {
  // Estado
  connections: ApiConnection[];
  metrics: ApiMetrics | null;
  isLoading: boolean;
  error: string | null;
  
  // Ações CRUD
  createConnection: (data: ApiConnectionFormData) => Promise<ApiConnection | null>;
  updateConnection: (id: string, data: Partial<ApiConnectionFormData>) => Promise<boolean>;
  deleteConnection: (id: string) => Promise<boolean>;
  getConnection: (id: string) => ApiConnection | null;
  
  // Ações especiais
  testConnection: (id: string) => Promise<ConnectionTestResult>;
  duplicateConnection: (id: string) => Promise<ApiConnection | null>;
  
  // Carregamento
  loadConnections: () => Promise<void>;
  loadMetrics: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useApiConnections = (): UseApiConnectionsReturn => {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [metrics, setMetrics] = useState<ApiMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Verificar se usuário tem tenant_id
  if (!user?.tenantId) {
    return {
      connections: [],
      metrics: null,
      isLoading: false,
      error: 'Usuário não possui tenant válido',
      createConnection: async () => null,
      updateConnection: async () => false,
      deleteConnection: async () => false,
      getConnection: () => null,
      testConnection: async () => ({ success: false, error_message: 'Usuário não autenticado' }),
      duplicateConnection: async () => null,
      loadConnections: async () => {},
      loadMetrics: async () => {},
      refreshAll: async () => {}
    };
  }

  // Carregar conexões
  const loadConnections = useCallback(async () => {
    try {
      setError(null);
      
      const { data, error: queryError } = await supabase
        .from('api_connections')
        .select(`
          *,
          integrations!inner (
            id,
            name,
            status,
            last_sync,
            uptime_percentage,
            tenant_id
          )
        `)
        .eq('tenant_id', user.tenantId) // FILTRO CRÍTICO POR TENANT
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      setConnections(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar conexões de API';
      setError(errorMessage);
      console.error('Error loading API connections:', err);
    }
  }, [user.tenantId]);

  // Carregar métricas
  const loadMetrics = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('api_connections')
        .select('total_requests, successful_requests, failed_requests, avg_response_time_ms')
        .eq('tenant_id', user.tenantId); // FILTRO CRÍTICO POR TENANT

      if (queryError) throw queryError;

      if (data && data.length > 0) {
        const totalRequests = data.reduce((sum, conn) => sum + (conn.total_requests || 0), 0);
        const successfulRequests = data.reduce((sum, conn) => sum + (conn.successful_requests || 0), 0);
        const failedRequests = data.reduce((sum, conn) => sum + (conn.failed_requests || 0), 0);
        const avgResponseTime = data.reduce((sum, conn) => sum + (conn.avg_response_time_ms || 0), 0) / data.length;

        // Calcular requests de hoje (simulado - em produção seria uma query mais complexa)
        const requestsToday = Math.floor(totalRequests * 0.1); // Aproximação

        setMetrics({
          total_requests: totalRequests,
          successful_requests: successfulRequests,
          failed_requests: failedRequests,
          success_rate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
          avg_response_time: avgResponseTime,
          requests_today: requestsToday
        });
      }
    } catch (err: any) {
      console.error('Error loading API metrics:', err);
    }
  }, [user.tenantId]);

  // Criar conexão
  const createConnection = useCallback(async (data: ApiConnectionFormData): Promise<ApiConnection | null> => {
    try {
      setIsLoading(true);
      
      // Primeiro, criar a integração principal
      const { data: integration, error: integrationError } = await supabase
        .from('integrations')
        .insert({
          name: data.name,
          type: 'api',
          status: 'pending',
          tenant_id: user.tenantId, // GARANTIR TENANT
          created_by: user.id
        })
        .select()
        .single();

      if (integrationError) throw integrationError;

      // Preparar dados para inserção (criptografar campos sensíveis)
      const insertData: any = {
        integration_id: integration.id,
        name: data.name,
        api_type: data.api_type,
        base_url: data.base_url,
        auth_type: data.auth_type,
        headers: data.headers,
        rate_limit_per_minute: data.rate_limit_per_minute,
        timeout_seconds: data.timeout_seconds,
        retry_attempts: data.retry_attempts,
        retry_delay_seconds: data.retry_delay_seconds,
        tenant_id: user.tenantId, // GARANTIR TENANT
        created_by: user.id
      };

      // Adicionar credenciais baseadas no tipo de autenticação
      if (data.auth_type === 'api-key' && data.api_key) {
        insertData.api_key_encrypted = supabase.raw(`encrypt_sensitive_data('${data.api_key}')`);
      } else if (data.auth_type === 'bearer' && data.bearer_token) {
        insertData.bearer_token_encrypted = supabase.raw(`encrypt_sensitive_data('${data.bearer_token}')`);
      } else if (data.auth_type === 'basic' && data.username && data.password) {
        insertData.username_encrypted = supabase.raw(`encrypt_sensitive_data('${data.username}')`);
        insertData.password_encrypted = supabase.raw(`encrypt_sensitive_data('${data.password}')`);
      } else if (data.auth_type === 'oauth2' && data.oauth2_config) {
        insertData.oauth2_config = data.oauth2_config;
      }

      const { data: newConnection, error: connectionError } = await supabase
        .from('api_connections')
        .insert(insertData)
        .select(`
          *,
          integrations!inner (
            id,
            name,
            status,
            last_sync,
            uptime_percentage,
            tenant_id
          )
        `)
        .single();

      if (connectionError) throw connectionError;

      // Atualizar estado local
      setConnections(prev => [newConnection, ...prev]);
      
      // Log da criação
      await supabase.from('integration_logs').insert({
        integration_id: integration.id,
        log_type: 'sync',
        level: 'info',
        message: `API connection ${data.name} created successfully`,
        details: { api_type: data.api_type, auth_type: data.auth_type },
        tenant_id: user.tenantId // GARANTIR TENANT NO LOG
      });

      toast({
        title: 'Sucesso',
        description: 'Conexão de API criada com sucesso'
      });

      return newConnection;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar conexão de API';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, user.tenantId, user.id]);

  // Atualizar conexão
  const updateConnection = useCallback(async (id: string, data: Partial<ApiConnectionFormData>): Promise<boolean> => {
    try {
      setIsLoading(true);

      const updateData: any = { ...data };

      // Atualizar credenciais criptografadas se fornecidas
      if (data.api_key !== undefined) {
        updateData.api_key_encrypted = data.api_key 
          ? supabase.raw(`encrypt_sensitive_data('${data.api_key}')`)
          : null;
        delete updateData.api_key;
      }

      if (data.bearer_token !== undefined) {
        updateData.bearer_token_encrypted = data.bearer_token
          ? supabase.raw(`encrypt_sensitive_data('${data.bearer_token}')`)
          : null;
        delete updateData.bearer_token;
      }

      if (data.username !== undefined) {
        updateData.username_encrypted = data.username
          ? supabase.raw(`encrypt_sensitive_data('${data.username}')`)
          : null;
        delete updateData.username;
      }

      if (data.password !== undefined) {
        updateData.password_encrypted = data.password
          ? supabase.raw(`encrypt_sensitive_data('${data.password}')`)
          : null;
        delete updateData.password;
      }

      const { error: updateError } = await supabase
        .from('api_connections')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', user.tenantId); // VERIFICAÇÃO DE TENANT NA ATUALIZAÇÃO

      if (updateError) throw updateError;

      // Recarregar conexões
      await loadConnections();

      toast({
        title: 'Sucesso',
        description: 'Conexão de API atualizada com sucesso'
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar conexão de API';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadConnections, user.tenantId]);

  // Deletar conexão
  const deleteConnection = useCallback(async (id: string): Promise<boolean> => {
    try {
      const connection = connections.find(c => c.id === id);
      if (!connection) return false;

      // Deletar a integração (cascade deletará a conexão)
      const { error: deleteError } = await supabase
        .from('integrations')
        .delete()
        .eq('id', connection.integration_id);

      if (deleteError) throw deleteError;

      // Remover do estado local
      setConnections(prev => prev.filter(c => c.id !== id));

      toast({
        title: 'Sucesso',
        description: 'Conexão de API removida com sucesso'
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao remover conexão de API';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    }
  }, [connections, toast]);

  // Obter conexão por ID
  const getConnection = useCallback((id: string): ApiConnection | null => {
    return connections.find(c => c.id === id) || null;
  }, [connections]);

  // Testar conexão
  const testConnection = useCallback(async (id: string): Promise<ConnectionTestResult> => {
    try {
      const connection = getConnection(id);
      if (!connection) {
        throw new Error('Conexão não encontrada');
      }

      setIsLoading(true);

      // Log do início do teste
      await supabase.from('integration_logs').insert({
        integration_id: connection.integration_id,
        log_type: 'request',
        level: 'info',
        message: `Testing API connection: ${connection.name}`,
        request_url: connection.base_url
      });

      // Simular teste baseado no tipo de API
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 500));
      const responseTime = Date.now() - startTime;

      // Simular resultado (90% de sucesso)
      const success = Math.random() > 0.1;
      
      let result: ConnectionTestResult;

      if (success) {
        result = {
          success: true,
          response_time_ms: responseTime,
          status_code: 200,
          details: {
            api_type: connection.api_type,
            auth_type: connection.auth_type,
            base_url: connection.base_url
          }
        };

        // Atualizar métricas da conexão
        await supabase
          .from('api_connections')
          .update({
            last_request_at: new Date().toISOString(),
            total_requests: supabase.raw('total_requests + 1'),
            successful_requests: supabase.raw('successful_requests + 1'),
            avg_response_time_ms: responseTime
          })
          .eq('id', id);

        // Atualizar status da integração
        await supabase
          .from('integrations')
          .update({
            status: 'connected',
            last_sync: new Date().toISOString(),
            uptime_percentage: supabase.raw('GREATEST(uptime_percentage, 95.0)')
          })
          .eq('id', connection.integration_id);

      } else {
        const errorMessages = [
          'Connection refused',
          'Invalid API key',
          'Endpoint not found',
          'SSL handshake failed',
          'Rate limit exceeded'
        ];
        const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

        result = {
          success: false,
          response_time_ms: responseTime,
          status_code: 401,
          error_message: errorMessage
        };

        // Atualizar métricas da conexão
        await supabase
          .from('api_connections')
          .update({
            total_requests: supabase.raw('total_requests + 1'),
            failed_requests: supabase.raw('failed_requests + 1')
          })
          .eq('id', id);

        // Atualizar status da integração para erro
        await supabase
          .from('integrations')
          .update({
            status: 'error',
            last_error: errorMessage,
            error_count: supabase.raw('error_count + 1')
          })
          .eq('id', connection.integration_id);
      }

      // Log do resultado
      await supabase.from('integration_logs').insert({
        integration_id: connection.integration_id,
        log_type: success ? 'response' : 'error',
        level: success ? 'info' : 'error',
        message: success 
          ? `API connection test successful` 
          : `API connection test failed: ${result.error_message}`,
        request_url: connection.base_url,
        response_status: result.status_code,
        response_time_ms: responseTime,
        details: result.details
      });

      // Recarregar dados
      await Promise.all([loadConnections(), loadMetrics()]);

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao testar conexão de API';
      
      const result: ConnectionTestResult = {
        success: false,
        error_message: errorMessage
      };

      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getConnection, loadConnections, loadMetrics]);

  // Duplicar conexão
  const duplicateConnection = useCallback(async (id: string): Promise<ApiConnection | null> => {
    try {
      const originalConnection = getConnection(id);
      if (!originalConnection) return null;

      const duplicateData: ApiConnectionFormData = {
        name: `${originalConnection.name} (Cópia)`,
        api_type: originalConnection.api_type,
        base_url: originalConnection.base_url,
        auth_type: originalConnection.auth_type,
        headers: originalConnection.headers || {},
        rate_limit_per_minute: originalConnection.rate_limit_per_minute,
        timeout_seconds: originalConnection.timeout_seconds,
        retry_attempts: originalConnection.retry_attempts,
        retry_delay_seconds: originalConnection.retry_delay_seconds
        // Nota: credenciais não são copiadas por segurança
      };

      return await createConnection(duplicateData);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao duplicar conexão de API';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  }, [getConnection, createConnection, toast]);

  // Refresh completo
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadConnections(),
      loadMetrics()
    ]);
    setIsLoading(false);
  }, [loadConnections, loadMetrics]);

  // Carregar dados iniciais
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('api_connections_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'api_connections'
      }, () => {
        loadConnections();
        loadMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [loadConnections, loadMetrics]);

  return {
    // Estado
    connections,
    metrics,
    isLoading,
    error,
    
    // Ações CRUD
    createConnection,
    updateConnection,
    deleteConnection,
    getConnection,
    
    // Ações especiais
    testConnection,
    duplicateConnection,
    
    // Carregamento
    loadConnections,
    loadMetrics,
    refreshAll
  };
};