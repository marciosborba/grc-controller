import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Filter,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  MessageSquare,
  Shield,
  Eye,
  ThumbsUp,
  BookOpen
} from 'lucide-react';
import type { Policy, PolicyDashboardData, PolicyFilters, AlexPolicyConfig } from '@/types/policy-management';

interface PolicyAnalyticsProps {
  policies: Policy[];
  dashboardData: PolicyDashboardData | null;
  alexConfig: AlexPolicyConfig;
  filters: PolicyFilters;
}

export const PolicyAnalytics: React.FC<PolicyAnalyticsProps> = ({
  policies,
  dashboardData,
  alexConfig,
  filters
}) => {
  const [timeRange, setTimeRange] = useState('last_12_months');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Dados analíticos calculados
  const analyticsData = useMemo(() => {
    // Distribuição por categoria
    const categoryData = policies.reduce((acc, policy) => {
      acc[policy.category] = (acc[policy.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      percentage: ((count / policies.length) * 100).toFixed(1)
    }));

    // Distribuição por status
    const statusData = policies.reduce((acc, policy) => {
      acc[policy.status] = (acc[policy.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusChartData = Object.entries(statusData).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / policies.length) * 100).toFixed(1)
    }));

    // Distribuição por prioridade
    const priorityData = policies.reduce((acc, policy) => {
      acc[policy.priority] = (acc[policy.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityChartData = Object.entries(priorityData).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      percentage: ((count / policies.length) * 100).toFixed(1)
    }));

    // Tendência temporal (simulada)
    const trendData = [
      { month: 'Jan', created: 2, published: 1, reviewed: 3, expired: 0 },
      { month: 'Fev', created: 3, published: 2, reviewed: 2, expired: 1 },
      { month: 'Mar', created: 1, published: 3, reviewed: 1, expired: 0 },
      { month: 'Abr', created: 4, published: 1, reviewed: 4, expired: 2 },
      { month: 'Mai', created: 2, published: 4, reviewed: 2, expired: 1 },
      { month: 'Jun', created: 3, published: 2, reviewed: 3, expired: 0 }
    ];

    // Métricas de compliance
    const complianceData = [
      { framework: 'ISO 27001', coverage: 85, policies: 12 },
      { framework: 'LGPD', coverage: 92, policies: 8 },
      { framework: 'SOX', coverage: 78, policies: 6 },
      { framework: 'COSO', coverage: 88, policies: 10 },
      { framework: 'ISO 31000', coverage: 75, policies: 5 }
    ];

    // Métricas de performance
    const performanceData = [
      { metric: 'Taxa de Leitura', value: 78, target: 85 },
      { metric: 'Confirmações', value: 65, target: 80 },
      { metric: 'Treinamentos', value: 82, target: 90 },
      { metric: 'Compliance', value: 88, target: 95 },
      { metric: 'Renovações', value: 92, target: 95 }
    ];

    // Radar de maturidade
    const maturityData = [
      { subject: 'Governança', A: 85, fullMark: 100 },
      { subject: 'Compliance', A: 78, fullMark: 100 },
      { subject: 'Operacional', A: 92, fullMark: 100 },
      { subject: 'Segurança', A: 88, fullMark: 100 },
      { subject: 'RH', A: 75, fullMark: 100 },
      { subject: 'Financeiro', A: 82, fullMark: 100 }
    ];

    return {
      categoryChartData,
      statusChartData,
      priorityChartData,
      trendData,
      complianceData,
      performanceData,
      maturityData
    };
  }, [policies]);

  // Métricas resumidas
  const summaryMetrics = {
    total_policies: policies.length,
    active_policies: policies.filter(p => p.is_active).length,
    published_policies: policies.filter(p => p.status === 'published').length,
    draft_policies: policies.filter(p => p.status === 'draft').length,
    review_policies: policies.filter(p => p.status === 'review').length,
    expired_policies: policies.filter(p => {
      if (!p.expiry_date) return false;
      return new Date(p.expiry_date) < new Date();
    }).length,
    compliance_rate: 85.5,
    average_read_rate: 78.2,
    training_completion: 82.1,
    acknowledgment_rate: 65.3
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Analytics e Relatórios
          </h2>
          <p className="text-muted-foreground">
            Métricas avançadas e insights de performance das políticas
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
              <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
              <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
              <SelectItem value="last_12_months">Últimos 12 meses</SelectItem>
              <SelectItem value="all_time">Todo o período</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Alex Policy Integration */}
      {alexConfig.enabled && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Alex Policy - Analytics Inteligente</h3>
                  <p className="text-sm text-muted-foreground">
                    Insights automatizados e recomendações baseadas em dados
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Análise Ativa
                </Badge>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Insights IA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total de Políticas</p>
                <p className="text-3xl font-bold text-foreground">{summaryMetrics.total_policies}</p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% este mês</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Taxa de Compliance</p>
                <p className="text-3xl font-bold text-foreground">{summaryMetrics.compliance_rate}%</p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>+3% este mês</span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Taxa de Leitura</p>
                <p className="text-3xl font-bold text-foreground">{summaryMetrics.average_read_rate}%</p>
                <div className="flex items-center space-x-1 text-xs text-orange-600">
                  <Eye className="h-3 w-3" />
                  <span>-2% este mês</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Treinamentos</p>
                <p className="text-3xl font-bold text-foreground">{summaryMetrics.training_completion}%</p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <BookOpen className="h-3 w-3" />
                  <span>+5% este mês</span>
                </div>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Analytics */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5" />
                  <span>Distribuição por Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.statusChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {analyticsData.statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendência Temporal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Tendência de Atividades</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="created" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="published" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="reviewed" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Métricas de Performance vs Metas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.performanceData.map((metric) => (
                  <div key={metric.metric} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{metric.metric}</span>
                      <span className="font-medium">{metric.value}% / {metric.target}%</span>
                    </div>
                    <div className="flex space-x-2">
                      <Progress value={metric.value} className="flex-1" />
                      <Progress value={metric.target} className="flex-1 opacity-30" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribuição */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData.categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Por Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle>Por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analyticsData.priorityChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {analyticsData.priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Maturidade por Área */}
            <Card>
              <CardHeader>
                <CardTitle>Maturidade por Área</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={analyticsData.maturityData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Maturidade" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KPIs Principais */}
            <Card>
              <CardHeader>
                <CardTitle>KPIs Principais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{summaryMetrics.average_read_rate}%</p>
                    <p className="text-sm text-muted-foreground">Taxa de Leitura</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{summaryMetrics.acknowledgment_rate}%</p>
                    <p className="text-sm text-muted-foreground">Confirmações</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{summaryMetrics.training_completion}%</p>
                    <p className="text-sm text-muted-foreground">Treinamentos</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{summaryMetrics.compliance_rate}%</p>
                    <p className="text-sm text-muted-foreground">Compliance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evolução das Métricas */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução das Métricas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="created" stroke="#8884d8" name="Criadas" />
                    <Line type="monotone" dataKey="published" stroke="#82ca9d" name="Publicadas" />
                    <Line type="monotone" dataKey="reviewed" stroke="#ffc658" name="Revisadas" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Cobertura por Framework de Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.complianceData.map((framework) => (
                  <div key={framework.framework} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{framework.framework}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{framework.policies} políticas</span>
                        <Badge variant="outline">{framework.coverage}%</Badge>
                      </div>
                    </div>
                    <Progress value={framework.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-2xl font-bold text-green-600">92%</p>
                <p className="text-sm text-muted-foreground">Conformidade Geral</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p className="text-2xl font-bold text-yellow-600">3</p>
                <p className="text-sm text-muted-foreground">Não Conformidades</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <p className="text-2xl font-bold text-blue-600">15</p>
                <p className="text-sm text-muted-foreground">Dias Médios Resolução</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Análise de Tendências</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="created" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Criadas" />
                  <Area type="monotone" dataKey="published" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Publicadas" />
                  <Area type="monotone" dataKey="reviewed" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} name="Revisadas" />
                  <Area type="monotone" dataKey="expired" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} name="Expiradas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights de Tendências */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights Positivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Aumento na criação de políticas</p>
                    <p className="text-xs text-muted-foreground">+25% comparado ao período anterior</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Melhoria na taxa de compliance</p>
                    <p className="text-xs text-muted-foreground">+8% nos últimos 3 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Áreas de Atenção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Taxa de leitura em declínio</p>
                    <p className="text-xs text-muted-foreground">-5% nos últimos 2 meses</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Aumento no tempo de aprovação</p>
                    <p className="text-xs text-muted-foreground">+3 dias em média</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alex Policy Insights */}
      {alexConfig.enabled && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span>Insights Alex Policy Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Tendência Positiva</span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  O aumento de 25% na criação de políticas indica maior maturidade organizacional.
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Oportunidade</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Implementar gamificação pode melhorar a taxa de leitura e engajamento.
                </p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Recomendação</span>
                </div>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Considere automatizar lembretes para reduzir tempo de aprovação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyAnalytics;