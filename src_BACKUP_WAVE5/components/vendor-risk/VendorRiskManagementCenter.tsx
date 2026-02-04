import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  LayoutDashboard,
  Kanban,
  Brain,
  Plus,
  Filter,
  Search,
  Bell,
  AlertTriangle,
  RefreshCw,
  Building,
  ClipboardCheck,
  FileCheck,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import useVendorRiskManagement from '@/hooks/useVendorRiskManagement';


// Importar views
import { VendorDashboardView } from './views/VendorDashboardView';
import { VendorTableView } from './views/VendorTableView';
import { VendorKanbanView } from './views/VendorKanbanView';

import { VendorAssessmentManager } from './views/VendorAssessmentManager';

import { VendorOnboardingWorkflow } from './workflows/VendorOnboardingWorkflow';
import { VendorNotificationSystem } from './notifications/VendorNotificationSystem';
import { VendorActionPlanManager } from './views/VendorActionPlanManager';

// Tipos
export type VendorViewMode = 'dashboard' | 'vendors' | 'assessments' | 'kanban' | 'action_plans';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  badge?: string | number;
}

export const VendorRiskManagementCenter: React.FC = () => {
  // Estados principais
  const [viewMode, setViewMode] = useState<VendorViewMode>('dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showOnboardingWorkflow, setShowOnboardingWorkflow] = useState(false);
  const [showNotificationSystem, setShowNotificationSystem] = useState(false);

  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    vendors,
    assessments,
    dashboardMetrics,
    riskDistribution,
    loading,
    error,
    fetchVendors,
    fetchAssessments,
    fetchDashboardMetrics,
    fetchRiskDistribution,
    resetError
  } = useVendorRiskManagement();

  // Detectar mudanças de tema
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Verificar tema inicial
    checkTheme();

    // Observer para mudanças na classe dark
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Escutar eventos de mudança de tema
    const handleThemeChange = () => {
      checkTheme();
    };

    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  // Inicializar dados
  useEffect(() => {
    if (user?.tenantId) {
      fetchVendors();
      fetchAssessments();
      fetchDashboardMetrics();
      fetchRiskDistribution();
    }
  }, [user?.tenantId, fetchVendors, fetchAssessments, fetchDashboardMetrics, fetchRiskDistribution]);

  const getQuickActions = (): QuickAction[] => {
    const highRiskVendors = dashboardMetrics?.critical_vendors || 0;
    const pendingAssessments = dashboardMetrics?.pending_assessments || 0;
    const overdueAssessments = dashboardMetrics?.overdue_assessments || 0;

    return [
      {
        id: 'new-vendor',
        title: 'Novo Fornecedor',
        description: 'Iniciar processo de onboarding',
        icon: Plus,
        color: 'primary',
        action: () => setShowOnboardingWorkflow(true)
      },
      {
        id: 'all-vendors',
        title: 'Fornecedores',
        description: 'Gerenciar base de fornecedores',
        icon: Building,
        color: 'blue',
        action: () => {
          setSelectedFilter('all');
          setViewMode('vendors');
        },
        badge: undefined
      },
      {
        id: 'pending-assessments',
        title: 'Assessments',
        description: 'Gerenciar todas as avaliações',
        icon: FileCheck,
        color: 'orange',
        action: () => {
          setSelectedFilter('all'); // Changed from 'pending' to 'all' to show all items
          setViewMode('assessments');
        },
        badge: pendingAssessments > 0 ? pendingAssessments : undefined
      },
      {
        id: 'communication-center',
        title: 'Comunicação',
        description: 'Gerenciar notificações e lembretes',
        icon: MessageSquare,
        color: 'purple',
        action: () => setShowNotificationSystem(true),
        badge: overdueAssessments > 0 ? overdueAssessments : undefined
      },
      {
        id: 'kanban-board',
        title: 'Gestão Visual',
        description: 'Acompanhar progresso no Kanban',
        icon: BarChart3,
        color: 'green',
        action: () => {
          setSelectedFilter('all'); // Ensure filter is reset
          setViewMode('kanban');
        }
      }
    ];
  };

  // Refresh de dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchVendors(),
        fetchAssessments(),
        fetchDashboardMetrics(),
        fetchRiskDistribution()
      ]);
      toast({
        title: 'Dados atualizados',
        description: 'Informações sincronizadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível sincronizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para obter o gradiente dinâmico
  const getHoverGradient = () => {
    if (isDarkMode) {
      // Dark mode: usar gradientes visíveis
      return {
        base: `linear-gradient(to right, hsl(var(--muted) / 0.3), transparent)`,
        hover: `linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)`
      };
    } else {
      // Light mode: base transparente, hover muito sutil
      return {
        base: `transparent`,
        hover: `linear-gradient(to right, hsl(var(--primary) / 0.05), transparent)`
      };
    }
  };

  // Loading state para dados principais
  if (loading && !vendors.length && !assessments.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 vendor-risk-management">
      {/* Premium Storytelling Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Panorama da Base */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Building className="h-32 w-32 text-blue-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Building className="h-5 w-5" />
              Panorama da Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{vendors.length || 0}</span>
                <span className="text-sm text-muted-foreground">fornecedores totais</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total de parceiros cadastrados.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Ativos
                </span>
                <span className="font-medium text-green-600">
                  {vendors.filter(v => v.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> Críticos
                </span>
                <Badge variant={dashboardMetrics?.critical_vendors > 0 ? "destructive" : "secondary"} className="text-xs">
                  {dashboardMetrics?.critical_vendors || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Assessments & Riscos */}
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ClipboardCheck className="h-32 w-32 text-orange-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <ClipboardCheck className="h-5 w-5" />
              Assessments & Riscos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{assessments.length || 0}</span>
                <span className="text-sm text-muted-foreground">avaliações totais</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Processos de avaliação de risco.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-orange-500" /> Em Andamento
                </span>
                <span className="font-bold text-orange-600">
                  {dashboardMetrics?.pending_assessments || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> Em Atraso
                </span>
                <Badge variant={dashboardMetrics?.overdue_assessments > 0 ? "destructive" : "secondary"} className="text-xs">
                  {dashboardMetrics?.overdue_assessments || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Conformidade & Ações */}
        <Card className="relative overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <CheckCircle className="h-32 w-32 text-green-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Conformidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {vendors.length > 0 ? (vendors.filter(v => v.risk_score < 4.0).length / vendors.length * 100).toFixed(0) : 0}%
                </span>
                <span className="text-sm text-muted-foreground">em compliance</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Fornecedores dentro do apetite de risco.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" /> Baixo Risco
                </span>
                <span className="font-medium">
                  {vendors.filter(v => v.criticality_level === 'low').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileCheck className="h-4 w-4" /> Contratos OK
                </span>
                <span className="font-medium">
                  {vendors.length - (dashboardMetrics?.expiring_contracts || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid - Premium Navigation */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Funcionalidades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {getQuickActions().map((action) => (
            <div
              key={action.id}
              onClick={action.action}
              className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              {/* Gradient Border Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <action.icon className="w-6 h-6" />
                  </div>
                  {action.badge && (
                    <Badge variant={action.id === 'pending-assessments' || action.id === 'communication-center' ? 'destructive' : 'secondary'} className="font-mono text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-sm flex items-center gap-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="w-full">
        <Tabs
          value={viewMode}
          onValueChange={(value) => {
            setViewMode(value as VendorViewMode);
            setSelectedFilter('all'); // Reset filter when switching tabs
          }}
        >
          <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between p-4 md:p-6">
              <TabsList className="grid w-fit grid-cols-5">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="vendors" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Fornecedores
                </TabsTrigger>
                <TabsTrigger value="assessments" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Assessments
                </TabsTrigger>
                <TabsTrigger value="action_plans" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Plano de Ação
                </TabsTrigger>
                <TabsTrigger value="kanban" className="flex items-center gap-2">
                  <Kanban className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {(viewMode === 'vendors' || viewMode === 'assessments') && (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filtros
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tab Contents */}
          <div className="py-6">
            <TabsContent value="dashboard" className="mt-0 h-full">
              <VendorDashboardView
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
                metrics={dashboardMetrics}
                riskDistribution={riskDistribution}
                vendors={vendors}
                assessments={assessments}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="vendors" className="mt-0 h-full">
              <VendorTableView
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
                loading={loading}
                showFilters={showFilters}
                assessments={assessments}
              />
            </TabsContent>

            <TabsContent value="assessments" className="mt-0 h-full">
              <VendorAssessmentManager
                assessments={assessments}
                vendors={vendors}
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
                loading={loading}
                showFilters={showFilters}
              />
            </TabsContent>

            <TabsContent value="kanban" className="mt-0 h-full">
              <VendorKanbanView
                assessments={assessments}
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
              />
            </TabsContent>

            <TabsContent value="action_plans" className="mt-0 h-full">
              <VendorActionPlanManager />
            </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* Modals */}
      {showOnboardingWorkflow && (
        <VendorOnboardingWorkflow
          isOpen={showOnboardingWorkflow}
          onClose={() => setShowOnboardingWorkflow(false)}
          onComplete={(vendor) => {
            setShowOnboardingWorkflow(false);
            fetchVendors();
            toast({
              title: 'Fornecedor criado',
              description: `${vendor.name} foi cadastrado com sucesso.`,
            });
          }}
        />
      )}

      {showNotificationSystem && (
        <VendorNotificationSystem
          open={showNotificationSystem}
          onOpenChange={setShowNotificationSystem}
          vendors={vendors}
          assessments={assessments}
        />
      )}


    </div>
  );
};

export default VendorRiskManagementCenter;