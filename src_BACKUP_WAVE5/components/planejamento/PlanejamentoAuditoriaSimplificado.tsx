import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarDays,
  ClipboardList,
  AlertTriangle,
  Plus,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
  Target,
  DollarSign,
  Save,
  X,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Mock data para teste
const mockPlanoAnual = {
  id: '1',
  codigo: 'PAA-2025',
  titulo: 'Plano Anual de Auditoria 2025',
  ano_exercicio: 2025,
  status: 'aprovado',
  total_horas_planejadas: 2500,
  total_recursos_orcados: 150000,
  created_at: '2025-01-01'
};

const mockTrabalhos = [
  {
    id: '1',
    codigo: 'AUD-2025-001',
    titulo: 'Auditoria de Contas a Pagar',
    descricao: 'Avaliação dos controles internos do processo de contas a pagar',
    area_auditada: 'Financeiro',
    tipo_auditoria: 'operational',
    nivel_risco: 'alto',
    horas_planejadas: 120,
    status: 'planejado',
    data_inicio_planejada: '2025-02-01',
    data_fim_planejada: '2025-03-15'
  },
  {
    id: '2',
    codigo: 'AUD-2025-002',
    titulo: 'Auditoria de TI - Segurança da Informação',
    descricao: 'Revisão dos controles de segurança da informação',
    area_auditada: 'Tecnologia da Informação',
    tipo_auditoria: 'it',
    nivel_risco: 'critico',
    horas_planejadas: 200,
    status: 'em_andamento',
    data_inicio_planejada: '2025-01-15',
    data_fim_planejada: '2025-04-30'
  },
  {
    id: '3',
    codigo: 'AUD-2025-003',
    titulo: 'Auditoria de Compliance Regulatória',
    descricao: 'Verificação de conformidade com regulamentações do setor',
    area_auditada: 'Compliance',
    tipo_auditoria: 'compliance',
    nivel_risco: 'medio',
    horas_planejadas: 80,
    status: 'concluido',
    data_inicio_planejada: '2025-01-02',
    data_fim_planejada: '2025-02-15'
  }
];

// Interfaces para tipos de dados
interface PlanoAnual {
  id: string;
  codigo: string;
  titulo: string;
  ano_exercicio: number;
  status: string;
  total_horas_planejadas: number;
  total_recursos_orcados: number;
  created_at: string;
}

interface TrabalhoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  area_auditada: string;
  tipo_auditoria: string;
  nivel_risco: string;
  horas_planejadas: number;
  status: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
}

export function PlanejamentoAuditoriaSimplificado() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [planoAnual, setPlanoAnual] = useState<PlanoAnual | null>(null);
  const [trabalhos, setTrabalhos] = useState<TrabalhoAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos cards expansíveis
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<TrabalhoAuditoria>>({});

  // Função para carregar dados do banco
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.tenant_id) {
        // Use mock data if no user/tenant
        setPlanoAnual(mockPlanoAnual);
        setTrabalhos(mockTrabalhos);
        setLoading(false);
        return;
      }

      // Carregar plano anual
      const { data: planoData, error: planoError } = await supabase
        .from('planos_auditoria_anuais')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('ano_exercicio', 2025)
        .single();

      if (planoError) {
        console.log('Plano não encontrado, usando mock data');
        setPlanoAnual(mockPlanoAnual);
      } else {
        setPlanoAnual(planoData);
      }

      // Carregar trabalhos de auditoria
      const { data: trabalhosData, error: trabalhosError } = await supabase
        .from('trabalhos_auditoria')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false });

      if (trabalhosError) {
        console.log('Trabalhos não encontrados, usando mock data');
        setTrabalhos(mockTrabalhos);
      } else {
        setTrabalhos(trabalhosData || []);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Usando dados de exemplo.');
      setPlanoAnual(mockPlanoAnual);
      setTrabalhos(mockTrabalhos);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar componente
  useEffect(() => {
    loadData();
  }, [user?.tenant_id]);

  // Funções CRUD
  const handleSave = async () => {
    try {
      if (!user?.tenant_id) {
        toast.error('Usuário não autenticado');
        return;
      }

      if (editingCard) {
        // Editar existente
        const { error } = await supabase
          .from('trabalhos_auditoria')
          .update(formData)
          .eq('id', editingCard)
          .eq('tenant_id', user.tenant_id);

        if (error) throw error;
        toast.success('Trabalho atualizado com sucesso!');
      } else {
        // Criar novo
        const novoTrabalho = {
          ...formData,
          tenant_id: user.tenant_id,
          codigo: `AUD-${new Date().getFullYear()}-${String(trabalhos.length + 1).padStart(3, '0')}`
        };

        const { error } = await supabase
          .from('trabalhos_auditoria')
          .insert([novoTrabalho]);

        if (error) throw error;
        toast.success('Novo trabalho criado com sucesso!');
      }

      await loadData();
      setEditingCard(null);
      setIsCreating(false);
      setFormData({});
      setExpandedCard(null);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar trabalho');
    }
  };

  const handleDelete = async (trabalho: TrabalhoAuditoria) => {
    if (!user?.tenant_id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { error } = await supabase
        .from('trabalhos_auditoria')
        .delete()
        .eq('id', trabalho.id)
        .eq('tenant_id', user.tenant_id);

      if (error) throw error;

      toast.success('Trabalho excluído com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir trabalho');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado': return 'bg-blue-500 text-white dark:bg-blue-600';
      case 'em_andamento': return 'bg-yellow-500 text-white dark:bg-yellow-600';
      case 'concluido': return 'bg-green-500 text-white dark:bg-green-600';
      case 'cancelado': return 'bg-red-500 text-white dark:bg-red-600';
      default: return 'bg-gray-500 text-white dark:bg-gray-600';
    }
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo': return 'bg-green-500 text-white dark:bg-green-600';
      case 'medio': return 'bg-yellow-500 text-white dark:bg-yellow-600';
      case 'alto': return 'bg-orange-500 text-white dark:bg-orange-600';
      case 'critico': return 'bg-red-500 text-white dark:bg-red-600';
      default: return 'bg-gray-500 text-white dark:bg-gray-600';
    }
  };

  const handleToggleExpand = (trabalhoId: string) => {
    setExpandedCard(expandedCard === trabalhoId ? null : trabalhoId);
    setEditingCard(null);
  };

  const handleEdit = (trabalho: TrabalhoAuditoria) => {
    setEditingCard(trabalho.id);
    setFormData(trabalho);
    setExpandedCard(trabalho.id);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({});
    setExpandedCard('new');
    setEditingCard(null);
  };

  const handleCancel = () => {
    setEditingCard(null);
    setIsCreating(false);
    setFormData({});
    setExpandedCard(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando planejamento de auditoria...</p>
        </div>
      </div>
    );
  }

  if (error && !planoAnual && !trabalhos.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadData}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/auditorias')}
          className="justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 rounded-md px-3 flex items-center gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold">Planejamento de Auditoria</h1>
          <p className="text-muted-foreground mt-2">
            Gestão completa do planejamento e execução de auditorias internas
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Plano Anual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Plano Anual de Auditoria
              </CardTitle>
              <CardDescription>
                Informações do plano anual vigente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Código</p>
                  <p className="text-lg font-semibold">{planoAnual?.codigo}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ano</p>
                  <p className="text-lg font-semibold">{planoAnual?.ano_exercicio}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Horas Planejadas</p>
                  <p className="text-lg font-semibold">{planoAnual?.total_horas_planejadas}h</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Orçamento</p>
                  <p className="text-lg font-semibold">R$ {planoAnual?.total_recursos_orcados?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Trabalhos</p>
                    <p className="text-2xl font-bold">{trabalhos.length}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold">{trabalhos.filter(t => t.status === 'em_andamento').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold">{trabalhos.filter(t => t.status === 'concluido').length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
                    <p className="text-2xl font-bold">{trabalhos.filter(t => t.nivel_risco === 'critico' || t.nivel_risco === 'alto').length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Trabalhos de Auditoria */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Trabalhos de Auditoria Planejados</h2>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Trabalho
              </Button>
            </div>

            {/* Card para criação de novo trabalho */}
            {isCreating && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Novo Trabalho de Auditoria</CardTitle>
                  <CardDescription>Preencha as informações do novo trabalho</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="titulo">Título</Label>
                      <Input 
                        id="titulo"
                        value={formData.titulo || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Digite o título do trabalho"
                      />
                    </div>
                    <div>
                      <Label htmlFor="area_auditada">Área Auditada</Label>
                      <Input 
                        id="area_auditada"
                        value={formData.area_auditada || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, area_auditada: e.target.value }))}
                        placeholder="Ex: Financeiro, TI, RH"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea 
                      id="descricao"
                      value={formData.descricao || ''} 
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      rows={3}
                      placeholder="Descreva os objetivos e escopo do trabalho"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tipo_auditoria">Tipo de Auditoria</Label>
                      <Select value={formData.tipo_auditoria || 'operational'} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_auditoria: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operational">Operacional</SelectItem>
                          <SelectItem value="it">TI</SelectItem>
                          <SelectItem value="financial">Financeira</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="investigative">Investigativa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nivel_risco">Nível de Risco</Label>
                      <Select value={formData.nivel_risco || 'medio'} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_risco: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixo">Baixo</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                          <SelectItem value="critico">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="horas_planejadas">Horas Planejadas</Label>
                      <Input 
                        id="horas_planejadas"
                        type="number"
                        value={formData.horas_planejadas || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, horas_planejadas: parseFloat(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_inicio_planejada">Data de Início</Label>
                      <Input 
                        id="data_inicio_planejada"
                        type="date"
                        value={formData.data_inicio_planejada || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_fim_planejada">Data de Fim</Label>
                      <Input 
                        id="data_fim_planejada"
                        type="date"
                        value={formData.data_fim_planejada || ''} 
                        onChange={(e) => setFormData(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Trabalho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cards dos trabalhos existentes */}
            <div className="grid gap-4">
              {trabalhos.slice(0, 5).map((trabalho) => (
                <Card key={trabalho.id} className="transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1 cursor-pointer" onClick={() => handleToggleExpand(trabalho.id)}>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {trabalho.titulo}
                          <Badge className={getRiscoColor(trabalho.nivel_risco)}>
                            {trabalho.nivel_risco}
                          </Badge>
                          <Badge className={getStatusColor(trabalho.status)}>
                            {trabalho.status.replace('_', ' ')}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{trabalho.descricao}</CardDescription>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleExpand(trabalho.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(trabalho)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(trabalho)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* Conteúdo básico sempre visível */}
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Código</p>
                        <p className="font-medium text-sm">{trabalho.codigo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Área</p>
                        <p className="font-medium text-sm">{trabalho.area_auditada}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Horas</p>
                        <p className="font-medium text-sm">{trabalho.horas_planejadas}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Período</p>
                        <p className="font-medium text-sm">
                          {new Date(trabalho.data_inicio_planejada).toLocaleDateString()} - {new Date(trabalho.data_fim_planejada).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Conteúdo expandido */}
                  {expandedCard === trabalho.id && (
                    <CardContent className="pt-0 border-t bg-muted/20">
                      {editingCard === trabalho.id ? (
                        // Modo de edição
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`titulo-${trabalho.id}`}>Título</Label>
                              <Input 
                                id={`titulo-${trabalho.id}`}
                                value={formData.titulo || ''} 
                                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`area-${trabalho.id}`}>Área Auditada</Label>
                              <Input 
                                id={`area-${trabalho.id}`}
                                value={formData.area_auditada || ''} 
                                onChange={(e) => setFormData(prev => ({ ...prev, area_auditada: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`desc-${trabalho.id}`}>Descrição</Label>
                            <Textarea 
                              id={`desc-${trabalho.id}`}
                              value={formData.descricao || ''} 
                              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`tipo-${trabalho.id}`}>Tipo de Auditoria</Label>
                              <Select value={formData.tipo_auditoria || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_auditoria: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="operational">Operacional</SelectItem>
                                  <SelectItem value="it">TI</SelectItem>
                                  <SelectItem value="financial">Financeira</SelectItem>
                                  <SelectItem value="compliance">Compliance</SelectItem>
                                  <SelectItem value="follow_up">Follow-up</SelectItem>
                                  <SelectItem value="investigative">Investigativa</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`risco-${trabalho.id}`}>Nível de Risco</Label>
                              <Select value={formData.nivel_risco || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_risco: value }))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="baixo">Baixo</SelectItem>
                                  <SelectItem value="medio">Médio</SelectItem>
                                  <SelectItem value="alto">Alto</SelectItem>
                                  <SelectItem value="critico">Crítico</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`horas-${trabalho.id}`}>Horas Planejadas</Label>
                              <Input 
                                id={`horas-${trabalho.id}`}
                                type="number"
                                value={formData.horas_planejadas || ''} 
                                onChange={(e) => setFormData(prev => ({ ...prev, horas_planejadas: parseFloat(e.target.value) }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`inicio-${trabalho.id}`}>Data de Início</Label>
                              <Input 
                                id={`inicio-${trabalho.id}`}
                                type="date"
                                value={formData.data_inicio_planejada || ''} 
                                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`fim-${trabalho.id}`}>Data de Fim</Label>
                              <Input 
                                id={`fim-${trabalho.id}`}
                                type="date"
                                value={formData.data_fim_planejada || ''} 
                                onChange={(e) => setFormData(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleCancel}>
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button onClick={handleSave}>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo de visualização expandido
                        <div className="space-y-4 pt-4">
                          <div>
                            <h4 className="font-medium mb-2">Descrição Completa</h4>
                            <p className="text-sm text-muted-foreground">{trabalho.descricao}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Tipo de Auditoria</p>
                              <p className="text-sm">{trabalho.tipo_auditoria}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Status</p>
                              <Badge className={getStatusColor(trabalho.status)}>
                                {trabalho.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Nível de Risco</p>
                              <Badge className={getRiscoColor(trabalho.nivel_risco)}>
                                {trabalho.nivel_risco}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}

              {trabalhos.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhum trabalho de auditoria planejado encontrado</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cronograma" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Cronograma de Auditorias 2025
              </CardTitle>
              <CardDescription>
                Visualização temporal dos trabalhos planejados ao longo do ano
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Timeline Visual Funcional */}
              <div className="space-y-6">
                {/* Cronograma Integrado */}
                <div className="space-y-3">
                  {/* Cabeçalho com meses */}
                  <div className="flex items-center">
                    <div className="w-64 flex-shrink-0"></div> {/* Espaço para nomes dos trabalhos */}
                    <div className="flex-1 grid grid-cols-12 gap-1 text-xs font-medium text-center">
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, idx) => (
                        <div key={mes} className="p-2 font-semibold text-muted-foreground">
                          {mes}
                        </div>
                      ))}
                    </div>
                    <div className="w-32 flex-shrink-0 text-center">
                      <span className="text-xs font-medium text-muted-foreground">Status</span>
                    </div>
                  </div>

                  {/* Linha de separação */}
                  <div className="border-t border-muted"></div>

                  {/* Trabalhos com timeline alinhada */}
                  {trabalhos.map((trabalho, index) => {
                    const startDate = new Date(trabalho.data_inicio_planejada);
                    const endDate = new Date(trabalho.data_fim_planejada);
                    const startMonth = startDate.getMonth(); // 0-11
                    const endMonth = endDate.getMonth(); // 0-11
                    
                    return (
                      <div key={trabalho.id} className="flex items-center hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        {/* Informações do trabalho */}
                        <div className="w-64 flex-shrink-0 pr-4">
                          <h4 className="font-medium text-sm truncate" title={trabalho.titulo}>
                            {trabalho.titulo}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{trabalho.area_auditada}</p>
                            <Badge className={`${getRiscoColor(trabalho.nivel_risco)} text-xs px-1 py-0`}>
                              {trabalho.nivel_risco}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {startDate.toLocaleDateString('pt-BR')} - {endDate.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        {/* Timeline visual alinhada */}
                        <div className="flex-1 grid grid-cols-12 gap-1 h-8">
                          {Array.from({ length: 12 }, (_, monthIndex) => {
                            const isActive = monthIndex >= startMonth && monthIndex <= endMonth;
                            const isStart = monthIndex === startMonth;
                            const isEnd = monthIndex === endMonth;
                            const isMiddle = isActive && !isStart && !isEnd;
                            
                            return (
                              <div
                                key={monthIndex}
                                className={`relative h-6 flex items-center justify-center text-xs font-medium transition-all ${
                                  isActive 
                                    ? `${getRiscoColor(trabalho.nivel_risco)} shadow-sm`
                                    : 'bg-gray-100 dark:bg-gray-700/50'
                                } ${
                                  isStart ? 'rounded-l-md' : isEnd ? 'rounded-r-md' : isMiddle ? '' : 'rounded-sm'
                                }`}
                                title={`${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][monthIndex]} ${isActive ? `- ${trabalho.titulo}` : ''}`}
                              >
                                {isStart && (
                                  <span className="text-xs font-bold text-white">
                                    {startDate.getDate()}
                                  </span>
                                )}
                                {isEnd && monthIndex !== startMonth && (
                                  <span className="text-xs font-bold text-white">
                                    {endDate.getDate()}
                                  </span>
                                )}
                                {isMiddle && (
                                  <div className="w-full h-1 bg-white/30 rounded"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Status */}
                        <div className="w-32 flex-shrink-0 text-center">
                          <Badge className={getStatusColor(trabalho.status)}>
                            {trabalho.status === 'em_andamento' ? 'Em Andamento' : 
                             trabalho.status === 'concluido' ? 'Concluído' : 
                             trabalho.status === 'planejado' ? 'Planejado' : 
                             trabalho.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Mensagem se não houver trabalhos */}
                  {trabalhos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum trabalho de auditoria planejado</p>
                    </div>
                  )}
                </div>

                {/* Estatísticas do cronograma */}
                <div className="pt-6 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Duração Total</p>
                            <p className="text-lg font-bold">
                              {trabalhos.reduce((acc, t) => acc + t.horas_planejadas, 0)} horas
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Período de Execução</p>
                            <p className="text-lg font-bold">12 meses</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">Taxa de Execução</p>
                            <p className="text-lg font-bold">
                              {Math.round((trabalhos.filter(t => t.status === 'concluido').length / Math.max(1, trabalhos.length)) * 100)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Legenda */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Legenda de Riscos:</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span className="text-sm">Baixo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500"></div>
                      <span className="text-sm">Médio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                      <span className="text-sm">Alto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span className="text-sm">Crítico</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
