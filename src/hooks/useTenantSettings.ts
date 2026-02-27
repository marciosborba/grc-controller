import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSecurity } from '@/utils/tenantSecurity';

export interface RiskMatrixConfig {
  type: '3x3' | '4x4' | '5x5';
  risk_levels: {
    low: number[];
    medium: number[];
    high: number[];
    critical?: number[];
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

export interface SupplierQuestionnaireConfig {
  probability_questions: SIQuestion[];
  impact_questions: SIQuestion[];
}

export interface TenantSettings {
  risk_matrix: RiskMatrixConfig;
  company_data?: any;
  theme_config?: any;
  si_questionnaire?: SIQuestionnaireConfig;
  supplier_questionnaire?: SupplierQuestionnaireConfig;
}

export const useTenantSettings = (specificTenantId?: string) => {
  const { user } = useAuth();
  const { userTenantId } = useTenantSecurity();

  // Usar o tenantId específico se fornecido, senão usar o do usuário
  const targetTenantId = specificTenantId || userTenantId;

  const {
    data: tenantSettings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tenant-settings', targetTenantId],
    queryFn: async (): Promise<TenantSettings> => {
      if (!targetTenantId) {
        throw new Error('Tenant ID não encontrado');
      }

      console.log('🔍 Fetching tenant settings for:', targetTenantId);

      const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', targetTenantId)
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
              medium: [4, 7, 8, 9, 10, 11],
              high: [12, 13, 14, 15, 16, 17, 18],
              critical: [19, 20, 21, 22, 23, 24, 25]
            },
            impact_labels: ['Insignificante', 'Menor', 'Moderado', 'Maior', 'Catastrófico'],
            likelihood_labels: ['Raro', 'Improvável', 'Possível', 'Provável', 'Quase Certo']
          }
        };
      }

      // Se a configuração existe mas não tem o tipo definido, inferir baseado nas labels
      if (settings.risk_matrix && !settings.risk_matrix.type) {
        const labelCount = settings.risk_matrix.impact_labels?.length || 5;
        if (labelCount === 3) {
          settings.risk_matrix.type = '3x3';
        } else if (labelCount === 4) {
          settings.risk_matrix.type = '4x4';
        } else {
          settings.risk_matrix.type = '5x5';
        }
      }

      return settings;
    },
    enabled: !!user && !!targetTenantId,
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true, // Recarregar quando a janela ganhar foco
    refetchOnMount: true // Sempre recarregar ao montar o componente
  });

  // Função para calcular o nível de risco baseado na configuração do tenant
  const calculateRiskLevel = (probability: number, impact: number): 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto' | 'Crítico' => {
    if (!tenantSettings?.risk_matrix) {
      // Fallback para 5x5 usando as faixas da matriz verdadeira
      const score = probability * impact;
      if (score >= 19) return 'Muito Alto'; // critical: [19-25]
      if (score >= 12) return 'Alto';       // high: [12-18]
      if (score >= 4) return 'Médio';       // medium: [4,7-11]
      if (score >= 1) return 'Baixo';       // low: [1-3,5-6]
      return 'Muito Baixo';
    }

    const { risk_matrix } = tenantSettings;
    const score = probability * impact;

    // Para matriz 3x3, não há nível crítico
    if (risk_matrix.type === '3x3') {
      if (risk_matrix.risk_levels.high.includes(score)) return 'Alto';
      if (risk_matrix.risk_levels.medium.includes(score)) return 'Médio';
      if (risk_matrix.risk_levels.low.includes(score)) return 'Baixo';
      return 'Baixo';
    }

    // Para matrizes 4x4 e 5x5
    if (risk_matrix.risk_levels.critical && risk_matrix.risk_levels.critical.includes(score)) {
      return 'Crítico';
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
    if (type === '3x3') {
      return { rows: 3, cols: 3 };
    } else if (type === '4x4') {
      return { rows: 4, cols: 4 };
    }
    return { rows: 5, cols: 5 };
  };

  // Função para obter os níveis de risco corretos de forma exata e não repetida
  const getRiskLevels = (): ('Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto' | 'Crítico')[] => {
    if (!tenantSettings?.risk_matrix) {
      // Padrão 5x5:
      return ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'];
    }

    const { type, risk_levels } = tenantSettings.risk_matrix;

    // Identifica se usa 'Crítico' ou 'Muito Alto' pela presença do nível 'critical' ou dependendo do tipo da matriz
    const highestLevel = risk_levels.critical ? 'Crítico' : 'Muito Alto';

    if (type === '3x3') {
      return ['Baixo', 'Médio', 'Alto'];
    } else if (type === '4x4') {
      return ['Baixo', 'Médio', 'Alto', 'Crítico'];
    }
    // 5x5
    return ['Muito Baixo', 'Baixo', 'Médio', 'Alto', highestLevel];
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

  // Função para obter configuração do questionário de Fornecedores
  const getSupplierQuestionnaireConfig = (): SupplierQuestionnaireConfig => {
    if (tenantSettings?.supplier_questionnaire) {
      return tenantSettings.supplier_questionnaire;
    }

    // Configuração padrão para Risco de Fornecedor
    return {
      probability_questions: [
        {
          question: 'Qual é o histórico de desempenho do fornecedor?',
          answer_options: ['Excelente', 'Bom', 'Regular', 'Ruim', 'Péssimo', 'Não se aplica']
        },
        {
          question: 'Como é a estabilidade financeira do fornecedor?',
          answer_options: ['Muito Estável', 'Estável', 'Moderada', 'Instável', 'Crítica', 'Não se aplica']
        },
        {
          question: 'Qual é o nível de dependência deste fornecedor?',
          answer_options: ['Baixa', 'Moderada', 'Alta', 'Crítica', 'Exclusiva', 'Não se aplica']
        },
        {
          question: 'Como é a localização geográfica do fornecedor?',
          answer_options: ['Local', 'Regional', 'Nacional', 'Internacional', 'Alto Risco Geográfico', 'Não se aplica']
        },
        {
          question: 'Qual é a qualidade dos controles de segurança do fornecedor?',
          answer_options: ['Excelente', 'Boa', 'Regular', 'Insuficiente', 'Inadequada', 'Não se aplica']
        },
        {
          question: 'Como é a capacidade de recuperação do fornecedor?',
          answer_options: ['Muito Alta', 'Alta', 'Média', 'Baixa', 'Muito Baixa', 'Não se aplica']
        },
        {
          question: 'Qual é o nível de compliance regulatório do fornecedor?',
          answer_options: ['Totalmente Aderente', 'Aderente', 'Parcialmente Aderente', 'Não Aderente', 'Desconhecido', 'Não se aplica']
        },
        {
          question: 'Como é a transparência e comunicação do fornecedor?',
          answer_options: ['Excelente', 'Boa', 'Regular', 'Ruim', 'Péssima', 'Não se aplica']
        }
      ],
      impact_questions: [
        {
          question: 'Qual seria o impacto financeiro de uma interrupção?',
          answer_options: ['< R$ 10.000', 'R$ 10.000 - R$ 100.000', 'R$ 100.000 - R$ 1.000.000', 'R$ 1.000.000 - R$ 10.000.000', '> R$ 10.000.000', 'Não se aplica']
        },
        {
          question: 'Como afetaria a continuidade das operações?',
          answer_options: ['Sem impacto', 'Atraso mínimo', 'Interrupção parcial', 'Interrupção total', 'Paralisação prolongada', 'Não se aplica']
        },
        {
          question: 'Qual seria o impacto na qualidade dos produtos/serviços?',
          answer_options: ['Nenhum', 'Leve degradação', 'Degradação moderada', 'Degradação severa', 'Falha total', 'Não se aplica']
        },
        {
          question: 'Como afetaria o relacionamento com clientes?',
          answer_options: ['Sem impacto', 'Insatisfação leve', 'Insatisfação moderada', 'Perda de clientes', 'Perda massiva de clientes', 'Não se aplica']
        },
        {
          question: 'Qual seria o impacto regulatório e legal?',
          answer_options: ['Nenhum', 'Notificação', 'Multa leve', 'Multa pesada', 'Processo judicial', 'Não se aplica']
        },
        {
          question: 'Como afetaria a reputação da empresa?',
          answer_options: ['Sem impacto', 'Impacto local', 'Impacto setorial', 'Impacto nacional', 'Impacto internacional', 'Não se aplica']
        },
        {
          question: 'Qual seria o tempo para encontrar fornecedor alternativo?',
          answer_options: ['< 1 semana', '1-4 semanas', '1-3 meses', '3-12 meses', '> 12 meses', 'Não se aplica']
        },
        {
          question: 'Como afetaria a segurança da informação?',
          answer_options: ['Sem risco', 'Risco baixo', 'Risco moderado', 'Risco alto', 'Risco crítico', 'Não se aplica']
        }
      ]
    };
  };

  // Função para salvar configuração do questionário SI
  const saveSIQuestionnaireConfig = async (config: SIQuestionnaireConfig) => {
    if (!targetTenantId) {
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
      .eq('id', targetTenantId);

    if (error) {
      throw error;
    }

    // Recarregar configurações
    await refetch();
  };

  // Função para salvar configuração do questionário de Fornecedores
  const saveSupplierQuestionnaireConfig = async (config: SupplierQuestionnaireConfig) => {
    if (!targetTenantId) {
      throw new Error('Tenant ID não encontrado');
    }

    const updatedSettings = {
      ...tenantSettings,
      supplier_questionnaire: config
    };

    const { error } = await supabase
      .from('tenants')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetTenantId);

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
    getSupplierQuestionnaireConfig,
    saveSupplierQuestionnaireConfig,
    isMatrix4x4: tenantSettings?.risk_matrix?.type === '4x4',
    isMatrix5x5: tenantSettings?.risk_matrix?.type === '5x5'
  };
};