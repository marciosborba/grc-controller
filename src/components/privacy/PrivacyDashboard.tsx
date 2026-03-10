import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Search,
  Shield,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Eye,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Scale,
  Globe,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { supabase } from '@/integrations/supabase/client';
import { DevAuthHelper } from './DevAuthHelper';

// Calculate LGPD compliance score based on real system metrics
function calculateComplianceScore(metrics: any): number {
  if (!metrics) return 0;

  let score = 0;
  let totalChecks = 0;

  // Data Inventory Completeness (25% weight)
  totalChecks += 25;
  const inventoryItems = metrics.data_inventory?.total_inventories || 0;
  const needsReview = metrics.data_inventory?.needs_review || 0;
  if (inventoryItems > 0) {
    const inventoryCompleteness = Math.max(0, 100 - ((needsReview / inventoryItems) * 100));
    score += (inventoryCompleteness * 0.25);
  }

  // Data Subject Requests Handling (20% weight) 
  totalChecks += 20;
  const totalRequests = metrics.data_subject_requests?.total_requests || 0;
  const overdueRequests = metrics.data_subject_requests?.overdue_requests || 0;
  if (totalRequests > 0) {
    const requestsCompliance = Math.max(0, 100 - ((overdueRequests / totalRequests) * 100));
    score += (requestsCompliance * 0.20);
  } else {
    score += 20; // No requests is compliant
  }

  // Privacy Incidents Management (20% weight)
  totalChecks += 20;
  const totalIncidents = metrics.privacy_incidents?.total_incidents || 0;
  const openIncidents = metrics.privacy_incidents?.open_incidents || 0;
  const anpdRequired = metrics.privacy_incidents?.anpd_notifications_required || 0;
  if (totalIncidents === 0) {
    score += 20; // No incidents is good
  } else {
    const incidentsCompliance = Math.max(0, 100 - ((openIncidents + anpdRequired) / totalIncidents) * 50);
    score += (incidentsCompliance * 0.20);
  }

  // Legal Framework Implementation (15% weight)
  totalChecks += 15;
  const totalBases = metrics.legal_bases?.total_bases || 0;
  const activeBases = metrics.legal_bases?.active_bases || 0;
  const expiringBases = metrics.legal_bases?.expiring_soon || 0;
  if (totalBases > 0) {
    const basesCompliance = Math.max(0, ((activeBases - expiringBases) / totalBases) * 100);
    score += (basesCompliance * 0.15);
  }

  // Consents Management (10% weight)
  totalChecks += 10;
  const activeConsents = metrics.consents?.total_active || 0;
  const expiringConsents = metrics.consents?.expiring_soon || 0;
  if (activeConsents > 0) {
    const consentsCompliance = Math.max(0, 100 - ((expiringConsents / activeConsents) * 100));
    score += (consentsCompliance * 0.10);
  } else {
    score += 10; // No consents needed is compliant
  }

  // DPIA/Processing Activities (10% weight)
  totalChecks += 10;
  const totalActivities = metrics.processing_activities?.total_activities || 0;
  const highRiskActivities = metrics.processing_activities?.high_risk_activities || 0;
  const pendingDpias = metrics.dpia_assessments?.pending_dpias || 0;
  if (totalActivities > 0) {
    const dpiaCompliance = Math.max(0, 100 - ((pendingDpias / Math.max(1, highRiskActivities)) * 100));
    score += (dpiaCompliance * 0.10);
  } else {
    score += 10;
  }

  return Math.round(score);
}

export function PrivacyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchPrivacyMetrics();
  }, []);

  const fetchPrivacyMetrics = async () => {
    try {
      setLoading(true);

      // Using the stored function we created in the migration
      const { data, error } = await supabase.rpc('calculate_privacy_metrics');

      if (error) throw error;

      setMetrics(data);
    } catch (error) {
      console.error('Error fetching privacy metrics:', error);
      // Fallback to mock data for demo
      console.error('Error fetching privacy metrics:', error);
      // Fallback to null to show empty state or error, NOT mock data
      setMetrics(null);

      // Optionally show a toast error
      // toast({ title: "Erro", description: "Falha ao carregar métricas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Discovery de Dados',
      description: 'Mapear dados pessoais em sistemas',
      icon: Search,
      color: 'blue',
      action: () => navigate('/privacy/discovery'),
      count: metrics?.data_discovery?.total_sources || 0
    },
    {
      title: 'Inventário de Dados',
      description: 'Catálogo de dados pessoais',
      icon: Database,
      color: 'green',
      action: () => navigate('/privacy/inventory'),
      count: metrics?.data_inventory?.total_inventories || 0
    },
    {
      title: 'Solicitações de Titulares',
      description: 'Exercício de direitos LGPD',
      icon: Users,
      color: 'purple',
      action: () => navigate('/privacy/requests'),
      count: metrics?.data_subject_requests?.total_requests || 0
    },
    {
      title: 'Incidentes de Privacidade',
      description: 'Violações e vazamentos',
      icon: AlertTriangle,
      color: 'red',
      action: () => navigate('/privacy/incidents'),
      count: metrics?.privacy_incidents?.total_incidents || 0
    },
    {
      title: 'DPIA/AIPD',
      description: 'Avaliação de impacto',
      icon: Shield,
      color: 'orange',
      action: () => navigate('/privacy/dpia'),
      count: metrics?.dpia_assessments?.total_dpias || 0
    },
    {
      title: 'Bases Legais',
      description: 'Fundamentos para tratamento',
      icon: Scale,
      color: 'teal',
      action: () => navigate('/privacy/legal-bases'),
      count: metrics?.legal_bases?.total_bases || 0
    },
    {
      title: 'Consentimentos',
      description: 'Gestão de consentimentos LGPD',
      icon: CheckCircle,
      color: 'indigo',
      action: () => navigate('/privacy/consents'),
      count: metrics?.consents?.total_active || 0
    },
    {
      title: 'Atividades de Tratamento (RAT)',
      description: 'Registro oficial Art. 37 LGPD',
      icon: Activity,
      color: 'cyan',
      action: () => navigate('/privacy/processing-activities'),
      count: metrics?.processing_activities?.total_activities || 0
    },
    {
      title: 'Relatório RAT',
      description: 'Relatório oficial do registro',
      icon: FileText,
      color: 'slate',
      action: () => navigate('/privacy/rat-report'),
      count: 0
    }
  ];

  const complianceScore = calculateComplianceScore(metrics);

  // Check if we have no data (user likely not authenticated)
  const hasNoData = metrics && (
    !metrics.legal_bases?.total_bases &&
    !metrics.consents?.total_active &&
    !metrics.data_inventory?.total_inventories &&
    !metrics.data_subject_requests?.total_requests &&
    !metrics.privacy_incidents?.total_incidents &&
    !metrics.processing_activities?.total_activities
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dashboard de privacidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Responsivo */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Privacidade e LGPD</h1>
          <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-0.5 sm:mt-0">
            Gestão completa de privacidade e proteção de dados pessoais (LGPD)
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">Sistema Operacional</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="font-semibold text-primary">Score: {complianceScore}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-muted-foreground">DPO: dpo@example.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Development Auth Helper - Show when no data available */}
      {hasNoData && (
        <DevAuthHelper />
      )}

      {/* Quick Metrics (Risks style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Panorama / Score */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Shield className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>
          <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm sm:text-lg font-bold flex items-center gap-2 text-primary">
              Panorama LGPD
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex items-baseline gap-2 mb-1 sm:mb-2">
              <span className="text-xl sm:text-3xl font-bold text-foreground">{complianceScore}%</span>
              <span className="text-xs sm:text-sm text-muted-foreground">de compliance</span>
            </div>
            <p className="text-muted-foreground font-medium text-xs sm:text-sm leading-relaxed truncate">
              {complianceScore >= 80 ? 'Ambiente em conformidade e monitorado adeq...' : complianceScore >= 50 ? 'Nível parcial de adequação LGPD ident...' : 'Nível crítico de adequação LGPD. Ações ...'}
            </p>
            <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complianceScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {complianceScore >= 80 ? 'Sob Controle' : 'Ação Necessária'}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Governança de Dados */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-5 flex flex-col gap-2 h-full relative z-10 w-full overflow-hidden">
            <div className="w-full">
              <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-500 whitespace-nowrap overflow-visible">
                Governança
              </p>
            </div>
            <div className="flex w-full items-center gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl sm:rounded-2xl shrink-0">
                <Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-500 leading-none">
                  {metrics?.data_inventory?.total_inventories || 0}
                </h3>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium truncate w-full">
              {(metrics?.data_inventory?.needs_review || 0) > 0 ? `+ ${metrics.data_inventory.needs_review} pendentes de revisão` : 'Todos revisados'}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Riscos & Impacto */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500">
          <CardContent className="p-3 sm:p-5 flex flex-col gap-2 h-full relative z-10 w-full overflow-hidden">
            <div className="w-full">
              <p className="text-sm sm:text-base font-bold text-red-600 dark:text-red-500 whitespace-nowrap overflow-visible">
                Incidentes
              </p>
            </div>
            <div className="flex w-full items-center gap-3">
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/50 rounded-xl sm:rounded-2xl shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-500 leading-none">
                  {metrics?.privacy_incidents?.total_incidents || 0}
                </h3>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium truncate w-full">
              {(metrics?.privacy_incidents?.open_incidents || 0) > 0 ? `${metrics.privacy_incidents.open_incidents} abertos / pendentes` : 'Nenhum incidente aberto'}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Titulares */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-orange-500">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="h-16 w-16 sm:h-24 sm:w-24 text-orange-500" />
          </div>
          <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-sm sm:text-lg font-bold text-foreground">
              Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex items-baseline gap-2">
              <span className={`text-xl sm:text-3xl font-bold ${(metrics?.data_subject_requests?.overdue_requests || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {metrics?.data_subject_requests?.overdue_requests || 0}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">atrasadas</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 truncate">
              {(metrics?.data_subject_requests?.overdue_requests || 0) > 0 ? 'Existem solicitações fora do prazo.' : 'Todas solicitações em dia.'}
            </p>
            <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${(metrics?.data_subject_requests?.overdue_requests || 0) > 0 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: (metrics?.data_subject_requests?.overdue_requests || 0) > 0 ? '70%' : '100%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid - Premium Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Funcionalidades Integradas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {quickActions.map((action, index) => {
              const colorMap: Record<string, any> = {
                blue: { border: 'border-t-blue-500', iconBg: 'bg-blue-100 dark:bg-blue-900/20', iconBgHover: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40', iconText: 'text-blue-600 dark:text-blue-400', bgIcon: 'text-blue-500', linkText: 'text-blue-600', badge: 'bg-blue-50 text-blue-700' },
                green: { border: 'border-t-green-500', iconBg: 'bg-green-100 dark:bg-green-900/20', iconBgHover: 'group-hover:bg-green-200 dark:group-hover:bg-green-900/40', iconText: 'text-green-600 dark:text-green-400', bgIcon: 'text-green-500', linkText: 'text-green-600', badge: 'bg-green-50 text-green-700' },
                purple: { border: 'border-t-purple-500', iconBg: 'bg-purple-100 dark:bg-purple-900/20', iconBgHover: 'group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40', iconText: 'text-purple-600 dark:text-purple-400', bgIcon: 'text-purple-500', linkText: 'text-purple-600', badge: 'bg-purple-50 text-purple-700' },
                red: { border: 'border-t-red-500', iconBg: 'bg-red-100 dark:bg-red-900/20', iconBgHover: 'group-hover:bg-red-200 dark:group-hover:bg-red-900/40', iconText: 'text-red-600 dark:text-red-400', bgIcon: 'text-red-500', linkText: 'text-red-600', badge: 'bg-red-50 text-red-700' },
                orange: { border: 'border-t-orange-500', iconBg: 'bg-orange-100 dark:bg-orange-900/20', iconBgHover: 'group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40', iconText: 'text-orange-600 dark:text-orange-400', bgIcon: 'text-orange-500', linkText: 'text-orange-600', badge: 'bg-orange-50 text-orange-700' },
                teal: { border: 'border-t-teal-500', iconBg: 'bg-teal-100 dark:bg-teal-900/20', iconBgHover: 'group-hover:bg-teal-200 dark:group-hover:bg-teal-900/40', iconText: 'text-teal-600 dark:text-teal-400', bgIcon: 'text-teal-500', linkText: 'text-teal-600', badge: 'bg-teal-50 text-teal-700' },
                indigo: { border: 'border-t-indigo-500', iconBg: 'bg-indigo-100 dark:bg-indigo-900/20', iconBgHover: 'group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/40', iconText: 'text-indigo-600 dark:text-indigo-400', bgIcon: 'text-indigo-500', linkText: 'text-indigo-600', badge: 'bg-indigo-50 text-indigo-700' },
                cyan: { border: 'border-t-cyan-500', iconBg: 'bg-cyan-100 dark:bg-cyan-900/20', iconBgHover: 'group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/40', iconText: 'text-cyan-600 dark:text-cyan-400', bgIcon: 'text-cyan-500', linkText: 'text-cyan-600', badge: 'bg-cyan-50 text-cyan-700' },
                slate: { border: 'border-t-slate-500', iconBg: 'bg-slate-100 dark:bg-slate-900/20', iconBgHover: 'group-hover:bg-slate-200 dark:group-hover:bg-slate-900/40', iconText: 'text-slate-600 dark:text-slate-400', bgIcon: 'text-slate-500', linkText: 'text-slate-600', badge: 'bg-slate-50 text-slate-700' },
              };
              const colors = colorMap[action.color] || colorMap.slate;

              return (
                <Card
                  key={index}
                  onClick={action.action}
                  className={`relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 ${colors.border}`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <action.icon className={`h-24 w-24 ${colors.bgIcon}`} />
                  </div>
                  <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm sm:text-lg">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${colors.iconBg} ${colors.iconBgHover} transition-colors shrink-0`}>
                        <action.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${colors.iconText}`} />
                      </div>
                      <span className="line-clamp-2 leading-tight">{action.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 flex flex-col justify-between h-[calc(100%-4rem)] sm:h-[calc(100%-5rem)]">
                    <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2">
                      {action.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className={`flex items-center text-xs sm:text-sm font-medium ${colors.linkText} group-hover:translate-x-1 transition-transform`}>
                        Acessar <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5 sm:ml-1" />
                      </div>
                      {action.count > 0 && (
                        <Badge variant="secondary" className={`${colors.badge} text-[10px] sm:text-xs px-1.5 sm:px-2.5`}>
                          {action.count}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Overview - Responsivo */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Score de Compliance LGPD
            </CardTitle>
            <CardDescription>
              Avaliação automática do nível de conformidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Compliance Geral</span>
                <span>{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="h-2" />
            </div>

            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>Inventário Atualizado</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">OK</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                  <span>DPIAs Pendentes</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{metrics?.dpia_assessments?.pending_dpias || 0}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>Bases Legais Definidas</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">{metrics?.compliance_overview?.legal_bases || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Ações Prioritárias
            </CardTitle>
            <CardDescription>
              Próximas tarefas para manter compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* High Priority: Overdue Data Subject Requests */}
              {metrics?.data_subject_requests?.overdue_requests > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-200">Solicitações em Atraso</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {metrics.data_subject_requests.overdue_requests} solicitações ultrapassaram 15 dias
                    </p>
                    <Button size="sm" className="mt-2" onClick={() => navigate('/privacy/requests')}>
                      Ver Solicitações
                    </Button>
                  </div>
                </div>
              )}

              {/* High Priority: ANPD Notifications Required */}
              {metrics?.privacy_incidents?.anpd_notifications_required > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                  <Zap className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-200">Notificação ANPD Pendente</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {metrics.privacy_incidents.anpd_notifications_required} incidentes requerem notificação à ANPD
                    </p>
                    <Button size="sm" className="mt-2" onClick={() => navigate('/privacy/incidents')}>
                      Ver Incidentes
                    </Button>
                  </div>
                </div>
              )}

              {/* High Priority: Expiring Legal Bases */}
              {metrics?.legal_bases?.expiring_soon > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-800 dark:text-orange-200">Bases Legais Expirando</p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      {metrics.legal_bases.expiring_soon} bases legais expiram em breve
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/privacy/legal-bases')}>
                      Revisar Bases
                    </Button>
                  </div>
                </div>
              )}

              {/* High Priority: Pending DPIAs */}
              {metrics?.dpia_assessments?.pending_dpias > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-800 dark:text-orange-200">DPIA/RIPD Pendentes</p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      {metrics.dpia_assessments.pending_dpias} avaliações de impacto aguardam conclusão
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/privacy/dpia')}>
                      Ver DPIAs
                    </Button>
                  </div>
                </div>
              )}

              {/* Medium Priority: Data Inventory Review */}
              {metrics?.data_inventory?.needs_review > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                  <Database className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Revisão de Inventário</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      {metrics.data_inventory.needs_review} itens do inventário precisam de revisão
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/privacy/inventory')}>
                      Revisar Itens
                    </Button>
                  </div>
                </div>
              )}

              {/* Medium Priority: Expiring Consents */}
              {metrics?.consents?.expiring_soon > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                  <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Consentimentos Expirando</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      {metrics.consents.expiring_soon} consentimentos expiram em breve
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/privacy/consents')}>
                      Gerenciar Consentimentos
                    </Button>
                  </div>
                </div>
              )}

              {/* Medium Priority: Open Privacy Incidents */}
              {metrics?.privacy_incidents?.open_incidents > 0 && !metrics?.privacy_incidents?.anpd_notifications_required && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Incidentes em Investigação</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      {metrics.privacy_incidents.open_incidents} incidentes aguardam resolução
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/privacy/incidents')}>
                      Ver Incidentes
                    </Button>
                  </div>
                </div>
              )}

              {/* Success State - All Clear */}
              {(!metrics?.data_subject_requests?.overdue_requests &&
                !metrics?.data_inventory?.needs_review &&
                !metrics?.privacy_incidents?.anpd_notifications_required &&
                !metrics?.privacy_incidents?.open_incidents &&
                !metrics?.legal_bases?.expiring_soon &&
                !metrics?.dpia_assessments?.pending_dpias &&
                !metrics?.consents?.expiring_soon) && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-green-800 dark:text-green-300 mb-2">Excelente Conformidade!</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Todas as ações prioritárias estão em dia. Continue monitorando regularmente.
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}