import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Area,
  AreaChart
} from 'recharts';
import {
  FileText,
  TrendingUp,
  Shield,
  Target,
  Clock,
  Users,
  Activity,
  Zap,
  Eye,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BookOpen,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import type { 
  Policy, 
  PolicyDashboardData, 
  AlexPolicyConfig,
  PolicyCategory,
  PolicyStatus,
  PolicyPriority
} from '@/types/policy-management';

interface PolicyDashboardProps {
  data: PolicyDashboardData | null;
  policies: Policy[];
  onRefresh: () => void;
  alexConfig: AlexPolicyConfig;
}

export const PolicyDashboard: React.FC<PolicyDashboardProps> = ({
  data,
  policies,
  onRefresh,
  alexConfig
}) => {
  // Funções utilitárias
  const getStatusColor = (status: PolicyStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400';
      case 'published': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400';
      case 'archived': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: PolicyPriority) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: PolicyCategory) => {
    switch (category) {
      case 'governance': return Shield;
      case 'compliance': return CheckCircle;
      case 'operational': return Activity;
      case 'hr': return Users;
      case 'it': return Zap;
      case 'financial': return BarChart3;
      case 'security': return Shield;
      case 'quality': return Target;
      default: return FileText;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Dados para gráficos
  const chartData = useMemo(() => {
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

    const statusChartData = ['draft', 'review', 'approved', 'published', 'expired', 'archived'].map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusData[status] || 0,
      color: getStatusColor(status as PolicyStatus)
    }));

    // Tendência de criação (simulado)
    const trendData = [
      { month: 'Jan', total: Math.max(0, policies.length - 15), published: Math.max(0, (statusData['published'] || 0) - 3) },
      { month: 'Fev', total: Math.max(0, policies.length - 12), published: Math.max(0, (statusData['published'] || 0) - 2) },
      { month: 'Mar', total: Math.max(0, policies.length - 8), published: Math.max(0, (statusData['published'] || 0) - 1) },
      { month: 'Abr', total: Math.max(0, policies.length - 5), published: statusData['published'] || 0 },
      { month: 'Mai', total: policies.length, published: statusData['published'] || 0 }
    ];

    return { categoryChartData, statusChartData, trendData };
  }, [policies]);

  // Políticas críticas (alta prioridade ou próximas do vencimento)
  const criticalPolicies = policies
    .filter(policy => {
      const isHighPriority = ['high', 'critical'].includes(policy.priority);
      const isExpiringSoon = policy.expiry_date && 
        new Date(policy.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return isHighPriority || isExpiringSoon;
    })
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);

  // Métricas resumidas
  const summary = data?.summary || {
    total_policies: policies.length,
    active_policies: policies.filter(p => p.is_active).length,
    draft_policies: policies.filter(p => p.status === 'draft').length,
    pending_approval: policies.filter(p => p.status === 'review').length,
    expiring_soon: policies.filter(p => {
      if (!p.expiry_date) return false;
      const expiryDate = new Date(p.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow;
    }).length,
    compliance_rate: 85.5,
    average_read_rate: 78.2
  };

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Dashboard de Políticas
          </h2>
          <p className="text-muted-foreground">
            Visão geral do status e performance das políticas organizacionais
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Políticas */}
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total de Políticas</p>
                <p className="text-3xl font-bold text-foreground">{summary.total_policies}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>+12% este mês</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Políticas Ativas */}
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Políticas Ativas</p>
                <p className="text-3xl font-bold text-foreground">{summary.active_policies}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{((summary.active_policies / summary.total_policies) * 100).toFixed(1)}% do total</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendentes de Aprovação */}
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pendentes Aprovação</p>
                <p className="text-3xl font-bold text-foreground">{summary.pending_approval}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span>Requer atenção</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vencendo em Breve */}
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Vencendo em 30 dias</p>
                <p className="text-3xl font-bold text-foreground">{summary.expiring_soon}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span>Ação necessária</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>Distribuição por Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6">
                  {chartData.statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Políticas Críticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <span>Políticas Críticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalPolicies.map((policy, index) => {
                const CategoryIcon = getCategoryIcon(policy.category);
                return (
                  <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        policy.priority === 'critical' ? 'bg-red-100 dark:bg-red-950/50' :
                        policy.priority === 'high' ? 'bg-orange-100 dark:bg-orange-950/50' :
                        'bg-yellow-100 dark:bg-yellow-950/50'
                      }`}>
                        <CategoryIcon className={`h-4 w-4 ${
                          policy.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                          policy.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              policy.priority === 'critical' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400' :
                              policy.priority === 'high' ? 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400' :
                              'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400'
                            }`}
                          >
                            {policy.priority}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium truncate">{policy.title}</p>
                        <p className="text-xs text-muted-foreground">{policy.category}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {criticalPolicies.length === 0 && (
                <div className="text-center py-6">
                  <Shield className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-green-600 font-medium">Excelente!</p>
                  <p className="text-xs text-muted-foreground">Nenhuma política crítica identificada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {chartData.categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendência de Criação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Evolução das Políticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Total"
                />
                <Area 
                  type="monotone" 
                  dataKey="published" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Publicadas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Taxa de Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Taxa de Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compliance Geral</span>
                <span className="font-medium">{summary.compliance_rate}%</span>
              </div>
              <Progress value={summary.compliance_rate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Leitura</span>
                <span className="font-medium">{summary.average_read_rate}%</span>
              </div>
              <Progress value={summary.average_read_rate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Políticas Atualizadas</span>
                <span className="font-medium">92.3%</span>
              </div>
              <Progress value={92.3} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Atividades Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policies.slice(0, 5).map((policy) => (
                <div key={policy.id} className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{policy.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {policy.status === 'published' ? 'Publicada' : 
                       policy.status === 'approved' ? 'Aprovada' :
                       policy.status === 'review' ? 'Em revisão' : 'Criada'} em {formatDate(policy.updated_at)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status}
                  </Badge>
                </div>
              ))}
              
              {policies.length === 0 && (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alex Policy Insights */}
      {alexConfig.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Insights Alex Policy</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                IA
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Oportunidade</span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Considere criar políticas específicas para trabalho remoto baseado nas tendências atuais.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Conformidade</span>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Suas políticas de segurança estão alinhadas com as melhores práticas do setor.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Atenção</span>
                </div>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  3 políticas precisam de revisão devido a mudanças regulatórias recentes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyDashboard;