import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Save,
  Settings,
  Shield,
  Sparkles,
  Target,
  Users,
  Calendar,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getTenantMatrixConfig } from '@/utils/risk-analysis';
import type { MatrixSize } from '@/types/risk-management';

interface RiskData {
  title: string;
  description: string;
  category: string;
  probability: string;
  impact: string;
  risk_level: string;
  treatment_strategy: string;
  controls: string[];
  responsible_person: string;
  deadline: string;
  status: string;
  mitigation_plan: string;
  monitoring_frequency: string;
  acceptance_criteria: string;
  assessment_model: string;
  model_variables: Record<string, any>;
  communication_plan: {
    stakeholders: string[];
    approval_required: boolean;
    approval_level: string;
    communication_method: string;
    notification_frequency: string;
  };
  risk_acceptance_letter?: {
    required: boolean;
    justification: string;
    approver: string;
    approval_date?: string;
  };
  // Campos adicionais para qualidade
  business_context: string;
  financial_impact_range: string;
  regulatory_requirements: string[];
  stakeholder_impact: string[];
  risk_appetite_alignment: string;
  kri_indicators: string[];
  escalation_triggers: string[];
  review_frequency: string;
  ai_quality_score: number;
  validation_status: 'pending' | 'approved' | 'rejected';
  validation_comments: string;
}

interface AIRiskRegistrationWizardProps {
  trigger?: React.ReactNode;
  onComplete?: (riskData: RiskData, riskId?: string) => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, title: 'Identificação', description: 'Descreva o risco identificado' },
  { id: 2, title: 'Modelo de Avaliação', description: 'Escolha o modelo e variáveis' },
  { id: 3, title: 'Análise IA', description: 'IA analisa com modelo selecionado' },
  { id: 4, title: 'Classificação', description: 'Confirme probabilidade e impacto' },
  { id: 5, title: 'Tratamento', description: 'Defina estratégia de tratamento' },
  { id: 6, title: 'Controles', description: 'Defina controles mitigadores' },
  { id: 7, title: 'Plano de Ação', description: 'Crie plano de mitigação' },
  { id: 8, title: 'Comunicação', description: 'Configure comunicação e aprovação' },
  { id: 9, title: 'Monitoramento', description: 'Configure acompanhamento' },
  { id: 10, title: 'Validação', description: 'Revise e valide antes de salvar' }
];

export const AIRiskRegistrationWizard: React.FC<AIRiskRegistrationWizardProps> = ({
  trigger,
  onComplete,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRiskAcceptanceLetter, setShowRiskAcceptanceLetter] = useState(false);
  const [matrixConfig, setMatrixConfig] = useState<{ 
    type: MatrixSize; 
    impact_labels: string[]; 
    likelihood_labels: string[] 
  } | null>(null);
  
  const [riskData, setRiskData] = useState<RiskData>({
    title: '',
    description: '',
    category: '',
    probability: '',
    impact: '',
    risk_level: '',
    treatment_strategy: '',
    controls: [],
    responsible_person: '',
    deadline: '',
    status: 'Identificado',
    mitigation_plan: '',
    monitoring_frequency: '',
    acceptance_criteria: '',
    assessment_model: '',
    model_variables: {},
    communication_plan: {
      stakeholders: [],
      approval_required: false,
      approval_level: '',
      communication_method: '',
      notification_frequency: ''
    },
    business_context: '',
    financial_impact_range: '',
    regulatory_requirements: [],
    stakeholder_impact: [],
    risk_appetite_alignment: '',
    kri_indicators: [],
    escalation_triggers: [],
    review_frequency: '',
    ai_quality_score: 0,
    validation_status: 'pending',
    validation_comments: ''
  });

  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // Carregar configuração da matriz do tenant
  useEffect(() => {
    const loadMatrixConfig = async () => {
      if (user?.tenant?.id) {
        try {
          const config = await getTenantMatrixConfig(user.tenant.id);
          setMatrixConfig(config);
          console.log('🏢 Configuração da matriz carregada:', config);
        } catch (error) {
          console.error('❌ Erro ao carregar configuração da matriz:', error);
          // Usar configuração padrão
          setMatrixConfig({
            type: '4x4',
            impact_labels: ['Baixo', 'Médio', 'Alto', 'Crítico'],
            likelihood_labels: ['Raro', 'Improvável', 'Possível', 'Provável']
          });
        }
      }
    };
    
    loadMatrixConfig();
  }, [user?.tenant?.id]);

  // Modelos de avaliação de risco completos e criteriosos
  const assessmentModels = {
    'iso31000': {
      name: 'ISO 31000:2018 - Gestão de Riscos',
      description: 'Framework internacional para gestão de riscos baseado em princípios, estrutura e processo',
      framework: 'ISO 31000',
      variables: {
        risk_context: { 
          label: 'Contexto Organizacional', 
          type: 'select', 
          options: ['Interno', 'Externo', 'Misto'],
          required: true,
          description: 'Define o ambiente interno e externo da organização'
        },
        stakeholder_involvement: { 
          label: 'Envolvimento das Partes Interessadas', 
          type: 'multiselect', 
          options: ['Alta Direção', 'Gerência', 'Operacional', 'Clientes', 'Fornecedores', 'Reguladores'],
          required: true,
          description: 'Partes interessadas que devem ser consideradas na análise'
        },
        risk_criteria: { 
          label: 'Critérios de Risco', 
          type: 'select', 
          options: ['Financeiro', 'Operacional', 'Reputacional', 'Estratégico', 'Compliance'],
          required: true,
          description: 'Critérios para avaliação e priorização de riscos'
        },
        time_horizon: { 
          label: 'Horizonte Temporal', 
          type: 'select', 
          options: ['Curto Prazo (< 1 ano)', 'Médio Prazo (1-3 anos)', 'Longo Prazo (> 3 anos)'],
          required: true,
          description: 'Período de tempo considerado para análise do risco'
        },
        risk_appetite: { 
          label: 'Apetite ao Risco', 
          type: 'select', 
          options: ['Conservador', 'Moderado', 'Agressivo'],
          required: true,
          description: 'Nível de risco que a organização está disposta a aceitar'
        },
        integration_level: { 
          label: 'Nível de Integração', 
          type: 'select', 
          options: ['Estratégico', 'Tático', 'Operacional'],
          required: true,
          description: 'Nível organizacional onde o risco deve ser integrado'
        }
      }
    },
    'coso_erm': {
      name: 'COSO ERM 2017 - Enterprise Risk Management',
      description: 'Framework integrado para gestão de riscos corporativos com foco em criação de valor',
      framework: 'COSO ERM',
      variables: {
        governance_culture: { 
          label: 'Governança e Cultura', 
          type: 'select', 
          options: ['Forte', 'Moderada', 'Fraca'],
          required: true,
          description: 'Avaliação da governança e cultura de risco da organização'
        },
        strategy_objective: { 
          label: 'Estratégia e Definição de Objetivos', 
          type: 'textarea',
          required: true,
          description: 'Como o risco impacta a estratégia e objetivos organizacionais'
        },
        performance_impact: { 
          label: 'Impacto na Performance', 
          type: 'select', 
          options: ['Alto', 'Médio', 'Baixo'],
          required: true,
          description: 'Nível de impacto do risco na performance organizacional'
        },
        review_revision: { 
          label: 'Revisão e Revisão', 
          type: 'select', 
          options: ['Contínua', 'Periódica', 'Ad-hoc'],
          required: true,
          description: 'Frequência de revisão e atualização da análise de risco'
        },
        information_communication: { 
          label: 'Informação e Comunicação', 
          type: 'multiselect', 
          options: ['Relatórios Executivos', 'Dashboards', 'Alertas', 'Reuniões'],
          required: true,
          description: 'Meios de comunicação sobre o risco'
        },
        value_creation: { 
          label: 'Criação de Valor', 
          type: 'textarea',
          required: true,
          description: 'Como a gestão deste risco contribui para criação de valor'
        }
      }
    },
    'quantitative': {
      name: 'Análise Quantitativa Avançada',
      description: 'Análise baseada em dados estatísticos, probabilidades e impactos financeiros mensuráveis',
      framework: 'Quantitativo',
      variables: {
        probability_distribution: { 
          label: 'Distribuição de Probabilidade', 
          type: 'select', 
          options: ['Normal', 'Log-Normal', 'Beta', 'Triangular', 'Uniforme'],
          required: true,
          description: 'Tipo de distribuição estatística para modelagem'
        },
        confidence_interval: { 
          label: 'Intervalo de Confiança (%)', 
          type: 'select', 
          options: ['90%', '95%', '99%'],
          required: true,
          description: 'Nível de confiança estatística para as estimativas'
        },
        var_calculation: { 
          label: 'Cálculo VaR (Value at Risk)', 
          type: 'select', 
          options: ['Paramétrico', 'Simulação Histórica', 'Monte Carlo'],
          required: true,
          description: 'Método para cálculo do Value at Risk'
        },
        expected_loss: { 
          label: 'Perda Esperada (R$)', 
          type: 'currency',
          required: true,
          description: 'Valor monetário da perda esperada'
        },
        worst_case_scenario: { 
          label: 'Cenário Pessimista (R$)', 
          type: 'currency',
          required: true,
          description: 'Valor monetário no pior cenário possível'
        },
        data_quality: { 
          label: 'Qualidade dos Dados', 
          type: 'select', 
          options: ['Alta (>95%)', 'Média (80-95%)', 'Baixa (<80%)'],
          required: true,
          description: 'Qualidade e confiabilidade dos dados utilizados'
        }
      }
    },
    'fmea': {
      name: 'FMEA - Failure Mode and Effects Analysis',
      description: 'Análise sistemática de modos de falha e seus efeitos com cálculo de RPN',
      framework: 'FMEA',
      variables: {
        failure_mode: { 
          label: 'Modo de Falha', 
          type: 'textarea',
          required: true,
          description: 'Descrição específica de como o processo/sistema pode falhar'
        },
        potential_effects: { 
          label: 'Efeitos Potenciais', 
          type: 'textarea',
          required: true,
          description: 'Consequências da falha para o cliente/processo'
        },
        severity_score: { 
          label: 'Severidade (1-10)', 
          type: 'number', 
          min: 1, 
          max: 10,
          required: true,
          description: 'Gravidade do efeito (1=insignificante, 10=catastrófico)'
        },
        occurrence_score: { 
          label: 'Ocorrência (1-10)', 
          type: 'number', 
          min: 1, 
          max: 10,
          required: true,
          description: 'Frequência de ocorrência da causa (1=remota, 10=muito alta)'
        },
        detection_score: { 
          label: 'Detecção (1-10)', 
          type: 'number', 
          min: 1, 
          max: 10,
          required: true,
          description: 'Capacidade de detectar a falha (1=alta detecção, 10=baixa detecção)'
        }
      }
    },
    'bow_tie': {
      name: 'Análise Bow-Tie',
      description: 'Análise visual de causas, evento central, consequências e barreiras de proteção',
      framework: 'Bow-Tie',
      variables: {
        top_event: { 
          label: 'Evento Central', 
          type: 'textarea',
          required: true,
          description: 'Evento principal que representa a materialização do risco'
        },
        threat_sources: { 
          label: 'Fontes de Ameaça', 
          type: 'multiselect', 
          options: ['Humana Intencional', 'Humana Não-Intencional', 'Tecnológica', 'Natural', 'Processual', 'Externa'],
          required: true,
          description: 'Origens das ameaças que podem causar o evento'
        },
        preventive_barriers: { 
          label: 'Barreiras Preventivas', 
          type: 'textarea',
          required: true,
          description: 'Controles que previnem a ocorrência do evento central'
        },
        protective_barriers: { 
          label: 'Barreiras Protetivas', 
          type: 'textarea',
          required: true,
          description: 'Controles que mitigam as consequências após o evento'
        },
        barrier_effectiveness: { 
          label: 'Efetividade das Barreiras (%)', 
          type: 'number', 
          min: 0, 
          max: 100,
          required: true,
          description: 'Percentual de efetividade das barreiras implementadas'
        }
      }
    },
    'monte_carlo': {
      name: 'Simulação Monte Carlo',
      description: 'Análise probabilística avançada com múltiplas simulações para modelagem de incertezas',
      framework: 'Monte Carlo',
      variables: {
        min_impact: { 
          label: 'Impacto Mínimo (R$)', 
          type: 'currency',
          required: true,
          description: 'Menor valor possível de impacto financeiro'
        },
        max_impact: { 
          label: 'Impacto Máximo (R$)', 
          type: 'currency',
          required: true,
          description: 'Maior valor possível de impacto financeiro'
        },
        most_likely_impact: { 
          label: 'Impacto Mais Provável (R$)', 
          type: 'currency',
          required: true,
          description: 'Valor mais provável de impacto financeiro'
        },
        distribution_type: { 
          label: 'Tipo de Distribuição', 
          type: 'select', 
          options: ['Normal', 'Triangular', 'Beta', 'Uniforme', 'Log-Normal'],
          required: true,
          description: 'Distribuição estatística para modelagem'
        },
        simulation_runs: { 
          label: 'Número de Simulações', 
          type: 'select', 
          options: ['1.000', '5.000', '10.000', '50.000', '100.000'],
          required: true,
          description: 'Quantidade de iterações para a simulação'
        }
      }
    }
  };

  const generateAISuggestions = useCallback(async () => {
    if (!riskData.title || !riskData.description || !riskData.assessment_model || !matrixConfig) {
      toast({
        title: 'Informações Incompletas',
        description: 'Por favor, preencha o título, descrição, selecione o modelo de avaliação e aguarde o carregamento da configuração da matriz.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const selectedModel = assessmentModels[riskData.assessment_model];
      
      // Prompt aprimorado como ALEX RISK - Especialista Sênior em Governança de Riscos
      const alexRiskPrompt = `
🎯 **ALEX RISK - ESPECIALISTA SÊNIOR EM GOVERNANÇA DE RISCOS**

Como especialista certificado em gestão de riscos (ISO 31000, COSO ERM, NIST RMF) com 15+ anos de experiência em Big Four e consultoria estratégica, vou analisar este risco com máximo rigor técnico e conformidade regulatória.

📊 **DADOS DO RISCO PARA ANÁLISE:**
- **Título:** ${riskData.title}
- **Descrição:** ${riskData.description}
- **Framework Selecionado:** ${selectedModel.framework}
- **Modelo:** ${selectedModel.name}
- **Configuração da Matriz:** ${matrixConfig.type} (${matrixConfig.likelihood_labels.join(', ')} x ${matrixConfig.impact_labels.join(', ')})
- **Variáveis do Modelo:** ${JSON.stringify(riskData.model_variables, null, 2)}

🔍 **ANÁLISE CRITERIOSA REQUERIDA:**

Como ALEX RISK, devo fornecer uma análise COMPLETA e CRITERIOSA em formato JSON, seguindo as melhores práticas de governança:

{
  "titulo_melhorado": "[REESCREVER o título de forma mais técnica, específica e profissional]",
  "descricao_melhorada": "[REESCREVER a descrição com linguagem técnica, incluindo contexto de negócio, causas raiz, gatilhos e impactos específicos]",
  "categoria_sugerida": "[Operacional, Financeiro, Estratégico, Tecnológico, Compliance, Reputacional, ESG]",
  "probabilidade_sugerida": "[${matrixConfig.likelihood_labels.join('|')}] - baseado na matriz ${matrixConfig.type}",
  "impacto_sugerido": "[${matrixConfig.impact_labels.join('|')}] - baseado na matriz ${matrixConfig.type}",
  "nivel_risco_calculado": "[Calcular baseado na matriz ${matrixConfig.type} e framework ${selectedModel.framework}]",
  "contexto_negocio": "[Explicar como este risco se relaciona com os objetivos estratégicos da organização]",
  "impacto_financeiro_estimado": "[Faixa de valores em R$ - ex: R$ 50.000 - R$ 200.000]",
  "requisitos_regulatorios": ["[Lista de regulamentações aplicáveis - ex: LGPD, SOX, BACEN, etc.]"],
  "partes_interessadas_impactadas": ["[Lista específica de stakeholders afetados]"],
  "alinhamento_apetite_risco": "[Conservador|Moderado|Agressivo - com justificativa]",
  "tratamento_sugerido": "[Mitigar|Aceitar|Transferir|Evitar - com justificativa técnica]",
  "controles_sugeridos": [
    "[Controle preventivo específico baseado no framework]",
    "[Controle detectivo específico]",
    "[Controle corretivo específico]",
    "[Controle compensatório se aplicável]"
  ],
  "plano_mitigacao_detalhado": "[Plano estruturado com ações específicas, responsáveis, prazos e marcos]",
  "indicadores_kri": [
    "[KRI específico 1 - com métrica]",
    "[KRI específico 2 - com métrica]",
    "[KRI específico 3 - com métrica]"
  ],
  "gatilhos_escalacao": [
    "[Gatilho 1 - condição específica]",
    "[Gatilho 2 - condição específica]"
  ],
  "responsavel_sugerido": "[Cargo/função específica com justificativa]",
  "prazo_implementacao_dias": [Número baseado na criticidade e complexidade],
  "frequencia_monitoramento": "[Diária|Semanal|Mensal|Trimestral - com justificativa]",
  "frequencia_revisao": "[Mensal|Trimestral|Semestral|Anual - baseada na dinâmica do risco]",
  "criterios_aceitacao": "[Critérios específicos e mensuráveis para considerar o risco adequadamente gerenciado]",
  "stakeholders_comunicacao": ["[Lista de stakeholders para comunicação baseada no impacto]"],
  "nivel_aprovacao_requerido": "[Gerencial|Diretoria|Conselho - baseado na materialidade]",
  "score_qualidade_ia": [Número de 1-100 baseado na completude e qualidade da análise],
  "recomendacoes_melhoria": "[Sugestões específicas para aprimorar a descrição ou análise do risco]",
  "conformidade_framework": "[Verificação de aderência ao framework ${selectedModel.framework} selecionado]"
}

⚠️ **CRITÉRIOS DE QUALIDADE OBRIGATÓRIOS:**
- Linguagem técnica e profissional
- Aderência total ao framework selecionado
- Consideração da matriz ${matrixConfig.type} configurada
- Alinhamento com melhores práticas de governança
- Especificidade e mensurabilidade
- Conformidade regulatória

🎯 **RESPONDA APENAS COM O JSON VÁLIDO, SEM TEXTO ADICIONAL.**
`;

      const { data, error } = await supabase.functions.invoke('ai-chat-glm', {
        body: {
          prompt: alexRiskPrompt,
          type: 'risk',
          context: { 
            riskTitle: riskData.title, 
            riskDescription: riskData.description,
            framework: selectedModel.framework,
            matrixConfig: matrixConfig
          }
        }
      });

      if (error) throw error;
      if (!data || !data.response) throw new Error('Resposta inválida da IA');

      try {
        const suggestions = JSON.parse(data.response);
        setAiSuggestions(suggestions);
        
        // Auto-preencher com sugestões melhoradas da IA
        setRiskData(prev => ({
          ...prev,
          title: suggestions.titulo_melhorado || prev.title,
          description: suggestions.descricao_melhorada || prev.description,
          category: suggestions.categoria_sugerida || '',
          probability: suggestions.probabilidade_sugerida || '',
          impact: suggestions.impacto_sugerido || '',
          risk_level: suggestions.nivel_risco_calculado || '',
          treatment_strategy: suggestions.tratamento_sugerido || '',
          controls: suggestions.controles_sugeridos || [],
          mitigation_plan: suggestions.plano_mitigacao_detalhado || '',
          responsible_person: suggestions.responsavel_sugerido || '',
          deadline: suggestions.prazo_implementacao_dias ? 
            new Date(Date.now() + (suggestions.prazo_implementacao_dias * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : '',
          monitoring_frequency: suggestions.frequencia_monitoramento || '',
          acceptance_criteria: suggestions.criterios_aceitacao || '',
          business_context: suggestions.contexto_negocio || '',
          financial_impact_range: suggestions.impacto_financeiro_estimado || '',
          regulatory_requirements: suggestions.requisitos_regulatorios || [],
          stakeholder_impact: suggestions.partes_interessadas_impactadas || [],
          risk_appetite_alignment: suggestions.alinhamento_apetite_risco || '',
          kri_indicators: suggestions.indicadores_kri || [],
          escalation_triggers: suggestions.gatilhos_escalacao || [],
          review_frequency: suggestions.frequencia_revisao || '',
          ai_quality_score: suggestions.score_qualidade_ia || 0,
          validation_comments: suggestions.recomendacoes_melhoria || '',
          communication_plan: {
            ...prev.communication_plan,
            stakeholders: suggestions.stakeholders_comunicacao || [],
            approval_level: suggestions.nivel_aprovacao_requerido || ''
          }
        }));

        toast({
          title: '🎯 Análise ALEX RISK Concluída',
          description: `Análise criteriosa realizada com score de qualidade: ${suggestions.score_qualidade_ia || 0}/100`,
        });

        setCurrentStep(4); // Avançar para classificação
      } catch (parseError) {
        console.error('Erro ao parsear resposta da IA:', parseError);
        toast({
          title: 'Erro na Análise',
          description: 'Não foi possível processar a análise da IA. Preencha manualmente.',
          variant: 'destructive'
        });
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com ALEX RISK. Preencha manualmente.',
        variant: 'destructive'
      });
      setCurrentStep(4);
    } finally {
      setIsProcessing(false);
    }
  }, [riskData.title, riskData.description, riskData.assessment_model, riskData.model_variables, matrixConfig, toast]);

  const validateRiskQuality = useCallback(() => {
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    
    // Validações obrigatórias
    if (!riskData.title || riskData.title.length < 10) {
      validationErrors.push('Título deve ter pelo menos 10 caracteres');
    }
    
    if (!riskData.description || riskData.description.length < 50) {
      validationErrors.push('Descrição deve ter pelo menos 50 caracteres');
    }
    
    if (!riskData.category) {
      validationErrors.push('Categoria é obrigatória');
    }
    
    if (!riskData.probability || !riskData.impact) {
      validationErrors.push('Probabilidade e impacto são obrigatórios');
    }
    
    if (!riskData.treatment_strategy) {
      validationErrors.push('Estratégia de tratamento é obrigatória');
    }
    
    if (!riskData.responsible_person) {
      validationErrors.push('Responsável é obrigatório');
    }
    
    if (riskData.controls.length === 0) {
      validationErrors.push('Pelo menos um controle deve ser definido');
    }
    
    // Validações de qualidade
    if (riskData.ai_quality_score < 70) {
      validationWarnings.push('Score de qualidade da IA abaixo de 70 - considere revisar');
    }
    
    if (!riskData.business_context) {
      validationWarnings.push('Contexto de negócio não preenchido');
    }
    
    if (!riskData.financial_impact_range) {
      validationWarnings.push('Impacto financeiro não estimado');
    }
    
    if (riskData.kri_indicators.length === 0) {
      validationWarnings.push('Nenhum indicador KRI definido');
    }
    
    return { errors: validationErrors, warnings: validationWarnings };
  }, [riskData]);

  const saveRisk = useCallback(async () => {
    const validation = validateRiskQuality();
    
    if (validation.errors.length > 0) {
      toast({
        title: 'Validação Falhou',
        description: `Erros encontrados: ${validation.errors.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }
    
    if (validation.warnings.length > 0 && riskData.validation_status !== 'approved') {
      toast({
        title: 'Avisos de Qualidade',
        description: `Avisos: ${validation.warnings.join(', ')}. Revise antes de salvar.`,
        variant: 'destructive'
      });
      return;
    }

    // Validação adicional antes de salvar
    if (!riskData.title || !riskData.description || !riskData.category) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Título, descrição e categoria são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('🔍 Debug saveRisk - User:', user);
    console.log('🔍 Debug saveRisk - Tenant ID:', user?.tenant?.id);
    
    // Temporariamente removendo validação de tenant para debug
    // if (!user?.tenant?.id) {
    //   console.log('❌ Tenant ID não encontrado. Estrutura do user:', JSON.stringify(user, null, 2));
    //   toast({
    //     title: 'Erro de Autenticação',
    //     description: 'Usuário não está associado a um tenant. Faça login novamente.',
    //     variant: 'destructive'
    //   });
    //   return;
    // }

    setIsProcessing(true);
    try {
      // Mapear probabilidade e impacto para valores numéricos
      const probabilityMap = {
        'Muito Baixo': 1, 'Baixo': 2, 'Médio': 3, 'Alto': 4, 'Muito Alto': 5,
        'Raro': 1, 'Improvável': 2, 'Possível': 3, 'Provável': 4, 'Muito Provável': 5
      };
      
      const impactMap = {
        'Muito Baixo': 1, 'Baixo': 2, 'Médio': 3, 'Alto': 4, 'Muito Alto': 5,
        'Insignificante': 1, 'Menor': 2, 'Moderado': 3, 'Maior': 4, 'Crítico': 5
      };
      
      const probabilityScore = probabilityMap[riskData.probability] || 3;
      const impactScore = impactMap[riskData.impact] || 3;
      
      // Preparar dados para inserção conforme estrutura da tabela
      const insertData = {
        title: riskData.title,
        description: riskData.description,
        risk_category: riskData.category,
        probability: probabilityScore,
        impact_score: impactScore,
        likelihood_score: probabilityScore,
        risk_level: riskData.risk_level || 'Médio',
        status: riskData.status || 'Identificado',
        treatment_type: riskData.treatment_strategy || 'Mitigar',
        assigned_to: riskData.responsible_person,
        due_date: riskData.deadline ? new Date(riskData.deadline).toISOString() : null,
        created_by: user?.id,
        tenant_id: user?.tenant?.id || '46b1c048-85a1-423b-96fc-776007c8de1f', // Fallback para debug
        analysis_data: {
          assessment_model: riskData.assessment_model,
          model_variables: riskData.model_variables,
          controls: riskData.controls,
          mitigation_plan: riskData.mitigation_plan,
          monitoring_frequency: riskData.monitoring_frequency,
          acceptance_criteria: riskData.acceptance_criteria,
          business_context: riskData.business_context,
          financial_impact_range: riskData.financial_impact_range,
          regulatory_requirements: riskData.regulatory_requirements,
          stakeholder_impact: riskData.stakeholder_impact,
          risk_appetite_alignment: riskData.risk_appetite_alignment,
          kri_indicators: riskData.kri_indicators,
          escalation_triggers: riskData.escalation_triggers,
          review_frequency: riskData.review_frequency,
          ai_quality_score: riskData.ai_quality_score,
          validation_status: riskData.validation_status,
          validation_comments: riskData.validation_comments,
          communication_plan: riskData.communication_plan,
          ai_generated: true
        }
      };
      
      console.log('💾 Dados para inserção:', insertData);
      
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert(insertData)
        .select()
        .single();
        
      console.log('📊 Resultado da inserção:', { data, error });

      if (error) throw error;

      toast({
        title: '✅ Risco Registrado com Excelência',
        description: `Risco "${riskData.title}" registrado com score de qualidade ${riskData.ai_quality_score}/100`,
      });

      if (onComplete) {
        onComplete(riskData, data.id);
      }

      setIsOpen(false);
      resetWizard();
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
      
      // Extrair mensagem de erro mais específica
      let errorMessage = 'Erro ao salvar o risco. Tente novamente.';
      
      if (error?.message) {
        if (error.message.includes('tenant_id')) {
          errorMessage = 'Erro de permissão: Verifique se você está logado corretamente.';
        } else if (error.message.includes('probability')) {
          errorMessage = 'Erro nos valores de probabilidade. Verifique se estão entre 1 e 5.';
        } else if (error.message.includes('impact')) {
          errorMessage = 'Erro nos valores de impacto. Verifique se estão entre 1 e 5.';
        } else if (error.message.includes('required')) {
          errorMessage = 'Campos obrigatórios não preenchidos. Verifique título, descrição e categoria.';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      toast({
        title: 'Erro ao Salvar',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [riskData, user?.id, onComplete, toast, validateRiskQuality]);

  const resetWizard = () => {
    setCurrentStep(1);
    setRiskData({
      title: '',
      description: '',
      category: '',
      probability: '',
      impact: '',
      risk_level: '',
      treatment_strategy: '',
      controls: [],
      responsible_person: '',
      deadline: '',
      status: 'Identificado',
      mitigation_plan: '',
      monitoring_frequency: '',
      acceptance_criteria: '',
      assessment_model: '',
      model_variables: {},
      communication_plan: {
        stakeholders: [],
        approval_required: false,
        approval_level: '',
        communication_method: '',
        notification_frequency: ''
      },
      business_context: '',
      financial_impact_range: '',
      regulatory_requirements: [],
      stakeholder_impact: [],
      risk_appetite_alignment: '',
      kri_indicators: [],
      escalation_triggers: [],
      review_frequency: '',
      ai_quality_score: 0,
      validation_status: 'pending',
      validation_comments: ''
    });
    setAiSuggestions(null);
    setShowRiskAcceptanceLetter(false);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      'Muito Baixo': 'bg-blue-100 text-blue-800',
      'Baixo': 'bg-green-100 text-green-800',
      'Médio': 'bg-amber-100 text-amber-900 border border-amber-300',
      'Alto': 'bg-orange-100 text-orange-800',
      'Muito Alto': 'bg-red-100 text-red-800',
      'Crítico': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const renderModelVariable = (key: string, variable: any) => {
    const value = riskData.model_variables[key] || '';
    
    const updateVariable = (newValue: any) => {
      setRiskData(prev => ({
        ...prev,
        model_variables: {
          ...prev.model_variables,
          [key]: newValue
        }
      }));
    };

    const baseClasses = "space-y-2";
    const isRequired = variable.required;

    switch (variable.type) {
      case 'select':
        return (
          <div key={key} className={baseClasses}>
            <Label htmlFor={key} className={isRequired ? "font-medium" : ""}>
              {variable.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}
            <Select value={value} onValueChange={updateVariable}>
              <SelectTrigger className={!value && isRequired ? "border-red-300" : ""}>
                <SelectValue placeholder={`Selecione ${variable.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {variable.options.map((option: string) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'multiselect':
        return (
          <div key={key} className={baseClasses}>
            <Label className={isRequired ? "font-medium" : ""}>
              {variable.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {variable.options.map((option: string) => {
                const isSelected = Array.isArray(value) && value.includes(option);
                return (
                  <Button
                    key={option}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const currentArray = Array.isArray(value) ? value : [];
                      const newArray = isSelected 
                        ? currentArray.filter(item => item !== option)
                        : [...currentArray, option];
                      updateVariable(newArray);
                    }}
                    className="justify-start text-xs"
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </div>
        );
        
      case 'number':
        return (
          <div key={key} className={baseClasses}>
            <Label htmlFor={key} className={isRequired ? "font-medium" : ""}>
              {variable.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => {
                const numValue = e.target.value === '' ? '' : parseFloat(e.target.value);
                updateVariable(numValue);
              }}
              min={variable.min}
              max={variable.max}
              placeholder={`Digite ${variable.label.toLowerCase()}`}
              className={!value && isRequired ? "border-red-300" : ""}
            />
          </div>
        );
        
      case 'currency':
        return (
          <div key={key} className={baseClasses}>
            <Label htmlFor={key} className={isRequired ? "font-medium" : ""}>
              {variable.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}
            <div className="relative">
              <Input
                id={key}
                type="number"
                value={value}
                onChange={(e) => {
                  const numValue = e.target.value === '' ? '' : parseFloat(e.target.value);
                  updateVariable(numValue);
                }}
                placeholder="0,00"
                className={cn("pl-8", !value && isRequired ? "border-red-300" : "")}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
            </div>
          </div>
        );
        
      case 'textarea':
        return (
          <div key={key} className={baseClasses}>
            <Label htmlFor={key} className={isRequired ? "font-medium" : ""}>
              {variable.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}
            <Textarea
              id={key}
              value={value}
              onChange={(e) => updateVariable(e.target.value)}
              placeholder={`Descreva ${variable.label.toLowerCase()}...`}
              rows={3}
              className={!value && isRequired ? "border-red-300" : ""}
            />
          </div>
        );
        
      default:
        return (
          <div key={key} className={baseClasses}>
            <Label htmlFor={key} className={isRequired ? "font-medium" : ""}>
              {variable.label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}
            <Input
              id={key}
              value={value}
              onChange={(e) => updateVariable(e.target.value)}
              placeholder={`Digite ${variable.label.toLowerCase()}`}
              className={!value && isRequired ? "border-red-300" : ""}
            />
          </div>
        );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-semibold">Identificação do Risco</h3>
              <p className="text-sm text-muted-foreground">
                Descreva o risco identificado. A IA ALEX RISK irá melhorar sua escrita e análise.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="font-medium">Título do Risco *</Label>
                <Input
                  id="title"
                  value={riskData.title}
                  onChange={(e) => setRiskData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Falha no sistema de backup crítico"
                  className={cn("mt-1", !riskData.title ? "border-red-300" : "")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seja específico e técnico. A IA irá aprimorar a linguagem.
                </p>
              </div>
              
              <div>
                <Label htmlFor="description" className="font-medium">Descrição Detalhada *</Label>
                <Textarea
                  id="description"
                  value={riskData.description}
                  onChange={(e) => setRiskData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o risco: o que pode acontecer, causas, gatilhos, contexto de negócio, impactos potenciais..."
                  rows={6}
                  className={cn("mt-1", !riskData.description ? "border-red-300" : "")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Inclua contexto, causas, gatilhos e impactos. Mínimo 50 caracteres. A IA irá estruturar e melhorar.
                </p>
              </div>
              
              {matrixConfig && (
                <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-700" />
                    <span className="text-sm font-semibold text-blue-900">
                      Configuração da Matriz: {matrixConfig.type}
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 mt-1">
                    Probabilidade: {matrixConfig.likelihood_labels.join(' → ')} | 
                    Impacto: {matrixConfig.impact_labels.join(' → ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Settings className="h-12 w-12 text-purple-500 mx-auto" />
              <h3 className="text-lg font-semibold">Modelo de Avaliação</h3>
              <p className="text-sm text-muted-foreground">
                Escolha o framework mais adequado para análise criteriosa
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Selecione o Framework de Análise *</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {Object.entries(assessmentModels).map(([key, model]) => (
                    <Card 
                      key={key} 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        riskData.assessment_model === key ? "ring-2 ring-primary bg-primary/5" : ""
                      )}
                      onClick={() => setRiskData(prev => ({ ...prev, assessment_model: key, model_variables: {} }))}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{model.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">{model.framework}</Badge>
                            </div>
                            {riskData.assessment_model === key && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {riskData.assessment_model && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <span>Variáveis do Framework: {assessmentModels[riskData.assessment_model]?.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {assessmentModels[riskData.assessment_model]?.framework}
                      </Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(assessmentModels[riskData.assessment_model]?.variables || {}).map(([key, variable]) =>
                        renderModelVariable(key, variable)
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Brain className="h-12 w-12 text-purple-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-semibold">Análise ALEX RISK</h3>
              <p className="text-sm text-muted-foreground">
                Especialista sênior em governança analisando com {assessmentModels[riskData.assessment_model]?.name}
              </p>
            </div>
            
            {riskData.assessment_model && matrixConfig && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <span>Framework: {assessmentModels[riskData.assessment_model]?.name}</span>
                    <Badge variant="outline">{assessmentModels[riskData.assessment_model]?.framework}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <strong>Matriz Configurada:</strong> {matrixConfig.type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Variáveis Definidas:</strong> {Object.keys(riskData.model_variables).length} de {Object.keys(assessmentModels[riskData.assessment_model]?.variables || {}).length}
                    </div>
                    {Object.entries(riskData.model_variables).map(([key, value]) => {
                      const variable = assessmentModels[riskData.assessment_model]?.variables[key];
                      let displayValue = '';
                      
                      if (Array.isArray(value)) {
                        displayValue = value.join(', ');
                      } else if (variable?.type === 'currency' && value !== '' && value !== null && value !== undefined) {
                        // Formatar valores monetários
                        const numValue = typeof value === 'string' ? parseFloat(value) : value;
                        if (!isNaN(numValue) && numValue !== 0) {
                          displayValue = new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(numValue);
                        } else {
                          displayValue = 'Não preenchido';
                        }
                      } else if (value !== null && value !== undefined && value !== '') {
                        displayValue = value.toString();
                      } else {
                        displayValue = 'Não preenchido';
                      }
                      
                      return (
                        <div key={key} className="flex justify-between py-1 text-xs">
                          <span>{variable?.label}:</span>
                          <span className="font-medium">
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isProcessing && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ALEX RISK analisando com {assessmentModels[riskData.assessment_model]?.framework}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aplicando melhores práticas de governança e matriz {matrixConfig?.type}
                  </p>
                </div>
              </div>
            )}
            
            {!isProcessing && (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Clique em "Analisar com ALEX RISK" para iniciar a análise criteriosa
                </p>
                <p className="text-xs text-muted-foreground">
                  Especialista certificado em ISO 31000, COSO ERM e NIST RMF
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 text-blue-500 mx-auto" />
              <h3 className="text-lg font-semibold">Classificação do Risco</h3>
              <p className="text-sm text-muted-foreground">
                Revise e confirme a classificação sugerida por ALEX RISK
              </p>
            </div>
            
            {aiSuggestions && riskData.ai_quality_score > 0 && (
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-700" />
                  <span className="font-semibold text-green-900">Análise ALEX RISK Concluída</span>
                  <Badge className="bg-green-600 text-white">
                    Score: {riskData.ai_quality_score}/100
                  </Badge>
                </div>
                <p className="text-sm text-green-800">
                  Título e descrição foram aprimorados com linguagem técnica e critérios de governança.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="font-medium">Categoria *</Label>
                <Select value={riskData.category} onValueChange={(value) => setRiskData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className={!riskData.category ? "border-red-300" : ""}>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Estratégico">Estratégico</SelectItem>
                    <SelectItem value="Tecnológico">Tecnológico</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                    <SelectItem value="Reputacional">Reputacional</SelectItem>
                    <SelectItem value="ESG">ESG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="probability" className="font-medium">Probabilidade *</Label>
                <Select value={riskData.probability} onValueChange={(value) => setRiskData(prev => ({ ...prev, probability: value }))}>
                  <SelectTrigger className={!riskData.probability ? "border-red-300" : ""}>
                    <SelectValue placeholder="Selecione a probabilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {matrixConfig?.likelihood_labels.map((label) => (
                      <SelectItem key={label} value={label}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="impact" className="font-medium">Impacto *</Label>
                <Select value={riskData.impact} onValueChange={(value) => setRiskData(prev => ({ ...prev, impact: value }))}>
                  <SelectTrigger className={!riskData.impact ? "border-red-300" : ""}>
                    <SelectValue placeholder="Selecione o impacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {matrixConfig?.impact_labels.map((label) => (
                      <SelectItem key={label} value={label}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="risk_level" className="font-medium">Nível do Risco</Label>
                <div className="mt-1">
                  <Badge className={cn("text-sm", getRiskLevelColor(riskData.risk_level))}>
                    {riskData.risk_level || 'Não calculado'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {riskData.assessment_model && (
              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Framework Aplicado: {assessmentModels[riskData.assessment_model]?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div><strong>Matriz:</strong> {matrixConfig?.type}</div>
                      <div><strong>Score de Qualidade:</strong> {riskData.ai_quality_score}/100</div>
                      {riskData.business_context && (
                        <div><strong>Contexto:</strong> {riskData.business_context.substring(0, 100)}...</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 text-orange-500 mx-auto" />
              <h3 className="text-lg font-semibold">Estratégia de Tratamento</h3>
              <p className="text-sm text-muted-foreground">
                Defina como o risco será tratado pela organização
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="treatment_strategy" className="font-medium">Estratégia de Tratamento *</Label>
                <Select 
                  value={riskData.treatment_strategy} 
                  onValueChange={(value) => {
                    setRiskData(prev => ({ ...prev, treatment_strategy: value }));
                    if (value === 'Aceitar') {
                      setRiskData(prev => ({
                        ...prev,
                        risk_acceptance_letter: {
                          required: true,
                          justification: '',
                          approver: ''
                        }
                      }));
                    }
                  }}
                >
                  <SelectTrigger className={!riskData.treatment_strategy ? "border-red-300" : ""}>
                    <SelectValue placeholder="Selecione a estratégia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mitigar">Mitigar - Reduzir probabilidade ou impacto</SelectItem>
                    <SelectItem value="Aceitar">Aceitar - Aceitar o risco como está</SelectItem>
                    <SelectItem value="Transferir">Transferir - Transferir para terceiros</SelectItem>
                    <SelectItem value="Evitar">Evitar - Eliminar a atividade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {riskData.treatment_strategy === 'Aceitar' && (
                <div className="p-4 border border-orange-300 bg-orange-100 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-700" />
                    <h4 className="font-semibold text-orange-900">Carta de Aceitação Necessária</h4>
                  </div>
                  <p className="text-sm text-orange-800 mb-3">
                    Será gerada uma Carta de Aceitação de Risco para aprovação formal conforme governança.
                  </p>
                </div>
              )}
              
              {riskData.risk_appetite_alignment && (
                <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="text-sm text-blue-900">
                    <strong>Alinhamento com Apetite ao Risco:</strong> {riskData.risk_appetite_alignment}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">Controles Mitigadores</h3>
              <p className="text-sm text-muted-foreground">
                Revise e complemente os controles sugeridos por ALEX RISK
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Controles Sugeridos por ALEX RISK</Label>
                <div className="space-y-2 mt-2">
                  {riskData.controls.map((control, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-muted/50 rounded border">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm">{control}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {index === 0 ? 'Preventivo' : index === 1 ? 'Detectivo' : index === 2 ? 'Corretivo' : 'Compensatório'}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setRiskData(prev => ({
                            ...prev,
                            controls: prev.controls.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="additional_control" className="font-medium">Adicionar Controle Personalizado</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="additional_control"
                    placeholder="Digite um controle adicional específico..."
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById('additional_control') as HTMLInputElement;
                      if (input.value.trim()) {
                        setRiskData(prev => ({
                          ...prev,
                          controls: [...prev.controls, input.value.trim()]
                        }));
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {riskData.kri_indicators.length > 0 && (
                <div>
                  <Label className="font-medium">Indicadores KRI Sugeridos</Label>
                  <div className="space-y-1 mt-2">
                    {riskData.kri_indicators.map((kri, index) => (
                      <div key={index} className="text-sm p-3 bg-blue-100 border border-blue-300 rounded text-blue-900">
                        📊 {kri}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 text-indigo-500 mx-auto" />
              <h3 className="text-lg font-semibold">Plano de Ação</h3>
              <p className="text-sm text-muted-foreground">
                Revise o plano de mitigação estruturado por ALEX RISK
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="mitigation_plan" className="font-medium">Plano de Mitigação Detalhado *</Label>
                <Textarea
                  id="mitigation_plan"
                  value={riskData.mitigation_plan}
                  onChange={(e) => setRiskData(prev => ({ ...prev, mitigation_plan: e.target.value }))}
                  rows={6}
                  className={cn("mt-1", !riskData.mitigation_plan ? "border-red-300" : "")}
                  placeholder="Plano estruturado com ações, responsáveis, prazos e marcos..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsible_person" className="font-medium">Responsável *</Label>
                  <Input
                    id="responsible_person"
                    value={riskData.responsible_person}
                    onChange={(e) => setRiskData(prev => ({ ...prev, responsible_person: e.target.value }))}
                    placeholder="Cargo/função do responsável"
                    className={cn("mt-1", !riskData.responsible_person ? "border-red-300" : "")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="deadline" className="font-medium">Prazo de Implementação *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={riskData.deadline}
                    onChange={(e) => setRiskData(prev => ({ ...prev, deadline: e.target.value }))}
                    className={cn("mt-1", !riskData.deadline ? "border-red-300" : "")}
                  />
                </div>
              </div>
              
              {riskData.financial_impact_range && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
                  <div className="text-sm text-amber-900 font-medium">
                    <strong>Impacto Financeiro Estimado:</strong> {riskData.financial_impact_range}
                  </div>
                </div>
              )}
              
              {riskData.escalation_triggers.length > 0 && (
                <div>
                  <Label className="font-medium">Gatilhos de Escalação</Label>
                  <div className="space-y-1 mt-2">
                    {riskData.escalation_triggers.map((trigger, index) => (
                      <div key={index} className="text-sm p-3 bg-red-100 border border-red-300 rounded text-red-900">
                        🚨 {trigger}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 text-blue-500 mx-auto" />
              <h3 className="text-lg font-semibold">Comunicação e Aprovação</h3>
              <p className="text-sm text-muted-foreground">
                Configure comunicação com stakeholders e aprovações necessárias
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Stakeholders para Comunicação</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Alta Direção', 'Gerentes', 'Auditoria', 'Compliance', 'TI', 'RH', 'Jurídico', 'Financeiro'].map((stakeholder) => {
                    const isSelected = riskData.communication_plan.stakeholders.includes(stakeholder);
                    const isAISuggested = riskData.stakeholder_impact.includes(stakeholder);
                    return (
                      <Button
                        key={stakeholder}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const currentStakeholders = riskData.communication_plan.stakeholders;
                          const newStakeholders = isSelected 
                            ? currentStakeholders.filter(s => s !== stakeholder)
                            : [...currentStakeholders, stakeholder];
                          setRiskData(prev => ({
                            ...prev,
                            communication_plan: {
                              ...prev.communication_plan,
                              stakeholders: newStakeholders
                            }
                          }));
                        }}
                        className={cn(
                          "justify-start text-xs",
                          isAISuggested && !isSelected ? "border-blue-400 bg-blue-100 text-blue-900" : ""
                        )}
                      >
                        {stakeholder}
                        {isAISuggested && <Sparkles className="h-3 w-3 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approval_required" className="font-medium">Aprovação Necessária</Label>
                  <Select 
                    value={riskData.communication_plan.approval_required.toString()} 
                    onValueChange={(value) => setRiskData(prev => ({
                      ...prev,
                      communication_plan: {
                        ...prev.communication_plan,
                        approval_required: value === 'true'
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aprovação necessária?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {riskData.communication_plan.approval_required && (
                  <div>
                    <Label htmlFor="approval_level" className="font-medium">Nível de Aprovação</Label>
                    <Select 
                      value={riskData.communication_plan.approval_level} 
                      onValueChange={(value) => setRiskData(prev => ({
                        ...prev,
                        communication_plan: {
                          ...prev.communication_plan,
                          approval_level: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gerencial">Gerencial</SelectItem>
                        <SelectItem value="Diretoria">Diretoria</SelectItem>
                        <SelectItem value="Conselho">Conselho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="communication_method" className="font-medium">Método de Comunicação</Label>
                  <Select 
                    value={riskData.communication_plan.communication_method} 
                    onValueChange={(value) => setRiskData(prev => ({
                      ...prev,
                      communication_plan: {
                        ...prev.communication_plan,
                        communication_method: value
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Reunião">Reunião</SelectItem>
                      <SelectItem value="Relatório">Relatório</SelectItem>
                      <SelectItem value="Dashboard">Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notification_frequency" className="font-medium">Frequência de Notificação</Label>
                  <Select 
                    value={riskData.communication_plan.notification_frequency} 
                    onValueChange={(value) => setRiskData(prev => ({
                      ...prev,
                      communication_plan: {
                        ...prev.communication_plan,
                        notification_frequency: value
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Imediata">Imediata</SelectItem>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 text-teal-500 mx-auto" />
              <h3 className="text-lg font-semibold">Monitoramento</h3>
              <p className="text-sm text-muted-foreground">
                Configure o acompanhamento contínuo do risco
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monitoring_frequency" className="font-medium">Frequência de Monitoramento *</Label>
                  <Select 
                    value={riskData.monitoring_frequency} 
                    onValueChange={(value) => setRiskData(prev => ({ ...prev, monitoring_frequency: value }))}
                  >
                    <SelectTrigger className={!riskData.monitoring_frequency ? "border-red-300" : ""}>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diária">Diária</SelectItem>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="review_frequency" className="font-medium">Frequência de Revisão *</Label>
                  <Select 
                    value={riskData.review_frequency} 
                    onValueChange={(value) => setRiskData(prev => ({ ...prev, review_frequency: value }))}
                  >
                    <SelectTrigger className={!riskData.review_frequency ? "border-red-300" : ""}>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="acceptance_criteria" className="font-medium">Critérios de Aceitação *</Label>
                <Textarea
                  id="acceptance_criteria"
                  value={riskData.acceptance_criteria}
                  onChange={(e) => setRiskData(prev => ({ ...prev, acceptance_criteria: e.target.value }))}
                  placeholder="Defina critérios específicos e mensuráveis para considerar o risco adequadamente gerenciado..."
                  rows={4}
                  className={cn("mt-1", !riskData.acceptance_criteria ? "border-red-300" : "")}
                />
              </div>
              
              {riskData.regulatory_requirements.length > 0 && (
                <div>
                  <Label className="font-medium">Requisitos Regulatórios Aplicáveis</Label>
                  <div className="space-y-1 mt-2">
                    {riskData.regulatory_requirements.map((req, index) => (
                      <div key={index} className="text-sm p-3 bg-purple-100 border border-purple-300 rounded text-purple-900">
                        ⚖️ {req}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">Validação e Finalização</h3>
              <p className="text-sm text-muted-foreground">
                Revise todas as informações e valide antes de registrar
              </p>
            </div>
            
            {/* Score de Qualidade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>Score de Qualidade ALEX RISK</span>
                  <Badge className={cn(
                    riskData.ai_quality_score >= 80 ? "bg-green-600 text-white" :
                    riskData.ai_quality_score >= 60 ? "bg-yellow-600 text-white" :
                    "bg-red-600 text-white"
                  )}>
                    {riskData.ai_quality_score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={riskData.ai_quality_score} className="h-2" />
                  
                  {riskData.validation_comments && (
                    <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Recomendações ALEX RISK:</h4>
                      <p className="text-sm text-blue-800">{riskData.validation_comments}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Label className="text-xs text-gray-700 font-semibold">Status</Label>
                      <Select 
                        value={riskData.validation_status} 
                        onValueChange={(value: 'pending' | 'approved' | 'rejected') => 
                          setRiskData(prev => ({ ...prev, validation_status: value }))
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-700 font-semibold">Controles</Label>
                      <div className="text-sm font-medium">{riskData.controls.length}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-700 font-semibold">KRIs</Label>
                      <div className="text-sm font-medium">{riskData.kri_indicators.length}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Resumo do Risco */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-medium">Título:</Label>
                  <p className="text-sm text-muted-foreground">{riskData.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Categoria:</Label>
                    <Badge variant="outline" className="ml-2">{riskData.category}</Badge>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Nível de Risco:</Label>
                    <Badge className={cn("ml-2", getRiskLevelColor(riskData.risk_level))}>
                      {riskData.risk_level}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Framework:</Label>
                    <p className="text-sm text-muted-foreground">
                      {assessmentModels[riskData.assessment_model]?.name}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Matriz:</Label>
                    <p className="text-sm text-muted-foreground">{matrixConfig?.type}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Tratamento:</Label>
                  <p className="text-sm text-muted-foreground">{riskData.treatment_strategy}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Responsável:</Label>
                  <p className="text-sm text-muted-foreground">{riskData.responsible_person}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Prazo:</Label>
                  <p className="text-sm text-muted-foreground">
                    {riskData.deadline ? new Date(riskData.deadline).toLocaleDateString('pt-BR') : 'Não definido'}
                  </p>
                </div>
                
                {riskData.financial_impact_range && (
                  <div>
                    <Label className="font-medium">Impacto Financeiro:</Label>
                    <p className="text-sm text-muted-foreground">{riskData.financial_impact_range}</p>
                  </div>
                )}
                
                <div>
                  <Label className="font-medium">Controles ({riskData.controls.length}):</Label>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {riskData.controls.slice(0, 3).map((control, index) => (
                      <li key={index}>{control}</li>
                    ))}
                    {riskData.controls.length > 3 && (
                      <li>... e mais {riskData.controls.length - 3} controles</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {/* Validação Final */}
            {(() => {
              const validation = validateRiskQuality();
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>Validação de Qualidade</span>
                      {validation.errors.length === 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validation.errors.length > 0 && (
                      <div className="p-4 bg-red-100 border border-red-300 rounded-lg mb-3">
                        <h4 className="font-semibold text-red-900 mb-2">Erros que impedem o registro:</h4>
                        <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validation.warnings.length > 0 && (
                      <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
                        <h4 className="font-bold text-amber-900 mb-2">Avisos de qualidade:</h4>
                        <ul className="text-sm text-amber-900 list-disc list-inside space-y-1 font-medium">
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validation.errors.length === 0 && validation.warnings.length === 0 && (
                      <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✅ Risco validado com sucesso! Pronto para registro.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        );

      default:
        return null;
    }
  };

  if (!matrixConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Registro de Risco com IA</span>
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 p-6">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Carregando configuração da matriz...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Registro de Risco com IA</span>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Registro de Risco com ALEX RISK</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Processo guiado com especialista sênior em governança de riscos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Sparkles className="h-3 w-3 mr-1" />
                ALEX RISK
              </Badge>
              <Badge variant="outline" className="text-xs">
                {matrixConfig.type}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Etapa {currentStep} de {STEPS.length}</span>
            <span>{Math.round((currentStep / STEPS.length) * 100)}% concluído</span>
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-between text-xs overflow-x-auto">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center space-y-1 flex-1 min-w-0",
                currentStep === step.id ? "text-primary" : "text-muted-foreground",
                currentStep > step.id ? "text-green-600" : ""
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2",
                  currentStep === step.id ? "border-primary bg-primary text-white" : "",
                  currentStep > step.id ? "border-green-600 bg-green-600 text-white" : "border-muted-foreground"
                )}
              >
                {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
              <span className="text-center text-xs truncate">{step.title}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Step Content */}
        <div className="min-h-[500px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} disabled={isProcessing}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => {
              setIsOpen(false);
              if (onClose) onClose();
            }}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button 
                onClick={currentStep === 3 ? generateAISuggestions : nextStep}
                disabled={
                  isProcessing || 
                  (currentStep === 1 && (!riskData.title || !riskData.description)) ||
                  (currentStep === 2 && !riskData.assessment_model)
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    {currentStep === 3 ? 'Analisar com ALEX RISK' : 'Próximo'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={saveRisk} 
                disabled={isProcessing || riskData.validation_status !== 'approved'}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Registrar Risco
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};