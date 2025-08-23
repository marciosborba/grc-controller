import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  Shield,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface MetricData {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  target?: number;
  unit?: string;
  description?: string;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
}

interface VendorMetricsProps {
  dashboardMetrics?: any;
  riskDistribution?: any;
  className?: string;
}

export const VendorMetrics: React.FC<VendorMetricsProps> = ({
  dashboardMetrics,
  riskDistribution,
  className
}) => {
  // Calculate derived metrics
  const totalVendors = dashboardMetrics?.total_vendors || 0;
  const criticalVendorsPercentage = totalVendors > 0 
    ? ((dashboardMetrics?.critical_vendors || 0) / totalVendors * 100).toFixed(1)
    : '0';
  
  const assessmentCompletionRate = dashboardMetrics 
    ? (((dashboardMetrics.total_vendors - dashboardMetrics.pending_assessments) / Math.max(dashboardMetrics.total_vendors, 1)) * 100).toFixed(1)
    : '0';
  
  const onTimeAssessmentRate = dashboardMetrics
    ? (((dashboardMetrics.pending_assessments - dashboardMetrics.overdue_assessments) / Math.max(dashboardMetrics.pending_assessments, 1)) * 100).toFixed(1)
    : '100';

  // Risk distribution metrics
  const riskTotal = riskDistribution 
    ? riskDistribution.low + riskDistribution.medium + riskDistribution.high + riskDistribution.critical
    : 0;

  const highRiskPercentage = riskTotal > 0 
    ? (((riskDistribution?.high || 0) + (riskDistribution?.critical || 0)) / riskTotal * 100).toFixed(1)
    : '0';

  // Define metric categories
  const operationalMetrics: MetricData[] = [
    {
      label: 'Total de Fornecedores',
      value: totalVendors,
      change: '+5.2%',
      changeType: 'increase',
      trend: 'up',
      description: 'Número total de fornecedores ativos',
      status: 'good'
    },
    {
      label: 'Fornecedores Críticos',
      value: dashboardMetrics?.critical_vendors || 0,
      change: `${criticalVendorsPercentage}%`,
      changeType: parseFloat(criticalVendorsPercentage) > 15 ? 'increase' : 'neutral',
      trend: 'stable',
      description: 'Fornecedores com criticidade alta/crítica',
      status: parseFloat(criticalVendorsPercentage) > 15 ? 'warning' : 'good'
    },
    {
      label: 'Taxa de Conclusão',
      value: `${assessmentCompletionRate}%`,
      change: '+2.1%',
      changeType: 'increase',
      trend: 'up',
      target: 95,
      description: 'Assessments concluídos vs. total',
      status: parseFloat(assessmentCompletionRate) >= 85 ? 'good' : 'warning'
    },
    {
      label: 'Pontualidade',
      value: `${onTimeAssessmentRate}%`,
      change: '-1.3%',
      changeType: 'decrease',
      trend: 'down',
      target: 90,
      description: 'Assessments entregues no prazo',
      status: parseFloat(onTimeAssessmentRate) >= 80 ? 'good' : 'critical'
    }
  ];

  const riskMetrics: MetricData[] = [
    {
      label: 'Risco Alto/Crítico',
      value: `${highRiskPercentage}%`,
      change: '-3.5%',
      changeType: 'decrease',
      trend: 'down',
      target: 20,
      description: 'Percentual de fornecedores de alto risco',
      status: parseFloat(highRiskPercentage) > 25 ? 'critical' : parseFloat(highRiskPercentage) > 15 ? 'warning' : 'good'
    },
    {
      label: 'Incidentes Ativos',
      value: dashboardMetrics?.active_incidents || 0,
      change: '+1',
      changeType: 'increase',
      trend: 'up',
      description: 'Incidentes em aberto',
      status: (dashboardMetrics?.active_incidents || 0) > 5 ? 'critical' : (dashboardMetrics?.active_incidents || 0) > 2 ? 'warning' : 'good'
    },
    {
      label: 'Assessments Vencidos',
      value: dashboardMetrics?.overdue_assessments || 0,
      change: '-2',
      changeType: 'decrease',
      trend: 'down',
      description: 'Assessments em atraso',
      status: (dashboardMetrics?.overdue_assessments || 0) > 10 ? 'critical' : (dashboardMetrics?.overdue_assessments || 0) > 5 ? 'warning' : 'good'
    },
    {
      label: 'Score Médio de Risco',
      value: '2.4',
      unit: '/5.0',
      change: '-0.2',
      changeType: 'decrease',
      trend: 'down',
      target: 2.0,
      description: 'Pontuação média de risco',
      status: 'good'
    }
  ];

  const contractMetrics: MetricData[] = [
    {
      label: 'Contratos Expirando',
      value: dashboardMetrics?.expiring_contracts || 0,
      change: '+3',
      changeType: 'increase',
      trend: 'up',
      description: 'Contratos vencendo em 90 dias',
      status: (dashboardMetrics?.expiring_contracts || 0) > 10 ? 'warning' : 'good'
    },
    {
      label: 'Certificações Expirando',
      value: dashboardMetrics?.expiring_certifications || 0,
      change: '+1',
      changeType: 'increase',
      trend: 'up',
      description: 'Certificações vencendo em breve',
      status: (dashboardMetrics?.expiring_certifications || 0) > 5 ? 'warning' : 'good'
    },
    {
      label: 'Valor Médio de Contrato',
      value: 'R$ 125K',
      change: '+8.5%',
      changeType: 'increase',
      trend: 'up',
      description: 'Valor médio dos contratos ativos',
      status: 'good'
    },
    {
      label: 'Tempo Médio de Onboarding',
      value: '14.2',
      unit: 'dias',
      change: '-2.1 dias',
      changeType: 'decrease',
      trend: 'down',
      target: 12,
      description: 'Tempo médio do processo de onboarding',
      status: 'good'
    }
  ];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 dark:text-green-400';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-400';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string, changeType: string) => {
    if (trend === 'up' && changeType === 'increase') {
      return <ArrowUpRight className="w-3 h-3 text-green-600" />;
    } else if (trend === 'down' && changeType === 'decrease') {
      return <ArrowDownRight className="w-3 h-3 text-red-600" />;
    } else if (trend === 'up') {
      return <TrendingUp className="w-3 h-3 text-blue-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-3 h-3 text-blue-600" />;
    }
    return <Activity className="w-3 h-3 text-gray-600" />;
  };

  // Metric Card Component
  const MetricCard: React.FC<{ metric: MetricData; icon?: React.ReactNode }> = ({ metric, icon }) => (
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-slate-500 dark:text-slate-400">{icon}</div>}
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
              {metric.label}
            </h4>
          </div>
          <div className={`p-1 rounded-md border ${getStatusColor(metric.status || 'neutral')}`}>
            {getStatusIcon(metric.status || 'neutral')}
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {metric.unit}
              </span>
            )}
          </div>
          
          {metric.change && (
            <div className="flex items-center space-x-1">
              {getTrendIcon(metric.trend || 'stable', metric.changeType || 'neutral')}
              <span className={`text-xs font-medium ${
                metric.changeType === 'increase' 
                  ? 'text-green-600 dark:text-green-400' 
                  : metric.changeType === 'decrease' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {metric.change}
              </span>
            </div>
          )}
        </div>

        {metric.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {metric.description}
          </p>
        )}

        {metric.target && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Meta: {metric.target}%</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value}%
              </span>
            </div>
            <Progress 
              value={typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value} 
              className="h-1.5" 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Operational Metrics */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Métricas Operacionais
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalMetrics.map((metric, index) => (
            <MetricCard 
              key={index} 
              metric={metric} 
              icon={
                index === 0 ? <Users className="w-4 h-4" /> :
                index === 1 ? <AlertTriangle className="w-4 h-4" /> :
                index === 2 ? <CheckCircle className="w-4 h-4" /> :
                <Clock className="w-4 h-4" />
              }
            />
          ))}
        </div>
      </div>

      {/* Risk Metrics */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Métricas de Risco
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskMetrics.map((metric, index) => (
            <MetricCard 
              key={index} 
              metric={metric} 
              icon={
                index === 0 ? <Shield className="w-4 h-4" /> :
                index === 1 ? <AlertTriangle className="w-4 h-4" /> :
                index === 2 ? <Clock className="w-4 h-4" /> :
                <BarChart3 className="w-4 h-4" />
              }
            />
          ))}
        </div>
      </div>

      {/* Contract & Compliance Metrics */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <FileCheck className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Métricas Contratuais e Compliance
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contractMetrics.map((metric, index) => (
            <MetricCard 
              key={index} 
              metric={metric} 
              icon={
                index === 0 ? <FileCheck className="w-4 h-4" /> :
                index === 1 ? <Shield className="w-4 h-4" /> :
                index === 2 ? <DollarSign className="w-4 h-4" /> :
                <Clock className="w-4 h-4" />
              }
            />
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Resumo Executivo</span>
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Visão consolidada do desempenho do programa de gestão de fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Status Geral</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={
                  parseFloat(highRiskPercentage) < 15 && (dashboardMetrics?.overdue_assessments || 0) < 5
                    ? 'border-green-200 text-green-700 bg-green-50'
                    : 'border-yellow-200 text-yellow-700 bg-yellow-50'
                }>
                  {parseFloat(highRiskPercentage) < 15 && (dashboardMetrics?.overdue_assessments || 0) < 5
                    ? 'Saudável'
                    : 'Atenção Necessária'
                  }
                </Badge>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {totalVendors} fornecedores ativos sendo monitorados
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Principais Riscos</h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• {riskDistribution?.critical || 0} fornecedores críticos</li>
                <li>• {dashboardMetrics?.overdue_assessments || 0} assessments vencidos</li>
                <li>• {dashboardMetrics?.active_incidents || 0} incidentes ativos</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Próximas Ações</h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• Renovar {dashboardMetrics?.expiring_contracts || 0} contratos</li>
                <li>• Atualizar {dashboardMetrics?.expiring_certifications || 0} certificações</li>
                <li>• Completar assessments pendentes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorMetrics;