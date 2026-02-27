import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Sparkles,
  Lightbulb,
  Zap,
  RefreshCw,
  MessageCircle,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Library,
  Copy,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { RiskRegistrationData } from './wizard/RiskRegistrationWizard';
import { RiskLibraryFixed } from './shared/RiskLibraryFixed';
import type { RiskTemplate as DBRiskTemplate } from '@/types/riskTemplate';

interface AlexRiskSuggestion {
  type: 'improvement' | 'warning' | 'suggestion' | 'validation';
  title: string;
  content: string;
  field?: string;
  action?: () => void;
  severity?: 'low' | 'medium' | 'high';
}

interface AlexRiskGuidedProcessProps {
  onComplete: (riskData: RiskRegistrationData) => void;
  onCancel: () => void;
}

interface AIAnalysisResult {
  suggestions: AlexRiskSuggestion[];
  improvedText?: string;
  score?: number;
  analysis?: string;
}

interface MatrixConfiguration {
  type: '4x4' | '5x5';
  impactLabels: string[];
  probabilityLabels: string[];
  riskLevels: { [key: string]: string };
}

type RiskTemplate = DBRiskTemplate;

export const AlexRiskGuidedProcess: React.FC<AlexRiskGuidedProcessProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RiskRegistrationData & Record<string, any>>({});
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alexSuggestions, setAlexSuggestions] = useState<AlexRiskSuggestion[]>([]);
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfiguration>({
    type: '5x5',
    impactLabels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'],
    probabilityLabels: ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo'],
    riskLevels: {}
  });

  // Estados específicos para etapas
  const [actionPlanItems, setActionPlanItems] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);

  // Estados para biblioteca de riscos
  const [showRiskLibrary, setShowRiskLibrary] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const steps = [
    {
      id: 1,
      title: 'Identificação',
      description: 'O Assistente te ajuda a identificar e descrever o risco',
      icon: FileText,
      alexPrompt: 'Vamos começar identificando seu risco. Descreva brevemente a situação e eu te ajudarei a refiná-la.'
    },
    {
      id: 2,
      title: 'Análise',
      description: 'Avaliação inteligente de impacto e probabilidade',
      icon: BarChart3,
      alexPrompt: 'Agora vou analisar o impacto e probabilidade do seu risco com base nas informações fornecidas.'
    },
    {
      id: 3,
      title: 'Classificação GUT',
      description: 'Priorização usando metodologia GUT',
      icon: Target,
      alexPrompt: 'Vamos classificar a Gravidade, Urgência e Tendência deste risco.'
    },
    {
      id: 4,
      title: 'Estratégia',
      description: 'Recomendação da melhor estratégia de tratamento',
      icon: Shield,
      alexPrompt: 'Com base na análise, vou recomendar a melhor estratégia para este risco.'
    },
    {
      id: 5,
      title: 'Plano de Ação',
      description: 'Criação de atividades e cronograma',
      icon: ClipboardList,
      alexPrompt: 'Agora vamos criar um plano de ação detalhado para tratar este risco.'
    },
    {
      id: 6,
      title: 'Comunicação',
      description: 'Definição de stakeholders e aprovações',
      icon: Users,
      alexPrompt: 'Vamos identificar quem precisa ser comunicado sobre este risco.'
    },
    {
      id: 7,
      title: 'Monitoramento',
      description: 'Configuração de acompanhamento e KPIs',
      icon: Eye,
      alexPrompt: 'Por fim, vamos definir como monitorar e acompanhar este risco.'
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  // Carregar configuração da matriz de risco do tenant
  useEffect(() => {
    const loadMatrixConfiguration = async () => {
      if (!user?.tenantId) return;

      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('settings')
          .eq('id', user.tenantId)
          .single();

        if (error) throw error;

        const riskMatrixConfig = data?.settings?.risk_matrix;
        if (riskMatrixConfig) {
          setMatrixConfig({
            type: riskMatrixConfig.type || '5x5',
            impactLabels: riskMatrixConfig.impact_labels || matrixConfig.impactLabels,
            probabilityLabels: riskMatrixConfig.probability_labels || matrixConfig.probabilityLabels,
            riskLevels: riskMatrixConfig.risk_levels || {}
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configuração da matriz:', error);
      }
    };

    loadMatrixConfiguration();
  }, [user?.tenantId]);

  // Criar registro inicial
  useEffect(() => {
    if (!registrationId && user?.id && user?.tenantId) {
      createNewRiskRegistration();
    }
  }, [user?.id, user?.tenantId, registrationId]);

  const createNewRiskRegistration = async () => {
    if (!user?.tenantId || !user?.id || registrationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      setRegistrationId(data.id);
      toast({
        title: '✨ Assistente Ativado',
        description: 'Vamos começar o processo guiado de registro de risco.',
      });

      // Gerar sugestões iniciais
      await generateAlexSuggestions(1, {});

    } catch (error) {
      console.error('Erro ao criar registro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o processo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para aplicar template da biblioteca
  const handleSelectTemplate = async (template: RiskTemplate) => {
    try {
      // Aplicar dados do template
      const templateData: Partial<RiskRegistrationData> = {
        risk_name: template.name,
        risk_description: template.description,
        risk_category: template.category,
        risk_subcategory: template.industry, // Mapear industry para subcategory
        impact_description: template.description, // Usar descrição como impacto
        control_measures: template.controls?.map(c => c.controlDescription).join('\n') || '',
        kpis: template.kris?.map(k => k.kriDescription).join('\n') || ''
      };

      setRegistrationData(prev => ({ ...prev, ...templateData }));
      setShowRiskLibrary(false);

      // Gerar sugestões baseadas no template aplicado
      await generateAlexSuggestions(currentStep, templateData);

      toast({
        title: 'Template Aplicado',
        description: `Template "${template.name}" carregado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao aplicar template',
        variant: 'destructive',
      });
    }
  };

  // Função auxiliar para fornecer conselhos sobre metodologias
  const getMethodologyAdvice = (methodologyId: string) => {
    const methodologies = {
      'qualitative': {
        name: 'Análise Qualitativa',
        advice: 'Use escalas descritivas para impacto e probabilidade. Ideal para riscos operacionais e processos gerais.'
      },
      'quantitative': {
        name: 'Análise Quantitativa',
        advice: 'Defina valores monetários específicos e percentuais de probabilidade. Ideal para riscos financeiros e investimentos.'
      },
      'semi_quantitative': {
        name: 'Análise Semi-Quantitativa',
        advice: 'Combina escalas qualitativas com valores numéricos. Ideal para riscos estratégicos e projetos.'
      },
      'nist': {
        name: 'NIST Cybersecurity Framework',
        advice: 'Configure as funções do NIST (Identificar, Proteger, Detectar, Responder, Recuperar). Ideal para riscos de cibersegurança.'
      },
      'iso31000': {
        name: 'ISO 31000',
        advice: 'Siga os princípios e diretrizes do padrão internacional. Ideal para todos os tipos de riscos e governança.'
      },
      'risco_si_simplificado': {
        name: 'Risco SI Simplificado',
        advice: 'Use questionário estruturado com 8 perguntas para probabilidade e 8 para impacto. Ideal para avaliação rápida.'
      },
      'risco_fornecedor': {
        name: 'Risco de Fornecedor',
        advice: 'Avalie riscos específicos da cadeia de suprimentos. Ideal para fornecedores e terceirização.'
      }
    };

    return methodologies[methodologyId] || { name: 'Desconhecida', advice: 'Metodologia não reconhecida.' };
  };

  const generateAlexSuggestions = async (step: number, data: Partial<RiskRegistrationData>): Promise<void> => {
    setIsAnalyzing(true);

    try {
      // Simular análise de IA (em produção seria uma chamada real para IA)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const suggestions = await getStepSuggestions(step, data);
      setAlexSuggestions(suggestions);

    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      setAlexSuggestions([{
        type: 'warning',
        title: 'Assistente Temporariamente Indisponível',
        content: 'Não consegui gerar sugestões no momento. Continue preenchendo e eu tentarei ajudar mais tarde.',
        severity: 'medium'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStepSuggestions = async (step: number, data: Partial<RiskRegistrationData> & Record<string, any>): Promise<AlexRiskSuggestion[]> => {
    switch (step) {
      case 1: // Identificação
        return [
          {
            type: 'suggestion',
            title: 'Biblioteca de Riscos Disponível',
            content: 'Você pode carregar um risco pré-definido da nossa biblioteca para acelerar o processo. Clique no botão "Carregar da Biblioteca" abaixo.',
            severity: 'low',
            action: () => {
              setShowRiskLibrary(true);
            }
          },
          {
            type: 'suggestion',
            title: 'Dica de Identificação',
            content: 'Para uma identificação completa, descreva: O QUE pode acontecer, ONDE pode ocorrer, QUANDO é mais provável e QUAIS são as causas potenciais.',
            severity: 'low'
          },
          {
            type: 'improvement',
            title: 'Categorização Inteligente',
            content: 'Com base no texto que você inserir, vou sugerir automaticamente a categoria mais apropriada para este risco.',
            severity: 'medium'
          }
        ];

      case 2: // Análise
        const suggestions: AlexRiskSuggestion[] = [
          {
            type: 'suggestion',
            title: 'Seleção de Metodologia',
            content: 'Primeiro, selecione a metodologia de análise mais adequada ao tipo de risco identificado. Cada metodologia tem suas próprias variáveis e critérios.',
            severity: 'high'
          }
        ];

        if (data.methodology_id) {
          const methodologyAdvice = getMethodologyAdvice(data.methodology_id);
          suggestions.push({
            type: 'improvement',
            title: `Metodologia ${methodologyAdvice.name} Selecionada`,
            content: methodologyAdvice.advice,
            severity: 'medium'
          });

          suggestions.push({
            type: 'suggestion',
            title: 'Configuração de Variáveis',
            content: `Configure as variáveis específicas da metodologia ${methodologyAdvice.name} para obter uma análise precisa.`,
            severity: 'medium'
          });
        }

        return suggestions;

      case 3: // GUT
        return [
          {
            type: 'suggestion',
            title: 'Classificação GUT Inteligente',
            content: 'Baseado na análise anterior, sugiro os seguintes valores GUT para otimizar a priorização.',
            severity: 'high'
          }
        ];

      case 4: // Estratégia
        const strategy = determineOptimalStrategy(data);
        return [
          {
            type: 'suggestion',
            title: 'Estratégia Recomendada',
            content: `Com base no nível de risco (${data.risk_level || 'analisado'}), recomendo a estratégia: ${strategy}`,
            severity: 'high'
          }
        ];

      case 5: // Plano de Ação
        if (data.treatment_strategy === 'accept') {
          return [{
            type: 'suggestion',
            title: 'Estratégia de Aceitação',
            content: 'Como você escolheu aceitar este risco, um plano de ação detalhado não é necessário. Prossiga para a comunicação.',
            severity: 'low'
          }];
        }
        return await generateActionPlanSuggestions(data);

      case 6: // Comunicação
        return await generateStakeholderSuggestions(data);

      case 7: // Monitoramento
        return await generateMonitoringSuggestions(data);

      default:
        return [];
    }
  };

  const analyzeRiskImpact = async (description: string): Promise<string> => {
    // Análise simplificada baseada em palavras-chave
    const keywords = description.toLowerCase();

    if (keywords.includes('financeiro') || keywords.includes('monetário') || keywords.includes('custo')) {
      return 'Detectei impacto financeiro. Considere valores específicos de perdas potenciais.';
    }
    if (keywords.includes('operação') || keywords.includes('processo') || keywords.includes('produção')) {
      return 'Identifico impacto operacional. Avalie a interrupção nos processos de negócio.';
    }
    if (keywords.includes('imagem') || keywords.includes('reputação') || keywords.includes('marca')) {
      return 'Há impacto reputacional. Consider o efeito na confiança de clientes e parceiros.';
    }
    if (keywords.includes('legal') || keywords.includes('regulatório') || keywords.includes('compliance')) {
      return 'Impacto regulatório identificado. Verifique multas e sanções aplicáveis.';
    }

    return 'Analise o impacto considerando aspectos financeiros, operacionais, reputacionais e de conformidade.';
  };

  const determineOptimalStrategy = (data: Partial<RiskRegistrationData>): string => {
    const riskScore = data.risk_score || 0;

    if (riskScore >= 20) return 'EVITAR - Risco muito alto';
    if (riskScore >= 15) return 'MITIGAR - Implementar controles';
    if (riskScore >= 10) return 'TRANSFERIR - Considerar seguros';
    return 'ACEITAR - Monitorar regularmente';
  };

  const generateActionPlanSuggestions = async (data: Partial<RiskRegistrationData>): Promise<AlexRiskSuggestion[]> => {
    const suggestions: AlexRiskSuggestion[] = [];

    if (data.treatment_strategy === 'mitigate') {
      suggestions.push({
        type: 'suggestion',
        title: 'Plano de Mitigação',
        content: 'Sugiro criar atividades para: 1) Implementar controles preventivos, 2) Estabelecer monitoramento, 3) Treinar equipe responsável.',
        severity: 'high'
      });
    }

    suggestions.push({
      type: 'improvement',
      title: 'Cronograma Inteligente',
      content: 'Vou sugerir prazos realistas baseados na complexidade das atividades e recursos disponíveis.',
      severity: 'medium'
    });

    return suggestions;
  };

  const generateStakeholderSuggestions = async (data: Partial<RiskRegistrationData>): Promise<AlexRiskSuggestion[]> => {
    return [
      {
        type: 'suggestion',
        title: 'Stakeholders Essenciais',
        content: 'Para este tipo de risco, recomendo comunicar: Gestor da área afetada, Responsável pelo controle interno e Comitê de riscos.',
        severity: 'high'
      },
      {
        type: 'improvement',
        title: 'Níveis de Comunicação',
        content: 'Definirei automaticamente quem precisa apenas ser informado versus quem deve aprovar as ações.',
        severity: 'medium'
      }
    ];
  };

  const generateMonitoringSuggestions = async (data: Partial<RiskRegistrationData>): Promise<AlexRiskSuggestion[]> => {
    const frequency = data.risk_level === 'Alto' || data.risk_level === 'Muito Alto' ? 'mensal' : 'trimestral';

    return [
      {
        type: 'suggestion',
        title: 'Frequência de Monitoramento',
        content: `Para um risco de nível ${data.risk_level}, recomendo monitoramento ${frequency}.`,
        severity: 'high'
      },
      {
        type: 'improvement',
        title: 'KPIs Automáticos',
        content: 'Vou sugerir indicadores específicos para acompanhar a efetividade dos controles implementados.',
        severity: 'medium'
      }
    ];
  };

  const updateRegistrationData = useCallback((newData: Partial<RiskRegistrationData> & Record<string, any>) => {
    const updatedData = { ...registrationData, ...newData };
    setRegistrationData(updatedData);

    // Salvar automaticamente
    if (registrationId) {
      saveToSupabase(updatedData);
    }

    // Gerar novas sugestões se houve mudança significativa
    const significantFields = ['risk_description', 'risk_category', 'treatment_strategy'];
    const hasSignificantChange = significantFields.some(field => newData[field as keyof RiskRegistrationData]);

    if (hasSignificantChange) {
      generateAlexSuggestions(currentStep, updatedData);
    }
  }, [registrationData, registrationId, currentStep]);

  const saveToSupabase = async (data: RiskRegistrationData) => {
    if (!registrationId) return;

    try {
      const { error } = await supabase
        .from('risk_registrations')
        .update({
          ...data,
          current_step: currentStep,
          completion_percentage: (currentStep / steps.length) * 100
        })
        .eq('id', registrationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    // Lógica especial para pular Step 5 se estratégia for aceitar
    if (currentStep === 4 && registrationData.treatment_strategy === 'accept') {
      setCurrentStep(6);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }

    // Gerar sugestões para a próxima etapa
    const nextStep = currentStep === 4 && registrationData.treatment_strategy === 'accept' ? 6 : currentStep + 1;
    if (nextStep <= steps.length) {
      await generateAlexSuggestions(nextStep, registrationData);
    }

    toast({
      title: '✅ Etapa Concluída',
      description: `Avançando com o Assistente...`,
    });
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Lógica especial para Step 6 se veio do Step 4 (Accept strategy)
      if (currentStep === 6 && registrationData.treatment_strategy === 'accept') {
        setCurrentStep(4);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const validateCurrentStep = (): boolean => {
    // Validações com feedback do Alex Risk
    switch (currentStep) {
      case 1: // Identificação
        if (!registrationData.risk_title?.trim()) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Título Necessário',
            content: 'Para prosseguir, preciso que você dê um título ao risco. Algo como "Falha no sistema X" ou "Perda de dados cliente".',
            severity: 'high'
          }]);
          return false;
        }
        if (!registrationData.risk_category) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Categoria Obrigatória',
            content: 'Selecione uma categoria para eu poder oferecer sugestões mais precisas nas próximas etapas.',
            severity: 'high'
          }]);
          return false;
        }
        if (!registrationData.risk_description?.trim()) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Descrição Necessária',
            content: 'Uma descrição detalhada me ajudará a analisar melhor o risco e sugerir controles adequados.',
            severity: 'high'
          }]);
          return false;
        }
        break;

      case 2: // Análise
        if (!registrationData.impact_score || !registrationData.likelihood_score) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Análise Incompleta',
            content: 'Preciso que você avalie tanto o impacto quanto a probabilidade para calcular o risco corretamente.',
            severity: 'high'
          }]);
          return false;
        }
        break;

      case 3: // GUT
        if (!registrationData.gut_gravity || !registrationData.gut_urgency || !registrationData.gut_tendency) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Classificação GUT Incompleta',
            content: 'Complete a análise GUT (Gravidade, Urgência e Tendência) para priorizar corretamente este risco.',
            severity: 'high'
          }]);
          return false;
        }
        break;

      case 4: // Estratégia
        if (!registrationData.treatment_strategy) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Estratégia Necessária',
            content: 'Selecione uma estratégia de tratamento. Se não tiver certeza, posso sugerir baseado na análise.',
            severity: 'high'
          }]);
          return false;
        }
        if (!registrationData.treatment_rationale?.trim()) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Justificativa Obrigatória',
            content: 'Explique por que escolheu esta estratégia. Isso é importante para auditoria e governança.',
            severity: 'high'
          }]);
          return false;
        }
        break;

      case 5: // Plano de Ação
        // Se estratégia for aceitar, pular validação
        if (registrationData.treatment_strategy === 'accept') {
          return true;
        }
        // Para outras estratégias, validar se há pelo menos uma atividade planejada
        break;

      case 6: // Comunicação
        // Validação flexível - pelo menos um stakeholder sugerido deve ser considerado
        if (stakeholders.length === 0) {
          setAlexSuggestions([{
            type: 'warning',
            title: 'Comunicação Importante',
            content: 'Adicione pelo menos um stakeholder da lista sugerida. A comunicação é essencial para o sucesso.',
            severity: 'high'
          }]);
          return false;
        }
        break;

      case 7: // Monitoramento
        // Validação flexível - alguns campos opcionais, mas sugerir preenchimento
        if (!registrationData.monitoring_frequency && !registrationData.monitoring_responsible) {
          setAlexSuggestions([{
            type: 'suggestion',
            title: 'Monitoramento Recomendado',
            content: 'Embora opcional, recomendo definir pelo menos a frequência ou o responsável pelo monitoramento.',
            severity: 'medium'
          }]);
          // Não bloquear a finalização, apenas sugerir
        }
        break;
    }
    return true;
  };

  const handleComplete = async () => {
    if (!validateCurrentStep() || !registrationId) return;

    setIsLoading(true);
    try {
      // Finalizar registro
      const finalData = {
        ...registrationData,
        status: 'completed',
        completion_percentage: 100,
        current_step: 7,
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('risk_registrations')
        .update(finalData)
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: '🎉 Processo Concluído com o Assistente',
        description: `Risco "${registrationData.risk_title}" foi registrado com sucesso.`,
      });

      setTimeout(() => {
        onComplete({
          ...finalData,
          action_plans: actionPlanItems,
          stakeholders: stakeholders
        });
      }, 1500);

    } catch (error) {
      console.error('Erro ao finalizar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o registro.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyAlexSuggestion = (suggestion: AlexRiskSuggestion) => {
    if (suggestion.action) {
      suggestion.action();
    }

    // Remover sugestão aplicada
    setAlexSuggestions(prev => prev.filter(s => s !== suggestion));

    toast({
      title: '✨ Sugestão Aplicada',
      description: 'Alex Risk otimizou sua entrada.',
    });
  };

  const renderStepContent = () => {
    if (isLoading && !registrationId) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">O Assistente está se preparando...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 w-full max-w-full overflow-hidden">
        {/* Assistente Prompt */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 w-full overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 truncate">Assistente IA</h4>
                <p className="text-purple-700 dark:text-purple-200 text-sm whitespace-pre-wrap break-words">{currentStepData?.alexPrompt}</p>
              </div>
              {isAnalyzing && (
                <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sugestões do Assistente */}
        {alexSuggestions.length > 0 && (
          <div className="space-y-3 w-full overflow-hidden">
            {alexSuggestions.map((suggestion, index) => (
              <Card key={index} className={`w-full overflow-hidden border-l-4 ${suggestion.severity === 'high' ? 'border-l-red-500' :
                suggestion.severity === 'medium' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-3 min-w-0">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/50">
                        {suggestion.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        ) : suggestion.type === 'improvement' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h5 className="font-medium text-sm mb-1 truncate">{suggestion.title}</h5>
                        <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words">{suggestion.content}</p>
                      </div>
                    </div>
                    {suggestion.action && (
                      <div className="flex-shrink-0 self-end sm:self-auto w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyAlexSuggestion(suggestion)}
                          className="w-full sm:w-auto"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Aplicar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Conteúdo da Etapa */}
        {renderStepForm()}
      </div>
    );
  };

  const renderStepForm = () => {
    switch (currentStep) {
      case 1: // Identificação
        return (
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Identificação do Risco</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden p-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título do Risco <span className="text-red-500">*</span>
                </label>
                <Input
                  value={registrationData.risk_title || ''}
                  onChange={(e) => updateRegistrationData({ risk_title: e.target.value })}
                  placeholder="Ex: Falha no sistema de backup..."
                  className="w-full max-w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoria do Risco <span className="text-red-500">*</span>
                </label>
                <Select
                  value={registrationData.risk_category || ''}
                  onValueChange={(value) => updateRegistrationData({ risk_category: value })}
                >
                  <SelectTrigger className="w-full max-w-full text-xs h-8">
                    <SelectValue placeholder="Selecione uma categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="strategic">Estratégico</SelectItem>
                    <SelectItem value="compliance">Conformidade</SelectItem>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="reputation">Reputação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="block text-sm font-medium">
                    Descrição Detalhada <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRiskLibrary(true)}
                    className="text-xs h-7"
                  >
                    <Library className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Carregar Biblioteca</span>
                  </Button>
                </div>
                <Textarea
                  value={registrationData.risk_description || ''}
                  onChange={(e) => updateRegistrationData({ risk_description: e.target.value })}
                  placeholder="Descreva o risco em detalhes: o que pode acontecer, onde, quando e por quê..."
                  rows={4}
                  className="w-full max-w-full"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Análise
        return (
          <div className="space-y-4">
            {/* Seleção de Metodologia */}
            <Card className="w-full max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Metodologia de Análise</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 overflow-hidden p-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Selecione a Metodologia <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={registrationData.methodology_id || ''}
                    onValueChange={(value) => updateRegistrationData({ methodology_id: value })}
                  >
                    <SelectTrigger className="w-full max-w-full text-xs h-8">
                      <SelectValue placeholder="Selecione uma metodologia..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualitative">📊 Análise Qualitativa</SelectItem>
                      <SelectItem value="quantitative">💰 Análise Quantitativa</SelectItem>
                      <SelectItem value="semi_quantitative">⚖️ Análise Semi-Quantitativa</SelectItem>
                      <SelectItem value="nist">🛡️ NIST Cybersecurity Framework</SelectItem>
                      <SelectItem value="iso31000">🌐 ISO 31000</SelectItem>
                      <SelectItem value="risco_si_simplificado">📋 Risco SI Simplificado</SelectItem>
                      <SelectItem value="risco_fornecedor">🏭 Risco de Fornecedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Configuração de Variáveis por Metodologia */}
            {registrationData.methodology_id && (
              <Card className="w-full max-w-full overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Configuração de Variáveis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 overflow-hidden p-4">
                  {/* Metodologia Qualitativa */}
                  {registrationData.methodology_id === 'qualitative' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full max-w-full overflow-hidden">
                      <div className="min-w-0 w-full">
                        <label className="block text-xs font-medium mb-1">
                          Impacto <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={registrationData.impact_score?.toString() || ''}
                          onValueChange={(value) => {
                            const score = parseInt(value);
                            updateRegistrationData({
                              impact_score: score,
                              risk_score: score * (registrationData.likelihood_score || 1)
                            });
                          }}
                        >
                          <SelectTrigger className="w-full max-w-full text-xs h-8">
                            <SelectValue placeholder="Selecione o impacto..." />
                          </SelectTrigger>
                          <SelectContent>
                            {matrixConfig.impactLabels.map((label, index) => (
                              <SelectItem key={index} value={(index + 1).toString()}>
                                {index + 1} - {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="min-w-0 w-full">
                        <label className="block text-xs font-medium mb-1">
                          Probabilidade <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={registrationData.likelihood_score?.toString() || ''}
                          onValueChange={(value) => {
                            const score = parseInt(value);
                            updateRegistrationData({
                              likelihood_score: score,
                              probability_score: score,
                              risk_score: (registrationData.impact_score || 1) * score
                            });
                          }}
                        >
                          <SelectTrigger className="w-full max-w-full text-xs h-8">
                            <SelectValue placeholder="Selecione a probabilidade..." />
                          </SelectTrigger>
                          <SelectContent>
                            {matrixConfig.probabilityLabels.map((label, index) => (
                              <SelectItem key={index} value={(index + 1).toString()}>
                                {index + 1} - {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Metodologia Quantitativa */}
                  {registrationData.methodology_id === 'quantitative' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full max-w-full overflow-hidden">
                      <div className="min-w-0 w-full">
                        <label className="block text-xs font-medium mb-1">
                          Valor do Impacto (R$) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          value={registrationData.impact_value || ''}
                          onChange={(e) => updateRegistrationData({ impact_value: parseFloat(e.target.value) })}
                          placeholder="0.00"
                          className="w-full max-w-full text-xs h-8"
                        />
                      </div>

                      <div className="min-w-0 w-full">
                        <label className="block text-xs font-medium mb-1">
                          Probabilidade (%) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={registrationData.probability_percentage || ''}
                          onChange={(e) => updateRegistrationData({ probability_percentage: parseFloat(e.target.value) })}
                          placeholder="0-100%"
                          className="w-full max-w-full text-xs h-8"
                        />
                      </div>
                    </div>
                  )}

                  {/* Metodologia NIST */}
                  {registrationData.methodology_id === 'nist' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">
                          Função NIST Afetada <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={registrationData.nist_function || ''}
                          onValueChange={(value) => updateRegistrationData({ nist_function: value })}
                        >
                          <SelectTrigger className="w-full max-w-full text-xs h-8">
                            <SelectValue placeholder="Selecione a função..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identify">Identificar</SelectItem>
                            <SelectItem value="protect">Proteger</SelectItem>
                            <SelectItem value="detect">Detectar</SelectItem>
                            <SelectItem value="respond">Responder</SelectItem>
                            <SelectItem value="recover">Recuperar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Nível de Impacto Cibernético <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={registrationData.cyber_impact?.toString() || ''}
                            onValueChange={(value) => updateRegistrationData({ cyber_impact: parseInt(value) })}
                          >
                            <SelectTrigger className="w-full text-xs h-8">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Baixo</SelectItem>
                              <SelectItem value="2">2 - Médio</SelectItem>
                              <SelectItem value="3">3 - Alto</SelectItem>
                              <SelectItem value="4">4 - Crítico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Probabilidade de Ameaça <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={registrationData.threat_likelihood?.toString() || ''}
                            onValueChange={(value) => updateRegistrationData({ threat_likelihood: parseInt(value) })}
                          >
                            <SelectTrigger className="w-full text-xs h-8">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Muito Baixa</SelectItem>
                              <SelectItem value="2">2 - Baixa</SelectItem>
                              <SelectItem value="3">3 - Moderada</SelectItem>
                              <SelectItem value="4">4 - Alta</SelectItem>
                              <SelectItem value="5">5 - Muito Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Outras metodologias - placeholder para expansão futura */}
                  {['semi_quantitative', 'iso31000', 'risco_si_simplificado', 'risco_fornecedor'].includes(registrationData.methodology_id) && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Metodologia Selecionada</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        A configuração completa para esta metodologia será implementada em breve.
                        Por enquanto, use a análise qualitativa padrão.
                      </p>
                    </div>
                  )}

                  {/* Score de Risco Calculado */}
                  {registrationData.risk_score && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                        <div className="min-w-0">
                          <p className="font-medium text-sm">Score de Risco Calculado</p>
                          <p className="text-xs text-muted-foreground">
                            Baseado na metodologia selecionada
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="text-base font-bold px-3 py-1">
                            {registrationData.risk_score}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3: // Classificação GUT
        return (
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Classificação GUT (Gravidade, Urgência, Tendência)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full max-w-full overflow-hidden">
                <div className="min-w-0 w-full">
                  <label className="block text-xs font-medium mb-1">
                    Gravidade <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={registrationData.gut_gravity?.toString() || ''}
                    onValueChange={(value) => updateRegistrationData({ gut_gravity: parseInt(value) })}
                  >
                    <SelectTrigger className="w-full max-w-full text-xs h-8">
                      <SelectValue placeholder="Avalie a gravidade..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Sem gravidade</SelectItem>
                      <SelectItem value="2">2 - Pouco grave</SelectItem>
                      <SelectItem value="3">3 - Grave</SelectItem>
                      <SelectItem value="4">4 - Muito grave</SelectItem>
                      <SelectItem value="5">5 - Extremamente grave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 w-full">
                  <label className="block text-xs font-medium mb-1">
                    Urgência <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={registrationData.gut_urgency?.toString() || ''}
                    onValueChange={(value) => updateRegistrationData({ gut_urgency: parseInt(value) })}
                  >
                    <SelectTrigger className="w-full max-w-full text-xs h-8">
                      <SelectValue placeholder="Avalie a urgência..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Pode esperar</SelectItem>
                      <SelectItem value="2">2 - Pouco urgente</SelectItem>
                      <SelectItem value="3">3 - Urgente</SelectItem>
                      <SelectItem value="4">4 - Muito urgente</SelectItem>
                      <SelectItem value="5">5 - Extremamente urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 w-full">
                  <label className="block text-xs font-medium mb-1">
                    Tendência <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={registrationData.gut_tendency?.toString() || ''}
                    onValueChange={(value) => updateRegistrationData({ gut_tendency: parseInt(value) })}
                  >
                    <SelectTrigger className="w-full max-w-full text-xs h-8">
                      <SelectValue placeholder="Avalie a tendência..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Vai diminuir</SelectItem>
                      <SelectItem value="2">2 - Vai diminuir um pouco</SelectItem>
                      <SelectItem value="3">3 - Vai permanecer</SelectItem>
                      <SelectItem value="4">4 - Vai piorar</SelectItem>
                      <SelectItem value="5">5 - Vai piorar muito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {registrationData.gut_gravity && registrationData.gut_urgency && registrationData.gut_tendency && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Score GUT Calculado</p>
                      <p className="text-xs text-muted-foreground">
                        G({registrationData.gut_gravity}) × U({registrationData.gut_urgency}) × T({registrationData.gut_tendency})
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-base font-bold px-3 py-1">
                        {registrationData.gut_gravity * registrationData.gut_urgency * registrationData.gut_tendency}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4: // Estratégia
        return (
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Estratégia de Tratamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden p-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estratégia Recomendada <span className="text-red-500">*</span>
                </label>
                <Select
                  value={registrationData.treatment_strategy || ''}
                  onValueChange={(value) => updateRegistrationData({ treatment_strategy: value })}
                >
                  <SelectTrigger className="w-full max-w-full text-xs h-8">
                    <SelectValue placeholder="Selecione a estratégia..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mitigate">Mitigar - Reduzir o risco</SelectItem>
                    <SelectItem value="transfer">Transferir - Passar para terceiros</SelectItem>
                    <SelectItem value="avoid">Evitar - Eliminar a causa</SelectItem>
                    <SelectItem value="accept">Aceitar - Monitorar o risco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Justificativa da Estratégia <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={registrationData.treatment_rationale || ''}
                  onChange={(e) => updateRegistrationData({ treatment_rationale: e.target.value })}
                  placeholder="Explique por que esta é a melhor estratégia para este risco..."
                  rows={3}
                  className="w-full max-w-full"
                />
              </div>

              {registrationData.treatment_strategy !== 'accept' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full max-w-full overflow-hidden">
                  <div className="min-w-0 w-full">
                    <label className="block text-xs font-medium mb-1">
                      Custo Estimado (R$)
                    </label>
                    <Input
                      type="number"
                      value={registrationData.treatment_cost || ''}
                      onChange={(e) => updateRegistrationData({ treatment_cost: parseFloat(e.target.value) })}
                      placeholder="0,00"
                      className="w-full max-w-full text-xs p-2"
                    />
                  </div>

                  <div className="min-w-0 w-full">
                    <label className="block text-xs font-medium mb-1">
                      Prazo para Implementação
                    </label>
                    <Input
                      type="date"
                      value={registrationData.treatment_timeline || ''}
                      onChange={(e) => updateRegistrationData({ treatment_timeline: e.target.value })}
                      className="w-full max-w-full text-xs p-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 5: // Plano de Ação
        return (
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>Plano de Ação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-hidden p-4">
              {registrationData.treatment_strategy === 'accept' ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Como você optou por aceitar este risco, um plano de ação detalhado não é necessário.
                    Prossiga para definir a comunicação.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      O Assistente sugere as seguintes atividades baseadas na sua estratégia:
                    </p>

                    <div className="space-y-3">
                      {/* Atividades sugeridas */}
                      <div className="p-3 border border-dashed rounded-lg bg-purple-50">
                        <div className="flex items-center space-x-2 text-purple-700 mb-2">
                          <Brain className="h-4 w-4" />
                          <span className="text-sm font-medium">Atividade Sugerida 1</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Implementar controles preventivos conforme estratégia selecionada
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                          <span className="text-xs text-muted-foreground">Prazo sugerido: 30 dias</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newAction = {
                                id: Date.now(),
                                title: 'Implementar controles preventivos',
                                description: 'Implementar controles preventivos conforme estratégia selecionada',
                                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                responsible: '',
                                status: 'pending'
                              };
                              setActionPlanItems([...actionPlanItems, newAction]);
                              toast({
                                title: 'Atividade Adicionada',
                                description: 'Atividade adicionada ao plano de ação'
                              });
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>

                      <div className="p-3 border border-dashed rounded-lg bg-purple-50">
                        <div className="flex items-center space-x-2 text-purple-700 mb-2">
                          <Brain className="h-4 w-4" />
                          <span className="text-sm font-medium">Atividade Sugerida 2</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Estabelecer monitoramento contínuo dos indicadores
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                          <span className="text-xs text-muted-foreground">Prazo sugerido: 15 dias</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newAction = {
                                id: Date.now(),
                                title: 'Estabelecer monitoramento',
                                description: 'Estabelecer monitoramento contínuo dos indicadores',
                                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                responsible: '',
                                status: 'pending'
                              };
                              setActionPlanItems([...actionPlanItems, newAction]);
                              toast({
                                title: 'Atividade Adicionada',
                                description: 'Atividade adicionada ao plano de ação'
                              });
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações adicionadas */}
                  {actionPlanItems.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">Ações do Plano ({actionPlanItems.length})</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newAction = {
                              id: Date.now(),
                              title: '',
                              description: '',
                              deadline: '',
                              responsible: '',
                              status: 'pending'
                            };
                            setActionPlanItems([...actionPlanItems, newAction]);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Nova Ação
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {actionPlanItems.map((action, index) => (
                          <div key={action.id} className="p-3 border rounded-lg bg-white">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Ação {index + 1}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setActionPlanItems(actionPlanItems.filter(item => item.id !== action.id));
                                  }}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              </div>

                              <Input
                                placeholder="Título da ação..."
                                value={action.title}
                                onChange={(e) => {
                                  const updated = actionPlanItems.map(item =>
                                    item.id === action.id ? { ...item, title: e.target.value } : item
                                  );
                                  setActionPlanItems(updated);
                                }}
                                className="text-xs h-7"
                              />

                              <Textarea
                                placeholder="Descrição da ação..."
                                value={action.description}
                                onChange={(e) => {
                                  const updated = actionPlanItems.map(item =>
                                    item.id === action.id ? { ...item, description: e.target.value } : item
                                  );
                                  setActionPlanItems(updated);
                                }}
                                rows={2}
                                className="text-xs"
                              />

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-muted-foreground">Prazo</label>
                                  <Input
                                    type="date"
                                    value={action.deadline}
                                    onChange={(e) => {
                                      const updated = actionPlanItems.map(item =>
                                        item.id === action.id ? { ...item, deadline: e.target.value } : item
                                      );
                                      setActionPlanItems(updated);
                                    }}
                                    className="text-xs h-7"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs text-muted-foreground">Responsável</label>
                                  <Input
                                    placeholder="Nome do responsável..."
                                    value={action.responsible}
                                    onChange={(e) => {
                                      const updated = actionPlanItems.map(item =>
                                        item.id === action.id ? { ...item, responsible: e.target.value } : item
                                      );
                                      setActionPlanItems(updated);
                                    }}
                                    className="text-xs h-7"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 6: // Comunicação
        return (
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Comunicação e Stakeholders</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden p-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Alex Risk identificou os seguintes stakeholders que devem ser comunicados:
                </p>

                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 w-full">
                        <p className="font-medium">Gestor da Área</p>
                        <p className="text-sm text-muted-foreground">Responsável pela área afetada</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Aprovação</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newStakeholder = {
                              id: Date.now(),
                              name: 'Gestor da Área',
                              role: 'Responsável pela área afetada',
                              notification_type: 'Aprovação',
                              email: ''
                            };
                            setStakeholders([...stakeholders, newStakeholder]);
                            toast({
                              title: 'Stakeholder Adicionado',
                              description: 'Gestor da Área foi adicionado à comunicação'
                            });
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 w-full">
                        <p className="font-medium">Comitê de Riscos</p>
                        <p className="text-sm text-muted-foreground">Para conhecimento e orientações</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Informação</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newStakeholder = {
                              id: Date.now(),
                              name: 'Comitê de Riscos',
                              role: 'Para conhecimento e orientações',
                              notification_type: 'Informação',
                              email: ''
                            };
                            setStakeholders([...stakeholders, newStakeholder]);
                            toast({
                              title: 'Stakeholder Adicionado',
                              description: 'Comitê de Riscos foi adicionado à comunicação'
                            });
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 w-full">
                        <p className="font-medium">Controles Internos</p>
                        <p className="text-sm text-muted-foreground">Monitoramento e compliance</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Informação</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newStakeholder = {
                              id: Date.now(),
                              name: 'Controles Internos',
                              role: 'Monitoramento e compliance',
                              notification_type: 'Informação',
                              email: ''
                            };
                            setStakeholders([...stakeholders, newStakeholder]);
                            toast({
                              title: 'Stakeholder Adicionado',
                              description: 'Controles Internos foi adicionado à comunicação'
                            });
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {stakeholders.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Stakeholders Adicionados ({stakeholders.length})</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newStakeholder = {
                            id: Date.now(),
                            name: '',
                            role: '',
                            notification_type: 'Informação',
                            email: ''
                          };
                          setStakeholders([...stakeholders, newStakeholder]);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Novo Stakeholder
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {stakeholders.map((stakeholder, index) => (
                        <div key={stakeholder.id || index} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Stakeholder {index + 1}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setStakeholders(stakeholders.filter((_, i) => i !== index));
                              }}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Nome do stakeholder..."
                              value={stakeholder.name}
                              onChange={(e) => {
                                const updated = stakeholders.map((item, i) =>
                                  i === index ? { ...item, name: e.target.value } : item
                                );
                                setStakeholders(updated);
                              }}
                              className="text-xs h-7"
                            />
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">{stakeholder.notification_type}</Badge>
                              <span className="text-xs text-muted-foreground">{stakeholder.role}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 7: // Monitoramento
        return (
          <Card className="w-full max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Monitoramento e KPIs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full max-w-full overflow-hidden">
                <div className="min-w-0 w-full">
                  <label className="block text-xs font-medium mb-1">
                    Frequência de Monitoramento
                  </label>
                  <Select
                    value={registrationData.monitoring_frequency || ''}
                    onValueChange={(value) => updateRegistrationData({ monitoring_frequency: value })}
                  >
                    <SelectTrigger className="w-full max-w-full text-xs h-8">
                      <SelectValue placeholder="Selecione a frequência..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="annually">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 w-full">
                  <label className="block text-xs font-medium mb-1">
                    Responsável pelo Monitoramento
                  </label>
                  <Input
                    value={registrationData.monitoring_responsible || ''}
                    onChange={(e) => updateRegistrationData({ monitoring_responsible: e.target.value })}
                    placeholder="Nome do responsável..."
                    className="w-full max-w-full text-xs p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Critérios de Encerramento
                </label>
                <Textarea
                  value={registrationData.closure_criteria || ''}
                  onChange={(e) => updateRegistrationData({ closure_criteria: e.target.value })}
                  placeholder="Defina quando este risco pode ser considerado encerrado..."
                  rows={3}
                  className="w-full max-w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  KPIs e Indicadores
                </label>
                <Textarea
                  value={registrationData.kpi_definition || ''}
                  onChange={(e) => updateRegistrationData({ kpi_definition: e.target.value })}
                  placeholder="Liste os indicadores que serão monitorados (Alex Risk pode sugerir alguns)..."
                  rows={3}
                  className="w-full max-w-full"
                />
              </div>

              {/* Análise de Risco Residual */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Risco Residual (Após Tratamento)</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 w-full max-w-full overflow-hidden">
                  <div className="min-w-0 w-full">
                    <label className="block text-xs font-medium mb-1">Impacto Residual</label>
                    <Select
                      value={registrationData.residual_impact?.toString() || ''}
                      onValueChange={(value) => updateRegistrationData({ residual_impact: parseInt(value) })}
                    >
                      <SelectTrigger className="w-full max-w-full text-xs h-8">
                        <SelectValue placeholder="Impacto após controles..." />
                      </SelectTrigger>
                      <SelectContent>
                        {matrixConfig.impactLabels.map((label, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>
                            {index + 1} - {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0 w-full">
                    <label className="block text-xs font-medium mb-1">Probabilidade Residual</label>
                    <Select
                      value={registrationData.residual_probability?.toString() || ''}
                      onValueChange={(value) => updateRegistrationData({ residual_probability: parseInt(value) })}
                    >
                      <SelectTrigger className="w-full max-w-full text-xs h-8">
                        <SelectValue placeholder="Probabilidade após controles..." />
                      </SelectTrigger>
                      <SelectContent>
                        {matrixConfig.probabilityLabels.map((label, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>
                            {index + 1} - {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    {registrationData.residual_impact && registrationData.residual_probability && (
                      <div className="text-center w-full space-y-1">
                        <p className="text-xs font-medium">Score Residual</p>
                        <Badge variant="outline" className="text-sm font-bold px-2 py-1">
                          {registrationData.residual_impact * registrationData.residual_probability}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="w-full max-w-full overflow-hidden">
            <CardContent className="py-8">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  O Assistente está preparando esta etapa...
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div
      className="space-y-3 w-full max-w-[calc(100vw-2rem)] sm:max-w-full min-w-0 box-border px-2 pb-6 overflow-x-hidden"
      style={{
        wordBreak: 'break-word',
        fontSize: '14px'
      }}
    >
      {/* Header com Assistente IA Branding */}
      {/* Header com Progresso */}
      <div className="space-y-4 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <Badge variant="secondary" className="text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 self-start">
            <Sparkles className="h-3 w-3 mr-1" />
            Etapa {currentStep} de {steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso com o Assistente</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Steps Navigation - Visual responsivo com scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide snap-x w-full max-w-full" style={{ scrollSnapType: 'x mandatory' }}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center snap-center shrink-0">
                <div className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-all whitespace-nowrap text-xs ${isActive
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md font-medium'
                  : isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <div className="hidden lg:block">
                    <p className="font-medium text-xs">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Etapa Atual */}
      {renderStepContent()}

      {/* Navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? 'Cancelar' : 'Anterior'}</span>
        </Button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Botão de chat com Alex */}
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => generateAlexSuggestions(currentStep, registrationData)}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            <span>Consultar Alex</span>
          </Button>

          {currentStep === steps.length ? (
            <Button
              onClick={handleComplete}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Finalizando...' : 'Concluir com Alex'}</span>
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full sm:w-auto"
            >
              <span>Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Modal da Biblioteca de Riscos */}
      <Dialog open={showRiskLibrary} onOpenChange={setShowRiskLibrary}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Library className="h-6 w-6 text-green-600" />
              <span>Biblioteca de Riscos - Templates e Modelos</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <RiskLibraryFixed
              onSelectTemplate={handleSelectTemplate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};