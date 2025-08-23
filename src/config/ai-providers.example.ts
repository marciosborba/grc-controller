// ============================================================================
// CONFIGURAÇÃO DE PROVEDORES DE IA - EXEMPLO
// ============================================================================
// Copie este arquivo para ai-providers.local.ts e configure suas credenciais

export interface AIProviderConfig {
  name: string;
  type: string;
  apiKey: string;
  endpoint?: string;
  model: string;
  enabled: boolean;
}

// Configurações de exemplo - SUBSTITUA pelas suas credenciais reais
export const AI_PROVIDERS_CONFIG: AIProviderConfig[] = [
  {
    name: 'GLM Production',
    type: 'glm',
    apiKey: 'your-glm-api-key-here.xxxxxxxxxxxxxxxx',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4',
    enabled: true
  },
  {
    name: 'OpenAI GPT-4',
    type: 'openai',
    apiKey: 'sk-your-openai-key-here',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4-turbo',
    enabled: false
  },
  {
    name: 'Claude 3.5',
    type: 'claude',
    apiKey: 'sk-ant-your-claude-key-here',
    model: 'claude-3-5-sonnet-20241022',
    enabled: false
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

// Função para validar se todas as configurações necessárias estão presentes
export const validateConfigurations = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  AI_PROVIDERS_CONFIG.forEach(config => {
    if (config.enabled) {
      if (!config.apiKey || config.apiKey.includes('your-') || config.apiKey.includes('here')) {
        errors.push(`API Key não configurada para ${config.name}`);
      }
      
      if (config.type === 'glm' && !config.apiKey.match(/^[a-f0-9]{8}\.[a-zA-Z0-9]{16}$/)) {
        errors.push(`Formato de API Key inválido para GLM: ${config.name}`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default AI_PROVIDERS_CONFIG;