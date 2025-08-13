import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProcessingActivity, ProcessingActivityStatus, DataCategory, ProcessingPurpose } from '@/types/privacy-management';
import { sanitizeString } from '@/utils/validation';
import { logSecurityEvent } from '@/utils/securityLogger';

export interface ProcessingActivityFilters {
  status?: ProcessingActivityStatus;
  department?: string;
  data_controller?: string;
  legal_basis?: string;
  high_risk?: boolean;
  international_transfer?: boolean;
  search?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ProcessingActivityStats {
  total: number;
  active: number;
  suspended: number;
  under_review: number;
  high_risk: number;
  with_international_transfer: number;
  by_department: Record<string, number>;
  by_purpose: Record<ProcessingPurpose, number>;
  by_legal_basis: Record<string, number>;
  thisMonth: number;
}

export interface ProcessingActivityValidation {
  activity_id: string;
  is_compliant: boolean;
  validation_notes?: string;
  validated_by: string;
  validation_date: string;
  findings?: string[];
  recommendations?: string[];
}

export interface ProcessingActivityReview {
  activity_id: string;
  review_status: 'approved' | 'rejected' | 'requires_changes';
  review_notes: string;
  reviewed_by: string;
  review_date: string;
  next_review_date?: string;
}

export function useProcessingActivities() {
  const [activities, setActivities] = useState<ProcessingActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ProcessingActivityStats>({
    total: 0,
    active: 0,
    suspended: 0,
    under_review: 0,
    high_risk: 0,
    with_international_transfer: 0,
    by_department: {},
    by_purpose: {
      marketing: 0,
      comunicacao_comercial: 0,
      analise_comportamental: 0,
      gestao_rh: 0,
      folha_pagamento: 0,
      controle_acesso: 0,
      contabilidade: 0,
      declaracoes_fiscais: 0,
      videomonitoramento: 0,
      seguranca: 0,
      atendimento_cliente: 0,
      suporte_tecnico: 0,
      pesquisa_satisfacao: 0,
      desenvolvimento_produtos: 0,
      outros: 0
    },
    by_legal_basis: {},
    thisMonth: 0
  });

  // Fetch processing activities with optional filters
  const fetchActivities = async (filters: ProcessingActivityFilters = {}) => {
    try {
      setLoading(true);

      let query = supabase
        .from('processing_activities')
        .select(`
          *,
          legal_basis:legal_basis_id(name, legal_basis_type),
          created_by_user:created_by(email, raw_user_meta_data),
          updated_by_user:updated_by(email, raw_user_meta_data)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.department) {
        query = query.eq('department', filters.department);
      }

      if (filters.data_controller) {
        query = query.eq('data_controller', filters.data_controller);
      }

      if (filters.legal_basis) {
        query = query.eq('legal_basis_id', filters.legal_basis);
      }

      if (filters.high_risk) {
        query = query.eq('is_high_risk', true);
      }

      if (filters.international_transfer) {
        query = query.eq('has_international_transfer', true);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,department.ilike.%${filters.search}%`);
      }

      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      setActivities(data || []);
      await calculateStats();

    } catch (error) {
      console.error('Error fetching processing activities:', error);
      await logSecurityEvent({
        event: 'processing_activities_fetch_error',
        description: `Error fetching processing activities: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'medium'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Calculate processing activity statistics
  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('processing_activities')
        .select('status, department, purpose, legal_basis_id, is_high_risk, has_international_transfer, created_at');

      if (error) throw error;

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const departmentStats: Record<string, number> = {};
      const purposeStats: Record<ProcessingPurpose, number> = {
        marketing: 0,
        comunicacao_comercial: 0,
        analise_comportamental: 0,
        gestao_rh: 0,
        folha_pagamento: 0,
        controle_acesso: 0,
        contabilidade: 0,
        declaracoes_fiscais: 0,
        videomonitoramento: 0,
        seguranca: 0,
        atendimento_cliente: 0,
        suporte_tecnico: 0,
        pesquisa_satisfacao: 0,
        desenvolvimento_produtos: 0,
        outros: 0
      };
      const legalBasisStats: Record<string, number> = {};

      data?.forEach(activity => {
        // Department stats
        if (activity.department) {
          departmentStats[activity.department] = (departmentStats[activity.department] || 0) + 1;
        }

        // Purpose stats
        if (activity.purpose) {
          purposeStats[activity.purpose as ProcessingPurpose] = (purposeStats[activity.purpose as ProcessingPurpose] || 0) + 1;
        }

        // Legal basis stats
        if (activity.legal_basis_id) {
          legalBasisStats[activity.legal_basis_id] = (legalBasisStats[activity.legal_basis_id] || 0) + 1;
        }
      });

      const calculatedStats: ProcessingActivityStats = {
        total: data?.length || 0,
        active: data?.filter(d => d.status === 'active').length || 0,
        suspended: data?.filter(d => d.status === 'suspended').length || 0,
        under_review: data?.filter(d => d.status === 'under_review').length || 0,
        high_risk: data?.filter(d => d.is_high_risk).length || 0,
        with_international_transfer: data?.filter(d => d.has_international_transfer).length || 0,
        by_department: departmentStats,
        by_purpose: purposeStats,
        by_legal_basis: legalBasisStats,
        thisMonth: data?.filter(d => {
          return new Date(d.created_at) >= startOfMonth;
        }).length || 0
      };

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error calculating processing activity stats:', error);
    }
  };

  // Create new processing activity
  const createActivity = async (activityData: Partial<ProcessingActivity>): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      // Sanitize input data
      const sanitizedData = {
        ...activityData,
        name: sanitizeString(activityData.name || ''),
        description: sanitizeString(activityData.description || ''),
        department: activityData.department ? sanitizeString(activityData.department) : undefined,
        data_controller: activityData.data_controller ? sanitizeString(activityData.data_controller) : undefined,
        data_processor: activityData.data_processor ? sanitizeString(activityData.data_processor) : undefined,
        retention_criteria: activityData.retention_criteria ? sanitizeString(activityData.retention_criteria) : undefined,
        security_measures: activityData.security_measures || [],
        recipients: activityData.recipients || [],
        data_categories: activityData.data_categories || [],
        data_subjects: activityData.data_subjects || []
      };

      const finalData = {
        ...sanitizedData,
        status: 'under_review' as ProcessingActivityStatus,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('processing_activities')
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;

      await logSecurityEvent({
        event: 'processing_activity_created',
        description: `New processing activity created: ${activityData.name}`,
        severity: 'low',
        metadata: {
          activity_id: data.id,
          name: activityData.name,
          department: activityData.department,
          purpose: activityData.purpose,
          is_high_risk: activityData.is_high_risk
        }
      });

      await fetchActivities(); // Refresh data

      return { success: true, id: data.id };

    } catch (error) {
      console.error('Error creating processing activity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar atividade de tratamento'
      };
    }
  };

  // Update processing activity
  const updateActivity = async (id: string, activityData: Partial<ProcessingActivity>): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedData = {
        ...activityData,
        name: activityData.name ? sanitizeString(activityData.name) : undefined,
        description: activityData.description ? sanitizeString(activityData.description) : undefined,
        department: activityData.department ? sanitizeString(activityData.department) : undefined,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(sanitizedData).forEach(key => 
        sanitizedData[key] === undefined && delete sanitizedData[key]
      );

      const { error } = await supabase
        .from('processing_activities')
        .update(sanitizedData)
        .eq('id', id);

      if (error) throw error;

      await logSecurityEvent({
        event: 'processing_activity_updated',
        description: `Processing activity updated: ${id}`,
        severity: 'low',
        metadata: {
          activity_id: id,
          updated_fields: Object.keys(sanitizedData)
        }
      });

      await fetchActivities(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error updating processing activity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar atividade de tratamento'
      };
    }
  };

  // Suspend processing activity
  const suspendActivity = async (id: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedReason = sanitizeString(reason);

      const { error } = await supabase
        .from('processing_activities')
        .update({
          status: 'suspended' as ProcessingActivityStatus,
          suspension_reason: sanitizedReason,
          suspended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await logSecurityEvent({
        event: 'processing_activity_suspended',
        description: `Processing activity suspended: ${id}`,
        severity: 'medium',
        metadata: {
          activity_id: id,
          suspension_reason: sanitizedReason
        }
      });

      await fetchActivities(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error suspending processing activity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao suspender atividade de tratamento'
      };
    }
  };

  // Reactivate processing activity
  const reactivateActivity = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('processing_activities')
        .update({
          status: 'active' as ProcessingActivityStatus,
          suspension_reason: null,
          suspended_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await logSecurityEvent({
        event: 'processing_activity_reactivated',
        description: `Processing activity reactivated: ${id}`,
        severity: 'low',
        metadata: {
          activity_id: id
        }
      });

      await fetchActivities(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error reactivating processing activity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao reativar atividade de tratamento'
      };
    }
  };

  // Validate processing activity compliance
  const validateActivity = async (validationData: ProcessingActivityValidation): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('processing_activities')
        .update({
          is_compliant: validationData.is_compliant,
          validation_notes: validationData.validation_notes,
          validated_by: validationData.validated_by,
          validated_at: validationData.validation_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', validationData.activity_id);

      if (error) throw error;

      await logSecurityEvent({
        event: 'processing_activity_validated',
        description: `Processing activity validation: ${validationData.activity_id}`,
        severity: 'medium',
        metadata: {
          activity_id: validationData.activity_id,
          is_compliant: validationData.is_compliant,
          validated_by: validationData.validated_by,
          findings: validationData.findings,
          recommendations: validationData.recommendations
        }
      });

      await fetchActivities(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error validating processing activity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao validar atividade de tratamento'
      };
    }
  };

  // Review processing activity
  const reviewActivity = async (reviewData: ProcessingActivityReview): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedNotes = sanitizeString(reviewData.review_notes);

      const updateData = {
        status: reviewData.review_status === 'approved' ? 'active' : 
                reviewData.review_status === 'rejected' ? 'suspended' : 'under_review',
        review_status: reviewData.review_status,
        review_notes: sanitizedNotes,
        reviewed_by: reviewData.reviewed_by,
        reviewed_at: reviewData.review_date,
        next_review_date: reviewData.next_review_date,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('processing_activities')
        .update(updateData)
        .eq('id', reviewData.activity_id);

      if (error) throw error;

      await logSecurityEvent({
        event: 'processing_activity_reviewed',
        description: `Processing activity reviewed: ${reviewData.activity_id}`,
        severity: 'medium',
        metadata: {
          activity_id: reviewData.activity_id,
          review_status: reviewData.review_status,
          reviewed_by: reviewData.reviewed_by,
          review_notes: sanitizedNotes
        }
      });

      await fetchActivities(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error reviewing processing activity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao revisar atividade de tratamento'
      };
    }
  };

  // Generate DPIA (Data Protection Impact Assessment) recommendation
  const generateDPIARecommendation = async (id: string): Promise<{
    requires_dpia: boolean;
    risk_level: 'low' | 'medium' | 'high';
    risk_factors: string[];
    recommendation: string;
  }> => {
    try {
      const { data: activity, error } = await supabase
        .from('processing_activities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!activity) throw new Error('Activity not found');

      // DPIA risk assessment logic
      const riskFactors: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      // Check for high-risk factors
      if (activity.is_high_risk) {
        riskFactors.push('Atividade classificada como alto risco');
        riskLevel = 'high';
      }

      if (activity.has_international_transfer) {
        riskFactors.push('Transferência internacional de dados');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      if (activity.data_categories?.includes('sensitive')) {
        riskFactors.push('Processamento de dados sensíveis');
        riskLevel = 'high';
      }

      if (activity.data_categories?.includes('biometric')) {
        riskFactors.push('Dados biométricos');
        riskLevel = 'high';
      }

      if (activity.purpose === 'analise_comportamental') {
        riskFactors.push('Análise comportamental ou profiling');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      if (activity.data_subjects?.includes('children')) {
        riskFactors.push('Dados de crianças e adolescentes');
        riskLevel = 'high';
      }

      // Determine DPIA requirement
      const requiresDPIA = riskLevel === 'high' || riskFactors.length >= 2;

      let recommendation = '';
      if (requiresDPIA) {
        recommendation = 'É recomendada a elaboração de Relatório de Impacto à Proteção de Dados (RIPD/DPIA) para esta atividade de tratamento, devido aos fatores de risco identificados.';
      } else if (riskLevel === 'medium') {
        recommendation = 'Recomenda-se monitoramento contínuo dos riscos e implementação de medidas de segurança adequadas.';
      } else {
        recommendation = 'A atividade apresenta baixo risco, mas deve continuar seguindo as melhores práticas de proteção de dados.';
      }

      await logSecurityEvent({
        event: 'dpia_recommendation_generated',
        description: `DPIA recommendation generated for activity: ${id}`,
        severity: 'low',
        metadata: {
          activity_id: id,
          requires_dpia: requiresDPIA,
          risk_level: riskLevel,
          risk_factors: riskFactors
        }
      });

      return {
        requires_dpia: requiresDPIA,
        risk_level: riskLevel,
        risk_factors: riskFactors,
        recommendation
      };

    } catch (error) {
      console.error('Error generating DPIA recommendation:', error);
      return {
        requires_dpia: false,
        risk_level: 'low',
        risk_factors: [],
        recommendation: 'Erro ao avaliar necessidade de DPIA'
      };
    }
  };

  // Generate RAT (Processing Activities Registry) report
  const generateRATReport = async (filters: ProcessingActivityFilters = {}) => {
    try {
      // Fetch all activities with related data
      const { data, error } = await supabase
        .from('processing_activities')
        .select(`
          *,
          legal_basis:legal_basis_id(name, legal_basis_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Apply client-side filtering if needed
      let filteredData = data || [];

      if (filters.status) {
        filteredData = filteredData.filter(a => a.status === filters.status);
      }

      if (filters.department) {
        filteredData = filteredData.filter(a => a.department === filters.department);
      }

      if (filters.high_risk) {
        filteredData = filteredData.filter(a => a.is_high_risk);
      }

      await logSecurityEvent({
        event: 'rat_report_generated',
        description: `RAT report generated with ${filteredData.length} activities`,
        severity: 'low',
        metadata: {
          total_activities: filteredData.length,
          filters: filters
        }
      });

      return {
        activities: filteredData,
        summary: {
          total: filteredData.length,
          active: filteredData.filter(a => a.status === 'active').length,
          suspended: filteredData.filter(a => a.status === 'suspended').length,
          high_risk: filteredData.filter(a => a.is_high_risk).length,
          with_international_transfer: filteredData.filter(a => a.has_international_transfer).length,
          by_department: filteredData.reduce((acc: Record<string, number>, a) => {
            if (a.department) {
              acc[a.department] = (acc[a.department] || 0) + 1;
            }
            return acc;
          }, {}),
          generated_at: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error generating RAT report:', error);
      return { activities: [], summary: {} };
    }
  };

  // Initialize hook
  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    stats,
    fetchActivities,
    createActivity,
    updateActivity,
    suspendActivity,
    reactivateActivity,
    validateActivity,
    reviewActivity,
    generateDPIARecommendation,
    generateRATReport,
    refresh: () => fetchActivities()
  };
}