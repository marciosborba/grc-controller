import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RiskMatrix from './RiskMatrix';
import DashboardCharts from './DashboardCharts';
import ExecutiveReportButton from './ExecutiveReport';
import { supabase } from '@/integrations/supabase/client';
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
  const [realTimeData, setRealTimeData] = useState({
    riskScore: 0,
    complianceScore: 0,
    totalVendors: 0,
    totalPolicies: 0,
    criticalRisks: 0,
    openIncidents: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    totalDPIA: 0,
    ethicsReports: 0
  });

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const [
          risksResult,
          vendorsResult,
          policiesResult,
          assessmentsResult,
          incidentsResult,
          dpiaResult,
          ethicsResult
        ] = await Promise.all([
          supabase.from('risk_assessments').select('*'),
          supabase.from('vendors').select('*'),
          supabase.from('policies').select('*'),
          supabase.from('assessments').select('*'),
          supabase.from('privacy_incidents').select('*'),
          supabase.from('dpia_assessments').select('*'),
          supabase.from('ethics_reports').select('*')
        ]);

        const risks = risksResult.data || [];
        const vendors = vendorsResult.data || [];
        const policies = policiesResult.data || [];
        const assessments = assessmentsResult.data || [];
        const incidents = incidentsResult.data || [];
        const dpia = dpiaResult.data || [];
        const ethics = ethicsResult.data || [];
        
        // Calcular score de risco baseado em dados reais
        const criticalRisks = risks.filter(r => r.severity === 'critical').length;
        const highRisks = risks.filter(r => r.severity === 'high').length;
        const totalRisks = risks.length;
        
        // Score de risco: considera críticos com peso maior
        const riskScore = totalRisks > 0 ? 
          Math.max(0, 5 - ((criticalRisks * 1.5 + highRisks * 1) / totalRisks) * 2) : 5;

        // Score de compliance baseado em assessments e políticas
        const completedAssessments = assessments.filter(a => 
          a.status === 'Concluído' || a.status === 'completed'
        ).length;
        const publishedPolicies = policies.filter(p => 
          p.status === 'published' || p.status === 'approved'
        ).length;
        
        const complianceScore = Math.round(
          ((completedAssessments / Math.max(assessments.length, 1)) * 50) +
          ((publishedPolicies / Math.max(policies.length, 1)) * 50)
        );

        setRealTimeData({
          riskScore: Number(riskScore.toFixed(1)),
          complianceScore,
          totalVendors: vendors.length,
          totalPolicies: policies.length,
          criticalRisks,
          openIncidents: incidents.filter(i => i.status !== 'resolvido' && i.status !== 'fechado').length,
          totalAssessments: assessments.length,
          completedAssessments,
          totalDPIA: dpia.length,
          ethicsReports: ethics.length
        });
      } catch (error) {
        console.error('Erro ao carregar dados em tempo real:', error);
      }
    };

    fetchRealTimeData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(fetchRealTimeData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

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
          <ExecutiveReportButton 
            size="sm" 
            className="grc-button-primary text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* AI Assistant Banner */}
      <Card className="grc-card bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Resumo Inteligente - IA</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                <strong>Status Atual:</strong> {realTimeData.criticalRisks} riscos críticos ativos de {realTimeData.criticalRisks + 16} identificados. 
                Score de compliance em {realTimeData.complianceScore}% com base em {realTimeData.completedAssessments} assessments concluídos. 
                <strong>Foco:</strong> {realTimeData.openIncidents > 0 ? `${realTimeData.openIncidents} incidentes aguardam resolução.` : 'Todos incidentes resolvidos.'}
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
        <Card className="grc-card overflow-hidden">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground leading-tight">Risco Residual</p>
                <div className="p-2 bg-success/10 rounded-lg">
                  <Shield className="h-4 w-4 text-success" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-foreground mb-2 leading-none">{realTimeData.riskScore}</p>
                <p className="text-xs text-success flex items-center leading-tight">
                  <TrendingDown className="h-3 w-3 mr-1 flex-shrink-0" />
                  {realTimeData.riskScore <= 2.5 ? 'Controlado' : 'Atenção'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card overflow-hidden">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground leading-tight">Compliance</p>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-foreground mb-2 leading-none">{realTimeData.complianceScore}%</p>
                <p className="text-xs text-success flex items-center leading-tight">
                  <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                  {realTimeData.complianceScore >= 90 ? 'Meta OK' : 'Progresso'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card overflow-hidden">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground leading-tight">Assessments</p>
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileCheck className="h-4 w-4 text-accent" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-foreground mb-2 leading-none">{realTimeData.completedAssessments}/{realTimeData.totalAssessments}</p>
                <p className="text-xs text-primary flex items-center leading-tight">
                  <Target className="h-3 w-3 mr-1 flex-shrink-0" />
                  {Math.round((realTimeData.completedAssessments / Math.max(realTimeData.totalAssessments, 1)) * 100)}% feitos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card overflow-hidden">
          <CardContent className="p-3 sm:p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground leading-tight">LGPD</p>
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Shield className="h-4 w-4 text-warning" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-2xl font-bold text-foreground mb-2 leading-none">{realTimeData.totalDPIA + realTimeData.ethicsReports}</p>
                <p className="text-xs text-warning flex items-center leading-tight">
                  <Activity className="h-3 w-3 mr-1 flex-shrink-0" />
                  DPIAs + Ética
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Novos gráficos com dados reais */}
      <DashboardCharts />

      {/* Risk Matrix and Performance Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Risk Matrix */}
        <RiskMatrix />

        {/* Performance Trends */}
        <Card className="grc-card overflow-hidden">
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

      {/* Quick Actions with Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-4 sm:p-6 text-center flex flex-col h-full">
            <div className="p-3 sm:p-4 bg-danger/10 rounded-lg w-fit mx-auto mb-3 sm:mb-4 group-hover:bg-danger/20 transition-colors">
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-danger" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Riscos Críticos</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-grow">
              {realTimeData.criticalRisks} risco{realTimeData.criticalRisks !== 1 ? 's' : ''} crítico{realTimeData.criticalRisks !== 1 ? 's' : ''} ativo{realTimeData.criticalRisks !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm mt-auto">
              Revisar Agora
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-4 sm:p-6 text-center flex flex-col h-full">
            <div className="p-3 sm:p-4 bg-warning/10 rounded-lg w-fit mx-auto mb-3 sm:mb-4 group-hover:bg-warning/20 transition-colors">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Incidentes Ativos</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-grow">
              {realTimeData.openIncidents} incidente{realTimeData.openIncidents !== 1 ? 's' : ''} em tratamento
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm mt-auto">
              Analisar
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-4 sm:p-6 text-center flex flex-col h-full">
            <div className="p-3 sm:p-4 bg-primary/10 rounded-lg w-fit mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
              <FileCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Políticas Ativas</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-grow">
              {realTimeData.totalPolicies} política{realTimeData.totalPolicies !== 1 ? 's' : ''} vigente{realTimeData.totalPolicies !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm mt-auto">
              Gerenciar
            </Button>
          </CardContent>
        </Card>

        <Card className="grc-card hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
          <CardContent className="p-4 sm:p-6 text-center flex flex-col h-full">
            <div className="p-3 sm:p-4 bg-accent/10 rounded-lg w-fit mx-auto mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Fornecedores</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-grow">
              {realTimeData.totalVendors} fornecedor{realTimeData.totalVendors !== 1 ? 'es' : ''} monitorado{realTimeData.totalVendors !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm mt-auto">
              Ver Todos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};