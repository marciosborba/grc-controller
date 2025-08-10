import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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
  ActivityStatus
} from '@/types/risk-management';

// ============================================================================
// HOOK PRINCIPAL PARA GESTÃO DE RISCOS
// ============================================================================

export const useRiskManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES - BUSCA DE DADOS
  // ============================================================================

  // Buscar todos os riscos com filtros
  const {
    data: risks = [],
    isLoading: isLoadingRisks,
    error: risksError
  } = useQuery({
    queryKey: ['risks'],
    queryFn: async (): Promise<Risk[]> => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select(`
          *,
          risk_action_plans (
            *,
            risk_action_activities (*)
          ),
          risk_communications (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados do Supabase para o formato da aplicação
      return (data || []).map(transformSupabaseRiskToRisk);
    },
    enabled: !!user
  });

  // Buscar métricas de risco
  const {
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery({
    queryKey: ['risk-metrics'],
    queryFn: async (): Promise<RiskMetrics> => {
      const { data: riskData, error } = await supabase
        .from('risk_assessments')
        .select('risk_level, status, created_at, due_date');

      if (error) throw error;

      const now = new Date();
      const risks = riskData || [];

      // Calcular métricas
      const risksByLevel = risks.reduce((acc, risk) => {
        const level = (risk.risk_level || 'Médio') as RiskLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<RiskLevel, number>);

      const risksByStatus = risks.reduce((acc, risk) => {
        const status = risk.status as RiskStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<RiskStatus, number>);

      // Calcular atividades em atraso
      const { data: activities } = await supabase
        .from('risk_action_activities')
        .select('deadline, status')
        .lt('deadline', now.toISOString())
        .neq('status', 'Concluído')
        .neq('status', 'Cancelado');

      const overdueActivities = activities?.length || 0;

      return {
        totalRisks: risks.length,
        risksByLevel,
        risksByCategory: {} as any, // TODO: implementar quando tivermos category
        risksByStatus,
        overdueActivities,
        riskTrend: 'Estável',
        averageResolutionTime: 0 // TODO: calcular baseado em histórico
      };
    },
    enabled: !!user
  });

  // ============================================================================
  // MUTATIONS - OPERAÇÕES DE ESCRITA
  // ============================================================================

  // Criar novo risco
  const createRiskMutation = useMutation({
    mutationFn: async (riskData: CreateRiskRequest) => {
      const riskScore = riskData.probability * riskData.impact;
      const riskLevel = calculateRiskLevel(riskScore);

      const { data, error } = await supabase
        .from('risk_assessments')
        .insert([{
          title: riskData.name,
          description: riskData.description,
          risk_category: riskData.category,
          probability: riskData.probability.toString(),
          likelihood_score: riskData.probability,
          impact_score: riskData.impact,
          // Remover risk_score pois é coluna gerada
          // risk_score: riskScore,
          risk_level: riskLevel,
          status: 'Identificado',
          assigned_to: riskData.assignedTo || null,
          due_date: riskData.dueDate?.toISOString(),
          created_by: user?.id,
          severity: 'medium' // valor padrão para compatibilidade
        }])
        .select()
        .single();

      if (error) throw error;

      // Criar plano de ação se necessário
      if (riskData.treatmentType !== 'Aceitar') {
        const { error: planError } = await supabase
          .from('risk_action_plans')
          .insert([{
            risk_id: data.id,
            treatment_type: riskData.treatmentType,
            created_by: user?.id
          }]);

        if (planError) throw planError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics'] });
      toast.success('Risco criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar risco: ${error.message}`);
    }
  });

  // Atualizar risco
  const updateRiskMutation = useMutation({
    mutationFn: async ({ riskId, data }: { riskId: string; data: UpdateRiskRequest }) => {
      let updateData: any = {};

      if (data.name) updateData.title = data.name;
      if (data.description) updateData.description = data.description;
      if (data.category) updateData.risk_category = data.category;
      if (data.status) updateData.status = data.status;
      if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo || null;
      if (data.dueDate !== undefined) updateData.due_date = data.dueDate?.toISOString();

      // Recalcular score se probabilidade ou impacto mudaram
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
        // Remover risk_score pois é coluna gerada
        // updateData.risk_score = riskScore;
        updateData.risk_level = calculateRiskLevel(riskScore);
      }

      // Atualizar o risco principal
      const { data: result, error } = await supabase
        .from('risk_assessments')
        .update(updateData)
        .eq('id', riskId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar tipo de tratamento se fornecido
      if (data.treatmentType) {
        // Verificar se já existe um plano de ação
        const { data: existingPlan, error: planQueryError } = await supabase
          .from('risk_action_plans')
          .select('id')
          .eq('risk_id', riskId)
          .maybeSingle();

        if (planQueryError) {
          throw planQueryError;
        }

        if (existingPlan) {
          // Atualizar plano existente
          const { error: planError } = await supabase
            .from('risk_action_plans')
            .update({ treatment_type: data.treatmentType })
            .eq('risk_id', riskId);

          if (planError) throw planError;
        } else {
          // Criar novo plano de ação
          const { error: planError } = await supabase
            .from('risk_action_plans')
            .insert([{
              risk_id: riskId,
              treatment_type: data.treatmentType,
              created_by: user?.id
            }]);

          if (planError) throw planError;
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics'] });
      toast.success('Risco atualizado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro detalhado ao atualizar risco:', error);
      toast.error(`Erro ao atualizar risco: ${error.message || 'Erro desconhecido'}`);
    }
  });

  // Excluir risco
  const deleteRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      // Primeiro excluir dependências
      await supabase.from('risk_action_activities').delete().eq('action_plan_id', riskId);
      await supabase.from('risk_action_plans').delete().eq('risk_id', riskId);
      await supabase.from('risk_communications').delete().eq('risk_id', riskId);
      
      const { error } = await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', riskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics'] });
      toast.success('Risco excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir risco: ${error.message}`);
    }
  });

  // ============================================================================
  // GESTÃO DE ATIVIDADES
  // ============================================================================

  const addActivityMutation = useMutation({
    mutationFn: async ({ actionPlanId, activity }: { actionPlanId: string; activity: CreateActivityRequest }) => {
      const { data, error } = await supabase
        .from('risk_action_activities')
        .insert([{
          action_plan_id: actionPlanId,
          description: activity.name,
          responsible_person: activity.responsible,
          deadline: activity.dueDate?.toISOString(),
          status: 'TBD',
          evidence_description: activity.details
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success('Atividade adicionada com sucesso');
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ activityId, data }: { activityId: string; data: Partial<Activity> }) => {
      let updateData: any = {};
      
      if (data.name) updateData.description = data.name;
      if (data.responsible) updateData.responsible_person = data.responsible;
      if (data.status) updateData.status = data.status;
      if (data.dueDate !== undefined) updateData.deadline = data.dueDate?.toISOString();
      if (data.details !== undefined) updateData.evidence_description = data.details;

      const { error } = await supabase
        .from('risk_action_activities')
        .update(updateData)
        .eq('id', activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success('Atividade atualizada com sucesso');
    }
  });

  // ============================================================================
  // CARTA DE ACEITAÇÃO DE RISCO
  // ============================================================================

  const createAcceptanceLetterMutation = useMutation({
    mutationFn: async (letterData: Omit<RiskAcceptanceLetter, 'id' | 'createdBy' | 'createdAt'>) => {
      // Criar entrada na tabela de comunicações (reutilizando estrutura existente)
      const { data, error } = await supabase
        .from('risk_communications')
        .insert([{
          risk_id: letterData.riskId,
          person_name: letterData.approver,
          person_email: `${letterData.approver}@company.com`, // placeholder
          decision: 'Aceitar',
          justification: letterData.justification,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      toast.success('Carta de aceitação criada com sucesso');
    }
  });

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  const calculateRiskLevel = (score: number): RiskLevel => {
    if (score >= 21) return 'Muito Alto';
    if (score >= 16) return 'Alto';
    if (score >= 9) return 'Médio';
    if (score >= 4) return 'Baixo';
    return 'Muito Baixo';
  };

  const transformSupabaseRiskToRisk = (supabaseRisk: any): Risk => {
    return {
      id: supabaseRisk.id,
      name: supabaseRisk.title,
      description: supabaseRisk.description,
      category: supabaseRisk.risk_category,
      probability: supabaseRisk.likelihood_score,
      impact: supabaseRisk.impact_score,
      riskScore: supabaseRisk.risk_score || 0,
      riskLevel: supabaseRisk.risk_level || 'Médio',
      status: mapSupabaseStatusToRiskStatus(supabaseRisk.status),
      treatmentType: supabaseRisk.risk_action_plans?.[0]?.treatment_type || 'Mitigar',
      owner: supabaseRisk.created_by || '',
      assignedTo: supabaseRisk.assigned_to,
      identifiedDate: new Date(supabaseRisk.created_at),
      dueDate: supabaseRisk.due_date ? new Date(supabaseRisk.due_date) : undefined,
      createdBy: supabaseRisk.created_by || '',
      createdAt: new Date(supabaseRisk.created_at),
      updatedAt: new Date(supabaseRisk.updated_at)
    };
  };

  const mapSupabaseStatusToRiskStatus = (status: string): RiskStatus => {
    switch (status) {
      case 'open': return 'Identificado';
      case 'in_progress': return 'Em Tratamento';
      case 'mitigated': return 'Monitorado';
      case 'closed': return 'Fechado';
      default: return 'Avaliado';
    }
  };

  const filterRisks = (filters: RiskFilters): Risk[] => {
    let filtered = risks;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(risk => 
        risk.name.toLowerCase().includes(term) ||
        risk.description?.toLowerCase().includes(term) ||
        risk.category.toLowerCase().includes(term)
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(risk => filters.categories!.includes(risk.category));
    }

    if (filters.levels && filters.levels.length > 0) {
      filtered = filtered.filter(risk => filters.levels!.includes(risk.riskLevel));
    }

    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(risk => filters.statuses!.includes(risk.status));
    }

    if (filters.owners && filters.owners.length > 0) {
      filtered = filtered.filter(risk => filters.owners!.includes(risk.owner));
    }

    if (filters.showOverdue) {
      const now = new Date();
      filtered = filtered.filter(risk => 
        risk.dueDate && risk.dueDate < now && risk.status !== 'Fechado'
      );
    }

    return filtered;
  };

  // ============================================================================
  // RETURN DO HOOK
  // ============================================================================

  return {
    // Dados
    risks,
    metrics,
    
    // Estados de loading
    isLoadingRisks,
    isLoadingMetrics,
    
    // Errors
    risksError,
    
    // Mutations
    createRisk: createRiskMutation.mutate,
    updateRisk: updateRiskMutation.mutate,
    deleteRisk: deleteRiskMutation.mutate,
    addActivity: addActivityMutation.mutate,
    updateActivity: updateActivityMutation.mutate,
    createAcceptanceLetter: createAcceptanceLetterMutation.mutate,
    
    // Estados de mutations
    isCreatingRisk: createRiskMutation.isPending,
    isUpdatingRisk: updateRiskMutation.isPending,
    isDeletingRisk: deleteRiskMutation.isPending,
    
    // Funções utilitárias
    filterRisks,
    calculateRiskLevel
  };
};