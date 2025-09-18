import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Plus,
  Edit,
  FileText,
  Clock,
  X,
  Save,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Activity,
  AlertTriangle,
  Users,
  Eye,
  BarChart3,
  Target,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlanoAnualAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  ano_exercicio: number;
  descricao?: string;
  data_aprovacao?: string;
  aprovado_por?: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  total_horas_planejadas: number;
  total_recursos_orcados: number;
  observacoes?: string;
  created_at: string;
  aprovado_por_profile?: {
    full_name: string;
  };
}

interface TrabalhoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
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
  auditor_lider: string;
  auditor_lider_profile?: {
    full_name: string;
  };
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800'
};

const riskColors = {
  baixo: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-orange-100 text-orange-800',
  critico: 'bg-red-100 text-red-800'
};

export function PlanejamentoAnualAuditoria() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [planos, setPlanos] = useState<PlanoAnualAuditoria[]>([]);
  const [trabalhos, setTrabalhos] = useState<TrabalhoAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateTrabalhoDialog, setShowCreateTrabalhoDialog] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<PlanoAnualAuditoria | null>(null);
  const [selectedTrabalho, setSelectedTrabalho] = useState<TrabalhoAuditoria | null>(null);
  const [selectedPlanoId, setSelectedPlanoId] = useState<string>('');

  const [formData, setFormData] = useState({
    codigo: '',
    titulo: '',
    ano_exercicio: new Date().getFullYear(),
    descricao: '',
    total_horas_planejadas: 0,
    total_recursos_orcados: 0,
    observacoes: ''
  });

  const [trabalhoFormData, setTrabalhoFormData] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    tipo_auditoria: 'compliance' as const,
    area_auditada: '',
    nivel_risco: 'medio' as const,
    data_inicio_planejada: '',
    data_fim_planejada: '',
    horas_planejadas: 0,
    orcamento_estimado: 0,
    prioridade: 3,
    auditor_lider: ''
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadPlanosETrabalhos();
    }
  }, [effectiveTenantId, selectedYear]);

  const loadPlanosETrabalhos = async () => {
    try {
      setLoading(true);

      // Carregar planos anuais
      const { data: planosData, error: planosError } = await supabase
        .from('planos_auditoria_anuais')
        .select(`
          *,
          aprovado_por_profile:aprovado_por(full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .eq('ano_exercicio', selectedYear)
        .order('created_at', { ascending: false });

      if (planosError) {
        secureLog('error', 'Erro ao carregar planos', planosError);
        toast.error('Erro ao carregar planos de auditoria');
      } else {
        setPlanos(planosData || []);
      }

      // Carregar trabalhos de auditoria
      const { data: trabalhosData, error: trabalhosError } = await supabase
        .from('trabalhos_auditoria')
        .select(`
          *,
          auditor_lider_profile:auditor_lider(full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .gte('data_inicio_planejada', `${selectedYear}-01-01`)
        .lt('data_inicio_planejada', `${selectedYear + 1}-01-01`)
        .order('data_inicio_planejada', { ascending: true });

      if (trabalhosError) {
        secureLog('error', 'Erro ao carregar trabalhos', trabalhosError);
        toast.error('Erro ao carregar trabalhos de auditoria');
      } else {
        setTrabalhos(trabalhosData || []);
      }

    } catch (error) {
      secureLog('error', 'Erro geral ao carregar dados de planejamento', error);
      toast.error('Erro ao carregar dados de planejamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlano = async () => {
    try {
      const { error } = await supabase
        .from('planos_auditoria_anuais')
        .insert([{
          ...formData,
          tenant_id: effectiveTenantId,
          created_by: user?.id,
          updated_by: user?.id
        }]);

      if (error) {
        secureLog('error', 'Erro ao criar plano', error);
        if (error.code === '23505') {
          toast.error('Já existe um plano com este código');
        } else {
          toast.error('Erro ao criar plano de auditoria');
        }
      } else {
        toast.success('Plano de auditoria criado com sucesso');
        setShowCreateDialog(false);
        resetForm();
        loadPlanosETrabalhos();
      }
    } catch (error) {
      secureLog('error', 'Erro ao criar plano', error);
      toast.error('Erro ao criar plano de auditoria');
    }
  };

  const handleUpdatePlano = async () => {
    if (!selectedPlano) return;

    try {
      const { error } = await supabase
        .from('planos_auditoria_anuais')
        .update({
          ...formData,
          updated_by: user?.id
        })
        .eq('id', selectedPlano.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) {
        secureLog('error', 'Erro ao atualizar plano', error);
        toast.error('Erro ao atualizar plano de auditoria');
      } else {
        toast.success('Plano de auditoria atualizado com sucesso');
        setShowEditDialog(false);
        resetForm();
        loadPlanosETrabalhos();
      }
    } catch (error) {
      secureLog('error', 'Erro ao atualizar plano', error);
      toast.error('Erro ao atualizar plano de auditoria');
    }
  };

  const handleDeletePlano = async (plano: PlanoAnualAuditoria) => {
    if (!confirm('Tem certeza que deseja excluir este plano de auditoria?')) return;

    try {
      const { error } = await supabase
        .from('planos_auditoria_anuais')
        .delete()
        .eq('id', plano.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) {
        secureLog('error', 'Erro ao excluir plano', error);
        toast.error('Erro ao excluir plano de auditoria');
      } else {
        toast.success('Plano de auditoria excluído com sucesso');
        loadPlanosETrabalhos();
      }
    } catch (error) {
      secureLog('error', 'Erro ao excluir plano', error);
      toast.error('Erro ao excluir plano de auditoria');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      titulo: '',
      ano_exercicio: new Date().getFullYear(),
      descricao: '',
      total_horas_planejadas: 0,
      total_recursos_orcados: 0,
      observacoes: ''
    });
    setSelectedPlano(null);
  };

  const resetTrabalhoForm = () => {
    setTrabalhoFormData({
      codigo: '',
      titulo: '',
      descricao: '',
      tipo_auditoria: 'compliance',
      area_auditada: '',
      nivel_risco: 'medio',
      data_inicio_planejada: '',
      data_fim_planejada: '',
      horas_planejadas: 0,
      orcamento_estimado: 0,
      prioridade: 3,
      auditor_lider: ''
    });
    setSelectedTrabalho(null);
  };

  const openEditDialog = (plano: PlanoAnualAuditoria) => {
    setSelectedPlano(plano);
    setFormData({
      codigo: plano.codigo,
      titulo: plano.titulo,
      ano_exercicio: plano.ano_exercicio,
      descricao: plano.descricao || '',
      total_horas_planejadas: plano.total_horas_planejadas,
      total_recursos_orcados: plano.total_recursos_orcados,
      observacoes: plano.observacoes || ''
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (plano: PlanoAnualAuditoria) => {
    setSelectedPlano(plano);
    setShowViewDialog(true);
  };

  const filteredPlanos = useMemo(() => {
    return planos.filter(plano => {
      const matchesSearch = plano.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plano.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || plano.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [planos, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const totalTrabalhos = trabalhos.length;
    const trabalhosConcluidos = trabalhos.filter(t => t.status === 'concluido').length;
    const trabalhosEmAndamento = trabalhos.filter(t => t.status === 'em_andamento').length;
    const totalHorasPlanejadas = trabalhos.reduce((sum, t) => sum + t.horas_planejadas, 0);
    const totalOrcamentoPlanejado = trabalhos.reduce((sum, t) => sum + t.orcamento_estimado, 0);

    return {
      totalTrabalhos,
      trabalhosConcluidos,
      trabalhosEmAndamento,
      totalHorasPlanejadas,
      totalOrcamentoPlanejado
    };
  }, [trabalhos]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Trabalhos</p>
                <p className="text-lg font-bold">{metrics.totalTrabalhos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Concluídos</p>
                <p className="text-lg font-bold">{metrics.trabalhosConcluidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-lg font-bold">{metrics.trabalhosEmAndamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Horas Planejadas</p>
                <p className="text-lg font-bold">{metrics.totalHorasPlanejadas.toFixed(0)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Orçamento</p>
                <p className="text-lg font-bold">R$ {metrics.totalOrcamentoPlanejado.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planejamento Anual de Auditoria - {selectedYear}
              </CardTitle>
              <CardDescription>
                Gestão de planos anuais e trabalhos de auditoria
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar planos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Planos */}
          <div className="space-y-4">
            {filteredPlanos.map((plano) => (
              <Card key={plano.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{plano.titulo}</h3>
                      <Badge className={statusColors[plano.status]}>
                        {plano.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{plano.codigo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{plano.descricao}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span><strong>Horas:</strong> {plano.total_horas_planejadas}h</span>
                      <span><strong>Orçamento:</strong> R$ {plano.total_recursos_orcados.toLocaleString()}</span>
                      {plano.data_aprovacao && (
                        <span><strong>Aprovado em:</strong> {new Date(plano.data_aprovacao).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openViewDialog(plano)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(plano)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePlano(plano)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredPlanos.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum plano de auditoria encontrado para {selectedYear}</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Plano
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trabalhos de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Trabalhos de Auditoria - {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trabalhos.map((trabalho) => (
              <Card key={trabalho.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{trabalho.titulo}</h4>
                      <Badge className={riskColors[trabalho.nivel_risco]}>
                        {trabalho.nivel_risco}
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{trabalho.codigo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{trabalho.area_auditada}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span><strong>Tipo:</strong> {trabalho.tipo_auditoria}</span>
                      <span><strong>Período:</strong> {new Date(trabalho.data_inicio_planejada).toLocaleDateString()} - {new Date(trabalho.data_fim_planejada).toLocaleDateString()}</span>
                      <span><strong>Líder:</strong> {trabalho.auditor_lider_profile?.full_name || 'Não definido'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{trabalho.percentual_conclusao}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${trabalho.percentual_conclusao}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {trabalhos.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum trabalho de auditoria encontrado para {selectedYear}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Criar Plano */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Plano Anual</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo plano de auditoria anual
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="PA-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="ano_exercicio">Ano do Exercício</Label>
              <Input
                id="ano_exercicio"
                type="number"
                value={formData.ano_exercicio}
                onChange={(e) => setFormData(prev => ({ ...prev, ano_exercicio: parseInt(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Plano Anual de Auditoria 2024"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição detalhada do plano de auditoria..."
              />
            </div>
            <div>
              <Label htmlFor="total_horas_planejadas">Total de Horas Planejadas</Label>
              <Input
                id="total_horas_planejadas"
                type="number"
                value={formData.total_horas_planejadas}
                onChange={(e) => setFormData(prev => ({ ...prev, total_horas_planejadas: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="total_recursos_orcados">Total de Recursos Orçados</Label>
              <Input
                id="total_recursos_orcados"
                type="number"
                value={formData.total_recursos_orcados}
                onChange={(e) => setFormData(prev => ({ ...prev, total_recursos_orcados: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlano}>
              <Save className="h-4 w-4 mr-2" />
              Criar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Plano */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plano Anual</DialogTitle>
            <DialogDescription>
              Atualize as informações do plano de auditoria
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_codigo">Código</Label>
              <Input
                id="edit_codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_ano_exercicio">Ano do Exercício</Label>
              <Input
                id="edit_ano_exercicio"
                type="number"
                value={formData.ano_exercicio}
                onChange={(e) => setFormData(prev => ({ ...prev, ano_exercicio: parseInt(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_titulo">Título</Label>
              <Input
                id="edit_titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_descricao">Descrição</Label>
              <Textarea
                id="edit_descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_total_horas_planejadas">Total de Horas Planejadas</Label>
              <Input
                id="edit_total_horas_planejadas"
                type="number"
                value={formData.total_horas_planejadas}
                onChange={(e) => setFormData(prev => ({ ...prev, total_horas_planejadas: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_total_recursos_orcados">Total de Recursos Orçados</Label>
              <Input
                id="edit_total_recursos_orcados"
                type="number"
                value={formData.total_recursos_orcados}
                onChange={(e) => setFormData(prev => ({ ...prev, total_recursos_orcados: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_observacoes">Observações</Label>
              <Textarea
                id="edit_observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePlano}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar Plano */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Plano Anual</DialogTitle>
          </DialogHeader>
          {selectedPlano && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código</Label>
                  <p className="font-medium">{selectedPlano.codigo}</p>
                </div>
                <div>
                  <Label>Ano do Exercício</Label>
                  <p className="font-medium">{selectedPlano.ano_exercicio}</p>
                </div>
                <div className="col-span-2">
                  <Label>Título</Label>
                  <p className="font-medium">{selectedPlano.titulo}</p>
                </div>
                <div className="col-span-2">
                  <Label>Descrição</Label>
                  <p>{selectedPlano.descricao || 'Não informada'}</p>
                </div>
                <div>
                  <Label>Total de Horas Planejadas</Label>
                  <p className="font-medium">{selectedPlano.total_horas_planejadas}h</p>
                </div>
                <div>
                  <Label>Total de Recursos Orçados</Label>
                  <p className="font-medium">R$ {selectedPlano.total_recursos_orcados.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={statusColors[selectedPlano.status]}>
                    {selectedPlano.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Criado em</Label>
                  <p>{new Date(selectedPlano.created_at).toLocaleDateString()}</p>
                </div>
                {selectedPlano.observacoes && (
                  <div className="col-span-2">
                    <Label>Observações</Label>
                    <p>{selectedPlano.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PlanejamentoAnualAuditoria;