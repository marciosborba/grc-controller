import React, { useState } from 'react';
import { AlertTriangle, Calendar, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { PrivacyIncident } from '@/types/privacy-management';

interface CreateIncidentDialogProps {
  onCreateIncident: (incidentData: Partial<PrivacyIncident>) => Promise<void>;
}

export function CreateIncidentDialog({ onCreateIncident }: CreateIncidentDialogProps) {
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<PrivacyIncident>>({
    title: '',
    description: '',
    incident_type: 'data_breach',
    severity_level: 'medium',
    affected_data_categories: [],
    estimated_affected_individuals: 0,
    discovered_at: new Date().toISOString().slice(0, 16), // For datetime-local input
    occurred_at: '',
    root_cause: '',
    incident_source: '',
    impact_description: '',
    financial_impact: 0,
    containment_measures: [],
    anpd_notification_required: false,
    data_subjects_notification_required: false,
    internal_notification_sent: false
  });

  // Available options
  const incidentTypes = [
    { value: 'data_breach', label: 'Vazamento de Dados' },
    { value: 'unauthorized_access', label: 'Acesso Não Autorizado' },
    { value: 'data_loss', label: 'Perda de Dados' },
    { value: 'ransomware', label: 'Ransomware' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'malware', label: 'Malware' },
    { value: 'insider_threat', label: 'Ameaça Interna' },
    { value: 'system_failure', label: 'Falha de Sistema' },
    { value: 'human_error', label: 'Erro Humano' },
    { value: 'physical_theft', label: 'Roubo Físico' },
    { value: 'other', label: 'Outros' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Baixa', color: 'text-green-600' },
    { value: 'medium', label: 'Média', color: 'text-yellow-600' },
    { value: 'high', label: 'Alta', color: 'text-orange-600' },
    { value: 'critical', label: 'Crítica', color: 'text-red-600' }
  ];

  const dataCategories = [
    { value: 'identificacao', label: 'Identificação' },
    { value: 'contato', label: 'Contato' },
    { value: 'localizacao', label: 'Localização' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'saude', label: 'Saúde' },
    { value: 'biometrico', label: 'Biométrico' },
    { value: 'comportamental', label: 'Comportamental' },
    { value: 'profissional', label: 'Profissional' },
    { value: 'educacional', label: 'Educacional' },
    { value: 'outros', label: 'Outros' }
  ];

  // Auto-determine ANPD notification requirement
  React.useEffect(() => {
    const requiresNotification = 
      formData.severity_level === 'critical' ||
      formData.severity_level === 'high' ||
      (formData.estimated_affected_individuals && formData.estimated_affected_individuals > 100) ||
      formData.affected_data_categories?.includes('saude') ||
      formData.affected_data_categories?.includes('biometrico');

    setFormData(prev => ({ 
      ...prev, 
      anpd_notification_required: requiresNotification
    }));
  }, [
    formData.severity_level,
    formData.estimated_affected_individuals,
    formData.affected_data_categories
  ]);

  const handleInputChange = (field: keyof PrivacyIncident, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: keyof PrivacyIncident, value: string) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleDataCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => {
      const categories = prev.affected_data_categories || [];
      if (checked) {
        return { ...prev, affected_data_categories: [...categories, category] };
      } else {
        return { ...prev, affected_data_categories: categories.filter(c => c !== category) };
      }
    });
  };

  const validateForm = (): boolean => {
    if (!formData.title || !formData.description) {
      toast.error('Título e descrição são obrigatórios');
      return false;
    }

    if (!formData.discovered_at) {
      toast.error('Data de descoberta é obrigatória');
      return false;
    }

    if (formData.estimated_affected_individuals === undefined || formData.estimated_affected_individuals < 0) {
      toast.error('Número de indivíduos afetados deve ser informado');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert datetime-local string back to ISO string
      const incidentData = {
        ...formData,
        discovered_at: new Date(formData.discovered_at!).toISOString(),
        occurred_at: formData.occurred_at ? new Date(formData.occurred_at).toISOString() : undefined,
        status: 'open'
      };

      await onCreateIncident(incidentData);
    } catch (error) {
      console.error('Error creating incident:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Novo Incidente de Privacidade</h2>
        <p className="text-muted-foreground">
          Registre um incidente relacionado à proteção de dados pessoais
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Identifique e descreva o incidente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Incidente *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Vazamento de dados via configuração incorreta de servidor"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva detalhadamente o que aconteceu, como foi descoberto e qual o escopo do incidente..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incident_type">Tipo de Incidente</Label>
                <Select 
                  value={formData.incident_type || ''} 
                  onValueChange={(value) => handleInputChange('incident_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="incident_source">Fonte do Incidente</Label>
                <Input
                  id="incident_source"
                  value={formData.incident_source || ''}
                  onChange={(e) => handleInputChange('incident_source', e.target.value)}
                  placeholder="Ex: Sistema de Email, Servidor de Backup"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity and Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Severidade e Cronologia</CardTitle>
            <CardDescription>
              Avalie a severidade e defina a linha temporal do incidente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nível de Severidade</Label>
              <RadioGroup
                value={formData.severity_level || 'medium'}
                onValueChange={(value) => handleInputChange('severity_level', value)}
                className="mt-2"
              >
                {severityLevels.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <Label htmlFor={level.value} className={level.color}>
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discovered_at">Data/Hora de Descoberta *</Label>
                <Input
                  id="discovered_at"
                  type="datetime-local"
                  value={formData.discovered_at?.slice(0, 16) || ''}
                  onChange={(e) => handleInputChange('discovered_at', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="occurred_at">Data/Hora de Ocorrência (se conhecida)</Label>
                <Input
                  id="occurred_at"
                  type="datetime-local"
                  value={formData.occurred_at?.slice(0, 16) || ''}
                  onChange={(e) => handleInputChange('occurred_at', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Avaliação de Impacto</CardTitle>
            <CardDescription>
              Quantifique o impacto do incidente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimated_affected_individuals">Número de Indivíduos Afetados *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estimated_affected_individuals"
                    type="number"
                    min="0"
                    value={formData.estimated_affected_individuals || 0}
                    onChange={(e) => handleInputChange('estimated_affected_individuals', parseInt(e.target.value) || 0)}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="financial_impact">Impacto Financeiro Estimado (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="financial_impact"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financial_impact || 0}
                    onChange={(e) => handleInputChange('financial_impact', parseFloat(e.target.value) || 0)}
                    className="pl-10"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Categorias de Dados Afetadas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {dataCategories.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={formData.affected_data_categories?.includes(category.value) || false}
                      onCheckedChange={(checked) => handleDataCategoryChange(category.value, checked as boolean)}
                    />
                    <Label htmlFor={category.value} className="text-sm">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="impact_description">Descrição do Impacto</Label>
              <Textarea
                id="impact_description"
                value={formData.impact_description || ''}
                onChange={(e) => handleInputChange('impact_description', e.target.value)}
                placeholder="Descreva os impactos específicos do incidente nos titulares e na organização..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Root Cause and Containment */}
        <Card>
          <CardHeader>
            <CardTitle>Causa Raiz e Contenção</CardTitle>
            <CardDescription>
              Identifique a causa e medidas iniciais de contenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="root_cause">Causa Raiz (se conhecida)</Label>
              <Textarea
                id="root_cause"
                value={formData.root_cause || ''}
                onChange={(e) => handleInputChange('root_cause', e.target.value)}
                placeholder="Ex: Configuração incorreta de firewall, erro humano, falha de sistema..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="containment_measures">Medidas de Contenção Implementadas</Label>
              <Textarea
                id="containment_measures"
                value={formData.containment_measures?.join('\n') || ''}
                onChange={(e) => handleArrayInputChange('containment_measures', e.target.value)}
                placeholder={`Uma medida por linha, exemplo:
Desconexão do sistema da rede
Alteração de senhas comprometidas
Notificação da equipe de TI
Backup de evidências`}
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Digite uma medida por linha
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos de Notificação</CardTitle>
            <CardDescription>
              Determine as notificações necessárias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ANPD Notification Auto-Assessment */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center space-x-2">
                {formData.anpd_notification_required ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-green-600" />
                )}
                <span className="font-medium">
                  {formData.anpd_notification_required 
                    ? 'Notificação à ANPD Requerida' 
                    : 'Notificação à ANPD Não Requerida'
                  }
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {formData.anpd_notification_required 
                  ? 'Este incidente atende aos critérios para notificação obrigatória à ANPD (prazo de 72 horas)'
                  : 'Com base nos dados informados, este incidente não requer notificação à ANPD'
                }
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="data_subjects_notification_required"
                  checked={formData.data_subjects_notification_required || false}
                  onCheckedChange={(checked) => handleInputChange('data_subjects_notification_required', checked)}
                />
                <Label htmlFor="data_subjects_notification_required">
                  Requer notificação aos titulares de dados
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internal_notification_sent"
                  checked={formData.internal_notification_sent || false}
                  onCheckedChange={(checked) => handleInputChange('internal_notification_sent', checked)}
                />
                <Label htmlFor="internal_notification_sent">
                  Notificação interna já enviada
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-2">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Incidente'}
          </Button>
        </div>
      </div>
    </div>
  );
}