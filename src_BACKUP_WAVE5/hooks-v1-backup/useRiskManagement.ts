import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  ActivityStatus
} from '@/types/risk-management';

// ============================================================================
// HOOK PRINCIPAL PARA GESTÃO DE RISCOS
// ============================================================================

export const useRiskManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    userTenantId, 
    validateAccess, 
    enforceFilter, 
    logActivity,
    isValidTenant 
  } = useTenantSecurity();

  // Verificar se usuário tem tenant válido
  if (!isValidTenant) {
    console.warn('[RISK-SECURITY] User without valid tenant accessing risk management');
  }

  // ============================================================================
  // QUERIES - BUSCA DE DADOS
  // ============================================================================

  // Buscar todos os riscos com filtros (ISOLAMENTO POR TENANT)
  const {
    data: risks = [],
    isLoading: isLoadingRisks,
    error: risksError
  } = useQuery({
    queryKey: ['risks', userTenantId],
    queryFn: async (): Promise<Risk[]> => {
      if (!userTenantId) {
        await logActivity('invalid_access', {
          action: 'query_risks_without_tenant',
          reason: 'No tenant ID found'
        });
        throw new Error('Acesso negado: tenant não identificado');
      }

      // Buscar riscos com filtro por tenant
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('tenant_id', userTenantId) // FILTRO CRÍTICO POR TENANT
        .order('created_at', { ascending: false });

      if (error) {
        await logActivity('security_violation', {
          action: 'query_risks_error',
          error: error.message
        });
        throw error;
      }

      // Validar que todos os dados pertencem ao tenant correto
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
      return validatedData.map(transformSupabaseRiskToRisk);
    },
    enabled: !!user && !!userTenantId
  });

  // Buscar métricas de risco (ISOLAMENTO POR TENANT)
  const {
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery({
    queryKey: ['risk-metrics', userTenantId],
    queryFn: async (): Promise<RiskMetrics> => {
      if (!userTenantId) {
        throw new Error('Acesso negado: tenant não identificado');
      }

      const { data: riskData, error } = await supabase
        .from('risk_assessments')
        .select('risk_level, status, created_at, due_date, tenant_id')
        .eq('tenant_id', userTenantId) // FILTRO CRÍTICO POR TENANT

      if (error) throw error;

      const now = new Date();
      const risks = riskData || [];

      // Calcular métricas
      console.log('📊 useRiskManagement: Calculando métricas para', risks.length, 'riscos');
      console.log('📊 Dados dos riscos para métricas:', risks.map(r => ({
        id: r.id,
        risk_level: r.risk_level,
        status: r.status
      })));
      
      const risksByLevel = risks.reduce((acc, risk) => {
        const level = (risk.risk_level || 'Médio') as RiskLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<RiskLevel, number>);
      
      console.log('📊 Métricas por nível calculadas:', risksByLevel);

      const risksByStatus = risks.reduce((acc, risk) => {
        const status = risk.status as RiskStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<RiskStatus, number>);

      // Calcular atividades em atraso (ISOLAMENTO POR TENANT)
      // Verificar se a tabela risk_action_activities existe
      let overdueActivities = 0;
      try {
        const { data: activities } = await supabase
          .from('risk_action_activities')
          .select('deadline, status')
          .lt('deadline', now.toISOString())
          .neq('status', 'Concluído')
          .neq('status', 'Cancelado');
        
        overdueActivities = activities?.length || 0;
      } catch (error) {
        // Tabela pode não existir ainda
        console.warn('Tabela risk_action_activities não encontrada:', error);
        overdueActivities = 0;
      }

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
    enabled: !!user && !!userTenantId
  });

  // ============================================================================
  // MUTATIONS - OPERAÇÕES DE ESCRITA
  // ============================================================================

  // Criar novo risco
  const createRiskMutation = useMutation({
    mutationFn: async (riskData: CreateRiskRequest) => {
      const riskScore = riskData.probability * riskData.impact;
      const riskLevel = calculateRiskLevel(riskScore);

      // Validar dados antes de inserir
      if (!userTenantId) {
        throw new Error('Tenant ID não encontrado. Faça login novamente.');
      }

      // Debug simplificado
      console.log('🔍 Criando risco:', {
        nome: riskData.name,
        categoria: riskData.category,
        responsavel: riskData.assignedTo,
        riskLevel: riskLevel
      });

      // Preparar dados mínimos para inserção (apenas campos essenciais)
      const baseRiskData: any = {
        title: riskData.name,
        description: riskData.description,
        risk_category: riskData.category,
        probability: Math.max(1, Math.min(5, Math.floor(riskData.probability))),
        likelihood_score: Math.max(1, Math.min(5, Math.floor(riskData.probability))),
        impact_score: Math.max(1, Math.min(5, Math.floor(riskData.impact))),
        risk_level: riskLevel,
        status: 'Identificado',
        severity: 'medium'
      };
      
      // Adicionar created_by apenas se for um UUID válido
      if (user?.id && user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        baseRiskData.created_by = user.id;
      }
      
      // Campo assigned_to agora é TEXT - tabela foi recriada!
      if (riskData.assignedTo) {
        baseRiskData.assigned_to = riskData.assignedTo;
        console.log('✅ Campo assigned_to adicionado:', riskData.assignedTo);
      }
      
      if (riskData.dueDate) {
        baseRiskData.due_date = riskData.dueDate.toISOString();
      }
      
      // Adicionar tenant_id apenas se for um UUID válido
      if (userTenantId && userTenantId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        baseRiskData.tenant_id = userTenantId;
      } else {
        throw new Error('Tenant ID inválido. Faça login novamente.');
      }
      
      // Adicionar analysisData se fornecido
      if (riskData.analysisData) {
        baseRiskData.analysis_data = riskData.analysisData;
      }

      console.log('🚀 Inserindo no banco...');
      
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert([baseRiskData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar risco:', error.message);
        throw error;
      }
      
      console.log('✅ Risco criado com sucesso:', data.title);

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
      const updateData: any = {};

      if (data.name) updateData.title = data.name;
      if (data.description) updateData.description = data.description;
      if (data.category) updateData.risk_category = data.category;
      if (data.status) updateData.status = data.status;
      if (data.assignedTo !== undefined) {
        updateData.assigned_to = data.assignedTo || null; // Campo TEXT para nome da pessoa
      }
      if (data.dueDate !== undefined) updateData.due_date = data.dueDate?.toISOString();
      
      // Salvar analysisData se fornecido
      if (data.analysisData !== undefined) {
        updateData.analysis_data = data.analysisData;
      }

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

      if (error) {
        console.error('❌ Erro ao atualizar no banco:', error);
        throw error;
      }
      
      console.log('✅ Risco atualizado com sucesso no banco:', {
        id: result.id,
        title: result.title,
        likelihood_score: result.likelihood_score,
        impact_score: result.impact_score,
        risk_level: result.risk_level,
        risk_score: result.risk_score
      });

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
      const updateData: any = {};
      
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
    console.log('📊 calculateRiskLevel: score =', score);
    
    // Usar a mesma lógica que está sendo usada na correção automática
    if (score >= 20) return 'Muito Alto';
    if (score >= 15) return 'Alto';
    if (score >= 8) return 'Médio';
    if (score >= 4) return 'Baixo';
    return 'Muito Baixo';
  };

  const transformSupabaseRiskToRisk = (supabaseRisk: any): Risk => {
    // Usar descrição diretamente
    const description = supabaseRisk.description || '';
    // Usar analysis_data da coluna se existir
    const analysisData = supabaseRisk.analysis_data || null;

    // Determinar status baseado na análise
    let finalStatus = mapSupabaseStatusToRiskStatus(supabaseRisk.status);
    
    // Se tem analysis_data completa, pode ser "Avaliado"
    if (analysisData && analysisData.qualitativeRiskLevel && finalStatus === 'Identificado') {
      finalStatus = 'Avaliado';
      console.log('🔄 Risco com análise completa - status alterado para "Avaliado"');
    }
    
    const transformedRisk = {
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
    
    console.log('🔄 transformSupabaseRiskToRisk:', {
      original: {
        id: supabaseRisk.id,
        title: supabaseRisk.title,
        risk_level: supabaseRisk.risk_level,
        risk_score: supabaseRisk.risk_score
      },
      transformed: {
        id: transformedRisk.id,
        name: transformedRisk.name,
        riskLevel: transformedRisk.riskLevel,
        riskScore: transformedRisk.riskScore
      }
    });
    
    return transformedRisk;
  };

  const mapSupabaseStatusToRiskStatus = (status: string): RiskStatus => {
    console.log('🔄 mapSupabaseStatusToRiskStatus: status do banco =', status);
    
    switch (status) {
      case 'open': return 'Identificado';
      case 'in_progress': return 'Em Tratamento';
      case 'mitigated': return 'Monitorado';
      case 'closed': return 'Fechado';
      case 'assessed': return 'Avaliado'; // Apenas quando explicitamente avaliado
      default: 
        console.log('🔄 Status não mapeado, usando "Identificado":', status);
        return 'Identificado'; // Padrão deve ser "Identificado", não "Avaliado"
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