import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Users,
  Building,
  Shield,
  Target,
  ArrowRight,
  ArrowDown,
  Brain,
  Zap,
  Calendar,
  BarChart3,
  Settings,
  Eye,
  Edit
} from 'lucide-react';
import { useVendorRiskManagement } from '@/hooks/useVendorRiskManagement';

interface VendorProcessViewProps {
  searchTerm: string;
  selectedFilter: string;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  icon: React.ReactNode;
  estimatedTime: string;
  dependencies?: string[];
  alexInsights?: string;
}

interface ProcessWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'onboarding' | 'assessment' | 'review' | 'offboarding';
  steps: ProcessStep[];
  currentStepIndex: number;
  progress: number;
  vendorId?: string;
  vendorName?: string;
  startDate: string;
  estimatedCompletion: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
}

export const VendorProcessView: React.FC<VendorProcessViewProps> = ({
  searchTerm,
  selectedFilter
}) => {
  const {
    vendors,
    assessments,
    fetchVendors,
    fetchAssessments,
    loading
  } = useVendorRiskManagement();

  const [activeTab, setActiveTab] = useState('active');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ProcessWorkflow | null>(null);
  
  // Mock workflows data (in a real implementation, this would come from the backend)
  const [workflows, setWorkflows] = useState<ProcessWorkflow[]>([
    {
      id: '1',
      name: 'Onboarding TechCorp Solutions',
      description: 'Processo completo de onboarding para novo fornecedor estratégico',
      type: 'onboarding',
      currentStepIndex: 2,
      progress: 40,
      vendorId: 'vendor-1',
      vendorName: 'TechCorp Solutions',
      startDate: '2024-01-15',
      estimatedCompletion: '2024-02-15',
      priority: 'high',
      assignedTo: 'João Silva',
      steps: [
        {
          id: 'step-1',
          title: 'Cadastro Inicial',
          description: 'Coleta de informações básicas do fornecedor',
          status: 'completed',
          icon: <Building className="w-4 h-4" />,
          estimatedTime: '2 horas',
          alexInsights: 'Informações validadas com sucesso'
        },
        {
          id: 'step-2',
          title: 'Documentação Legal',
          description: 'Validação de documentos legais e certificações',
          status: 'completed',
          icon: <FileCheck className="w-4 h-4" />,
          estimatedTime: '1 dia',
          alexInsights: 'Todos os documentos estão atualizados'
        },
        {
          id: 'step-3',
          title: 'Assessment de Segurança',
          description: 'Avaliação inicial de segurança e compliance',
          status: 'in_progress',
          icon: <Shield className="w-4 h-4" />,
          estimatedTime: '3 dias',
          dependencies: ['step-1', 'step-2'],
          alexInsights: 'Framework ISO 27001 recomendado'
        },
        {
          id: 'step-4',
          title: 'Aprovação Executiva',
          description: 'Revisão e aprovação pela liderança',
          status: 'pending',
          icon: <CheckCircle className="w-4 h-4" />,
          estimatedTime: '2 dias',
          dependencies: ['step-3']
        },
        {
          id: 'step-5',
          title: 'Ativação',
          description: 'Ativação do fornecedor no sistema',
          status: 'pending',
          icon: <Play className="w-4 h-4" />,
          estimatedTime: '1 hora',
          dependencies: ['step-4']
        }
      ]
    },
    {
      id: '2',
      name: 'Assessment Anual - DataSafe Inc',
      description: 'Reavaliação anual de riscos e controles',
      type: 'assessment',
      currentStepIndex: 1,
      progress: 25,
      vendorId: 'vendor-2',
      vendorName: 'DataSafe Inc',
      startDate: '2024-01-20',
      estimatedCompletion: '2024-02-05',
      priority: 'medium',
      assignedTo: 'Maria Santos',
      steps: [
        {
          id: 'step-1',
          title: 'Preparação do Assessment',
          description: 'Seleção de framework e personalização de questionário',
          status: 'completed',
          icon: <Settings className="w-4 h-4" />,
          estimatedTime: '4 horas',
          alexInsights: 'SOC 2 Type II selecionado automaticamente'
        },
        {
          id: 'step-2',
          title: 'Envio para Fornecedor',
          description: 'Distribuição do assessment e treinamento',
          status: 'in_progress',
          icon: <Users className="w-4 h-4" />,
          estimatedTime: '1 dia',
          dependencies: ['step-1']
        },
        {
          id: 'step-3',
          title: 'Coleta de Evidências',
          description: 'Fornecedor submete respostas e documentos',
          status: 'pending',
          icon: <FileCheck className="w-4 h-4" />,
          estimatedTime: '7 dias',
          dependencies: ['step-2']
        },
        {
          id: 'step-4',
          title: 'Revisão Interna',
          description: 'Análise das respostas e validação',
          status: 'pending',
          icon: <Eye className="w-4 h-4" />,
          estimatedTime: '3 dias',
          dependencies: ['step-3']
        },
        {
          id: 'step-5',
          title: 'Relatório Final',
          description: 'Geração de relatório e plano de ação',
          status: 'pending',
          icon: <BarChart3 className="w-4 h-4" />,
          estimatedTime: '2 dias',
          dependencies: ['step-4']
        }
      ]
    },
    {
      id: '3',
      name: 'Revisão Crítica - SecureTech',
      description: 'Revisão urgente devido a incidente de segurança',
      type: 'review',
      currentStepIndex: 0,
      progress: 15,
      vendorId: 'vendor-3',
      vendorName: 'SecureTech',
      startDate: '2024-01-22',
      estimatedCompletion: '2024-01-29',
      priority: 'urgent',
      assignedTo: 'Carlos Oliveira',
      steps: [
        {
          id: 'step-1',
          title: 'Investigação do Incidente',
          description: 'Análise detalhada do incidente reportado',
          status: 'in_progress',
          icon: <AlertTriangle className="w-4 h-4" />,
          estimatedTime: '1 dia',
          alexInsights: 'Incidente de nível médio detectado'
        },
        {
          id: 'step-2',
          title: 'Assessment Emergencial',
          description: 'Avaliação focada em controles de segurança',
          status: 'pending',
          icon: <Target className="w-4 h-4" />,
          estimatedTime: '2 dias',
          dependencies: ['step-1']
        },
        {
          id: 'step-3',
          title: 'Plano de Remediação',
          description: 'Desenvolvimento de ações corretivas',
          status: 'pending',
          icon: <RotateCcw className="w-4 h-4" />,
          estimatedTime: '1 dia',
          dependencies: ['step-2']
        },
        {
          id: 'step-4',
          title: 'Implementação',
          description: 'Execução das ações corretivas',
          status: 'pending',
          icon: <Play className="w-4 h-4" />,
          estimatedTime: '5 dias',
          dependencies: ['step-3']
        }
      ]
    }
  ]);

  useEffect(() => {
    fetchVendors();
    fetchAssessments();
  }, [fetchVendors, fetchAssessments]);

  // Filter workflows based on tab
  const getFilteredWorkflows = () => {
    switch (activeTab) {
      case 'active':
        return workflows.filter(w => w.progress < 100);
      case 'completed':
        return workflows.filter(w => w.progress === 100);
      case 'urgent':
        return workflows.filter(w => w.priority === 'urgent');
      default:
        return workflows;
    }
  };

  // Get step status style
  const getStepStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'blocked':
        return 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300';
      case 'pending':
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'skipped':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get priority style
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300';
      case 'high':
        return 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300';
      case 'medium':
        return 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'low':
        return 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:bg-green-950 dark:text-green-300';
      default:
        return 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get priority text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  // Get process type text
  const getProcessTypeText = (type: string) => {
    switch (type) {
      case 'onboarding': return 'Onboarding';
      case 'assessment': return 'Assessment';
      case 'review': return 'Revisão';
      case 'offboarding': return 'Offboarding';
      default: return type;
    }
  };

  // Get process type color
  const getProcessTypeColor = (type: string) => {
    switch (type) {
      case 'onboarding': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assessment': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'review': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'offboarding': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredWorkflows = getFilteredWorkflows();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>Processos e Workflows</span>
              </CardTitle>
              <CardDescription>
                Acompanhe e gerencie todos os processos de fornecedores
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Novo Processo
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="xl:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <TabsTrigger value="active" className="text-xs sm:text-sm">
                Ativos ({workflows.filter(w => w.progress < 100).length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Concluídos ({workflows.filter(w => w.progress === 100).length})
              </TabsTrigger>
              <TabsTrigger value="urgent" className="text-xs sm:text-sm">
                Urgentes ({workflows.filter(w => w.priority === 'urgent').length})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                Todos ({workflows.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-4">
              {filteredWorkflows.map((workflow) => (
                <Card 
                  key={workflow.id} 
                  className={`
                    bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm 
                    border border-slate-200/50 dark:border-slate-700/50 
                    cursor-pointer hover:shadow-md transition-all duration-200
                    ${selectedWorkflow?.id === workflow.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                  `}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">
                            {workflow.name}
                          </h3>
                          <Badge variant="outline" className={`text-xs ${getProcessTypeColor(workflow.type)}`}>
                            {getProcessTypeText(workflow.type)}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getPriorityStyle(workflow.priority)}`}>
                            {getPriorityText(workflow.priority)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {workflow.description}
                        </p>
                        {workflow.vendorName && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Building className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {workflow.vendorName}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {workflow.progress}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Etapa {workflow.currentStepIndex + 1} de {workflow.steps.length}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Progresso</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {workflow.steps.filter(s => s.status === 'completed').length} de {workflow.steps.length} concluídas
                        </span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>

                    {/* Current Step */}
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      {workflow.steps[workflow.currentStepIndex]?.icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Etapa Atual: {workflow.steps[workflow.currentStepIndex]?.title}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {workflow.steps[workflow.currentStepIndex]?.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-900">
                        {workflow.steps[workflow.currentStepIndex]?.estimatedTime}
                      </Badge>
                    </div>

                    {/* Timeline Preview */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Início: {new Date(workflow.startDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Previsão: {new Date(workflow.estimatedCompletion).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {workflow.assignedTo && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{workflow.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredWorkflows.length === 0 && (
                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Activity className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Nenhum processo encontrado
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                      Não há processos para exibir nesta categoria.
                    </p>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Processo
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Workflow Detail Panel */}
        <div className="space-y-4">
          {selectedWorkflow ? (
            <>
              {/* Workflow Header */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100 text-lg">
                    {selectedWorkflow.name}
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    Detalhes do processo selecionado
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Process Steps */}
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Etapas do Processo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="space-y-2">
                      <div className={`flex items-start space-x-3 p-3 rounded-lg border ${getStepStatusStyle(step.status)}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium">{step.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {step.status === 'completed' ? 'Concluída' :
                               step.status === 'in_progress' ? 'Em Andamento' :
                               step.status === 'blocked' ? 'Bloqueada' :
                               step.status === 'skipped' ? 'Ignorada' : 'Pendente'}
                            </Badge>
                          </div>
                          <p className="text-xs opacity-80 mb-2">{step.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs opacity-75">
                              {step.estimatedTime}
                            </span>
                            {step.dependencies && step.dependencies.length > 0 && (
                              <span className="text-xs opacity-75">
                                Depende de: {step.dependencies.length} etapas
                              </span>
                            )}
                          </div>
                          
                          {/* ALEX Insights */}
                          {step.alexInsights && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center space-x-1 mb-1">
                                <Brain className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">ALEX Insights</span>
                              </div>
                              <p className="text-xs text-blue-600 dark:text-blue-400">{step.alexInsights}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Step Actions */}
                        <div className="flex flex-col space-y-1">
                          {step.status === 'in_progress' && (
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                              <Pause className="w-3 h-3" />
                            </Button>
                          )}
                          {step.status === 'pending' && (
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Step Connector */}
                      {index < selectedWorkflow.steps.length - 1 && (
                        <div className="flex justify-center">
                          <ArrowDown className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ALEX Process Insights */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-purple-900 dark:text-purple-100 text-sm flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>ALEX Insights do Processo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <p className="text-xs text-purple-800 dark:text-purple-200">
                        <strong>Otimização:</strong> Processo está 20% mais rápido que a média
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-3 h-3 text-green-500" />
                      <p className="text-xs text-purple-800 dark:text-purple-200">
                        <strong>Previsão:</strong> Conclusão estimada para {new Date(selectedWorkflow.estimatedCompletion).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <p className="text-xs text-purple-800 dark:text-purple-200">
                        <strong>Atenção:</strong> {
                          selectedWorkflow.priority === 'urgent' 
                            ? 'Processo urgente - acompanhar de perto'
                            : 'Processo dentro do prazo normal'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-purple-200 dark:bg-purple-800" />
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                      Próximas Ações Recomendadas
                    </h4>
                    <ul className="space-y-1">
                      <li className="text-xs text-purple-800 dark:text-purple-200 flex items-center space-x-2">
                        <ArrowRight className="w-3 h-3" />
                        <span>Acompanhar etapa atual de perto</span>
                      </li>
                      <li className="text-xs text-purple-800 dark:text-purple-200 flex items-center space-x-2">
                        <ArrowRight className="w-3 h-3" />
                        <span>Preparar documentação para próxima etapa</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Process Actions */}
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Avançar Processo
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Relatório
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Activity className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Selecione um Processo
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Clique em um processo na lista para ver os detalhes e etapas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Process Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Processos Ativos
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {workflows.filter(w => w.progress < 100).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Concluídos Este Mês
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {workflows.filter(w => w.progress === 100).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Tempo Médio
                </p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  12 dias
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Taxa de Sucesso
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  96%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorProcessView;