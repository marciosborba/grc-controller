import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { DPIAAssessment } from '@/types/privacy-management';
import { useDPIA } from '@/hooks/useDPIA';

interface CreateDPIADialogProps {
  onCreateDPIA: (dpiaData: Partial<DPIAAssessment>) => Promise<void>;
}

export function CreateDPIADialog({ onCreateDPIA }: CreateDPIADialogProps) {
  const { getProcessingActivities } = useDPIA();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processingActivities, setProcessingActivities] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<DPIAAssessment>>({
    title: '',
    description: '',
    processing_activity_id: '',
    involves_high_risk: false,
    involves_sensitive_data: false,
    involves_large_scale: false,
    involves_profiling: false,
    involves_automated_decisions: false,
    involves_vulnerable_individuals: false,
    involves_new_technology: false,
    dpia_required: false,
    dpia_justification: '',
    privacy_risks: [],
    likelihood_assessment: 1,
    impact_assessment: 1,
    mitigation_measures: []
  });

  // Load processing activities on mount
  useEffect(() => {
    loadProcessingActivities();
  }, []);

  const loadProcessingActivities = async () => {
    const result = await getProcessingActivities();
    if (result.success) {
      setProcessingActivities(result.data);
    }
  };

  // Auto-determine if DPIA is required based on criteria
  useEffect(() => {
    const dpiaRequired = 
      formData.involves_high_risk ||
      formData.involves_sensitive_data ||
      formData.involves_large_scale ||
      (formData.involves_profiling && formData.involves_automated_decisions) ||
      formData.involves_vulnerable_individuals ||
      formData.involves_new_technology;

    setFormData(prev => ({ 
      ...prev, 
      dpia_required: dpiaRequired,
      dpia_justification: dpiaRequired 
        ? 'DPIA obrigatória com base nos critérios de alto risco identificados'
        : 'DPIA não obrigatória segundo critérios da LGPD'
    }));
  }, [
    formData.involves_high_risk,
    formData.involves_sensitive_data, 
    formData.involves_large_scale,
    formData.involves_profiling,
    formData.involves_automated_decisions,
    formData.involves_vulnerable_individuals,
    formData.involves_new_technology
  ]);

  // Calculate risk level based on assessments
  useEffect(() => {
    if (formData.likelihood_assessment && formData.impact_assessment) {
      const riskScore = (formData.likelihood_assessment * formData.impact_assessment);
      let riskLevel: string;
      
      if (riskScore >= 16) riskLevel = 'critical';
      else if (riskScore >= 9) riskLevel = 'high';
      else if (riskScore >= 4) riskLevel = 'medium';
      else riskLevel = 'low';

      setFormData(prev => ({ ...prev, risk_level: riskLevel }));
    }
  }, [formData.likelihood_assessment, formData.impact_assessment]);

  const handleInputChange = (field: keyof DPIAAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: keyof DPIAAssessment, value: string) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description);
      case 2:
        return true; // Risk factors are optional but informative
      case 3:
        return !!(formData.likelihood_assessment && formData.impact_assessment);
      case 4:
        return !!(formData.privacy_risks && formData.privacy_risks.length > 0);
      case 5:
        return !!(formData.mitigation_measures && formData.mitigation_measures.length > 0);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error('Por favor, complete todas as etapas');
      return;
    }

    setLoading(true);
    try {
      await onCreateDPIA({
        ...formData,
        status: 'draft'
      });
    } catch (error) {
      console.error('Error creating DPIA:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600', 
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const getRiskLevelLabel = (level: string) => {
    const labels = {
      low: 'Baixo',
      medium: 'Médio',
      high: 'Alto', 
      critical: 'Crítico'
    };
    return labels[level as keyof typeof labels] || 'Baixo';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Nova DPIA</h2>
        <p className="text-muted-foreground">
          Avaliação de Impacto à Proteção de Dados Pessoais
        </p>
        
        {/* Progress Steps */}
        <div className="flex items-center mt-4 space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </div>
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground mt-2">
          Etapa {currentStep} de 5
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Identifique a atividade de tratamento a ser avaliada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título da DPIA *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: DPIA - Sistema de CRM com IA"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o contexto e objetivo desta avaliação..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="processing_activity">Atividade de Tratamento</Label>
              <Select 
                value={formData.processing_activity_id || ''} 
                onValueChange={(value) => handleInputChange('processing_activity_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma atividade de tratamento" />
                </SelectTrigger>
                <SelectContent>
                  {processingActivities.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Risk Factors Assessment */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Fatores de Risco</CardTitle>
            <CardDescription>
              Identifique os fatores que podem gerar alto risco à privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                A presença de qualquer um desses fatores pode indicar necessidade de DPIA obrigatória
              </AlertDescription>
            </Alert>

            {[
              {
                key: 'involves_high_risk',
                title: 'Tratamento de Alto Risco',
                description: 'O tratamento apresenta alto risco aos direitos e liberdades dos titulares'
              },
              {
                key: 'involves_sensitive_data',
                title: 'Dados Pessoais Sensíveis',
                description: 'Tratamento de dados sensíveis (saúde, biométricos, origem racial, etc.)'
              },
              {
                key: 'involves_large_scale',
                title: 'Tratamento em Grande Escala',
                description: 'Grande volume de dados ou grande número de titulares afetados'
              },
              {
                key: 'involves_profiling',
                title: 'Perfilamento',
                description: 'Criação de perfis comportamentais ou de preferências'
              },
              {
                key: 'involves_automated_decisions',
                title: 'Decisões Automatizadas',
                description: 'Decisões automatizadas que produzem efeitos significativos'
              },
              {
                key: 'involves_vulnerable_individuals',
                title: 'Indivíduos Vulneráveis',
                description: 'Tratamento de dados de crianças, idosos ou pessoas vulneráveis'
              },
              {
                key: 'involves_new_technology',
                title: 'Nova Tecnologia',
                description: 'Uso de tecnologias inovadoras (IA, IoT, blockchain, etc.)'
              }
            ].map((factor) => (
              <div key={factor.key} className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id={factor.key}
                  checked={formData[factor.key as keyof DPIAAssessment] as boolean}
                  onCheckedChange={(checked) => handleInputChange(factor.key as keyof DPIAAssessment, checked)}
                />
                <div className="flex-1">
                  <label htmlFor={factor.key} className="text-sm font-medium cursor-pointer">
                    {factor.title}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {factor.description}
                  </p>
                </div>
              </div>
            ))}

            {/* DPIA Requirement Status */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center space-x-2">
                {formData.dpia_required ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                ) : (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                <span className="font-medium">
                  {formData.dpia_required ? 'DPIA Obrigatória' : 'DPIA Não Obrigatória'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {formData.dpia_justification}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Risk Assessment */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliação de Risco</CardTitle>
            <CardDescription>
              Avalie a probabilidade e impacto dos riscos identificados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Probabilidade (1-5) *</Label>
                <RadioGroup
                  value={String(formData.likelihood_assessment || 1)}
                  onValueChange={(value) => handleInputChange('likelihood_assessment', parseInt(value))}
                  className="mt-2"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(level)} id={`likelihood-${level}`} />
                      <Label htmlFor={`likelihood-${level}`}>
                        {level} - {['Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta'][level - 1]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Impacto (1-5) *</Label>
                <RadioGroup
                  value={String(formData.impact_assessment || 1)}
                  onValueChange={(value) => handleInputChange('impact_assessment', parseInt(value))}
                  className="mt-2"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(level)} id={`impact-${level}`} />
                      <Label htmlFor={`impact-${level}`}>
                        {level} - {['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'][level - 1]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Risk Level Calculation */}
            {formData.risk_level && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nível de Risco Calculado:</span>
                  <Badge className={getRiskLevelColor(formData.risk_level)}>
                    {getRiskLevelLabel(formData.risk_level)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Baseado na matriz: Probabilidade ({formData.likelihood_assessment}) × Impacto ({formData.impact_assessment}) = {(formData.likelihood_assessment || 0) * (formData.impact_assessment || 0)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Privacy Risks */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Riscos de Privacidade</CardTitle>
            <CardDescription>
              Liste os riscos específicos identificados (um por linha)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.privacy_risks?.join('\n') || ''}
              onChange={(e) => handleArrayInputChange('privacy_risks', e.target.value)}
              placeholder={`Exemplo:
Perfilamento inadequado de clientes
Decisões automatizadas discriminatórias
Vazamento de dados por vulnerabilidade
Acesso não autorizado a dados sensíveis
Falta de transparência nos algoritmos`}
              rows={8}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Digite cada risco em uma linha separada. Identifique riscos específicos relacionados à privacidade e proteção de dados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Mitigation Measures */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Medidas de Mitigação</CardTitle>
            <CardDescription>
              Liste as medidas para mitigar os riscos identificados (uma por linha)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.mitigation_measures?.join('\n') || ''}
              onChange={(e) => handleArrayInputChange('mitigation_measures', e.target.value)}
              placeholder={`Exemplo:
Revisão humana de decisões automatizadas
Auditoria regular dos algoritmos
Criptografia avançada de dados
Controles de acesso granulares
Treinamento da equipe em privacidade
Política de transparência para os titulares`}
              rows={8}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Digite cada medida em uma linha separada. Inclua medidas técnicas, organizacionais e de transparência.
            </p>

            {/* Summary */}
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Resumo da DPIA</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">DPIA Obrigatória:</span> {formData.dpia_required ? 'Sim' : 'Não'}
                </div>
                <div>
                  <span className="font-medium">Nível de Risco:</span> {getRiskLevelLabel(formData.risk_level || 'low')}
                </div>
                <div>
                  <span className="font-medium">Riscos Identificados:</span> {formData.privacy_risks?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Medidas de Mitigação:</span> {formData.mitigation_measures?.length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>

        <div className="flex space-x-2">
          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Criando...' : 'Criar DPIA'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}