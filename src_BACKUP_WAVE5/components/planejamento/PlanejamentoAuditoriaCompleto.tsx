import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Download,
  Save,
  X,
  Calendar,
  Users,
  FileText,
  Target,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interfaces
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
  objetivos: string[];
  escopo: string;
  tipo_auditoria: string;
  area_auditada: string;
  nivel_risco: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  horas_planejadas: number;
  status: string;
  percentual_conclusao: number;
  prioridade: number;
  prerequisitos?: string[];
  recursos_necessarios?: string[];
}

export function PlanejamentoAuditoriaCompleto() {
  const { user } = useAuth();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [planosAnuais, setPlanosAnuais] = useState<PlanoAnual[]>([]);
  const [trabalhos, setTrabalhos] = useState<TrabalhoAuditoria[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTrabalho, setSelectedTrabalho] = useState<TrabalhoAuditoria | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Estados para formulário
  const [formData, setFormData] = useState<Partial<TrabalhoAuditoria>>({});

  // Carregar dados
  useEffect(() => {
    if (user?.tenant?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar planos anuais
      const { data: planosData, error: planosError } = await supabase
        .from('planos_auditoria_anuais')
        .select('*')
        .order('ano_exercicio', { ascending: false });

      if (planosError) {
        console.error('Erro ao carregar planos:', planosError);
        // Usar dados mock se houver erro
        setPlanosAnuais([{
          id: '1',
          codigo: 'PAA-2025',
          titulo: 'Plano Anual de Auditoria 2025',
          ano_exercicio: 2025,
          status: 'approved',
          total_horas_planejadas: 2400.0,
          total_recursos_orcados: 350000.00,
          created_at: new Date().toISOString()
        }]);
      } else {
        setPlanosAnuais(planosData || []);
      }

      // Carregar trabalhos
      const { data: trabalhosData, error: trabalhosError } = await supabase
        .from('trabalhos_auditoria')
        .select('*')
        .order('data_inicio_planejada', { ascending: true });

      if (trabalhosError) {
        console.error('Erro ao carregar trabalhos:', trabalhosError);
        // Usar dados mock se houver erro
        setTrabalhos([
          {
            id: '1',
            codigo: 'TAD-2025-001',
            titulo: 'Auditoria do Processo de Contas a Pagar',
            descricao: 'Auditoria operacional e de compliance do processo de contas a pagar, incluindo aprovações, pagamentos e controles preventivos.',
            objetivos: ['Avaliar efetividade dos controles internos', 'Verificar compliance com políticas'],
            escopo: 'Processo completo desde recebimento da fatura até pagamento',
            tipo_auditoria: 'operational',
            area_auditada: 'Financeiro - Contas a Pagar',
            nivel_risco: 'alto',
            data_inicio_planejada: '2025-02-03',
            data_fim_planejada: '2025-03-14',
            horas_planejadas: 240.0,
            status: 'planejado',
            percentual_conclusao: 0,
            prioridade: 4,
            prerequisitos: ['Aprovação do orçamento anual'],
            recursos_necessarios: ['Analista de auditoria sênior']
          },
          {
            id: '2',
            codigo: 'TAD-2025-002',
            titulo: 'Auditoria de Segurança da Informação',
            descricao: 'Avaliação dos controles de TI, segurança cibernética, backup, gestão de acessos e conformidade com LGPD.',
            objetivos: ['Avaliar controles de acesso aos sistemas', 'Verificar políticas de backup e recovery'],
            escopo: 'Infraestrutura de TI, sistemas críticos, controles de acesso',
            tipo_auditoria: 'it',
            area_auditada: 'Tecnologia da Informação',
            nivel_risco: 'critico',
            data_inicio_planejada: '2025-04-07',
            data_fim_planejada: '2025-05-16',
            horas_planejadas: 320.0,
            status: 'planejado',
            percentual_conclusao: 0,
            prioridade: 5,
            prerequisitos: ['Consultoria externa especializada em TI'],
            recursos_necessarios: ['Auditor especialista em TI', 'Consultor externo']
          },
          {
            id: '3',
            codigo: 'TAD-2025-003',
            titulo: 'Follow-up de Recomendações 2024',
            descricao: 'Acompanhamento da implementação das recomendações emitidas nas auditorias realizadas em 2024.',
            objetivos: ['Verificar implementação de recomendações', 'Avaliar efetividade das ações corretivas'],
            escopo: 'Todas as recomendações emitidas entre janeiro e dezembro de 2024',
            tipo_auditoria: 'follow_up',
            area_auditada: 'Todas as áreas auditadas em 2024',
            nivel_risco: 'medio',
            data_inicio_planejada: '2025-06-02',
            data_fim_planejada: '2025-06-27',
            horas_planejadas: 120.0,
            status: 'planejado',
            percentual_conclusao: 0,
            prioridade: 3,
            prerequisitos: ['Relatórios de auditoria de 2024'],
            recursos_necessarios: ['Analista de auditoria']
          }
        ]);
      } else {
        setTrabalhos(trabalhosData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  // Cálculos de métricas
  const calculateMetrics = () => {
    const totalTrabalhos = trabalhos.length;
    const trabalhosAtivos = trabalhos.filter(t => ['planejado', 'aprovado', 'em_andamento'].includes(t.status)).length;
    const trabalhosConcluidos = trabalhos.filter(t => t.status === 'concluido').length;
    const trabalhosAltoRisco = trabalhos.filter(t => ['alto', 'critico'].includes(t.nivel_risco)).length;
    
    const totalHoras = trabalhos.reduce((sum, t) => sum + (t.horas_planejadas || 0), 0);
    const progressoMedio = trabalhos.length > 0 
      ? trabalhos.reduce((sum, t) => sum + (t.percentual_conclusao || 0), 0) / trabalhos.length 
      : 0;

    const proximosTrabalhos = trabalhos
      .filter(t => t.status === 'planejado' && new Date(t.data_inicio_planejada) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      .length;

    return {
      totalTrabalhos,
      trabalhosAtivos,
      trabalhosConcluidos,
      trabalhosAltoRisco,
      totalHoras,
      progressoMedio,
      proximosTrabalhos
    };
  };

  const metrics = calculateMetrics();

  // Handlers
  const handleView = (trabalho: TrabalhoAuditoria) => {
    setSelectedTrabalho(trabalho);
    setIsViewModalOpen(true);
  };

  const handleEdit = (trabalho: TrabalhoAuditoria) => {
    setSelectedTrabalho(trabalho);
    setFormData(trabalho);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo_auditoria: 'operational',
      area_auditada: '',
      nivel_risco: 'medio',
      status: 'planejado',
      prioridade: 3,
      horas_planejadas: 0,
      percentual_conclusao: 0
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (trabalho: TrabalhoAuditoria) => {
    if (window.confirm(`Tem certeza que deseja excluir o trabalho "${trabalho.titulo}"?`)) {
      try {
        // Se conectado ao banco, fazer delete real
        const { error } = await supabase
          .from('trabalhos_auditoria')
          .delete()
          .eq('id', trabalho.id);

        if (error) {
          // Se erro, remover apenas localmente
          setTrabalhos(prev => prev.filter(t => t.id !== trabalho.id));
          toast.success('Trabalho removido localmente');
        } else {
          await loadData();
          toast.success('Trabalho excluído com sucesso');
        }
      } catch (error) {
        // Remover localmente se houver erro
        setTrabalhos(prev => prev.filter(t => t.id !== trabalho.id));
        toast.success('Trabalho removido localmente');
      }
    }
  };

  const handleSave = async () => {
    // Implementar save (mock por enquanto)
    if (selectedTrabalho) {
      // Editar
      setTrabalhos(prev => prev.map(t => t.id === selectedTrabalho.id ? { ...t, ...formData } : t));
      toast.success('Trabalho atualizado com sucesso');
      setIsEditModalOpen(false);
    } else {
      // Criar
      const novoTrabalho = {
        ...formData,
        id: Date.now().toString(),
        codigo: `TAD-2025-${String(trabalhos.length + 1).padStart(3, '0')}`,
        objetivos: [],
        escopo: formData.descricao || ''
      } as TrabalhoAuditoria;
      
      setTrabalhos(prev => [...prev, novoTrabalho]);
      toast.success('Trabalho criado com sucesso');
      setIsCreateModalOpen(false);
    }
    setFormData({});
    setSelectedTrabalho(null);
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    const colors = {
      'planejado': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'aprovado': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'em_andamento': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'concluido': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getRiscoColor = (risco: string) => {
    const colors = {
      'baixo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'medio': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'alto': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'critico': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[risco as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getTipoAuditoriaLabel = (tipo: string) => {
    const tipos = {
      'operational': 'Operacional',
      'it': 'TI',
      'financial': 'Financeira',
      'compliance': 'Compliance',
      'follow_up': 'Follow-up',
      'investigative': 'Investigativa'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Planejamento de Auditoria</h1>
          <p className="text-muted-foreground">
            Gestão de planos anuais, trabalhos e cronogramas de auditoria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Trabalho
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Trabalhos</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrabalhos}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.trabalhosAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 30 dias</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.proximosTrabalhos}</div>
            <p className="text-xs text-muted-foreground">
              trabalhos programados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trabalhosAltoRisco}</div>
            <p className="text-xs text-muted-foreground">
              trabalhos críticos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalHoras}</div>
            <p className="text-xs text-muted-foreground">
              horas planejadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trabalhos">Trabalhos</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
        </TabsList>

        {/* Tab Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Planos Anuais */}
            <Card>
              <CardHeader>
                <CardTitle>Planos Anuais de Auditoria</CardTitle>
                <CardDescription>
                  Planos aprovados e em execução
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planosAnuais.slice(0, 3).map((plano) => (
                    <div key={plano.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{plano.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            {plano.ano_exercicio} • {plano.total_horas_planejadas?.toLocaleString()} horas • R$ {plano.total_recursos_orcados?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(plano.status)}>
                        Aprovado
                      </Badge>
                    </div>
                  ))}
                  {planosAnuais.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum plano anual encontrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trabalhos por Risco */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Nível de Risco</CardTitle>
                <CardDescription>
                  Classificação de risco dos trabalhos planejados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['critico', 'alto', 'medio', 'baixo'].map((risco) => {
                    const count = trabalhos.filter(t => t.nivel_risco === risco).length;
                    const percentage = trabalhos.length > 0 ? (count / trabalhos.length) * 100 : 0;
                    
                    return (
                      <div key={risco} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={getRiscoColor(risco)} variant="secondary">
                            {risco.charAt(0).toUpperCase() + risco.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{count} trabalhos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                risco === 'critico' ? 'bg-red-600' :
                                risco === 'alto' ? 'bg-orange-600' :
                                risco === 'medio' ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Trabalhos */}
        <TabsContent value="trabalhos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trabalhos de Auditoria Planejados</CardTitle>
              <CardDescription>
                Lista completa dos trabalhos para 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trabalhos.map((trabalho) => (
                  <div key={trabalho.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        trabalho.nivel_risco === 'critico' ? 'bg-red-500' :
                        trabalho.nivel_risco === 'alto' ? 'bg-orange-500' :
                        trabalho.nivel_risco === 'medio' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{trabalho.titulo}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{trabalho.area_auditada}</span>
                          <span>•</span>
                          <span>{getTipoAuditoriaLabel(trabalho.tipo_auditoria)}</span>
                          <span>•</span>
                          <span>{trabalho.horas_planejadas}h</span>
                          <span>•</span>
                          <span>{new Date(trabalho.data_inicio_planejada).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getRiscoColor(trabalho.nivel_risco)} variant="secondary">
                        {trabalho.nivel_risco}
                      </Badge>
                      <Badge className={getStatusColor(trabalho.status)}>
                        Planejado
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(trabalho)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(trabalho)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(trabalho)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {trabalhos.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum trabalho de auditoria encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cronograma */}
        <TabsContent value="cronograma" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Execução 2025</CardTitle>
              <CardDescription>
                Timeline dos trabalhos de auditoria planejados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trabalhos
                  .sort((a, b) => new Date(a.data_inicio_planejada).getTime() - new Date(b.data_inicio_planejada).getTime())
                  .map((trabalho) => {
                    const inicio = new Date(trabalho.data_inicio_planejada);
                    const fim = new Date(trabalho.data_fim_planejada);
                    const duracao = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={trabalho.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center text-center min-w-[60px]">
                          <div className="text-lg font-medium">{inicio.getDate()}</div>
                          <div className="text-xs text-muted-foreground">
                            {inicio.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inicio.getFullYear()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{trabalho.titulo}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getRiscoColor(trabalho.nivel_risco)} variant="secondary">
                                {trabalho.nivel_risco}
                              </Badge>
                              <Badge className={getStatusColor(trabalho.status)}>
                                Planejado
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {trabalho.area_auditada} • {getTipoAuditoriaLabel(trabalho.tipo_auditoria)} • {duracao} dias • {trabalho.horas_planejadas}h
                          </p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {inicio.toLocaleDateString('pt-BR')} até {fim.toLocaleDateString('pt-BR')}
                          </div>
                          {trabalho.percentual_conclusao > 0 && (
                            <div className="mt-2">
                              <Progress value={trabalho.percentual_conclusao} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Trabalho de Auditoria</DialogTitle>
            <DialogDescription>
              Informações completas do trabalho selecionado
            </DialogDescription>
          </DialogHeader>
          {selectedTrabalho && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Código</Label>
                    <p className="text-sm text-muted-foreground">{selectedTrabalho.codigo}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Título</Label>
                    <p className="text-sm">{selectedTrabalho.titulo}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Área Auditada</Label>
                    <p className="text-sm text-muted-foreground">{selectedTrabalho.area_auditada}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Tipo de Auditoria</Label>
                    <Badge className="ml-2">{getTipoAuditoriaLabel(selectedTrabalho.tipo_auditoria)}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Nível de Risco</Label>
                    <Badge className={`ml-2 ${getRiscoColor(selectedTrabalho.nivel_risco)}`}>
                      {selectedTrabalho.nivel_risco}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <Badge className={`ml-2 ${getStatusColor(selectedTrabalho.status)}`}>
                      {selectedTrabalho.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-medium">Período</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedTrabalho.data_inicio_planejada).toLocaleDateString('pt-BR')} até {' '}
                      {new Date(selectedTrabalho.data_fim_planejada).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Horas Planejadas</Label>
                    <p className="text-sm text-muted-foreground">{selectedTrabalho.horas_planejadas}h</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Descrição</Label>
                <p className="text-sm text-muted-foreground mt-2">{selectedTrabalho.descricao}</p>
              </div>

              {selectedTrabalho.objetivos && selectedTrabalho.objetivos.length > 0 && (
                <div>
                  <Label className="font-medium">Objetivos</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    {selectedTrabalho.objetivos.map((objetivo, index) => (
                      <li key={index}>{objetivo}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTrabalho.prerequisitos && selectedTrabalho.prerequisitos.length > 0 && (
                <div>
                  <Label className="font-medium">Pré-requisitos</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    {selectedTrabalho.prerequisitos.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTrabalho.recursos_necessarios && selectedTrabalho.recursos_necessarios.length > 0 && (
                <div>
                  <Label className="font-medium">Recursos Necessários</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                    {selectedTrabalho.recursos_necessarios.map((recurso, index) => (
                      <li key={index}>{recurso}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Trabalho de Auditoria</DialogTitle>
            <DialogDescription>
              Modificar informações do trabalho selecionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input 
                id="titulo"
                value={formData.titulo || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao"
                value={formData.descricao || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area_auditada">Área Auditada</Label>
                <Input 
                  id="area_auditada"
                  value={formData.area_auditada || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, area_auditada: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="tipo_auditoria">Tipo de Auditoria</Label>
                <Select value={formData.tipo_auditoria || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_auditoria: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nivel_risco">Nível de Risco</Label>
                <Select value={formData.nivel_risco || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_risco: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o risco" />
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
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Trabalho de Auditoria</DialogTitle>
            <DialogDescription>
              Criar um novo trabalho de auditoria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao"
                value={formData.descricao || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
                placeholder="Descreva os objetivos e escopo do trabalho"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area_auditada">Área Auditada</Label>
                <Input 
                  id="area_auditada"
                  value={formData.area_auditada || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, area_auditada: e.target.value }))}
                  placeholder="Ex: Financeiro, TI, RH"
                />
              </div>
              <div>
                <Label htmlFor="tipo_auditoria">Tipo de Auditoria</Label>
                <Select value={formData.tipo_auditoria || 'operational'} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_auditoria: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nivel_risco">Nível de Risco</Label>
                <Select value={formData.nivel_risco || 'medio'} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_risco: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o risco" />
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
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Trabalho
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}