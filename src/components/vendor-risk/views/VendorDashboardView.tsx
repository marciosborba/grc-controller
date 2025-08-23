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
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Tempo Médio de Assessment",
      value: "12 dias",
      change: "-3 dias",
      trend: "up",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Score Médio de Risco",
      value: "2.8/5.0",
      change: "-0.2",
      trend: "up",
      icon: Shield,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950"
    },
    {
      title: "Fornecedores Críticos",
      value: dashboardMetrics?.critical_vendors || 0,
      change: "Sem mudança",
      trend: "stable",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950"
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
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      default: return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                    {kpi.title}
                  </p>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {kpi.value}
                  </p>
                  <div className="flex items-center space-x-1 text-xs lg:text-sm">
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : kpi.trend === 'down' ? (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-500" />
                    )}
                    <span className={kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor} flex-shrink-0`}>
                  <kpi.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-blue-600" />
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
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
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
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis 
                    dataKey="status" 
                    className="text-slate-600 dark:text-slate-400"
                    fontSize={12}
                  />
                  <YAxis className="text-slate-600 dark:text-slate-400" fontSize={12} />
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
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
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
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis 
                  dataKey="month" 
                  className="text-slate-600 dark:text-slate-400"
                  fontSize={12}
                />
                <YAxis className="text-slate-600 dark:text-slate-400" fontSize={12} />
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
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
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
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
              <Brain className="w-5 h-5" />
              <span>ALEX VENDOR Insights</span>
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Análises e recomendações inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Recomendação:</strong> Priorizar reavaliação de 3 fornecedores estratégicos com score > 4.0
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-500" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Oportunidade:</strong> Automatizar assessments para fornecedores de baixo risco
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Atenção:</strong> Tendência de aumento em riscos de segurança cibernética
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              Ver Análise Completa
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600" />
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
              <span className="text-xs text-slate-600">Adicionar novo parceiro</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex-col items-start">
              <FileCheck className="w-6 h-6 mb-2 text-green-600" />
              <span className="font-medium">Criar Assessment</span>
              <span className="text-xs text-slate-600">Nova avaliação</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex-col items-start">
              <Shield className="w-6 h-6 mb-2 text-purple-600" />
              <span className="font-medium">Analisar Riscos</span>
              <span className="text-xs text-slate-600">Revisar classificação</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex-col items-start">
              <BarChart3 className="w-6 h-6 mb-2 text-orange-600" />
              <span className="font-medium">Gerar Relatório</span>
              <span className="text-xs text-slate-600">Dashboard executivo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboardView;