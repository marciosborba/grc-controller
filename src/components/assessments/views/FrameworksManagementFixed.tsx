import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen,
  Shield,
  Award,
  Target,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  FileText,
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Globe,
  Scale,
  ArrowLeft
} from 'lucide-react';

interface FrameworkMetrics {
  totalFrameworks: number;
  activeFrameworks: number;
  standardFrameworks: number;
  customFrameworks: number;
  totalDomains: number;
  totalControls: number;
  totalQuestions: number;
  averageMaturity: number;
}

interface FrameworkTemplate {
  id: string;
  name: string;
  type: string;
  version: string;
  description: string;
  domains: number;
  controls: number;
  questions: number;
  color: string;
  icon: React.ComponentType<any>;
  category: 'regulatory' | 'normative' | 'custom';
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  count?: number;
}

export default function FrameworksManagementFixed() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [metrics, setMetrics] = useState<FrameworkMetrics>({
    totalFrameworks: 4,
    activeFrameworks: 4,
    standardFrameworks: 4,
    customFrameworks: 0,
    totalDomains: 29,
    totalControls: 143,
    totalQuestions: 389,
    averageMaturity: 0
  });

  const frameworkTemplates: FrameworkTemplate[] = [
    {
      id: 'iso27001',
      name: 'ISO/IEC 27001:2022',
      type: 'ISO27001',
      version: '2022',
      description: 'Framework internacional para gestão de segurança da informação',
      domains: 14,
      controls: 93,
      questions: 200,
      color: 'blue',
      icon: Shield,
      category: 'normative'
    },
    {
      id: 'sox',
      name: 'SOX - Sarbanes-Oxley',
      type: 'SOX',
      version: '2002',
      description: 'Framework de compliance para controles internos e governança corporativa',
      domains: 5,
      controls: 15,
      questions: 45,
      color: 'green',
      icon: Award,
      category: 'regulatory'
    },
    {
      id: 'nist',
      name: 'NIST Cybersecurity Framework',
      type: 'NIST',
      version: '1.1',
      description: 'Framework de cibersegurança para identificar, proteger, detectar, responder e recuperar',
      domains: 5,
      controls: 23,
      questions: 108,
      color: 'purple',
      icon: Target,
      category: 'normative'
    },
    {
      id: 'lgpd',
      name: 'LGPD - Lei Geral de Proteção de Dados',
      type: 'LGPD',
      version: '2020',
      description: 'Framework de compliance para a Lei Geral de Proteção de Dados do Brasil',
      domains: 5,
      controls: 12,
      questions: 36,
      color: 'red',
      icon: Scale,
      category: 'regulatory'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Novo Framework',
      description: 'Criar framework customizado',
      icon: Plus,
      color: 'blue',
      action: () => console.log('Criar framework'),
      count: 0
    },
    {
      title: 'Importar Template',
      description: 'Importar framework padrão',
      icon: Download,
      color: 'green',
      action: () => console.log('Importar template'),
      count: frameworkTemplates.length
    },
    {
      title: 'Biblioteca de Controles',
      description: 'Catálogo de controles por framework',
      icon: FileText,
      color: 'purple',
      action: () => navigate('/assessments/questions'),
      count: metrics.totalControls
    },
    {
      title: 'Configurações',
      description: 'Configurar pesos e metodologias',
      icon: Settings,
      color: 'orange',
      action: () => console.log('Configurações'),
      count: 0
    },
    {
      title: 'Relatórios',
      description: 'Análise de frameworks',
      icon: BarChart3,
      color: 'indigo',
      action: () => navigate('/assessments/reports'),
      count: 0
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando frameworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Seguindo padrão dos outros módulos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/assessments')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h1 className="text-3xl font-bold">Gestão de Frameworks</h1>
            <p className="text-muted-foreground">Central de Frameworks de Compliance e Maturidade</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Framework
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Frameworks</p>
                <p className="text-2xl font-bold">{metrics.totalFrameworks}</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  Todos ativos
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks Padrão</p>
                <p className="text-2xl font-bold">{metrics.standardFrameworks}</p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks Customizados</p>
                <p className="text-2xl font-bold">{metrics.customFrameworks}</p>
              </div>
              <Settings className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Controles</p>
                <p className="text-2xl font-bold">{metrics.totalControls}</p>
              </div>
              <Target className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Domínios</p>
                <p className="text-2xl font-bold">{metrics.totalDomains}</p>
              </div>
              <Activity className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questões</p>
                <p className="text-2xl font-bold">{metrics.totalQuestions}</p>
              </div>
              <FileText className="h-10 w-10 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maturidade Média</p>
                <p className="text-2xl font-bold text-green-600">{metrics.averageMaturity}%</p>
              </div>
              <Award className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates Disponíveis</p>
                <p className="text-2xl font-bold text-blue-600">{frameworkTemplates.length}</p>
              </div>
              <Download className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('templates')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Download className="h-8 w-8 text-blue-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Templates</h3>
            <p className="text-muted-foreground text-sm">Frameworks padrão prontos para importação</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('frameworks')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-green-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Meus Frameworks</h3>
            <p className="text-muted-foreground text-sm">Frameworks ativos na organização</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/questions')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Biblioteca</h3>
            <p className="text-muted-foreground text-sm">Controles e questões por framework</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/reports')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
            <p className="text-muted-foreground text-sm">Análise e métricas de frameworks</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30 group relative overflow-hidden" onClick={action.action}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                    <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {action.count !== undefined && action.count > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{action.count}</Badge>
                    )}
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">{action.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-tight">{action.description}</CardDescription>
              </CardHeader>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)'
              }} />
            </Card>
          ))}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="frameworks">Meus Frameworks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-5 w-5" />
                  Regulatórios
                </CardTitle>
                <CardDescription>
                  Frameworks obrigatórios e regulamentações setoriais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {frameworkTemplates
                  .filter(f => f.category === 'regulatory')
                  .map(framework => {
                    const IconComponent = framework.icon;
                    return (
                      <div key={framework.id} className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-orange-600" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{framework.name}</h4>
                              <p className="text-xs text-muted-foreground">v{framework.version}</p>
                            </div>
                          </div>
                          <Badge className={`bg-${framework.color}-100 text-${framework.color}-800`}>
                            {framework.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {framework.controls} controles
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            Importar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <CheckCircle className="h-5 w-5" />
                  Normativos
                </CardTitle>
                <CardDescription>
                  Padrões e boas práticas de mercado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {frameworkTemplates
                  .filter(f => f.category === 'normative')
                  .map(framework => {
                    const IconComponent = framework.icon;
                    return (
                      <div key={framework.id} className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-blue-600" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{framework.name}</h4>
                              <p className="text-xs text-muted-foreground">v{framework.version}</p>
                            </div>
                          </div>
                          <Badge className={`bg-${framework.color}-100 text-${framework.color}-800`}>
                            {framework.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {framework.controls} controles
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            Importar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{metrics.totalFrameworks}</p>
                  <p className="text-xs text-muted-foreground">Frameworks Disponíveis</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-orange-600">
                      {frameworkTemplates.filter(f => f.category === 'regulatory').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Regulatórios</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-600">
                      {frameworkTemplates.filter(f => f.category === 'normative').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Normativos</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Framework
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Importar Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates Disponíveis</CardTitle>
              <CardDescription>
                Frameworks pré-configurados prontos para importação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {frameworkTemplates.map((template) => {
                  const IconComponent = template.icon;
                  
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/20`}>
                            <IconComponent className={`h-5 w-5 text-${template.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">v{template.version}</p>
                          </div>
                          <Badge className={`bg-${template.color}-100 text-${template.color}-800`}>
                            {template.type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.description}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">{template.domains}</p>
                            <p className="text-muted-foreground">Domínios</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-green-600">{template.controls}</p>
                            <p className="text-muted-foreground">Controles</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-purple-600">{template.questions}</p>
                            <p className="text-muted-foreground">Questões</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Importar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Frameworks</CardTitle>
              <CardDescription>
                Frameworks ativos na sua organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum framework configurado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece importando um template ou criando um framework customizado
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => setSelectedTab('templates')}>
                    <Download className="h-4 w-4 mr-2" />
                    Importar Template
                  </Button>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Customizado
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              Dashboards avançados e relatórios analíticos serão implementados em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}