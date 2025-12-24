import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActionPlan } from '@/components/action-plans/EnhancedActionPlanCard';

interface UseActionPlansIntegrationProps {
  moduleType?: string;
  originId?: string;
  tenantId?: string; // For super user functionality
}

export const useActionPlansIntegration = ({
  moduleType,
  originId,
  tenantId: overrideTenantId
}: UseActionPlansIntegrationProps = {}) => {
  const { user } = useAuth();
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine effective tenant ID - use override for super users or current user's tenant
  const effectiveTenantId = overrideTenantId || user?.tenantId;
  const isSuperUser = user?.isPlatformAdmin || user?.permissions?.includes('manage_all_tenants');

  useEffect(() => {
    if (effectiveTenantId) {
      loadActionPlans();
    }
  }, [effectiveTenantId, moduleType, originId]);

  const loadActionPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('vw_action_plans_unified')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (moduleType) {
        query = query.eq('module', moduleType);
      }

      if (originId) {
        query = query.eq('origin_id', originId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map view data to ActionPlan interface expected by components
      // Note: The view returns normalized English, mapping back to PT for frontend compatibility
      const mappedPlans = (data || []).map((plan: any) => {
        const daysToDeadline = plan.due_date ? Math.ceil((new Date(plan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

        let status = 'planejado';
        if (plan.status === 'in_progress') status = 'em_execucao';
        else if (plan.status === 'completed') status = 'concluido';
        else if (plan.status === 'cancelled') status = 'cancelado';
        else if (plan.status === 'pending') status = 'planejado';

        let prioridade = 'media';
        if (plan.priority === 'high') prioridade = 'alta';
        else if (plan.priority === 'critical') prioridade = 'critica';
        else if (plan.priority === 'low') prioridade = 'baixa';

        return {
          ...plan,
          modulo_origem: plan.module,
          nome_origem: plan.origin_name,
          dias_para_vencimento: daysToDeadline,
          data_fim_planejada: plan.due_date,
          titulo: plan.title,
          descricao: plan.description,
          status,
          prioridade,
          responsavel: {
            nome: plan.responsible_name || 'N/A',
            email: plan.responsible_email || '',
            avatar_url: plan.responsible_avatar
          },
          // Populate arrays with empty defaults via cast since they aren't in view
          atividades: [],
          evidencias: [],
          comentarios: []
        };
      });

      setActionPlans(mappedPlans);
    } catch (err) {
      console.error('Erro ao carregar planos de ação:', err);
      setError('Erro ao carregar planos de ação');
      toast.error('Erro ao carregar planos de ação');
    } finally {
      setLoading(false);
    }
  };

  const createActionPlan = async (planData: Partial<ActionPlan>) => {
    try {
      setLoading(true);

      const newPlan = {
        ...planData,
        tenant_id: effectiveTenantId,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        codigo: planData.codigo || `PA-${Date.now()}`, // Generate code if not provided
        percentual_conclusao: planData.percentual_conclusao || 0,
        status: planData.status || 'planejado'
      };

      const { data, error } = await supabase
        .from('action_plans')
        .insert([newPlan])
        .select()
        .single();

      if (error) throw error;

      setActionPlans(prev => [data, ...prev]);
      toast.success('Plano de ação criado com sucesso');

      return data;
    } catch (err) {
      console.error('Erro ao criar plano de ação:', err);
      toast.error('Erro ao criar plano de ação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateActionPlan = async (planId: string, updates: Partial<ActionPlan>) => {
    try {
      setLoading(true);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('action_plans')
        .update(updateData)
        .eq('id', planId)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();

      if (error) throw error;

      setActionPlans(prev =>
        prev.map(plan => plan.id === planId ? { ...plan, ...data } : plan)
      );

      toast.success('Plano de ação atualizado com sucesso');
      return data;
    } catch (err) {
      console.error('Erro ao atualizar plano de ação:', err);
      toast.error('Erro ao atualizar plano de ação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteActionPlan = async (planId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('action_plans')
        .delete()
        .eq('id', planId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      setActionPlans(prev => prev.filter(plan => plan.id !== planId));
      toast.success('Plano de ação removido com sucesso');
    } catch (err) {
      console.error('Erro ao remover plano de ação:', err);
      toast.error('Erro ao remover plano de ação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (planId: string, content: string, type: 'comentario' | 'atualizacao_status' | 'atualizacao_progresso' = 'comentario') => {
    try {
      const commentData = {
        action_plan_id: planId,
        conteudo: content,
        autor_id: user?.id,
        autor_nome: user?.name || user?.email || 'Usuário',
        tipo: type,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('action_plan_comments')
        .insert([commentData])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setActionPlans(prev =>
        prev.map(plan =>
          plan.id === planId
            ? {
              ...plan,
              comentarios: [...(plan.comentarios || []), data]
            }
            : plan
        )
      );

      toast.success('Comentário adicionado com sucesso');
      return data;
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      toast.error('Erro ao adicionar comentário');
      throw err;
    }
  };

  const addActivity = async (planId: string, activityData: Partial<any>) => {
    try {
      const newActivity = {
        action_plan_id: planId,
        ...activityData,
        status: activityData.status || 'pendente',
        percentual_conclusao: activityData.percentual_conclusao || 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('action_plan_activities')
        .insert([newActivity])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setActionPlans(prev =>
        prev.map(plan =>
          plan.id === planId
            ? {
              ...plan,
              atividades: [...(plan.atividades || []), data]
            }
            : plan
        )
      );

      toast.success('Atividade adicionada com sucesso');
      return data;
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      toast.error('Erro ao adicionar atividade');
      throw err;
    }
  };

  const addEvidence = async (planId: string, evidenceData: any) => {
    try {
      const newEvidence = {
        action_plan_id: planId,
        ...evidenceData,
        uploaded_by: user?.id,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('action_plan_evidences')
        .insert([newEvidence])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setActionPlans(prev =>
        prev.map(plan =>
          plan.id === planId
            ? {
              ...plan,
              evidencias: [...(plan.evidencias || []), data]
            }
            : plan
        )
      );

      toast.success('Evidência adicionada com sucesso');
      return data;
    } catch (err) {
      console.error('Erro ao adicionar evidência:', err);
      toast.error('Erro ao adicionar evidência');
      throw err;
    }
  };

  const getActionPlansByModule = (module: string) => {
    return actionPlans.filter(plan => plan.modulo_origem === module);
  };

  const getActionPlansByStatus = (status: string) => {
    return actionPlans.filter(plan => plan.status === status);
  };

  const getActionPlansByPriority = (priority: string) => {
    return actionPlans.filter(plan => plan.prioridade === priority);
  };

  const getOverduePlans = () => {
    return actionPlans.filter(plan => (plan.dias_para_vencimento || 0) < 0);
  };

  const getPlansNearDeadline = (days: number = 7) => {
    return actionPlans.filter(plan => {
      const daysToDeadline = plan.dias_para_vencimento || 0;
      return daysToDeadline >= 0 && daysToDeadline <= days;
    });
  };

  const getActionPlanMetrics = () => {
    const total = actionPlans.length;
    const completed = actionPlans.filter(p => p.status === 'concluido').length;
    const inProgress = actionPlans.filter(p => p.status === 'em_execucao').length;
    const overdue = getOverduePlans().length;
    const nearDeadline = getPlansNearDeadline().length;
    const critical = actionPlans.filter(p => p.prioridade === 'critica').length;

    const avgProgress = total > 0
      ? actionPlans.reduce((sum, plan) => sum + plan.percentual_conclusao, 0) / total
      : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      nearDeadline,
      critical,
      avgProgress: Math.round(avgProgress),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return {
    actionPlans,
    loading,
    error,
    effectiveTenantId,
    isSuperUser,
    loadActionPlans,
    createActionPlan,
    updateActionPlan,
    deleteActionPlan,
    addComment,
    addActivity,
    addEvidence,
    getActionPlansByModule,
    getActionPlansByStatus,
    getActionPlansByPriority,
    getOverduePlans,
    getPlansNearDeadline,
    getActionPlanMetrics
  };
};