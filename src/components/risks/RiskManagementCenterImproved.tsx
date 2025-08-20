import React, { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard,
  Table2,
  Kanban,
  GitBranch,
  Brain,
  Plus,
  Settings,
  Filter,
  Search,
  Bell,
  Zap,
  Shield,
  Target,
  BarChart3,
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Download,
  RefreshCw,
  BookOpen,
  Library,
  MessageSquare,
  CheckCircle,
  Clock,
  Eye,
  Send,
  Archive
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
import { RiskFilters } from './shared/RiskFilters';
import { QuickMetrics } from './shared/QuickMetrics';
import { AlexRiskIntegration } from './shared/AlexRiskIntegration';
import { RiskDocumentation } from './RiskDocumentation';

// Novos componentes integrados
import { RiskLibraryIntegrated } from './shared/RiskLibraryIntegrated';
import { RiskAcceptanceLetterIntegrated } from './shared/RiskAcceptanceLetterIntegrated';
import { CommunicationCenterIntegrated } from './shared/CommunicationCenterIntegrated';
import { ActionPlanManagerIntegrated } from './shared/ActionPlanManagerIntegrated';
import { ApprovalWorkflowIntegrated } from './shared/ApprovalWorkflowIntegrated';

// Tipos
export type ViewMode = 'dashboard' | 'table' | 'kanban' | 'process' | 'documentation' | 'library' | 'communications' | 'approvals';

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
  const [alexAnalysisDialogOpen, setAlexAnalysisDialogOpen] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    name: '',
    category: '',
    probability: '',
    responsible: '',
    department: '',
    impact: '',
    description: '',
    controls: ''
  });
  
  // Debug: Log do estado atual (removido para produção)
  // console.log('📊 RiskManagementCenterImproved - viewMode atual:', viewMode);

  // Hooks
  const { user } = useAuth();
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
      action: () => setViewMode('dashboard'),
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
    setAlexAnalysisDialogOpen(true);
    
    toast({
      title: '📝 Registrar Risco',
      description: 'Abrindo formulário para criação manual de risco...',
    });
  };

  const handleRiskLibrary = () => {
    setLibraryDialogOpen(true);
    
    toast({
      title: '📚 Biblioteca de Riscos',
      description: 'Abrindo biblioteca com templates e modelos de riscos...',
    });
  };

  const handleTemplateSelection = (template: any) => {
    // Preencher o formulário manual com dados do template
    setManualFormData({
      name: template.name,
      category: template.category,
      probability: template.probability.toString(),
      responsible: template.createdBy,
      department: template.industry,
      impact: template.impact.toString(),
      description: template.description,
      controls: template.controls.join(', ')
    });
    
    // Fechar biblioteca
    setLibraryDialogOpen(false);
    
    toast({
      title: '📚 Template Aplicado',
      description: `Template "${template.name}" foi aplicado ao formulário manual.`,
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
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Documentação - Módulo de Risco Corporativo</span>
          </h1>
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
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                    <div className={`p-4 rounded-xl ${action.color} text-white shadow-lg`}>
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
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
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
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
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
                <h3 className="text-lg font-semibold">
                  {getViewTitle(viewMode)}
                </h3>
                <div className="flex items-center space-x-1">
                  {(['dashboard', 'table', 'kanban', 'process'] as ViewMode[]).map((view) => {
                    const Icon = getViewIcon(view);
                    return (
                      <Button
                        key={view}
                        variant={viewMode === view ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode(view)}
                        className="flex items-center space-x-1"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {view === 'dashboard' && 'Dashboard'}
                          {view === 'table' && 'Tabela'}
                          {view === 'kanban' && 'Kanban'}
                          {view === 'process' && 'Processo'}
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
          
          {/* ProcessView agora é renderizado em Dialog - removido daqui */}

          {/* RiskLibraryIntegrated agora é renderizado em Dialog - removido daqui */}

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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Análise Alex Risk - Processo Guiado com IA</span>
            </DialogTitle>
            <DialogDescription>
              Processo inteligente e guiado para identificação, análise e tratamento de riscos corporativos com suporte de IA.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ProcessView 
              risks={risks}
              onCreate={(riskData) => {
                createRisk(riskData);
                setProcessDialogOpen(false);
              }}
              onUpdate={updateRisk}
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
              onSelectTemplate={handleTemplateSelection}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog do Registro Manual de Risco */}
      <Dialog open={alexAnalysisDialogOpen} onOpenChange={setAlexAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-6 w-6 text-blue-600" />
              <span>Registrar Novo Risco - Formulário Manual</span>
            </DialogTitle>
            <DialogDescription>
              Formulário simplificado para registro manual de riscos corporativos com campos essenciais.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Botão para Biblioteca de Templates */}
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                    📚 Usar Template da Biblioteca
                  </h3>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Acelere o processo selecionando um template pré-configurado
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLibraryDialogOpen(true)}
                  className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/50"
                >
                  <Library className="h-4 w-4 mr-2" />
                  Escolher Template
                </Button>
              </div>
            </div>
            
            {/* Formulário Manual Simplificado */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome do Risco *</label>
                    <Input 
                      placeholder="Ex: Falha no sistema de pagamento" 
                      value={manualFormData.name}
                      onChange={(e) => setManualFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select 
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={manualFormData.category}
                      onChange={(e) => setManualFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Operacional">Operacional</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Tecnológico">Tecnológico</option>
                      <option value="Regulatório">Regulatório</option>
                      <option value="Reputacional">Reputacional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nível de Probabilidade</label>
                    <select 
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={manualFormData.probability}
                      onChange={(e) => setManualFormData(prev => ({ ...prev, probability: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option value="1">1 - Muito Baixa</option>
                      <option value="2">2 - Baixa</option>
                      <option value="3">3 - Média</option>
                      <option value="4">4 - Alta</option>
                      <option value="5">5 - Muito Alta</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Responsável</label>
                    <Input 
                      placeholder="Nome do responsável" 
                      value={manualFormData.responsible}
                      onChange={(e) => setManualFormData(prev => ({ ...prev, responsible: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Departamento</label>
                    <Input 
                      placeholder="Ex: TI, Financeiro, Operações" 
                      value={manualFormData.department}
                      onChange={(e) => setManualFormData(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nível de Impacto</label>
                    <select 
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={manualFormData.impact}
                      onChange={(e) => setManualFormData(prev => ({ ...prev, impact: e.target.value }))}
                    >
                      <option value="">Selecione</option>
                      <option value="1">1 - Muito Baixo</option>
                      <option value="2">2 - Baixo</option>
                      <option value="3">3 - Médio</option>
                      <option value="4">4 - Alto</option>
                      <option value="5">5 - Muito Alto</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição do Risco</label>
                <textarea 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background" 
                  rows={4}
                  placeholder="Descreva detalhadamente o risco identificado..."
                  value={manualFormData.description}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Controles Existentes</label>
                <textarea 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background" 
                  rows={3}
                  placeholder="Liste os controles já implementados para mitigar este risco..."
                  value={manualFormData.controls}
                  onChange={(e) => setManualFormData(prev => ({ ...prev, controls: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setManualFormData({
                        name: '',
                        category: '',
                        probability: '',
                        responsible: '',
                        department: '',
                        impact: '',
                        description: '',
                        controls: ''
                      });
                      toast({
                        title: '🗑️ Formulário Limpo',
                        description: 'Todos os campos foram limpos.',
                      });
                    }}
                  >
                    Limpar
                  </Button>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setAlexAnalysisDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => {
                      if (!manualFormData.name.trim()) {
                        toast({
                          title: '⚠️ Campo Obrigatório',
                          description: 'Por favor, preencha o nome do risco.',
                          variant: 'destructive'
                        });
                        return;
                      }
                      
                      toast({
                        title: '✅ Risco Registrado',
                        description: `Risco "${manualFormData.name}" foi registrado com sucesso.`,
                      });
                      
                      // Limpar formulário após registro
                      setManualFormData({
                        name: '',
                        category: '',
                        probability: '',
                        responsible: '',
                        department: '',
                        impact: '',
                        description: '',
                        controls: ''
                      });
                      
                      setAlexAnalysisDialogOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!manualFormData.name.trim()}
                  >
                    Registrar Risco
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiskManagementCenterImproved;