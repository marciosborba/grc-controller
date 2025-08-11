import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Assessment,
  AssessmentFramework,
  AssessmentUserRole,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  AssessmentFilters,
  AssessmentMetrics,
  AssessmentBulkAction,
  UseAssessmentManagementReturn,
  UserRole
} from '@/types/assessment-management';

export const useAssessmentManagement = (): UseAssessmentManagementReturn => {
  const queryClient = useQueryClient();
  const [profiles, setProfiles] = useState<any[]>([]);

  // Queries
  const {
    data: assessments = [],
    isLoading: isAssessmentsLoading,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useQuery({
    queryKey: ['assessments'],
    queryFn: fetchAssessments,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: frameworks = [],
    isLoading: isFrameworksLoading,
    error: frameworksError,
    refetch: refetchFrameworks
  } = useQuery({
    queryKey: ['assessment-frameworks'],
    queryFn: fetchFrameworks,
    staleTime: 10 * 60 * 1000,
  });

  // Mutations
  const createAssessmentMutation = useMutation({
    mutationFn: createAssessmentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar assessment: ${error.message}`);
    },
  });

  const updateAssessmentMutation = useMutation({
    mutationFn: updateAssessmentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar assessment: ${error.message}`);
    },
  });

  const deleteAssessmentMutation = useMutation({
    mutationFn: deleteAssessmentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir assessment: ${error.message}`);
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: performBulkAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Ação em lote executada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro na ação em lote: ${error.message}`);
    },
  });

  // Fetch functions
  async function fetchAssessments(): Promise<Assessment[]> {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        framework:frameworks(
          id,
          name,
          short_name,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(assessment => {
      // Mapear status do banco para nossa interface
      const statusMap: { [key: string]: any } = {
        'Não Iniciado': 'not_started',
        'Em Andamento': 'in_progress', 
        'Em Revisão': 'under_review',
        'Concluído': 'completed'
      };
      
      return {
        ...assessment,
        // Mapear campos existentes para a nossa interface
        type: 'internal_audit' as const,
        priority: 'medium' as const,
        frequency: 'annual' as const,
        start_date: assessment.created_at,
        total_controls: 0,
        completed_controls: 0,
        compliance_score: assessment.progress || 0,
        framework_id: assessment.framework_id_on_creation,
        created_by: assessment.created_by_user_id || '',
        status: statusMap[assessment.status] || 'not_started',
        progress: assessment.progress || 0,
        is_overdue: assessment.due_date ? new Date(assessment.due_date) < new Date() : false,
        days_until_due: assessment.due_date 
          ? Math.ceil((new Date(assessment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null,
        assigned_users: []
      };
    });
  }

  async function fetchFrameworks(): Promise<AssessmentFramework[]> {
    const { data, error } = await supabase
      .from('frameworks')
      .select(`
        *,
        controls_count:framework_controls(count)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name');

    if (error) {
      throw error;
    }

    setProfiles(data || []);
  }

  // CRUD functions
  async function createAssessmentRequest(data: CreateAssessmentRequest): Promise<Assessment> {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert([{
        name: data.name,
        framework_id_on_creation: data.framework_id,
        due_date: data.due_date,
        status: 'Não Iniciado',
        progress: 0,
        created_by_user_id: data.created_by
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Assign users if provided
    if (data.assigned_users && data.assigned_users.length > 0) {
      await assignUsers(assessment.id, data.assigned_users);
    }

    return assessment;
  }

  async function updateAssessmentRequest(data: UpdateAssessmentRequest): Promise<Assessment> {
    // Mapear status da nossa interface para o banco
    const reverseStatusMap: { [key: string]: string } = {
      'not_started': 'Não Iniciado',
      'in_progress': 'Em Andamento',
      'under_review': 'Em Revisão',
      'completed': 'Concluído'
    };
    
    const updates: any = {};
    if (data.updates.name) updates.name = data.updates.name;
    if (data.updates.due_date) updates.due_date = data.updates.due_date;
    if (data.updates.progress !== undefined) updates.progress = data.updates.progress;
    if (data.updates.status) updates.status = reverseStatusMap[data.updates.status] || data.updates.status;
    
    const { data: assessment, error } = await supabase
      .from('assessments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return assessment;
  }

  async function deleteAssessmentRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  async function performBulkAction(action: AssessmentBulkAction): Promise<void> {
    switch (action.action) {
      case 'delete':
        const { error: deleteError } = await supabase
          .from('assessments')
          .delete()
          .in('id', action.assessment_ids);
        
        if (deleteError) throw deleteError;
        break;

      case 'update_status':
        const { error: statusError } = await supabase
          .from('assessments')
          .update({ 
            status: action.payload.status,
            updated_at: new Date().toISOString()
          })
          .in('id', action.assessment_ids);
        
        if (statusError) throw statusError;
        break;

      case 'set_due_date':
        const { error: dateError } = await supabase
          .from('assessments')
          .update({ 
            due_date: action.payload.due_date,
            updated_at: new Date().toISOString()
          })
          .in('id', action.assessment_ids);
        
        if (dateError) throw dateError;
        break;

      default:
        throw new Error('Ação não suportada');
    }
  }

  // Utility functions
  const filterAssessments = (filters: AssessmentFilters): Assessment[] => {
    let filtered = [...assessments];

    if (filters.search_term) {
      const term = filters.search_term.toLowerCase();
      filtered = filtered.filter(assessment => 
        assessment.name.toLowerCase().includes(term) ||
        assessment.description?.toLowerCase().includes(term) ||
        assessment.framework?.name.toLowerCase().includes(term)
      );
    }

    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(assessment => 
        filters.statuses!.includes(assessment.status)
      );
    }

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(assessment => 
        filters.types!.includes(assessment.type)
      );
    }

    if (filters.priorities && filters.priorities.length > 0) {
      filtered = filtered.filter(assessment => 
        filters.priorities!.includes(assessment.priority)
      );
    }

    if (filters.frameworks && filters.frameworks.length > 0) {
      filtered = filtered.filter(assessment => 
        filters.frameworks!.includes(assessment.framework_id)
      );
    }

    if (filters.show_overdue) {
      filtered = filtered.filter(assessment => assessment.is_overdue);
    }

    if (filters.show_upcoming_deadlines) {
      filtered = filtered.filter(assessment => 
        assessment.days_until_due !== null && 
        assessment.days_until_due <= 30 && 
        assessment.days_until_due >= 0
      );
    }

    if (filters.progress_range) {
      filtered = filtered.filter(assessment => 
        assessment.progress >= filters.progress_range!.min &&
        assessment.progress <= filters.progress_range!.max
      );
    }

    return filtered;
  };

  const sortAssessments = (assessments: Assessment[], options: any): Assessment[] => {
    return [...assessments].sort((a, b) => {
      let aValue = a[options.field];
      let bValue = b[options.field];

      if (options.field === 'due_date') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (aValue < bValue) return options.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return options.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const searchAssessments = (term: string): Assessment[] => {
    return filterAssessments({ search_term: term });
  };

  const getMetrics = (): AssessmentMetrics => {
    const total = assessments.length;
    const statusCounts = assessments.reduce((acc, assessment) => {
      acc[assessment.status] = (acc[assessment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = assessments.reduce((acc, assessment) => {
      acc[assessment.priority] = (acc[assessment.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = assessments.reduce((acc, assessment) => {
      acc[assessment.type] = (acc[assessment.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overdue = assessments.filter(a => a.is_overdue).length;
    const upcoming = assessments.filter(a => 
      a.days_until_due !== null && a.days_until_due <= 30 && a.days_until_due >= 0
    ).length;

    const completedAssessments = assessments.filter(a => a.status === 'completed');
    const avgCompletionTime = completedAssessments.length > 0
      ? completedAssessments.reduce((sum, a) => {
          if (a.completed_date && a.start_date) {
            return sum + (new Date(a.completed_date).getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24);
          }
          return sum;
        }, 0) / completedAssessments.length
      : 0;

    const avgComplianceScore = assessments.length > 0
      ? assessments.reduce((sum, a) => sum + a.compliance_score, 0) / assessments.length
      : 0;

    const completionRate = total > 0
      ? (completedAssessments.length / total) * 100
      : 0;

    const frameworksUsage = frameworks.map(framework => {
      const frameworkAssessments = assessments.filter(a => a.framework_id === framework.id);
      return {
        framework_id: framework.id,
        framework_name: framework.name,
        assessments_count: frameworkAssessments.length,
        average_score: frameworkAssessments.length > 0
          ? frameworkAssessments.reduce((sum, a) => sum + a.compliance_score, 0) / frameworkAssessments.length
          : 0
      };
    });

    return {
      total_assessments: total,
      assessments_by_status: statusCounts as any,
      assessments_by_priority: priorityCounts as any,
      assessments_by_type: typeCounts as any,
      overdue_assessments: overdue,
      upcoming_deadlines: upcoming,
      average_completion_time: Math.round(avgCompletionTime),
      compliance_score_average: Math.round(avgComplianceScore),
      completion_rate: Math.round(completionRate),
      frameworks_usage: frameworksUsage,
      monthly_trends: [] // Implementar se necessário
    };
  };

  const duplicateAssessment = async (id: string, newName?: string): Promise<Assessment> => {
    const original = assessments.find(a => a.id === id);
    if (!original) {
      throw new Error('Assessment não encontrado');
    }

    const duplicateData: CreateAssessmentRequest = {
      name: newName || `${original.name} (Cópia)`,
      description: original.description,
      framework_id: original.framework_id,
      type: original.type,
      priority: original.priority,
      frequency: original.frequency,
      start_date: original.start_date,
      due_date: original.due_date,
      created_by: original.created_by
    };

    return await createAssessmentRequest(duplicateData);
  };

  const assignUsers = async (assessmentId: string, users: { user_id: string; role: UserRole }[]): Promise<void> => {
    // Remove existing assignments
    await supabase
      .from('assessment_user_roles')
      .delete()
      .eq('assessment_id', assessmentId);

    // Add new assignments
    const assignments = users.map(user => ({
      assessment_id: assessmentId,
      user_id: user.user_id,
      role: user.role,
      assigned_by: assessments.find(a => a.id === assessmentId)?.created_by,
      assigned_at: new Date().toISOString(),
      is_active: true
    }));

    if (assignments.length > 0) {
      const { error } = await supabase
        .from('assessment_user_roles')
        .insert(assignments);

      if (error) {
        throw error;
      }
    }
  };

  const updateProgress = async (assessmentId: string): Promise<void> => {
    // This would typically calculate progress based on completed controls
    // For now, we'll just trigger a refresh
    await refetchAssessments();
  };

  const refreshData = async (): Promise<void> => {
    await Promise.all([
      refetchAssessments(),
      refetchFrameworks(),
      fetchProfiles()
    ]);
  };

  // Load profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  return {
    // Estado dos dados
    assessments,
    frameworks,
    metrics: getMetrics(),
    profiles,
    
    // Estados de loading
    isAssessmentsLoading,
    isFrameworksLoading,
    isCreatingAssessment: createAssessmentMutation.isPending,
    isUpdatingAssessment: updateAssessmentMutation.isPending,
    isDeletingAssessment: deleteAssessmentMutation.isPending,
    
    // Estados de erro
    assessmentsError: assessmentsError as Error | null,
    frameworksError: frameworksError as Error | null,
    
    // Funções de CRUD
    createAssessment: createAssessmentMutation.mutateAsync,
    updateAssessment: updateAssessmentMutation.mutateAsync,
    deleteAssessment: deleteAssessmentMutation.mutateAsync,
    bulkActions: bulkActionMutation.mutateAsync,
    
    // Funções de filtro e busca
    filterAssessments,
    sortAssessments,
    searchAssessments,
    
    // Funções utilitárias
    getMetrics,
    refreshData,
    
    // Funções específicas do domínio
    duplicateAssessment,
    assignUsers,
    updateProgress
  };
};