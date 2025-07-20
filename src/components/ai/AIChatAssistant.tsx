import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Brain,
  Send,
  Loader2,
  MessageCircle,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  type?: 'general' | 'assessment' | 'risk' | 'audit' | 'policy' | 'compliance';
  context?: any;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  type = 'general',
  context,
  trigger,
  defaultOpen = false
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWelcomeMessage = useCallback((assistantType: string) => {
    const messages = {
      general: 'Olá! Sou seu assistente de GRC. Como posso ajudá-lo hoje com questões de governança, riscos ou compliance?',
      assessment: 'Olá! Sou especializado em assessments e avaliações. Posso ajudar a criar questionários, definir critérios de avaliação e estruturar frameworks de compliance.',
      risk: 'Olá! Sou seu especialista em gestão de riscos. Posso ajudar com identificação, análise, avaliação e mitigação de riscos corporativos.',
      audit: 'Olá! Sou especializado em auditoria interna. Posso ajudar com planejamento de auditorias, procedimentos de teste e elaboração de relatórios.',
      policy: 'Olá! Sou especializado em políticas corporativas. Posso ajudar a criar políticas estruturadas, procedimentos e documentação de governança.',
      compliance: 'Olá! Sou especializado em compliance. Posso ajudar com questões regulatórias, frameworks de conformidade e controles internos.'
    };
    return messages[assistantType] || messages.general;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(type);
      setMessages([{
        id: Date.now().toString(),
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, getWelcomeMessage, type]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const messageToSend = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    console.log('Enviando mensagem para IA:', { prompt: messageToSend, type, context });

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: messageToSend,
          type,
          context
        }
      });

      console.log('Resposta da IA - data:', data);
      console.log('Resposta da IA - error:', error);

      if (error) {
        console.error('Erro específico da Edge Function:', error);
        throw error;
      }

      if (!data || !data.response) {
        console.error('Resposta inválida da IA:', data);
        throw new Error('Resposta inválida da IA');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem para IA:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Desculpe, estou com problemas técnicos no momento. Verifique se a chave da API Hugging Face está configurada corretamente nas configurações do Supabase.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem para o assistente de IA. Verifique as configurações.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, type, context, toast]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const getTypeLabel = useCallback(() => {
    const labels = {
      general: 'Assistente Geral',
      assessment: 'Assessment',
      risk: 'Gestão de Riscos',
      audit: 'Auditoria',
      policy: 'Políticas',
      compliance: 'Compliance'
    };
    return labels[type] || 'Assistente IA';
  }, [type]);

  const getTypeColor = useCallback(() => {
    const colors = {
      general: 'bg-blue-500',
      assessment: 'bg-purple-500',
      risk: 'bg-red-500',
      audit: 'bg-green-500',
      policy: 'bg-indigo-500',
      compliance: 'bg-orange-500'
    };
    return colors[type] || 'bg-blue-500';
  }, [type]);

  const ChatContent = useCallback(() => (
    <Card className={`grc-card border-primary/30 ${isMinimized ? 'h-16' : 'h-96'} transition-all duration-300`}>
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full ${getTypeColor()}`}>
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{getTypeLabel()}</CardTitle>
              <Badge variant="outline" className="text-xs">
                Assistente IA
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-80">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Assistente está digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !inputValue.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  ), [isMinimized, getTypeColor, getTypeLabel, messages, isLoading, messagesEndRef, inputValue, handleKeyPress, sendMessage]);

  if (defaultOpen) {
    return <ChatContent />;
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <ChatContent />
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full ${getTypeColor()} hover:opacity-90 transition-all duration-300 shadow-lg`}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {trigger && (
        <Dialog>
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>{getTypeLabel()}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="h-96">
              <ChatContent />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};