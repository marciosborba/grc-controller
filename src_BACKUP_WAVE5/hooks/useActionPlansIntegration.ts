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
        .from('action_plans')
        .select('id, status, prioridade, data_fim_planejada, percentual_conclusao, modulo_origem, entidade_origem_id, tenant_id')
        .eq('tenant_id', effectiveTenantId);

      if (moduleType) {
        query = query.eq('modulo_origem', moduleType);
      }

      if (originId) {
        query = query.eq('entidade_origem_id', originId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading metrics:', error);
        return;
      }

      const allPlans = data || [];
      const total = allPlans.length;

      const completed = allPlans.filter(p => ['concluido', 'completed', 'verified'].includes(p.status)).length;
      const inProgress = allPlans.filter(p => ['em_execucao', 'in_progress', 'em_andamento'].includes(p.status)).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = allPlans.filter(p => {
        if (!p.data_fim_planejada) return false;
        const due = new Date(p.data_fim_planejada);
        return due < today && !['concluido', 'completed', 'verified'].includes(p.status);
      }).length;

      const nearDeadline = allPlans.filter(p => {
        if (!p.data_fim_planejada) return false;
        const due = new Date(p.data_fim_planejada);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7 && !['concluido', 'completed', 'verified'].includes(p.status);
      }).length;

      const critical = allPlans.filter(p => p.prioridade === 'critica' || p.prioridade === 'critical').length;

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
        .from('action_plans')
        .select(`
          *,
          responsavel_profile:profiles!action_plans_responsavel_plano_fkey(full_name, avatar_url),
          action_plan_activities(
            id,
            titulo,
            descricao,
            status,
            prioridade,
            data_fim_planejada,
            data_fim_real,
            percentual_conclusao,
            responsavel_execucao,
            created_at,
            updated_at
          )
        `, { count: 'exact' })
        .eq('tenant_id', effectiveTenantId);

      if (moduleType) {
        query = query.eq('modulo_origem', moduleType);
      }

      if (originId) {
        query = query.eq('entidade_origem_id', originId);
      }

      if (searchTerm) {
        query = query.or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      if (statusFilter && statusFilter !== 'all') {
        const dbStatus = statusFilter === 'em_execucao' ? 'em_execucao' : // Standardize if needed, assuming DB match
          statusFilter === 'concluido' ? 'concluido' :
            statusFilter;

        if (statusFilter === 'atrasado') {
          const today = new Date().toISOString().split('T')[0];
          query = query.lt('data_fim_planejada', today).not('status', 'in', '("concluido","completed","verified")');
        } else {
          // Handle legacy 'completed' vs 'concluido' mix if necessary, or just query exact
          // Assuming DB normalized to Portuguese 'concluido' mostly, but let's be safe if mixed
          if (statusFilter === 'concluido') {
            query = query.in('status', ['concluido', 'completed', 'verified']);
          } else if (statusFilter === 'em_execucao') {
            query = query.in('status', ['em_execucao', 'in_progress', 'em_andamento']);
          } else {
            query = query.eq('status', dbStatus);
          }
        }
      }

      if (priorityFilter && priorityFilter !== 'all') {
        // Normalized DB priority
        if (priorityFilter === 'critica') query = query.in('prioridade', ['critica', 'critical']);
        else if (priorityFilter === 'alta') query = query.in('prioridade', ['alta', 'high']);
        else if (priorityFilter === 'media') query = query.in('prioridade', ['media', 'medium']);
        else if (priorityFilter === 'baixa') query = query.in('prioridade', ['baixa', 'low']);
        else query = query.eq('prioridade', priorityFilter);
      }

      // Pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      // Map frontend sort keys to database columns
      let dbSortColumn = 'created_at';
      if (sortBy === 'title') dbSortColumn = 'titulo';
      if (sortBy === 'origin_name') dbSortColumn = 'modulo_origem'; // Approximate

      const { data, error, count } = await query
        .order(dbSortColumn, { ascending: sortOrder === 'asc' })
        .range(from, to);

      if (error) throw error;

      setTotalItems(count || 0);

      const mappedPlans = (data || []).map((plan: any) => {
        const daysToDeadline = plan.data_fim_planejada ? Math.ceil((new Date(plan.data_fim_planejada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

        let status = plan.status; // Assume DB status is relatively clean or display raw
        // Normalization for display
        if (['in_progress', 'em_andamento'].includes(plan.status)) status = 'em_execucao';
        else if (['completed', 'verified'].includes(plan.status)) status = 'concluido';
        else if (plan.status === 'pending') status = 'planejado';

        let prioridade = plan.prioridade;
        if (plan.prioridade === 'high') prioridade = 'alta';
        else if (plan.prioridade === 'critical') prioridade = 'critica';
        else if (plan.prioridade === 'low') prioridade = 'baixa';
        else if (plan.prioridade === 'medium') prioridade = 'media';

        const responsibleId = plan.responsavel_plano || 'unassigned';
        const responsibleName = plan.responsavel_profile?.full_name || 'N/A';
        const responsibleAvatar = plan.responsavel_profile?.avatar_url;

        return {
          ...plan,
          modulo_origem: plan.modulo_origem || 'geral',
          nome_origem: plan.modulo_origem, // Use module as name if origin_name missing
          origem_id: plan.entidade_origem_id,
          dias_para_vencimento: daysToDeadline,
          data_fim_planejada: plan.data_fim_planejada,
          titulo: plan.titulo,
          descricao: plan.descricao,
          status,
          prioridade,
          responsavel_id: responsibleId,
          responsavel: {
            id: responsibleId,
            nome: responsibleName,
            email: '',
            avatar_url: responsibleAvatar
          },
          categoria: 'Geral',
          gut_score: plan.gut_score || 0,
          orcamento_planejado: plan.orcamento_planejado || 0,
          created_by: plan.created_by,
          updated_at: plan.updated_at,
          tenant_id: plan.tenant_id,
          created_at: plan.created_at,
          atividades: Array.isArray(plan.action_plan_activities) ? plan.action_plan_activities.map((a: any) => ({
            id: a.id,
            action_plan_id: plan.id,
            titulo: a.titulo,
            descricao: a.descricao,
            status: a.status, // We can add normalization here if necessary
            data_fim_planejada: a.data_fim_planejada,
            data_fim_real: a.data_fim_real,
            responsavel_id: a.responsavel_execucao,
            percentual_conclusao: a.percentual_conclusao,
            created_at: a.created_at
          })) : [],
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