import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Sparkles, 
  Lightbulb, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Shield,
  Target,
  Zap,
  MessageSquare,
  Eye,
  BarChart3,
  Calendar,
  ArrowRight,
  X,
  Minimize2
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

import type { PolicyMetrics, AlexSuggestions, AlexInsights } from '@/types/policy-management-v2';

interface AlexPolicyAssistantProps {
  currentView: string;
  context: {
    metrics?: PolicyMetrics | null;
    pendingApprovals?: number;
    upcomingReviews?: number;
    expiringPolicies?: number;
  };
  onSuggestion: (suggestion: { type: string; description: string; action?: () => void }) => void;
}

interface ContextualSuggestion {
  id: string;
  type: 'insight' | 'action' | 'warning' | 'tip';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  icon: React.ComponentType<any>;
  action?: () => void;
  actionLabel?: string;
}

const AlexPolicyAssistant: React.FC<AlexPolicyAssistantProps> = ({
  currentView,
  context,
  onSuggestion
}) => {
  const { toast } = useToast();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [alexInsights, setAlexInsights] = useState<AlexInsights | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    generateContextualSuggestions();
  }, [currentView, context]);

  const generateContextualSuggestions = () => {
    const newSuggestions: ContextualSuggestion[] = [];

    // Sugestões baseadas na view atual
    switch (currentView) {
      case 'dashboard':
        if (context.pendingApprovals && context.pendingApprovals > 0) {
          newSuggestions.push({
            id: 'pending-approvals',
            type: 'warning',
            title: 'Aprovações Pendentes',
            description: `${context.pendingApprovals} políticas aguardando aprovação há mais de 3 dias`,
            priority: 'high',
            icon: AlertTriangle,
            action: () => onSuggestion({ type: 'navigate', description: 'Navegar para aprovações' }),
            actionLabel: 'Ver Aprovações'
          });
        }

        if (context.upcomingReviews && context.upcomingReviews > 0) {
          newSuggestions.push({
            id: 'upcoming-reviews',
            type: 'action',
            title: 'Revisões Próximas',
            description: `${context.upcomingReviews} políticas precisam de revisão nos próximos 30 dias`,
            priority: 'medium',
            icon: Eye,
            action: () => onSuggestion({ type: 'navigate', description: 'Navegar para revisões' }),
            actionLabel: 'Agendar Revisões'
          });
        }

        if (context.metrics && context.metrics.compliance_rate < 95) {
          newSuggestions.push({
            id: 'compliance-improvement',
            type: 'tip',
            title: 'Oportunidade de Melhoria',
            description: `Taxa de compliance em ${context.metrics.compliance_rate}%. Posso sugerir ações para atingir 98%`,
            priority: 'medium',
            icon: TrendingUp,
            action: () => generateComplianceRecommendations(),
            actionLabel: 'Ver Sugestões'
          });
        }
        break;

      case 'elaboration':
        newSuggestions.push({
          id: 'template-suggestion',
          type: 'tip',
          title: 'Use Templates Inteligentes',
          description: 'Acelere a criação usando templates pré-aprovados com IA',
          priority: 'medium',
          icon: Lightbulb,
          action: () => onSuggestion({ type: 'template', description: 'Abrir biblioteca de templates' }),
          actionLabel: 'Ver Templates'
        });

        newSuggestions.push({
          id: 'content-generation',
          type: 'action',
          title: 'Geração Automática',
          description: 'Posso gerar conteúdo estruturado baseado nas melhores práticas',
          priority: 'low',
          icon: Zap,
          action: () => onSuggestion({ type: 'generate', description: 'Gerar conteúdo com IA' }),
          actionLabel: 'Gerar Conteúdo'
        });
        break;

      case 'review':
        newSuggestions.push({
          id: 'automated-review',
          type: 'action',
          title: 'Revisão Automatizada',
          description: 'Posso fazer uma pré-análise de compliance e qualidade',
          priority: 'high',
          icon: CheckCircle,
          action: () => onSuggestion({ type: 'review', description: 'Iniciar revisão automatizada' }),
          actionLabel: 'Iniciar Análise'
        });
        break;

      case 'approval':
        newSuggestions.push({
          id: 'approval-insights',
          type: 'insight',
          title: 'Insights de Aprovação',
          description: 'Políticas de segurança têm 23% mais chance de aprovação rápida',
          priority: 'low',
          icon: BarChart3,
          action: () => onSuggestion({ type: 'insight', description: 'Ver análise detalhada' }),
          actionLabel: 'Ver Análise'
        });
        break;

      case 'publication':
        newSuggestions.push({
          id: 'communication-strategy',
          type: 'tip',
          title: 'Estratégia de Comunicação',
          description: 'Posso sugerir os melhores canais e cronograma para publicação',
          priority: 'medium',
          icon: Users,
          action: () => onSuggestion({ type: 'communication', description: 'Gerar plano de comunicação' }),
          actionLabel: 'Criar Plano'
        });
        break;

      case 'validity':
        if (context.expiringPolicies && context.expiringPolicies > 0) {
          newSuggestions.push({
            id: 'expiring-policies',
            type: 'warning',
            title: 'Políticas Expirando',
            description: `${context.expiringPolicies} políticas expiram nos próximos 30 dias`,
            priority: 'high',
            icon: Calendar,
            action: () => onSuggestion({ type: 'renewal', description: 'Iniciar processo de renovação' }),
            actionLabel: 'Renovar Agora'
          });
        }
        break;
    }

    // Sugestões gerais sempre disponíveis
    newSuggestions.push({
      id: 'general-help',
      type: 'tip',
      title: 'Precisa de Ajuda?',
      description: 'Estou aqui para responder dúvidas sobre políticas e compliance',
      priority: 'low',
      icon: MessageSquare,
      action: () => {/* Abrir chat */},
      actionLabel: 'Conversar'
    });

    setSuggestions(newSuggestions);
  };

  const generateComplianceRecommendations = async () => {
    setIsGeneratingInsights(true);
    
    try {
      // Simular geração de insights
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights: AlexInsights = {
        trend_analysis: 'Taxa de compliance cresceu 5% nos últimos 3 meses',
        benchmark_comparison: 'Sua organização está 12% acima da média do setor',
        improvement_opportunities: [
          'Automatizar processo de reconhecimento de políticas',
          'Implementar treinamentos obrigatórios para políticas críticas',
          'Criar dashboard de compliance em tempo real'
        ],
        risk_indicators: [
          'Políticas de segurança com baixa taxa de reconhecimento',
          'Atraso médio de 2 dias nas aprovações'
        ],
        recommendations: [
          'Priorizar revisão das 3 políticas com menor compliance',
          'Implementar notificações automáticas para vencimentos',
          'Criar programa de incentivos para compliance'
        ],
        generated_at: new Date().toISOString()
      };

      setAlexInsights(insights);
      
      toast({
        title: '🤖 Insights Gerados',
        description: 'Alex Policy analisou seus dados e gerou recomendações',
      });

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar insights',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-red-200 bg-red-50';
      case 'action': return 'border-blue-200 bg-blue-50';
      case 'insight': return 'border-purple-200 bg-purple-50';
      case 'tip': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSuggestionIconColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-600';
      case 'action': return 'text-blue-600';
      case 'insight': return 'text-purple-600';
      case 'tip': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant=\"destructive\" className=\"text-xs\">Alta</Badge>;
      case 'medium': return <Badge variant=\"secondary\" className=\"text-xs\">Média</Badge>;
      case 'low': return <Badge variant=\"outline\" className=\"text-xs\">Baixa</Badge>;
      default: return null;
    }
  };

  if (isMinimized) {
    return (
      <div className=\"fixed bottom-4 right-4 z-50\">
        <Button
          onClick={() => setIsMinimized(false)}
          className=\"rounded-full w-12 h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg\"
        >
          <Brain className=\"h-6 w-6 text-white\" />
        </Button>
      </div>
    );
  }

  return (
    <div className=\"fixed bottom-4 right-4 w-80 z-50\">
      <Card className=\"shadow-lg border-indigo-200\">
        <CardHeader className=\"pb-3\">
          <div className=\"flex items-center justify-between\">
            <CardTitle className=\"flex items-center space-x-2 text-sm\">
              <Brain className=\"h-4 w-4 text-indigo-600\" />
              <span>Alex Policy</span>
              <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                <Sparkles className=\"h-3 w-3 mr-1\" />
                IA
              </Badge>
            </CardTitle>
            <div className=\"flex items-center space-x-1\">
              <Button
                variant=\"ghost\"
                size=\"sm\"
                onClick={() => setIsMinimized(true)}
                className=\"h-6 w-6 p-0\"
              >
                <Minimize2 className=\"h-3 w-3\" />
              </Button>
            </div>
          </div>
          <p className=\"text-xs text-muted-foreground\">
            Assistente contextual para {currentView === 'dashboard' ? 'dashboard' : 
            currentView === 'elaboration' ? 'elaboração' :
            currentView === 'review' ? 'revisão' :
            currentView === 'approval' ? 'aprovação' :
            currentView === 'publication' ? 'publicação' : 'gestão de validade'}
          </p>
        </CardHeader>
        
        <CardContent className=\"space-y-3 max-h-96 overflow-y-auto\">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => {
              const IconComponent = suggestion.icon;
              
              return (
                <div 
                  key={suggestion.id}
                  className={`p-3 rounded-lg border ${getSuggestionColor(suggestion.type)}`}
                >
                  <div className=\"flex items-start space-x-3\">
                    <IconComponent className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getSuggestionIconColor(suggestion.type)}`} />
                    <div className=\"flex-1 min-w-0\">
                      <div className=\"flex items-center justify-between mb-1\">
                        <h4 className=\"text-sm font-medium\">{suggestion.title}</h4>
                        {getPriorityBadge(suggestion.priority)}
                      </div>
                      <p className=\"text-xs text-muted-foreground mb-2\">{suggestion.description}</p>
                      {suggestion.action && suggestion.actionLabel && (
                        <Button 
                          size=\"sm\" 
                          variant=\"outline\" 
                          className=\"text-xs h-6\"
                          onClick={suggestion.action}
                        >
                          {suggestion.actionLabel}
                          <ArrowRight className=\"h-3 w-3 ml-1\" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className=\"text-center py-4\">
              <Brain className=\"h-8 w-8 text-muted-foreground mx-auto mb-2\" />
              <p className=\"text-sm text-muted-foreground\">
                Analisando contexto...
              </p>
            </div>
          )}

          {/* Insights Section */}
          {alexInsights && (
            <div className=\"border-t pt-3 mt-3\">
              <h4 className=\"text-sm font-medium mb-2 flex items-center space-x-2\">
                <BarChart3 className=\"h-4 w-4 text-indigo-600\" />
                <span>Insights Detalhados</span>
              </h4>
              
              <div className=\"space-y-2\">
                {alexInsights.improvement_opportunities?.slice(0, 2).map((opportunity, index) => (
                  <div key={index} className=\"p-2 bg-indigo-50 rounded text-xs text-indigo-900\">
                    <Lightbulb className=\"h-3 w-3 inline mr-1\" />
                    {opportunity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className=\"border-t pt-3 mt-3 space-y-2\">
            <ImprovedAIChatDialog
              type=\"policy\"
              title=\"Alex Policy - Chat Contextual\"
              trigger={
                <Button variant=\"outline\" className=\"w-full text-xs h-8\">
                  <MessageSquare className=\"h-3 w-3 mr-2\" />
                  Conversar com Alex Policy
                </Button>
              }
            />
            
            <Button 
              variant=\"outline\" 
              className=\"w-full text-xs h-8\"
              onClick={generateComplianceRecommendations}
              disabled={isGeneratingInsights}
            >
              {isGeneratingInsights ? (
                <>
                  <div className=\"animate-spin rounded-full h-3 w-3 border-b border-current mr-2\"></div>
                  Analisando...
                </>
              ) : (
                <>
                  <BarChart3 className=\"h-3 w-3 mr-2\" />
                  Gerar Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlexPolicyAssistant;