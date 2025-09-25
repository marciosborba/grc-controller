import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Users, 
  Search, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Save,
  X,
  Shield,
  Scale,
  Eye,
  Target,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface InvestigationPlan {
  id: string;
  ethics_report_id: string;
  investigation_type: string;
  investigation_scope: string;
  investigation_objectives: string;
  estimated_duration_days: number;
  planned_start_date: string;
  planned_completion_date: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  assigned_investigator_id?: string;
  external_investigator_firm?: string;
  external_investigator_contact?: string;
  budget_allocated?: number;
  budget_consumed?: number;
  investigation_methodology: string;
  evidence_preservation_plan: string;
  witness_interview_plan: string;
  document_review_plan: string;
  expert_consultation_plan: string;
  risk_assessment: string;
  confidentiality_requirements: string;
  legal_considerations: string;
  regulatory_implications: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InvestigationPlanManagerProps {
  reportId?: string;
  onUpdate?: () => void;
}

const InvestigationPlanManager: React.FC<InvestigationPlanManagerProps> = ({ reportId, onUpdate }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<InvestigationPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestigationPlan | null>(null);
  const [formData, setFormData] = useState<Partial<InvestigationPlan>>({
    investigation_type: 'preliminary',
    status: 'planning'
  });

  useEffect(() => {
    if (user && (user.tenantId || user.isPlatformAdmin)) {
      fetchInvestigationPlans();
    }
  }, [reportId, user]);

  const fetchInvestigationPlans = async () => {
    if (!user?.tenantId && !user?.isPlatformAdmin) {
      setIsLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from('ethics_investigation_plans')
        .select('*, ethics_reports(title, protocol_number)');
      
      if (reportId) {
        query = query.eq('ethics_report_id', reportId);
      } else if (!user.isPlatformAdmin && user.tenantId) {
        query = query.eq('tenant_id', user.tenantId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching investigation plans:', error);
      toast.error('Erro ao carregar planos de investigação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.investigation_scope || !formData.investigation_objectives) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const planData = {
        ...formData,
        ethics_report_id: reportId,
        tenant_id: user?.tenant_id,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('ethics_investigation_plans')
          .update(planData)
          .eq('id', editingPlan.id);
        
        if (error) throw error;
        toast.success('Plano de investigação atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('ethics_investigation_plans')
          .insert(planData);
        
        if (error) throw error;
        toast.success('Plano de investigação criado com sucesso');
      }

      setIsCreateDialogOpen(false);
      setEditingPlan(null);
      setFormData({ investigation_type: 'preliminary', status: 'planning' });
      fetchInvestigationPlans();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving investigation plan:', error);
      toast.error('Erro ao salvar plano de investigação');
    }
  };

  const handleEdit = (plan: InvestigationPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setIsCreateDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planning': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      'approved': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'active': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'suspended': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
      'completed': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      'cancelled': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'preliminary': <Search className="h-4 w-4" />,
      'full': <FileText className="h-4 w-4" />,
      'external': <Users className="h-4 w-4" />,
      'legal': <Scale className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <Eye className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando planos de investigação...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Planos de Investigação</h3>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano de Investigação' : 'Novo Plano de Investigação'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="methodology">Metodologia</TabsTrigger>
                <TabsTrigger value="resources">Recursos</TabsTrigger>
                <TabsTrigger value="legal">Legal/Regulatório</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="investigation_type">Tipo de Investigação</Label>
                    <Select 
                      value={formData.investigation_type} 
                      onValueChange={(value) => setFormData({...formData, investigation_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preliminary">Preliminar</SelectItem>
                        <SelectItem value="full">Completa</SelectItem>
                        <SelectItem value="external">Externa</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planejamento</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="planned_start_date">Data de Início Planejada</Label>
                    <Input
                      id="planned_start_date"
                      type="date"
                      value={formData.planned_start_date}
                      onChange={(e) => setFormData({...formData, planned_start_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimated_duration_days">Duração Estimada (dias)</Label>
                    <Input
                      id="estimated_duration_days"
                      type="number"
                      value={formData.estimated_duration_days}
                      onChange={(e) => setFormData({...formData, estimated_duration_days: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="investigation_scope">Escopo da Investigação *</Label>
                  <Textarea
                    id="investigation_scope"
                    value={formData.investigation_scope}
                    onChange={(e) => setFormData({...formData, investigation_scope: e.target.value})}
                    rows={3}
                    placeholder="Descreva o escopo detalhado da investigação..."
                  />
                </div>

                <div>
                  <Label htmlFor="investigation_objectives">Objetivos da Investigação *</Label>
                  <Textarea
                    id="investigation_objectives"
                    value={formData.investigation_objectives}
                    onChange={(e) => setFormData({...formData, investigation_objectives: e.target.value})}
                    rows={3}
                    placeholder="Defina os objetivos claros e mensuráveis..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="methodology" className="space-y-4">
                <div>
                  <Label htmlFor="investigation_methodology">Metodologia de Investigação</Label>
                  <Textarea
                    id="investigation_methodology"
                    value={formData.investigation_methodology}
                    onChange={(e) => setFormData({...formData, investigation_methodology: e.target.value})}
                    rows={4}
                    placeholder="Descreva a metodologia e abordagem da investigação..."
                  />
                </div>

                <div>
                  <Label htmlFor="evidence_preservation_plan">Plano de Preservação de Evidências</Label>
                  <Textarea
                    id="evidence_preservation_plan"
                    value={formData.evidence_preservation_plan}
                    onChange={(e) => setFormData({...formData, evidence_preservation_plan: e.target.value})}
                    rows={3}
                    placeholder="Como as evidências serão preservadas e documentadas..."
                  />
                </div>

                <div>
                  <Label htmlFor="witness_interview_plan">Plano de Entrevistas</Label>
                  <Textarea
                    id="witness_interview_plan"
                    value={formData.witness_interview_plan}
                    onChange={(e) => setFormData({...formData, witness_interview_plan: e.target.value})}
                    rows={3}
                    placeholder="Estratégia para identificação e entrevista de testemunhas..."
                  />
                </div>

                <div>
                  <Label htmlFor="document_review_plan">Plano de Revisão de Documentos</Label>
                  <Textarea
                    id="document_review_plan"
                    value={formData.document_review_plan}
                    onChange={(e) => setFormData({...formData, document_review_plan: e.target.value})}
                    rows={3}
                    placeholder="Como documentos relevantes serão identificados e analisados..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_allocated">Orçamento Alocado (R$)</Label>
                    <Input
                      id="budget_allocated"
                      type="number"
                      step="0.01"
                      value={formData.budget_allocated}
                      onChange={(e) => setFormData({...formData, budget_allocated: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="budget_consumed">Orçamento Consumido (R$)</Label>
                    <Input
                      id="budget_consumed"
                      type="number"
                      step="0.01"
                      value={formData.budget_consumed}
                      onChange={(e) => setFormData({...formData, budget_consumed: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="external_investigator_firm">Empresa de Investigação Externa</Label>
                  <Input
                    id="external_investigator_firm"
                    value={formData.external_investigator_firm}
                    onChange={(e) => setFormData({...formData, external_investigator_firm: e.target.value})}
                    placeholder="Nome da empresa contratada (se aplicável)"
                  />
                </div>

                <div>
                  <Label htmlFor="external_investigator_contact">Contato do Investigador Externo</Label>
                  <Input
                    id="external_investigator_contact"
                    value={formData.external_investigator_contact}
                    onChange={(e) => setFormData({...formData, external_investigator_contact: e.target.value})}
                    placeholder="Informações de contato"
                  />
                </div>

                <div>
                  <Label htmlFor="expert_consultation_plan">Plano de Consultoria Especializada</Label>
                  <Textarea
                    id="expert_consultation_plan"
                    value={formData.expert_consultation_plan}
                    onChange={(e) => setFormData({...formData, expert_consultation_plan: e.target.value})}
                    rows={3}
                    placeholder="Especialistas ou consultores necessários..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="legal" className="space-y-4">
                <div>
                  <Label htmlFor="legal_considerations">Considerações Legais</Label>
                  <Textarea
                    id="legal_considerations"
                    value={formData.legal_considerations}
                    onChange={(e) => setFormData({...formData, legal_considerations: e.target.value})}
                    rows={3}
                    placeholder="Questões legais relevantes e considerações..."
                  />
                </div>

                <div>
                  <Label htmlFor="regulatory_implications">Implicações Regulatórias</Label>
                  <Textarea
                    id="regulatory_implications"
                    value={formData.regulatory_implications}
                    onChange={(e) => setFormData({...formData, regulatory_implications: e.target.value})}
                    rows={3}
                    placeholder="Requisitos regulatórios e possíveis implicações..."
                  />
                </div>

                <div>
                  <Label htmlFor="confidentiality_requirements">Requisitos de Confidencialidade</Label>
                  <Textarea
                    id="confidentiality_requirements"
                    value={formData.confidentiality_requirements}
                    onChange={(e) => setFormData({...formData, confidentiality_requirements: e.target.value})}
                    rows={3}
                    placeholder="Medidas de confidencialidade e proteção de dados..."
                  />
                </div>

                <div>
                  <Label htmlFor="risk_assessment">Avaliação de Riscos</Label>
                  <Textarea
                    id="risk_assessment"
                    value={formData.risk_assessment}
                    onChange={(e) => setFormData({...formData, risk_assessment: e.target.value})}
                    rows={3}
                    placeholder="Riscos identificados e estratégias de mitigação..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum plano de investigação criado ainda.</p>
            <p>Clique em "Novo Plano" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(plan.investigation_type)}
                    <div>
                      <CardTitle className="text-lg">
                        {plan.investigation_type === 'preliminary' ? 'Investigação Preliminar' :
                         plan.investigation_type === 'full' ? 'Investigação Completa' :
                         plan.investigation_type === 'external' ? 'Investigação Externa' :
                         plan.investigation_type === 'legal' ? 'Investigação Legal' :
                         plan.investigation_type}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Criado em {format(new Date(plan.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(plan.status)}`}>
                      {plan.status === 'planning' ? 'Planejamento' :
                       plan.status === 'approved' ? 'Aprovado' :
                       plan.status === 'active' ? 'Ativo' :
                       plan.status === 'suspended' ? 'Suspenso' :
                       plan.status === 'completed' ? 'Concluído' :
                       plan.status === 'cancelled' ? 'Cancelado' :
                       plan.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {plan.planned_start_date ? 
                        format(new Date(plan.planned_start_date), 'dd/MM/yyyy', { locale: ptBR }) :
                        'Não definida'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{plan.estimated_duration_days || 0} dias</span>
                  </div>
                  {plan.budget_allocated && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">R$ {plan.budget_allocated.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Escopo da Investigação:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {plan.investigation_scope}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Objetivos:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {plan.investigation_objectives}
                    </p>
                  </div>
                  {plan.risk_assessment && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        Avaliação de Riscos:
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {plan.risk_assessment}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestigationPlanManager;