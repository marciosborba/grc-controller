import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  BarChart3,
  Zap,
  Shield,
  Eye,
  Calculator,
  Lightbulb,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  DollarSign,
  Edit,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

interface RiskAnalysis {
  id: string;
  risk_id: string;
  analysis_type: string;
  input_data: any;
  ai_assessment: any;
  recommendations: string[];
  confidence_score: number;
  risk_score_calculated: number;
  probability_factors: any;
  impact_factors: any;
  mitigation_strategies: string[];
  cost_benefit_analysis: any;
  timeline_analysis: any;
  stakeholder_impact: any;
  regulatory_compliance: any;
  created_at: string;
  created_by: string;
}

interface MonteCarloResult {
  mean: number;
  median: number;
  percentile_95: number;
  percentile_99: number;
  standard_deviation: number;
  distribution: number[];
}

interface ScenarioAnalysis {
  best_case: {
    probability: number;
    impact: number;
    description: string;
  };
  most_likely: {
    probability: number;
    impact: number;
    description: string;
  };
  worst_case: {
    probability: number;
    impact: number;
    description: string;
  };
}

export const RiskIntelligentAnalysis: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [risks, setRisks] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<RiskAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [currentAnalysis, setCurrentAnalysis] = useState<RiskAnalysis | null>(null);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const [selectedAnalysisForDetails, setSelectedAnalysisForDetails] = useState<RiskAnalysis | null>(null);
  
  // Estados para análise Monte Carlo
  const [monteCarloParams, setMonteCarloParams] = useState({
    iterations: 10000,
    probability_min: 0.1,
    probability_max: 0.9,
    impact_min: 100000,
    impact_max: 10000000,
    correlation_factor: 0.3
  });
  
  // Estados para análise de cenários
  const [scenarioData, setScenarioData] = useState<ScenarioAnalysis>({
    best_case: { probability: 0.1, impact: 100000, description: '' },
    most_likely: { probability: 0.3, impact: 500000, description: '' },
    worst_case: { probability: 0.8, impact: 2000000, description: '' }
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([fetchRisks(), fetchAnalyses()]);
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const fetchRisks = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('risk_score', { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar riscos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar riscos para análise',
        variant: 'destructive',
      });
    }
  };

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_intelligent_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar análises:', error);
    }
  };

  const runIntelligentAnalysis = async () => {
    if (!selectedRisk) {
      toast({
        title: 'Erro',
        description: 'Selecione um risco para análise',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const risk = risks.find(r => r.id === selectedRisk);
      if (!risk) throw new Error('Risco não encontrado');

      // Simular análise de IA (em produção, isso seria uma chamada para um serviço de IA)
      const aiAnalysis = await performAIAnalysis(risk);
      
      const analysisData = {
        risk_id: selectedRisk,
        analysis_type: analysisType,
        input_data: {
          risk_data: risk,
          monte_carlo_params: monteCarloParams,
          scenario_data: scenarioData
        },
        ai_assessment: aiAnalysis,
        recommendations: aiAnalysis.recommendations,
        confidence_score: aiAnalysis.confidence_score,
        risk_score_calculated: aiAnalysis.calculated_risk_score,
        probability_factors: aiAnalysis.probability_factors,
        impact_factors: aiAnalysis.impact_factors,
        mitigation_strategies: aiAnalysis.mitigation_strategies,
        cost_benefit_analysis: aiAnalysis.cost_benefit_analysis,
        timeline_analysis: aiAnalysis.timeline_analysis,
        stakeholder_impact: aiAnalysis.stakeholder_impact,
        regulatory_compliance: aiAnalysis.regulatory_compliance,
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('risk_intelligent_analyses')
        .insert([analysisData])
        .select()
        .single();

      if (error) throw error;

      setCurrentAnalysis(data);
      fetchAnalyses();
      
      toast({
        title: 'Análise Concluída',
        description: 'Análise inteligente de risco realizada com sucesso',
      });
    } catch (error: any) {
      console.error('Erro na análise:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao realizar análise inteligente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const performAIAnalysis = async (risk: any): Promise<any> => {
    // Simular análise de IA - em produção, isso seria uma integração real com modelos de ML/IA
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simular tempo de processamento

    const probabilityFactors = {
      historical_data: Math.random() * 0.4 + 0.1,
      industry_trends: Math.random() * 0.3 + 0.1,
      control_effectiveness: Math.random() * 0.3 + 0.1,
      external_factors: Math.random() * 0.2 + 0.1
    };

    const impactFactors = {
      financial_impact: Math.random() * 5000000 + 100000,
      operational_impact: Math.random() * 0.8 + 0.1,
      reputational_impact: Math.random() * 0.9 + 0.1,
      regulatory_impact: Math.random() * 0.7 + 0.1
    };

    const calculatedRiskScore = (
      (probabilityFactors.historical_data + 
       probabilityFactors.industry_trends + 
       probabilityFactors.control_effectiveness) / 3
    ) * impactFactors.financial_impact / 1000000;

    return {
      confidence_score: Math.random() * 0.3 + 0.7, // 70-100%
      calculated_risk_score: calculatedRiskScore,
      probability_factors: probabilityFactors,
      impact_factors: impactFactors,
      recommendations: [
        'Implementar controles de segurança adicionais',
        'Realizar auditoria de vulnerabilidades',
        'Estabelecer plano de resposta a incidentes',
        'Treinar equipe em melhores práticas',
        'Monitorar indicadores de risco continuamente'
      ],
      mitigation_strategies: [
        {
          strategy: 'Controles Preventivos',
          cost: Math.random() * 100000 + 10000,
          effectiveness: Math.random() * 0.4 + 0.6,
          timeline: '3-6 meses'
        },
        {
          strategy: 'Controles Detectivos',
          cost: Math.random() * 50000 + 5000,
          effectiveness: Math.random() * 0.3 + 0.5,
          timeline: '1-3 meses'
        },
        {
          strategy: 'Controles Corretivos',
          cost: Math.random() * 75000 + 15000,
          effectiveness: Math.random() * 0.5 + 0.4,
          timeline: '2-4 meses'
        }
      ],
      cost_benefit_analysis: {
        total_risk_exposure: impactFactors.financial_impact,
        mitigation_cost: Math.random() * 200000 + 50000,
        residual_risk: calculatedRiskScore * 0.3,
        roi: Math.random() * 300 + 150
      },
      timeline_analysis: {
        short_term: 'Implementar controles críticos',
        medium_term: 'Estabelecer monitoramento contínuo',
        long_term: 'Otimizar e automatizar controles'
      },
      stakeholder_impact: {
        customers: 'Impacto médio na confiança',
        employees: 'Necessidade de treinamento',
        shareholders: 'Possível impacto financeiro',
        regulators: 'Requer comunicação proativa'
      },
      regulatory_compliance: {
        applicable_regulations: ['LGPD', 'ISO 27001', 'SOX'],
        compliance_gaps: ['Documentação de processos', 'Auditoria regular'],
        remediation_priority: 'Alta'
      }
    };
  };

  const runMonteCarloSimulation = (): MonteCarloResult => {
    const iterations = monteCarloParams.iterations;
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const probability = Math.random() * (monteCarloParams.probability_max - monteCarloParams.probability_min) + monteCarloParams.probability_min;
      const impact = Math.random() * (monteCarloParams.impact_max - monteCarloParams.impact_min) + monteCarloParams.impact_min;
      const riskValue = probability * impact;
      results.push(riskValue);
    }

    results.sort((a, b) => a - b);

    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const median = results[Math.floor(results.length / 2)];
    const percentile_95 = results[Math.floor(results.length * 0.95)];
    const percentile_99 = results[Math.floor(results.length * 0.99)];
    
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const standard_deviation = Math.sqrt(variance);

    return {
      mean,
      median,
      percentile_95,
      percentile_99,
      standard_deviation,
      distribution: results.slice(0, 100) // Amostra para visualização
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando dados para análise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span>Análise Inteligente de Riscos</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Análise avançada com IA, simulações Monte Carlo e modelagem de cenários
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchRisks();
              fetchAnalyses();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <ImprovedAIChatDialog 
            type="risk"
            context={{ analyses: analyses }}
            trigger={
              <Button variant="outline" className="flex items-center space-x-2 hover:bg-red-50 transition-colors">
                <div className="p-1 rounded-full bg-red-500">
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <span>Consultar ALEX RISK</span>
                <Badge variant="secondary" className="text-xs">
                  IA
                </Badge>
              </Button>
            }
          />
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Configuração da Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="risk_select">Selecionar Risco</Label>
              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger>
                  <SelectValue placeholder={risks.length > 0 ? "Escolha um risco para análise..." : "Carregando riscos..."} />
                </SelectTrigger>
                <SelectContent>
                  {risks.length > 0 ? (
                    risks.map((risk) => (
                      <SelectItem key={risk.id} value={risk.id}>
                        {risk.title} - {risk.risk_category} ({risk.status})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-risks" disabled>
                      Nenhum risco encontrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {risks.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {risks.length} risco(s) disponível(is) para análise
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="analysis_type">Tipo de Análise</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Análise Abrangente</SelectItem>
                  <SelectItem value="monte_carlo">Simulação Monte Carlo</SelectItem>
                  <SelectItem value="scenario">Análise de Cenários</SelectItem>
                  <SelectItem value="quantitative">Análise Quantitativa</SelectItem>
                  <SelectItem value="qualitative">Análise Qualitativa</SelectItem>
                  <SelectItem value="var">Value at Risk (VaR)</SelectItem>
                  <SelectItem value="expected_shortfall">Expected Shortfall</SelectItem>
                  <SelectItem value="bow_tie">Bow-Tie Analysis</SelectItem>
                  <SelectItem value="fmea">FMEA</SelectItem>
                  <SelectItem value="fault_tree">Fault Tree Analysis</SelectItem>
                  <SelectItem value="event_tree">Event Tree Analysis</SelectItem>
                  <SelectItem value="hazop">HAZOP</SelectItem>
                  <SelectItem value="fair">FAIR Framework</SelectItem>
                  <SelectItem value="stress_testing">Stress Testing</SelectItem>
                  <SelectItem value="sensitivity">Sensitivity Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={runIntelligentAnalysis} 
                disabled={loading || !selectedRisk}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Executar Análise IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {currentAnalysis && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="quantitative">Quantitativo</TabsTrigger>
            <TabsTrigger value="scenarios">Cenários</TabsTrigger>
            <TabsTrigger value="mitigation">Mitigação</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Score de Risco IA</p>
                      <p className="text-2xl font-bold">
                        {currentAnalysis.risk_score_calculated.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Confiança</p>
                      <p className="text-2xl font-bold">
                        {formatPercentage(currentAnalysis.confidence_score)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Exposição Financeira</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(currentAnalysis.ai_assessment.cost_benefit_analysis.total_risk_exposure)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ROI Mitigação</p>
                      <p className="text-2xl font-bold">
                        {currentAnalysis.ai_assessment.cost_benefit_analysis.roi.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fatores de Probabilidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(currentAnalysis.probability_factors).map(([factor, value]) => (
                    <div key={factor} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{factor.replace('_', ' ')}</span>
                        <span>{formatPercentage(value as number)}</span>
                      </div>
                      <Progress value={(value as number) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fatores de Impacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Impacto Financeiro</span>
                      <span>{formatCurrency(currentAnalysis.impact_factors.financial_impact)}</span>
                    </div>
                    <Progress value={currentAnalysis.impact_factors.financial_impact / 50000} className="h-2" />
                  </div>
                  
                  {['operational_impact', 'reputational_impact', 'regulatory_impact'].map((factor) => (
                    <div key={factor} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{factor.replace('_', ' ')}</span>
                        <span>{formatPercentage(currentAnalysis.impact_factors[factor])}</span>
                      </div>
                      <Progress value={currentAnalysis.impact_factors[factor] * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quantitative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulação Monte Carlo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label>Iterações</Label>
                    <Input
                      type="number"
                      value={monteCarloParams.iterations}
                      onChange={(e) => setMonteCarloParams({
                        ...monteCarloParams,
                        iterations: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>Prob. Mín (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={monteCarloParams.probability_min}
                      onChange={(e) => setMonteCarloParams({
                        ...monteCarloParams,
                        probability_min: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>Prob. Máx (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={monteCarloParams.probability_max}
                      onChange={(e) => setMonteCarloParams({
                        ...monteCarloParams,
                        probability_max: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label>Correlação</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={monteCarloParams.correlation_factor}
                      onChange={(e) => setMonteCarloParams({
                        ...monteCarloParams,
                        correlation_factor: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
                
                <Button onClick={() => {
                  const result = runMonteCarloSimulation();
                  console.log('Monte Carlo Result:', result);
                  toast({
                    title: 'Simulação Concluída',
                    description: `Média: ${formatCurrency(result.mean)}, P95: ${formatCurrency(result.percentile_95)}`,
                  });
                }}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Executar Simulação
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(scenarioData).map(([scenario, data]) => (
                <Card key={scenario}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {scenario.replace('_', ' ')} Case
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Probabilidade</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={data.probability}
                        onChange={(e) => setScenarioData({
                          ...scenarioData,
                          [scenario]: {
                            ...data,
                            probability: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Impacto (R$)</Label>
                      <Input
                        type="number"
                        value={data.impact}
                        onChange={(e) => setScenarioData({
                          ...scenarioData,
                          [scenario]: {
                            ...data,
                            impact: parseFloat(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={data.description}
                        onChange={(e) => setScenarioData({
                          ...scenarioData,
                          [scenario]: {
                            ...data,
                            description: e.target.value
                          }
                        })}
                        rows={3}
                      />
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">Valor Esperado:</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(data.probability * data.impact)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mitigation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentAnalysis.ai_assessment.mitigation_strategies.map((strategy: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{strategy.strategy}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Custo:</span>
                      <span className="font-medium">{formatCurrency(strategy.cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Efetividade:</span>
                      <span className="font-medium">{formatPercentage(strategy.effectiveness)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Timeline:</span>
                      <span className="font-medium">{strategy.timeline}</span>
                    </div>
                    <Progress value={strategy.effectiveness * 100} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Conformidade Regulatória</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Regulamentações Aplicáveis:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.ai_assessment.regulatory_compliance.applicable_regulations.map((reg: string, index: number) => (
                      <Badge key={index} variant="outline">{reg}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Gaps de Conformidade:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {currentAnalysis.ai_assessment.regulatory_compliance.compliance_gaps.map((gap: string, index: number) => (
                      <li key={index} className="text-sm">{gap}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Prioridade de Remediação:</h4>
                  <Badge className={
                    currentAnalysis.ai_assessment.regulatory_compliance.remediation_priority === 'Alta' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {currentAnalysis.ai_assessment.regulatory_compliance.remediation_priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Recomendações da IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Historical Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Análise {analysis.analysis_type}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {analysis.risk_score_calculated.toFixed(2)} | 
                      Confiança: {formatPercentage(analysis.confidence_score)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedAnalysisForDetails(analysis);
                      setShowAnalysisDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Details Modal */}
      <Dialog open={showAnalysisDetails} onOpenChange={setShowAnalysisDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Detalhes da Análise - {selectedAnalysisForDetails?.analysis_type}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedAnalysisForDetails && (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Target className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Score de Risco IA</p>
                        <p className="text-2xl font-bold">
                          {selectedAnalysisForDetails.risk_score_calculated.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Confiança</p>
                        <p className="text-2xl font-bold">
                          {formatPercentage(selectedAnalysisForDetails.confidence_score)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Exposição Financeira</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(selectedAnalysisForDetails.ai_assessment.cost_benefit_analysis.total_risk_exposure)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Data da Análise</p>
                        <p className="text-lg font-bold">
                          {new Date(selectedAnalysisForDetails.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="factors">Fatores</TabsTrigger>
                  <TabsTrigger value="mitigation">Mitigação</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Análise de Custo-Benefício</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Exposição Total:</span>
                          <span className="font-medium">{formatCurrency(selectedAnalysisForDetails.ai_assessment.cost_benefit_analysis.total_risk_exposure)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Custo de Mitigação:</span>
                          <span className="font-medium">{formatCurrency(selectedAnalysisForDetails.ai_assessment.cost_benefit_analysis.mitigation_cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Risco Residual:</span>
                          <span className="font-medium">{selectedAnalysisForDetails.ai_assessment.cost_benefit_analysis.residual_risk.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ROI:</span>
                          <span className="font-medium text-green-600">{selectedAnalysisForDetails.ai_assessment.cost_benefit_analysis.roi.toFixed(0)}%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Análise Temporal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Curto Prazo:</h4>
                          <p className="text-sm text-muted-foreground">{selectedAnalysisForDetails.ai_assessment.timeline_analysis.short_term}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Médio Prazo:</h4>
                          <p className="text-sm text-muted-foreground">{selectedAnalysisForDetails.ai_assessment.timeline_analysis.medium_term}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Longo Prazo:</h4>
                          <p className="text-sm text-muted-foreground">{selectedAnalysisForDetails.ai_assessment.timeline_analysis.long_term}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="factors" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Fatores de Probabilidade</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(selectedAnalysisForDetails.probability_factors).map(([factor, value]) => (
                          <div key={factor} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{factor.replace('_', ' ')}</span>
                              <span>{formatPercentage(value as number)}</span>
                            </div>
                            <Progress value={(value as number) * 100} className="h-2" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Fatores de Impacto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Impacto Financeiro</span>
                            <span>{formatCurrency(selectedAnalysisForDetails.impact_factors.financial_impact)}</span>
                          </div>
                          <Progress value={selectedAnalysisForDetails.impact_factors.financial_impact / 50000} className="h-2" />
                        </div>
                        
                        {['operational_impact', 'reputational_impact', 'regulatory_impact'].map((factor) => (
                          <div key={factor} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{factor.replace('_', ' ')}</span>
                              <span>{formatPercentage(selectedAnalysisForDetails.impact_factors[factor])}</span>
                            </div>
                            <Progress value={selectedAnalysisForDetails.impact_factors[factor] * 100} className="h-2" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="mitigation" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedAnalysisForDetails.ai_assessment.mitigation_strategies.map((strategy: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>{strategy.strategy}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Custo:</span>
                            <span className="font-medium">{formatCurrency(strategy.cost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Efetividade:</span>
                            <span className="font-medium">{formatPercentage(strategy.effectiveness)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Timeline:</span>
                            <span className="font-medium">{strategy.timeline}</span>
                          </div>
                          <Progress value={strategy.effectiveness * 100} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Análise de Conformidade Regulatória</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Regulamentações Aplicáveis:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAnalysisForDetails.ai_assessment.regulatory_compliance.applicable_regulations.map((reg: string, index: number) => (
                            <Badge key={index} variant="outline">{reg}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Gaps de Conformidade:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedAnalysisForDetails.ai_assessment.regulatory_compliance.compliance_gaps.map((gap: string, index: number) => (
                            <li key={index} className="text-sm">{gap}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Prioridade de Remediação:</h4>
                        <Badge className={
                          selectedAnalysisForDetails.ai_assessment.regulatory_compliance.remediation_priority === 'Alta' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {selectedAnalysisForDetails.ai_assessment.regulatory_compliance.remediation_priority}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Impacto nos Stakeholders:</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedAnalysisForDetails.ai_assessment.stakeholder_impact).map(([stakeholder, impact]) => (
                            <div key={stakeholder} className="p-3 bg-muted/50 rounded-lg">
                              <h5 className="font-medium capitalize">{stakeholder}:</h5>
                              <p className="text-sm text-muted-foreground">{impact as string}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5" />
                        <span>Recomendações da IA</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedAnalysisForDetails.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCurrentAnalysis(selectedAnalysisForDetails);
                      setShowAnalysisDetails(false);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Usar como Base para Nova Análise
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const exportData = {
                        analysis: selectedAnalysisForDetails,
                        export_timestamp: new Date().toISOString(),
                        exported_by: user?.email
                      };
                      
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                        type: 'application/json'
                      });
                      
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `analysis-${selectedAnalysisForDetails.analysis_type}-${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: 'Sucesso',
                        description: 'Análise exportada com sucesso',
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Análise
                  </Button>
                  
                  <Button onClick={() => setShowAnalysisDetails(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};