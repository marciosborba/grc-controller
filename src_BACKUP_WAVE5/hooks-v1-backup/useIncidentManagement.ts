import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Incident,
  IncidentResponse,
  IncidentAssignment,
  IncidentCommunication,
  IncidentEvidence,
  RootCauseAnalysis,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentFilters,
  IncidentMetrics
} from '@/types/incident-management';

export const useIncidentManagement = () => {
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES - BUSCA DE DADOS
  // ============================================================================

  const {
    data: incidents = [],
    isLoading: isIncidentsLoading,
    error: incidentsError,
    refetch: refetchIncidents
  } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('detection_date', { ascending: false });
      
      if (error) throw error;
      
      // Mapear dados do Supabase para nossa interface
      return data.map(incident => ({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        incident_number: incident.id,
        type: incident.incident_type as any,
        category: 'Segurança da Informação' as any,
        severity: incident.severity as any,
        priority: incident.severity as any,
        impact_level: 'moderate' as any,
        urgency_level: incident.severity as any,
        status: incident.status as any,
        detection_date: new Date(incident.detection_date),
        response_start_date: incident.created_at ? new Date(incident.created_at) : undefined,
        containment_date: incident.status === 'contained' || incident.status === 'resolved' || incident.status === 'closed' ? new Date(incident.updated_at) : undefined,
        resolution_date: incident.resolution_date ? new Date(incident.resolution_date) : undefined,
        closure_date: incident.status === 'closed' ? new Date(incident.updated_at) : undefined,
        affected_systems: incident.affected_systems ? [incident.affected_systems] : [],
        affected_users_count: 0,
        business_impact: incident.description,
        financial_impact: 0,
        reported_by: incident.reported_by,
        assigned_to: incident.assigned_to,
        incident_manager: incident.assigned_to,
        response_team: incident.assigned_to ? [incident.assigned_to] : [],
        location: undefined,
        source_ip: undefined,
        source_country: undefined,
        attack_vector: undefined,
        public_communication: false,
        stakeholder_notification: false,
        media_attention: false,
        regulatory_notification_required: false,
        data_protection_authority_notified: false,
        law_enforcement_notified: false,
        evidence_collected: [],
        forensic_analysis_required: false,
        recovery_actions: undefined,
        lessons_learned: undefined,
        preventive_measures: undefined,
        created_by: incident.reported_by,
        updated_by: incident.reported_by,
        created_at: new Date(incident.created_at),
        updated_at: new Date(incident.updated_at),
        tags: [],
        external_reference: undefined,
        vendor_ticket_number: undefined,
        time_to_detection: undefined,
        time_to_response: undefined,
        time_to_containment: undefined,
        time_to_resolution: undefined
      })) as Incident[];
    }
  });

  const {
    data: responses = [],
    isLoading: isResponsesLoading,
    refetch: refetchResponses
  } = useQuery({
    queryKey: ['incident-responses'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('incident_responses')
          .select('*')
          .order('response_date', { ascending: false });
        
        if (error) throw error;
        return data as IncidentResponse[];
      } catch (error) {
        console.warn('Incident responses table not found, returning empty array');
        return [];
      }
    }
  });

  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    refetch: refetchAssignments
  } = useQuery({
    queryKey: ['incident-assignments'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('incident_assignments')
          .select('*')
          .order('assignment_date', { ascending: false });
        
        if (error) throw error;
        return data as IncidentAssignment[];
      } catch (error) {
        console.warn('Incident assignments table not found, returning empty array');
        return [];
      }
    }
  });

  // Query para buscar perfis de usuários
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
  // MUTATIONS - OPERAÇÕES DE ESCRITA
  // ============================================================================

  // Criar novo incidente
  const createIncidentMutation = useMutation({
    mutationFn: async (incidentData: CreateIncidentRequest) => {
      // Mapear dados da nossa interface para o formato do Supabase
      const supabaseData = {
        title: incidentData.title,
        description: incidentData.description,
        incident_type: incidentData.type,
        severity: incidentData.severity,
        status: 'open',
        affected_systems: incidentData.affected_systems?.join(', ') || '',
        detection_date: incidentData.detection_date.toISOString(),
        reported_by: incidentData.reported_by,
        assigned_to: incidentData.assigned_to
      };
      
      const { data, error } = await supabase
        .from('security_incidents')
        .insert([supabaseData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar incidente: ${error.message}`);
    }
  });

  // Atualizar incidente
  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateIncidentRequest }) => {
      // Mapear atualizações da nossa interface para o formato do Supabase
      const supabaseUpdates: any = {};
      
      if (updates.title) supabaseUpdates.title = updates.title;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.type) supabaseUpdates.incident_type = updates.type;
      if (updates.severity) supabaseUpdates.severity = updates.severity;
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.affected_systems) supabaseUpdates.affected_systems = updates.affected_systems.join(', ');
      if (updates.detection_date) supabaseUpdates.detection_date = updates.detection_date.toISOString();
      if (updates.resolution_date) supabaseUpdates.resolution_date = updates.resolution_date.toISOString();
      if (updates.assigned_to !== undefined) supabaseUpdates.assigned_to = updates.assigned_to;
      
      const { data, error } = await supabase
        .from('security_incidents')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar incidente: ${error.message}`);
    }
  });

  // Excluir incidente
  const deleteIncidentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('security_incidents')
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
        incident_type: original.type,
        severity: original.severity,
        status: 'open',
        affected_systems: original.affected_systems?.join(', ') || '',
        detection_date: new Date().toISOString(),
        reported_by: original.reported_by,
        assigned_to: original.assigned_to
      };
      
      const { data, error } = await supabase
        .from('security_incidents')
        .insert([duplicateData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed' | 'cancelled' | 'escalated';
      comments?: string; 
    }) => {
      const updates: any = { status };
      
      if (status === 'resolved' || status === 'closed') {
        updates.resolution_date = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('security_incidents')
        .update(updates)
        .eq('id', incidentId);

      if (error) throw error;
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
      const { error } = await supabase
        .from('security_incidents')
        .update({ assigned_to: assigneeId })
        .eq('id', incidentId);
      
      if (error) throw error;
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
      average_detection_time: incidents.reduce((acc, i) => acc + (i.time_to_detection || 0), 0) / (total || 1),
      average_response_time: incidents.reduce((acc, i) => acc + (i.time_to_response || 0), 0) / (total || 1),
      average_containment_time: incidents.reduce((acc, i) => acc + (i.time_to_containment || 0), 0) / (total || 1),
      average_resolution_time: incidents.reduce((acc, i) => acc + (i.time_to_resolution || 0), 0) / (total || 1),
      
      // Métricas de Performance
      sla_compliance_rate: 95, // Valor mockado
      escalated_incidents: statusCounts['escalated'] || 0,
      reopened_incidents: 0, // Implementar quando tiver histórico
      
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
      total_affected_users: incidents.reduce((acc, i) => acc + (i.affected_users_count || 0), 0),
      total_financial_impact: incidents.reduce((acc, i) => acc + (i.financial_impact || 0), 0),
      business_downtime_hours: 0 // Implementar cálculo baseado em resolução
    };
  };

  const filterIncidents = (filters: IncidentFilters): Incident[] => {
    let filtered = incidents;

    if (filters.search_term) {
      const searchLower = filters.search_term.toLowerCase();
      filtered = filtered.filter(incident => 
        incident.title.toLowerCase().includes(searchLower) ||
        incident.description?.toLowerCase().includes(searchLower) ||
        incident.type.toLowerCase().includes(searchLower) ||
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

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(incident => filters.types!.includes(incident.type));
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(incident => filters.categories!.includes(incident.category));
    }

    if (filters.assigned_users && filters.assigned_users.length > 0) {
      filtered = filtered.filter(incident => 
        incident.assigned_to && filters.assigned_users!.includes(incident.assigned_to)
      );
    }

    if (filters.detection_date_from) {
      filtered = filtered.filter(incident => 
        incident.detection_date >= filters.detection_date_from!
      );
    }

    if (filters.detection_date_to) {
      filtered = filtered.filter(incident => 
        incident.detection_date <= filters.detection_date_to!
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

    if (filters.show_overdue) {
      // Implementar lógica de incidentes atrasados baseada em SLA
      const now = new Date();
      filtered = filtered.filter(incident => {
        if (incident.status === 'resolved' || incident.status === 'closed') return false;
        const hoursOpen = (now.getTime() - incident.detection_date.getTime()) / (1000 * 60 * 60);
        // SLA baseado na severidade: crítica=4h, alta=8h, média=24h, baixa=72h
        const slaHours = incident.severity === 'critical' ? 4 : 
                        incident.severity === 'high' ? 8 : 
                        incident.severity === 'medium' ? 24 : 72;
        return hoursOpen > slaHours;
      });
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