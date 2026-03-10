import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  FileText,
  Users,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  RefreshCw,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';

interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: string;
  description: string;
  user_id: string;
  detected_at: string;
  resolved_at?: string;
  status: string;
  details: Record<string, any>;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface SecurityRule {
  id?: string;
  rule_name: string;
  rule_type: string;
  description: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  is_active: boolean;
  severity: string;
  auto_block: boolean;
}

export const AISecuritySection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Security metrics
  const [securityMetrics, setSecurityMetrics] = useState({
    total_incidents: 0,
    open_incidents: 0,
    blocked_requests: 0,
    pii_detections: 0,
    failed_authentications: 0,
    suspicious_activities: 0
  });

  const severityOptions = [
    { value: 'low', label: 'Baixa', color: 'text-green-600' },
    { value: 'medium', label: 'Média', color: 'text-yellow-600' },
    { value: 'high', label: 'Alta', color: 'text-orange-600' },
    { value: 'critical', label: 'Crítica', color: 'text-red-600' }
  ];

  const ruleTypes = [
    { value: 'content_filter', label: 'Filtro de Conteúdo' },
    { value: 'pii_detection', label: 'Detecção de PII' },
    { value: 'rate_limit', label: 'Limite de Taxa' },
    { value: 'anomaly_detection', label: 'Detecção de Anomalias' },
    { value: 'access_control', label: 'Controle de Acesso' }
  ];

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSecurityMetrics(),
        loadSecurityIncidents(),
        loadAuditLogs(),
        loadSecurityRules()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityMetrics = async () => {
    try {
      // Simular métricas de segurança - em produção, seria uma query real
      setSecurityMetrics({
        total_incidents: Math.floor(Math.random() * 50),
        open_incidents: Math.floor(Math.random() * 10),
        blocked_requests: Math.floor(Math.random() * 200),
        pii_detections: Math.floor(Math.random() * 30),
        failed_authentications: Math.floor(Math.random() * 15),
        suspicious_activities: Math.floor(Math.random() * 25)
      });
    } catch (error) {
      console.error('Erro ao carregar métricas de segurança:', error);
    }
  };

  const loadSecurityIncidents = async () => {
    try {
      // Simular incidentes de segurança - em produção seria uma query real
      const mockIncidents: SecurityIncident[] = [
        {
          id: '1',
          incident_type: 'pii_detection',
          severity: 'high',
          description: 'Detecção de CPF em prompt do usuário',
          user_id: user?.id || '',
          detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'open',
          details: { pattern: 'CPF', confidence: 0.95 }
        },
        {
          id: '2',
          incident_type: 'rate_limit_exceeded',
          severity: 'medium',
          description: 'Usuário excedeu limite de requisições por minuto',
          user_id: user?.id || '',
          detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          status: 'resolved',
          details: { requests_count: 45, limit: 30 }
        }
      ];
      setIncidents(mockIncidents);
    } catch (error) {
      console.error('Erro ao carregar incidentes:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      // Carregar logs reais de auditoria
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('resource_type', 'AI_USAGE')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const auditData = data.map(log => ({
          id: log.id,
          user_id: log.user_id,
          action: log.action,
          resource_type: log.resource_type,
          resource_id: log.resource_id,
          details: log.details,
          ip_address: log.ip_address || 'N/A',
          user_agent: log.user_agent || 'N/A',
          created_at: log.created_at
        }));
        setAuditLogs(auditData);
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
    }
  };

  const loadSecurityRules = async () => {
    try {
      // Simular regras de segurança - em produção seria uma tabela real
      const mockRules: SecurityRule[] = [
        {
          id: '1',
          rule_name: 'Detecção de CPF/CNPJ',
          rule_type: 'pii_detection',
          description: 'Detecta padrões de CPF e CNPJ em prompts',
          conditions: { patterns: ['\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}', '\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}'] },
          actions: { block: true, notify: true, log: true },
          is_active: true,
          severity: 'high',
          auto_block: true
        },
        {
          id: '2',
          rule_name: 'Limite de Requisições por Minuto',
          rule_type: 'rate_limit',
          description: 'Limita requisições por usuário por minuto',
          conditions: { max_requests_per_minute: 30 },
          actions: { block: true, notify: false, log: true },
          is_active: true,
          severity: 'medium',
          auto_block: true
        }
      ];
      setSecurityRules(mockRules);
    } catch (error) {
      console.error('Erro ao carregar regras de segurança:', error);
    }
  };

  const resolveIncident = async (incidentId: string) => {
    try {
      setIncidents(incidents.map(incident => 
        incident.id === incidentId 
          ? { ...incident, status: 'resolved', resolved_at: new Date().toISOString() }
          : incident
      ));

      toast({
        title: 'Sucesso',
        description: 'Incidente resolvido com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao resolver incidente:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao resolver incidente',
        variant: 'destructive'
      });
    }
  };

  const toggleSecurityRule = async (ruleId: string, isActive: boolean) => {
    try {
      setSecurityRules(securityRules.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ));

      toast({
        title: 'Sucesso',
        description: `Regra ${isActive ? 'ativada' : 'desativada'} com sucesso!`
      });
    } catch (error) {
      console.error('Erro ao alterar regra:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar regra de segurança',
        variant: 'destructive'
      });
    }
  };

  const exportSecurityReport = async () => {
    try {
      const reportData = {
        generated_at: new Date().toISOString(),
        tenant_id: user?.tenant?.id,
        security_metrics: securityMetrics,
        incidents: incidents,
        audit_logs: auditLogs.slice(0, 100), // Limitar para não exceder tamanho
        active_rules: securityRules.filter(rule => rule.is_active)
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-security-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'Relatório de segurança exportado!'
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar relatório',
        variant: 'destructive'
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Segurança e Conformidade</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitore segurança, incidentes e conformidade do sistema de IA
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadSecurityData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button variant="outline" onClick={exportSecurityReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="grc-card border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Incidentes Ativos
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {securityMetrics.open_incidents}
                </p>
                <p className="text-xs text-muted-foreground">
                  {securityMetrics.total_incidents} total
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Requisições Bloqueadas
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {securityMetrics.blocked_requests}
                </p>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-full">
                <Lock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="grc-card border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Detecções de PII
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {securityMetrics.pii_detections}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dados sensíveis protegidos
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-full">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Status */}
            <Card className="grc-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Status de Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Filtragem de Conteúdo</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Detecção de PII</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Controle de Acesso</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Log de Auditoria</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Criptografia</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Lock className="h-3 w-3 mr-1" />
                    AES-256
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Status */}
            <Card className="grc-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>Status de Conformidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">LGPD</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Conforme
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ISO 27001</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Conforme
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SOC 2 Type II</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Conforme
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">GDPR</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Conforme
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Retenção de Dados</span>
                  <Badge variant="outline">
                    365 dias
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Atividade Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.resource_type} • {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.ip_address}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          {/* Filters */}
          <Card className="grc-card">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar incidentes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {severityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Abertos</SelectItem>
                      <SelectItem value="resolved">Resolvidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incidents List */}
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="grc-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getSeverityIcon(incident.severity)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{incident.description}</h3>
                          <Badge 
                            variant={incident.status === 'open' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {incident.status === 'open' ? 'Aberto' : 'Resolvido'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {severityOptions.find(s => s.value === incident.severity)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Detectado em: {new Date(incident.detected_at).toLocaleString()}
                        </p>
                        {incident.resolved_at && (
                          <p className="text-sm text-green-600">
                            Resolvido em: {new Date(incident.resolved_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {incident.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveIncident(incident.id)}
                      >
                        Resolver
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredIncidents.length === 0 && (
              <Card className="grc-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhum incidente encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterSeverity !== 'all' || filterStatus !== 'all'
                      ? 'Tente ajustar os filtros de busca'
                      : 'Nenhum incidente de segurança registrado'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Database className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{log.resource_type}</span>
                          <span>IP: {log.ip_address}</span>
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum log de auditoria disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Regras de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Key className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{rule.rule_name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {ruleTypes.find(t => t.value === rule.rule_type)?.label}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${severityOptions.find(s => s.value === rule.severity)?.color}`}
                          >
                            {severityOptions.find(s => s.value === rule.severity)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rule.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleSecurityRule(rule.id!, checked)}
                      />
                      <Badge 
                        variant={rule.is_active ? 'secondary' : 'outline'}
                        className={rule.is_active ? 'bg-green-100 text-green-800' : ''}
                      >
                        {rule.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};