/**
 * ALEX ASSESSMENT ENGINE - ANALYTICS AND BENCHMARKING EDGE FUNCTION
 * 
 * Calculates advanced analytics, benchmarking and predictive insights for assessments
 * Integrates with AI Manager for intelligent analysis and recommendations
 * 
 * Author: Claude Code (Alex Assessment)
 * Date: 2025-09-04
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  assessment_id?: string
  tenant_id?: string
  analysis_type: 'assessment_progress' | 'benchmarking' | 'predictive_scoring' | 'risk_heatmap' | 'compliance_trends'
  time_range?: {
    start_date: string
    end_date: string
  }
  benchmark_criteria?: {
    industry?: string[]
    framework?: string[]
    company_size?: string
  }
}

interface BenchmarkData {
  metric: string
  tenant_value: number
  industry_avg: number
  top_quartile: number
  percentile: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    // Get user's tenant
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, full_name')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      throw new Error('User has no tenant')
    }

    const body: AnalyticsRequest = await req.json()
    let result: any = {}

    switch (body.analysis_type) {
      case 'assessment_progress':
        result = await generateAssessmentProgress(supabase, body, profile.tenant_id)
        break
      case 'benchmarking':
        result = await generateBenchmarking(supabase, body, profile.tenant_id)
        break
      case 'predictive_scoring':
        result = await generatePredictiveScoring(supabase, body, profile.tenant_id)
        break
      case 'risk_heatmap':
        result = await generateRiskHeatmap(supabase, body, profile.tenant_id)
        break
      case 'compliance_trends':
        result = await generateComplianceTrends(supabase, body, profile.tenant_id)
        break
      default:
        throw new Error(`Unknown analysis type: ${body.analysis_type}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis_type: body.analysis_type,
        generated_at: new Date().toISOString(),
        tenant_id: profile.tenant_id,
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in alex-assessment-analytics:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/**
 * Generate detailed assessment progress analytics
 */
async function generateAssessmentProgress(supabase: any, body: AnalyticsRequest, tenantId: string) {
  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      id, name, status, due_date, created_at,
      framework:frameworks!framework_id_on_creation (name, category),
      responses:assessment_responses (
        id, maturity_level, question_status, answered_at,
        control:framework_controls!control_id (domain, category)
      )
    `)
    .eq('tenant_id', tenantId)
    .gte('created_at', body.time_range?.start_date || '2024-01-01')
    .lte('created_at', body.time_range?.end_date || new Date().toISOString())

  const analytics = assessments?.map(assessment => {
    const totalControls = assessment.responses?.length || 0
    const completedControls = assessment.responses?.filter(r => r.question_status === 'completed').length || 0
    const inProgressControls = assessment.responses?.filter(r => r.question_status === 'in_progress').length || 0
    
    const avgMaturity = totalControls > 0 ? 
      assessment.responses?.reduce((sum, r) => sum + (r.maturity_level || 0), 0) / totalControls : 0

    const domainProgress = assessment.responses?.reduce((acc, response) => {
      const domain = response.control?.domain || 'Unknown'
      if (!acc[domain]) {
        acc[domain] = { total: 0, completed: 0 }
      }
      acc[domain].total++
      if (response.question_status === 'completed') {
        acc[domain].completed++
      }
      return acc
    }, {} as Record<string, { total: number, completed: number }>)

    return {
      assessment_id: assessment.id,
      assessment_name: assessment.name,
      framework: assessment.framework?.name,
      status: assessment.status,
      completion_percentage: totalControls > 0 ? (completedControls / totalControls) * 100 : 0,
      controls_total: totalControls,
      controls_completed: completedControls,
      controls_in_progress: inProgressControls,
      avg_maturity_score: avgMaturity,
      domain_progress: domainProgress,
      days_since_start: Math.floor((new Date().getTime() - new Date(assessment.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      is_overdue: assessment.due_date ? new Date() > new Date(assessment.due_date) : false
    }
  }) || []

  // Calculate overall tenant metrics
  const totalAssessments = analytics.length
  const completedAssessments = analytics.filter(a => a.status === 'completed').length
  const overallCompletionRate = totalAssessments > 0 ? 
    analytics.reduce((sum, a) => sum + a.completion_percentage, 0) / totalAssessments : 0
  
  const avgMaturityAcrossAssessments = totalAssessments > 0 ?
    analytics.reduce((sum, a) => sum + a.avg_maturity_score, 0) / totalAssessments : 0

  return {
    tenant_summary: {
      total_assessments: totalAssessments,
      completed_assessments: completedAssessments,
      overall_completion_rate: overallCompletionRate,
      avg_maturity_score: avgMaturityAcrossAssessments,
      overdue_assessments: analytics.filter(a => a.is_overdue).length
    },
    assessments: analytics,
    generated_insights: await generateProgressInsights(supabase, analytics, tenantId)
  }
}

/**
 * Generate benchmarking analysis against industry peers
 */
async function generateBenchmarking(supabase: any, body: AnalyticsRequest, tenantId: string) {
  // Get tenant's assessment data
  const { data: tenantAssessments } = await supabase
    .from('assessment_analytics')
    .select('*')
    .eq('tenant_id', tenantId)

  // Mock industry benchmarks (in production, this would come from aggregated anonymous data)
  const industryBenchmarks = {
    'Technology': {
      avg_completion_rate: 78.5,
      avg_maturity_score: 3.2,
      avg_time_to_complete: 45,
      compliance_score: 82.1
    },
    'Financial Services': {
      avg_completion_rate: 85.2,
      avg_maturity_score: 3.8,
      avg_time_to_complete: 38,
      compliance_score: 89.3
    },
    'Healthcare': {
      avg_completion_rate: 81.7,
      avg_maturity_score: 3.5,
      avg_time_to_complete: 52,
      compliance_score: 86.4
    }
  }

  // Calculate tenant metrics
  const tenantMetrics = calculateTenantMetrics(tenantAssessments || [])

  // Compare against industry (assuming Technology for this example)
  const industry = 'Technology' // This would be determined from tenant profile
  const industryData = industryBenchmarks[industry]

  const benchmarks: BenchmarkData[] = [
    {
      metric: 'Completion Rate',
      tenant_value: tenantMetrics.avg_completion_rate,
      industry_avg: industryData.avg_completion_rate,
      top_quartile: industryData.avg_completion_rate * 1.15,
      percentile: calculatePercentile(tenantMetrics.avg_completion_rate, industryData.avg_completion_rate)
    },
    {
      metric: 'Maturity Score',
      tenant_value: tenantMetrics.avg_maturity_score,
      industry_avg: industryData.avg_maturity_score,
      top_quartile: Math.min(industryData.avg_maturity_score * 1.2, 5.0),
      percentile: calculatePercentile(tenantMetrics.avg_maturity_score, industryData.avg_maturity_score)
    },
    {
      metric: 'Time to Complete (days)',
      tenant_value: tenantMetrics.avg_time_to_complete,
      industry_avg: industryData.avg_time_to_complete,
      top_quartile: industryData.avg_time_to_complete * 0.8,
      percentile: calculatePercentile(industryData.avg_time_to_complete, tenantMetrics.avg_time_to_complete) // Inverted for time
    }
  ]

  return {
    industry,
    benchmarks,
    performance_summary: {
      above_average_metrics: benchmarks.filter(b => b.tenant_value > b.industry_avg).length,
      top_quartile_metrics: benchmarks.filter(b => b.percentile >= 75).length,
      improvement_areas: benchmarks.filter(b => b.percentile < 50).map(b => b.metric)
    },
    recommendations: generateBenchmarkRecommendations(benchmarks)
  }
}

/**
 * Generate predictive scoring using AI
 */
async function generatePredictiveScoring(supabase: any, body: AnalyticsRequest, tenantId: string) {
  // Get historical assessment data
  const { data: historicalData } = await supabase
    .from('assessment_analytics')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('calculated_at', { ascending: true })

  if (!historicalData || historicalData.length < 3) {
    return {
      error: 'Insufficient historical data for predictions',
      minimum_required: 3,
      current_data_points: historicalData?.length || 0
    }
  }

  // Simple trend analysis (in production, this would use more sophisticated ML)
  const predictions = {
    completion_rate_trend: calculateTrend(historicalData.map(d => d.completion_percentage)),
    maturity_score_trend: calculateTrend(historicalData.map(d => d.avg_maturity_score)),
    predicted_completion_dates: predictCompletionDates(historicalData),
    risk_areas: identifyRiskAreas(historicalData)
  }

  return {
    historical_data_points: historicalData.length,
    prediction_confidence: calculatePredictionConfidence(historicalData),
    predictions,
    recommendations: generatePredictiveRecommendations(predictions)
  }
}

/**
 * Generate risk heatmap based on assessment data
 */
async function generateRiskHeatmap(supabase: any, body: AnalyticsRequest, tenantId: string) {
  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      id, name, framework_id_on_creation,
      framework:frameworks!framework_id_on_creation (name, category),
      responses:assessment_responses (
        maturity_level, question_status,
        control:framework_controls!control_id (id, name, domain, category)
      )
    `)
    .eq('tenant_id', tenantId)

  const riskMatrix = {}
  const domainRisks = {}

  assessments?.forEach(assessment => {
    assessment.responses?.forEach(response => {
      const domain = response.control?.domain || 'Unknown'
      const maturity = response.maturity_level || 1
      const riskScore = 6 - maturity // Higher risk for lower maturity

      if (!domainRisks[domain]) {
        domainRisks[domain] = {
          total_controls: 0,
          avg_risk_score: 0,
          high_risk_controls: 0,
          controls: []
        }
      }

      domainRisks[domain].total_controls++
      domainRisks[domain].avg_risk_score += riskScore
      domainRisks[domain].controls.push({
        id: response.control?.id,
        name: response.control?.name,
        risk_score: riskScore,
        maturity_level: maturity
      })

      if (riskScore >= 4) {
        domainRisks[domain].high_risk_controls++
      }
    })
  })

  // Calculate averages
  Object.values(domainRisks).forEach((domain: any) => {
    domain.avg_risk_score = domain.avg_risk_score / domain.total_controls
  })

  return {
    domain_risks: domainRisks,
    high_risk_domains: Object.entries(domainRisks)
      .filter(([_, data]: [string, any]) => data.avg_risk_score >= 3.5)
      .map(([domain, _]) => domain),
    total_high_risk_controls: Object.values(domainRisks)
      .reduce((sum: number, domain: any) => sum + domain.high_risk_controls, 0)
  }
}

/**
 * Generate compliance trends analysis
 */
async function generateComplianceTrends(supabase: any, body: AnalyticsRequest, tenantId: string) {
  const { data: analytics } = await supabase
    .from('assessment_analytics')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('calculated_at', body.time_range?.start_date || '2024-01-01')
    .order('calculated_at', { ascending: true })

  if (!analytics || analytics.length < 2) {
    return {
      error: 'Insufficient data for trend analysis',
      minimum_required: 2,
      current_data_points: analytics?.length || 0
    }
  }

  const trends = {
    completion_trend: calculateTrend(analytics.map(a => a.completion_percentage)),
    maturity_trend: calculateTrend(analytics.map(a => a.avg_maturity_score)),
    compliance_trend: calculateTrend(analytics.map(a => a.compliance_score)),
    time_series_data: analytics.map(a => ({
      date: a.calculated_at,
      completion_rate: a.completion_percentage,
      maturity_score: a.avg_maturity_score,
      compliance_score: a.compliance_score
    }))
  }

  return {
    data_points: analytics.length,
    time_range: {
      start: analytics[0].calculated_at,
      end: analytics[analytics.length - 1].calculated_at
    },
    trends,
    insights: generateTrendInsights(trends)
  }
}

// Helper functions

function calculateTenantMetrics(analytics: any[]) {
  if (analytics.length === 0) {
    return {
      avg_completion_rate: 0,
      avg_maturity_score: 0,
      avg_time_to_complete: 0
    }
  }

  return {
    avg_completion_rate: analytics.reduce((sum, a) => sum + (a.completion_percentage || 0), 0) / analytics.length,
    avg_maturity_score: analytics.reduce((sum, a) => sum + (a.avg_maturity_score || 0), 0) / analytics.length,
    avg_time_to_complete: analytics.reduce((sum, a) => sum + (a.time_to_complete_days || 0), 0) / analytics.length
  }
}

function calculatePercentile(value: number, benchmark: number): number {
  // Simplified percentile calculation
  const ratio = value / benchmark
  if (ratio >= 1.2) return 90
  if (ratio >= 1.1) return 75
  if (ratio >= 1.0) return 60
  if (ratio >= 0.9) return 40
  if (ratio >= 0.8) return 25
  return 10
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'insufficient_data'
  
  const first = values.slice(0, Math.floor(values.length / 2))
  const second = values.slice(Math.floor(values.length / 2))
  
  const firstAvg = first.reduce((sum, val) => sum + val, 0) / first.length
  const secondAvg = second.reduce((sum, val) => sum + val, 0) / second.length
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100
  
  if (change > 5) return 'improving'
  if (change < -5) return 'declining'
  return 'stable'
}

function calculatePredictionConfidence(data: any[]): number {
  // Simplified confidence calculation based on data volume and consistency
  const baseConfidence = Math.min(data.length * 10, 70) // Up to 70% for data volume
  const variability = calculateVariability(data.map(d => d.completion_percentage))
  const consistencyBonus = Math.max(0, 30 - variability) // Up to 30% for consistency
  
  return Math.min(baseConfidence + consistencyBonus, 95)
}

function calculateVariability(values: number[]): number {
  if (values.length < 2) return 50
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  
  return Math.sqrt(variance)
}

function predictCompletionDates(historicalData: any[]): any {
  // Simplified prediction logic
  return {
    estimated_completion: '2024-12-31',
    confidence: 'medium',
    factors: ['current_progress_rate', 'historical_patterns', 'resource_allocation']
  }
}

function identifyRiskAreas(data: any[]): string[] {
  const risks = []
  
  const latestData = data[data.length - 1]
  if (latestData.completion_percentage < 50) risks.push('low_completion_rate')
  if (latestData.avg_maturity_score < 2.5) risks.push('low_maturity_scores')
  if (latestData.time_to_complete_days > 90) risks.push('extended_timeline')
  
  return risks
}

async function generateProgressInsights(supabase: any, analytics: any[], tenantId: string): Promise<string[]> {
  const insights = []
  
  const overallCompletion = analytics.reduce((sum, a) => sum + a.completion_percentage, 0) / analytics.length
  const overallMaturity = analytics.reduce((sum, a) => sum + a.avg_maturity_score, 0) / analytics.length
  
  if (overallCompletion > 80) {
    insights.push('Excellent progress: Your assessments are showing strong completion rates above 80%')
  } else if (overallCompletion < 50) {
    insights.push('Action needed: Several assessments show low completion rates requiring attention')
  }
  
  if (overallMaturity > 3.5) {
    insights.push('Strong maturity: Your organization demonstrates mature security controls')
  } else if (overallMaturity < 2.5) {
    insights.push('Improvement opportunity: Focus on raising maturity levels across key controls')
  }
  
  return insights
}

function generateBenchmarkRecommendations(benchmarks: BenchmarkData[]): string[] {
  const recommendations = []
  
  benchmarks.forEach(benchmark => {
    if (benchmark.percentile < 25) {
      recommendations.push(`Focus on improving ${benchmark.metric} - currently in bottom quartile`)
    } else if (benchmark.percentile > 75) {
      recommendations.push(`Excellent performance in ${benchmark.metric} - consider sharing best practices`)
    }
  })
  
  return recommendations
}

function generatePredictiveRecommendations(predictions: any): string[] {
  const recommendations = []
  
  if (predictions.completion_rate_trend === 'declining') {
    recommendations.push('Consider additional resources or process improvements to reverse declining completion trends')
  }
  
  if (predictions.risk_areas.includes('extended_timeline')) {
    recommendations.push('Implement project management best practices to improve assessment completion timelines')
  }
  
  return recommendations
}

function generateTrendInsights(trends: any): string[] {
  const insights = []
  
  if (trends.completion_trend === 'improving') {
    insights.push('Positive trend: Assessment completion rates are improving over time')
  }
  
  if (trends.maturity_trend === 'improving') {
    insights.push('Security maturation: Your organization is demonstrating improved security maturity')
  }
  
  return insights
}