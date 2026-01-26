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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Privacidade e LGPD</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestão completa de privacidade e proteção de dados pessoais (LGPD)
          </p>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-primary">Encarregado (DPO):</span>
            <span>dpo@example.com (Configurar em Ajustes)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1">
            <Shield className="w-3 h-3" />
            Score: {complianceScore}%
          </Badge>
        </div>
      </div>

      {/* Development Auth Helper - Show when no data available */}
      {hasNoData && (
        <DevAuthHelper />
      )}

      {/* Key Metrics - Premium Storytelling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Governança de Dados */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Database className="h-32 w-32 text-blue-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Database className="h-5 w-5" />
              Governança de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{metrics?.data_inventory?.total_inventories || 0}</span>
                <span className="text-sm text-muted-foreground">sistemas no inventário</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total de ativos de dados mapeados.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" /> Atividades (RAT)
                </span>
                <span className="font-medium">{metrics?.processing_activities?.total_activities || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" /> Revisão Pendente
                </span>
                <Badge variant={metrics?.data_inventory?.needs_review > 0 ? "destructive" : "secondary"} className="text-xs">
                  {metrics?.data_inventory?.needs_review || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Riscos & Impacto */}
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Shield className="h-32 w-32 text-orange-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Shield className="h-5 w-5" />
              Riscos & Impacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{metrics?.privacy_incidents?.total_incidents || 0}</span>
                <span className="text-sm text-muted-foreground">incidentes registrados</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Eventos de segurança e privacidade.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> Abertos
                </span>
                <span className="font-bold text-red-600">{metrics?.privacy_incidents?.open_incidents || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" /> DPIAs Pendentes
                </span>
                <Badge variant={metrics?.dpia_assessments?.pending_dpias > 0 ? "destructive" : "secondary"} className="text-xs">
                  {metrics?.dpia_assessments?.pending_dpias || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Titulares de Dados */}
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Users className="h-32 w-32 text-purple-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Users className="h-5 w-5" />
              Titulares de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{metrics?.data_subject_requests?.total_requests || 0}</span>
                <span className="text-sm text-muted-foreground">solicitações (DSR)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Exercícios de direitos dos titulares.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-orange-500" /> Em Atraso
                </span>
                <span className="font-bold text-orange-600">{metrics?.data_subject_requests?.overdue_requests || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4" /> Consentimentos
                </span>
                <span className="font-medium">
                  {metrics?.consents?.total_active || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid - Premium Navigation */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Funcionalidades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              {/* Gradient Border Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r from-${action.color}-500/0 via-${action.color}-500/0 to-${action.color}-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/30 text-${action.color}-600 dark:text-${action.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  {action.count > 0 && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {action.count}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                    {action.title}
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Bottom decorative line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${action.color}-500 to-${action.color}-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
            </div>
          ))}
        </div>
      </div>

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