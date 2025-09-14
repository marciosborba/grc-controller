import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, User, AlertTriangle, CheckCircle, XCircle, Plus, Search, Filter, Mail, Smartphone, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notificacao {
  id: string;
  tenant_id: string;
  tipo: 'prazo_vencendo' | 'marco_atrasado' | 'kpi_fora_meta' | 'risco_alto' | 'aprovacao_pendente' | 'status_mudou';
  titulo: string;
  mensagem: string;
  entidade_tipo: 'plano_estrategico' | 'objetivo' | 'iniciativa' | 'atividade' | 'plano_acao';
  entidade_id: string;
  destinatario_id?: string;
  grupo_notificacao?: string;
  canal: 'sistema' | 'email' | 'sms' | 'push';
  enviada: boolean;
  data_envio?: string;
  lida: boolean;
  data_leitura?: string;
  recorrente: boolean;
  proxima_execucao?: string;
  created_at: string;
  created_by: string;
  destinatario?: {
    nome: string;
    email: string;
  };
  entidade_referencia?: {
    codigo: string;
    titulo: string;
  };
}

interface NotificacaoFormData {
  tipo: string;
  titulo: string;
  mensagem: string;
  entidade_tipo: string;
  entidade_id: string;
  destinatario_id: string;
  grupo_notificacao: string;
  canal: string;
  recorrente: boolean;
  proxima_execucao: string;
}

export function NotificacoesPlanejamento() {
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  const [tabAtiva, setTabAtiva] = useState('todas');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NotificacaoFormData>({
    tipo: 'prazo_vencendo',
    titulo: '',
    mensagem: '',
    entidade_tipo: 'atividade',
    entidade_id: '',
    destinatario_id: '',
    grupo_notificacao: '',
    canal: 'sistema',
    recorrente: false,
    proxima_execucao: ''
  });

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [entidades, setEntidades] = useState<any[]>([]);

  useEffect(() => {
    loadNotificacoes();
    loadUsuarios();
    loadEntidades();
  }, []);

  const loadNotificacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notificacoes_planejamento')
        .select(`
          *,
          destinatario:profiles!notificacoes_planejamento_destinatario_id_fkey(nome, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Enriquecer com dados das entidades referenciadas
      const notificacoesEnriquecidas = await Promise.all(
        (data || []).map(async (notif) => {
          let entidadeRef = null;
          try {
            switch (notif.entidade_tipo) {
              case 'atividade':
                const { data: atividade } = await supabase
                  .from('cronograma_atividades')
                  .select('codigo, titulo')
                  .eq('id', notif.entidade_id)
                  .single();
                entidadeRef = atividade;
                break;
              case 'plano_acao':
                const { data: plano } = await supabase
                  .from('planos_acao')
                  .select('descricao_acao')
                  .eq('id', notif.entidade_id)
                  .single();
                entidadeRef = plano ? { codigo: 'PLANO', titulo: plano.descricao_acao } : null;
                break;
              case 'iniciativa':
                const { data: iniciativa } = await supabase
                  .from('iniciativas_estrategicas')
                  .select('codigo, titulo')
                  .eq('id', notif.entidade_id)
                  .single();
                entidadeRef = iniciativa;
                break;
            }
          } catch (err) {
            console.warn('Erro ao carregar entidade referenciada:', err);
          }

          return {
            ...notif,
            entidade_referencia: entidadeRef
          };
        })
      );

      setNotificacoes(notificacoesEnriquecidas);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
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

  const loadEntidades = async () => {
    try {
      const { data: atividades, error: errorAtividades } = await supabase
        .from('cronograma_atividades')
        .select('id, codigo, titulo')
        .order('codigo');

      const { data: planos, error: errorPlanos } = await supabase
        .from('planos_acao')
        .select('id, descricao_acao')
        .order('created_at');

      const { data: iniciativas, error: errorIniciativas } = await supabase
        .from('iniciativas_estrategicas')
        .select('id, codigo, titulo')
        .order('codigo');

      if (errorAtividades) throw errorAtividades;
      if (errorPlanos) throw errorPlanos;
      if (errorIniciativas) throw errorIniciativas;

      const todasEntidades = [
        ...(atividades || []).map(a => ({ ...a, tipo: 'atividade', label: `${a.codigo} - ${a.titulo}` })),
        ...(planos || []).map(p => ({ id: p.id, codigo: 'PLANO', titulo: p.descricao_acao, tipo: 'plano_acao', label: `PLANO - ${p.descricao_acao}` })),
        ...(iniciativas || []).map(i => ({ ...i, tipo: 'iniciativa', label: `${i.codigo} - ${i.titulo}` }))
      ];

      setEntidades(todasEntidades);
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
    }
  };

  const createNotificacao = async () => {
    try {
      const { error } = await supabase
        .from('notificacoes_planejamento')
        .insert([{
          ...formData,
          tenant_id: user?.tenant_id,
          enviada: false,
          lida: false,
          created_by: user?.id,
          proxima_execucao: formData.proxima_execucao || new Date().toISOString()
        }]);

      if (error) throw error;
      
      toast.success('Notificação criada com sucesso!');
      setIsCreateDialogOpen(false);
      resetForm();
      loadNotificacoes();
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      toast.error('Erro ao criar notificação');
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes_planejamento')
        .update({
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao atualizar notificação');
    }
  };

  const enviarNotificacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes_planejamento')
        .update({
          enviada: true,
          data_envio: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Notificação enviada!');
      loadNotificacoes();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'prazo_vencendo',
      titulo: '',
      mensagem: '',
      entidade_tipo: 'atividade',
      entidade_id: '',
      destinatario_id: '',
      grupo_notificacao: '',
      canal: 'sistema',
      recorrente: false,
      proxima_execucao: ''
    });
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      prazo_vencendo: Clock,
      marco_atrasado: Calendar,
      kpi_fora_meta: CheckCircle,
      risco_alto: AlertTriangle,
      aprovacao_pendente: CheckCircle,
      status_mudou: Bell
    };
    const Icon = icons[tipo as keyof typeof icons] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      prazo_vencendo: 'blue',
      marco_atrasado: 'orange',
      kpi_fora_meta: 'green',
      risco_alto: 'red',
      aprovacao_pendente: 'yellow',
      status_mudou: 'gray'
    };
    return colors[tipo as keyof typeof colors] || 'gray';
  };

  const getCanalIcon = (canal: string) => {
    const icons = {
      sistema: Bell,
      email: Mail,
      sms: Smartphone,
      push: Bell
    };
    const Icon = icons[canal as keyof typeof icons] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const notificacoesFiltradas = notificacoes.filter(notif => {
    const matchesSearch = notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.mensagem.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filtroTipo === 'all' || notif.tipo === filtroTipo;
    const matchesStatus = filtroStatus === 'all' || 
                         (filtroStatus === 'nao_lida' && !notif.lida) ||
                         (filtroStatus === 'lida' && notif.lida) ||
                         (filtroStatus === 'nao_enviada' && !notif.enviada) ||
                         (filtroStatus === 'enviada' && notif.enviada);
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const getNotificacoesPorTab = (tab: string) => {
    switch (tab) {
      case 'nao_lidas':
        return notificacoesFiltradas.filter(n => !n.lida);
      case 'enviadas':
        return notificacoesFiltradas.filter(n => n.enviada);
      case 'pendentes':
        return notificacoesFiltradas.filter(n => !n.enviada);
      default:
        return notificacoesFiltradas;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie notificações de prazos, marcos e alertas do planejamento estratégico
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Notificação
        </Button>
      </div>

      {/* Controles de filtro */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="prazo_vencendo">Prazo Vencendo</SelectItem>
                <SelectItem value="marco_atrasado">Marco Atrasado</SelectItem>
                <SelectItem value="kpi_fora_meta">KPI Fora da Meta</SelectItem>
                <SelectItem value="risco_alto">Risco Alto</SelectItem>
                <SelectItem value="aprovacao_pendente">Aprovação Pendente</SelectItem>
                <SelectItem value="status_mudou">Status Mudou</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="nao_lida">Não Lidas</SelectItem>
                <SelectItem value="lida">Lidas</SelectItem>
                <SelectItem value="nao_enviada">Não Enviadas</SelectItem>
                <SelectItem value="enviada">Enviadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{notificacoes.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{notificacoes.filter(n => !n.lida).length}</p>
                <p className="text-sm text-muted-foreground">Não Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{notificacoes.filter(n => n.enviada).length}</p>
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{notificacoes.filter(n => !n.enviada).length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de notificações */}
      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList>
          <TabsTrigger value="todas">Todas ({notificacoesFiltradas.length})</TabsTrigger>
          <TabsTrigger value="nao_lidas">
            Não Lidas ({getNotificacoesPorTab('nao_lidas').length})
          </TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes ({getNotificacoesPorTab('pendentes').length})
          </TabsTrigger>
          <TabsTrigger value="enviadas">
            Enviadas ({getNotificacoesPorTab('enviadas').length})
          </TabsTrigger>
        </TabsList>

        {['todas', 'nao_lidas', 'pendentes', 'enviadas'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getNotificacoesPorTab(tab).map((notificacao) => (
                      <TableRow key={notificacao.id} className={!notificacao.lida ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getTipoIcon(notificacao.tipo)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{notificacao.titulo}</p>
                            <p className="text-sm text-muted-foreground">{notificacao.mensagem}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-${getTipoColor(notificacao.tipo)}-500`}>
                            {notificacao.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{notificacao.entidade_referencia?.codigo}</p>
                            <p className="text-muted-foreground">
                              {notificacao.entidade_referencia?.titulo || 'N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getCanalIcon(notificacao.canal)}
                            <span className="text-sm capitalize">{notificacao.canal}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {notificacao.enviada ? (
                              <Badge variant="success">Enviada</Badge>
                            ) : (
                              <Badge variant="secondary">Pendente</Badge>
                            )}
                            {!notificacao.lida && (
                              <Badge variant="destructive" className="text-xs">Não lida</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {notificacao.data_envio ? 
                              new Date(notificacao.data_envio).toLocaleDateString('pt-BR') :
                              new Date(notificacao.created_at).toLocaleDateString('pt-BR')
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!notificacao.lida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => marcarComoLida(notificacao.id)}
                                title="Marcar como lida"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {!notificacao.enviada && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => enviarNotificacao(notificacao.id)}
                                title="Enviar notificação"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {getNotificacoesPorTab(tab).length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma notificação encontrada</h3>
                    <p className="text-muted-foreground">
                      {tab === 'todas' 
                        ? 'Não há notificações para exibir.' 
                        : `Não há notificações ${tab.replace('_', ' ')}.`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog para criar notificação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Notificação</DialogTitle>
            <DialogDescription>
              Configure uma nova notificação para o sistema de planejamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Notificação</Label>
                <Select value={formData.tipo} onValueChange={(value) => 
                  setFormData({ ...formData, tipo: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prazo_vencendo">Prazo Vencendo</SelectItem>
                    <SelectItem value="marco_atrasado">Marco Atrasado</SelectItem>
                    <SelectItem value="kpi_fora_meta">KPI Fora da Meta</SelectItem>
                    <SelectItem value="risco_alto">Risco Alto</SelectItem>
                    <SelectItem value="aprovacao_pendente">Aprovação Pendente</SelectItem>
                    <SelectItem value="status_mudou">Status Mudou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="canal">Canal</Label>
                <Select value={formData.canal} onValueChange={(value) => 
                  setFormData({ ...formData, canal: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sistema">Sistema</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Título da notificação"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                placeholder="Conteúdo da notificação..."
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entidade_tipo">Tipo de Entidade</Label>
                <Select value={formData.entidade_tipo} onValueChange={(value) => 
                  setFormData({ ...formData, entidade_tipo: value, entidade_id: '' })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atividade">Atividade</SelectItem>
                    <SelectItem value="plano_acao">Plano de Ação</SelectItem>
                    <SelectItem value="iniciativa">Iniciativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entidade">Entidade</Label>
                <Select value={formData.entidade_id} onValueChange={(value) => 
                  setFormData({ ...formData, entidade_id: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a entidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {entidades
                      .filter(e => e.tipo === formData.entidade_tipo)
                      .map((entidade) => (
                        <SelectItem key={entidade.id} value={entidade.id}>
                          {entidade.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatário</Label>
              <Select value={formData.destinatario_id} onValueChange={(value) => 
                setFormData({ ...formData, destinatario_id: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o destinatário" />
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

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recorrente" 
                checked={formData.recorrente}
                onCheckedChange={(checked) => setFormData({ ...formData, recorrente: checked as boolean })}
              />
              <Label htmlFor="recorrente">Notificação recorrente</Label>
            </div>

            {formData.recorrente && (
              <div className="space-y-2">
                <Label htmlFor="proxima_execucao">Próxima Execução</Label>
                <Input
                  id="proxima_execucao"
                  type="datetime-local"
                  value={formData.proxima_execucao}
                  onChange={(e) => setFormData({ ...formData, proxima_execucao: e.target.value })}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createNotificacao}>
              Criar Notificação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}