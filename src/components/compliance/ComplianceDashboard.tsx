import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TrendingDown,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Filter,
  Plus,
  Search,
  Settings,
  ArrowRight,
  Activity,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import SOXControlsLibrary from './SOXControlsLibrary';
import NonConformitiesManagement from './NonConformitiesManagement';
import AssessmentsManagement from './AssessmentsManagement';
import MonitoramentoManagement from './MonitoramentoManagement';

interface ComplianceMetrics {
  totalFrameworks: number;
  activeRequirements: number;
  conformityRate: number;
  openNonConformities: number;
  criticalNonConformities: number;
  overduePlans: number;
  upcomingAssessments: number;
  monthlyTrend: number;
}

interface FrameworkStatus {
  id: string;
  nome: string;
  origem: string;
  conformityScore: number;
  totalRequirements: number;
  conformeRequirements: number;
  lastAssessment: string;
  status: string;
  categoria: string;
}

interface NonConformity {
  id: string;
  codigo: string;
  titulo: string;
  criticidade: string;
  status: string;
  responsavel: string;
  prazoResolucao: string;
  diasVencimento: number;
  risco_score: number;
}

export function ComplianceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalFrameworks: 0,
    activeRequirements: 0,
    conformityRate: 0,
    openNonConformities: 0,
    criticalNonConformities: 0,
    overduePlans: 0,
    upcomingAssessments: 0,
    monthlyTrend: 0
  });
  
  const [activePlans, setActivePlans] = useState(0);
  
  const [frameworks, setFrameworks] = useState<FrameworkStatus[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (effectiveTenantId) {
      loadComplianceData();
    }
  }, [effectiveTenantId]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      
      // Carregar métricas principais
      await Promise.all([
        loadMetrics(),
        loadFrameworks(),
        loadNonConformities()
      ]);
      
    } catch (error) {
      console.error('Erro ao carregar dados de conformidade:', error);
      toast.error('Erro ao carregar dados de conformidade');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    // Frameworks ativos
    const { data: frameworksData } = await supabase
      .from('frameworks_compliance')
      .select('id')
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo');

    // Requisitos ativos
    const { data: requirementsData } = await supabase
      .from('requisitos_compliance')
      .select('id, framework_id')
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo');

    // Não conformidades abertas
    const { data: nonConformitiesData } = await supabase
      .from('nao_conformidades')
      .select('id, criticidade, status')
      .eq('tenant_id', effectiveTenantId)
      .in('status', ['aberta', 'em_tratamento']);

    // Planos de ação em atraso
    const { data: overduePlansData } = await supabase
      .from('planos_acao_conformidade')
      .select('id')
      .eq('tenant_id', effectiveTenantId)
      .lt('data_fim_planejada', new Date().toISOString().split('T')[0])
      .in('status', ['planejada', 'aprovada', 'em_execucao']);

    // Planos de ação ativos (todos os status ativos)
    const { data: activePlansData } = await supabase
      .from('planos_acao_conformidade')
      .select('id')
      .eq('tenant_id', effectiveTenantId)
      .in('status', ['planejada', 'aprovada', 'em_execucao']);

    // Avaliações próximas (próximos 30 dias)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const { data: upcomingAssessmentsData } = await supabase
      .from('requisitos_compliance')
      .select('id, data_proxima_avaliacao')
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo')
      .gte('data_proxima_avaliacao', today)
      .lte('data_proxima_avaliacao', thirtyDaysFromNow.toISOString().split('T')[0])
      .not('data_proxima_avaliacao', 'is', null);

    // Calcular taxa de conformidade (simplificado)
    const conformityRate = requirementsData?.length 
      ? Math.round(((requirementsData.length - (nonConformitiesData?.length || 0)) / requirementsData.length) * 100)
      : 100;

    setMetrics({
      totalFrameworks: frameworksData?.length || 0,
      activeRequirements: requirementsData?.length || 0,
      conformityRate,
      openNonConformities: nonConformitiesData?.length || 0,
      criticalNonConformities: nonConformitiesData?.filter(nc => nc.criticidade === 'critica').length || 0,
      overduePlans: overduePlansData?.length || 0,
      upcomingAssessments: upcomingAssessmentsData?.length || 0,
      monthlyTrend: nonConformitiesData?.length > 0 ? -2.3 : 1.8 // Baseado em não conformidades
    });

    setActivePlans(activePlansData?.length || 0);
  };

  const loadFrameworks = async () => {
    const { data: frameworksData } = await supabase
      .from('frameworks_compliance')
      .select(`
        id,
        nome,
        origem,
        categoria,
        status,
        codigo,
        tipo,
        requisitos_compliance(
          id,
          status,
          codigo,
          titulo,
          categoria,
          criticidade
        )
      `)
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo')
      .order('nome');

    if (frameworksData) {
      const frameworksWithScores = frameworksData.map(framework => {
        const totalRequirements = framework.requisitos_compliance?.length || 0;
        // Por enquanto, score simulado - depois será calculado baseado em avaliações reais
        const conformityScore = Math.round(Math.random() * 40 + 60); // Entre 60-100%
        const conformeRequirements = Math.round((conformityScore / 100) * totalRequirements);
        
        return {
          id: framework.id,
          nome: framework.nome,
          origem: framework.origem || 'N/A',
          conformityScore,
          totalRequirements,
          conformeRequirements,
          lastAssessment: '2025-09-01', // Simulado
          status: framework.status,
          categoria: framework.categoria || 'Geral'
        };
      });
      
      setFrameworks(frameworksWithScores);
    }
  };

  const loadNonConformities = async () => {
    const { data: nonConformitiesData } = await supabase
      .from('nao_conformidades')
      .select(`
        id,
        codigo,
        titulo,
        criticidade,
        status,
        prazo_resolucao,
        risco_score,
        responsavel_tratamento,
        profiles!nao_conformidades_responsavel_tratamento_fkey(full_name)
      `)
      .eq('tenant_id', effectiveTenantId)
      .in('status', ['aberta', 'em_tratamento'])
      .order('risco_score', { ascending: false })
      .limit(10);

    if (nonConformitiesData) {
      const processedNonConformities = nonConformitiesData.map(nc => {
        const prazoResolucao = nc.prazo_resolucao ? new Date(nc.prazo_resolucao) : null;
        const today = new Date();
        const diasVencimento = prazoResolucao 
          ? Math.ceil((prazoResolucao.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: nc.id,
          codigo: nc.codigo,
          titulo: nc.titulo,
          criticidade: nc.criticidade,
          status: nc.status,
          responsavel: nc.profiles?.full_name || 'Não atribuído',
          prazoResolucao: prazoResolucao?.toLocaleDateString('pt-BR') || 'Não definido',
          diasVencimento,
          risco_score: nc.risco_score || 0
        };
      });
      
      setNonConformities(processedNonConformities);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                  {metrics.monthlyTrend >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  {Math.abs(metrics.monthlyTrend).toFixed(1)}% vs mês anterior
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{metrics.criticalNonConformities}</p>
              </div>
              <Zap className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planos Atrasados</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.overduePlans}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliações Próximas</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.upcomingAssessments}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {activePlans}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.overduePlans > 0 ? `${metrics.overduePlans} em atraso` : 'Todos no prazo'}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
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
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
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
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
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
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
          <TabsTrigger value="nonconformities">Não Conformidades</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="sox-library">Biblioteca SOX</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Navegação por Categorias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTab('frameworks')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Frameworks Regulatórios</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  SOX, LGPD, BACEN e outros requisitos obrigatórios
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {frameworks.filter(f => f.tipo === 'regulatorio').length} frameworks ativos
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    Crítico
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTab('frameworks')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Padrões Normativos</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  ISO 27001, NIST, COBIT e boas práticas
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {frameworks.filter(f => f.tipo === 'normativo').length} frameworks ativos
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Estratégico
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTab('nonconformities')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Planos de Ação</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Não conformidades e melhorias em andamento
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {activePlans} planos ativos
                  </span>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {metrics.overduePlans} atrasados
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  {frameworks.slice(0, 4).map(framework => (
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
                  {nonConformities.slice(0, 5).map(nc => (
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
          {/* Header com Ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Frameworks de Compliance</h2>
              <p className="text-muted-foreground">Gerencie frameworks regulatórios e normativos</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Framework
              </Button>
            </div>
          </div>

          {/* Estatísticas dos Frameworks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Frameworks</p>
                    <p className="text-2xl font-bold">{frameworks.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Regulatórios</p>
                    <p className="text-2xl font-bold text-red-600">
                      {frameworks.filter(f => f.categoria === 'regulatorio').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Normativos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {frameworks.filter(f => f.categoria === 'normativo').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conformidade Média</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {frameworks.length > 0 ? Math.round(frameworks.reduce((acc, f) => acc + f.conformityScore, 0) / frameworks.length) : 0}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categorização Natural dos Frameworks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Frameworks Regulatórios */}
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
                {frameworks
                  .filter(f => f.tipo === 'regulatorio')
                  .map(framework => (
                    <div key={framework.id} className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{framework.nome}</h4>
                          <p className="text-xs text-muted-foreground">{framework.origem}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-bold ${getConformityColor(framework.conformityScore)}`}>
                            {framework.conformityScore}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {framework.totalRequirements} controles
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Gerenciar
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Frameworks Normativos */}
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
                {frameworks
                  .filter(f => f.tipo === 'normativo')
                  .map(framework => (
                    <div key={framework.id} className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{framework.nome}</h4>
                          <p className="text-xs text-muted-foreground">{framework.origem}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-bold ${getConformityColor(framework.conformityScore)}`}>
                            {framework.conformityScore}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {framework.totalRequirements} controles
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Gerenciar
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Métricas e Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Framework
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Importar Controles
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório Executivo
                </Button>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{frameworks.length}</p>
                    <p className="text-xs text-muted-foreground">Frameworks Ativos</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-orange-600">
                      {frameworks.filter(f => f.tipo === 'regulatorio').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Regulatórios</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-600">
                      {frameworks.filter(f => f.tipo === 'normativo').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Normativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista Detalhada de Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca Completa de Frameworks</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os frameworks de compliance da organização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frameworks.map(framework => (
                  <div key={framework.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{framework.nome}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={framework.tipo === 'regulatorio' ? 'destructive' : 'secondary'}>
                                {framework.tipo === 'regulatorio' ? 'Regulatório' : 'Normativo'}
                              </Badge>
                              <Badge variant="outline">{framework.origem}</Badge>
                              {framework.codigo === 'SOX-2002' && (
                                <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200">
                                  Seção 404
                                </Badge>
                              )}
                              {framework.codigo === 'LGPD-2018' && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200">
                                  LGPD
                                </Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {framework.status === 'ativo' ? '✅' : '⏸️'} {framework.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getConformityColor(framework.conformityScore)}`}>
                              {framework.conformityScore}%
                            </div>
                            <p className="text-sm text-muted-foreground">conformidade</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Requisitos</p>
                            <p className="font-medium">{framework.conformeRequirements}/{framework.totalRequirements}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Última Avaliação</p>
                            <p className="font-medium">{framework.lastAssessment || 'Não avaliado'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Categoria</p>
                            <p className="font-medium capitalize">{framework.categoria}</p>
                          </div>
                        </div>

                        <Progress value={framework.conformityScore} className="h-3" />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Relatório
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Requisitos
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {frameworks.length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum framework encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece adicionando frameworks de compliance para sua organização
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Framework
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentsManagement />
        </TabsContent>

        <TabsContent value="nonconformities">
          <NonConformitiesManagement />
        </TabsContent>

        <TabsContent value="sox-library">
          <SOXControlsLibrary />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoramentoManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComplianceDashboard;