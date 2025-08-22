import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantSecurity } from '@/utils/tenantSecurity';

export interface RiskMatrixConfig {
  type: '4x4' | '5x5';
  risk_levels: {
    low: number[];
    medium: number[];
    high: number[];
    critical: number[];
  };
  impact_labels: string[];
  likelihood_labels: string[];
}

export interface SIQuestion {
  question: string;
  answer_options: string[];
}

export interface SIQuestionnaireConfig {
  probability_questions: SIQuestion[];
  impact_questions: SIQuestion[];
}

export interface TenantSettings {
  risk_matrix: RiskMatrixConfig;
  company_data?: any;
  theme_config?: any;
  si_questionnaire?: SIQuestionnaireConfig;
}

export const useTenantSettings = () => {
  const { user } = useAuth();
  const { userTenantId } = useTenantSecurity();

  const {
    data: tenantSettings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tenant-settings', userTenantId],
    queryFn: async (): Promise<TenantSettings> => {
      if (!userTenantId) {
        throw new Error('Tenant ID não encontrado');
      }

      console.log('🔍 Fetching tenant settings for:', userTenantId);

      const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', userTenantId)
        .single();

      if (error) {
        console.error('❌ Error fetching tenant settings:', error);
        throw error;
      }

      console.log('✅ Tenant settings loaded:', data.settings);

      // Se não há configuração de matriz de risco, usar padrão 5x5
      const settings = data.settings as TenantSettings;
      if (!settings.risk_matrix) {
        console.log('⚠️ No risk matrix config found, using 5x5 default');
        return {
          risk_matrix: {
            type: '5x5',
            risk_levels: {
              low: [1, 2, 3, 5, 6],
              medium: [4, 7, 8, 9, 10, 12],
              high: [11, 13, 14, 15, 16, 18, 20],
              critical: [17, 19, 21, 22, 23, 24, 25]
            },
            impact_labels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'],
            likelihood_labels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto']
          }
        };
      }

      // Se a configuração existe mas não tem o tipo definido, inferir baseado nas labels
      if (settings.risk_matrix && !settings.risk_matrix.type) {
        const labelCount = settings.risk_matrix.impact_labels?.length || 5;
        settings.risk_matrix.type = labelCount === 4 ? '4x4' : '5x5';
      }
      
      return settings;
    },
    enabled: !!user && !!userTenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });

  // Função para calcular o nível de risco baseado na configuração do tenant
  const calculateRiskLevel = (probability: number, impact: number): 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto' | 'Crítico' => {
    if (!tenantSettings?.risk_matrix) {
      // Fallback para 5x5 se não há configuração
      const score = probability * impact;
      if (score >= 20) return 'Muito Alto';
      if (score >= 15) return 'Alto';
      if (score >= 8) return 'Médio';
      if (score >= 4) return 'Baixo';
      return 'Muito Baixo';
    }

    const { risk_matrix } = tenantSettings;
    const score = probability * impact;

    if (risk_matrix.risk_levels.critical.includes(score)) {
      return risk_matrix.type === '4x4' ? 'Crítico' : 'Muito Alto';
    }
    if (risk_matrix.risk_levels.high.includes(score)) return 'Alto';
    if (risk_matrix.risk_levels.medium.includes(score)) return 'Médio';
    if (risk_matrix.risk_levels.low.includes(score)) return 'Baixo';
    
    return risk_matrix.type === '4x4' ? 'Baixo' : 'Muito Baixo';
  };

  // Função para obter as labels da matriz
  const getMatrixLabels = () => {
    if (!tenantSettings?.risk_matrix) {
      return {
        impact: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'],
        likelihood: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto']
      };
    }

    return {
      impact: tenantSettings.risk_matrix.impact_labels,
      likelihood: tenantSettings.risk_matrix.likelihood_labels
    };
  };

  // Função para obter as dimensões da matriz
  const getMatrixDimensions = () => {
    if (!tenantSettings?.risk_matrix) {
      return { rows: 5, cols: 5 };
    }

    const { type } = tenantSettings.risk_matrix;
    if (type === '4x4') {
      return { rows: 4, cols: 4 };
    }
    return { rows: 5, cols: 5 };
  };

  // Função para obter os níveis de risco corretos
  const getRiskLevels = () => {
    if (!tenantSettings?.risk_matrix) {
      return ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];
    }

    const { type } = tenantSettings.risk_matrix;
    if (type === '4x4') {
      return ['Baixo', 'Médio', 'Alto', 'Crítico'];
    }
    return ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];
  };

  // Função para obter configuração do questionário SI
  const getSIQuestionnaireConfig = (): SIQuestionnaireConfig => {
    if (tenantSettings?.si_questionnaire) {
      return tenantSettings.si_questionnaire;
    }
    
    // Configuração padrão se não existir
    const defaultAnswers = ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];
    
    return {
      probability_questions: [
        {
          question: 'Com que frequência eventos similares já ocorreram na organização?',
          answer_options: ['Nunca', 'Raramente', 'Ocasionalmente', 'Frequentemente', 'Constantemente', 'Não se aplica']
        },
        {
          question: 'Qual é a qualidade dos controles preventivos existentes?',
          answer_options: ['Excelente', 'Boa', 'Regular', 'Ruim', 'Inexistente', 'Não se aplica']
        },
        {
          question: 'Quão complexo é o processo ou sistema envolvido?',
          answer_options: ['Muito Simples', 'Simples', 'Moderado', 'Complexo', 'Muito Complexo', 'Não se aplica']
        },
        {
          question: 'Qual é o nível de dependência de fatores externos?',
          answer_options: ['Nenhuma', 'Baixa', 'Média', 'Alta', 'Total', 'Não se aplica']
        },
        {
          question: 'Como é a capacitação da equipe responsável?',
          answer_options: ['Excelente', 'Boa', 'Regular', 'Insuficiente', 'Inadequada', 'Não se aplica']
        },
        {
          question: 'Qual é a estabilidade do ambiente tecnológico?',
          answer_options: ['Muito Estável', 'Estável', 'Moderado', 'Instável', 'Muito Instável', 'Não se aplica']
        },
        {
          question: 'Existem mudanças frequentes nos processos?',
          answer_options: ['Nunca', 'Raramente', 'Ocasionalmente', 'Frequentemente', 'Constantemente', 'Não se aplica']
        },
        {
          question: 'Qual é o nível de monitoramento e detecção?',
          answer_options: ['Excelente', 'Bom', 'Regular', 'Ruim', 'Inexistente', 'Não se aplica']
        }
      ],
      impact_questions: [
        {
          question: 'Qual seria o impacto financeiro direto?',
          answer_options: ['< R$ 1.000', 'R$ 1.000 - R$ 10.000', 'R$ 10.000 - R$ 100.000', 'R$ 100.000 - R$ 1.000.000', '> R$ 1.000.000', 'Não se aplica']
        },
        {
          question: 'Como afetaria a reputação da organização?',
          answer_options: ['Nenhum impacto', 'Impacto local', 'Impacto regional', 'Impacto nacional', 'Impacto internacional', 'Não se aplica']
        },
        {
          question: 'Qual seria o impacto nas operações diárias?',
          answer_options: ['Nenhuma interrupção', '< 1 hora', '1-4 horas', '4-24 horas', '> 24 horas', 'Não se aplica']
        },
        {
          question: 'Como afetaria o atendimento aos clientes?',
          answer_options: ['Nenhum impacto', 'Poucos clientes', 'Alguns clientes', 'Muitos clientes', 'Todos os clientes', 'Não se aplica']
        },
        {
          question: 'Qual seria o impacto regulatório/legal?',
          answer_options: ['Nenhum', 'Advertência', 'Multa leve', 'Multa pesada', 'Processo judicial', 'Não se aplica']
        },
        {
          question: 'Como afetaria a segurança da informação?',
          answer_options: ['Nenhum vazamento', 'Dados internos', 'Dados de clientes', 'Dados sensíveis', 'Dados críticos', 'Não se aplica']
        },
        {
          question: 'Qual seria o impacto nos colaboradores?',
          answer_options: ['Nenhum', 'Desconforto', 'Estresse', 'Demissões', 'Acidentes', 'Não se aplica']
        },
        {
          question: 'Como afetaria os objetivos estratégicos?',
          answer_options: ['Nenhum impacto', 'Atraso mínimo', 'Atraso moderado', 'Atraso significativo', 'Inviabilização', 'Não se aplica']
        }
      ]
    };
  };

  // Função para salvar configuração do questionário SI
  const saveSIQuestionnaireConfig = async (config: SIQuestionnaireConfig) => {
    if (!userTenantId) {
      throw new Error('Tenant ID não encontrado');
    }

    const updatedSettings = {
      ...tenantSettings,
      si_questionnaire: config
    };

    const { error } = await supabase
      .from('tenants')
      .update({ 
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userTenantId);

    if (error) {
      throw error;
    }

    // Recarregar configurações
    await refetch();
  };

  return {
    tenantSettings,
    isLoading,
    error,
    refetch,
    calculateRiskLevel,
    getMatrixLabels,
    getMatrixDimensions,
    getRiskLevels,
    getSIQuestionnaireConfig,
    saveSIQuestionnaireConfig,
    isMatrix4x4: tenantSettings?.risk_matrix?.type === '4x4',
    isMatrix5x5: tenantSettings?.risk_matrix?.type === '5x5'
  };
};