import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RiskMatrix from './RiskMatrix';
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

export const ExecutiveDashboard = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Visão estratégica consolidada de GRC • Última atualização: há 5 minutos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Brain className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Insights IA</span>
            <span className="sm:hidden">IA</span>
          </Button>
          <Button className="grc-button-primary text-xs sm:text-sm">
            <span className="hidden sm:inline">Relatório Executivo</span>
            <span className="sm:hidden">Relatório</span>
          </Button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <Card className="grc-card bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Resumo Inteligente - IA</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                <strong>Tendência Positiva:</strong> A postura de risco melhorou 32% nos últimos 6 meses. 
                Os investimentos em controles automatizados resultaram em redução de 65% em riscos críticos. 
                <strong>Ação Recomendada:</strong> Considere expandir programa de automação para área de compliance.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                  ↗ Risco em declínio
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                  🎯 Meta Q2 atingida
                </Badge>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                  ⚠ LGPD requer atenção
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Risco Residual</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">2.1</p>
                <p className="text-xs sm:text-sm text-success flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  -34% vs mês anterior
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Score Compliance</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">93%</p>
                <p className="text-xs sm:text-sm text-success flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  +8% vs mês anterior
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Fornecedores Avaliados</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">127</p>
                <p className="text-xs sm:text-sm text-primary flex items-center mt-1">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  12 pendentes
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-accent/10 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Controles Ativos</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">1,248</p>
                <p className="text-xs sm:text-sm text-warning flex items-center mt-1">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  98% efetivos
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-warning/10 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Risk Trend */}
        <Card className="grc-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              <span>Evolução dos Riscos</span>
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
                <Bar dataKey="critical" stackId="a" fill="#ef4444" />
                <Bar dataKey="high" stackId="a" fill="#f97316" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" />
                <Bar dataKey="low" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card className="grc-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Status de Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={10}
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix and Performance Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Risk Matrix */}
        <RiskMatrix />

        {/* Performance Trends */}
        <Card className="grc-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              <span>Tendências de Performance</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="p-3 sm:p-4 bg-danger/10 rounded-lg w-fit mx-auto mb-3 sm:mb-4 group-hover:bg-danger/20 transition-colors">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-danger" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Riscos Críticos</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              1 risco crítico requer atenção imediata
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
              Revisar Agora
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="p-3 sm:p-4 bg-warning/10 rounded-lg w-fit mx-auto mb-3 sm:mb-4 group-hover:bg-warning/20 transition-colors">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Assessments Pendentes</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              3 avaliações aguardando revisão executiva
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
              Analisar
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="p-3 sm:p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Relatório IA</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Novo relatório executivo gerado pela IA
            </p>
            <Button className="grc-button-primary w-full text-xs sm:text-sm">
              Ver Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};