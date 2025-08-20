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
  Line
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  Shield,
  Target,
  Clock,
  Users,
  Activity,
  Zap,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import type { Risk, RiskMetrics, RiskFilters } from '@/types/risk-management';

interface DashboardViewProps {
  risks: Risk[];
  metrics?: RiskMetrics;
  searchTerm: string;
  filters?: RiskFilters;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  risks,
  metrics,
  searchTerm,
  filters = {}
}) => {
  // Filtrar riscos baseado nos filtros e busca
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      // Busca por termo
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!risk.name.toLowerCase().includes(term) &&
            !risk.description?.toLowerCase().includes(term) &&
            !risk.category.toLowerCase().includes(term)) {
          return false;
        }
      }

      // Filtro por categorias
      if (filters?.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(risk.category)) return false;
      }

      // Filtro por níveis
      if (filters?.levels && filters.levels.length > 0) {
        if (!filters.levels.includes(risk.riskLevel)) return false;
      }

      // Filtro por status
      if (filters?.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(risk.status)) return false;
      }

      return true;
    });
  }, [risks, searchTerm, filters]);

  // Funções utilitárias
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return '#ef4444';
      case 'Alto': return '#f97316';
      case 'Médio': return '#eab308';
      case 'Baixo': return '#22c55e';
      case 'Muito Baixo': return '#64748b';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identificado': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      case 'Avaliado': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400';
      case 'Em Tratamento': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400';
      case 'Monitorado': return 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-400';
      case 'Fechado': return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Dados para gráficos
  const chartData = useMemo(() => {
    // Distribuição por categoria
    const categoryData = filteredRisks.reduce((acc, risk) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: ((count / filteredRisks.length) * 100).toFixed(1)
    }));

    // Distribuição por nível de risco
    const levelData = filteredRisks.reduce((acc, risk) => {
      acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const levelChartData = ['Muito Alto', 'Alto', 'Médio', 'Baixo', 'Muito Baixo'].map(level => ({
      name: level,
      value: levelData[level] || 0,
      color: getRiskLevelColor(level)
    }));

    // Tendência de riscos (simulado)
    const trendData = [
      { month: 'Jan', total: Math.max(0, filteredRisks.length - 15), alto: Math.max(0, (levelData['Alto'] || 0) - 3) },
      { month: 'Fev', total: Math.max(0, filteredRisks.length - 12), alto: Math.max(0, (levelData['Alto'] || 0) - 2) },
      { month: 'Mar', total: Math.max(0, filteredRisks.length - 8), alto: Math.max(0, (levelData['Alto'] || 0) - 1) },
      { month: 'Abr', total: Math.max(0, filteredRisks.length - 5), alto: levelData['Alto'] || 0 },
      { month: 'Mai', total: filteredRisks.length, alto: levelData['Alto'] || 0 }
    ];

    return { categoryChartData, levelChartData, trendData };
  }, [filteredRisks]);

  // Top riscos por prioridade
  const topRisks = filteredRisks
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gráfico de Distribuição por Nível */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>Distribuição por Nível de Risco</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.levelChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {chartData.levelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 5 Riscos Críticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              <span>Top 5 Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRisks.map((risk, index) => (
                <div key={risk.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          risk.riskLevel === 'Muito Alto' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400' :
                          risk.riskLevel === 'Alto' ? 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400' :
                          'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400'
                        }`}
                      >
                        {risk.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{risk.name}</p>
                    <p className="text-xs text-muted-foreground">{risk.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{risk.riskScore}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              ))}
              
              {topRisks.length === 0 && (
                <div className="text-center py-4">
                  <Shield className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-green-600 font-medium">Excelente!</p>
                  <p className="text-xs text-muted-foreground">Nenhum risco crítico identificado</p>
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

        {/* Tendência Temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Evolução de Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Total"
                />
                <Line 
                  type="monotone" 
                  dataKey="alto" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Alto Risco"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Riscos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Riscos Recentes</span>
              <Badge variant="secondary">{filteredRisks.length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Ver Todos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRisks.slice(0, 10).map((risk) => (
              <div key={risk.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    risk.riskLevel === 'Muito Alto' ? 'bg-red-100 dark:bg-red-950/50' :
                    risk.riskLevel === 'Alto' ? 'bg-orange-100 dark:bg-orange-950/50' :
                    risk.riskLevel === 'Médio' ? 'bg-yellow-100 dark:bg-yellow-950/50' :
                    'bg-green-100 dark:bg-green-950/50'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      risk.riskLevel === 'Muito Alto' ? 'text-red-600 dark:text-red-400' :
                      risk.riskLevel === 'Alto' ? 'text-orange-600 dark:text-orange-400' :
                      risk.riskLevel === 'Médio' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium truncate">{risk.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          risk.riskLevel === 'Muito Alto' ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400' :
                          risk.riskLevel === 'Alto' ? 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400' :
                          risk.riskLevel === 'Médio' ? 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400' :
                          'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400'
                        }`}
                      >
                        {risk.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{risk.category}</span>
                      <span>•</span>
                      <span>Score: {risk.riskScore}</span>
                      <span>•</span>
                      <span>Criado em {formatDate(risk.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(risk.status)}>
                    {risk.status}
                  </Badge>
                  
                  {risk.assignedTo && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{risk.assignedTo}</span>
                    </div>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredRisks.length === 0 && (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum risco encontrado
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || Object.keys(filters || {}).length > 0 
                    ? 'Tente ajustar os filtros ou termo de busca'
                    : 'Nenhum risco foi identificado ainda'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};