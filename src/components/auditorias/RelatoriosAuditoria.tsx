import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  BarChart3,
  Download,
  Send,
  Eye,
  Edit,
  Filter,
  Plus,
  Search,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  PieChart,
  LineChart,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { secureLog } from '@/utils/securityLogger';

interface AuditReport {
  id: string;
  projeto_id: string;
  projeto_titulo: string;
  titulo: string;
  tipo: 'preliminar' | 'final' | 'executivo' | 'seguimento' | 'especial';
  status: 'rascunho' | 'revisao' | 'aprovado' | 'publicado' | 'distribuido';
  autor: string;
  revisor?: string;
  aprovador?: string;
  data_criacao: string;
  data_publicacao?: string;
  versao: string;
  resumo_executivo: string;
  total_apontamentos: number;
  apontamentos_criticos: number;
  apontamentos_altos: number;
  apontamentos_medios: number;
  apontamentos_baixos: number;
  recomendacoes_total: number;
  recomendacoes_implementadas: number;
  nivel_risco_geral: 'baixo' | 'medio' | 'alto' | 'critico';
  distribuicao: string[];
  arquivo_url?: string;
  modelo_utilizado?: string;
}

interface ReportMetric {
  periodo: string;
  total_auditorias: number;
  auditorias_concluidas: number;
  apontamentos_identificados: number;
  apontamentos_criticos: number;
  recomendacoes_implementadas: number;
  taxa_implementacao: number;
}

interface Dashboard {
  id: string;
  nome: string;
  tipo: 'executivo' | 'operacional' | 'compliance' | 'risco';
  descricao: string;
  widgets: string[];
  compartilhado_com: string[];
  data_atualizacao: string;
  automatico: boolean;
}

export function RelatoriosAuditoria() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      
      // Carregar relatórios
      const { data: reportsData, error: reportsError } = await supabase
        .from('relatorios_auditoria')
        .select(`
          *,
          projetos_auditoria!inner(titulo)
        `)
        .eq('tenant_id', user?.tenant?.id)
        .order('data_criacao', { ascending: false });

      if (reportsError) {
        secureLog('error', 'Erro ao carregar relatórios', reportsError);
      } else {
        const mappedReports = reportsData?.map(report => ({
          id: report.id,
          projeto_id: report.projeto_id || '',
          projeto_titulo: report.projetos_auditoria?.titulo || 'Projeto não definido',
          titulo: report.titulo || 'Relatório sem título',
          tipo: report.tipo || 'final',
          status: report.status || 'rascunho',
          autor: report.autor || 'Não definido',
          revisor: report.revisor,
          aprovador: report.aprovador,
          data_criacao: report.data_criacao || '',
          data_publicacao: report.data_publicacao,
          versao: report.versao || '1.0',
          resumo_executivo: report.resumo_executivo || '',
          total_apontamentos: report.total_apontamentos || 0,
          apontamentos_criticos: report.apontamentos_criticos || 0,
          apontamentos_altos: report.apontamentos_altos || 0,
          apontamentos_medios: report.apontamentos_medios || 0,
          apontamentos_baixos: report.apontamentos_baixos || 0,
          recomendacoes_total: report.recomendacoes_total || 0,
          recomendacoes_implementadas: report.recomendacoes_implementadas || 0,
          nivel_risco_geral: report.nivel_risco_geral || 'medio',
          distribuicao: report.distribuicao || [],
          arquivo_url: report.arquivo_url,
          modelo_utilizado: report.modelo_utilizado
        })) || [];
        setReports(mappedReports);
      }

      // Carregar métricas (simulado)
      const currentYear = new Date().getFullYear();
      const mockMetrics: ReportMetric[] = [
        {
          periodo: `${currentYear}`,
          total_auditorias: reports.length,
          auditorias_concluidas: reports.filter(r => r.status === 'publicado').length,
          apontamentos_identificados: reports.reduce((sum, r) => sum + r.total_apontamentos, 0),
          apontamentos_criticos: reports.reduce((sum, r) => sum + r.apontamentos_criticos, 0),
          recomendacoes_implementadas: reports.reduce((sum, r) => sum + r.recomendacoes_implementadas, 0),
          taxa_implementacao: 0
        }
      ];
      mockMetrics[0].taxa_implementacao = mockMetrics[0].recomendacoes_implementadas > 0 
        ? Math.round((mockMetrics[0].recomendacoes_implementadas / reports.reduce((sum, r) => sum + r.recomendacoes_total, 0)) * 100) 
        : 0;
      setMetrics(mockMetrics);

      // Carregar dashboards (simulado)
      const mockDashboards: Dashboard[] = [
        {
          id: '1',
          nome: 'Dashboard Executivo',
          tipo: 'executivo',
          descricao: 'Visão executiva dos resultados de auditoria',
          widgets: ['KPI Cards', 'Risk Heatmap', 'Completion Rate'],
          compartilhado_com: ['CEO', 'CFO', 'CAE'],
          data_atualizacao: new Date().toISOString(),
          automatico: true
        },
        {
          id: '2',
          nome: 'Painel Operacional',
          tipo: 'operacional',
          descricao: 'Métricas operacionais detalhadas',
          widgets: ['Project Status', 'Finding Trends', 'Resource Allocation'],
          compartilhado_com: ['Audit Team'],
          data_atualizacao: new Date().toISOString(),
          automatico: false
        }
      ];
      setDashboards(mockDashboards);

    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de relatórios', error);
      toast.error('Erro ao carregar dados de relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'distribuido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'publicado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'aprovado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'revisao': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rascunho': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'executivo': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'preliminar': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'seguimento': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'especial': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critico': return 'text-red-600';
      case 'alto': return 'text-orange-600';
      case 'medio': return 'text-yellow-600';
      case 'baixo': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.projeto_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.autor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'todos' || report.tipo === filterType;
    const matchesStatus = filterStatus === 'todos' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const calculateSummaryMetrics = () => {
    const totalReports = reports.length;
    const publishedReports = reports.filter(r => r.status === 'publicado').length;
    const totalFindings = reports.reduce((sum, r) => sum + r.total_apontamentos, 0);
    const criticalFindings = reports.reduce((sum, r) => sum + r.apontamentos_criticos, 0);
    const totalRecommendations = reports.reduce((sum, r) => sum + r.recomendacoes_total, 0);
    const implementedRecommendations = reports.reduce((sum, r) => sum + r.recomendacoes_implementadas, 0);
    
    return {
      totalReports,
      publishedReports,
      totalFindings,
      criticalFindings,
      totalRecommendations,
      implementedRecommendations,
      implementationRate: totalRecommendations > 0 ? Math.round((implementedRecommendations / totalRecommendations) * 100) : 0
    };
  };

  const summaryMetrics = calculateSummaryMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/auditorias')}
            className="flex items-center gap-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Relatórios de Auditoria</h1>
            <p className="text-muted-foreground">Comunicação de resultados e dashboards analíticos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Relatórios</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-green-600">{summaryMetrics.publishedReports}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Apontamentos</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalFindings}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{summaryMetrics.criticalFindings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recomendações</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalRecommendations}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Implementadas</p>
                <p className="text-2xl font-bold text-green-600">{summaryMetrics.implementedRecommendations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Impl.</p>
                <p className="text-2xl font-bold">{summaryMetrics.implementationRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar relatórios..."
                className="pl-9 pr-4 py-2 border rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="todos">Todos os tipos</option>
              <option value="final">Final</option>
              <option value="executivo">Executivo</option>
              <option value="preliminar">Preliminar</option>
              <option value="seguimento">Seguimento</option>
              <option value="especial">Especial</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="todos">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="revisao">Em Revisão</option>
              <option value="aprovado">Aprovado</option>
              <option value="publicado">Publicado</option>
              <option value="distribuido">Distribuído</option>
            </select>
          </div>

          {/* Lista de Relatórios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReports.map(report => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.titulo}</CardTitle>
                      <CardDescription className="mt-1">{report.projeto_titulo}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={getTypeColor(report.tipo)}>
                        {report.tipo}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <p className="text-muted-foreground line-clamp-2">{report.resumo_executivo}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Autor:</p>
                      <p>{report.autor}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Versão:</p>
                      <p>{report.versao}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Criado:</p>
                      <p>{new Date(report.data_criacao).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risco Geral:</p>
                      <p className={getRiskColor(report.nivel_risco_geral)}>
                        {report.nivel_risco_geral.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <p className="font-medium text-red-600">{report.apontamentos_criticos}</p>
                        <p className="text-muted-foreground">Críticos</p>
                      </div>
                      <div>
                        <p className="font-medium text-orange-600">{report.apontamentos_altos}</p>
                        <p className="text-muted-foreground">Altos</p>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-600">{report.apontamentos_medios}</p>
                        <p className="text-muted-foreground">Médios</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-600">{report.apontamentos_baixos}</p>
                        <p className="text-muted-foreground">Baixos</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {report.status === 'aprovado' && (
                      <Button size="sm" className="flex-1">
                        <Send className="h-4 w-4 mr-1" />
                        Enviar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum relatório encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'todos' || filterStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando seu primeiro relatório de auditoria'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboards.map(dashboard => (
              <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {dashboard.nome}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {dashboard.tipo}
                    </Badge>
                  </div>
                  <CardDescription>{dashboard.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Widgets:</p>
                    <div className="flex flex-wrap gap-1">
                      {dashboard.widgets.map(widget => (
                        <Badge key={widget} variant="secondary" className="text-xs">
                          {widget}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Compartilhado com:</p>
                    <div className="flex flex-wrap gap-1">
                      {dashboard.compartilhado_com.map(user => (
                        <Badge key={user} variant="outline" className="text-xs">
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Atualização: {dashboard.automatico ? 'Automática' : 'Manual'}</p>
                    <p>Última atualização: {new Date(dashboard.data_atualizacao).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center py-8">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Dashboard
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição por Tipo de Relatório
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Tendência de Apontamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <LineChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Taxa de Implementação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Efetividade por Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Gráfico em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RelatoriosAuditoria;