import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot,
  Send,
  Brain,
  Sparkles,
  MessageSquare,
  FileText,
  Target,
  Eye,
  Zap,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Share,
  Star,
  Database,
  Search,
  Filter,
  Calendar,
  Tag,
  Bookmark
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  session_type?: string;
  confidence?: number;
  context?: any;
  actions?: ChatAction[];
  metadata?: any;
}

interface ChatAction {
  type: 'generate_procedure' | 'analyze_finding' | 'create_workpaper' | 'suggest_control' | 'export_response' | 'schedule_followup';
  label: string;
  data?: any;
}

interface AlexSession {
  id: string;
  title: string;
  session_type: 'Planning' | 'Risk Assessment' | 'Procedure Generation' | 'Finding Analysis' | 'Report Writing' | 'Quality Review' | 'General Consultation';
  messages: ChatMessage[];
  created_at: string;
  audit_id?: string;
  status: 'Active' | 'Completed' | 'Archived';
  tags: string[];
  summary?: string;
}

interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'Planning' | 'Execution' | 'Reporting' | 'Analysis' | 'Controls';
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  estimated_time: number; // minutes
}

interface AICapability {
  name: string;
  description: string;
  icon: React.ElementType;
  examples: string[];
  confidence: number;
}

const AlexAuditAI: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  
  const [sessions, setSessions] = useState<AlexSession[]>([]);
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data initialization
  useEffect(() => {
    const mockSessions: AlexSession[] = [
      {
        id: '1',
        title: 'Planejamento de Auditoria SOX',
        session_type: 'Planning',
        created_at: '2025-01-20T10:00:00Z',
        audit_id: 'AUD-2025-0001',
        status: 'Active',
        tags: ['SOX', 'Planejamento', 'Controles Internos'],
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Preciso de ajuda para planejar uma auditoria SOX 404 para o processo de contas a receber. Qual seria a abordagem recomendada?',
            timestamp: '2025-01-20T10:00:00Z'
          },
          {
            id: '2',
            role: 'assistant',
            content: `Excelente! Para uma auditoria SOX 404 do processo de contas a receber, recomendo a seguinte abordagem estruturada:

## 🎯 ESCOPO E OBJETIVOS

**Objetivo Principal:** Avaliar a efetividade dos controles internos sobre relatórios financeiros (ICFR) no ciclo de receita

**Componentes-Chave:**
• Reconhecimento de receita (ASC 606)
• Provisão para devedores duvidosos
• Segregação de funções
• Controles de autorização
• Reconciliações e revisões

## 📋 ABORDAGEM METODOLÓGICA

**1. Walkthrough dos Processos**
- Mapeamento do fluxo end-to-end
- Identificação de pontos de controle
- Documentação de sistemas utilizados

**2. Avaliação de Desenho**
- Revisão de políticas e procedimentos
- Análise de matriz RACI
- Verificação de segregação de funções

**3. Teste de Efetividade Operacional**
- Amostragem estatística (recomendo n=25-40)
- Teste de controles preventivos e detectivos
- Validação de exceções

## ⚠️ RISCOS PRINCIPAIS A FOCAR

• **Alto Risco:** Reconhecimento inadequado de receita
• **Médio-Alto:** Provisões incorretas para inadimplência
• **Médio:** Falhas na segregação de funções
• **Baixo-Médio:** Reconciliações não tempestivas

## 📊 RECURSOS RECOMENDADOS

**Equipe:** 2-3 auditores sêniores + 1 especialista em TI
**Duração:** 4-6 semanas
**Ferramentas:** ACL/IDEA para análise de dados, TeamMate para documentação

Quer que eu detalhe algum aspecto específico ou desenvolva procedimentos para alguma área?`,
            timestamp: '2025-01-20T10:02:00Z',
            confidence: 95,
            session_type: 'Planning',
            actions: [
              {
                type: 'generate_procedure',
                label: 'Gerar Procedimentos Detalhados',
                data: { process: 'accounts_receivable', framework: 'SOX' }
              },
              {
                type: 'create_workpaper',
                label: 'Criar Template de Papel de Trabalho',
                data: { template_type: 'walkthrough' }
              }
            ]
          }
        ]
      },
      {
        id: '2',
        title: 'Análise de Achados Críticos',
        session_type: 'Finding Analysis',
        created_at: '2025-01-19T15:30:00Z',
        audit_id: 'AUD-2025-0001',
        status: 'Completed',
        tags: ['Achados', 'Análise', 'Controles'],
        summary: 'Análise de 3 achados críticos relacionados a segregação de funções e controles de acesso.',
        messages: []
      }
    ];

    const mockQuickPrompts: QuickPrompt[] = [
      {
        id: '1',
        title: 'Gerar Programa de Auditoria',
        description: 'Crie um programa de auditoria completo baseado no processo e riscos',
        prompt: 'Gere um programa de auditoria detalhado para [PROCESSO] considerando os riscos [RISCOS] e framework [FRAMEWORK]. Inclua objetivos, procedimentos e critérios de amostragem.',
        category: 'Planning',
        complexity: 'Intermediate',
        estimated_time: 5
      },
      {
        id: '2',
        title: 'Análise de Root Cause',
        description: 'Analise as causas raiz de achados identificados',
        prompt: 'Analise as possíveis causas raiz do seguinte achado: [ACHADO]. Considere fatores de processo, pessoas, tecnologia e ambiente de controle.',
        category: 'Analysis',
        complexity: 'Advanced',
        estimated_time: 8
      },
      {
        id: '3',
        title: 'Sugestão de Controles',
        description: 'Sugira controles para mitigar riscos identificados',
        prompt: 'Baseado no risco [RISCO], sugira controles preventivos e detectivos efetivos. Inclua frequência, responsável e indicadores de efetividade.',
        category: 'Controls',
        complexity: 'Intermediate',
        estimated_time: 6
      },
      {
        id: '4',
        title: 'Revisão de Conformidade',
        description: 'Verifique conformidade com frameworks regulatórios',
        prompt: 'Revise a conformidade do processo [PROCESSO] com os requisitos [FRAMEWORK]. Identifique gaps e recomende ações corretivas.',
        category: 'Analysis',
        complexity: 'Advanced',
        estimated_time: 10
      },
      {
        id: '5',
        title: 'Template de Relatório',
        description: 'Gere template de relatório de auditoria',
        prompt: 'Crie um template de relatório para auditoria [TIPO] incluindo seções para resumo executivo, achados, recomendações e cronograma de implementação.',
        category: 'Reporting',
        complexity: 'Basic',
        estimated_time: 4
      }
    ];

    setSessions(mockSessions);
    setQuickPrompts(mockQuickPrompts);
    
    // Set first session as current
    if (mockSessions.length > 0) {
      setCurrentSession(mockSessions[0].id);
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSession]);

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message
    setSessions(prev => prev.map(session => 
      session.id === currentSession 
        ? { ...session, messages: [...session.messages, newMessage] }
        : session
    ));

    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(newMessage.content);
      
      setSessions(prev => prev.map(session => 
        session.id === currentSession 
          ? { ...session, messages: [...session.messages, aiResponse] }
          : session
      ));
      
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    // Simulate AI processing and response generation
    const responses = [
      {
        content: `Baseado na sua consulta, posso sugerir uma abordagem estruturada. 

## 🔍 ANÁLISE INICIAL

Identifico que você está focando em [tópico específico]. Para isso, recomendo:

**1. Avaliação Preliminar**
- Mapeamento dos controles existentes
- Identificação de gaps críticos
- Análise de risco x impacto

**2. Teste Detalhado**
- Seleção de amostra representativa
- Execução de procedimentos substantivos
- Documentação de exceções

**3. Conclusões e Recomendações**
- Avaliação da efetividade geral
- Priorização de recomendações por risco
- Timeline de implementação

## 💡 SUGESTÕES ADICIONAIS

• Considere usar analytics de dados para maior cobertura
• Implemente controles automatizados onde possível
• Mantenha foco na materialidade e risco

Quer que eu detalhe algum aspecto específico?`,
        confidence: 89,
        actions: [
          {
            type: 'generate_procedure',
            label: 'Gerar Procedimentos',
          },
          {
            type: 'suggest_control',
            label: 'Sugerir Controles',
          }
        ]
      }
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
      confidence: response.confidence,
      actions: response.actions
    };
  };

  const executeAction = (action: ChatAction) => {
    switch (action.type) {
      case 'generate_procedure':
        toast({
          title: 'Gerando Procedimentos',
          description: 'Procedimentos detalhados serão criados automaticamente.',
        });
        break;
      case 'create_workpaper':
        toast({
          title: 'Criando Papel de Trabalho',
          description: 'Template será gerado e adicionado aos seus documentos.',
        });
        break;
      case 'suggest_control':
        toast({
          title: 'Sugerindo Controles',
          description: 'Controles recomendados serão listados baseados no contexto.',
        });
        break;
      default:
        toast({
          title: 'Ação Executada',
          description: 'A ação foi processada com sucesso.',
        });
    }
  };

  const createNewSession = (type: AlexSession['session_type']) => {
    const newSession: AlexSession = {
      id: Date.now().toString(),
      title: `Nova Sessão - ${type}`,
      session_type: type,
      created_at: new Date().toISOString(),
      status: 'Active',
      tags: [],
      messages: [{
        id: '1',
        role: 'assistant',
        content: `Olá! Sou o Alex Audit, seu assistente especialista em auditoria. 

Vou ajudá-lo com **${type}** usando metodologias Big Four e melhores práticas internacionais.

## 🎯 Como posso ajudar:

• **Planejamento:** Escopo, cronograma, recursos e metodologia
• **Avaliação de Risco:** Identificação e priorização de riscos críticos  
• **Procedimentos:** Geração de testes detalhados e específicos
• **Análise:** Interpretação de achados e root cause analysis
• **Relatórios:** Templates e conteúdo automatizado
• **Qualidade:** Revisão e melhoria contínua

**Digite sua pergunta ou use um dos prompts rápidos para começar!**`,
        timestamp: new Date().toISOString(),
        confidence: 100
      }]
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession.id);
  };

  const useQuickPrompt = (prompt: QuickPrompt) => {
    setMessage(prompt.prompt);
    inputRef.current?.focus();
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    useQuickPrompt(prompt);
  };

  const rateMessage = (messageId: string, rating: 'positive' | 'negative') => {
    toast({
      title: 'Feedback Registrado',
      description: 'Obrigado pelo seu feedback! Isso nos ajuda a melhorar.',
    });
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copiado',
      description: 'Mensagem copiada para a área de transferência.',
    });
  };

  const currentSessionData = sessions.find(s => s.id === currentSession);

  const aiCapabilities: AICapability[] = [
    {
      name: 'Planejamento Inteligente',
      description: 'Geração automática de planos de auditoria baseados em risco',
      icon: Target,
      examples: ['Escopo de auditoria SOX', 'Cronograma de fieldwork', 'Alocação de recursos'],
      confidence: 95
    },
    {
      name: 'Análise de Riscos',
      description: 'Identificação e priorização de riscos com IA',
      icon: TrendingUp,
      examples: ['Risk assessment', 'Materiality calculation', 'Control gaps'],
      confidence: 92
    },
    {
      name: 'Geração de Procedimentos',
      description: 'Criação automática de procedimentos de auditoria',
      icon: FileText,
      examples: ['Test plans', 'Sampling methodology', 'Control testing'],
      confidence: 89
    },
    {
      name: 'Análise de Achados',
      description: 'Root cause analysis e recommendations',
      icon: Eye,
      examples: ['Finding categorization', 'Impact assessment', 'Remediation plans'],
      confidence: 94
    }
  ];

  const filteredPrompts = quickPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || prompt.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <span>Alex Audit IA</span>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Big Four
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Assistente de IA especialista em auditoria com metodologias Big Four
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
            <Label className="text-sm">Voz</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoSuggestions}
              onCheckedChange={setAutoSuggestions}
            />
            <Label className="text-sm">Sugestões</Label>
          </div>
          
          <Select onValueChange={(value) => createNewSession(value as AlexSession['session_type'])}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Nova Sessão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planejamento</SelectItem>
              <SelectItem value="Risk Assessment">Avaliação de Risco</SelectItem>
              <SelectItem value="Procedure Generation">Geração de Procedimentos</SelectItem>
              <SelectItem value="Finding Analysis">Análise de Achados</SelectItem>
              <SelectItem value="Report Writing">Escrita de Relatórios</SelectItem>
              <SelectItem value="Quality Review">Revisão de Qualidade</SelectItem>
              <SelectItem value="General Consultation">Consulta Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-4 w-full">
          <TabsTrigger value="chat">Chat Inteligente</TabsTrigger>
          <TabsTrigger value="prompts">Prompts Rápidos</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="capabilities">Capacidades</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        {currentSessionData?.title || 'Selecione uma sessão'}
                      </CardTitle>
                      {currentSessionData && (
                        <CardDescription>
                          {currentSessionData.session_type} • {currentSessionData.messages.length} mensagens
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {voiceEnabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsListening(!isListening)}
                          className={isListening ? 'bg-red-50 text-red-600' : ''}
                        >
                          {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-4">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {currentSessionData?.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-3",
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          </div>
                          
                          {msg.role === 'assistant' && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {msg.confidence && (
                                    <Badge variant="outline" className="text-xs">
                                      {msg.confidence}% confiança
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyMessage(msg.content)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => rateMessage(msg.id, 'positive')}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => rateMessage(msg.id, 'negative')}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {msg.actions && msg.actions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {msg.actions.map((action, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => executeAction(action)}
                                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                                    >
                                      <Zap className="h-3 w-3 mr-1" />
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                            <span className="text-sm text-gray-600">Alex está digitando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Digite sua pergunta sobre auditoria..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={!currentSession || isTyping}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!message.trim() || !currentSession || isTyping}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Session List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sessões Ativas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "p-2 rounded-lg cursor-pointer border transition-colors",
                        currentSession === session.id
                          ? "bg-primary/10 border-primary/20"
                          : "bg-muted/50 border-border hover:bg-muted"
                      )}
                      onClick={() => setCurrentSession(session.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{session.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {session.session_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.messages.length} mensagens • {session.status}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setMessage('Gere um programa de auditoria para avaliação de controles internos SOX')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Programa de Auditoria
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setMessage('Analise os riscos críticos do processo de contas a receber')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Análise de Riscos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setMessage('Sugira controles para mitigar o risco de reconhecimento inadequado de receita')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Sugerir Controles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setMessage('Crie template de relatório de auditoria interna')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Template Relatório
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar prompts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    <SelectItem value="Planning">Planejamento</SelectItem>
                    <SelectItem value="Execution">Execução</SelectItem>
                    <SelectItem value="Reporting">Relatórios</SelectItem>
                    <SelectItem value="Analysis">Análise</SelectItem>
                    <SelectItem value="Controls">Controles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {prompt.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={
                      prompt.complexity === 'Basic' ? 'border-green-200 text-green-700' :
                      prompt.complexity === 'Intermediate' ? 'border-yellow-200 text-yellow-700' :
                      'border-red-200 text-red-700'
                    }>
                      {prompt.complexity}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
                    {prompt.prompt.substring(0, 100)}...
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{prompt.category}</Badge>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{prompt.estimated_time}min</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      Usar Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {session.session_type}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        session.status === 'Active' ? 'border-green-200 text-green-700 bg-green-50' :
                        session.status === 'Completed' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                        'border-gray-200 text-gray-700 bg-gray-50'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {session.summary && (
                    <p className="text-sm text-gray-600">{session.summary}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{session.messages.length} mensagens</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(session.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {session.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSession(session.id)}
                    >
                      Abrir Sessão
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiCapabilities.map((capability, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100">
                      <capability.icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{capability.name}</CardTitle>
                      <CardDescription>{capability.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Confiança:</span>
                      <span className="font-medium">{capability.confidence}%</span>
                    </div>
                    <Progress value={capability.confidence} className="h-2" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Exemplos de Uso:</p>
                    <ul className="space-y-1">
                      {capability.examples.map((example, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlexAuditAI;