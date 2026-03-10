import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Edit, Trash2, Calendar, Users, DollarSign, 
  Target, CheckCircle, AlertTriangle, Clock, Activity,
  FileText, MessageSquare, History, Settings, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActionPlanData {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  objetivo: string;
  modulo_origem: string;
  prioridade: string;
  status: string;
  percentual_conclusao: number;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  data_inicio_real: string;
  data_fim_real: string;
  responsavel_nome: string;
  categoria_nome: string;
  cor_categoria: string;
  gut_score: number;
  orcamento_planejado: number;
  orcamento_realizado: number;
  created_at: string;
  updated_at: string;
  contexto_adicional: any;
}

interface Activity {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  percentual_conclusao: number;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  responsavel_nome: string;
  prioridade: string;
}

export const ActionPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actionPlan, setActionPlan] = useState<ActionPlanData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadActionPlanDetails();
    }
  }, [id, user]);

  const loadActionPlanDetails = async () => {
    if (!user?.tenant_id || !id) return;

    try {
      // Carregar dados do plano de ação
      const { data: planData, error: planError } = await supabase
        .from('action_plans')
        .select(`
          *,
          action_plan_categories(nome, cor_categoria),
          profiles!action_plans_responsavel_plano_fkey(full_name)
        `)
        .eq('id', id)
        .eq('tenant_id', user.tenant_id)
        .single();

      if (planError) throw planError;

      const formattedPlan: ActionPlanData = {
        ...planData,
        responsavel_nome: planData.profiles?.full_name || 'Não definido',
        categoria_nome: planData.action_plan_categories?.nome || 'Sem categoria',
        cor_categoria: planData.action_plan_categories?.cor_categoria || '#3B82F6'
      };

      setActionPlan(formattedPlan);

      // Carregar atividades do plano
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('action_plan_activities')
        .select(`
          *,
          profiles!action_plan_activities_responsavel_execucao_fkey(full_name)
        `)
        .eq('action_plan_id', id)
        .eq('tenant_id', user.tenant_id)
        .order('ordem_execucao', { ascending: true });

      if (activitiesError) throw activitiesError;

      const formattedActivities = activitiesData?.map(activity => ({
        ...activity,
        responsavel_nome: activity.profiles?.full_name || 'Não definido'
      })) || [];

      setActivities(formattedActivities);

    } catch (error) {
      console.error('Erro ao carregar detalhes do plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 border-green-200';
      case 'em_execucao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pausado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-500';
      case 'urgente': return 'bg-red-600';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getModuleName = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return 'Gestão de Riscos';
      case 'compliance': return 'Compliance';
      case 'assessments': return 'Assessments';
      case 'privacy': return 'Privacidade';
      case 'audit': return 'Auditoria';
      default: return 'Outros';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!actionPlan) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Plano de Ação não encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            O plano de ação solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
          </p>
          <Button onClick={() => navigate('/action-plans')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Planos de Ação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/action-plans')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{actionPlan.titulo}</h1>
            <p className="text-gray-600">{actionPlan.codigo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/action-plans/edit/${actionPlan.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status e Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{actionPlan.percentual_conclusao}%</div>
              <p className="text-gray-600 text-sm mb-4">Progresso Geral</p>
              <Progress value={actionPlan.percentual_conclusao} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <Badge className={getStatusColor(actionPlan.status)}>
                  {actionPlan.status}
                </Badge>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Prioridade</p>
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${getPriorityColor(actionPlan.prioridade)}`}
                  />
                  <span className="font-medium capitalize">{actionPlan.prioridade}</span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Score GUT</p>
                <div className="text-2xl font-bold">{actionPlan.gut_score}</div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
          <TabsTrigger value="comments">Comentários</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Descrição</label>
                  <p className="mt-1">{actionPlan.descricao}</p>
                </div>
                
                {actionPlan.objetivo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Objetivo</label>
                    <p className="mt-1">{actionPlan.objetivo}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Módulo de Origem</label>
                  <p className="mt-1">{getModuleName(actionPlan.modulo_origem)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Categoria</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: actionPlan.cor_categoria }}
                    />
                    <span>{actionPlan.categoria_nome}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cronograma e Responsabilidades */}
            <Card>
              <CardHeader>
                <CardTitle>Cronograma e Responsabilidades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Responsável</label>
                  <p className="mt-1 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    {actionPlan.responsavel_nome}
                  </p>
                </div>

                {actionPlan.data_inicio_planejada && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Início Planejada</label>
                    <p className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(actionPlan.data_inicio_planejada), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}

                {actionPlan.data_fim_planejada && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Fim Planejada</label>
                    <p className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(actionPlan.data_fim_planejada), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}

                {actionPlan.data_inicio_real && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Início Real</label>
                    <p className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(actionPlan.data_inicio_real), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orçamento */}
            {(actionPlan.orcamento_planejado > 0 || actionPlan.orcamento_realizado > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações Orçamentárias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {actionPlan.orcamento_planejado > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Orçamento Planejado</label>
                      <p className="mt-1 flex items-center text-lg font-bold">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(actionPlan.orcamento_planejado)}
                      </p>
                    </div>
                  )}

                  {actionPlan.orcamento_realizado > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Orçamento Realizado</label>
                      <p className="mt-1 flex items-center text-lg font-bold">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(actionPlan.orcamento_realizado)}
                      </p>
                    </div>
                  )}

                  {actionPlan.orcamento_planejado > 0 && actionPlan.orcamento_realizado > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Variação Orçamentária</label>
                      <div className="mt-1">
                        <Progress 
                          value={(actionPlan.orcamento_realizado / actionPlan.orcamento_planejado) * 100} 
                          className="h-3"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          {Math.round((actionPlan.orcamento_realizado / actionPlan.orcamento_planejado) * 100)}% utilizado
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contexto Adicional */}
            {actionPlan.contexto_adicional && Object.keys(actionPlan.contexto_adicional).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Contexto Adicional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(actionPlan.contexto_adicional).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades do Plano de Ação</CardTitle>
              <CardDescription>
                {activities.length} atividade{activities.length !== 1 ? 's' : ''} • {activities.filter(a => a.status === 'concluido').length} concluída{activities.filter(a => a.status === 'concluido').length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade cadastrada para este plano de ação</p>
                  <Button className="mt-4">
                    Adicionar Atividade
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.status === 'concluido' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {activity.status === 'concluido' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.titulo}</h4>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                        
                        {activity.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{activity.descricao}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{activity.responsavel_nome}</span>
                            {activity.data_fim_planejada && (
                              <span>
                                Prazo: {format(new Date(activity.data_fim_planejada), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium">
                            {activity.percentual_conclusao}%
                          </div>
                        </div>
                        
                        <Progress value={activity.percentual_conclusao} className="h-2 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Visualização de cronograma em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comentários e Comunicação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sistema de comentários em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Histórico de alterações em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};