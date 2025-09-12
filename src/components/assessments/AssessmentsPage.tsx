import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain,
  Zap,
  Target,
  Activity,
  BarChart3,
  Settings,
  Settings2,
  Library,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Loader2,
  Eye,
  // Rocket e Edit movidos para o módulo Configurações
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

// Lazy loading dos componentes Alex
const AlexTemplateSelector = React.lazy(() => import('./alex/AlexTemplateSelector'));
const AlexFrameworkLibraryEnhanced = React.lazy(() => import('./alex/AlexFrameworkLibraryEnhanced'));
const AlexAnalytics = React.lazy(() => import('./alex/AlexAnalytics'));
const AlexDashboard = React.lazy(() => import('./alex/AlexDashboard'));
const AlexAIRecommendations = React.lazy(() => import('./alex/AlexAIRecommendations'));
const AlexAssessmentWizard = React.lazy(() => import('./alex/AlexAssessmentWizard'));
const AlexProcessDesigner = React.lazy(() => import('./alex/AlexProcessDesigner'));
const AlexProcessDesignerEnhanced = React.lazy(() => import('./alex/AlexProcessDesignerEnhanced'));
// AlexProcessDesignerEnhancedModal movido para o módulo Configurações
const AlexFrameworkDebug = React.lazy(() => import('./alex/AlexFrameworkDebug'));
const AlexTemplateDebug = React.lazy(() => import('./alex/AlexTemplateDebug'));
const NavigationDiagnostic = React.lazy(() => import('../debug/NavigationDiagnostic'));
const AIManagerTest = React.lazy(() => import('../debug/AIManagerTest'));

const AssessmentsPage: React.FC = () => {
  console.log('🎯 [ALEX ASSESSMENT ENGINE] Sistema completo carregado!');
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  // Estados do Enhanced Modal movidos para o módulo Configurações

  // Configurações do tenant para os componentes Alex
  const tenantConfig = {
    auto_refresh_analytics: true,
    ai_insights_enabled: true,
    benchmarking_enabled: true,
    advanced_features: user?.role === 'admin' || user?.role === 'ciso'
  };

  // Handlers para ações
  const handleNewAssessment = () => {
    setShowWizard(true);
    toast.info('Iniciando wizard de criação de assessment');
  };

  const handleFrameworkLibrary = () => {
    setActiveTab('frameworks');
    toast.info('Abrindo biblioteca de frameworks');
  };

  const handleAIRecommendations = () => {
    setActiveTab('ai-recommendations');
    toast.info('Carregando recomendações de IA');
  };

  const handleUseFramework = (frameworkId: string) => {
    setSelectedFramework(frameworkId);
    setShowWizard(true);
    toast.success('Framework selecionado! Iniciando wizard...');
  };

  // Componente de Loading personalizado
  const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );

  // Mock data para demonstração (mantido para compatibilidade)
  const quickStats = {
    activeAssessments: 12,
    completedAssessments: 48,
    pendingReviews: 5,
    complianceScore: 87
  };

  const recentAssessments = [
    { id: 1, name: 'ISO 27001 Assessment', status: 'Em Andamento', progress: 65, framework: 'ISO 27001' },
    { id: 2, name: 'LGPD Compliance Check', status: 'Concluído', progress: 100, framework: 'LGPD' },
    { id: 3, name: 'SOC 2 Type II', status: 'Pendente', progress: 25, framework: 'SOC 2' }
  ];

  const frameworks = [
    { id: 1, name: 'ISO 27001', category: 'Security', description: 'Information Security Management', assessments: 15 },
    { id: 2, name: 'LGPD', category: 'Privacy', description: 'Brazilian Data Protection Law', assessments: 8 },
    { id: 3, name: 'SOC 2', category: 'Compliance', description: 'Service Organization Control', assessments: 12 },
    { id: 4, name: 'NIST CSF', category: 'Security', description: 'Cybersecurity Framework', assessments: 6 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header com Banner de Boas-vindas */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Alex Assessment Engine</h1>
          <Badge className="bg-green-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Integrada
          </Badge>
        </div>
        <p className="text-blue-100">
          Sistema inteligente de assessments adaptativo que se molda ao seu processo de trabalho
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{quickStats.activeAssessments}</p>
                <p className="text-sm text-gray-600">Assessments Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{quickStats.completedAssessments}</p>
                <p className="text-sm text-gray-600">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{quickStats.pendingReviews}</p>
                <p className="text-sm text-gray-600">Revisões Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{quickStats.complianceScore}%</p>
                <p className="text-sm text-gray-600">Score Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={handleNewAssessment}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4" />
          Novo Assessment
        </Button>
        <Button 
          variant="outline" 
          onClick={handleFrameworkLibrary}
          className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
        >
          <Library className="h-4 w-4" />
          Biblioteca de Frameworks
        </Button>
        <Button 
          variant="outline" 
          onClick={handleAIRecommendations}
          className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
        >
          <Brain className="h-4 w-4" />
          Recomendações IA
        </Button>
        <Button 
          variant="outline"
          onClick={() => setActiveTab('templates')}
          className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
        >
          <Settings className="h-4 w-4" />
          Templates
        </Button>
        <Button 
          variant="outline"
          onClick={() => {
            console.log('🔧 Clicando em Designer de Processos');
            setActiveTab('process-designer');
            console.log('✅ activeTab setado para: process-designer');
          }}
          className="flex items-center gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
        >
          <Settings2 className="h-4 w-4" />
          Designer de Processos
          <Badge className="bg-orange-100 text-orange-800 text-xs">
            Beta
          </Badge>
        </Button>
        {/* Botões Criar Enhanced e Editar Enhanced movidos para o módulo Configurações */}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Assessments</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="frameworks" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">Frameworks</span>
            <span className="sm:hidden">Lib</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">Temp</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Métr</span>
          </TabsTrigger>
          <TabsTrigger value="ai-recommendations" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
            <span className="sm:hidden">IA</span>
          </TabsTrigger>
          <TabsTrigger value="process-designer" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Designer</span>
            <span className="sm:hidden">Des</span>
          </TabsTrigger>
          <TabsTrigger value="process-designer-enhanced" className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Enhanced</span>
            <span className="sm:hidden">Enh</span>
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2 bg-orange-100 text-orange-700">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Debug</span>
            <span className="sm:hidden">🐛</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Carregando dashboard inteligente..." />}>
            <AlexDashboard
              userRole={user?.role || 'user'}
              tenantConfig={tenantConfig}
              recentAssessments={recentAssessments}
              quickStats={quickStats}
              onNewAssessment={handleNewAssessment}
              onUseFramework={handleUseFramework}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Todos os Assessments
                <Badge variant="outline" className="ml-2">
                  {quickStats.activeAssessments + quickStats.completedAssessments} total
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar assessments..." 
                  className="border border-gray-300 rounded px-3 py-1 text-sm flex-1 max-w-sm"
                />
                <Button size="sm" onClick={handleNewAssessment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{assessment.name}</h3>
                      <p className="text-sm text-gray-600">{assessment.framework}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{assessment.progress}%</p>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              assessment.progress === 100 ? 'bg-green-500' :
                              assessment.progress >= 70 ? 'bg-blue-500' :
                              assessment.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${assessment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge 
                        variant={assessment.status === 'Concluído' ? 'default' : 
                                assessment.status === 'Em Andamento' ? 'secondary' : 'outline'}
                        className={assessment.status === 'Concluído' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {assessment.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="text-center py-6 border-t">
                  <p className="text-sm text-gray-600 mb-3">
                    Mostrando {recentAssessments.length} de {quickStats.activeAssessments + quickStats.completedAssessments} assessments
                  </p>
                  <Button variant="outline" size="sm">
                    Carregar mais
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Carregando biblioteca de frameworks..." />}>
            <AlexFrameworkLibraryEnhanced
              userRole={user?.role || 'user'}
              tenantConfig={tenantConfig}
              onUseFramework={handleUseFramework}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Carregando seletor de templates..." />}>
            <AlexTemplateSelector
              userRole={user?.role || 'user'}
              tenantConfig={tenantConfig}
              onTemplateSelect={(template) => {
                toast.success(`Template "${template.name}" selecionado!`);
                setShowWizard(true);
              }}
              onCreateTemplate={() => {
                toast.info('Funcionalidade de criar template em desenvolvimento');
              }}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Carregando analytics inteligentes..." />}>
            <AlexAnalytics
              userRole={user?.role || 'user'}
              tenantConfig={tenantConfig}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="ai-recommendations" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Gerando recomendações com IA..." />}>
            <AlexAIRecommendations
              userRole={user?.role || 'user'}
              tenantConfig={tenantConfig}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="process-designer" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Carregando designer de processos..." />}>
            <AlexProcessDesigner />
          </Suspense>
        </TabsContent>

        <TabsContent value="process-designer-enhanced" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Carregando designer enhanced..." />}>
            <AlexProcessDesignerEnhanced />
          </Suspense>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <Suspense fallback={<LoadingSpinner message="Carregando ferramenta de debug..." />}>
            <Tabs defaultValue="navigation" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="navigation" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Navegação
                </TabsTrigger>
                <TabsTrigger value="ai-manager" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Manager
                </TabsTrigger>
                <TabsTrigger value="frameworks" className="flex items-center gap-2">
                  <Library className="h-4 w-4" />
                  Frameworks
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Templates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="navigation" className="mt-6">
                <NavigationDiagnostic />
              </TabsContent>
              
              <TabsContent value="ai-manager" className="mt-6">
                <AIManagerTest />
              </TabsContent>
              
              <TabsContent value="frameworks" className="mt-6">
                <AlexFrameworkDebug />
              </TabsContent>
              
              <TabsContent value="templates" className="mt-6">
                <AlexTemplateDebug />
              </TabsContent>
            </Tabs>
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Modal do Designer Enhanced movido para o módulo Configurações */}

      {/* Modal do Wizard de Criação */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Wizard de Criação - Alex Assessment
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowWizard(false);
                  setSelectedFramework(null);
                }}
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <Suspense fallback={<LoadingSpinner message="Carregando wizard inteligente..." />}>
                <AlexAssessmentWizard
                  userRole={user?.role || 'user'}
                  tenantConfig={tenantConfig}
                  selectedFramework={selectedFramework}
                  onComplete={(assessmentData) => {
                    toast.success('Assessment criado com sucesso!');
                    setShowWizard(false);
                    setSelectedFramework(null);
                    setActiveTab('assessments');
                    console.log('Assessment Data:', assessmentData);
                  }}
                  onCancel={() => {
                    setShowWizard(false);
                    setSelectedFramework(null);
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentsPage;