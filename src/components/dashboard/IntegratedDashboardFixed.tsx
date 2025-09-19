import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Brain,
  Zap,
  Lock,
  BookOpen,
  Search,
  ArrowUpRight,
  Minus,
  RefreshCw
} from 'lucide-react';

interface DashboardMetrics {
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScore: number;
  riskTrend: number;
  complianceScore: number;
  totalAssessments: number;
  completedAssessments: number;
  totalDPIA: number;
  activeDPIA: number;
  dataSubjectRequests: number;
  consentRate: number;
  totalVendors: number;
  activeVendors: number;
  criticalVendors: number;
  totalPolicies: number;
  publishedPolicies: number;
  draftPolicies: number;
  totalIncidents: number;
  openIncidents: number;
  totalActionPlans: number;
  activeActionPlans: number;
  completedActionPlans: number;
}

const IntegratedDashboardFixed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRisks: 0,
    criticalRisks: 0,
    highRisks: 0,
    mediumRisks: 0,
    lowRisks: 0,
    riskScore: 0,
    riskTrend: 0,
    complianceScore: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    totalDPIA: 0,
    activeDPIA: 0,
    dataSubjectRequests: 0,
    consentRate: 85,
    totalVendors: 0,
    activeVendors: 0,
    criticalVendors: 0,
    totalPolicies: 0,
    publishedPolicies: 0,
    draftPolicies: 0,
    totalIncidents: 0,
    openIncidents: 0,
    totalActionPlans: 0,
    activeActionPlans: 0,
    completedActionPlans: 0
  });
  
  const [activeTab, setActiveTab] = useState('overview');

  // Dados para graficos
  const riskTrendData = [
    { month: 'Jan', critical: 8, high: 15, medium: 12, low: 5 },
    { month: 'Fev', critical: 6, high: 18, medium: 14, low: 7 },
    { month: 'Mar', critical: 4, high: 16, medium: 18, low: 9 },
    { month: 'Abr', critical: 3, high: 14, medium: 22, low: 11 },
    { month: 'Mai', critical: 2, high: 12, medium: 25, low: 13 },
    { month: 'Jun', critical: metrics.criticalRisks, high: metrics.highRisks, medium: metrics.mediumRisks, low: metrics.lowRisks }
  ];

  const complianceData = [
    { framework: 'ISO 27001', score: 92, target: 95 },
    { framework: 'LGPD', score: 88, target: 90 },
    { framework: 'SOX', score: 85, target: 95 },
    { framework: 'NIST CSF', score: 78, target: 85 }
  ];

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!effectiveTenantId) return;
      
      setLoading(true);
      try {
        const [
          risksResult,
          assessmentsResult,
          dpiaResult,
          vendorsResult,
          policiesResult,
          incidentsResult,
          actionPlansResult,
          requestsResult
        ] = await Promise.all([
          supabase.from('risk_assessments').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('assessments').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('dpia_assessments').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('vendors').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('policies').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('privacy_incidents').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('assessment_action_plans').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('data_subject_requests').select('*').eq('tenant_id', effectiveTenantId)
        ]);

        const risks = risksResult.data || [];
        const assessments = assessmentsResult.data || [];
        const dpia = dpiaResult.data || [];
        const vendors = vendorsResult.data || [];
        const policies = policiesResult.data || [];
        const incidents = incidentsResult.data || [];
        const actionPlans = actionPlansResult.data || [];
        const requests = requestsResult.data || [];

        // Calcular metricas de risco
        const criticalRisks = risks.filter(r => r.risk_level === 'Muito Alto' || r.risk_level === 'Critico').length;
        const highRisks = risks.filter(r => r.risk_level === 'Alto').length;
        const mediumRisks = risks.filter(r => r.risk_level === 'Medio').length;
        const lowRisks = risks.filter(r => r.risk_level === 'Baixo' || r.risk_level === 'Muito Baixo').length;
        
        const riskScore = risks.length > 0 ? 
          Math.max(0, 5 - ((criticalRisks * 2 + highRisks * 1.5 + mediumRisks * 1) / risks.length) * 2) : 5;

        // Calcular score de compliance
        const completedAssessments = assessments.filter(a => 
          a.status === 'concluido' || a.status === 'completed'
        ).length;
        const complianceScore = assessments.length > 0 ? 
          Math.round((completedAssessments / assessments.length) * 100) : 0;

        // Calcular outras metricas
        const activeDPIA = dpia.filter(d => d.status === 'em_andamento' || d.status === 'active').length;
        const openIncidents = incidents.filter(i => 
          i.status !== 'resolvido' && i.status !== 'fechado' && i.status !== 'resolved'
        ).length;
        const activeVendors = vendors.filter(v => v.status === 'active' || v.status === 'ativo').length;
        const criticalVendors = vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length;
        const publishedPolicies = policies.filter(p => 
          p.status === 'published' || p.status === 'approved' || p.status === 'ativo'
        ).length;
        const draftPolicies = policies.filter(p => p.status === 'draft' || p.status === 'rascunho').length;
        const activeActionPlans = actionPlans.filter(ap => 
          ap.status === 'em_andamento' || ap.status === 'aprovado'
        ).length;
        const completedActionPlans = actionPlans.filter(ap => ap.status === 'concluido').length;

        setMetrics({
          totalRisks: risks.length,
          criticalRisks,
          highRisks,
          mediumRisks,
          lowRisks,
          riskScore: Number(riskScore.toFixed(1)),
          riskTrend: -12,
          complianceScore,
          totalAssessments: assessments.length,
          completedAssessments,
          totalDPIA: dpia.length,
          activeDPIA,
          dataSubjectRequests: requests.length,
          consentRate: 85,
          totalVendors: vendors.length,
          activeVendors,
          criticalVendors,
          totalPolicies: policies.length,
          publishedPolicies,
          draftPolicies,
          totalIncidents: incidents.length,
          openIncidents,
          totalActionPlans: actionPlans.length,
          activeActionPlans,
          completedActionPlans
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [effectiveTenantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Carregando dashboard integrado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Executivo Integrado
          </h1>
          <p className="text-muted-foreground text-lg">
            Visao unificada de GRC - Atualizacao em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Insights IA
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatorio Executivo
          </Button>
        </div>
      </div>

      {/* KPI Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Risk Score */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-red-500" />
              <div className="flex items-center gap-1">
                {metrics.riskTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  metrics.riskTrend < 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(metrics.riskTrend)}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Score de Risco</p>
              <p className="text-2xl font-bold">{metrics.riskScore}/5.0</p>
              <p className="text-xs text-muted-foreground">
                {metrics.criticalRisks} criticos • {metrics.totalRisks} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {metrics.completedAssessments}/{metrics.totalAssessments}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Compliance</p>
              <p className="text-2xl font-bold">{metrics.complianceScore}%</p>
              <Progress value={metrics.complianceScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Score */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Lock className="h-8 w-8 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {metrics.activeDPIA} ativas
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">LGPD</p>
              <p className="text-2xl font-bold">{metrics.consentRate}%</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalDPIA} DPIAs • {metrics.dataSubjectRequests} solicitacoes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vendors */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-500" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {metrics.criticalVendors} criticos
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fornecedores</p>
              <p className="text-2xl font-bold">{metrics.activeVendors}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalVendors} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-orange-500" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {metrics.draftPolicies} rascunhos
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Politicas</p>
              <p className="text-2xl font-bold">{metrics.publishedPolicies}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalPolicies} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Plans */}
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-teal-500" />
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                {metrics.activeActionPlans} ativos
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Planos de Acao</p>
              <p className="text-2xl font-bold">{metrics.completedActionPlans}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalActionPlans} total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visoes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="modules">Modulos</TabsTrigger>
        </TabsList>

        {/* Tab: Visao Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Tendencia de Riscos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Evolucao dos Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance por Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Compliance por Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="framework" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-orange-500" />
                  Distribuicao de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Criticos', value: metrics.criticalRisks, fill: '#ef4444' },
                        { name: 'Altos', value: metrics.highRisks, fill: '#f97316' },
                        { name: 'Medios', value: metrics.mediumRisks, fill: '#eab308' },
                        { name: 'Baixos', value: metrics.lowRisks, fill: '#22c55e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Criticos', value: metrics.criticalRisks, fill: '#ef4444' },
                        { name: 'Altos', value: metrics.highRisks, fill: '#f97316' },
                        { name: 'Medios', value: metrics.mediumRisks, fill: '#eab308' },
                        { name: 'Baixos', value: metrics.lowRisks, fill: '#22c55e' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total de Riscos</span>
                    <Badge variant="outline">{metrics.totalRisks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Compliance Score</span>
                    <Badge variant="outline">{metrics.complianceScore}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fornecedores Ativos</span>
                    <Badge variant="outline">{metrics.activeVendors}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Politicas Publicadas</span>
                    <Badge variant="outline">{metrics.publishedPolicies}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Modulos */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Modulo de Riscos */}
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/risks')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Gestao de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.totalRisks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Criticos</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.criticalRisks}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Compliance */}
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/assessments')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">{metrics.complianceScore}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Concluidos</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.completedAssessments}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Privacidade */}
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/privacy')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  Privacidade (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">DPIAs</p>
                    <p className="text-2xl font-bold">{metrics.totalDPIA}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Solicitacoes</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.dataSubjectRequests}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Fornecedores */}
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/vendors')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold">{metrics.activeVendors}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Criticos</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.criticalVendors}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Politicas */}
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/policy-management')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Politicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Publicadas</p>
                    <p className="text-2xl font-bold">{metrics.publishedPolicies}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rascunhos</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.draftPolicies}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Auditoria */}
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/auditorias')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-teal-500" />
                  Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Planos</p>
                    <p className="text-2xl font-bold">{metrics.totalActionPlans}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold text-teal-600">{metrics.activeActionPlans}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alertas e Acoes Rapidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Criticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas Criticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.criticalRisks > 0 ? (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Riscos Criticos Ativos</p>
                  <p className="text-sm text-red-600">
                    {metrics.criticalRisks} risco{metrics.criticalRisks !== 1 ? 's' : ''} critico{metrics.criticalRisks !== 1 ? 's' : ''} requer atencao imediata
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => navigate('/risks')}>
                    Revisar Agora
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium text-green-800 mb-2">Situacao Controlada</h3>
                <p className="text-sm text-green-600">
                  Nenhum alerta critico no momento. Continue monitorando.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acoes Recomendadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Acoes Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Revisar planos de acao pendentes</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/assessments/action-plans')}>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Atualizar politicas em rascunho</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/policy-management')}>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Avaliar fornecedores criticos</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/vendors')}>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegratedDashboardFixed;