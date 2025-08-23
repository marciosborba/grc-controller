import React, { useState, useEffect } from 'react';
import { 
  Target,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Brain,
  Zap,
  TrendingUp,
  Filter,
  Search,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BusinessProcess {
  id: string;
  name: string;
  department: string;
  owner: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  last_audit_date: string | null;
  inherent_risk: number;
  control_risk: number;
  combined_risk: number;
  coverage_priority: number;
  regulatory_relevance: string[];
  included_in_scope: boolean;
  justification?: string;
  estimated_hours: number;
}

interface RiskFactor {
  id: string;
  name: string;
  category: 'Financial' | 'Operational' | 'Compliance' | 'Strategic' | 'IT' | 'Reputational';
  impact: number;
  likelihood: number;
  current_controls: string[];
  control_effectiveness: 'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Tested';
  mitigation_priority: 'High' | 'Medium' | 'Low';
  related_processes: string[];
}

interface ScopingCriteria {
  materiality_threshold: number;
  risk_tolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  regulatory_focus: string[];
  budget_constraint: number;
  time_constraint: number;
  resource_availability: 'High' | 'Medium' | 'Low';
  prior_audit_considerations: boolean;
  ai_optimization_enabled: boolean;
}

interface AIRecommendation {
  type: 'include' | 'exclude' | 'prioritize' | 'defer';
  process_id: string;
  confidence: number;
  reasoning: string[];
  impact_analysis: string;
  alternative_suggestions?: string[];
}

const AuditScopingMatrix: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('processes');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [scopingCriteria, setScopingCriteria] = useState<ScopingCriteria>({
    materiality_threshold: 50000,
    risk_tolerance: 'Moderate',
    regulatory_focus: [],
    budget_constraint: 500000,
    time_constraint: 120,
    resource_availability: 'Medium',
    prior_audit_considerations: true,
    ai_optimization_enabled: true
  });
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);

  // Mock data initialization
  useEffect(() => {
    const mockProcesses: BusinessProcess[] = [
      {
        id: '1',
        name: 'Contas a Receber',
        department: 'Financeiro',
        owner: 'Ana Silva',
        risk_level: 'High',
        last_audit_date: '2023-06-15',
        inherent_risk: 8.5,
        control_risk: 6.2,
        combined_risk: 7.9,
        coverage_priority: 95,
        regulatory_relevance: ['SOX', 'IFRS'],
        included_in_scope: true,
        estimated_hours: 40
      },
      {
        id: '2',
        name: 'Gestão de Acesso',
        department: 'TI',
        owner: 'Carlos Mendes',
        risk_level: 'Critical',
        last_audit_date: null,
        inherent_risk: 9.2,
        control_risk: 7.8,
        combined_risk: 8.7,
        coverage_priority: 98,
        regulatory_relevance: ['LGPD', 'ISO 27001'],
        included_in_scope: true,
        estimated_hours: 60
      },
      {
        id: '3',
        name: 'Folha de Pagamento',
        department: 'RH',
        owner: 'Marina Costa',
        risk_level: 'Medium',
        last_audit_date: '2024-01-10',
        inherent_risk: 5.8,
        control_risk: 4.2,
        combined_risk: 5.1,
        coverage_priority: 75,
        regulatory_relevance: ['CLT', 'Tributário'],
        included_in_scope: false,
        estimated_hours: 25
      },
      {
        id: '4',
        name: 'Compras e Procurement',
        department: 'Suprimentos',
        owner: 'Roberto Santos',
        risk_level: 'High',
        last_audit_date: '2023-03-20',
        inherent_risk: 7.6,
        control_risk: 5.9,
        combined_risk: 6.9,
        coverage_priority: 85,
        regulatory_relevance: ['Lei 8666', 'Anticorrupção'],
        included_in_scope: true,
        estimated_hours: 45
      },
      {
        id: '5',
        name: 'Backup e Recuperação',
        department: 'TI',
        owner: 'Lucas Oliveira',
        risk_level: 'Medium',
        last_audit_date: '2024-02-05',
        inherent_risk: 6.1,
        control_risk: 3.8,
        combined_risk: 5.2,
        coverage_priority: 70,
        regulatory_relevance: ['LGPD'],
        included_in_scope: false,
        estimated_hours: 20
      }
    ];

    const mockRiskFactors: RiskFactor[] = [
      {
        id: '1',
        name: 'Fraude em Recebíveis',
        category: 'Financial',
        impact: 9,
        likelihood: 6,
        current_controls: ['Segregação de funções', 'Aprovações em camadas', 'Reconciliações'],
        control_effectiveness: 'Partially Effective',
        mitigation_priority: 'High',
        related_processes: ['1']
      },
      {
        id: '2',
        name: 'Acesso Não Autorizado',
        category: 'IT',
        impact: 8,
        likelihood: 7,
        current_controls: ['Autenticação multifator', 'Monitoramento de acesso', 'Revisões periódicas'],
        control_effectiveness: 'Effective',
        mitigation_priority: 'High',
        related_processes: ['2']
      },
      {
        id: '3',
        name: 'Erro em Cálculos de Folha',
        category: 'Operational',
        impact: 5,
        likelihood: 4,
        current_controls: ['Validações automáticas', 'Dupla conferência', 'Testes mensais'],
        control_effectiveness: 'Effective',
        mitigation_priority: 'Medium',
        related_processes: ['3']
      }
    ];

    setBusinessProcesses(mockProcesses);
    setRiskFactors(mockRiskFactors);
  }, []);

  // AI Analysis simulation
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const recommendations: AIRecommendation[] = [
      {
        type: 'include',
        process_id: '2',
        confidence: 96,
        reasoning: [
          'Alto risco inerente (9.2/10)',
          'Nunca foi auditado',
          'Relevância regulatória crítica (LGPD)',
          'Controles com efetividade parcial'
        ],
        impact_analysis: 'Inclusão obrigatória devido ao nível crítico de risco e requisitos regulatórios.',
        alternative_suggestions: ['Considerar auditoria contínua para este processo']
      },
      {
        type: 'prioritize',
        process_id: '1',
        confidence: 89,
        reasoning: [
          'Histórico de vulnerabilidades',
          'Alto impacto financeiro',
          'Controles parcialmente efetivos',
          'Última auditoria há mais de 6 meses'
        ],
        impact_analysis: 'Priorização alta recomendada para reduzir exposição ao risco.',
      },
      {
        type: 'defer',
        process_id: '5',
        confidence: 82,
        reasoning: [
          'Auditoria recente (fevereiro 2024)',
          'Controles efetivos',
          'Risco baixo a médio',
          'Recursos podem ser alocados para áreas de maior risco'
        ],
        impact_analysis: 'Pode ser diferido para próximo ciclo sem impacto significativo no risco.',
        alternative_suggestions: ['Implementar monitoramento contínuo automático']
      },
      {
        type: 'include',
        process_id: '4',
        confidence: 91,
        reasoning: [
          'Alto risco de compliance',
          'Múltiplas regulamentações aplicáveis',
          'Exposição a riscos de corrupção',
          'Volume significativo de transações'
        ],
        impact_analysis: 'Inclusão recomendada devido ao risco regulatório e reputacional.',
      }
    ];

    setAiRecommendations(recommendations);
    setShowAIRecommendations(true);
    setIsAnalyzing(false);
    
    toast({
      title: 'Análise de IA Concluída',
      description: `${recommendations.length} recomendações geradas com base em análise de risco e critérios.`,
    });
  };

  const applyAIRecommendation = (recommendation: AIRecommendation) => {
    setBusinessProcesses(prev => prev.map(process => {
      if (process.id === recommendation.process_id) {
        const shouldInclude = recommendation.type === 'include' || recommendation.type === 'prioritize';
        return {
          ...process,
          included_in_scope: shouldInclude,
          justification: recommendation.impact_analysis
        };
      }
      return process;
    }));

    toast({
      title: 'Recomendação Aplicada',
      description: `A recomendação para ${businessProcesses.find(p => p.id === recommendation.process_id)?.name} foi aplicada.`,
    });
  };

  const toggleProcessInScope = (processId: string) => {
    setBusinessProcesses(prev => prev.map(process => 
      process.id === processId 
        ? { ...process, included_in_scope: !process.included_in_scope }
        : process
    ));
  };

  const updateScopingCriteria = (field: keyof ScopingCriteria, value: any) => {
    setScopingCriteria(prev => ({ ...prev, [field]: value }));
  };

  const getRiskColor = (level: string) => {
    const colors = {
      'Low': 'text-green-600 bg-green-100 border-green-200',
      'Medium': 'text-yellow-600 bg-yellow-100 border-yellow-200',
      'High': 'text-orange-600 bg-orange-100 border-orange-200',
      'Critical': 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const filteredProcesses = businessProcesses.filter(process => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || process.department === departmentFilter;
    const matchesRisk = riskFilter === 'all' || process.risk_level === riskFilter;
    return matchesSearch && matchesDepartment && matchesRisk;
  });

  const scopedProcesses = businessProcesses.filter(p => p.included_in_scope);
  const totalEstimatedHours = scopedProcesses.reduce((sum, p) => sum + p.estimated_hours, 0);
  const averageRisk = scopedProcesses.length > 0 
    ? scopedProcesses.reduce((sum, p) => sum + p.combined_risk, 0) / scopedProcesses.length 
    : 0;

  const departments = Array.from(new Set(businessProcesses.map(p => p.department)));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Matriz de Escopo de Auditoria
          </h1>
          <p className="text-gray-600 mt-1">
            Defina o escopo da auditoria com base em riscos e critérios estratégicos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Análise de IA
              </>
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processos no Escopo</p>
                <p className="text-2xl font-bold text-blue-600">{scopedProcesses.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Horas Estimadas</p>
                <p className="text-2xl font-bold text-orange-600">{totalEstimatedHours}h</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risco Médio</p>
                <p className="text-2xl font-bold text-red-600">{averageRisk.toFixed(1)}/10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cobertura de Risco</p>
                <p className="text-2xl font-bold text-green-600">
                  {scopedProcesses.length > 0 ? Math.round((scopedProcesses.reduce((sum, p) => sum + p.coverage_priority, 0) / scopedProcesses.length)) : 0}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {showAIRecommendations && aiRecommendations.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-5 w-5" />
              Recomendações de IA para Escopo
            </CardTitle>
            <CardDescription>
              Análise inteligente baseada em risco, histórico e critérios de auditoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiRecommendations.map((rec, index) => {
              const process = businessProcesses.find(p => p.id === rec.process_id);
              return (
                <div key={index} className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-2",
                          rec.type === 'include' ? 'border-green-200 text-green-700 bg-green-50' :
                          rec.type === 'prioritize' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          rec.type === 'defer' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                          'border-red-200 text-red-700 bg-red-50'
                        )}
                      >
                        {rec.type === 'include' ? 'Incluir' :
                         rec.type === 'prioritize' ? 'Priorizar' :
                         rec.type === 'defer' ? 'Diferir' : 'Excluir'}
                      </Badge>
                      <span className="font-medium text-gray-900">{process?.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {rec.confidence}% confiança
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyAIRecommendation(rec)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      Aplicar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Análise de Impacto:</p>
                      <p className="text-sm text-gray-600">{rec.impact_analysis}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Justificativa:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.reasoning.map((reason, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {rec.alternative_suggestions && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Sugestões Alternativas:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {rec.alternative_suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Lightbulb className="w-3 h-3 text-yellow-500" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full">
          <TabsTrigger value="processes">Processos de Negócio</TabsTrigger>
          <TabsTrigger value="risks">Fatores de Risco</TabsTrigger>
          <TabsTrigger value="criteria">Critérios de Escopo</TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar processos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Departamentos</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Nível de Risco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Riscos</SelectItem>
                    <SelectItem value="Critical">Crítico</SelectItem>
                    <SelectItem value="High">Alto</SelectItem>
                    <SelectItem value="Medium">Médio</SelectItem>
                    <SelectItem value="Low">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Processes Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Escopo</TableHead>
                    <TableHead>Processo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Risco</TableHead>
                    <TableHead>Última Auditoria</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Horas Est.</TableHead>
                    <TableHead>Regulamentação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses.map((process) => (
                    <TableRow key={process.id} className={process.included_in_scope ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={process.included_in_scope}
                          onCheckedChange={() => toggleProcessInScope(process.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{process.name}</p>
                          <p className="text-sm text-gray-600">Responsável: {process.owner}</p>
                        </div>
                      </TableCell>
                      <TableCell>{process.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRiskColor(process.risk_level)}>
                          {process.risk_level}
                        </Badge>
                        <div className="text-xs text-gray-600 mt-1">
                          Score: {process.combined_risk.toFixed(1)}/10
                        </div>
                      </TableCell>
                      <TableCell>
                        {process.last_audit_date ? (
                          <span className="text-sm">
                            {new Date(process.last_audit_date).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
                            Nunca auditado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={process.coverage_priority} className="w-16 h-2" />
                          <span className="text-sm">{process.coverage_priority}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{process.estimated_hours}h</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {process.regulatory_relevance.slice(0, 2).map((reg, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reg}
                            </Badge>
                          ))}
                          {process.regulatory_relevance.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{process.regulatory_relevance.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fatores de Risco Identificados</CardTitle>
              <CardDescription>
                Análise de riscos que impactam os processos de negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((risk) => (
                  <Card key={risk.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <span className="font-medium">{risk.name}</span>
                            <Badge variant="outline">{risk.category}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Impacto:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={risk.impact * 10} className="w-16 h-2" />
                                <span>{risk.impact}/10</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Probabilidade:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={risk.likelihood * 10} className="w-16 h-2" />
                                <span>{risk.likelihood}/10</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Efetividade dos Controles:</span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "ml-2",
                                risk.control_effectiveness === 'Effective' ? 'border-green-200 text-green-700 bg-green-50' :
                                risk.control_effectiveness === 'Partially Effective' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                'border-red-200 text-red-700 bg-red-50'
                              )}
                            >
                              {risk.control_effectiveness}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Controles Atuais:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {risk.current_controls.map((control, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {control}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Definição de Escopo</CardTitle>
              <CardDescription>
                Configure os parâmetros para definição inteligente do escopo de auditoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Limite de Materialidade (R$)</Label>
                  <Input
                    type="number"
                    value={scopingCriteria.materiality_threshold}
                    onChange={(e) => updateScopingCriteria('materiality_threshold', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Tolerância ao Risco</Label>
                  <Select 
                    value={scopingCriteria.risk_tolerance} 
                    onValueChange={(value) => updateScopingCriteria('risk_tolerance', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conservative">Conservadora</SelectItem>
                      <SelectItem value="Moderate">Moderada</SelectItem>
                      <SelectItem value="Aggressive">Agressiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Orçamento Disponível (R$)</Label>
                  <Input
                    type="number"
                    value={scopingCriteria.budget_constraint}
                    onChange={(e) => updateScopingCriteria('budget_constraint', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Limite de Tempo (horas)</Label>
                  <Input
                    type="number"
                    value={scopingCriteria.time_constraint}
                    onChange={(e) => updateScopingCriteria('time_constraint', parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Disponibilidade de Recursos</Label>
                  <Select 
                    value={scopingCriteria.resource_availability} 
                    onValueChange={(value) => updateScopingCriteria('resource_availability', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">Alta</SelectItem>
                      <SelectItem value="Medium">Média</SelectItem>
                      <SelectItem value="Low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Considerar Auditorias Anteriores</Label>
                      <p className="text-xs text-gray-600">Incluir histórico de auditorias na análise</p>
                    </div>
                    <Switch
                      checked={scopingCriteria.prior_audit_considerations}
                      onCheckedChange={(checked) => updateScopingCriteria('prior_audit_considerations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Otimização de IA</Label>
                      <p className="text-xs text-gray-600">Usar IA para otimizar definição de escopo</p>
                    </div>
                    <Switch
                      checked={scopingCriteria.ai_optimization_enabled}
                      onCheckedChange={(checked) => updateScopingCriteria('ai_optimization_enabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Foco Regulatório</Label>
                <Textarea
                  placeholder="Digite as regulamentações prioritárias (ex: SOX, LGPD, ISO 27001)..."
                  value={scopingCriteria.regulatory_focus.join(', ')}
                  onChange={(e) => updateScopingCriteria('regulatory_focus', e.target.value.split(',').map(s => s.trim()))}
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditScopingMatrix;