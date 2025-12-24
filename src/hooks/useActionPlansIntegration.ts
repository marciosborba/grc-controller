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

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    nearDeadline: 0,
    critical: 0,
    avgProgress: 0,
    completionRate: 0
  });

  // Determine effective tenant ID - use override for super users or current user's tenant
  const effectiveTenantId = overrideTenantId || user?.tenantId;
  const isSuperUser = user?.isPlatformAdmin || user?.permissions?.includes('manage_all_tenants');

  useEffect(() => {
    if (effectiveTenantId) {
      const delayDebounceFn = setTimeout(() => {
        loadActionPlans();
      }, 300); // Add debounce for search

      // Load metrics independently from list filters (search, sort, page)
      // Only reload metrics if structural context changes (Module, Origin)
      loadDashboardMetrics();

      return () => clearTimeout(delayDebounceFn);
    }
  }, [effectiveTenantId, moduleType, originId, page, perPage, sortBy, sortOrder, statusFilter, priorityFilter, searchTerm]);

  const loadDashboardMetrics = async () => {
    try {
      let query = supabase
        .from('vw_action_plans_unified')
        .select('id, status, priority, due_date, percentual_conclusao')
        .eq('tenant_id', effectiveTenantId);

      if (moduleType) {
        query = query.eq('module', moduleType);
      }

      if (originId) {
        query = query.eq('origin_id', originId);
      }

      // We do NOT apply transient filters (search, status, priority) to metrics
      // to maintain a global view of the context.

      const { data, error } = await query;

      if (error) {
        console.error('Error loading metrics:', error);
        return;
      }

      const allPlans = data || [];
      const total = allPlans.length;

      const completed = allPlans.filter(p => p.status === 'completed' || p.status === 'concluido').length;
      const inProgress = allPlans.filter(p => p.status === 'in_progress' || p.status === 'em_execucao').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = allPlans.filter(p => {
        if (!p.due_date) return false;
        const due = new Date(p.due_date);
        return due < today && (p.status !== 'completed' && p.status !== 'concluido');
      }).length;

      const nearDeadline = allPlans.filter(p => {
        if (!p.due_date) return false;
        const due = new Date(p.due_date);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7 && (p.status !== 'completed' && p.status !== 'concluido');
      }).length;

      const critical = allPlans.filter(p => p.priority === 'critical' || p.priority === 'critica').length;

      const avgProgress = total > 0
        ? allPlans.reduce((sum, p) => sum + (p.percentual_conclusao || 0), 0) / total
        : 0;

      setMetrics({
        total,
        completed,
        inProgress,
        overdue,
        nearDeadline,
        critical,
        avgProgress: Math.round(avgProgress),
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      });

    } catch (err) {
      console.error('Unexpected error loading metrics:', err);
    }
  };

  const loadActionPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('vw_action_plans_unified')
        .select('*', { count: 'exact' })
        .eq('tenant_id', effectiveTenantId);

      if (moduleType) {
        query = query.eq('module', moduleType);
      }

      if (originId) {
        query = query.eq('origin_id', originId);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter && statusFilter !== 'all') {
        // Map frontend status to backend status if needed, or assume view matches
        const backendStatus = statusFilter === 'em_execucao' ? 'in_progress' :
          statusFilter === 'concluido' ? 'completed' :
            statusFilter === 'atrasado' ? 'overdue' : // View might not have 'overdue' status column directly usually calculated? Check view
              statusFilter;
        // if status is 'atrasado', we might need special logic or rely on view having it. 
        // For now let's assume standard statuses: pending, in_progress, completed, cancelled
        if (backendStatus !== 'overdue') {
          query = query.eq('status', backendStatus);
        } else {
          // For overdue, ideally we check due_date < now. Supabase filter:
          const today = new Date().toISOString().split('T')[0];
          query = query.lt('due_date', today).neq('status', 'completed');
        }
      }

      if (priorityFilter && priorityFilter !== 'all') {
        const backendPriority = priorityFilter === 'alta' ? 'high' :
          priorityFilter === 'critica' ? 'critical' :
            priorityFilter === 'media' ? 'medium' :
              priorityFilter === 'baixa' ? 'low' : priorityFilter;
        query = query.eq('priority', backendPriority);
      }

      // Pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      // Map frontend sort keys to database columns
      let dbSortColumn = 'created_at';
      if (sortBy === 'title') dbSortColumn = 'title';
      if (sortBy === 'origin_name') dbSortColumn = 'origin_name';

      const { data, error, count } = await query
        .order(dbSortColumn, { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (error) throw error;

      setTotalItems(count || 0);

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

        const responsibleId = plan.responsible_id || 'unassigned';

        return {
          ...plan,
          modulo_origem: plan.module,
          nome_origem: plan.origin_name,
          origem_id: plan.origin_id,
          dias_para_vencimento: daysToDeadline,
          data_fim_planejada: plan.due_date,
          titulo: plan.title,
          descricao: plan.description,
          status,
          prioridade,
          responsavel_id: responsibleId,
          responsavel: {
            id: responsibleId,
            nome: plan.responsible_name || 'N/A',
            email: plan.responsible_email || '',
            avatar_url: plan.responsible_avatar
          },
          // Defaults for fields missing in view but required by interface
          categoria: 'Geral',
          gut_score: 0,
          orcamento_planejado: 0,
          created_by: 'system',
          updated_at: plan.created_at, // Fallback since view might not expose updated_at
          tenant_id: plan.tenant_id,
          created_at: plan.created_at,

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
      // Refresh list to update counts/pagination if needed
      if (page === 1) loadActionPlans();
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
      loadActionPlans(); // Refresh to keep pagination consistent
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
    // Note: Metrics should ideally come from a separate aggregate query instead of just the current page
    // For now we calculate based on loaded items, but this might be inaccurate with pagination.
    // In a future improvement, we should fetch metrics separately.
    const total = totalItems;
    const completed = actionPlans.filter(p => p.status === 'concluido').length;
    const inProgress = actionPlans.filter(p => p.status === 'em_execucao').length;
    const overdue = getOverduePlans().length;
    const nearDeadline = getPlansNearDeadline().length;
    const critical = actionPlans.filter(p => p.prioridade === 'critica').length;

    const avgProgress = actionPlans.length > 0
      ? actionPlans.reduce((sum, plan) => sum + plan.percentual_conclusao, 0) / actionPlans.length
      : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      nearDeadline,
      critical,
      avgProgress: Math.round(avgProgress),
      completionRate: actionPlans.length > 0 ? Math.round((completed / actionPlans.length) * 100) : 0
    };
  };

  return {
    actionPlans,
    loading,
    error,
    effectiveTenantId,
    isSuperUser,
    page,
    setPage,
    perPage,
    setPerPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
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
    getActionPlanMetrics,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    searchTerm,
    setSearchTerm,
    metrics // Expose the calculated metrics
  };
};