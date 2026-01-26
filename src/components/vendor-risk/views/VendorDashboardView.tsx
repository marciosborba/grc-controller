import React, { useEffect, useState, useMemo } from 'react';
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

  CheckCircle,
  Clock,
  XCircle,

  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,

  MoreHorizontal,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useVendorActionPlans } from '@/hooks/useVendorActionPlans';
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
import { format, subMonths, isSameMonth, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VendorDashboardViewProps {
  searchTerm: string;
  selectedFilter: string;
  metrics?: any;
  riskDistribution?: any;
  vendors?: any[];
  assessments?: any[];
  loading?: boolean;
}

export const VendorDashboardView: React.FC<VendorDashboardViewProps> = ({
  searchTerm,
  selectedFilter,
  // Props opcionalmente passadas pelo pai ou obtidas via hook se não passadas
  metrics: propMetrics,
  riskDistribution: propRiskDistribution,
  vendors: propVendors,
  assessments: propAssessments,
  loading: propLoading
}) => {
  const {
    dashboardMetrics: hookMetrics,
    riskDistribution: hookRiskDistribution,
    vendors: hookVendors,
    assessments: hookAssessments,
    risks,
    fetchVendors,
    fetchAssessments,
    fetchRisks,
    fetchDashboardMetrics,
    fetchRiskDistribution,
    loading: hookLoading
  } = useVendorRiskManagement();

  const { plans, fetchPlans } = useVendorActionPlans();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Use props if available, otherwise use hook data
  const dashboardMetrics = propMetrics || hookMetrics;
  const riskDistribution = propRiskDistribution || hookRiskDistribution;
  const vendors = propVendors || hookVendors;
  const assessments = propAssessments || hookAssessments;
  const loading = propLoading !== undefined ? propLoading : hookLoading;

  // Load data on mount if not provided via props
  useEffect(() => {
    if (!propVendors) fetchVendors();
    if (!propAssessments) fetchAssessments();
    if (!risks.length) fetchRisks();
    if (!propMetrics) fetchDashboardMetrics();
    if (!propRiskDistribution) fetchRiskDistribution();
  }, [fetchVendors, fetchAssessments, fetchRisks, fetchDashboardMetrics, fetchRiskDistribution]);

  // --- CÁLCULOS DE KPIS DINÂMICOS ---

  const kpis = useMemo(() => {
    // 1. Score Médio de Risco
    const avgRiskScore = vendors.length > 0
      ? vendors.reduce((acc, v) => acc + (Number(v.risk_score) || 0), 0) / vendors.length
      : 0;

    // 2. Taxa de Compliance (Fornecedores com risco Baixo/Médio vs Total)
    const compliantVendors = vendors.filter(v =>
      v.risk_score < 4.0 || v.criticality_level === 'low' || v.criticality_level === 'medium'
    ).length;
    const complianceRate = vendors.length > 0 ? (compliantVendors / vendors.length) * 100 : 100;


    // 4. Cobertura de Avaliação (Avaliados vs Total)
    // 4. Cobertura de Avaliação (Avaliados vs Total)
    const assessedVendorsCount = vendors.filter(v => {
      // Considera avaliado se:
      // 1. Tem data de última avaliação
      // 2. Tem score de risco definido
      // 3. Está com status 'active' (assumido como homologado)
      if (v.last_assessment_date ||
        (v.risk_score !== null && v.risk_score !== undefined) ||
        v.status === 'active') {
        return true;
      }

      // 4. Tem um assessment completo na lista
      return assessments.some(a => a.vendor_id === v.id && (a.status === 'completed' || a.status === 'approved'));
    }).length;
    const totalVendors = vendors.length;
    const coveragePercentage = totalVendors > 0 ? (assessedVendorsCount / totalVendors) * 100 : 0;

    // 5. Planos de Ação (Ativos e Atrasados)
    // Using simple hook state for now, ideally would be passed as prop or context
    const openPlans = plans.filter(p => p.status !== 'completed' && p.status !== 'verified').length;
    const overdueActivities = plans.reduce((acc, plan) => {
      return acc + (plan.activities?.filter(a => a.status !== 'completed' && new Date(a.due_date) < new Date()).length || 0);
    }, 0);

    return [
      {
        title: 'Cobertura de Avaliação',
        value: `${assessedVendorsCount}/${totalVendors}`,
        change: '', // Removed incoherent hardcoded change
        icon: FileCheck,
        description: 'Fornecedores avaliados nos últimos 12 meses',
        trend: 'neutral' as 'up' | 'down' | 'neutral'
      },
      {
        title: 'Planos de Ação',
        value: openPlans.toString(),
        change: '',
        icon: Target,
        description: 'Planos de ação em aberto',
        trend: 'neutral' as 'up' | 'down' | 'neutral'
      },
      {
        title: 'Taxa de Conformidade',
        value: `${complianceRate.toFixed(1)}%`,
        change: '',
        icon: Shield,
        description: 'Fornecedores em conformidade com requisitos',
        trend: 'neutral' as 'up' | 'down' | 'neutral'
      },
      {
        title: 'Assessments Ativos',
        value: (dashboardMetrics?.pending_assessments || assessments.filter(a => ['sent', 'in_progress'].includes(a.status)).length).toString(),
        change: '',
        icon: Clock,
        description: 'Avaliações em andamento',
        trend: 'neutral' as 'up' | 'down' | 'neutral'
      },
      {
        title: 'Score Médio de Risco',
        value: avgRiskScore.toFixed(1),
        change: '',
        icon: Activity,
        description: 'Média ponderada de risco',
        trend: 'neutral' as 'up' | 'down' | 'neutral'
      },
      {
        title: 'Fornecedores Críticos',
        value: (dashboardMetrics?.critical_vendors || vendors.filter(v => v.criticality_level === 'critical' || v.criticality_level === 'high').length).toString(),
        change: '',
        icon: AlertTriangle,
        description: 'Fornecedores com classificação de risco alto/crítico',
        trend: 'neutral' as 'up' | 'down' | 'neutral'
      }
    ];
  }, [dashboardMetrics, vendors, plans, assessments]);

  // --- DADOS PARA GRÁFICOS ---

  // Distribuição de Risco
  const riskDistributionData = useMemo(() => {
    if (!riskDistribution) return [];
    return [
      { name: 'Baixo', value: riskDistribution.low || 0, color: '#10B981' }, // emerald-500
      { name: 'Médio', value: riskDistribution.medium || 0, color: '#F59E0B' }, // amber-500
      { name: 'Alto', value: riskDistribution.high || 0, color: '#F97316' }, // orange-500
      { name: 'Crítico', value: riskDistribution.critical || 0, color: '#EF4444' } // red-500
    ];
  }, [riskDistribution]);

  // Status dos Assessments (Atualizado para nomes do Kanban)
  const assessmentChartData = useMemo(() => {
    const statusCounts = assessments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { status: 'Planejamento', count: statusCounts['draft'] || 0, fill: '#94a3b8' }, // slate-400
      { status: 'Aguard. Fornecedor', count: statusCounts['sent'] || 0, fill: '#3b82f6' }, // blue-500
      { status: 'Preenchimento', count: statusCounts['in_progress'] || 0, fill: '#f59e0b' }, // amber-500
      { status: 'Análise Interna', count: statusCounts['completed'] || 0, fill: '#6366f1' }, // indigo-500
      { status: 'Homologado', count: statusCounts['approved'] || 0, fill: '#22c55e' }, // green-500
      { status: 'Revisão', count: statusCounts['rejected'] || 0, fill: '#ef4444' } // red-500
    ];
  }, [assessments]);

  // Tendência de Riscos (Calculado via timestamps dos riscos)
  const riskTrendData = useMemo(() => {
    // Gerar últimos 6 meses
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return {
        date: d,
        monthName: format(d, 'MMM', { locale: ptBR }),
        risks: 0,
        resolved: 0
      };
    });

    risks.forEach(risk => {
      const created = parseISO(risk.identified_date || risk.created_at);
      const resolved = risk.status === 'closed' || risk.status === 'accepted'
        ? (risk.updated_at ? parseISO(risk.updated_at) : null)
        : null;

      // Incrementar contagem para o mês correspondente
      last6Months.forEach(m => {
        // Acumulado: Se foi criado antes ou durante este mês
        if (created <= new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0)) {
          // E ainda não foi resolvido ou foi resolvido DEPOIS deste mês
          if (!resolved || resolved > new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0)) {
            m.risks++;
          }
        }

        // Resolvidos NESTE mês
        if (resolved && isSameMonth(resolved, m.date)) {
          m.resolved++;
        }
      });
    });

    return last6Months;
  }, [risks]);


  // --- ALERTAS CRÍTICOS ---
  const criticalAlerts = [
    {
      id: 1,
      type: "contract_expiring",
      title: "Contratos Vencendo",
      description: `${dashboardMetrics?.expiring_contracts || 0} contratos vencem nos próximos 90 dias`,
      severity: dashboardMetrics?.expiring_contracts > 0 ? "high" : "low",
      action: "Revisar Contratos"
    },
    {
      id: 2,
      type: "assessment_overdue",
      title: "Assessments Vencidos",
      description: `${dashboardMetrics?.overdue_assessments || 0} assessments em atraso`,
      severity: dashboardMetrics?.overdue_assessments > 0 ? "critical" : "low",
      action: "Acompanhar Urgente"
    },
    {
      id: 3,
      type: "certification_expiring",
      title: "Certificações Expirando",
      description: `${dashboardMetrics?.expiring_certifications || 0} certificações vencem em breve`,
      severity: dashboardMetrics?.expiring_certifications > 0 ? "medium" : "low",
      action: "Verificar Status"
    }
  ].filter(alert => alert.severity !== 'low' || true); // Mantendo todos para grid layout fixo, mas poderia filtrar

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
    }
  };

  if (loading && !vendors.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">


      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <PieChart className="w-5 h-5 text-primary" />
              <span>Distribuição de Riscos</span>
            </CardTitle>
            <CardDescription>
              Classificação da base de fornecedores por nível de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xl font-bold">
                    {vendors.length}
                  </text>
                  <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
                    Fornecedores
                  </text>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Progress */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Pipeline de Assessments</span>
            </CardTitle>
            <CardDescription>
              Volume de avaliações por fase do processo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assessmentChartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted/20" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="status"
                    type="category"
                    width={120}
                    className="text-xs font-medium"
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    animationDuration={1500}
                  >
                    {assessmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Evolução de Riscos (6 Meses)</span>
          </CardTitle>
          <CardDescription>
            Histórico de riscos identificados vs. resolvidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="colorRisks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/20" />
                <XAxis
                  dataKey="monthName"
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground text-xs"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground text-xs"
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="risks"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorRisks)"
                  name="Identificados"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Resolvidos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Insights */}
      <div className="grid grid-cols-1 gap-6">
        {/* Critical Alerts */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span>Alertas Críticos</span>
            </CardTitle>
            <CardDescription>
              Situações que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalAlerts.length > 0 ? criticalAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border transition-all hover:bg-muted/50 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{alert.title}</h4>
                      {alert.severity === 'critical' && <Badge variant="destructive" className="h-5 text-[10px]">Urgente</Badge>}
                    </div>
                    <p className="text-sm opacity-90">{alert.description}</p>
                  </div>
                  <Button size="sm" variant="outline" className="flex-shrink-0 ml-2 bg-background/50 border-current/20 hover:bg-background/80">
                    {alert.action}
                  </Button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
                <CheckCircle className="w-12 h-12 mb-2 text-green-500/50" />
                <p>Tudo certo! Nenhum alerta crítico no momento.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboardView;