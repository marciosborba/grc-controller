import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import type {
  Assessment,
  AssessmentFramework,
  CreateAssessmentData,
  UpdateAssessmentData,
  AssessmentFilters,
  UseAssessmentsOptions,
  MaturityCalculation,
  AssessmentMetrics
} from '@/types/assessment';

// =====================================================
// HOOK PRINCIPAL PARA ASSESSMENTS
// =====================================================

export const useAssessments = (options: UseAssessmentsOptions = {}) => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    filters = {},
    page = 1,
    limit = 10,
    include_framework = true,
    include_responses = false
  } = options;

  // Query para buscar assessments
  const {
    data: assessments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['assessments', tenantId, filters, page, limit],
    queryFn: async () => {
      if (!tenantId) return [];

      console.log('🔍 [useAssessments] Buscando assessments para tenant:', tenantId);

      let query = supabase
        .from('assessments')
        .select(`
          *,
          ${include_framework ? 'framework:assessment_frameworks(*)' : ''},
          ${include_responses ? 'responses:assessment_responses(*)' : ''}
        `)
        .eq('tenant_id', tenantId);

      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('titulo', `%${filters.search}%`);
      }

      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.responsavel_id && filters.responsavel_id.length > 0) {
        query = query.in('responsavel_id', filters.responsavel_id);
      }

      if (filters.data_inicio_from) {
        query = query.gte('data_inicio', filters.data_inicio_from);
      }

      if (filters.data_inicio_to) {
        query = query.lte('data_inicio', filters.data_inicio_to);
      }

      if (filters.percentual_maturidade_min !== undefined) {
        query = query.gte('percentual_maturidade', filters.percentual_maturidade_min);
      }

      if (filters.percentual_maturidade_max !== undefined) {
        query = query.lte('percentual_maturidade', filters.percentual_maturidade_max);
      }

      // Paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Ordenação
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('❌ [useAssessments] Erro ao buscar assessments:', error);
        throw error;
      }

      console.log(`✅ [useAssessments] ${data?.length || 0} assessments encontrados`);
      return data as Assessment[];
    },
    enabled: !!tenantId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Mutation para criar assessment
  const createAssessmentMutation = useMutation({
    mutationFn: async (data: CreateAssessmentData): Promise<Assessment> => {
      if (!tenantId || !user?.id) {
        throw new Error('Tenant ID ou usuário não encontrado');
      }

      console.log('📝 [useAssessments] Criando assessment:', data);

      const { data: assessment, error } = await supabase
        .from('assessments')
        .insert({
          ...data,
          tenant_id: tenantId,
          created_by: user.id,
          updated_by: user.id
        })
        .select('*, framework:assessment_frameworks(*)')
        .single();

      if (error) {
        console.error('❌ [useAssessments] Erro ao criar assessment:', error);
        throw error;
      }

      console.log('✅ [useAssessments] Assessment criado:', assessment.id);
      return assessment as Assessment;
    },
    onSuccess: (assessment) => {
      queryClient.invalidateQueries({ queryKey: ['assessments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['assessment-metrics', tenantId] });
      toast.success(`Assessment "${assessment.titulo}" criado com sucesso!`);
    },
    onError: (error) => {
      console.error('❌ [useAssessments] Erro na mutation de criar:', error);
      toast.error('Erro ao criar assessment');
    }
  });

  // Mutation para atualizar assessment
  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssessmentData }): Promise<Assessment> => {
      if (!user?.id) {
        throw new Error('Usuário não encontrado');
      }

      console.log('📝 [useAssessments] Atualizando assessment:', id, data);

      const { data: assessment, error } = await supabase
        .from('assessments')
        .update({
          ...data,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select('*, framework:assessment_frameworks(*)')
        .single();

      if (error) {
        console.error('❌ [useAssessments] Erro ao atualizar assessment:', error);
        throw error;
      }

      console.log('✅ [useAssessments] Assessment atualizado:', assessment.id);
      return assessment as Assessment;
    },
    onSuccess: (assessment) => {
      queryClient.invalidateQueries({ queryKey: ['assessments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['assessment', assessment.id] });
      queryClient.invalidateQueries({ queryKey: ['assessment-metrics', tenantId] });
      toast.success(`Assessment "${assessment.titulo}" atualizado com sucesso!`);
    },
    onError: (error) => {
      console.error('❌ [useAssessments] Erro na mutation de atualizar:', error);
      toast.error('Erro ao atualizar assessment');
    }
  });

  // Mutation para deletar assessment
  const deleteAssessmentMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🗑️ [useAssessments] Deletando assessment:', id);

      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('❌ [useAssessments] Erro ao deletar assessment:', error);
        throw error;
      }

      console.log('✅ [useAssessments] Assessment deletado:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['assessment-metrics', tenantId] });
      toast.success('Assessment deletado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ [useAssessments] Erro na mutation de deletar:', error);
      toast.error('Erro ao deletar assessment');
    }
  });

  return {
    // Dados
    assessments,
    isLoading,
    error,
    
    // Ações
    refetch,
    createAssessment: createAssessmentMutation.mutate,
    updateAssessment: updateAssessmentMutation.mutate,
    deleteAssessment: deleteAssessmentMutation.mutate,
    
    // Estados das mutations
    isCreating: createAssessmentMutation.isPending,
    isUpdating: updateAssessmentMutation.isPending,
    isDeleting: deleteAssessmentMutation.isPending,
  };
};

// =====================================================
// HOOK PARA UM ASSESSMENT ESPECÍFICO
// =====================================================

export const useAssessment = (assessmentId: string) => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();

  const {
    data: assessment,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      if (!tenantId || !assessmentId) return null;

      console.log('🔍 [useAssessment] Buscando assessment:', assessmentId);

      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(*),
          responses:assessment_responses(*),
          action_plans:assessment_action_plans(*),
          reports:assessment_reports(*)
        `)
        .eq('id', assessmentId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        console.error('❌ [useAssessment] Erro ao buscar assessment:', error);
        throw error;
      }

      console.log('✅ [useAssessment] Assessment encontrado:', data.id);
      return data as Assessment;
    },
    enabled: !!tenantId && !!assessmentId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  return {
    assessment,
    isLoading,
    error,
    refetch
  };
};

// =====================================================
// HOOK PARA MÉTRICAS DE ASSESSMENTS
// =====================================================

export const useAssessmentMetrics = () => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();

  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['assessment-metrics', tenantId],
    queryFn: async (): Promise<AssessmentMetrics> => {
      if (!tenantId) {
        return {
          total_assessments: 0,
          active_assessments: 0,
          completed_assessments: 0,
          average_maturity: 0,
          frameworks_count: 0,
          pending_action_plans: 0,
          overdue_assessments: 0
        };
      }

      console.log('📊 [useAssessmentMetrics] Calculando métricas para tenant:', tenantId);

      // Buscar assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id, status, percentual_maturidade, data_fim_planejada')
        .eq('tenant_id', tenantId);

      if (assessmentsError) {
        console.error('❌ [useAssessmentMetrics] Erro ao buscar assessments:', assessmentsError);
        throw assessmentsError;
      }

      // Buscar frameworks
      const { data: frameworks, error: frameworksError } = await supabase
        .from('assessment_frameworks')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (frameworksError) {
        console.error('❌ [useAssessmentMetrics] Erro ao buscar frameworks:', frameworksError);
        throw frameworksError;
      }

      // Buscar action plans pendentes
      const { data: actionPlans, error: actionPlansError } = await supabase
        .from('assessment_action_plans')
        .select('id')
        .eq('tenant_id', tenantId)
        .in('status', ['planejado', 'em_andamento']);

      if (actionPlansError) {
        console.error('❌ [useAssessmentMetrics] Erro ao buscar action plans:', actionPlansError);
        throw actionPlansError;
      }

      // Calcular métricas
      const total_assessments = assessments?.length || 0;
      const active_assessments = assessments?.filter(a => 
        ['iniciado', 'em_andamento', 'em_revisao'].includes(a.status)
      ).length || 0;
      const completed_assessments = assessments?.filter(a => 
        a.status === 'concluido'
      ).length || 0;
      
      const average_maturity = total_assessments > 0 
        ? Math.round(
            (assessments?.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) || 0) / total_assessments
          )
        : 0;

      const frameworks_count = frameworks?.length || 0;
      const pending_action_plans = actionPlans?.length || 0;

      // Assessments em atraso
      const today = new Date().toISOString().split('T')[0];
      const overdue_assessments = assessments?.filter(a => 
        a.data_fim_planejada && 
        a.data_fim_planejada < today && 
        a.status !== 'concluido'
      ).length || 0;

      const metrics: AssessmentMetrics = {
        total_assessments,
        active_assessments,
        completed_assessments,
        average_maturity,
        frameworks_count,
        pending_action_plans,
        overdue_assessments
      };

      console.log('✅ [useAssessmentMetrics] Métricas calculadas:', metrics);
      return metrics;
    },
    enabled: !!tenantId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    metrics,
    isLoading,
    error,
    refetch
  };
};

// =====================================================
// HOOK PARA CÁLCULO DE MATURIDADE
// =====================================================

export const useMaturityCalculation = (assessmentId: string) => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: maturityData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['maturity-calculation', assessmentId],
    queryFn: async (): Promise<MaturityCalculation | null> => {
      if (!tenantId || !assessmentId) return null;

      console.log('🧮 [useMaturityCalculation] Calculando maturidade para assessment:', assessmentId);

      // Buscar respostas do assessment
      const { data: responses, error: responsesError } = await supabase
        .from('assessment_responses')
        .select(`
          *,
          question:assessment_questions(
            *,
            control:assessment_controls(
              *,
              domain:assessment_domains(*)
            )
          )
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', tenantId);

      if (responsesError) {
        console.error('❌ [useMaturityCalculation] Erro ao buscar respostas:', responsesError);
        throw responsesError;
      }

      if (!responses || responses.length === 0) {
        console.log('⚠️ [useMaturityCalculation] Nenhuma resposta encontrada');
        return null;
      }

      // Calcular scores por domínio
      const domainsMap = new Map();
      let score_total = 0;
      let score_maximo = 0;

      responses.forEach(response => {
        const question = response.question;
        const control = question?.control;
        const domain = control?.domain;

        if (!domain) return;

        score_total += response.pontuacao || 0;
        score_maximo += response.pontuacao_maxima || 0;

        if (!domainsMap.has(domain.id)) {
          domainsMap.set(domain.id, {
            domain_id: domain.id,
            domain_nome: domain.nome,
            score: 0,
            score_maximo: 0,
            controls_scores: new Map()
          });
        }

        const domainData = domainsMap.get(domain.id);
        domainData.score += response.pontuacao || 0;
        domainData.score_maximo += response.pontuacao_maxima || 0;

        // Scores por controle
        if (!domainData.controls_scores.has(control.id)) {
          domainData.controls_scores.set(control.id, {
            control_id: control.id,
            control_codigo: control.codigo,
            control_titulo: control.titulo,
            score: 0,
            score_maximo: 0,
            percentual: 0,
            status: 'not_assessed'
          });
        }

        const controlData = domainData.controls_scores.get(control.id);
        controlData.score += response.pontuacao || 0;
        controlData.score_maximo += response.pontuacao_maxima || 0;
      });

      // Calcular percentuais e status
      const domains_scores = Array.from(domainsMap.values()).map(domain => {
        const percentual = domain.score_maximo > 0 
          ? Math.round((domain.score / domain.score_maximo) * 100)
          : 0;

        const controls_scores = Array.from(domain.controls_scores.values()).map(control => {
          const controlPercentual = control.score_maximo > 0 
            ? Math.round((control.score / control.score_maximo) * 100)
            : 0;

          let status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed' = 'not_assessed';
          if (controlPercentual >= 80) status = 'compliant';
          else if (controlPercentual >= 50) status = 'partial';
          else if (controlPercentual > 0) status = 'non_compliant';

          return {
            ...control,
            percentual: controlPercentual,
            status
          };
        });

        return {
          ...domain,
          percentual,
          controls_scores
        };
      });

      const percentual_maturidade = score_maximo > 0 
        ? Math.round((score_total / score_maximo) * 100)
        : 0;

      let nivel_maturidade = 'Inexistente';
      if (percentual_maturidade >= 80) nivel_maturidade = 'Otimizado';
      else if (percentual_maturidade >= 60) nivel_maturidade = 'Gerenciado';
      else if (percentual_maturidade >= 40) nivel_maturidade = 'Definido';
      else if (percentual_maturidade >= 20) nivel_maturidade = 'Inicial';

      const maturityCalculation: MaturityCalculation = {
        score_total,
        score_maximo,
        percentual_maturidade,
        nivel_maturidade,
        domains_scores
      };

      // Atualizar o assessment com os novos valores
      await supabase
        .from('assessments')
        .update({
          score_total,
          score_maximo,
          percentual_maturidade,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .eq('tenant_id', tenantId);

      console.log('✅ [useMaturityCalculation] Maturidade calculada:', maturityCalculation);
      return maturityCalculation;
    },
    enabled: !!tenantId && !!assessmentId && !!user,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  // Mutation para recalcular maturidade
  const recalculateMaturityMutation = useMutation({
    mutationFn: async () => {
      return refetch();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['assessments', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['assessment-metrics', tenantId] });
      toast.success('Maturidade recalculada com sucesso!');
    },
    onError: (error) => {
      console.error('❌ [useMaturityCalculation] Erro ao recalcular:', error);
      toast.error('Erro ao recalcular maturidade');
    }
  });

  return {
    maturityData,
    isLoading,
    error,
    refetch,
    recalculateMaturity: recalculateMaturityMutation.mutate,
    isRecalculating: recalculateMaturityMutation.isPending
  };
};