/**
 * ALEX ASSESSMENT ENGINE - MAIN HOOK
 * 
 * Hook principal para gerenciar o Assessment Engine modular e adaptativo
 * Integra com IA Manager e fornece funcionalidades avançadas
 * 
 * Author: Claude Code (Alex Assessment)
 * Date: 2025-09-04
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';

// Types
interface AssessmentTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  category: string;
  config_schema: any;
  ui_schema: any;
  workflow_config: any;
  validation_rules: any;
  version: string;
  is_active: boolean;
  is_global: boolean;
  usage_count: number;
  base_framework_id?: string;
  ai_enabled: boolean;
  ai_prompts: any;
  created_at: string;
  updated_at: string;
}

interface FrameworkLibrary {
  id: string;
  name: string;
  short_name: string;
  category: string;
  description?: string;
  version: string;
  controls_definition: any[];
  domains_structure: any;
  maturity_levels: number[];
  industry_focus: string[];
  compliance_domains: string[];
  applicable_regions: string[];
  certification_requirements: any;
  is_global: boolean;
  is_premium: boolean;
  tenant_id?: string;
  usage_count: number;
  avg_completion_time?: number;
  avg_compliance_score?: number;
  ai_recommendations: any;
  benchmarking_data: any;
}

interface AIRecommendation {
  id: string;
  assessment_id: string;
  recommendation_type: string;
  trigger_context: any;
  ai_provider: string;
  ai_model: string;
  ai_response: any;
  confidence_score: number;
  status: 'pending' | 'applied' | 'dismissed' | 'expired';
  applied_by?: string;
  applied_at?: string;
  user_feedback?: any;
  created_at: string;
}

interface TenantAssessmentConfig {
  id: string;
  tenant_id: string;
  custom_fields: any;
  workflow_rules: any;
  ui_settings: any;
  ai_settings: any;
  compliance_settings: any;
  performance_settings: any;
}

interface AssessmentAnalytics {
  id: string;
  assessment_id: string;
  completion_percentage: number;
  controls_total: number;
  controls_completed: number;
  controls_in_progress: number;
  controls_not_started: number;
  avg_maturity_score?: number;
  compliance_score?: number;
  evidence_coverage_percentage?: number;
  time_to_complete_days?: number;
  calculated_at: string;
}

interface CreateAssessmentFromTemplateRequest {
  template_id: string;
  name: string;
  description?: string;
  due_date?: string;
  assigned_users?: Array<{
    user_id: string;
    role: 'respondent' | 'auditor' | 'reviewer' | 'approver';
  }>;
  custom_configuration?: any;
}

export const useAlexAssessment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ============================================================================
  // QUERIES - Data Fetching
  // ============================================================================

  // Assessment Templates
  const {
    data: assessmentTemplates = [],
    isLoading: isTemplatesLoading,
    error: templatesError
  } = useQuery({
    queryKey: ['alex-assessment-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_templates')
        .select('*')
        .or('is_global.eq.true,tenant_id.eq.' + user?.user_metadata?.tenant_id)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data as AssessmentTemplate[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Framework Library
  const {
    data: frameworkLibrary = [],
    isLoading: isFrameworksLoading,
    error: frameworksError
  } = useQuery({
    queryKey: ['alex-framework-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('framework_library')
        .select('*')
        .or('is_global.eq.true,tenant_id.eq.' + user?.user_metadata?.tenant_id)
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data as FrameworkLibrary[];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Tenant Configuration
  const {
    data: tenantConfig,
    isLoading: isConfigLoading
  } = useQuery({
    queryKey: ['alex-tenant-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_assessment_configs')
        .select('*')
        .eq('tenant_id', user?.user_metadata?.tenant_id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      return data as TenantAssessmentConfig | null;
    },
    enabled: !!user?.user_metadata?.tenant_id,
  });

  // ============================================================================
  // MUTATIONS - Data Modifications
  // ============================================================================

  // Create Assessment from Template
  const createAssessmentFromTemplate = useMutation({
    mutationFn: async (request: CreateAssessmentFromTemplateRequest) => {
      // Get template configuration
      const { data: template, error: templateError } = await supabase
        .from('assessment_templates')
        .select('*')
        .eq('id', request.template_id)
        .single();
      
      if (templateError) throw templateError;

      // Create assessment with template configuration
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          name: request.name,
          description: request.description,
          framework_id_on_creation: template.base_framework_id || template.id,
          due_date: request.due_date,
          status: 'Não Iniciado',
          progress: 0,
          created_by_user_id: user?.id
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Create assessment responses based on template
      if (template.base_framework_id) {
        const { data: controls } = await supabase
          .from('framework_controls')
          .select('id')
          .eq('framework_id', template.base_framework_id);

        if (controls?.length) {
          const responses = controls.map(control => ({
            assessment_id: assessment.id,
            control_id: control.id,
            question_status: 'not_started'
          }));

          await supabase
            .from('assessment_responses')
            .insert(responses);
        }
      }

      // Assign users if specified
      if (request.assigned_users?.length) {
        const userRoles = request.assigned_users.map(assignment => ({
          assessment_id: assessment.id,
          user_id: assignment.user_id,
          role: assignment.role,
          assigned_by: user?.id
        }));

        await supabase
          .from('assessment_user_roles')
          .insert(userRoles);
      }

      // Update template usage count
      await supabase
        .from('assessment_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', request.template_id);

      return assessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['alex-assessment-templates'] });
      toast.success('Assessment criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar assessment: ${error.message}`);
    }
  });

  // Get AI Recommendations
  const getAIRecommendations = useMutation({
    mutationFn: async ({
      assessment_id,
      control_id,
      recommendation_type,
      context
    }: {
      assessment_id: string;
      control_id?: string;
      recommendation_type: string;
      context?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('alex-assessment-recommendations', {
        body: {
          assessment_id,
          control_id,
          recommendation_type,
          context
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast.success('Recomendação IA gerada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao obter recomendação: ${error.message}`);
    }
  });

  // Generate Analytics
  const generateAnalytics = useMutation({
    mutationFn: async ({
      assessment_id,
      analysis_type,
      time_range,
      benchmark_criteria
    }: {
      assessment_id?: string;
      analysis_type: string;
      time_range?: { start_date: string; end_date: string };
      benchmark_criteria?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('alex-assessment-analytics', {
        body: {
          assessment_id,
          analysis_type,
          time_range,
          benchmark_criteria
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Analytics gerado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar analytics: ${error.message}`);
    }
  });

  // Save Tenant Configuration
  const saveTenantConfiguration = useMutation({
    mutationFn: async (config: Partial<TenantAssessmentConfig>) => {
      const { data, error } = await supabase
        .from('tenant_assessment_configs')
        .upsert({
          tenant_id: user?.user_metadata?.tenant_id,
          ...config,
          updated_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alex-tenant-config'] });
      toast.success('Configuração salva com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao salvar configuração: ${error.message}`);
    }
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getTemplatesByCategory = useCallback((category?: string) => {
    if (!category) return assessmentTemplates;
    return assessmentTemplates.filter(template => template.category === category);
  }, [assessmentTemplates]);

  const getFrameworksByCategory = useCallback((category?: string) => {
    if (!category) return frameworkLibrary;
    return frameworkLibrary.filter(framework => framework.category === category);
  }, [frameworkLibrary]);

  const getFrameworksByIndustry = useCallback((industry: string) => {
    return frameworkLibrary.filter(framework => 
      framework.industry_focus.includes(industry)
    );
  }, [frameworkLibrary]);

  const getRecommendedFrameworks = useCallback((criteria: {
    industry?: string;
    company_size?: string;
    compliance_domains?: string[];
    region?: string;
  }) => {
    return frameworkLibrary.filter(framework => {
      let score = 0;
      
      if (criteria.industry && framework.industry_focus.includes(criteria.industry)) {
        score += 3;
      }
      
      if (criteria.compliance_domains?.some(domain => 
        framework.compliance_domains.includes(domain)
      )) {
        score += 2;
      }
      
      if (criteria.region && framework.applicable_regions.includes(criteria.region)) {
        score += 1;
      }
      
      return score >= 2; // Minimum threshold
    }).sort((a, b) => b.usage_count - a.usage_count);
  }, [frameworkLibrary]);

  const createCustomTemplate = useCallback(async (templateData: {
    name: string;
    description?: string;
    category: string;
    base_framework_id?: string;
    config_schema: any;
    ui_schema: any;
    workflow_config: any;
  }) => {
    const { data, error } = await supabase
      .from('assessment_templates')
      .insert({
        ...templateData,
        tenant_id: user?.user_metadata?.tenant_id,
        created_by: user?.id,
        is_active: true,
        is_global: false,
        version: '1.0',
        ai_enabled: true,
        validation_rules: {},
        ai_prompts: {}
      })
      .select()
      .single();

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['alex-assessment-templates'] });
    toast.success('Template customizado criado!');
    
    return data;
  }, [user, queryClient]);

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // Data
    assessmentTemplates,
    frameworkLibrary,
    tenantConfig,
    
    // Loading states
    isTemplatesLoading,
    isFrameworksLoading,
    isConfigLoading,
    
    // Error states
    templatesError,
    frameworksError,
    
    // Mutations
    createAssessmentFromTemplate: createAssessmentFromTemplate.mutateAsync,
    isCreatingAssessment: createAssessmentFromTemplate.isPending,
    
    getAIRecommendations: getAIRecommendations.mutateAsync,
    isGettingRecommendations: getAIRecommendations.isPending,
    
    generateAnalytics: generateAnalytics.mutateAsync,
    isGeneratingAnalytics: generateAnalytics.isPending,
    
    saveTenantConfiguration: saveTenantConfiguration.mutateAsync,
    isSavingConfig: saveTenantConfiguration.isPending,
    
    // Helper functions
    getTemplatesByCategory,
    getFrameworksByCategory,
    getFrameworksByIndustry,
    getRecommendedFrameworks,
    createCustomTemplate,
    
    // Utility functions
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['alex-assessment-templates'] });
      queryClient.invalidateQueries({ queryKey: ['alex-framework-library'] });
      queryClient.invalidateQueries({ queryKey: ['alex-tenant-config'] });
    }
  };
};