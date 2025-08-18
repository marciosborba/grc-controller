import React, { useState, useEffect } from 'react';
import { 
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Upload,
  Brain,
  Zap,
  AlertTriangle,
  Info,
  Camera,
  Mic,
  Download,
  Share,
  Star,
  Settings,
  Eye,
  Target,
  Users,
  Calendar,
  MessageSquare,
  Bot,
  Sparkles,
  ClipboardCheck,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuditProcedure {
  id: string;
  step_number: number;
  title: string;
  description: string;
  procedure_type: string;
  objective: string;
  instructions: string;
  sample_size?: number;
  estimated_hours: number;
  actual_hours?: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Not Applicable';
  assigned_to: string;
  planned_completion: string;
  actual_completion?: string;
  results?: string;
  exceptions?: string;
  conclusion?: string;
  evidence_requirements: string[];
  working_paper_reference?: string;
  ai_suggested: boolean;
  ai_automation_possible: boolean;
  ai_generated_instructions?: string;
}

interface Evidence {
  id: string;
  title: string;
  description: string;
  evidence_type: string;
  file_name?: string;
  file_url?: string;
  collected_at: string;
  collected_by: string;
  reliability: 'High' | 'Medium' | 'Low';
  relevance: 'High' | 'Medium' | 'Low';
  ai_analyzed: boolean;
  ai_extracted_metadata?: any;
}

interface AIInsight {
  type: 'suggestion' | 'warning' | 'automation' | 'finding';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  procedure_id?: string;
}

const AuditExecutionWorkspace: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('procedures');
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alexAssistantActive, setAlexAssistantActive] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  const [procedures, setProcedures] = useState<AuditProcedure[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [currentTimer, setCurrentTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Mock data initialization
  useEffect(() => {
    const mockProcedures: AuditProcedure[] = [
      {
        id: '1',
        step_number: 1,
        title: 'Teste de Segregação de Funções - Contas a Receber',
        description: 'Avaliar se existe segregação adequada entre as funções de registro, aprovação e cobrança de recebíveis',
        procedure_type: 'Inquiry',
        objective: 'Verificar a existência e efetividade dos controles de segregação de funções',
        instructions: 'Entrevistar os responsáveis pelos processos de AR e solicitar matriz de responsabilidades. Testar uma amostra de 25 transações para verificar se o mesmo usuário não executa funções incompatíveis.',
        sample_size: 25,
        estimated_hours: 8,
        actual_hours: 6.5,
        status: 'Completed',
        assigned_to: 'Ana Silva',
        planned_completion: '2025-01-20',
        actual_completion: '2025-01-19',
        results: 'Identificamos segregação adequada na maioria dos casos. 2 exceções encontradas onde o mesmo usuário aprova e registra.',
        exceptions: 'Usuário JSILVA tem perfis de aprovação e registro simultâneos. Usuário MCARLOS aprovou transações que ele mesmo criou.',
        conclusion: 'Controle parcialmente efetivo. Requer ajustes nos perfis de acesso.',
        evidence_requirements: ['Matriz de responsabilidades', 'Log de aprovações', 'Perfis de usuário'],
        working_paper_reference: 'WP-AR-001',
        ai_suggested: true,
        ai_automation_possible: true,
        ai_generated_instructions: 'Instrução gerada automaticamente baseada em melhores práticas SOX para segregação de funções em processos de AR.'
      },
      {
        id: '2',
        step_number: 2,
        title: 'Teste de Controles de Acesso Privilegiado',
        description: 'Avaliar os controles sobre acessos privilegiados ao sistema ERP',
        procedure_type: 'System Testing',
        objective: 'Verificar se os acessos privilegiados são adequadamente controlados e monitorados',
        instructions: 'Extrair relatório de usuários com acesso administrativo. Verificar aprovações, revisões periódicas e monitoramento de atividades.',
        estimated_hours: 12,
        status: 'In Progress',
        assigned_to: 'Carlos Mendes',
        planned_completion: '2025-01-22',
        evidence_requirements: ['Relatório de usuários admin', 'Log de aprovações', 'Evidências de revisão'],
        working_paper_reference: 'WP-IT-001',
        ai_suggested: false,
        ai_automation_possible: true
      },
      {
        id: '3',
        step_number: 3,
        title: 'Análise de Reconciliações Bancárias',
        description: 'Testar a efetividade das reconciliações bancárias mensais',
        procedure_type: 'Inspection',
        objective: 'Verificar se as reconciliações são executadas tempestivamente e revisadas adequadamente',
        instructions: 'Selecionar 3 meses para teste. Verificar se reconciliações foram preparadas até o 5º dia útil e revisadas pelo supervisor.',
        sample_size: 3,
        estimated_hours: 6,
        status: 'Not Started',
        assigned_to: 'Marina Costa',
        planned_completion: '2025-01-25',
        evidence_requirements: ['Reconciliações bancárias', 'Evidências de revisão', 'Extratos bancários'],
        working_paper_reference: 'WP-CASH-001',
        ai_suggested: true,
        ai_automation_possible: false
      }
    ];

    const mockEvidence: Evidence[] = [
      {
        id: '1',
        title: 'Matriz de Responsabilidades AR',
        description: 'Documento oficial com definição de responsabilidades do processo de contas a receber',
        evidence_type: 'Document',
        file_name: 'matriz_responsabilidades_ar.pdf',
        file_url: '/files/evidence/matriz_ar.pdf',
        collected_at: '2025-01-19T10:30:00Z',
        collected_by: 'Ana Silva',
        reliability: 'High',
        relevance: 'High',
        ai_analyzed: true,
        ai_extracted_metadata: {
          document_type: 'policy',
          last_update: '2024-06-15',
          approval_status: 'approved',
          key_roles: ['AR Analyst', 'AR Supervisor', 'Credit Manager']
        }
      },
      {
        id: '2',
        title: 'Screenshots - Perfis de Usuário',
        description: 'Capturas de tela dos perfis de acesso dos usuários testados',
        evidence_type: 'Screenshots',
        collected_at: '2025-01-19T14:20:00Z',
        collected_by: 'Ana Silva',
        reliability: 'High',
        relevance: 'High',
        ai_analyzed: true,
        ai_extracted_metadata: {
          users_captured: ['JSILVA', 'MCARLOS'],
          access_levels: ['CREATE', 'APPROVE', 'VIEW'],
          inconsistencies_detected: 2
        }
      }
    ];

    const mockInsights: AIInsight[] = [
      {
        type: 'finding',
        title: 'Potencial Achado de Auditoria Detectado',
        description: 'Análise automática identificou padrão suspeito: mesmo usuário criando e aprovando transações acima de R$ 50.000.',
        confidence: 92,
        action: 'Expandir teste para últimos 3 meses',
        procedure_id: '1'
      },
      {
        type: 'automation',
        title: 'Procedimento Automatizável',
        description: 'O teste de acesso privilegiado pode ser 100% automatizado usando scripts de extração de dados.',
        confidence: 89,
        action: 'Executar automação',
        procedure_id: '2'
      },
      {
        type: 'suggestion',
        title: 'Otimização de Amostra',
        description: 'Baseado no risco, recomendo aumentar amostra de reconciliações de 3 para 6 meses.',
        confidence: 76,
        procedure_id: '3'
      }
    ];

    setProcedures(mockProcedures);
    setEvidence(mockEvidence);
    setAiInsights(mockInsights);
  }, []);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTimer && timerStart) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - timerStart.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTimer, timerStart]);

  const startTimer = (procedureId: string) => {
    setCurrentTimer(procedureId);
    setTimerStart(new Date());
    setElapsedTime(0);
    
    // Update procedure status to In Progress
    setProcedures(prev => prev.map(proc => 
      proc.id === procedureId 
        ? { ...proc, status: 'In Progress' as const }
        : proc
    ));
  };

  const stopTimer = () => {
    if (currentTimer && timerStart) {
      const totalHours = elapsedTime / 3600;
      
      // Update actual hours for the procedure
      setProcedures(prev => prev.map(proc => 
        proc.id === currentTimer 
          ? { ...proc, actual_hours: (proc.actual_hours || 0) + totalHours }
          : proc
      ));
    }
    
    setCurrentTimer(null);
    setTimerStart(null);
    setElapsedTime(0);
  };

  const updateProcedureStatus = (procedureId: string, status: AuditProcedure['status']) => {
    setProcedures(prev => prev.map(proc => 
      proc.id === procedureId 
        ? { ...proc, status, actual_completion: status === 'Completed' ? new Date().toISOString().split('T')[0] : proc.actual_completion }
        : proc
    ));

    if (status === 'Completed' && currentTimer === procedureId) {
      stopTimer();
    }
  };

  const updateProcedureField = (procedureId: string, field: keyof AuditProcedure, value: any) => {
    setProcedures(prev => prev.map(proc => 
      proc.id === procedureId 
        ? { ...proc, [field]: value }
        : proc
    ));

    if (autoSaveEnabled) {
      toast({
        title: 'Auto-salvamento',
        description: 'Alterações salvas automaticamente.',
        duration: 2000,
      });
    }
  };

  const executeAIRecommendation = (insight: AIInsight) => {
    if (insight.action === 'Executar automação' && insight.procedure_id) {
      // Simulate automated execution
      toast({
        title: 'Automação Executada',
        description: 'Procedimento automatizado executado com sucesso. Resultados disponíveis em 2 minutos.',
      });
      
      setTimeout(() => {
        updateProcedureStatus(insight.procedure_id!, 'Completed');
        updateProcedureField(insight.procedure_id!, 'results', 'Teste automatizado concluído. 0 exceções identificadas em 1.247 transações analisadas.');
        updateProcedureField(insight.procedure_id!, 'conclusion', 'Controles efetivos. Nenhuma deficiência identificada.');
      }, 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800 border-gray-200',
      'In Progress': 'bg-orange-100 text-orange-800 border-orange-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Not Applicable': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredProcedures = procedures.filter(proc => {
    const matchesSearch = proc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedProcedures = procedures.filter(p => p.status === 'Completed').length;
  const totalProcedures = procedures.length;
  const progressPercentage = totalProcedures > 0 ? (completedProcedures / totalProcedures) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            <span>Execução de Auditoria</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Workspace inteligente para execução de procedimentos de auditoria
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {alexAssistantActive && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Bot className="h-3 w-3 mr-1" />
              Alex Audit Ativo
            </Badge>
          )}
          {currentTimer && (
            <div className="flex items-center gap-2 bg-muted/50 border rounded-lg px-3 py-1">
              <Clock className="h-4 w-4 text-foreground" />
              <span className="text-sm font-mono">
                {formatTime(elapsedTime)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progresso Geral</p>
                <p className="text-2xl font-bold text-blue-600">{progressPercentage.toFixed(0)}%</p>
              </div>
              <Progress value={progressPercentage} className="w-16 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Procedimentos</p>
                <p className="text-2xl font-bold text-green-600">{completedProcedures}/{totalProcedures}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Horas Trabalhadas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {procedures.reduce((sum, p) => sum + (p.actual_hours || 0), 0).toFixed(1)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Evidências</p>
                <p className="text-2xl font-bold text-purple-600">{evidence.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Sparkles className="h-5 w-5" />
              Insights de IA - Alex Audit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-purple-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {insight.type === 'finding' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                    {insight.type === 'automation' && <Zap className="h-4 w-4 text-blue-500 mt-0.5" />}
                    {insight.type === 'suggestion' && <Info className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    <div>
                      <p className="font-medium text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confiança
                        </Badge>
                        {insight.procedure_id && (
                          <Badge variant="outline" className="text-xs">
                            Procedimento {procedures.find(p => p.id === insight.procedure_id)?.step_number}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {insight.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeAIRecommendation(insight)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full">
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
        </TabsList>

        <TabsContent value="procedures" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar procedimentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Not Started">Não Iniciado</SelectItem>
                    <SelectItem value="In Progress">Em Progresso</SelectItem>
                    <SelectItem value="Completed">Concluído</SelectItem>
                    <SelectItem value="Not Applicable">Não Aplicável</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                  />
                  <Label className="text-sm">Auto-save</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Procedures List */}
          <div className="space-y-4">
            {filteredProcedures.map((procedure) => (
              <Card key={procedure.id} className={cn(
                "hover:shadow-md transition-shadow",
                selectedProcedure === procedure.id ? "ring-2 ring-blue-500" : ""
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {procedure.step_number}
                        </Badge>
                        <CardTitle className="text-lg">{procedure.title}</CardTitle>
                        {procedure.ai_suggested && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <Brain className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{procedure.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(procedure.status)}>
                        {procedure.status}
                      </Badge>
                      {procedure.status === 'Not Started' && (
                        <Button
                          size="sm"
                          onClick={() => startTimer(procedure.id)}
                          disabled={!!currentTimer}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {procedure.status === 'In Progress' && currentTimer === procedure.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={stopTimer}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pausar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <p className="font-medium">{procedure.procedure_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Responsável:</span>
                      <p className="font-medium">{procedure.assigned_to}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Prazo:</span>
                      <p className="font-medium">
                        {new Date(procedure.planned_completion).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Detailed view when selected */}
                  {selectedProcedure === procedure.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <Label className="text-sm font-medium">Objetivo</Label>
                        <p className="text-sm text-gray-700 mt-1">{procedure.objective}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Instruções</Label>
                        <Textarea
                          value={procedure.instructions}
                          onChange={(e) => updateProcedureField(procedure.id, 'instructions', e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      {procedure.ai_generated_instructions && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-800">Instrução Gerada por IA</span>
                          </div>
                          <p className="text-sm text-purple-700">{procedure.ai_generated_instructions}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Resultados</Label>
                          <Textarea
                            value={procedure.results || ''}
                            onChange={(e) => updateProcedureField(procedure.id, 'results', e.target.value)}
                            placeholder="Descreva os resultados obtidos..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Exceções</Label>
                          <Textarea
                            value={procedure.exceptions || ''}
                            onChange={(e) => updateProcedureField(procedure.id, 'exceptions', e.target.value)}
                            placeholder="Liste as exceções identificadas..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Conclusão</Label>
                        <Textarea
                          value={procedure.conclusion || ''}
                          onChange={(e) => updateProcedureField(procedure.id, 'conclusion', e.target.value)}
                          placeholder="Conclusão sobre a efetividade dos controles..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <Select 
                          value={procedure.status} 
                          onValueChange={(value) => updateProcedureStatus(procedure.id, value as AuditProcedure['status'])}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Não Iniciado</SelectItem>
                            <SelectItem value="In Progress">Em Progresso</SelectItem>
                            <SelectItem value="Completed">Concluído</SelectItem>
                            <SelectItem value="Not Applicable">Não Aplicável</SelectItem>
                          </SelectContent>
                        </Select>

                        {procedure.ai_automation_possible && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Automatizar
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      Estimado: {procedure.estimated_hours}h | 
                      Real: {procedure.actual_hours?.toFixed(1) || 0}h
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProcedure(
                        selectedProcedure === procedure.id ? null : procedure.id
                      )}
                    >
                      {selectedProcedure === procedure.id ? 'Fechar' : 'Abrir Detalhes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Evidências Coletadas</CardTitle>
                  <CardDescription>
                    Gerenciamento inteligente de evidências de auditoria
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Foto
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Áudio
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evidence.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{item.title}</span>
                            <Badge variant="outline">{item.evidence_type}</Badge>
                            {item.ai_analyzed && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Brain className="h-3 w-3 mr-1" />
                                Analisado por IA
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500">Confiabilidade:</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "ml-1",
                                  item.reliability === 'High' ? 'border-green-200 text-green-700' :
                                  item.reliability === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                                  'border-red-200 text-red-700'
                                )}
                              >
                                {item.reliability}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Relevância:</span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "ml-1",
                                  item.relevance === 'High' ? 'border-green-200 text-green-700' :
                                  item.relevance === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                                  'border-red-200 text-red-700'
                                )}
                              >
                                {item.relevance}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Coletado por:</span>
                              <span className="ml-1 font-medium">{item.collected_by}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Data:</span>
                              <span className="ml-1">
                                {new Date(item.collected_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          {item.ai_extracted_metadata && (
                            <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded">
                              <p className="text-xs font-medium text-purple-800 mb-1">Metadados Extraídos por IA:</p>
                              <div className="text-xs text-purple-700">
                                {Object.entries(item.ai_extracted_metadata).map(([key, value]) => (
                                  <span key={key} className="inline-block mr-3">
                                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Novo Papel de Trabalho
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de Evidência
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Consultar Alex Audit
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Reunião
                </Button>
              </CardContent>
            </Card>

            {/* Team Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status da Equipe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Ana Silva</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Carlos Mendes</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Ocupado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm">Marina Costa</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Offline</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Procedimento 1 concluído</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-5">há 2 horas</p>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Upload className="h-3 w-3 text-blue-600" />
                    <span>3 evidências adicionadas</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-5">há 4 horas</p>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Brain className="h-3 w-3 text-purple-600" />
                    <span>IA sugeriu automação</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-5">há 6 horas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditExecutionWorkspace;