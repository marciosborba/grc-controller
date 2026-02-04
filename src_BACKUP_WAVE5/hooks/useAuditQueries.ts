import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

interface QueryConfig {
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
}

interface BatchQueryResult<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOptimizedQueries<T extends Record<string, any>>(
  queries: Record<string, QueryConfig>
): Record<string, BatchQueryResult<T[keyof T]>> & {
  loadAll: () => Promise<void>;
  isAnyLoading: boolean;
} {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [results, setResults] = useState<Record<string, BatchQueryResult>>(() => {
    const initial: Record<string, BatchQueryResult> = {};
    Object.keys(queries).forEach(key => {
      initial[key] = {
        data: [],
        loading: true,
        error: null,
        refresh: () => Promise.resolve()
      };
    });
    return initial;
  });

  // Executar queries em paralelo (não sequencial)
  const executeQueries = useCallback(async () => {
    if (!effectiveTenantId) return;

    // Criar todas as promises em paralelo
    const queryPromises = Object.entries(queries).map(async ([key, config]) => {
      try {
        setResults(prev => ({
          ...prev,
          [key]: { ...prev[key], loading: true, error: null }
        }));

        let query = supabase
          .from(config.tableName)
          .select(config.select || '*')
          .eq('tenant_id', effectiveTenantId);

        // Aplicar filtros
        if (config.filters) {
          Object.entries(config.filters).forEach(([filterKey, filterValue]) => {
            if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
              query = query.eq(filterKey, filterValue);
            }
          });
        }

        // Aplicar ordenação
        if (config.orderBy) {
          query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending });
        }

        // Aplicar limite
        if (config.limit) {
          query = query.limit(config.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { key, data: data || [], error: null };
      } catch (error: any) {
        console.error(`Erro na query ${key}:`, error);
        return { 
          key, 
          data: [], 
          error: error.message || 'Erro ao carregar dados' 
        };
      }
    });

    // Aguardar todas as queries em paralelo
    const queryResults = await Promise.all(queryPromises);

    // Atualizar resultados
    setResults(prev => {
      const newResults = { ...prev };
      queryResults.forEach(({ key, data, error }) => {
        newResults[key] = {
          ...prev[key],
          data,
          error,
          loading: false
        };
      });
      return newResults;
    });
  }, [effectiveTenantId, queries]);

  // Criar funções refresh individuais
  useEffect(() => {
    setResults(prev => {
      const newResults = { ...prev };
      Object.keys(queries).forEach(key => {
        newResults[key] = {
          ...prev[key],
          refresh: async () => {
            if (!effectiveTenantId) return;
            
            const config = queries[key];
            try {
              setResults(current => ({
                ...current,
                [key]: { ...current[key], loading: true, error: null }
              }));

              let query = supabase
                .from(config.tableName)
                .select(config.select || '*')
                .eq('tenant_id', effectiveTenantId);

              if (config.filters) {
                Object.entries(config.filters).forEach(([filterKey, filterValue]) => {
                  if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
                    query = query.eq(filterKey, filterValue);
                  }
                });
              }

              if (config.orderBy) {
                query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending });
              }

              if (config.limit) {
                query = query.limit(config.limit);
              }

              const { data, error } = await query;
              if (error) throw error;

              setResults(current => ({
                ...current,
                [key]: {
                  ...current[key],
                  data: data || [],
                  loading: false,
                  error: null
                }
              }));
            } catch (error: any) {
              setResults(current => ({
                ...current,
                [key]: {
                  ...current[key],
                  data: [],
                  loading: false,
                  error: error.message || 'Erro ao carregar dados'
                }
              }));
            }
          }
        };
      });
      return newResults;
    });
  }, [effectiveTenantId, queries]);

  // Carregar todas as queries na inicialização
  useEffect(() => {
    if (effectiveTenantId) {
      executeQueries();
    }
  }, [effectiveTenantId, executeQueries]);

  // Verificar se alguma query está carregando
  const isAnyLoading = useMemo(() => {
    return Object.values(results).some(result => result.loading);
  }, [results]);

  return {
    ...results,
    loadAll: executeQueries,
    isAnyLoading
  };
}

// Hook específico para dados de auditoria
export function useAuditDashboardData() {
  return useOptimizedQueries({
    projetos: {
      tableName: 'projetos_auditoria',
      select: `
        *,
        universo_auditavel:universo_auditavel_id(codigo, nome),
        profiles:chefe_auditoria(full_name)
      `,
      orderBy: { column: 'data_inicio', ascending: false },
      limit: 10
    },
    universo: {
      tableName: 'universo_auditavel',
      select: '*',
      orderBy: { column: 'risco_inerente', ascending: false },
      limit: 20
    },
    trabalhos: {
      tableName: 'trabalhos_auditoria',
      select: `
        *,
        profiles:auditor_lider(full_name)
      `,
      filters: { status: 'em_andamento' },
      orderBy: { column: 'data_inicio_planejada', ascending: true }
    },
    riscos: {
      tableName: 'audit_risk_assessments',
      select: '*',
      orderBy: { column: 'residual_risk_score', ascending: false },
      limit: 15
    }
  });
}

// Hook para planejamento com queries otimizadas
export function usePlanejamentoData() {
  return useOptimizedQueries({
    planos: {
      tableName: 'planos_auditoria_anuais',
      select: '*',
      orderBy: { column: 'ano_exercicio', ascending: false }
    },
    trabalhos: {
      tableName: 'trabalhos_auditoria',
      select: '*',
      orderBy: { column: 'prioridade', ascending: true }
    },
    recursos: {
      tableName: 'orcamento_auditoria',
      select: '*',
      orderBy: { column: 'created_at', ascending: false }
    }
  });
}

// Cache simples para evitar re-queries desnecessárias
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function useCachedQuery<T = any>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos default
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(async (forceRefresh = false) => {
    const cached = queryCache.get(key);
    const now = Date.now();

    // Verificar cache válido
    if (!forceRefresh && cached && (now - cached.timestamp) < cached.ttl) {
      setData(cached.data);
      setLoading(false);
      return cached.data;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await queryFn();
      
      // Salvar no cache
      queryCache.set(key, {
        data: result,
        timestamp: now,
        ttl
      });

      setData(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao carregar dados';
      setError(errorMsg);
      console.error(`Cache query error for ${key}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [key, queryFn, ttl]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  return {
    data,
    loading,
    error,
    refresh: () => executeQuery(true),
    refetch: () => executeQuery(true)
  };
}