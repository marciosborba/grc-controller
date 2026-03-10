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
import { Checkbox } from '@/components/ui/checkbox';
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
  GitBranch,
  Network,
  Layers,
  TreePine,
  Workflow,
  Settings,
  Save,
  Play,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';

interface Methodology {
  id: string;
  name: string;
  description: string;
  methodology_type: string;
  framework: string;
  calculation_formula: string;
  parameters: any;
}

interface AdvancedAnalysis {
  id?: string;
  risk_id: string;
  methodology_id: string;
  analysis_type: string;
  input_parameters: any;
  calculation_results: any;
  monte_carlo_results?: any;
  scenario_analysis?: any;
  sensitivity_analysis?: any;
  bow_tie_analysis?: any;
  fault_tree_analysis?: any;
  event_tree_analysis?: any;
  hazop_analysis?: any;
  fmea_analysis?: any;
  confidence_level: number;
  uncertainty_range: any;
  assumptions: string[];
  limitations: string[];
  recommendations: string[];
  analyst_notes: string;
}

interface MonteCarloParams {
  iterations: number;
  probability_distribution: string;
  probability_min: number;
  probability_max: number;
  impact_min: number;
  impact_max: number;
  correlation_factor: number;
  confidence_levels: number[];
}

interface ScenarioParams {
  best_case: { probability: number; impact: number; description: string };
  base_case: { probability: number; impact: number; description: string };
  worst_case: { probability: number; impact: number; description: string };
  stress_test: { probability: number; impact: number; description: string };
}

interface FMEAAnalysis {
  failure_modes: Array<{
    mode: string;
    causes: string[];
    effects: string[];
    severity: number;
    occurrence: number;
    detection: number;
    rpn: number;
    actions: string[];
  }>;
}

interface BowTieAnalysis {
  central_event: string;
  threat_events: Array<{ event: string; probability: number; barriers: string[] }>;
  consequence_events: Array<{ event: string; impact: number; barriers: string[] }>;
  preventive_barriers: Array<{ barrier: string; effectiveness: number; dependencies: string[] }>;
  protective_barriers: Array<{ barrier: string; effectiveness: number; dependencies: string[] }>;
}

export const AdvancedRiskAnalysis: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<string>('');
  const [selectedMethodology, setSelectedMethodology] = useState<string>('');
  const [risks, setRisks] = useState<any[]>([]);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [analyses, setAnalyses] = useState<AdvancedAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AdvancedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para diferentes tipos de análise
  const [monteCarloParams, setMonteCarloParams] = useState<MonteCarloParams>({
    iterations: 10000,
    probability_distribution: 'normal',
    probability_min: 0.01,
    probability_max: 0.99,
    impact_min: 10000,
    impact_max: 10000000,
    correlation_factor: 0.3,
    confidence_levels: [0.95, 0.99, 0.999]
  });
  
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    best_case: { probability: 0.05, impact: 50000, description: 'Cenário otimista com controles efetivos' },
    base_case: { probability: 0.15, impact: 250000, description: 'Cenário mais provável baseado em dados históricos' },
    worst_case: { probability: 0.35, impact: 1000000, description: 'Cenário pessimista com falha de controles' },
    stress_test: { probability: 0.60, impact: 5000000, description: 'Cenário de stress extremo' }
  });
  
  const [fmeaAnalysis, setFmeaAnalysis] = useState<FMEAAnalysis>({
    failure_modes: [
      {
        mode: '',
        causes: [''],
        effects: [''],
        severity: 1,
        occurrence: 1,
        detection: 1,
        rpn: 1,
        actions: ['']
      }
    ]
  });
  
  const [bowTieAnalysis, setBowTieAnalysis] = useState<BowTieAnalysis>({
    central_event: '',
    threat_events: [{ event: '', probability: 0.1, barriers: [''] }],
    consequence_events: [{ event: '', impact: 100000, barriers: [''] }],
    preventive_barriers: [{ barrier: '', effectiveness: 0.9, dependencies: [''] }],
    protective_barriers: [{ barrier: '', effectiveness: 0.9, dependencies: [''] }]
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRisks();
    fetchMethodologies();
    fetchAnalyses();
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
    }
  };

  const fetchMethodologies = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_analysis_methodologies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMethodologies(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar metodologias:', error);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_advanced_analyses')
        .select(`
          *,
          risk_assessments(title),
          risk_analysis_methodologies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar análises:', error);
    }
  };

  const runMonteCarloSimulation = () => {
    const { iterations, probability_min, probability_max, impact_min, impact_max, correlation_factor } = monteCarloParams;
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      let probability, impact;
      
      switch (monteCarloParams.probability_distribution) {
        case 'normal':
          probability = normalRandom(
            (probability_min + probability_max) / 2,
            (probability_max - probability_min) / 6
          );
          break;
        case 'uniform':
          probability = Math.random() * (probability_max - probability_min) + probability_min;
          break;
        case 'triangular':
          probability = triangularRandom(probability_min, probability_max, (probability_min + probability_max) / 2);
          break;
        default:
          probability = Math.random() * (probability_max - probability_min) + probability_min;
      }
      
      // Aplicar correlação
      const baseImpact = Math.random() * (impact_max - impact_min) + impact_min;
      impact = baseImpact * (1 + correlation_factor * (probability - 0.5));
      
      const riskValue = Math.max(0, Math.min(1, probability)) * Math.max(0, impact);
      results.push(riskValue);
    }
    
    results.sort((a, b) => a - b);
    
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const median = results[Math.floor(results.length / 2)];
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const standardDeviation = Math.sqrt(variance);
    
    const percentiles = monteCarloParams.confidence_levels.map(level => ({
      confidence: level,
      value: results[Math.floor(results.length * level)]
    }));
    
    return {
      mean,
      median,
      standard_deviation: standardDeviation,
      percentiles,
      distribution_sample: results.slice(0, 1000),
      total_simulations: iterations
    };
  };

  const normalRandom = (mean: number, stdDev: number) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  };

  const triangularRandom = (min: number, max: number, mode: number) => {
    const u = Math.random();
    const c = (mode - min) / (max - min);
    
    if (u < c) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  };

  const calculateFMEA = () => {
    return fmeaAnalysis.failure_modes.map(mode => ({
      ...mode,
      rpn: mode.severity * mode.occurrence * mode.detection
    }));
  };

  const calculateBowTieRisk = () => {
    const preventiveEffectiveness = bowTieAnalysis.preventive_barriers.reduce(
      (acc, barrier) => acc * barrier.effectiveness, 1
    );
    
    const protectiveEffectiveness = bowTieAnalysis.protective_barriers.reduce(
      (acc, barrier) => acc * barrier.effectiveness, 1
    );
    
    const threatProbability = bowTieAnalysis.threat_events.reduce(
      (acc, threat) => acc + threat.probability, 0
    ) / bowTieAnalysis.threat_events.length;
    
    const consequenceImpact = bowTieAnalysis.consequence_events.reduce(
      (acc, consequence) => acc + consequence.impact, 0
    );
    
    const residualProbability = threatProbability * (1 - preventiveEffectiveness);
    const residualImpact = consequenceImpact * (1 - protectiveEffectiveness);
    
    return {
      initial_risk: threatProbability * consequenceImpact,
      residual_risk: residualProbability * residualImpact,
      risk_reduction: 1 - (residualProbability * residualImpact) / (threatProbability * consequenceImpact),
      preventive_effectiveness: preventiveEffectiveness,
      protective_effectiveness: protectiveEffectiveness
    };
  };

  const runAdvancedAnalysis = async () => {
    if (!selectedRisk || !selectedMethodology) {
      toast({
        title: 'Erro',
        description: 'Selecione um risco e uma metodologia',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const methodology = methodologies.find(m => m.id === selectedMethodology);
      if (!methodology) throw new Error('Metodologia não encontrada');

      let analysisResults: any = {};
      
      // Executar análise baseada na metodologia selecionada
      switch (methodology.name) {
        case 'Simulação Monte Carlo':
          analysisResults.monte_carlo_results = runMonteCarloSimulation();
          break;
          
        case 'Análise de Cenários':
          analysisResults.scenario_analysis = {
            scenarios: scenarioParams,
            expected_values: Object.entries(scenarioParams).map(([key, scenario]) => ({
              scenario: key,
              expected_value: scenario.probability * scenario.impact
            })),
            weighted_average: Object.values(scenarioParams).reduce(
              (acc, scenario) => acc + (scenario.probability * scenario.impact), 0
            ) / Object.values(scenarioParams).length
          };
          break;
          
        case 'FMEA (Failure Mode and Effects Analysis)':
          analysisResults.fmea_analysis = {
            failure_modes: calculateFMEA(),
            critical_modes: calculateFMEA().filter(mode => mode.rpn > 100),
            average_rpn: calculateFMEA().reduce((acc, mode) => acc + mode.rpn, 0) / fmeaAnalysis.failure_modes.length
          };
          break;
          
        case 'Bow-Tie Analysis':
          analysisResults.bow_tie_analysis = {
            ...bowTieAnalysis,
            risk_calculation: calculateBowTieRisk()
          };
          break;
          
        default:
          // Análise abrangente padrão
          analysisResults = {
            monte_carlo_results: runMonteCarloSimulation(),
            scenario_analysis: {
              scenarios: scenarioParams,
              expected_values: Object.entries(scenarioParams).map(([key, scenario]) => ({
                scenario: key,
                expected_value: scenario.probability * scenario.impact
              }))
            }
          };
      }

      const analysisData: AdvancedAnalysis = {
        risk_id: selectedRisk,
        methodology_id: selectedMethodology,
        analysis_type: methodology.name,
        input_parameters: {
          monte_carlo: monteCarloParams,
          scenarios: scenarioParams,
          fmea: fmeaAnalysis,
          bow_tie: bowTieAnalysis
        },
        calculation_results: analysisResults,
        confidence_level: 0.95,
        uncertainty_range: {
          min: analysisResults.monte_carlo_results?.percentiles?.find((p: any) => p.confidence === 0.05)?.value || 0,
          max: analysisResults.monte_carlo_results?.percentiles?.find((p: any) => p.confidence === 0.95)?.value || 0
        },
        assumptions: [
          'Distribuições de probabilidade baseadas em dados históricos',
          'Independência entre fatores de risco',
          'Efetividade de controles mantida constante',
          'Condições de mercado estáveis'
        ],
        limitations: [
          'Modelo baseado em dados limitados',
          'Não considera eventos de cauda extrema',
          'Correlações podem variar ao longo do tempo'
        ],
        recommendations: [
          'Implementar monitoramento contínuo dos parâmetros',
          'Revisar modelo trimestralmente',
          'Validar resultados com dados reais',
          'Considerar cenários de stress adicionais'
        ],
        analyst_notes: `Análise realizada usando ${methodology.name} em ${new Date().toLocaleDateString('pt-BR')}`
      };

      const { data, error } = await supabase
        .from('risk_advanced_analyses')
        .insert([{ ...analysisData, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;

      setCurrentAnalysis(data);
      fetchAnalyses();
      
      toast({
        title: 'Análise Concluída',
        description: `${methodology.name} executada com sucesso`,
      });
    } catch (error: any) {
      console.error('Erro na análise:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao executar análise avançada',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addFMEAMode = () => {
    setFmeaAnalysis({
      failure_modes: [
        ...fmeaAnalysis.failure_modes,
        {
          mode: '',
          causes: [''],
          effects: [''],
          severity: 1,
          occurrence: 1,
          detection: 1,
          rpn: 1,
          actions: ['']
        }
      ]
    });
  };

  const updateFMEAMode = (index: number, field: string, value: any) => {
    const updatedModes = [...fmeaAnalysis.failure_modes];
    updatedModes[index] = { ...updatedModes[index], [field]: value };
    
    if (['severity', 'occurrence', 'detection'].includes(field)) {
      updatedModes[index].rpn = updatedModes[index].severity * updatedModes[index].occurrence * updatedModes[index].detection;
    }
    
    setFmeaAnalysis({ failure_modes: updatedModes });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getMethodologyIcon = (type: string) => {
    switch (type) {
      case 'quantitative': return Calculator;
      case 'qualitative': return Users;
      case 'hybrid': return GitBranch;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span>Análise Avançada de Riscos</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Metodologias avançadas: Monte Carlo, FMEA, Bow-Tie, Cenários, VaR e mais
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Análise
          </Button>
          
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuração da Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="risk_select">Selecionar Risco</Label>
              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um risco..." />
                </SelectTrigger>
                <SelectContent>
                  {risks.map((risk) => (
                    <SelectItem key={risk.id} value={risk.id}>
                      {risk.title} - {risk.risk_category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="methodology_select">Metodologia de Análise</Label>
              <Select value={selectedMethodology} onValueChange={setSelectedMethodology}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma metodologia..." />
                </SelectTrigger>
                <SelectContent>
                  {methodologies.map((methodology) => {
                    const Icon = getMethodologyIcon(methodology.methodology_type);
                    return (
                      <SelectItem key={methodology.id} value={methodology.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{methodology.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {methodology.framework}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={runAdvancedAnalysis} 
                disabled={loading || !selectedRisk || !selectedMethodology}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Executar Análise
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Methodology Description */}
          {selectedMethodology && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              {(() => {
                const methodology = methodologies.find(m => m.id === selectedMethodology);
                return methodology ? (
                  <div>
                    <h4 className="font-medium mb-2">{methodology.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{methodology.description}</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <Badge variant="outline">{methodology.methodology_type}</Badge>
                      <Badge variant="outline">{methodology.framework}</Badge>
                      <span className="text-muted-foreground">
                        Fórmula: {methodology.calculation_formula}
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Parameters */}
      <Tabs defaultValue="monte_carlo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monte_carlo">Monte Carlo</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="fmea">FMEA</TabsTrigger>
          <TabsTrigger value="bowtie">Bow-Tie</TabsTrigger>
        </TabsList>

        <TabsContent value="monte_carlo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Parâmetros Monte Carlo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <Label>Distribuição</Label>
                  <Select
                    value={monteCarloParams.probability_distribution}
                    onValueChange={(value) => setMonteCarloParams({
                      ...monteCarloParams,
                      probability_distribution: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="uniform">Uniforme</SelectItem>
                      <SelectItem value="triangular">Triangular</SelectItem>
                      <SelectItem value="lognormal">Log-Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prob. Mín</Label>
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
                  <Label>Prob. Máx</Label>
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
                  <Label>Impacto Mín (R$)</Label>
                  <Input
                    type="number"
                    value={monteCarloParams.impact_min}
                    onChange={(e) => setMonteCarloParams({
                      ...monteCarloParams,
                      impact_min: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Impacto Máx (R$)</Label>
                  <Input
                    type="number"
                    value={monteCarloParams.impact_max}
                    onChange={(e) => setMonteCarloParams({
                      ...monteCarloParams,
                      impact_max: parseFloat(e.target.value)
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
                <div>
                  <Label>Níveis de Confiança</Label>
                  <div className="flex space-x-2">
                    {[0.95, 0.99, 0.999].map(level => (
                      <div key={level} className="flex items-center space-x-1">
                        <Checkbox
                          checked={monteCarloParams.confidence_levels.includes(level)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMonteCarloParams({
                                ...monteCarloParams,
                                confidence_levels: [...monteCarloParams.confidence_levels, level]
                              });
                            } else {
                              setMonteCarloParams({
                                ...monteCarloParams,
                                confidence_levels: monteCarloParams.confidence_levels.filter(l => l !== level)
                              });
                            }
                          }}
                        />
                        <Label className="text-xs">{formatPercentage(level)}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scenarioParams).map(([scenarioKey, scenario]) => (
              <Card key={scenarioKey}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {scenarioKey.replace('_', ' ')} Scenario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Probabilidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={scenario.probability}
                      onChange={(e) => setScenarioParams({
                        ...scenarioParams,
                        [scenarioKey]: {
                          ...scenario,
                          probability: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Impacto (R$)</Label>
                    <Input
                      type="number"
                      value={scenario.impact}
                      onChange={(e) => setScenarioParams({
                        ...scenarioParams,
                        [scenarioKey]: {
                          ...scenario,
                          impact: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={scenario.description}
                      onChange={(e) => setScenarioParams({
                        ...scenarioParams,
                        [scenarioKey]: {
                          ...scenario,
                          description: e.target.value
                        }
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Valor Esperado:</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(scenario.probability * scenario.impact)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fmea" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>FMEA - Análise de Modos de Falha</span>
                </div>
                <Button onClick={addFMEAMode} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Modo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {fmeaAnalysis.failure_modes.map((mode, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Modo de Falha</Label>
                        <Input
                          value={mode.mode}
                          onChange={(e) => updateFMEAMode(index, 'mode', e.target.value)}
                          placeholder="Descreva o modo de falha..."
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label>Severidade (1-10)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={mode.severity}
                            onChange={(e) => updateFMEAMode(index, 'severity', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Ocorrência (1-10)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={mode.occurrence}
                            onChange={(e) => updateFMEAMode(index, 'occurrence', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Detecção (1-10)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={mode.detection}
                            onChange={(e) => updateFMEAMode(index, 'detection', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Causas</Label>
                        <Textarea
                          value={mode.causes.join('\n')}
                          onChange={(e) => updateFMEAMode(index, 'causes', e.target.value.split('\n'))}
                          placeholder="Uma causa por linha..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Efeitos</Label>
                        <Textarea
                          value={mode.effects.join('\n')}
                          onChange={(e) => updateFMEAMode(index, 'effects', e.target.value.split('\n'))}
                          placeholder="Um efeito por linha..."
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-sm font-medium">RPN (Risk Priority Number): </span>
                        <Badge className={mode.rpn > 100 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {mode.rpn}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mode.rpn > 100 ? 'Ação requerida' : 'Aceitável'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bowtie" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Bow-Tie Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Evento Central</Label>
                <Input
                  value={bowTieAnalysis.central_event}
                  onChange={(e) => setBowTieAnalysis({
                    ...bowTieAnalysis,
                    central_event: e.target.value
                  })}
                  placeholder="Descreva o evento central de risco..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <TreePine className="h-4 w-4" />
                    <span>Eventos de Ameaça (Causas)</span>
                  </h4>
                  {bowTieAnalysis.threat_events.map((threat, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded mb-3">
                      <Input
                        value={threat.event}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.threat_events];
                          updated[index] = { ...threat, event: e.target.value };
                          setBowTieAnalysis({ ...bowTieAnalysis, threat_events: updated });
                        }}
                        placeholder="Evento de ameaça..."
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={threat.probability}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.threat_events];
                          updated[index] = { ...threat, probability: parseFloat(e.target.value) };
                          setBowTieAnalysis({ ...bowTieAnalysis, threat_events: updated });
                        }}
                        placeholder="Probabilidade..."
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Eventos de Consequência</span>
                  </h4>
                  {bowTieAnalysis.consequence_events.map((consequence, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded mb-3">
                      <Input
                        value={consequence.event}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.consequence_events];
                          updated[index] = { ...consequence, event: e.target.value };
                          setBowTieAnalysis({ ...bowTieAnalysis, consequence_events: updated });
                        }}
                        placeholder="Evento de consequência..."
                      />
                      <Input
                        type="number"
                        value={consequence.impact}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.consequence_events];
                          updated[index] = { ...consequence, impact: parseFloat(e.target.value) };
                          setBowTieAnalysis({ ...bowTieAnalysis, consequence_events: updated });
                        }}
                        placeholder="Impacto (R$)..."
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Barreiras Preventivas</span>
                  </h4>
                  {bowTieAnalysis.preventive_barriers.map((barrier, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded mb-3">
                      <Input
                        value={barrier.barrier}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.preventive_barriers];
                          updated[index] = { ...barrier, barrier: e.target.value };
                          setBowTieAnalysis({ ...bowTieAnalysis, preventive_barriers: updated });
                        }}
                        placeholder="Barreira preventiva..."
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={barrier.effectiveness}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.preventive_barriers];
                          updated[index] = { ...barrier, effectiveness: parseFloat(e.target.value) };
                          setBowTieAnalysis({ ...bowTieAnalysis, preventive_barriers: updated });
                        }}
                        placeholder="Efetividade (0-1)..."
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Barreiras Protetivas</span>
                  </h4>
                  {bowTieAnalysis.protective_barriers.map((barrier, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded mb-3">
                      <Input
                        value={barrier.barrier}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.protective_barriers];
                          updated[index] = { ...barrier, barrier: e.target.value };
                          setBowTieAnalysis({ ...bowTieAnalysis, protective_barriers: updated });
                        }}
                        placeholder="Barreira protetiva..."
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={barrier.effectiveness}
                        onChange={(e) => {
                          const updated = [...bowTieAnalysis.protective_barriers];
                          updated[index] = { ...barrier, effectiveness: parseFloat(e.target.value) };
                          setBowTieAnalysis({ ...bowTieAnalysis, protective_barriers: updated });
                        }}
                        placeholder="Efetividade (0-1)..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Display */}
      {currentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Resultados da Análise</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="detailed">Detalhado</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Target className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Confiança</p>
                          <p className="text-2xl font-bold">
                            {formatPercentage(currentAnalysis.confidence_level)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {currentAnalysis.calculation_results.monte_carlo_results && (
                    <>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(currentAnalysis.calculation_results.monte_carlo_results.mean)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">VaR 95%</p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(
                                  currentAnalysis.calculation_results.monte_carlo_results.percentiles
                                    ?.find((p: any) => p.confidence === 0.95)?.value || 0
                                )}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="detailed">
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(currentAnalysis.calculation_results, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <div className="space-y-3">
                  {currentAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Historical Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises Avançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyses.slice(0, 10).map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{analysis.analysis_type}</p>
                    <p className="text-sm text-muted-foreground">
                      Confiança: {formatPercentage(analysis.confidence_level)}
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
                    onClick={() => setCurrentAnalysis(analysis)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};