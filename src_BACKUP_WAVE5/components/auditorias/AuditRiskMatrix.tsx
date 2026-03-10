import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  Filter,
  Download,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { sanitizeInput, sanitizeObject, secureLog, auditLog } from '@/utils/securityLogger';

interface AuditRiskAssessment {
  id: string;
  risk_code: string;
  risk_title: string;
  risk_description?: string;
  risk_category: string;
  inherent_probability: number;
  inherent_impact: number;
  inherent_risk_score: number;
  control_effectiveness: 'inadequate' | 'partial' | 'adequate' | 'strong';
  control_frequency: 'manual' | 'automated' | 'continuous';
  control_testing_results?: 'effective' | 'ineffective' | 'not_tested';
  residual_probability: number;
  residual_impact: number;
  residual_risk_score: number;
  audit_priority: string;
  recommended_audit_frequency: number;
  assessment_date: string;
  status: 'draft' | 'under_review' | 'approved' | 'archived';
  methodology?: string;
  assumptions?: string;
  recommendations?: string;
}

interface MatrixConfig {
  id: string;
  matrix_type: '3x3' | '4x4' | '5x5';
  probability_levels: Array<{
    level: number;
    name: string;
    description: string;
    color: string;
  }>;
  impact_levels: Array<{
    level: number;
    name: string;
    description: string;
    color: string;
  }>;
  risk_levels: Array<{
    level: number;
    name: string;
    min_score: number;
    max_score: number;
    color: string;
    priority: string;
  }>;
}

const riskCategories = [
  'Operacional',
  'Financeiro', 
  'Compliance',
  'Estratégico',
  'Reputacional',
  'Tecnológico',
  'Legal'
];

const controlEffectivenessLabels = {
  inadequate: 'Inadequados',
  partial: 'Parcialmente Eficazes',
  adequate: 'Adequados',
  strong: 'Fortes'
};

const controlFrequencyLabels = {
  manual: 'Manual',
  automated: 'Automatizado',
  continuous: 'Contínuo'
};

export function AuditRiskMatrix() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [assessments, setAssessments] = useState<AuditRiskAssessment[]>([]);
  const [matrixConfig, setMatrixConfig] = useState<MatrixConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AuditRiskAssessment | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  const [formData, setFormData] = useState({
    risk_code: '',
    risk_title: '',
    risk_description: '',
    risk_category: '',
    inherent_probability: 1,
    inherent_impact: 1,
    control_effectiveness: 'inadequate' as const,
    control_frequency: 'manual' as const,
    control_testing_results: 'not_tested' as const,
    residual_probability: 1,
    residual_impact: 1,
    methodology: '',
    assumptions: '',
    recommendations: ''
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar configuração da matriz
      const { data: matrixData, error: matrixError } = await supabase
        .from('audit_risk_matrix_config')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('is_active', true)
        .single();

      if (matrixError && matrixError.code !== 'PGRST116') {
        console.error('Erro ao carregar matriz:', matrixError);
        toast.error('Erro ao carregar configuração da matriz de risco');
      } else {
        setMatrixConfig(matrixData);
      }

      // Carregar avaliações de risco
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('audit_risk_assessments')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('residual_risk_score', { ascending: false });

      if (assessmentsError) {
        console.error('Erro ao carregar avaliações:', assessmentsError);
        toast.error('Erro ao carregar avaliações de risco');
      } else {
        setAssessments(assessmentsData || []);
      }

    } catch (error) {
      console.error('Erro geral:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const sanitizedData = sanitizeObject({
        tenant_id: effectiveTenantId,
        assessor_id: user?.id,
        ...formData,
        status: 'draft'
      });

      let result;
      if (selectedAssessment) {
        result = await supabase
          .from('audit_risk_assessments')
          .update({
            ...sanitizedData,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedAssessment.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('audit_risk_assessments')
          .insert({
            ...sanitizedData,
            created_by: user?.id
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erro ao salvar:', result.error);
        toast.error('Erro ao salvar avaliação de risco');
        return;
      }

      toast.success(selectedAssessment ? 'Avaliação atualizada!' : 'Avaliação criada!');
      setDialogOpen(false);
      resetForm();
      loadData();

      auditLog('audit_risk_assessment', selectedAssessment ? 'update' : 'create', {
        assessment_id: result.data.id,
        risk_code: formData.risk_code,
        user_id: user?.id,
        tenant_id: effectiveTenantId
      });

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar avaliação');
    }
  };

  const resetForm = () => {
    setFormData({
      risk_code: '',
      risk_title: '',
      risk_description: '',
      risk_category: '',
      inherent_probability: 1,
      inherent_impact: 1,
      control_effectiveness: 'inadequate',
      control_frequency: 'manual',
      control_testing_results: 'not_tested',
      residual_probability: 1,
      residual_impact: 1,
      methodology: '',
      assumptions: '',
      recommendations: ''
    });
    setSelectedAssessment(null);
  };

  const openEditDialog = (assessment: AuditRiskAssessment) => {
    setSelectedAssessment(assessment);
    setFormData({
      risk_code: assessment.risk_code,
      risk_title: assessment.risk_title,
      risk_description: assessment.risk_description || '',
      risk_category: assessment.risk_category,
      inherent_probability: assessment.inherent_probability,
      inherent_impact: assessment.inherent_impact,
      control_effectiveness: assessment.control_effectiveness,
      control_frequency: assessment.control_frequency,
      control_testing_results: assessment.control_testing_results || 'not_tested',
      residual_probability: assessment.residual_probability,
      residual_impact: assessment.residual_impact,
      methodology: assessment.methodology || '',
      assumptions: assessment.assumptions || '',
      recommendations: assessment.recommendations || ''
    });
    setDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'crítica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'média': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getControlColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'strong': return 'bg-green-100 text-green-800';
      case 'adequate': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'inadequate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const categoryMatch = !filterCategory || filterCategory === 'all' || assessment.risk_category === filterCategory;
      const priorityMatch = !filterPriority || filterPriority === 'all' || assessment.audit_priority === filterPriority;
      return categoryMatch && priorityMatch;
    });
  }, [assessments, filterCategory, filterPriority]);

  const riskStats = useMemo(() => {
    return {
      total: assessments.length,
      critica: assessments.filter(a => a.audit_priority === 'crítica').length,
      alta: assessments.filter(a => a.audit_priority === 'alta').length,
      media: assessments.filter(a => a.audit_priority === 'média').length,
      baixa: assessments.filter(a => a.audit_priority === 'baixa').length,
      avg_residual_score: assessments.length > 0 ? 
        Math.round(assessments.reduce((sum, a) => sum + a.residual_risk_score, 0) / assessments.length) : 0
    };
  }, [assessments]);

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{riskStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Crítico</p>
                <p className="text-2xl font-bold text-red-600">{riskStats.critica}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Alto</p>
                <p className="text-2xl font-bold text-orange-600">{riskStats.alta}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Médio</p>
                <p className="text-2xl font-bold text-yellow-600">{riskStats.media}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Baixo</p>
                <p className="text-2xl font-bold text-blue-600">{riskStats.baixa}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold text-purple-600">{riskStats.avg_residual_score}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Matriz de Risco de Auditoria</CardTitle>
              <CardDescription>
                Avaliação e priorização de riscos para planejamento de auditoria
                {matrixConfig && ` - Matriz ${matrixConfig.matrix_type}`}
              </CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label>Categoria</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {riskCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label>Prioridade</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="crítica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="muito_baixa">Muito Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Avaliações */}
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="border-l-4" style={{borderLeftColor: assessment.residual_risk_score >= 16 ? '#ef4444' : assessment.residual_risk_score >= 10 ? '#f97316' : assessment.residual_risk_score >= 5 ? '#eab308' : '#22c55e'}}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{assessment.risk_code}</Badge>
                        <Badge className={getPriorityColor(assessment.audit_priority)}>
                          {assessment.audit_priority.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">{assessment.risk_category}</Badge>
                        <Badge className={getControlColor(assessment.control_effectiveness)}>
                          {controlEffectivenessLabels[assessment.control_effectiveness]}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{assessment.risk_title}</h3>
                      {assessment.risk_description && (
                        <p className="text-muted-foreground mb-3">{assessment.risk_description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Risco Inerente:</span>
                          <span className="ml-2">{assessment.inherent_risk_score}/25</span>
                        </div>
                        <div>
                          <span className="font-medium">Risco Residual:</span>
                          <span className="ml-2">{assessment.residual_risk_score}/25</span>
                        </div>
                        <div>
                          <span className="font-medium">Freq. Auditoria:</span>
                          <span className="ml-2">{assessment.recommended_audit_frequency} meses</span>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <Badge variant="outline" className="ml-2">{assessment.status}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(assessment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredAssessments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma avaliação de risco encontrada.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Nova/Editar Avaliação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAssessment ? 'Editar' : 'Nova'} Avaliação de Risco
            </DialogTitle>
            <DialogDescription>
              Avalie o risco inerente e residual considerando os controles existentes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Identificação do Risco */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Código do Risco *</Label>
                <Input
                  value={formData.risk_code}
                  onChange={(e) => setFormData(prev => ({...prev, risk_code: sanitizeInput(e.target.value)}))}
                  placeholder="AR-XXX-001"
                />
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select value={formData.risk_category} onValueChange={(value) => setFormData(prev => ({...prev, risk_category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Título do Risco *</Label>
              <Input
                value={formData.risk_title}
                onChange={(e) => setFormData(prev => ({...prev, risk_title: sanitizeInput(e.target.value)}))}
                placeholder="Título descritivo do risco"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.risk_description}
                onChange={(e) => setFormData(prev => ({...prev, risk_description: sanitizeInput(e.target.value)}))}
                placeholder="Descrição detalhada do risco..."
                rows={3}
              />
            </div>

            {/* Avaliação de Risco Inerente */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Risco Inerente (antes dos controles)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Probabilidade (1-5)</Label>
                  <Select value={formData.inherent_probability.toString()} onValueChange={(value) => setFormData(prev => ({...prev, inherent_probability: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {matrixConfig?.probability_levels?.map(level => (
                        <SelectItem key={level.level} value={level.level.toString()}>
                          {level.level} - {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Impacto (1-5)</Label>
                  <Select value={formData.inherent_impact.toString()} onValueChange={(value) => setFormData(prev => ({...prev, inherent_impact: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {matrixConfig?.impact_levels?.map(level => (
                        <SelectItem key={level.level} value={level.level.toString()}>
                          {level.level} - {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Score Inerente: <span className="font-semibold">{formData.inherent_probability * formData.inherent_impact}/25</span>
              </div>
            </div>

            {/* Avaliação dos Controles */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Controles Existentes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Eficácia dos Controles</Label>
                  <Select value={formData.control_effectiveness} onValueChange={(value) => setFormData(prev => ({...prev, control_effectiveness: value as any}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(controlEffectivenessLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequência dos Controles</Label>
                  <Select value={formData.control_frequency} onValueChange={(value) => setFormData(prev => ({...prev, control_frequency: value as any}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(controlFrequencyLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Resultado dos Testes</Label>
                  <Select value={formData.control_testing_results} onValueChange={(value) => setFormData(prev => ({...prev, control_testing_results: value as any}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Não testado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_tested">Não testado</SelectItem>
                      <SelectItem value="effective">Eficaz</SelectItem>
                      <SelectItem value="ineffective">Ineficaz</SelectItem>
                      <SelectItem value="not_tested">Não Testado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Avaliação de Risco Residual */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Risco Residual (após controles)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Probabilidade (1-5)</Label>
                  <Select value={formData.residual_probability.toString()} onValueChange={(value) => setFormData(prev => ({...prev, residual_probability: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {matrixConfig?.probability_levels?.map(level => (
                        <SelectItem key={level.level} value={level.level.toString()}>
                          {level.level} - {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Impacto (1-5)</Label>
                  <Select value={formData.residual_impact.toString()} onValueChange={(value) => setFormData(prev => ({...prev, residual_impact: parseInt(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {matrixConfig?.impact_levels?.map(level => (
                        <SelectItem key={level.level} value={level.level.toString()}>
                          {level.level} - {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Score Residual: </span>
                <span className="font-semibold">{formData.residual_probability * formData.residual_impact}/25</span>
                <span className="ml-4 text-muted-foreground">Prioridade: </span>
                <Badge className={getPriorityColor(
                  formData.residual_probability * formData.residual_impact >= 21 ? 'crítica' :
                  formData.residual_probability * formData.residual_impact >= 16 ? 'alta' :
                  formData.residual_probability * formData.residual_impact >= 10 ? 'média' :
                  formData.residual_probability * formData.residual_impact >= 5 ? 'baixa' : 'muito_baixa'
                )}>
                  {formData.residual_probability * formData.residual_impact >= 21 ? 'CRÍTICA' :
                   formData.residual_probability * formData.residual_impact >= 16 ? 'ALTA' :
                   formData.residual_probability * formData.residual_impact >= 10 ? 'MÉDIA' :
                   formData.residual_probability * formData.residual_impact >= 5 ? 'BAIXA' : 'MUITO BAIXA'}
                </Badge>
              </div>
            </div>

            {/* Metodologia e Observações */}
            <div className="space-y-4">
              <div>
                <Label>Metodologia</Label>
                <Textarea
                  value={formData.methodology}
                  onChange={(e) => setFormData(prev => ({...prev, methodology: sanitizeInput(e.target.value)}))}
                  placeholder="Metodologia utilizada para avaliação..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Pressupostos</Label>
                <Textarea
                  value={formData.assumptions}
                  onChange={(e) => setFormData(prev => ({...prev, assumptions: sanitizeInput(e.target.value)}))}
                  placeholder="Pressupostos considerados..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Recomendações</Label>
                <Textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData(prev => ({...prev, recommendations: sanitizeInput(e.target.value)}))}
                  placeholder="Recomendações para tratamento do risco..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {selectedAssessment ? 'Atualizar' : 'Criar'} Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}