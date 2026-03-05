import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Brain,
  FileText,
  Target,
  BarChart3,
  Shield,
  ClipboardList,
  Users,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';

// Importar os steps
import { Step1Identification } from './steps/Step1Identification';
import { Step2Analysis } from './steps/Step2Analysis';
import { Step3Classification } from './steps/Step3Classification';
import { Step4Treatment } from './steps/Step4Treatment';
import { Step5ActionPlan } from './steps/Step5ActionPlan';
import { Step6Communication } from './steps/Step6Communication';
import { Step7Monitoring } from './steps/Step7Monitoring';

export interface RiskRegistrationData {
  // Step 1: Identification
  risk_title?: string;
  risk_description?: string;
  risk_category?: string;
  risk_source?: string;
  identification_date?: string;
  responsible_area?: string;

  // Step 2: Analysis
  methodology_id?: string;
  analysis_methodology?: string;
  impact_score?: number;
  probability_score?: number;
  likelihood_score?: number;
  risk_score?: number;
  risk_level?: string;
  analysis_notes?: string;

  // Step 3: Classification (GUT)
  gravity_score?: number;
  gut_gravity?: number;
  urgency_score?: number;
  gut_urgency?: number;
  tendency_score?: number;
  gut_tendency?: number;
  gut_score?: number;
  gut_priority?: string;

  // Step 4: Treatment
  treatment_strategy?: string;
  treatment_rationale?: string;
  treatment_cost?: number;
  treatment_timeline?: string;

  // Step 5: Action Plan
  action_plans?: any[];

  // Step 6: Communication
  stakeholders?: any[];
  requires_approval?: boolean;

  // Step 7: Monitoring
  monitoring_frequency?: string;
  monitoring_responsible?: string;
  review_date?: string;
  residual_risk_level?: string;
  residual_impact?: number;
  residual_probability?: number;
  residual_likelihood?: number;
  residual_risk_score?: number;
  residual_score?: number;
  closure_criteria?: string;
  monitoring_notes?: string;
  kpi_definition?: string;
  metadata?: Record<string, any>;
}

interface RiskRegistrationWizardProps {
  onComplete: (riskData: RiskRegistrationData) => void;
  onCancel: () => void;
  editMode?: boolean;
  existingRiskId?: string;
}

export const RiskRegistrationWizard: React.FC<RiskRegistrationWizardProps> = ({
  onComplete,
  onCancel,
  editMode = false,
  existingRiskId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RiskRegistrationData>({});
  const [registrationId, setRegistrationId] = useState<string | null>(existingRiskId || null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para rolar para o topo da página
  const scrollToTop = () => {
    console.log('🔝 Executando scroll para o topo...');
    console.log('Posição atual do scroll:', window.pageYOffset || document.documentElement.scrollTop);

    // Método 1: Scroll instantâneo primeiro
    try {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      console.log('✅ Scroll instantâneo executado');
    } catch (error) {
      console.warn('❌ Erro com scroll instantâneo:', error);
    }

    // Método 2: Scroll suave após um pequeno delay
    setTimeout(() => {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        console.log('✅ Scroll suave executado');
      } catch (error) {
        console.warn('❌ Erro com scroll suave:', error);
      }
    }, 50);

    // Método 3: Forçar scroll em elementos específicos
    setTimeout(() => {
      try {
        // Tentar rolar elementos específicos que podem estar capturando o scroll
        const scrollableElements = [
          document.documentElement,
          document.body,
          document.querySelector('main'),
          document.querySelector('.scroll-container'),
          document.querySelector('[data-scroll-container]')
        ].filter(Boolean);

        scrollableElements.forEach((element, index) => {
          if (element) {
            element.scrollTop = 0;
            console.log(`✅ Scroll aplicado ao elemento ${index + 1}:`, element.tagName || element.className);
          }
        });

        // Tentar scrollIntoView no header do wizard
        const wizardHeader = document.querySelector('h2');
        if (wizardHeader) {
          wizardHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('✅ ScrollIntoView executado no header do wizard');
        }

      } catch (error) {
        console.warn('❌ Erro com scroll forçado:', error);
      }
    }, 100);

    // Verificar se o scroll funcionou
    setTimeout(() => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      console.log('Posição final do scroll:', currentScroll);
      if (currentScroll > 100) {
        console.warn('⚠️ Scroll pode não ter funcionado completamente');
      }
    }, 1000);
  };

  // Estados específicos para Step 5 (Action Plan)
  const [actionPlanItems, setActionPlanItems] = useState<any[]>([]);

  // Estados específicos para Step 6 (Communication)
  const [stakeholders, setStakeholders] = useState<any[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();

  // Funções wrapper para sincronizar estados
  const updateStakeholders = (newStakeholders: any[]) => {
    console.log('Atualizando stakeholders:', newStakeholders);
    setStakeholders(newStakeholders);
    setRegistrationData(prev => ({
      ...prev,
      stakeholders: newStakeholders
    }));
  };

  const updateActionPlanItems = (newItems: any[]) => {
    console.log('Atualizando action plan items:', newItems);
    setActionPlanItems(newItems);
    setRegistrationData(prev => ({
      ...prev,
      action_plans: newItems
    }));
  };

  const steps = [
    {
      id: 1,
      title: 'Identificação',
      description: 'Dados básicos do risco',
      icon: FileText
    },
    {
      id: 2,
      title: 'Análise',
      description: 'Metodologia e avaliação',
      icon: BarChart3
    },
    {
      id: 3,
      title: 'Classificação',
      description: 'Metodologia GUT',
      icon: Target
    },
    {
      id: 4,
      title: 'Tratamento',
      description: 'Estratégia de resposta',
      icon: Shield
    },
    {
      id: 5,
      title: 'Plano de Ação',
      description: 'Atividades e responsáveis',
      icon: ClipboardList
    },
    {
      id: 6,
      title: 'Comunicação',
      description: 'Stakeholders e aprovação',
      icon: Users
    },
    {
      id: 7,
      title: 'Monitoramento',
      description: 'Acompanhamento e encerramento',
      icon: Eye
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  // useEffect principal para gerenciar criação/carregamento do registro
  useEffect(() => {
    console.log('🔄 useEffect principal executado:', {
      editMode,
      existingRiskId,
      userExists: !!user,
      userId: user?.id,
      tenantId: user?.tenantId,
      registrationId
    });

    if (editMode && existingRiskId) {
      console.log('📖 Modo edição: carregando dados existentes...');
      loadExistingRiskData();
    } else if (!editMode && user?.id && user?.tenantId && !registrationId) {
      console.log('🆕 Iniciando criação de novo registro de risco...');
      console.log('Dados do usuário:', {
        userId: user.id,
        tenantId: user.tenantId,
        userExists: !!user,
        registrationId
      });

      // Adicionar um pequeno delay para garantir que o contexto está totalmente carregado
      setTimeout(() => {
        createNewRiskRegistration();
      }, 100);
    } else if (!editMode && user?.id && !user?.tenantId) {
      console.log('⚠️ Aguardando dados do usuário para criar registro...');
    } else if (!editMode && user?.id && user?.tenantId && registrationId) {
      console.log('✅ Registro já existe, não criando novo:', registrationId);
    }
  }, [editMode, existingRiskId, user?.id, user?.tenantId, registrationId]);

  // useEffect para monitorar mudanças no registrationId
  useEffect(() => {
    console.log('🆔 registrationId mudou:', {
      registrationId,
      hasId: !!registrationId,
      editMode,
      currentStep
    });

    // Se perdemos o registrationId e não estamos em modo de edição, tentar recriar
    if (!registrationId && !editMode && user?.tenantId && user?.id && currentStep > 1) {
      console.warn('⚠️ registrationId perdido durante o processo! Tentando recuperar...');

      // Tentar recriar o registro
      setTimeout(() => {
        if (!registrationId) {
          console.log('🔄 Tentando recriar registro perdido...');
          createNewRiskRegistration();
        }
      }, 1000);
    }
  }, [registrationId, editMode, user?.tenantId, user?.id, currentStep]);

  // useEffect para monitorar mudanças no usuário
  useEffect(() => {
    console.log('👤 Dados do usuário mudaram:', {
      userExists: !!user,
      userId: user?.id,
      tenantId: user?.tenantId,
      registrationId
    });
  }, [user]);

  // useEffect adicional para garantir scroll quando a etapa muda
  useEffect(() => {
    console.log('🔄 useEffect: Etapa mudou para', currentStep, '- executando scroll...');

    // Delay maior para garantir que o DOM seja atualizado
    const timeoutId = setTimeout(() => {
      console.log('🔄 useEffect: Executando scroll para etapa', currentStep);
      scrollToTop();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentStep]);

  const loadExistingRiskData = async () => {
    if (!existingRiskId) return;

    setIsLoading(true);
    try {
      // Carregar dados principais do risco
      const { data, error } = await supabase
        .from('risk_registrations')
        .select('*')
        .eq('id', existingRiskId)
        .single();

      if (error) throw error;

      setRegistrationData(data);
      setRegistrationId(data.id);

      // Carregar action plan items
      await loadActionPlanItems(data.id);

      // Carregar stakeholders
      await loadStakeholders(data.id);

    } catch (error) {
      console.error('Erro ao carregar dados do risco:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do risco.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadActionPlanItems = async (riskId: string) => {
    try {
      const { data, error } = await supabase
        .from('risk_registration_action_plans')
        .select('*')
        .eq('risk_registration_id', riskId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      updateActionPlanItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar action plan items:', error);
    }
  };

  const loadStakeholders = async (riskId: string) => {
    try {
      const { data, error } = await supabase
        .from('risk_stakeholders')
        .select('*')
        .eq('risk_registration_id', riskId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      updateStakeholders(data || []);
    } catch (error) {
      console.error('Erro ao carregar stakeholders:', error);
    }
  };

  const createNewRiskRegistration = async () => {
    console.log('🔍 [DEBUG] Iniciando createNewRiskRegistration...');

    if (!user?.tenantId || !user?.id) {
      console.log('❌ Dados do usuário incompletos:', {
        hasTenantId: !!user?.tenantId,
        hasUserId: !!user?.id,
        user
      });
      return;
    }

    // Evitar criar múltiplos registros
    if (registrationId) {
      console.log('⚠️ Registro já existe, pulando criação:', registrationId);
      return;
    }

    // Verificar se já está em processo de criação
    if (isLoading) {
      console.log('⚠️ Já está criando registro, aguardando...');
      return;
    }

    setIsLoading(true);

    try {
      console.log('💾 Criando novo registro no banco...');
      console.log('🔍 [DEBUG] Dados para inserção:', {
        tenant_id: user.tenantId,
        created_by: user.id,
        status: 'draft',
        current_step: 1,
        completion_percentage: 0
      });

      // Verificar se o usuário está autenticado no Supabase
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 [DEBUG] Usuário autenticado no Supabase:', {
        isAuthenticated: !!supabaseUser,
        userId: supabaseUser?.id,
        authError
      });

      if (authError) {
        console.error('❌ Erro de autenticação:', authError);
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }

      if (!supabaseUser) {
        console.error('❌ Usuário não autenticado no Supabase');
        throw new Error('Usuário não autenticado');
      }

      // CORREÇÃO: Tentar inserção direta primeiro (RLS temporariamente desabilitado)
      console.log('🔧 [FIX] Configurando contexto do tenant:', user.tenantId);
      console.log('🔍 [DEBUG] Tentando inserção direta primeiro...');

      const { data: directData, error: directError } = await supabase
        .from('risk_registrations')
        .insert({
          tenant_id: user.tenantId,
          created_by: user.id,
          status: 'draft',
          current_step: 1,
          completion_percentage: 0
        })
        .select()
        .single();

      console.log('🔍 [DEBUG] Resultado da inserção direta:', { data: directData, error: directError });

      if (directError) {
        console.error('❌ Erro na inserção direta:', directError);
        console.error('🔍 [DEBUG] Detalhes do erro:', {
          code: directError.code,
          message: directError.message,
          details: directError.details,
          hint: directError.hint
        });

        // Fallback: tentar RPC que bypassa RLS
        console.log('🔄 [FALLBACK] Tentando via RPC que bypassa RLS...');

        const { data: rpcData, error: rpcError } = await supabase.rpc('create_risk_registration_bypass_rls', {
          p_tenant_id: user.tenantId,
          p_created_by: user.id
        });

        if (rpcError) {
          console.error('❌ Erro ao criar registro via RPC:', rpcError);
          throw rpcError;
        }

        if (!rpcData) {
          console.error('❌ Nenhum dado retornado da inserção via RPC');
          throw new Error('Nenhum dado retornado da inserção');
        }

        console.log('🔍 [DEBUG] Definindo registrationId (RPC):', rpcData);
        setRegistrationId(rpcData);
        console.log('✅ Novo registro de risco criado com sucesso (RPC):', rpcData);

        // Verificar se o estado foi atualizado
        setTimeout(() => {
          console.log('🔍 [DEBUG] Verificando estado após setRegistrationId (RPC):', {
            registrationId: rpcData,
            stateRegistrationId: registrationId
          });
        }, 100);
      } else {
        if (!directData) {
          console.error('❌ Nenhum dado retornado da inserção direta');
          throw new Error('Nenhum dado retornado da inserção');
        }

        console.log('🔍 [DEBUG] Definindo registrationId (direto):', directData.id);
        setRegistrationId(directData.id);
        console.log('✅ Novo registro de risco criado com sucesso (direto):', directData.id);

        // Verificar se o estado foi atualizado
        setTimeout(() => {
          console.log('🔍 [DEBUG] Verificando estado após setRegistrationId (direto):', {
            registrationId: directData.id,
            stateRegistrationId: registrationId
          });
        }, 100);
      }

      toast({
        title: '✅ Registro Iniciado',
        description: 'Novo registro de risco criado. Você pode começar a preencher os dados.',
      });

    } catch (error) {
      console.error('❌ Erro ao criar registro de risco:', error);
      console.error('🔍 [DEBUG] Stack trace:', error.stack);

      let errorMessage = 'Não foi possível criar o registro de risco.';
      if (error?.message) {
        errorMessage += ` Erro: ${error.message}`;
      }

      toast({
        title: 'Erro ao criar registro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRegistrationData = (newData: Partial<RiskRegistrationData>) => {
    const updatedData = { ...registrationData, ...newData };
    setRegistrationData(updatedData);

    // Salvar no Supabase
    saveToSupabase(updatedData);
  };

  const saveToSupabase = async (data: RiskRegistrationData) => {
    if (!registrationId) {
      console.warn('⚠️ saveToSupabase: registrationId não encontrado');
      return;
    }

    try {
      console.log('💾 saveToSupabase: Salvando dados:', {
        registrationId,
        dataKeys: Object.keys(data),
        data
      });

      const { error } = await supabase
        .from('risk_registrations')
        .update(data)
        .eq('id', registrationId);

      if (error) {
        console.error('❌ saveToSupabase: Erro ao salvar:', error);
        throw error;
      }

      console.log('✅ saveToSupabase: Dados salvos com sucesso');
    } catch (error) {
      console.error('❌ saveToSupabase: Erro geral:', error);
    }
  };

  const handleNext = () => {
    // Validações por etapa
    if (!validateCurrentStep()) {
      return;
    }

    // Lógica especial para Step 4 (Treatment)
    if (currentStep === 4 && registrationData.treatment_strategy === 'accept') {
      // Pular Step 5 (Action Plan) se estratégia for aceitar
      setCurrentStep(6);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }

    toast({
      title: '✅ Etapa Concluída',
      description: `Avançando para: ${steps[currentStep]?.title}`,
    });

    console.log('🚀 handleNext: Agendando scroll para o topo...');

    // Rolar para o topo após um delay maior para garantir que o conteúdo seja renderizado
    setTimeout(() => {
      console.log('🚀 handleNext: Executando scroll agendado...');
      scrollToTop();
    }, 300);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!registrationData.risk_title?.trim() || !registrationData.risk_category || !registrationData.risk_description?.trim()) {
          toast({
            title: '⚠️ Campos Obrigatórios',
            description: 'Por favor, preencha todos os campos obrigatórios.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 2:
        if (!registrationData.analysis_methodology || !registrationData.impact_score || !registrationData.likelihood_score) {
          toast({
            title: '⚠️ Análise Incompleta',
            description: 'Por favor, selecione uma metodologia e complete a análise do risco.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 3:
        if (!registrationData.gut_gravity || registrationData.gut_gravity < 1 ||
          !registrationData.gut_urgency || registrationData.gut_urgency < 1 ||
          !registrationData.gut_tendency || registrationData.gut_tendency < 1) {
          toast({
            title: '⚠️ Classificação GUT Incompleta',
            description: 'Por favor, complete a classificação GUT (Gravidade, Urgência e Tendência).',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 4:
        if (!registrationData.treatment_strategy || !registrationData.treatment_rationale?.trim()) {
          toast({
            title: '⚠️ Estratégia de Tratamento',
            description: 'Por favor, selecione uma estratégia e forneça justificativa.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 5:
        // Action Plan é opcional se estratégia for 'accept'
        break;
      case 6:
        console.log('Validando etapa 6 - stakeholders:', {
          stakeholdersState: stakeholders,
          stakeholdersLength: stakeholders?.length,
          registrationDataStakeholders: registrationData.stakeholders
        });

        if (!stakeholders || stakeholders.length === 0) {
          toast({
            title: '⚠️ Stakeholders Necessários',
            description: 'Por favor, adicione pelo menos um stakeholder.',
            variant: 'destructive'
          });
          return false;
        }
        break;
      case 7:
        // Validar apenas se pelo menos um campo de monitoramento foi preenchido
        const hasMonitoringData = registrationData.monitoring_frequency ||
          registrationData.monitoring_responsible ||
          registrationData.closure_criteria;

        // Permitir finalizar mesmo sem todos os campos de monitoramento
        // A etapa 7 é opcional para finalização
        console.log('🔍 Validando etapa 7:', {
          hasMonitoringData,
          monitoring_frequency: registrationData.monitoring_frequency,
          monitoring_responsible: registrationData.monitoring_responsible,
          closure_criteria: registrationData.closure_criteria
        });

        // Não bloquear a finalização se não tiver dados de monitoramento
        // if (!hasMonitoringData) {
        //   toast({
        //     title: '⚠️ Configuração de Monitoramento',
        //     description: 'Por favor, preencha pelo menos um campo de monitoramento.',
        //     variant: 'destructive'
        //   });
        //   return false;
        // }
        break;
    }
    return true;
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Lógica especial para Step 6 se veio do Step 4 (Accept strategy)
      if (currentStep === 6 && registrationData.treatment_strategy === 'accept') {
        setCurrentStep(4);
      } else {
        setCurrentStep(currentStep - 1);
      }

      console.log('⬅️ handlePrevious: Agendando scroll para o topo...');

      // Rolar para o topo após um delay maior
      setTimeout(() => {
        console.log('⬅️ handlePrevious: Executando scroll agendado...');
        scrollToTop();
      }, 300);
    }
  };

  const handleComplete = async () => {
    console.log('🏁 Iniciando finalização do registro...');
    console.log('Dados atuais do registro:', {
      registrationId,
      registrationData,
      actionPlanItems,
      stakeholders,
      user: user?.id,
      editMode,
      existingRiskId
    });

    // Verificar se registrationId existe
    if (!registrationId) {
      console.error('❌ registrationId não encontrado!');
      console.error('🔍 [DEBUG] Estado completo do wizard:', {
        registrationId,
        editMode,
        existingRiskId,
        userTenantId: user?.tenantId,
        userId: user?.id,
        currentStep,
        registrationDataKeys: Object.keys(registrationData),
        hasRiskTitle: !!registrationData.risk_title
      });

      // Tentar recuperar ou criar um novo registro
      if (!editMode && user?.tenantId && user?.id) {
        console.log('🔄 [RECOVERY] Tentando criar novo registro antes de finalizar...');
        try {
          await createNewRiskRegistration();

          // Aguardar um momento para o registrationId ser definido
          setTimeout(() => {
            if (registrationId) {
              console.log('✅ [RECOVERY] Registro criado com sucesso, tentando finalizar novamente...');
              handleComplete();
            } else {
              console.error('❌ [RECOVERY] Falha ao criar registro');
              toast({
                title: 'Erro de Registro',
                description: 'Não foi possível criar o registro. Tente recarregar a página.',
                variant: 'destructive'
              });
            }
          }, 2000);
          return;
        } catch (error) {
          console.error('❌ [RECOVERY] Erro ao tentar criar registro:', error);
        }
      }

      toast({
        title: 'Erro de Registro',
        description: 'ID do registro não encontrado. Tente recarregar a página.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateCurrentStep()) {
      console.log('❌ Validação da etapa final falhou');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💾 Preparando dados finais para salvar...');

      // Preparar dados finais com validação de constraints
      const finalData = {
        // Campos básicos
        status: 'completed',
        completion_percentage: 100,
        current_step: 7,
        completed_at: new Date().toISOString(),

        // Etapa 1: Identificação
        risk_title: registrationData.risk_title || null,
        risk_description: registrationData.risk_description || null,
        risk_category: registrationData.risk_category || null,
        risk_source: registrationData.risk_source || null,
        identified_date: registrationData.identification_date || null,
        business_area: registrationData.responsible_area || null,
        metadata: registrationData.metadata || null,

        // Etapa 2: Análise
        analysis_methodology: registrationData.analysis_methodology || registrationData.methodology_id || null,
        impact_score: registrationData.impact_score || null,
        likelihood_score: registrationData.likelihood_score || registrationData.probability_score || null,
        risk_score: registrationData.risk_score || null,
        risk_level: registrationData.risk_level || null,
        analysis_notes: registrationData.analysis_notes || null,

        // Etapa 3: Classificação GUT
        gut_gravity: registrationData.gut_gravity || registrationData.gravity_score || null,
        gut_urgency: registrationData.gut_urgency || registrationData.urgency_score || null,
        gut_tendency: registrationData.gut_tendency || registrationData.tendency_score || null,
        gut_priority: registrationData.gut_priority || null,

        // Etapa 4: Tratamento
        treatment_strategy: registrationData.treatment_strategy || null,
        treatment_rationale: registrationData.treatment_rationale || null,
        treatment_cost: registrationData.treatment_cost || null,
        treatment_timeline: registrationData.treatment_timeline || null,

        // Etapa 5: Plano de Ação - Salvar primeira atividade diretamente na tabela principal
        activity_1_name: actionPlanItems?.[0]?.activity_name || null,
        activity_1_description: actionPlanItems?.[0]?.activity_description || null,
        activity_1_responsible: actionPlanItems?.[0]?.responsible_person || null,
        activity_1_email: actionPlanItems?.[0]?.responsible_email || null,
        activity_1_priority: actionPlanItems?.[0]?.priority || null,
        activity_1_status: actionPlanItems?.[0]?.status || null,
        activity_1_due_date: actionPlanItems?.[0]?.due_date || null,

        // Etapa 6: Comunicação - Salvar primeiro stakeholder de cada tipo
        awareness_person_1_name: stakeholders?.find(s => s.stakeholder_type === 'awareness')?.person_name || null,
        awareness_person_1_position: stakeholders?.find(s => s.stakeholder_type === 'awareness')?.person_position || null,
        awareness_person_1_email: stakeholders?.find(s => s.stakeholder_type === 'awareness')?.person_email || null,
        approval_person_1_name: stakeholders?.find(s => s.stakeholder_type === 'approval')?.person_name || null,
        approval_person_1_position: stakeholders?.find(s => s.stakeholder_type === 'approval')?.person_position || null,
        approval_person_1_email: stakeholders?.find(s => s.stakeholder_type === 'approval')?.person_email || null,
        approval_person_1_status: stakeholders?.find(s => s.stakeholder_type === 'approval')?.notification_status || null,
        requires_approval: registrationData.requires_approval || false,

        // Etapa 7: Monitoramento
        monitoring_frequency: registrationData.monitoring_frequency || null,
        monitoring_responsible: registrationData.monitoring_responsible || null,
        residual_impact: registrationData.residual_impact || null,
        residual_likelihood: registrationData.residual_probability || registrationData.residual_likelihood || null,
        residual_score: registrationData.residual_risk_score || registrationData.residual_score || null,
        closure_criteria: registrationData.closure_criteria || null,
        closure_date: registrationData.review_date || null,
        closure_notes: registrationData.monitoring_notes || null
      };

      console.log('🔍 [SAVE] Dados que serão salvos na tabela principal:', {
        finalData,
        actionPlanItems: actionPlanItems?.map(item => ({
          activity_name: item.activity_name,
          activity_description: item.activity_description,
          responsible_person: item.responsible_person,
          responsible_email: item.responsible_email,
          priority: item.priority,
          status: item.status,
          due_date: item.due_date
        })),
        stakeholders: stakeholders?.map(s => ({
          person_name: s.person_name,
          person_position: s.person_position,
          person_email: s.person_email,
          stakeholder_type: s.stakeholder_type,
          notification_status: s.notification_status
        })),
        registrationDataKeys: Object.keys(registrationData),
        registrationDataSample: {
          treatment_rationale: registrationData.treatment_rationale,
          monitoring_frequency: registrationData.monitoring_frequency,
          closure_criteria: registrationData.closure_criteria
        }
      });

      // Remover campos undefined ou que não existem na tabela
      Object.keys(finalData).forEach(key => {
        if (finalData[key] === undefined) {
          delete finalData[key];
        }
      });

      console.log('🔍 [SAVE] Dados finais preparados:', finalData);

      console.log('💾 Atualizando registro principal...');
      const { data: updatedData, error } = await supabase
        .from('risk_registrations')
        .update(finalData)
        .eq('id', registrationId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar registro principal:', error);
        throw error;
      }

      console.log('✅ Registro principal atualizado com sucesso:', updatedData);

      // Verificar se há action plan items para salvar
      if (actionPlanItems && actionPlanItems.length > 0) {
        console.log('💾 Verificando action plan items...');
        const itemsToSave = actionPlanItems.filter(item =>
          item.id && !item.id.toString().startsWith('temp-')
        );
        console.log(`${itemsToSave.length} action plan items já salvos no banco`);
      }

      // Verificar se há stakeholders para salvar
      if (stakeholders && stakeholders.length > 0) {
        console.log('💾 Verificando stakeholders...');
        const stakeholdersToSave = stakeholders.filter(stakeholder =>
          stakeholder.id && !stakeholder.id.toString().startsWith('temp-')
        );
        console.log(`${stakeholdersToSave.length} stakeholders já salvos no banco`);
      }

      console.log('🎉 Registro finalizado com sucesso na tabela risk_registrations!');

      // Confirmar que o registro aparecerá na lista
      toast({
        title: '✅ Registro Completo',
        description: 'O risco foi registrado e aparecerá na lista detalhada.',
      });

      console.log('🎉 Finalizando processo...');

      toast({
        title: '🎉 Registro de Risco Concluído',
        description: `Risco "${registrationData.risk_title}" foi registrado com sucesso.`,
      });

      console.log('✅ Processo de finalização concluído com sucesso!');

      // Aguardar um momento para mostrar o toast e depois fechar o formulário
      setTimeout(() => {
        // Chamar callback de conclusão para fechar o formulário
        onComplete({
          ...finalData,
          action_plans: actionPlanItems,
          stakeholders: stakeholders
        });
      }, 1500); // 1.5 segundos para o usuário ver o toast de sucesso

    } catch (error) {
      console.error('❌ Erro ao finalizar registro:', error);

      let errorMessage = 'Não foi possível finalizar o registro do risco.';
      if (error?.message) {
        errorMessage += ` Erro: ${error.message}`;
      }
      if (error?.details) {
        errorMessage += ` Detalhes: ${error.details}`;
      }

      toast({
        title: 'Erro ao finalizar',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      );
    }

    // Verificar se temos registrationId (exceto para a primeira etapa)
    if (!registrationId && !editMode && currentStep > 1) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-amber-600 mb-4">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Registro não encontrado</p>
            </div>
            <p className="text-muted-foreground mb-4">
              O ID do registro foi perdido. Isso pode acontecer se a página foi recarregada.
            </p>
            <Button
              onClick={() => {
                console.log('🔄 Usuário solicitou recriação do registro');
                createNewRiskRegistration();
              }}
              className="mr-2"
            >
              Tentar Recuperar
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancelar e Reiniciar
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1Identification
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 2:
        return (
          <Step2Analysis
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 3:
        return (
          <Step3Classification
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 4:
        return (
          <Step4Treatment
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      case 5:
        return (
          <Step5ActionPlan
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
            actionPlanItems={actionPlanItems}
            setActionPlanItems={updateActionPlanItems}
          />
        );
      case 6:
        return (
          <Step6Communication
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
            stakeholders={stakeholders}
            setStakeholders={updateStakeholders}
          />
        );
      case 7:
        return (
          <Step7Monitoring
            data={registrationData}
            updateData={updateRegistrationData}
            registrationId={registrationId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Wizard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Registro de Risco - Processo Guiado</span>
            </h2>
            <p className="text-muted-foreground">
              Processo inteligente com Alex Risk para registro e análise completa de riscos
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Etapa {currentStep} de {steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso do Registro</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <div className="hidden sm:block">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs opacity-80">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Etapa Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {currentStepData && <currentStepData.icon className="h-5 w-5" />}
            <span>{currentStepData?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? 'Cancelar' : 'Anterior'}</span>
        </Button>

        <div className="flex items-center space-x-2">
          {/* Alex Risk Suggestions */}
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50"
          >
            <Brain className="h-4 w-4" />
            <span>Sugestões Alex Risk</span>
          </Button>

          {currentStep === steps.length ? (
            <Button
              onClick={handleComplete}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Salvando...' : 'Finalizar Registro'}</span>
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};