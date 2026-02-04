import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Calendar, User, Clock, Target, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Atividade {
  id: string;
  tenant_id: string;
  iniciativa_id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  atividade_pai_id?: string;
  nivel: number;
  ordem_exibicao: number;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  data_inicio_real?: string;
  data_fim_real?: string;
  duracao_planejada: number;
  duracao_real?: number;
  responsavel_id: string;
  recursos_ids?: string[];
  horas_planejadas: number;
  horas_realizadas: number;
  status: 'nao_iniciado' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
  percentual_conclusao: number;
  dependencias?: string[];
  tipo_dependencia?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  tipo: 'tarefa' | 'marco' | 'fase' | 'entrega';
  critica: boolean;
  metadados?: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  responsavel?: {
    nome: string;
    email: string;
  };
  iniciativa?: {
    codigo: string;
    titulo: string;
  };
  subatividades?: Atividade[];
  expanded?: boolean;
}

interface AtividadeFormData {
  iniciativa_id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  atividade_pai_id?: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  duracao_planejada: number;
  responsavel_id: string;
  horas_planejadas: number;
  horas_realizadas: number;
  status: string;
  percentual_conclusao: number;
  tipo: string;
  critica: boolean;
}

export function CronogramaAtividadesPage() {
  const { user } = useAuth();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadesTree, setAtividadesTree] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);
  const [formData, setFormData] = useState<AtividadeFormData>({
    iniciativa_id: '',
    codigo: '',
    titulo: '',
    descricao: '',
    atividade_pai_id: '',
    data_inicio_planejada: '',
    data_fim_planejada: '',
    duracao_planejada: 1,
    responsavel_id: '',
    horas_planejadas: 8,
    horas_realizadas: 0,
    status: 'nao_iniciado',
    percentual_conclusao: 0,
    tipo: 'tarefa',
    critica: false
  });

  const [iniciativas, setIniciativas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    loadAtividades();
    loadIniciativas();
    loadUsuarios();
  }, []);

  useEffect(() => {
    buildAtividadesTree();
  }, [atividades]);

  const loadAtividades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cronograma_atividades')
        .select(`
          *,
          responsavel:profiles!cronograma_atividades_responsavel_id_fkey(nome, email),
          iniciativa:iniciativas_estrategicas!cronograma_atividades_iniciativa_id_fkey(codigo, titulo)
        `)
        .order('ordem_exibicao');

      if (error) throw error;
      setAtividades(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const loadIniciativas = async () => {
    try {
      const { data, error } = await supabase
        .from('iniciativas_estrategicas')
        .select('id, codigo, titulo')
        .order('codigo');

      if (error) throw error;
      setIniciativas(data || []);
    } catch (error) {
      console.error('Erro ao carregar iniciativas:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email')
        .order('nome');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const buildAtividadesTree = () => {
    const atividadesMap = new Map<string, Atividade>();
    const rootAtividades: Atividade[] = [];

    atividades.forEach(atividade => {
      atividadesMap.set(atividade.id, { ...atividade, subatividades: [], expanded: false });
    });

    atividades.forEach(atividade => {
      const atividadeNode = atividadesMap.get(atividade.id)!;
      if (atividade.atividade_pai_id) {
        const pai = atividadesMap.get(atividade.atividade_pai_id);
        if (pai) {
          pai.subatividades!.push(atividadeNode);
        }
      } else {
        rootAtividades.push(atividadeNode);
      }
    });

    setAtividadesTree(rootAtividades);
  };

  const handleCreateAtividade = async () => {
    try {
      const ordemExibicao = Math.max(...atividades.map(a => a.ordem_exibicao), 0) + 1;
      const nivel = formData.atividade_pai_id 
        ? (atividades.find(a => a.id === formData.atividade_pai_id)?.nivel || 0) + 1 
        : 1;

      const { error } = await supabase
        .from('cronograma_atividades')
        .insert([{
          ...formData,
          tenant_id: user?.tenant_id,
          nivel,
          ordem_exibicao: ordemExibicao,
          created_by: user?.id,
          updated_by: user?.id
        }]);

      if (error) throw error;
      
      toast.success('Atividade criada com sucesso!');
      setIsCreateDialogOpen(false);
      resetForm();
      loadAtividades();
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      toast.error('Erro ao criar atividade');
    }
  };

  const handleUpdateAtividade = async () => {
    if (!selectedAtividade) return;

    try {
      const { error } = await supabase
        .from('cronograma_atividades')
        .update({
          ...formData,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAtividade.id);

      if (error) throw error;
      
      toast.success('Atividade atualizada com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedAtividade(null);
      resetForm();
      loadAtividades();
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      toast.error('Erro ao atualizar atividade');
    }
  };

  const handleDeleteAtividade = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;

    try {
      const { error } = await supabase
        .from('cronograma_atividades')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Atividade excluída com sucesso!');
      loadAtividades();
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      toast.error('Erro ao excluir atividade');
    }
  };

  const toggleExpansion = (atividadeId: string) => {
    setAtividadesTree(prev => 
      prev.map(atividade => 
        atividade.id === atividadeId 
          ? { ...atividade, expanded: !atividade.expanded }
          : {
              ...atividade,
              subatividades: atividade.subatividades?.map(sub =>
                sub.id === atividadeId 
                  ? { ...sub, expanded: !sub.expanded }
                  : sub
              )
            }
      )
    );
  };

  const resetForm = () => {
    setFormData({
      iniciativa_id: '',
      codigo: '',
      titulo: '',
      descricao: '',
      atividade_pai_id: '',
      data_inicio_planejada: '',
      data_fim_planejada: '',
      duracao_planejada: 1,
      responsavel_id: '',
      horas_planejadas: 8,
      horas_realizadas: 0,
      status: 'nao_iniciado',
      percentual_conclusao: 0,
      tipo: 'tarefa',
      critica: false
    });
  };

  const openEditDialog = (atividade: Atividade) => {
    setSelectedAtividade(atividade);
    setFormData({
      iniciativa_id: atividade.iniciativa_id,
      codigo: atividade.codigo,
      titulo: atividade.titulo,
      descricao: atividade.descricao,
      atividade_pai_id: atividade.atividade_pai_id || '',
      data_inicio_planejada: atividade.data_inicio_planejada,
      data_fim_planejada: atividade.data_fim_planejada,
      duracao_planejada: atividade.duracao_planejada,
      responsavel_id: atividade.responsavel_id,
      horas_planejadas: atividade.horas_planejadas,
      horas_realizadas: atividade.horas_realizadas,
      status: atividade.status,
      percentual_conclusao: atividade.percentual_conclusao,
      tipo: atividade.tipo,
      critica: atividade.critica
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      nao_iniciado: { label: 'Não Iniciado', variant: 'secondary' as const },
      em_andamento: { label: 'Em Andamento', variant: 'default' as const },
      pausado: { label: 'Pausado', variant: 'warning' as const },
      concluido: { label: 'Concluído', variant: 'success' as const },
      cancelado: { label: 'Cancelado', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config?.variant || 'secondary'}>
        {config?.label || status}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      tarefa: { label: 'Tarefa', variant: 'default' as const },
      marco: { label: 'Marco', variant: 'secondary' as const },
      fase: { label: 'Fase', variant: 'outline' as const },
      entrega: { label: 'Entrega', variant: 'destructive' as const }
    };

    const config = tipoConfig[tipo as keyof typeof tipoConfig];
    return (
      <Badge variant={config?.variant || 'default'}>
        {config?.label || tipo}
      </Badge>
    );
  };

  const getProgressColor = (percentual: number) => {
    if (percentual === 100) return 'bg-green-500';
    if (percentual >= 75) return 'bg-blue-500';
    if (percentual >= 50) return 'bg-yellow-500';
    if (percentual >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const calcularDiasRestantes = (dataFim: string) => {
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diffTime = fim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderAtividade = (atividade: Atividade, level: number = 0) => {
    const diasRestantes = calcularDiasRestantes(atividade.data_fim_planejada);
    
    return (
      <div key={atividade.id} className={`ml-${level * 4}`}>
        <Card className={`mb-2 ${atividade.critica ? 'border-red-500 border-l-4' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {atividade.subatividades && atividade.subatividades.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpansion(atividade.id)}
                    className="p-1 h-6 w-6"
                  >
                    {atividade.expanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                )}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {atividade.codigo} - {atividade.titulo}
                    </CardTitle>
                    {atividade.critica && (
                      <Target className="h-4 w-4 text-red-500" title="Atividade Crítica" />
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {atividade.descricao}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(atividade.status)}
                    {getTipoBadge(atividade.tipo)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(atividade)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAtividade(atividade.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{atividade.responsavel?.nome}</p>
                  <p className="text-xs text-muted-foreground">{atividade.responsavel?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {new Date(atividade.data_inicio_planejada).toLocaleDateString('pt-BR')} - {' '}
                    {new Date(atividade.data_fim_planejada).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 
                     diasRestantes === 0 ? 'Vence hoje' : `${Math.abs(diasRestantes)} dias em atraso`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {atividade.horas_realizadas}h / {atividade.horas_planejadas}h
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Duração: {atividade.duracao_planejada} dias
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm text-muted-foreground">
                    {atividade.percentual_conclusao}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(atividade.percentual_conclusao)}`}
                    style={{ width: `${atividade.percentual_conclusao}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {atividade.expanded && atividade.subatividades && atividade.subatividades.map(subatividade =>
          renderAtividade(subatividade, level + 1)
        )}
      </div>
    );
  };

  const FormDialog = ({ isOpen, onClose, title, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSubmit: () => void;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {title.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iniciativa">Iniciativa</Label>
              <Select value={formData.iniciativa_id} onValueChange={(value) => 
                setFormData({ ...formData, iniciativa_id: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma iniciativa" />
                </SelectTrigger>
                <SelectContent>
                  {iniciativas.map((iniciativa) => (
                    <SelectItem key={iniciativa.id} value={iniciativa.id}>
                      {iniciativa.codigo} - {iniciativa.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="atividade_pai">Atividade Pai (opcional)</Label>
              <Select value={formData.atividade_pai_id} onValueChange={(value) => 
                setFormData({ ...formData, atividade_pai_id: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a atividade pai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Nenhuma (atividade raiz)</SelectItem>
                  {atividades.filter(a => a.tipo === 'fase').map((atividade) => (
                    <SelectItem key={atividade.id} value={atividade.id}>
                      {atividade.codigo} - {atividade.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="Código da atividade"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Título da atividade"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva a atividade..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio_planejada}
                onChange={(e) => setFormData({ ...formData, data_inicio_planejada: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim_planejada}
                onChange={(e) => setFormData({ ...formData, data_fim_planejada: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (dias)</Label>
              <Input
                id="duracao"
                type="number"
                min="1"
                value={formData.duracao_planejada}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  duracao_planejada: parseInt(e.target.value) || 1 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horas_planejadas">Horas Planejadas</Label>
              <Input
                id="horas_planejadas"
                type="number"
                min="0"
                step="0.5"
                value={formData.horas_planejadas}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  horas_planejadas: parseFloat(e.target.value) || 0 
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select value={formData.responsavel_id} onValueChange={(value) => 
                setFormData({ ...formData, responsavel_id: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id}>
                      {usuario.nome} - {usuario.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => 
                setFormData({ ...formData, status: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value) => 
                setFormData({ ...formData, tipo: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarefa">Tarefa</SelectItem>
                  <SelectItem value="marco">Marco</SelectItem>
                  <SelectItem value="fase">Fase</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentual">Progresso (%)</Label>
              <Input
                id="percentual"
                type="number"
                min="0"
                max="100"
                value={formData.percentual_conclusao}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  percentual_conclusao: parseInt(e.target.value) || 0 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horas_realizadas">Horas Realizadas</Label>
              <Input
                id="horas_realizadas"
                type="number"
                min="0"
                step="0.5"
                value={formData.horas_realizadas}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  horas_realizadas: parseFloat(e.target.value) || 0 
                })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="critica" 
              checked={formData.critica}
              onCheckedChange={(checked) => setFormData({ ...formData, critica: checked as boolean })}
            />
            <Label htmlFor="critica">Atividade crítica (no caminho crítico)</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {title === 'Criar Atividade' ? 'Criar' : 'Atualizar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cronograma de Atividades</h1>
          <p className="text-muted-foreground">
            Gerencie o cronograma e acompanhe o progresso das atividades estratégicas
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar atividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="tarefa">Tarefas</SelectItem>
            <SelectItem value="marco">Marcos</SelectItem>
            <SelectItem value="fase">Fases</SelectItem>
            <SelectItem value="entrega">Entregas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {atividadesTree.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comece criando sua primeira atividade no cronograma.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Atividade
              </Button>
            </CardContent>
          </Card>
        ) : (
          atividadesTree.map(atividade => renderAtividade(atividade))
        )}
      </div>

      <FormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Criar Atividade"
        onSubmit={handleCreateAtividade}
      />

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Editar Atividade"
        onSubmit={handleUpdateAtividade}
      />
    </div>
  );
}