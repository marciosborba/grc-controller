import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  FileText,
  Users,
  Calendar,
  Target,
  Zap,
  Bot,
  Settings,
  Play,
  Pause,
  Activity,
  DollarSign,
  Lightbulb,
  Info,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuditKPI {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

interface Audit {
  id: string;
  title: string;
  audit_number: string;
  audit_type: string;
  status: string;
  priority: string;
  current_phase: string;
  lead_auditor: string;
  planned_start_date: string;
  planned_end_date: string;
  progress: number;
  ai_risk_score: number;
  findings_count: number;
  overdue: boolean;
}

interface AlexAuditSession {
  id: string;
  session_type: string;
  prompt: string;
  response: string;
  confidence_score: number;
  created_at: string;
  user_rating?: number;
}

const AuditIADashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [audits, setAudits] = useState<Audit[]>([]);
  const [kpis, setKPIs] = useState<AuditKPI[]>([]);
  const [alexSessions, setAlexSessions] = useState<AlexAuditSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alexAuditActive, setAlexAuditActive] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock KPIs
      setKPIs([
        {
          title: 'Auditorias Ativas',
          value: 24,
          change: '+12%',
          trend: 'up',
          icon: Activity,
          color: 'text-blue-600'
        },
        {
          title: 'Achados Críticos',
          value: 8,
          change: '-25%',
          trend: 'down',
          icon: AlertTriangle,
          color: 'text-red-600'
        },
        {
          title: 'Taxa de Conclusão',
          value: '87%',
          change: '+5%',
          trend: 'up',
          icon: CheckCircle,
          color: 'text-green-600'
        },
        {
          title: 'Automação IA',
          value: '92%',
          change: '+18%',
          trend: 'up',
          icon: Brain,
          color: 'text-purple-600'
        }
      ]);

      // Mock audits
      setAudits([
        {
          id: '1',
          title: 'Auditoria de Controles Internos SOX',
          audit_number: 'AUD-2025-0001',
          audit_type: 'Financial Audit',
          status: 'Fieldwork',
          priority: 'High',
          current_phase: 'Control Testing',
          lead_auditor: 'Ana Silva',
          planned_start_date: '2025-01-15',
          planned_end_date: '2025-03-15',
          progress: 65,
          ai_risk_score: 7.2,
          findings_count: 3,
          overdue: false
        },
        {
          id: '2',
          title: 'Auditoria de Segurança Cibernética',
          audit_number: 'AUD-2025-0002',
          audit_type: 'IT Audit',
          status: 'Planning',
          priority: 'Critical',
          current_phase: 'Risk Assessment',
          lead_auditor: 'Carlos Mendes',
          planned_start_date: '2025-02-01',
          planned_end_date: '2025-04-01',
          progress: 25,
          ai_risk_score: 8.5,
          findings_count: 0,
          overdue: false
        },
        {
          id: '3',
          title: 'Auditoria LGPD e Privacidade',
          audit_number: 'AUD-2025-0003',
          audit_type: 'Compliance Audit',
          status: 'Review',
          priority: 'Medium',
          current_phase: 'Reporting',
          lead_auditor: 'Marina Costa',
          planned_start_date: '2024-12-01',
          planned_end_date: '2025-02-01',
          progress: 90,
          ai_risk_score: 4.1,
          findings_count: 5,
          overdue: true
        }
      ]);

      // Mock Alex Audit sessions
      setAlexSessions([
        {
          id: '1',
          session_type: 'Risk Assessment',
          prompt: 'Analise os riscos de controle interno para auditoria SOX',
          response: 'Identifiquei 12 riscos críticos com base nos controles COSO...',
          confidence_score: 94.5,
          created_at: '2025-01-17T10:30:00Z',
          user_rating: 5
        },
        {
          id: '2',
          session_type: 'Procedure Generation',
          prompt: 'Gere procedimentos de auditoria para teste de acesso privilegiado',
          response: 'Procedimentos desenvolvidos com base em NIST e ISO 27001...',
          confidence_score: 89.2,
          created_at: '2025-01-17T09:15:00Z',
          user_rating: 4
        }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      'Planning': 'bg-blue-100 text-blue-800 border-blue-200',
      'Fieldwork': 'bg-orange-100 text-orange-800 border-orange-200',
      'Review': 'bg-purple-100 text-purple-800 border-purple-200',
      'Reporting': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Closed': 'bg-green-100 text-green-800 border-green-200',
      'On Hold': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Critical': 'text-red-600',
      'High': 'text-orange-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-blue-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const handleCreateAudit = () => {
    navigate('/audit/planning');
  };

  const handleAuditClick = (auditId: string) => {
    navigate('/audit/execution');
  };

  const handleAlexAuditInteraction = () => {
    navigate('/audit/alex-ai');
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.audit_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard de auditoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Eye className="h-8 w-8 text-primary" />
            <span>Audit IA</span>

          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestão inteligente de auditorias com IA avançada e metodologias Big Four
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleAlexAuditInteraction}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>Alex Audit</span>
          </Button>
          <button
            onClick={handleCreateAudit}
            style={{
              backgroundColor: 'hsl(198 87% 50%)', // Azul primary-text
              color: 'white',
              border: '1px solid hsl(198 87% 50%)',
              padding: '8px 16px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Plus className="h-4 w-4" />
            Nova Auditoria
          </button>
        </div>
      </div>



      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={cn(
                      "h-4 w-4 mr-1",
                      kpi.trend === 'up' ? 'text-green-600' : 
                      kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      kpi.trend === 'up' ? 'text-green-600' : 
                      kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    )}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-muted">
                  <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Auditorias</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="alex-sessions" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Alex IA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/audit/planning')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Planejar Auditoria</h3>
                    <p className="text-sm text-muted-foreground">Criar nova auditoria</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/audit/execution')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <Play className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Executar Auditoria</h3>
                    <p className="text-sm text-muted-foreground">Workspace de execução</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/audit/reports')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gerar Relatórios</h3>
                    <p className="text-sm text-muted-foreground">Relatórios inteligentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/audit/alex-ai')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Alex Audit IA</h3>
                    <p className="text-sm text-muted-foreground">Assistente inteligente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Audits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Auditorias Recentes
                </CardTitle>
                <CardDescription>
                  Últimas auditorias atualizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audits.slice(0, 3).map((audit) => (
                    <div
                      key={audit.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleAuditClick(audit.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {audit.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {audit.audit_number} • {audit.lead_auditor}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(audit.status)}
                        >
                          {audit.status}
                        </Badge>
                        {audit.overdue && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Insights de IA
                </CardTitle>
                <CardDescription>
                  Análises e recomendações do Alex Audit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Alto Risco Detectado</p>
                      <p className="text-sm text-muted-foreground">
                        Auditoria de Segurança Cibernética apresenta score de risco 8.5/10. 
                        Recomenda-se priorização imediata.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg border">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Automação Bem-sucedida</p>
                      <p className="text-sm text-muted-foreground">
                        92% dos procedimentos foram automatizados, resultando em 
                        40% de redução no tempo de execução.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-primary">Recomendação de Melhoria</p>
                      <p className="text-sm text-muted-foreground">
                        Implementar controles adicionais de acesso privilegiado 
                        baseados em análise de padrões de comportamento.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar auditorias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Planning">Planejamento</SelectItem>
                    <SelectItem value="Fieldwork">Fieldwork</SelectItem>
                    <SelectItem value="Review">Revisão</SelectItem>
                    <SelectItem value="Reporting">Relatório</SelectItem>
                    <SelectItem value="Closed">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredAudits.map((audit) => (
              <Card 
                key={audit.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleAuditClick(audit.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {audit.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {audit.audit_number}
                      </CardDescription>
                    </div>
                    {audit.overdue && (
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(audit.status)}
                    >
                      {audit.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Prioridade:</span>
                    <span className={cn("font-medium", getPriorityColor(audit.priority))}>
                      {audit.priority}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">{audit.progress}%</span>
                    </div>
                    <Progress value={audit.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Score de Risco IA:</span>
                    <Badge 
                      variant="outline" 
                      className={
                        audit.ai_risk_score >= 7 ? 'border-red-200 text-red-700' :
                        audit.ai_risk_score >= 4 ? 'border-yellow-200 text-yellow-700' :
                        'border-green-200 text-green-700'
                      }
                    >
                      {audit.ai_risk_score}/10
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Auditor Líder: {audit.lead_auditor}</span>
                      <span>{audit.findings_count} achados</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAudits.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Nenhuma auditoria encontrada com os filtros aplicados.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          {/* Analytics Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Analytics & Insights</h2>
              <p className="text-sm text-gray-600">Análise abrangente do desempenho de auditorias</p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="30">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Eficiência Média</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">94.2%</p>
                    <p className="text-xs text-green-600">+2.1% vs mês anterior</p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Tempo Médio</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">18.5 dias</p>
                    <p className="text-xs text-red-600">+1.2 dias vs mês anterior</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Score IA Médio</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-600">8.7/10</p>
                    <p className="text-xs text-green-600">+0.3 vs mês anterior</p>
                  </div>
                  <div className="p-2 rounded-full bg-purple-100">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Custo Médio</p>
                    <p className="text-lg sm:text-xl font-bold text-orange-600">R$ 125k</p>
                    <p className="text-xs text-green-600">-8.5% vs mês anterior</p>
                  </div>
                  <div className="p-2 rounded-full bg-orange-100">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Distribuição por Status
                </CardTitle>
                <CardDescription>
                  Status atual das auditorias em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Planning', 'Fieldwork', 'Review', 'Reporting', 'Closed'].map((status) => {
                    const count = audits.filter(a => a.status === status).length;
                    const percentage = audits.length > 0 ? (count / audits.length) * 100 : 0;
                    
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{status}</span>
                          <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Distribuição por Tipo
                </CardTitle>
                <CardDescription>
                  Tipos de auditoria mais executadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Financial Audit', 'IT Audit', 'Compliance Audit', 'Internal Audit'].map((type) => {
                    const count = audits.filter(a => a.audit_type === type).length;
                    const percentage = audits.length > 0 ? (count / audits.length) * 100 : 0;
                    
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{type}</span>
                          <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Análise de Riscos
                </CardTitle>
                <CardDescription>
                  Distribuição de scores de risco de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { range: '9.0 - 10.0', label: 'Crítico', color: 'bg-red-500', count: 2 },
                    { range: '7.0 - 8.9', label: 'Alto', color: 'bg-orange-500', count: 5 },
                    { range: '5.0 - 6.9', label: 'Médio', color: 'bg-yellow-500', count: 8 },
                    { range: '3.0 - 4.9', label: 'Baixo', color: 'bg-blue-500', count: 12 },
                    { range: '0.0 - 2.9', label: 'Mínimo', color: 'bg-green-500', count: 3 }
                  ].map((risk) => {
                    const total = 30; // Total fictício para demonstração
                    const percentage = (risk.count / total) * 100;
                    
                    return (
                      <div key={risk.range}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${risk.color}`}></div>
                            <span>{risk.label} ({risk.range})</span>
                          </div>
                          <span className="font-medium">{risk.count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Automação de IA
                </CardTitle>
                <CardDescription>
                  Níveis de automação por processo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { process: 'Planejamento', automation: 95 },
                    { process: 'Procedimentos', automation: 88 },
                    { process: 'Evidências', automation: 92 },
                    { process: 'Papéis de Trabalho', automation: 96 },
                    { process: 'Relatórios', automation: 85 }
                  ].map((item) => (
                    <div key={item.process}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{item.process}</span>
                        <span className="font-medium">{item.automation}%</span>
                      </div>
                      <Progress value={item.automation} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trending and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tendências Mensais
                </CardTitle>
                <CardDescription>
                  Evolução das métricas nos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 flex items-end justify-between gap-2">
                    {[65, 72, 78, 85, 88, 94].map((value, index) => (
                      <div key={index} className="flex flex-col items-center gap-1">
                        <div 
                          className="bg-primary rounded-t"
                          style={{ height: `${value}%`, width: '20px' }}
                        ></div>
                        <span className="text-xs text-muted-foreground">{value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Jan</span>
                    <span>Fev</span>
                    <span>Mar</span>
                    <span>Abr</span>
                    <span>Mai</span>
                    <span>Jun</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Insights Inteligentes
                </CardTitle>
                <CardDescription>
                  Recomendações baseadas em análise de dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Info className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-primary">Oportunidade de Otimização</p>
                      <p className="text-sm text-muted-foreground">
                        Auditorias de TI estão 15% mais rápidas com automação IA. 
                        Considere expandir para outras áreas.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Atenção Necessária</p>
                      <p className="text-sm text-muted-foreground">
                        3 auditorias estão atrasadas. Recomenda-se realocação de recursos 
                        ou renegociação de prazos.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg border">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Excelente Performance</p>
                      <p className="text-sm text-muted-foreground">
                        Taxa de conclusão no prazo aumentou 12% com Alex Audit. 
                        Continue utilizando IA nos procedimentos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alex-sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Sessões Alex Audit Recentes
              </CardTitle>
              <CardDescription>
                Histórico de interações com o assistente de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alexSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {session.session_type}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Confiança: {session.confidence_score}%</span>
                        {session.user_rating && (
                          <div className="flex items-center">
                            {'★'.repeat(session.user_rating)}
                            {'☆'.repeat(5 - session.user_rating)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Prompt:</p>
                        <p className="text-sm text-gray-600">{session.prompt}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Resposta:</p>
                        <p className="text-sm text-gray-600">
                          {session.response.length > 150 
                            ? `${session.response.substring(0, 150)}...` 
                            : session.response}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {new Date(session.created_at).toLocaleString('pt-BR')}
                      </span>
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
                        Ver Detalhes
                      </Button>
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

export default AuditIADashboard;