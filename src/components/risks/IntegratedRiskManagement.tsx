import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search,
  AlertTriangle,
  Brain,
  Target,
  Shield,
  Eye,
  CheckCircle,
  ArrowRight,
  Play,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Plus,
  Edit,
  BarChart3,
  Activity,
  Clock,
  Mail,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Função para traduzir estratégias de tratamento
const translateTreatmentStrategy = (strategy: string): string => {
  if (!strategy) return 'Não definido';
  
  const translations: Record<string, string> = {
    'mitigate': 'Mitigar',
    'transfer': 'Transferir', 
    'avoid': 'Evitar',
    'accept': 'Aceitar',
    'Mitigar': 'Mitigar',
    'Transferir': 'Transferir',
    'Evitar': 'Evitar', 
    'Aceitar': 'Aceitar'
  };
  
  // Limpar espaços e converter para lowercase para comparação
  const cleanStrategy = strategy.trim().toLowerCase();
  
  // Procurar pela tradução
  for (const [key, value] of Object.entries(translations)) {
    if (key.toLowerCase() === cleanStrategy) {
      return value;
    }
  }
  
  // Se não encontrar tradução, retornar o valor original
  return strategy;
};

interface Risk {
  id: string;
  title: string;
  description: string;
  risk_category: string;
  risk_level: string;
  risk_score: number;
  status: string;
  assigned_to: string;
  analysis_data: any;
  created_at: string;
  due_date: string;
  next_review_date: string;
}

interface Analysis {
  id: string;
  analysis_type: string;
  confidence_level: number;
  calculation_results: any;
  recommendations: string[];
  created_at: string;
}

interface ActionPlan {
  id: string;
  treatment_type: string;
  description: string;
  target_date: string;
  budget: number;
}

interface Activity {
  id: string;
  description: string;
  responsible_person: string;
  deadline: string;
  status: string;
  priority: string;
}

interface Communication {
  id: string;
  person_name: string;
  person_email: string;
  decision: string;
  justification: string;
  communication_date: string;
}

interface AcceptanceLetter {
  id: string;
  letter_number: string;
  title: string;
  status: string;
  financial_exposure: number;
  acceptance_period_start: string;
  acceptance_period_end: string;
}

export const IntegratedRiskManagement: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [acceptanceLetters, setAcceptanceLetters] = useState<AcceptanceLetter[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRisks();
  }, []);

  useEffect(() => {
    if (selectedRisk) {
      fetchRiskDetails(selectedRisk.id);
    }
  }, [selectedRisk]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRisks(data || []);
      
      // Auto-select first risk if none selected
      if (data && data.length > 0 && !selectedRisk) {
        setSelectedRisk(data[0]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar riscos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar riscos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskDetails = async (riskId: string) => {
    try {
      // Fetch analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('risk_advanced_analyses')
        .select('*')
        .eq('risk_id', riskId)
        .order('created_at', { ascending: false });

      if (analysesError) throw analysesError;
      setAnalyses(analysesData || []);

      // Fetch action plans
      const { data: plansData, error: plansError } = await supabase
        .from('risk_action_plans')
        .select('*')
        .eq('risk_id', riskId);

      if (plansError) throw plansError;
      setActionPlans(plansData || []);

      // Fetch activities
      if (plansData && plansData.length > 0) {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('risk_action_activities')
          .select('*')
          .in('action_plan_id', plansData.map(p => p.id))
          .order('deadline', { ascending: true });

        if (activitiesError) throw activitiesError;
        setActivities(activitiesData || []);
      } else {
        setActivities([]);
      }

      // Fetch communications
      const { data: communicationsData, error: communicationsError } = await supabase
        .from('risk_communications')
        .select('*')
        .eq('risk_id', riskId)
        .order('communication_date', { ascending: false });

      if (communicationsError) throw communicationsError;
      setCommunications(communicationsData || []);

      // Fetch acceptance letters
      const { data: lettersData, error: lettersError } = await supabase
        .from('risk_acceptance_letters')
        .select('*')
        .eq('risk_id', riskId);

      if (lettersError) throw lettersError;
      setAcceptanceLetters(lettersData || []);

    } catch (error: any) {
      console.error('Erro ao carregar detalhes do risco:', error);
    }
  };

  const getCurrentStep = (risk: Risk): string => {
    if (risk.analysis_data?.current_step) {
      return risk.analysis_data.current_step;
    }
    
    // Determine step based on status and available data
    if (risk.status === 'Identificado') return 'identify';
    if (risk.status === 'in_analysis') return 'analyze';
    if (risk.status === 'in_treatment') return 'treat';
    if (risk.status === 'monitoring') return 'monitor';
    if (risk.status === 'pending_acceptance') return 'treat';
    if (risk.status === 'closed') return 'close';
    
    return 'identify';
  };

  const getProgressPercentage = (risk: Risk): number => {
    if (risk.analysis_data?.progress_percentage) {
      return risk.analysis_data.progress_percentage;
    }
    
    const step = getCurrentStep(risk);
    const stepMap: Record<string, number> = {
      'identify': 12.5,
      'analyze': 25,
      'evaluate': 37.5,
      'classify': 50,
      'treat': 62.5,
      'monitor': 75,
      'review': 87.5,
      'close': 100
    };
    
    return stepMap[step] || 0;
  };

  const getStepStatus = (stepId: string, risk: Risk): 'pending' | 'in_progress' | 'completed' => {
    const currentStep = getCurrentStep(risk);
    const stepOrder = ['identify', 'analyze', 'evaluate', 'classify', 'treat', 'monitor', 'review', 'close'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'in_progress';
    return 'pending';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Muito Alto': return 'bg-red-100 text-red-800';
      case 'Alto': return 'bg-orange-100 text-orange-800';
      case 'Medio': return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Baixo': return 'bg-green-100 text-green-800';
      case 'Muito Baixo': return 'bg-gray-100 text-gray-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluida': return 'bg-green-100 text-green-800';
      case 'Planejada': return 'bg-gray-100 text-gray-800';
      case 'Atrasada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const processSteps = [
    {
      id: 'identify',
      title: 'Identificar',
      description: 'Identificacao e registro do risco',
      icon: Search,
      color: 'text-blue-600'
    },
    {
      id: 'analyze',
      title: 'Analisar',
      description: 'Analise qualitativa e quantitativa',
      icon: Brain,
      color: 'text-purple-600'
    },
    {
      id: 'evaluate',
      title: 'Avaliar',
      description: 'Avaliacao de significancia',
      icon: Target,
      color: 'text-indigo-600'
    },
    {
      id: 'classify',
      title: 'Classificar',
      description: 'Classificacao e priorizacao',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 'treat',
      title: 'Tratar',
      description: 'Estrategia de tratamento',
      icon: Shield,
      color: 'text-orange-600'
    },
    {
      id: 'monitor',
      title: 'Monitorar',
      description: 'Monitoramento continuo',
      icon: Eye,
      color: 'text-teal-600'
    },
    {
      id: 'review',
      title: 'Revisar',
      description: 'Revisao periodica',
      icon: BarChart3,
      color: 'text-pink-600'
    },
    {
      id: 'close',
      title: 'Encerrar',
      description: 'Encerramento do risco',
      icon: CheckCircle,
      color: 'text-gray-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" />
            <span>Gestao Integrada de Riscos</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Processo completo e integrado de gestao de riscos corporativos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            <span>Exportar Relatorio</span>
          </Button>
          
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Risco
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Risk Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Riscos ({risks.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRisk?.id === risk.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedRisk(risk)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm truncate">{risk.title}</h5>
                      <Badge className={getStatusColor(risk.risk_level)} variant="outline">
                        {risk.risk_level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {risk.risk_category}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso:</span>
                        <span>{getProgressPercentage(risk)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(risk)} className="h-1" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Responsavel: {risk.assigned_to}
                    </div>
                  </div>
                ))}
                
                {risks.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Nenhum risco encontrado
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedRisk ? (
            <Tabs defaultValue="process" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="process">Processo</TabsTrigger>
                <TabsTrigger value="analysis">Analises</TabsTrigger>
                <TabsTrigger value="actions">Acoes</TabsTrigger>
                <TabsTrigger value="communications">Comunicacoes</TabsTrigger>
                <TabsTrigger value="acceptance">Carta Risco</TabsTrigger>
                <TabsTrigger value="overview">Visao Geral</TabsTrigger>
              </TabsList>

              <TabsContent value="process" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Processo de Gestao - {selectedRisk.title}</span>
                      <Badge className={getStatusColor(selectedRisk.risk_level)}>
                        {selectedRisk.risk_level} (Score: {selectedRisk.risk_score})
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {processSteps.map((step, index) => {
                        const Icon = step.icon;
                        const status = getStepStatus(step.id, selectedRisk);
                        
                        return (
                          <div key={step.id} className="relative">
                            {/* Connector Line */}
                            {index < processSteps.length - 1 && (
                              <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                            )}
                            
                            <div className={`p-4 border rounded-lg ${
                              status === 'in_progress' ? 'border-primary bg-primary/5' :
                              status === 'completed' ? 'border-green-500 bg-green-50' :
                              'border-border'
                            }`}>
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${
                                  status === 'completed' ? 'bg-green-100 text-green-600' :
                                  status === 'in_progress' ? 'bg-primary/10 text-primary' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">{step.title}</h3>
                                    <Badge className={
                                      status === 'completed' ? 'bg-green-100 text-green-800' :
                                      status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {status === 'completed' ? 'Concluido' :
                                       status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analises Realizadas ({analyses.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyses.map((analysis) => (
                        <div key={analysis.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{analysis.analysis_type}</h4>
                            <Badge variant="outline">
                              Confianca: {(analysis.confidence_level * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          
                          {analysis.calculation_results?.monte_carlo_results && (
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-sm font-medium">VaR 95%</p>
                                <p className="text-lg font-bold text-red-600">
                                  {formatCurrency(analysis.calculation_results.monte_carlo_results.percentiles?.find((p: any) => p.confidence === 0.95)?.value || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Valor Medio</p>
                                <p className="text-lg font-bold text-blue-600">
                                  {formatCurrency(analysis.calculation_results.monte_carlo_results.mean || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Simulacoes</p>
                                <p className="text-lg font-bold text-green-600">
                                  {analysis.calculation_results.monte_carlo_results.total_simulations?.toLocaleString() || 0}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {analysis.recommendations && analysis.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Recomendacoes:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {analysis.recommendations.slice(0, 3).map((rec, index) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="mt-3 text-xs text-muted-foreground">
                            Criada em: {formatDate(analysis.created_at)}
                          </div>
                        </div>
                      ))}
                      
                      {analyses.length === 0 && (
                        <div className="text-center py-8">
                          <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Nenhuma analise realizada</p>
                          <Button className="mt-4" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Analise
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Planos de Acao ({actionPlans.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {actionPlans.map((plan) => (
                          <div key={plan.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">
                                {(() => {
                                  const result = translateTreatmentStrategy(plan.treatment_type);
                                  console.log(`DEBUG BADGE: "${plan.treatment_type}" -> "${result}"`);
                                  return result;
                                })()}
                              </Badge>
                              <span className="text-sm font-medium">
                                {formatCurrency(plan.budget)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {plan.description.substring(0, 100)}...
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Prazo: {formatDate(plan.target_date)}
                            </div>
                          </div>
                        ))}
                        
                        {actionPlans.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              Nenhum plano de acao
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividades ({activities.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activities.map((activity) => (
                          <div key={activity.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={getStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {activity.priority}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">
                              {activity.description.substring(0, 80)}...
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <div>Responsavel: {activity.responsible_person}</div>
                              <div>Prazo: {formatDate(activity.deadline)}</div>
                            </div>
                          </div>
                        ))}
                        
                        {activities.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                              Nenhuma atividade
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Comunicacoes ({communications.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {communications.map((comm) => (
                        <div key={comm.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{comm.person_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(comm.decision)}>
                                {comm.decision}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comm.communication_date)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {comm.person_email}
                          </p>
                          <p className="text-sm">
                            {comm.justification.substring(0, 200)}...
                          </p>
                        </div>
                      ))}
                      
                      {communications.length === 0 && (
                        <div className="text-center py-8">
                          <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Nenhuma comunicacao registrada</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="acceptance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cartas de Aceitacao de Risco ({acceptanceLetters.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {acceptanceLetters.map((letter) => (
                        <div key={letter.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{letter.title}</h4>
                            <Badge className={getStatusColor(letter.status)}>
                              {letter.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Numero: </span>
                              {letter.letter_number}
                            </div>
                            <div>
                              <span className="font-medium">Exposicao: </span>
                              {formatCurrency(letter.financial_exposure)}
                            </div>
                            <div>
                              <span className="font-medium">Periodo: </span>
                              {formatDate(letter.acceptance_period_start)} - {formatDate(letter.acceptance_period_end)}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {acceptanceLetters.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Nenhuma carta de aceitacao</p>
                          <Button className="mt-4" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Carta
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Score de Risco</p>
                          <p className="text-2xl font-bold">{selectedRisk.risk_score}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Progresso</p>
                          <p className="text-2xl font-bold">{getProgressPercentage(selectedRisk)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Proxima Revisao</p>
                          <p className="text-sm font-bold">
                            {selectedRisk.next_review_date ? formatDate(selectedRisk.next_review_date) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Risco</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Descricao</h4>
                        <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Categoria</h4>
                          <Badge variant="outline">{selectedRisk.risk_category}</Badge>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Responsavel</h4>
                          <p className="text-sm">{selectedRisk.assigned_to}</p>
                        </div>
                      </div>
                      
                      {selectedRisk.analysis_data?.stakeholders && (
                        <div>
                          <h4 className="font-medium mb-2">Stakeholders Afetados</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRisk.analysis_data.stakeholders.map((stakeholder: string, index: number) => (
                              <Badge key={index} variant="secondary">{stakeholder}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedRisk.analysis_data?.existing_controls && (
                        <div>
                          <h4 className="font-medium mb-2">Controles Existentes</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {selectedRisk.analysis_data.existing_controls.map((control: string, index: number) => (
                              <li key={index}>{control}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Selecione um risco para ver os detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};