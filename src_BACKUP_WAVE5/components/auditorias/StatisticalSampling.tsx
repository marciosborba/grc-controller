import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator,
  Plus,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { sanitizeInput, sanitizeObject, secureLog, auditLog } from '@/utils/securityLogger';

interface SamplingPlan {
  id: string;
  plan_code: string;
  plan_title: string;
  population_description: string;
  population_size: number;
  population_value?: number;
  sampling_method: 'random' | 'systematic' | 'stratified' | 'cluster' | 'mus' | 'haphazard';
  confidence_level: number;
  tolerable_error_rate: number;
  expected_error_rate: number;
  calculated_sample_size: number;
  actual_sample_size: number;
  sampling_interval?: number;
  mus_materiality?: number;
  mus_tolerable_misstatement?: number;
  mus_expected_misstatement?: number;
  status: 'draft' | 'approved' | 'executed' | 'completed';
  methodology_notes?: string;
  limitations?: string;
  conclusions?: string;
  errors_found: number;
  total_error_value: number;
  projected_error?: number;
  upper_error_limit?: number;
  created_at: string;
}

interface SamplingConfig {
  default_confidence_level: number;
  default_tolerable_error_rate: number;
  default_expected_error_rate: number;
  mus_precision_factor: number;
  mus_reliability_factor: number;
  enable_stratification: boolean;
  max_strata: number;
  stratification_threshold: number;
}

const samplingMethods = {
  random: 'Aleatória Simples',
  systematic: 'Sistemática',
  stratified: 'Estratificada',
  cluster: 'Por Conglomerados',
  mus: 'MUS (Unidade Monetária)',
  haphazard: 'Não Estatística'
};

const confidenceLevels = [
  { value: 90.0, label: '90% - Baixa' },
  { value: 95.0, label: '95% - Padrão' },
  { value: 99.0, label: '99% - Alta' }
];

export function StatisticalSampling() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [samplingPlans, setSamplingPlans] = useState<SamplingPlan[]>([]);
  const [samplingConfig, setSamplingConfig] = useState<SamplingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SamplingPlan | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [formData, setFormData] = useState({
    plan_code: '',
    plan_title: '',
    population_description: '',
    population_size: 0,
    population_value: 0,
    sampling_method: 'random' as const,
    confidence_level: 95.0,
    tolerable_error_rate: 5.0,
    expected_error_rate: 1.0,
    mus_materiality: 0,
    mus_tolerable_misstatement: 0,
    mus_expected_misstatement: 0,
    methodology_notes: '',
    limitations: '',
    conclusions: ''
  });

  // Cálculo em tempo real do tamanho da amostra
  const calculatedSampleSize = useMemo(() => {
    if (formData.population_size === 0) return 0;
    
    if (formData.sampling_method === 'mus' && formData.population_value > 0) {
      // Cálculo MUS simplificado
      const reliabilityFactor = formData.confidence_level >= 99 ? 4.61 : formData.confidence_level >= 95 ? 3.00 : 2.31;
      const expansionFactor = formData.mus_expected_misstatement > 0 ? 
        1 + (formData.mus_expected_misstatement / Math.max(formData.mus_tolerable_misstatement, 1)) : 1.0;
      
      const sampleSize = Math.ceil((formData.population_value * reliabilityFactor * expansionFactor) / 
        Math.max(formData.mus_tolerable_misstatement, 1));
      
      return Math.max(50, Math.min(sampleSize, Math.floor(formData.population_size / 10)));
    } else {
      // Cálculo para amostragem aleatória
      const zScore = formData.confidence_level >= 99 ? 2.576 : formData.confidence_level >= 95 ? 1.960 : 1.645;
      const p = formData.expected_error_rate / 100;
      const e = formData.tolerable_error_rate / 100;
      
      const n = Math.pow(zScore, 2) * p * (1 - p) / Math.pow(e, 2);
      const finiteCorrection = n / (1 + ((n - 1) / formData.population_size));
      
      return Math.max(30, Math.ceil(finiteCorrection));
    }
  }, [formData]);

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar configuração de amostragem
      const { data: configData, error: configError } = await supabase
        .from('audit_sampling_configs')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('is_active', true)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Erro ao carregar config:', configError);
      } else if (configData) {
        setSamplingConfig(configData);
        
        // Aplicar configurações padrão no formulário
        setFormData(prev => ({
          ...prev,
          confidence_level: configData.default_confidence_level,
          tolerable_error_rate: configData.default_tolerable_error_rate,
          expected_error_rate: configData.default_expected_error_rate
        }));
      }

      // Carregar planos de amostragem
      const { data: plansData, error: plansError } = await supabase
        .from('audit_sampling_plans')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (plansError) {
        console.error('Erro ao carregar planos:', plansError);
        toast.error('Erro ao carregar planos de amostragem');
      } else {
        setSamplingPlans(plansData || []);
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
        ...formData,
        population_value: formData.sampling_method === 'mus' ? formData.population_value : null,
        mus_materiality: formData.sampling_method === 'mus' ? formData.mus_materiality : null,
        mus_tolerable_misstatement: formData.sampling_method === 'mus' ? formData.mus_tolerable_misstatement : null,
        mus_expected_misstatement: formData.sampling_method === 'mus' ? formData.mus_expected_misstatement : null,
        status: 'draft',
        errors_found: 0,
        total_error_value: 0
      });

      let result;
      if (selectedPlan) {
        result = await supabase
          .from('audit_sampling_plans')
          .update({
            ...sanitizedData,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPlan.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('audit_sampling_plans')
          .insert({
            ...sanitizedData,
            created_by: user?.id
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erro ao salvar:', result.error);
        toast.error('Erro ao salvar plano de amostragem');
        return;
      }

      toast.success(selectedPlan ? 'Plano atualizado!' : 'Plano criado!');
      setDialogOpen(false);
      resetForm();
      loadData();

      auditLog('audit_sampling_plan', selectedPlan ? 'update' : 'create', {
        plan_id: result.data.id,
        plan_code: formData.plan_code,
        sampling_method: formData.sampling_method,
        user_id: user?.id,
        tenant_id: effectiveTenantId
      });

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar plano');
    }
  };

  const resetForm = () => {
    setFormData({
      plan_code: '',
      plan_title: '',
      population_description: '',
      population_size: 0,
      population_value: 0,
      sampling_method: 'random',
      confidence_level: samplingConfig?.default_confidence_level || 95.0,
      tolerable_error_rate: samplingConfig?.default_tolerable_error_rate || 5.0,
      expected_error_rate: samplingConfig?.default_expected_error_rate || 1.0,
      mus_materiality: 0,
      mus_tolerable_misstatement: 0,
      mus_expected_misstatement: 0,
      methodology_notes: '',
      limitations: '',
      conclusions: ''
    });
    setSelectedPlan(null);
  };

  const openEditDialog = (plan: SamplingPlan) => {
    setSelectedPlan(plan);
    setFormData({
      plan_code: plan.plan_code,
      plan_title: plan.plan_title,
      population_description: plan.population_description,
      population_size: plan.population_size,
      population_value: plan.population_value || 0,
      sampling_method: plan.sampling_method,
      confidence_level: plan.confidence_level,
      tolerable_error_rate: plan.tolerable_error_rate,
      expected_error_rate: plan.expected_error_rate,
      mus_materiality: plan.mus_materiality || 0,
      mus_tolerable_misstatement: plan.mus_tolerable_misstatement || 0,
      mus_expected_misstatement: plan.mus_expected_misstatement || 0,
      methodology_notes: plan.methodology_notes || '',
      limitations: plan.limitations || '',
      conclusions: plan.conclusions || ''
    });
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'executed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'mus': return 'bg-indigo-100 text-indigo-800';
      case 'random': return 'bg-green-100 text-green-800';
      case 'systematic': return 'bg-blue-100 text-blue-800';
      case 'stratified': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const planStats = useMemo(() => {
    return {
      total: samplingPlans.length,
      draft: samplingPlans.filter(p => p.status === 'draft').length,
      approved: samplingPlans.filter(p => p.status === 'approved').length,
      executed: samplingPlans.filter(p => p.status === 'executed').length,
      completed: samplingPlans.filter(p => p.status === 'completed').length,
      totalSampleSize: samplingPlans.reduce((sum, p) => sum + p.actual_sample_size, 0)
    };
  }, [samplingPlans]);

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
              <Calculator className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{planStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-gray-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Rascunho</p>
                <p className="text-2xl font-bold">{planStats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold">{planStats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Executados</p>
                <p className="text-2xl font-bold">{planStats.executed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{planStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Amostra Total</p>
                <p className="text-2xl font-bold">{planStats.totalSampleSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Amostragem Estatística</CardTitle>
              <CardDescription>
                Planejamento e execução de amostragens estatísticas para testes de auditoria
              </CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {samplingPlans.map((plan) => (
              <Card key={plan.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{plan.plan_code}</Badge>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status.toUpperCase()}
                        </Badge>
                        <Badge className={getMethodColor(plan.sampling_method)}>
                          {samplingMethods[plan.sampling_method]}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{plan.plan_title}</h3>
                      <p className="text-muted-foreground mb-3">{plan.population_description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">População:</span>
                          <span className="ml-2">{plan.population_size.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Amostra:</span>
                          <span className="ml-2">{plan.actual_sample_size}</span>
                        </div>
                        <div>
                          <span className="font-medium">Confiança:</span>
                          <span className="ml-2">{plan.confidence_level}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Erro Tolerável:</span>
                          <span className="ml-2">{plan.tolerable_error_rate}%</span>
                        </div>
                      </div>

                      {plan.population_value && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Valor da População:</span>
                          <span className="ml-2">R$ {plan.population_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          {plan.sampling_method === 'mus' && plan.mus_tolerable_misstatement && (
                            <>
                              <span className="ml-4 font-medium">Distorção Tolerável:</span>
                              <span className="ml-2">R$ {plan.mus_tolerable_misstatement.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </>
                          )}
                        </div>
                      )}

                      {(plan.errors_found > 0 || plan.projected_error) && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Erros Encontrados:</span>
                              <span className="ml-2">{plan.errors_found}</span>
                            </div>
                            {plan.total_error_value > 0 && (
                              <div>
                                <span className="font-medium">Valor do Erro:</span>
                                <span className="ml-2">R$ {plan.total_error_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {plan.projected_error && (
                              <div>
                                <span className="font-medium">Erro Projetado:</span>
                                <span className="ml-2">R$ {plan.projected_error.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {samplingPlans.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum plano de amostragem encontrado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Novo/Editar Plano */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Editar' : 'Novo'} Plano de Amostragem
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros estatísticos para definição da amostra
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Código do Plano *</Label>
                  <Input
                    value={formData.plan_code}
                    onChange={(e) => setFormData(prev => ({...prev, plan_code: sanitizeInput(e.target.value)}))}
                    placeholder="SP-2025-001"
                  />
                </div>
                <div>
                  <Label>Método de Amostragem *</Label>
                  <Select value={formData.sampling_method} onValueChange={(value) => setFormData(prev => ({...prev, sampling_method: value as any}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(samplingMethods).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Título do Plano *</Label>
                <Input
                  value={formData.plan_title}
                  onChange={(e) => setFormData(prev => ({...prev, plan_title: sanitizeInput(e.target.value)}))}
                  placeholder="Descrição do teste de auditoria"
                />
              </div>

              <div>
                <Label>Descrição da População *</Label>
                <Textarea
                  value={formData.population_description}
                  onChange={(e) => setFormData(prev => ({...prev, population_description: sanitizeInput(e.target.value)}))}
                  placeholder="Descrição detalhada da população a ser testada..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tamanho da População *</Label>
                  <Input
                    type="number"
                    value={formData.population_size}
                    onChange={(e) => setFormData(prev => ({...prev, population_size: parseInt(e.target.value) || 0}))}
                    placeholder="Ex: 5000"
                  />
                </div>
                {formData.sampling_method === 'mus' && (
                  <div>
                    <Label>Valor da População (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.population_value}
                      onChange={(e) => setFormData(prev => ({...prev, population_value: parseFloat(e.target.value) || 0}))}
                      placeholder="Ex: 1500000.00"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Nível de Confiança</Label>
                  <Select value={formData.confidence_level.toString()} onValueChange={(value) => setFormData(prev => ({...prev, confidence_level: parseFloat(value)}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {confidenceLevels.map(level => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Taxa de Erro Tolerável (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.tolerable_error_rate}
                    onChange={(e) => setFormData(prev => ({...prev, tolerable_error_rate: parseFloat(e.target.value) || 5.0}))}
                  />
                </div>
                <div>
                  <Label>Taxa de Erro Esperada (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.expected_error_rate}
                    onChange={(e) => setFormData(prev => ({...prev, expected_error_rate: parseFloat(e.target.value) || 1.0}))}
                  />
                </div>
              </div>

              {formData.sampling_method === 'mus' && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Parâmetros MUS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Materialidade (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.mus_materiality}
                        onChange={(e) => setFormData(prev => ({...prev, mus_materiality: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                    <div>
                      <Label>Distorção Tolerável (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.mus_tolerable_misstatement}
                        onChange={(e) => setFormData(prev => ({...prev, mus_tolerable_misstatement: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                    <div>
                      <Label>Distorção Esperada (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.mus_expected_misstatement}
                        onChange={(e) => setFormData(prev => ({...prev, mus_expected_misstatement: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Tamanho da Amostra Calculado</h4>
                <div className="text-3xl font-bold text-blue-600">{calculatedSampleSize.toLocaleString()}</div>
                <p className="text-sm text-blue-700 mt-1">
                  {formData.population_size > 0 && (
                    `${((calculatedSampleSize / formData.population_size) * 100).toFixed(2)}% da população`
                  )}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div>
                <Label>Metodologia</Label>
                <Textarea
                  value={formData.methodology_notes}
                  onChange={(e) => setFormData(prev => ({...prev, methodology_notes: sanitizeInput(e.target.value)}))}
                  placeholder="Descrição da metodologia aplicada..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Limitações</Label>
                <Textarea
                  value={formData.limitations}
                  onChange={(e) => setFormData(prev => ({...prev, limitations: sanitizeInput(e.target.value)}))}
                  placeholder="Limitações identificadas no plano..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Conclusões</Label>
                <Textarea
                  value={formData.conclusions}
                  onChange={(e) => setFormData(prev => ({...prev, conclusions: sanitizeInput(e.target.value)}))}
                  placeholder="Conclusões e recomendações..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {selectedPlan ? 'Atualizar' : 'Criar'} Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}