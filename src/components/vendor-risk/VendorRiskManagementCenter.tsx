import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  HandHeart, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  FileCheck, 
  BarChart3,
  Filter,
  Search,
  Plus,
  Brain,
  Zap,
  Target,
  Activity,
  ChevronRight,
  Bell
} from 'lucide-react';
import { useVendorRiskManagement } from '@/hooks/useVendorRiskManagement';
import { useTenantTheme } from '@/hooks/useTenantTheme';
import { VendorDashboardView } from './views/VendorDashboardView';
import { VendorTableView } from './views/VendorTableView';
import { VendorKanbanView } from './views/VendorKanbanView';
import { VendorProcessView } from './views/VendorProcessView';
import { VendorAssessmentManager } from './views/VendorAssessmentManager';
import { AlexVendorIntegration } from './shared/AlexVendorIntegration';
import { VendorOnboardingWorkflow } from './workflows/VendorOnboardingWorkflow';
import { VendorNotificationSystem } from './notifications/VendorNotificationSystem';

// ================================================
// ALEX VENDOR AI PERSONALITY
// ================================================

const ALEX_VENDOR_INTRO = {
  name: "ALEX VENDOR",
  role: "Especialista em Gestão de Riscos de Fornecedores",
  specialties: [
    "Avaliação e monitoramento contínuo de fornecedores",
    "Frameworks de assessment (ISO 27001, SOC 2, NIST)",
    "Análise de risco de terceiros com IA",
    "Due diligence automatizada",
    "Gestão de contratos e SLAs",
    "Compliance de fornecedores"
  ],
  greeting: "Olá! Sou ALEX VENDOR, seu especialista em gestão de riscos de fornecedores. Estou aqui para ajudar você a identificar, avaliar e mitigar riscos em toda sua cadeia de suprimentos de forma inteligente e eficiente."
};

interface VendorRiskManagementCenterProps {}

export const VendorRiskManagementCenter: React.FC<VendorRiskManagementCenterProps> = () => {
  const {
    dashboardMetrics,
    riskDistribution,
    loading,
    error,
    fetchDashboardMetrics,
    fetchRiskDistribution,
    resetError
  } = useVendorRiskManagement();
  
  // Integrate with tenant theme system
  const { tenantTheme, loading: themeLoading } = useTenantTheme();

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAlexAssistant, setShowAlexAssistant] = useState(false);
  const [showOnboardingWorkflow, setShowOnboardingWorkflow] = useState(false);
  const [showNotificationSystem, setShowNotificationSystem] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | undefined>(undefined);

  // Initialize data
  useEffect(() => {
    fetchDashboardMetrics();
    fetchRiskDistribution();
  }, [fetchDashboardMetrics, fetchRiskDistribution]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetError();
  };

  // Quick stats for header
  const quickStats = [
    {
      label: "Fornecedores Ativos",
      value: dashboardMetrics?.total_vendors || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Críticos",
      value: dashboardMetrics?.critical_vendors || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Assessments Pendentes",
      value: dashboardMetrics?.pending_assessments || 0,
      icon: FileCheck,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      label: "Incidentes Ativos",
      value: dashboardMetrics?.active_incidents || 0,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header with Alex Vendor Branding */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center lg:space-y-0 space-y-4">
        <div className="flex-1 min-w-0">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary shadow-lg">
                <HandHeart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                  Gestão de Riscos de Fornecedores
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Powered by {ALEX_VENDOR_INTRO.name} - {ALEX_VENDOR_INTRO.role}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlexAssistant(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground border-none hover:bg-primary/90"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">ALEX VENDOR</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowNotificationSystem(true)}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowOnboardingWorkflow(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Fornecedor</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                        {stat.label}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar fornecedores, assessments, riscos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="critical">Críticos</SelectItem>
                  <SelectItem value="high-risk">Alto Risco</SelectItem>
                  <SelectItem value="pending-assessment">Assessment Pendente</SelectItem>
                  <SelectItem value="expiring-contracts">Contratos Vencendo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Alex Insights Badge */}
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">ALEX</span> Insights Ativos
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 p-1">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Fornecedores</span>
            </TabsTrigger>
            <TabsTrigger 
              value="assessments" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Assessments</span>
            </TabsTrigger>
            <TabsTrigger 
              value="kanban" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger 
              value="process" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Processos</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="dashboard" className="space-y-6">
              <VendorDashboardView 
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
              />
            </TabsContent>

            <TabsContent value="table" className="space-y-6">
              <VendorTableView 
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
              />
            </TabsContent>

            <TabsContent value="assessments" className="space-y-6">
              <VendorAssessmentManager 
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
              />
            </TabsContent>

            <TabsContent value="kanban" className="space-y-6">
              <VendorKanbanView 
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
              />
            </TabsContent>

            <TabsContent value="process" className="space-y-6">
              <VendorProcessView 
                searchTerm={searchTerm}
                selectedFilter={selectedFilter}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* ALEX VENDOR AI Assistant */}
      {showAlexAssistant && (
        <AlexVendorIntegration 
          isOpen={showAlexAssistant}
          onClose={() => setShowAlexAssistant(false)}
          context={{
            activeTab,
            dashboardMetrics,
            riskDistribution,
            searchTerm,
            selectedFilter
          }}
        />
      )}

      {/* Vendor Onboarding Workflow */}
      <VendorOnboardingWorkflow 
        vendorId={selectedVendorId}
        isOpen={showOnboardingWorkflow}
        onClose={() => {
          setShowOnboardingWorkflow(false);
          setSelectedVendorId(undefined);
        }}
        onComplete={(vendor) => {
          // Refresh data after onboarding completion
          fetchDashboardMetrics();
          fetchRiskDistribution();
        }}
      />

      {/* Vendor Notification System */}
      <VendorNotificationSystem 
        isOpen={showNotificationSystem}
        onClose={() => setShowNotificationSystem(false)}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6">
            <CardContent className="flex items-center space-x-4 p-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium">
                  ALEX VENDOR processando...
                </p>
                <p className="text-sm text-muted-foreground">
                  Analisando dados de fornecedores
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Floating Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          size="lg"
          onClick={() => setShowAlexAssistant(true)}
          className="rounded-full w-14 h-14 bg-primary shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Brain className="w-6 h-6" />
        </Button>
      </div>

      {/* Alex Vendor Welcome Banner (First Visit) */}
      <div className="hidden"> {/* TODO: Show on first visit */}
        <Card className="mx-4 sm:mx-6 lg:mx-8 mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Bem-vindo ao {ALEX_VENDOR_INTRO.name}!
                </CardTitle>
                <CardDescription className="text-primary/80">
                  {ALEX_VENDOR_INTRO.greeting}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {ALEX_VENDOR_INTRO.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  {specialty}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlexAssistant(true)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Começar Agora
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorRiskManagementCenter;