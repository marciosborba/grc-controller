import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { incidentService } from '@/services/incidentService';
import type {
  Incident,
  IncidentResponse,
  IncidentAssignment,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentFilters,
  IncidentMetrics,
  IncidentType,
  IncidentCategory,
  IncidentSeverity,
  IncidentPriority,
  IncidentStatus
} from '@/types/incident-management';

import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/components/ui/use-toast';

export const useIncidentManagement = () => {
  const { user } = useAuth();
  const tenantId = useCurrentTenantId();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  console.log('🔧 [useIncidentManagement] Inicializando hook');
  console.log('👤 [useIncidentManagement] User:', user?.id);
  console.log('🏢 [useIncidentManagement] Tenant ID:', tenantId);

  // Estados de filtro
  const [filters, setFilters] = useState<IncidentFilters>({
    search_term: '',
    statuses: [],
    severities: [],
    priorities: [],
    types: [],
    categories: [],
    show_resolved: true,
    show_critical_only: false,
    show_overdue: false
  });

  // ============================================================================
  // QUERIES - BUSCA DE DADOS
  // ============================================================================

  // Query para buscar incidentes
  const {
    data: incidents = [],
    isLoading: isIncidentsLoading,
    error: incidentsError,
    refetch: refetchIncidents
  } = useQuery({
    queryKey: ['incidents', filters, tenantId],
    queryFn: async () => {
      console.log('🔍 [useIncidentManagement] Buscando incidentes...');
      console.log('🔍 [useIncidentManagement] Filtros:', filters);
      console.log('🔍 [useIncidentManagement] Tenant ID para query:', tenantId);

      // Preparar filtros para o serviço
      const serviceFilters: any = {};

      if (filters.statuses && filters.statuses.length === 1) {
        serviceFilters.status = filters.statuses[0];
      }

      if (filters.priorities && filters.priorities.length === 1) {
        serviceFilters.priority = filters.priorities[0];
      }

      // Para super admin, permitir buscar sem tenant_id ou com tenant_id específico
      if (tenantId) {
        serviceFilters.tenant_id = tenantId;
      }

      console.log('📤 [useIncidentManagement] Service filters:', serviceFilters);

      const data = await incidentService.getIncidents(serviceFilters);
      console.log('📥 [useIncidentManagement] Dados recebidos:', data);

      // Mapear dados do Supabase para o tipo Incident (usando campos reais da tabela)
      const mappedIncidents = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type as IncidentType, // Campo existe na tabela
        category: item.category as IncidentCategory,
        severity: item.severity as IncidentSeverity, // Campo existe na tabela
        priority: item.priority as IncidentPriority,
        status: item.status as IncidentStatus,
        detection_date: item.detection_date ? new Date(item.detection_date) : new Date(item.created_at),
        resolution_date: item.resolution_date ? new Date(item.resolution_date) : undefined,
        target_resolution_date: item.target_resolution_date ? new Date(item.target_resolution_date) : undefined,
        created_at: new Date(item.created_at),
        updated_at: item.updated_at ? new Date(item.updated_at) : new Date(item.created_at),
        affected_systems: item.affected_systems || [], // Campo existe na tabela
        business_impact: item.business_impact, // Campo existe na tabela
        reported_by: item.reporter?.email || item.reporter_id,
        assigned_to: item.assignee?.email || item.assignee_id,
        tags: [],
        tenant_id: item.tenant_id
      })) as Incident[];

      console.log('✅ [useIncidentManagement] Incidentes mapeados:', mappedIncidents);
      return mappedIncidents;
    },
    enabled: !!user
  });

  const {
    data: responses = [],
    isLoading: isResponsesLoading,
    refetch: refetchResponses
  } = useQuery({
    queryKey: ['incident-responses'],
    queryFn: async () => {
      // Mock for now or implement service
      return [] as IncidentResponse[];
    }
  });

  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    refetch: refetchAssignments
  } = useQuery({
    queryKey: ['incident-assignments'],
    queryFn: async () => {
      // Mock for now or implement service
      return [] as IncidentAssignment[];
    }
  });

  // Query para buscar perfis de usuários
  const {
    data: profiles = [],
    isLoading: isProfilesLoading
  } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('👥 [useIncidentManagement] Buscando perfis...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, job_title, department')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('❌ [useIncidentManagement] Erro ao buscar perfis:', error);
        throw error;
      }

      const mappedProfiles = data.map(p => ({
        user_id: p.id,
        full_name: p.full_name,
        job_title: p.job_title,
        department: p.department
      }));

      console.log('✅ [useIncidentManagement] Perfis carregados:', mappedProfiles);
      return mappedProfiles;
    }
  });

  // ============================================================================
  // MUTATIONS - OPERAÇÕES DE ESCRITA
  // ============================================================================

  // Criar novo incidente
  const createIncidentMutation = useMutation({
    mutationFn: async (incidentData: any) => {
      console.log('➕ [useIncidentManagement] Criando incidente...');
      console.log('📤 [useIncidentManagement] Dados recebidos:', incidentData);

      // Mapear para estrutura real da tabela (incluindo todos os campos)
      const supabaseData = {
        title: incidentData.title,
        description: incidentData.description || null,
        category: incidentData.category,
        priority: incidentData.priority,
        status: incidentData.status || 'open',
        type: incidentData.type || 'security_breach',
        severity: incidentData.severity || 'medium',
        detection_date: incidentData.detection_date || new Date().toISOString(),
        resolution_date: incidentData.resolution_date || null,
        business_impact: incidentData.business_impact || null,
        affected_systems: incidentData.affected_systems || null,
        reporter_id: incidentData.reported_by || user?.id || null,
        assignee_id: incidentData.assigned_to || null,
        tenant_id: tenantId || null
      };

      console.log('📤 [useIncidentManagement] Dados para Supabase:', supabaseData);
      const result = await incidentService.createIncident(supabaseData);
      console.log('✅ [useIncidentManagement] Incidente criado:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 [useIncidentManagement] Incidente criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente criado com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ [useIncidentManagement] Erro ao criar incidente:', error);
      toast.error(`Erro ao criar incidente: ${error.message}`);
    }
  });

  // Atualizar incidente
  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('🔄 [useIncidentManagement] Atualizando incidente...');
      console.log('🆔 [useIncidentManagement] ID:', id);
      console.log('📤 [useIncidentManagement] Updates recebidos:', updates);

      // Mapear para estrutura real da tabela incidents (todos os campos)
      const supabaseUpdates: any = {};

      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.category !== undefined) supabaseUpdates.category = updates.category;
      if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.type !== undefined) supabaseUpdates.type = updates.type;
      if (updates.severity !== undefined) supabaseUpdates.severity = updates.severity;
      if (updates.detection_date !== undefined) supabaseUpdates.detection_date = updates.detection_date;
      if (updates.resolution_date !== undefined) supabaseUpdates.resolution_date = updates.resolution_date;
      if (updates.target_resolution_date !== undefined) supabaseUpdates.target_resolution_date = updates.target_resolution_date;
      if (updates.business_impact !== undefined) supabaseUpdates.business_impact = updates.business_impact;
      if (updates.affected_systems !== undefined) supabaseUpdates.affected_systems = updates.affected_systems;
      if (updates.assigned_to !== undefined) supabaseUpdates.assignee_id = updates.assigned_to;
      if (updates.reported_by !== undefined) supabaseUpdates.reporter_id = updates.reported_by;

      // Sempre atualizar updated_at
      supabaseUpdates.updated_at = new Date().toISOString();

      console.log('📤 [useIncidentManagement] Updates para Supabase:', supabaseUpdates);
      const result = await incidentService.updateIncident(id, supabaseUpdates);
      console.log('✅ [useIncidentManagement] Incidente atualizado:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 [useIncidentManagement] Incidente atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente atualizado com sucesso');
    },
    onError: (error: any) => {
      console.error('❌ [useIncidentManagement] Erro ao atualizar incidente:', error);
      toast.error(`Erro ao atualizar incidente: ${error.message}`);
    }
  });

  // Excluir incidente
  const deleteIncidentMutation = useMutation({
    mutationFn: async (id: string) => {
      // Assuming we can delete via supabase client directly or add delete to service
      // For now, let's add delete to service or use supabase here
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir incidente: ${error.message}`);
    }
  });

  // Duplicar incidente
  const duplicateIncidentMutation = useMutation({
    mutationFn: async (id: string) => {
      const original = incidents.find(i => i.id === id);
      if (!original) throw new Error('Incidente não encontrado');

      const duplicateData = {
        title: `${original.title} (Cópia)`,
        description: original.description,
        category: original.category,
        priority: original.priority,
        status: 'open',
        reporter_id: original.reported_by,
        assignee_id: original.assigned_to
      };

      return await incidentService.createIncident(duplicateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente duplicado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao duplicar incidente: ${error.message}`);
    }
  });

  // Atualizar status do incidente
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      incidentId,
      status,
      comments
    }: {
      incidentId: string;
      status: string;
      comments?: string;
    }) => {
      await incidentService.updateIncident(incidentId, { status });

      if (comments) {
        // We need user_id for comment, assume current user or handle in service
        // For now, skipping comment creation here as we don't have user context easily without passing it
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success(`Status do incidente atualizado para ${status}`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });

  // Atribuir incidente
  const assignIncidentMutation = useMutation({
    mutationFn: async ({ incidentId, assigneeId }: { incidentId: string; assigneeId: string }) => {
      await incidentService.updateIncident(incidentId, { assignee_id: assigneeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente atribuído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atribuir incidente: ${error.message}`);
    }
  });

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const getMetrics = (): IncidentMetrics => {
    const total = incidents.length;
    const statusCounts = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityCounts = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryCounts = incidents.reduce((acc, incident) => {
      acc[incident.category] = (acc[incident.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating');
    const criticalIncidents = incidents.filter(i => i.severity === 'critical');

    return {
      total_incidents: total,
      incidents_by_status: statusCounts as any,
      incidents_by_severity: severityCounts as any,
      incidents_by_type: typeCounts as any,
      incidents_by_category: categoryCounts as any,

      // Métricas de Tempo (em minutos)
      average_detection_time: 0,
      average_response_time: 0,
      average_containment_time: 0,
      average_resolution_time: 0,

      // Métricas de Performance
      sla_compliance_rate: 95, // Valor mockado
      escalated_incidents: statusCounts['escalated'] || 0,
      reopened_incidents: 0,

      // Tendências
      incidents_trend_7_days: incidents.filter(i => {
        const diffTime = now.getTime() - i.detection_date.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }).length,
      incidents_trend_30_days: incidents.filter(i => {
        const diffTime = now.getTime() - i.detection_date.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length,
      critical_incidents_month: criticalIncidents.filter(i => {
        const diffTime = now.getTime() - i.detection_date.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length,

      // Impacto
      total_affected_users: 0,
      total_financial_impact: 0,
      business_downtime_hours: 0
    };
  };

  const filterIncidents = (filters: IncidentFilters): Incident[] => {
    let filtered = incidents;

    if (filters.search_term) {
      const searchLower = filters.search_term.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchLower) ||
        incident.description?.toLowerCase().includes(searchLower) ||
        incident.category.toLowerCase().includes(searchLower)
      );
    }

    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(incident => filters.statuses!.includes(incident.status));
    }

    if (filters.severities && filters.severities.length > 0) {
      filtered = filtered.filter(incident => filters.severities!.includes(incident.severity));
    }

    if (filters.priorities && filters.priorities.length > 0) {
      filtered = filtered.filter(incident => filters.priorities!.includes(incident.priority));
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(incident => filters.categories!.includes(incident.category));
    }

    if (filters.assigned_users && filters.assigned_users.length > 0) {
      filtered = filtered.filter(incident =>
        incident.assigned_to && filters.assigned_users!.includes(incident.assigned_to)
      );
    }

    if (filters.show_resolved === false) {
      filtered = filtered.filter(incident =>
        incident.status !== 'resolved' && incident.status !== 'closed'
      );
    }

    if (filters.show_critical_only) {
      filtered = filtered.filter(incident => incident.severity === 'critical');
    }

    return filtered;
  };

  const getProfileName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || 'Usuário não encontrado';
  };

  const getIncidentResponses = (incidentId: string) => {
    return responses.filter(r => r.incident_id === incidentId);
  };

  const getIncidentAssignments = (incidentId: string) => {
    return assignments.filter(a => a.incident_id === incidentId);
  };

  // ============================================================================
  // RETORNO DO HOOK
  // ============================================================================

  return {
    // Dados
    incidents,
    responses,
    assignments,
    profiles,

    // Estados de loading
    isIncidentsLoading,
    isResponsesLoading,
    isAssignmentsLoading,
    isProfilesLoading,

    // Erros
    incidentsError,

    // Mutations
    createIncident: createIncidentMutation.mutateAsync,
    updateIncident: updateIncidentMutation.mutateAsync,
    deleteIncident: deleteIncidentMutation.mutateAsync,
    duplicateIncident: duplicateIncidentMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    assignIncident: assignIncidentMutation.mutateAsync,

    // Estados das mutations
    isCreatingIncident: createIncidentMutation.isPending,
    isUpdatingIncident: updateIncidentMutation.isPending,
    isDeletingIncident: deleteIncidentMutation.isPending,
    isDuplicatingIncident: duplicateIncidentMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isAssigningIncident: assignIncidentMutation.isPending,

    // Funções auxiliares
    getMetrics,
    filterIncidents,
    getProfileName,
    getIncidentResponses,
    getIncidentAssignments,

    // Refetch functions
    refetchIncidents,
    refetchResponses,
    refetchAssignments
  };
};