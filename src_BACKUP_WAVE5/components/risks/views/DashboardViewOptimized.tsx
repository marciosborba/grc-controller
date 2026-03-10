import React, { useMemo, memo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  TrendingUp,
  Shield,
  Target,
  Users,
  Activity,
  Eye,
  MoreHorizontal,
  BarChart as BarChartIcon
} from 'lucide-react';
import type { Risk, RiskMetrics, RiskFilters } from '@/types/risk-management';

// Lazy loading dos gráficos pesados
const RiskCharts = lazy(() => import('./components/RiskCharts'));

interface DashboardViewProps {
  risks: Risk[];
  metrics?: RiskMetrics;
  searchTerm: string;
  filters?: RiskFilters;
}

const ChartLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando gráficos...</p>
    </div>
  </div>
);

export const DashboardViewOptimized: React.FC<DashboardViewProps> = memo(({
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

  // Funções utilitárias memoizadas
  const getRiskLevelBadgeStyle = useMemo(() => (level: string) => {
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
  }, []);

  const getRiskLevelIconBg = useMemo(() => (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto': return 'bg-red-100 dark:bg-red-950/50';
      case 'Alto': return 'bg-orange-100 dark:bg-orange-950/50';
      case 'Médio': return 'bg-yellow-100 dark:bg-yellow-950/50';
      case 'Baixo': return 'bg-green-100 dark:bg-green-950/50';
      case 'Muito Baixo': return 'bg-slate-100 dark:bg-slate-950/50';
      default: return 'bg-gray-100 dark:bg-gray-950/50';
    }
  }, []);

  const getRiskLevelIconColor = useMemo(() => (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'Muito Alto': return 'text-red-600 dark:text-red-400';
      case 'Alto': return 'text-orange-600 dark:text-orange-400';
      case 'Médio': return 'text-yellow-600 dark:text-yellow-400';
      case 'Baixo': return 'text-green-600 dark:text-green-400';
      case 'Muito Baixo': return 'text-slate-600 dark:text-slate-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }, []);

  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'Identificado': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      case 'Avaliado': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400';
      case 'Em Tratamento': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400';
      case 'Monitorado': return 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-400';
      case 'Fechado': return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  }, []);

  const formatDate = useMemo(() => (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // Top riscos por prioridade
  const topRisks = useMemo(() => 
    filteredRisks
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5),
    [filteredRisks]
  );

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Área para gráficos - carregamento lazy */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChartIcon className="h-5 w-5" />
              <span>Distribuição por Nível de Risco</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartLoader />}>
              <RiskCharts 
                data={filteredRisks} 
                type="level-distribution"
                height={200}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Top 5 Riscos Críticos - sem dependências pesadas */}
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
                        className="text-xs"
                        style={getRiskLevelBadgeStyle(risk.riskLevel)}
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

      {/* Análises Detalhadas - com lazy loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartLoader />}>
              <RiskCharts 
                data={filteredRisks} 
                type="category-distribution"
                height={250}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Evolução de Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartLoader />}>
              <RiskCharts 
                data={filteredRisks} 
                type="trend-analysis"
                height={250}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Riscos Recentes - otimizada */}
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
                  <div className={`p-2 rounded-lg ${getRiskLevelIconBg(risk.riskLevel)}`}>
                    <AlertTriangle className={`h-4 w-4 ${getRiskLevelIconColor(risk.riskLevel)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium truncate">{risk.name}</h4>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={getRiskLevelBadgeStyle(risk.riskLevel)}
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
});

export default DashboardViewOptimized;