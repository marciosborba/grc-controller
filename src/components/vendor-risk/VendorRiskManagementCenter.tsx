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
  ChevronRight
} from 'lucide-react';
import { useVendorRiskManagement } from '@/hooks/useVendorRiskManagement';
import { VendorDashboardView } from './views/VendorDashboardView';
import { VendorTableView } from './views/VendorTableView';
import { VendorKanbanView } from './views/VendorKanbanView';
import { VendorProcessView } from './views/VendorProcessView';
import { AlexVendorIntegration } from './shared/AlexVendorIntegration';

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

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAlexAssistant, setShowAlexAssistant] = useState(false);

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
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Críticos",
      value: dashboardMetrics?.critical_vendors || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header with Alex Vendor Branding */}
      <div className="border-b border-border bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <HandHeart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  Gestão de Riscos de Fornecedores
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
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
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none hover:from-blue-700 hover:to-purple-700"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">ALEX VENDOR</span>
              </Button>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Fornecedor</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className="bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                        {stat.label}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar fornecedores, assessments, riscos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              <Zap className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">ALEX</span> Insights Ativos
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-1">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Fornecedores</span>
            </TabsTrigger>
            <TabsTrigger 
              value="kanban" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Assessments</span>
            </TabsTrigger>
            <TabsTrigger 
              value="process" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
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

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardContent className="flex items-center space-x-4 p-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  ALEX VENDOR processando...
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
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
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Brain className="w-6 h-6" />
        </Button>
      </div>

      {/* Alex Vendor Welcome Banner (First Visit) */}
      <div className="hidden"> {/* TODO: Show on first visit */}
        <Card className="mx-4 sm:mx-6 lg:mx-8 mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                  Bem-vindo ao {ALEX_VENDOR_INTRO.name}!
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
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