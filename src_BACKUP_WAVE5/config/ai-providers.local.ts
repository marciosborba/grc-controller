// ============================================================================
// CONFIGURAÇÃO LOCAL DE PROVEDORES DE IA
// ============================================================================
// ATENÇÃO: Este arquivo contém credenciais sensíveis e está no .gitignore

export interface AIProviderConfig {
  name: string;
  type: string;
  apiKey: string;
  endpoint?: string;
  model: string;
  enabled: boolean;
}

// Configurações reais com as credenciais fornecidas
export const AI_PROVIDERS_CONFIG: AIProviderConfig[] = [
  {
    name: 'GLM 4.5 Production',
    type: 'glm',
    apiKey: 'cfafc0f671ba420c84774dba2ff4d36a.h5crfWP8334Qs6qc',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4',
    enabled: true
  }
];

// Configurações específicas do GLM
export const GLM_CONFIG = {
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  chatEndpoint: '/chat/completions',
  embeddingEndpoint: '/embeddings',
  models: {
    'glm-4': {
      name: 'GLM-4',
      description: 'Modelo mais recente e avançado',
      contextWindow: 8000,
      maxTokens: 4000
    },
    'glm-3-turbo': {
      name: 'GLM-3-Turbo', 
      description: 'Rápido e econômico',
      contextWindow: 4000,
      maxTokens: 2000
    },
    'glm-4-air': {
      name: 'GLM-4-Air',
      description: 'Versão leve e eficiente', 
      contextWindow: 6000,
      maxTokens: 3000
    },
    'glm-4v': {
      name: 'GLM-4V',
      description: 'Com suporte a imagens',
      contextWindow: 8000,
      maxTokens: 4000
    }
  }
};

// Função para obter configuração por tipo
export const getProviderConfig = (type: string): AIProviderConfig | undefined => {
  return AI_PROVIDERS_CONFIG.find(config => config.type === type && config.enabled);
};

export default AI_PROVIDERS_CONFIG;