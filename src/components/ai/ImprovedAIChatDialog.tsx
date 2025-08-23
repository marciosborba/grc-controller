import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Brain,
  Send,
  Loader2,
  MessageCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  Shield,
  TrendingUp,
  AlertTriangle,
  FileText,
  Settings,
  Maximize2,
  Minimize2,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AIRiskRegistrationWizard } from './AIRiskRegistrationWizard';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  feedback?: 'positive' | 'negative' | null;
}

interface AIChatDialogProps {
  type?: 'general' | 'assessment' | 'risk' | 'audit' | 'policy' | 'compliance' | 'privacy' | 'incident' | 'vendor' | 'ethics';
  context?: any;
  trigger?: React.ReactNode;
  title?: string;
}

export const ImprovedAIChatDialog: React.FC<AIChatDialogProps> = ({
  type = 'risk',
  context,
  trigger,
  title
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showRiskWizard, setShowRiskWizard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAssistantInfo = useCallback((assistantType: string) => {
    const assistants = {
      general: {
        name: 'ALEX RISK',
        title: 'Especialista em Gestão de Riscos',
        avatar: '🛡️',
        color: 'bg-red-500',
        description: 'Seu assistente especializado em gestão de riscos corporativos',
        welcome: 'Olá! Sou ALEX RISK, seu especialista em gestão de riscos corporativos. Posso ajudar com identificação, análise, avaliação e mitigação de riscos. Como posso ajudá-lo hoje?'
      },
      risk: {
        name: 'ALEX RISK',
        title: 'Especialista em Gestão de Riscos',
        avatar: '🛡️',
        color: 'bg-red-500',
        description: 'Especialista em identificação, análise e mitigação de riscos',
        welcome: 'Olá! Sou ALEX RISK, seu especialista em gestão de riscos corporativos. Posso ajudar com identificação, análise, avaliação e mitigação de riscos. Como posso ajudá-lo hoje?'
      },
      compliance: {
        name: 'ALEX COMPLIANCE',
        title: 'Especialista em Conformidade',
        avatar: '⚖️',
        color: 'bg-orange-500',
        description: 'Especialista em conformidade regulatória e frameworks',
        welcome: 'Olá! Sou ALEX COMPLIANCE, especialista em conformidade regulatória. Posso ajudar com frameworks regulatórios e controles de compliance.'
      },
      audit: {
        name: 'ALEX AUDIT',
        title: 'Especialista em Auditoria',
        avatar: '🔍',
        color: 'bg-green-500',
        description: 'Especialista em auditoria Big Four e IA',
        welcome: 'Olá! Sou ALEX AUDIT, especialista em auditoria Big Four e IA. Posso ajudar com planejamento de auditorias e procedimentos de teste.'
      },
      policy: {
        name: 'ALEX POLICY',
        title: 'Especialista em Políticas',
        avatar: '📋',
        color: 'bg-indigo-500',
        description: 'Especialista em políticas e procedimentos corporativos',
        welcome: 'Olá! Sou ALEX POLICY, especialista em políticas corporativas. Posso ajudar a criar políticas estruturadas e documentação de governança.'
      },
      assessment: {
        name: 'ALEX ASSESSMENT',
        title: 'Especialista em Avaliações',
        avatar: '📊',
        color: 'bg-purple-500',
        description: 'Especialista em assessments e avaliações de maturidade',
        welcome: 'Olá! Sou ALEX ASSESSMENT, especialista em assessments e avaliações de maturidade. Posso ajudar com metodologias de avaliação e frameworks.'
      },
      privacy: {
        name: 'ALEX PRIVACY',
        title: 'Especialista em Privacidade',
        avatar: '🔒',
        color: 'bg-blue-500',
        description: 'Especialista em privacidade de dados e LGPD',
        welcome: 'Olá! Sou ALEX PRIVACY, especialista em privacidade de dados e LGPD. Posso ajudar com questões de proteção de dados.'
      },
      incident: {
        name: 'ALEX INCIDENT',
        title: 'Especialista em Incidentes',
        avatar: '🚨',
        color: 'bg-yellow-500',
        description: 'Especialista em gestão de incidentes',
        welcome: 'Olá! Sou ALEX INCIDENT, especialista em gestão de incidentes. Posso ajudar com resposta a incidentes e planos de continuidade.'
      },
      vendor: {
        name: 'ALEX VENDOR',
        title: 'Especialista em Fornecedores',
        avatar: '🤝',
        color: 'bg-teal-500',
        description: 'Especialista em riscos de fornecedores e IA',
        welcome: 'Olá! Sou ALEX VENDOR, especialista em riscos de fornecedores e IA. Posso ajudar com avaliação e gestão de terceiros.'
      },
      ethics: {
        name: 'ALEX ETHICS',
        title: 'Especialista em Ética',
        avatar: '⚖️',
        color: 'bg-pink-500',
        description: 'Especialista em ética e ouvidoria corporativa',
        welcome: 'Olá! Sou ALEX ETHICS, especialista em ética e ouvidoria corporativa. Posso ajudar com questões éticas e compliance comportamental.'
      }
    };
    return assistants[assistantType] || assistants.risk;
  }, []);

  const assistant = getAssistantInfo(type);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: assistant.welcome,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, assistant.welcome, messages.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: 'Texto copiado para a área de transferência.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o texto.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const provideFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
    
    toast({
      title: 'Feedback enviado',
      description: `Obrigado pelo seu feedback ${feedback === 'positive' ? 'positivo' : 'negativo'}!`,
    });
  }, [toast]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.type !== 'user') return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-glm', {
        body: {
          prompt: userMessage.content,
          type,
          context
        }
      });

      if (error) throw error;
      if (!data || !data.response) throw new Error('Resposta inválida da IA');

      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = newMessage;
        return newMessages;
      });
    } catch (error) {
      console.error('Erro ao regenerar resposta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível regenerar a resposta.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, type, context, toast]);

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

    // Adicionar indicador de digitação
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-glm', {
        body: {
          prompt: messageToSend,
          type,
          context
        }
      });

      if (error) throw error;
      if (!data || !data.response) throw new Error('Resposta inválida da IA');

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      // Remover indicador de digitação e adicionar resposta
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, assistantMessage];
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'assistant',
        content: 'Desculpe, estou com problemas técnicos no momento. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };

      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, errorMessage];
      });
      
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
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

  const quickPrompts = [
    { 
      icon: Plus, 
      text: 'Registro de Risco com IA', 
      prompt: 'Ajude-me a registrar um novo risco usando IA. Preciso preencher automaticamente os campos de título, descrição, categoria, probabilidade, impacto e controles mitigadores.',
      action: 'wizard'
    },
    { icon: AlertTriangle, text: 'Identificação de riscos', prompt: 'Quais são as principais metodologias para identificação de riscos corporativos?' },
    { icon: Shield, text: 'Matriz de riscos', prompt: 'Como criar uma matriz de riscos eficaz?' },
    { icon: FileText, text: 'Relatório de riscos', prompt: 'Como estruturar um relatório executivo de gestão de riscos?' }
  ];

  const handleQuickPrompt = useCallback((prompt: any) => {
    if (prompt.action === 'wizard') {
      setShowRiskWizard(true);
    } else {
      setInputValue(prompt.prompt || prompt);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, []);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2 hover:bg-primary/5 transition-colors">
            <div className={cn("p-1 rounded-full", assistant.color)}>
              <Brain className="h-3 w-3 text-white" />
            </div>
            <span>Chat com {assistant.name}</span>
            <Badge variant="secondary" className="text-xs">
              IA
            </Badge>
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className={cn(
        "flex flex-col transition-all duration-300",
        isMaximized ? "max-w-7xl max-h-[95vh]" : "max-w-4xl max-h-[85vh]"
      )}>
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className={cn("h-10 w-10", assistant.color)}>
                <AvatarFallback className="text-white font-bold">
                  {assistant.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {assistant.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {assistant.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                <Sparkles className="h-3 w-3 mr-1" />
                GLM 4.5
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="h-8 w-8 p-0"
                    >
                      {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMaximized ? 'Minimizar' : 'Maximizar'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className={cn(
              "flex-1 p-4",
              isMaximized ? "h-[calc(95vh-200px)]" : "h-[calc(85vh-200px)]"
            )}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] group",
                      message.type === 'user' ? 'order-2' : 'order-1'
                    )}>
                      {message.type === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className={cn("text-xs text-white", assistant.color)}>
                              {assistant.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-muted-foreground">
                            {assistant.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      
                      <div className={cn(
                        "p-4 rounded-2xl shadow-sm",
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-muted/50 border mr-4'
                      )}>
                        {message.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              {assistant.name} está digitando...
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                            
                            {message.type === 'user' && (
                              <p className="text-xs opacity-70 mt-2">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Message Actions */}
                      {message.type === 'assistant' && !message.isTyping && (
                        <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.content)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copiar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => provideFeedback(message.id, 'positive')}
                                  className={cn(
                                    "h-7 w-7 p-0",
                                    message.feedback === 'positive' && "bg-green-100 text-green-600"
                                  )}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Útil</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => provideFeedback(message.id, 'negative')}
                                  className={cn(
                                    "h-7 w-7 p-0",
                                    message.feedback === 'negative' && "bg-red-100 text-red-600"
                                  )}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Não útil</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => regenerateResponse(message.id)}
                                  className="h-7 w-7 p-0"
                                  disabled={isLoading}
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Regenerar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="p-4 border-t bg-muted/20">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Sugestões rápidas:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <prompt.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-xs">{prompt.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Pergunte ao ${assistant.name}...`}
                    disabled={isLoading}
                    className="pr-12 min-h-[44px] resize-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs text-muted-foreground">
                      {inputValue.length}/2000
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !inputValue.trim()}
                  className={cn("min-w-[44px] h-[44px]", assistant.color)}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Pressione Enter para enviar • Shift+Enter para nova linha
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Risk Registration Wizard */}
    {showRiskWizard && (
      <AIRiskRegistrationWizard
        trigger={<div />}
        onClose={() => setShowRiskWizard(false)}
        onComplete={(riskData) => {
          setShowRiskWizard(false);
          toast({
            title: 'Risco Registrado com Sucesso',
            description: `O risco "${riskData.title}" foi registrado e está sendo monitorado.`,
          });
          
          // Adicionar mensagem no chat confirmando o registro
          const confirmationMessage = {
            id: Date.now().toString(),
            type: 'assistant' as const,
            content: `✅ **Risco Registrado com Sucesso!**\n\n**Título:** ${riskData.title}\n**Categoria:** ${riskData.category}\n**Nível:** ${riskData.risk_level}\n**Responsável:** ${riskData.responsible_person}\n\nO risco foi registrado no sistema e está sendo monitorado. Você pode acompanhar o progresso na seção de Gestão de Riscos.`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
        }}
      />
    )}
    </>
  );
};