import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PlanoAcao {
  id: string;
  tenant_id: string;
  apontamento_id: string;
  descricao_acao: string;
  responsavel_id: string;
  data_vencimento: string;
  data_conclusao?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado';
  percentual_conclusao: number;
  ultima_atualizacao_responsavel?: string;
  comentario_responsavel?: string;
  evidencias_conclusao?: string[];
  arquivos_evidencia?: any;
  avaliado_por?: string;
  data_avaliacao?: string;
  resultado_avaliacao?: 'aprovado' | 'rejeitado' | 'pendente_revisao';
  comentario_auditoria?: string;
  metadados?: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  responsavel?: {
    nome: string;
    email: string;
  };
  apontamento?: {
    codigo: string;
    titulo: string;
  };
}

interface PlanoAcaoFormData {
  apontamento_id: string;
  descricao_acao: string;
  responsavel_id: string;
  data_vencimento: string;
  status: string;
  percentual_conclusao: number;
  comentario_responsavel?: string;
}

export function PlanosAcaoPage() {
  const { user } = useAuth();
  const [planos, setPlanos] = useState<PlanoAcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<PlanoAcao | null>(null);
  const [formData, setFormData] = useState<PlanoAcaoFormData>({
    apontamento_id: '',
    descricao_acao: '',
    responsavel_id: '',
    data_vencimento: '',
    status: 'pendente',
    percentual_conclusao: 0,
    comentario_responsavel: ''
  });

  const [apontamentos, setApontamentos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    loadPlanosAcao();
    loadApontamentos();
    loadUsuarios();
  }, []);

  const loadPlanosAcao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('planos_acao')
        .select(`
          *,
          responsavel:profiles!planos_acao_responsavel_id_fkey(nome, email),
          apontamento:apontamentos!planos_acao_apontamento_id_fkey(codigo, titulo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos de ação:', error);
      toast.error('Erro ao carregar planos de ação');
    } finally {
      setLoading(false);
    }
  };

  const loadApontamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('apontamentos')
        .select('id, codigo, titulo')
        .order('codigo');

      if (error) throw error;
      setApontamentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar apontamentos:', error);
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

  const handleCreatePlano = async () => {
    try {
      const { error } = await supabase
        .from('planos_acao')
        .insert([{
          ...formData,
          tenant_id: user?.tenant_id,
          created_by: user?.id,
          updated_by: user?.id
        }]);

      if (error) throw error;
      
      toast.success('Plano de ação criado com sucesso!');
      setIsCreateDialogOpen(false);
      resetForm();
      loadPlanosAcao();
    } catch (error) {
      console.error('Erro ao criar plano de ação:', error);
      toast.error('Erro ao criar plano de ação');
    }
  };

  const handleUpdatePlano = async () => {
    if (!selectedPlano) return;

    try {
      const { error } = await supabase
        .from('planos_acao')
        .update({
          ...formData,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPlano.id);

      if (error) throw error;
      
      toast.success('Plano de ação atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedPlano(null);
      resetForm();
      loadPlanosAcao();
    } catch (error) {
      console.error('Erro ao atualizar plano de ação:', error);
      toast.error('Erro ao atualizar plano de ação');
    }
  };

  const handleDeletePlano = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano de ação?')) return;

    try {
      const { error } = await supabase
        .from('planos_acao')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Plano de ação excluído com sucesso!');
      loadPlanosAcao();
    } catch (error) {
      console.error('Erro ao excluir plano de ação:', error);
      toast.error('Erro ao excluir plano de ação');
    }
  };

  const resetForm = () => {
    setFormData({
      apontamento_id: '',
      descricao_acao: '',
      responsavel_id: '',
      data_vencimento: '',
      status: 'pendente',
      percentual_conclusao: 0,
      comentario_responsavel: ''
    });
  };

  const openEditDialog = (plano: PlanoAcao) => {
    setSelectedPlano(plano);
    setFormData({
      apontamento_id: plano.apontamento_id,
      descricao_acao: plano.descricao_acao,
      responsavel_id: plano.responsavel_id,
      data_vencimento: plano.data_vencimento,
      status: plano.status,
      percentual_conclusao: plano.percentual_conclusao,
      comentario_responsavel: plano.comentario_responsavel || ''
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      em_andamento: { label: 'Em Andamento', variant: 'default' as const },
      concluido: { label: 'Concluído', variant: 'success' as const },
      atrasado: { label: 'Atrasado', variant: 'destructive' as const },
      cancelado: { label: 'Cancelado', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config?.variant || 'secondary'}>
        {config?.label || status}
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

  const filteredPlanos = planos.filter(plano => {
    const matchesSearch = plano.descricao_acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plano.apontamento?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plano.apontamento?.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plano.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const FormDialog = ({ isOpen, onClose, title, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSubmit: () => void;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {title.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apontamento">Apontamento</Label>
              <Select value={formData.apontamento_id} onValueChange={(value) => 
                setFormData({ ...formData, apontamento_id: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um apontamento" />
                </SelectTrigger>
                <SelectContent>
                  {apontamentos.map((apontamento) => (
                    <SelectItem key={apontamento.id} value={apontamento.id}>
                      {apontamento.codigo} - {apontamento.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select value={formData.responsavel_id} onValueChange={(value) => 
                setFormData({ ...formData, responsavel_id: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da Ação</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva o plano de ação..."
              value={formData.descricao_acao}
              onChange={(e) => setFormData({ ...formData, descricao_acao: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
              />
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
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentario">Comentário do Responsável</Label>
            <Textarea
              id="comentario"
              placeholder="Comentários adicionais..."
              value={formData.comentario_responsavel}
              onChange={(e) => setFormData({ ...formData, comentario_responsavel: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {title === 'Criar Plano de Ação' ? 'Criar' : 'Atualizar'}
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
          <p className="mt-2 text-gray-600">Carregando planos de ação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos de Ação</h1>
          <p className="text-muted-foreground">
            Gerencie planos de ação para apontamentos de auditoria
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano de Ação
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar planos de ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredPlanos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum plano de ação encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum plano corresponde aos filtros aplicados.' 
                  : 'Comece criando seu primeiro plano de ação.'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Plano de Ação
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPlanos.map((plano) => (
            <Card key={plano.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {plano.apontamento?.codigo} - {plano.apontamento?.titulo}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {plano.descricao_acao}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(plano.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(plano)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlano(plano.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{plano.responsavel?.nome}</p>
                      <p className="text-xs text-muted-foreground">{plano.responsavel?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(plano.data_vencimento).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">Vencimento</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-muted-foreground">
                        {plano.percentual_conclusao}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(plano.percentual_conclusao)}`}
                        style={{ width: `${plano.percentual_conclusao}%` }}
                      />
                    </div>
                  </div>
                </div>

                {plano.comentario_responsavel && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm font-medium">Comentário do Responsável</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plano.comentario_responsavel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <FormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Criar Plano de Ação"
        onSubmit={handleCreatePlano}
      />

      <FormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Editar Plano de Ação"
        onSubmit={handleUpdatePlano}
      />
    </div>
  );
}