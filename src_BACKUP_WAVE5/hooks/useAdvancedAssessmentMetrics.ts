import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { useAuth } from '@/contexts/AuthContextOptimized';

// =====================================================
// ENHANCED METRICS TYPES
// =====================================================

export interface AdvancedAssessmentMetrics {
  // Core Metrics
  totalAssessments: number;
  completionRate: number;
  averageMaturity: number;
  complianceScore: number;
  
  // Risk & Findings
  criticalFindings: number;
  highRiskFindings: number;
  mediumRiskFindings: number;
  lowRiskFindings: number;
  
  // Action Items & Tasks
  pendingActions: number;
  completedActions: number;
  overdueActions: number;
  dueSoon: number;
  
  // Timeline Metrics
  overdueCount: number;
  onTimeCompletion: number;
  averageCompletionTime: number;
  
  // Framework Distribution
  frameworkDistribution: Array<{
    framework: string;
    count: number;
    percentage: number;
    averageScore: number;
  }>;
  
  // Status Distribution
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  // Maturity Trends (last 12 months)
  maturityTrends: Array<{
    month: string;
    averageScore: number;
    completedAssessments: number;
    complianceRate: number;
  }>;
  
  // Performance Indicators
  performanceIndicators: {
    monthlyGrowth: number;
    qualityScore: number;
    efficiencyIndex: number;
    riskReduction: number;
  };
  
  // Comparative Analytics
  benchmarks: {
    industryAverage: number;
    bestPractice: number;
    previousPeriod: number;
    target: number;
  };
  
  // Heat Map Data
  riskHeatMap: Array<{
    category: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    frameworks: string[];
  }>;
  
  // Resource Utilization
  resourceMetrics: {
    assessorsUtilization: number;
    averageAssessmentDuration: number;
    capacityUtilization: number;
    workloadDistribution: Array<{
      user: string;
      assessmentsCount: number;
      completionRate: number;
    }>;
  };
}

export interface MetricsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  frameworks?: string[];
  status?: string[];
  assignees?: string[];
  riskLevels?: string[];
}

export interface MetricsOptions {
  filters?: MetricsFilters;
  includeHistorical?: boolean;
  includeBenchmarks?: boolean;
  includeForecasting?: boolean;
  refreshInterval?: number;
}

// =====================================================
// ADVANCED METRICS HOOK
// =====================================================

export const useAdvancedAssessmentMetrics = (options: MetricsOptions = {}) => {
  const tenantId = useCurrentTenantId();
  const { user } = useAuth();
  
  const {
    filters = {},
    includeHistorical = true,
    includeBenchmarks = true,
    includeForecasting = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  // Core Metrics Query
  const {
    data: coreMetrics,
    isLoading: isCoreLoading,
    error: coreError,
    refetch: refetchCore
  } = useQuery({
    queryKey: ['advanced-assessment-metrics', 'core', tenantId, filters],
    queryFn: async (): Promise<Partial<AdvancedAssessmentMetrics>> => {
      if (!tenantId) return {};

      console.log('🔍 [useAdvancedMetrics] Fetching core metrics for tenant:', tenantId);

      // Build filter conditions
      let dateFilter = '';
      if (filters.dateRange) {
        dateFilter = `AND created_at >= '${filters.dateRange.start.toISOString()}' AND created_at <= '${filters.dateRange.end.toISOString()}'`;
      }

      let frameworkFilter = '';
      if (filters.frameworks && filters.frameworks.length > 0) {
        frameworkFilter = `AND framework_id IN (${filters.frameworks.map(f => `'${f}'`).join(',')})`;
      }

      let statusFilter = '';
      if (filters.status && filters.status.length > 0) {
        statusFilter = `AND status IN (${filters.status.map(s => `'${s}'`).join(',')})`;
      }

      // Core Statistics Query
      const { data: assessmentStats } = await supabase
        .from('assessments')
        .select(`
          id,
          status,
          score_maturidade,
          percentual_conclusao,
          data_inicio,
          data_fim,
          data_fim_planejada,
          created_at,
          framework:assessment_frameworks!inner(
            id,
            nome,
            tipo_framework
          )
        `)
        .eq('tenant_id', tenantId)
        .not('deleted_at', 'is', null);

      if (!assessmentStats) {
        throw new Error('Failed to fetch assessment statistics');
      }

      // Calculate core metrics
      const totalAssessments = assessmentStats.length;
      const completedAssessments = assessmentStats.filter(a => a.status === 'concluido').length;
      const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
      
      const maturityScores = assessmentStats
        .filter(a => a.score_maturidade)
        .map(a => a.score_maturidade);
      const averageMaturity = maturityScores.length > 0 
        ? maturityScores.reduce((sum, score) => sum + score, 0) / maturityScores.length 
        : 0;

      const complianceScores = assessmentStats
        .filter(a => a.percentual_conclusao >= 80)
        .length;
      const complianceScore = totalAssessments > 0 ? (complianceScores / totalAssessments) * 100 : 0;

      // Framework Distribution
      const frameworkCounts = assessmentStats.reduce((acc, assessment) => {
        const frameworkName = assessment.framework?.nome || 'Unknown';
        if (!acc[frameworkName]) {
          acc[frameworkName] = { count: 0, totalScore: 0, assessments: 0 };
        }
        acc[frameworkName].count++;
        if (assessment.score_maturidade) {
          acc[frameworkName].totalScore += assessment.score_maturidade;
          acc[frameworkName].assessments++;
        }
        return acc;
      }, {} as Record<string, { count: number; totalScore: number; assessments: number }>);

      const frameworkDistribution = Object.entries(frameworkCounts).map(([framework, data]) => ({
        framework,
        count: data.count,
        percentage: totalAssessments > 0 ? (data.count / totalAssessments) * 100 : 0,
        averageScore: data.assessments > 0 ? data.totalScore / data.assessments : 0
      }));

      // Status Distribution
      const statusCounts = assessmentStats.reduce((acc, assessment) => {
        acc[assessment.status] = (acc[assessment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalAssessments > 0 ? (count / totalAssessments) * 100 : 0
      }));

      // Timeline Analysis
      const now = new Date();
      const dueSoonThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const dueSoon = assessmentStats.filter(a => 
        a.data_fim_planejada && 
        new Date(a.data_fim_planejada) <= dueSoonThreshold && 
        new Date(a.data_fim_planejada) > now &&
        a.status !== 'concluido'
      ).length;

      const overdueCount = assessmentStats.filter(a => 
        a.data_fim_planejada && 
        new Date(a.data_fim_planejada) < now &&
        a.status !== 'concluido'
      ).length;

      const onTimeCompleted = assessmentStats.filter(a => 
        a.status === 'concluido' &&
        a.data_fim &&
        a.data_fim_planejada &&
        new Date(a.data_fim) <= new Date(a.data_fim_planejada)
      ).length;

      const onTimeCompletion = completedAssessments > 0 ? (onTimeCompleted / completedAssessments) * 100 : 0;

      return {
        totalAssessments,
        completionRate,
        averageMaturity,
        complianceScore,
        dueSoon,
        overdueCount,
        onTimeCompletion,
        frameworkDistribution,
        statusDistribution
      };
    },
    enabled: !!tenantId,
    staleTime: refreshInterval,
    refetchInterval: refreshInterval
  });

  // Action Items Metrics
  const {
    data: actionMetrics,
    isLoading: isActionLoading
  } = useQuery({
    queryKey: ['advanced-assessment-metrics', 'actions', tenantId, filters],
    queryFn: async () => {
      if (!tenantId) return {};

      // Fetch action plans and items
      const { data: actionPlans } = await supabase
        .from('assessment_action_plans')
        .select(`
          id,
          status,
          data_conclusao_planejada,
          data_conclusao_real,
          assessment_action_items!inner(
            id,
            status,
            prioridade
          )
        `)
        .eq('tenant_id', tenantId);

      if (!actionPlans) return {};

      const allActionItems = actionPlans.flatMap(plan => plan.assessment_action_items || []);
      
      const pendingActions = allActionItems.filter(item => 
        item.status === 'planejado' || item.status === 'em_andamento'
      ).length;
      
      const completedActions = allActionItems.filter(item => 
        item.status === 'implementado'
      ).length;

      const criticalFindings = allActionItems.filter(item => 
        item.prioridade === 'critica'
      ).length;

      const highRiskFindings = allActionItems.filter(item => 
        item.prioridade === 'alta'
      ).length;

      const mediumRiskFindings = allActionItems.filter(item => 
        item.prioridade === 'media'
      ).length;

      const lowRiskFindings = allActionItems.filter(item => 
        item.prioridade === 'baixa'
      ).length;

      return {
        pendingActions,
        completedActions,
        criticalFindings,
        highRiskFindings,
        mediumRiskFindings,
        lowRiskFindings
      };
    },
    enabled: !!tenantId,
    staleTime: refreshInterval
  });

  // Historical Trends (if requested)
  const {
    data: historicalTrends,
    isLoading: isHistoricalLoading
  } = useQuery({
    queryKey: ['advanced-assessment-metrics', 'historical', tenantId, filters],
    queryFn: async () => {
      if (!tenantId || !includeHistorical) return { maturityTrends: [] };

      // Get last 12 months of data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      const { data: historicalData } = await supabase
        .from('assessments')
        .select(`
          created_at,
          data_conclusao:data_fim,
          score_maturidade,
          percentual_conclusao,
          status
        `)
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (!historicalData) return { maturityTrends: [] };

      // Group by month
      const monthlyData = historicalData.reduce((acc, assessment) => {
        const month = new Date(assessment.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!acc[month]) {
          acc[month] = {
            assessments: [],
            completed: 0,
            totalScore: 0,
            scoreCount: 0
          };
        }
        
        acc[month].assessments.push(assessment);
        
        if (assessment.status === 'concluido') {
          acc[month].completed++;
        }
        
        if (assessment.score_maturidade) {
          acc[month].totalScore += assessment.score_maturidade;
          acc[month].scoreCount++;
        }
        
        return acc;
      }, {} as Record<string, any>);

      const maturityTrends = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        averageScore: data.scoreCount > 0 ? data.totalScore / data.scoreCount : 0,
        completedAssessments: data.completed,
        complianceRate: data.assessments.length > 0 ? (data.completed / data.assessments.length) * 100 : 0
      }));

      return { maturityTrends };
    },
    enabled: !!tenantId && includeHistorical,
    staleTime: refreshInterval * 2 // Cache longer for historical data
  });

  // Benchmarks (if requested)
  const {
    data: benchmarkData,
    isLoading: isBenchmarkLoading
  } = useQuery({
    queryKey: ['advanced-assessment-metrics', 'benchmarks', tenantId],
    queryFn: async () => {
      if (!tenantId || !includeBenchmarks) return { benchmarks: {} };

      // Mock benchmark data - in real implementation, this would come from industry data
      const benchmarks = {
        industryAverage: 3.2,
        bestPractice: 4.5,
        previousPeriod: coreMetrics?.averageMaturity || 0,
        target: 4.0
      };

      return { benchmarks };
    },
    enabled: !!tenantId && includeBenchmarks && !!coreMetrics,
    staleTime: refreshInterval * 4 // Cache much longer for benchmark data
  });

  // Performance Indicators Calculation
  const performanceIndicators = useMemo(() => {
    if (!coreMetrics || !historicalTrends) {
      return {
        monthlyGrowth: 0,
        qualityScore: 0,
        efficiencyIndex: 0,
        riskReduction: 0
      };
    }

    const trends = historicalTrends.maturityTrends || [];
    const recent = trends.slice(-2);
    
    const monthlyGrowth = recent.length >= 2 
      ? ((recent[1].averageScore - recent[0].averageScore) / recent[0].averageScore) * 100
      : 0;

    const qualityScore = (coreMetrics.averageMaturity / 5) * 100;
    const efficiencyIndex = coreMetrics.onTimeCompletion || 0;
    const riskReduction = actionMetrics?.completedActions && actionMetrics?.criticalFindings
      ? (actionMetrics.completedActions / (actionMetrics.completedActions + actionMetrics.criticalFindings)) * 100
      : 0;

    return {
      monthlyGrowth,
      qualityScore,
      efficiencyIndex,
      riskReduction
    };
  }, [coreMetrics, historicalTrends, actionMetrics]);

  // Resource Metrics Calculation
  const resourceMetrics = useMemo(() => {
    if (!coreMetrics) {
      return {
        assessorsUtilization: 0,
        averageAssessmentDuration: 0,
        capacityUtilization: 0,
        workloadDistribution: []
      };
    }

    // Mock calculations - would be real in production
    return {
      assessorsUtilization: 75,
      averageAssessmentDuration: 14, // days
      capacityUtilization: 82,
      workloadDistribution: []
    };
  }, [coreMetrics]);

  // Combine all metrics
  const combinedMetrics: AdvancedAssessmentMetrics | null = useMemo(() => {
    if (!coreMetrics) return null;

    return {
      ...coreMetrics,
      ...actionMetrics,
      maturityTrends: historicalTrends?.maturityTrends || [],
      performanceIndicators,
      benchmarks: benchmarkData?.benchmarks || {
        industryAverage: 0,
        bestPractice: 0,
        previousPeriod: 0,
        target: 0
      },
      resourceMetrics,
      riskHeatMap: [], // Would be calculated based on findings
      criticalFindings: actionMetrics?.criticalFindings || 0,
      highRiskFindings: actionMetrics?.highRiskFindings || 0,
      mediumRiskFindings: actionMetrics?.mediumRiskFindings || 0,
      lowRiskFindings: actionMetrics?.lowRiskFindings || 0,
      pendingActions: actionMetrics?.pendingActions || 0,
      completedActions: actionMetrics?.completedActions || 0,
      overdueActions: 0, // Would be calculated
      averageCompletionTime: 0 // Would be calculated
    } as AdvancedAssessmentMetrics;
  }, [coreMetrics, actionMetrics, historicalTrends, performanceIndicators, benchmarkData, resourceMetrics]);

  // Loading states
  const isLoading = isCoreLoading || isActionLoading || isHistoricalLoading || isBenchmarkLoading;

  // Refresh function
  const refresh = useCallback(async () => {
    await Promise.all([
      refetchCore(),
      // Add other refetch functions as needed
    ]);
  }, [refetchCore]);

  return {
    metrics: combinedMetrics,
    isLoading,
    error: coreError,
    refresh,
    
    // Individual metric sections for granular access
    coreMetrics,
    actionMetrics,
    historicalTrends: historicalTrends?.maturityTrends || [],
    benchmarks: benchmarkData?.benchmarks,
    performanceIndicators,
    resourceMetrics
  };
};

// Export utilities for metric calculations
export const calculateMaturityGrade = (score: number): string => {
  if (score >= 4.5) return 'A+';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B+';
  if (score >= 3.0) return 'B';
  if (score >= 2.5) return 'C+';
  if (score >= 2.0) return 'C';
  if (score >= 1.5) return 'D';
  return 'F';
};

export const getMetricTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 2) return 'stable';
  return change > 0 ? 'up' : 'down';
};

export const formatMetricValue = (value: number, type: 'percentage' | 'decimal' | 'count' | 'currency' = 'count'): string => {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    case 'count':
    default:
      return value.toLocaleString();
  }
};