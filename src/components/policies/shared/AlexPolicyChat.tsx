import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Send,
  Lightbulb,
  FileText,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'alex';
  content: string;
  timestamp: Date;
  suggestions?: Array<{
    id: string;
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface AlexPolicyChatProps {
  policyId?: string;
  policyTitle?: string;
  mode: 'elaboration' | 'review' | 'approval' | 'publication' | 'lifecycle' | 'analytics';
  onApplySuggestion?: (suggestion: any) => void;
  className?: string;
}

const AlexPolicyChat: React.FC<AlexPolicyChatProps> = ({
  policyId,
  policyTitle,
  mode,
  onApplySuggestion,
  className
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar com mensagem de boas-vindas baseada no modo
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([{
      id: '1',
      type: 'alex',
      content: welcomeMessage.content,
      timestamp: new Date(),
      suggestions: welcomeMessage.suggestions
    }]);
  }, [mode, policyTitle]);

  const getWelcomeMessage = () => {
    switch (mode) {
      case 'elaboration':
        return {
          content: `Olá! Sou Alex Policy, seu assistente de IA para gestão de políticas. ${policyTitle ? `Vejo que você está trabalhando na política "${policyTitle}".` : 'Estou aqui para ajudar na elaboração de políticas.'} Como posso ajudar hoje?`,
          suggestions: [
            {
              id: 'suggest-structure',
              title: 'Sugerir estrutura',
              description: 'Receber sugestões de estrutura para a política',
              action: 'suggest_structure',
              priority: 'high' as const
            },
            {
              id: 'check-compliance',
              title: 'Verificar conformidade',
              description: 'Analisar conformidade com regulamentações',
              action: 'check_compliance',
              priority: 'medium' as const
            },
            {
              id: 'improve-language',
              title: 'Melhorar linguagem',
              description: 'Sugestões para clareza e precisão',
              action: 'improve_language',
              priority: 'medium' as const
            }
          ]
        };
      case 'review':
        return {
          content: `Pronto para revisar ${policyTitle ? `"${policyTitle}"` : 'esta política'}! Posso ajudar identificando inconsistências, gaps de conformidade e sugerindo melhorias.`,
          suggestions: [
            {
              id: 'deep-review',
              title: 'Revisão profunda',
              description: 'Análise completa da política',
              action: 'deep_review',
              priority: 'high' as const
            },
            {
              id: 'check-gaps',
              title: 'Identificar gaps',
              description: 'Encontrar lacunas e inconsistências',
              action: 'check_gaps',
              priority: 'high' as const
            }
          ]
        };
      case 'approval':
        return {
          content: `Analisando ${policyTitle ? `"${policyTitle}"` : 'esta política'} para aprovação. Posso verificar critérios de aprovação e identificar possíveis bloqueadores.`,
          suggestions: [
            {
              id: 'approval-checklist',
              title: 'Checklist de aprovação',
              description: 'Verificar todos os critérios necessários',
              action: 'approval_checklist',
              priority: 'high' as const
            }
          ]
        };
      default:
        return {
          content: `Olá! Sou Alex Policy. Como posso ajudar com ${policyTitle ? `"${policyTitle}"` : 'suas políticas'} hoje?`,
          suggestions: []
        };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simular resposta da IA (em produção, seria uma chamada real para a API)
    setTimeout(() => {
      const alexResponse = generateAlexResponse(inputValue, mode);
      setMessages(prev => [...prev, alexResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAlexResponse = (userInput: string, currentMode: string): Message => {
    const responses = {
      elaboration: [
        {
          content: "Baseado na sua solicitação, aqui estão algumas sugestões para melhorar a estrutura da política:",
          suggestions: [
            {
              id: 'add-purpose',
              title: 'Adicionar seção de propósito',
              description: 'Incluir uma seção clara sobre o propósito e objetivos da política',
              action: 'add_purpose_section',
              priority: 'high' as const
            },
            {
              id: 'define-scope',
              title: 'Definir escopo',
              description: 'Especificar claramente o escopo de aplicação da política',
              action: 'define_scope',
              priority: 'high' as const
            }
          ]
        },
        {
          content: "Analisei o conteúdo e identifiquei oportunidades de melhoria na linguagem e clareza:",
          suggestions: [
            {
              id: 'simplify-language',
              title: 'Simplificar linguagem',
              description: 'Tornar o texto mais acessível e claro',
              action: 'simplify_language',
              priority: 'medium' as const
            }
          ]
        }
      ],
      review: [
        {
          content: "Completei a análise da política. Encontrei alguns pontos que precisam de atenção:",
          suggestions: [
            {
              id: 'fix-inconsistency',
              title: 'Corrigir inconsistência',
              description: 'Há uma inconsistência entre as seções 2.1 e 3.4',
              action: 'fix_inconsistency',
              priority: 'high' as const
            },
            {
              id: 'update-references',
              title: 'Atualizar referências',
              description: 'Algumas referências regulatórias estão desatualizadas',
              action: 'update_references',
              priority: 'medium' as const
            }
          ]
        }
      ],
      approval: [
        {
          content: "Verifiquei os critérios de aprovação. A política está quase pronta, mas há alguns itens pendentes:",
          suggestions: [
            {
              id: 'add-approval-matrix',
              title: 'Matriz de aprovação',
              description: 'Adicionar matriz de aprovação conforme governança',
              action: 'add_approval_matrix',
              priority: 'high' as const
            }
          ]
        }
      ]
    };

    const modeResponses = responses[currentMode as keyof typeof responses] || responses.elaboration;
    const randomResponse = modeResponses[Math.floor(Math.random() * modeResponses.length)];

    return {
      id: Date.now().toString(),
      type: 'alex',
      content: randomResponse.content,
      timestamp: new Date(),
      suggestions: randomResponse.suggestions
    };
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
    
    // Adicionar mensagem confirmando a aplicação
    const confirmMessage: Message = {
      id: Date.now().toString(),
      type: 'alex',
      content: `✅ Sugestão "${suggestion.title}" aplicada com sucesso! Posso ajudar com mais alguma coisa?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmMessage]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return Target;
      case 'low': return CheckCircle;
      default: return Lightbulb;
    }
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Alex Policy</span>
              <div className="flex items-center space-x-1 mt-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Assistente IA para Políticas</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {mode === 'elaboration' ? 'Elaboração' :
             mode === 'review' ? 'Revisão' :
             mode === 'approval' ? 'Aprovação' :
             mode === 'publication' ? 'Publicação' :
             mode === 'lifecycle' ? 'Ciclo de Vida' : 'Analytics'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'alex' && (
                      <Brain className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Sugestões:
                          </div>
                          {message.suggestions.map((suggestion) => {
                            const PriorityIcon = getPriorityIcon(suggestion.priority);
                            return (
                              <div
                                key={suggestion.id}
                                className={`p-2 rounded-md border ${getPriorityColor(suggestion.priority)} cursor-pointer hover:opacity-80 transition-opacity`}
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <PriorityIcon className="h-3 w-3" />
                                  <span className="text-xs font-medium">{suggestion.title}</span>
                                </div>
                                <p className="text-xs opacity-80">{suggestion.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pergunte ao Alex sobre políticas..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputValue.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => setInputValue("Como melhorar esta política?")}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Melhorar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => setInputValue("Verificar conformidade regulatória")}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Conformidade
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => setInputValue("Sugerir estrutura padrão")}
            >
              <FileText className="h-3 w-3 mr-1" />
              Estrutura
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlexPolicyChat;