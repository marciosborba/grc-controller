import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatDialogProps {
  type?: 'general' | 'assessment' | 'risk' | 'audit' | 'policy' | 'compliance';
  context?: any;
  trigger?: React.ReactNode;
  title?: string;
}

export const AIChatDialog: React.FC<AIChatDialogProps> = ({
  type = 'general',
  context,
  trigger,
  title
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getWelcomeMessage = useCallback((assistantType: string) => {
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
    return welcomeMessages[assistantType] || welcomeMessages.general;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Enviando mensagem para IA

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-glm', {
        body: {
          prompt: messageToSend,
          type,
          context
        }
      });

      // Resposta da IA recebida

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
      console.error('Erro ao enviar mensagem para IA (Dialog):', error);

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Desculpe, estou com problemas técnicos no momento. Verifique se o provedor de IA está configurado corretamente.',
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

  const getTypeLabel = () => {
    const labels = {
      general: 'Assistente Geral',
      assessment: 'Assessment',
      risk: 'Gestão de Riscos',
      audit: 'Auditoria',
      policy: 'Políticas',
      compliance: 'Compliance'
    };
    return title || labels[type] || 'Assistente IA';
  };

  const getTypeColor = () => {
    const colors = {
      general: 'bg-blue-500',
      assessment: 'bg-purple-500',
      risk: 'bg-red-500',
      audit: 'bg-green-500',
      policy: 'bg-indigo-500',
      compliance: 'bg-orange-500'
    };
    return colors[type] || 'bg-blue-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat com IA</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full ${getTypeColor()}`}>
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span>{getTypeLabel()}</span>
            <Badge variant="outline" className="text-xs">
              Assistente IA - GLM 4.5
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-96">
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
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

          <div className="mt-4 flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
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
      </DialogContent>
    </Dialog>
  );
};