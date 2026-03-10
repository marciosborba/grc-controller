import React, { useMemo, memo, useState } from 'react';
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
  Legend,
  LabelList
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
import { cn } from '@/lib/utils';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface DashboardViewProps {
  risks: Risk[];
  metrics?: RiskMetrics;
  searchTerm: string;
  filters?: RiskFilters;
}

export const DashboardView: React.FC<DashboardViewProps> = memo(({
  risks,
  metrics,
  searchTerm,
  filters = {}
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { getRiskLevels } = useTenantSettings();
  const riskLevels = getRiskLevels();

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

  const totalItems = filteredRisks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredRisks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Funções utilitárias
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto': return '#ef4444';
      case 'Alto': return '#f97316';
      case 'Médio': return '#eab308';
      case 'Baixo': return '#22c55e';
      case 'Muito Baixo': return '#64748b';
      default: return '#6b7280';
    }
  };

  const getRiskLevelBadgeStyle = (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto':
        return {
          backgroundColor: '#dc2626',
          color: '#ffffff',
          borderColor: '#dc2626',
          borderWidth: '1px'
        };
      case 'Alto':
        return {
          backgroundColor: '#ea580c',
          color: '#ffffff',
          borderColor: '#ea580c',
          borderWidth: '1px'
        };
      case 'Médio':
        return {
          backgroundColor: '#ca8a04',
          color: '#ffffff',
          borderColor: '#ca8a04',
          borderWidth: '1px'
        };
      case 'Baixo':
        return {
          backgroundColor: '#16a34a',
          color: '#ffffff',
          borderColor: '#16a34a',
          borderWidth: '1px'
        };
      case 'Muito Baixo':
        return {
          backgroundColor: '#64748b',
          color: '#ffffff',
          borderColor: '#64748b',
          borderWidth: '1px'
        };
      default:
        return {
          backgroundColor: '#6b7280',
          color: '#ffffff',
          borderColor: '#6b7280',
          borderWidth: '1px'
        };
    }
  };

  const getRiskLevelIconBg = (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto': return 'bg-red-100 dark:bg-red-950/50';
      case 'Alto': return 'bg-orange-100 dark:bg-orange-950/50';
      case 'Médio': return 'bg-yellow-100 dark:bg-yellow-950/50';
      case 'Baixo': return 'bg-green-100 dark:bg-green-950/50';
      case 'Muito Baixo': return 'bg-slate-100 dark:bg-slate-950/50';
      default: return 'bg-gray-100 dark:bg-gray-950/50';
    }
  };

  const getRiskLevelIconColor = (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto': return 'text-red-600 dark:text-red-400';
      case 'Alto': return 'text-orange-600 dark:text-orange-400';
      case 'Médio': return 'text-yellow-600 dark:text-yellow-400';
      case 'Baixo': return 'text-green-600 dark:text-green-400';
      case 'Muito Baixo': return 'text-slate-600 dark:text-slate-400';
      default: return 'text-gray-600 dark:text-gray-400';
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

    // Criamos a lista baseada exatamente na matriz da tenant atualizada
    const levelChartData = riskLevels.map(level => ({
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
        {/* Gráfico de Distribuição por Categoria (Movido para cima) */}
        <Card className="md:col-span-2">
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1 sm:p-6 sm:pt-0">
            <div className="w-full overflow-x-auto min-w-0">
              <div className="w-full">
                <ResponsiveContainer width="100%" height={Math.max(250, chartData.categoryChartData.length * 35 + 40)}>
                  <BarChart
                    data={[...chartData.categoryChartData].sort((a: any, b: any) => b.value - a.value)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'currentColor' }}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                      formatter={(value: any, name: any, props: any) => {
                        const item = chartData.categoryChartData.find((c: any) => c.name === props.payload.name) as any;
                        return [`${value} (${item?.percentage || 0}%)`, 'Quantidade'];
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
                      ))}
                      <LabelList dataKey="value" position="right" fill="currentColor" fontSize={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Riscos Críticos */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 dark:text-red-400" />
              <span>Top 5 Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-3">
              {topRisks.map((risk, index) => (
                <div key={risk.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 gap-2 overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-muted-foreground">#{index + 1}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={getRiskLevelBadgeStyle(risk.riskLevel)}
                      >
                        {risk.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm font-medium truncate" title={risk.name}>{risk.name}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate" title={risk.category}>{risk.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm sm:text-base font-bold">{risk.riskScore}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Score</p>
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
        {/* Distribuição por Nível de Risco (Movido para baixo) */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-lg">
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Distribuição por Nível de Risco</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1 sm:p-6 sm:pt-0">
            <div className="w-full overflow-x-auto min-w-0">
              <div className="w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData.levelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      tick={{ fill: 'currentColor' }}
                      tickMargin={5}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      fontSize={10}
                      tick={{ fill: 'currentColor' }}
                      axisLine={false}
                      tickLine={false}
                      tickCount={5}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'var(--muted)' }}
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {chartData.levelChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tendência Temporal */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Evolução de Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1 sm:p-6 sm:pt-0">
            <div className="w-full overflow-x-auto min-w-0">
              <div className="w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      fontSize={10}
                      tickMargin={5}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      tickCount={5}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Total"
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="alto"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Alto Risco"
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Riscos Recentes */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-sm sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Riscos Recentes</span>
              <Badge variant="secondary" className="text-[10px] sm:text-xs">{filteredRisks.length}</Badge>
            </div>
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Ver Todos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            {currentItems.map((risk) => (
              <div key={risk.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-0">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 mt-1 sm:mt-0 ${getRiskLevelIconBg(risk.riskLevel)}`}>
                    <AlertTriangle className={`h-3 w-3 sm:h-4 sm:w-4 ${getRiskLevelIconColor(risk.riskLevel)}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <h4 className="font-medium text-sm sm:text-base leading-tight w-full sm:w-auto break-words line-clamp-2">{risk.name}</h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs whitespace-nowrap"
                        style={getRiskLevelBadgeStyle(risk.riskLevel)}
                      >
                        {risk.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-sm text-muted-foreground">
                      <span>{risk.category}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Score <strong className="text-foreground">{risk.riskScore}</strong></span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDate(risk.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                    <Badge className={cn("text-[10px] sm:text-xs whitespace-nowrap", getStatusColor(risk.status))}>
                      {risk.status}
                    </Badge>

                    {risk.assignedTo && (
                      <div className="flex items-center space-x-1 text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
                        <Users className="h-3 w-3" />
                        <span className="truncate max-w-[100px] sm:max-w-none">{risk.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0 ml-auto">
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

          {/* Controles de Paginação */}
          {totalItems > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t gap-2">
              <div className="text-xs text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} riscos
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2 text-xs"
                >
                  Anterior
                </Button>
                <span className="text-xs font-medium px-2 py-1 bg-muted rounded">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2 text-xs"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});