import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  useTenantSecurity,
  tenantAccessMiddleware,
  TENANT_SECURITY_CONFIG 
} from '@/utils/tenantSecurity';
import type { 
  Risk, 
  ActionPlan, 
  Activity, 
  RiskAcceptanceLetter, 
  RiskCommunication,
  CreateRiskRequest,
  UpdateRiskRequest,
  CreateActivityRequest,
  RiskFilters,
  RiskMetrics,
  RiskLevel,
  TreatmentType,
  RiskStatus,
  ActivityStatus,
  RiskCategory
} from '@/types/risk-management';

// ============================================================================
// TIPOS PARA O HOOK OTIMIZADO
// ============================================================================

export interface RiskManagementConfig {
  enableRealTimeUpdates?: boolean;
  cacheTimeout?: number;
  enableAlexRiskIntegration?: boolean;
  enableAdvancedAnalytics?: boolean;
}

export interface AlexRiskSuggestion {
  id: string;
  type: 'analysis' | 'action' | 'insight' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  context: any;
}

export interface AdvancedAnalytics {
  correlations: Array<{
    riskId1: string;
    riskId2: string;
    correlation: number;
    type: 'positive' | 'negative' | 'neutral';
  }>;
  trends: Array<{
    period: string;
    totalRisks: number;
    highRisks: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  predictions: Array<{
    riskId: string;
    predictedLevel: RiskLevel;
    confidence: number;
    factors: string[];
  }>;
}

// ============================================================================
// HOOK PRINCIPAL OTIMIZADO
// ============================================================================

export const useRiskManagementOptimized = (config: RiskManagementConfig = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    userTenantId, 
    validateAccess, 
    enforceFilter, 
    logActivity,
    isValidTenant 
  } = useTenantSecurity();

  // Estados locais para filtros e configuração
  const [filters, setFilters] = useState<RiskFilters>({});
  const [selectedView, setSelectedView] = useState<'dashboard' | 'table' | 'kanban' | 'process'>('dashboard');
  const [alexSuggestions, setAlexSuggestions] = useState<AlexRiskSuggestion[]>([]);

  const {
    enableRealTimeUpdates = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutos
    enableAlexRiskIntegration = true,
    enableAdvancedAnalytics = true
  } = config;

  // ============================================================================
  // QUERIES OTIMIZADAS
  // ============================================================================

  // Query principal de riscos com cache inteligente
  const {
    data: risks = [],
    isLoading: isLoadingRisks,
    error: risksError,
    refetch: refetchRisks
  } = useQuery({
    queryKey: ['risks-optimized', userTenantId, filters],
    queryFn: async (): Promise<Risk[]> => {
      if (!userTenantId) {
        await logActivity('invalid_access', {
          action: 'query_risks_without_tenant',
          reason: 'No tenant ID found'
        });
        throw new Error('Acesso negado: tenant não identificado');
      }

      console.log('🔍 Fetching risks with filters:', filters);

      // Construir query dinamicamente baseada nos filtros
      let query = supabase
        .from('risk_assessments')
        .select(`
          *,
          risk_action_plans(*),
          risk_communications(*),
          risk_acceptance_letters(*)
        `)
        .eq('tenant_id', userTenantId)
        .order('created_at', { ascending: false });

      // Aplicar filtros SQL quando possível para performance
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('risk_category', filters.categories);
      }

      if (filters.levels && filters.levels.length > 0) {
        query = query.in('risk_level', filters.levels);
      }

      if (filters.statuses && filters.statuses.length > 0) {
        query = query.in('status', filters.statuses);
      }

      if (filters.dueDateFrom || filters.dueDateTo) {
        if (filters.dueDateFrom) {
          query = query.gte('due_date', filters.dueDateFrom.toISOString());
        }
        if (filters.dueDateTo) {
          query = query.lte('due_date', filters.dueDateTo.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        await logActivity('security_violation', {
          action: 'query_risks_error',
          error: error.message
        });
        throw error;
      }

      // Validar tenant em todos os registros
      const validatedData = (data || []).filter(risk => {
        if (risk.tenant_id !== userTenantId) {
          logActivity('cross_tenant_attempt', {
            action: 'risk_data_validation_failed',
            riskId: risk.id,
            riskTenant: risk.tenant_id,
            userTenant: userTenantId
          });
          return false;
        }
        return true;
      });

      // Transformar dados do Supabase para o formato da aplicação
      const transformedRisks = validatedData.map(transformSupabaseRiskToRisk);

      // Aplicar filtros adicionais em memória
      let filteredRisks = transformedRisks;

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredRisks = filteredRisks.filter(risk => 
          risk.name.toLowerCase().includes(term) ||
          risk.description?.toLowerCase().includes(term) ||
          risk.category.toLowerCase().includes(term) ||
          risk.assignedTo?.toLowerCase().includes(term)
        );
      }

      if (filters.owners && filters.owners.length > 0) {
        filteredRisks = filteredRisks.filter(risk => 
          filters.owners!.includes(risk.owner)
        );
      }

      if (filters.showOverdue) {
        const now = new Date();
        filteredRisks = filteredRisks.filter(risk => 
          risk.dueDate && risk.dueDate < now && risk.status !== 'Fechado'
        );
      }

      console.log(`✅ Loaded ${filteredRisks.length} risks (${transformedRisks.length} total)`);
      return filteredRisks;
    },
    enabled: !!user && !!userTenantId,
    staleTime: cacheTimeout,
    gcTime: cacheTimeout * 2,
    refetchOnWindowFocus: enableRealTimeUpdates,
    refetchInterval: enableRealTimeUpdates ? 30000 : false, // 30 segundos se real-time
  });

  // Query de métricas otimizada
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: ['risk-metrics-optimized', userTenantId, risks?.length],
    queryFn: async (): Promise<RiskMetrics> => {
      console.log('📊 Calculating metrics for', risks?.length || 0, 'risks');

      if (!risks || risks.length === 0) {
        return {
          totalRisks: 0,
          risksByLevel: {} as Record<RiskLevel, number>,
          risksByCategory: {} as Record<RiskCategory, number>,
          risksByStatus: {} as Record<RiskStatus, number>,
          overdueActivities: 0,
          riskTrend: 'Estável',
          averageResolutionTime: 0
        };
      }

      // Calcular métricas baseadas nos riscos já carregados
      const risksByLevel = risks.reduce((acc, risk) => {
        acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
        return acc;
      }, {} as Record<RiskLevel, number>);

      const risksByCategory = risks.reduce((acc, risk) => {
        acc[risk.category] = (acc[risk.category] || 0) + 1;
        return acc;
      }, {} as Record<RiskCategory, number>);

      const risksByStatus = risks.reduce((acc, risk) => {
        acc[risk.status] = (acc[risk.status] || 0) + 1;
        return acc;
      }, {} as Record<RiskStatus, number>);

      // Calcular atividades em atraso
      let overdueActivities = 0;
      try {
        const { data: activities } = await supabase
          .from('risk_action_activities')
          .select('deadline, status')
          .lt('deadline', new Date().toISOString())
          .neq('status', 'Concluído')
          .neq('status', 'Cancelado');
        
        overdueActivities = activities?.length || 0;
      } catch (error) {
        console.warn('Erro ao calcular atividades em atraso:', error);
      }

      // Calcular tendência (simplificado)
      const highRiskCount = (risksByLevel['Muito Alto'] || 0) + (risksByLevel['Alto'] || 0);
      const totalRisks = risks.length;
      const highRiskPercentage = totalRisks > 0 ? (highRiskCount / totalRisks) * 100 : 0;
      
      let riskTrend: 'Aumentando' | 'Diminuindo' | 'Estável' = 'Estável';
      if (highRiskPercentage > 30) riskTrend = 'Aumentando';
      if (highRiskPercentage < 10) riskTrend = 'Diminuindo';

      // Calcular tempo médio de resolução (simplificado)
      const closedRisks = risks.filter(r => r.status === 'Fechado');
      let averageResolutionTime = 0;
      if (closedRisks.length > 0) {
        const totalDays = closedRisks.reduce((acc, risk) => {
          const created = new Date(risk.createdAt);
          const updated = new Date(risk.updatedAt);
          const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0);
        averageResolutionTime = Math.round(totalDays / closedRisks.length);
      }

      const calculatedMetrics = {
        totalRisks: risks.length,
        risksByLevel,
        risksByCategory,
        risksByStatus,
        overdueActivities,
        riskTrend,
        averageResolutionTime
      };

      console.log('📊 Metrics calculated:', calculatedMetrics);
      return calculatedMetrics;
    },
    enabled: !!risks,
    staleTime: cacheTimeout / 2,
  });

  // Query para análises avançadas
  const {
    data: analytics,
    isLoading: isLoadingAnalytics
  } = useQuery({
    queryKey: ['risk-analytics', userTenantId, risks?.length],
    queryFn: async (): Promise<AdvancedAnalytics> => {
      if (!enableAdvancedAnalytics || !risks || risks.length < 2) {
        return { correlations: [], trends: [], predictions: [] };
      }

      // Análise de correlações (simplificada)
      const correlations = [];
      for (let i = 0; i < risks.length - 1; i++) {
        for (let j = i + 1; j < risks.length; j++) {
          const risk1 = risks[i];
          const risk2 = risks[j];
          
          // Correlação baseada em categoria e nível
          if (risk1.category === risk2.category) {
            correlations.push({
              riskId1: risk1.id,
              riskId2: risk2.id,
              correlation: 0.7,
              type: 'positive' as const
            });
          }
        }
      }

      // Tendências temporais (simplificada)
      const trends = [
        {
          period: 'Última semana',
          totalRisks: risks.length,
          highRisks: risks.filter(r => r.riskLevel === 'Muito Alto' || r.riskLevel === 'Alto').length,
          trend: 'stable' as const
        }
      ];

      // Predições (simplificada)
      const predictions = risks
        .filter(r => r.status === 'Em Tratamento')
        .slice(0, 5)
        .map(risk => ({
          riskId: risk.id,
          predictedLevel: 'Médio' as RiskLevel,
          confidence: 0.8,
          factors: ['Controles implementados', 'Tempo de tratamento']
        }));

      return { correlations, trends, predictions };
    },
    enabled: enableAdvancedAnalytics && !!risks && risks.length > 0,
    staleTime: cacheTimeout * 2,
  });

  // ============================================================================
  // MUTATIONS OTIMIZADAS
  // ============================================================================

  // Criar risco com otimizações
  const createRiskMutation = useMutation({
    mutationFn: async (riskData: CreateRiskRequest) => {
      const riskScore = riskData.probability * riskData.impact;
      const riskLevel = calculateRiskLevel(riskScore);

      if (!userTenantId) {
        throw new Error('Tenant ID não encontrado. Faça login novamente.');
      }

      console.log('🆕 Creating risk:', { name: riskData.name, level: riskLevel });

      const baseRiskData: any = {
        title: riskData.name,
        description: riskData.description,
        risk_category: riskData.category,
        probability: Math.max(1, Math.min(5, Math.floor(riskData.probability))),
        likelihood_score: Math.max(1, Math.min(5, Math.floor(riskData.probability))),
        impact_score: Math.max(1, Math.min(5, Math.floor(riskData.impact))),
        risk_level: riskLevel,
        status: 'Identificado',
        severity: 'medium',
        tenant_id: userTenantId
      };
      
      if (user?.id && user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        baseRiskData.created_by = user.id;
      }
      
      if (riskData.assignedTo) {
        baseRiskData.assigned_to = riskData.assignedTo;
      }
      
      if (riskData.dueDate) {
        baseRiskData.due_date = riskData.dueDate.toISOString();
      }
      
      if (riskData.analysisData) {
        baseRiskData.analysis_data = riskData.analysisData;
      }

      const { data, error } = await supabase
        .from('risk_assessments')
        .insert([baseRiskData])
        .select()
        .single();

      if (error) throw error;

      // Criar plano de ação se necessário
      if (riskData.treatmentType !== 'Aceitar') {
        await supabase
          .from('risk_action_plans')
          .insert([{
            risk_id: data.id,
            treatment_type: riskData.treatmentType,
            created_by: user?.id,
            tenant_id: userTenantId
          }]);
      }

      console.log('✅ Risk created successfully:', data.title);
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas de forma inteligente
      queryClient.invalidateQueries({ queryKey: ['risks-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics-optimized'] });
      
      if (enableAlexRiskIntegration) {
        generateAlexSuggestions([transformSupabaseRiskToRisk(data)]);
      }
      
      toast.success('Risco criado com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ Error creating risk:', error);
      toast.error(`Erro ao criar risco: ${error.message}`);
    }
  });

  // Atualizar risco com merge inteligente
  const updateRiskMutation = useMutation({
    mutationFn: async ({ riskId, data }: { riskId: string; data: UpdateRiskRequest }) => {
      const updateData: any = {};

      // Mapear campos de forma inteligente
      if (data.name) updateData.title = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category) updateData.risk_category = data.category;
      if (data.status) updateData.status = data.status;
      if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo || null;
      if (data.dueDate !== undefined) updateData.due_date = data.dueDate?.toISOString();
      if (data.analysisData !== undefined) updateData.analysis_data = data.analysisData;

      // Recalcular score se necessário
      if (data.probability || data.impact) {
        const { data: currentRisk } = await supabase
          .from('risk_assessments')
          .select('likelihood_score, impact_score')
          .eq('id', riskId)
          .single();

        const probability = data.probability || currentRisk?.likelihood_score || 1;
        const impact = data.impact || currentRisk?.impact_score || 1;
        const riskScore = probability * impact;

        updateData.likelihood_score = probability;
        updateData.impact_score = impact;
        updateData.risk_level = calculateRiskLevel(riskScore);
      }

      updateData.updated_at = new Date().toISOString();

      const { data: result, error } = await supabase
        .from('risk_assessments')
        .update(updateData)
        .eq('id', riskId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar plano de ação se necessário
      if (data.treatmentType) {
        const { data: existingPlan } = await supabase
          .from('risk_action_plans')
          .select('id')
          .eq('risk_id', riskId)
          .maybeSingle();

        if (existingPlan) {
          await supabase
            .from('risk_action_plans')
            .update({ treatment_type: data.treatmentType })
            .eq('risk_id', riskId);
        } else {
          await supabase
            .from('risk_action_plans')
            .insert([{
              risk_id: riskId,
              treatment_type: data.treatmentType,
              created_by: user?.id,
              tenant_id: userTenantId
            }]);
        }
      }

      console.log('✅ Risk updated successfully:', result.title);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics-optimized'] });
      toast.success('Risco atualizado com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ Error updating risk:', error);
      toast.error(`Erro ao atualizar risco: ${error.message}`);
    }
  });

  // Excluir risco com limpeza completa
  const deleteRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      // Excluir dependências primeiro
      await Promise.all([
        supabase.from('risk_action_activities').delete().eq('risk_id', riskId),
        supabase.from('risk_action_plans').delete().eq('risk_id', riskId),
        supabase.from('risk_communications').delete().eq('risk_id', riskId),
        supabase.from('risk_acceptance_letters').delete().eq('risk_id', riskId)
      ]);
      
      const { error } = await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', riskId);

      if (error) throw error;
      console.log('✅ Risk deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics-optimized'] });
      toast.success('Risco excluído com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ Error deleting risk:', error);
      toast.error(`Erro ao excluir risco: ${error.message}`);
    }
  });

  // ============================================================================
  // ALEX RISK INTEGRATION
  // ============================================================================

  const generateAlexSuggestions = useCallback(async (contextRisks: Risk[] = risks) => {
    if (!enableAlexRiskIntegration || !contextRisks?.length) return;

    console.log('🤖 Generating Alex Risk suggestions...');

    // Simular análise Alex Risk (em produção seria API call)
    const suggestions: AlexRiskSuggestion[] = [];

    // Análise de padrões
    const highRisks = contextRisks.filter(r => r.riskLevel === 'Muito Alto' || r.riskLevel === 'Alto');
    if (highRisks.length > 0) {
      suggestions.push({
        id: `alex-${Date.now()}-1`,
        type: 'warning',
        title: 'Riscos Críticos Identificados',
        description: `${highRisks.length} riscos de alta prioridade requerem atenção imediata.`,
        confidence: 0.95,
        actionable: true,
        context: { risks: highRisks.map(r => r.id) }
      });
    }

    // Análise de correlações
    const categories = [...new Set(contextRisks.map(r => r.category))];
    if (categories.length >= 3) {
      suggestions.push({
        id: `alex-${Date.now()}-2`,
        type: 'insight',
        title: 'Correlações Detectadas',
        description: `Identifiquei padrões de risco correlacionados em ${categories.slice(0, 3).join(', ')}.`,
        confidence: 0.8,
        actionable: true,
        context: { categories }
      });
    }

    // Sugestões de otimização
    const inProgress = contextRisks.filter(r => r.status === 'Em Tratamento');
    if (inProgress.length > 5) {
      suggestions.push({
        id: `alex-${Date.now()}-3`,
        type: 'action',
        title: 'Otimização de Workflow',
        description: `${inProgress.length} riscos em tratamento podem se beneficiar de automação.`,
        confidence: 0.7,
        actionable: true,
        context: { inProgressRisks: inProgress.length }
      });
    }

    setAlexSuggestions(suggestions);
    console.log(`🤖 Generated ${suggestions.length} Alex Risk suggestions`);
  }, [enableAlexRiskIntegration, risks]);

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  const calculateRiskLevel = useCallback((score: number): RiskLevel => {
    if (score >= 20) return 'Muito Alto';
    if (score >= 15) return 'Alto';
    if (score >= 8) return 'Médio';
    if (score >= 4) return 'Baixo';
    return 'Muito Baixo';
  }, []);

  const transformSupabaseRiskToRisk = useCallback((supabaseRisk: any): Risk => {
    const description = supabaseRisk.description || '';
    const analysisData = supabaseRisk.analysis_data || null;

    let finalStatus = mapSupabaseStatusToRiskStatus(supabaseRisk.status);
    
    if (analysisData && analysisData.qualitativeRiskLevel && finalStatus === 'Identificado') {
      finalStatus = 'Avaliado';
    }
    
    return {
      id: supabaseRisk.id,
      name: supabaseRisk.title,
      description: description,
      category: supabaseRisk.risk_category,
      probability: supabaseRisk.likelihood_score,
      impact: supabaseRisk.impact_score,
      riskScore: supabaseRisk.risk_score || 0,
      riskLevel: supabaseRisk.risk_level || 'Médio',
      status: finalStatus,
      treatmentType: supabaseRisk.risk_action_plans?.[0]?.treatment_type || 'Mitigar',
      owner: supabaseRisk.created_by || '',
      assignedTo: supabaseRisk.assigned_to,
      identifiedDate: new Date(supabaseRisk.created_at),
      dueDate: supabaseRisk.due_date ? new Date(supabaseRisk.due_date) : undefined,
      createdBy: supabaseRisk.created_by || '',
      createdAt: new Date(supabaseRisk.created_at),
      updatedAt: new Date(supabaseRisk.updated_at),
      analysisData: analysisData
    };
  }, []);

  const mapSupabaseStatusToRiskStatus = useCallback((status: string): RiskStatus => {
    switch (status) {
      case 'open': return 'Identificado';
      case 'in_progress': return 'Em Tratamento';
      case 'mitigated': return 'Monitorado';
      case 'closed': return 'Fechado';
      case 'assessed': return 'Avaliado';
      default: return 'Identificado';
    }
  }, []);

  // Refresh inteligente de dados
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing all risk data...');
    await Promise.all([
      refetchRisks(),
      queryClient.invalidateQueries({ queryKey: ['risk-metrics-optimized'] }),
      queryClient.invalidateQueries({ queryKey: ['risk-analytics'] })
    ]);
    
    if (enableAlexRiskIntegration) {
      generateAlexSuggestions();
    }
  }, [refetchRisks, queryClient, generateAlexSuggestions, enableAlexRiskIntegration]);

  // Filtros aplicados com memoização
  const filteredRisks = useMemo(() => {
    if (!risks) return [];
    
    // Os filtros já são aplicados na query principal
    return risks;
  }, [risks]);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  // Gerar sugestões Alex Risk quando riscos mudarem
  React.useEffect(() => {
    if (enableAlexRiskIntegration && risks?.length > 0) {
      const timeoutId = setTimeout(() => {
        generateAlexSuggestions(risks);
      }, 1000); // Debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [risks?.length, enableAlexRiskIntegration, generateAlexSuggestions]);

  // ============================================================================
  // RETURN DO HOOK OTIMIZADO
  // ============================================================================

  return {
    // Dados principais
    risks: filteredRisks,
    metrics,
    analytics,
    alexSuggestions,
    
    // Estados de loading
    isLoadingRisks,
    isLoadingMetrics,
    isLoadingAnalytics,
    
    // Errors
    risksError,
    metricsError,
    
    // Mutations
    createRisk: createRiskMutation.mutate,
    updateRisk: updateRiskMutation.mutate,
    deleteRisk: deleteRiskMutation.mutate,
    
    // Estados de mutations
    isCreatingRisk: createRiskMutation.isPending,
    isUpdatingRisk: updateRiskMutation.isPending,
    isDeletingRisk: deleteRiskMutation.isPending,
    
    // Configuração e estado
    filters,
    setFilters,
    selectedView,
    setSelectedView,
    
    // Funções utilitárias
    refreshData,
    calculateRiskLevel,
    generateAlexSuggestions,
    
    // Configuração
    config: {
      enableRealTimeUpdates,
      enableAlexRiskIntegration,
      enableAdvancedAnalytics,
      cacheTimeout
    }
  };
};