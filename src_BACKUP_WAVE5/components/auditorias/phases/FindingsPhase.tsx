import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Target,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureLog } from '@/utils/securityLogger';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Finding {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  criticidade: 'baixa' | 'media' | 'alta' | 'critica';
  categoria: 'controle_interno' | 'compliance' | 'operacional' | 'financeiro' | 'ti' | 'risco';
  status: 'identificado' | 'validado' | 'comunicado' | 'aceito' | 'rejeitado';
  causa_raiz: string;
  impacto: string;
  recomendacao: string;
  responsavel_area: string;
  data_identificacao: string;
  data_comunicacao?: string;
  evidencias: string[];
  trabalho_origem: string;
  valor_impacto?: number;
  probabilidade_ocorrencia: 'baixa' | 'media' | 'alta';
}

interface FindingsSummary {
  total: number;
  por_criticidade: Record<string, number>;
  por_categoria: Record<string, number>;
  por_status: Record<string, number>;
  valor_total_impacto: number;
}

interface FindingsPhaseProps {
  project: any;
}

export function FindingsPhase({ project }: FindingsPhaseProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [findings, setFindings] = useState<Finding[]>([]);
  const [summary, setSummary] = useState<FindingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriticality, setFilterCriticality] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showNewFindingForm, setShowNewFindingForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFinding, setNewFinding] = useState({
    titulo: '',
    descricao: '',
    criticidade: 'media' as const,
    categoria: 'controle_interno' as const,
    causa_raiz: '',
    impacto: '',
    recomendacao: '',
    responsavel_area: '',
    valor_impacto: 0,
    probabilidade_ocorrencia: 'media' as const
  });

  useEffect(() => {
    loadFindings();
  }, [project.id]);

  const loadFindings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('apontamentos_auditoria')
        .select('*')
        .eq('projeto_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const findingsData = data || [];
      setFindings(findingsData);
      
      // Calcular resumo
      const summaryData = calculateSummary(findingsData);
      setSummary(summaryData);

    } catch (error) {
      console.error('Erro ao carregar achados:', error);
      toast.error('Erro ao carregar achados');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (findingsData: Finding[]): FindingsSummary => {
    const total = findingsData.length;
    
    const por_criticidade = findingsData.reduce((acc, f) => {
      acc[f.criticidade] = (acc[f.criticidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const por_categoria = findingsData.reduce((acc, f) => {
      acc[f.categoria] = (acc[f.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const por_status = findingsData.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const valor_total_impacto = findingsData.reduce((sum, f) => sum + (f.valor_impacto || 0), 0);
    
    return {
      total,
      por_criticidade,
      por_categoria,
      por_status,
      valor_total_impacto
    };
  };

  // Funções CRUD
  const createFinding = async () => {
    try {
      setSaving(true);
      
      const findingData = {
        ...newFinding,
        codigo: `ACH-${Date.now()}`,
        projeto_id: project.id,
        tenant_id: effectiveTenantId,
        status: 'identificado',
        data_identificacao: new Date().toISOString(),
        evidencias: [],
        trabalho_origem: null
      };

      const { data, error } = await supabase
        .from('apontamentos_auditoria')
        .insert(findingData)
        .select()
        .single();

      if (error) throw error;

      setFindings(prev => [data, ...prev]);
      setShowNewFindingForm(false);
      resetForm();
      toast.success('Achado criado com sucesso!');
      secureLog('info', 'Achado criado', { findingId: data.id, projectId: project.id });
      
    } catch (error) {
      secureLog('error', 'Erro ao criar achado', error);
      toast.error('Erro ao criar achado');
    } finally {
      setSaving(false);
    }
  };

  const updateFinding = async (findingId: string, updates: Partial<Finding>) => {
    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('apontamentos_auditoria')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', findingId)
        .eq('tenant_id', effectiveTenantId)
        .select()
        .single();

      if (error) throw error;

      setFindings(prev => prev.map(f => f.id === findingId ? data : f));
      toast.success('Achado atualizado com sucesso!');
      secureLog('info', 'Achado atualizado', { findingId, projectId: project.id });
      
    } catch (error) {
      secureLog('error', 'Erro ao atualizar achado', error);
      toast.error('Erro ao atualizar achado');
    } finally {
      setSaving(false);
    }
  };

  const deleteFinding = async (findingId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este achado?')) return;
    
    try {
      const { error } = await supabase
        .from('apontamentos_auditoria')
        .delete()
        .eq('id', findingId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      setFindings(prev => prev.filter(f => f.id !== findingId));
      toast.success('Achado excluído com sucesso!');
      secureLog('info', 'Achado excluído', { findingId, projectId: project.id });
      
    } catch (error) {
      secureLog('error', 'Erro ao excluir achado', error);
      toast.error('Erro ao excluir achado');
    }
  };

  const validateFinding = async (findingId: string) => {
    await updateFinding(findingId, { 
      status: 'validado',
      data_comunicacao: new Date().toISOString()
    });
  };

  const resetForm = () => {
    setNewFinding({
      titulo: '',
      descricao: '',
      criticidade: 'media',
      categoria: 'controle_interno',
      causa_raiz: '',
      impacto: '',
      recomendacao: '',
      responsavel_area: '',
      valor_impacto: 0,
      probabilidade_ocorrencia: 'media'
    });
    setSelectedFinding(null);
  };

  const openEditForm = (finding: Finding) => {
    setSelectedFinding(finding);
    setNewFinding({
      titulo: finding.titulo,
      descricao: finding.descricao,
      criticidade: finding.criticidade,
      categoria: finding.categoria,
      causa_raiz: finding.causa_raiz,
      impacto: finding.impacto,
      recomendacao: finding.recomendacao,
      responsavel_area: finding.responsavel_area,
      valor_impacto: finding.valor_impacto || 0,
      probabilidade_ocorrencia: finding.probabilidade_ocorrencia
    });
    setShowEditForm(true);
  };

  const handleSave = async () => {
    if (selectedFinding) {
      await updateFinding(selectedFinding.id, newFinding);
      setShowEditForm(false);
    } else {
      await createFinding();
    }
    resetForm();
  };

  const getCriticalityColor = (criticality: string) => {
    const colors = {
      baixa: 'bg-muted text-muted-foreground',
      media: 'bg-secondary text-secondary-foreground',
      alta: 'bg-primary/10 text-primary',
      critica: 'bg-destructive/10 text-destructive'
    };
    return colors[criticality] || 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      identificado: 'bg-secondary text-secondary-foreground',
      validado: 'bg-primary/10 text-primary',
      comunicado: 'bg-primary/5 text-primary',
      aceito: 'bg-primary/20 text-primary',
      rejeitado: 'bg-destructive/10 text-destructive'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getCriticalityIcon = (criticality: string) => {
    const icons = {
      baixa: CheckCircle,
      media: AlertTriangle,
      alta: AlertTriangle,
      critica: XCircle
    };
    return icons[criticality] || AlertTriangle;
  };

  const calculateCompleteness = () => {
    if (findings.length === 0) return 0;
    const validated = findings.filter(f => ['validado', 'comunicado', 'aceito'].includes(f.status)).length;
    return Math.round((validated / findings.length) * 100);
  };

  const filteredFindings = findings.filter(finding => {
    const matchesSearch = !searchTerm || 
      finding.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCriticality = filterCriticality === 'all' || finding.criticidade === filterCriticality;
    const matchesStatus = filterStatus === 'all' || finding.status === filterStatus;
    
    return matchesSearch && matchesCriticality && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-6">
      {/* Header com Progresso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Achados da Auditoria
              </CardTitle>
              <CardDescription>
                Identificação, análise e classificação de apontamentos
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completude</p>
                <p className="text-lg font-bold">{completeness}%</p>
              </div>
              <Progress value={completeness} className="w-24 h-3" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo dos Achados */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Achados</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                  <p className="text-2xl font-bold text-destructive">{summary.por_criticidade.critica || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Altos</p>
                  <p className="text-2xl font-bold text-primary">{summary.por_criticidade.alta || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Validados</p>
                  <p className="text-2xl font-bold text-primary">{summary.por_status.validado || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição por Criticidade */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Distribuição por Criticidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['critica', 'alta', 'media', 'baixa'].map(criticality => {
                const count = summary.por_criticidade[criticality] || 0;
                const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
                const CriticalityIcon = getCriticalityIcon(criticality);
                
                return (
                  <div key={criticality} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CriticalityIcon className="h-4 w-4" />
                      <span className="text-sm capitalize">{criticality}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{width: `${percentage}%`}}
                        ></div>
                      </div>
                      <span className="text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar achados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                value={filterCriticality} 
                onChange={(e) => setFilterCriticality(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todas as Criticidades</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Todos os Status</option>
                <option value="identificado">Identificado</option>
                <option value="validado">Validado</option>
                <option value="comunicado">Comunicado</option>
                <option value="aceito">Aceito</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
            </div>
            
            <Button onClick={() => setShowNewFindingForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Achado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Achados */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum achado encontrado</h3>
              <p className="text-muted-foreground">
                {findings.length === 0 
                  ? 'Registre o primeiro achado da auditoria.'
                  : 'Ajuste os filtros para ver outros achados.'
                }
              </p>
              <Button className="mt-4" onClick={() => setShowNewFindingForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Achado
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFindings.map((finding) => {
              const CriticalityIcon = getCriticalityIcon(finding.criticidade);
              return (
                <Card key={finding.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <CriticalityIcon className={`h-5 w-5 mt-1 ${
                          finding.criticidade === 'critica' ? 'text-destructive' :
                          finding.criticidade === 'alta' ? 'text-primary' :
                          finding.criticidade === 'media' ? 'text-primary' :
                          'text-muted-foreground'
                        }`} />
                        <div>
                          <CardTitle className="text-base">{finding.codigo}</CardTitle>
                          <CardDescription className="font-medium">{finding.titulo}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCriticalityColor(finding.criticidade)}>
                          {finding.criticidade}
                        </Badge>
                        <Badge className={getStatusColor(finding.status)}>
                          {finding.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {finding.descricao}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Categoria</p>
                          <p className="font-medium capitalize">{finding.categoria.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Responsável</p>
                          <p className="font-medium">{finding.responsavel_area}</p>
                        </div>
                      </div>
                      
                      {finding.valor_impacto && (
                        <div>
                          <p className="text-sm text-muted-foreground">Impacto Financeiro</p>
                          <p className="text-sm font-medium">
                            R$ {finding.valor_impacto.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedFinding(finding);
                            setShowViewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openEditForm(finding)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {finding.status === 'identificado' && (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => validateFinding(finding.id)}
                            disabled={saving}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Validar
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteFinding(finding.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ações */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${completeness >= 80 ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">
                {completeness >= 80 ? 'Achados validados' : `${completeness}% validado - Valide pelo menos 80% para avançar`}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatório de Achados
              </Button>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Análise de Impacto
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Achado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Criar/Editar Achado */}
      <Dialog open={showNewFindingForm || showEditForm} onOpenChange={(open) => {
        if (!open) {
          setShowNewFindingForm(false);
          setShowEditForm(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFinding ? 'Editar Achado' : 'Novo Achado'}
            </DialogTitle>
            <DialogDescription>
              {selectedFinding ? 'Edite as informações do achado' : 'Registre um novo achado da auditoria'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={newFinding.titulo}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título do achado"
                />
              </div>
              <div>
                <Label htmlFor="responsavel">Responsável da Área *</Label>
                <Input
                  id="responsavel"
                  value={newFinding.responsavel_area}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, responsavel_area: e.target.value }))}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={newFinding.descricao}
                onChange={(e) => setNewFinding(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o achado detalhadamente"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="criticidade">Criticidade</Label>
                <select
                  id="criticidade"
                  value={newFinding.criticidade}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, criticidade: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <select
                  id="categoria"
                  value={newFinding.categoria}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, categoria: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                >
                  <option value="controle_interno">Controle Interno</option>
                  <option value="compliance">Compliance</option>
                  <option value="operacional">Operacional</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="ti">TI</option>
                  <option value="risco">Risco</option>
                </select>
              </div>
              <div>
                <Label htmlFor="probabilidade">Probabilidade</Label>
                <select
                  id="probabilidade"
                  value={newFinding.probabilidade_ocorrencia}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, probabilidade_ocorrencia: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="causa_raiz">Causa Raiz</Label>
              <Textarea
                id="causa_raiz"
                value={newFinding.causa_raiz}
                onChange={(e) => setNewFinding(prev => ({ ...prev, causa_raiz: e.target.value }))}
                placeholder="Identifique a causa raiz do problema"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="impacto">Impacto</Label>
              <Textarea
                id="impacto"
                value={newFinding.impacto}
                onChange={(e) => setNewFinding(prev => ({ ...prev, impacto: e.target.value }))}
                placeholder="Descreva o impacto do achado"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="recomendacao">Recomendação</Label>
              <Textarea
                id="recomendacao"
                value={newFinding.recomendacao}
                onChange={(e) => setNewFinding(prev => ({ ...prev, recomendacao: e.target.value }))}
                placeholder="Recomendações para correção"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="valor_impacto">Valor do Impacto (R$)</Label>
              <Input
                id="valor_impacto"
                type="number"
                value={newFinding.valor_impacto}
                onChange={(e) => setNewFinding(prev => ({ ...prev, valor_impacto: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNewFindingForm(false);
                setShowEditForm(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !newFinding.titulo || !newFinding.descricao}>
              {saving ? 'Salvando...' : selectedFinding ? 'Atualizar' : 'Criar'} Achado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Visualizar Achado */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFinding && (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  {selectedFinding.codigo} - {selectedFinding.titulo}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedFinding && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Criticidade</Label>
                  <Badge className={getCriticalityColor(selectedFinding.criticidade)}>
                    {selectedFinding.criticidade}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedFinding.status)}>
                    {selectedFinding.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm mt-1">{selectedFinding.descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-sm mt-1 capitalize">{selectedFinding.categoria.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Responsável</Label>
                  <p className="text-sm mt-1">{selectedFinding.responsavel_area}</p>
                </div>
              </div>
              
              {selectedFinding.causa_raiz && (
                <div>
                  <Label className="text-sm font-medium">Causa Raiz</Label>
                  <p className="text-sm mt-1">{selectedFinding.causa_raiz}</p>
                </div>
              )}
              
              {selectedFinding.impacto && (
                <div>
                  <Label className="text-sm font-medium">Impacto</Label>
                  <p className="text-sm mt-1">{selectedFinding.impacto}</p>
                </div>
              )}
              
              {selectedFinding.recomendacao && (
                <div>
                  <Label className="text-sm font-medium">Recomendação</Label>
                  <p className="text-sm mt-1">{selectedFinding.recomendacao}</p>
                </div>
              )}
              
              {selectedFinding.valor_impacto && selectedFinding.valor_impacto > 0 && (
                <div>
                  <Label className="text-sm font-medium">Valor do Impacto</Label>
                  <p className="text-sm mt-1 font-medium">
                    R$ {selectedFinding.valor_impacto.toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Fechar
            </Button>
            {selectedFinding && (
              <Button onClick={() => {
                setShowViewDialog(false);
                openEditForm(selectedFinding);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}