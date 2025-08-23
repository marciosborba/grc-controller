import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain,
  Zap,
  Target,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  FileCheck,
  Shield,
  Lightbulb,
  MessageCircle,
  Send,
  Sparkles,
  Star,
  ArrowRight,
  Info,
  CheckCircle,
  Clock,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';

interface AlexVendorIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    activeTab?: string;
    dashboardMetrics?: any;
    riskDistribution?: any;
    searchTerm?: string;
    selectedFilter?: string;
    vendorData?: any;
    assessmentData?: any;
  };
}

interface AlexInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'optimization' | 'prediction' | 'analysis';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  actionable: boolean;
  confidence: number;
  impact: string;
  relatedData?: any;
}

export const AlexVendorIntegration: React.FC<AlexVendorIntegrationProps> = ({
  isOpen,
  onClose,
  context
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeInsightTab, setActiveInsightTab] = useState('insights');
  const [chatInput, setChatInput] = useState('');
  const [currentInsights, setCurrentInsights] = useState<AlexInsight[]>([]);

  // Initialize AI chat with vendor context
  const { messages, isLoading, sendMessage, initializeChat } = useAIChat({
    type: 'vendor',
    context: context
  });

  useEffect(() => {
    if (isOpen) {
      initializeChat();
      generateContextualInsights();
    }
  }, [isOpen, initializeChat, context]);

  // Generate contextual insights based on current context
  const generateContextualInsights = () => {
    const insights: AlexInsight[] = [];

    // Dashboard-specific insights
    if (context?.activeTab === 'dashboard' && context?.dashboardMetrics) {
      const metrics = context.dashboardMetrics;
      
      if (metrics.overdue_assessments > 0) {
        insights.push({
          id: 'overdue-assessments',
          type: 'alert',
          title: 'Assessments em Atraso',
          description: `${metrics.overdue_assessments} assessments estão vencidos e necessitam ação imediata.`,
          priority: 'high',
          category: 'Compliance',
          actionable: true,
          confidence: 95,
          impact: 'Alto risco de não conformidade regulatória'
        });
      }

      if (metrics.critical_vendors > 0) {
        insights.push({
          id: 'critical-vendors',
          type: 'recommendation',
          title: 'Fornecedores Críticos',
          description: `${metrics.critical_vendors} fornecedores classificados como críticos requerem monitoramento intensivo.`,
          priority: 'high',
          category: 'Gestão de Riscos',
          actionable: true,
          confidence: 90,
          impact: 'Mitigação de riscos operacionais críticos'
        });
      }

      if (metrics.expiring_contracts > 0) {
        insights.push({
          id: 'expiring-contracts',
          type: 'prediction',
          title: 'Contratos Expirando',
          description: `${metrics.expiring_contracts} contratos vencem nos próximos 90 dias. Planeje renovações ou substituições.`,
          priority: 'medium',
          category: 'Gestão Contratual',
          actionable: true,
          confidence: 100,
          impact: 'Evitar interrupções de serviço'
        });
      }
    }

    // Risk distribution insights
    if (context?.riskDistribution) {
      const riskDist = context.riskDistribution;
      const totalVendors = riskDist.low + riskDist.medium + riskDist.high + riskDist.critical;
      const highRiskPercentage = ((riskDist.high + riskDist.critical) / totalVendors) * 100;

      if (highRiskPercentage > 20) {
        insights.push({
          id: 'high-risk-concentration',
          type: 'analysis',
          title: 'Concentração de Alto Risco',
          description: `${highRiskPercentage.toFixed(1)}% dos fornecedores são de alto/crítico risco. Considere diversificar o portfólio.`,
          priority: 'medium',
          category: 'Análise de Portfólio',
          actionable: true,
          confidence: 85,
          impact: 'Redução do risco concentrado'
        });
      }

      if (riskDist.critical > 3) {
        insights.push({
          id: 'too-many-critical',
          type: 'alert',
          title: 'Muitos Fornecedores Críticos',
          description: `${riskDist.critical} fornecedores com risco crítico excedem o limite recomendado de 3.`,
          priority: 'critical',
          category: 'Gestão de Riscos',
          actionable: true,
          confidence: 95,
          impact: 'Exposição excessiva a riscos críticos'
        });
      }
    }

    // General optimization insights
    insights.push({
      id: 'automation-opportunity',
      type: 'optimization',
      title: 'Oportunidade de Automação',
      description: 'Detectei padrões que permitem automatizar 60% dos assessments de baixo risco.',
      priority: 'medium',
      category: 'Otimização',
      actionable: true,
      confidence: 78,
      impact: 'Redução de 40% no tempo de processamento'
    });

    insights.push({
      id: 'framework-recommendation',
      type: 'recommendation',
      title: 'Framework Personalizado',
      description: 'Baseado no perfil dos seus fornecedores, posso criar um framework híbrido ISO 27001 + SOC 2.',
      priority: 'low',
      category: 'Metodologia',
      actionable: true,
      confidence: 82,
      impact: 'Assessments 25% mais eficazes'
    });

    setCurrentInsights(insights);
  };

  // Handle chat submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    await sendMessage(chatInput);
    setChatInput('');
  };

  // Get insight icon and color based on type and priority
  const getInsightStyle = (insight: AlexInsight) => {
    const baseClasses = "w-4 h-4";
    
    switch (insight.type) {
      case 'recommendation':
        return {
          icon: <Lightbulb className={`${baseClasses} text-blue-600`} />,
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-900 dark:text-blue-100'
        };
      case 'alert':
        return {
          icon: <AlertTriangle className={`${baseClasses} text-red-600`} />,
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-900 dark:text-red-100'
        };
      case 'optimization':
        return {
          icon: <Zap className={`${baseClasses} text-yellow-600`} />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-900 dark:text-yellow-100'
        };
      case 'prediction':
        return {
          icon: <TrendingUp className={`${baseClasses} text-purple-600`} />,
          bgColor: 'bg-purple-50 dark:bg-purple-950',
          borderColor: 'border-purple-200 dark:border-purple-800',
          textColor: 'text-purple-900 dark:text-purple-100'
        };
      case 'analysis':
        return {
          icon: <BarChart3 className={`${baseClasses} text-green-600`} />,
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-900 dark:text-green-100'
        };
      default:
        return {
          icon: <Info className={`${baseClasses} text-gray-600`} />,
          bgColor: 'bg-gray-50 dark:bg-gray-950',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-900 dark:text-gray-100'
        };
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        sm:max-w-[900px] max-h-[90vh] p-0 gap-0 
        ${isMinimized ? 'sm:max-w-[400px] max-h-[200px]' : ''}
        transition-all duration-300
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">ALEX VENDOR</h2>
              <p className="text-sm opacity-90">Especialista em Gestão de Riscos de Fornecedores</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Context Banner */}
            {context && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900 dark:text-blue-100">
                      Contexto: {context.activeTab === 'dashboard' ? 'Dashboard Executivo' :
                                context.activeTab === 'table' ? 'Gestão de Fornecedores' :
                                context.activeTab === 'kanban' ? 'Assessments Kanban' :
                                context.activeTab === 'process' ? 'Processos e Workflows' : 'Sistema'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-100">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA Ativada
                  </Badge>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab} className="h-full">
                <div className="border-b bg-slate-50 dark:bg-slate-900 px-4">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent">
                    <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Insights
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat IA
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Ações
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Insights Tab */}
                <TabsContent value="insights" className="mt-0 h-[500px] p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {/* Summary */}
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                Análise Inteligente Ativa
                              </h3>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {currentInsights.length} insights identificados • {currentInsights.filter(i => i.actionable).length} ações recomendadas
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                {Math.round(currentInsights.reduce((acc, i) => acc + i.confidence, 0) / currentInsights.length) || 0}%
                              </div>
                              <div className="text-xs text-blue-700 dark:text-blue-300">Confiança média</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Insights List */}
                      <div className="space-y-3">
                        {currentInsights.map((insight) => {
                          const style = getInsightStyle(insight);
                          
                          return (
                            <Card key={insight.id} className={`border ${style.borderColor} ${style.bgColor}`}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                      <div className="mt-1">
                                        {style.icon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <h4 className={`font-semibold text-sm ${style.textColor}`}>
                                            {insight.title}
                                          </h4>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${getPriorityBadgeColor(insight.priority)}`}
                                          >
                                            {getPriorityText(insight.priority)}
                                          </Badge>
                                        </div>
                                        <p className={`text-sm ${style.textColor} opacity-90 mb-2`}>
                                          {insight.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-4">
                                            <span className={`text-xs ${style.textColor} opacity-75`}>
                                              {insight.category}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                              <Star className={`w-3 h-3 ${style.textColor.replace('text-', 'fill-').replace('dark:text-', 'dark:fill-')} opacity-75`} />
                                              <span className={`text-xs ${style.textColor} opacity-75`}>
                                                {insight.confidence}%
                                              </span>
                                            </div>
                                          </div>
                                          {insight.actionable && (
                                            <Button size="sm" variant="outline" className={`h-6 text-xs ${style.textColor} border-current`}>
                                              Aplicar
                                              <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {insight.impact && (
                                    <div className={`p-2 rounded-md ${style.bgColor} border ${style.borderColor} opacity-75`}>
                                      <div className="flex items-center space-x-2">
                                        <Target className={`w-3 h-3 ${style.textColor.split(' ')[0]}`} />
                                        <span className={`text-xs ${style.textColor} font-medium`}>
                                          Impacto: {insight.impact}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {currentInsights.length === 0 && (
                        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
                          <CardContent className="flex flex-col items-center justify-center py-8">
                            <Brain className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                              Analisando seus dados...
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-center">
                              ALEX VENDOR está processando suas informações para gerar insights personalizados.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat" className="mt-0 h-[500px] p-0 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              max-w-[80%] p-3 rounded-lg text-sm
                              ${message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                              }
                            `}
                          >
                            {message.type === 'assistant' && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Brain className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-600">ALEX VENDOR</span>
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                ALEX VENDOR está pensando...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Chat Input */}
                  <div className="p-4 border-t bg-slate-50 dark:bg-slate-900">
                    <form onSubmit={handleChatSubmit} className="flex space-x-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Pergunte sobre riscos de fornecedores, assessments, frameworks..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!chatInput.trim() || isLoading}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                {/* Actions Tab */}
                <TabsContent value="actions" className="mt-0 h-[500px] p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Ações Recomendadas</CardTitle>
                          <CardDescription>
                            Baseado na análise atual dos seus fornecedores
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {currentInsights.filter(i => i.actionable).map((insight) => (
                            <div key={insight.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                  {insight.title}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {insight.impact}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className={getPriorityBadgeColor(insight.priority)}>
                                  {getPriorityText(insight.priority)}
                                </Badge>
                                <Button size="sm" variant="outline">
                                  Executar
                                </Button>
                              </div>
                            </div>
                          ))}

                          {currentInsights.filter(i => i.actionable).length === 0 && (
                            <div className="text-center py-8">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                Tudo em ordem!
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Não há ações críticas pendentes no momento.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  ALEX VENDOR ativo
                </span>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                {currentInsights.filter(i => i.priority === 'high' || i.priority === 'critical').length} alertas
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Monitorando continuamente seus fornecedores e processos
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AlexVendorIntegration;