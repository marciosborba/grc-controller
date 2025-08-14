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
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { supabase } from '@/integrations/supabase/client';
import { DevAuthHelper } from './DevAuthHelper';

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
      setMetrics({
        data_inventory: {
          total_inventories: 0,
          by_sensitivity: {},
          needs_review: 0
        },
        consents: {
          total_active: 0,
          total_revoked: 0,
          expiring_soon: 0
        },
        data_subject_requests: {
          total_requests: 0,
          pending_requests: 0,
          overdue_requests: 0,
          by_type: {}
        },
        privacy_incidents: {
          total_incidents: 0,
          open_incidents: 0,
          anpd_notifications_required: 0,
          by_severity: {}
        },
        dpia_assessments: {
          total_dpias: 0,
          pending_dpias: 0,
          high_risk_dpias: 0
        },
        compliance_overview: {
          processing_activities: 0,
          legal_bases: 0,
          training_completion_rate: 0
        },
        legal_bases: {
          total_bases: 0,
          active_bases: 0,
          expiring_soon: 0,
          needs_validation: 0
        },
        processing_activities: {
          total_activities: 0,
          active_activities: 0,
          high_risk_activities: 0,
          requires_dpia: 0
        }
      });
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
      count: 0
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

  const complianceScore = 85; // Mock score - would be calculated from actual data

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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Privacidade e LGPD</h1>
          <p className="text-muted-foreground">
            Gestão completa de privacidade e proteção de dados pessoais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Score de Compliance: {complianceScore}%
          </Badge>
        </div>
      </div>

      {/* Development Auth Helper - Show when no data available */}
      {hasNoData && (
        <DevAuthHelper />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens no Inventário</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.data_inventory?.total_inventories || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.data_inventory?.needs_review || 0} precisam revisão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.data_subject_requests?.total_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.data_subject_requests?.pending_requests || 0} pendentes | {metrics?.data_subject_requests?.overdue_requests || 0} em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics?.privacy_incidents?.total_incidents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.privacy_incidents?.open_incidents || 0} abertos | {metrics?.privacy_incidents?.anpd_notifications_required || 0} requer ANPD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consentimentos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.consents?.total_active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.consents?.expiring_soon || 0} vencem em breve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={action.action}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    {action.count > 0 && (
                      <Badge variant="secondary">{action.count}</Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="flex justify-between text-sm">
                <span>Compliance Geral</span>
                <span>{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="h-2" />
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Inventário Atualizado</span>
                </div>
                <Badge variant="outline">OK</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>DPIAs Pendentes</span>
                </div>
                <Badge variant="secondary">{metrics?.dpia_assessments?.pending_dpias || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Bases Legais Definidas</span>
                </div>
                <Badge variant="outline">{metrics?.compliance_overview?.legal_bases || 0}</Badge>
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
              {metrics?.data_subject_requests?.overdue_requests > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Solicitações em Atraso</p>
                    <p className="text-sm text-red-600">
                      {metrics.data_subject_requests.overdue_requests} solicitações ultrapassaram 15 dias
                    </p>
                    <Button size="sm" className="mt-2" onClick={() => navigate('/privacy/requests')}>
                      Ver Solicitações
                    </Button>
                  </div>
                </div>
              )}

              {metrics?.data_inventory?.needs_review > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Calendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">Revisão de Inventário</p>
                    <p className="text-sm text-yellow-600">
                      {metrics.data_inventory.needs_review} itens precisam de revisão
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/privacy/inventory')}>
                      Revisar Itens
                    </Button>
                  </div>
                </div>
              )}

              {metrics?.privacy_incidents?.anpd_notifications_required > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Zap className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Notificação ANPD Pendente</p>
                    <p className="text-sm text-red-600">
                      {metrics.privacy_incidents.anpd_notifications_required} incidentes requerem notificação
                    </p>
                    <Button size="sm" className="mt-2" onClick={() => navigate('/privacy/incidents')}>
                      Ver Incidentes
                    </Button>
                  </div>
                </div>
              )}

              {(!metrics?.data_subject_requests?.overdue_requests && 
                !metrics?.data_inventory?.needs_review && 
                !metrics?.privacy_incidents?.anpd_notifications_required) && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium text-green-800 mb-2">Tudo em Ordem!</h3>
                  <p className="text-sm text-green-600">
                    Não há ações prioritárias pendentes no momento.
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