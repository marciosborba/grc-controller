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
  ArrowUp,
  ArrowDown,
  Minus,
  Building,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

// Interfaces para o planejamento estratégico
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
  data_inicio: string;
  data_fim_planejada: string;
  meta_valor_alvo?: number;
  valor_atual?: number;
  responsavel_profile?: {
    full_name: string;
  };
}

interface IniciativaEstrategica {
  id: string;
  codigo: string;
  titulo: string;
  tipo: 'projeto' | 'programa' | 'processo' | 'acao_continua';
  status: 'planejado' | 'iniciado' | 'em_andamento' | 'em_risco' | 'atrasado' | 'pausado' | 'concluido' | 'cancelado';
  saude_projeto?: 'verde' | 'amarelo' | 'vermelho';
  percentual_conclusao: number;
  data_inicio: string;
  data_fim_planejada: string;
  orcamento_planejado?: number;
  orcamento_realizado: number;
  responsavel_profile?: {
    full_name: string;
  };
}

interface KPIData {
  id: string;
  nome: string;
  meta_valor: number;
  valor_atual?: number;
  unidade_medida?: string;
  status_atual: 'verde' | 'amarelo' | 'vermelho';
}

export function PlanejamentoEstrategicoDashboard() {
  const { user } = useAuth();
  const [planos, setPlanos] = useState<PlanoEstrategico[]>([]);
  const [objetivos, setObjetivos] = useState<ObjetivoEstrategico[]>([]);
  const [iniciativas, setIniciativas] = useState<IniciativaEstrategica[]>([]);
  const [kpis, setKPIs] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visao-geral');

  useEffect(() => {
    loadPlanejamentoData();
  }, [user]);

  const loadPlanejamentoData = async () => {
    if (!user?.tenant?.id) return;

    try {
      setLoading(true);
      
      // Carregar planos estratégicos
      const { data: planosData, error: planosError } = await supabase
        .from('planos_estrategicos')
        .select(`
          *,
          responsavel_profile:responsavel_id(full_name)
        `)
        .eq('tenant_id', user.tenant.id)
        .order('created_at', { ascending: false });

      if (planosError) {
        console.error('Erro ao carregar planos estratégicos:', planosError);
      } else {
        setPlanos(planosData || []);
      }

      // Carregar objetivos estratégicos  
      const { data: objetivosData, error: objetivosError } = await supabase
        .from('objetivos_estrategicos')
        .select(`
          *,
          responsavel_profile:responsavel_id(full_name)
        `)
        .eq('tenant_id', user.tenant.id)
        .order('data_inicio', { ascending: true });

      if (objetivosError) {
        console.error('Erro ao carregar objetivos:', objetivosError);
      } else {
        setObjetivos(objetivosData || []);
      }

      // Carregar iniciativas estratégicas
      const { data: iniciativasData, error: iniciativasError } = await supabase
        .from('iniciativas_estrategicas')
        .select(`
          *,
          responsavel_profile:responsavel_id(full_name)
        `)
        .eq('tenant_id', user.tenant.id)
        .order('data_inicio', { ascending: true });

      if (iniciativasError) {
        console.error('Erro ao carregar iniciativas:', iniciativasError);
      } else {
        setIniciativas(iniciativasData || []);
      }

      // Carregar KPIs (simulado - será implementado quando houver medições)
      setKPIs([
        { id: '1', nome: 'ROI Geral', meta_valor: 15, valor_atual: 12.5, unidade_medida: '%', status_atual: 'amarelo' },
        { id: '2', nome: 'NPS Clientes', meta_valor: 70, valor_atual: 68, unidade_medida: 'pontos', status_atual: 'verde' },
        { id: '3', nome: 'Prazo Médio Projetos', meta_valor: 90, valor_atual: 105, unidade_medida: 'dias', status_atual: 'vermelho' },
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados de planejamento:', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalPlanos = planos.length;
    const planosAtivos = planos.filter(p => p.status === 'em_execucao' || p.status === 'aprovado').length;
    
    const totalObjetivos = objetivos.length;
    const objetivosConcluidos = objetivos.filter(o => o.status === 'concluido').length;
    const objetivosEmRisco = objetivos.filter(o => o.status === 'em_risco' || o.status === 'atrasado').length;
    
    const totalIniciativas = iniciativas.length;
    const iniciativasConcluidas = iniciativas.filter(i => i.status === 'concluido').length;
    const iniciativasEmRisco = iniciativas.filter(i => i.saude_projeto === 'vermelho').length;
    
    const orcamentoTotal = planos.reduce((sum, p) => sum + (p.orcamento_total || 0), 0);
    const orcamentoConsumido = planos.reduce((sum, p) => sum + (p.orcamento_consumido || 0), 0);
    
    const kpisVerdes = kpis.filter(k => k.status_atual === 'verde').length;
    const kpisVermelhos = kpis.filter(k => k.status_atual === 'vermelho').length;

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
      kpisVerdes,
      kpisVermelhos,
      taxaConclusaoObjetivos: totalObjetivos > 0 ? Math.round((objetivosConcluidos / totalObjetivos) * 100) : 0,
      taxaConclusaoIniciativas: totalIniciativas > 0 ? Math.round((iniciativasConcluidas / totalIniciativas) * 100) : 0
    };
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'concluido': 'bg-green-100 text-green-800',
      'em_execucao': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-blue-100 text-blue-800',
      'em_risco': 'bg-red-100 text-red-800',
      'atrasado': 'bg-red-100 text-red-800',
      'planejado': 'bg-gray-100 text-gray-800',
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

  const getHealthColor = (health?: string) => {
    const healthColors = {
      'verde': 'bg-green-100 text-green-800',
      'amarelo': 'bg-yellow-100 text-yellow-800',
      'vermelho': 'bg-red-100 text-red-800'
    };
    return healthColors[health as keyof typeof healthColors] || 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Planejamento Estratégico</h1>
          <p className="text-muted-foreground">Central de gestão e acompanhamento estratégico organizacional</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planos Estratégicos</p>
                <p className="text-2xl font-bold">{metrics.totalPlanos}</p>
                <p className="text-xs text-muted-foreground">{metrics.planosAtivos} ativos</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objetivos Estratégicos</p>
                <p className="text-2xl font-bold">{metrics.totalObjetivos}</p>
                <p className="text-xs text-green-600">{metrics.taxaConclusaoObjetivos}% concluídos</p>
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
                <p className="text-2xl font-bold">{metrics.totalIniciativas}</p>
                <p className="text-xs text-red-600">{metrics.iniciativasEmRisco} em risco</p>
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
                <p className="text-2xl font-bold">{metrics.orcamentoPercentual}%</p>
                <p className="text-xs text-muted-foreground">R$ {metrics.orcamentoConsumido.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
          <TabsTrigger value="iniciativas">Iniciativas</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
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
                  {planos.slice(0, 3).map(plano => (
                    <div key={plano.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{plano.titulo}</h4>
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
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KPIs de Destaque */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Indicadores Principais
                </CardTitle>
                <CardDescription>Principais KPIs organizacionais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis.map(kpi => (
                    <div key={kpi.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{kpi.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Meta: {kpi.meta_valor} {kpi.unidade_medida}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {kpi.valor_atual} {kpi.unidade_medida}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${ 
                          kpi.status_atual === 'verde' ? 'bg-green-500' :
                          kpi.status_atual === 'amarelo' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="objetivos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos Estratégicos</CardTitle>
              <CardDescription>Acompanhamento detalhado dos objetivos organizacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {objetivos.map(objetivo => (
                  <div key={objetivo.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{objetivo.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{objetivo.codigo}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(objetivo.prioridade)}>
                          {objetivo.prioridade}
                        </Badge>
                        <Badge className={getStatusColor(objetivo.status)}>
                          {objetivo.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <Progress value={objetivo.percentual_conclusao} className="mt-1" />
                        <p className="text-xs text-right mt-1">{objetivo.percentual_conclusao}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Prazo</p>
                        <p className="text-sm font-medium">
                          {new Date(objetivo.data_fim_planejada).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Responsável</p>
                        <p className="text-sm font-medium">
                          {objetivo.responsavel_profile?.full_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {objetivos.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum objetivo estratégico cadastrado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iniciativas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Iniciativas Estratégicas</CardTitle>
              <CardDescription>Projetos e programas para alcançar os objetivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {iniciativas.map(iniciativa => (
                  <div key={iniciativa.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{iniciativa.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{iniciativa.codigo} • {iniciativa.tipo}</p>
                      </div>
                      <div className="flex gap-2">
                        {iniciativa.saude_projeto && (
                          <Badge className={getHealthColor(iniciativa.saude_projeto)}>
                            {iniciativa.saude_projeto}
                          </Badge>
                        )}
                        <Badge className={getStatusColor(iniciativa.status)}>
                          {iniciativa.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Progresso</p>
                        <Progress value={iniciativa.percentual_conclusao} className="mt-1" />
                        <p className="text-xs text-right mt-1">{iniciativa.percentual_conclusao}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Orçamento</p>
                        <p className="text-sm font-medium">
                          R$ {iniciativa.orcamento_realizado.toLocaleString()} / {iniciativa.orcamento_planejado?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Prazo</p>
                        <p className="text-sm font-medium">
                          {new Date(iniciativa.data_fim_planejada).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Responsável</p>
                        <p className="text-sm font-medium">
                          {iniciativa.responsavel_profile?.full_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {iniciativas.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhuma iniciativa estratégica cadastrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo dos KPIs */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos KPIs</CardTitle>
                <CardDescription>Resumo do desempenho dos indicadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>KPIs no Target</span>
                    </div>
                    <span className="font-bold">{metrics.kpisVerdes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>KPIs em Atenção</span>
                    </div>
                    <span className="font-bold">{kpis.filter(k => k.status_atual === 'amarelo').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>KPIs Críticos</span>
                    </div>
                    <span className="font-bold">{metrics.kpisVermelhos}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista Detalhada de KPIs */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento dos KPIs</CardTitle>
                <CardDescription>Valores atuais vs. metas estabelecidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis.map(kpi => (
                    <div key={kpi.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{kpi.nome}</h4>
                        <div className={`w-3 h-3 rounded-full ${ 
                          kpi.status_atual === 'verde' ? 'bg-green-500' :
                          kpi.status_atual === 'amarelo' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor Atual</p>
                          <p className="font-bold">{kpi.valor_atual} {kpi.unidade_medida}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Meta</p>
                          <p className="font-bold">{kpi.meta_valor} {kpi.unidade_medida}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PlanejamentoEstrategicoDashboard;