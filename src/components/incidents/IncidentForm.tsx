import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { 
  Incident, 
  IncidentType,
  IncidentCategory,
  IncidentSeverity,
  IncidentPriority,
  CreateIncidentRequest, 
  UpdateIncidentRequest 
} from '@/types/incident-management';
import { 
  INCIDENT_TYPES, 
  INCIDENT_CATEGORIES, 
  INCIDENT_SEVERITIES,
  INCIDENT_PRIORITIES 
} from '@/types/incident-management';

interface IncidentFormProps {
  incident?: Incident;
  profiles?: any[];
  onSubmit: (data: CreateIncidentRequest | UpdateIncidentRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const IncidentForm: React.FC<IncidentFormProps> = ({
  incident,
  profiles = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    type: incident?.type || 'security_breach' as IncidentType,
    category: incident?.category || 'Segurança da Informação' as IncidentCategory,
    severity: incident?.severity || 'medium' as IncidentSeverity,
    priority: incident?.priority || 'medium' as IncidentPriority,
    reported_by: incident?.reported_by || '',
    assigned_to: incident?.assigned_to || '',
    affected_systems: incident?.affected_systems?.join(', ') || '',
    business_impact: incident?.business_impact || ''
  });

  const [detectionDate, setDetectionDate] = useState<Date>(
    incident?.detection_date ? new Date(incident.detection_date) : new Date()
  );
  const [resolutionDate, setResolutionDate] = useState<Date | undefined>(
    incident?.resolution_date ? new Date(incident.resolution_date) : undefined
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo de incidente é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.severity) {
      newErrors.severity = 'Severidade é obrigatória';
    }

    if (!formData.priority) {
      newErrors.priority = 'Prioridade é obrigatória';
    }

    if (resolutionDate && detectionDate && resolutionDate <= detectionDate) {
      newErrors.resolution_date = 'Data de resolução deve ser posterior à data de detecção';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        category: formData.category,
        severity: formData.severity,
        priority: formData.priority,
        detection_date: detectionDate,
        resolution_date: resolutionDate,
        reported_by: formData.reported_by || undefined,
        assigned_to: formData.assigned_to || undefined,
        affected_systems: formData.affected_systems ? 
          formData.affected_systems.split(',').map(s => s.trim()).filter(s => s) : undefined,
        business_impact: formData.business_impact.trim() || undefined
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'security_breach',
      category: 'Segurança da Informação',
      severity: 'medium',
      priority: 'medium',
      reported_by: '',
      assigned_to: '',
      affected_systems: '',
      business_impact: ''
    });
    setDetectionDate(new Date());
    setResolutionDate(undefined);
    setErrors({});
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informações Básicas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Título do Incidente *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Ex: Tentativa de acesso não autorizado detectada"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                placeholder="Descreva os detalhes do incidente..."
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Incidente *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => updateFormData('type', value)}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="severity">Severidade *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => updateFormData('severity', value)}
              >
                <SelectTrigger className={errors.severity ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a severidade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_SEVERITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.severity && <p className="text-sm text-red-500 mt-1">{errors.severity}</p>}
            </div>

            <div>
              <Label htmlFor="priority">Prioridade *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => updateFormData('priority', value)}
              >
                <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INCIDENT_PRIORITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label.split(' - ')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority}</p>}
            </div>
          </div>
        </div>

        {/* Datas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Datas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Detecção *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !detectionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {detectionDate ? format(detectionDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={detectionDate}
                    onSelect={(date) => date && setDetectionDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data de Resolução</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !resolutionDate && "text-muted-foreground",
                      errors.resolution_date && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {resolutionDate ? format(resolutionDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={resolutionDate}
                    onSelect={setResolutionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.resolution_date && <p className="text-sm text-red-500 mt-1">{errors.resolution_date}</p>}
            </div>
          </div>
        </div>

        {/* Atribuição e Impacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Atribuição e Impacto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reported_by">Reportado por</Label>
              <Select
                value={formData.reported_by}
                onValueChange={(value) => updateFormData('reported_by', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Não especificado</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.full_name} - {profile.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assigned_to">Atribuído para</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => updateFormData('assigned_to', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Não atribuído</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.full_name} - {profile.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="affected_systems">Sistemas Afetados</Label>
              <Input
                id="affected_systems"
                value={formData.affected_systems}
                onChange={(e) => updateFormData('affected_systems', e.target.value)}
                placeholder="Ex: Sistema de email, Base de dados de clientes (separados por vírgula)"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="business_impact">Impacto no Negócio</Label>
              <Textarea
                id="business_impact"
                value={formData.business_impact}
                onChange={(e) => updateFormData('business_impact', e.target.value)}
                rows={3}
                placeholder="Descreva o impacto do incidente nas operações do negócio..."
              />
            </div>
          </div>
        </div>

        {/* Ações do Formulário */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          {!incident && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : incident ? 'Atualizar' : 'Criar'} Incidente
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;