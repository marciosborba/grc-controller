import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Calendar,
  Zap,
  Award,
  Clock,
  DollarSign,
  Briefcase,
  Activity,
  Building,
  MapPin,
  FileText,
  Search,
  Shield,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

// Interfaces unificadas
interface ProjetoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo_auditoria: 'interna' | 'externa' | 'regulatoria' | 'especial';
  data_inicio: string;
  data_fim_planejada: string;
  status: 'planejamento' | 'em_execucao' | 'em_revisao' | 'concluido' | 'cancelado';
  fase_atual: 'planejamento' | 'fieldwork' | 'relatorio' | 'followup';
  horas_orcadas: number;
  horas_realizadas: number;
  total_apontamentos: number;
  apontamentos_criticos: number;
  apontamentos_altos: number;
  universo_auditavel?: {
    nome: string;
    tipo: string;
    criticidade?: string;
  };
  chefe_profile?: {
    full_name: string;
  };
}

interface PlanoEstrategico {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  ano_inicio: number;
  ano_fim: number;
  status: 'rascunho' | 'em_aprovacao' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado' | 'suspenso';
  percentual_conclusao: number;
  orcamento_total?: number;
  orcamento_consumido: number;
  responsavel_profile?: {
    full_name: string;
  };
}

interface ObjetivoEstrategico {
  id: string;
  codigo: string;
  titulo: string;
  categoria?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'planejado' | 'em_andamento' | 'em_risco' | 'atrasado' | 'concluido' | 'cancelado';
  percentual_conclusao: number;
  data_fim_planejada: string;
  meta_valor_alvo?: number;
  valor_atual?: number;
}

interface IniciativaEstrategica {
  id: string;
  codigo: string;
  titulo: string;
  tipo: 'projeto' | 'programa' | 'processo' | 'acao_continua';
  status: 'planejado' | 'iniciado' | 'em_andamento' | 'em_risco' | 'atrasado' | 'pausado' | 'concluido' | 'cancelado';
  saude_projeto?: 'verde' | 'amarelo' | 'vermelho';
  percentual_conclusao: number;
  data_fim_planejada: string;
  orcamento_planejado?: number;
  orcamento_realizado: number;
}

interface RiscoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  categoria?: string;
  risco_inerente: number;
  risco_residual: number;
  status: string;
}

interface UniversoAuditavel {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'processo' | 'subsidiaria' | 'sistema' | 'departamento' | 'outro';
  criticidade?: 'baixa' | 'media' | 'alta' | 'critica';
  proxima_auditoria?: string;
  status: string;
}

export function PlanejamentoCompletoDashboard() {
  const { user } = useAuth();
  
  // Estados para Auditoria
  const [projetosAuditoria, setProjetosAuditoria] = useState<ProjetoAuditoria[]>([]);
  const [universoAuditavel, setUniversoAuditavel] = useState<UniversoAuditavel[]>([]);
  const [riscosAuditoria, setRiscosAuditoria] = useState<RiscoAuditoria[]>([]);
  
  // Estados para Planejamento Estratégico
  const [planosEstrategicos, setPlanosEstrategicos] = useState<PlanoEstrategico[]>([]);
  const [objetivosEstrategicos, setObjetivosEstrategicos] = useState<ObjetivoEstrategico[]>([]);
  const [iniciativasEstrategicas, setIniciativasEstrategicas] = useState<IniciativaEstrategica[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('auditoria');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAllData();
  }, [user, selectedYear]);

  const loadAllData = async () => {
    if (!user?.tenant?.id) return;

    try {
      setLoading(true);
      
      // Carregar dados de Auditoria
      await Promise.all([
        loadProjetosAuditoria(),
        loadUniversoAuditavel(),
        loadRiscosAuditoria(),
        loadPlanosEstrategicos(),
        loadObjetivosEstrategicos(),
        loadIniciativasEstrategicas()
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  const loadProjetosAuditoria = async () => {
    const { data, error } = await supabase
      .from('projetos_auditoria')
      .select(`
        *,
        universo_auditavel:universo_auditavel_id(nome, tipo, criticidade),
        chefe_profile:chefe_auditoria(full_name)
      `)
      .eq('tenant_id', user?.tenant?.id)
      .gte('data_inicio', `${selectedYear}-01-01`)
      .lt('data_inicio', `${selectedYear + 1}-01-01`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar projetos de auditoria:', error);
    } else {
      setProjetosAuditoria(data || []);
    }
  };

  const loadUniversoAuditavel = async () => {
    const { data, error } = await supabase
      .from('universo_auditavel')
      .select('*')
      .eq('tenant_id', user?.tenant?.id)
      .eq('status', 'ativo')
      .order('nome');

    if (error) {
      console.error('Erro ao carregar universo auditável:', error);
    } else {
      setUniversoAuditavel(data || []);
    }
  };

  const loadRiscosAuditoria = async () => {
    const { data, error } = await supabase
      .from('riscos_auditoria')
      .select('*')
      .eq('tenant_id', user?.tenant?.id)
      .eq('status', 'ativo')
      .order('risco_residual', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao carregar riscos:', error);
    } else {
      setRiscosAuditoria(data || []);
    }
  };

  const loadPlanosEstrategicos = async () => {
    const { data, error } = await supabase
      .from('planos_estrategicos')
      .select(`
        *,
        responsavel_profile:responsavel_id(full_name)
      `)
      .eq('tenant_id', user?.tenant?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar planos estratégicos:', error);
    } else {
      setPlanosEstrategicos(data || []);
    }
  };

  const loadObjetivosEstrategicos = async () => {
    const { data, error } = await supabase
      .from('objetivos_estrategicos')
      .select('*')
      .eq('tenant_id', user?.tenant?.id)
      .order('data_inicio', { ascending: true });

    if (error) {
      console.error('Erro ao carregar objetivos:', error);
    } else {
      setObjetivosEstrategicos(data || []);
    }
  };

  const loadIniciativasEstrategicas = async () => {
    const { data, error } = await supabase
      .from('iniciativas_estrategicas')
      .select('*')
      .eq('tenant_id', user?.tenant?.id)
      .order('data_inicio', { ascending: true });

    if (error) {
      console.error('Erro ao carregar iniciativas:', error);
    } else {
      setIniciativasEstrategicas(data || []);
    }
  };

  const calculateAuditMetrics = () => {
    const totalProjetos = projetosAuditoria.length;
    const concluidos = projetosAuditoria.filter(p => p.status === 'concluido').length;
    const emExecucao = projetosAuditoria.filter(p => p.status === 'em_execucao').length;
    const totalApontamentos = projetosAuditoria.reduce((sum, p) => sum + (p.total_apontamentos || 0), 0);
    const apontamentosCriticos = projetosAuditoria.reduce((sum, p) => sum + (p.apontamentos_criticos || 0), 0);
    const horasRealizadas = projetosAuditoria.reduce((sum, p) => sum + (p.horas_realizadas || 0), 0);
    const horasOrcadas = projetosAuditoria.reduce((sum, p) => sum + (p.horas_orcadas || 0), 0);

    return {
      totalProjetos,
      concluidos,
      emExecucao,
      totalApontamentos,
      apontamentosCriticos,
      horasRealizadas,
      horasOrcadas,
      taxaConclusao: totalProjetos > 0 ? Math.round((concluidos / totalProjetos) * 100) : 0,
      universoTotal: universoAuditavel.length,
      riscosAltos: riscosAuditoria.filter(r => r.risco_residual >= 15).length
    };
  };

  const calculateStrategicMetrics = () => {
    const totalPlanos = planosEstrategicos.length;
    const planosAtivos = planosEstrategicos.filter(p => p.status === 'em_execucao' || p.status === 'aprovado').length;
    
    const totalObjetivos = objetivosEstrategicos.length;
    const objetivosConcluidos = objetivosEstrategicos.filter(o => o.status === 'concluido').length;
    const objetivosEmRisco = objetivosEstrategicos.filter(o => o.status === 'em_risco' || o.status === 'atrasado').length;
    
    const totalIniciativas = iniciativasEstrategicas.length;
    const iniciativasConcluidas = iniciativasEstrategicas.filter(i => i.status === 'concluido').length;
    const iniciativasEmRisco = iniciativasEstrategicas.filter(i => i.saude_projeto === 'vermelho').length;
    
    const orcamentoTotal = planosEstrategicos.reduce((sum, p) => sum + (p.orcamento_total || 0), 0);
    const orcamentoConsumido = planosEstrategicos.reduce((sum, p) => sum + (p.orcamento_consumido || 0), 0);

    return {
      totalPlanos,
      planosAtivos,
      totalObjetivos,
      objetivosConcluidos,
      objetivosEmRisco,
      totalIniciativas,
      iniciativasConcluidas,
      iniciativasEmRisco,
      orcamentoTotal,
      orcamentoConsumido,
      orcamentoPercentual: orcamentoTotal > 0 ? Math.round((orcamentoConsumido / orcamentoTotal) * 100) : 0,
      taxaConclusaoObjetivos: totalObjetivos > 0 ? Math.round((objetivosConcluidos / totalObjetivos) * 100) : 0
    };
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'concluido': 'bg-green-100 text-green-800',
      'em_execucao': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-blue-100 text-blue-800',
      'em_risco': 'bg-red-100 text-red-800',
      'atrasado': 'bg-red-100 text-red-800',
      'planejamento': 'bg-orange-100 text-orange-800',
      'aprovado': 'bg-green-100 text-green-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (prioridade: string) => {
    const priorityColors = {
      'critica': 'bg-red-100 text-red-800',
      'alta': 'bg-orange-100 text-orange-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'baixa': 'bg-green-100 text-green-800'
    };
    return priorityColors[prioridade as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
  };

  const auditMetrics = calculateAuditMetrics();
  const strategicMetrics = calculateStrategicMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Central de Planejamento</h1>
          <p className="text-muted-foreground">Sistema integrado de auditoria e planejamento estratégico organizacional</p>
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
            Novo Item
          </Button>
        </div>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auditoria">Módulo Auditoria</TabsTrigger>
          <TabsTrigger value="estrategico">Planejamento Estratégico</TabsTrigger>
        </TabsList>

        {/* TAB: Módulo de Auditoria */}
        <TabsContent value="auditoria" className="space-y-6">
          {/* Métricas de Auditoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projetos {selectedYear}</p>
                    <p className="text-2xl font-bold">{auditMetrics.totalProjetos}</p>
                  </div>
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold text-green-600">{auditMetrics.concluidos}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{auditMetrics.emExecucao}</p>
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
                    <p className="text-2xl font-bold text-orange-600">{auditMetrics.totalApontamentos}</p>
                    <p className="text-xs text-red-600">{auditMetrics.apontamentosCriticos} críticos</p>
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
                    <p className="text-2xl font-bold">{auditMetrics.universoTotal}</p>
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
                    <p className="text-2xl font-bold">{auditMetrics.taxaConclusao}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projetos de Auditoria Detalhados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Projetos de Auditoria ({selectedYear})
                </CardTitle>
                <CardDescription>
                  Acompanhamento detalhado dos projetos em execução
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projetosAuditoria.length > 0 ? projetosAuditoria.slice(0, 5).map(projeto => (
                    <div key={projeto.id} className="p-4 border rounded-lg">
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
                            {new Date(projeto.data_inicio).toLocaleDateString()} - 
                            {new Date(projeto.data_fim_planejada).toLocaleDateString()}
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

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Horas: {projeto.horas_realizadas}h / {projeto.horas_orcadas}h</span>
                          <span>Fase: {projeto.fase_atual}</span>
                        </div>
                        <Progress 
                          value={projeto.horas_orcadas > 0 ? (projeto.horas_realizadas / projeto.horas_orcadas) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nenhum projeto de auditoria para {selectedYear}</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                      >
                        Criar Primeiro Projeto
                      </Button>
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
                  Entidades críticas e principais riscos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Universo Auditável */}
                  {universoAuditavel.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Entidades Críticas
                      </h5>
                      <div className="space-y-2">
                        {universoAuditavel
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
                  )}

                  {/* Riscos de Auditoria */}
                  {riscosAuditoria.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Riscos de Alto Impacto
                      </h5>
                      <div className="space-y-2">
                        {riscosAuditoria.slice(0, 3).map(risco => (
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
                  )}

                  {universoAuditavel.length === 0 && riscosAuditoria.length === 0 && (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Configure o universo auditável</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                      >
                        Configurar Universo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Planejamento Estratégico */}
        <TabsContent value="estrategico" className="space-y-6">
          {/* Métricas Estratégicas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Planos Estratégicos</p>
                    <p className="text-2xl font-bold">{strategicMetrics.totalPlanos}</p>
                    <p className="text-xs text-muted-foreground">{strategicMetrics.planosAtivos} ativos</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Objetivos</p>
                    <p className="text-2xl font-bold">{strategicMetrics.totalObjetivos}</p>
                    <p className="text-xs text-green-600">{strategicMetrics.taxaConclusaoObjetivos}% concluídos</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Iniciativas</p>
                    <p className="text-2xl font-bold">{strategicMetrics.totalIniciativas}</p>
                    <p className="text-xs text-red-600">{strategicMetrics.iniciativasEmRisco} em risco</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Orçamento</p>
                    <p className="text-2xl font-bold">{strategicMetrics.orcamentoPercentual}%</p>
                    <p className="text-xs text-muted-foreground">R$ {strategicMetrics.orcamentoConsumido.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Planos Estratégicos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Planos Estratégicos
                </CardTitle>
                <CardDescription>Status dos planos organizacionais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planosEstrategicos.length > 0 ? planosEstrategicos.slice(0, 3).map(plano => (
                    <div key={plano.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{plano.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{plano.codigo}</p>
                        </div>
                        <Badge className={getStatusColor(plano.status)}>
                          {plano.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>{plano.percentual_conclusao}%</span>
                        </div>
                        <Progress value={plano.percentual_conclusao} className="h-2" />
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>Período: {plano.ano_inicio}-{plano.ano_fim}</div>
                          <div>Responsável: {plano.responsavel_profile?.full_name || 'N/A'}</div>
                        </div>
                        {plano.orcamento_total && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Orçamento: </span>
                            <span className="font-medium">
                              R$ {plano.orcamento_consumido.toLocaleString()} / {plano.orcamento_total.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Nenhum plano estratégico cadastrado</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                      >
                        Criar Primeiro Plano
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Objetivos e Iniciativas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Objetivos & Iniciativas
                </CardTitle>
                <CardDescription>Acompanhamento de objetivos e iniciativas estratégicas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Objetivos */}
                  {objetivosEstrategicos.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Objetivos Estratégicos</h5>
                      <div className="space-y-2">
                        {objetivosEstrategicos.slice(0, 2).map(objetivo => (
                          <div key={objetivo.id} className="p-3 bg-muted rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{objetivo.titulo}</span>
                              <div className="flex gap-1">
                                <Badge className={getPriorityColor(objetivo.prioridade)} variant="outline">
                                  {objetivo.prioridade}
                                </Badge>
                                <Badge className={getStatusColor(objetivo.status)} variant="outline">
                                  {objetivo.status}
                                </Badge>
                              </div>
                            </div>
                            <Progress value={objetivo.percentual_conclusao} className="h-1 mb-1" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{objetivo.percentual_conclusao}% concluído</span>
                              <span>Meta: {new Date(objetivo.data_fim_planejada).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Iniciativas */}
                  {iniciativasEstrategicas.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Iniciativas Estratégicas</h5>
                      <div className="space-y-2">
                        {iniciativasEstrategicas.slice(0, 2).map(iniciativa => (
                          <div key={iniciativa.id} className="p-3 bg-muted rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{iniciativa.titulo}</span>
                              <div className="flex gap-1">
                                {iniciativa.saude_projeto && (
                                  <div className={`w-3 h-3 rounded-full ${
                                    iniciativa.saude_projeto === 'verde' ? 'bg-green-500' :
                                    iniciativa.saude_projeto === 'amarelo' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}></div>
                                )}
                                <Badge variant="outline" className="text-xs">{iniciativa.tipo}</Badge>
                              </div>
                            </div>
                            <Progress value={iniciativa.percentual_conclusao} className="h-1 mb-1" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{iniciativa.percentual_conclusao}% concluído</span>
                              <span>R$ {iniciativa.orcamento_realizado.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {objetivosEstrategicos.length === 0 && iniciativasEstrategicas.length === 0 && (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Configure objetivos e iniciativas</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                      >
                        Configurar Objetivos
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PlanejamentoCompletoDashboard;