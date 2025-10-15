import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Share,
  Filter,
  RefreshCw,
  Zap,
  Users,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdvancedAssessmentMetrics } from '@/hooks/useAdvancedAssessmentMetrics';
import { DateRange } from 'react-day-picker';

// =====================================================
// ANALYTICS TYPES & INTERFACES
// =====================================================

interface AnalyticsFilters {
  dateRange?: DateRange;
  frameworks?: string[];
  status?: string[];
  departments?: string[];
}

interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'scatter' | 'radar' | 'treemap';
  title: string;
  description: string;
  data: any[];
  colors: string[];
}

interface KPICard {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    period: string;
  };
  target?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  // State Management
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'maturity' | 'compliance' | 'performance'>('overview');

  // Data Hooks
  const {
    metrics,
    isLoading,
    error,
    coreMetrics,
    historicalTrends,
    performanceIndicators,
    resourceMetrics,
    benchmarks
  } = useAdvancedAssessmentMetrics({
    filters,
    includeHistorical: true,
    includeBenchmarks: true,
    includeForecasting: true
  });

  // Chart Colors
  const chartColors = {
    primary: ['#3B82F6', '#1E40AF', '#60A5FA', '#93C5FD'],
    success: ['#10B981', '#059669', '#34D399', '#6EE7B7'],
    warning: ['#F59E0B', '#D97706', '#FBBF24', '#FCD34D'],
    danger: ['#EF4444', '#DC2626', '#F87171', '#FCA5A5'],
    purple: ['#8B5CF6', '#7C3AED', '#A78BFA', '#C4B5FD'],
    gray: ['#6B7280', '#4B5563', '#9CA3AF', '#D1D5DB']
  };

  // KPI Cards Configuration
  const kpiCards: KPICard[] = [
    {
      title: 'Total Assessments',
      value: metrics?.totalAssessments || 0,
      subtitle: 'Active assessments',
      trend: {
        direction: 'up',
        percentage: 12,
        period: 'vs last month'
      },
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'blue'
    },
    {
      title: 'Completion Rate',
      value: `${metrics?.completionRate || 0}%`,
      subtitle: 'Assessments completed',
      trend: {
        direction: 'up',
        percentage: 5,
        period: 'vs last month'
      },
      target: 90,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'green'
    },
    {
      title: 'Average Maturity',
      value: `${metrics?.averageMaturity || 0}/5`,
      subtitle: 'Maturity score',
      trend: {
        direction: 'up',
        percentage: 8,
        period: 'vs last quarter'
      },
      target: 4.0,
      icon: <Star className="h-5 w-5" />,
      color: 'yellow'
    },
    {
      title: 'Compliance Score',
      value: `${metrics?.complianceScore || 0}%`,
      subtitle: 'Overall compliance',
      trend: {
        direction: 'up',
        percentage: 3,
        period: 'vs last month'
      },
      target: 95,
      icon: <Shield className="h-5 w-5" />,
      color: 'purple'
    },
    {
      title: 'Critical Findings',
      value: metrics?.criticalFindings || 0,
      subtitle: 'High-risk issues',
      trend: {
        direction: 'down',
        percentage: 15,
        period: 'vs last month'
      },
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'red'
    },
    {
      title: 'Pending Actions',
      value: metrics?.pendingActions || 0,
      subtitle: 'Action items due',
      trend: {
        direction: 'down',
        percentage: 8,
        period: 'vs last week'
      },
      icon: <Clock className="h-5 w-5" />,
      color: 'orange'
    }
  ];

  // Chart Data Preparation
  const maturityTrendData = historicalTrends?.map(trend => ({
    month: trend.month,
    'Average Score': trend.averageScore,
    'Completed Assessments': trend.completedAssessments,
    'Compliance Rate': trend.complianceRate
  })) || [];

  const frameworkDistributionData = metrics?.frameworkDistribution?.map(framework => ({
    name: framework.framework,
    value: framework.count,
    percentage: framework.percentage,
    averageScore: framework.averageScore
  })) || [];

  const statusDistributionData = metrics?.statusDistribution?.map(status => ({
    name: status.status,
    value: status.count,
    percentage: status.percentage
  })) || [];

  const riskDistributionData = [
    { name: 'Critical', value: metrics?.criticalFindings || 0, color: '#EF4444' },
    { name: 'High', value: metrics?.highRiskFindings || 0, color: '#F59E0B' },
    { name: 'Medium', value: metrics?.mediumRiskFindings || 0, color: '#10B981' },
    { name: 'Low', value: metrics?.lowRiskFindings || 0, color: '#6B7280' }
  ];

  const performanceData = [
    {
      metric: 'Monthly Growth',
      current: performanceIndicators?.monthlyGrowth || 0,
      target: 10,
      benchmark: benchmarks?.industryAverage || 0
    },
    {
      metric: 'Quality Score',
      current: performanceIndicators?.qualityScore || 0,
      target: 90,
      benchmark: benchmarks?.industryAverage || 0
    },
    {
      metric: 'Efficiency Index',
      current: performanceIndicators?.efficiencyIndex || 0,
      target: 85,
      benchmark: benchmarks?.industryAverage || 0
    },
    {
      metric: 'Risk Reduction',
      current: performanceIndicators?.riskReduction || 0,
      target: 75,
      benchmark: benchmarks?.industryAverage || 0
    }
  ];

  // Render KPI Cards
  const renderKPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${kpi.color}-100 text-${kpi.color}-600`}>
                {kpi.icon}
              </div>
              {kpi.trend && (
                <div className={`flex items-center space-x-1 text-sm ${
                  kpi.trend.direction === 'up' ? 'text-green-600' : 
                  kpi.trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.trend.direction === 'up' && <ArrowUp className="h-3 w-3" />}
                  {kpi.trend.direction === 'down' && <ArrowDown className="h-3 w-3" />}
                  {kpi.trend.direction === 'stable' && <Minus className="h-3 w-3" />}
                  <span>{kpi.trend.percentage}%</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              {kpi.subtitle && (
                <p className="text-xs text-gray-500">{kpi.subtitle}</p>
              )}
              {kpi.trend && (
                <p className="text-xs text-gray-500">{kpi.trend.period}</p>
              )}
            </div>

            {kpi.target && (
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                  <span>Target: {kpi.target}{typeof kpi.value === 'string' && kpi.value.includes('%') ? '%' : ''}</span>
                  <span>{Math.round((Number(String(kpi.value).replace('%', '')) / kpi.target) * 100)}%</span>
                </div>
                <Progress 
                  value={(Number(String(kpi.value).replace('%', '')) / kpi.target) * 100} 
                  className="h-1" 
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render Charts Section
  const renderChartsSection = () => {
    switch (selectedView) {
      case 'maturity':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maturity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={maturityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Average Score" 
                      stroke={chartColors.primary[0]} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Framework Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={frameworkDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {frameworkDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors.primary[index % chartColors.primary.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case 'compliance':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={maturityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="Compliance Rate" 
                      stroke={chartColors.success[0]} 
                      fill={chartColors.success[0]}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case 'performance':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" name="Current" fill={chartColors.primary[0]} />
                    <Bar dataKey="target" name="Target" fill={chartColors.success[0]} />
                    <Bar dataKey="benchmark" name="Industry Avg" fill={chartColors.gray[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistributionData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill={chartColors.primary[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      default: // overview
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={maturityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Completed Assessments" 
                      stroke={chartColors.primary[0]} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Compliance Rate" 
                      stroke={chartColors.success[0]} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Framework Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={frameworkDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="averageScore" name="Avg Score" fill={chartColors.primary[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Analytics</h3>
            <p className="text-red-700">Failed to load analytics data. Please try again.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive assessment insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {renderKPICards()}

      {/* Analytics Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="maturity" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Maturity</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedView} className="space-y-6">
          {renderChartsSection()}
        </TabsContent>
      </Tabs>

      {/* Insights Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Key Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Performance Trend</h4>
              <p className="text-sm text-blue-700">
                Assessment completion rate has improved by 12% this month, indicating better process adoption.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Compliance Achievement</h4>
              <p className="text-sm text-green-700">
                95% of assessments meet compliance thresholds, exceeding the industry benchmark of 85%.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Risk Reduction</h4>
              <p className="text-sm text-yellow-700">
                Critical findings have decreased by 15%, showing effective action plan implementation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;