import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

interface PolicyAnalyticsProps {
  policies: any[];
  allPolicies: any[];
  onPolicyUpdate: () => void;
  alexConfig?: any;
}

const PolicyAnalytics: React.FC<PolicyAnalyticsProps> = ({
  policies,
  allPolicies,
  onPolicyUpdate,
  alexConfig
}) => {
  // Calcular métricas
  const analytics = useMemo(() => {
    const total = allPolicies.length;
    const published = allPolicies.filter(p => p.status === 'published').length;
    const draft = allPolicies.filter(p => p.status === 'draft').length;
    const inReview = allPolicies.filter(p => p.workflow_stage === 'review').length;
    const approved = allPolicies.filter(p => p.status === 'approved').length;

    // Políticas por categoria
    const categoryCounts = allPolicies.reduce((acc, policy) => {
      acc[policy.category] = (acc[policy.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Políticas criadas nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPolicies = allPolicies.filter(p => 
      new Date(p.created_at) >= thirtyDaysAgo
    ).length;

    // Políticas expiradas ou expirando
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expired = allPolicies.filter(p => {
      if (!p.expiry_date) return false;
      return new Date(p.expiry_date) < today;
    }).length;

    const expiringSoon = allPolicies.filter(p => {
      if (!p.expiry_date) return false;
      const expiryDate = new Date(p.expiry_date);
      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    }).length;

    // Taxa de aprovação
    const totalProcessed = published + approved;
    const approvalRate = totalProcessed > 0 ? (approved / totalProcessed) * 100 : 0;

    // Tempo médio de aprovação (simulado)
    const avgApprovalTime = 12; // dias

    return {
      total,
      published,
      draft,
      inReview,
      approved,
      categoryCounts,
      recentPolicies,
      expired,
      expiringSoon,
      approvalRate,
      avgApprovalTime
    };
  }, [allPolicies]);

  const getTopCategories = () => {
    return Object.entries(analytics.categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getStatusDistribution = () => {
    return [
      { status: 'Publicadas', count: analytics.published, color: 'bg-green-500' },
      { status: 'Novas', count: analytics.draft, color: 'bg-yellow-500' },
      { status: 'Em Revisão', count: analytics.inReview, color: 'bg-blue-500' },
      { status: 'Aprovadas', count: analytics.approved, color: 'bg-purple-500' }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Políticas</h2>
          <p className="text-muted-foreground">
            Métricas e insights sobre o processo de gestão de políticas
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Atualizado agora
          </Badge>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{analytics.total}</div>
                <div className="text-sm text-muted-foreground">Total de Políticas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{analytics.published}</div>
                <div className="text-sm text-muted-foreground">Publicadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{analytics.recentPolicies}</div>
                <div className="text-sm text-muted-foreground">Criadas (30d)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{analytics.approvalRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Taxa de Aprovação</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {getStatusDistribution().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / analytics.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Políticas por Categoria
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {getTopCategories().map(([category, count], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{count}</span>
                    <Badge variant="outline" className="text-xs">
                      {((count / analytics.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance do Processo
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tempo Médio de Aprovação</span>
                <span className="text-sm text-muted-foreground">{analytics.avgApprovalTime} dias</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Políticas em Processo</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.draft + analytics.inReview + analytics.approved}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Conclusão</span>
                <span className="text-sm text-muted-foreground">
                  {analytics.total > 0 ? ((analytics.published / analytics.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Eficiência do Processo</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">+15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Riscos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas e Riscos
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {analytics.expired > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/20 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">Políticas Expiradas</span>
                  </div>
                  <Badge variant="destructive">{analytics.expired}</Badge>
                </div>
              )}
              
              {analytics.expiringSoon > 0 && (
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Expirando em 30 dias</span>
                  </div>
                  <Badge variant="outline" className="border-yellow-300 text-yellow-800 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-200 dark:bg-yellow-950/20">{analytics.expiringSoon}</Badge>
                </div>
              )}
              
              {analytics.inReview > 5 && (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Muitas em Revisão</span>
                  </div>
                  <Badge variant="outline" className="border-blue-300 text-blue-800 bg-blue-50 dark:border-blue-600 dark:text-blue-200 dark:bg-blue-950/20">{analytics.inReview}</Badge>
                </div>
              )}
              
              {analytics.expired === 0 && analytics.expiringSoon === 0 && analytics.inReview <= 5 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-medium">Tudo em ordem!</p>
                  <p className="text-xs text-green-600">Nenhum alerta crítico no momento</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendências e Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Tendências Positivas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span>Taxa de aprovação acima da média (85%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Processo de revisão eficiente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-green-600" />
                  <span>Cronograma de publicações em dia</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Oportunidades de Melhoria</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span>Padronizar categorias de políticas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-yellow-600" />
                  <span>Automatizar lembretes de revisão</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3 text-yellow-600" />
                  <span>Aumentar participação nas revisões</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyAnalytics;