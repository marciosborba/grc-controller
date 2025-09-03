import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';

// ================================================
// TYPES AND INTERFACES - VENDOR RISK MANAGEMENT
// ================================================

export interface VendorRegistry {
  id: string;
  tenant_id: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  registration_number?: string;
  website?: string;
  description?: string;
  business_category: string;
  vendor_type: 'strategic' | 'operational' | 'transactional' | 'critical';
  criticality_level: 'low' | 'medium' | 'high' | 'critical';
  annual_spend: number;
  contract_value: number;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_status: 'active' | 'expired' | 'terminated' | 'draft' | 'under_review';
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  address?: any;
  status: 'active' | 'inactive' | 'suspended' | 'onboarding' | 'offboarding';
  onboarding_status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  onboarding_progress: number;
  risk_score?: number;
  last_assessment_date?: string;
  next_assessment_due?: string;
  alex_analysis?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface VendorContact {
  id: string;
  vendor_id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  is_primary: boolean;
  is_security_contact: boolean;
  is_compliance_contact: boolean;
  is_technical_contact: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorAssessmentFramework {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  framework_type: 'iso27001' | 'soc2' | 'nist' | 'pci_dss' | 'lgpd' | 'gdpr' | 'custom';
  industry?: string;
  version?: string;
  is_active: boolean;
  questions: any[];
  scoring_model: any;
  alex_recommendations?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface VendorAssessment {
  id: string;
  tenant_id: string;
  vendor_id: string;
  framework_id: string;
  assessment_name: string;
  assessment_type: 'initial' | 'annual' | 'reassessment' | 'incident_triggered' | 'ad_hoc';
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  start_date: string;
  completion_date?: string;
  progress_percentage: number;
  responses?: any;
  overall_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  public_link?: string;
  public_link_expires_at?: string;
  vendor_submitted_at?: string;
  internal_review_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_clarification';
  reviewer_notes?: string;
  alex_analysis?: any;
  alex_recommendations?: any;
  evidence_attachments?: any[];
  metadata?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  vendor_registry?: VendorRegistry;
  vendor_assessment_frameworks?: VendorAssessmentFramework;
}

export interface VendorRisk {
  id: string;
  tenant_id: string;
  vendor_id: string;
  assessment_id?: string;
  title: string;
  description: string;
  risk_category: 'operational' | 'financial' | 'compliance' | 'security' | 'strategic' | 'reputational' | 'technology' | 'data_privacy';
  risk_type: 'inherent' | 'residual';
  impact_score: number;
  likelihood_score: number;
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'assessed' | 'treatment_planned' | 'in_treatment' | 'monitored' | 'closed' | 'accepted';
  treatment_strategy?: 'avoid' | 'mitigate' | 'transfer' | 'accept';
  owner_user_id?: string;
  identified_date: string;
  last_review_date?: string;
  next_review_date?: string;
  alex_analysis?: any;
  alex_recommendations?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  vendor_registry?: VendorRegistry;
}

export interface VendorRiskActionPlan {
  id: string;
  tenant_id: string;
  vendor_id: string;
  risk_id: string;
  title: string;
  description: string;
  action_type: 'preventive' | 'corrective' | 'detective' | 'compensating';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | 'overdue';
  progress_percentage: number;
  assigned_to?: string;
  due_date: string;
  start_date?: string;
  completion_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  effectiveness_rating?: number;
  verification_method?: string;
  verification_evidence?: string;
  alex_insights?: any;
  dependencies?: string[];
  milestones?: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  vendor_registry?: VendorRegistry;
  vendor_risks?: VendorRisk;
}

export interface VendorIncident {
  id: string;
  tenant_id: string;
  vendor_id: string;
  title: string;
  description: string;
  incident_type: 'security_breach' | 'data_loss' | 'service_disruption' | 'compliance_violation' | 'financial_issue' | 'operational_failure' | 'contract_breach' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  impact_assessment?: string;
  root_cause?: string;
  resolution_summary?: string;
  occurred_at: string;
  detected_at: string;
  resolved_at?: string;
  reported_by?: string;
  assigned_to?: string;
  escalated_to?: string;
  external_reference?: string;
  regulatory_notification_required: boolean;
  regulatory_notification_sent: boolean;
  client_notification_required: boolean;
  client_notification_sent: boolean;
  alex_analysis?: any;
  alex_recommendations?: any;
  lessons_learned?: string;
  attachments?: any[];
  metadata?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  vendor_registry?: VendorRegistry;
}

export interface DashboardMetrics {
  total_vendors: number;
  critical_vendors: number;
  pending_assessments: number;
  overdue_assessments: number;
  high_risk_vendors: number;
  active_incidents: number;
  expiring_contracts: number;
  expiring_certifications: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// ================================================
// FILTER AND SORTING OPTIONS
// ================================================

export interface VendorFilters {
  status?: string[];
  criticality_level?: string[];
  vendor_type?: string[];
  business_category?: string[];
  risk_level?: string[];
  contract_status?: string[];
  search?: string;
}

export interface AssessmentFilters {
  status?: string[];
  assessment_type?: string[];
  priority?: string[];
  risk_level?: string[];
  framework_type?: string[];
  search?: string;
  vendor_id?: string;
}

export interface RiskFilters {
  status?: string[];
  risk_level?: string[];
  risk_category?: string[];
  risk_type?: string[];
  treatment_strategy?: string[];
  search?: string;
  vendor_id?: string;
}

// ================================================
// MAIN HOOK IMPLEMENTATION
// ================================================

export const useVendorRiskManagement = () => {
  const { toast } = useToast();
  const authContext = useAuth();
  
  // Verificar se o contexto está disponível
  if (!authContext) {
    console.warn('useVendorRiskManagement: AuthContext não disponível');
    // Retornar valores padrão seguros
    return {
      vendors: [],
      assessments: [],
      risks: [],
      actionPlans: [],
      incidents: [],
      frameworks: [],
      dashboardMetrics: null,
      riskDistribution: null,
      loading: false,
      error: null,
      fetchVendors: () => Promise.resolve(),
      createVendor: () => Promise.resolve(null),
      updateVendor: () => Promise.resolve(null),
      deleteVendor: () => Promise.resolve(false),
      fetchAssessments: () => Promise.resolve(),
      createAssessment: () => Promise.resolve(null),
      updateAssessment: () => Promise.resolve(null),
      sendAssessmentToVendor: () => Promise.resolve(null),
      fetchRisks: () => Promise.resolve(),
      createRisk: () => Promise.resolve(null),
      updateRisk: () => Promise.resolve(null),
      fetchDashboardMetrics: () => Promise.resolve(),
      fetchRiskDistribution: () => Promise.resolve(),
      fetchFrameworks: () => Promise.resolve(),
      resetError: () => {}
    };
  }
  
  const { user } = authContext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State management
  const [vendors, setVendors] = useState<VendorRegistry[]>([]);
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [risks, setRisks] = useState<VendorRisk[]>([]);
  const [actionPlans, setActionPlans] = useState<VendorRiskActionPlan[]>([]);
  const [incidents, setIncidents] = useState<VendorIncident[]>([]);
  const [frameworks, setFrameworks] = useState<VendorAssessmentFramework[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);

  // ================================================
  // UTILITY FUNCTIONS
  // ================================================

  const handleError = useCallback((error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    const errorMessage = error?.message || `Erro ao ${operation}`;
    setError(errorMessage);
    toast({
      title: 'Erro',
      description: errorMessage,
      variant: 'destructive',
    });
  }, [toast]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // ================================================
  // VENDOR REGISTRY OPERATIONS
  // ================================================

  const fetchVendors = useCallback(async (filters?: VendorFilters) => {
    if (!user?.tenantId && !user?.tenant_id) return;
    
    setLoading(true);
    resetError();
    
    try {
      const tenantId = user.tenantId || user.tenant_id;
      let query = supabase
        .from('vendor_registry')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.criticality_level?.length) {
        query = query.in('criticality_level', filters.criticality_level);
      }
      if (filters?.vendor_type?.length) {
        query = query.in('vendor_type', filters.vendor_type);
      }
      if (filters?.business_category?.length) {
        query = query.in('business_category', filters.business_category);
      }
      if (filters?.contract_status?.length) {
        query = query.in('contract_status', filters.contract_status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVendors(data || []);
    } catch (error) {
      handleError(error, 'buscar fornecedores');
    } finally {
      setLoading(false);
    }
  }, [user?.tenantId, user?.tenant_id, handleError, resetError]);

  const createVendor = useCallback(async (vendor: Omit<VendorRegistry, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.tenantId && !user?.tenant_id) return null;
    
    setLoading(true);
    resetError();
    
    try {
        const tenantId = user.tenantId || user.tenant_id;
        const { data, error } = await supabase
          .from('vendor_registry')
          .insert({
            ...vendor,
            tenant_id: tenantId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setVendors(prev => [data, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Fornecedor criado com sucesso.',
      });

      return data;
    } catch (error) {
      handleError(error, 'criar fornecedor');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, handleError, resetError, toast]);

  const updateVendor = useCallback(async (id: string, updates: Partial<VendorRegistry>) => {
    setLoading(true);
    resetError();
    
    try {
      const { data, error } = await supabase
        .from('vendor_registry')
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setVendors(prev => prev.map(v => v.id === id ? data : v));
      
      toast({
        title: 'Sucesso',
        description: 'Fornecedor atualizado com sucesso.',
      });

      return data;
    } catch (error) {
      handleError(error, 'atualizar fornecedor');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError, resetError, toast]);

  const deleteVendor = useCallback(async (id: string) => {
    setLoading(true);
    resetError();
    
    try {
      const { error } = await supabase
        .from('vendor_registry')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVendors(prev => prev.filter(v => v.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Fornecedor removido com sucesso.',
      });

      return true;
    } catch (error) {
      handleError(error, 'remover fornecedor');
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, resetError, toast]);

  // ================================================
  // VENDOR ASSESSMENTS OPERATIONS
  // ================================================

  const fetchAssessments = useCallback(async (filters?: AssessmentFilters) => {
    if (!user?.tenant_id) return;
    
    setLoading(true);
    resetError();
    
    try {
      let query = supabase
        .from('vendor_assessments')
        .select(`
          *,
          vendor_registry (
            id,
            name,
            criticality_level,
            status,
            risk_score
          ),
          vendor_assessment_frameworks (
            id,
            name,
            framework_type
          )
        `)
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.assessment_type?.length) {
        query = query.in('assessment_type', filters.assessment_type);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.risk_level?.length) {
        query = query.in('risk_level', filters.risk_level);
      }
      if (filters?.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id);
      }
      if (filters?.search) {
        query = query.or(`assessment_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAssessments(data || []);
    } catch (error) {
      handleError(error, 'buscar avaliações');
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, handleError, resetError]);

  const createAssessment = useCallback(async (assessment: Omit<VendorAssessment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.tenant_id) return null;
    
    setLoading(true);
    resetError();
    
    try {
      const { data, error } = await supabase
        .from('vendor_assessments')
        .insert({
          ...assessment,
          tenant_id: user.tenant_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setAssessments(prev => [data, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Avaliação criada com sucesso.',
      });

      return data;
    } catch (error) {
      handleError(error, 'criar avaliação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, handleError, resetError, toast]);

  const updateAssessment = useCallback(async (id: string, updates: Partial<VendorAssessment>) => {
    setLoading(true);
    resetError();
    
    try {
      const { data, error } = await supabase
        .from('vendor_assessments')
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAssessments(prev => prev.map(a => a.id === id ? data : a));
      
      toast({
        title: 'Sucesso',
        description: 'Avaliação atualizada com sucesso.',
      });

      return data;
    } catch (error) {
      handleError(error, 'atualizar avaliação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError, resetError, toast]);

  const sendAssessmentToVendor = useCallback(async (assessmentId: string, vendorEmail: string) => {
    setLoading(true);
    resetError();
    
    try {
      // Update assessment status to 'sent'
      const { data, error } = await supabase
        .from('vendor_assessments')
        .update({
          status: 'sent',
          updated_by: user?.id,
        })
        .eq('id', assessmentId)
        .select()
        .single();

      if (error) throw error;

      // TODO: Send email notification to vendor
      // This would typically involve calling an edge function or email service

      setAssessments(prev => prev.map(a => a.id === assessmentId ? data : a));
      
      toast({
        title: 'Sucesso',
        description: 'Avaliação enviada para o fornecedor.',
      });

      return data;
    } catch (error) {
      handleError(error, 'enviar avaliação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError, resetError, toast]);

  // ================================================
  // VENDOR RISKS OPERATIONS
  // ================================================

  const fetchRisks = useCallback(async (filters?: RiskFilters) => {
    if (!user?.tenant_id) return;
    
    setLoading(true);
    resetError();
    
    try {
      let query = supabase
        .from('vendor_risks')
        .select(`
          *,
          vendor_registry (
            id,
            name,
            criticality_level,
            status
          )
        `)
        .eq('tenant_id', user.tenant_id)
        .order('overall_score', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.risk_level?.length) {
        query = query.in('risk_level', filters.risk_level);
      }
      if (filters?.risk_category?.length) {
        query = query.in('risk_category', filters.risk_category);
      }
      if (filters?.risk_type?.length) {
        query = query.in('risk_type', filters.risk_type);
      }
      if (filters?.treatment_strategy?.length) {
        query = query.in('treatment_strategy', filters.treatment_strategy);
      }
      if (filters?.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRisks(data || []);
    } catch (error) {
      handleError(error, 'buscar riscos');
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, handleError, resetError]);

  const createRisk = useCallback(async (risk: Omit<VendorRisk, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.tenant_id) return null;
    
    setLoading(true);
    resetError();
    
    try {
      const { data, error } = await supabase
        .from('vendor_risks')
        .insert({
          ...risk,
          tenant_id: user.tenant_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setRisks(prev => [data, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Risco criado com sucesso.',
      });

      return data;
    } catch (error) {
      handleError(error, 'criar risco');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, handleError, resetError, toast]);

  const updateRisk = useCallback(async (id: string, updates: Partial<VendorRisk>) => {
    setLoading(true);
    resetError();
    
    try {
      const { data, error } = await supabase
        .from('vendor_risks')
        .update({
          ...updates,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRisks(prev => prev.map(r => r.id === id ? data : r));
      
      toast({
        title: 'Sucesso',
        description: 'Risco atualizado com sucesso.',
      });

      return data;
    } catch (error) {
      handleError(error, 'atualizar risco');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError, resetError, toast]);

  // ================================================
  // DASHBOARD AND METRICS
  // ================================================

  const fetchDashboardMetrics = useCallback(async () => {
    if (!user?.tenant_id) return;
    
    setLoading(true);
    resetError();
    
    try {
      const { data, error } = await supabase.rpc('get_vendor_dashboard_metrics', {
        tenant_uuid: user.tenant_id
      });

      if (error) throw error;

      setDashboardMetrics(data);
    } catch (error) {
      handleError(error, 'buscar métricas do dashboard');
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id, handleError, resetError]);

  const fetchRiskDistribution = useCallback(async () => {
    if (!user?.tenant_id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_vendor_risk_distribution', {
        tenant_uuid: user.tenant_id
      });

      if (error) throw error;

      setRiskDistribution(data);
    } catch (error) {
      handleError(error, 'buscar distribuição de riscos');
    }
  }, [user?.tenant_id, handleError]);

  const fetchFrameworks = useCallback(async () => {
    if (!user?.tenant_id) return;
    
    try {
      const { data, error } = await supabase
        .from('vendor_assessment_frameworks')
        .select('*')
        .or(`tenant_id.eq.${user.tenant_id},tenant_id.eq.00000000-0000-0000-0000-000000000000`)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setFrameworks(data || []);
    } catch (error) {
      handleError(error, 'buscar frameworks');
    }
  }, [user?.tenant_id, handleError]);

  // ================================================
  // INITIALIZATION
  // ================================================

  useEffect(() => {
    if (user?.tenant_id) {
      fetchFrameworks();
      fetchDashboardMetrics();
      fetchRiskDistribution();
    }
  }, [user?.tenant_id, fetchFrameworks, fetchDashboardMetrics, fetchRiskDistribution]);

  // ================================================
  // RETURN HOOK INTERFACE
  // ================================================

  return {
    // Data
    vendors,
    assessments,
    risks,
    actionPlans,
    incidents,
    frameworks,
    dashboardMetrics,
    riskDistribution,
    
    // State
    loading,
    error,
    
    // Vendor Operations
    fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
    
    // Assessment Operations
    fetchAssessments,
    createAssessment,
    updateAssessment,
    sendAssessmentToVendor,
    
    // Risk Operations
    fetchRisks,
    createRisk,
    updateRisk,
    
    // Dashboard Operations
    fetchDashboardMetrics,
    fetchRiskDistribution,
    fetchFrameworks,
    
    // Utility
    resetError,
  };
};

export default useVendorRiskManagement;