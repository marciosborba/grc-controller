import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  Users,
  MessageSquare,
  Database,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';

interface UsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens_used: number;
  total_cost_usd: number;
  avg_response_time_ms: number;
  avg_quality_score: number;
  by_module: Record<string, any>;
  by_operation: Record<string, any>;
  daily_usage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

interface UserStats {
  user_id: string;
  user_name: string;
  total_requests: number;
  total_tokens: number;
  avg_quality_score: number;
  most_used_module: string;
}

export const AIUsageStatsSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  const periodOptions = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' },
    { value: '365', label: 'Último ano' }
  ];

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas gerais usando a função RPC
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_ai_usage_stats', {
          tenant_uuid: user?.tenant?.id,
          days_back: parseInt(selectedPeriod)
        });

      if (statsError) {
        console.error('Erro ao carregar estatísticas:', statsError);
      } else {
        setStats(statsData);
      }

      // Carregar estatísticas por usuário
      const { data: userStatsData, error: userStatsError } = await supabase
        .from('ai_usage_logs')
        .select(`
          user_id,
          profiles!inner(name),
          operation_type,
          module_name,
          tokens_input,
          tokens_output,
          quality_score
        `)
        .eq('tenant_id', user?.tenant?.id)
        .gte('created_at', new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString());

      if (!userStatsError && userStatsData) {
        // Agregar dados por usuário
        const userStatsMap = new Map<string, any>();
        
        userStatsData.forEach(log => {
          const userId = log.user_id;
          if (!userStatsMap.has(userId)) {
            userStatsMap.set(userId, {
              user_id: userId,
              user_name: log.profiles?.name || 'Usuário Desconhecido',
              total_requests: 0,
              total_tokens: 0,
              quality_scores: [],
              modules: new Map<string, number>()
            });
          }
          
          const userStat = userStatsMap.get(userId);
          userStat.total_requests++;
          userStat.total_tokens += (log.tokens_input || 0) + (log.tokens_output || 0);
          
          if (log.quality_score) {
            userStat.quality_scores.push(log.quality_score);
          }
          
          const moduleCount = userStat.modules.get(log.module_name) || 0;
          userStat.modules.set(log.module_name, moduleCount + 1);
        });

        // Converter para array e calcular estatísticas finais
        const processedUserStats = Array.from(userStatsMap.values()).map(userStat => ({
          user_id: userStat.user_id,
          user_name: userStat.user_name,
          total_requests: userStat.total_requests,
          total_tokens: userStat.total_tokens,
          avg_quality_score: userStat.quality_scores.length > 0 
            ? userStat.quality_scores.reduce((a, b) => a + b, 0) / userStat.quality_scores.length 
            : 0,
          most_used_module: Array.from(userStat.modules.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        })).sort((a, b) => b.total_requests - a.total_requests);

        setUserStats(processedUserStats);
      }

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar estatísticas de uso',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportStats = async () => {
    try {
      const exportData = {
        period: selectedPeriod,
        generated_at: new Date().toISOString(),
        general_stats: stats,
        user_stats: userStats
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-usage-stats-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'Estatísticas exportadas com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar estatísticas',
        variant: 'destructive'
      });
    }
  };

  const getSuccessRate = () => {
    if (!stats || stats.total_requests === 0) return 0;
    return Math.round((stats.successful_requests / stats.total_requests) * 100);
  };

  const getTopModule = () => {
    if (!stats?.by_module) return 'N/A';
    const modules = Object.entries(stats.by_module);
    if (modules.length === 0) return 'N/A';
    return modules.sort((a, b) => b[1] - a[1])[0][0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Estatísticas de Uso</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitore uso, performance e custos dos assistentes de IA
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" onClick={exportStats}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Requisições
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(stats?.total_requests || 0)}
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">{getSuccessRate()}% sucesso</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Tokens Utilizados
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(stats?.total_tokens_used || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Entrada + Saída
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-full">
                <Database className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Custo Total
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.total_cost_usd || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Últimos {selectedPeriod} dias
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-full">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Tempo Médio
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(stats?.avg_response_time_ms || 0)}ms
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                  <span className="text-orange-600">Qualidade: {stats?.avg_quality_score?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-full">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="modules">Por Módulo</TabsTrigger>
          <TabsTrigger value="users">Por Usuário</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Usage Chart Placeholder */}
            <Card className="grc-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Uso Diário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Gráfico de uso diário</p>
                    <p className="text-xs">Implementar com biblioteca de gráficos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card className="grc-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span>Breakdown de Custos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Custo por Requisição</span>
                    <span className="font-medium">
                      {stats?.total_requests ? formatCurrency((stats.total_cost_usd || 0) / stats.total_requests) : '$0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Custo por Token</span>
                    <span className="font-medium">
                      {stats?.total_tokens_used ? formatCurrency((stats.total_cost_usd || 0) / stats.total_tokens_used) : '$0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projeção Mensal</span>
                    <span className="font-medium">
                      {formatCurrency(((stats?.total_cost_usd || 0) / parseInt(selectedPeriod)) * 30)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Saúde do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getSuccessRate() >= 95 ? 'bg-green-100' : getSuccessRate() >= 85 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                    {getSuccessRate() >= 95 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Taxa de Sucesso</p>
                    <p className="text-sm text-muted-foreground">{getSuccessRate()}%</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Tempo de Resposta</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(stats?.avg_response_time_ms || 0)}ms
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Usuários Ativos</p>
                    <p className="text-sm text-muted-foreground">{userStats.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Uso por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.by_module && Object.keys(stats.by_module).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.by_module).map(([module, count]) => (
                    <div key={module} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{module}</p>
                          <p className="text-sm text-muted-foreground">{count} requisições</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {((count / (stats.total_requests || 1)) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum dado de módulo disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Uso por Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              {userStats.length > 0 ? (
                <div className="space-y-4">
                  {userStats.map((userStat) => (
                    <div key={userStat.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {userStat.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{userStat.user_name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{userStat.total_requests} req.</span>
                            <span>{formatNumber(userStat.total_tokens)} tokens</span>
                            <span>Módulo: {userStat.most_used_module}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          Qualidade: {userStat.avg_quality_score.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum dado de usuário disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="grc-card">
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {getSuccessRate()}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(stats?.avg_response_time_ms || 0)}ms
                    </p>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.avg_quality_score?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Qualidade Média</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {stats?.failed_requests || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Falhas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="grc-card">
              <CardHeader>
                <CardTitle>Otimizações Sugeridas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getSuccessRate() < 95 && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Considere revisar configurações dos provedores</span>
                  </div>
                )}
                {(stats?.avg_response_time_ms || 0) > 3000 && (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Tempo de resposta pode ser otimizado</span>
                  </div>
                )}
                {(stats?.total_cost_usd || 0) / parseInt(selectedPeriod) > 10 && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <DollarSign className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Custos estão acima da média recomendada</span>
                  </div>
                )}
                {getSuccessRate() >= 95 && (stats?.avg_response_time_ms || 0) < 2000 && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Sistema funcionando otimamente!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};