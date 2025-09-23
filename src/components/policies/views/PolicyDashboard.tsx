import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Plus,
  Eye,
  Edit,
  BookOpen
} from 'lucide-react';

interface PolicyDashboardProps {
  policies: any[];
  allPolicies?: any[];
  onPolicyUpdate?: () => void;
  alexConfig?: any;
}

const PolicyDashboard: React.FC<PolicyDashboardProps> = ({ 
  policies, 
  allPolicies = policies,
  onPolicyUpdate,
  alexConfig 
}) => {
  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = allPolicies.length;
    const draft = allPolicies.filter(p => p.status === 'draft').length;
    const review = allPolicies.filter(p => p.status === 'under_review' || p.workflow_stage === 'review').length;
    const approved = allPolicies.filter(p => p.status === 'approved').length;
    const published = allPolicies.filter(p => p.status === 'published').length;
    
    // Políticas por categoria
    const categories = allPolicies.reduce((acc, policy) => {
      acc[policy.category] = (acc[policy.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Políticas criadas recentemente (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPolicies = allPolicies.filter(p => 
      new Date(p.created_at) >= sevenDaysAgo
    );

    // Políticas que precisam de atenção
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const needsAttention = allPolicies.filter(p => {
      // Políticas expiradas ou expirando
      if (p.expiry_date) {
        const expiryDate = new Date(p.expiry_date);
        if (expiryDate <= thirtyDaysFromNow) return true;
      }
      // Políticas que precisam de revisão
      if (p.next_review_date) {
        const reviewDate = new Date(p.next_review_date);
        if (reviewDate <= thirtyDaysFromNow) return true;
      }
      return false;
    });

    return {
      total,
      draft,
      review,
      approved,
      published,
      categories,
      recentPolicies,
      needsAttention: needsAttention.length
    };
  }, [allPolicies]);

  // Atividades recentes simuladas baseadas nos dados reais
  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Adicionar atividades baseadas nas políticas reais
    stats.recentPolicies.forEach(policy => {
      activities.push({
        type: 'created',
        message: `Política "${policy.title}" foi criada`,
        time: new Date(policy.created_at),
        icon: Plus,
        color: 'bg-blue-500'
      });
    });

    // Adicionar atividades simuladas
    if (stats.published > 0) {
      activities.push({
        type: 'published',
        message: 'Política de Segurança foi publicada',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        icon: BookOpen,
        color: 'bg-green-500'
      });
    }

    if (stats.review > 0) {
      activities.push({
        type: 'review',
        message: 'Política de RH está em revisão',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        icon: Eye,
        color: 'bg-orange-500'
      });
    }

    // Ordenar por tempo (mais recente primeiro)
    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  }, [stats]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Há poucos minutos';
    if (diffInHours < 24) return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  };

  const getTopCategories = () => {
    return Object.entries(stats.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Políticas</h2>
          <p className="text-muted-foreground">
            Visão geral do status e métricas das políticas organizacionais
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1 border-green-300 text-green-800 bg-green-50 dark:border-green-600 dark:text-green-200 dark:bg-green-950/20">
            <TrendingUp className="h-3 w-3" />
            {stats.recentPolicies.length} criadas esta semana
          </Badge>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Políticas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">
              Em elaboração
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Revisão</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.review}</div>
            <p className="text-xs text-muted-foreground">
              Sendo revisadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Prontas para publicar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Ativas na organização
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas importantes */}
      {stats.needsAttention > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  {stats.needsAttention} política(s) precisam de atenção
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Políticas expirando ou que precisam de revisão nos próximos 30 dias
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto border-orange-300 text-orange-800 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-200 dark:hover:bg-orange-900/50"
              >
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos e análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Novas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{stats.draft}</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-yellow-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.draft / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Em Revisão</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{stats.review}</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.review / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Aprovadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{stats.approved}</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-green-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Publicadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{stats.published}</span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-purple-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(activity.time)}
                        </p>
                      </div>
                      <Icon className="h-3 w-3 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Políticas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTopCategories().length > 0 ? (
              <div className="space-y-3">
                {getTopCategories().map(([category, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-800 bg-blue-50 dark:border-blue-600 dark:text-blue-200 dark:bg-blue-950/20">
                        {((count / stats.total) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Métricas de performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Conclusão</span>
                <span className="text-sm text-muted-foreground">
                  {stats.total > 0 ? ((stats.published / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Políticas Ativas</span>
                <span className="text-sm text-muted-foreground">{stats.published}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Em Processo</span>
                <span className="text-sm text-muted-foreground">
                  {stats.draft + stats.review + stats.approved}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Criadas esta semana</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">{stats.recentPolicies.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PolicyDashboard;