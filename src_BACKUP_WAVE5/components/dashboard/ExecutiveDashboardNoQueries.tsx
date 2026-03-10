import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Line
} from 'recharts';
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  FileCheck,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const riskTrendData = [
  { month: 'Jan', critical: 4, high: 12, medium: 8, low: 3 },
  { month: 'Fev', critical: 3, high: 10, medium: 12, low: 5 },
  { month: 'Mar', critical: 2, high: 8, medium: 15, low: 7 },
  { month: 'Abr', critical: 1, high: 6, medium: 18, low: 9 },
  { month: 'Mai', critical: 1, high: 5, medium: 20, low: 12 },
  { month: 'Jun', critical: 0, high: 4, medium: 22, low: 15 }
];

const complianceData = [
  { name: 'LGPD', value: 85, color: '#10b981' },
  { name: 'ISO 27001', value: 92, color: '#3b82f6' },
  { name: 'SOX', value: 78, color: '#f59e0b' },
  { name: 'BACEN', value: 88, color: '#8b5cf6' }
];

const kpiData = [
  { month: 'Jan', riskScore: 3.2, complianceScore: 82 },
  { month: 'Fev', riskScore: 3.0, complianceScore: 85 },
  { month: 'Mar', riskScore: 2.8, complianceScore: 87 },
  { month: 'Abr', riskScore: 2.5, complianceScore: 89 },
  { month: 'Mai', riskScore: 2.3, complianceScore: 91 },
  { month: 'Jun', riskScore: 2.1, complianceScore: 93 }
];

export const ExecutiveDashboardNoQueries = () => {
  console.log('🚀 ExecutiveDashboardNoQueries carregado em:', new Date().toISOString());

  // Dados mockados para teste
  const mockData = {
    riskScore: 2.1,
    complianceScore: 93,
    totalVendors: 45,
    totalPolicies: 28,
    criticalRisks: 2,
    openIncidents: 1,
    totalAssessments: 15,
    completedAssessments: 12,
    totalDPIA: 8,
    ethicsReports: 3
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão estratégica consolidada de GRC • Dados mockados para teste
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="default" className="gap-2">
            <Brain className="h-4 w-4" />
            <span>Insights IA</span>
          </Button>
        </div>
      </div>

      {/* AI Insights Banner */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-foreground">Resumo Inteligente (Dados Mockados)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Status:</strong> {mockData.criticalRisks} riscos críticos ativos. 
                Score de compliance em {mockData.complianceScore}% com {mockData.completedAssessments} assessments concluídos. 
                {mockData.openIncidents > 0 ? `${mockData.openIncidents} incidentes aguardam resolução.` : 'Todos incidentes resolvidos.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  ↗ Tendência positiva
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  🎯 Meta Q2 atingida
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                  ✅ SEM QUERIES - TESTE
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risco Residual</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">{mockData.riskScore}</span>
                  <span className="text-sm text-muted-foreground">/5.0</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Shield className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className="font-medium text-success">Controlado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">{mockData.complianceScore}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="font-medium text-success">Meta Atingida</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assessments</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">{mockData.completedAssessments}</span>
                  <span className="text-sm text-muted-foreground">/{mockData.totalAssessments}</span>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Activity className="h-3 w-3 text-accent" />
              <span className="font-medium text-accent">
                {Math.round((mockData.completedAssessments / mockData.totalAssessments) * 100)}% Concluídos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">LGPD & Ética</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">{mockData.totalDPIA + mockData.ethicsReports}</span>
                  <span className="text-sm text-muted-foreground">itens</span>
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Shield className="h-5 w-5 text-warning" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle className="h-3 w-3 text-warning" />
              <span className="font-medium text-warning">DPIAs e Relatórios</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risk Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Tendências de Risco (Mockado)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Crítico" />
                <Bar dataKey="high" stackId="a" fill="#f97316" name="Alto" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" name="Médio" />
                <Bar dataKey="low" stackId="a" fill="#22c55e" name="Baixo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>Tendências de Performance (Mockado)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Score de Risco"
                />
                <Line 
                  type="monotone" 
                  dataKey="complianceScore" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Score de Compliance (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center space-y-4">
            <div className="p-4 bg-danger/10 rounded-lg w-fit mx-auto group-hover:bg-danger/20 transition-colors">
              <XCircle className="h-8 w-8 text-danger" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Riscos Críticos</h3>
              <p className="text-sm text-muted-foreground">
                {mockData.criticalRisks} risco{mockData.criticalRisks !== 1 ? 's' : ''} crítico{mockData.criticalRisks !== 1 ? 's' : ''} ativo{mockData.criticalRisks !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Revisar Agora
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center space-y-4">
            <div className="p-4 bg-warning/10 rounded-lg w-fit mx-auto group-hover:bg-warning/20 transition-colors">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Incidentes Ativos</h3>
              <p className="text-sm text-muted-foreground">
                {mockData.openIncidents} incidente{mockData.openIncidents !== 1 ? 's' : ''} em tratamento
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Analisar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto group-hover:bg-primary/20 transition-colors">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Políticas Ativas</h3>
              <p className="text-sm text-muted-foreground">
                {mockData.totalPolicies} política{mockData.totalPolicies !== 1 ? 's' : ''} vigente{mockData.totalPolicies !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg w-fit mx-auto group-hover:bg-accent/20 transition-colors">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Fornecedores</h3>
              <p className="text-sm text-muted-foreground">
                {mockData.totalVendors} fornecedor{mockData.totalVendors !== 1 ? 'es' : ''} monitorado{mockData.totalVendors !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Ver Todos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};