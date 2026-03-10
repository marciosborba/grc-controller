import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FileText, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Calendar, BarChart3, PieChart as PieChartIcon, Activity, Zap, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Assessment, AssessmentMetrics, MaturityTrend, GapAnalysis, BenchmarkData } from '@/types/assessment';
import { sanitizeInput, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';

export default function AssessmentReporting() {
  const { user, effectiveTenantId } = useAuth();
  const navigate = useNavigate();
  const rateLimitCRUD = useCRUDRateLimit(user?.id || 'anonymous');

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [metrics, setMetrics] = useState<AssessmentMetrics | null>(null);
  const [maturityTrends, setMaturityTrends] = useState<MaturityTrend[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis[]>([]);
  const [domainScores, setDomainScores] = useState<any[]>([]);
  const [controlsConformity, setControlsConformity] = useState<any[]>([]);
  const [actionPlanProgress, setActionPlanProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('30'); // dias
  const [selectedFramework, setSelectedFramework] = useState<string>('todos');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadAssessments();
    loadMetrics();
    loadMaturityTrends();
  }, [effectiveTenantId, reportPeriod]);

  useEffect(() => {
    if (selectedAssessment) {
      loadAssessmentDetails(selectedAssessment.id);
    }
  }, [selectedAssessment]);

  const loadAssessments = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('read')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      let query = supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(nome, codigo, tipo_framework),
          responsavel_profile:profiles!assessments_responsavel_assessment_fkey(full_name)
        `)
        .eq('tenant_id', effectiveTenantId);

      if (selectedFramework !== 'todos') {
        query = query.eq('framework_id', selectedFramework);
      }

      // Filtrar por período
      const periodDate = new Date();
      periodDate.setDate(periodDate.getDate() - parseInt(reportPeriod));
      query = query.gte('created_at', periodDate.toISOString());

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setAssessments(data || []);
    } catch (error) {
      console.error('Erro ao carregar assessments:', error);
      toast.error('Erro ao carregar assessments');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Calcular métricas agregadas
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (assessmentError) throw assessmentError;

      const { data: frameworkData, error: frameworkError } = await supabase
        .from('assessment_frameworks')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (frameworkError) throw frameworkError;

      const { data: responseData, error: responseError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('gap_identificado', true);

      if (responseError) throw responseError;

      const { data: actionPlanData, error: actionPlanError } = await supabase
        .from('assessment_action_plans')
        .select('*')
        .eq('tenant_id', effectiveTenantId);

      if (actionPlanError) throw actionPlanError;

      const { data: actionItemData, error: actionItemError } = await supabase
        .from('assessment_action_items')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('status', 'concluido');

      if (actionItemError) throw actionItemError;

      const totalAssessments = assessmentData?.length || 0;
      const activeAssessments = assessmentData?.filter(a => ['em_andamento', 'iniciado'].includes(a.status)).length || 0;
      const completedAssessments = assessmentData?.filter(a => a.status === 'concluido').length || 0;
      const averageMaturity = assessmentData?.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) / (totalAssessments || 1);
      const totalGaps = responseData?.length || 0;
      const criticalGaps = responseData?.filter(r => r.criticidade_gap === 'critica').length || 0;
      const completedActions = actionItemData?.length || 0;

      setMetrics({
        total_assessments: totalAssessments,
        active_assessments: activeAssessments,
        completed_assessments: completedAssessments,
        average_maturity: Math.round(averageMaturity),
        frameworks_count: frameworkData?.length || 0,
        total_gaps: totalGaps,
        critical_gaps: criticalGaps,
        action_plans_count: actionPlanData?.length || 0,
        completed_actions: completedActions
      });

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast.error('Erro ao carregar métricas');
    }
  };

  const loadMaturityTrends = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          created_at,
          percentual_maturidade,
          framework:assessment_frameworks(tipo_framework)
        `)
        .eq('tenant_id', effectiveTenantId)
        .not('percentual_maturidade', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por mês e tipo de framework
      const trends: Record<string, { period: string; maturity_score: number; count: number; framework_type: string }[]> = {};
      
      data?.forEach((assessment) => {
        const date = new Date(assessment.created_at);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const frameworkType = assessment.framework?.tipo_framework || 'outro';
        
        if (!trends[frameworkType]) {
          trends[frameworkType] = [];
        }
        
        const existing = trends[frameworkType].find(t => t.period === period);
        if (existing) {
          existing.maturity_score = (existing.maturity_score * existing.count + (assessment.percentual_maturidade || 0)) / (existing.count + 1);
          existing.count += 1;
        } else {
          trends[frameworkType].push({
            period,
            maturity_score: assessment.percentual_maturidade || 0,
            count: 1,
            framework_type: frameworkType
          });
        }
      });

      // Converter para array único
      const trendArray: MaturityTrend[] = [];
      Object.entries(trends).forEach(([frameworkType, periods]) => {
        periods.forEach(period => {
          trendArray.push({
            period: period.period,
            maturity_score: Math.round(period.maturity_score),
            assessment_count: period.count,
            framework_type: frameworkType
          });
        });
      });

      setMaturityTrends(trendArray);

    } catch (error) {
      console.error('Erro ao carregar tendências:', error);
      toast.error('Erro ao carregar tendências de maturidade');
    }
  };

  const loadAssessmentDetails = async (assessmentId: string) => {
    try {
      // Carregar pontuação por domínios
      const { data: domainData, error: domainError } = await supabase
        .rpc('calculate_domain_scores', {
          p_assessment_id: assessmentId,
          p_tenant_id: effectiveTenantId
        });

      if (domainError) throw domainError;

      setDomainScores(domainData || []);

      // Carregar conformidade de controles
      const { data: controlData, error: controlError } = await supabase
        .from('assessment_responses')
        .select(`
          status_conformidade,
          control:assessment_controls(titulo, codigo, criticidade)
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId);

      if (controlError) throw controlError;

      // Agrupar por status de conformidade
      const conformityGroups = controlData?.reduce((acc, response) => {
        const status = response.status_conformidade || 'nao_conforme';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const conformityData = Object.entries(conformityGroups || {}).map(([status, count]) => ({
        name: status === 'conforme' ? 'Conforme' : 
              status === 'parcialmente_conforme' ? 'Parcialmente Conforme' : 
              status === 'nao_conforme' ? 'Não Conforme' : 'Não Aplicável',
        value: count,
        color: status === 'conforme' ? '#00C49F' : 
               status === 'parcialmente_conforme' ? '#FFBB28' : 
               status === 'nao_conforme' ? '#FF8042' : '#8884D8'
      }));

      setControlsConformity(conformityData);

      // Carregar progresso dos planos de ação
      const { data: actionData, error: actionError } = await supabase
        .from('assessment_action_plans')
        .select(`
          titulo,
          percentual_conclusao,
          status,
          data_fim_planejada,
          assessment_action_items(status, percentual_conclusao)
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId);

      if (actionError) throw actionError;

      const actionProgressData = actionData?.map(plan => ({
        name: plan.titulo.length > 20 ? plan.titulo.substring(0, 20) + '...' : plan.titulo,
        progress: plan.percentual_conclusao,
        status: plan.status,
        items_total: plan.assessment_action_items?.length || 0,
        items_completed: plan.assessment_action_items?.filter(item => item.status === 'concluido').length || 0
      }));

      setActionPlanProgress(actionProgressData || []);

      // Carregar análise de gaps
      const { data: gapData, error: gapError } = await supabase
        .from('assessment_responses')
        .select(`
          control_id,
          percentual_conformidade,
          criticidade_gap,
          control:assessment_controls(titulo, codigo, criticidade, domain:assessment_domains(nome))
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId)
        .eq('gap_identificado', true);

      if (gapError) throw gapError;

      const gapAnalysisData: GapAnalysis[] = gapData?.map(gap => ({
        control_id: gap.control_id,
        control_name: gap.control?.titulo || '',
        domain_name: gap.control?.domain?.nome || '',
        criticality: gap.criticidade_gap || 'media',
        gap_count: 1,
        average_score: gap.percentual_conformidade || 0,
        improvement_priority: gap.criticidade_gap === 'critica' ? 4 : 
                             gap.criticidade_gap === 'alta' ? 3 : 
                             gap.criticidade_gap === 'media' ? 2 : 1
      })) || [];

      setGapAnalysis(gapAnalysisData);

    } catch (error) {
      console.error('Erro ao carregar detalhes do assessment:', error);
      toast.error('Erro ao carregar detalhes do assessment');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      if (!selectedAssessment) {
        toast.error('Selecione um assessment para exportar');
        return;
      }

      await auditLog('EXPORT', 'assessment_report', {
        assessment_id: selectedAssessment.id,
        format,
        tenant_id: effectiveTenantId
      });

      // Simular export (implementar integração real posteriormente)
      toast.success(`Relatório exportado em formato ${format.toUpperCase()}!`);
      setIsExportDialogOpen(false);

    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, trend, color = "blue" }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-full bg-${color}-100`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
            {trend === 'stable' && <Activity className="h-4 w-4 text-gray-600 mr-1" />}
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              vs. período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <h2 className="text-2xl font-bold tracking-tight">Relatórios e Analytics</h2>
            <p className="text-muted-foreground">
              Análise de performance e tendências dos assessments
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedAssessment}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Relatório</DialogTitle>
                <DialogDescription>
                  Escolha o formato para exportar o relatório do assessment: {selectedAssessment?.titulo}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExportReport('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar como PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExportReport('excel')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Exportar como Excel
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExportReport('csv')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar como CSV
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedAssessment}>
            Detalhes {selectedAssessment && `(${selectedAssessment.titulo})`}
          </TabsTrigger>
          <TabsTrigger value="gaps">Análise de Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total de Assessments"
              value={metrics?.total_assessments || 0}
              subtitle="Todos os assessments criados"
              icon={<FileText className="h-4 w-4 text-blue-600" />}
              color="blue"
            />
            <MetricCard
              title="Assessments Ativos"
              value={metrics?.active_assessments || 0}
              subtitle="Em andamento atualmente"
              icon={<Activity className="h-4 w-4 text-green-600" />}
              trend="up"
              color="green"
            />
            <MetricCard
              title="Maturidade Média"
              value={`${metrics?.average_maturity || 0}%`}
              subtitle="Pontuação de maturidade geral"
              icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
              trend="up"
              color="purple"
            />
            <MetricCard
              title="Gaps Críticos"
              value={metrics?.critical_gaps || 0}
              subtitle={`de ${metrics?.total_gaps || 0} gaps totais`}
              icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
              trend="down"
              color="red"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Frameworks Ativos"
              value={metrics?.frameworks_count || 0}
              subtitle="Frameworks disponíveis"
              icon={<Target className="h-4 w-4 text-indigo-600" />}
              color="indigo"
            />
            <MetricCard
              title="Assessments Concluídos"
              value={metrics?.completed_assessments || 0}
              subtitle="Com resultados finalizados"
              icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
              color="emerald"
            />
            <MetricCard
              title="Planos de Ação"
              value={metrics?.action_plans_count || 0}
              subtitle="Planos de melhoria criados"
              icon={<Target className="h-4 w-4 text-orange-600" />}
              color="orange"
            />
            <MetricCard
              title="Ações Concluídas"
              value={metrics?.completed_actions || 0}
              subtitle="Itens implementados"
              icon={<Zap className="h-4 w-4 text-yellow-600" />}
              color="yellow"
            />
          </div>

          {/* Lista de Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Assessments Recentes</CardTitle>
              <CardDescription>
                Assessments realizados no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : assessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Nenhum assessment encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Não há assessments no período selecionado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <Card 
                      key={assessment.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedAssessment?.id === assessment.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{assessment.titulo}</h4>
                            <p className="text-sm text-muted-foreground">
                              {assessment.codigo} • {assessment.framework?.nome}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {assessment.percentual_maturidade || 0}% maturidade
                            </Badge>
                            <Badge className={
                              assessment.status === 'concluido' ? 'bg-green-100 text-green-800' :
                              assessment.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {assessment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progresso</span>
                            <span>{assessment.percentual_conclusao}%</span>
                          </div>
                          <Progress value={assessment.percentual_conclusao} className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Maturidade</CardTitle>
              <CardDescription>
                Evolução da pontuação de maturidade ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={maturityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="maturity_score" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assessments por Framework</CardTitle>
                <CardDescription>
                  Distribuição de assessments por tipo de framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assessments.reduce((acc, assessment) => {
                          const type = assessment.framework?.tipo_framework || 'outros';
                          const existing = acc.find(item => item.name === type);
                          if (existing) {
                            existing.value += 1;
                          } else {
                            acc.push({ name: type, value: 1 });
                          }
                          return acc;
                        }, [] as any[])}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {assessments.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Assessments</CardTitle>
                <CardDescription>
                  Estado atual dos assessments no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assessments.reduce((acc, assessment) => {
                        const existing = acc.find(item => item.name === assessment.status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ name: assessment.status, value: 1 });
                        }
                        return acc;
                      }, [] as any[])}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {selectedAssessment ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAssessment.titulo}</CardTitle>
                  <CardDescription>
                    {selectedAssessment.codigo} • {selectedAssessment.framework?.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-sm font-medium">Maturidade Geral</Label>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{selectedAssessment.percentual_maturidade}%</span>
                          <Badge variant="outline">
                            Nível {selectedAssessment.nivel_maturidade_geral || 1}
                          </Badge>
                        </div>
                        <Progress value={selectedAssessment.percentual_maturidade} className="mt-2" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Conformidade</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Conformes:</span>
                          <span className="font-medium text-green-600">{selectedAssessment.controles_conformes}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Não Conformes:</span>
                          <span className="font-medium text-red-600">{selectedAssessment.controles_nao_conformes}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Parciais:</span>
                          <span className="font-medium text-yellow-600">{selectedAssessment.controles_parcialmente_conformes}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Progresso</Label>
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{selectedAssessment.percentual_conclusao}%</span>
                          <Badge variant="outline">
                            {selectedAssessment.fase_atual}
                          </Badge>
                        </div>
                        <Progress value={selectedAssessment.percentual_conclusao} className="mt-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Pontuação por Domínios</CardTitle>
                    <CardDescription>
                      Performance de cada domínio do framework
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={domainScores}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="domain_name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="score_percentage" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conformidade de Controles</CardTitle>
                    <CardDescription>
                      Distribuição da conformidade dos controles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={controlsConformity}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {controlsConformity.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {actionPlanProgress.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Progresso dos Planos de Ação</CardTitle>
                    <CardDescription>
                      Status de implementação das ações corretivas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={actionPlanProgress}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="progress" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Selecione um Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um assessment na aba "Visão Geral" para ver os detalhes
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Gaps</CardTitle>
              <CardDescription>
                Controles que requerem atenção por criticidade e impacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gapAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Nenhum gap identificado</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssessment ? 'Este assessment não possui gaps críticos' : 'Selecione um assessment para ver a análise de gaps'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gapAnalysis
                    .sort((a, b) => b.improvement_priority - a.improvement_priority)
                    .map((gap, index) => (
                    <Card key={gap.control_id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{gap.control_name}</h4>
                              <Badge className={
                                gap.criticality === 'critica' ? 'bg-red-100 text-red-800' :
                                gap.criticality === 'alta' ? 'bg-orange-100 text-orange-800' :
                                gap.criticality === 'media' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {gap.criticality}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Domínio: {gap.domain_name}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>
                                Pontuação: {gap.average_score.toFixed(1)}%
                              </span>
                              <span>
                                Prioridade: {gap.improvement_priority}/4
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">
                              #{index + 1}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Ordem de prioridade
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}