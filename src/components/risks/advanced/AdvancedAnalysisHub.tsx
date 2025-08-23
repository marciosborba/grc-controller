import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Calculator,
  GitBranch,
  AlertTriangle,
  Activity,
  Lightbulb,
  Settings,
  Download,
  PlayCircle,
  PauseCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Risk } from '@/types/risk-management';

// Importar metodologias
import { MonteCarloAnalysis } from './methodologies/MonteCarloAnalysis';
import { FMEAAnalysis } from './methodologies/FMEAAnalysis';
import { BowTieAnalysis } from './methodologies/BowTieAnalysis';
import { GUTAnalysis } from './methodologies/GUTAnalysis';
import { VABAnalysis } from './methodologies/VABAnalysis';
import { CorrelationAnalysis } from './methodologies/CorrelationAnalysis';

interface AdvancedAnalysisHubProps {
  risks: Risk[];
  selectedRisk?: Risk;
  onAnalysisComplete: (analysis: any) => void;
}

interface AnalysisMethodology {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  complexity: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: string;
  requiredData: string[];
  alexSupported: boolean;
  category: 'quantitative' | 'qualitative' | 'hybrid';
}

interface AnalysisSession {
  id: string;
  methodology: string;
  riskId?: string;
  status: 'configuring' | 'running' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  results?: any;
  config?: any;
}

export const AdvancedAnalysisHub: React.FC<AdvancedAnalysisHubProps> = ({
  risks,
  selectedRisk,
  onAnalysisComplete
}) => {
  const [activeSessions, setActiveSessions] = useState<AnalysisSession[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const methodologies: AnalysisMethodology[] = [
    {
      id: 'monte-carlo',
      name: 'Monte Carlo',
      description: 'Simulação estocástica para quantificação de risco com distribuições de probabilidade',
      icon: TrendingUp,
      complexity: 'advanced',
      estimatedTime: '5-15 min',
      requiredData: ['Distribuições de probabilidade', 'Impactos financeiros', 'Correlações'],
      alexSupported: true,
      category: 'quantitative'
    },
    {
      id: 'fmea',
      name: 'FMEA',
      description: 'Failure Mode and Effects Analysis - Análise sistemática de modos de falha',
      icon: GitBranch,
      complexity: 'intermediate',
      estimatedTime: '10-30 min',
      requiredData: ['Processos', 'Modos de falha', 'Efeitos', 'Controles'],
      alexSupported: true,
      category: 'qualitative'
    },
    {
      id: 'bow-tie',
      name: 'Bow-Tie',
      description: 'Análise de causas e consequências com barreiras preventivas e mitigadoras',
      icon: Target,
      complexity: 'intermediate',
      estimatedTime: '15-45 min',
      requiredData: ['Evento central', 'Causas', 'Consequências', 'Barreiras'],
      alexSupported: true,
      category: 'hybrid'
    },
    {
      id: 'gut',
      name: 'Matriz GUT',
      description: 'Gravidade, Urgência e Tendência - Priorização de riscos',
      icon: Calculator,
      complexity: 'basic',
      estimatedTime: '2-5 min',
      requiredData: ['Gravidade', 'Urgência', 'Tendência'],
      alexSupported: true,
      category: 'qualitative'
    },
    {
      id: 'vab',
      name: 'Value at Business (VaB)',
      description: 'Quantificação do valor em risco para o negócio',
      icon: BarChart3,
      complexity: 'advanced',
      estimatedTime: '10-20 min',
      requiredData: ['Receitas', 'Custos', 'Probabilidades', 'Impactos operacionais'],
      alexSupported: true,
      category: 'quantitative'
    },
    {
      id: 'correlation',
      name: 'Análise de Correlação',
      description: 'Identificação de correlações e dependências entre riscos',
      icon: Activity,
      complexity: 'intermediate',
      estimatedTime: '5-10 min',
      requiredData: ['Histórico de riscos', 'Dados temporais', 'Categorias'],
      alexSupported: true,
      category: 'quantitative'
    }
  ];

  const startAnalysis = async (methodologyId: string, riskId?: string) => {
    const methodology = methodologies.find(m => m.id === methodologyId);
    if (!methodology) return;

    const sessionId = `session-${Date.now()}`;
    const newSession: AnalysisSession = {
      id: sessionId,
      methodology: methodologyId,
      riskId,
      status: 'configuring',
      progress: 0,
      startTime: new Date()
    };

    setActiveSessions(prev => [...prev, newSession]);
    setIsAnalyzing(true);

    toast({
      title: '🔬 Análise Iniciada',
      description: `Configurando análise ${methodology.name}...`,
    });

    // Simular configuração
    setTimeout(() => {
      updateSession(sessionId, { status: 'running', progress: 10 });
      runAnalysis(sessionId);
    }, 2000);
  };

  const runAnalysis = async (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    const methodology = methodologies.find(m => m.id === session.methodology);
    if (!methodology) return;

    // Simular progresso da análise
    for (let progress = 20; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateSession(sessionId, { progress });
    }

    // Gerar resultados baseados na metodologia
    const results = await generateAnalysisResults(session.methodology, session.riskId);
    
    updateSession(sessionId, { 
      status: 'completed', 
      progress: 100, 
      results 
    });

    setIsAnalyzing(false);
    onAnalysisComplete(results);

    toast({
      title: '✅ Análise Concluída',
      description: `${methodology.name} finalizada com sucesso!`,
    });
  };

  const updateSession = (sessionId: string, updates: Partial<AnalysisSession>) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      )
    );
  };

  const generateAnalysisResults = async (methodologyId: string, riskId?: string) => {
    const baseRisk = riskId ? risks.find(r => r.id === riskId) : null;
    
    switch (methodologyId) {
      case 'monte-carlo':
        return {
          type: 'monte-carlo',
          simulations: 10000,
          confidence: 0.95,
          var95: baseRisk ? baseRisk.riskScore * 1.5 * 100000 : 250000,
          expectedValue: baseRisk ? baseRisk.riskScore * 75000 : 150000,
          standardDeviation: 50000,
          percentiles: [
            { confidence: 0.5, value: baseRisk ? baseRisk.riskScore * 75000 : 150000 },
            { confidence: 0.9, value: baseRisk ? baseRisk.riskScore * 1.2 * 100000 : 200000 },
            { confidence: 0.95, value: baseRisk ? baseRisk.riskScore * 1.5 * 100000 : 250000 },
            { confidence: 0.99, value: baseRisk ? baseRisk.riskScore * 2 * 100000 : 400000 }
          ],
          distribution: 'normal',
          recommendations: [
            'Implementar controles para reduzir VaR em 30%',
            'Estabelecer reserva de contingência baseada no VaR 95%',
            'Monitorar indicadores antecedentes'
          ]
        };

      case 'fmea':
        return {
          type: 'fmea',
          failureModes: [
            {
              mode: 'Falha no sistema principal',
              severity: 8,
              occurrence: 6,
              detection: 4,
              rpn: 192,
              actions: ['Implementar redundância', 'Melhorar monitoramento']
            },
            {
              mode: 'Erro humano operacional',
              severity: 6,
              occurrence: 7,
              detection: 3,
              rpn: 126,
              actions: ['Treinamento adicional', 'Automação de processos']
            }
          ],
          overallRPN: 159,
          criticalModes: 2,
          recommendations: [
            'Focar nos modos de falha com RPN > 150',
            'Melhorar capacidade de detecção',
            'Implementar controles preventivos'
          ]
        };

      case 'bow-tie':
        return {
          type: 'bow-tie',
          centralEvent: baseRisk?.name || 'Evento de risco identificado',
          threats: [
            { name: 'Falha técnica', probability: 0.3, barriers: ['Manutenção preventiva', 'Monitoramento'] },
            { name: 'Erro humano', probability: 0.4, barriers: ['Treinamento', 'Procedimentos'] },
            { name: 'Fatores externos', probability: 0.2, barriers: ['Plano de contingência'] }
          ],
          consequences: [
            { name: 'Perda financeira', impact: 'Alto', barriers: ['Seguro', 'Reservas'] },
            { name: 'Dano reputacional', impact: 'Médio', barriers: ['Comunicação de crise'] }
          ],
          barrierEffectiveness: 0.75,
          residualRisk: 'Médio',
          recommendations: [
            'Fortalecer barreiras preventivas',
            'Implementar barreiras de recuperação',
            'Testar efetividade das barreiras'
          ]
        };

      case 'gut':
        return {
          type: 'gut',
          gravity: baseRisk ? Math.min(5, Math.ceil(baseRisk.impact)) : 4,
          urgency: baseRisk ? Math.min(5, Math.ceil(baseRisk.probability)) : 3,
          tendency: 4,
          gutScore: baseRisk ? Math.min(5, Math.ceil(baseRisk.impact)) * Math.min(5, Math.ceil(baseRisk.probability)) * 4 : 48,
          priority: 'Alta',
          ranking: 1,
          recommendations: [
            'Ação imediata requerida',
            'Alocar recursos prioritários',
            'Monitoramento contínuo'
          ]
        };

      case 'vab':
        return {
          type: 'vab',
          businessValue: 5000000,
          valueAtRisk: baseRisk ? baseRisk.riskScore * 200000 : 800000,
          percentageAtRisk: baseRisk ? (baseRisk.riskScore * 200000) / 5000000 * 100 : 16,
          timeHorizon: '1 ano',
          confidenceLevel: 95,
          scenarios: [
            { name: 'Melhor caso', probability: 0.2, impact: 0.02 },
            { name: 'Caso base', probability: 0.6, impact: 0.16 },
            { name: 'Pior caso', probability: 0.2, impact: 0.35 }
          ],
          recommendations: [
            'Implementar hedge estratégico',
            'Diversificar exposições',
            'Estabelecer limites de exposição'
          ]
        };

      case 'correlation':
        return {
          type: 'correlation',
          correlations: [
            { risk1: 'Risco Tecnológico', risk2: 'Risco Operacional', coefficient: 0.75, strength: 'Forte' },
            { risk1: 'Risco Financeiro', risk2: 'Risco Estratégico', coefficient: 0.45, strength: 'Moderada' },
            { risk1: 'Risco Regulatório', risk2: 'Risco Reputacional', coefficient: 0.85, strength: 'Muito Forte' }
          ],
          clusters: [
            { name: 'Cluster Operacional', risks: ['Tecnológico', 'Processos', 'Pessoas'], strength: 0.8 },
            { name: 'Cluster Estratégico', risks: ['Mercado', 'Competição', 'Regulatório'], strength: 0.65 }
          ],
          diversificationBenefit: 0.25,
          recommendations: [
            'Gerenciar riscos em clusters',
            'Implementar controles transversais',
            'Monitorar correlações dinamicamente'
          ]
        };

      default:
        return {
          type: 'generic',
          message: 'Análise concluída com sucesso',
          recommendations: ['Revisar resultados', 'Implementar ações']
        };
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quantitative': return 'bg-blue-100 text-blue-800';
      case 'qualitative': return 'bg-purple-100 text-purple-800';
      case 'hybrid': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMethodologyCard = (methodology: AnalysisMethodology) => {
    const Icon = methodology.icon;
    const isRunning = activeSessions.some(s => s.methodology === methodology.id && s.status !== 'completed');
    
    return (
      <Card 
        key={methodology.id} 
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedMethodology === methodology.id ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => setSelectedMethodology(methodology.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{methodology.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className={getComplexityColor(methodology.complexity)}>
                    {methodology.complexity}
                  </Badge>
                  <Badge variant="outline" className={getCategoryColor(methodology.category)}>
                    {methodology.category}
                  </Badge>
                  {methodology.alexSupported && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      <Brain className="h-3 w-3 mr-1" />
                      Alex
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {isRunning ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs text-muted-foreground">Executando...</span>
              </div>
            ) : (
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  startAnalysis(methodology.id, selectedRisk?.id);
                }}
                disabled={isAnalyzing}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Executar
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            {methodology.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Tempo estimado:</span>
              <span className="font-medium">{methodology.estimatedTime}</span>
            </div>
            
            <div className="text-xs">
              <span className="text-muted-foreground">Dados necessários:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {methodology.requiredData.slice(0, 2).map((data, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {data}
                  </Badge>
                ))}
                {methodology.requiredData.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{methodology.requiredData.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>Centro de Análises Avançadas</span>
            <Badge variant="secondary">6 metodologias</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Metodologias avançadas de análise de risco com suporte do Alex Risk
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="methodologies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="methodologies">Metodologias</TabsTrigger>
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="methodologies" className="space-y-6">
          {/* Seleção de Risco */}
          {selectedRisk && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Analisando: {selectedRisk.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRisk.category} • Score: {selectedRisk.riskScore} • {selectedRisk.riskLevel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grid de Metodologias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methodologies.map(renderMethodologyCard)}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Sessões de Análise</span>
                <Badge variant="secondary">{activeSessions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.length === 0 ? (
                <div className="text-center py-8">
                  <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma sessão ativa</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.map((session) => {
                    const methodology = methodologies.find(m => m.id === session.methodology);
                    if (!methodology) return null;

                    return (
                      <div key={session.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <methodology.icon className="h-4 w-4" />
                            <span className="font-medium">{methodology.name}</span>
                            <Badge variant={
                              session.status === 'completed' ? 'default' :
                              session.status === 'error' ? 'destructive' :
                              'secondary'
                            }>
                              {session.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {session.progress}%
                          </span>
                        </div>
                        <Progress value={session.progress} className="mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Iniciado em {session.startTime.toLocaleTimeString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Resultados das Análises</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.filter(s => s.status === 'completed').length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum resultado disponível</p>
                  <p className="text-sm text-muted-foreground">Execute uma análise para ver os resultados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions
                    .filter(s => s.status === 'completed')
                    .map((session) => {
                      const methodology = methodologies.find(m => m.id === session.methodology);
                      if (!methodology || !session.results) return null;

                      return (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <methodology.icon className="h-4 w-4" />
                              <span className="font-medium">{methodology.name}</span>
                              <Badge variant="default">Concluído</Badge>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Exportar
                            </Button>
                          </div>
                          
                          {/* Renderizar resultados específicos */}
                          <div className="bg-muted/50 rounded p-3">
                            <pre className="text-xs overflow-auto">
                              {JSON.stringify(session.results, null, 2)}
                            </pre>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};