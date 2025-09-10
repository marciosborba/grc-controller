import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { 
  useTenantSecurity,
  tenantAccessMiddleware,
  TENANT_SECURITY_CONFIG 
} from '@/utils/tenantSecurity';
import { useTenantSettings } from './useTenantSettings';
import type { 
  Risk, 
  ActionPlan, 
  Activity, 
  RiskAcceptanceLetter, 
  RiskCommunication,
  CreateRiskRequest,
  UpdateRiskRequest,
  CreateActivityRequest,
  RiskFilters,
  RiskMetrics,
  RiskLevel,
  TreatmentType,
  RiskStatus,
  ActivityStatus
} from '@/types/risk-management';

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Função para normalizar estratégias de tratamento (converter PT -> EN para o banco)
const normalizeTreatmentStrategy = (strategy: string): string => {
  const normalizations: Record<string, string> = {
    'Mitigar': 'mitigate',
    'Transferir': 'transfer',
    'Evitar': 'avoid', 
    'Aceitar': 'accept',
    // Também aceitar valores já normalizados
    'mitigate': 'mitigate',
    'transfer': 'transfer',
    'avoid': 'avoid',
    'accept': 'accept'
  };
  
  return normalizations[strategy] || strategy;
};

// ============================================================================
// HOOK PRINCIPAL PARA GESTÃO DE RISCOS
// ============================================================================

export const useRiskManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    userTenantId, 
    validateAccess, 
    enforceFilter, 
    logActivity,
    isValidTenant 
  } = useTenantSecurity();
  const { calculateRiskLevel, getMatrixLabels, getMatrixDimensions, isMatrix4x4 } = useTenantSettings();

  // Verificar se usuário tem tenant válido
  if (!isValidTenant) {
    console.warn('[RISK-SECURITY] User without valid tenant accessing risk management');
  }
  
  // Funções de mapeamento
  const mapSupabaseStatusToRiskStatus = (status: string, currentStep?: number): RiskStatus => {
    console.log('🔄 mapSupabaseStatusToRiskStatus:', { status, currentStep });
    
    // Mapear status do banco para português da aplicação
    // Status do banco: 'draft', 'in_progress', 'completed', 'cancelled'
    // Usar current_step para distinguir entre diferentes fases de in_progress
    
    switch (status) {
      case 'draft': 
        return 'Identificado';
      
      case 'in_progress':
        // Usar current_step para distinguir as fases
        if (currentStep === 2) return 'Avaliado';
        if (currentStep === 5) return 'Em Tratamento';
        if (currentStep === 7) return 'Monitorado';
        // Padrão para in_progress sem step definido
        return 'Em Tratamento';
      
      case 'completed': 
        return 'Fechado';
      
      case 'cancelled': 
        return 'Fechado';
      
      // Para compatibilidade com dados antigos em português
      case 'Identificado': return 'Identificado';
      case 'Avaliado': return 'Avaliado';
      case 'Em Tratamento': return 'Em Tratamento';
      case 'Monitorado': return 'Monitorado';
      case 'Fechado': return 'Fechado';
      case 'Reaberto': return 'Reaberto';
      
      default: 
        console.log('🔄 Status não mapeado, usando "Identificado":', status);
        return 'Identificado';
    }
  };
  
  const mapRiskStatusToSupabaseStatus = (status: RiskStatus): { status: string; current_step?: number } => {
    console.log('🔄 mapRiskStatusToSupabaseStatus: status da aplicação =', status);
    
    // Mapear status em português para valores aceitos pela constraint do banco
    // Constraint: status IN ('draft', 'in_progress', 'completed', 'cancelled')
    // Usar current_step para distinguir entre diferentes fases
    let mappedStatus: string;
    let currentStep: number | undefined;
    
    switch (status) {
      case 'Identificado': 
        mappedStatus = 'draft';
        currentStep = 1; // Etapa 1: Identificação
        break;
      case 'Avaliado': 
        mappedStatus = 'in_progress';
        currentStep = 2; // Etapa 2: Análise
        break;
      case 'Em Tratamento': 
        mappedStatus = 'in_progress';
        currentStep = 5; // Etapa 5: Plano de Ação
        break;
      case 'Monitorado': 
        mappedStatus = 'in_progress';
        currentStep = 7; // Etapa 7: Monitoramento
        break;
      case 'Fechado': 
        mappedStatus = 'completed';
        currentStep = 7; // Processo finalizado
        break;
      case 'Reaberto': 
        mappedStatus = 'draft';
        currentStep = 1; // Reaberto volta para identificação
        break;
      default: 
        console.log('🔄 Status não mapeado, usando "draft":', status);
        mappedStatus = 'draft';
        currentStep = 1;
    }
    
    console.log('✅ Status mapeado:', status, '->', { status: mappedStatus, current_step: currentStep });
    console.log('📝 Constraint aceita: draft, in_progress, completed, cancelled');
    return { status: mappedStatus, current_step: currentStep };
  };
  
  const mapRiskLevel = (level: string): string => {
    console.log('🔄 mapRiskLevel: level do banco =', level);
    
    switch (level) {
      case 'Crítico': return 'Crítico';
      case 'Muito Alto': return 'Muito Alto';
      case 'Alto': return 'Alto';
      case 'Médio': return 'Médio';
      case 'Baixo': return 'Baixo';
      case 'Muito Baixo': return 'Muito Baixo';
      default: 
        console.log('🔄 Level não mapeado, usando original:', level);
        return level || 'Médio';
    }
  };

  // ============================================================================
  // QUERIES - BUSCA DE DADOS
  // ============================================================================

  // Buscar todos os riscos com filtros (ISOLAMENTO POR TENANT)
  const {
    data: risks = [],
    isLoading: isLoadingRisks,
    error: risksError
  } = useQuery({
    queryKey: ['risks', userTenantId],
    queryFn: async (): Promise<Risk[]> => {
      console.log('🔍 [QUERY] Iniciando busca de riscos:', {
        userTenantId,
        hasUser: !!user,
        userId: user?.id
      });
      
      if (!userTenantId) {
        console.error('❌ [QUERY] Tenant ID não encontrado');
        await logActivity('invalid_access', {
          action: 'query_risks_without_tenant',
          reason: 'No tenant ID found'
        });
        throw new Error('Acesso negado: tenant não identificado');
      }

      console.log('🔍 [QUERY] Executando query no Supabase...');
      
      // TESTE: Primeiro verificar se os campos existem na tabela
      console.log('🔍 [QUERY] Testando existência dos campos do wizard...');
      
      try {
        const { data: testData, error: testError } = await supabase
          .from('risk_registrations')
          .select('id, activity_1_name, awareness_person_1_name, treatment_rationale')
          .limit(1);
          
        if (testError) {
          console.error('❌ [QUERY] Erro ao testar campos:', testError.message);
          if (testError.message.includes('column') && testError.message.includes('does not exist')) {
            console.error('🚨 [QUERY] CAMPOS DO WIZARD NÃO EXISTEM NA TABELA!');
            console.error('🚨 [QUERY] Execute o script EXECUTE_IN_SUPABASE.sql primeiro!');
          }
        } else {
          console.log('✅ [QUERY] Campos do wizard existem na tabela');
        }
      } catch (err) {
        console.error('❌ [QUERY] Erro no teste de campos:', err);
      }
      
      // Buscar riscos com filtro por tenant - COM JOINs CORRETOS
      // Usar nomes corretos das tabelas relacionadas
      const { data, error } = await supabase
        .from('risk_registrations')
        .select(`
          *,
          risk_registration_action_plans(
            id,
            activity_name,
            activity_description,
            responsible_name,
            responsible_email,
            due_date,
            priority,
            status,
            created_at
          ),
          risk_stakeholders(
            id,
            name,
            position,
            email,
            notification_type,
            response_status
          )
        `)
        .eq('tenant_id', userTenantId) // FILTRO CRÍTICO POR TENANT
        .order('created_at', { ascending: false });

      console.log('🔍 [QUERY] Resultado da query:', {
        hasData: !!data,
        dataLength: data?.length || 0,
        hasError: !!error,
        error: error?.message
      });
      
      // LOG ESPECÍFICO: Verificar registro 005092025
      const targetRisk = data?.find(r => r.risk_code === '005092025' || r.id.includes('005092025') || r.risk_title?.includes('005092025'));
      if (targetRisk) {
        console.log('🎯 [SPECIFIC] Registro 005092025 encontrado:', {
          id: targetRisk.id,
          risk_code: targetRisk.risk_code,
          risk_title: targetRisk.risk_title,
          // Campos do plano de ação na tabela principal
          activity_1_name: targetRisk.activity_1_name,
          activity_1_description: targetRisk.activity_1_description,
          activity_1_responsible: targetRisk.activity_1_responsible,
          activity_1_email: targetRisk.activity_1_email,
          // Campos de comunicação na tabela principal
          awareness_person_1_name: targetRisk.awareness_person_1_name,
          awareness_person_1_position: targetRisk.awareness_person_1_position,
          awareness_person_1_email: targetRisk.awareness_person_1_email,
          approval_person_1_name: targetRisk.approval_person_1_name,
          approval_person_1_position: targetRisk.approval_person_1_position,
          approval_person_1_email: targetRisk.approval_person_1_email,
          // Arrays das tabelas relacionadas
          risk_registration_action_plans_count: targetRisk.risk_registration_action_plans?.length || 0,
          risk_stakeholders_count: targetRisk.risk_stakeholders?.length || 0,
          // Dados de tratamento
          treatment_rationale: targetRisk.treatment_rationale,
          treatment_cost: targetRisk.treatment_cost,
          treatment_timeline: targetRisk.treatment_timeline
        });
      } else {
        console.log('⚠️ [SPECIFIC] Registro 005092025 NÃO encontrado na query');
        console.log('🔍 [SPECIFIC] Códigos disponíveis:', data?.map(r => r.risk_code || r.id).slice(0, 10));
      }

      if (error) {
        console.error('❌ [QUERY] Erro na query:', error);
        await logActivity('security_violation', {
          action: 'query_risks_error',
          error: error.message
        });
        throw error;
      }

      console.log('🔍 [VALIDATION] Validando dados por tenant:', {
        totalRecords: data?.length || 0,
        userTenantId,
        firstRecordTenantId: data?.[0]?.tenant_id
      });
      
      // Validar que todos os dados pertencem ao tenant correto
      const validatedData = (data || []).filter((risk, index) => {
        const isValid = risk.tenant_id === userTenantId;
        
        console.log(`🔍 [VALIDATION] Registro ${index + 1}:`, {
          riskId: risk.id,
          riskTenantId: risk.tenant_id,
          userTenantId,
          isValid
        });
        
        if (!isValid) {
          console.warn(`⚠️ [VALIDATION] Registro ${index + 1} rejeitado por tenant diferente`);
          logActivity('cross_tenant_attempt', {
            action: 'risk_data_validation_failed',
            riskId: risk.id,
            riskTenant: risk.tenant_id,
            userTenant: userTenantId
          });
          return false;
        }
        return true;
      });
      
      console.log('🔍 [VALIDATION] Resultado da validação:', {
        originalCount: data?.length || 0,
        validatedCount: validatedData.length,
        filteredOut: (data?.length || 0) - validatedData.length
      });

      // LOG TEMPORÁRIO: Verificar dados brutos do Supabase
      console.log('🔍 DADOS BRUTOS DO SUPABASE:', validatedData.map(r => ({
        id: r.id,
        risk_title: r.risk_title,
        risk_code: r.risk_code,
        treatment_rationale: r.treatment_rationale ? 'TEM DADOS' : 'VAZIO',
        activity_1_name: r.activity_1_name,
        activity_1_description: r.activity_1_description ? 'TEM DADOS' : 'VAZIO',
        awareness_person_1_name: r.awareness_person_1_name,
        monitoring_frequency: r.monitoring_frequency,
        // Dados das tabelas relacionadas
        risk_registration_action_plans: r.risk_registration_action_plans?.length || 0,
        risk_stakeholders: r.risk_stakeholders?.length || 0
      })));

      console.log('🔍 [TRANSFORM] Iniciando transformação de', validatedData.length, 'registros');
      
      // Transformar dados do Supabase para o formato da aplicação
      const transformedRisks = validatedData.map((supabaseRisk, index) => {
        console.log(`🔍 [TRANSFORM] Transformando registro ${index + 1}:`, {
          id: supabaseRisk.id,
          risk_title: supabaseRisk.risk_title,
          status: supabaseRisk.status,
          current_step: supabaseRisk.current_step
        });
        
        try {
          const transformed = transformSupabaseRiskToRisk(supabaseRisk);
          console.log(`✅ [TRANSFORM] Registro ${index + 1} transformado com sucesso:`, {
            id: transformed.id,
            name: transformed.name,
            status: transformed.status
          });
          return transformed;
        } catch (error) {
          console.error(`❌ [TRANSFORM] Erro ao transformar registro ${index + 1}:`, error);
          throw error;
        }
      });
      
      // LOG TEMPORÁRIO: Verificar dados transformados
      console.log('🔍 DADOS TRANSFORMADOS:', transformedRisks.map(r => ({
        id: r.id,
        name: r.name,
        riskCode: r.riskCode,
        treatment_rationale: r.treatment_rationale,
        activity_1_name: r.activity_1_name,
        awareness_person_1_name: r.awareness_person_1_name,
        monitoring_frequency: r.monitoring_frequency
      })));
      
      console.log('✅ [QUERY] Retornando', transformedRisks.length, 'riscos transformados');
      return transformedRisks;
    },
    enabled: !!user && !!userTenantId,
    staleTime: 0, // TEMPORARIAMENTE DESABILITADO PARA DEBUG
    gcTime: 0,    // TEMPORARIAMENTE DESABILITADO PARA DEBUG
    refetchOnMount: true,     // TEMPORARIAMENTE HABILITADO PARA DEBUG
    refetchOnWindowFocus: true // TEMPORARIAMENTE HABILITADO PARA DEBUG
  });

  // Query otimizada para métricas críticas - apenas dados essenciais
  const {
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery({
    queryKey: ['risk-metrics-fast', userTenantId],
    queryFn: async (): Promise<RiskMetrics> => {
      if (!userTenantId) {
        throw new Error('Acesso negado: tenant não identificado');
      }

      // Query otimizada - apenas campos necessários para métricas
      const { data: riskData, error } = await supabase
        .from('risk_registrations')
        .select('id, risk_level, status, current_step, created_at')
        .eq('tenant_id', userTenantId);

      if (error) {
        throw error;
      }

      const rawRisks = riskData || [];
      
      // Cálculo otimizado das métricas sem transformação completa
      const risksByLevel: Record<RiskLevel, number> = {
        'Muito Alto': 0,
        'Alto': 0,
        'Médio': 0,
        'Baixo': 0,
        'Muito Baixo': 0
      };

      const risksByStatus: Record<RiskStatus, number> = {
        'Identificado': 0,
        'Avaliado': 0,
        'Em Tratamento': 0,
        'Monitorado': 0,
        'Fechado': 0,
        'Reaberto': 0
      };

      rawRisks.forEach(risk => {
        // Mapear nível do risco
        let level = mapRiskLevel(risk.risk_level);
        if (level === 'Crítico') level = 'Muito Alto'; // Consolidar para métricas
        risksByLevel[level as RiskLevel] = (risksByLevel[level as RiskLevel] || 0) + 1;

        // Mapear status do risco
        const status = mapSupabaseStatusToRiskStatus(risk.status, risk.current_step);
        risksByStatus[status] = (risksByStatus[status] || 0) + 1;
      });

      // Query separada para atividades atrasadas (não-crítica)
      let overdueActivities = 0;
      try {
        const now = new Date();
        const { data: activities } = await supabase
          .from('risk_action_activities')
          .select('id', { count: 'exact', head: true })
          .lt('deadline', now.toISOString())
          .neq('status', 'Concluído')
          .neq('status', 'Cancelado');
        
        overdueActivities = activities?.length || 0;
      } catch (error) {
        // Ignorar erro se tabela não existir
        overdueActivities = 0;
      }

      return {
        totalRisks: rawRisks.length,
        risksByLevel,
        risksByCategory: {},
        risksByStatus,
        overdueActivities,
        riskTrend: 'Estável',
        averageResolutionTime: 0
      };
    },
    enabled: !!user && !!userTenantId,
    staleTime: 1 * 60 * 1000, // 1 minuto para métricas críticas
    gcTime: 5 * 60 * 1000,    // 5 minutos na memória
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
  
  // Log de estado após declaração de TODAS as variáveis
  console.log('🔍 Estado das queries:', {
    isLoadingRisks,
    isLoadingMetrics,
    hasRisks: risks.length,
    hasMetrics: !!metrics,
    enabled: !!user && !!userTenantId,
    user: !!user,
    userTenantId
  });

  // ============================================================================
  // MUTATIONS - OPERAÇÕES DE ESCRITA
  // ============================================================================

  // Criar novo risco
  const createRiskMutation = useMutation({
    mutationFn: async (riskData: CreateRiskRequest) => {
      const riskScore = riskData.probability * riskData.impact;
      const riskLevel = calculateRiskLevel(riskScore);

      // Validar dados antes de inserir
      if (!userTenantId) {
        throw new Error('Tenant ID não encontrado. Faça login novamente.');
      }

      // Debug simplificado
      console.log('🔍 Criando risco:', {
        nome: riskData.name,
        categoria: riskData.category,
        responsavel: riskData.assignedTo,
        riskLevel: riskLevel
      });

      // Preparar dados mínimos para inserção (apenas campos essenciais)
      const baseRiskData: any = {
        risk_title: riskData.name,
        risk_description: riskData.description,
        risk_category: riskData.category,
        probability: Math.max(1, Math.min(5, Math.floor(riskData.probability))),
        likelihood_score: Math.max(1, Math.min(5, Math.floor(riskData.probability))),
        impact_score: Math.max(1, Math.min(5, Math.floor(riskData.impact))),
        risk_level: riskLevel,
        ...mapRiskStatusToSupabaseStatus('Identificado'),
        severity: 'medium'
      };
      
      // Adicionar created_by apenas se for um UUID válido
      if (user?.id && user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        baseRiskData.created_by = user.id;
      }
      
      // Campo assigned_to agora é TEXT - tabela foi recriada!
      if (riskData.assignedTo) {
        baseRiskData.assigned_to = riskData.assignedTo;
        console.log('✅ Campo assigned_to adicionado:', riskData.assignedTo);
      }
      
      if (riskData.dueDate) {
        baseRiskData.due_date = riskData.dueDate.toISOString();
      }
      
      // Adicionar tenant_id apenas se for um UUID válido
      if (userTenantId && userTenantId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        baseRiskData.tenant_id = userTenantId;
      } else {
        throw new Error('Tenant ID inválido. Faça login novamente.');
      }
      
      // Adicionar analysisData se fornecido
      if (riskData.analysisData) {
        baseRiskData.analysis_data = riskData.analysisData;
      }

      console.log('🚀 Inserindo no banco...');
      
      const { data, error } = await supabase
        .from('risk_registrations')
        .insert([baseRiskData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar risco:', error.message);
        throw error;
      }
      
      console.log('✅ Risco criado com sucesso:', data.risk_title);

      // Criar plano de ação se necessário
      if (riskData.treatmentType !== 'Aceitar') {
        const { error: planError } = await supabase
          .from('risk_action_plans')
          .insert([{
            risk_id: data.id,
            treatment_type: riskData.treatmentType,
            created_by: user?.id
          }]);

        if (planError) throw planError;
      }

      return data;
    },
    onSuccess: () => {
      console.log('✅ Risco criado - invalidando caches:', { userTenantId });
      queryClient.invalidateQueries({ queryKey: ['risks', userTenantId] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics', userTenantId] });
      toast.success('Risco criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar risco: ${error.message}`);
    }
  });

  // Atualizar risco
  const updateRiskMutation = useMutation({
    mutationFn: async ({ riskId, data }: { riskId: string; data: UpdateRiskRequest }) => {
      const updateData: any = {};

      if (data.name) updateData.risk_title = data.name;
      if (data.description) updateData.risk_description = data.description;
      if (data.category) updateData.risk_category = data.category;
      if (data.status) {
        const statusMapping = mapRiskStatusToSupabaseStatus(data.status);
        updateData.status = statusMapping.status;
        if (statusMapping.current_step !== undefined) {
          updateData.current_step = statusMapping.current_step;
        }
      }
      if (data.assignedTo !== undefined) {
        updateData.assigned_to = data.assignedTo || null; // Campo TEXT para nome da pessoa
      }
      if (data.dueDate !== undefined) updateData.due_date = data.dueDate?.toISOString();
      
      // Salvar analysisData se fornecido
      if (data.analysisData !== undefined) {
        updateData.analysis_data = data.analysisData;
      }
      
      // Campos adicionais do wizard - ADICIONADOS
      if (data.source !== undefined) updateData.risk_source = data.source;
      if (data.responsibleArea !== undefined) updateData.business_area = data.responsibleArea;
      if (data.analysisMethodology !== undefined) updateData.analysis_methodology = data.analysisMethodology;
      
      // Dados GUT
      if (data.gut_gravity !== undefined) updateData.gut_gravity = data.gut_gravity;
      if (data.gut_urgency !== undefined) updateData.gut_urgency = data.gut_urgency;
      if (data.gut_tendency !== undefined) updateData.gut_tendency = data.gut_tendency;
      if (data.gut_priority !== undefined) updateData.gut_priority = data.gut_priority;
      
      // Dados de tratamento detalhados
      if (data.treatment_rationale !== undefined) updateData.treatment_rationale = data.treatment_rationale;
      if (data.treatment_cost !== undefined) updateData.treatment_cost = data.treatment_cost;
      if (data.treatment_timeline !== undefined) updateData.treatment_timeline = data.treatment_timeline;
      
      // Dados de atividades do plano de ação
      if (data.activity_1_name !== undefined) updateData.activity_1_name = data.activity_1_name;
      if (data.activity_1_description !== undefined) updateData.activity_1_description = data.activity_1_description;
      if (data.activity_1_responsible !== undefined) updateData.activity_1_responsible = data.activity_1_responsible;
      if (data.activity_1_email !== undefined) updateData.activity_1_email = data.activity_1_email;
      if (data.activity_1_priority !== undefined) updateData.activity_1_priority = data.activity_1_priority;
      if (data.activity_1_status !== undefined) updateData.activity_1_status = data.activity_1_status;
      if (data.activity_1_due_date !== undefined) updateData.activity_1_due_date = data.activity_1_due_date?.toISOString();
      
      // Dados de comunicação/stakeholders
      if (data.awareness_person_1_name !== undefined) updateData.awareness_person_1_name = data.awareness_person_1_name;
      if (data.awareness_person_1_position !== undefined) updateData.awareness_person_1_position = data.awareness_person_1_position;
      if (data.awareness_person_1_email !== undefined) updateData.awareness_person_1_email = data.awareness_person_1_email;
      if (data.approval_person_1_name !== undefined) updateData.approval_person_1_name = data.approval_person_1_name;
      if (data.approval_person_1_position !== undefined) updateData.approval_person_1_position = data.approval_person_1_position;
      if (data.approval_person_1_email !== undefined) updateData.approval_person_1_email = data.approval_person_1_email;
      if (data.approval_person_1_status !== undefined) updateData.approval_person_1_status = data.approval_person_1_status;
      
      // Dados de monitoramento
      if (data.monitoring_frequency !== undefined) updateData.monitoring_frequency = data.monitoring_frequency;
      if (data.monitoring_responsible !== undefined) updateData.monitoring_responsible = data.monitoring_responsible;
      if (data.residual_impact !== undefined) updateData.residual_impact = data.residual_impact;
      if (data.residual_likelihood !== undefined) updateData.residual_likelihood = data.residual_likelihood;
      if (data.residual_score !== undefined) updateData.residual_score = data.residual_score;
      if (data.closure_criteria !== undefined) updateData.closure_criteria = data.closure_criteria;
      if (data.closure_notes !== undefined) updateData.closure_notes = data.closure_notes;
      if (data.closure_date !== undefined) updateData.closure_date = data.closure_date?.toISOString();
      
      console.log('🔍 [UPDATE] Dados que serão atualizados:', updateData);

      // Recalcular score se probabilidade ou impacto mudaram
      if (data.probability || data.impact) {
        const { data: currentRisk } = await supabase
          .from('risk_registrations')
          .select('likelihood_score, impact_score')
          .eq('id', riskId)
          .single();

        const probability = data.probability || currentRisk?.likelihood_score || 1;
        const impact = data.impact || currentRisk?.impact_score || 1;
        const riskScore = probability * impact;

        updateData.likelihood_score = probability;
        updateData.impact_score = impact;
        // Remover risk_score pois é coluna gerada
        // updateData.risk_score = riskScore;
        updateData.risk_level = calculateRiskLevel(riskScore);
      }

      // Atualizar o risco principal
      const { data: result, error } = await supabase
        .from('risk_registrations')
        .update(updateData)
        .eq('id', riskId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar no banco:', error);
        throw error;
      }
      
      console.log('✅ Risco atualizado com sucesso no banco:', {
        id: result.id,
        risk_title: result.risk_title,
        likelihood_score: result.likelihood_score,
        impact_score: result.impact_score,
        risk_level: result.risk_level,
        risk_score: result.risk_score
      });

      // Atualizar tipo de tratamento se fornecido
      if (data.treatmentType) {
        // Normalizar o valor para inglês (formato usado no banco)
        const normalizedTreatment = normalizeTreatmentStrategy(data.treatmentType);
        
        // Atualizar também na tabela risk_registrations
        await supabase
          .from('risk_registrations')
          .update({ treatment_strategy: normalizedTreatment })
          .eq('id', riskId);
        
        // Verificar se já existe um plano de ação
        const { data: existingPlan, error: planQueryError } = await supabase
          .from('risk_action_plans')
          .select('id')
          .eq('risk_id', riskId)
          .maybeSingle();

        if (planQueryError) {
          throw planQueryError;
        }

        if (existingPlan) {
          // Atualizar plano existente
          const { error: planError } = await supabase
            .from('risk_action_plans')
            .update({ treatment_type: normalizedTreatment })
            .eq('risk_id', riskId);

          if (planError) throw planError;
        } else {
          // Criar novo plano de ação
          const { error: planError } = await supabase
            .from('risk_action_plans')
            .insert([{
              risk_id: riskId,
              treatment_type: normalizedTreatment,
              created_by: user?.id
            }]);

          if (planError) throw planError;
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', userTenantId] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics', userTenantId] });
      toast.success('Risco atualizado com sucesso');
    },
    onError: (error: any) => {
      console.error('Erro detalhado ao atualizar risco:', error);
      // Reverter atualização otimista em caso de erro
      queryClient.invalidateQueries({ queryKey: ['risks', userTenantId] });
      toast.error(`Erro ao atualizar risco: ${error.message || 'Erro desconhecido'}`);
    }
  });

  // Excluir risco
  const deleteRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      // Primeiro excluir dependências
      await supabase.from('risk_action_activities').delete().eq('action_plan_id', riskId);
      await supabase.from('risk_action_plans').delete().eq('risk_id', riskId);
      await supabase.from('risk_communications').delete().eq('risk_id', riskId);
      
      const { error } = await supabase
        .from('risk_registrations')
        .delete()
        .eq('id', riskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', userTenantId] });
      queryClient.invalidateQueries({ queryKey: ['risk-metrics', userTenantId] });
      toast.success('Risco excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir risco: ${error.message}`);
    }
  });

  // ============================================================================
  // GESTÃO DE ATIVIDADES
  // ============================================================================

  const addActivityMutation = useMutation({
    mutationFn: async ({ actionPlanId, activity }: { actionPlanId: string; activity: CreateActivityRequest }) => {
      const { data, error } = await supabase
        .from('risk_action_activities')
        .insert([{
          action_plan_id: actionPlanId,
          description: activity.name,
          responsible_person: activity.responsible,
          deadline: activity.dueDate?.toISOString(),
          status: 'TBD',
          evidence_description: activity.details
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', userTenantId] });
      toast.success('Atividade adicionada com sucesso');
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ activityId, data }: { activityId: string; data: Partial<Activity> }) => {
      const updateData: any = {};
      
      if (data.name) updateData.description = data.name;
      if (data.responsible) updateData.responsible_person = data.responsible;
      if (data.status) updateData.status = data.status;
      if (data.dueDate !== undefined) updateData.deadline = data.dueDate?.toISOString();
      if (data.details !== undefined) updateData.evidence_description = data.details;

      const { error } = await supabase
        .from('risk_action_activities')
        .update(updateData)
        .eq('id', activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', userTenantId] });
      toast.success('Atividade atualizada com sucesso');
    }
  });

  // ============================================================================
  // CARTA DE ACEITAÇÃO DE RISCO
  // ============================================================================

  const createAcceptanceLetterMutation = useMutation({
    mutationFn: async (letterData: Omit<RiskAcceptanceLetter, 'id' | 'createdBy' | 'createdAt'>) => {
      // Criar entrada na tabela de comunicações (reutilizando estrutura existente)
      const { data, error } = await supabase
        .from('risk_communications')
        .insert([{
          risk_id: letterData.riskId,
          person_name: letterData.approver,
          person_email: `${letterData.approver}@company.com`, // placeholder
          decision: 'Aceitar',
          justification: letterData.justification,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks', userTenantId] });
      toast.success('Carta de aceitação criada com sucesso');
    }
  });

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================


  const transformSupabaseRiskToRisk = (supabaseRisk: any): Risk => {
    console.log('🔍 [TRANSFORM-DETAIL] Transformando risco:', {
      id: supabaseRisk.id,
      risk_title: supabaseRisk.risk_title,
      status: supabaseRisk.status,
      current_step: supabaseRisk.current_step,
      hasRiskTitle: !!supabaseRisk.risk_title
    });
    
    // Usar descrição diretamente
    const description = supabaseRisk.risk_description || '';
    
    // Determinar status baseado no status do registro e current_step
    const finalStatus = mapSupabaseStatusToRiskStatus(supabaseRisk.status, supabaseRisk.current_step);
    
    // Calcular riskScore baseado nos scores disponíveis
    const probability = supabaseRisk.likelihood_score || supabaseRisk.probability_score || 3;
    const impact = supabaseRisk.impact_score || 3;
    const riskScore = supabaseRisk.risk_score || (probability * impact);
    
    console.log('🔍 [TRANSFORM-DETAIL] Dados calculados:', {
      finalStatus,
      probability,
      impact,
      riskScore
    });
    
    const transformedRisk = {
      id: supabaseRisk.id,
      riskCode: supabaseRisk.risk_code,
      name: supabaseRisk.risk_title || 'Risco sem título',
      description: description,
      category: supabaseRisk.risk_category || 'Operacional',
      probability: probability,
      impact: impact,
      // ADICIONAR CAMPOS ORIGINAIS PARA COMPATIBILIDADE
      impact_score: supabaseRisk.impact_score,
      likelihood_score: supabaseRisk.likelihood_score,
      risk_score: supabaseRisk.risk_score,
      riskScore: riskScore,
      riskLevel: mapRiskLevel(supabaseRisk.risk_level) || 'Médio',
      status: finalStatus,
      treatmentType: supabaseRisk.treatment_strategy || 'Mitigar',
      // ADICIONAR CAMPOS ADICIONAIS PARA COMPATIBILIDADE TOTAL
      risk_title: supabaseRisk.risk_title,
      risk_description: supabaseRisk.risk_description,
      risk_code: supabaseRisk.risk_code,
      risk_level: supabaseRisk.risk_level,
      treatment_strategy: supabaseRisk.treatment_strategy,
      created_at: supabaseRisk.created_at,
      updated_at: supabaseRisk.updated_at,
      owner: supabaseRisk.created_by || '',
      assignedTo: supabaseRisk.assigned_to || '',
      identifiedDate: supabaseRisk.identified_date ? new Date(supabaseRisk.identified_date) : new Date(supabaseRisk.created_at),
      dueDate: supabaseRisk.due_date ? new Date(supabaseRisk.due_date) : undefined,
      createdBy: supabaseRisk.created_by || '',
      createdAt: new Date(supabaseRisk.created_at),
      updatedAt: new Date(supabaseRisk.updated_at || supabaseRisk.created_at),
      
      // Campos adicionais do wizard de registro
      source: supabaseRisk.risk_source,
      responsibleArea: supabaseRisk.business_area,
      analysisMethodology: supabaseRisk.analysis_methodology,
      
      // Dados GUT completos
      gut_gravity: supabaseRisk.gut_gravity,
      gut_urgency: supabaseRisk.gut_urgency,
      gut_tendency: supabaseRisk.gut_tendency,
      gut_priority: supabaseRisk.gut_priority,
      
      // Dados de tratamento detalhados
      treatment_rationale: supabaseRisk.treatment_rationale,
      treatment_cost: supabaseRisk.treatment_cost,
      treatment_timeline: supabaseRisk.treatment_timeline,
      
      // Dados de monitoramento
      monitoring_frequency: supabaseRisk.monitoring_frequency,
      monitoring_responsible: supabaseRisk.monitoring_responsible,
      monitoring_indicators: supabaseRisk.monitoring_indicators,
      monitoring_notes: supabaseRisk.monitoring_notes,
      residual_impact: supabaseRisk.residual_impact,
      residual_likelihood: supabaseRisk.residual_likelihood,
      residual_score: supabaseRisk.residual_score,
      residual_risk_level: supabaseRisk.residual_risk_level,
      closure_criteria: supabaseRisk.closure_criteria,
      closure_notes: supabaseRisk.closure_notes,
      closure_date: supabaseRisk.closure_date ? new Date(supabaseRisk.closure_date) : undefined,
      review_date: supabaseRisk.review_date ? new Date(supabaseRisk.review_date) : undefined,
      
      // Dados de atividades do plano de ação - CAMPOS DIRETOS DA TABELA PRINCIPAL
      activity_1_name: supabaseRisk.activity_1_name,
      activity_1_description: supabaseRisk.activity_1_description,
      activity_1_responsible: supabaseRisk.activity_1_responsible,
      activity_1_email: supabaseRisk.activity_1_email,
      activity_1_priority: supabaseRisk.activity_1_priority,
      activity_1_status: supabaseRisk.activity_1_status,
      activity_1_due_date: supabaseRisk.activity_1_due_date ? new Date(supabaseRisk.activity_1_due_date) : undefined,
      
      // Dados de comunicação/stakeholders - CAMPOS DIRETOS DA TABELA PRINCIPAL
      awareness_person_1_name: supabaseRisk.awareness_person_1_name,
      awareness_person_1_position: supabaseRisk.awareness_person_1_position,
      awareness_person_1_email: supabaseRisk.awareness_person_1_email,
      approval_person_1_name: supabaseRisk.approval_person_1_name,
      approval_person_1_position: supabaseRisk.approval_person_1_position,
      approval_person_1_email: supabaseRisk.approval_person_1_email,
      approval_person_1_status: supabaseRisk.approval_person_1_status,
      
      // Arrays de dados relacionados (carregados via JOIN) - CORRIGIDO
      risk_action_plans: supabaseRisk.risk_registration_action_plans || [],
      risk_stakeholders: supabaseRisk.risk_stakeholders || [],
      
      analysisData: {
        gut_analysis: {
          gravity: supabaseRisk.gut_gravity,
          urgency: supabaseRisk.gut_urgency,
          tendency: supabaseRisk.gut_tendency
        },
        monitoring: {
          frequency: supabaseRisk.monitoring_frequency,
          responsible: supabaseRisk.monitoring_responsible,
          closure_criteria: supabaseRisk.closure_criteria
        }
      }
    };
    
    
    return transformedRisk;
  };



  const filterRisks = (filters: RiskFilters): Risk[] => {
    let filtered = risks;

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(risk => 
        risk.name.toLowerCase().includes(term) ||
        risk.description?.toLowerCase().includes(term) ||
        risk.category.toLowerCase().includes(term)
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(risk => filters.categories!.includes(risk.category));
    }

    if (filters.levels && filters.levels.length > 0) {
      filtered = filtered.filter(risk => filters.levels!.includes(risk.riskLevel));
    }

    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(risk => filters.statuses!.includes(risk.status));
    }

    if (filters.owners && filters.owners.length > 0) {
      filtered = filtered.filter(risk => filters.owners!.includes(risk.owner));
    }

    if (filters.showOverdue) {
      const now = new Date();
      filtered = filtered.filter(risk => 
        risk.dueDate && risk.dueDate < now && risk.status !== 'Fechado'
      );
    }

    return filtered;
  };

  // ============================================================================
  // WRAPPER FUNCTIONS
  // ============================================================================
  
  const updateRisk = (riskId: string, data: UpdateRiskRequest) => {
    console.log('🔄 updateRisk wrapper chamado:', { riskId, data });
    
    // Atualização otimista para melhorar UX
    if (data.status) {
      queryClient.setQueryData(['risks', userTenantId], (oldData: Risk[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(risk => 
          risk.id === riskId 
            ? { ...risk, status: data.status! }
            : risk
        );
      });
    }
    
    return updateRiskMutation.mutate({ riskId, data });
  };
  
  const deleteRisk = (riskId: string) => {
    console.log('🗑️ deleteRisk wrapper chamado:', { riskId });
    return deleteRiskMutation.mutate(riskId);
  };

  // ============================================================================
  // RETURN DO HOOK
  // ============================================================================

  return {
    // Dados
    risks,
    metrics,
    
    // Estados de loading
    isLoadingRisks,
    isLoadingMetrics,
    
    // Errors
    risksError,
    
    // Mutations
    createRisk: createRiskMutation.mutate,
    updateRisk,
    deleteRisk,
    addActivity: addActivityMutation.mutate,
    updateActivity: updateActivityMutation.mutate,
    createAcceptanceLetter: createAcceptanceLetterMutation.mutate,
    
    // Estados de mutations
    isCreatingRisk: createRiskMutation.isPending,
    isUpdatingRisk: updateRiskMutation.isPending,
    isDeletingRisk: deleteRiskMutation.isPending,
    
    // Funções utilitárias
    filterRisks,
    calculateRiskLevel
  };
};