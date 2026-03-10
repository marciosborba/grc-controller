import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import type {
  AssessmentFramework,
  AssessmentDomain,
  AssessmentControl,
  AssessmentQuestion,
  CreateAssessmentFrameworkData,
  FrameworkFilters,
  UseFrameworksOptions,
  FrameworkImportData,
  AssessmentFrameworkTemplate
} from '@/types/assessment';

// =====================================================
// HOOK PRINCIPAL PARA FRAMEWORKS
// =====================================================

export const useFrameworks = (options: UseFrameworksOptions = {}) => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    filters = {},
    include_domains = false,
    include_controls = false,
    include_questions = false
  } = options;

  // Query para buscar frameworks
  const {
    data: frameworks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['frameworks', tenantId, filters, include_domains, include_controls, include_questions],
    queryFn: async () => {
      if (!tenantId) return [];

      console.log('🔍 [useFrameworks] Buscando frameworks para tenant:', tenantId);

      let selectClause = '*';
      if (include_domains) {
        selectClause += ', domains:assessment_domains(*)';
        if (include_controls) {
          selectClause = selectClause.replace(
            'domains:assessment_domains(*)',
            'domains:assessment_domains(*, controls:assessment_controls(*))'
          );
          if (include_questions) {
            selectClause = selectClause.replace(
              'controls:assessment_controls(*)',
              'controls:assessment_controls(*, questions:assessment_questions(*))'
            );
          }
        }
      }

      let query = supabase
        .from('assessment_frameworks')
        .select(selectClause)
        .eq('tenant_id', tenantId);

      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('nome', `%${filters.search}%`);
      }

      if (filters.tipo_framework && filters.tipo_framework.length > 0) {
        query = query.in('tipo_framework', filters.tipo_framework);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.is_standard !== undefined) {
        query = query.eq('is_standard', filters.is_standard);
      }

      // Ordenação
      query = query.order('nome');

      const { data, error } = await query;

      if (error) {
        console.error('❌ [useFrameworks] Erro ao buscar frameworks:', error);
        throw error;
      }

      console.log(`✅ [useFrameworks] ${data?.length || 0} frameworks encontrados`);
      return data as AssessmentFramework[];
    },
    enabled: !!tenantId && !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  });

  // Mutation para criar framework
  const createFrameworkMutation = useMutation({
    mutationFn: async (data: CreateAssessmentFrameworkData): Promise<AssessmentFramework> => {
      if (!tenantId || !user?.id) {
        throw new Error('Tenant ID ou usuário não encontrado');
      }

      console.log('📝 [useFrameworks] Criando framework:', data);

      const { data: framework, error } = await supabase
        .from('assessment_frameworks')
        .insert({
          ...data,
          tenant_id: tenantId,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [useFrameworks] Erro ao criar framework:', error);
        throw error;
      }

      console.log('✅ [useFrameworks] Framework criado:', framework.id);
      return framework as AssessmentFramework;
    },
    onSuccess: (framework) => {
      queryClient.invalidateQueries({ queryKey: ['frameworks', tenantId] });
      toast.success(`Framework "${framework.nome}" criado com sucesso!`);
    },
    onError: (error) => {
      console.error('❌ [useFrameworks] Erro na mutation de criar:', error);
      toast.error('Erro ao criar framework');
    }
  });

  // Mutation para atualizar framework
  const updateFrameworkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAssessmentFrameworkData> }): Promise<AssessmentFramework> => {
      if (!user?.id) {
        throw new Error('Usuário não encontrado');
      }

      console.log('📝 [useFrameworks] Atualizando framework:', id, data);

      const { data: framework, error } = await supabase
        .from('assessment_frameworks')
        .update({
          ...data,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        console.error('❌ [useFrameworks] Erro ao atualizar framework:', error);
        throw error;
      }

      console.log('✅ [useFrameworks] Framework atualizado:', framework.id);
      return framework as AssessmentFramework;
    },
    onSuccess: (framework) => {
      queryClient.invalidateQueries({ queryKey: ['frameworks', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['framework', framework.id] });
      toast.success(`Framework "${framework.nome}" atualizado com sucesso!`);
    },
    onError: (error) => {
      console.error('❌ [useFrameworks] Erro na mutation de atualizar:', error);
      toast.error('Erro ao atualizar framework');
    }
  });

  // Mutation para deletar framework
  const deleteFrameworkMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🗑️ [useFrameworks] Deletando framework:', id);

      const { error } = await supabase
        .from('assessment_frameworks')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('❌ [useFrameworks] Erro ao deletar framework:', error);
        throw error;
      }

      console.log('✅ [useFrameworks] Framework deletado:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frameworks', tenantId] });
      toast.success('Framework deletado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ [useFrameworks] Erro na mutation de deletar:', error);
      toast.error('Erro ao deletar framework');
    }
  });

  return {
    // Dados
    frameworks,
    isLoading,
    error,
    
    // Ações
    refetch,
    createFramework: createFrameworkMutation.mutate,
    updateFramework: updateFrameworkMutation.mutate,
    deleteFramework: deleteFrameworkMutation.mutate,
    
    // Estados das mutations
    isCreating: createFrameworkMutation.isPending,
    isUpdating: updateFrameworkMutation.isPending,
    isDeleting: deleteFrameworkMutation.isPending,
  };
};

// =====================================================
// HOOK PARA UM FRAMEWORK ESPECÍFICO
// =====================================================

export const useFramework = (frameworkId: string, includeStructure = true) => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();

  const {
    data: framework,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['framework', frameworkId, includeStructure],
    queryFn: async () => {
      if (!tenantId || !frameworkId) return null;

      console.log('🔍 [useFramework] Buscando framework:', frameworkId);

      let selectClause = '*';
      if (includeStructure) {
        selectClause = `
          *,
          domains:assessment_domains(
            *,
            controls:assessment_controls(
              *,
              questions:assessment_questions(*)
            )
          )
        `;
      }

      const { data, error } = await supabase
        .from('assessment_frameworks')
        .select(selectClause)
        .eq('id', frameworkId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        console.error('❌ [useFramework] Erro ao buscar framework:', error);
        throw error;
      }

      console.log('✅ [useFramework] Framework encontrado:', data.id);
      return data as AssessmentFramework;
    },
    enabled: !!tenantId && !!frameworkId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    framework,
    isLoading,
    error,
    refetch
  };
};

// =====================================================
// HOOK PARA TEMPLATES DE FRAMEWORKS
// =====================================================

export const useFrameworkTemplates = () => {
  const { user } = useAuth();

  const {
    data: templates = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['framework-templates'],
    queryFn: async () => {
      console.log('🔍 [useFrameworkTemplates] Buscando templates de frameworks');

      const { data, error } = await supabase
        .from('assessment_framework_templates')
        .select('*')
        .eq('is_active', true)
        .order('nome');

      if (error) {
        console.error('❌ [useFrameworkTemplates] Erro ao buscar templates:', error);
        throw error;
      }

      console.log(`✅ [useFrameworkTemplates] ${data?.length || 0} templates encontrados`);
      return data as AssessmentFrameworkTemplate[];
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutos (templates mudam pouco)
  });

  return {
    templates,
    isLoading,
    error,
    refetch
  };
};

// =====================================================
// HOOK PARA IMPORTAR FRAMEWORK DE TEMPLATE
// =====================================================

export const useFrameworkImport = () => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const importFrameworkMutation = useMutation({
    mutationFn: async (templateId: string): Promise<AssessmentFramework> => {
      if (!tenantId || !user?.id) {
        throw new Error('Tenant ID ou usuário não encontrado');
      }

      console.log('📥 [useFrameworkImport] Importando framework do template:', templateId);

      // Buscar template
      const { data: template, error: templateError } = await supabase
        .from('assessment_framework_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        console.error('❌ [useFrameworkImport] Erro ao buscar template:', templateError);
        throw templateError;
      }

      const estrutura = template.estrutura as FrameworkImportData;

      // Criar framework
      const { data: framework, error: frameworkError } = await supabase
        .from('assessment_frameworks')
        .insert({
          nome: estrutura.framework.nome,
          tipo_framework: estrutura.framework.tipo_framework,
          versao: estrutura.framework.versao || '1.0',
          descricao: estrutura.framework.descricao,
          is_standard: true,
          tenant_id: tenantId,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (frameworkError) {
        console.error('❌ [useFrameworkImport] Erro ao criar framework:', frameworkError);
        throw frameworkError;
      }

      // Criar domínios
      const domainsToInsert = estrutura.domains.map(domain => ({
        ...domain,
        framework_id: framework.id,
        tenant_id: tenantId
      }));

      const { data: domains, error: domainsError } = await supabase
        .from('assessment_domains')
        .insert(domainsToInsert)
        .select();

      if (domainsError) {
        console.error('❌ [useFrameworkImport] Erro ao criar domínios:', domainsError);
        throw domainsError;
      }

      // Criar controles
      const controlsToInsert = estrutura.controls.map(control => {
        const domain = domains.find(d => d.codigo === control.domain_codigo);
        return {
          ...control,
          domain_id: domain?.id,
          tenant_id: tenantId
        };
      }).filter(control => control.domain_id);

      const { data: controls, error: controlsError } = await supabase
        .from('assessment_controls')
        .insert(controlsToInsert)
        .select();

      if (controlsError) {
        console.error('❌ [useFrameworkImport] Erro ao criar controles:', controlsError);
        throw controlsError;
      }

      // Criar questões
      const questionsToInsert = estrutura.questions.map(question => {
        const control = controls.find(c => c.codigo === question.control_codigo);
        return {
          ...question,
          control_id: control?.id,
          tenant_id: tenantId
        };
      }).filter(question => question.control_id);

      const { error: questionsError } = await supabase
        .from('assessment_questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('❌ [useFrameworkImport] Erro ao criar questões:', questionsError);
        throw questionsError;
      }

      console.log('✅ [useFrameworkImport] Framework importado com sucesso:', framework.id);
      return framework as AssessmentFramework;
    },
    onSuccess: (framework) => {
      queryClient.invalidateQueries({ queryKey: ['frameworks', tenantId] });
      toast.success(`Framework "${framework.nome}" importado com sucesso!`);
    },
    onError: (error) => {
      console.error('❌ [useFrameworkImport] Erro na importação:', error);
      toast.error('Erro ao importar framework');
    }
  });

  return {
    importFramework: importFrameworkMutation.mutate,
    isImporting: importFrameworkMutation.isPending,
    importError: importFrameworkMutation.error
  };
};

// =====================================================
// HOOK PARA GERENCIAR DOMÍNIOS
// =====================================================

export const useDomains = (frameworkId: string) => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: domains = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['domains', frameworkId],
    queryFn: async () => {
      if (!tenantId || !frameworkId) return [];

      console.log('🔍 [useDomains] Buscando domínios para framework:', frameworkId);

      const { data, error } = await supabase
        .from('assessment_domains')
        .select('*, controls:assessment_controls(*)')
        .eq('framework_id', frameworkId)
        .eq('tenant_id', tenantId)
        .order('ordem');

      if (error) {
        console.error('❌ [useDomains] Erro ao buscar domínios:', error);
        throw error;
      }

      console.log(`✅ [useDomains] ${data?.length || 0} domínios encontrados`);
      return data as AssessmentDomain[];
    },
    enabled: !!tenantId && !!frameworkId && !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation para criar domínio
  const createDomainMutation = useMutation({
    mutationFn: async (data: Omit<AssessmentDomain, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<AssessmentDomain> => {
      if (!tenantId || !user?.id) {
        throw new Error('Tenant ID ou usuário não encontrado');
      }

      const { data: domain, error } = await supabase
        .from('assessment_domains')
        .insert({
          ...data,
          tenant_id: tenantId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [useDomains] Erro ao criar domínio:', error);
        throw error;
      }

      return domain as AssessmentDomain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains', frameworkId] });
      queryClient.invalidateQueries({ queryKey: ['framework', frameworkId] });
      toast.success('Domínio criado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ [useDomains] Erro na mutation de criar domínio:', error);
      toast.error('Erro ao criar domínio');
    }
  });

  return {
    domains,
    isLoading,
    error,
    refetch,
    createDomain: createDomainMutation.mutate,
    isCreating: createDomainMutation.isPending
  };
};

// =====================================================
// HOOK PARA ESTATÍSTICAS DE FRAMEWORKS
// =====================================================

export const useFrameworkStats = () => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();

  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['framework-stats', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      console.log('📊 [useFrameworkStats] Calculando estatísticas de frameworks');

      // Buscar frameworks com contagens
      const { data: frameworks, error: frameworksError } = await supabase
        .from('assessment_frameworks')
        .select(`
          id,
          nome,
          tipo_framework,
          is_active,
          domains:assessment_domains(count),
          assessments:assessments(count)
        `)
        .eq('tenant_id', tenantId);

      if (frameworksError) {
        console.error('❌ [useFrameworkStats] Erro ao buscar frameworks:', frameworksError);
        throw frameworksError;
      }

      const stats = {
        total_frameworks: frameworks?.length || 0,
        active_frameworks: frameworks?.filter(f => f.is_active).length || 0,
        frameworks_by_type: frameworks?.reduce((acc, f) => {
          acc[f.tipo_framework] = (acc[f.tipo_framework] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        total_domains: frameworks?.reduce((sum, f) => sum + (f.domains?.[0]?.count || 0), 0) || 0,
        total_assessments: frameworks?.reduce((sum, f) => sum + (f.assessments?.[0]?.count || 0), 0) || 0
      };

      console.log('✅ [useFrameworkStats] Estatísticas calculadas:', stats);
      return stats;
    },
    enabled: !!tenantId && !!user,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    stats,
    isLoading,
    error,
    refetch
  };
};