/**
 * ALEX ASSESSMENT ENGINE - MAIN COMPONENT
 * 
 * Componente principal do Assessment Engine modular e adaptativo
 * Interface inteligente que se adapta ao perfil do usuário e tenant
 * 
 * Author: Claude Code (Alex Assessment)
 * Date: 2025-09-04
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

// DEBUG: Log para verificar se o componente está sendo carregado
console.log('🚀 [ALEX DEBUG] AlexAssessmentEngine.tsx carregado!');
import { 
  Brain,
  Zap,
  Target,
  TrendingUp,
  BookOpen,
  Settings,
  Plus,
  Search,
  Filter,
  BarChart3,
  Lightbulb,
  Sparkles,
  Shield,
  Activity,
  Users,
  Clock,
  Award,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useAlexAssessment } from '@/hooks/useAlexAssessment';
import { useIsMobile } from '@/hooks/use-mobile';
import AlexTemplateSelector from './alex/AlexTemplateSelector';
import AlexFrameworkLibrary from './alex/AlexFrameworkLibrary';
import AlexAssessmentWizard from './alex/AlexAssessmentWizard';
import AlexDashboard from './alex/AlexDashboard';
import AlexAIRecommendations from './alex/AlexAIRecommendations';
import AlexAnalytics from './alex/AlexAnalytics';
import AlexConfigurationPanel from './alex/AlexConfigurationPanel';

interface AlexAssessmentEngineProps {
  mode?: 'dashboard' | 'wizard' | 'library' | 'analytics' | 'settings';
}

const AlexAssessmentEngine: React.FC<AlexAssessmentEngineProps> = ({ 
  mode = 'dashboard' 
}) => {
  // DEBUG: Log para verificar renderização
  console.log('🎯 [ALEX DEBUG] AlexAssessmentEngine RENDERIZANDO!', { mode, timestamp: new Date().toISOString() });
  
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const {
    assessmentTemplates,
    frameworkLibrary,
    tenantConfig,
    isTemplatesLoading,
    isFrameworksLoading,
    getTemplatesByCategory,
    getRecommendedFrameworks
  } = useAlexAssessment();

  const [activeTab, setActiveTab] = useState(mode);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showWizard, setShowWizard] = useState(false);

  // Get user role-based insights
  const userRole = user?.user_metadata?.role || 'user';
  const isExecutive = ['ceo', 'ciso', 'cro', 'admin'].includes(userRole);
  const isAuditor = ['auditor', 'risk_manager'].includes(userRole);
  
  // Smart recommendations based on user profile
  const recommendedFrameworks = getRecommendedFrameworks({
    industry: tenantConfig?.ui_settings?.industry || 'Technology',
    company_size: tenantConfig?.ui_settings?.company_size || 'medium',
    compliance_domains: tenantConfig?.compliance_settings?.required_domains || ['Information Security'],
    region: tenantConfig?.ui_settings?.region || 'Brazil'
  });

  // Categories for templates and frameworks
  const categories = [
    'Information Security',
    'Data Protection', 
    'Cybersecurity',
    'Healthcare Compliance',
    'Financial Services',
    'Service Organization Controls',
    'Payment Security',
    'Custom'
  ];

  const QuickStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Templates</p>
              <p className="text-2xl font-bold text-blue-600">{assessmentTemplates.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Frameworks</p>
              <p className="text-2xl font-bold text-green-600">{frameworkLibrary.length}</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IA Ativo</p>
              <p className="text-2xl font-bold text-purple-600">
                {tenantConfig?.ai_settings?.auto_suggestions ? 'SIM' : 'NÃO'}
              </p>
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recomendados</p>
              <p className="text-2xl font-bold text-orange-600">{recommendedFrameworks.length}</p>
            </div>
            <Target className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const WelcomeBanner = () => (
    <Card className="mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Alex Assessment Engine
            </h2>
            <p className="text-indigo-100 mb-4">
              {isExecutive && "Dashboard executivo com insights estratégicos e benchmarking inteligente."}
              {isAuditor && "Ferramenta especializada para auditores com IA contextual e analytics avançados."}
              {!isExecutive && !isAuditor && "Plataforma inteligente para assessments adaptativos com IA integrada."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Brain className="h-3 w-3 mr-1" />
                IA Integrada
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Zap className="h-3 w-3 mr-1" />
                {frameworkLibrary.length}+ Frameworks
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Target className="h-3 w-3 mr-1" />
                100% Adaptável
              </Badge>
            </div>
          </div>
          <div className="hidden md:block">
            <Rocket className="h-16 w-16 text-white/70" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <Button 
        onClick={() => setShowWizard(true)}
        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Assessment
      </Button>
      <Button 
        variant="outline"
        onClick={() => setActiveTab('library')}
        className="flex-1"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Biblioteca de Frameworks
      </Button>
      <Button 
        variant="outline"
        onClick={() => setActiveTab('analytics')}
        className="flex-1"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Analytics IA
      </Button>
      {(isExecutive || isAuditor) && (
        <Button 
          variant="outline"
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      )}
    </div>
  );

  const SearchAndFilter = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        <Input
          placeholder="Buscar templates, frameworks ou assessments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-3 py-2 border rounded-md bg-background text-foreground min-w-[200px]"
      >
        <option value="">Todas as categorias</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <Button variant="outline" size="icon">
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );

  if (showWizard) {
    return (
      <AlexAssessmentWizard 
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // DEBUG: Log antes do return
  console.log('🎨 [ALEX DEBUG] Renderizando AlexAssessmentEngine - RETURN iniciado');
  
  return (
    <div className="space-y-6">
      {/* DEBUG: Indicador visual no topo */}
      <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
        <h1 className="text-xl font-bold">✅ ALEX ASSESSMENT ENGINE CARREGADO!</h1>
        <p>Timestamp: {new Date().toLocaleString()}</p>
        <p>Modo: {mode}</p>
        <p>Usuário: {user?.email || 'Não autenticado'}</p>
      </div>
      
      <WelcomeBanner />
      <QuickStats />
      <ActionButtons />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} mb-6`}>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {!isMobile && "Dashboard"}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {!isMobile && "Templates"}
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {!isMobile && "Biblioteca"}
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                IA Recomendações
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SearchAndFilter />
          <AlexDashboard 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            userRole={userRole}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <SearchAndFilter />
          <AlexTemplateSelector
            templates={getTemplatesByCategory(selectedCategory)}
            searchTerm={searchTerm}
            onCreateAssessment={(templateId) => console.log('Create from template:', templateId)}
            isLoading={isTemplatesLoading}
          />
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <SearchAndFilter />
          <AlexFrameworkLibrary
            frameworks={frameworkLibrary}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            recommendedFrameworks={recommendedFrameworks}
            isLoading={isFrameworksLoading}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <AlexAIRecommendations userRole={userRole} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AlexAnalytics 
            userRole={userRole}
            tenantConfig={tenantConfig}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AlexConfigurationPanel 
            currentConfig={tenantConfig}
            userRole={userRole}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlexAssessmentEngine;