import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { 
  DataDiscoverySource, 
  DataDiscoveryResult, 
  DataDiscoverySourceForm,
  PrivacyFilters,
  PrivacySort,
  PrivacyComponentState
} from '@/types/privacy-management';

export function useDataDiscovery() {
  const { user } = useAuth();
  const [sources, setSources] = useState<DataDiscoverySource[]>([]);
  const [results, setResults] = useState<DataDiscoveryResult[]>([]);
  const [state, setState] = useState<PrivacyComponentState>({
    loading: false,
    error: null,
    filters: {},
    sort: { field: 'created_at', direction: 'desc' },
    pagination: { page: 1, limit: 20, total: 0 }
  });

  // ============================================================================
  // SOURCES MANAGEMENT
  // ============================================================================

  const fetchSources = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let query = supabase
        .from('data_discovery_sources')
        .select('*');

      // Apply filters
      if (state.filters.status && state.filters.status.length > 0) {
        query = query.in('status', state.filters.status);
      }

      // Apply sorting
      query = query.order(state.sort.field, { ascending: state.sort.direction === 'asc' });

      // Apply pagination
      const from = (state.pagination.page - 1) * state.pagination.limit;
      const to = from + state.pagination.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setSources(data || []);
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, total: count || 0 },
        loading: false
      }));

    } catch (error: any) {
      console.error('Error fetching discovery sources:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao carregar fontes de dados',
        loading: false
      }));
    }
  }, [user, state.filters, state.sort, state.pagination.page, state.pagination.limit]);

  const createSource = useCallback(async (sourceData: DataDiscoverySourceForm) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('data_discovery_sources')
        .insert({
          ...sourceData,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de fontes
      setSources(prev => [data, ...prev]);

      setState(prev => ({ ...prev, loading: false }));

      return { success: true, data };

    } catch (error: any) {
      console.error('Error creating discovery source:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao criar fonte de dados',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  const updateSource = useCallback(async (id: string, updates: Partial<DataDiscoverySourceForm>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('data_discovery_sources')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de fontes
      setSources(prev => prev.map(source => source.id === id ? data : source));

      setState(prev => ({ ...prev, loading: false }));

      return { success: true, data };

    } catch (error: any) {
      console.error('Error updating discovery source:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao atualizar fonte de dados',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  const deleteSource = useCallback(async (id: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase
        .from('data_discovery_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover da lista de fontes
      setSources(prev => prev.filter(source => source.id !== id));

      setState(prev => ({ ...prev, loading: false }));

      return { success: true };

    } catch (error: any) {
      console.error('Error deleting discovery source:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao deletar fonte de dados',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  // ============================================================================
  // SCANNING FUNCTIONALITY
  // ============================================================================

  const startScan = useCallback(async (sourceId: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Atualizar status da fonte para 'scanning'
      const { error: updateError } = await supabase
        .from('data_discovery_sources')
        .update({
          status: 'scanning',
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceId);

      if (updateError) throw updateError;

      // Simular processo de descoberta (em um caso real, isso seria um job em background)
      await simulateDataDiscovery(sourceId);

      // Atualizar status de volta para 'active' e definir last_scan_at
      const { error: finalUpdateError } = await supabase
        .from('data_discovery_sources')
        .update({
          status: 'active',
          last_scan_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceId);

      if (finalUpdateError) throw finalUpdateError;

      // Recarregar fontes e resultados
      await fetchSources();
      await fetchResults(sourceId);

      setState(prev => ({ ...prev, loading: false }));

      return { success: true };

    } catch (error: any) {
      console.error('Error starting scan:', error);
      
      // Reverter status para 'error' em caso de falha
      await supabase
        .from('data_discovery_sources')
        .update({
          status: 'error',
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', sourceId);

      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao iniciar scan',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user, fetchSources]);

  // Simulação de descoberta de dados (em produção seria substituído por lógica real)
  const simulateDataDiscovery = async (sourceId: string) => {
    const mockResults = [
      {
        source_id: sourceId,
        table_name: 'users',
        field_name: 'email',
        data_category: 'contato',
        data_type: 'email',
        sensitivity_level: 'media',
        confidence_score: 0.95,
        sample_data: 'usuario@***.com',
        estimated_records: 1500,
        status: 'discovered'
      },
      {
        source_id: sourceId,
        table_name: 'users',
        field_name: 'full_name',
        data_category: 'identificacao',
        data_type: 'nome',
        sensitivity_level: 'media',
        confidence_score: 0.98,
        sample_data: 'João ***',
        estimated_records: 1500,
        status: 'discovered'
      },
      {
        source_id: sourceId,
        table_name: 'users',
        field_name: 'document_number',
        data_category: 'identificacao',
        data_type: 'cpf',
        sensitivity_level: 'alta',
        confidence_score: 0.99,
        sample_data: '123.456.***-**',
        estimated_records: 1200,
        status: 'discovered'
      },
      {
        source_id: sourceId,
        table_name: 'transactions',
        field_name: 'credit_card',
        data_category: 'financeiro',
        data_type: 'cartao_credito',
        sensitivity_level: 'critica',
        confidence_score: 0.92,
        sample_data: '**** **** **** 1234',
        estimated_records: 800,
        status: 'discovered'
      }
    ];

    // Inserir resultados simulados no banco
    const { error } = await supabase
      .from('data_discovery_results')
      .insert(mockResults);

    if (error) throw error;
  };

  // ============================================================================
  // RESULTS MANAGEMENT
  // ============================================================================

  const fetchResults = useCallback(async (sourceId?: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let query = supabase
        .from('data_discovery_results')
        .select(`
          *,
          source:data_discovery_sources(name, type)
        `);

      if (sourceId) {
        query = query.eq('source_id', sourceId);
      }

      // Apply filters
      if (state.filters.sensitivity_level && state.filters.sensitivity_level.length > 0) {
        query = query.in('sensitivity_level', state.filters.sensitivity_level);
      }

      if (state.filters.data_category && state.filters.data_category.length > 0) {
        query = query.in('data_category', state.filters.data_category);
      }

      // Apply sorting
      query = query.order(state.sort.field, { ascending: state.sort.direction === 'asc' });

      // Apply pagination
      const from = (state.pagination.page - 1) * state.pagination.limit;
      const to = from + state.pagination.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setResults(data || []);
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, total: count || 0 },
        loading: false
      }));

    } catch (error: any) {
      console.error('Error fetching discovery results:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao carregar resultados',
        loading: false
      }));
    }
  }, [user, state.filters, state.sort, state.pagination.page, state.pagination.limit]);

  const updateResultStatus = useCallback(async (resultId: string, status: 'validated' | 'classified' | 'ignored') => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('data_discovery_results')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', resultId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista de resultados
      setResults(prev => prev.map(result => result.id === resultId ? data : result));

      return { success: true, data };

    } catch (error: any) {
      console.error('Error updating result status:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  const bulkUpdateResults = useCallback(async (resultIds: string[], updates: { status?: string; sensitivity_level?: string }) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('data_discovery_results')
        .update({
          ...updates,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', resultIds)
        .select();

      if (error) throw error;

      // Atualizar lista de resultados
      setResults(prev => prev.map(result => {
        const updated = data.find(d => d.id === result.id);
        return updated || result;
      }));

      setState(prev => ({ ...prev, loading: false }));

      return { success: true, data };

    } catch (error: any) {
      console.error('Error bulk updating results:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao atualizar resultados',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const setFilters = useCallback((filters: PrivacyFilters) => {
    setState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, page: 1 } // Reset to first page when filtering
    }));
  }, []);

  const setSort = useCallback((sort: PrivacySort) => {
    setState(prev => ({ ...prev, sort }));
  }, []);

  const setPagination = useCallback((page: number, limit?: number) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page,
        limit: limit || prev.pagination.limit
      }
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Estatísticas do discovery
  const getDiscoveryStats = useCallback(() => {
    const totalSources = sources.length;
    const activeSources = sources.filter(s => s.status === 'active').length;
    const totalResults = results.length;
    const classifiedResults = results.filter(r => r.status === 'classified').length;
    const criticalData = results.filter(r => r.sensitivity_level === 'critica').length;
    
    return {
      totalSources,
      activeSources,
      totalResults,
      classifiedResults,
      criticalData,
      classificationProgress: totalResults > 0 ? Math.round((classifiedResults / totalResults) * 100) : 0
    };
  }, [sources, results]);

  return {
    // State
    sources,
    results,
    state,
    
    // Actions - Sources
    fetchSources,
    createSource,
    updateSource,
    deleteSource,
    startScan,
    
    // Actions - Results
    fetchResults,
    updateResultStatus,
    bulkUpdateResults,
    
    // Utility
    setFilters,
    setSort,
    setPagination,
    clearError,
    getDiscoveryStats
  };
}