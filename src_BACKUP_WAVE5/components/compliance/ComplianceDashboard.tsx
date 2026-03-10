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
  BookOpen,
  HelpCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import InternalControlsManagement from './InternalControlsManagement';
import NonConformitiesManagement from './NonConformitiesManagement';
import AssessmentsManagement from './AssessmentsManagement';
import MonitoramentoManagement from './MonitoramentoManagement';
import FrameworksManagement from './FrameworksManagement';
import ComplianceMappings from './ComplianceMappings';
import ComplianceReports from './ComplianceReports';
import ProcessesManagement from './ProcessesManagement';
import SystemsManagement from './SystemsManagement';
import { NewAssessmentWizard } from './NewAssessmentWizard';
import { ActionPlansManagement } from './ActionPlansManagement';
import { ComplianceCharts } from './ComplianceCharts';

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
  tipo?: string;
  codigo?: string;
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

export default function ComplianceDashboard() {
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

  const [trendData, setTrendData] = useState<{ month: string; score: number; assessments: number }[]>([]);

  const [activePlans, setActivePlans] = useState(0);

  const [frameworks, setFrameworks] = useState<FrameworkStatus[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAssessmentWizardOpen, setIsAssessmentWizardOpen] = useState(false);

  useEffect(() => {
    if (effectiveTenantId) {
      loadComplianceData();
    }
  }, [effectiveTenantId]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
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
    const { data: frameworksData } = await supabase.from('frameworks_compliance').select('id').eq('tenant_id', effectiveTenantId).eq('status', 'ativo');
    const { data: requirementsData } = await supabase.from('requisitos_compliance').select('id, framework_id').eq('tenant_id', effectiveTenantId).eq('status', 'ativo');
    const { data: nonConformitiesData } = await supabase.from('nao_conformidades').select('id, criticidade, status').eq('tenant_id', effectiveTenantId).in('status', ['aberta', 'em_tratamento']);

    // Updated to use unified 'action_plans' table
    const { data: overduePlansData } = await supabase
      .from('action_plans')
      .select('id')
      .eq('tenant_id', effectiveTenantId)
      .eq('modulo_origem', 'compliance')
      .lt('data_fim_planejada', new Date().toISOString().split('T')[0])
      .in('status', ['planejado', 'em_andamento']);

    const { data: activePlansData } = await supabase
      .from('action_plans')
      .select('id')
      .eq('tenant_id', effectiveTenantId)
      .eq('modulo_origem', 'compliance')
      .in('status', ['planejado', 'em_andamento']);

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const { data: upcomingAssessmentsData } = await supabase.from('requisitos_compliance').select('id, data_proxima_avaliacao').eq('tenant_id', effectiveTenantId).eq('status', 'ativo').gte('data_proxima_avaliacao', today).lte('data_proxima_avaliacao', thirtyDaysFromNow.toISOString().split('T')[0]).not('data_proxima_avaliacao', 'is', null);

    const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();
    const { count: currentMonthNC } = await supabase.from('nao_conformidades').select('*', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId).gte('created_at', startOfCurrentMonth);
    const { count: lastMonthNC } = await supabase.from('nao_conformidades').select('*', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId).gte('created_at', startOfLastMonth).lt('created_at', startOfCurrentMonth);

    let monthlyTrend = 0;
    if (lastMonthNC && lastMonthNC > 0) {
      monthlyTrend = ((currentMonthNC || 0) - lastMonthNC) / lastMonthNC * 100;
    } else if (currentMonthNC && currentMonthNC > 0) {
      monthlyTrend = 100;
    }

    // Trend Analysis (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const { data: historyData } = await supabase
      .from('avaliacoes_conformidade')
      .select('score_conformidade, updated_at, data_conclusao')
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'concluida')
      .gte('updated_at', sixMonthsAgo.toISOString());

    // Calculate Conformity Rate
    const { data: conformityData } = await supabase.from('avaliacoes_conformidade').select('score_conformidade').eq('tenant_id', effectiveTenantId).eq('status', 'concluida');
    let conformityRate = 0;
    if (conformityData && conformityData.length > 0) {
      const total = conformityData.reduce((acc, curr) => acc + (curr.score_conformidade || 0), 0);
      conformityRate = Math.round(total / conformityData.length);
    }

    // Process Trend Data
    const computedTrendData: Record<string, { total: number; count: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('pt-BR', { month: 'short' });
      computedTrendData[key] = { total: 0, count: 0 };
    }

    if (historyData) {
      historyData.forEach(item => {
        const date = new Date(item.data_conclusao || item.updated_at);
        const key = date.toLocaleString('pt-BR', { month: 'short' });
        if (computedTrendData[key]) {
          computedTrendData[key].total += (item.score_conformidade || 0);
          computedTrendData[key].count += 1;
        }
      });
    }

    const finalTrendData = Object.entries(computedTrendData).map(([month, data]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      score: data.count > 0 ? Math.round(data.total / data.count) : 0,
      assessments: data.count
    }));

    // Smoothing: fill zeros with previous value
    for (let i = 1; i < finalTrendData.length; i++) {
      if (finalTrendData[i].score === 0 && finalTrendData[i - 1].score > 0) {
        finalTrendData[i].score = finalTrendData[i - 1].score;
      }
    }
    setTrendData(finalTrendData);

    setMetrics({
      totalFrameworks: frameworksData?.length || 0,
      activeRequirements: requirementsData?.length || 0,
      conformityRate,
      openNonConformities: nonConformitiesData?.length || 0,
      criticalNonConformities: nonConformitiesData?.filter(nc => nc.criticidade === 'critica').length || 0,
      overduePlans: overduePlansData?.length || 0,
      upcomingAssessments: upcomingAssessmentsData?.length || 0,
      monthlyTrend
    });
    setActivePlans(activePlansData?.length || 0);
  };


  const loadFrameworks = async () => {
    const { data: frameworksData } = await supabase
      .from('frameworks_compliance')
      .select('id, nome, origem, categoria, status, codigo, tipo, requisitos_compliance(count)')
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo')
      .order('nome');

    if (!frameworksData) return;

    const { data: complianceAssessments } = await supabase
      .from('avaliacoes_conformidade')
      .select('id, score_conformidade, data_conclusao, updated_at, requisitos_compliance!inner(framework_id)')
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'concluida')
      .order('updated_at', { ascending: false });

    const frameworksWithScores = frameworksData.map(framework => {
      const frameworkAssessments = complianceAssessments?.filter(
        (a: any) => a.requisitos_compliance?.framework_id === framework.id
      ) || [];
      const totalRequirements = framework.requisitos_compliance?.[0]?.count || 0;
      let conformityScore = 0;
      let lastAssessmentDate = 'Não avaliado';
      if (frameworkAssessments.length > 0) {
        const totalScore = frameworkAssessments.reduce((acc: number, curr: any) => acc + (curr.score_conformidade || 0), 0);
        conformityScore = Math.round(totalScore / frameworkAssessments.length);
        const mostRecent = frameworkAssessments[0];
        const dateStr = mostRecent.data_conclusao || mostRecent.updated_at;
        if (dateStr) {
          lastAssessmentDate = new Date(dateStr).toLocaleDateString('pt-BR');
        }
      }
      const conformeRequirements = frameworkAssessments.filter((a: any) => (a.score_conformidade || 0) >= 100).length;
      return {
        id: framework.id,
        nome: framework.nome,
        origem: framework.origem || 'N/A',
        conformityScore,
        totalRequirements,
        conformeRequirements,
        lastAssessment: lastAssessmentDate,
        status: framework.status,
        categoria: framework.categoria || 'Geral'
      };
    });
    setFrameworks(frameworksWithScores);
  };

  const loadNonConformities = async () => {
    const { data: nonConformitiesData } = await supabase
      .from('nao_conformidades')
      .select('id, codigo, titulo, criticidade, status, prazo_resolucao, risco_score, responsavel_tratamento, profiles!nao_conformidades_responsavel_tratamento_fkey(full_name)')
      .eq('tenant_id', effectiveTenantId)
      .in('status', ['aberta', 'em_tratamento'])
      .order('risco_score', { ascending: false })
      .limit(10);

    if (nonConformitiesData) {
      const processedNonConformities = nonConformitiesData.map((nc: any) => {
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
          responsavel: Array.isArray(nc.profiles) ? nc.profiles[0]?.full_name : nc.profiles?.full_name || 'Não atribuído',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Gestão de Conformidade
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bem-vindo ao Dashboard de Compliance</DialogTitle>
                  <DialogDescription className="space-y-4 pt-4 text-left">
                    <p><strong>Objetivo:</strong> Esta é sua "Torre de Controle". Aqui você vê se sua empresa está seguindo as regras (Leis, Normas ou Políticas Internas).</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-semibold mb-2">Por onde começar?</p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li><strong>Escolha a Lei (Frameworks):</strong> Diga ao sistema o que você precisa seguir (ex: LGPD, ISO 27001).</li>
                        <li><strong>Avalie (Avaliações):</strong> Faça check-ups para ver se está cumprindo.</li>
                        <li><strong>Corrija (Não Conformidades):</strong> Trate o que estiver errado.</li>
                      </ol>
                    </div>
                    <p className="text-sm text-muted-foreground"><strong>Dica:</strong> Uma "Taxa de Conformidade" acima de 80% é considerada excelente para a maioria das auditorias.</p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </h1>
          <p className="text-muted-foreground">Central de Compliance e Gestão Regulatória</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAssessmentWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Premium Storytelling Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Dynamic Narrative Card - Conformity Status */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className={`absolute top-0 right-0 p-3 opacity-10`}>
            {metrics.conformityRate >= 80 ? <Shield className="h-24 w-24" /> : <AlertTriangle className="h-24 w-24" />}
          </div>
          <CardHeader className="pb-2">
            <CardTitle className={`text-lg font-bold flex items-center gap-2 ${metrics.conformityRate >= 80 ? 'text-emerald-500' : 'text-orange-500'}`}>
              {metrics.conformityRate >= 80 ? 'Ambiente Conforme' : 'Atenção Necessária'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              {metrics.conformityRate >= 80
                ? 'Nível de conformidade excelente. Mantenha as políticas atualizadas.'
                : 'Índice de conformidade abaixo do ideal. Verifique os planos de ação.'}
            </p>
            <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${metrics.conformityRate >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
              {metrics.conformityRate}% Conformidade
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Frameworks (Reliable Data) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="h-24 w-24 text-blue-500" />
          </div>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Frameworks Ativos</p>
              <h3 className="text-3xl font-bold text-foreground">{metrics.totalFrameworks}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.activeRequirements} requisitos monitorados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Non Conformities (Alert) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500/50">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="h-24 w-24 text-red-500" />
          </div>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Não Conformidades</p>
              <h3 className="text-3xl font-bold text-foreground">{metrics.openNonConformities}</h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                {metrics.criticalNonConformities} críticas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Action Plans (Status) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-24 w-24 text-purple-500" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Planos de Ação</span>
              <Badge variant={metrics.overduePlans > 0 ? "destructive" : "secondary"} className={metrics.overduePlans > 0 ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}>
                {metrics.overduePlans > 0 ? `${metrics.overduePlans} atrasados` : "Em dia"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{activePlans}</span>
              <span className="text-sm text-muted-foreground">ativos</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ComplianceCharts trendData={trendData} frameworkData={frameworks.map(f => ({ name: f.nome, score: f.conformityScore, total: f.totalRequirements }))} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('frameworks')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Frameworks</h3>
            <p className="text-muted-foreground text-sm">Gestão de frameworks regulatórios e normativos</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('assessments')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Avaliações</h3>
            <p className="text-muted-foreground text-sm">Avaliações periódicas de conformidade</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('nonconformities')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Não Conformidades</h3>
            <p className="text-muted-foreground text-sm">Gestão de gaps e planos de ação</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setSelectedTab('reports')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
            <p className="text-muted-foreground text-sm">Dashboards e relatórios executivos</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="flex flex-wrap w-full h-auto gap-2 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="flex-1 min-w-[120px]">Visão Geral</TabsTrigger>
          <TabsTrigger value="frameworks" className="flex-1 min-w-[120px]">Frameworks</TabsTrigger>
          <TabsTrigger value="mappings" className="flex-1 min-w-[120px]">Conectividade</TabsTrigger>
          <TabsTrigger value="assessments" className="flex-1 min-w-[120px]">Avaliações</TabsTrigger>
          <TabsTrigger value="nonconformities" className="flex-1 min-w-[120px]">Não Conformidades</TabsTrigger>
          <TabsTrigger value="action-plans" className="flex-1 min-w-[120px]">Planos de Ação</TabsTrigger>
          <TabsTrigger value="monitoring" className="flex-1 min-w-[120px]">Monitoramento</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 min-w-[120px]">Relatórios</TabsTrigger>
          <TabsTrigger value="processos" className="flex-1 min-w-[120px]">Processos</TabsTrigger>
          <TabsTrigger value="sistemas" className="flex-1 min-w-[120px]">Sistemas</TabsTrigger>
          <TabsTrigger value="internal-controls" className="flex-1 min-w-[120px]">Controles Internos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTab('frameworks')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Frameworks Regulatórios</h3>
                <p className="text-sm text-muted-foreground mb-2">SOX, LGPD, BACEN e outros requisitos obrigatórios</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{frameworks.filter(f => f.tipo === 'regulatorio').length} frameworks ativos</span>
                  <Badge variant="destructive" className="text-xs">Crítico</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTab('frameworks')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Padrões Normativos</h3>
                <p className="text-sm text-muted-foreground mb-2">ISO 27001, NIST, COBIT e boas práticas</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{frameworks.filter(f => f.tipo === 'normativo').length} frameworks ativos</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Estratégico</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTab('action-plans')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Planos de Ação</h3>
                <p className="text-sm text-muted-foreground mb-2">Não conformidades e melhorias em andamento</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{activePlans} planos ativos</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">{metrics.overduePlans} atrasados</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Status dos Frameworks</CardTitle>
                <CardDescription>Níveis de conformidade por framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworks.slice(0, 4).map(framework => (
                    <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{framework.nome}</p>
                          <span className={`text-sm font-bold ${getConformityColor(framework.conformityScore)}`}>{framework.conformityScore}%</span>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Não Conformidades Prioritárias</CardTitle>
                <CardDescription>Gaps que requerem atenção imediata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nonConformities.slice(0, 5).map(nc => (
                    <div key={nc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{nc.titulo}</p>
                          <Badge className={getCriticalityColor(nc.criticidade)}>{nc.criticidade}</Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{nc.responsavel}</span>
                          <span className={nc.diasVencimento < 0 ? 'text-red-600' : nc.diasVencimento < 7 ? 'text-orange-600' : ''}>
                            {nc.diasVencimento < 0 ? `${Math.abs(nc.diasVencimento)} dias atrasado` : nc.diasVencimento === 0 ? 'Vence hoje' : `${nc.diasVencimento} dias restantes`}
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

        <TabsContent value="frameworks">
          <FrameworksManagement />
        </TabsContent>

        <TabsContent value="mappings">
          <ComplianceMappings />
        </TabsContent>

        <TabsContent value="assessments">
          <AssessmentsManagement />
        </TabsContent>

        <TabsContent value="nonconformities">
          <NonConformitiesManagement />
        </TabsContent>

        <TabsContent value="action-plans">
          <ActionPlansManagement />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoramentoManagement />
        </TabsContent>

        <TabsContent value="reports">
          <ComplianceReports />
        </TabsContent>

        <TabsContent value="processos">
          <ProcessesManagement />
        </TabsContent>

        <TabsContent value="sistemas">
          <SystemsManagement />
        </TabsContent>

        <TabsContent value="internal-controls">
          <InternalControlsManagement />
        </TabsContent>
      </Tabs>

      {isAssessmentWizardOpen && (
        <NewAssessmentWizard open={isAssessmentWizardOpen} onOpenChange={setIsAssessmentWizardOpen} onSuccess={() => { setIsAssessmentWizardOpen(false); loadComplianceData(); }} />
      )}
    </div>
  );
}