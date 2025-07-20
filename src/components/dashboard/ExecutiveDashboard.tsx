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

export const ExecutiveDashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-muted-foreground mt-1">
            Visão estratégica consolidada de GRC • Última atualização: há 5 minutos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Insights IA
          </Button>
          <Button className="grc-button-primary">
            Relatório Executivo
          </Button>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <Card className="grc-card bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Resumo Inteligente - IA</h3>
              <p className="text-muted-foreground mb-4">
                <strong>Tendência Positiva:</strong> A postura de risco melhorou 32% nos últimos 6 meses. 
                Os investimentos em controles automatizados resultaram em redução de 65% em riscos críticos. 
                <strong>Ação Recomendada:</strong> Considere expandir programa de automação para área de compliance.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  ↗ Risco em declínio
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risco Residual</p>
                <p className="text-2xl font-bold text-foreground">2.1</p>
                <p className="text-sm text-success flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -34% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Shield className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Compliance</p>
                <p className="text-2xl font-bold text-foreground">93%</p>
                <p className="text-sm text-success flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8% vs mês anterior
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fornecedores Avaliados</p>
                <p className="text-2xl font-bold text-foreground">127</p>
                <p className="text-sm text-primary flex items-center mt-1">
                  <Target className="h-4 w-4 mr-1" />
                  12 pendentes
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Controles Ativos</p>
                <p className="text-2xl font-bold text-foreground">1,248</p>
                <p className="text-sm text-warning flex items-center mt-1">
                  <Activity className="h-4 w-4 mr-1" />
                  98% efetivos
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Evolução dos Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
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
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <span>Status de Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
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

      {/* Performance Trends */}
      <Card className="grc-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span>Tendências de Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="riskScore" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Score de Risco"
              />
              <Line 
                type="monotone" 
                dataKey="complianceScore" 
                stroke="#22c55e" 
                strokeWidth={3}
                name="Score de Compliance (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-danger/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-danger/20 transition-colors">
              <XCircle className="h-8 w-8 text-danger" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Riscos Críticos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              1 risco crítico requer atenção imediata
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Revisar Agora
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-warning/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-warning/20 transition-colors">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Assessments Pendentes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              3 avaliações aguardando revisão executiva
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Analisar
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Relatório IA</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Novo relatório executivo gerado pela IA
            </p>
            <Button className="grc-button-primary w-full">
              Ver Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};