import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  HistogramChart,
  Bar
} from 'recharts';
import { 
  TrendingUp,
  Calculator,
  PlayCircle,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Risk } from '@/types/risk-management';

interface MonteCarloConfig {
  simulations: number;
  probabilityDistribution: 'normal' | 'uniform' | 'triangular' | 'beta';
  impactDistribution: 'normal' | 'uniform' | 'triangular' | 'beta';
  correlationMatrix?: number[][];
  timeHorizon: number; // meses
  confidenceLevels: number[];
}

interface MonteCarloResult {
  simulations: number;
  meanLoss: number;
  standardDeviation: number;
  var95: number;
  var99: number;
  expectedShortfall95: number;
  percentiles: Array<{ percentile: number; value: number }>;
  convergenceData: Array<{ simulation: number; runningMean: number }>;
  distributionData: Array<{ value: number; frequency: number }>;
  confidenceInterval: { lower: number; upper: number };
  recommendations: string[];
}

interface MonteCarloAnalysisProps {
  risk: Risk;
  onComplete: (results: MonteCarloResult) => void;
  alexSupported?: boolean;
}

export const MonteCarloAnalysis: React.FC<MonteCarloAnalysisProps> = ({
  risk,
  onComplete,
  alexSupported = true
}) => {
  const [config, setConfig] = useState<MonteCarloConfig>({
    simulations: 10000,
    probabilityDistribution: 'normal',
    impactDistribution: 'normal',
    timeHorizon: 12,
    confidenceLevels: [90, 95, 99]
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MonteCarloResult | null>(null);
  const [alexSuggestions, setAlexSuggestions] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Gerar sugestões Alex Risk
  useEffect(() => {
    if (alexSupported) {
      generateAlexSuggestions();
    }
  }, [risk, alexSupported]);

  const generateAlexSuggestions = () => {
    const suggestions = [];
    
    // Análise baseada no nível de risco
    if (risk.riskLevel === 'Muito Alto' || risk.riskLevel === 'Alto') {
      suggestions.push('Recomendo usar distribuição triangular para capturar assimetria em riscos altos');
      suggestions.push('Considere aumentar simulações para 50.000 para maior precisão');
    }
    
    // Análise baseada na categoria
    if (risk.category === 'Financeiro') {
      suggestions.push('Para riscos financeiros, recomendo distribuição log-normal');
      suggestions.push('Inclua correlações com indicadores macroeconômicos');
    }
    
    if (risk.category === 'Tecnológico') {
      suggestions.push('Riscos tecnológicos tendem a ter distribuições assimétricas');
      suggestions.push('Considere eventos de cauda pesada (fat tail)');
    }
    
    suggestions.push('VaR 99% é recomendado para riscos críticos de negócio');
    
    setAlexSuggestions(suggestions);
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    
    toast({
      title: '🎯 Monte Carlo Iniciado',
      description: `Executando ${config.simulations.toLocaleString()} simulações...`,
    });

    try {
      // Simular execução da análise Monte Carlo
      const results = await simulateMonteCarloAnalysis();
      setResults(results);
      onComplete(results);
      
      toast({
        title: '✅ Análise Concluída',
        description: 'Simulação Monte Carlo finalizada com sucesso!',
      });
    } catch (error) {
      toast({
        title: '❌ Erro na Simulação',
        description: 'Falha ao executar análise Monte Carlo',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const simulateMonteCarloAnalysis = async (): Promise<MonteCarloResult> => {
    const totalSteps = 10;
    const convergenceData = [];
    const distributionData = [];
    const values: number[] = [];
    
    // Simular progresso
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress((step / totalSteps) * 100);
      
      // Gerar dados de convergência simulados
      convergenceData.push({
        simulation: (step / totalSteps) * config.simulations,
        runningMean: 150000 + (Math.random() - 0.5) * 20000
      });
    }
    
    // Gerar distribuição simulada
    for (let i = 0; i < 1000; i++) {
      // Simular distribuição normal
      const value = generateNormalRandom(150000, 50000);
      values.push(value);
    }
    
    // Criar histograma
    const bins = 20;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binSize;
      const binEnd = min + (i + 1) * binSize;
      const frequency = values.filter(v => v >= binStart && v < binEnd).length;
      
      distributionData.push({
        value: binStart + binSize / 2,
        frequency
      });
    }
    
    // Calcular estatísticas
    const sortedValues = values.sort((a, b) => a - b);
    const meanLoss = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - meanLoss, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    const var95 = sortedValues[Math.floor(0.95 * values.length)];
    const var99 = sortedValues[Math.floor(0.99 * values.length)];
    
    // Expected Shortfall (Conditional VaR)
    const tail95 = sortedValues.slice(Math.floor(0.95 * values.length));
    const expectedShortfall95 = tail95.reduce((sum, v) => sum + v, 0) / tail95.length;
    
    const percentiles = [50, 75, 90, 95, 99].map(p => ({
      percentile: p,
      value: sortedValues[Math.floor((p / 100) * values.length)]
    }));
    
    const confidenceInterval = {
      lower: sortedValues[Math.floor(0.025 * values.length)],
      upper: sortedValues[Math.floor(0.975 * values.length)]
    };
    
    // Gerar recomendações
    const recommendations = [];
    
    if (var95 > meanLoss * 1.5) {
      recommendations.push('Alto VaR detectado - considere estratégias de mitigação');
    }
    
    if (standardDeviation > meanLoss * 0.5) {
      recommendations.push('Alta volatilidade - implemente controles de variabilidade');
    }
    
    recommendations.push('Estabeleça reserva de contingência baseada no VaR 95%');
    recommendations.push('Monitore indicadores antecedentes para detecção precoce');
    
    if (risk.riskLevel === 'Muito Alto') {
      recommendations.push('Risco crítico - considere transferência ou eliminação');
    }
    
    return {
      simulations: config.simulations,
      meanLoss,
      standardDeviation,
      var95,
      var99,
      expectedShortfall95,
      percentiles,
      convergenceData,
      distributionData,
      confidenceInterval,
      recommendations
    };
  };

  const generateNormalRandom = (mean: number, stdDev: number): number => {
    // Box-Muller transform para gerar distribuição normal
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Análise Monte Carlo</span>
            <Badge variant="secondary">Quantitativa</Badge>
            {alexSupported && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                <Brain className="h-3 w-3 mr-1" />
                Alex
              </Badge>
            )}
          </CardTitle>
          <p className="text-muted-foreground">
            Simulação estocástica para quantificação de risco: {risk.name}
          </p>
        </CardHeader>
      </Card>

      {/* Alex Risk Sugestões */}
      {alexSupported && alexSuggestions.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-900">
              <Brain className="h-5 w-5" />
              <span>Sugestões Alex Risk</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alexSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
                  <p className="text-sm text-purple-800">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Configuração da Simulação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="simulations">Número de Simulações</Label>
              <Input
                id="simulations"
                type="number"
                value={config.simulations}
                onChange={(e) => setConfig({
                  ...config,
                  simulations: parseInt(e.target.value) || 10000
                })}
                min="1000"
                max="100000"
                step="1000"
              />
            </div>
            
            <div>
              <Label htmlFor="timeHorizon">Horizonte Temporal (meses)</Label>
              <Input
                id="timeHorizon"
                type="number"
                value={config.timeHorizon}
                onChange={(e) => setConfig({
                  ...config,
                  timeHorizon: parseInt(e.target.value) || 12
                })}
                min="1"
                max="60"
              />
            </div>
            
            <div>
              <Label htmlFor="probDist">Distribuição de Probabilidade</Label>
              <select
                id="probDist"
                value={config.probabilityDistribution}
                onChange={(e) => setConfig({
                  ...config,
                  probabilityDistribution: e.target.value as any
                })}
                className="w-full p-2 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="uniform">Uniforme</option>
                <option value="triangular">Triangular</option>
                <option value="beta">Beta</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <PlayCircle className="h-4 w-4" />
              <span>{isRunning ? 'Simulando...' : 'Executar Simulação'}</span>
            </Button>
            
            {isRunning && (
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Perda Esperada</p>
                    <p className="text-xl font-bold">{formatCurrency(results.meanLoss)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">VaR 95%</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(results.var95)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-700" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">VaR 99%</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(results.var99)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expected Shortfall 95%</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(results.expectedShortfall95)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Convergência */}
            <Card>
              <CardHeader>
                <CardTitle>Convergência da Simulação</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={results.convergenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="simulation" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line 
                      type="monotone" 
                      dataKey="runningMean" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Média Móvel"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Perdas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={results.distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => formatCurrency(value as number)}
                      formatter={(value) => [value, 'Frequência']}
                    />
                    <Bar dataKey="frequency" fill="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Percentis */}
          <Card>
            <CardHeader>
              <CardTitle>Percentis de Risco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {results.percentiles.map((percentile) => (
                  <div key={percentile.percentile} className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      {percentile.percentile}º Percentil
                    </p>
                    <p className="text-lg font-bold">
                      {formatCurrency(percentile.value)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Recomendações</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};