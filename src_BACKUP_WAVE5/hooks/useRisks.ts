import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';

export interface RiskAssessment {
  id: string;
  title: string;
  description: string | null;
  risk_category: string;
  severity: string;
  probability: string;
  impact_score: number;
  likelihood_score: number;
  risk_score: number;
  risk_level: string;
  status: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlan {
  id: string;
  risk_id: string;
  treatment_type: string;
  created_at: string;
}

export interface ActionActivity {
  id: string;
  action_plan_id: string;
  description: string;
  responsible_person: string;
  deadline: string | null;
  status: string;
  evidence_url: string | null;
  evidence_description: string | null;
}

export interface RiskCommunication {
  id: string;
  risk_id: string;
  person_name: string;
  person_email: string;
  communication_date: string;
  decision: string | null;
  justification: string | null;
  notified_at: string | null;
}

// React Query keys for consistent caching
export const riskQueryKeys = {
  all: ['risks'] as const,
  lists: () => [...riskQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...riskQueryKeys.lists(), filters] as const,
  details: () => [...riskQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...riskQueryKeys.details(), id] as const,
  actionPlans: (riskId: string) => [...riskQueryKeys.detail(riskId), 'actionPlans'] as const,
  communications: (riskId: string) => [...riskQueryKeys.detail(riskId), 'communications'] as const,
};

// Optimized fetch function with parallel queries
const fetchRisksData = async () => {
  const [risksResult, actionsResult, communicationsResult] = await Promise.all([
    supabase
      .from('risk_assessments')
      .select('*')
      .order('created_at', { ascending: false }),
    
    supabase
      .from('risk_action_plans')
      .select('*'),
    
    supabase
      .from('risk_communications')
      .select('*')
      .order('created_at', { ascending: false })
  ]);

  if (risksResult.error) throw risksResult.error;
  if (actionsResult.error) throw actionsResult.error;
  if (communicationsResult.error) throw communicationsResult.error;

  return {
    risks: risksResult.data || [],
    actionPlans: actionsResult.data || [],
    communications: communicationsResult.data || []
  };
};

// Main hook for risks management
export const useRisks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: riskQueryKeys.lists(),
    queryFn: fetchRisksData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const risks = data?.risks || [];
  const actionPlans = data?.actionPlans || [];
  const communications = data?.communications || [];

  return {
    risks,
    actionPlans,
    communications,
    isLoading,
    error,
    refetch
  };
};

// Hook for specific risk details with related data
export const useRiskDetails = (riskId: string) => {
  const fetchRiskDetails = async () => {
    if (!riskId) return null;
    
    const [riskResult, actionPlanResult, activitiesResult, communicationsResult] = await Promise.all([
      supabase
        .from('risk_assessments')
        .select('*')
        .eq('id', riskId)
        .single(),
      
      supabase
        .from('risk_action_plans')
        .select('*')
        .eq('risk_id', riskId)
        .maybeSingle(),
      
      supabase
        .from('risk_action_activities')
        .select('*')
        .in('action_plan_id', (await supabase
          .from('risk_action_plans')
          .select('id')
          .eq('risk_id', riskId)).data?.map(p => p.id) || []),
      
      supabase
        .from('risk_communications')
        .select('*')
        .eq('risk_id', riskId)
        .order('created_at', { ascending: false })
    ]);

    if (riskResult.error) throw riskResult.error;

    return {
      risk: riskResult.data,
      actionPlan: actionPlanResult.data,
      activities: activitiesResult.data || [],
      communications: communicationsResult.data || []
    };
  };

  return useQuery({
    queryKey: riskQueryKeys.detail(riskId),
    queryFn: fetchRiskDetails,
    enabled: !!riskId,
    staleTime: 2 * 60 * 1000, // 2 minutes for details
  });
};

// Mutations for CRUD operations
export const useCreateRisk = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (riskData: any) => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert([riskData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: riskQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Risco criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar risco',
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateRisk = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...riskData }: any) => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .update(riskData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: riskQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: riskQueryKeys.detail(data.id) });
      toast({
        title: 'Sucesso',
        description: 'Risco atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar risco',
        variant: 'destructive',
      });
    }
  });
};

export const useDeleteRisk = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (riskId: string) => {
      const { error } = await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', riskId);
      
      if (error) throw error;
      return riskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: riskQueryKeys.lists() });
      toast({
        title: 'Sucesso',
        description: 'Risco excluído com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao excluir risco',
        variant: 'destructive',
      });
    }
  });
};