import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  BarChart3,
  FileText,
  Building,
  Shield,
  Search,
  Eye,
  Activity,
  Calendar,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { usePlanejamentoData } from '@/hooks/useAuditQueries';
import { useSecureAuditData } from '@/hooks/useAuditModule';
import { sanitizeInput } from '@/utils/securityLogger';
import { toast } from 'sonner';

interface PlanoAuditoria {
  id: string;
  tenant_id: string;
  codigo: string;
  titulo: string;
  ano_exercicio: number;
  descricao?: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  status: 'draft' | 'aprovado' | 'em_execucao' | 'concluido' | 'cancelado';
  total_horas_planejadas: number;
  total_recursos_orcados: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface TrabalhoAuditoria {
  id: string;
  tenant_id: string;
  plano_anual_id?: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo_auditoria: 'compliance' | 'operational' | 'financial' | 'it' | 'investigative' | 'follow_up';
  area_auditada: string;
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  data_inicio_planejada: string;
  data_fim_planejada: string;
  horas_planejadas: number;
  orcamento_estimado: number;
  status: 'planejado' | 'aprovado' | 'iniciado' | 'em_andamento' | 'suspenso' | 'concluido' | 'cancelado';
  percentual_conclusao: number;
  prioridade: number;
  auditor_lider?: string;
  profiles?: {
    full_name: string;
  };
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  aprovado: 'bg-blue-100 text-blue-800',
  em_execucao: 'bg-green-100 text-green-800',
  concluido: 'bg-purple-100 text-purple-800',
  cancelado: 'bg-red-100 text-red-800',
  planejado: 'bg-yellow-100 text-yellow-800',
  iniciado: 'bg-orange-100 text-orange-800',
  em_andamento: 'bg-green-100 text-green-800',
  suspenso: 'bg-red-100 text-red-800'
};

const riskColors = {
  baixo: 'bg-blue-100 text-blue-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-orange-100 text-orange-800',
  critico: 'bg-red-100 text-red-800'
};

export function PlanejamentoAuditoriaOptimized() {
  // Usar hooks otimizados para múltiplas queries
  const { planos, trabalhos, recursos, isAnyLoading, loadAll } = usePlanejamentoData();
  
  // Hooks seguros para CRUD
  const {
    create: createPlano,
    update: updatePlano,
    delete: deletePlano
  } = useSecureAuditData<PlanoAuditoria>('planos_auditoria_anuais');

  const {
    create: createTrabalho,
    update: updateTrabalho,
    delete: deleteTrabalho
  } = useSecureAuditData<TrabalhoAuditoria>('trabalhos_auditoria');

  // Estado local
  const [selectedTab, setSelectedTab] = useState('planos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'plano' | 'trabalho'>('plano');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form data
  const [planoFormData, setPlanoFormData] = useState({
    codigo: '',
    titulo: '',
    ano_exercicio: new Date().getFullYear(),
    descricao: '',
    total_horas_planejadas: 0,
    total_recursos_orcados: 0,
    observacoes: ''
  });

  const [trabalhoFormData, setTrabalhoFormData] = useState({
    plano_anual_id: '',
    codigo: '',
    titulo: '',
    descricao: '',
    tipo_auditoria: 'operational' as const,
    area_auditada: '',
    nivel_risco: 'medio' as const,
    data_inicio_planejada: '',
    data_fim_planejada: '',
    horas_planejadas: 0,
    orcamento_estimado: 0,
    prioridade: 1
  });

  // Estatísticas calculadas
  const planosStats = useMemo(() => {
    const dados = planos.data as PlanoAuditoria[];
    return {
      total: dados.length,
      aprovados: dados.filter(p => p.status === 'aprovado').length,
      em_execucao: dados.filter(p => p.status === 'em_execucao').length,
      concluidos: dados.filter(p => p.status === 'concluido').length,
      total_horas: dados.reduce((sum, p) => sum + (p.total_horas_planejadas || 0), 0),
      total_recursos: dados.reduce((sum, p) => sum + (p.total_recursos_orcados || 0), 0)
    };
  }, [planos.data]);

  const trabalhosStats = useMemo(() => {
    const dados = trabalhos.data as TrabalhoAuditoria[];
    return {
      total: dados.length,
      planejados: dados.filter(t => t.status === 'planejado').length,
      em_andamento: dados.filter(t => t.status === 'em_andamento').length,
      concluidos: dados.filter(t => t.status === 'concluido').length,
      alto_risco: dados.filter(t => t.nivel_risco === 'alto' || t.nivel_risco === 'critico').length,
      progress_medio: dados.length > 0 ? 
        Math.round(dados.reduce((sum, t) => sum + t.percentual_conclusao, 0) / dados.length) : 0
    };
  }, [trabalhos.data]);

  // Filtros
  const filteredPlanos = useMemo(() => {
    return (planos.data as PlanoAuditoria[]).filter(plano => {
      const matchesSearch = !searchTerm || 
        plano.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plano.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || plano.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [planos.data, searchTerm, filterStatus]);

  const filteredTrabalhos = useMemo(() => {
    return (trabalhos.data as TrabalhoAuditoria[]).filter(trabalho => {
      const matchesSearch = !searchTerm || 
        trabalho.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trabalho.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trabalho.area_auditada.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || trabalho.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trabalhos.data, searchTerm, filterStatus]);

  // Handlers
  const handleSavePlano = async () => {
    try {
      if (!planoFormData.codigo || !planoFormData.titulo) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const sanitizedData = {
        codigo: sanitizeInput(planoFormData.codigo),
        titulo: sanitizeInput(planoFormData.titulo),
        ano_exercicio: planoFormData.ano_exercicio,
        descricao: sanitizeInput(planoFormData.descricao),
        total_horas_planejadas: planoFormData.total_horas_planejadas,
        total_recursos_orcados: planoFormData.total_recursos_orcados,
        observacoes: sanitizeInput(planoFormData.observacoes),
        status: 'draft' as const
      };

      const success = selectedItem 
        ? await updatePlano(selectedItem.id, sanitizedData)
        : await createPlano(sanitizedData);

      if (success) {
        setDialogOpen(false);
        resetForms();
        loadAll(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    }
  };

  const handleSaveTrabalho = async () => {
    try {
      if (!trabalhoFormData.codigo || !trabalhoFormData.titulo || !trabalhoFormData.area_auditada) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const sanitizedData = {
        plano_anual_id: trabalhoFormData.plano_anual_id || null,
        codigo: sanitizeInput(trabalhoFormData.codigo),
        titulo: sanitizeInput(trabalhoFormData.titulo),
        descricao: sanitizeInput(trabalhoFormData.descricao),
        tipo_auditoria: trabalhoFormData.tipo_auditoria,
        area_auditada: sanitizeInput(trabalhoFormData.area_auditada),
        nivel_risco: trabalhoFormData.nivel_risco,
        data_inicio_planejada: trabalhoFormData.data_inicio_planejada,
        data_fim_planejada: trabalhoFormData.data_fim_planejada,
        horas_planejadas: trabalhoFormData.horas_planejadas,
        orcamento_estimado: trabalhoFormData.orcamento_estimado,
        prioridade: trabalhoFormData.prioridade,
        status: 'planejado' as const,
        percentual_conclusao: 0
      };

      const success = selectedItem 
        ? await updateTrabalho(selectedItem.id, sanitizedData)
        : await createTrabalho(sanitizedData);

      if (success) {
        setDialogOpen(false);
        resetForms();
        loadAll();
      }
    } catch (error) {
      console.error('Erro ao salvar trabalho:', error);
    }
  };

  const resetForms = () => {
    setPlanoFormData({
      codigo: '',
      titulo: '',
      ano_exercicio: new Date().getFullYear(),
      descricao: '',
      total_horas_planejadas: 0,
      total_recursos_orcados: 0,
      observacoes: ''
    });
    
    setTrabalhoFormData({
      plano_anual_id: '',
      codigo: '',
      titulo: '',
      descricao: '',
      tipo_auditoria: 'operational',
      area_auditada: '',
      nivel_risco: 'medio',
      data_inicio_planejada: '',
      data_fim_planejada: '',
      horas_planejadas: 0,
      orcamento_estimado: 0,
      prioridade: 1
    });
    
    setSelectedItem(null);
  };

  const openDialog = (type: 'plano' | 'trabalho', item?: any) => {
    setDialogType(type);
    setSelectedItem(item);
    
    if (item) {
      if (type === 'plano') {
        setPlanoFormData({
          codigo: item.codigo,
          titulo: item.titulo,
          ano_exercicio: item.ano_exercicio,
          descricao: item.descricao || '',
          total_horas_planejadas: item.total_horas_planejadas,
          total_recursos_orcados: item.total_recursos_orcados,
          observacoes: item.observacoes || ''
        });
      } else {
        setTrabalhoFormData({
          plano_anual_id: item.plano_anual_id || '',
          codigo: item.codigo,
          titulo: item.titulo,
          descricao: item.descricao || '',
          tipo_auditoria: item.tipo_auditoria,
          area_auditada: item.area_auditada,
          nivel_risco: item.nivel_risco,
          data_inicio_planejada: item.data_inicio_planejada,
          data_fim_planejada: item.data_fim_planejada,
          horas_planejadas: item.horas_planejadas,
          orcamento_estimado: item.orcamento_estimado,
          prioridade: item.prioridade
        });
      }
    } else {
      resetForms();
    }
    
    setDialogOpen(true);
  };

  if (isAnyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Planejamento de Auditoria</h2>
        <Button onClick={() => openDialog(selectedTab === 'planos' ? 'plano' : 'trabalho')}>
          <Plus className="h-4 w-4 mr-2" />
          {selectedTab === 'planos' ? 'Novo Plano' : 'Novo Trabalho'}
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planos">Planos Anuais</TabsTrigger>
          <TabsTrigger value="trabalhos">Trabalhos</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{planosStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                    <p className="text-2xl font-bold text-blue-600">{planosStats.aprovados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Em Execução</p>
                    <p className="text-2xl font-bold text-green-600">{planosStats.em_execucao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                    <p className="text-2xl font-bold text-purple-600">{planosStats.concluidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total Horas</p>
                    <p className="text-2xl font-bold text-orange-600">{planosStats.total_horas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Recursos</p>
                    <p className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                        .format(planosStats.total_recursos)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar planos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="em_execucao">Em Execução</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Planos */}
          <div className="space-y-4">
            {filteredPlanos.map((plano) => (
              <Card key={plano.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{plano.titulo}</h3>
                        <Badge variant="outline">{plano.codigo}</Badge>
                        <Badge className={statusColors[plano.status] || 'bg-gray-100 text-gray-800'}>
                          {plano.status}
                        </Badge>
                        <Badge variant="secondary">{plano.ano_exercicio}</Badge>
                      </div>
                      
                      {plano.descricao && (
                        <p className="text-muted-foreground mb-4">{plano.descricao}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Horas:</span>
                          <span className="ml-2">{plano.total_horas_planejadas}</span>
                        </div>
                        <div>
                          <span className="font-medium">Recursos:</span>
                          <span className="ml-2">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                              .format(plano.total_recursos_orcados)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Criado:</span>
                          <span className="ml-2">
                            {new Date(plano.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {plano.data_aprovacao && (
                          <div>
                            <span className="font-medium">Aprovado:</span>
                            <span className="ml-2">
                              {new Date(plano.data_aprovacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDialog('plano', plano)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este plano?')) {
                            deletePlano(plano.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trabalhos" className="space-y-6">
          {/* Stats Cards para Trabalhos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{trabalhosStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Planejados</p>
                    <p className="text-2xl font-bold text-yellow-600">{trabalhosStats.planejados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold text-green-600">{trabalhosStats.em_andamento}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Alto Risco</p>
                    <p className="text-2xl font-bold text-red-600">{trabalhosStats.alto_risco}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
                    <p className="text-2xl font-bold text-purple-600">{trabalhosStats.progress_medio}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Trabalhos */}
          <div className="space-y-4">
            {filteredTrabalhos.map((trabalho) => (
              <Card key={trabalho.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{trabalho.titulo}</h3>
                        <Badge variant="outline">{trabalho.codigo}</Badge>
                        <Badge className={statusColors[trabalho.status] || 'bg-gray-100 text-gray-800'}>
                          {trabalho.status}
                        </Badge>
                        <Badge className={riskColors[trabalho.nivel_risco]}>
                          {trabalho.nivel_risco}
                        </Badge>
                        <Badge variant="secondary">P{trabalho.prioridade}</Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-2">Área: {trabalho.area_auditada}</p>
                      {trabalho.descricao && (
                        <p className="text-muted-foreground mb-4">{trabalho.descricao}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Tipo:</span>
                          <span className="ml-2">{trabalho.tipo_auditoria}</span>
                        </div>
                        <div>
                          <span className="font-medium">Horas:</span>
                          <span className="ml-2">{trabalho.horas_planejadas}</span>
                        </div>
                        <div>
                          <span className="font-medium">Progresso:</span>
                          <span className="ml-2">{trabalho.percentual_conclusao}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Período:</span>
                          <span className="ml-2">
                            {new Date(trabalho.data_inicio_planejada).toLocaleDateString('pt-BR')} - {new Date(trabalho.data_fim_planejada).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {trabalho.profiles && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Auditor Líder:</span>
                          <span className="ml-2">{trabalho.profiles.full_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDialog('trabalho', trabalho)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este trabalho?')) {
                            deleteTrabalho(trabalho.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recursos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recursos e Orçamento</CardTitle>
              <CardDescription>Gerenciamento de recursos alocados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mt-4">Dados de recursos em carregamento...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusColors).map(([status, colorClass]) => {
                    const count = [...filteredPlanos, ...filteredTrabalhos].filter(item => item.status === status).length;
                    const total = filteredPlanos.length + filteredTrabalhos.length;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-10 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(riskColors).map(([risk, colorClass]) => {
                    const count = filteredTrabalhos.filter(item => item.nivel_risco === risk).length;
                    const percentage = filteredTrabalhos.length > 0 ? (count / filteredTrabalhos.length) * 100 : 0;
                    
                    return (
                      <div key={risk} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{risk}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm w-10 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem 
                ? `Editar ${dialogType === 'plano' ? 'Plano' : 'Trabalho'}` 
                : `Novo ${dialogType === 'plano' ? 'Plano' : 'Trabalho'}`}
            </DialogTitle>
          </DialogHeader>
          
          {dialogType === 'plano' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código *</Label>
                  <Input 
                    value={planoFormData.codigo}
                    onChange={(e) => setPlanoFormData(prev => ({...prev, codigo: e.target.value}))}
                    placeholder="Ex: PA-2024"
                  />
                </div>
                
                <div>
                  <Label>Ano de Exercício *</Label>
                  <Input 
                    type="number"
                    value={planoFormData.ano_exercicio}
                    onChange={(e) => setPlanoFormData(prev => ({...prev, ano_exercicio: parseInt(e.target.value)}))}
                  />
                </div>
              </div>

              <div>
                <Label>Título *</Label>
                <Input 
                  value={planoFormData.titulo}
                  onChange={(e) => setPlanoFormData(prev => ({...prev, titulo: e.target.value}))}
                  placeholder="Digite o título do plano"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={planoFormData.descricao}
                  onChange={(e) => setPlanoFormData(prev => ({...prev, descricao: e.target.value}))}
                  placeholder="Descrição do plano anual"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total de Horas Planejadas</Label>
                  <Input 
                    type="number"
                    value={planoFormData.total_horas_planejadas}
                    onChange={(e) => setPlanoFormData(prev => ({...prev, total_horas_planejadas: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                
                <div>
                  <Label>Recursos Orçados (R$)</Label>
                  <Input 
                    type="number"
                    value={planoFormData.total_recursos_orcados}
                    onChange={(e) => setPlanoFormData(prev => ({...prev, total_recursos_orcados: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea 
                  value={planoFormData.observacoes}
                  onChange={(e) => setPlanoFormData(prev => ({...prev, observacoes: e.target.value}))}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plano Anual</Label>
                  <Select 
                    value={trabalhoFormData.plano_anual_id} 
                    onValueChange={(value) => setTrabalhoFormData(prev => ({...prev, plano_anual_id: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {(planos.data as PlanoAuditoria[]).map(plano => (
                        <SelectItem key={plano.id} value={plano.id}>
                          {plano.codigo} - {plano.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Código *</Label>
                  <Input 
                    value={trabalhoFormData.codigo}
                    onChange={(e) => setTrabalhoFormData(prev => ({...prev, codigo: e.target.value}))}
                    placeholder="Ex: TA-001"
                  />
                </div>
              </div>

              <div>
                <Label>Título *</Label>
                <Input 
                  value={trabalhoFormData.titulo}
                  onChange={(e) => setTrabalhoFormData(prev => ({...prev, titulo: e.target.value}))}
                  placeholder="Digite o título do trabalho"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Auditoria</Label>
                  <Select 
                    value={trabalhoFormData.tipo_auditoria} 
                    onValueChange={(value) => setTrabalhoFormData(prev => ({...prev, tipo_auditoria: value as any}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="financial">Financeira</SelectItem>
                      <SelectItem value="it">TI</SelectItem>
                      <SelectItem value="investigative">Investigativa</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Nível de Risco</Label>
                  <Select 
                    value={trabalhoFormData.nivel_risco} 
                    onValueChange={(value) => setTrabalhoFormData(prev => ({...prev, nivel_risco: value as any}))}
                  >
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
              </div>

              <div>
                <Label>Área Auditada *</Label>
                <Input 
                  value={trabalhoFormData.area_auditada}
                  onChange={(e) => setTrabalhoFormData(prev => ({...prev, area_auditada: e.target.value}))}
                  placeholder="Digite a área a ser auditada"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={trabalhoFormData.descricao}
                  onChange={(e) => setTrabalhoFormData(prev => ({...prev, descricao: e.target.value}))}
                  placeholder="Descrição do trabalho de auditoria"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Data Início</Label>
                  <Input 
                    type="date"
                    value={trabalhoFormData.data_inicio_planejada}
                    onChange={(e) => setTrabalhoFormData(prev => ({...prev, data_inicio_planejada: e.target.value}))}
                  />
                </div>
                
                <div>
                  <Label>Data Fim</Label>
                  <Input 
                    type="date"
                    value={trabalhoFormData.data_fim_planejada}
                    onChange={(e) => setTrabalhoFormData(prev => ({...prev, data_fim_planejada: e.target.value}))}
                  />
                </div>
                
                <div>
                  <Label>Prioridade</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="10"
                    value={trabalhoFormData.prioridade}
                    onChange={(e) => setTrabalhoFormData(prev => ({...prev, prioridade: parseInt(e.target.value) || 1}))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horas Planejadas</Label>
                  <Input 
                    type="number"
                    value={trabalhoFormData.horas_planejadas}
                    onChange={(e) => setTrabalhoFormData(prev => ({...prev, horas_planejadas: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                
                <div>
                  <Label>Orçamento Estimado (R$)</Label>
                  <Input 
                    type="number"
                    value={trabalhoFormData.orcamento_estimado}
                    onChange={(e) => setTrabalhoFormData(prev => ({...prev, orcamento_estimado: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={dialogType === 'plano' ? handleSavePlano : handleSaveTrabalho}>
              {selectedItem ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}