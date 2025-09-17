import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  Target,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface NonConformity {
  id: string;
  codigo: string;
  titulo: string;
  o_que: string;
  onde: string;
  quando: string;
  quem: string;
  por_que: string;
  como_identificado: string;
  quanto_impacto: string;
  categoria: string;
  tipo_nao_conformidade: string;
  origem_identificacao: string;
  criticidade: string;
  impacto_operacional: number;
  impacto_financeiro: number;
  impacto_reputacional: number;
  impacto_regulatorio: number;
  risco_score: number;
  status: string;
  responsavel_tratamento: string;
  responsavel_nome: string;
  data_identificacao: string;
  prazo_resolucao: string;
  data_resolucao: string;
  justificativa_status: string;
  e_recorrente: boolean;
  quantidade_recorrencias: number;
  requisito_id: string;
  requisito_nome: string;
  framework_nome: string;
  evidencias_nao_conformidade: string[];
  acoes_imediatas_tomadas: string;
  created_at: string;
  planos_acao: any[];
}

interface NonConformityFormData {
  codigo: string;
  titulo: string;
  requisito_id: string;
  o_que: string;
  onde: string;
  quem: string;
  por_que: string;
  como_identificado: string;
  quanto_impacto: string;
  categoria: string;
  tipo_nao_conformidade: string;
  origem_identificacao: string;
  criticidade: string;
  impacto_operacional: number;
  impacto_financeiro: number;
  impacto_reputacional: number;
  impacto_regulatorio: number;
  responsavel_tratamento: string;
  prazo_resolucao: string;
  evidencias_nao_conformidade: string[];
  acoes_imediatas_tomadas: string;
}

const CRITICIDADES = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-800' }
];

const TIPOS_NAO_CONFORMIDADE = [
  { value: 'sistemica', label: 'Sistêmica' },
  { value: 'pontual', label: 'Pontual' },
  { value: 'recorrente', label: 'Recorrente' }
];

const ORIGENS_IDENTIFICACAO = [
  { value: 'auto_avaliacao', label: 'Auto-avaliação' },
  { value: 'auditoria_interna', label: 'Auditoria Interna' },
  { value: 'auditoria_externa', label: 'Auditoria Externa' },
  { value: 'regulador', label: 'Órgão Regulador' },
  { value: 'incidente', label: 'Incidente/Evento' }
];

const STATUS_OPTIONS = [
  { value: 'aberta', label: 'Aberta', color: 'bg-red-100 text-red-800' },
  { value: 'em_tratamento', label: 'Em Tratamento', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'aguardando_evidencia', label: 'Aguardando Evidência', color: 'bg-blue-100 text-blue-800' },
  { value: 'resolvida', label: 'Resolvida', color: 'bg-green-100 text-green-800' },
  { value: 'aceita_risco', label: 'Risco Aceito', color: 'bg-gray-100 text-gray-800' }
];

export function NonConformitiesManagement() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [requisitos, setRequisitos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingNC, setEditingNC] = useState<NonConformity | null>(null);
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCriticidade, setFilterCriticidade] = useState('');

  const [formData, setFormData] = useState<NonConformityFormData>({
    codigo: '',
    titulo: '',
    requisito_id: '',
    o_que: '',
    onde: '',
    quem: '',
    por_que: '',
    como_identificado: '',
    quanto_impacto: '',
    categoria: '',
    tipo_nao_conformidade: '',
    origem_identificacao: '',
    criticidade: '',
    impacto_operacional: 1,
    impacto_financeiro: 0,
    impacto_reputacional: 1,
    impacto_regulatorio: 1,
    responsavel_tratamento: '',
    prazo_resolucao: '',
    evidencias_nao_conformidade: [],
    acoes_imediatas_tomadas: ''
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadNonConformities(),
        loadRequisitos(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadNonConformities = async () => {
    const { data, error } = await supabase
      .from('nao_conformidades')
      .select(`
        *,
        profiles!nao_conformidades_responsavel_tratamento_fkey(full_name),
        requisitos_compliance!inner(
          titulo,
          frameworks_compliance!inner(nome)
        ),
        planos_acao_conformidade(
          id,
          titulo,
          status,
          percentual_conclusao
        )
      `)
      .eq('tenant_id', effectiveTenantId)
      .order('risco_score', { ascending: false });

    if (error) throw error;

    const processedData = data?.map(nc => ({
      ...nc,
      responsavel_nome: nc.profiles?.full_name || 'Não atribuído',
      requisito_nome: nc.requisitos_compliance?.titulo || 'N/A',
      framework_nome: nc.requisitos_compliance?.frameworks_compliance?.nome || 'N/A',
      evidencias_nao_conformidade: nc.evidencias_nao_conformidade || [],
      planos_acao: nc.planos_acao_conformidade || []
    })) || [];

    setNonConformities(processedData);
  };

  const loadRequisitos = async () => {
    const { data, error } = await supabase
      .from('requisitos_compliance')
      .select(`
        id,
        titulo,
        frameworks_compliance!inner(nome)
      `)
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo');

    if (error) throw error;
    setRequisitos(data || []);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('tenant_id', effectiveTenantId)
      .order('full_name');

    if (error) throw error;
    setUsers(data || []);
  };

  const generateNextCode = () => {
    const year = new Date().getFullYear();
    const count = nonConformities.length + 1;
    return `NC-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        tenant_id: effectiveTenantId,
        codigo: formData.codigo || generateNextCode(),
        quando: new Date().toISOString(),
        data_identificacao: new Date().toISOString().split('T')[0],
        status: 'aberta',
        created_by: user?.id,
        updated_by: user?.id
      };

      let error;
      if (editingNC) {
        const { error: updateError } = await supabase
          .from('nao_conformidades')
          .update(payload)
          .eq('id', editingNC.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('nao_conformidades')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingNC ? 'Não conformidade atualizada!' : 'Não conformidade registrada!');
      setDialogOpen(false);
      resetForm();
      loadNonConformities();
    } catch (error) {
      console.error('Erro ao salvar não conformidade:', error);
      toast.error('Erro ao salvar não conformidade');
    }
  };

  const handleEdit = (nc: NonConformity) => {
    setEditingNC(nc);
    setFormData({
      codigo: nc.codigo,
      titulo: nc.titulo,
      requisito_id: nc.requisito_id,
      o_que: nc.o_que,
      onde: nc.onde || '',
      quem: nc.quem || '',
      por_que: nc.por_que || '',
      como_identificado: nc.como_identificado || '',
      quanto_impacto: nc.quanto_impacto || '',
      categoria: nc.categoria || '',
      tipo_nao_conformidade: nc.tipo_nao_conformidade,
      origem_identificacao: nc.origem_identificacao,
      criticidade: nc.criticidade,
      impacto_operacional: nc.impacto_operacional,
      impacto_financeiro: nc.impacto_financeiro,
      impacto_reputacional: nc.impacto_reputacional,
      impacto_regulatorio: nc.impacto_regulatorio,
      responsavel_tratamento: nc.responsavel_tratamento || '',
      prazo_resolucao: nc.prazo_resolucao || '',
      evidencias_nao_conformidade: nc.evidencias_nao_conformidade,
      acoes_imediatas_tomadas: nc.acoes_imediatas_tomadas || ''
    });
    setDialogOpen(true);
  };

  const handleViewDetails = (nc: NonConformity) => {
    setSelectedNC(nc);
    setDetailsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      titulo: '',
      requisito_id: '',
      o_que: '',
      onde: '',
      quem: '',
      por_que: '',
      como_identificado: '',
      quanto_impacto: '',
      categoria: '',
      tipo_nao_conformidade: '',
      origem_identificacao: '',
      criticidade: '',
      impacto_operacional: 1,
      impacto_financeiro: 0,
      impacto_reputacional: 1,
      impacto_regulatorio: 1,
      responsavel_tratamento: '',
      prazo_resolucao: '',
      evidencias_nao_conformidade: [],
      acoes_imediatas_tomadas: ''
    });
    setEditingNC(null);
  };

  const getCriticalityColor = (criticidade: string) => {
    const item = CRITICIDADES.find(c => c.value === criticidade);
    return item?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const item = STATUS_OPTIONS.find(s => s.value === status);
    return item?.color || 'bg-gray-100 text-gray-800';
  };

  const getDaysToDeadline = (prazoResolucao: string) => {
    if (!prazoResolucao) return null;
    const deadline = new Date(prazoResolucao);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredNonConformities = nonConformities.filter(nc => {
    const matchesSearch = nc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nc.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || nc.status === filterStatus;
    const matchesCriticidade = !filterCriticidade || nc.criticidade === filterCriticidade;
    
    return matchesSearch && matchesStatus && matchesCriticidade;
  });

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
          <h2 className="text-2xl font-bold">Não Conformidades</h2>
          <p className="text-muted-foreground">Gestão de gaps e planos de ação corretiva</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Não Conformidade
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNC ? 'Editar Não Conformidade' : 'Nova Não Conformidade'}
              </DialogTitle>
              <DialogDescription>
                Registre uma não conformidade identificada durante avaliações
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="identification" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="identification">Identificação</TabsTrigger>
                  <TabsTrigger value="analysis">Análise (5W2H)</TabsTrigger>
                  <TabsTrigger value="impact">Impacto</TabsTrigger>
                  <TabsTrigger value="action">Ação</TabsTrigger>
                </TabsList>
                
                <TabsContent value="identification" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codigo">Código</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Será gerado automaticamente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="requisito_id">Requisito Afetado*</Label>
                      <Select value={formData.requisito_id} onValueChange={(value) => setFormData(prev => ({ ...prev, requisito_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o requisito" />
                        </SelectTrigger>
                        <SelectContent>
                          {requisitos.map(req => (
                            <SelectItem key={req.id} value={req.id}>
                              {req.frameworks_compliance.nome} - {req.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="titulo">Título da Não Conformidade*</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Resumo da não conformidade identificada"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tipo_nao_conformidade">Tipo*</Label>
                      <Select value={formData.tipo_nao_conformidade} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_nao_conformidade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_NAO_CONFORMIDADE.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="origem_identificacao">Origem*</Label>
                      <Select value={formData.origem_identificacao} onValueChange={(value) => setFormData(prev => ({ ...prev, origem_identificacao: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORIGENS_IDENTIFICACAO.map(origem => (
                            <SelectItem key={origem.value} value={origem.value}>
                              {origem.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="criticidade">Criticidade*</Label>
                      <Select value={formData.criticidade} onValueChange={(value) => setFormData(prev => ({ ...prev, criticidade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {CRITICIDADES.map(crit => (
                            <SelectItem key={crit.value} value={crit.value}>
                              {crit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="o_que">O QUE - Descrição da Não Conformidade*</Label>
                    <Textarea
                      id="o_que"
                      value={formData.o_que}
                      onChange={(e) => setFormData(prev => ({ ...prev, o_que: e.target.value }))}
                      placeholder="Descreva detalhadamente o que foi identificado"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="onde">ONDE - Local/Processo</Label>
                      <Input
                        id="onde"
                        value={formData.onde}
                        onChange={(e) => setFormData(prev => ({ ...prev, onde: e.target.value }))}
                        placeholder="Onde a não conformidade foi identificada"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quem">QUEM - Responsável/Envolvido</Label>
                      <Input
                        id="quem"
                        value={formData.quem}
                        onChange={(e) => setFormData(prev => ({ ...prev, quem: e.target.value }))}
                        placeholder="Pessoa ou área responsável"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="por_que">POR QUE - Causa Raiz</Label>
                    <Textarea
                      id="por_que"
                      value={formData.por_que}
                      onChange={(e) => setFormData(prev => ({ ...prev, por_que: e.target.value }))}
                      placeholder="Análise da causa raiz"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="como_identificado">COMO - Método de Identificação</Label>
                      <Input
                        id="como_identificado"
                        value={formData.como_identificado}
                        onChange={(e) => setFormData(prev => ({ ...prev, como_identificado: e.target.value }))}
                        placeholder="Como foi descoberta"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quanto_impacto">QUANTO - Impacto Quantificado</Label>
                      <Input
                        id="quanto_impacto"
                        value={formData.quanto_impacto}
                        onChange={(e) => setFormData(prev => ({ ...prev, quanto_impacto: e.target.value }))}
                        placeholder="Quantificação do impacto"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="impact" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="impacto_operacional">Impacto Operacional (1-5)*</Label>
                      <Select value={formData.impacto_operacional.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, impacto_operacional: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(value => (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="impacto_reputacional">Impacto Reputacional (1-5)*</Label>
                      <Select value={formData.impacto_reputacional.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, impacto_reputacional: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(value => (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="impacto_regulatorio">Impacto Regulatório (1-5)*</Label>
                      <Select value={formData.impacto_regulatorio.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, impacto_regulatorio: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(value => (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="impacto_financeiro">Impacto Financeiro (R$)</Label>
                    <Input
                      id="impacto_financeiro"
                      type="number"
                      step="0.01"
                      value={formData.impacto_financeiro}
                      onChange={(e) => setFormData(prev => ({ ...prev, impacto_financeiro: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="action" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsavel_tratamento">Responsável pelo Tratamento</Label>
                      <Select value={formData.responsavel_tratamento} onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_tratamento: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="prazo_resolucao">Prazo para Resolução</Label>
                      <Input
                        id="prazo_resolucao"
                        type="date"
                        value={formData.prazo_resolucao}
                        onChange={(e) => setFormData(prev => ({ ...prev, prazo_resolucao: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="acoes_imediatas_tomadas">Ações Imediatas Tomadas</Label>
                    <Textarea
                      id="acoes_imediatas_tomadas"
                      value={formData.acoes_imediatas_tomadas}
                      onChange={(e) => setFormData(prev => ({ ...prev, acoes_imediatas_tomadas: e.target.value }))}
                      placeholder="Descreva as ações imediatas já implementadas"
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingNC ? 'Atualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar não conformidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterCriticidade} onValueChange={setFilterCriticidade}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por criticidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as criticidades</SelectItem>
            {CRITICIDADES.map(crit => (
              <SelectItem key={crit.value} value={crit.value}>
                {crit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Não Conformidades */}
      <div className="space-y-4">
        {filteredNonConformities.map(nc => {
          const daysToDeadline = getDaysToDeadline(nc.prazo_resolucao);
          const isOverdue = daysToDeadline !== null && daysToDeadline < 0;
          const isUrgent = daysToDeadline !== null && daysToDeadline <= 7 && daysToDeadline >= 0;
          
          return (
            <Card key={nc.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : isUrgent ? 'border-yellow-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-muted-foreground">{nc.codigo}</span>
                      <Badge className={getCriticalityColor(nc.criticidade)}>
                        {CRITICIDADES.find(c => c.value === nc.criticidade)?.label}
                      </Badge>
                      <Badge className={getStatusColor(nc.status)}>
                        {STATUS_OPTIONS.find(s => s.value === nc.status)?.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{nc.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {nc.framework_nome} • {nc.requisito_nome}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações principais */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{nc.responsavel_nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {nc.prazo_resolucao 
                        ? new Date(nc.prazo_resolucao).toLocaleDateString('pt-BR')
                        : 'Sem prazo'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>Risco: {nc.risco_score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{nc.planos_acao.length} plano(s) de ação</span>
                  </div>
                </div>
                
                {/* Status do prazo */}
                {daysToDeadline !== null && (
                  <div className={`flex items-center gap-2 text-sm ${
                    isOverdue ? 'text-red-600' : isUrgent ? 'text-yellow-600' : 'text-muted-foreground'
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span>
                      {isOverdue 
                        ? `${Math.abs(daysToDeadline)} dias atrasado`
                        : daysToDeadline === 0
                        ? 'Vence hoje'
                        : `${daysToDeadline} dias restantes`
                      }
                    </span>
                  </div>
                )}
                
                {/* Progresso dos planos de ação */}
                {nc.planos_acao.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progresso dos Planos de Ação</span>
                      <span>
                        {Math.round(nc.planos_acao.reduce((acc, pa) => acc + (pa.percentual_conclusao || 0), 0) / nc.planos_acao.length)}%
                      </span>
                    </div>
                    <Progress 
                      value={nc.planos_acao.reduce((acc, pa) => acc + (pa.percentual_conclusao || 0), 0) / nc.planos_acao.length} 
                      className="h-2" 
                    />
                  </div>
                )}
                
                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(nc)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Detalhes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(nc)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-3 w-3 mr-1" />
                    Planos de Ação
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredNonConformities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterStatus || filterCriticidade 
                ? 'Nenhuma não conformidade encontrada com os filtros aplicados.'
                : 'Nenhuma não conformidade registrada ainda.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Não Conformidade</DialogTitle>
            <DialogDescription>
              {selectedNC?.codigo} - {selectedNC?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNC && (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="analysis">Análise 5W2H</TabsTrigger>
                  <TabsTrigger value="actions">Planos de Ação</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Framework</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.framework_nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Requisito</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.requisito_nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Criticidade</Label>
                      <Badge className={getCriticalityColor(selectedNC.criticidade)}>
                        {CRITICIDADES.find(c => c.value === selectedNC.criticidade)?.label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusColor(selectedNC.status)}>
                        {STATUS_OPTIONS.find(s => s.value === selectedNC.status)?.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Impacto Operacional</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.impacto_operacional}/5</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Impacto Reputacional</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.impacto_reputacional}/5</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Impacto Regulatório</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.impacto_regulatorio}/5</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Score de Risco</Label>
                      <p className="text-sm font-semibold text-red-600">{selectedNC.risco_score}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium">O QUE - Descrição</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedNC.o_que}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ONDE - Local</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.onde || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">QUEM - Responsável</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.quem || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">POR QUE - Causa Raiz</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedNC.por_que || 'Não informado'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">COMO - Identificação</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.como_identificado || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">QUANTO - Impacto</Label>
                      <p className="text-sm text-muted-foreground">{selectedNC.quanto_impacto || 'Não informado'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4 mt-4">
                  {selectedNC.planos_acao.length > 0 ? (
                    <div className="space-y-3">
                      {selectedNC.planos_acao.map(plano => (
                        <Card key={plano.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{plano.titulo}</h4>
                            <Badge className={getStatusColor(plano.status)}>
                              {STATUS_OPTIONS.find(s => s.value === plano.status)?.label || plano.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Progresso</span>
                            <span className="text-sm font-medium">{plano.percentual_conclusao}%</span>
                          </div>
                          <Progress value={plano.percentual_conclusao} className="h-2 mt-1" />
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Nenhum plano de ação criado ainda.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NonConformitiesManagement;