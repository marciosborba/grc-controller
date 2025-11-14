import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  User,
  Target,
  BarChart3,
  Plus,
  Edit,
  Eye,
  Send,
  FileText,
  Search,
  Filter,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActionPlanManager } from './ActionPlanManager';

interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  apontamento_origem: string;
  responsavel: string;
  prazo_implementacao: string;
  status: 'pendente' | 'em_andamento' | 'implementado' | 'verificado' | 'atrasado';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  progresso: number;
  data_inicio?: string;
  data_conclusao?: string;
  evidencias_implementacao: string[];
  observacoes: string;
  custo_implementacao?: number;
}

interface MonitoringItem {
  id: string;
  plano_acao_id: string;
  data_verificacao: string;
  status_verificado: string;
  observacoes: string;
  verificado_por: string;
  proxima_verificacao?: string;
}

interface FollowUpSummary {
  total_planos: number;
  implementados: number;
  em_andamento: number;
  atrasados: number;
  taxa_implementacao: number;
  prazo_medio_implementacao: number;
}

interface FollowUpPhaseProps {
  project: any;
}

export function FollowUpPhase({ project }: FollowUpPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [monitoring, setMonitoring] = useState<MonitoringItem[]>([]);
  const [summary, setSummary] = useState<FollowUpSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    loadFollowUpData();
  }, [project.id]);

  const loadFollowUpData = async () => {
    try {
      setLoading(true);
      
      // Carregar planos de ação
      const { data: plansData, error: plansError } = await supabase
        .from('planos_acao')
        .select(`
          *,
          monitoramento_planos(*)
        `)
        .eq('projeto_id', project.id)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      const actionPlansData = plansData || [];
      setActionPlans(actionPlansData);
      
      // Calcular resumo
      const summaryData = calculateSummary(actionPlansData);
      setSummary(summaryData);

      // Carregar itens de monitoramento
      const allMonitoring = actionPlansData.flatMap(plan => plan.monitoramento_planos || []);
      setMonitoring(allMonitoring);

    } catch (error) {
      console.error('Erro ao carregar dados de follow-up:', error);
      toast.error('Erro ao carregar dados de follow-up');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (plansData: ActionPlan[]): FollowUpSummary => {
    const total = plansData.length;
    const implementados = plansData.filter(p => p.status === 'implementado' || p.status === 'verificado').length;
    const em_andamento = plansData.filter(p => p.status === 'em_andamento').length;
    const atrasados = plansData.filter(p => {
      if (!p.prazo_implementacao) return false;
      return new Date(p.prazo_implementacao) < new Date() && !['implementado', 'verificado'].includes(p.status);
    }).length;
    
    const taxa_implementacao = total > 0 ? Math.round((implementados / total) * 100) : 0;
    
    // Calcular prazo médio de implementação (simulado)
    const prazo_medio_implementacao = 45; // dias
    
    return {
      total_planos: total,
      implementados,
      em_andamento,
      atrasados,
      taxa_implementacao,
      prazo_medio_implementacao
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-muted text-muted-foreground',
      em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      implementado: 'bg-primary/10 text-primary',
      verificado: 'bg-primary/20 text-primary',
      atrasado: 'bg-destructive/10 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      baixa: 'bg-muted text-muted-foreground',
      media: 'bg-secondary text-secondary-foreground',
      alta: 'bg-primary/10 text-primary',
      critica: 'bg-destructive/10 text-destructive'
    };
    return colors[priority] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pendente: Clock,
      em_andamento: TrendingUp,
      implementado: CheckCircle,
      verificado: Target,
      atrasado: AlertTriangle
    };
    return icons[status] || Clock;
  };

  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateCompleteness = () => {
    if (actionPlans.length === 0) return 0;
    const completed = actionPlans.filter(p => ['implementado', 'verificado'].includes(p.status)).length;
    return Math.round((completed / actionPlans.length) * 100);
  };

  const filteredActionPlans = actionPlans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || plan.prioridade === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Follow-up e Monitoramento
              </CardTitle>
              <CardDescription>
                Acompanhamento da implementação de planos de ação
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completude</p>
                <p className="text-lg font-bold">{completeness}%</p>
              </div>
              <Progress value={completeness} className="w-24 h-3" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs para organizar o conteúdo */}
      <Tabs defaultValue="planos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar Planos
          </TabsTrigger>
          <TabsTrigger value="monitoramento" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-6">
          <ActionPlanManager project={project} onUpdate={loadFollowUpData} />
        </TabsContent>

        <TabsContent value="monitoramento" className="space-y-6">

      {/* Resumo do Follow-up */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Planos</p>
                  <p className="text-2xl font-bold">{summary.total_planos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Implementados</p>
                  <p className="text-2xl font-bold text-primary">{summary.implementados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.em_andamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Atrasados</p>
                  <p className="text-2xl font-bold text-destructive">{summary.atrasados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Implementação</p>
                  <p className="text-2xl font-bold text-primary">{summary.taxa_implementacao}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar planos de ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                />
              </div>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-foreground border-border"
              >
                <option value="all">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="implementado">Implementado</option>
                <option value="verificado">Verificado</option>
                <option value="atrasado">Atrasado</option>
              </select>
              
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-foreground border-border"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano de Ação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Planos de Ação */}
      <div className="space-y-4">
        {filteredActionPlans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum plano de ação encontrado</h3>
              <p className="text-muted-foreground">
                {actionPlans.length === 0 
                  ? 'Crie o primeiro plano de ação para acompanhar a implementação.'
                  : 'Ajuste os filtros para ver outros planos de ação.'
                }
              </p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Criar Plano de Ação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredActionPlans.map((plan) => {
              const StatusIcon = getStatusIcon(plan.status);
              const daysUntilDeadline = getDaysUntilDeadline(plan.prazo_implementacao);
              
              return (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <StatusIcon className={`h-5 w-5 mt-1 ${
                          plan.status === 'implementado' || plan.status === 'verificado' ? 'text-primary' :
                          plan.status === 'atrasado' ? 'text-destructive' :
                          plan.status === 'em_andamento' ? 'text-primary' :
                          'text-muted-foreground'
                        }`} />
                        <div>
                          <CardTitle className="text-base">{plan.codigo}</CardTitle>
                          <CardDescription className="font-medium">{plan.titulo}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(plan.prioridade)}>
                          {plan.prioridade}
                        </Badge>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {plan.descricao}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Responsável</p>
                          <p className="font-medium">{plan.responsavel}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prazo</p>
                          <p className="font-medium">
                            {plan.prazo_implementacao ? new Date(plan.prazo_implementacao).toLocaleDateString('pt-BR') : 'Não definido'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progresso</p>
                          <div className="flex items-center gap-2">
                            <Progress value={plan.progresso || 0} className="flex-1 h-2" />
                            <span className="text-xs">{plan.progresso || 0}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prazo</p>
                          <p className={`font-medium ${
                            daysUntilDeadline !== null && daysUntilDeadline < 0 ? 'text-destructive' :
                            daysUntilDeadline !== null && daysUntilDeadline < 7 ? 'text-primary' :
                            'text-muted-foreground'
                          }`}>
                            {daysUntilDeadline !== null ? (
                              daysUntilDeadline < 0 ? `${Math.abs(daysUntilDeadline)} dias atrasado` :
                              daysUntilDeadline === 0 ? 'Vence hoje' :
                              `${daysUntilDeadline} dias restantes`
                            ) : 'Sem prazo'}
                          </p>
                        </div>
                      </div>
                      
                      {plan.observacoes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Observações</p>
                          <p className="text-sm">{plan.observacoes}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {plan.status === 'implementado' && (
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verificar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          {/* Ações de Relatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Follow-up</CardTitle>
              <CardDescription>
                Gere relatórios de acompanhamento e implementação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório de Implementação
                </Button>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Notificar Responsáveis
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório de Seguimento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${completeness >= 80 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">
                {completeness >= 80 ? 'Follow-up completo' : `${completeness}% implementado - Implemente pelo menos 80% para concluir`}
              </span>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Última atualização</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}