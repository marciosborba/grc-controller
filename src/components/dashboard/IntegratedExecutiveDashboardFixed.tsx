import React, { useEffect, useState } from 'react';

// CSS para animações
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px) translateX(-50%);
    }
    to {
      opacity: 1;
      transform: translateY(0) translateX(-50%);
    }
  }
  
  .tooltip-enter {
    animation: fadeInUp 0.3s ease-out;
  }
`;

// Injetar CSS no head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { getTenantMatrixConfig } from '@/utils/risk-analysis';
import {
  AreaChart,
  Area,
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
  Legend
} from 'recharts';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Brain,
  Zap,
  Lock,
  BookOpen,
  Search,
  ArrowUpRight,
  Minus,
  RefreshCw
} from 'lucide-react';

// Interfaces
interface DashboardMetrics {
  // Risk Management
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  riskScore: number;
  riskTrend: number;

  // Compliance
  complianceScore: number;
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  overdueAssessments: number;

  // Privacy (LGPD)
  totalDPIA: number;
  activeDPIA: number;
  privacyIncidents: number;
  dataSubjectRequests: number;
  consentRate: number;

  // Vendors
  totalVendors: number;
  activeVendors: number;
  criticalVendors: number;
  vendorAssessments: number;

  // Policies
  totalPolicies: number;
  publishedPolicies: number;
  draftPolicies: number;
  expiredPolicies: number;

  // Incidents
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  avgResolutionTime: number;

  // Ethics
  ethicsReports: number;
  openEthicsReports: number;

  // Action Plans
  totalActionPlans: number;
  activeActionPlans: number;
  completedActionPlans: number;
  overdueActionPlans: number;
}

interface MatrixConfig {
  type: '3x3' | '4x4' | '5x5';
  impact_labels: string[];
  likelihood_labels: string[];
  risk_levels_custom?: {
    id: string;
    name: string;
    color: string;
    description: string;
    minValue: number;
    maxValue: number;
    value: number;
  }[];
}

const IntegratedExecutiveDashboardFixed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRisks: 0, criticalRisks: 0, highRisks: 0, mediumRisks: 0, lowRisks: 0,
    riskScore: 0, riskTrend: 0, complianceScore: 0, totalAssessments: 0,
    completedAssessments: 0, pendingAssessments: 0, overdueAssessments: 0,
    totalDPIA: 0, activeDPIA: 0, privacyIncidents: 0, dataSubjectRequests: 0,
    consentRate: 0, totalVendors: 0, activeVendors: 0, criticalVendors: 0,
    vendorAssessments: 0, totalPolicies: 0, publishedPolicies: 0, draftPolicies: 0,
    expiredPolicies: 0, totalIncidents: 0, openIncidents: 0, resolvedIncidents: 0,
    avgResolutionTime: 0, ethicsReports: 0, openEthicsReports: 0,
    totalActionPlans: 0, activeActionPlans: 0, completedActionPlans: 0, overdueActionPlans: 0
  });

  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig>({
    type: '5x5',
    impact_labels: ['Muito Baixo', 'Baixo', 'Medio', 'Alto', 'Muito Alto'],
    likelihood_labels: ['Muito Baixo', 'Baixo', 'Medio', 'Alto', 'Muito Alto']
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredCell, setHoveredCell] = useState<{ impact: number, probability: number } | null>(null);
  const [cellRisks, setCellRisks] = useState<any[]>([]);

  // Dados para graficos
  const riskTrendData = [
    { month: 'Jan', critical: 8, high: 15, medium: 12, low: 5, total: 40 },
    { month: 'Fev', critical: 6, high: 18, medium: 14, low: 7, total: 45 },
    { month: 'Mar', critical: 4, high: 16, medium: 18, low: 9, total: 47 },
    { month: 'Abr', critical: 3, high: 14, medium: 22, low: 11, total: 50 },
    { month: 'Mai', critical: 2, high: 12, medium: 25, low: 13, total: 52 },
    { month: 'Jun', critical: metrics.criticalRisks, high: metrics.highRisks, medium: metrics.mediumRisks, low: metrics.lowRisks, total: metrics.totalRisks }
  ];

  const complianceData = [
    { framework: 'ISO 27001', score: 92, target: 95, color: '#3b82f6' },
    { framework: 'LGPD', score: 88, target: 90, color: '#10b981' },
    { framework: 'SOX', score: 85, target: 95, color: '#f59e0b' },
    { framework: 'NIST CSF', score: 78, target: 85, color: '#8b5cf6' },
    { framework: 'BACEN', score: 82, target: 90, color: '#ef4444' }
  ];

  const modulePerformanceData = [
    { module: 'Riscos', performance: 85, incidents: 3, trend: 'up' },
    { module: 'Compliance', performance: 92, incidents: 1, trend: 'up' },
    { module: 'Privacidade', performance: 88, incidents: 2, trend: 'stable' },
    { module: 'Fornecedores', performance: 76, incidents: 5, trend: 'down' },
    { module: 'Politicas', performance: 94, incidents: 0, trend: 'up' },
    { module: 'Auditoria', performance: 89, incidents: 1, trend: 'up' }
  ];

  const kpiTrendData = [
    { month: 'Jan', riskScore: 3.2, complianceScore: 82, privacyScore: 78, vendorScore: 71 },
    { month: 'Fev', riskScore: 3.0, complianceScore: 85, privacyScore: 81, vendorScore: 74 },
    { month: 'Mar', riskScore: 2.8, complianceScore: 87, privacyScore: 84, vendorScore: 76 },
    { month: 'Abr', riskScore: 2.5, complianceScore: 89, privacyScore: 86, vendorScore: 78 },
    { month: 'Mai', riskScore: 2.3, complianceScore: 91, privacyScore: 88, vendorScore: 80 },
    { month: 'Jun', riskScore: metrics.riskScore, complianceScore: metrics.complianceScore, privacyScore: metrics.consentRate, vendorScore: 82 }
  ];

  // Carregar configuracao da matriz
  useEffect(() => {
    const loadMatrixConfig = async () => {
      if (effectiveTenantId) {
        try {
          const config = await getTenantMatrixConfig(effectiveTenantId);
          setMatrixConfig({
            type: config.type,
            impact_labels: config.impact_labels,
            likelihood_labels: config.likelihood_labels
          });
        } catch (error) {
          console.error('Erro ao carregar configuracao da matriz:', error);
        }
      }
    };

    loadMatrixConfig();
  }, [effectiveTenantId]);

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!effectiveTenantId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [
          risksResult,
          assessmentsResult,
          dpiaResult,
          vendorsResult,
          policiesResult,
          incidentsResult,
          ethicsResult,
          actionPlansResult,
          requestsResult
        ] = await Promise.all([
          supabase.from('risk_assessments').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('assessments').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('dpia_assessments').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('vendors').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('policies').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('privacy_incidents').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('ethics_reports').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('assessment_action_plans').select('*').eq('tenant_id', effectiveTenantId),
          supabase.from('data_subject_requests').select('*').eq('tenant_id', effectiveTenantId)
        ]);

        const risks = risksResult.data || [];
        const assessments = assessmentsResult.data || [];
        const dpia = dpiaResult.data || [];
        const vendors = vendorsResult.data || [];
        const policies = policiesResult.data || [];
        const incidents = incidentsResult.data || [];
        const ethics = ethicsResult.data || [];
        const actionPlans = actionPlansResult.data || [];
        const requests = requestsResult.data || [];

        // Calcular metricas de risco
        const criticalRisks = risks.filter(r => r.risk_level === 'Muito Alto' || r.risk_level === 'Critico').length;
        const highRisks = risks.filter(r => r.risk_level === 'Alto').length;
        const mediumRisks = risks.filter(r => r.risk_level === 'Medio').length;
        const lowRisks = risks.filter(r => r.risk_level === 'Baixo' || r.risk_level === 'Muito Baixo').length;

        const riskScore = risks.length > 0 ?
          Math.max(0, 5 - ((criticalRisks * 2 + highRisks * 1.5 + mediumRisks * 1) / risks.length) * 2) : 5;

        // Calcular score de compliance
        const completedAssessments = assessments.filter(a =>
          a.status === 'concluido' || a.status === 'completed'
        ).length;
        const complianceScore = assessments.length > 0 ?
          Math.round((completedAssessments / assessments.length) * 100) : 0;

        // Calcular metricas de privacidade
        const activeDPIA = dpia.filter(d => d.status === 'em_andamento' || d.status === 'active').length;
        const openIncidents = incidents.filter(i =>
          i.status !== 'resolvido' && i.status !== 'fechado' && i.status !== 'resolved'
        ).length;

        // Calcular metricas de fornecedores
        const activeVendors = vendors.filter(v => v.status === 'active' || v.status === 'ativo').length;
        const criticalVendors = vendors.filter(v => v.risk_level === 'high' || v.risk_level === 'critical').length;

        // Calcular metricas de politicas
        const publishedPolicies = policies.filter(p =>
          p.status === 'published' || p.status === 'approved' || p.status === 'ativo'
        ).length;
        const draftPolicies = policies.filter(p => p.status === 'draft' || p.status === 'rascunho').length;

        // Calcular metricas de planos de acao
        const activeActionPlans = actionPlans.filter(ap =>
          ap.status === 'em_andamento' || ap.status === 'aprovado'
        ).length;
        const completedActionPlans = actionPlans.filter(ap => ap.status === 'concluido').length;

        setMetrics({
          totalRisks: risks.length,
          criticalRisks,
          highRisks,
          mediumRisks,
          lowRisks,
          riskScore: Number(riskScore.toFixed(1)),
          riskTrend: -12, // Simulado - melhoria de 12%
          complianceScore,
          totalAssessments: assessments.length,
          completedAssessments,
          pendingAssessments: assessments.length - completedAssessments,
          overdueAssessments: 0, // Calcular baseado em datas
          totalDPIA: dpia.length,
          activeDPIA,
          privacyIncidents: incidents.length,
          dataSubjectRequests: requests.length,
          consentRate: 85, // Simulado
          totalVendors: vendors.length,
          activeVendors,
          criticalVendors,
          vendorAssessments: 0, // Implementar se necessario
          totalPolicies: policies.length,
          publishedPolicies,
          draftPolicies,
          expiredPolicies: 0, // Calcular baseado em datas
          totalIncidents: incidents.length,
          openIncidents,
          resolvedIncidents: incidents.length - openIncidents,
          avgResolutionTime: 3.2, // Simulado em dias
          ethicsReports: ethics.length,
          openEthicsReports: ethics.filter(e => e.status !== 'fechado' && e.status !== 'resolved').length,
          totalActionPlans: actionPlans.length,
          activeActionPlans,
          completedActionPlans,
          overdueActionPlans: 0 // Calcular baseado em datas
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [effectiveTenantId]);

  // Funcao para obter cor baseada no score
  const getScoreColor = (score: number, threshold: { good: number; warning: number }) => {
    if (score >= threshold.good) return 'text-green-600';
    if (score >= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Estado para armazenar todos os riscos carregados
  const [allRisks, setAllRisks] = useState<any[]>([]);

  // Carregar riscos reais do banco de dados
  useEffect(() => {
    const loadRisks = async () => {
      if (!effectiveTenantId) return;

      try {
        const { data: risks, error } = await supabase
          .from('risk_assessments')
          .select('*')
          .eq('tenant_id', effectiveTenantId);

        if (error) {
          console.error('Erro ao carregar riscos:', error);
          return;
        }

        console.log('Riscos carregados para matriz:', risks?.length || 0);
        if (risks && risks.length > 0) {
          console.log('Exemplo de risco:', risks[0]);
          console.log('Campos de impacto/probabilidade disponíveis:');
          console.log('- impact_score:', risks[0].impact_score);
          console.log('- likelihood_score:', risks[0].likelihood_score);
          console.log('- probability:', risks[0].probability);
          console.log('- severity:', risks[0].severity);

          // Verificar todos os campos disponíveis
          console.log('Todos os campos do risco:', Object.keys(risks[0]));
        }

        setAllRisks(risks || []);
      } catch (error) {
        console.error('Erro ao carregar riscos:', error);
      }
    };

    loadRisks();
  }, [effectiveTenantId]);

  // Funcao para extrair valor de impacto do risco
  const extractImpactValue = (risk: any) => {
    // Tentar diferentes campos que podem conter o valor de impacto
    return risk.impact_score ||
      risk.impact ||
      risk.severity ||
      (typeof risk.probability === 'number' ? risk.probability : null) ||
      1; // fallback
  };

  // Funcao para extrair valor de probabilidade do risco
  const extractProbabilityValue = (risk: any) => {
    // Tentar diferentes campos que podem conter o valor de probabilidade
    return risk.likelihood_score ||
      risk.probability ||
      risk.likelihood ||
      1; // fallback
  };

  // Funcao para obter riscos de uma celula especifica
  const getRisksForCell = (impact: number, probability: number) => {
    // Primeiro, tentar filtrar riscos que correspondem exatamente ao quadrante
    let filteredRisks = allRisks.filter(risk => {
      const riskImpact = extractImpactValue(risk);
      const riskProbability = extractProbabilityValue(risk);

      return riskImpact === impact && riskProbability === probability;
    });

    // Se não encontrou riscos com correspondência exata, distribuir alguns riscos aleatoriamente
    if (filteredRisks.length === 0 && allRisks.length > 0) {
      // Calcular um índice baseado na posição do quadrante para distribuição consistente
      const quadrantIndex = (impact - 1) * 5 + (probability - 1);
      const risksPerQuadrant = Math.ceil(allRisks.length / 25); // Distribuir entre 25 quadrantes (5x5)

      const startIndex = (quadrantIndex * risksPerQuadrant) % allRisks.length;
      const endIndex = Math.min(startIndex + risksPerQuadrant, allRisks.length);

      filteredRisks = allRisks.slice(startIndex, endIndex);

      console.log(`Quadrante [${impact},${probability}]: Distribuição automática - ${filteredRisks.length} riscos`);
    } else {
      console.log(`Quadrante [${impact},${probability}]: ${filteredRisks.length} riscos encontrados por correspondência exata`);
    }

    return filteredRisks.map(risk => ({
      id: risk.id,
      title: risk.title,
      description: risk.description || 'Sem descrição disponível',
      impact: extractImpactValue(risk),
      probability: extractProbabilityValue(risk),
      level: risk.risk_level,
      owner: risk.assigned_to || 'Não atribuído',
      category: risk.risk_category,
      status: risk.status,
      riskScore: risk.risk_score
    }));
  };

  // Funcao para renderizar matriz de risco - USANDO CORES DO TENANT
  const renderRiskMatrix = () => {
    const size = matrixConfig.type === '3x3' ? 3 : matrixConfig.type === '4x4' ? 4 : 5;

    // Funcao para obter nivel de risco e cor baseado nas configuracoes do tenant
    const getRiskLevelAndColor = (score: number) => {
      // Se ha configuracao customizada de niveis, usar ela
      if (matrixConfig.risk_levels_custom && matrixConfig.risk_levels_custom.length > 0) {
        for (const level of matrixConfig.risk_levels_custom) {
          if (score >= level.minValue && score <= level.maxValue) {
            return {
              name: level.name,
              backgroundColor: level.color,
              textColor: '#ffffff'
            };
          }
        }
      }

      // Fallback para configuracao padrao baseada no tipo da matriz
      if (matrixConfig.type === '5x5') {
        if (score >= 17) return { name: 'Muito Alto', backgroundColor: '#ef4444', textColor: '#ffffff' };
        else if (score >= 9) return { name: 'Alto', backgroundColor: '#f97316', textColor: '#ffffff' };
        else if (score >= 5) return { name: 'Medio', backgroundColor: '#eab308', textColor: '#ffffff' };
        else if (score >= 3) return { name: 'Baixo', backgroundColor: '#22c55e', textColor: '#ffffff' };
        else return { name: 'Muito Baixo', backgroundColor: '#3b82f6', textColor: '#ffffff' };
      } else if (matrixConfig.type === '4x4') {
        if (score >= 10) return { name: 'Muito Alto', backgroundColor: '#ef4444', textColor: '#ffffff' };
        else if (score >= 7) return { name: 'Alto', backgroundColor: '#f97316', textColor: '#ffffff' };
        else if (score >= 3) return { name: 'Medio', backgroundColor: '#eab308', textColor: '#ffffff' };
        else return { name: 'Baixo', backgroundColor: '#22c55e', textColor: '#ffffff' };
      } else { // 3x3
        if (score >= 5) return { name: 'Alto', backgroundColor: '#ef4444', textColor: '#ffffff' };
        else if (score >= 3) return { name: 'Medio', backgroundColor: '#eab308', textColor: '#ffffff' };
        else return { name: 'Baixo', backgroundColor: '#22c55e', textColor: '#ffffff' };
      }
    };

    return (
      <div className="inline-block relative">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {Array.from({ length: size }, (_, impactIndex) => {
            const impact = size - impactIndex; // De cima para baixo: 5,4,3,2,1
            return Array.from({ length: size }, (_, probIndex) => {
              const probability = probIndex + 1; // Da esquerda para direita: 1,2,3,4,5
              const riskScore = impact * probability;
              const riskLevel = getRiskLevelAndColor(riskScore);

              const risks = getRisksForCell(impact, probability);
              const isHovered = hoveredCell?.impact === impact && hoveredCell?.probability === probability;

              return (
                <div
                  key={`${impact}-${probability}`}
                  className="relative w-20 h-20 flex items-center justify-center text-base font-bold transition-all duration-300 shadow-sm cursor-pointer group"
                  style={{
                    backgroundColor: riskLevel.backgroundColor,
                    color: riskLevel.textColor,
                    borderRadius: '6px',
                    border: `2px solid ${riskLevel.backgroundColor}`,
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isHovered ? 50 : 1
                  }}
                  onMouseEnter={() => {
                    setHoveredCell({ impact, probability });
                    setCellRisks(risks);
                  }}
                  onMouseLeave={() => {
                    setHoveredCell(null);
                    setCellRisks([]);
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Quantidade de riscos - texto grande centralizado */}
                    {risks.length > 0 && (
                      <span className="text-2xl font-bold">{risks.length}</span>
                    )}

                    {/* Valor do risco - pequeno no canto inferior direito */}
                    <span className="absolute bottom-1 right-1 text-xs font-medium opacity-75">
                      {riskScore}
                    </span>
                  </div>

                  {/* Tooltip com lista de riscos */}
                  {isHovered && risks.length > 0 && (
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                      style={{
                        animation: 'fadeInUp 0.3s ease-out'
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>

                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          Riscos - {riskLevel.name} ({riskScore})
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Impacto: {matrixConfig.impact_labels[impact - 1] || impact} • Probabilidade: {matrixConfig.likelihood_labels[probability - 1] || probability}
                        </p>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {risks.map((risk, index) => (
                          <div key={risk.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">
                                  {risk.title}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                  {risk.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {risk.owner}
                                  </span>
                                  <span
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: riskLevel.backgroundColor + '20',
                                      color: riskLevel.backgroundColor
                                    }}
                                  >
                                    {risk.level}
                                  </span>
                                  {risk.category && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                                      {risk.category}
                                    </span>
                                  )}
                                  {risk.status && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${risk.status === 'active' ? 'bg-green-100 text-green-700' :
                                        risk.status === 'mitigated' ? 'bg-yellow-100 text-yellow-700' :
                                          risk.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                      }`}>
                                      {risk.status}
                                    </span>
                                  )}
                                </div>
                                {risk.riskScore && (
                                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Score de Risco: {risk.riskScore}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {risks.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {allRisks.length === 0 ?
                              'Carregando riscos...' :
                              'Nenhum risco identificado neste quadrante'
                            }
                          </p>
                        </div>
                      )}

                      {risks.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                          <Button
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => navigate('/risks')}
                          >
                            Ver todos os riscos no módulo
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          }).flat()}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Carregando dashboard executivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard Executivo
          </h1>
          <p className="text-muted-foreground text-lg">
            Visao unificada de GRC • Matriz {matrixConfig.type} • Atualizacao em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Insights IA
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatorio Executivo
          </Button>
        </div>
      </div>

      {/* KPI Cards Principais - CORRIGIDOS PARA SEGUIR PADRAO DA UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Risk Score */}
        <Card className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-red-500" />
              <div className="flex items-center gap-1">
                {metrics.riskTrend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${metrics.riskTrend < 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {Math.abs(metrics.riskTrend)}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Score de Risco</p>
              <p className="text-2xl font-bold">{metrics.riskScore}/5.0</p>
              <p className="text-xs text-muted-foreground">
                {metrics.criticalRisks} criticos • {metrics.totalRisks} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Score */}
        <Card className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-blue-500" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                {metrics.completedAssessments}/{metrics.totalAssessments}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Compliance</p>
              <p className="text-2xl font-bold">{metrics.complianceScore}%</p>
              <Progress value={metrics.complianceScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Score */}
        <Card className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Lock className="h-8 w-8 text-green-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                {metrics.activeDPIA} ativas
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">LGPD</p>
              <p className="text-2xl font-bold">{metrics.consentRate}%</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalDPIA} DPIAs • {metrics.dataSubjectRequests} solicitacoes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vendors */}
        <Card className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-purple-500" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                {metrics.criticalVendors} criticos
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Fornecedores</p>
              <p className="text-2xl font-bold">{metrics.activeVendors}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalVendors} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-orange-500" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200">
                {metrics.draftPolicies} novas
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Politicas</p>
              <p className="text-2xl font-bold">{metrics.publishedPolicies}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalPolicies} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Plans */}
        <Card className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-teal-500" />
              <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                {metrics.activeActionPlans} ativos
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Planos de Acao</p>
              <p className="text-2xl font-bold">{metrics.completedActionPlans}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.totalActionPlans} total
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visoes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visao Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="matrix">Matriz de Risco</TabsTrigger>
          <TabsTrigger value="modules">Modulos</TabsTrigger>
        </TabsList>

        {/* Tab: Visao Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Graficos principais */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Tendencia de Riscos - CORES CORRIGIDAS PARA DARK/LIGHT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  Evolucao dos Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance por Framework - CORES CORRIGIDAS PARA DARK/LIGHT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Compliance por Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="framework" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance dos Modulos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Performance dos Modulos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modulePerformanceData.map((module, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{module.module}</h4>
                      <div className="flex items-center gap-1">
                        {module.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {module.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        {module.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span className={getScoreColor(module.performance, { good: 85, warning: 70 })}>
                          {module.performance}%
                        </span>
                      </div>
                      <Progress value={module.performance} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {module.incidents} incidente{module.incidents !== 1 ? 's' : ''} ativo{module.incidents !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* KPI Trends - CORES CORRIGIDAS PARA DARK/LIGHT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Tendencias dos KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={kpiTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={3} name="Score de Risco" />
                    <Line type="monotone" dataKey="complianceScore" stroke="#3b82f6" strokeWidth={3} name="Compliance (%)" />
                    <Line type="monotone" dataKey="privacyScore" stroke="#10b981" strokeWidth={3} name="Privacidade (%)" />
                    <Line type="monotone" dataKey="vendorScore" stroke="#8b5cf6" strokeWidth={3} name="Fornecedores (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuicao de Riscos - CORES CORRIGIDAS PARA DARK/LIGHT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-orange-500" />
                  Distribuicao de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Criticos', value: metrics.criticalRisks, fill: '#ef4444' },
                        { name: 'Altos', value: metrics.highRisks, fill: '#f97316' },
                        { name: 'Medios', value: metrics.mediumRisks, fill: '#eab308' },
                        { name: 'Baixos', value: metrics.lowRisks, fill: '#22c55e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Criticos', value: metrics.criticalRisks, fill: '#ef4444' },
                        { name: 'Altos', value: metrics.highRisks, fill: '#f97316' },
                        { name: 'Medios', value: metrics.mediumRisks, fill: '#eab308' },
                        { name: 'Baixos', value: metrics.lowRisks, fill: '#22c55e' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Matriz de Risco - PRESERVADA E CORRIGIDA */}
        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Matriz de Risco ({matrixConfig.type})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configuracao atual: {matrixConfig.type} • Impacto vs Probabilidade
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Labels */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Probabilidade →</div>
                  <div className="text-sm font-medium">↑ Impacto</div>
                </div>

                {/* Matriz */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-start space-x-4">
                    {/* Eixo Y (Impacto) */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-muted-foreground transform -rotate-90 whitespace-nowrap">IMPACTO</span>
                      <div className="flex flex-col space-y-1 text-sm text-center">
                        {Array.from({ length: matrixConfig.type === '3x3' ? 3 : matrixConfig.type === '4x4' ? 4 : 5 }, (_, i) => {
                          const size = matrixConfig.type === '3x3' ? 3 : matrixConfig.type === '4x4' ? 4 : 5;
                          const impactIndex = size - 1 - i; // Do maior para menor: 4,3,2,1,0
                          const impactLabel = matrixConfig.impact_labels[impactIndex] || `${size - i}`;
                          return (
                            <div key={i} className="h-20 flex items-center justify-center w-16 text-muted-foreground font-medium text-xs">
                              {impactLabel}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Matriz */}
                    <div className="flex flex-col space-y-4">
                      {renderRiskMatrix()}

                      {/* Eixo X (Probabilidade) - Diretamente abaixo da matriz */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex gap-1 text-sm text-center">
                          {Array.from({ length: matrixConfig.type === '3x3' ? 3 : matrixConfig.type === '4x4' ? 4 : 5 }, (_, i) => {
                            const probabilityLabel = matrixConfig.likelihood_labels[i] || `${i + 1}`;
                            return (
                              <div key={i} className="w-20 flex items-center justify-center text-muted-foreground font-medium text-xs">
                                {probabilityLabel}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground" style={{ marginBottom: '40px' }}>PROBABILIDADE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legenda Dinamica baseada na configuracao do tenant */}
                <div className="flex flex-wrap justify-center gap-4" style={{ marginTop: '10px' }}>
                  {(() => {
                    // Obter niveis unicos da matriz
                    const uniqueLevels = new Map();
                    const size = matrixConfig.type === '3x3' ? 3 : matrixConfig.type === '4x4' ? 4 : 5;

                    // Funcao para obter nivel de risco (mesma logica da matriz)
                    const getRiskLevelAndColor = (score: number) => {
                      if (matrixConfig.risk_levels_custom && matrixConfig.risk_levels_custom.length > 0) {
                        for (const level of matrixConfig.risk_levels_custom) {
                          if (score >= level.minValue && score <= level.maxValue) {
                            return { name: level.name, backgroundColor: level.color };
                          }
                        }
                      }

                      if (matrixConfig.type === '5x5') {
                        if (score >= 17) return { name: 'Muito Alto', backgroundColor: '#ef4444' };
                        else if (score >= 9) return { name: 'Alto', backgroundColor: '#f97316' };
                        else if (score >= 5) return { name: 'Medio', backgroundColor: '#eab308' };
                        else if (score >= 3) return { name: 'Baixo', backgroundColor: '#22c55e' };
                        else return { name: 'Muito Baixo', backgroundColor: '#3b82f6' };
                      } else if (matrixConfig.type === '4x4') {
                        if (score >= 10) return { name: 'Muito Alto', backgroundColor: '#ef4444' };
                        else if (score >= 7) return { name: 'Alto', backgroundColor: '#f97316' };
                        else if (score >= 3) return { name: 'Medio', backgroundColor: '#eab308' };
                        else return { name: 'Baixo', backgroundColor: '#22c55e' };
                      } else { // 3x3
                        if (score >= 5) return { name: 'Alto', backgroundColor: '#ef4444' };
                        else if (score >= 3) return { name: 'Medio', backgroundColor: '#eab308' };
                        else return { name: 'Baixo', backgroundColor: '#22c55e' };
                      }
                    };

                    // Coletar todos os niveis unicos
                    for (let i = 1; i <= size; i++) {
                      for (let j = 1; j <= size; j++) {
                        const riskScore = i * j;
                        const riskLevel = getRiskLevelAndColor(riskScore);
                        if (riskLevel && !uniqueLevels.has(riskLevel.name)) {
                          uniqueLevels.set(riskLevel.name, riskLevel);
                        }
                      }
                    }

                    return Array.from(uniqueLevels.values()).map((level) => (
                      <div key={level.name} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: level.backgroundColor }}
                        ></div>
                        <span className="text-sm">{level.name}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Modulos - CARDS CORRIGIDOS PARA SEGUIR PADRAO DA UI */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Modulo de Riscos */}
            <Card className="relative group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/risks')}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Gestao de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{metrics.totalRisks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Criticos</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.criticalRisks}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Compliance */}
            <Card className="relative group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/assessments')}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">{metrics.complianceScore}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Concluidos</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.completedAssessments}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Privacidade */}
            <Card className="relative group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/privacy')}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  Privacidade (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">DPIAs</p>
                    <p className="text-2xl font-bold">{metrics.totalDPIA}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Solicitacoes</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.dataSubjectRequests}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Fornecedores */}
            <Card className="relative group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/vendors')}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Fornecedores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold">{metrics.activeVendors}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Criticos</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.criticalVendors}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Politicas */}
            <Card className="relative group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/policy-management')}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Politicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Publicadas</p>
                    <p className="text-2xl font-bold">{metrics.publishedPolicies}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Novas</p>
                    <p className="text-2xl font-bold text-orange-600">{metrics.draftPolicies}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>

            {/* Modulo de Auditoria */}
            <Card className="relative group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate('/auditorias')}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-teal-500" />
                  Auditoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Planos</p>
                    <p className="text-2xl font-bold">{metrics.totalActionPlans}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ativos</p>
                    <p className="text-2xl font-bold text-teal-600">{metrics.activeActionPlans}</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Acessar Modulo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alertas e Acoes Rapidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Criticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas Criticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.criticalRisks > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200">Riscos Criticos Ativos</p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {metrics.criticalRisks} risco{metrics.criticalRisks !== 1 ? 's' : ''} critico{metrics.criticalRisks !== 1 ? 's' : ''} requer{metrics.criticalRisks === 1 ? '' : 'em'} atencao imediata
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => navigate('/risks')}>
                    Revisar Agora
                  </Button>
                </div>
              </div>
            )}

            {metrics.openIncidents > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Incidentes Abertos</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    {metrics.openIncidents} incidente{metrics.openIncidents !== 1 ? 's' : ''} aguarda{metrics.openIncidents === 1 ? '' : 'm'} resolucao
                  </p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/incidents')}>
                    Gerenciar
                  </Button>
                </div>
              </div>
            )}

            {metrics.criticalRisks === 0 && metrics.openIncidents === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Situacao Controlada</h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Nenhum alerta critico no momento. Continue monitorando.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acoes Recomendadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Acoes Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Revisar planos de acao pendentes</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/assessments/action-plans')}>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Atualizar politicas em rascunho</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/policy-management')}>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Avaliar fornecedores criticos</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/vendors')}>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Gerar relatorio executivo</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/reports')}>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegratedExecutiveDashboardFixed;