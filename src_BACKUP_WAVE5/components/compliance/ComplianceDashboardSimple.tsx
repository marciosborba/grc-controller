import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Target,
  Activity,
  BarChart3,
  Plus,
  Search,
  Filter,
  ArrowRight,
  BookOpen
} from 'lucide-react';

function ComplianceDashboardSimple() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data
  const metrics = {
    totalFrameworks: 8,
    activeRequirements: 156,
    conformityRate: 87,
    openNonConformities: 12,
    criticalNonConformities: 3,
    overduePlans: 5,
    upcomingAssessments: 8,
    monthlyTrend: 2.3
  };

  const frameworks = [
    {
      id: '1',
      nome: 'SOX - Sarbanes Oxley',
      origem: 'Regulatório',
      conformityScore: 92,
      totalRequirements: 45,
      conformeRequirements: 41,
      categoria: 'regulatorio'
    },
    {
      id: '2',
      nome: 'LGPD - Lei Geral de Proteção de Dados',
      origem: 'Regulatório',
      conformityScore: 78,
      totalRequirements: 32,
      conformeRequirements: 25,
      categoria: 'regulatorio'
    },
    {
      id: '3',
      nome: 'ISO 27001',
      origem: 'Normativo',
      conformityScore: 85,
      totalRequirements: 114,
      conformeRequirements: 97,
      categoria: 'normativo'
    },
    {
      id: '4',
      nome: 'NIST Cybersecurity Framework',
      origem: 'Normativo',
      conformityScore: 91,
      totalRequirements: 98,
      conformeRequirements: 89,
      categoria: 'normativo'
    }
  ];

  const nonConformities = [
    {
      id: '1',
      codigo: 'NC-001',
      titulo: 'Controle de acesso inadequado',
      criticidade: 'alta',
      status: 'aberta',
      responsavel: 'João Silva',
      diasVencimento: -5
    },
    {
      id: '2',
      codigo: 'NC-002',
      titulo: 'Backup não testado',
      criticidade: 'media',
      status: 'em_tratamento',
      responsavel: 'Maria Santos',
      diasVencimento: 10
    },
    {
      id: '3',
      codigo: 'NC-003',
      titulo: 'Documentação desatualizada',
      criticidade: 'baixa',
      status: 'aberta',
      responsavel: 'Pedro Costa',
      diasVencimento: 15
    }
  ];

  const getCriticalityColor = (criticidade: string) => {
    switch (criticidade) {
      case 'critica': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'em_tratamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolvida': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getConformityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Conformidade</h1>
          <p className="text-muted-foreground">Central de Compliance e Gestão Regulatória</p>
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
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conformidade</p>
                <p className="text-2xl font-bold text-green-600">{metrics.conformityRate}%</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  {metrics.monthlyTrend}% vs mês anterior
                </p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks</p>
                <p className="text-2xl font-bold">{metrics.totalFrameworks}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requisitos</p>
                <p className="text-2xl font-bold">{metrics.activeRequirements}</p>
              </div>
              <Target className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Conformidades</p>
                <p className="text-2xl font-bold text-red-600">{metrics.openNonConformities}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('frameworks')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Frameworks</h3>
            <p className="text-muted-foreground text-sm">Gestão de frameworks regulatórios e normativos</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('assessments')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Avaliações</h3>
            <p className="text-muted-foreground text-sm">Avaliações periódicas de conformidade</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('nonconformities')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Não Conformidades</h3>
            <p className="text-muted-foreground text-sm">Gestão de gaps e planos de ação</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('reports')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
            <p className="text-muted-foreground text-sm">Dashboards e relatórios executivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
          <TabsTrigger value="nonconformities">Não Conformidades</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status dos Frameworks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Status dos Frameworks
                </CardTitle>
                <CardDescription>
                  Níveis de conformidade por framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworks.map(framework => (
                    <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{framework.nome}</p>
                          <span className={`text-sm font-bold ${getConformityColor(framework.conformityScore)}`}>
                            {framework.conformityScore}%
                          </span>
                        </div>
                        <Progress value={framework.conformityScore} className="h-2 mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{framework.origem}</span>
                          <span>{framework.conformeRequirements}/{framework.totalRequirements} requisitos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Não Conformidades Críticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Não Conformidades Prioritárias
                </CardTitle>
                <CardDescription>
                  Gaps que requerem atenção imediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nonConformities.map(nc => (
                    <div key={nc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{nc.titulo}</p>
                          <Badge className={getCriticalityColor(nc.criticidade)}>
                            {nc.criticidade}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{nc.responsavel}</span>
                          <span className={nc.diasVencimento < 0 ? 'text-red-600' : nc.diasVencimento < 7 ? 'text-orange-600' : ''}>
                            {nc.diasVencimento < 0 ? `${Math.abs(nc.diasVencimento)} dias atrasado` :
                             nc.diasVencimento === 0 ? 'Vence hoje' :
                             `${nc.diasVencimento} dias restantes`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frameworks de Compliance</CardTitle>
              <CardDescription>
                Gerencie frameworks regulatórios e normativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  A gestão detalhada de frameworks estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações de Conformidade</CardTitle>
              <CardDescription>
                Gerencie avaliações periódicas de conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O sistema de avaliações estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nonconformities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Não Conformidades</CardTitle>
              <CardDescription>
                Gerencie gaps de conformidade e planos de ação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Módulo em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  A gestão de não conformidades estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComplianceDashboardSimple;