import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings,
  Calculator,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  Code,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Lock
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormulaValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const AdminFormulaPanel: React.FC = () => {
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState<Methodology | null>(null);
  const [editingMethodology, setEditingMethodology] = useState<Methodology | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<FormulaValidation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Fórmulas padrão corretas para cada metodologia
  const defaultFormulas = {
    'Monte Carlo': `
// Simulação Monte Carlo para Análise de Risco
function monteCarloRisk(params) {
  const { iterations, probDist, probMin, probMax, impactMin, impactMax, correlation } = params;
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    let probability, impact;
    
    // Distribuição de Probabilidade
    switch (probDist) {
      case 'normal':
        probability = normalDistribution((probMin + probMax) / 2, (probMax - probMin) / 6);
        break;
      case 'uniform':
        probability = uniformDistribution(probMin, probMax);
        break;
      case 'triangular':
        probability = triangularDistribution(probMin, probMax, (probMin + probMax) / 2);
        break;
      case 'lognormal':
        probability = lognormalDistribution(Math.log((probMin + probMax) / 2), 0.5);
        break;
      default:
        probability = uniformDistribution(probMin, probMax);
    }
    
    // Distribuição de Impacto com correlação
    const baseImpact = uniformDistribution(impactMin, impactMax);
    impact = baseImpact * (1 + correlation * (probability - 0.5) * 2);
    
    // Cálculo do Risco: P × I
    const riskValue = Math.max(0, Math.min(1, probability)) * Math.max(0, impact);
    results.push(riskValue);
  }
  
  results.sort((a, b) => a - b);
  
  return {
    mean: results.reduce((sum, val) => sum + val, 0) / results.length,
    median: results[Math.floor(results.length / 2)],
    standardDeviation: calculateStandardDeviation(results),
    var95: results[Math.floor(results.length * 0.95)],
    var99: results[Math.floor(results.length * 0.99)],
    cvar95: results.slice(Math.floor(results.length * 0.95)).reduce((sum, val) => sum + val, 0) / (results.length * 0.05),
    skewness: calculateSkewness(results),
    kurtosis: calculateKurtosis(results)
  };
}`,

    'FMEA': `
// FMEA (Failure Mode and Effects Analysis)
function fmeaAnalysis(failureModes) {
  return failureModes.map(mode => {
    // RPN = Severidade × Ocorrência × Detecção
    const rpn = mode.severity * mode.occurrence * mode.detection;
    
    // Classificação de Criticidade
    let criticality;
    if (rpn >= 200) criticality = 'Crítico';
    else if (rpn >= 100) criticality = 'Alto';
    else if (rpn >= 50) criticality = 'Médio';
    else criticality = 'Baixo';
    
    // Prioridade de Ação
    let actionPriority;
    if (mode.severity >= 9 || mode.occurrence >= 9 || rpn >= 200) {
      actionPriority = 'Imediata';
    } else if (rpn >= 100) {
      actionPriority = 'Alta';
    } else if (rpn >= 50) {
      actionPriority = 'Média';
    } else {
      actionPriority = 'Baixa';
    }
    
    return {
      ...mode,
      rpn,
      criticality,
      actionPriority,
      riskScore: (rpn / 1000) * 100 // Normalizado para 0-100
    };
  });
}`,

    'Bow-Tie': `
// Bow-Tie Analysis
function bowTieAnalysis(bowTieData) {
  const { threatEvents, consequenceEvents, preventiveBarriers, protectiveBarriers } = bowTieData;
  
  // Probabilidade agregada de ameaças
  const threatProbability = threatEvents.reduce((total, threat) => {
    return total + threat.probability * (1 - threat.barriers.reduce((barrierEff, barrier) => 
      barrierEff * (1 - barrier.effectiveness), 1));
  }, 0);
  
  // Impacto agregado de consequências
  const consequenceImpact = consequenceEvents.reduce((total, consequence) => {
    return total + consequence.impact * (1 - consequence.barriers.reduce((barrierEff, barrier) => 
      barrierEff * (1 - barrier.effectiveness), 1));
  }, 0);
  
  // Efetividade das barreiras preventivas
  const preventiveEffectiveness = preventiveBarriers.reduce((total, barrier) => {
    return total * barrier.effectiveness;
  }, 1);
  
  // Efetividade das barreiras protetivas
  const protectiveEffectiveness = protectiveBarriers.reduce((total, barrier) => {
    return total * barrier.effectiveness;
  }, 1);
  
  // Risco inicial (sem barreiras)
  const initialRisk = threatProbability * consequenceImpact;
  
  // Risco residual (com barreiras)
  const residualRisk = (threatProbability * (1 - preventiveEffectiveness)) * 
                      (consequenceImpact * (1 - protectiveEffectiveness));
  
  // Redução de risco
  const riskReduction = ((initialRisk - residualRisk) / initialRisk) * 100;
  
  return {
    initialRisk,
    residualRisk,
    riskReduction,
    preventiveEffectiveness: preventiveEffectiveness * 100,
    protectiveEffectiveness: protectiveEffectiveness * 100,
    overallEffectiveness: ((initialRisk - residualRisk) / initialRisk) * 100
  };
}`,

    'VaR': `
// Value at Risk (VaR) Calculation
function calculateVaR(returns, confidenceLevel = 0.95, timeHorizon = 1) {
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  
  // VaR Histórico
  const historicalVaR = -sortedReturns[index];
  
  // VaR Paramétrico (assumindo distribuição normal)
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
  const standardDeviation = Math.sqrt(variance);
  const zScore = getZScore(confidenceLevel);
  const parametricVaR = -(mean - zScore * standardDeviation) * Math.sqrt(timeHorizon);
  
  // Expected Shortfall (CVaR)
  const tailReturns = sortedReturns.slice(0, index);
  const expectedShortfall = tailReturns.length > 0 ? 
    -tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length : 0;
  
  return {
    historicalVaR,
    parametricVaR,
    expectedShortfall,
    confidenceLevel: confidenceLevel * 100,
    timeHorizon
  };
}`,

    'Stress Testing': `
// Stress Testing Analysis
function stressTestAnalysis(baseScenario, stressScenarios) {
  const results = stressScenarios.map(scenario => {
    // Aplicar fatores de stress
    const stressedProbability = baseScenario.probability * scenario.probabilityMultiplier;
    const stressedImpact = baseScenario.impact * scenario.impactMultiplier;
    
    // Calcular risco sob stress
    const stressedRisk = stressedProbability * stressedImpact;
    const riskIncrease = ((stressedRisk - baseScenario.baseRisk) / baseScenario.baseRisk) * 100;
    
    // Avaliar resistência dos controles
    const controlResilience = scenario.controls.map(control => ({
      name: control.name,
      baseEffectiveness: control.baseEffectiveness,
      stressedEffectiveness: control.baseEffectiveness * control.stressResistance,
      degradation: (1 - control.stressResistance) * 100
    }));
    
    return {
      scenarioName: scenario.name,
      stressedRisk,
      riskIncrease,
      controlResilience,
      overallResilience: controlResilience.reduce((avg, control) => 
        avg + control.stressedEffectiveness, 0) / controlResilience.length
    };
  });
  
  return {
    baseRisk: baseScenario.baseRisk,
    stressResults: results,
    worstCaseScenario: results.reduce((worst, current) => 
      current.stressedRisk > worst.stressedRisk ? current : worst),
    averageRiskIncrease: results.reduce((sum, result) => 
      sum + result.riskIncrease, 0) / results.length
  };
}`
  };

  useEffect(() => {
    fetchMethodologies();
  }, []);

  const fetchMethodologies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('risk_analysis_methodologies')
        .select('*')
        .order('name');

      if (error) throw error;
      setMethodologies(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar metodologias:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar metodologias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateFormula = (formula: string): FormulaValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações básicas
    if (!formula.trim()) {
      errors.push('Fórmula não pode estar vazia');
    }

    // Verificar sintaxe JavaScript básica
    try {
      new Function(formula);
    } catch (e) {
      errors.push(`Erro de sintaxe: ${e.message}`);
    }

    // Verificar palavras-chave obrigatórias
    if (!formula.includes('function')) {
      warnings.push('Fórmula deve conter pelo menos uma função');
    }

    // Verificar operações matemáticas perigosas
    if (formula.includes('eval(') || formula.includes('Function(')) {
      errors.push('Uso de eval() ou Function() não é permitido por segurança');
    }

    // Verificar imports/requires
    if (formula.includes('require(') || formula.includes('import ')) {
      errors.push('Imports externos não são permitidos');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const saveMethodology = async (methodology: Methodology) => {
    try {
      setLoading(true);

      const validation = validateFormula(methodology.calculation_formula);
      if (!validation.isValid) {
        toast({
          title: 'Erro de Validação',
          description: validation.errors.join(', '),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('risk_analysis_methodologies')
        .upsert({
          ...methodology,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await fetchMethodologies();
      setEditingMethodology(null);
      setIsDialogOpen(false);

      toast({
        title: 'Sucesso',
        description: 'Metodologia salva com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao salvar metodologia:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar metodologia',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMethodology = async (id: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('risk_analysis_methodologies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchMethodologies();

      toast({
        title: 'Sucesso',
        description: 'Metodologia removida com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao remover metodologia:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover metodologia',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportFormulas = () => {
    const exportData = {
      methodologies,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-formulas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Sucesso',
      description: 'Fórmulas exportadas com sucesso',
    });
  };

  const createNewMethodology = () => {
    const newMethodology: Methodology = {
      id: '',
      name: '',
      description: '',
      methodology_type: 'quantitative',
      framework: '',
      calculation_formula: '',
      parameters: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setEditingMethodology(newMethodology);
    setIsDialogOpen(true);
  };

  const getMethodologyTypeColor = (type: string) => {
    switch (type) {
      case 'quantitative': return 'bg-blue-100 text-blue-800';
      case 'qualitative': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>Painel Administrativo - Fórmulas de Risco</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerenciamento avançado de metodologias e fórmulas de cálculo de risco
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportFormulas}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button onClick={createNewMethodology}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Metodologia
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Acesso Restrito - Administradores</p>
              <p className="text-sm text-orange-700">
                Modificações nas fórmulas afetam todos os cálculos de risco. Use com extrema cautela.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodologies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Metodologias Disponíveis ({methodologies.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methodologies.map((methodology) => (
              <Card key={methodology.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{methodology.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={methodology.is_active}
                        onCheckedChange={async (checked) => {
                          await saveMethodology({
                            ...methodology,
                            is_active: checked
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getMethodologyTypeColor(methodology.methodology_type)}>
                      {methodology.methodology_type}
                    </Badge>
                    {methodology.framework && (
                      <Badge variant="outline">{methodology.framework}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {methodology.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Atualizado: {new Date(methodology.updated_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMethodology(methodology)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingMethodology(methodology);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMethodology(methodology.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formula Details */}
      {selectedMethodology && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Fórmula: {selectedMethodology.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="formula" className="space-y-4">
              <TabsList>
                <TabsTrigger value="formula">Fórmula</TabsTrigger>
                <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
                <TabsTrigger value="validation">Validação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="formula">
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                    {selectedMethodology.calculation_formula || 'Nenhuma fórmula definida'}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="parameters">
                <div className="space-y-4">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(selectedMethodology.parameters, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="validation">
                <div className="space-y-4">
                  {(() => {
                    const validation = validateFormula(selectedMethodology.calculation_formula);
                    return (
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          {validation.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                          <span className={validation.isValid ? 'text-green-600' : 'text-red-600'}>
                            {validation.isValid ? 'Fórmula válida' : 'Fórmula inválida'}
                          </span>
                        </div>
                        
                        {validation.errors.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-red-600">Erros:</h4>
                            {validation.errors.map((error, index) => (
                              <p key={index} className="text-sm text-red-600">• {error}</p>
                            ))}
                          </div>
                        )}
                        
                        {validation.warnings.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-orange-600">Avisos:</h4>
                            {validation.warnings.map((warning, index) => (
                              <p key={index} className="text-sm text-orange-600">• {warning}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMethodology?.id ? 'Editar Metodologia' : 'Nova Metodologia'}
            </DialogTitle>
          </DialogHeader>
          
          {editingMethodology && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Metodologia</Label>
                  <Input
                    value={editingMethodology.name}
                    onChange={(e) => setEditingMethodology({
                      ...editingMethodology,
                      name: e.target.value
                    })}
                    placeholder="Ex: Simulação Monte Carlo"
                  />
                </div>
                
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={editingMethodology.methodology_type}
                    onValueChange={(value) => setEditingMethodology({
                      ...editingMethodology,
                      methodology_type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quantitative">Quantitativa</SelectItem>
                      <SelectItem value="qualitative">Qualitativa</SelectItem>
                      <SelectItem value="hybrid">Híbrida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Framework</Label>
                  <Input
                    value={editingMethodology.framework}
                    onChange={(e) => setEditingMethodology({
                      ...editingMethodology,
                      framework: e.target.value
                    })}
                    placeholder="Ex: ISO 31000, COSO, FAIR"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingMethodology.is_active}
                    onCheckedChange={(checked) => setEditingMethodology({
                      ...editingMethodology,
                      is_active: checked
                    })}
                  />
                  <Label>Ativa</Label>
                </div>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editingMethodology.description}
                  onChange={(e) => setEditingMethodology({
                    ...editingMethodology,
                    description: e.target.value
                  })}
                  rows={3}
                  placeholder="Descreva a metodologia e sua aplicação..."
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Fórmula de Cálculo</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const defaultFormula = defaultFormulas[editingMethodology.name as keyof typeof defaultFormulas];
                        if (defaultFormula) {
                          setEditingMethodology({
                            ...editingMethodology,
                            calculation_formula: defaultFormula
                          });
                        }
                      }}
                    >
                      Usar Padrão
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const validation = validateFormula(editingMethodology.calculation_formula);
                        setValidationResult(validation);
                      }}
                    >
                      Validar
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={editingMethodology.calculation_formula}
                  onChange={(e) => setEditingMethodology({
                    ...editingMethodology,
                    calculation_formula: e.target.value
                  })}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="function calculateRisk(params) { ... }"
                />
              </div>
              
              {validationResult && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                      {validationResult.isValid ? 'Fórmula válida' : 'Fórmula inválida'}
                    </span>
                  </div>
                  
                  {validationResult.errors.length > 0 && (
                    <div className="space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">• {error}</p>
                      ))}
                    </div>
                  )}
                  
                  {validationResult.warnings.length > 0 && (
                    <div className="space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-orange-600">• {warning}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingMethodology(null);
                    setValidationResult(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => saveMethodology(editingMethodology)}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};