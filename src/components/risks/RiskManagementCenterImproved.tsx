import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  LayoutDashboard,
  Table2,
  Kanban,
  GitBranch,
  Brain,
  BarChart3,
  Settings,
  BookOpen,
  FileText,
  MessageSquare,
  Shield,
  CheckCircle,
  Clock,
  Eye,
  Send,
  Plus,
  Target,
  AlertTriangle,
  Users,
  Filter,
  Search,
  Download,
  RefreshCw,
  Activity,
  TrendingUp,
  Zap,
  Library,
  Bell,
  Archive,
  Calendar,
  Award,
  Globe,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { useRiskManagement } from '@/hooks/useRiskManagement';
import { useRiskFilters } from '@/hooks/useRiskFilters';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

import { Suspense, lazy } from 'react';

// Componente de loading otimizado para views
const ViewLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-background rounded-lg border">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
      <p className="text-sm text-muted-foreground animate-pulse">Carregando view...</p>
    </div>
  </div>
);

// Temporariamente voltar aos imports síncronos para resolver erro crítico
import { DashboardView } from './views/DashboardView';
import { TableView } from './views/TableView';
import ExpandableCardsView from './views/ExpandableCardsView';
import { KanbanView } from './views/KanbanView';
import { ProcessView } from './views/ProcessView';
import { RiskMatrixView } from './views/RiskMatrixView';
import { AlexRiskTest } from './AlexRiskTest';
import { AlexRiskGuidedProcess } from './AlexRiskGuidedProcess';
import { RiskDocumentation } from './RiskDocumentation';
import { NotificationPanel } from './NotificationPanel';
import { RiskLibraryIntegrated } from './shared/RiskLibraryIntegrated';
import { CommunicationCenterIntegrated } from './shared/CommunicationCenterIntegrated';
import { ApprovalWorkflowIntegrated } from './shared/ApprovalWorkflowIntegrated';
import { GuidedRiskCreation } from './GuidedRiskCreation';
import { RiskRegistrationWizard } from './wizard/RiskRegistrationWizard';

// Componentes pequenos podem continuar como import estático
import { RiskFilters } from './shared/RiskFilters';
import { QuickMetrics } from './shared/QuickMetrics';
import { AlexRiskIntegration } from './shared/AlexRiskIntegration';

// Tipos
export type ViewMode = 'dashboard' | 'table' | 'kanban' | 'process' | 'matrix' | 'documentation' | 'library' | 'communications' | 'approvals';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  badge?: string | number;
  category: 'primary' | 'secondary' | 'integration';
}

export const RiskManagementCenterImproved: React.FC = () => {
  // Estados principais
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alexRiskActive, setAlexRiskActive] = useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [guidedCreationOpen, setGuidedCreationOpen] = useState(false);

  // Função para mudar viewMode
  const changeViewMode = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    risks,
    metrics,
    isLoadingRisks,
    isLoadingMetrics,
    createRisk,
    updateRisk,
    deleteRisk
  } = useRiskManagement();

  const { filters, setFilters } = useRiskFilters();

  const getQuickActions = (): QuickAction[] => [
    // Ações Primárias
    {
      id: 'register-risk',
      title: 'Registrar Risco',
      description: 'Assistente Inteligente',
      icon: Plus,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      action: () => handleAlexAnalysis(),
      category: 'primary',
      badge: 'IA Integrada'
    },
    {
      id: 'action-plans-management',
      title: 'Gestão de Planos de Ação',
      description: 'Acompanhamento centralizado',
      icon: Target,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
      action: () => handleActionPlansManagement(),
      category: 'primary',
      badge: metrics?.overdueActivities > 0 ? metrics.overdueActivities : undefined
    },
    {
      id: 'risk-matrix',
      title: 'Matriz de Riscos',
      description: 'Visualização matricial',
      icon: Target,
      color: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700',
      action: () => {
        navigate('/risks/matrix');
        toast({
          title: '🎯 Matriz de Risco',
          description: 'Redirecionando para a página da matriz de riscos...',
        });
      },
      category: 'primary'
    },

    // Ações Secundárias
    {
      id: 'documentation',
      title: 'Documentação',
      description: 'Guia completo do sistema',
      icon: BookOpen,
      color: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
      action: () => setViewMode('documentation'),
      category: 'secondary'
    },
    {
      id: 'risk-library',
      title: 'Biblioteca de Riscos',
      description: 'Templates e modelos',
      icon: Library,
      color: 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
      action: () => handleRiskLibrary(),
      category: 'secondary',
      badge: '50+ templates'
    },


    // Integrações
    {
      id: 'communications',
      title: 'Comunicações',
      description: 'Central de mensagens',
      icon: MessageSquare,
      color: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
      action: () => setViewMode('communications'),
      category: 'integration',
      badge: 'Novo'
    },
    {
      id: 'approvals',
      title: 'Aprovações',
      description: 'Workflow digital',
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
      action: () => setViewMode('approvals'),
      category: 'integration',
      badge: metrics?.pendingApprovals > 0 ? metrics.pendingApprovals : undefined
    },
    {
      id: 'risk-letters',
      title: 'Carta de Risco',
      description: 'Riscos aceitos',
      icon: FileText,
      color: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      action: () => handleRiskLetters(),
      category: 'integration',
      badge: metrics?.acceptedRisks > 0 ? metrics.acceptedRisks : undefined
    }
  ];

  // Handlers melhorados
  const handleRiskLibrary = () => {
    setLibraryDialogOpen(true);

    toast({
      title: '📚 Biblioteca de Riscos',
      description: 'Abrindo biblioteca com templates e modelos de riscos...',
    });
  };

  const handleActionPlansManagement = () => {
    navigate('/action-plans');
    toast({
      title: '🎯 Gestão de Planos de Ação',
      description: 'Redirecionando para o acompanhamento centralizado de planos de ação...',
    });
  };

  const handleAlexAnalysis = () => {
    console.log('handleAlexAnalysis chamado - abrindo processo guiado');
    setProcessDialogOpen(true);
    toast({
      title: '🎯 Novo Registro de Risco',
      description: 'Abrindo formulário de registro de risco...',
    });
  };

  const handleReports = () => {
    toast({
      title: '📊 Relatórios Executivos',
      description: 'Preparando dashboards personalizados...',
    });
  };

  const handleRiskLetters = () => {
    navigate('/risk-letters');
    toast({
      title: '📄 Carta de Risco',
      description: 'Redirecionando para gestão de cartas de risco...',
    });
  };



  const getViewIcon = (view: ViewMode) => {
    switch (view) {
      case 'dashboard': return LayoutDashboard;
      case 'table': return Table2;
      case 'kanban': return Kanban;
      case 'process': return GitBranch;
      case 'matrix': return Target;
      case 'documentation': return BookOpen;
      case 'library': return Library;
      case 'communications': return MessageSquare;
      case 'approvals': return CheckCircle;
      default: return LayoutDashboard;
    }
  };

  const getViewTitle = (view: ViewMode) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Executivo';
      case 'table': return 'Lista Detalhada';
      case 'kanban': return 'Kanban Board';
      case 'process': return 'Novo Registro de Risco';
      case 'matrix': return 'Matriz de Risco';
      case 'documentation': return 'Documentação Completa';
      case 'library': return 'Biblioteca de Riscos';
      case 'communications': return 'Central de Comunicações';
      case 'approvals': return 'Workflow de Aprovações';
      default: return 'Dashboard';
    }
  };

  // Renderização condicional para documentação
  if (viewMode === 'documentation') {
    return (
      <div className="space-y-6 p-6" style={{ marginTop: '-40px' }}>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setViewMode('dashboard')}
            className="flex items-center space-x-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </div>
        <RiskDocumentation />
      </div>
    );
  }

  // Remove o loading blocking - mostra a UI imediatamente
  // O loading será individual por componente

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Gestão de Riscos - Centro Integrado</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-0.5 sm:mt-0">
            Plataforma Unificada para Gestão de Riscos Corporativos
          </p>

          {/* Status do Sistema Melhorado */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">Sistema Operacional</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 dark:text-blue-400" />
              <span>{risks.length} riscos monitorados</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 dark:text-orange-400" />
              <span>Última sync: agora</span>
            </div>
          </div>
        </div>

        {/* Controles do Header Melhorados */}
        <div className="flex items-center space-x-2">
          {/* Painel de Notificações */}
          <NotificationPanel />
        </div>
      </div>

      {/* Métricas Rápidas Melhoradas */}
      <QuickMetrics metrics={metrics} isLoading={isLoadingMetrics} />

      {/* Ações Rápidas Organizadas */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          <h2 className="text-lg font-semibold">Centro de Ações Integradas</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {getQuickActions().map((action) => {
            const Icon = action.icon;

            const baseColorClass = action.color.includes('blue') ? 'blue' :
              action.color.includes('purple') ? 'purple' :
                action.color.includes('green') || action.color.includes('emerald') ? 'emerald' :
                  action.color.includes('orange') || action.color.includes('amber') || action.color.includes('red') ? 'orange' :
                    action.color.includes('indigo') ? 'indigo' : 'gray';

            return (
              <Card
                key={action.id}
                className={`relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-${baseColorClass}-500 flex flex-col`}
                onClick={action.action}
              >
                <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon className={`h-16 w-16 sm:h-24 sm:w-24 text-${baseColorClass}-500`} />
                </div>
                <CardHeader className="p-3 sm:p-5 pb-1 sm:pb-2">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm sm:text-base leading-tight">
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-${baseColorClass}-100 dark:bg-${baseColorClass}-900/20 group-hover:bg-${baseColorClass}-200 dark:group-hover:bg-${baseColorClass}-900/40 transition-colors shrink-0`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${baseColorClass}-600 dark:text-${baseColorClass}-400`} />
                    </div>
                    <span className="font-semibold line-clamp-2 sm:line-clamp-1">{action.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-5 pt-1 sm:pt-2 flex flex-col flex-1 justify-between">
                  <p className="text-muted-foreground mb-3 text-[10px] sm:text-xs leading-relaxed line-clamp-2 flex-1">
                    {action.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-auto">
                    <div className={`flex items-center text-[10px] sm:text-xs font-medium text-${baseColorClass}-600 group-hover:translate-x-1 transition-transform`}>
                      Acessar <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className={`bg-${baseColorClass}-50 text-${baseColorClass}-700 text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5`}>
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Área Principal de Conteúdo */}
      <div className="space-y-6">
        {/* Conteúdo Principal */}
        <div>
          {/* Navegação de Views */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-semibold truncate max-w-[150px] sm:max-w-none">
                    {getViewTitle(viewMode)}
                  </h3>
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {viewMode}
                  </Badge>
                </div>
                <div className="flex items-center justify-start sm:justify-end gap-1 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                  {(['dashboard', 'table', 'kanban', 'process', 'matrix'] as ViewMode[]).map((view) => {
                    const Icon = getViewIcon(view);
                    return (
                      <Button
                        key={view}
                        variant={viewMode === view ? "default" : "outline"}
                        size="icon"
                        onClick={() => changeViewMode(view)}
                        className={`h-8 w-8 sm:h-9 text-xs flex-shrink-0 ${viewMode === view ? '' : 'text-muted-foreground'} sm:w-auto sm:px-3 sm:space-x-2`}
                        title={view}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {view === 'dashboard' && 'Dashboard'}
                          {view === 'table' && 'Lista'}
                          {view === 'kanban' && 'Kanban'}
                          {view === 'process' && 'Registro'}
                          {view === 'matrix' && 'Matriz'}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Busca e Filtros Compactos */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                {/* Campo de busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Pesquisar riscos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 w-full"
                  />
                </div>

                {/* Filtros ativos e ações */}
                <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
                  {/* Mostrar filtros ativos apenas em desktop ou se houver espaço */}
                  <div className="hidden md:flex items-center gap-2">
                    {filters?.categories && filters.categories.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{filters.categories.length} categoria(s)</span>
                      </Badge>
                    )}
                    {filters?.levels && filters.levels.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{filters.levels.length} nível(is)</span>
                      </Badge>
                    )}
                    {filters?.statuses && filters.statuses.length > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{filters.statuses.length} status</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Contador de resultados */}
                    <Badge variant="outline" className="h-10 px-3 flex-1 sm:flex-none justify-center whitespace-nowrap text-sm bg-muted/20">
                      {risks.length} riscos
                    </Badge>

                    {/* Botão de filtros */}
                    <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none h-10 px-4 flex items-center gap-2 bg-muted/20 hover:bg-muted/50">
                          <Filter className="h-4 w-4" />
                          <span>Filtros</span>
                          {((filters?.categories?.length || 0) + (filters?.levels?.length || 0) + (filters?.statuses?.length || 0)) > 0 && (
                            <Badge className="ml-1 px-1.5 h-5 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-none">
                              {(filters?.categories?.length || 0) + (filters?.levels?.length || 0) + (filters?.statuses?.length || 0)}
                            </Badge>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filtros de Riscos</span>
                          </DialogTitle>
                          <DialogDescription>
                            Refine sua busca por categoria, nível de risco, status e outros critérios.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                          <RiskFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onClose={() => setFilterDialogOpen(false)}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            {risks.length} risco(s) encontrado(s)
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFilters({});
                                setSearchTerm('');
                              }}
                            >
                              Limpar tudo
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setFilterDialogOpen(false)}
                            >
                              Aplicar filtros
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Views Dinâmicas */}
          {viewMode === 'dashboard' && (
            <DashboardView
              risks={risks}
              metrics={metrics}
              searchTerm={searchTerm}
              filters={filters}
            />
          )}

          {viewMode === 'table' && (
            <ExpandableCardsView
              risks={risks}
              searchTerm={searchTerm}
              filters={filters}
              onUpdate={updateRisk}
              onDelete={deleteRisk}
            />
          )}

          {viewMode === 'kanban' && (
            <KanbanView
              risks={risks}
              searchTerm={searchTerm}
              filters={filters}
              onUpdate={updateRisk}
              onDelete={deleteRisk}
            />
          )}

          {viewMode === 'matrix' && (
            <div style={{
              width: '100%',
              minHeight: '100px',
              overflow: 'visible'
            }}>
              <RiskMatrixView
                risks={risks}
                searchTerm={searchTerm}
                filters={filters}
              />
            </div>
          )}

          {viewMode === 'communications' && (
            <CommunicationCenterIntegrated
              risks={risks}
              onSendMessage={(message) => {
                toast({
                  title: '📨 Mensagem Enviada',
                  description: 'Comunicação registrada com sucesso',
                });
              }}
            />
          )}

          {viewMode === 'approvals' && (
            <ApprovalWorkflowIntegrated
              risks={risks}
              onApprove={(riskId) => {
                toast({
                  title: '✅ Risco Aprovado',
                  description: 'Aprovação registrada no workflow',
                });
              }}
            />
          )}
        </div>
      </div>

      {/* Dialog do Assistente de Registro de Risco */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="w-full max-w-[100vw] sm:max-w-[95vw] md:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[95vh] overflow-y-auto overflow-x-hidden p-0 m-0 sm:mx-auto border-none sm:border-solid rounded-none sm:rounded-lg flex flex-col">
          <DialogHeader className="pt-10 pb-4 px-4 sm:px-6 text-left relative flex-shrink-0 border-b border-border/40 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 dark:border-green-900/50">
            <DialogTitle className="flex items-center space-x-2 text-sm">
              <span>Novo Registro de Risco</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Processo inteligente e guiado.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 w-full p-2 sm:p-4 md:px-6 md:pb-6 overflow-y-auto overflow-x-hidden bg-background">
            <AlexRiskGuidedProcess
              onComplete={(riskData) => {
                // Adaptando do formato do Wizard/IA para o formato do Controller
                createRisk({
                  name: riskData.risk_title || 'Risco Sem Nome',
                  category: riskData.risk_category || 'Operacional',
                  probability: Number(Math.max(1, (riskData as any).probability || 1)),
                  impact: Number(Math.max(1, (riskData as any).impact || 1)),
                  status: 'Identificado',
                  action_plans: (riskData as any).action_plans || [],
                  stakeholders: (riskData as any).stakeholders || [],
                  extraData: {
                    ...riskData,
                    risk_title: undefined,
                    risk_category: undefined,
                    probability: undefined,
                    impact: undefined,
                    action_plans: undefined,
                    stakeholders: undefined
                  }
                } as any);
                setProcessDialogOpen(false);
                toast({
                  title: '🎉 Registro Concluído',
                  description: `Risco "${riskData.risk_title}" registrado com sucesso!`,
                });
              }}
              onCancel={() => {
                setProcessDialogOpen(false);
                toast({
                  title: 'Cancelado',
                  description: 'O formulário foi fechado.',
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog da Biblioteca de Riscos */}
      <Dialog open={libraryDialogOpen} onOpenChange={setLibraryDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl max-h-[95vh] overflow-y-auto overflow-x-hidden p-0 mx-auto" style={{ maxWidth: 'calc(100vw - 1rem)', width: 'calc(100vw - 1rem)' }}>
          <DialogHeader className="px-4 pr-10 pt-8 sm:pt-10 pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-900/50 text-left">
            <DialogTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Library className="h-6 w-6 text-green-600" />
              <span>Biblioteca de Riscos - Templates e Modelos</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Explore nossa coleção de templates pré-definidos, modelos de riscos por setor e melhores práticas para acelerar sua gestão de riscos.
            </DialogDescription>
          </DialogHeader>

          <div className="px-3 py-6 sm:px-6 sm:py-8 overflow-x-hidden">
            <RiskLibraryIntegrated
              onSelectTemplate={(template) => {
                toast({
                  title: '📚 Template Selecionado',
                  description: `Template "${template.name}" foi aplicado.`,
                });
                setLibraryDialogOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog do Guided Risk Creation */}
      <Dialog open={guidedCreationOpen} onOpenChange={setGuidedCreationOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span>Registro Manual de Risco - Processo Guiado</span>
            </DialogTitle>
            <DialogDescription>
              Processo manual guiado com integração à biblioteca de riscos, múltiplas metodologias e suporte Alex Risk IA.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <RiskRegistrationWizard
              onComplete={(riskData) => {
                console.log('✅ Risco criado via Wizard 7 Etapas:', riskData);
                setGuidedCreationOpen(false);

                toast({
                  title: '🎉 Registro de Risco Concluído',
                  description: `Risco "${riskData.risk_title}" foi registrado com sucesso através do processo de 7 etapas.`,
                });
              }}
              onCancel={() => {
                setGuidedCreationOpen(false);
                toast({
                  title: 'Registro Cancelado',
                  description: 'O processo de registro de risco foi cancelado.',
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default RiskManagementCenterImproved;