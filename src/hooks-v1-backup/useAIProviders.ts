// ============================================================================
// HOOK PARA GERENCIAMENTO DE PROVEDORES DE IA
// ============================================================================
// Hook personalizado para integração com diferentes provedores de IA

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { createGLMService } from '@/services/glmService';
import { useToast } from '@/hooks/use-toast';

interface AIProvider {
  id: string;
  name: string;
  provider_type: string;
  endpoint_url?: string;
  model_name: string;
  api_key_encrypted: string;
  context_window: number;
  max_output_tokens: number;
  temperature: number;
  is_active: boolean;
  is_primary: boolean;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const useAIProviders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [primaryProvider, setPrimaryProvider] = useState<AIProvider | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar provedores do banco
  const loadProviders = useCallback(async () => {
    if (!user?.tenantId) return;

    try {
      const { data, error } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user.tenantId)
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;

      setProviders(data || []);
      
      // Encontrar provedor primário
      const primary = data?.find(p => p.is_primary);
      setPrimaryProvider(primary || null);
      
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar provedores de IA',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.tenantId, toast]);

  // Fazer chat completion com o provedor especificado ou primário
  const chatCompletion = useCallback(async (
    request: ChatRequest,
    providerId?: string
  ): Promise<ChatResponse> => {
    const targetProvider = providerId 
      ? providers.find(p => p.id === providerId)
      : primaryProvider;

    if (!targetProvider) {
      throw new Error('Nenhum provedor de IA disponível');
    }

    try {
      switch (targetProvider.provider_type) {
        case 'glm':
          const glmService = createGLMService(targetProvider.api_key_encrypted);
          const glmResponse = await glmService.chatCompletion({
            model: targetProvider.model_name,
            messages: request.messages,
            temperature: request.temperature ?? targetProvider.temperature,
            max_tokens: request.max_tokens ?? targetProvider.max_output_tokens
          });

          return {
            content: glmResponse.choices[0]?.message?.content || '',
            usage: glmResponse.usage
          };

        case 'openai':
          // TODO: Implementar cliente OpenAI
          throw new Error('Cliente OpenAI ainda não implementado');

        case 'claude':
          // TODO: Implementar cliente Claude
          throw new Error('Cliente Claude ainda não implementado');

        default:
          throw new Error(`Provedor ${targetProvider.provider_type} não suportado`);
      }
    } catch (error: any) {
      console.error('Erro no chat completion:', error);
      
      // Log do erro no banco (opcional)
      try {
        await supabase
          .from('ai_usage_logs')
          .insert({
            provider_id: targetProvider.id,
            user_id: user?.id,
            request_type: 'chat_completion',
            model_used: targetProvider.model_name,
            success: false,
            error_message: error.message,
            tenant_id: user?.tenantId
          });
      } catch (logError) {
        console.warn('Erro ao registrar log de uso:', logError);
      }

      throw new Error(`Falha na comunicação com ${targetProvider.name}: ${error.message}`);
    }
  }, [providers, primaryProvider, user?.id, user?.tenantId]);

  // Análise de risco usando IA
  const analyzeRisk = useCallback(async (
    riskDescription: string,
    context?: string,
    providerId?: string
  ): Promise<string> => {
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

    const response = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    }, providerId);

    return response.content;
  }, [chatCompletion]);

  // Análise de compliance usando IA
  const analyzeCompliance = useCallback(async (
    requirement: string,
    framework: string,
    providerId?: string
  ): Promise<string> => {
    const systemPrompt = `Você é um especialista em compliance e frameworks regulatórios. 
Analise o requisito apresentado no contexto do framework especificado e forneça:
1. Interpretação do requisito
2. Evidências necessárias
3. Controles recomendados
4. Gaps comuns de implementação

Seja preciso e baseie-se nas melhores práticas do framework.`;

    const response = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Framework: ${framework}\n\nRequisito: ${requirement}` }
      ],
      temperature: 0.2
    }, providerId);

    return response.content;
  }, [chatCompletion]);

  // Geração de políticas usando IA
  const generatePolicy = useCallback(async (
    policyType: string,
    requirements: string[],
    providerId?: string
  ): Promise<string> => {
    const systemPrompt = `Você é um especialista em elaboração de políticas corporativas e compliance. 
Gere uma política completa e profissional baseada nos requisitos fornecidos.
A política deve incluir:
1. Objetivo e escopo
2. Definições importantes
3. Responsabilidades
4. Procedimentos detalhados
5. Controles e monitoramento
6. Penalidades por não conformidade

Use linguagem formal e técnica apropriada para documentos corporativos.`;

    const userPrompt = `Tipo de política: ${policyType}\n\nRequisitos:\n${requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}`;

    const response = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 2000
    }, providerId);

    return response.content;
  }, [chatCompletion]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  return {
    providers,
    primaryProvider,
    loading,
    loadProviders,
    chatCompletion,
    analyzeRisk,
    analyzeCompliance,
    generatePolicy
  };
};

export default useAIProviders;