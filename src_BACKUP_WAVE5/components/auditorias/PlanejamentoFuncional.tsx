import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  DollarSign,
  Activity,
  Play,
  Pause,
  Square,
  AlertCircle,
  Building2,
  Briefcase,
  FileText
} from 'lucide-react';

interface PlanoEstrategico {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  ano_inicio: number;
  ano_fim: number;
  percentual_conclusao: number;
  orcamento_total: number;
  orcamento_consumido: number;
  responsavel_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

interface ObjetivoEstrategico {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  status: string;
  percentual_conclusao: number;
  meta_valor_alvo: number;
  valor_atual: number;
  categoria?: string;
  prioridade?: string;
}

interface IniciativaEstrategica {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  status: string;
  percentual_conclusao: number;
  orcamento_planejado: number;
  orcamento_realizado: number;
  saude_projeto?: string;
}

export function PlanejamentoFuncional() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [planos, setPlanos] = useState<PlanoEstrategico[]>([]);
  const [objetivos, setObjetivos] = useState<ObjetivoEstrategico[]>([]);
  const [iniciativas, setIniciativas] = useState<IniciativaEstrategica[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planos');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<{type: string, id: string, data: any} | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar dados em paralelo
      const [planosResponse, objetivosResponse, iniciativasResponse] = await Promise.all([
        supabase
          .from('planos_estrategicos')
          .select('*')
          .eq('tenant_id', effectiveTenantId)
          .order('ano_inicio', { ascending: false }),
        
        supabase
          .from('objetivos_estrategicos')
          .select('*')
          .eq('tenant_id', effectiveTenantId)
          .order('percentual_conclusao', { ascending: false }),
          
        supabase
          .from('iniciativas_estrategicas')
          .select('*')
          .eq('tenant_id', effectiveTenantId)
          .order('percentual_conclusao', { ascending: false })
      ]);

      if (planosResponse.error) {
        console.error('Erro ao carregar planos:', planosResponse.error);
      } else {
        setPlanos(planosResponse.data || []);
      }

      if (objetivosResponse.error) {
        console.error('Erro ao carregar objetivos:', objetivosResponse.error);
      } else {
        setObjetivos(objetivosResponse.data || []);
      }

      if (iniciativasResponse.error) {
        console.error('Erro ao carregar iniciativas:', iniciativasResponse.error);
      } else {
        setIniciativas(iniciativasResponse.data || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'concluido': 
        return { 
          color: 'bg-emerald-600 text-white border-emerald-700', 
          icon: CheckCircle,
          variant: 'secondary' as const,
          label: 'Concluído'
        };
      case 'em_execucao': 
        return { 
          color: 'bg-blue-600 text-white border-blue-700', 
          icon: Play,
          variant: 'default' as const,
          label: 'Em Execução'
        };
      case 'em_andamento': 
        return { 
          color: 'bg-blue-600 text-white border-blue-700', 
          icon: Play,
          variant: 'default' as const,
          label: 'Em Andamento'
        };
      case 'planejamento':
      case 'aprovado': 
        return { 
          color: 'bg-amber-600 text-white border-amber-700', 
          icon: Clock,
          variant: 'secondary' as const,
          label: 'Planejamento'
        };
      case 'rascunho': 
        return { 
          color: 'bg-slate-600 text-white border-slate-700', 
          icon: Edit,
          variant: 'outline' as const,
          label: 'Rascunho'
        };
      case 'em_risco':
        return { 
          color: 'bg-orange-600 text-white border-orange-700', 
          icon: AlertCircle,
          variant: 'destructive' as const,
          label: 'Em Risco'
        };
      case 'cancelado': 
        return { 
          color: 'bg-red-600 text-white border-red-700', 
          icon: Square,
          variant: 'destructive' as const,
          label: 'Cancelado'
        };
      case 'suspenso':
        return { 
          color: 'bg-gray-600 text-white border-gray-700', 
          icon: Pause,
          variant: 'secondary' as const,
          label: 'Suspenso'
        };
      default: 
        return { 
          color: 'bg-slate-600 text-white border-slate-700', 
          icon: AlertCircle,
          variant: 'outline' as const,
          label: status
        };
    }
  };

  const getPrioridadeInfo = (prioridade: string) => {
    switch (prioridade) {
      case 'critica':
        return { color: 'bg-red-700 text-white border-red-800', label: 'Crítica' };
      case 'alta':
        return { color: 'bg-orange-600 text-white border-orange-700', label: 'Alta' };
      case 'media':
        return { color: 'bg-yellow-600 text-white border-yellow-700', label: 'Média' };
      case 'baixa':
        return { color: 'bg-green-600 text-white border-green-700', label: 'Baixa' };
      default:
        return { color: 'bg-gray-600 text-white border-gray-700', label: prioridade || 'Não definida' };
    }
  };

  const getSaudeProjetoInfo = (saude: string) => {
    switch (saude) {
      case 'verde':
        return { color: 'bg-emerald-600 text-white border-emerald-700', label: 'Saudável', icon: CheckCircle };
      case 'amarelo':
        return { color: 'bg-yellow-600 text-white border-yellow-700', label: 'Atenção', icon: AlertCircle };
      case 'vermelho':
        return { color: 'bg-red-600 text-white border-red-700', label: 'Crítico', icon: AlertCircle };
      default:
        return { color: 'bg-gray-600 text-white border-gray-700', label: 'Indefinido', icon: Clock };
    }
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const startEditing = (type: string, id: string, data: any) => {
    setEditingItem({ type, id, data });
    setEditForm({ ...data });
    setIsDialogOpen(true);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm({});
    setIsDialogOpen(false);
  };

  const saveChanges = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      let tableName = '';
      switch (editingItem.type) {
        case 'plano':
          tableName = 'planos_estrategicos';
          break;
        case 'objetivo':
          tableName = 'objetivos_estrategicos';
          break;
        case 'iniciativa':
          tableName = 'iniciativas_estrategicas';
          break;
        default:
          throw new Error('Tipo de item inválido');
      }

      const { error } = await supabase
        .from(tableName)
        .update(editForm)
        .eq('id', editingItem.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) {
        throw error;
      }

      toast.success('Alterações salvas com sucesso!');
      cancelEditing();
      await loadData();
      
    } catch (error: any) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: string, id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
      return;
    }

    try {
      let tableName = '';
      switch (type) {
        case 'plano':
          tableName = 'planos_estrategicos';
          break;
        case 'objetivo':
          tableName = 'objetivos_estrategicos';
          break;
        case 'iniciativa':
          tableName = 'iniciativas_estrategicas';
          break;
        default:
          throw new Error('Tipo de item inválido');
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId);
      
      if (error) {
        throw error;
      }

      toast.success('Item excluído com sucesso');
      await loadData();
      
    } catch (error: any) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const PlanoCard = ({ plano }: { plano: PlanoEstrategico }) => {
    const statusInfo = getStatusInfo(plano.status);
    const StatusIcon = statusInfo.icon;
    const isExpanded = expandedCards.has(plano.id);
    const progressPercent = Math.min(plano.percentual_conclusao, 100);
    const budgetPercent = plano.orcamento_total > 0 ? 
      Math.min((plano.orcamento_consumido / plano.orcamento_total) * 100, 100) : 0;

    return (
      <Card key={plano.id} className="w-full transition-all duration-200 hover:shadow-lg border-l-4 border-l-blue-500">
        <Collapsible open={isExpanded} onOpenChange={() => toggleCardExpansion(plano.id)}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg font-semibold">{plano.titulo}</CardTitle>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{plano.codigo}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {plano.ano_inicio} - {plano.ano_fim}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">{progressPercent}%</div>
                    <div className="text-xs text-muted-foreground">Progresso</div>
                  </div>
                  <Progress value={progressPercent} className="w-20 h-2" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="financial">Financeiro</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                    <p className="text-sm mt-1">{plano.descricao}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Período de Execução</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{plano.ano_inicio} - {plano.ano_fim}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Progresso Geral</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={progressPercent} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-blue-600">{progressPercent}%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <Label className="text-sm font-medium text-green-700">Orçamento Total</Label>
                      </div>
                      <p className="text-lg font-semibold text-green-800">
                        R$ {((plano.orcamento_total || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm font-medium text-blue-700">Valor Consumido</Label>
                      </div>
                      <p className="text-lg font-semibold text-blue-800">
                        R$ {((plano.orcamento_consumido || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-muted-foreground">Execução Orçamentária</Label>
                      <span className="text-sm font-medium">{budgetPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={budgetPercent} className="w-full h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>R$ 0</span>
                      <span>R$ {((plano.orcamento_total || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="mt-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => startEditing('plano', plano.id, plano)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Plano
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.info('Função de visualização será implementada')}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete('plano', plano.id, plano.titulo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const ObjetivoCard = ({ objetivo }: { objetivo: ObjetivoEstrategico }) => {
    const statusInfo = getStatusInfo(objetivo.status);
    const prioridadeInfo = getPrioridadeInfo(objetivo.prioridade || '');
    const StatusIcon = statusInfo.icon;
    const isExpanded = expandedCards.has(objetivo.id);
    const progressPercent = Math.min(objetivo.percentual_conclusao, 100);

    return (
      <Card key={objetivo.id} className="w-full transition-all duration-200 hover:shadow-lg border-l-4 border-l-green-500">
        <Collapsible open={isExpanded} onOpenChange={() => toggleCardExpansion(objetivo.id)}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg font-semibold">{objetivo.titulo}</CardTitle>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <Badge className={prioridadeInfo.color}>
                      {prioridadeInfo.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{objetivo.codigo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{progressPercent}%</div>
                    <div className="text-xs text-muted-foreground">Progresso</div>
                  </div>
                  <Progress value={progressPercent} className="w-20 h-2" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4 space-y-4">
                  {objetivo.descricao && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                      <p className="text-sm mt-1">{objetivo.descricao}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">{objetivo.categoria || 'Não definida'}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Progresso</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={progressPercent} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-green-600">{progressPercent}%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm font-medium text-blue-700">Meta</Label>
                      </div>
                      <p className="text-lg font-semibold text-blue-800">
                        {objetivo.meta_valor_alvo}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <Label className="text-sm font-medium text-green-700">Valor Atual</Label>
                      </div>
                      <p className="text-lg font-semibold text-green-800">
                        {objetivo.valor_atual}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-muted-foreground">Atingimento da Meta</Label>
                      <span className="text-sm font-medium">
                        {objetivo.meta_valor_alvo > 0 ? 
                          ((objetivo.valor_atual / objetivo.meta_valor_alvo) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={objetivo.meta_valor_alvo > 0 ? 
                        Math.min((objetivo.valor_atual / objetivo.meta_valor_alvo) * 100, 100) : 0} 
                      className="w-full h-3" 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="mt-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => startEditing('objetivo', objetivo.id, objetivo)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Objetivo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.info('Função de visualização será implementada')}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete('objetivo', objetivo.id, objetivo.titulo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const IniciativaCard = ({ iniciativa }: { iniciativa: IniciativaEstrategica }) => {
    const statusInfo = getStatusInfo(iniciativa.status);
    const saudeInfo = getSaudeProjetoInfo(iniciativa.saude_projeto || '');
    const StatusIcon = statusInfo.icon;
    const SaudeIcon = saudeInfo.icon;
    const isExpanded = expandedCards.has(iniciativa.id);
    const progressPercent = Math.min(iniciativa.percentual_conclusao, 100);
    const budgetPercent = iniciativa.orcamento_planejado > 0 ? 
      Math.min((iniciativa.orcamento_realizado / iniciativa.orcamento_planejado) * 100, 100) : 0;

    return (
      <Card key={iniciativa.id} className="w-full transition-all duration-200 hover:shadow-lg border-l-4 border-l-purple-500">
        <Collapsible open={isExpanded} onOpenChange={() => toggleCardExpansion(iniciativa.id)}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg font-semibold">{iniciativa.titulo}</CardTitle>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <Badge className={saudeInfo.color}>
                      <SaudeIcon className="h-3 w-3 mr-1" />
                      {saudeInfo.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{iniciativa.codigo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600">{progressPercent}%</div>
                    <div className="text-xs text-muted-foreground">Progresso</div>
                  </div>
                  <Progress value={progressPercent} className="w-20 h-2" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="financial">Financeiro</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4 space-y-4">
                  {iniciativa.descricao && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                      <p className="text-sm mt-1">{iniciativa.descricao}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Saúde do Projeto</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={saudeInfo.color}>
                          <SaudeIcon className="h-3 w-3 mr-1" />
                          {saudeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Progresso</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={progressPercent} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-purple-600">{progressPercent}%</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm font-medium text-blue-700">Orçamento Planejado</Label>
                      </div>
                      <p className="text-lg font-semibold text-blue-800">
                        R$ {((iniciativa.orcamento_planejado || 0)).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <Label className="text-sm font-medium text-green-700">Valor Realizado</Label>
                      </div>
                      <p className="text-lg font-semibold text-green-800">
                        R$ {((iniciativa.orcamento_realizado || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium text-muted-foreground">Execução Orçamentária</Label>
                      <span className="text-sm font-medium">{budgetPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={budgetPercent} className="w-full h-3" />
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="mt-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => startEditing('iniciativa', iniciativa.id, iniciativa)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Iniciativa
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.info('Função de visualização será implementada')}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete('iniciativa', iniciativa.id, iniciativa.titulo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planejamento Estratégico</h2>
          <p className="text-muted-foreground">Gestão completa do planejamento organizacional</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold">{planos.filter(p => p.status === 'em_execucao').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Objetivos</p>
                <p className="text-2xl font-bold">{objetivos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Iniciativas</p>
                <p className="text-2xl font-bold">{iniciativas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
                <p className="text-2xl font-bold">
                  {planos.length > 0 ? Math.round(planos.reduce((acc, p) => acc + p.percentual_conclusao, 0) / planos.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planos">Planos Estratégicos</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
          <TabsTrigger value="iniciativas">Iniciativas</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-4">
          <div className="space-y-4">
            {planos.map((plano) => (
              <PlanoCard key={plano.id} plano={plano} />
            ))}
          </div>

          {planos.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum plano encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro plano estratégico para começar.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Plano
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="objetivos" className="space-y-4">
          <div className="space-y-4">
            {objetivos.map((objetivo) => (
              <ObjetivoCard key={objetivo.id} objetivo={objetivo} />
            ))}
          </div>

          {objetivos.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum objetivo encontrado</h3>
                <p className="text-muted-foreground">
                  Os objetivos estratégicos aparecerão aqui quando forem criados.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="iniciativas" className="space-y-4">
          <div className="space-y-4">
            {iniciativas.map((iniciativa) => (
              <IniciativaCard key={iniciativa.id} iniciativa={iniciativa} />
            ))}
          </div>

          {iniciativas.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma iniciativa encontrada</h3>
                <p className="text-muted-foreground">
                  As iniciativas estratégicas aparecerão aqui quando forem criadas.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Planos</span>
                    <span className="font-semibold">{planos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Em Execução</span>
                    <span className="font-semibold">{planos.filter(p => p.status === 'em_execucao').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Concluídos</span>
                    <span className="font-semibold">{planos.filter(p => p.status === 'concluido').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Objetivos</span>
                    <span className="font-semibold">{objetivos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Iniciativas</span>
                    <span className="font-semibold">{iniciativas.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Orçamento Total (Planos)</span>
                    <span className="font-semibold">
                      R$ {(planos.reduce((acc, p) => acc + (p.orcamento_total || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consumido (Planos)</span>
                    <span className="font-semibold">
                      R$ {(planos.reduce((acc, p) => acc + (p.orcamento_consumido || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orçamento (Iniciativas)</span>
                    <span className="font-semibold">
                      R$ {(iniciativas.reduce((acc, i) => acc + (i.orcamento_planejado || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Realizado (Iniciativas)</span>
                    <span className="font-semibold">
                      R$ {(iniciativas.reduce((acc, i) => acc + (i.orcamento_realizado || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar {editingItem?.type === 'plano' ? 'Plano Estratégico' : 
                     editingItem?.type === 'objetivo' ? 'Objetivo Estratégico' : 'Iniciativa Estratégica'}
            </DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias nos campos abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={editForm.titulo || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Digite o título..."
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={editForm.descricao || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Digite a descrição..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={editForm.status || ''} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="percentual_conclusao">Progresso (%)</Label>
                <Input
                  id="percentual_conclusao"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.percentual_conclusao || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, percentual_conclusao: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            {editingItem?.type === 'plano' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ano_inicio">Ano Início</Label>
                    <Input
                      id="ano_inicio"
                      type="number"
                      value={editForm.ano_inicio || 2025}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ano_inicio: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ano_fim">Ano Fim</Label>
                    <Input
                      id="ano_fim"
                      type="number"
                      value={editForm.ano_fim || 2025}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ano_fim: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orcamento_total">Orçamento Total (R$)</Label>
                    <Input
                      id="orcamento_total"
                      type="number"
                      step="0.01"
                      value={editForm.orcamento_total || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, orcamento_total: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="orcamento_consumido">Orçamento Consumido (R$)</Label>
                    <Input
                      id="orcamento_consumido"
                      type="number"
                      step="0.01"
                      value={editForm.orcamento_consumido || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, orcamento_consumido: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              </>
            )}

            {editingItem?.type === 'objetivo' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select 
                      value={editForm.categoria || ''} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, categoria: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Processo">Processo</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Qualidade">Qualidade</SelectItem>
                        <SelectItem value="Inovacao">Inovação</SelectItem>
                        <SelectItem value="Pessoas">Pessoas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select 
                      value={editForm.prioridade || ''} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, prioridade: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta_valor_alvo">Meta</Label>
                    <Input
                      id="meta_valor_alvo"
                      type="number"
                      value={editForm.meta_valor_alvo || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, meta_valor_alvo: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor_atual">Valor Atual</Label>
                    <Input
                      id="valor_atual"
                      type="number"
                      value={editForm.valor_atual || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, valor_atual: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              </>
            )}

            {editingItem?.type === 'iniciativa' && (
              <>
                <div>
                  <Label htmlFor="saude_projeto">Saúde do Projeto</Label>
                  <Select 
                    value={editForm.saude_projeto || ''} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, saude_projeto: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a saúde" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verde">Verde (Saudável)</SelectItem>
                      <SelectItem value="amarelo">Amarelo (Atenção)</SelectItem>
                      <SelectItem value="vermelho">Vermelho (Crítico)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orcamento_planejado">Orçamento Planejado (R$)</Label>
                    <Input
                      id="orcamento_planejado"
                      type="number"
                      step="0.01"
                      value={editForm.orcamento_planejado || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, orcamento_planejado: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="orcamento_realizado">Orçamento Realizado (R$)</Label>
                    <Input
                      id="orcamento_realizado"
                      type="number"
                      step="0.01"
                      value={editForm.orcamento_realizado || 0}
                      onChange={(e) => setEditForm(prev => ({ ...prev, orcamento_realizado: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelEditing} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveChanges} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PlanejamentoFuncional;