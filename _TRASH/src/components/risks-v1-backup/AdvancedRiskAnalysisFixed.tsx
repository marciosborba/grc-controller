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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Plus,
  Edit,
  Trash2,
  Info,
  TrendingDown,
  Activity,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AdminFormulaPanel } from './AdminFormulaPanel';

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
  created_at?: string;
  created_by?: string;
}

interface MonteCarloParams {
  iterations: number;
  probability_distribution: string;
  probability_min: number;
  probability_max: number;
  probability_mean?: number;
  probability_std?: number;
  impact_min: number;
  impact_max: number;
  impact_mean?: number;
  impact_std?: number;
  correlation_factor: number;
  confidence_levels: number[];
  time_horizon: number;
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
    current_controls: string[];
    recommended_actions: string[];
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAnalysisDetails, setShowAnalysisDetails] = useState(false);
  const [selectedAnalysisForDetails, setSelectedAnalysisForDetails] = useState<AdvancedAnalysis | null>(null);
  
  // Estados para diferentes tipos de análise
  const [monteCarloParams, setMonteCarloParams] = useState<MonteCarloParams>({
    iterations: 100000,
    probability_distribution: 'normal',
    probability_min: 0.001,
    probability_max: 0.999,
    probability_mean: 0.15,
    probability_std: 0.05,
    impact_min: 10000,
    impact_max: 50000000,
    impact_mean: 1000000,
    impact_std: 500000,
    correlation_factor: 0.3,
    confidence_levels: [0.90, 0.95, 0.99, 0.999],
    time_horizon: 1
  });
  
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    best_case: { 
      probability: 0.05, 
      impact: 50000, 
      description: 'Cenário otimista com controles altamente efetivos e condições favoráveis' 
    },
    base_case: { 
      probability: 0.15, 
      impact: 500000, 
      description: 'Cenário mais provável baseado em dados históricos e condições normais' 
    },
    worst_case: { 
      probability: 0.35, 
      impact: 2500000, 
      description: 'Cenário pessimista com falha parcial de controles' 
    },
    stress_test: { 
      probability: 0.60, 
      impact: 10000000, 
      description: 'Cenário de stress extremo com falha sistêmica de controles' 
    }
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
        actions: [''],
        current_controls: [''],
        recommended_actions: ['']
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
          risk_assessments(title, risk_category),
          risk_analysis_methodologies(name, methodology_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar análises:', error);
    }
  };

  // Implementação correta da simulação Monte Carlo
  const runMonteCarloSimulation = (): any => {
    const { 
      iterations, 
      probability_distribution, 
      probability_min, 
      probability_max, 
      probability_mean, 
      probability_std,
      impact_min, 
      impact_max, 
      impact_mean,
      impact_std,
      correlation_factor,
      confidence_levels,
      time_horizon
    } = monteCarloParams;
    
    const results: number[] = [];
    const probabilityValues: number[] = [];
    const impactValues: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      let probability, impact;
      
      // Geração de probabilidade baseada na distribuição selecionada
      switch (probability_distribution) {
        case 'normal':
          probability = normalRandom(probability_mean || 0.15, probability_std || 0.05);
          probability = Math.max(probability_min, Math.min(probability_max, probability));
          break;
        case 'uniform':
          probability = uniformRandom(probability_min, probability_max);
          break;
        case 'triangular':
          probability = triangularRandom(probability_min, probability_max, probability_mean || (probability_min + probability_max) / 2);
          break;
        case 'lognormal':
          probability = lognormalRandom(Math.log(probability_mean || 0.15), probability_std || 0.5);
          probability = Math.max(probability_min, Math.min(probability_max, probability));
          break;
        case 'beta':
          probability = betaRandom(2, 5); // Parâmetros alpha=2, beta=5 para distribuição assimétrica
          probability = probability_min + probability * (probability_max - probability_min);
          break;
        default:
          probability = uniformRandom(probability_min, probability_max);
      }
      
      // Geração de impacto com correlação
      const baseImpact = normalRandom(impact_mean || 1000000, impact_std || 500000);
      impact = baseImpact * (1 + correlation_factor * (probability - (probability_mean || 0.15)) / (probability_std || 0.05));
      impact = Math.max(impact_min, Math.min(impact_max, impact));
      
      // Cálculo do risco ajustado pelo horizonte temporal
      const riskValue = probability * impact * Math.sqrt(time_horizon);
      
      results.push(riskValue);
      probabilityValues.push(probability);
      impactValues.push(impact);
    }
    
    results.sort((a, b) => a - b);
    
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const median = results[Math.floor(results.length / 2)];
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (results.length - 1);
    const standardDeviation = Math.sqrt(variance);
    
    // Cálculo de percentis para diferentes níveis de confiança
    const percentiles = confidence_levels.map(level => ({
      confidence: level,
      value: results[Math.floor(results.length * level)],
      percentile: level * 100
    }));
    
    // Cálculo do Expected Shortfall (CVaR)
    const var95Index = Math.floor(results.length * 0.95);
    const expectedShortfall = results.slice(var95Index).reduce((sum, val) => sum + val, 0) / (results.length - var95Index);
    
    // Métricas de distribuição
    const skewness = calculateSkewness(results, mean, standardDeviation);
    const kurtosis = calculateKurtosis(results, mean, standardDeviation);
    
    // Análise de sensibilidade básica
    const probabilityCorrelation = calculateCorrelation(probabilityValues, results);
    const impactCorrelation = calculateCorrelation(impactValues, results);
    
    return {
      mean,
      median,
      standard_deviation: standardDeviation,
      variance,
      percentiles,
      expected_shortfall: expectedShortfall,
      skewness,
      kurtosis,
      distribution_sample: results.slice(0, 1000), // Amostra para visualização
      total_simulations: iterations,
      probability_stats: {
        mean: probabilityValues.reduce((sum, val) => sum + val, 0) / probabilityValues.length,
        correlation_with_risk: probabilityCorrelation
      },
      impact_stats: {
        mean: impactValues.reduce((sum, val) => sum + val, 0) / impactValues.length,
        correlation_with_risk: impactCorrelation
      },
      time_horizon,
      confidence_interval_95: {
        lower: results[Math.floor(results.length * 0.025)],
        upper: results[Math.floor(results.length * 0.975)]
      }
    };
  };

  // Funções auxiliares para distribuições estatísticas
  const normalRandom = (mean: number, stdDev: number): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  };

  const uniformRandom = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  const triangularRandom = (min: number, max: number, mode: number): number => {
    const u = Math.random();
    const c = (mode - min) / (max - min);
    
    if (u < c) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  };

  const lognormalRandom = (mu: number, sigma: number): number => {
    const normal = normalRandom(mu, sigma);
    return Math.exp(normal);
  };

  const betaRandom = (alpha: number, beta: number): number => {
    const gamma1 = gammaRandom(alpha, 1);
    const gamma2 = gammaRandom(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  };

  const gammaRandom = (shape: number, scale: number): number => {
    // Implementação simplificada usando método de Marsaglia e Tsang
    if (shape < 1) {
      return gammaRandom(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x, v;
      do {
        x = normalRandom(0, 1);
        v = 1 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * x * x * x * x) {
        return d * v * scale;
      }
      
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  };

  const calculateSkewness = (data: number[], mean: number, stdDev: number): number => {
    const n = data.length;
    const sum = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  };

  const calculateKurtosis = (data: number[], mean: number, stdDev: number): number => {
    const n = data.length;
    const sum = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    const numerator = x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0));
    
    return numerator / (denomX * denomY);
  };

  // Implementação correta do FMEA
  const calculateFMEA = (): any => {
    const calculatedModes = fmeaAnalysis.failure_modes.map(mode => {
      const rpn = mode.severity * mode.occurrence * mode.detection;
      
      // Classificação de criticidade baseada em padrões industriais
      let criticality: string;
      let actionPriority: string;
      let riskLevel: string;
      
      if (rpn >= 200) {
        criticality = 'Crítico';
        actionPriority = 'Imediata';
        riskLevel = 'Muito Alto';
      } else if (rpn >= 100) {
        criticality = 'Alto';
        actionPriority = 'Alta';
        riskLevel = 'Alto';
      } else if (rpn >= 50) {
        criticality = 'Médio';
        actionPriority = 'Média';
        riskLevel = 'Médio';
      } else if (rpn >= 20) {
        criticality = 'Baixo';
        actionPriority = 'Baixa';
        riskLevel = 'Baixo';
      } else {
        criticality = 'Muito Baixo';
        actionPriority = 'Monitoramento';
        riskLevel = 'Muito Baixo';
      }
      
      // Cálculo do risco normalizado (0-100)
      const riskScore = Math.min(100, (rpn / 1000) * 100);
      
      // Análise de sensibilidade para cada fator
      const sensitivityAnalysis = {
        severity_impact: (mode.severity / 10) * 0.4, // 40% de peso
        occurrence_impact: (mode.occurrence / 10) * 0.4, // 40% de peso
        detection_impact: (mode.detection / 10) * 0.2 // 20% de peso
      };
      
      return {
        ...mode,
        rpn,
        criticality,
        actionPriority,
        riskLevel,
        riskScore,
        sensitivityAnalysis,
        recommendedActions: generateFMEARecommendations(mode.severity, mode.occurrence, mode.detection)
      };
    });
    
    const totalRPN = calculatedModes.reduce((sum, mode) => sum + mode.rpn, 0);
    const averageRPN = totalRPN / calculatedModes.length;
    const criticalModes = calculatedModes.filter(mode => mode.rpn >= 100);
    const highPriorityModes = calculatedModes.filter(mode => mode.rpn >= 50);
    
    return {
      failure_modes: calculatedModes,
      summary: {
        total_modes: calculatedModes.length,
        total_rpn: totalRPN,
        average_rpn: averageRPN,
        critical_modes: criticalModes.length,
        high_priority_modes: highPriorityModes.length,
        risk_distribution: {
          critical: criticalModes.length,
          high: calculatedModes.filter(mode => mode.rpn >= 100 && mode.rpn < 200).length,
          medium: calculatedModes.filter(mode => mode.rpn >= 50 && mode.rpn < 100).length,
          low: calculatedModes.filter(mode => mode.rpn < 50).length
        }
      },
      recommendations: generateOverallFMEARecommendations(calculatedModes)
    };
  };

  const generateFMEARecommendations = (severity: number, occurrence: number, detection: number): string[] => {
    const recommendations: string[] = [];
    
    if (severity >= 8) {
      recommendations.push('Implementar controles de segurança críticos');
      recommendations.push('Estabelecer procedimentos de emergência');
    }
    
    if (occurrence >= 7) {
      recommendations.push('Revisar e fortalecer controles preventivos');
      recommendations.push('Implementar monitoramento contínuo');
    }
    
    if (detection >= 7) {
      recommendations.push('Melhorar sistemas de detecção');
      recommendations.push('Implementar alertas automáticos');
    }
    
    const rpn = severity * occurrence * detection;
    if (rpn >= 200) {
      recommendations.push('Ação corretiva imediata obrigatória');
      recommendations.push('Revisão executiva necessária');
    }
    
    return recommendations;
  };

  const generateOverallFMEARecommendations = (modes: any[]): string[] => {
    const recommendations: string[] = [];
    const criticalCount = modes.filter(m => m.rpn >= 200).length;
    const highCount = modes.filter(m => m.rpn >= 100).length;
    
    if (criticalCount > 0) {
      recommendations.push(`${criticalCount} modo(s) crítico(s) requer(em) ação imediata`);
    }
    
    if (highCount > modes.length * 0.3) {
      recommendations.push('Alto número de modos de alta prioridade - revisar processo geral');
    }
    
    recommendations.push('Implementar programa de melhoria contínua');
    recommendations.push('Estabelecer revisões periódicas do FMEA');
    
    return recommendations;
  };

  // Implementação correta do Bow-Tie
  const calculateBowTieRisk = (): any => {
    const { threat_events, consequence_events, preventive_barriers, protective_barriers } = bowTieAnalysis;
    
    // Cálculo da probabilidade agregada de ameaças
    const threatProbabilities = threat_events.map(threat => {
      const barrierEffectiveness = preventive_barriers
        .filter(barrier => threat.barriers.includes(barrier.barrier))
        .reduce((total, barrier) => total * (1 - barrier.effectiveness), 1);
      
      return threat.probability * (1 - barrierEffectiveness);
    });
    
    const aggregatedThreatProbability = threatProbabilities.reduce((sum, prob) => sum + prob, 0);
    
    // Cálculo do impacto agregado de consequências
    const consequenceImpacts = consequence_events.map(consequence => {
      const barrierEffectiveness = protective_barriers
        .filter(barrier => consequence.barriers.includes(barrier.barrier))
        .reduce((total, barrier) => total * (1 - barrier.effectiveness), 1);
      
      return consequence.impact * (1 - barrierEffectiveness);
    });
    
    const aggregatedConsequenceImpact = consequenceImpacts.reduce((sum, impact) => sum + impact, 0);
    
    // Efetividade geral das barreiras
    const preventiveEffectiveness = preventive_barriers.reduce((total, barrier) => {
      return total + barrier.effectiveness;
    }, 0) / preventive_barriers.length;
    
    const protectiveEffectiveness = protective_barriers.reduce((total, barrier) => {
      return total + barrier.effectiveness;
    }, 0) / protective_barriers.length;
    
    // Cálculos de risco
    const initialRisk = threat_events.reduce((sum, threat) => sum + threat.probability, 0) * 
                       consequence_events.reduce((sum, consequence) => sum + consequence.impact, 0);
    
    const residualRisk = aggregatedThreatProbability * aggregatedConsequenceImpact;
    const riskReduction = ((initialRisk - residualRisk) / initialRisk) * 100;
    
    // Análise de criticidade das barreiras
    const barrierCriticality = [...preventive_barriers, ...protective_barriers].map(barrier => ({
      name: barrier.barrier,
      effectiveness: barrier.effectiveness,
      criticality: barrier.effectiveness > 0.9 ? 'Crítica' : barrier.effectiveness > 0.7 ? 'Alta' : 'Média',
      dependencies: barrier.dependencies,
      single_point_of_failure: barrier.dependencies.length === 0
    }));
    
    return {
      initial_risk: initialRisk,
      residual_risk: residualRisk,
      risk_reduction: riskReduction,
      threat_analysis: {
        individual_probabilities: threatProbabilities,
        aggregated_probability: aggregatedThreatProbability
      },
      consequence_analysis: {
        individual_impacts: consequenceImpacts,
        aggregated_impact: aggregatedConsequenceImpact
      },
      barrier_effectiveness: {
        preventive: preventiveEffectiveness * 100,
        protective: protectiveEffectiveness * 100,
        overall: ((preventiveEffectiveness + protectiveEffectiveness) / 2) * 100
      },
      barrier_criticality: barrierCriticality,
      recommendations: generateBowTieRecommendations(barrierCriticality, riskReduction)
    };
  };

  const generateBowTieRecommendations = (barriers: any[], riskReduction: number): string[] => {
    const recommendations: string[] = [];
    
    const criticalBarriers = barriers.filter(b => b.criticality === 'Crítica');
    const singlePointFailures = barriers.filter(b => b.single_point_of_failure);
    
    if (criticalBarriers.length > 0) {
      recommendations.push(`${criticalBarriers.length} barreira(s) crítica(s) identificada(s) - monitoramento intensivo necessário`);
    }
    
    if (singlePointFailures.length > 0) {
      recommendations.push(`${singlePointFailures.length} ponto(s) único(s) de falha - implementar redundância`);
    }
    
    if (riskReduction < 70) {
      recommendations.push('Redução de risco insuficiente - considerar barreiras adicionais');
    }
    
    recommendations.push('Implementar testes regulares de efetividade das barreiras');
    recommendations.push('Estabelecer indicadores de performance para cada barreira');
    
    return recommendations;
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
        case 'Monte Carlo':
          analysisResults.monte_carlo_results = runMonteCarloSimulation();
          break;
          
        case 'Análise de Cenários':
        case 'Scenario Analysis':
          analysisResults.scenario_analysis = calculateScenarioAnalysis();
          break;
          
        case 'FMEA (Failure Mode and Effects Analysis)':
        case 'FMEA':
          analysisResults.fmea_analysis = calculateFMEA();
          break;
          
        case 'Bow-Tie Analysis':
        case 'Bow-Tie':
          analysisResults.bow_tie_analysis = calculateBowTieRisk();
          break;
          
        case 'Value at Risk (VaR)':
        case 'VaR':
          analysisResults.var_analysis = calculateVaR();
          break;
          
        default:
          // Análise abrangente padrão
          analysisResults = {
            monte_carlo_results: runMonteCarloSimulation(),
            scenario_analysis: calculateScenarioAnalysis(),
            summary: 'Análise abrangente executada com múltiplas metodologias'
          };
      }

      // Calcular métricas de confiança e incerteza
      const confidenceLevel = calculateConfidenceLevel(analysisResults);
      const uncertaintyRange = calculateUncertaintyRange(analysisResults);

      const analysisData: AdvancedAnalysis = {
        risk_id: selectedRisk,
        methodology_id: selectedMethodology,
        analysis_type: methodology.name,
        input_parameters: {
          monte_carlo: monteCarloParams,
          scenarios: scenarioParams,
          fmea: fmeaAnalysis,
          bow_tie: bowTieAnalysis,
          analysis_timestamp: new Date().toISOString()
        },
        calculation_results: analysisResults,
        confidence_level: confidenceLevel,
        uncertainty_range: uncertaintyRange,
        assumptions: generateAssumptions(methodology.name),
        limitations: generateLimitations(methodology.name),
        recommendations: generateRecommendations(analysisResults, methodology.name),
        analyst_notes: `Análise ${methodology.name} executada em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`
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

  const calculateScenarioAnalysis = () => {
    const scenarios = Object.entries(scenarioParams).map(([key, scenario]) => ({
      scenario: key,
      probability: scenario.probability,
      impact: scenario.impact,
      expected_value: scenario.probability * scenario.impact,
      description: scenario.description
    }));

    const weightedAverage = scenarios.reduce((sum, scenario) => 
      sum + scenario.expected_value, 0) / scenarios.length;

    const probabilityWeightedAverage = scenarios.reduce((sum, scenario) => 
      sum + (scenario.probability * scenario.expected_value), 0) / 
      scenarios.reduce((sum, scenario) => sum + scenario.probability, 0);

    return {
      scenarios,
      weighted_average: weightedAverage,
      probability_weighted_average: probabilityWeightedAverage,
      range: {
        min: Math.min(...scenarios.map(s => s.expected_value)),
        max: Math.max(...scenarios.map(s => s.expected_value))
      },
      variance: calculateScenarioVariance(scenarios),
      recommendations: generateScenarioRecommendations(scenarios)
    };
  };

  const calculateScenarioVariance = (scenarios: any[]) => {
    const mean = scenarios.reduce((sum, s) => sum + s.expected_value, 0) / scenarios.length;
    return scenarios.reduce((sum, s) => sum + Math.pow(s.expected_value - mean, 2), 0) / scenarios.length;
  };

  const generateScenarioRecommendations = (scenarios: any[]) => {
    const recommendations: string[] = [];
    const worstCase = scenarios.reduce((worst, current) => 
      current.expected_value > worst.expected_value ? current : worst);
    
    recommendations.push(`Cenário ${worstCase.scenario} apresenta maior risco - foco prioritário`);
    recommendations.push('Desenvolver planos de contingência para cenários adversos');
    recommendations.push('Monitorar indicadores que possam sinalizar mudança de cenário');
    
    return recommendations;
  };

  const calculateVaR = () => {
    // Simulação simplificada para VaR
    const returns = Array.from({ length: 1000 }, () => 
      normalRandom(0.05, 0.15)); // Retornos simulados
    
    returns.sort((a, b) => a - b);
    
    const var95 = -returns[Math.floor(returns.length * 0.05)];
    const var99 = -returns[Math.floor(returns.length * 0.01)];
    const expectedShortfall = -returns.slice(0, Math.floor(returns.length * 0.05))
      .reduce((sum, ret) => sum + ret, 0) / Math.floor(returns.length * 0.05);
    
    return {
      var_95: var95,
      var_99: var99,
      expected_shortfall: expectedShortfall,
      confidence_levels: [0.95, 0.99],
      time_horizon: monteCarloParams.time_horizon
    };
  };

  const calculateConfidenceLevel = (results: any): number => {
    // Lógica para calcular nível de confiança baseado na qualidade dos dados
    let confidence = 0.8; // Base
    
    if (results.monte_carlo_results?.total_simulations >= 100000) confidence += 0.1;
    if (results.scenario_analysis?.scenarios?.length >= 4) confidence += 0.05;
    if (results.fmea_analysis?.failure_modes?.length >= 3) confidence += 0.05;
    
    return Math.min(0.99, confidence);
  };

  const calculateUncertaintyRange = (results: any) => {
    if (results.monte_carlo_results) {
      return {
        min: results.monte_carlo_results.percentiles?.find((p: any) => p.confidence === 0.05)?.value || 0,
        max: results.monte_carlo_results.percentiles?.find((p: any) => p.confidence === 0.95)?.value || 0,
        type: 'monte_carlo'
      };
    }
    
    if (results.scenario_analysis) {
      return {
        min: results.scenario_analysis.range?.min || 0,
        max: results.scenario_analysis.range?.max || 0,
        type: 'scenario'
      };
    }
    
    return { min: 0, max: 0, type: 'unknown' };
  };

  const generateAssumptions = (methodologyName: string): string[] => {
    const baseAssumptions = [
      'Dados históricos são representativos do comportamento futuro',
      'Condições de mercado permanecem relativamente estáveis',
      'Controles existentes mantêm sua efetividade'
    ];
    
    switch (methodologyName) {
      case 'Simulação Monte Carlo':
      case 'Monte Carlo':
        return [
          ...baseAssumptions,
          'Distribuições de probabilidade são adequadamente modeladas',
          'Correlações entre variáveis são constantes',
          'Número de iterações é suficiente para convergência'
        ];
      case 'FMEA':
        return [
          ...baseAssumptions,
          'Avaliações de severidade, ocorrência e detecção são precisas',
          'Modos de falha identificados são abrangentes',
          'Escalas de avaliação são consistentemente aplicadas'
        ];
      default:
        return baseAssumptions;
    }
  };

  const generateLimitations = (methodologyName: string): string[] => {
    const baseLimitations = [
      'Modelo baseado em dados históricos limitados',
      'Não considera eventos de cauda extrema',
      'Correlações podem variar ao longo do tempo'
    ];
    
    switch (methodologyName) {
      case 'Simulação Monte Carlo':
      case 'Monte Carlo':
        return [
          ...baseLimitations,
          'Qualidade dos resultados depende da precisão das distribuições',
          'Pode não capturar dependências complexas entre variáveis',
          'Resultados são sensíveis aos parâmetros de entrada'
        ];
      case 'FMEA':
        return [
          ...baseLimitations,
          'Subjetividade nas avaliações de severidade, ocorrência e detecção',
          'Pode não capturar interações entre modos de falha',
          'Efetividade limitada para sistemas complexos'
        ];
      default:
        return baseLimitations;
    }
  };

  const generateRecommendations = (results: any, methodologyName: string): string[] => {
    const recommendations: string[] = [];
    
    // Recomendações específicas baseadas nos resultados
    if (results.monte_carlo_results) {
      const var95 = results.monte_carlo_results.percentiles?.find((p: any) => p.confidence === 0.95)?.value;
      if (var95 > 1000000) {
        recommendations.push('VaR 95% elevado - considerar estratégias de mitigação adicionais');
      }
    }
    
    if (results.fmea_analysis) {
      const criticalModes = results.fmea_analysis.summary?.critical_modes || 0;
      if (criticalModes > 0) {
        recommendations.push(`${criticalModes} modo(s) crítico(s) identificado(s) - ação imediata necessária`);
      }
    }
    
    // Recomendações gerais
    recommendations.push('Implementar monitoramento contínuo dos parâmetros de risco');
    recommendations.push('Revisar e atualizar análise trimestralmente');
    recommendations.push('Validar resultados com dados reais quando disponíveis');
    
    return recommendations;
  };

  const exportAnalysis = () => {
    if (!currentAnalysis) {
      toast({
        title: 'Erro',
        description: 'Nenhuma análise selecionada para exportar',
        variant: 'destructive',
      });
      return;
    }

    const exportData = {
      analysis: currentAnalysis,
      risk_info: risks.find(r => r.id === currentAnalysis.risk_id),
      methodology_info: methodologies.find(m => m.id === currentAnalysis.methodology_id),
      export_timestamp: new Date().toISOString(),
      exported_by: user?.email
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-analysis-${currentAnalysis.analysis_type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Sucesso',
      description: 'Análise exportada com sucesso',
    });
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
          actions: [''],
          current_controls: [''],
          recommended_actions: ['']
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

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'muito alto':
      case 'crítico':
        return 'bg-red-100 text-red-800';
      case 'alto':
        return 'bg-orange-100 text-orange-800';
      case 'médio':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixo':
        return 'bg-green-100 text-green-800';
      case 'muito baixo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar se o usuário é administrador
  const isAdmin = user?.email?.includes('admin') || user?.user_metadata?.role === 'admin';

  if (showAdminPanel && isAdmin) {
    return <AdminFormulaPanel />;
  }

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
          <Button variant="outline" onClick={exportAnalysis} disabled={!currentAnalysis}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Análise
          </Button>
          
          {isAdmin && (
            <Button variant="outline" onClick={() => setShowAdminPanel(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          )}
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
                      {risk.title} - {risk.risk_category} (Score: {risk.risk_score})
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
                      <SelectItem value="beta">Beta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prob. Mín</Label>
                  <Input
                    type="number"
                    step="0.001"
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
                    step="0.001"
                    value={monteCarloParams.probability_max}
                    onChange={(e) => setMonteCarloParams({
                      ...monteCarloParams,
                      probability_max: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Prob. Média</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={monteCarloParams.probability_mean}
                    onChange={(e) => setMonteCarloParams({
                      ...monteCarloParams,
                      probability_mean: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Prob. Desvio</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={monteCarloParams.probability_std}
                    onChange={(e) => setMonteCarloParams({
                      ...monteCarloParams,
                      probability_std: parseFloat(e.target.value)
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
                    min="-1"
                    max="1"
                    value={monteCarloParams.correlation_factor}
                    onChange={(e) => setMonteCarloParams({
                      ...monteCarloParams,
                      correlation_factor: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Horizonte Temporal</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={monteCarloParams.time_horizon}
                    onChange={(e) => setMonteCarloParams({
                      ...monteCarloParams,
                      time_horizon: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label>Níveis de Confiança</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {[0.90, 0.95, 0.99, 0.999].map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        checked={monteCarloParams.confidence_levels.includes(level)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMonteCarloParams({
                              ...monteCarloParams,
                              confidence_levels: [...monteCarloParams.confidence_levels, level].sort()
                            });
                          } else {
                            setMonteCarloParams({
                              ...monteCarloParams,
                              confidence_levels: monteCarloParams.confidence_levels.filter(l => l !== level)
                            });
                          }
                        }}
                      />
                      <Label className="text-sm">{formatPercentage(level)}</Label>
                    </div>
                  ))}
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
                      min="0"
                      max="1"
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div>
                        <Label>Controles Atuais</Label>
                        <Textarea
                          value={mode.current_controls.join('\n')}
                          onChange={(e) => updateFMEAMode(index, 'current_controls', e.target.value.split('\n'))}
                          placeholder="Um controle por linha..."
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-sm font-medium">RPN: </span>
                          <Badge className={mode.rpn > 100 ? 'bg-red-100 text-red-800' : mode.rpn > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                            {mode.rpn}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {mode.rpn > 200 ? 'Crítico - Ação Imediata' : 
                           mode.rpn > 100 ? 'Alto - Ação Necessária' : 
                           mode.rpn > 50 ? 'Médio - Monitorar' : 'Baixo - Aceitável'}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updatedModes = fmeaAnalysis.failure_modes.filter((_, i) => i !== index);
                          setFmeaAnalysis({ failure_modes: updatedModes });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                        min="0"
                        max="1"
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBowTieAnalysis({
                      ...bowTieAnalysis,
                      threat_events: [...bowTieAnalysis.threat_events, { event: '', probability: 0.1, barriers: [''] }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Ameaça
                  </Button>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBowTieAnalysis({
                      ...bowTieAnalysis,
                      consequence_events: [...bowTieAnalysis.consequence_events, { event: '', impact: 100000, barriers: [''] }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Consequência
                  </Button>
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
                        min="0"
                        max="1"
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBowTieAnalysis({
                      ...bowTieAnalysis,
                      preventive_barriers: [...bowTieAnalysis.preventive_barriers, { barrier: '', effectiveness: 0.9, dependencies: [''] }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Barreira
                  </Button>
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
                        min="0"
                        max="1"
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBowTieAnalysis({
                      ...bowTieAnalysis,
                      protective_barriers: [...bowTieAnalysis.protective_barriers, { barrier: '', effectiveness: 0.9, dependencies: [''] }]
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Barreira
                  </Button>
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
              <span>Resultados da Análise - {currentAnalysis.analysis_type}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
                <TabsTrigger value="detailed">Detalhado</TabsTrigger>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                <TabsTrigger value="assumptions">Premissas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <TrendingDown className="h-8 w-8 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Expected Shortfall</p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(currentAnalysis.calculation_results.monte_carlo_results.expected_shortfall || 0)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {currentAnalysis.calculation_results.fmea_analysis && (
                    <>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <Layers className="h-8 w-8 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">RPN Médio</p>
                              <p className="text-2xl font-bold">
                                {currentAnalysis.calculation_results.fmea_analysis.summary?.average_rpn?.toFixed(0) || 0}
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
                              <p className="text-sm font-medium text-muted-foreground">Modos Críticos</p>
                              <p className="text-2xl font-bold">
                                {currentAnalysis.calculation_results.fmea_analysis.summary?.critical_modes || 0}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {currentAnalysis.calculation_results.bow_tie_analysis && (
                    <>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <Network className="h-8 w-8 text-indigo-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Redução de Risco</p>
                              <p className="text-2xl font-bold">
                                {currentAnalysis.calculation_results.bow_tie_analysis.riskReduction?.toFixed(1) || 0}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-8 w-8 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Efetividade Barreiras</p>
                              <p className="text-2xl font-bold">
                                {currentAnalysis.calculation_results.bow_tie_analysis.barrier_effectiveness?.overall?.toFixed(1) || 0}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
                
                {/* Additional Summary Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Faixa de Incerteza</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Mínimo:</span>
                          <span className="font-medium">{formatCurrency(currentAnalysis.uncertainty_range?.min || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Máximo:</span>
                          <span className="font-medium">{formatCurrency(currentAnalysis.uncertainty_range?.max || 0)}</span>
                        </div>
                        <Progress 
                          value={50} 
                          className="h-2 mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informações da Análise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Metodologia:</span>
                          <span className="font-medium">{currentAnalysis.analysis_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-medium">
                            {new Date(currentAnalysis.created_at || '').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Analista:</span>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="detailed">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultados Detalhados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                        {JSON.stringify(currentAnalysis.calculation_results, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="charts">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5" />
                        <span>Visualizações</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Gráficos e visualizações serão implementados em versão futura
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <div className="space-y-3">
                  {currentAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="assumptions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Premissas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentAnalysis.assumptions.map((assumption, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{assumption}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Limitações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentAnalysis.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Historical Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises Avançadas ({analyses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyses.slice(0, 10).map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{analysis.analysis_type}</p>
                    <p className="text-sm text-muted-foreground">
                      Risco: {(analysis as any).risk_assessments?.title || 'N/A'} | 
                      Confiança: {formatPercentage(analysis.confidence_level)} |
                      Metodologia: {(analysis as any).risk_analysis_methodologies?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.analyst_notes}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {new Date(analysis.created_at || '').toLocaleDateString('pt-BR')}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedAnalysisForDetails(analysis);
                      setShowAnalysisDetails(true);
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
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
            
            {analyses.length === 0 && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma análise avançada realizada ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Details Dialog */}
      <Dialog open={showAnalysisDetails} onOpenChange={setShowAnalysisDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Análise - {selectedAnalysisForDetails?.analysis_type}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAnalysisForDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informações Gerais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risco:</span>
                      <span>{(selectedAnalysisForDetails as any).risk_assessments?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metodologia:</span>
                      <span>{(selectedAnalysisForDetails as any).risk_analysis_methodologies?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confiança:</span>
                      <span>{formatPercentage(selectedAnalysisForDetails.confidence_level)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data:</span>
                      <span>{new Date(selectedAnalysisForDetails.created_at || '').toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Parâmetros de Entrada</h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(selectedAnalysisForDetails.input_parameters, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Resultados Principais</h4>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-64">
                  {JSON.stringify(selectedAnalysisForDetails.calculation_results, null, 2)}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Recomendações</h4>
                  <ul className="space-y-1">
                    {selectedAnalysisForDetails.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <Lightbulb className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Notas do Analista</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnalysisForDetails.analyst_notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};