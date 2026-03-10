import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  RefreshCw
} from 'lucide-react';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { useRiskManagement } from '@/hooks/useRiskManagement';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';

// Importar views
import { DashboardView } from './views/DashboardView';
import { TableView } from './views/TableView';
import { KanbanView } from './views/KanbanView';
import { ProcessView } from './views/ProcessView';
import { RiskFilters } from './shared/RiskFilters';
import { QuickMetrics } from './shared/QuickMetrics';
import { AlexRiskIntegration } from './shared/AlexRiskIntegration';

// Tipos
export type ViewMode = 'dashboard' | 'table' | 'kanban' | 'process';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  badge?: string | number;
}

export const RiskManagementCenter: React.FC = () => {
  // Estados principais
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    deleteRisk,
    refreshData,
    filters,
    setFilters
  } = useRiskManagement();

  // Ações rápidas inteligentes
  const getQuickActions = (): QuickAction[] => [
    {
      id: 'new-risk',
      title: 'Novo Risco',
      description: 'Criar e registrar novo risco',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleNewRisk()
    },
    {
      id: 'alex-analysis',
      title: 'Análise Alex',
      description: 'Análise inteligente com IA',
      icon: Brain,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => handleAlexAnalysis(),
      badge: 'IA'
    },
    {
      id: 'risk-matrix',
      title: 'Matriz de Riscos',
      description: 'Visualização matricial',
      icon: Target,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => setViewMode('dashboard')
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Gerar relatórios executivos',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => handleReports(),
      badge: metrics?.totalRisks || 0
    },
    {
      id: 'library',
      title: 'Biblioteca',
      description: 'Templates e modelos',
      icon: BarChart3,
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => handleLibrary()
    },
    {
      id: 'notifications',
      title: 'Alertas',
      description: 'Notificações e lembretes',
      icon: Bell,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => handleNotifications(),
      badge: metrics?.overdueActivities || 0
    }
  ];

  // Handlers
  const handleNewRisk = () => {
    setViewMode('process');
    // TODO: Implementar criação guiada
  };

  const handleAlexAnalysis = () => {
    // Alex Risk será integrado contextualmente
    toast({
      title: '🤖 Alex Risk',
      description: 'Iniciando análise inteligente dos riscos...',
    });
  };

  const handleReports = () => {
    // TODO: Implementar geração de relatórios
    toast({
      title: '📊 Relatórios',
      description: 'Preparando relatórios executivos...',
    });
  };

  const handleLibrary = () => {
    // TODO: Implementar biblioteca de riscos
    toast({
      title: '📚 Biblioteca',
      description: 'Acessando biblioteca de templates...',
    });
  };

  const handleNotifications = () => {
    // TODO: Implementar central de notificações
    toast({
      title: '🔔 Notificações',
      description: 'Verificando alertas pendentes...',
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast({
        title: '✅ Atualizado',
        description: 'Dados atualizados com sucesso',
      });
    } catch (error) {
      toast({
        title: '❌ Erro',
        description: 'Falha ao atualizar dados',
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
      default: return LayoutDashboard;
    }
  };

  const getViewTitle = (view: ViewMode) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Executivo';
      case 'table': return 'Lista Detalhada';
      case 'kanban': return 'Kanban Board';
      case 'process': return 'Processo Guiado';
      default: return 'Dashboard';
    }
  };

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
      {/* Header Executivo */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold truncate">
                Centro de Gestão de Riscos
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base">
                Plataforma unificada para identificação, análise, tratamento e monitoramento de riscos corporativos
              </p>
            </div>
          </div>
          
          {/* Status do Sistema */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-600 font-medium">Sistema Operacional</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>{risks.length} riscos ativos</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Alex Risk integrado</span>
            </div>
          </div>
        </div>
        
        {/* Controles do Header */}
        <div className="flex items-center space-x-2">
          {/* Alex Risk sempre disponível */}
          <ImprovedAIChatDialog 
            type="risk"
            context={{ 
              totalRisks: metrics?.totalRisks || 0,
              highRisks: metrics?.risksByLevel?.['Alto'] || 0,
              overdueActions: metrics?.overdueActivities || 0
            }}
            trigger={
              <Button variant="outline" className="flex items-center space-x-2 hover:bg-purple-50 transition-colors">
                <div className="p-1 rounded-full bg-purple-500">
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <span>Alex Risk</span>
                <Badge variant="secondary" className="text-xs">IA</Badge>
              </Button>
            }
          />
          
          {/* Refresh */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          
          {/* Filtros */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          
          {/* Configurações */}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Config</span>
          </Button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <QuickMetrics metrics={metrics} isLoading={isLoadingMetrics} />

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <span>Ações Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {getQuickActions().map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all relative"
                  onClick={action.action}
                >
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  {action.badge && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Área Principal de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com Filtros (oculta em mobile se não ativa) */}
        {(showFilters || window.innerWidth >= 1024) && (
          <div className="lg:col-span-1">
            <RiskFilters 
              filters={filters}
              onFiltersChange={setFilters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}
        
        {/* Conteúdo Principal */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
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
              
              {/* Busca Global */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar riscos por nome, categoria ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
          
          {viewMode === 'process' && (
            <ProcessView 
              risks={risks}
              onCreate={createRisk}
              onUpdate={updateRisk}
            />
          )}
        </div>
      </div>

      {/* Alex Risk Integration - Contextual */}
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
    </div>
  );
};

export default RiskManagementCenter;