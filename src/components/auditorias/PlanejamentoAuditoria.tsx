import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  BarChart3,
  FileText,
  ArrowLeft,
  Building,
  Shield,
  Search,
  Eye,
  Activity,
  Calendar,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { sanitizeInput, sanitizeObject, secureLog, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';

// Interfaces baseadas nas tabelas reais do banco de dados
interface ProjetoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo_auditoria: 'interna' | 'externa' | 'regulatoria' | 'especial';
  data_inicio: string;
  data_fim_planejada: string;
  data_fim_real?: string;
  status: 'planejamento' | 'em_execucao' | 'em_revisao' | 'concluido' | 'cancelado';
  fase_atual: 'planejamento' | 'fieldwork' | 'relatorio' | 'followup';
  chefe_auditoria: string;
  horas_orcadas: number;
  horas_realizadas: number;
  rating_geral?: 'eficaz' | 'parcialmente_eficaz' | 'ineficaz';
  total_apontamentos: number;
  apontamentos_criticos: number;
  apontamentos_altos: number;
  universo_auditavel: {
    nome: string;
    tipo: string;
    criticidade?: string;
  };
  chefe_profile: {
    full_name: string;
  };
}

interface UniversoAuditavel {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'processo' | 'subsidiaria' | 'sistema' | 'departamento' | 'outro';
  criticidade?: 'baixa' | 'media' | 'alta' | 'critica';
  frequencia_auditoria?: number;
  ultima_auditoria?: string;
  proxima_auditoria?: string;
  status: 'ativo' | 'inativo' | 'descontinuado';
}

interface RiscoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  categoria?: string;
  risco_inerente: number;
  risco_residual: number;
  status: 'ativo' | 'inativo' | 'em_revisao';
}

interface ControleAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  tipo: 'preventivo' | 'detectivo' | 'corretivo';
  natureza: 'manual' | 'automatico' | 'semi_automatico';
  design_adequado?: boolean;
  opera_efetivamente?: boolean;
}

export function PlanejamentoAuditoria() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  // Rate limiting para operações CRUD
  const rateLimitCRUD = useCRUDRateLimit();
  const [projetos, setProjetos] = useState<ProjetoAuditoria[]>([]);
  const [universo, setUniverso] = useState<UniversoAuditavel[]>([]);
  const [riscos, setRiscos] = useState<RiscoAuditoria[]>([]);
  const [controles, setControles] = useState<ControleAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('overview');
  
  secureLog('info', 'PlanejamentoAuditoria renderizado', { activeTab, projectsCount: projetos.length });

  useEffect(() => {
    loadPlanningData();
  }, [selectedYear]);

  const loadPlanningData = async () => {
    try {
      setLoading(true);
      
      // Verificar se tenant está definido
      if (!effectiveTenantId) {
        toast.error('Tenant não identificado. Por favor, faça login novamente.');
        setLoading(false);
        return;
      }
      
      // Carregar projetos de auditoria do ano selecionado
      const { data: projetosData, error: projetosError } = await supabase
        .from('projetos_auditoria')
        .select(`
          *,
          universo_auditavel:universo_auditavel_id(
            nome,
            tipo,
            criticidade
          ),
          chefe_profile:chefe_auditoria(
            full_name
          )
        `)
.eq('tenant_id', effectiveTenantId)
        .gte('data_inicio', `${selectedYear}-01-01`)
        .lt('data_inicio', `${selectedYear + 1}-01-01`)
        .order('created_at', { ascending: false });

      if (projetosError) {
        secureLog('error', 'Erro ao carregar projetos de auditoria', projetosError);
      } else {
        setProjetos(projetosData || []);
      }

      // Carregar universo auditável
      const { data: universoData, error: universoError } = await supabase
        .from('universo_auditavel')
        .select('*')
.eq('tenant_id', effectiveTenantId)
        .eq('status', 'ativo')
        .order('nome');

      if (universoError) {
        secureLog('error', 'Erro ao carregar universo auditável', universoError);
      } else {
        setUniverso(universoData || []);
      }

      // Carregar riscos de auditoria
      const { data: riscosData, error: riscosError } = await supabase
        .from('riscos_auditoria')
        .select('*')
.eq('tenant_id', effectiveTenantId)
        .eq('status', 'ativo')
        .order('risco_residual', { ascending: false })
        .limit(10);

      if (riscosError) {
        secureLog('error', 'Erro ao carregar riscos', riscosError);
      } else {
        setRiscos(riscosData || []);
      }

      // Carregar controles de auditoria
      const { data: controlesData, error: controlesError } = await supabase
        .from('controles_auditoria')
        .select('*')
.eq('tenant_id', effectiveTenantId)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })
        .limit(10);

      if (controlesError) {
        secureLog('error', 'Erro ao carregar controles', controlesError);
      } else {
        setControles(controlesData || []);
      }

    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de planejamento', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'em_andamento': case 'em_execucao': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'em_revisao': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'planejamento': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'aprovado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'agendado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rascunho': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };


  const calculateMetrics = () => {
    const totalProjetos = projetos.length;
    const concluidos = projetos.filter(p => p.status === 'concluido').length;
    const emAndamento = projetos.filter(p => p.status === 'em_execucao').length;
    const emPlanejamento = projetos.filter(p => p.status === 'planejamento').length;
    const totalApontamentos = projetos.reduce((sum, p) => sum + (p.total_apontamentos || 0), 0);
    const apontamentosCriticos = projetos.reduce((sum, p) => sum + (p.apontamentos_criticos || 0), 0);
    const horasPlanejadas = projetos.reduce((sum, p) => sum + (p.horas_orcadas || 0), 0);
    const horasRealizadas = projetos.reduce((sum, p) => sum + (p.horas_realizadas || 0), 0);
    
    return {
      totalProjetos,
      concluidos,
      emAndamento,
      emPlanejamento,
      totalApontamentos,
      apontamentosCriticos,
      horasPlanejadas,
      horasRealizadas,
      completionRate: totalProjetos > 0 ? Math.round((concluidos / totalProjetos) * 100) : 0,
      universoTotal: universo.length,
      riscosAltos: riscos.filter(r => r.risco_residual >= 15).length,
      controlesEfetivos: controles.filter(c => c.opera_efetivamente === true).length
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Botão Voltar */}
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
            <h1 className="text-2xl sm:text-3xl font-bold">Planejamento de Auditoria</h1>
            <p className="text-muted-foreground">Gestão estratégica do plano anual de auditorias - ATUALIZADO</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value={selectedYear - 1}>{selectedYear - 1}</option>
            <option value={selectedYear}>{selectedYear}</option>
            <option value={selectedYear + 1}>{selectedYear + 1}</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projetos</p>
                <p className="text-2xl font-bold">{metrics.totalProjetos}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.concluidos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.emAndamento}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Apontamentos</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.totalApontamentos}</p>
                <p className="text-xs text-red-600">{metrics.apontamentosCriticos} críticos</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Universo</p>
                <p className="text-2xl font-bold">{metrics.universoTotal}</p>
                <p className="text-xs text-muted-foreground">entidades</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold">{metrics.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs - COMPONENTE ATUALIZADO */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral & Trabalhos</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
        </TabsList>

        {/* Tab Visão Geral & Trabalhos (Mesclada) */}
        <TabsContent value="overview" className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projetos de Auditoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Projetos de Auditoria ({selectedYear})
                </CardTitle>
                <CardDescription>
                  Projetos de auditoria planejados e em execução
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projetos.slice(0, 5).map(projeto => (
                    <div key={projeto.id} className="p-4 border rounded hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{projeto.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{projeto.codigo}</p>
                        </div>
                        <div className="flex gap-1 flex-col items-end">
                          <Badge className={getStatusColor(projeto.status)}>
                            {projeto.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {projeto.tipo_auditoria}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Universo:</p>
                          <p className="font-medium">{projeto.universo_auditavel?.nome || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Chefe:</p>
                          <p className="font-medium">{projeto.chefe_profile?.full_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Período:</p>
                          <p className="text-xs">
                            {projeto.data_inicio ? new Date(projeto.data_inicio).toLocaleDateString() : 'N/A'} - 
                            {projeto.data_fim_planejada ? new Date(projeto.data_fim_planejada).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Apontamentos:</p>
                          <p className="font-medium">
                            {projeto.total_apontamentos} 
                            {projeto.apontamentos_criticos > 0 && (
                              <span className="text-red-600 ml-1">({projeto.apontamentos_criticos} críticos)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {projeto.rating_geral && (
                        <div className="mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              projeto.rating_geral === 'eficaz' ? 'bg-green-50 text-green-700' :
                              projeto.rating_geral === 'parcialmente_eficaz' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-red-50 text-red-700'
                            }`}
                          >
                            Rating: {projeto.rating_geral.replace('_', ' ')}
                          </Badge>
                        </div>
                      )}
                      <div className="flex justify-end mt-3 space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {projetos.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nenhum projeto de auditoria para {selectedYear}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Universo Auditável e Riscos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Universo Auditável & Riscos
                </CardTitle>
                <CardDescription>
                  Entidades auditáveis e principais riscos identificados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Universo Auditável */}
                  <div>
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Entidades Críticas
                    </h5>
                    <div className="space-y-2">
                      {universo
                        .filter(u => u.criticidade === 'critica' || u.criticidade === 'alta')
                        .slice(0, 3)
                        .map(entidade => (
                        <div key={entidade.id} className="p-2 bg-muted rounded text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{entidade.nome}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">{entidade.tipo}</Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  entidade.criticidade === 'critica' ? 'bg-red-50 text-red-700' :
                                  entidade.criticidade === 'alta' ? 'bg-orange-50 text-orange-700' :
                                  'bg-gray-50 text-gray-700'
                                }`}
                              >
                                {entidade.criticidade}
                              </Badge>
                            </div>
                          </div>
                          {entidade.proxima_auditoria && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Próxima auditoria: {new Date(entidade.proxima_auditoria).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Riscos Altos */}
                  <div>
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Riscos de Alto Impacto
                    </h5>
                    <div className="space-y-2">
                      {riscos.slice(0, 3).map(risco => (
                        <div key={risco.id} className="p-2 bg-muted rounded text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{risco.titulo}</span>
                            <div className="flex gap-1 items-center">
                              <Badge variant="outline" className="text-xs">{risco.categoria}</Badge>
                              <div className={`w-3 h-3 rounded-full ${
                                risco.risco_residual >= 20 ? 'bg-red-500' :
                                risco.risco_residual >= 15 ? 'bg-orange-500' :
                                risco.risco_residual >= 10 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Risco residual: {risco.risco_residual} | {risco.codigo}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {controles.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Controles Recentes
                      </h5>
                      <div className="text-xs text-muted-foreground">
                        {metrics.controlesEfetivos} de {controles.length} controles operando efetivamente
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista Completa de Trabalhos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Todos os Trabalhos de Auditoria
              </CardTitle>
              <CardDescription>
                Lista completa dos trabalhos planejados e em execução para {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projetos.map(projeto => (
                  <div key={projeto.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        projeto.status === 'concluido' ? 'bg-green-500' :
                        projeto.status === 'em_execucao' ? 'bg-blue-500' :
                        projeto.status === 'em_revisao' ? 'bg-purple-500' :
                        projeto.status === 'planejamento' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{projeto.titulo}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{projeto.universo_auditavel?.nome || 'N/A'}</span>
                          <span>•</span>
                          <span>{projeto.tipo_auditoria}</span>
                          <span>•</span>
                          <span>{projeto.horas_orcadas}h planejadas</span>
                          <span>•</span>
                          <span>{projeto.data_inicio ? new Date(projeto.data_inicio).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(projeto.status)}>
                        {projeto.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {projetos.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum trabalho de auditoria encontrado para {selectedYear}</p>
                    <Button className="mt-4" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Trabalho
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cronograma */}
        <TabsContent value="cronograma" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cronograma de Execução {selectedYear}
              </CardTitle>
              <CardDescription>
                Timeline dos trabalhos de auditoria planejados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projetos
                  .sort((a, b) => new Date(a.data_inicio || '').getTime() - new Date(b.data_inicio || '').getTime())
                  .map((projeto) => {
                    const inicio = projeto.data_inicio ? new Date(projeto.data_inicio) : null;
                    const fim = projeto.data_fim_planejada ? new Date(projeto.data_fim_planejada) : null;
                    const duracao = inicio && fim ? Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <div key={projeto.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex flex-col items-center text-center min-w-[60px]">
                          <div className="text-lg font-medium">{inicio ? inicio.getDate() : '--'}</div>
                          <div className="text-xs text-muted-foreground">
                            {inicio ? inicio.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase() : '---'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inicio ? inicio.getFullYear() : '----'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{projeto.titulo}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(projeto.status)}>
                                {projeto.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {projeto.tipo_auditoria}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {projeto.universo_auditavel?.nome || 'N/A'} • {projeto.chefe_profile?.full_name || 'N/A'} • {duracao} dias • {projeto.horas_orcadas}h
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {inicio ? inicio.toLocaleDateString('pt-BR') : 'Data não definida'} até {fim ? fim.toLocaleDateString('pt-BR') : 'Data não definida'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {projetos.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum cronograma disponível para {selectedYear}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PlanejamentoAuditoria;