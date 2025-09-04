/**
 * ALEX AI RECOMMENDATIONS - Sistema de recomendações inteligentes
 * 
 * Componente para exibir e gerenciar recomendações da IA
 * Integra com o IA Manager para sugestões contextuais
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  X,
  ThumbsUp,
  ThumbsDown,
  Eye,
  AlertTriangle,
  Lightbulb,
  Zap,
  Star,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { useAlexAssessment } from '@/hooks/useAlexAssessment';
import { useIsMobile } from '@/hooks/useIsMobile';
import { toast } from 'sonner';

interface AIRecommendation {
  id: string;
  assessment_id: string;
  recommendation_type: string;
  trigger_context: any;
  ai_provider: string;
  ai_model: string;
  ai_response: any;
  confidence_score: number;
  status: 'pending' | 'applied' | 'dismissed' | 'expired';
  applied_by?: string;
  applied_at?: string;
  user_feedback?: any;
  created_at: string;
}

interface AlexAIRecommendationsProps {
  userRole: string;
  tenantConfig: any;
}

const AlexAIRecommendations: React.FC<AlexAIRecommendationsProps> = ({ userRole, tenantConfig }) => {
  const isMobile = useIsMobile();
  const { getAIRecommendations, isGettingRecommendations } = useAlexAssessment();
  
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Mock data for demonstration
  const mockRecommendations: AIRecommendation[] = [
    {
      id: '1',
      assessment_id: 'assess-1',
      recommendation_type: 'control_analysis',
      trigger_context: {
        control_name: 'Access Control Management',
        framework_name: 'ISO 27001',
        current_maturity: 2
      },
      ai_provider: 'anthropic',
      ai_model: 'claude-3-sonnet',
      ai_response: {
        analysis: 'O controle de gestão de acesso apresenta gaps significativos na implementação de MFA',
        recommendations: [
          'Implementar autenticação multifator para contas privilegiadas',
          'Estabelecer revisões trimestrais de acesso',
          'Implementar monitoramento de atividades privilegiadas'
        ],
        priority: 'high',
        estimated_effort: 'medium',
        compliance_impact: 'high'
      },
      confidence_score: 0.92,
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      assessment_id: 'assess-1',
      recommendation_type: 'gap_analysis',
      trigger_context: {
        framework_name: 'SOC 2 Type II',
        current_score: 68
      },
      ai_provider: 'openai',
      ai_model: 'gpt-4',
      ai_response: {
        analysis: 'Identificados gaps críticos em logging e monitoramento',
        recommendations: [
          'Implementar SIEM centralizado',
          'Estabelecer baseline de logs de segurança',
          'Criar alertas para eventos críticos'
        ],
        priority: 'critical',
        estimated_effort: 'high',
        compliance_impact: 'high'
      },
      confidence_score: 0.88,
      status: 'pending',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      assessment_id: 'assess-2',
      recommendation_type: 'evidence_suggestion',
      trigger_context: {
        control_name: 'Data Encryption',
        framework_name: 'LGPD'
      },
      ai_provider: 'anthropic',
      ai_model: 'claude-3-haiku',
      ai_response: {
        analysis: 'Evidências insuficientes para comprovação de criptografia adequada',
        recommendations: [
          'Documentar algoritmos de criptografia utilizados',
          'Implementar gestão de chaves criptográficas',
          'Criar procedimentos para rotação de chaves'
        ],
        priority: 'medium',
        estimated_effort: 'low',
        compliance_impact: 'medium'
      },
      confidence_score: 0.75,
      status: 'applied',
      applied_at: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  useEffect(() => {
    setRecommendations(mockRecommendations);
  }, []);

  const generateNewRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      // This would call the actual AI recommendations function
      toast.success('Novas recomendações geradas!');
    } catch (error) {
      toast.error('Erro ao gerar recomendações');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const applyRecommendation = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'applied', applied_at: new Date().toISOString() }
          : rec
      )
    );
    toast.success('Recomendação aplicada com sucesso!');
  };

  const dismissRecommendation = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'dismissed' }
          : rec
      )
    );
    toast.success('Recomendação descartada.');
  };

  const submitFeedback = (recommendationId: string, rating: 'positive' | 'negative') => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { 
              ...rec, 
              user_feedback: { 
                rating, 
                comment: feedbackText,
                submitted_at: new Date().toISOString()
              }
            }
          : rec
      )
    );
    setFeedbackText('');
    toast.success('Feedback enviado. Obrigado!');
  };

  const getRecommendationIcon = (type: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      'control_analysis': Target,
      'gap_analysis': AlertTriangle,
      'evidence_suggestion': Lightbulb,
      'risk_priority': TrendingUp,
      'framework_mapping': Sparkles
    };
    return icons[type] || Brain;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    const matchesType = filterType === 'all' || rec.recommendation_type === filterType;
    return matchesStatus && matchesType;
  });

  const RecommendationCard = ({ recommendation }: { recommendation: AIRecommendation }) => {
    const IconComponent = getRecommendationIcon(recommendation.recommendation_type);
    const response = recommendation.ai_response;
    
    return (
      <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        selectedRecommendation?.id === recommendation.id ? 'ring-2 ring-blue-500' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <IconComponent className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {recommendation.trigger_context.control_name || 
                   recommendation.trigger_context.framework_name ||
                   recommendation.recommendation_type}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {recommendation.recommendation_type.replace('_', ' ')}
                  </Badge>
                  {response.priority && (
                    <Badge className={getPriorityColor(response.priority)}>
                      {response.priority}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence_score)}`}>
                  {(recommendation.confidence_score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">confiança</div>
              </div>
              <Badge 
                variant={recommendation.status === 'pending' ? 'secondary' : 
                        recommendation.status === 'applied' ? 'default' : 'outline'}
                className="ml-2"
              >
                {recommendation.status === 'pending' && 'Pendente'}
                {recommendation.status === 'applied' && 'Aplicada'}
                {recommendation.status === 'dismissed' && 'Descartada'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {response.analysis}
            </p>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Recomendações:</h4>
              <ul className="space-y-1">
                {response.recommendations?.slice(0, 2).map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
                {response.recommendations?.length > 2 && (
                  <li className="text-sm text-gray-500">
                    +{response.recommendations.length - 2} mais recomendações...
                  </li>
                )}
              </ul>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(recommendation.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  {recommendation.ai_model}
                </span>
              </div>
              
              <div className="flex gap-2">
                {recommendation.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        applyRecommendation(recommendation.id);
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aplicar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissRecommendation(recommendation.id);
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Descartar
                    </Button>
                  </>
                )}
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecommendation(recommendation);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Detalhes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const DetailPanel = () => {
    if (!selectedRecommendation) return null;
    
    const response = selectedRecommendation.ai_response;
    
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Detalhes da Recomendação
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedRecommendation(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Análise Completa</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {response.analysis}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Todas as Recomendações</h4>
            <ul className="space-y-2">
              {response.recommendations?.map((rec: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Prioridade:</span>
              <Badge className={getPriorityColor(response.priority)} size="sm">
                {response.priority}
              </Badge>
            </div>
            <div>
              <span className="text-gray-500">Esforço:</span>
              <span className="font-medium ml-2">{response.estimated_effort}</span>
            </div>
            <div>
              <span className="text-gray-500">Confiança:</span>
              <span className={`font-medium ml-2 ${getConfidenceColor(selectedRecommendation.confidence_score)}`}>
                {(selectedRecommendation.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Impacto:</span>
              <span className="font-medium ml-2">{response.compliance_impact}</span>
            </div>
          </div>
          
          {selectedRecommendation.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => applyRecommendation(selectedRecommendation.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => dismissRecommendation(selectedRecommendation.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Descartar
              </Button>
            </div>
          )}
          
          {/* Feedback Section */}
          {selectedRecommendation.status === 'applied' && !selectedRecommendation.user_feedback && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Avalie esta recomendação</h4>
              <Textarea
                placeholder="Compartilhe sua experiência com esta recomendação..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => submitFeedback(selectedRecommendation.id, 'positive')}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Útil
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => submitFeedback(selectedRecommendation.id, 'negative')}
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  Não útil
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Recomendações IA
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Insights inteligentes para otimizar seus assessments
          </p>
        </div>
        
        <Button 
          onClick={generateNewRecommendations}
          disabled={isLoadingRecommendations}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {isLoadingRecommendations ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Gerar Novas Recomendações
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-foreground"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="applied">Aplicadas</option>
          <option value="dismissed">Descartadas</option>
        </select>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-foreground"
        >
          <option value="all">Todos os tipos</option>
          <option value="control_analysis">Análise de Controles</option>
          <option value="gap_analysis">Análise de Gaps</option>
          <option value="evidence_suggestion">Sugestão de Evidências</option>
          <option value="risk_priority">Priorização de Riscos</option>
        </select>
        
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {filteredRecommendations.length} recomendações
        </Badge>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma recomendação encontrada</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Gere novas recomendações ou ajuste os filtros
                </p>
                <Button onClick={generateNewRecommendations}>
                  Gerar Recomendações
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1">
          {selectedRecommendation ? (
            <DetailPanel />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma recomendação</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Clique em uma recomendação para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlexAIRecommendations;