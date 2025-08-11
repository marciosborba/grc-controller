import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Policy, 
  PolicyApproval, 
  PolicyApprover, 
  PolicyReview,
  PolicyTraining,
  PolicyAttachment,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyFilters,
  PolicyMetrics
} from '@/types/policy-management';

export const usePolicyManagement = () => {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES - BUSCA DE DADOS
  // ============================================================================

  const {
    data: policies = [],
    isLoading: isPoliciesLoading,
    error: policiesError,
    refetch: refetchPolicies
  } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policies')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Policy[];
    }
  });

  const {
    data: approvals = [],
    isLoading: isApprovalsLoading,
    refetch: refetchApprovals
  } = useQuery({
    queryKey: ['policy-approvals'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('policy_approvals')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as PolicyApproval[];
      } catch (error) {
        console.warn('Policy approvals table not found, returning empty array');
        return [];
      }
    }
  });

  const {
    data: approvers = [],
    isLoading: isApproversLoading,
    refetch: refetchApprovers
  } = useQuery({
    queryKey: ['policy-approvers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('policy_approvers')
          .select('*')
          .order('order_sequence', { ascending: true });
        
        if (error) throw error;
        return data as PolicyApprover[];
      } catch (error) {
        console.warn('Policy approvers table not found, returning empty array');
        return [];
      }
    }
  });

  // Query para buscar perfis de usu�rios
  const {
    data: profiles = [],
    isLoading: isProfilesLoading
  } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, job_title, department')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // ============================================================================
  // MUTATIONS - OPERA��ES DE ESCRITA
  // ============================================================================

  // Criar nova política
  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: CreatePolicyRequest) => {
      const { data, error } = await supabase
        .from('policies')
        .insert([policyData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Política criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar política: ${error.message}`);
    }
  });

  // Atualizar política
  const updatePolicyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdatePolicyRequest }) => {
      const { data, error } = await supabase
        .from('policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Política atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar política: ${error.message}`);
    }
  });

  // Excluir pol�tica
  const deletePolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Pol�tica exclu�da com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir pol�tica: ${error.message}`);
    }
  });

  // Aprovar/Rejeitar pol�tica
  const approvePolicyMutation = useMutation({
    mutationFn: async ({ 
      policyId, 
      approverId, 
      status, 
      comments 
    }: { 
      policyId: string; 
      approverId: string; 
      status: 'approved' | 'rejected'; 
      comments?: string; 
    }) => {
      // Registrar aprova��o
      const { error: approvalError } = await supabase
        .from('policy_approvals')
        .insert([{
          policy_id: policyId,
          approver_id: approverId,
          status,
          comments,
          decision_date: new Date().toISOString()
        }]);

      if (approvalError) throw approvalError;

      // Atualizar status da pol�tica se aprovada
      if (status === 'approved') {
        const { error: policyError } = await supabase
          .from('policies')
          .update({
            status: 'approved',
            approved_by: approverId,
            approved_at: new Date().toISOString()
          })
          .eq('id', policyId);

        if (policyError) throw policyError;
      } else {
        // Se rejeitada, atualizar status para rejected
        const { error: policyError } = await supabase
          .from('policies')
          .update({ status: 'rejected' })
          .eq('id', policyId);

        if (policyError) throw policyError;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy-approvals'] });
      toast.success(`Pol�tica ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao processar aprova��o: ${error.message}`);
    }
  });

  // Adicionar aprovador
  const addApproverMutation = useMutation({
    mutationFn: async (approverData: Omit<PolicyApprover, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('policy_approvers')
        .insert([approverData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-approvers'] });
      toast.success('Aprovador adicionado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar aprovador: ${error.message}`);
    }
  });

  // Remover aprovador
  const removeApproverMutation = useMutation({
    mutationFn: async (approverId: string) => {
      const { error } = await supabase
        .from('policy_approvers')
        .delete()
        .eq('id', approverId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-approvers'] });
      toast.success('Aprovador removido com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover aprovador: ${error.message}`);
    }
  });

  // Upload de documento
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ policyId, file }: { policyId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${policyId}/${Date.now()}-${file.name}`;
      
      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Atualizar política com URL do documento
      const { data, error: updateError } = await supabase
        .from('policies')
        .update({ 
          document_path: fileName,
          document_type: fileExt === 'pdf' ? 'PDF' : 'Word'
        })
        .eq('id', policyId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Documento arquivado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao arquivar documento: ${error.message}`);
    }
  });

  // Enviar para aprova��o
  const sendForApprovalMutation = useMutation({
    mutationFn: async (policyId: string) => {
      const { error } = await supabase
        .from('policies')
        .update({ status: 'pending_approval' })
        .eq('id', policyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success('Pol�tica enviada para aprova��o');
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar para aprova��o: ${error.message}`);
    }
  });

  // ============================================================================
  // FUN��ES AUXILIARES
  // ============================================================================

  const getMetrics = (): PolicyMetrics => {
    const total = policies.length;
    const statusCounts = policies.reduce((acc, policy) => {
      acc[policy.status] = (acc[policy.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryCounts = policies.reduce((acc, policy) => {
      acc[policy.category] = (acc[policy.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_policies: total,
      policies_by_status: statusCounts as any,
      policies_by_category: categoryCounts as any,
      upcoming_reviews: policies.filter(p => 
        p.review_date && new Date(p.review_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length,
      overdue_reviews: policies.filter(p => 
        p.review_date && new Date(p.review_date) < new Date()
      ).length,
      pending_approvals: statusCounts['pending_approval'] || 0,
      compliance_rate: total > 0 ? ((statusCounts['approved'] || 0) / total) * 100 : 0,
      training_completion_rate: 0, // Implementar quando tiver dados de treinamento
      average_approval_time: 0 // Implementar c�lculo baseado no hist�rico
    };
  };

  const filterPolicies = (filters: PolicyFilters): Policy[] => {
    let filtered = policies;

    if (filters.search_term) {
      const searchLower = filters.search_term.toLowerCase();
      filtered = filtered.filter(policy => 
        policy.title.toLowerCase().includes(searchLower) ||
        policy.description?.toLowerCase().includes(searchLower) ||
        policy.category.toLowerCase().includes(searchLower)
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(policy => filters.categories!.includes(policy.category));
    }

    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(policy => filters.statuses!.includes(policy.status));
    }

    if (filters.document_types && filters.document_types.length > 0) {
      filtered = filtered.filter(policy => 
        policy.document_type && filters.document_types!.includes(policy.document_type)
      );
    }

    if (filters.owners && filters.owners.length > 0) {
      filtered = filtered.filter(policy => 
        policy.owner_id && filters.owners!.includes(policy.owner_id)
      );
    }

    if (filters.effective_date_from) {
      filtered = filtered.filter(policy => 
        policy.effective_date && new Date(policy.effective_date) >= filters.effective_date_from!
      );
    }

    if (filters.effective_date_to) {
      filtered = filtered.filter(policy => 
        policy.effective_date && new Date(policy.effective_date) <= filters.effective_date_to!
      );
    }

    if (filters.show_expired === false) {
      filtered = filtered.filter(policy => policy.status !== 'expired');
    }

    if (filters.show_upcoming_reviews) {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(policy => 
        policy.review_date && new Date(policy.review_date) <= thirtyDaysFromNow
      );
    }

    return filtered;
  };

  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || 'Usu�rio n�o encontrado';
  };

  const getPolicyApprovers = (policyId: string) => {
    return approvers.filter(a => a.policy_id === policyId);
  };

  const getPolicyApprovals = (policyId: string) => {
    return approvals.filter(a => a.policy_id === policyId);
  };

  // ============================================================================
  // RETORNO DO HOOK
  // ============================================================================

  return {
    // Dados
    policies,
    approvals,
    approvers,
    profiles,

    // Estados de loading
    isPoliciesLoading,
    isApprovalsLoading,
    isApproversLoading,
    isProfilesLoading,

    // Erros
    policiesError,

    // Mutations
    createPolicy: createPolicyMutation.mutateAsync,
    updatePolicy: updatePolicyMutation.mutateAsync,
    deletePolicy: deletePolicyMutation.mutateAsync,
    approvePolicy: approvePolicyMutation.mutateAsync,
    addApprover: addApproverMutation.mutateAsync,
    removeApprover: removeApproverMutation.mutateAsync,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    sendForApproval: sendForApprovalMutation.mutateAsync,

    // Estados das mutations
    isCreatingPolicy: createPolicyMutation.isPending,
    isUpdatingPolicy: updatePolicyMutation.isPending,
    isDeletingPolicy: deletePolicyMutation.isPending,
    isApprovingPolicy: approvePolicyMutation.isPending,
    isUploadingDocument: uploadDocumentMutation.isPending,

    // Fun��es auxiliares
    getMetrics,
    filterPolicies,
    getProfileName,
    getPolicyApprovers,
    getPolicyApprovals,

    // Refetch functions
    refetchPolicies,
    refetchApprovals,
    refetchApprovers
  };
};