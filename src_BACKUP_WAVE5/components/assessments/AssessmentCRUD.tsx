import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CalendarIcon, Plus, Edit, Trash2, Save, X, FileText, Users, Target, Clock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useAssessmentGovernance } from '@/hooks/useAssessmentGovernance';

interface Assessment {
  id?: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  framework_id: string;
  area_avaliada?: string;
  unidade_organizacional?: string;
  escopo?: string;
  objetivos?: string[];
  data_inicio?: Date;
  data_fim_planejada?: Date;
  responsavel_assessment?: string;
  coordenador_assessment?: string;
  status: string;
  fase_atual: string;
}

interface Framework {
  id: string;
  nome: string;
  tipo_framework: string;
}

export default function AssessmentCRUD() {
  const { user, effectiveTenantId } = useAuth();
  const { logAuditAction } = useAssessmentGovernance();
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Assessment>>({
    codigo: '',
    titulo: '',
    descricao: '',
    framework_id: '',
    area_avaliada: '',
    unidade_organizacional: '',
    escopo: '',
    objetivos: [],
    status: 'draft',
    fase_atual: 'preparacao'
  });

  // Carregar dados
  useEffect(() => {
    loadData();
  }, [effectiveTenantId]);

  const loadData = async () => {
    if (!effectiveTenantId) return;
    
    setLoading(true);
    try {
      const [assessmentsResult, frameworksResult] = await Promise.all([
        supabase
          .from('assessments')
          .select('*')
          .eq('tenant_id', effectiveTenantId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('assessment_frameworks')
          .select('id, nome, tipo_framework')
          .eq('tenant_id', effectiveTenantId)
          .eq('status', 'ativo')
      ]);

      if (assessmentsResult.data) setAssessments(assessmentsResult.data);
      if (frameworksResult.data) setFrameworks(frameworksResult.data);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Abrir dialog para criação/edição
  const openDialog = (assessment?: Assessment) => {
    if (assessment) {
      setEditingAssessment(assessment);
      setFormData({
        ...assessment,
        objetivos: assessment.objetivos || []
      });
    } else {
      setEditingAssessment(null);
      setFormData({
        codigo: generateCode(),
        titulo: '',
        descricao: '',
        framework_id: '',
        area_avaliada: '',
        unidade_organizacional: '',
        escopo: '',
        objetivos: [],
        status: 'draft',
        fase_atual: 'preparacao'
      });
    }
    setIsDialogOpen(true);
  };

  // Gerar código automático
  const generateCode = () => {
    const year = new Date().getFullYear();
    const count = assessments.length + 1;
    return `ASS-${year}-${count.toString().padStart(3, '0')}`;
  };

  // Salvar assessment
  const handleSave = async () => {
    if (!effectiveTenantId || !user) return;

    if (!formData.titulo || !formData.framework_id) {
      toast.error('Título e Framework são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const assessmentData = {
        ...formData,
        tenant_id: effectiveTenantId,
        responsavel_assessment: formData.responsavel_assessment || user.id,
        created_by: user.id,
        updated_by: user.id
      };

      if (editingAssessment) {
        // Atualizar
        const { error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', editingAssessment.id)
          .eq('tenant_id', effectiveTenantId);

        if (error) throw error;

        await logAuditAction(editingAssessment.id!, 'updated', {
          old_values: editingAssessment,
          new_values: assessmentData
        });

        toast.success('Assessment atualizado com sucesso');
      } else {
        // Criar
        const { data, error } = await supabase
          .from('assessments')
          .insert([assessmentData])
          .select()
          .single();

        if (error) throw error;

        await logAuditAction(data.id, 'created', {
          new_values: assessmentData
        });

        toast.success('Assessment criado com sucesso');
      }

      setIsDialogOpen(false);
      await loadData();
      
    } catch (error) {
      console.error('Erro ao salvar assessment:', error);
      toast.error('Erro ao salvar assessment');
    } finally {
      setLoading(false);
    }
  };

  // Excluir assessment
  const handleDelete = async (assessment: Assessment) => {
    if (!window.confirm(`Tem certeza que deseja excluir o assessment "${assessment.titulo}"?`)) {
      return;
    }

    if (!effectiveTenantId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessment.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      await logAuditAction(assessment.id!, 'deleted', {
        old_values: assessment
      });

      toast.success('Assessment excluído com sucesso');
      await loadData();
      
    } catch (error) {
      console.error('Erro ao excluir assessment:', error);
      toast.error('Erro ao excluir assessment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'planejado': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'em_revisao': 'bg-orange-100 text-orange-800',
      'revisado': 'bg-purple-100 text-purple-800',
      'concluido': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800',
      'suspenso': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      'preparacao': 'bg-blue-50 text-blue-700',
      'planejamento': 'bg-indigo-50 text-indigo-700',
      'coleta_dados': 'bg-yellow-50 text-yellow-700',
      'analise': 'bg-orange-50 text-orange-700',
      'revisao': 'bg-purple-50 text-purple-700',
      'aprovacao': 'bg-green-50 text-green-700',
      'relatorio': 'bg-teal-50 text-teal-700',
      'followup': 'bg-gray-50 text-gray-700'
    };
    return colors[phase] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Assessments</h2>
          <p className="text-muted-foreground">Criação, edição e gerenciamento completo de assessments</p>
        </div>
        <Button onClick={() => openDialog()} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Assessment
        </Button>
      </div>

      {/* Lista de Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments ({assessments.length})</CardTitle>
          <CardDescription>
            Lista completa de assessments com opções de CRUD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum assessment encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{assessment.titulo}</h3>
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPhaseColor(assessment.fase_atual)}>
                          {assessment.fase_atual.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Código: {assessment.codigo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span>Framework: {frameworks.find(f => f.id === assessment.framework_id)?.nome || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Área: {assessment.area_avaliada || 'Não definida'}</span>
                        </div>
                      </div>
                      
                      {assessment.descricao && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {assessment.descricao}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openDialog(assessment)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(assessment)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAssessment ? 'Editar Assessment' : 'Novo Assessment'}
            </DialogTitle>
            <DialogDescription>
              {editingAssessment 
                ? 'Edite as informações do assessment' 
                : 'Preencha as informações para criar um novo assessment'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: ASS-2025-001"
              />
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <Label>Framework *</Label>
              <Select 
                value={formData.framework_id} 
                onValueChange={(value) => setFormData({ ...formData, framework_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((framework) => (
                    <SelectItem key={framework.id} value={framework.id}>
                      {framework.nome} ({framework.tipo_framework})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Avaliação ISO 27001 - Departamento de TI"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o objetivo e escopo do assessment"
                rows={3}
              />
            </div>

            {/* Área Avaliada */}
            <div className="space-y-2">
              <Label htmlFor="area_avaliada">Área Avaliada</Label>
              <Input
                id="area_avaliada"
                value={formData.area_avaliada}
                onChange={(e) => setFormData({ ...formData, area_avaliada: e.target.value })}
                placeholder="Ex: Tecnologia da Informação"
              />
            </div>

            {/* Unidade Organizacional */}
            <div className="space-y-2">
              <Label htmlFor="unidade_organizacional">Unidade Organizacional</Label>
              <Input
                id="unidade_organizacional"
                value={formData.unidade_organizacional}
                onChange={(e) => setFormData({ ...formData, unidade_organizacional: e.target.value })}
                placeholder="Ex: Diretoria de TI"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="em_revisao">Em Revisão</SelectItem>
                  <SelectItem value="revisado">Revisado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fase Atual */}
            <div className="space-y-2">
              <Label>Fase Atual</Label>
              <Select 
                value={formData.fase_atual} 
                onValueChange={(value) => setFormData({ ...formData, fase_atual: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparacao">Preparação</SelectItem>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="coleta_dados">Coleta de Dados</SelectItem>
                  <SelectItem value="analise">Análise</SelectItem>
                  <SelectItem value="revisao">Revisão</SelectItem>
                  <SelectItem value="aprovacao">Aprovação</SelectItem>
                  <SelectItem value="relatorio">Relatório</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {editingAssessment ? 'Salvar Alterações' : 'Criar Assessment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}