import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronUp,
  Target,
  Calendar,
  User,
  Edit,
  Save,
  X,
  Plus,
  Shield,
  FileText,
  Clipboard,
  Eye,
  Activity,
  Building,
  CheckSquare,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag,
  Settings,
  Paperclip,
  Send,
  Upload,
  Download,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

import { ActionPlan, ActionPlanActivity, ActionPlanEvidence, ActionPlanComment, ActivityEvidence } from './EnhancedActionPlanCard';

interface SimpleEnhancedActionPlanCardProps {
  actionPlan: ActionPlan;
  onUpdate?: (plan: ActionPlan) => void;
  isExpandedByDefault?: boolean;
  showModuleLink?: boolean;
}

export const SimpleEnhancedActionPlanCard: React.FC<SimpleEnhancedActionPlanCardProps> = ({
  actionPlan,
  onUpdate,
  isExpandedByDefault = false,
  showModuleLink = true
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedByDefault);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);

  // Local state management para CRUD
  const [localActionPlan, setLocalActionPlan] = useState(actionPlan);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);

  // Form states para nova atividade
  const [newActivity, setNewActivity] = useState({
    titulo: '',
    descricao: '',
    data_fim_planejada: '',
    prioridade: 'media' as const,
    responsavel_nome: '',
    responsavel_email: ''
  });

  // Form states para nova evidência
  const [newEvidence, setNewEvidence] = useState<{
    nome: string;
    tipo: 'documento' | 'imagem' | 'link' | 'outro';
    descricao: string;
    link_url: string;
    activity_id: string;
  }>({
    nome: '',
    tipo: 'documento',
    descricao: '',
    link_url: '',
    activity_id: ''
  });

  // Form states para novo comentário
  const [newComment, setNewComment] = useState<{
    texto: string;
    tipo: 'geral' | 'atividade' | 'evidencia';
    referencia_id: string;
  }>({
    texto: '',
    tipo: 'geral',
    referencia_id: ''
  });

  // Form states para edição de atividade
  const [editActivityData, setEditActivityData] = useState({
    titulo: '',
    descricao: '',
    data_fim_planejada: '',
    data_fim_replanejada: '',
    prioridade: 'media' as const,
    responsavel_nome: '',
    responsavel_email: '',
    percentual_conclusao: 0,
    status: 'pendente'
  });

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'alta': return 'bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado': return 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'em_execucao': return 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'concluido': return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'concluida': return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'pendente': return 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'cancelado': return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      case 'atrasada': return 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getModuleIcon = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return <Shield className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      case 'assessments': return <Clipboard className="h-4 w-4" />;
      case 'privacy': return <Eye className="h-4 w-4" />;
      case 'audit': return <Activity className="h-4 w-4" />;
      case 'tprm': return <Building className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getModuleName = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return 'Gestão de Riscos';
      case 'compliance': return 'Conformidade';
      case 'assessments': return 'Avaliações';
      case 'privacy': return 'Privacidade';
      case 'audit': return 'Auditoria';
      case 'tprm': return 'TPRM';
      default: return modulo;
    }
  };

  const getModuleColor = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return 'bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'compliance': return 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'assessments': return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'privacy': return 'bg-purple-100 text-purple-900 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'audit': return 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/20 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'tprm': return 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getEvidenceTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'documento': return 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'imagem': return 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'link': return 'bg-purple-100 text-purple-900 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'outro': return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getCommentTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'geral': return 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'atividade': return 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'evidencia': return 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDaysToDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysToDeadline = getDaysToDeadline(localActionPlan.data_fim_planejada);

  // CRUD Functions
  const handleCreateActivity = () => {
    if (!newActivity.titulo || !newActivity.data_fim_planejada) {
      toast.error('Título e prazo são obrigatórios');
      return;
    }

    const activity: ActionPlanActivity = {
      id: `activity_${Date.now()}`,
      action_plan_id: localActionPlan.id,
      titulo: newActivity.titulo,
      descricao: newActivity.descricao,
      status: 'pendente',
      data_fim_planejada: newActivity.data_fim_planejada,
      responsavel_id: newActivity.responsavel_email || 'unknown', // Placeholder
      responsavel: {
        id: 'temp_id', // Placeholder
        nome: newActivity.responsavel_nome || 'Não atribuído',
        email: newActivity.responsavel_email || '',
      },
      percentual_conclusao: 0,
      ordem: (localActionPlan.atividades?.length || 0) + 1,
      prioridade: newActivity.prioridade,
      evidencias: [],
      created_at: new Date().toISOString()
    };

    const updatedPlan = {
      ...localActionPlan,
      atividades: [...(localActionPlan.atividades || []), activity]
    };

    setLocalActionPlan(updatedPlan);
    setNewActivity({
      titulo: '',
      descricao: '',
      data_fim_planejada: '',
      prioridade: 'media',
      responsavel_nome: '',
      responsavel_email: ''
    });
    setShowAddActivity(false);
    onUpdate?.(updatedPlan);
    toast.success('Atividade criada com sucesso');
  };

  const handleUpdateActivity = (activityId: string, updates: Partial<SimpleActivity>) => {
    const updatedPlan = {
      ...localActionPlan,
      atividades: localActionPlan.atividades?.map(activity =>
        activity.id === activityId ? { ...activity, ...updates } : activity
      )
    };

    setLocalActionPlan(updatedPlan);
    onUpdate?.(updatedPlan);
    toast.success('Atividade atualizada');
  };

  const handleDeleteActivity = (activityId: string) => {
    const updatedPlan = {
      ...localActionPlan,
      atividades: localActionPlan.atividades?.filter(activity => activity.id !== activityId)
    };

    setLocalActionPlan(updatedPlan);
    onUpdate?.(updatedPlan);
    toast.success('Atividade removida');
  };

  const handleCreateEvidence = () => {
    if (!newEvidence.nome) {
      toast.error('Nome da evidência é obrigatório');
      return;
    }

    if (newEvidence.activity_id) {
      // Evidência de atividade específica
      const evidence: ActivityEvidence = {
        id: `evidence_${Date.now()}`,
        activity_id: newEvidence.activity_id,
        titulo: newEvidence.nome,
        tipo_arquivo: newEvidence.tipo,
        descricao: newEvidence.descricao,
        url_arquivo: newEvidence.link_url || '',
        tamanho_arquivo: 0,
        uploaded_by: 'current_user',
        uploaded_at: new Date().toISOString()
      };

      updatedPlan = {
        ...localActionPlan,
        atividades: localActionPlan.atividades?.map(activity =>
          activity.id === newEvidence.activity_id
            ? {
              ...activity,
              evidencias: [...(activity.evidencias || []), evidence]
            }
            : activity
        )
      };
    } else {
      // Evidência geral do plano
      const evidence: ActionPlanEvidence = {
        id: `evidence_${Date.now()}`,
        action_plan_id: localActionPlan.id,
        titulo: newEvidence.nome,
        tipo_arquivo: newEvidence.tipo,
        descricao: newEvidence.descricao,
        url_arquivo: newEvidence.link_url || '',
        tamanho_arquivo: 0,
        uploaded_by: 'current_user',
        created_at: new Date().toISOString()
      };

      updatedPlan = {
        ...localActionPlan,
        evidencias: [...(localActionPlan.evidencias || []), evidence]
      };
    }

    setLocalActionPlan(updatedPlan);
    setNewEvidence({
      nome: '',
      tipo: 'documento',
      descricao: '',
      link_url: '',
      activity_id: ''
    });
    setShowAddEvidence(false);
    onUpdate?.(updatedPlan);
    toast.success('Evidência adicionada');
  };

  const handleDeleteEvidence = (evidenceId: string, activityId?: string) => {
    let updatedPlan;

    if (activityId) {
      // Remover evidência de atividade específica
      updatedPlan = {
        ...localActionPlan,
        atividades: localActionPlan.atividades?.map(activity =>
          activity.id === activityId
            ? {
              ...activity,
              evidencias: activity.evidencias?.filter(ev => ev.id !== evidenceId),
              evidencias_count: Math.max(0, (activity.evidencias_count || 0) - 1)
            }
            : activity
        )
      };
    } else {
      // Remover evidência geral
      updatedPlan = {
        ...localActionPlan,
        evidencias: localActionPlan.evidencias?.filter(ev => ev.id !== evidenceId)
      };
    }

    setLocalActionPlan(updatedPlan);
    onUpdate?.(updatedPlan);
    toast.success('Evidência removida');
  };

  const handleCreateComment = () => {
    if (!newComment.texto.trim()) {
      toast.error('Texto do comentário é obrigatório');
      return;
    }

    const comment: ActionPlanComment = {
      id: `comment_${Date.now()}`,
      action_plan_id: localActionPlan.id,
      conteudo: newComment.texto,
      autor_id: 'current_user',
      autor_nome: 'Usuário Atual', // TODO: Pegar do contexto de auth
      created_at: new Date().toISOString(),
      tipo: newComment.tipo,
    };

    const updatedPlan = {
      ...localActionPlan,
      comentarios: [...(localActionPlan.comentarios || []), comment]
    };

    setLocalActionPlan(updatedPlan);
    setNewComment({
      texto: '',
      tipo: 'geral',
      referencia_id: ''
    });
    setShowAddComment(false);
    onUpdate?.(updatedPlan);
    toast.success('Comentário adicionado');
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedPlan = {
      ...localActionPlan,
      comentarios: localActionPlan.comentarios?.filter(comment => comment.id !== commentId)
    };

    setLocalActionPlan(updatedPlan);
    onUpdate?.(updatedPlan);
    toast.success('Comentário removido');
  };

  const handleStartEditActivity = (activity: SimpleActivity) => {
    setEditActivityData({
      titulo: activity.titulo,
      descricao: activity.descricao || '',
      data_fim_planejada: activity.data_fim_planejada,
      data_fim_replanejada: activity.data_fim_replanejada || '',
      prioridade: activity.prioridade as any,
      responsavel_nome: activity.responsavel?.nome || '',
      responsavel_email: activity.responsavel?.email || '',
      percentual_conclusao: activity.percentual_conclusao,
      status: activity.status
    });
    setEditingActivity(activity.id);
  };

  const handleSaveEditActivity = (activityId: string) => {
    if (!editActivityData.titulo || !editActivityData.data_fim_planejada) {
      toast.error('Título e prazo são obrigatórios');
      return;
    }

    const updates: Partial<SimpleActivity> = {
      titulo: editActivityData.titulo,
      descricao: editActivityData.descricao,
      data_fim_planejada: editActivityData.data_fim_planejada,
      data_fim_replanejada: editActivityData.data_fim_replanejada || undefined,
      prioridade: editActivityData.prioridade,
      responsavel: {
        nome: editActivityData.responsavel_nome || 'Não atribuído',
        email: editActivityData.responsavel_email || ''
      },
      percentual_conclusao: editActivityData.percentual_conclusao,
      status: editActivityData.status
    };

    handleUpdateActivity(activityId, updates);
    setEditingActivity(null);
  };

  const handleCancelEditActivity = () => {
    setEditingActivity(null);
    setEditActivityData({
      titulo: '',
      descricao: '',
      data_fim_planejada: '',
      data_fim_replanejada: '',
      prioridade: 'media',
      responsavel_nome: '',
      responsavel_email: '',
      percentual_conclusao: 0,
      status: 'pendente'
    });
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg border-l-4 ${localActionPlan.prioridade === 'critica' ? 'border-l-red-500' :
      localActionPlan.prioridade === 'alta' ? 'border-l-orange-500' :
        localActionPlan.prioridade === 'media' ? 'border-l-yellow-500' : 'border-l-green-500'
      } ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getModuleIcon(localActionPlan.modulo_origem)}
              <Badge variant="outline" className="text-xs">
                {localActionPlan.codigo}
              </Badge>
              <Badge className={getPriorityColor(localActionPlan.prioridade)}>
                {localActionPlan.prioridade}
              </Badge>
              <Badge className={getStatusColor(localActionPlan.status)}>
                {localActionPlan.status.replace('_', ' ')}
              </Badge>
            </div>

            <CardTitle className="text-lg mb-2 line-clamp-2">
              {localActionPlan.titulo}
            </CardTitle>

            {localActionPlan.descricao && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {localActionPlan.descricao}
              </p>
            )}
            {localActionPlan.nome_origem && (
              <p className="text-xs font-medium text-primary mt-1">
                Origem: {localActionPlan.nome_origem}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {showModuleLink && (
              <Badge variant="outline" className={`text-xs ${getModuleColor(localActionPlan.modulo_origem)}`}>
                {getModuleName(localActionPlan.modulo_origem)}
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
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

              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span>{localActionPlan.responsavel?.nome || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{localActionPlan.percentual_conclusao}%</span>
            </div>
          </div>

          <div className="space-y-1">
            <Progress value={localActionPlan.percentual_conclusao} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Prazo: {formatDate(localActionPlan.data_fim_planejada)}</span>
              <span>{localActionPlan.percentual_conclusao}% concluído</span>
            </div>
          </div>
        </div>

        {/* Quick Actions when expanded */}
        {isExpanded && (
          <div className="flex gap-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </>
              )}
            </Button>

            {isEditing && (
              <Button size="sm" onClick={() => {
                setIsEditing(false);
                toast.success('Plano atualizado');
              }}>
                <Save className="h-3 w-3 mr-1" />
                Salvar
              </Button>
            )}

            <Button variant="outline" size="sm">
              <CheckSquare className="h-3 w-3 mr-1" />
              Atualizar Status
            </Button>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="evidence">Evidências</TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Descrição</Label>
                    {isEditing ? (
                      <Textarea
                        placeholder="Descrição do plano de ação..."
                        defaultValue={localActionPlan.descricao}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {localActionPlan.descricao || 'Nenhuma descrição fornecida'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prioridade</Label>
                      {isEditing ? (
                        <Select defaultValue={localActionPlan.prioridade}>
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
                        <Badge className={getPriorityColor(localActionPlan.prioridade)}>
                          {localActionPlan.prioridade}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <Label>Status</Label>
                      {isEditing ? (
                        <Select defaultValue={localActionPlan.status}>
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
                        <Badge className={getStatusColor(localActionPlan.status)}>
                          {localActionPlan.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Progresso</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={localActionPlan.percentual_conclusao} className="flex-1" />
                        <span className="text-sm font-medium">{localActionPlan.percentual_conclusao}%</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {[0, 25, 50, 75, 100].map((value) => (
                          <Button
                            key={value}
                            variant={localActionPlan.percentual_conclusao === value ? "default" : "outline"}
                            size="sm"
                            onClick={() => toast.success(`Progresso atualizado para ${value}%`)}
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Atividades Detalhadas</h4>
                <Button size="sm" onClick={() => setShowAddActivity(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Nova Atividade
                </Button>
              </div>

              {showAddActivity && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Título da Atividade *</Label>
                          <Input
                            placeholder="Nome da atividade..."
                            value={newActivity.titulo}
                            onChange={(e) => setNewActivity({ ...newActivity, titulo: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Prazo *</Label>
                          <Input
                            type="date"
                            value={newActivity.data_fim_planejada}
                            onChange={(e) => setNewActivity({ ...newActivity, data_fim_planejada: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                          <Label>Responsável</Label>
                          <Input
                            placeholder="Nome do responsável..."
                            value={newActivity.responsavel_nome}
                            onChange={(e) => setNewActivity({ ...newActivity, responsavel_nome: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>E-mail do Responsável</Label>
                        <Input
                          type="email"
                          placeholder="email@empresa.com"
                          value={newActivity.responsavel_email}
                          onChange={(e) => setNewActivity({ ...newActivity, responsavel_email: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          placeholder="Descrição detalhada da atividade..."
                          rows={2}
                          value={newActivity.descricao}
                          onChange={(e) => setNewActivity({ ...newActivity, descricao: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreateActivity}>
                          <Save className="h-3 w-3 mr-1" />
                          Salvar Atividade
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

              <div className="space-y-3">
                {localActionPlan.atividades?.map((activity, index) => (
                  <Card key={activity.id} className="border-l-4 border-l-blue-400">
                    <CardContent className="p-4">
                      {editingActivity === activity.id ? (
                        // Modo de Edição
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                            <span className="text-sm font-medium text-blue-600">Editando Atividade</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Título *</Label>
                              <Input
                                value={editActivityData.titulo}
                                onChange={(e) => setEditActivityData({ ...editActivityData, titulo: e.target.value })}
                                placeholder="Nome da atividade..."
                              />
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={editActivityData.status}
                                onValueChange={(value) => setEditActivityData({ ...editActivityData, status: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                                  <SelectItem value="concluida">Concluída</SelectItem>
                                  <SelectItem value="pausado">Pausado</SelectItem>
                                  <SelectItem value="atrasada">Atrasada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Prazo Inicial *</Label>
                              <Input
                                type="date"
                                value={editActivityData.data_fim_planejada}
                                onChange={(e) => setEditActivityData({ ...editActivityData, data_fim_planejada: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Prazo Replanejado</Label>
                              <Input
                                type="date"
                                value={editActivityData.data_fim_replanejada}
                                onChange={(e) => setEditActivityData({ ...editActivityData, data_fim_replanejada: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Prioridade</Label>
                              <Select
                                value={editActivityData.prioridade}
                                onValueChange={(value) => setEditActivityData({ ...editActivityData, prioridade: value as any })}
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Responsável</Label>
                              <Input
                                value={editActivityData.responsavel_nome}
                                onChange={(e) => setEditActivityData({ ...editActivityData, responsavel_nome: e.target.value })}
                                placeholder="Nome do responsável..."
                              />
                            </div>
                            <div>
                              <Label>E-mail do Responsável</Label>
                              <Input
                                type="email"
                                value={editActivityData.responsavel_email}
                                onChange={(e) => setEditActivityData({ ...editActivityData, responsavel_email: e.target.value })}
                                placeholder="email@empresa.com"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Progresso (%)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editActivityData.percentual_conclusao}
                                onChange={(e) => setEditActivityData({ ...editActivityData, percentual_conclusao: parseInt(e.target.value) || 0 })}
                                className="w-20"
                              />
                              <Progress value={editActivityData.percentual_conclusao} className="flex-1" />
                              <span className="text-sm text-muted-foreground">{editActivityData.percentual_conclusao}%</span>
                            </div>
                          </div>

                          <div>
                            <Label>Descrição</Label>
                            <Textarea
                              value={editActivityData.descricao}
                              onChange={(e) => setEditActivityData({ ...editActivityData, descricao: e.target.value })}
                              placeholder="Descrição detalhada da atividade..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2 pt-2 border-t">
                            <Button size="sm" onClick={() => handleSaveEditActivity(activity.id)}>
                              <Save className="h-3 w-3 mr-1" />
                              Salvar Alterações
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEditActivity}>
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo de Visualização
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                                <h5 className="font-semibold">{activity.titulo}</h5>
                                <Badge className={getPriorityColor(activity.prioridade)}>
                                  <Flag className="h-3 w-3 mr-1" />
                                  {activity.prioridade}
                                </Badge>
                              </div>

                              {activity.descricao && (
                                <p className="text-sm text-muted-foreground mb-3">{activity.descricao}</p>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold">{activity.percentual_conclusao}%</div>
                              <Progress value={activity.percentual_conclusao} className="w-16 h-2" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Prazo Inicial</div>
                              <div className="font-medium">{formatDate(activity.data_fim_planejada)}</div>
                            </div>

                            {activity.data_fim_replanejada && (
                              <div>
                                <div className="text-orange-600">Replanejado</div>
                                <div className="font-medium text-orange-600">
                                  {formatDate(activity.data_fim_replanejada)}
                                </div>
                              </div>
                            )}

                            {activity.data_fim_real && (
                              <div>
                                <div className="text-green-600">Entrega Efetiva</div>
                                <div className="font-medium text-green-600">
                                  {formatDate(activity.data_fim_real)}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{activity.evidencias?.length || 0} evidências</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                <span>{activity.notificacoes_enviadas?.length || 0} notificações</span>
                              </div>
                            </div>


                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => {
                                  setNewEvidence({ ...newEvidence, activity_id: activity.id });
                                  setShowAddEvidence(true);
                                }}
                              >
                                <Paperclip className="h-3 w-3 mr-1" />
                                Anexar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => handleUpdateActivity(activity.id, {
                                  status: activity.status === 'concluida' ? 'em_execucao' : 'concluida',
                                  percentual_conclusao: activity.status === 'concluida' ? 75 : 100,
                                  data_fim_real: activity.status === 'concluida' ? undefined : new Date().toISOString().split('T')[0]
                                })}
                              >
                                <CheckSquare className="h-3 w-3 mr-1" />
                                {activity.status === 'concluida' ? 'Reabrir' : 'Finalizar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => handleStartEditActivity(activity)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-red-600 hover:text-red-700"
                                onClick={() => {
                                  if (window.confirm('Deseja excluir esta atividade?')) {
                                    handleDeleteActivity(activity.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )) || (
                    <Card className="border-dashed">
                      <CardContent className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma atividade cadastrada</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Adicione atividades para acompanhar o progresso detalhado
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
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Evidências do Plano</h4>
                <Button size="sm" onClick={() => {
                  setNewEvidence({ ...newEvidence, activity_id: '' });
                  setShowAddEvidence(true);
                }}>
                  <Plus className="h-3 w-3 mr-1" />
                  Nova Evidência
                </Button>
              </div>

              {showAddEvidence && (
                <Dialog open={showAddEvidence} onOpenChange={setShowAddEvidence}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Evidência</DialogTitle>
                      <DialogDescription>
                        Anexe uma evidência para {newEvidence.activity_id ? 'a atividade específica' : 'o plano geral'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label>Nome da Evidência *</Label>
                        <Input
                          placeholder="Nome do arquivo ou evidência..."
                          value={newEvidence.nome}
                          onChange={(e) => setNewEvidence({ ...newEvidence, nome: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={newEvidence.tipo}
                          onValueChange={(value) => setNewEvidence({ ...newEvidence, tipo: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="documento">Documento</SelectItem>
                            <SelectItem value="imagem">Imagem</SelectItem>
                            <SelectItem value="link">Link/URL</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newEvidence.tipo === 'link' && (
                        <div>
                          <Label>URL</Label>
                          <Input
                            type="url"
                            placeholder="https://..."
                            value={newEvidence.link_url}
                            onChange={(e) => setNewEvidence({ ...newEvidence, link_url: e.target.value })}
                          />
                        </div>
                      )}

                      {newEvidence.tipo === 'documento' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Arraste e solte arquivos aqui ou clique para selecionar
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Selecionar Arquivo
                          </Button>
                        </div>
                      )}

                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          placeholder="Descrição da evidência..."
                          rows={3}
                          value={newEvidence.descricao}
                          onChange={(e) => setNewEvidence({ ...newEvidence, descricao: e.target.value })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddEvidence(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateEvidence}>
                        <Save className="h-3 w-3 mr-1" />
                        Salvar Evidência
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Evidências Gerais do Plano */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Evidências Gerais</h5>
                {localActionPlan.evidencias?.length ? (
                  localActionPlan.evidencias.map((evidence) => (
                    <Card key={evidence.id} className="border-l-4 border-l-green-400">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <h6 className="font-medium">{evidence.titulo}</h6>
                              <Badge variant="outline" className={`text-xs ${getEvidenceTypeColor(evidence.tipo_arquivo)}`}>
                                {evidence.tipo_arquivo}
                              </Badge>
                            </div>
                            {evidence.descricao && (
                              <p className="text-sm text-muted-foreground mb-2">{evidence.descricao}</p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Adicionado em {formatDate(evidence.created_at)}
                            </div>

                          </div>
                          <div className="flex gap-1">
                            {evidence.link_url && (
                              <Button size="sm" variant="outline" className="h-7 px-2">
                                <Download className="h-3 w-3 mr-1" />
                                Abrir
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (window.confirm('Deseja excluir esta evidência?')) {
                                  handleDeleteEvidence(evidence.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Nenhuma evidência geral adicionada
                  </div>
                )}
              </div>

              {/* Evidências por Atividade */}
              {localActionPlan.atividades?.map((activity) => (
                activity.evidencias && activity.evidencias.length > 0 && (
                  <div key={activity.id} className="space-y-3">
                    <h5 className="text-sm font-medium text-muted-foreground">
                      Evidências - {activity.titulo}
                    </h5>
                    {activity.evidencias.map((evidence) => (
                      <Card key={evidence.id} className="border-l-4 border-l-blue-400">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h6 className="font-medium">{evidence.titulo}</h6>
                                <Badge variant="outline" className={`text-xs ${getEvidenceTypeColor(evidence.tipo_arquivo)}`}>
                                  {evidence.tipo_arquivo}
                                </Badge>
                              </div>

                              {evidence.descricao && (
                                <p className="text-sm text-muted-foreground mb-2">{evidence.descricao}</p>
                              )}
                              <div className="text-xs text-muted-foreground">
                                Adicionado em {formatDate(evidence.uploaded_at)}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {evidence.link_url && (
                                <Button size="sm" variant="outline" className="h-7 px-2">
                                  <Download className="h-3 w-3 mr-1" />
                                  Abrir
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-red-600 hover:text-red-700"
                                onClick={() => {
                                  if (window.confirm('Deseja excluir esta evidência?')) {
                                    handleDeleteEvidence(evidence.id, activity.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ))}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Comentários e Discussões</h4>
                <Button size="sm" onClick={() => setShowAddComment(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Novo Comentário
                </Button>
              </div>

              {showAddComment && (
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Tipo de Comentário</Label>
                        <Select
                          value={newComment.tipo}
                          onValueChange={(value) => setNewComment({ ...newComment, tipo: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="geral">Comentário Geral</SelectItem>
                            <SelectItem value="atividade">Sobre Atividade</SelectItem>
                            <SelectItem value="evidencia">Sobre Evidência</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newComment.tipo === 'atividade' && (
                        <div>
                          <Label>Atividade</Label>
                          <Select
                            value={newComment.referencia_id}
                            onValueChange={(value) => setNewComment({ ...newComment, referencia_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma atividade" />
                            </SelectTrigger>
                            <SelectContent>
                              {localActionPlan.atividades?.map((activity) => (
                                <SelectItem key={activity.id} value={activity.id}>
                                  {activity.titulo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label>Comentário *</Label>
                        <Textarea
                          placeholder="Escreva seu comentário..."
                          rows={3}
                          value={newComment.texto}
                          onChange={(e) => setNewComment({ ...newComment, texto: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreateComment}>
                          <Save className="h-3 w-3 mr-1" />
                          Publicar Comentário
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddComment(false)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {localActionPlan.comentarios?.length ? (
                  localActionPlan.comentarios
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((comment) => (
                      <Card key={comment.id} className="border-l-4 border-l-purple-400">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{comment.autor_nome}</span>
                                <Badge variant="outline" className={`text-xs ${getCommentTypeColor(comment.tipo)}`}>
                                  {comment.tipo}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>


                              {comment.referencia_id && comment.tipo === 'atividade' && (
                                <div className="text-xs text-blue-600 mb-2">
                                  Sobre a atividade: {localActionPlan.atividades?.find(a => a.id === comment.referencia_id)?.titulo}
                                </div>
                              )}

                              <p className="text-sm whitespace-pre-wrap">{comment.conteudo}</p>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (window.confirm('Deseja excluir este comentário?')) {
                                  handleDeleteComment(comment.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum comentário ainda</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Seja o primeiro a comentar sobre este plano de ação
                    </p>
                    <Button size="sm" onClick={() => setShowAddComment(true)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar Primeiro Comentário
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
};