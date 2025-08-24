import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Users, 
  FileCheck, 
  Calendar,
  Activity,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  Brain,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { useVendorRiskManagement } from '@/hooks/useVendorRiskManagement';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart,
  Pie,
  Cell, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from 'recharts';

interface VendorDashboardViewProps {
  searchTerm: string;
  selectedFilter: string;
}

export const VendorDashboardView: React.FC<VendorDashboardViewProps> = ({
  searchTerm,
  selectedFilter
}) => {
  const {
    dashboardMetrics,
    riskDistribution,
    vendors,
    assessments,
    risks,
    fetchVendors,
    fetchAssessments,
    fetchRisks,
    loading
  } = useVendorRiskManagement();

  const [recentActivity, setRecentActivity] = useState([]);

  // Load data on mount
  useEffect(() => {
    fetchVendors();
    fetchAssessments();
    fetchRisks();
  }, [fetchVendors, fetchAssessments, fetchRisks]);

  // Chart data preparation
  const riskDistributionData = riskDistribution ? [
    { name: 'Baixo', value: riskDistribution.low, color: '#10B981' },
    { name: 'Médio', value: riskDistribution.medium, color: '#F59E0B' },
    { name: 'Alto', value: riskDistribution.high, color: '#EF4444' },
    { name: 'Crítico', value: riskDistribution.critical, color: '#DC2626' }
  ] : [];

  const vendorTypeDistribution = vendors.reduce((acc, vendor) => {
    acc[vendor.vendor_type] = (acc[vendor.vendor_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vendorTypeData = Object.entries(vendorTypeDistribution).map(([type, count]) => ({
    name: type === 'strategic' ? 'Estratégico' : 
          type === 'operational' ? 'Operacional' :
          type === 'transactional' ? 'Transacional' : 'Crítico',
    value: count
  }));

  // Assessment status data
  const assessmentStatusData = assessments.reduce((acc, assessment) => {
    acc[assessment.status] = (acc[assessment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assessmentChartData = Object.entries(assessmentStatusData).map(([status, count]) => ({
    status: status === 'draft' ? 'Rascunho' :
            status === 'sent' ? 'Enviado' :
            status === 'in_progress' ? 'Em Andamento' :
            status === 'completed' ? 'Concluído' :
            status === 'approved' ? 'Aprovado' : 'Outros',
    count
  }));

  // Risk trend data (mock data for now)
  const riskTrendData = [
    { month: 'Jan', risks: 45, resolved: 32 },
    { month: 'Fev', risks: 52, resolved: 38 },
    { month: 'Mar', risks: 48, resolved: 41 },
    { month: 'Abr', risks: 61, resolved: 35 },
    { month: 'Mai', risks: 55, resolved: 48 },
    { month: 'Jun', risks: 58, resolved: 52 }
  ];

  // Key performance indicators
  const kpis = [
    {
      title: "Taxa de Compliance",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: CheckCircle
    },
    {
      title: "Tempo Médio de Assessment",
      value: "12 dias",
      change: "-3 dias",
      trend: "up",
      icon: Clock
    },
    {
      title: "Score Médio de Risco",
      value: "2.8/5.0",
      change: "-0.2",
      trend: "up",
      icon: Shield
    },
    {
      title: "Fornecedores Críticos",
      value: dashboardMetrics?.critical_vendors || 0,
      change: "Sem mudança",
      trend: "stable",
      icon: AlertTriangle
    }
  ];

  // Critical alerts
  const criticalAlerts = [
    {
      id: 1,
      type: "contract_expiring",
      title: "Contratos Vencendo",
      description: `${dashboardMetrics?.expiring_contracts || 0} contratos vencem nos próximos 90 dias`,
      severity: "high",
      action: "Revisar Contratos"
    },
    {
      id: 2,
      type: "assessment_overdue",
      title: "Assessments Vencidos",
      description: `${dashboardMetrics?.overdue_assessments || 0} assessments em atraso`,
      severity: "critical",
      action: "Acompanhar Urgente"
    },
    {
      id: 3,
      type: "certification_expiring",
      title: "Certificações Expirando",
      description: `${dashboardMetrics?.expiring_certifications || 0} certificações vencem em breve`,
      severity: "medium",
      action: "Verificar Status"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {kpi.title}
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {kpi.value}
                  </p>
                  <div className="flex items-center space-x-1 text-xs lg:text-sm">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : kpi.trend === 'down' ? (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' : kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-primary" />
              <span>Distribuição de Riscos</span>
            </CardTitle>
            <CardDescription>
              Classificação por nível de risco dos fornecedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Status dos Assessments</span>
            </CardTitle>
            <CardDescription>
              Progresso das avaliações de fornecedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assessmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="status" 
                    className="text-muted-foreground"
                    fontSize={12}
                  />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span>Tendência de Riscos</span>
          </CardTitle>
          <CardDescription>
            Evolução dos riscos identificados vs. resolvidos nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-muted-foreground"
                  fontSize={12}
                />
                <YAxis className="text-muted-foreground" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="risks"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="Riscos Identificados"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Riscos Resolvidos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span>Alertas Críticos</span>
            </CardTitle>
            <CardDescription>
              Situações que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-medium truncate">{alert.title}</h4>
                    <p className="text-sm opacity-80">{alert.description}</p>
                  </div>
                  <Button size="sm" variant="outline" className="flex-shrink-0 ml-2">
                    {alert.action}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ALEX Vendor Insights */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Brain className="w-5 h-5" />
              <span>ALEX VENDOR Insights</span>
            </CardTitle>
            <CardDescription className="text-primary/80">
              Análises e recomendações inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <p className="text-sm text-primary/90">
                  <strong>Recomendação:</strong> Priorizar reavaliação de 3 fornecedores estratégicos com score &gt; 4.0
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-500" />
                <p className="text-sm text-primary/90">
                  <strong>Oportunidade:</strong> Automatizar assessments para fornecedores de baixo risco
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-primary/90">
                  <strong>Atenção:</strong> Tendência de aumento em riscos de segurança cibernética
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-primary border-primary/30 hover:bg-primary/10"
            >
              Ver Análise Completa
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Ações Rápidas</span>
          </CardTitle>
          <CardDescription>
            Tarefas prioritárias e próximas etapas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" size="lg" className="h-auto p-4 flex-col items-start">
              <Users className="w-6 h-6 mb-2 text-blue-600" />
              <span className="font-medium">Cadastrar Fornecedor</span>
              <span className="text-xs text-muted-foreground">Adicionar novo parceiro</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex-col items-start">
              <FileCheck className="w-6 h-6 mb-2 text-green-600" />
              <span className="font-medium">Criar Assessment</span>
              <span className="text-xs text-muted-foreground">Nova avaliação</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex-col items-start">
              <Shield className="w-6 h-6 mb-2 text-purple-600" />
              <span className="font-medium">Analisar Riscos</span>
              <span className="text-xs text-muted-foreground">Revisar classificação</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex-col items-start">
              <BarChart3 className="w-6 h-6 mb-2 text-orange-600" />
              <span className="font-medium">Gerar Relatório</span>
              <span className="text-xs text-muted-foreground">Dashboard executivo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboardView;