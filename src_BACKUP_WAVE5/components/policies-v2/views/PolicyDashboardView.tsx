import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  BarChart3,
  Calendar,
  Shield,
  Target,
  Activity,
  Eye,
  ArrowRight,
  Sparkles,
  Brain,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

import type { PolicyMetrics } from '@/types/policy-management-v2';

interface PolicyDashboardViewProps {
  metrics: PolicyMetrics | null;
  onNavigate: (view: string) => void;
}

const PolicyDashboardView: React.FC<PolicyDashboardViewProps> = ({
  metrics,
  onNavigate
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [alexInsights, setAlexInsights] = useState<string[]>([]);

  useEffect(() => {
    // Simular insights do Alex Policy
    setAlexInsights([
      'Taxa de aprovação 15% mais rápida este mês',
      '3 políticas de segurança precisam de revisão urgente',
      'Compliance LGPD atingiu 98% - excelente resultado',
      'Sugestão: criar política de trabalho remoto'
    ]);
  }, []);

  if (!metrics) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4\"></div>
          <p className=\"text-muted-foreground\">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  // Dados para gráficos
  const statusData = Object.entries(metrics.policies_by_status).map(([status, count]) => ({
    name: status,
    value: count,
    color: getStatusColor(status)
  }));

  const categoryData = Object.entries(metrics.policies_by_category).map(([category, count]) => ({
    name: category,
    value: count
  }));

  const trendData = [
    { month: 'Jan', created: 8, approved: 6, published: 5 },
    { month: 'Fev', created: 12, approved: 10, published: 8 },
    { month: 'Mar', created: 15, approved: 13, published: 11 },
    { month: 'Abr', created: 10, approved: 9, published: 7 },
    { month: 'Mai', created: 18, approved: 15, published: 13 },
    { month: 'Jun', created: 14, approved: 12, published: 10 }
  ];

  const complianceData = [
    { framework: 'LGPD', score: 98 },
    { framework: 'ISO 27001', score: 94 },
    { framework: 'SOX', score: 96 },
    { framework: 'GDPR', score: 92 }
  ];

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      draft: '#94a3b8',
      under_review: '#f59e0b',
      pending_approval: '#eab308',
      approved: '#22c55e',
      published: '#3b82f6',
      expired: '#ef4444',
      archived: '#6b7280',
      rejected: '#dc2626',
      suspended: '#f97316'
    };
    return colors[status] || '#6b7280';
  }

  const kpiCards = [
    {
      title: 'Total de Políticas',
      value: metrics.total_policies,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Taxa de Compliance',
      value: `${metrics.compliance_rate}%`,
      change: '+2.3%',
      trend: 'up',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tempo Médio de Aprovação',
      value: `${metrics.average_approval_time} dias`,
      change: '-1.2 dias',
      trend: 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Taxa de Reconhecimento',
      value: `${metrics.acknowledgment_rate}%`,
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const alertCards = [
    {
      title: 'Aprovações Pendentes',
      count: metrics.pending_approvals,
      description: 'Políticas aguardando aprovação',
      icon: CheckCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      action: () => onNavigate('approval')
    },
    {
      title: 'Revisões Próximas',
      count: metrics.upcoming_reviews,
      description: 'Políticas para revisar em 30 dias',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => onNavigate('review')
    },
    {
      title: 'Políticas Expiradas',
      count: metrics.expired_policies,
      description: 'Requerem atenção imediata',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      action: () => onNavigate('validity')
    }
  ];

  return (
    <div className=\"space-y-6\">
      {/* Header com período */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h2 className=\"text-xl font-semibold\">Dashboard de Políticas</h2>
          <p className=\"text-sm text-muted-foreground\">
            Visão geral e métricas do módulo de gestão de políticas
          </p>
        </div>
        <div className=\"flex items-center space-x-2\">
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size=\"sm\"
            onClick={() => setSelectedPeriod('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size=\"sm\"
            onClick={() => setSelectedPeriod('30d')}
          >
            30 dias
          </Button>
          <Button
            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
            size=\"sm\"
            onClick={() => setSelectedPeriod('90d')}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className=\"grid gap-4 md:grid-cols-2 lg:grid-cols-4\">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index}>
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className=\"h-3 w-3\" />
                    <span>{kpi.change}</span>
                  </div>
                </div>
                <div className=\"mt-4\">
                  <div className=\"text-2xl font-bold\">{kpi.value}</div>
                  <p className=\"text-sm text-muted-foreground\">{kpi.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className=\"grid gap-4 md:grid-cols-3\">
        {alertCards.map((alert, index) => {
          const IconComponent = alert.icon;
          
          return (
            <Card 
              key={index} 
              className=\"cursor-pointer hover:shadow-md transition-shadow\"
              onClick={alert.action}
            >
              <CardContent className=\"p-6\">
                <div className=\"flex items-center justify-between\">
                  <div className={`p-2 rounded-lg ${alert.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${alert.color}`} />
                  </div>
                  <ArrowRight className=\"h-4 w-4 text-muted-foreground\" />
                </div>
                <div className=\"mt-4\">
                  <div className=\"text-2xl font-bold\">{alert.count}</div>
                  <p className=\"text-sm font-medium\">{alert.title}</p>
                  <p className=\"text-xs text-muted-foreground mt-1\">{alert.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className=\"grid gap-6 lg:grid-cols-2\">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <BarChart3 className=\"h-5 w-5\" />
              <span>Distribuição por Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width=\"100%\" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx=\"50%\"
                  cy=\"50%\"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey=\"value\"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className=\"mt-4 grid grid-cols-2 gap-2\">
              {statusData.slice(0, 6).map((item, index) => (
                <div key={index} className=\"flex items-center space-x-2\">
                  <div 
                    className=\"w-3 h-3 rounded-full\" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className=\"text-xs text-muted-foreground\">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <Activity className=\"h-5 w-5\" />
              <span>Tendência de Políticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width=\"100%\" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray=\"3 3\" />
                <XAxis dataKey=\"month\" />
                <YAxis />
                <Tooltip />
                <Area 
                  type=\"monotone\" 
                  dataKey=\"created\" 
                  stackId=\"1\" 
                  stroke=\"#3b82f6\" 
                  fill=\"#3b82f6\" 
                  fillOpacity={0.6}
                />
                <Area 
                  type=\"monotone\" 
                  dataKey=\"approved\" 
                  stackId=\"1\" 
                  stroke=\"#22c55e\" 
                  fill=\"#22c55e\" 
                  fillOpacity={0.6}
                />
                <Area 
                  type=\"monotone\" 
                  dataKey=\"published\" 
                  stackId=\"1\" 
                  stroke=\"#8b5cf6\" 
                  fill=\"#8b5cf6\" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className=\"grid gap-6 lg:grid-cols-3\">
        {/* Compliance Scores */}
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <Shield className=\"h-5 w-5\" />
              <span>Compliance por Framework</span>
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            {complianceData.map((item, index) => (
              <div key={index} className=\"space-y-2\">
                <div className=\"flex items-center justify-between\">
                  <span className=\"text-sm font-medium\">{item.framework}</span>
                  <span className=\"text-sm text-muted-foreground\">{item.score}%</span>
                </div>
                <Progress value={item.score} className=\"h-2\" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alex Policy Insights */}
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <Brain className=\"h-5 w-5 text-indigo-600\" />
              <span>Insights Alex Policy</span>
              <Badge variant=\"secondary\" className=\"text-xs bg-indigo-100 text-indigo-800\">
                <Sparkles className=\"h-3 w-3 mr-1\" />
                IA
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-3\">
            {alexInsights.map((insight, index) => (
              <div key={index} className=\"flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg\">
                <Zap className=\"h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0\" />
                <p className=\"text-sm text-indigo-900\">{insight}</p>
              </div>
            ))}
            <Button 
              variant=\"outline\" 
              size=\"sm\" 
              className=\"w-full mt-4\"
              onClick={() => {/* Abrir chat Alex Policy */}}
            >
              <Brain className=\"h-4 w-4 mr-2\" />
              Conversar com Alex Policy
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center space-x-2\">
              <Target className=\"h-5 w-5\" />
              <span>Ações Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-3\">
            <Button 
              variant=\"outline\" 
              className=\"w-full justify-start\"
              onClick={() => onNavigate('elaboration')}
            >
              <FileText className=\"h-4 w-4 mr-2\" />
              Nova Política
            </Button>
            <Button 
              variant=\"outline\" 
              className=\"w-full justify-start\"
              onClick={() => onNavigate('review')}
            >
              <Eye className=\"h-4 w-4 mr-2\" />
              Revisar Políticas
            </Button>
            <Button 
              variant=\"outline\" 
              className=\"w-full justify-start\"
              onClick={() => onNavigate('approval')}
            >
              <CheckCircle className=\"h-4 w-4 mr-2\" />
              Aprovar Políticas
            </Button>
            <Button 
              variant=\"outline\" 
              className=\"w-full justify-start\"
              onClick={() => onNavigate('publication')}
            >
              <Users className=\"h-4 w-4 mr-2\" />
              Publicar Políticas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center space-x-2\">
            <BarChart3 className=\"h-5 w-5\" />
            <span>Estatísticas de Uso Alex Policy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"grid gap-4 md:grid-cols-4\">
            <div className=\"text-center\">
              <div className=\"text-2xl font-bold text-indigo-600\">{metrics.alex_usage_rate}%</div>
              <p className=\"text-sm text-muted-foreground\">Taxa de Uso</p>
            </div>
            <div className=\"text-center\">
              <div className=\"text-2xl font-bold text-green-600\">156</div>
              <p className=\"text-sm text-muted-foreground\">Sugestões Aceitas</p>
            </div>
            <div className=\"text-center\">
              <div className=\"text-2xl font-bold text-blue-600\">89%</div>
              <p className=\"text-sm text-muted-foreground\">Precisão IA</p>
            </div>
            <div className=\"text-center\">
              <div className=\"text-2xl font-bold text-purple-600\">2.3h</div>
              <p className=\"text-sm text-muted-foreground\">Tempo Economizado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyDashboardView;