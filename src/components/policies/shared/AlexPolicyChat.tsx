import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Send,
  Minimize2,
  Maximize2,
  X,
  Bot,
  User,
  Lightbulb,
  FileText,
  CheckCircle,
  AlertTriangle,
  Zap,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AlexPolicyConfig } from '@/types/policy-management';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: MessageAction[];
}

interface MessageAction {
  id: string;
  label: string;
  type: 'generate' | 'analyze' | 'improve' | 'template';
  data?: any;
}

interface AlexPolicyChatProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  config: AlexPolicyConfig;
  context?: {
    module: string;
    tenant_id?: string;
    current_view?: string;
    policy_id?: string;
    policy_content?: string;
  };
}

export const AlexPolicyChat: React.FC<AlexPolicyChatProps> = ({
  isActive,
  onToggle,
  config,
  context
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar chat quando abrir
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ativar Alex Policy quando chat é aberto
  useEffect(() => {
    if (isOpen && !isActive) {
      onToggle(true);
    }
  }, [isOpen, isActive, onToggle]);

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: `Olá! Sou o Alex Policy, seu assistente especializado em gestão de políticas corporativas. 

Como posso ajudá-lo hoje? Posso auxiliar com:
• Elaboração e estruturação de políticas
• Análise de conformidade regulatória  
• Sugestões de melhorias
• Templates e melhores práticas
• Métricas e relatórios

Estou aqui para tornar sua gestão de políticas mais eficiente e eficaz!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simular resposta da IA (substituir por integração real)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Entendi sua pergunta sobre "${content}". 

Esta é uma resposta simulada do Alex Policy. Em uma implementação real, eu analisaria sua solicitação usando:

• Conhecimento especializado em políticas corporativas
• Base de dados de regulamentações atualizadas
• Melhores práticas do mercado
• Contexto específico da sua organização

Posso ajudar com mais alguma coisa relacionada a políticas?`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem para Alex Policy',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado',
        description: 'Texto copiado para a área de transferência',
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const getMessageIcon = (type: string) => {
    return type === 'user' ? User : Bot;
  };

  const getMessageBgColor = (type: string) => {
    return type === 'user' 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-muted text-foreground';
  };

  const formatMessage = (content: string) => {
    // Simples formatação de markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
      .replace(/\n/g, '<br />');
  };

  // Sugestões contextuais baseadas na view atual
  const getContextualSuggestions = () => {
    const baseUrl = context?.current_view || 'dashboard';
    
    switch (baseUrl) {
      case 'elaboration':
        return [
          'Como estruturar uma política de segurança?',
          'Gerar template para política de RH',
          'Quais seções são obrigatórias?',
          'Revisar conteúdo desta política'
        ];
      case 'review':
        return [
          'Analisar conformidade regulatória',
          'Verificar completude da política',
          'Sugerir melhorias no texto',
          'Comparar com melhores práticas'
        ];
      case 'approval':
        return [
          'Avaliar impacto organizacional',
          'Verificar matriz de aprovação',
          'Analisar riscos da implementação',
          'Sugerir cronograma de aprovação'
        ];
      default:
        return [
          'Como posso ajudar com políticas?',
          'Mostrar métricas de compliance',
          'Políticas próximas do vencimento',
          'Sugestões de melhoria'
        ];
    }
  };

  return (
    <>
      {/* Botão de Ativação */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="relative"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Alex Policy</span>
            {isActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <span>Alex Policy - Assistente Especializado</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  IA
                </Badge>
              </DialogTitle>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>{isActive ? 'Ativo e pronto para ajudar' : 'Em standby'}</span>
              {config.auto_suggestions && (
                <Badge variant="outline" className="text-xs">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Auto-sugestões
                </Badge>
              )}
            </div>
          </DialogHeader>

          {!isMinimized && (
            <div className="flex flex-col h-[500px]">
              {/* Área de Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const MessageIcon = getMessageIcon(message.type);
                    return (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <MessageIcon className="h-4 w-4" />
                        </div>
                        
                        <div className={`flex-1 space-y-2 ${
                          message.type === 'user' ? 'text-right' : ''
                        }`}>
                          <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            getMessageBgColor(message.type)
                          }`}>
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: formatMessage(message.content) 
                              }}
                            />
                          </div>
                          
                          {message.type === 'assistant' && (
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(message.content)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {isLoading && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Alex Policy está pensando...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Sugestões Contextuais */}
              {messages.length <= 1 && (
                <div className="p-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">Sugestões para começar:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {getContextualSuggestions().map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto p-2 text-left justify-start"
                        onClick={() => setInputValue(suggestion)}
                      >
                        <Lightbulb className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Área de Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta sobre políticas..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Pressione Enter para enviar</span>
                  <div className="flex items-center space-x-2">
                    <span>Confiança: {(config.confidence_threshold * 100).toFixed(0)}%</span>
                    <span>•</span>
                    <span>Idioma: {config.preferred_language}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlexPolicyChat;