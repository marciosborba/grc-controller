import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  Target,
  Activity,
  Save,
  X,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProcedimentoAuditoria {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  objetivo: string;
  tipo_procedimento: 'analytical' | 'substantive' | 'compliance' | 'walkthrough' | 'inquiry' | 'observation' | 'inspection' | 'confirmation';
  status: 'planejado' | 'em_andamento' | 'concluido' | 'nao_aplicavel';
  data_inicio_planejada: string;
  data_fim_planejada: string;
  horas_estimadas: number;
  controle_testado: string;
  tamanho_amostra?: number;
  criterios_aceitacao: string;
  documentos_necessarios: string[];
  evidencias_esperadas: string[];
  trabalho_id: string;
  responsavel_id: string;
  created_at: string;
  responsavel_profile?: {
    full_name: string;
  };
  trabalho?: {
    titulo: string;
  };
}

const statusColors = {
  planejado: 'bg-gray-100 text-gray-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  concluido: 'bg-green-100 text-green-800',
  nao_aplicavel: 'bg-orange-100 text-orange-800'
};

const tipoColors = {
  analytical: 'bg-purple-100 text-purple-800',
  substantive: 'bg-indigo-100 text-indigo-800',
  compliance: 'bg-red-100 text-red-800',
  walkthrough: 'bg-yellow-100 text-yellow-800',
  inquiry: 'bg-green-100 text-green-800',
  observation: 'bg-blue-100 text-blue-800',
  inspection: 'bg-pink-100 text-pink-800',
  confirmation: 'bg-teal-100 text-teal-800'
};

export function PapeisTrabalhoCompleto() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [procedimentos, setProcedimentos] = useState<ProcedimentoAuditoria[]>([]);
  const [trabalhos, setTrabalhos] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedProcedimento, setSelectedProcedimento] = useState<ProcedimentoAuditoria | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    objetivo: '',
    tipo_procedimento: 'compliance' as const,
    trabalho_id: '',
    responsavel_id: '',
    data_inicio_planejada: '',
    data_fim_planejada: '',
    horas_estimadas: 0,
    controle_testado: '',
    tamanho_amostra: 0,
    criterios_aceitacao: '',
    documentos_necessarios: [] as string[],
    evidencias_esperadas: [] as string[]
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar procedimentos
      const { data: procedimentosData, error: procedimentosError } = await supabase
        .from('procedimentos_auditoria')
        .select(`
          *,
          responsavel_profile:responsavel_id(full_name),
          trabalho:trabalho_id(titulo)
        `)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (procedimentosError) {
        console.error('Erro ao carregar procedimentos:', procedimentosError);
        toast.error('Erro ao carregar procedimentos de auditoria');
      } else {
        setProcedimentos(procedimentosData || []);
      }

      // Carregar trabalhos para o dropdown
      const { data: trabalhosData, error: trabalhosError } = await supabase
        .from('trabalhos_auditoria')
        .select('id, titulo, codigo')
        .eq('tenant_id', effectiveTenantId)
        .order('titulo');

      if (trabalhosError) {
        console.error('Erro ao carregar trabalhos:', trabalhosError);
      } else {
        setTrabalhos(trabalhosData || []);
      }

      // Carregar profiles para o dropdown
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('tenant_id', effectiveTenantId)
        .order('full_name');

      if (profilesError) {
        console.error('Erro ao carregar profiles:', profilesError);
      } else {
        setProfiles(profilesData || []);
      }

    } catch (error) {
      console.error('Erro geral:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('procedimentos_auditoria')
        .insert([{
          ...formData,
          tenant_id: effectiveTenantId,
          created_by: user?.id,
          updated_by: user?.id
        }]);

      if (error) {
        console.error('Erro ao criar procedimento:', error);
        if (error.code === '23505') {
          toast.error('Já existe um procedimento com este código para este trabalho');
        } else {
          toast.error('Erro ao criar procedimento de auditoria');
        }
      } else {
        toast.success('Procedimento de auditoria criado com sucesso');
        setShowCreateDialog(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('Erro ao criar procedimento:', error);
      toast.error('Erro ao criar procedimento de auditoria');
    }
  };

  const handleUpdate = async () => {
    if (!selectedProcedimento) return;

    try {
      const { error } = await supabase
        .from('procedimentos_auditoria')
        .update({
          ...formData,
          updated_by: user?.id
        })
        .eq('id', selectedProcedimento.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) {
        console.error('Erro ao atualizar procedimento:', error);
        toast.error('Erro ao atualizar procedimento de auditoria');
      } else {
        toast.success('Procedimento de auditoria atualizado com sucesso');
        setShowEditDialog(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
      toast.error('Erro ao atualizar procedimento de auditoria');
    }
  };

  const handleDelete = async (procedimento: ProcedimentoAuditoria) => {
    if (!confirm('Tem certeza que deseja excluir este procedimento de auditoria?')) return;

    try {
      const { error } = await supabase
        .from('procedimentos_auditoria')
        .delete()
        .eq('id', procedimento.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) {
        console.error('Erro ao excluir procedimento:', error);
        toast.error('Erro ao excluir procedimento de auditoria');
      } else {
        toast.success('Procedimento de auditoria excluído com sucesso');
        loadData();
      }
    } catch (error) {
      console.error('Erro ao excluir procedimento:', error);
      toast.error('Erro ao excluir procedimento de auditoria');
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      titulo: '',
      descricao: '',
      objetivo: '',
      tipo_procedimento: 'compliance',
      trabalho_id: '',
      responsavel_id: '',
      data_inicio_planejada: '',
      data_fim_planejada: '',
      horas_estimadas: 0,
      controle_testado: '',
      tamanho_amostra: 0,
      criterios_aceitacao: '',
      documentos_necessarios: [],
      evidencias_esperadas: []
    });
    setSelectedProcedimento(null);
  };

  const openEditDialog = (procedimento: ProcedimentoAuditoria) => {
    setSelectedProcedimento(procedimento);
    setFormData({
      codigo: procedimento.codigo,
      titulo: procedimento.titulo,
      descricao: procedimento.descricao,
      objetivo: procedimento.objetivo,
      tipo_procedimento: procedimento.tipo_procedimento,
      trabalho_id: procedimento.trabalho_id,
      responsavel_id: procedimento.responsavel_id,
      data_inicio_planejada: procedimento.data_inicio_planejada,
      data_fim_planejada: procedimento.data_fim_planejada,
      horas_estimadas: procedimento.horas_estimadas,
      controle_testado: procedimento.controle_testado,
      tamanho_amostra: procedimento.tamanho_amostra || 0,
      criterios_aceitacao: procedimento.criterios_aceitacao,
      documentos_necessarios: procedimento.documentos_necessarios || [],
      evidencias_esperadas: procedimento.evidencias_esperadas || []
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (procedimento: ProcedimentoAuditoria) => {
    setSelectedProcedimento(procedimento);
    setShowViewDialog(true);
  };

  const filteredProcedimentos = useMemo(() => {
    return procedimentos.filter(proc => {
      const matchesSearch = proc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proc.controle_testado.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || proc.status === statusFilter;
      const matchesTipo = tipoFilter === 'all' || proc.tipo_procedimento === tipoFilter;
      return matchesSearch && matchesStatus && matchesTipo;
    });
  }, [procedimentos, searchTerm, statusFilter, tipoFilter]);

  const metrics = useMemo(() => {
    const total = procedimentos.length;
    const planejados = procedimentos.filter(p => p.status === 'planejado').length;
    const emAndamento = procedimentos.filter(p => p.status === 'em_andamento').length;
    const concluidos = procedimentos.filter(p => p.status === 'concluido').length;
    const totalHoras = procedimentos.reduce((sum, p) => sum + p.horas_estimadas, 0);

    return {
      total,
      planejados,
      emAndamento,
      concluidos,
      totalHoras
    };
  }, [procedimentos]);

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
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{metrics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Planejados</p>
                <p className="text-lg font-bold">{metrics.planejados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-lg font-bold">{metrics.emAndamento}</p>
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
                <p className="text-lg font-bold">{metrics.concluidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Horas</p>
                <p className="text-lg font-bold">{metrics.totalHoras}h</p>
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
                <FileText className="h-5 w-5" />
                Papéis de Trabalho (Procedimentos de Auditoria)
              </CardTitle>
              <CardDescription>
                Gestão de procedimentos e documentos de trabalho de auditoria
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Procedimento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar procedimentos..."
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
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="nao_aplicavel">Não Aplicável</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="substantive">Substantive</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
                <SelectItem value="walkthrough">Walkthrough</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="observation">Observation</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="confirmation">Confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Procedimentos */}
          <div className="space-y-4">
            {filteredProcedimentos.map((procedimento) => (
              <Card key={procedimento.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{procedimento.titulo}</h3>
                      <Badge className={statusColors[procedimento.status]}>
                        {procedimento.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={tipoColors[procedimento.tipo_procedimento]}>
                        {procedimento.tipo_procedimento}
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{procedimento.codigo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{procedimento.controle_testado}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span><strong>Responsável:</strong> {procedimento.responsavel_profile?.full_name || 'Não definido'}</span>
                      <span><strong>Trabalho:</strong> {procedimento.trabalho?.titulo || 'Não definido'}</span>
                      <span><strong>Horas:</strong> {procedimento.horas_estimadas}h</span>
                      <span><strong>Período:</strong> {new Date(procedimento.data_inicio_planejada).toLocaleDateString()} - {new Date(procedimento.data_fim_planejada).toLocaleDateString()}</span>
                      {procedimento.tamanho_amostra && (
                        <span><strong>Amostra:</strong> {procedimento.tamanho_amostra}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openViewDialog(procedimento)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(procedimento)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(procedimento)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredProcedimentos.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum procedimento de auditoria encontrado</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Procedimento
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Criar */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Procedimento de Auditoria</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo procedimento de auditoria
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="PROC-001"
              />
            </div>
            <div>
              <Label htmlFor="tipo_procedimento">Tipo de Procedimento</Label>
              <Select value={formData.tipo_procedimento} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_procedimento: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="substantive">Substantive</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                  <SelectItem value="walkthrough">Walkthrough</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="confirmation">Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Teste de Controles de..."
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição detalhada do procedimento..."
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="objetivo">Objetivo</Label>
              <Textarea
                id="objetivo"
                value={formData.objetivo}
                onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
                placeholder="Objetivo do procedimento de auditoria..."
              />
            </div>
            <div>
              <Label htmlFor="trabalho_id">Trabalho de Auditoria</Label>
              <Select value={formData.trabalho_id} onValueChange={(value) => setFormData(prev => ({ ...prev, trabalho_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um trabalho" />
                </SelectTrigger>
                <SelectContent>
                  {trabalhos.map((trabalho) => (
                    <SelectItem key={trabalho.id} value={trabalho.id}>
                      {trabalho.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="responsavel_id">Responsável</Label>
              <Select value={formData.responsavel_id} onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data_inicio_planejada">Data Início</Label>
              <Input
                id="data_inicio_planejada"
                type="date"
                value={formData.data_inicio_planejada}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="data_fim_planejada">Data Fim</Label>
              <Input
                id="data_fim_planejada"
                type="date"
                value={formData.data_fim_planejada}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="horas_estimadas">Horas Estimadas</Label>
              <Input
                id="horas_estimadas"
                type="number"
                value={formData.horas_estimadas}
                onChange={(e) => setFormData(prev => ({ ...prev, horas_estimadas: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="tamanho_amostra">Tamanho da Amostra</Label>
              <Input
                id="tamanho_amostra"
                type="number"
                value={formData.tamanho_amostra}
                onChange={(e) => setFormData(prev => ({ ...prev, tamanho_amostra: parseInt(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="controle_testado">Controle Testado</Label>
              <Input
                id="controle_testado"
                value={formData.controle_testado}
                onChange={(e) => setFormData(prev => ({ ...prev, controle_testado: e.target.value }))}
                placeholder="Descrição do controle a ser testado..."
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="criterios_aceitacao">Critérios de Aceitação</Label>
              <Textarea
                id="criterios_aceitacao"
                value={formData.criterios_aceitacao}
                onChange={(e) => setFormData(prev => ({ ...prev, criterios_aceitacao: e.target.value }))}
                placeholder="Critérios para considerar o procedimento adequado..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              <Save className="h-4 w-4 mr-2" />
              Criar Procedimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Procedimento de Auditoria</DialogTitle>
            <DialogDescription>
              Atualize as informações do procedimento de auditoria
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
              <Label htmlFor="edit_tipo_procedimento">Tipo de Procedimento</Label>
              <Select value={formData.tipo_procedimento} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_procedimento: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="substantive">Substantive</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                  <SelectItem value="walkthrough">Walkthrough</SelectItem>
                  <SelectItem value="inquiry">Inquiry</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="confirmation">Confirmation</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="col-span-2">
              <Label htmlFor="edit_objetivo">Objetivo</Label>
              <Textarea
                id="edit_objetivo"
                value={formData.objetivo}
                onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_trabalho_id">Trabalho de Auditoria</Label>
              <Select value={formData.trabalho_id} onValueChange={(value) => setFormData(prev => ({ ...prev, trabalho_id: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {trabalhos.map((trabalho) => (
                    <SelectItem key={trabalho.id} value={trabalho.id}>
                      {trabalho.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_responsavel_id">Responsável</Label>
              <Select value={formData.responsavel_id} onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_id: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_data_inicio_planejada">Data Início</Label>
              <Input
                id="edit_data_inicio_planejada"
                type="date"
                value={formData.data_inicio_planejada}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_data_fim_planejada">Data Fim</Label>
              <Input
                id="edit_data_fim_planejada"
                type="date"
                value={formData.data_fim_planejada}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_horas_estimadas">Horas Estimadas</Label>
              <Input
                id="edit_horas_estimadas"
                type="number"
                value={formData.horas_estimadas}
                onChange={(e) => setFormData(prev => ({ ...prev, horas_estimadas: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="edit_tamanho_amostra">Tamanho da Amostra</Label>
              <Input
                id="edit_tamanho_amostra"
                type="number"
                value={formData.tamanho_amostra}
                onChange={(e) => setFormData(prev => ({ ...prev, tamanho_amostra: parseInt(e.target.value) }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_controle_testado">Controle Testado</Label>
              <Input
                id="edit_controle_testado"
                value={formData.controle_testado}
                onChange={(e) => setFormData(prev => ({ ...prev, controle_testado: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_criterios_aceitacao">Critérios de Aceitação</Label>
              <Textarea
                id="edit_criterios_aceitacao"
                value={formData.criterios_aceitacao}
                onChange={(e) => setFormData(prev => ({ ...prev, criterios_aceitacao: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Procedimento de Auditoria</DialogTitle>
          </DialogHeader>
          {selectedProcedimento && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código</Label>
                  <p className="font-medium">{selectedProcedimento.codigo}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Badge className={tipoColors[selectedProcedimento.tipo_procedimento]}>
                    {selectedProcedimento.tipo_procedimento}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label>Título</Label>
                  <p className="font-medium">{selectedProcedimento.titulo}</p>
                </div>
                <div className="col-span-2">
                  <Label>Descrição</Label>
                  <p>{selectedProcedimento.descricao}</p>
                </div>
                <div className="col-span-2">
                  <Label>Objetivo</Label>
                  <p>{selectedProcedimento.objetivo}</p>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <p className="font-medium">{selectedProcedimento.responsavel_profile?.full_name || 'Não definido'}</p>
                </div>
                <div>
                  <Label>Trabalho</Label>
                  <p className="font-medium">{selectedProcedimento.trabalho?.titulo || 'Não definido'}</p>
                </div>
                <div>
                  <Label>Data Início</Label>
                  <p>{new Date(selectedProcedimento.data_inicio_planejada).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <p>{new Date(selectedProcedimento.data_fim_planejada).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Horas Estimadas</Label>
                  <p className="font-medium">{selectedProcedimento.horas_estimadas}h</p>
                </div>
                <div>
                  <Label>Tamanho da Amostra</Label>
                  <p className="font-medium">{selectedProcedimento.tamanho_amostra || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <Label>Controle Testado</Label>
                  <p>{selectedProcedimento.controle_testado}</p>
                </div>
                <div className="col-span-2">
                  <Label>Critérios de Aceitação</Label>
                  <p>{selectedProcedimento.criterios_aceitacao}</p>
                </div>
                {selectedProcedimento.documentos_necessarios && selectedProcedimento.documentos_necessarios.length > 0 && (
                  <div className="col-span-2">
                    <Label>Documentos Necessários</Label>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProcedimento.documentos_necessarios.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedProcedimento.evidencias_esperadas && selectedProcedimento.evidencias_esperadas.length > 0 && (
                  <div className="col-span-2">
                    <Label>Evidências Esperadas</Label>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProcedimento.evidencias_esperadas.map((evidencia, index) => (
                        <li key={index}>{evidencia}</li>
                      ))}
                    </ul>
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

export default PapeisTrabalhoCompleto;