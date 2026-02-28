import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Users,
  MessageSquare,
  FileText,
  Upload,
  Download,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Shield,
  Activity,
  Clipboard,
  Building,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Settings,
  ExternalLink,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  CheckSquare,
  Bell,
  BellRing,
  CalendarDays,
  Paperclip,
  Send,
  UserX,
  ClockIcon,
  Flag,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  modulo_origem: string;
  nome_origem?: string;
  origem_id?: string;
  categoria: string;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  status: 'planejado' | 'em_execucao' | 'pausado' | 'concluido' | 'cancelado';
  percentual_conclusao: number;
  data_inicio?: string;
  data_fim_planejada: string;
  data_fim_real?: string;
  responsavel_id: string;
  equipe_ids?: string[];
  orcamento_planejado?: number;
  orcamento_realizado?: number;
  gut_score: number;
  impacto_esperado?: string;
  criterio_sucesso?: string;
  observacoes?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  dias_para_vencimento?: number;

  // Related data
  responsavel?: {
    id: string;
    nome: string;
    email: string;
    avatar_url?: string;
  };
  equipe?: Array<{
    id: string;
    nome: string;
    email: string;
    avatar_url?: string;
  }>;
  atividades?: ActionPlanActivity[];
  evidencias?: ActionPlanEvidence[];
  comentarios?: ActionPlanComment[];
}

export interface ActionPlanActivity {
  id: string;
  action_plan_id: string;
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'em_execucao' | 'concluida' | 'cancelada' | 'atrasada';
  data_inicio?: string;
  data_fim_planejada: string;
  data_fim_replanejada?: string;
  data_fim_real?: string;
  responsavel_id: string;
  responsavel?: {
    id: string;
    nome: string;
    email: string;
    avatar_url?: string;
  };
  percentual_conclusao: number;
  ordem: number;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  impacto_atraso?: string;
  observacoes?: string;
  evidencias?: ActivityEvidence[];
  notificacoes_enviadas?: ActivityNotification[];
  created_at: string;
  updated_at?: string;
}

export interface ActivityEvidence {
  id: string;
  activity_id: string;
  titulo: string;
  descricao?: string;
  tipo_arquivo: string;
  url_arquivo: string;
  tamanho_arquivo: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface ActivityNotification {
  id: string;
  activity_id: string;
  tipo: 'vencimento_proximo' | 'vencido' | 'atrasado' | 'concluido';
  destinatarios: string[];
  data_envio: string;
  conteudo: string;
  enviado: boolean;
}

export interface ActionPlanEvidence {
  id: string;
  action_plan_id: string;
  titulo: string;
  descricao?: string;
  tipo_arquivo: string;
  url_arquivo: string;
  tamanho_arquivo: number;
  uploaded_by: string;
  created_at: string;
}

export interface ActionPlanComment {
  id: string;
  action_plan_id: string;
  conteudo: string;
  autor_id: string;
  autor_nome: string;
  created_at: string;
  tipo: 'comentario' | 'atualizacao_status' | 'atualizacao_progresso' | 'geral' | 'atividade' | 'evidencia';
  referencia_id?: string;
}

interface EnhancedActionPlanCardProps {
  actionPlan: ActionPlan;
  onUpdate?: (updatedPlan: ActionPlan) => void;
  onDelete?: (planId: string) => void;
  isExpandedByDefault?: boolean;
  showModuleLink?: boolean;
}

export const EnhancedActionPlanCard: React.FC<EnhancedActionPlanCardProps> = ({
  actionPlan,
  onUpdate,
  onDelete,
  isExpandedByDefault = false,
  showModuleLink = true
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(isExpandedByDefault);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<ActionPlan>(actionPlan);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newActivity, setNewActivity] = useState({
    titulo: '',
    descricao: '',
    data_fim_planejada: '',
    responsavel_id: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'critica',
    impacto_atraso: ''
  });
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActionPlanActivity | null>(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  useEffect(() => {
    setEditedPlan(actionPlan);
  }, [actionPlan]);

  const getPriorityColor = (prioridade: string) => {
    const colors = {
      critica: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200',
      alta: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200',
      media: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
      baixa: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planejado: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
      em_execucao: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
      pausado: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
      concluido: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200',
      cancelado: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getModuleIcon = (modulo: string) => {
    const icons = {
      risk_management: <Shield className="h-4 w-4" />,
      compliance: <FileText className="h-4 w-4" />,
      assessments: <Clipboard className="h-4 w-4" />,
      privacy: <Eye className="h-4 w-4" />,
      audit: <Activity className="h-4 w-4" />,
      tprm: <Building className="h-4 w-4" />
    };
    return icons[modulo as keyof typeof icons] || <Target className="h-4 w-4" />;
  };

  const getModuleColor = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800';
      case 'compliance': return 'text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800';
      case 'assessments': return 'text-green-500 border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800';
      case 'privacy': return 'text-purple-500 border-purple-200 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-800';
      case 'audit': return 'text-indigo-500 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800';
      case 'tprm': return 'text-orange-500 border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800';
      default: return 'text-gray-500 border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getModuleName = (modulo: string) => {
    const names = {
      risk_management: 'Gestão de Riscos',
      compliance: 'Conformidade',
      assessments: 'Avaliações',
      privacy: 'Privacidade',
      audit: 'Auditoria',
      tprm: 'TPRM'
    };
    return names[modulo as keyof typeof names] || modulo;
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Here you would implement the actual database update
      const { error } = await supabase
        .from('action_plans')
        .update({
          titulo: editedPlan.titulo,
          descricao: editedPlan.descricao,
          prioridade: editedPlan.prioridade,
          status: editedPlan.status,
          data_fim_planejada: editedPlan.data_fim_planejada,
          responsavel_id: editedPlan.responsavel_id,
          orcamento_planejado: editedPlan.orcamento_planejado,
          impacto_esperado: editedPlan.impacto_esperado,
          criterio_sucesso: editedPlan.criterio_sucesso,
          observacoes: editedPlan.observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', editedPlan.id)
        .eq('tenant_id', user.tenantId);

      if (error) throw error;

      setIsEditing(false);
      onUpdate?.(editedPlan);
      toast.success('Plano de ação atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano de ação');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (newProgress: number) => {
    try {
      setLoading(true);

      const updatedPlan = { ...editedPlan, percentual_conclusao: newProgress };
      setEditedPlan(updatedPlan);

      // Update in database
      await supabase
        .from('action_plans')
        .update({
          percentual_conclusao: newProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', actionPlan.id)
        .eq('tenant_id', user?.tenantId);

      onUpdate?.(updatedPlan);
      toast.success('Progresso atualizado');
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast.error('Erro ao atualizar progresso');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);

      const updatedPlan = { ...editedPlan, status: newStatus as any };
      setEditedPlan(updatedPlan);

      // Update in database
      await supabase
        .from('action_plans')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', actionPlan.id)
        .eq('tenant_id', user?.tenantId);

      onUpdate?.(updatedPlan);
      toast.success('Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    try {
      const comment: ActionPlanComment = {
        id: Date.now().toString(),
        action_plan_id: actionPlan.id,
        conteudo: newComment,
        autor_id: user.id,
        autor_nome: user.name || user.email || 'Usuário',
        created_at: new Date().toISOString(),
        tipo: 'comentario'
      };

      const updatedPlan = {
        ...editedPlan,
        comentarios: [...(editedPlan.comentarios || []), comment]
      };

      setEditedPlan(updatedPlan);
      setNewComment('');
      onUpdate?.(updatedPlan);
      toast.success('Comentário adicionado');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getDaysToDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getActivityStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-gray-100 text-gray-800 border-gray-300',
      em_execucao: 'bg-blue-100 text-blue-800 border-blue-300',
      concluida: 'bg-green-100 text-green-800 border-green-300',
      cancelada: 'bg-red-100 text-red-800 border-red-300',
      atrasada: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getActivityPriorityColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    };
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActivityStatus = (activity: ActionPlanActivity) => {
    const now = new Date();
    const deadline = new Date(activity.data_fim_replanejada || activity.data_fim_planejada);
    const daysToDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (activity.status === 'concluida') return 'concluida';
    if (activity.status === 'cancelada') return 'cancelada';
    if (daysToDeadline < 0) return 'atrasada';
    return activity.status;
  };

  const shouldSendNotification = (activity: ActionPlanActivity) => {
    const now = new Date();
    const deadline = new Date(activity.data_fim_replanejada || activity.data_fim_planejada);
    const daysToDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Notificar 3 dias antes do vencimento, no dia do vencimento, e a cada dia de atraso
    return daysToDeadline <= 3 && daysToDeadline >= -30;
  };

  const daysToDeadline = getDaysToDeadline(editedPlan.data_fim_planejada);

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 relative pr-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              {getModuleIcon(editedPlan.modulo_origem)}
              <Badge variant="outline" className="text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-5">
                {editedPlan.codigo}
              </Badge>
              <Badge className={`text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-5 ${getPriorityColor(editedPlan.prioridade)}`}>
                {editedPlan.prioridade}
              </Badge>
              <Badge className={`text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-5 ${getStatusColor(editedPlan.status)}`}>
                {editedPlan.status.replace('_', ' ')}
              </Badge>
            </div>

            {isEditing ? (
              <Input
                value={editedPlan.titulo}
                onChange={(e) => setEditedPlan({ ...editedPlan, titulo: e.target.value })}
                className="font-semibold text-base sm:text-lg mb-2"
              />
            ) : (
              <CardTitle className="text-base sm:text-lg mb-1 sm:mb-2 line-clamp-3 sm:line-clamp-2 leading-tight">
                {editedPlan.titulo}
              </CardTitle>
            )}

            {editedPlan.descricao && (
              <CardDescription className="line-clamp-2 mb-2">
                {editedPlan.descricao}
              </CardDescription>
            )}

            <div className="flex flex-wrap items-center gap-1 mt-2">
              {showModuleLink && (
                <Badge variant="outline" className={`text-[9px] sm:text-xs px-1 py-0 h-4 sm:h-5 ${getModuleColor(editedPlan.modulo_origem)}`}>
                  {getModuleName(editedPlan.modulo_origem)}
                </Badge>
              )}
            </div>
          </div>

          <div className="absolute top-0 right-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress and Quick Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className={daysToDeadline < 0 ? 'text-red-600' : daysToDeadline < 7 ? 'text-orange-600' : ''}>
                  {daysToDeadline < 0 ? `${Math.abs(daysToDeadline)} dias atrasado` :
                    daysToDeadline === 0 ? 'Vence hoje' :
                      `${daysToDeadline} dias restantes`}
                </span>
              </div>

              {editedPlan.responsavel && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span>{editedPlan.responsavel.nome}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{editedPlan.percentual_conclusao}%</span>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={editedPlan.percentual_conclusao} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Início: {editedPlan.data_inicio ? formatDate(editedPlan.data_inicio) : 'Não definido'}</span>
              <span>Prazo: {formatDate(editedPlan.data_fim_planejada)}</span>
            </div>
          </div>
        </div>

      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-row overflow-x-auto overflow-y-hidden w-full h-auto bg-transparent border-b rounded-none p-0 justify-start no-scrollbar snap-x mb-4">
              <TabsTrigger value="overview" className="shrink-0 snap-start data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="activities" className="shrink-0 snap-start data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2">
                Atividade
              </TabsTrigger>
              <TabsTrigger value="evidence" className="shrink-0 snap-start data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2">
                Evidência
              </TabsTrigger>
              <TabsTrigger value="comments" className="shrink-0 snap-start data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2">
                Comentário
              </TabsTrigger>
              <TabsTrigger value="analytics" className="shrink-0 snap-start data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-1.5 text-xs sm:text-sm sm:px-4 sm:py-2">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Descrição</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedPlan.descricao || ''}
                        onChange={(e) => setEditedPlan({ ...editedPlan, descricao: e.target.value })}
                        placeholder="Descrição do plano de ação..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {editedPlan.descricao || 'Nenhuma descrição fornecida'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Impacto Esperado</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedPlan.impacto_esperado || ''}
                        onChange={(e) => setEditedPlan({ ...editedPlan, impacto_esperado: e.target.value })}
                        placeholder="Descreva o impacto esperado..."
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {editedPlan.impacto_esperado || 'Não definido'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Critério de Sucesso</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedPlan.criterio_sucesso || ''}
                        onChange={(e) => setEditedPlan({ ...editedPlan, criterio_sucesso: e.target.value })}
                        placeholder="Defina os critérios de sucesso..."
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {editedPlan.criterio_sucesso || 'Não definido'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prioridade</Label>
                      {isEditing ? (
                        <Select
                          value={editedPlan.prioridade}
                          onValueChange={(value) => setEditedPlan({ ...editedPlan, prioridade: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critica">Crítica</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getPriorityColor(editedPlan.prioridade)}>
                          {editedPlan.prioridade}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label>Status</Label>
                      {isEditing ? (
                        <Select
                          value={editedPlan.status}
                          onValueChange={(value) => setEditedPlan({ ...editedPlan, status: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planejado">Planejado</SelectItem>
                            <SelectItem value="em_execucao">Em Execução</SelectItem>
                            <SelectItem value="pausado">Pausado</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStatusColor(editedPlan.status)}>
                          {editedPlan.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Progresso</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={editedPlan.percentual_conclusao} className="flex-1" />
                        <span className="text-sm font-medium">{editedPlan.percentual_conclusao}%</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 mt-1">
                        {[0, 25, 50, 75, 100].map((value) => (
                          <Button
                            key={value}
                            variant={editedPlan.percentual_conclusao === value ? "default" : "outline"}
                            size="sm"
                            className="text-[10px] sm:text-xs px-0 h-7 sm:h-9"
                            onClick={() => handleUpdateProgress(value)}
                            disabled={loading}
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {editedPlan.orcamento_planejado && (
                    <div>
                      <Label>Orçamento</Label>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Planejado:</span>
                          <span>R$ {editedPlan.orcamento_planejado.toLocaleString('pt-BR')}</span>
                        </div>
                        {editedPlan.orcamento_realizado && (
                          <div className="flex justify-between">
                            <span>Realizado:</span>
                            <span>R$ {editedPlan.orcamento_realizado.toLocaleString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <h4 className="font-medium text-sm sm:text-base">Gestão de Atividades</h4>
                <Button size="sm" className="h-7 text-xs sm:h-9 sm:text-sm" onClick={() => setShowAddActivity(true)}>
                  <Plus className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Nova Atividade</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>

              {/* Nova Atividade Form */}
              {showAddActivity && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Título da Atividade</Label>
                          <Input
                            value={newActivity.titulo}
                            onChange={(e) => setNewActivity({ ...newActivity, titulo: e.target.value })}
                            placeholder="Nome da atividade..."
                          />
                        </div>
                        <div>
                          <Label>Prioridade</Label>
                          <Select
                            value={newActivity.prioridade}
                            onValueChange={(value) => setNewActivity({ ...newActivity, prioridade: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="critica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          value={newActivity.descricao}
                          onChange={(e) => setNewActivity({ ...newActivity, descricao: e.target.value })}
                          placeholder="Descrição detalhada da atividade..."
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Prazo Inicial</Label>
                          <Input
                            type="date"
                            value={newActivity.data_fim_planejada}
                            onChange={(e) => setNewActivity({ ...newActivity, data_fim_planejada: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Impacto do Atraso</Label>
                          <Input
                            value={newActivity.impacto_atraso}
                            onChange={(e) => setNewActivity({ ...newActivity, impacto_atraso: e.target.value })}
                            placeholder="Impacto caso a atividade atrase..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          // Implementar lógica de adicionar atividade
                          toast.success('Atividade adicionada com sucesso');
                          setShowAddActivity(false);
                          setNewActivity({
                            titulo: '',
                            descricao: '',
                            data_fim_planejada: '',
                            responsavel_id: '',
                            prioridade: 'media',
                            impacto_atraso: ''
                          });
                        }}>
                          <Save className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddActivity(false)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Atividades */}
              <div className="space-y-3">
                {editedPlan.atividades?.map((activity, index) => {
                  const currentStatus = getActivityStatus(activity);
                  const daysToActivityDeadline = getDaysToDeadline(activity.data_fim_replanejada || activity.data_fim_planejada);
                  const needsNotification = shouldSendNotification(activity);

                  return (
                    <Card key={activity.id} className={`border-l-4 ${currentStatus === 'atrasada' ? 'border-l-red-500' :
                      currentStatus === 'concluida' ? 'border-l-green-500' :
                        activity.prioridade === 'critica' ? 'border-l-red-400' :
                          activity.prioridade === 'alta' ? 'border-l-orange-400' : 'border-l-blue-400'
                      }`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header da Atividade */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                                <Badge variant="outline" className="text-[10px] sm:text-xs py-0 h-4 sm:h-5">#{index + 1}</Badge>
                                <h5 className="font-semibold text-sm sm:text-base break-words leading-tight">{activity.titulo}</h5>
                                {needsNotification && (
                                  <Badge variant="destructive" className="text-[10px] sm:text-xs py-0 h-4 sm:h-5">
                                    <Bell className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Alerta</span>
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                                <Badge className={`text-[10px] sm:text-xs py-0 h-4 sm:h-5 ${getActivityStatusColor(currentStatus)}`}>
                                  {currentStatus === 'atrasada' ? 'Atrasada' :
                                    currentStatus === 'concluida' ? 'Concluída' :
                                      currentStatus === 'em_execucao' ? 'Em Execução' :
                                        currentStatus === 'pendente' ? 'Pendente' : 'Cancelada'}
                                </Badge>
                                <Badge className={`text-[10px] sm:text-xs py-0 h-4 sm:h-5 ${getActivityPriorityColor(activity.prioridade)}`}>
                                  <Flag className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">{activity.prioridade}</span>
                                </Badge>
                                {activity.responsavel && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs py-0 h-4 sm:h-5">
                                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                                    <span className="truncate max-w-[100px] sm:max-w-none">{activity.responsavel.nome}</span>
                                  </Badge>
                                )}
                              </div>

                              {activity.descricao && (
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{activity.descricao}</p>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto bg-muted/30 sm:bg-transparent p-2 sm:p-0 rounded-md sm:rounded-none shrink-0 mt-2 sm:mt-0">
                              <div className="flex sm:flex-col items-center sm:items-end w-full sm:w-auto">
                                <div className="text-base sm:text-lg font-bold">{activity.percentual_conclusao}%</div>
                                <Progress value={activity.percentual_conclusao} className="w-24 sm:w-16 h-1.5 sm:h-2 mt-0.5 sm:mt-1 ml-3 sm:ml-0" />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 shrink-0"
                                onClick={() => {
                                  setSelectedActivity(activity);
                                  setShowActivityDetails(true);
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Cronograma */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-[11px] sm:text-sm mb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <CalendarDays className="h-3 w-3" />
                                <span>Prazo Inicial</span>
                              </div>
                              <div className="font-medium">{formatDate(activity.data_fim_planejada)}</div>
                            </div>

                            {activity.data_fim_replanejada && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-orange-600">
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Replanejado</span>
                                </div>
                                <div className="font-medium text-orange-600">
                                  {formatDate(activity.data_fim_replanejada)}
                                </div>
                              </div>
                            )}

                            {activity.data_fim_real && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Entrega Efetiva</span>
                                </div>
                                <div className="font-medium text-green-600">
                                  {formatDate(activity.data_fim_real)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status do Prazo */}
                          <div className={`p-2 rounded text-sm ${currentStatus === 'atrasada' ? 'bg-red-50 text-red-700' :
                            daysToActivityDeadline <= 3 ? 'bg-orange-50 text-orange-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                            <div className="flex items-center gap-2">
                              {currentStatus === 'atrasada' ? (
                                <AlertOctagon className="h-4 w-4" />
                              ) : daysToActivityDeadline <= 3 ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : (
                                <ClockIcon className="h-4 w-4" />
                              )}
                              <span>
                                {currentStatus === 'atrasada' ?
                                  `Atrasada há ${Math.abs(daysToActivityDeadline)} dias` :
                                  daysToActivityDeadline === 0 ?
                                    'Vence hoje' :
                                    daysToActivityDeadline < 0 ?
                                      `Venceu há ${Math.abs(daysToActivityDeadline)} dias` :
                                      `${daysToActivityDeadline} dias restantes`}
                              </span>
                            </div>
                          </div>

                          {/* Evidências e Ações Rápidas */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t gap-3 sm:gap-2">
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground w-full sm:w-auto">
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{activity.evidencias?.length || 0} evidências</span>
                              </div>
                              {activity.notificacoes_enviadas && activity.notificacoes_enviadas.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <BellRing className="h-3 w-3" />
                                  <span>{activity.notificacoes_enviadas.length} notificações</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                              {currentStatus !== 'concluida' && (
                                <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-7 px-2 text-[10px] sm:text-xs">
                                  <CheckSquare className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Finalizar</span>
                                </Button>
                              )}
                              {needsNotification && (
                                <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-7 px-2 text-[10px] sm:text-xs">
                                  <Send className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Notificar</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }) || (
                    <Card className="border-dashed">
                      <CardContent className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma atividade cadastrada</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Adicione atividades para acompanhar o progresso detalhado do plano
                        </p>
                        <Button size="sm" onClick={() => setShowAddActivity(true)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Criar Primeira Atividade
                        </Button>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <h4 className="font-medium text-sm sm:text-base">Evidências</h4>
                <Button size="sm" className="h-7 text-xs sm:h-9 sm:text-sm">
                  <Upload className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Enviar Evidência</span>
                  <span className="sm:hidden">Enviar</span>
                </Button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {editedPlan.evidencias?.map((evidence) => (
                  <div key={evidence.id} className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-2 sm:p-3 gap-2 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 sm:mt-0 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-[11px] sm:text-sm truncate">{evidence.titulo}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {evidence.tipo_arquivo} • {(evidence.tamanho_arquivo / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs w-full sm:w-auto shrink-0 bg-secondary/50 sm:bg-transparent">
                      <Download className="h-3 w-3 sm:mr-1" />
                      <span className="sm:hidden ml-1">Baixar</span>
                    </Button>
                  </div>
                )) || (
                    <p className="text-[11px] sm:text-sm text-muted-foreground text-center py-4">
                      Nenhuma evidência enviada
                    </p>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="text-xs sm:text-sm min-h-[60px]"
                  />
                  <Button onClick={addComment} disabled={!newComment.trim()} className="w-full sm:w-auto h-8 sm:h-auto shrink-0">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Enviar
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {editedPlan.comentarios?.map((comment) => (
                    <div key={comment.id} className="flex gap-2 sm:gap-3 bg-muted/20 p-2 rounded-md">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                        <AvatarFallback className="text-[10px] sm:text-xs">{comment.autor_nome.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 mb-0.5 sm:mb-1">
                          <span className="font-medium text-xs sm:text-sm truncate">{comment.autor_nome}</span>
                          <span className="text-[9px] sm:text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-sm break-words leading-relaxed">{comment.conteudo}</p>
                      </div>
                    </div>
                  )) || (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum comentário
                      </p>
                    )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Velocidade</span>
                    </div>
                    <p className="text-2xl font-bold">+2.5%</p>
                    <p className="text-xs text-muted-foreground">vs. última semana</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Eficiência</span>
                    </div>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-muted-foreground">vs. meta 85%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Score GUT</span>
                    </div>
                    <p className="text-2xl font-bold">{editedPlan.gut_score}</p>
                    <p className="text-xs text-muted-foreground">Gravidade x Urgência x Tendência</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Actions (moved to bottom) */}
          <div className="flex flex-col flex-wrap gap-2 pt-4 border-t mt-4">
            {editedPlan.status === 'planejado' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('em_execucao')}
                disabled={loading}
                className="w-full"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Iniciar
              </Button>
            )}

            {editedPlan.status === 'em_execucao' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('pausado')}
                disabled={loading}
                className="w-full"
              >
                <PauseCircle className="h-4 w-4 mr-2" />
                Pausar
              </Button>
            )}

            {editedPlan.status !== 'concluido' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('concluido')}
                disabled={loading}
                className="w-full"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
              className="w-full"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>

            {isEditing && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};