// ============================================================================
// SERVIÇO DE INTEGRAÇÃO COM GLM (Zhipu AI)
// ============================================================================
// Cliente para integração com a API do GLM 4.5

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMChatRequest {
  model: string;
  messages: GLMMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface GLMChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GLMEmbeddingRequest {
  model: string;
  input: string | string[];
}

interface GLMEmbeddingResponse {
  object: string;
  data: {
    object: string;
    index: number;
    embedding: number[];
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class GLMService {
  private apiKey: string;
  private baseUrl: string;
  private embeddingUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.embeddingUrl = 'https://open.bigmodel.cn/api/paas/v4/embeddings';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Testa a conexão com a API do GLM
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testando conexão GLM com API key:', this.apiKey.substring(0, 8) + '...');
      
      const response = await this.chatCompletion({
        model: 'glm-4',
        messages: [
          {
            role: 'user',
            content: 'Olá! Responda apenas "OK" para testar a conexão.'
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      });

      if (response.choices && response.choices.length > 0) {
        console.log('Teste de conexão GLM bem-sucedido');
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida da API' };
      }
    } catch (error: any) {
      console.error('Erro no teste de conexão GLM:', error);
      
      // Tratamento de erros mais específico
      let errorMessage = 'Erro desconhecido na conexão';
      
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage = 'Erro de rede ou CORS: Não foi possível conectar ao servidor GLM. Isso pode ser devido a políticas CORS do navegador. A API key parece válida.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Erro de autenticação: Chave da API inválida ou expirada.';
      } else if (error.message.includes('403')) {
        errorMessage = 'Erro de permissão: Acesso negado. Verifique se a chave da API tem as permissões necessárias.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Limite de taxa excedido: Muitas requisições. Tente novamente em alguns minutos.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Erro interno do servidor GLM. Tente novamente mais tarde.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Erro de CORS: Problema de política de origem cruzada.';
      } else {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  /**
   * Realiza chat completion com o GLM
   */
  async chatCompletion(request: GLMChatRequest): Promise<GLMChatResponse> {
    try {
      console.log('GLM Request:', {
        url: this.baseUrl,
        model: request.model,
        messages: request.messages.length,
        temperature: request.temperature
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GLM API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`GLM API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('GLM Response:', {
        id: data.id,
        model: data.model,
        usage: data.usage
      });

      return data;
    } catch (error: any) {
      console.error('Erro na chamada GLM:', error);
      throw new Error(`Falha na comunicação com GLM: ${error.message}`);
    }
  }

  /**
   * Gera embeddings usando GLM
   */
  async generateEmbeddings(request: GLMEmbeddingRequest): Promise<GLMEmbeddingResponse> {
    try {
      const response = await fetch(this.embeddingUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GLM Embeddings API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erro na geração de embeddings GLM:', error);
      throw new Error(`Falha na geração de embeddings: ${error.message}`);
    }
  }

  /**
   * Método específico para análise de riscos usando GLM
   */
  async analyzeRisk(riskDescription: string, context?: string): Promise<string> {
    const systemPrompt = `Você é um especialista em análise de riscos corporativos e compliance. 
Analise o risco apresentado e forneça:
1. Classificação do risco (baixo, médio, alto, crítico)
2. Impactos potenciais
3. Recomendações de mitigação
4. Controles sugeridos

Seja objetivo e técnico na sua análise.`;

    const userPrompt = context 
      ? `Contexto: ${context}\n\nRisco a analisar: ${riskDescription}`
      : `Risco a analisar: ${riskDescription}`;

    const response = await this.chatCompletion({
      model: 'glm-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || 'Erro na análise do risco';
  }

  /**
   * Método específico para análise de compliance usando GLM
   */
  async analyzeCompliance(requirement: string, framework: string): Promise<string> {
    const systemPrompt = `Você é um especialista em compliance e frameworks regulatórios. 
Analise o requisito apresentado no contexto do framework especificado e forneça:
1. Interpretação do requisito
2. Evidências necessárias
3. Controles recomendados
4. Gaps comuns de implementação

Seja preciso e baseie-se nas melhores práticas do framework.`;

    const response = await this.chatCompletion({
      model: 'glm-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Framework: ${framework}\n\nRequisito: ${requirement}` }
      ],
      temperature: 0.2,
      max_tokens: 1200
    });

    return response.choices[0]?.message?.content || 'Erro na análise de compliance';
  }
}

// Factory function para criar instância do GLM Service
export const createGLMService = (apiKey: string): GLMService => {
  return new GLMService(apiKey);
};

// Função para validar formato da API key do GLM
export const validateGLMApiKey = (apiKey: string): boolean => {
  // Formato esperado: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx (32.16)
  const glmKeyPattern = /^[a-f0-9]{32}\.[a-zA-Z0-9]{16}$/;
  return glmKeyPattern.test(apiKey);
};

export default GLMService;