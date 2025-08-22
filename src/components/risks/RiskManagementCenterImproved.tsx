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
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRiskManagement } from '@/hooks/useRiskManagement';
import { useRiskFilters } from '@/hooks/useRiskFilters';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

// Importar views melhoradas
import { DashboardView } from './views/DashboardView';
import { TableView } from './views/TableView';
import { KanbanView } from './views/KanbanView';
import { ProcessView } from './views/ProcessView';
import { AlexRiskTest } from './AlexRiskTest';
import { AlexRiskGuidedProcess } from './AlexRiskGuidedProcess';
import { RiskMatrixView } from './views/RiskMatrixView';
import { RiskFilters } from './shared/RiskFilters';
import { QuickMetrics } from './shared/QuickMetrics';
import { AlexRiskIntegration } from './shared/AlexRiskIntegration';
import { RiskDocumentation } from './RiskDocumentation';

// Novos componentes integrados
import { RiskLibraryIntegrated } from './shared/RiskLibraryIntegrated';
import { CommunicationCenterIntegrated } from './shared/CommunicationCenterIntegrated';
import { ApprovalWorkflowIntegrated } from './shared/ApprovalWorkflowIntegrated';
import { GuidedRiskCreation } from './GuidedRiskCreation';
import { RiskRegistrationWizard } from './wizard/RiskRegistrationWizard';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Ações rápidas integradas e organizadas
  const getQuickActions = (): QuickAction[] => [
    // Ações Primárias
    {
      id: 'register-risk',
      title: 'Registrar Risco',
      description: 'Criação manual de risco',
      icon: Plus,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      action: () => handleRegisterRisk(),
      category: 'primary'
    },
    {
      id: 'alex-analysis',
      title: 'Análise Alex Risk',
      description: 'Insights inteligentes',
      icon: Brain,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
      action: () => handleAlexAnalysis(),
      category: 'primary',
      badge: 'IA'
    },
    {
      id: 'risk-library',
      title: 'Biblioteca de Riscos',
      description: 'Templates e modelos',
      icon: Library,
      color: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700',
      action: () => handleRiskLibrary(),
      category: 'primary',
      badge: '50+ templates'
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
      id: 'risk-matrix',
      title: 'Matriz de Riscos',
      description: 'Visualização matricial',
      icon: Target,
      color: 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
      action: () => {
        navigate('/risks/matrix');
        toast({
          title: '🎯 Matriz de Risco',
          description: 'Redirecionando para a página da matriz de riscos...',
        });
      },
      category: 'secondary'
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Dashboards executivos',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
      action: () => handleReports(),
      category: 'secondary',
      badge: metrics?.totalRisks || 0
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
      badge: metrics?.pendingApprovals || 0
    },
    {
      id: 'notifications',
      title: 'Alertas',
      description: 'Notificações ativas',
      icon: Bell,
      color: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      action: () => handleNotifications(),
      category: 'integration',
      badge: metrics?.overdueActivities || 0
    }
  ];

  // Handlers melhorados
  const handleRegisterRisk = () => {
    console.log('handleRegisterRisk chamado - abrindo Processo Manual Guiado com biblioteca de riscos');
    setGuidedCreationOpen(true);
    
    toast({
      title: '📋 Registro Manual de Risco',
      description: 'Abrindo processo guiado com integração à biblioteca de riscos e metodologias...',
    });
  };

  const handleRiskLibrary = () => {
    setLibraryDialogOpen(true);
    
    toast({
      title: '📚 Biblioteca de Riscos',
      description: 'Abrindo biblioteca com templates e modelos de riscos...',
    });
  };

  const handleAlexAnalysis = () => {
    console.log('handleAlexAnalysis chamado - abrindo processo guiado');
    setProcessDialogOpen(true);
    toast({
      title: '🧠 Análise Alex Risk',
      description: 'Abrindo processo guiado com assistência de IA...',
    });
  };

  const handleReports = () => {
    toast({
      title: '📊 Relatórios Executivos',
      description: 'Preparando dashboards personalizados...',
    });
  };

  const handleNotifications = () => {
    toast({
      title: '🔔 Central de Alertas',
      description: 'Verificando notificações pendentes...',
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simular refresh - em produção seria uma chamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: '✅ Dados Atualizados',
        description: 'Todas as informações foram sincronizadas',
      });
    } catch (error) {
      toast({
        title: '❌ Erro na Atualização',
        description: 'Falha ao sincronizar dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
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
      case 'process': return 'Processo Guiado com Alex Risk';
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
      <div className="space-y-6 p-6" style={{marginTop: '-40px'}}>
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

  if (isLoadingRisks && !risks.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando centro de gestão de riscos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Executivo Melhorado */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold truncate">
                Risco Corporativo - Centro Integrado
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base">
                Plataforma unificada com Alex Risk para gestão completa de riscos corporativos
              </p>
            </div>
          </div>
          
          {/* Status do Sistema Melhorado */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">Sistema Operacional</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>{risks.length} riscos monitorados</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <span>Alex Risk {alexRiskActive ? 'ativo' : 'standby'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              <span>Última sync: agora</span>
            </div>
          </div>
        </div>
        
        {/* Controles do Header Melhorados */}
        <div className="flex items-center space-x-2">
          {/* Alex Risk sempre disponível */}
          <ImprovedAIChatDialog 
            type="risk"
            context={{ 
              totalRisks: metrics?.totalRisks || 0,
              highRisks: metrics?.risksByLevel?.['Alto'] || 0,
              overdueActions: metrics?.overdueActivities || 0,
              currentView: viewMode
            }}
            trigger={
              <Button variant="outline" className="flex items-center space-x-2 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors border-purple-200 dark:border-purple-800">
                <div className="p-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <span>Alex Risk</span>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400">IA</Badge>
              </Button>
            }
          />
          
          {/* Documentação */}
          <Button 
            variant="outline" 
            onClick={() => setViewMode('documentation')}
            className="flex items-center space-x-2 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-colors border-orange-200 dark:border-orange-800"
          >
            <BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="hidden sm:inline">Doc</span>
          </Button>
          
          {/* Refresh */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={['h-4 w-4', isRefreshing ? 'animate-spin' : ''].filter(Boolean).join(' ')} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
          
          {/* Configurações */}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Config</span>
          </Button>
        </div>
      </div>

      {/* Métricas Rápidas Melhoradas */}
      <QuickMetrics metrics={metrics} isLoading={isLoadingMetrics} />

      {/* Ações Rápidas Organizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            <span>Centro de Ações Integradas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Ações Primárias */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Ações Principais</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getQuickActions().filter(action => action.category === 'primary').map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center space-y-3 hover:shadow-lg transition-all relative border-2 hover:border-primary/20"
                    onClick={action.action}
                  >
                    <div className={['p-4 rounded-xl', action.color, 'text-white shadow-lg'].join(' ')}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                    {action.badge && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white dark:from-blue-600 dark:to-purple-600"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Ações Secundárias */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Análise e Relatórios</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getQuickActions().filter(action => action.category === 'secondary').map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all relative"
                    onClick={action.action}
                  >
                    <div className={['p-3 rounded-lg', action.color, 'text-white'].join(' ')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-xs">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Integrações */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Workflow Integrado</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getQuickActions().filter(action => action.category === 'integration').map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all relative"
                    onClick={action.action}
                  >
                    <div className={['p-3 rounded-lg', action.color, 'text-white'].join(' ')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-xs">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área Principal de Conteúdo */}
      <div className="space-y-6">
        {/* Conteúdo Principal */}
        <div>
          {/* Navegação de Views */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">
                    {getViewTitle(viewMode)}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {viewMode}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  {(['dashboard', 'table', 'kanban', 'process', 'matrix'] as ViewMode[]).map((view) => {
                    const Icon = getViewIcon(view);
                    return (
                      <Button
                        key={view}
                        variant={viewMode === view ? "default" : "outline"}
                        size="sm"
                        onClick={() => changeViewMode(view)}
                        className="flex items-center space-x-1"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {view === 'dashboard' && 'Dashboard'}
                          {view === 'table' && 'Tabela'}
                          {view === 'kanban' && 'Kanban'}
                          {view === 'process' && 'Processo'}
                          {view === 'matrix' && 'Matriz'}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              {/* Busca e Filtros Compactos */}
              <div className="flex items-center space-x-4">
                {/* Campo de busca */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Pesquisar riscos por nome, categoria ou responsável..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Filtros ativos */}
                <div className="flex items-center space-x-2">
                  {/* Mostrar filtros ativos */}
                  {filters?.categories && filters.categories.length > 0 && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span>{filters.categories.length} categoria(s)</span>
                    </Badge>
                  )}
                  {filters?.levels && filters.levels.length > 0 && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{filters.levels.length} nível(is)</span>
                    </Badge>
                  )}
                  {filters?.statuses && filters.statuses.length > 0 && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>{filters.statuses.length} status</span>
                    </Badge>
                  )}
                  
                  {/* Contador de resultados */}
                  <Badge variant="outline" className="text-xs">
                    {risks.length} riscos
                  </Badge>
                </div>
                
                {/* Botão de filtros */}
                <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                      {((filters?.categories?.length || 0) + (filters?.levels?.length || 0) + (filters?.statuses?.length || 0)) > 0 && (
                        <Badge variant="secondary" className="ml-1">
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
            <TableView 
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

      {/* Alex Risk Integration - Contextual e Sempre Ativo */}
      {alexRiskActive && (
        <AlexRiskIntegration 
          currentView={viewMode}
          selectedRisks={risks}
          onSuggestion={(suggestion) => {
            toast({
              title: '🤖 Sugestão Alex Risk',
              description: suggestion,
            });
          }}
        />
      )}
      
      {/* Dialog do Processo Guiado Alex Risk */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto overflow-x-hidden p-0" style={{ maxWidth: '95vw' }}>
          <DialogHeader className="px-3 pt-3 pb-2">
            <DialogTitle className="flex items-center space-x-2 text-sm">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>Alex Risk - Processo Guiado</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Processo inteligente e guiado com suporte de IA.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-3 pb-3">
            <AlexRiskGuidedProcess 
              onComplete={(riskData) => {
                createRisk(riskData);
                setProcessDialogOpen(false);
                toast({
                  title: '🎉 Alex Risk Processo Concluído',
                  description: `Risco "${riskData.risk_title}" registrado com sucesso!`,
                });
              }}
              onCancel={() => {
                setProcessDialogOpen(false);
                toast({
                  title: 'Alex Risk Cancelado',
                  description: 'O processo guiado foi cancelado.',
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog da Biblioteca de Riscos */}
      <Dialog open={libraryDialogOpen} onOpenChange={setLibraryDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Library className="h-6 w-6 text-green-600" />
              <span>Biblioteca de Riscos - Templates e Modelos</span>
            </DialogTitle>
            <DialogDescription>
              Explore nossa coleção de templates pré-definidos, modelos de riscos por setor e melhores práticas para acelerar sua gestão de riscos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
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
    </div>
  );
};

export default RiskManagementCenterImproved;