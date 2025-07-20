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
      general: 'Olá! Sou seu assistente de GRC. Como posso ajudá-lo hoje com questões de governança, riscos ou compliance?',
      assessment: 'Olá! Sou especializado em assessments e avaliações. Posso ajudar a criar questionários, definir critérios de avaliação e estruturar frameworks de compliance.',
      risk: 'Olá! Sou seu especialista em gestão de riscos. Posso ajudar com identificação, análise, avaliação e mitigação de riscos corporativos.',
      audit: 'Olá! Sou especializado em auditoria interna. Posso ajudar com planejamento de auditorias, procedimentos de teste e elaboração de relatórios.',
      policy: 'Olá! Sou especializado em políticas corporativas. Posso ajudar a criar políticas estruturadas, procedimentos e documentação de governança.',
      compliance: 'Olá! Sou especializado em compliance. Posso ajudar com questões regulatórias, frameworks de conformidade e controles internos.'
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
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
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
        content: 'Desculpe, estou com problemas técnicos no momento. Verifique se a chave da API Hugging Face está configurada corretamente.',
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