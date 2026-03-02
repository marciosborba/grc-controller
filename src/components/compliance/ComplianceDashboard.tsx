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

  const handleTabNavigation = (tab: string) => {
    setSelectedTab(tab);
    setTimeout(() => {
      document.getElementById('compliance-tabs-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 tracking-tight">
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
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Central de Compliance e Gestão Regulatória</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsAssessmentWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Premium Storytelling Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">

        {/* Card 1: Dynamic Narrative Card - Conformity Status */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className={`absolute top-0 right-0 p-3 opacity-10`}>
            {metrics.conformityRate >= 80 ? <Shield className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24" /> : <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24" />}
          </div>
          <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
            <CardTitle className={`text-xs sm:text-sm md:text-lg font-bold flex items-center gap-1.5 sm:gap-2 leading-tight ${metrics.conformityRate >= 80 ? 'text-emerald-500' : 'text-orange-500'}`}>
              <span className="truncate">{metrics.conformityRate >= 80 ? 'Ambiente Conforme' : 'Atenção Necessária'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
            <p className="text-muted-foreground font-medium text-[9px] sm:text-xs md:text-sm leading-tight sm:leading-relaxed line-clamp-3 md:line-clamp-none">
              {metrics.conformityRate >= 80
                ? 'Nível de conformidade excelente. Mantenha as políticas atualizadas.'
                : 'Índice de conformidade abaixo do ideal. Verifique os planos de ação.'}
            </p>
            <div className={`mt-2 sm:mt-4 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] md:text-xs font-medium ${metrics.conformityRate >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
              {metrics.conformityRate}% Conformidade
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Frameworks (Reliable Data) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 text-blue-500" />
          </div>
          <CardContent className="p-3 sm:p-4 md:p-6 flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10">
            <div className="p-1.5 sm:p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl md:rounded-2xl shrink-0">
              <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[10px] md:text-sm font-medium text-muted-foreground uppercase sm:normal-case tracking-wider sm:tracking-normal w-full truncate leading-none mb-0.5 md:mb-1">Frameworks Ativos</p>
              <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground leading-none">{metrics.totalFrameworks}</h3>
              <p className="text-[7px] sm:text-[9px] md:text-xs text-muted-foreground mt-0.5 lg:mt-1 truncate">
                {metrics.activeRequirements} requisitos monitorados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Non Conformities (Alert) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500/50">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 text-red-500" />
          </div>
          <CardContent className="p-3 sm:p-4 md:p-6 flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10">
            <div className="p-1.5 sm:p-2 md:p-3 bg-red-100 dark:bg-red-900/30 rounded-lg sm:rounded-xl md:rounded-2xl shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[10px] md:text-sm font-medium text-muted-foreground uppercase sm:normal-case tracking-wider sm:tracking-normal w-full truncate leading-none mb-0.5 md:mb-1">Não Conformidades</p>
              <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground leading-none">{metrics.openNonConformities}</h3>
              <p className="text-[7px] sm:text-[9px] md:text-xs text-red-600 dark:text-red-400 mt-0.5 lg:mt-1 font-medium truncate">
                {metrics.criticalNonConformities} críticas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Action Plans (Status) */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 text-purple-500" />
          </div>
          <CardContent className="p-3 sm:p-4 md:p-6 pb-3 sm:pb-4 md:pb-6 relative z-10">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-1">
              <span className="text-[8px] sm:text-[10px] md:text-sm font-medium text-muted-foreground uppercase sm:normal-case tracking-wider sm:tracking-normal truncate">Planos de Ação</span>
              <Badge variant={metrics.overduePlans > 0 ? "destructive" : "secondary"} className={`text-[8px] sm:text-[10px] md:text-xs shrink-0 px-1 py-0 h-4 md:h-5 ${metrics.overduePlans > 0 ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}`}>
                {metrics.overduePlans > 0 ? `${metrics.overduePlans} atrasados` : "Em dia"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl md:text-3xl font-bold text-foreground leading-none">{activePlans}</span>
              <span className="text-[8px] sm:text-[10px] md:text-sm text-muted-foreground truncate">ativos</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-2 sm:mt-3 md:mt-4">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ComplianceCharts trendData={trendData} frameworkData={frameworks.map(f => ({ name: f.nome, score: f.conformityScore, total: f.totalRequirements }))} />

      <div id="compliance-tabs-start" className="scroll-mt-20">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full justify-start h-auto bg-transparent p-0 mb-4 border-b border-border overflow-x-auto overflow-y-hidden flex-nowrap flex-row pb-px ::-webkit-scrollbar-none [scrollbar-width:none]">
            <TabsTrigger value="overview" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Visão Geral</TabsTrigger>
            <TabsTrigger value="frameworks" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Frameworks</TabsTrigger>
            <TabsTrigger value="mappings" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Conectividade</TabsTrigger>
            <TabsTrigger value="assessments" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Avaliações</TabsTrigger>
            <TabsTrigger value="nonconformities" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Não Conformidades</TabsTrigger>
            <TabsTrigger value="action-plans" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Planos de Ação</TabsTrigger>
            <TabsTrigger value="monitoring" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Monitoramento</TabsTrigger>
            <TabsTrigger value="reports" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Relatórios</TabsTrigger>
            <TabsTrigger value="processos" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Processos</TabsTrigger>
            <TabsTrigger value="sistemas" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Sistemas</TabsTrigger>
            <TabsTrigger value="internal-controls" className="shrink-0 relative h-10 px-4 rounded-none border-b-2 border-transparent bg-transparent hover:bg-transparent hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-xs sm:text-sm font-medium transition-none">Controles Internos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('frameworks')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <Shield className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Frameworks</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">Gestão de frameworks regulatórios e normativos</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              </Card>
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('assessments')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Avaliações</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">Avaliações periódicas de conformidade</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              </Card>
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('nonconformities')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <AlertTriangle className="h-5 w-5 sm:h-8 sm:w-8 text-red-600" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Não Conformidades</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">Gestão de gaps e planos de ação</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              </Card>
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('reports')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <BarChart3 className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Relatórios</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">Dashboards e relatórios executivos</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              </Card>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('frameworks')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <AlertTriangle className="h-5 w-5 sm:h-8 sm:w-8 text-orange-600" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Frameworks Regulatórios</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">SOX, LGPD, BACEN e outros requisitos</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              </Card>

              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('frameworks')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Padrões Normativos</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">ISO 27001, NIST, COBIT e boas práticas</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              </Card>

              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('internal-controls')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <Shield className="h-5 w-5 sm:h-8 sm:w-8 text-zinc-600 dark:text-zinc-400" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Controles Internos</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">Gestão de matriz de riscos e controles</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              </Card>

              <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col" onClick={() => handleTabNavigation('action-plans')}>
                <CardContent className="p-3 sm:p-6 relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <Target className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] sm:text-lg mb-0.5 sm:mb-2 leading-tight">Planos de Ação</h3>
                    <p className="text-muted-foreground text-[10px] sm:text-sm leading-tight sm:leading-relaxed">Gaps e melhorias em andamento</p>
                  </div>
                </CardContent>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
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
      </div>

      {isAssessmentWizardOpen && (
        <NewAssessmentWizard open={isAssessmentWizardOpen} onOpenChange={setIsAssessmentWizardOpen} onSuccess={() => { setIsAssessmentWizardOpen(false); loadComplianceData(); }} />
      )}
    </div>
  );
}