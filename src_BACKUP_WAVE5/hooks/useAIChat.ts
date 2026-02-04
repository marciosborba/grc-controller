import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIChatConfig {
  type: 'general' | 'assessment' | 'risk' | 'audit' | 'policy' | 'compliance';
  context?: any;
}

export const useAIChat = (config: AIChatConfig) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string>();

  // Initialize session ID once
  if (!sessionIdRef.current) {
    sessionIdRef.current = crypto.randomUUID();
  }

  const logMessage = useCallback(async (
    messageType: 'user' | 'assistant',
    content: string,
    responseTime?: number,
    errorMessage?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_chat_logs').insert({
          user_id: user.id,
          session_id: sessionIdRef.current,
          message_type: messageType,
          content,
          ai_type: config.type,
          context: config.context,
          response_time: responseTime,
          error_message: errorMessage
        });
      }
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  }, [config.type, config.context]);

  const getWelcomeMessage = useCallback(() => {
    const welcomeMessages = {
      general: 'Olá! Sou ALEX RISK - seu assistente especializado em gestão de riscos. Como posso ajudá-lo hoje com questões de riscos corporativos?',
      assessment: 'Olá! Sou ALEX ASSESSMENT - especialista em assessments e avaliações de maturidade. Posso ajudar com metodologias de avaliação, frameworks de maturidade e boas práticas.',
      risk: 'Olá! Sou ALEX RISK - especialista em gestão de riscos corporativos. Posso ajudar com identificação, análise, avaliação e mitigação de riscos.',
      audit: 'Olá! Sou ALEX AUDIT - especialista em auditoria Big Four e IA. Posso ajudar com planejamento de auditorias, procedimentos de teste e elaboração de relatórios.',
      policy: 'Olá! Sou ALEX POLICY - especialista em políticas e procedimentos corporativos. Posso ajudar a criar políticas estruturadas e documentação de governança.',
      compliance: 'Olá! Sou ALEX COMPLIANCE - especialista em conformidade regulatória. Posso ajudar com frameworks regulatórios e controles de compliance.',
      privacy: 'Olá! Sou ALEX PRIVACY - especialista em privacidade de dados e LGPD. Posso ajudar com questões de proteção de dados e conformidade.',
      incident: 'Olá! Sou ALEX INCIDENT - especialista em gestão de incidentes. Posso ajudar com resposta a incidentes e planos de continuidade.',
      vendor: 'Olá! Sou seu especialista em riscos de fornecedores e IA. Posso ajudar com avaliação e gestão de terceiros.',
      ethics: 'Olá! Sou ALEX ETHICS - especialista em ética e ouvidoria corporativa. Posso ajudar com questões éticas e compliance comportamental.'
    };
    return welcomeMessages[config.type] || welcomeMessages.general;
  }, [config.type]);

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      };
      setMessages([assistantMessage]);
      logMessage('assistant', welcomeMessage);
    }
  }, [messages.length, getWelcomeMessage, logMessage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Log user message
    await logMessage('user', content);

    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-glm', {
        body: {
          prompt: content,
          type: config.type,
          context: config.context
        }
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('Resposta inválida da IA');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Log assistant response
      await logMessage('assistant', data.response, responseTime);

    } catch (error) {
      console.error('Erro ao enviar mensagem para IA:', error);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Desculpe, estou com problemas técnicos no momento. Verifique se o provedor de IA está configurado corretamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      // Log error
      await logMessage('assistant', errorMessage.content, Date.now() - startTime, error.message);

      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem para o assistente de IA.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, config.type, config.context, logMessage, toast]);

  return {
    messages,
    isLoading,
    sendMessage,
    initializeChat
  };
};