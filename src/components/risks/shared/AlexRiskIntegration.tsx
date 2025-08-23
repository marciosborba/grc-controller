import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Lightbulb,
  TrendingUp,
  Shield,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Risk } from '@/types/risk-management';
import type { ViewMode } from '../RiskManagementCenter';

interface AlexRiskIntegrationProps {
  currentView: ViewMode;
  selectedRisks: Risk[];
  onSuggestion: (suggestion: string) => void;
}

interface AlexSuggestion {
  id: string;
  type: 'analysis' | 'action' | 'insight' | 'warning';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  context: string;
  actionable: boolean;
}

export const AlexRiskIntegration: React.FC<AlexRiskIntegrationProps> = ({
  currentView,
  selectedRisks,
  onSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<AlexSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { toast } = useToast();

  // Gerar sugestões baseadas no contexto atual
  useEffect(() => {
    generateContextualSuggestions();
  }, [currentView, selectedRisks]);

  const generateContextualSuggestions = () => {
    setIsAnalyzing(true);
    
    // Simular análise Alex Risk (em produção seria API call)
    setTimeout(() => {
      const newSuggestions: AlexSuggestion[] = [];

      // Análise baseada na view atual
      switch (currentView) {
        case 'dashboard':
          newSuggestions.push({
            id: 'dashboard-analysis',
            type: 'insight',
            title: 'Padrão de Risco Identificado',
            description: 'Detectei um aumento de 23% em riscos operacionais nas últimas 4 semanas. Recomendo revisão dos processos.',
            priority: 'high',
            context: 'dashboard',
            actionable: true
          });
          break;
          
        case 'table':
          newSuggestions.push({
            id: 'table-optimization',
            type: 'action',
            title: 'Otimização de Classificação',
            description: 'Identifiquei 3 riscos que podem ser reclassificados com base em novos dados de mercado.',
            priority: 'medium',
            context: 'table',
            actionable: true
          });
          break;
          
        case 'kanban':
          newSuggestions.push({
            id: 'kanban-workflow',
            type: 'analysis',
            title: 'Gargalo no Workflow',
            description: 'Há 5 riscos parados em "Em Tratamento" há mais de 30 dias. Sugestão de escalation.',
            priority: 'high',
            context: 'kanban',
            actionable: true
          });
          break;
          
        case 'process':
          newSuggestions.push({
            id: 'process-guide',
            type: 'insight',
            title: 'Processo Aprimorado',
            description: 'Com base em benchmarks, posso sugerir melhorias no processo de avaliação de riscos.',
            priority: 'medium',
            context: 'process',
            actionable: true
          });
          break;
      }

      // Análise baseada nos riscos
      if (selectedRisks.length > 0) {
        const highRisks = selectedRisks.filter(r => r.riskLevel === 'Muito Alto' || r.riskLevel === 'Alto');
        
        if (highRisks.length > 0) {
          newSuggestions.push({
            id: 'high-risk-alert',
            type: 'warning',
            title: 'Riscos Críticos Detectados',
            description: `${highRisks.length} riscos de alta prioridade requerem atenção imediata. Posso gerar um plano de ação.`,
            priority: 'high',
            context: 'risks',
            actionable: true
          });
        }

        // Análise de correlações
        const categories = [...new Set(selectedRisks.map(r => r.category))];
        if (categories.length >= 3) {
          newSuggestions.push({
            id: 'correlation-analysis',
            type: 'analysis',
            title: 'Correlações Identificadas',
            description: `Detectei correlações entre riscos de ${categories.slice(0, 3).join(', ')}. Análise detalhada disponível.`,
            priority: 'medium',
            context: 'correlation',
            actionable: true
          });
        }
      }

      // Sugestões proativas
      newSuggestions.push({
        id: 'market-intelligence',
        type: 'insight',
        title: 'Inteligência de Mercado',
        description: 'Baseado em dados externos, identifiquei 2 novos riscos emergentes para seu setor.',
        priority: 'medium',
        context: 'market',
        actionable: true
      });

      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSuggestionAction = (suggestion: AlexSuggestion) => {
    switch (suggestion.type) {
      case 'analysis':
        toast({
          title: '🔍 Análise Iniciada',
          description: 'Alex Risk está preparando uma análise detalhada...',
        });
        break;
        
      case 'action':
        toast({
          title: '⚡ Ação Sugerida',
          description: 'Plano de ação gerado por Alex Risk disponível.',
        });
        break;
        
      case 'insight':
        toast({
          title: '💡 Insight Aplicado',
          description: 'Recomendação de Alex Risk sendo implementada...',
        });
        break;
        
      case 'warning':
        toast({
          title: '⚠️ Alerta Acionado',
          description: 'Protocolo de resposta rápida ativado.',
          variant: 'destructive',
        });
        break;
    }
    
    onSuggestion(suggestion.description);
    
    // Remover sugestão após ação
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'analysis': return TrendingUp;
      case 'action': return Target;
      case 'insight': return Lightbulb;
      case 'warning': return AlertTriangle;
      default: return Brain;
    }
  };

  const getSuggestionColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50';
    }
    
    switch (type) {
      case 'analysis': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50';
      case 'action': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50';
      case 'insight': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50';
      case 'warning': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'medium': return <Badge variant="default" className="text-xs">Média</Badge>;
      case 'low': return <Badge variant="secondary" className="text-xs">Baixa</Badge>;
      default: return null;
    }
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/50 dark:to-blue-950/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center space-x-2">
                <span>Alex Risk - Assistente IA</span>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </h3>
              <p className="text-sm text-muted-foreground">
                {isAnalyzing ? 'Analisando contexto atual...' : `${suggestions.length} sugestão(ões) inteligente(s)`}
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSuggestions(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
            <span className="text-muted-foreground">Alex Risk analisando...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const Icon = getSuggestionIcon(suggestion.type);
              
              return (
                <div 
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.type, suggestion.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-medium text-sm text-foreground">{suggestion.title}</h4>
                    </div>
                    {getPriorityBadge(suggestion.priority)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.context}
                    </Badge>
                    
                    {suggestion.actionable && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSuggestionAction(suggestion)}
                        className="bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Botão para mais análises */}
            <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
              <Button 
                variant="outline" 
                onClick={generateContextualSuggestions}
                disabled={isAnalyzing}
                className="w-full flex items-center space-x-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50"
              >
                <Brain className="h-4 w-4" />
                <span>Gerar Novas Sugestões</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};