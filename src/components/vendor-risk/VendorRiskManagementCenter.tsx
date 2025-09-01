import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard,
  Kanban,
  GitBranch,
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
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import useVendorRiskManagement from '@/hooks/useVendorRiskManagement';


// Importar views
import { VendorDashboardView } from './views/VendorDashboardView';
import { VendorTableView } from './views/VendorTableView';
import { VendorKanbanView } from './views/VendorKanbanView';
import { VendorProcessView } from './views/VendorProcessView';
import { VendorAssessmentManager } from './views/VendorAssessmentManager';

import { VendorOnboardingWorkflow } from './workflows/VendorOnboardingWorkflow';
import { VendorNotificationSystem } from './notifications/VendorNotificationSystem';

// Tipos
export type VendorViewMode = 'dashboard' | 'vendors' | 'assessments' | 'kanban' | 'process';

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
    if (user?.tenantId || user?.tenant_id) {
      fetchVendors();
      fetchAssessments();
      fetchDashboardMetrics();
      fetchRiskDistribution();
    }
  }, [user?.tenantId, user?.tenant_id, fetchVendors, fetchAssessments, fetchDashboardMetrics, fetchRiskDistribution]);

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
        action: () => setShowOnboardingWorkflow(true)
      },
      {
        id: 'critical-vendors',
        title: 'Fornecedores Críticos',
        description: 'Revisar fornecedores de alto risco',
        icon: AlertTriangle,
        action: () => {
          setSelectedFilter('critical');
          setViewMode('vendors');
        },
        badge: highRiskVendors > 0 ? highRiskVendors : undefined
      },
      {
        id: 'pending-assessments',
        title: 'Assessments',
        description: 'Revisar avaliações em andamento',
        icon: FileCheck,
        action: () => {
          setSelectedFilter('pending');
          setViewMode('assessments');
        },
        badge: pendingAssessments > 0 ? pendingAssessments : undefined
      },
      {
        id: 'communication-center',
        title: 'Comunicação',
        description: 'Gerenciar notificações e lembretes',
        icon: MessageSquare,
        action: () => setShowNotificationSystem(true),
        badge: overdueAssessments > 0 ? overdueAssessments : undefined
      },
      {
        id: 'kanban-board',
        title: 'Gestão Visual',
        description: 'Acompanhar progresso no Kanban',
        icon: BarChart3,
        action: () => setViewMode('kanban')
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

  if (themeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 vendor-risk-management">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 quick-actions-grid">
          {getQuickActions().map((action) => (
            <Card
              key={action.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30 group relative overflow-hidden"
              style={{
                backgroundColor: isDarkMode 
                  ? 'hsl(215, 8%, 12%)' // Cor do card no dark mode
                  : '#ffffff', // Cor branca no light mode
                borderColor: isDarkMode
                  ? 'hsl(215, 10%, 22%)' // Cor da borda no dark mode
                  : 'hsl(214, 32%, 91%)', // Cor da borda no light mode
                color: isDarkMode
                  ? 'hsl(0, 0%, 100%)' // Texto branco no dark mode
                  : 'hsl(225, 71%, 12%)' // Texto escuro no light mode
              }}
              onClick={action.action}
            >
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Ícone com background */}
                  <div className={`
                    p-3 rounded-full transition-all duration-300
                    ${action.id === 'new-vendor' ? 'bg-primary/10 text-primary group-hover:bg-primary/20' :
                      action.id === 'critical-vendors' ? 'bg-red-500/10 text-red-600 group-hover:bg-red-500/20' :
                      action.id === 'pending-assessments' ? 'bg-orange-500/10 text-orange-600 group-hover:bg-orange-500/20' :
                      action.id === 'communication-center' ? 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20' :
                      'bg-green-500/10 text-green-600 group-hover:bg-green-500/20'
                    }
                  `}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  
                  {/* Título e descrição */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Badge se existir */}
                  {action.badge && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Efeito de hover - CSS dinâmico */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: getHoverGradient().hover
                  }}
                />
              </CardContent>
            </Card>
          ))}
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
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as VendorViewMode)}>
          <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between p-4">
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
                <TabsTrigger value="kanban" className="flex items-center gap-2">
                  <Kanban className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="process" className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Processos
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
                metrics={dashboardMetrics}
                riskDistribution={riskDistribution}
                vendors={vendors}
                assessments={assessments}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="vendors" className="mt-0 h-full">
              <VendorTableView
                vendors={vendors}
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
                loading={loading}
                showFilters={showFilters}
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

            <TabsContent value="process" className="mt-0 h-full">
              <VendorProcessView
                vendors={vendors}
                assessments={assessments}
                loading={loading}
              />
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