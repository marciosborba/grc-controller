import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RiskMatrix from './RiskMatrix';
import DashboardCharts from './DashboardCharts';
import ExecutiveReportButton from './ExecutiveReport';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
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
        // Debug do usuário e autenticação
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        // Usuário autenticado
        // Tenant do contexto verificado
        
        if (authError) {
          console.error('❌ Erro de autenticação:', authError);
        }
        const [
          risksResult,
          vendorsResult,
          policiesResult,
          assessmentsResult,
          incidentsResult,
          dpiaResult,
          ethicsResult
        ] = await Promise.all([
          supabase.from('risk_assessments').select('*').then(result => {
            // Query risk_assessments executada
            if (result.error) {
              console.error('❌ Erro na query risk_assessments:', result.error);
            }
            return result;
          }),
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
        
        // Debug completo dos dados carregados
        // Dados carregados:
        // risksResult obtido
        // risks array processado
        // risks.length: risks.length
        
        if (risks.length > 0) {
          // Primeiro risco analisado
          // Campos disponíveis verificados
          
          // Verificar todos os valores de risk_level
          const riskLevels = risks.map(r => r.risk_level);
          console.log('📊 Todos os risk_level encontrados:', riskLevels);
          console.log('📊 risk_level únicos:', [...new Set(riskLevels)]);
          
          // Debug detalhado de cada risco
          risks.forEach((risk, index) => {
            console.log(`🔍 Risco ${index + 1}:`, {
              title: risk.title,
              risk_level: risk.risk_level,
              risk_score: risk.risk_score,
              impact_score: risk.impact_score,
              likelihood_score: risk.likelihood_score,
              status: risk.status
            });
          });
          
          // Testar diferentes variações do filtro
          console.log('🧪 Testando filtros:');
          console.log('- "Muito Alto":', risks.filter(r => r.risk_level === 'Muito Alto').length);
          console.log('- "muito alto":', risks.filter(r => r.risk_level === 'muito alto').length);
          console.log('- "MUITO ALTO":', risks.filter(r => r.risk_level === 'MUITO ALTO').length);
          console.log('- "critical":', risks.filter(r => r.risk_level === 'critical').length);
          console.log('- "Critical":', risks.filter(r => r.risk_level === 'Critical').length);
          console.log('- "Alto":', risks.filter(r => r.risk_level === 'Alto').length);
        } else {
          console.warn('⚠️ NENHUM RISCO ENCONTRADO! Verificando possíveis causas...');
          
          // Tentar query alternativa para debug
          const debugQuery = await supabase
            .from('risk_assessments')
            .select('id, title, risk_level')
            .limit(5);
          
          console.log('🔍 Query de debug (primeiros 5):', debugQuery);
          
          // Verificar se é problema de RLS
          const countQuery = await supabase
            .from('risk_assessments')
            .select('id', { count: 'exact', head: true });
          
          console.log('🔢 Contagem total na tabela:', countQuery);
        }
        
        // Problema do risk_level incorreto foi corrigido! 🎉
        
        // Calcular score de risco baseado em dados reais
        const criticalRisks = risks.filter(r => r.risk_level === 'Muito Alto').length;
        const highRisks = risks.filter(r => r.risk_level === 'Alto').length;
        const totalRisks = risks.length;
        
        console.log('📊 ExecutiveDashboard: Riscos por nível:', {
          total: totalRisks,
          critical: criticalRisks,
          high: highRisks,
          risksData: risks.map(r => ({ title: r.title, level: r.risk_level, status: r.status }))
        });
        
        // Debug detalhado dos riscos
        console.log('🔍 Todos os riscos encontrados:', risks);
        console.log('🔴 Riscos Muito Alto:', risks.filter(r => r.risk_level === 'Muito Alto'));
        console.log('🟠 Riscos Alto:', risks.filter(r => r.risk_level === 'Alto'));
        
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão estratégica consolidada de GRC • Atualização em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="default" className="gap-2">
            <Brain className="h-4 w-4" />
            <span>Insights IA</span>
          </Button>
          <ExecutiveReportButton size="default" />
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
              <h3 className="font-semibold text-foreground">Resumo Inteligente</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Status:</strong> {realTimeData.criticalRisks} riscos críticos ativos. 
                Score de compliance em {realTimeData.complianceScore}% com {realTimeData.completedAssessments} assessments concluídos. 
                {realTimeData.openIncidents > 0 ? `${realTimeData.openIncidents} incidentes aguardam resolução.` : 'Todos incidentes resolvidos.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  ↗ Tendência positiva
                </Badge>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  🎯 Meta Q2 atingida
                </Badge>
                {realTimeData.complianceScore < 90 && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                    ⚠ Atenção necessária
                  </Badge>
                )}
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
                  <span className="text-2xl font-bold text-foreground">{realTimeData.riskScore}</span>
                  <span className="text-sm text-muted-foreground">/5.0</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <Shield className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-success" />
              <span className={`font-medium ${realTimeData.riskScore <= 2.5 ? 'text-success' : 'text-warning'}`}>
                {realTimeData.riskScore <= 2.5 ? 'Controlado' : 'Requer Atenção'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">{realTimeData.complianceScore}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className={`font-medium ${realTimeData.complianceScore >= 90 ? 'text-success' : 'text-primary'}`}>
                {realTimeData.complianceScore >= 90 ? 'Meta Atingida' : 'Em Progresso'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assessments</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-foreground">{realTimeData.completedAssessments}</span>
                  <span className="text-sm text-muted-foreground">/{realTimeData.totalAssessments}</span>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Activity className="h-3 w-3 text-accent" />
              <span className="font-medium text-accent">
                {Math.round((realTimeData.completedAssessments / Math.max(realTimeData.totalAssessments, 1)) * 100)}% Concluídos
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
                  <span className="text-2xl font-bold text-foreground">{realTimeData.totalDPIA + realTimeData.ethicsReports}</span>
                  <span className="text-sm text-muted-foreground">itens</span>
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Shield className="h-5 w-5 text-warning" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle className="h-3 w-3 text-warning" />
              <span className="font-medium text-warning">
                DPIAs e Relatórios
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Novos gráficos com dados reais */}
      <DashboardCharts />

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <RiskMatrix />

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center space-y-4">
            <div className="p-4 bg-danger/10 rounded-lg w-fit mx-auto group-hover:bg-danger/20 transition-colors">
              <XCircle className="h-8 w-8 text-danger" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Riscos Críticos</h3>
              <p className="text-sm text-muted-foreground">
                {realTimeData.criticalRisks} risco{realTimeData.criticalRisks !== 1 ? 's' : ''} crítico{realTimeData.criticalRisks !== 1 ? 's' : ''} ativo{realTimeData.criticalRisks !== 1 ? 's' : ''}
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
                {realTimeData.openIncidents} incidente{realTimeData.openIncidents !== 1 ? 's' : ''} em tratamento
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
                {realTimeData.totalPolicies} política{realTimeData.totalPolicies !== 1 ? 's' : ''} vigente{realTimeData.totalPolicies !== 1 ? 's' : ''}
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
                {realTimeData.totalVendors} fornecedor{realTimeData.totalVendors !== 1 ? 'es' : ''} monitorado{realTimeData.totalVendors !== 1 ? 's' : ''}
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