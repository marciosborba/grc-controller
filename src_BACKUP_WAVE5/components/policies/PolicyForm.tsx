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
  Policy, 
  PolicyCategory, 
  DocumentType, 
  CreatePolicyRequest, 
  UpdatePolicyRequest 
} from '@/types/policy-management';
import { POLICY_CATEGORIES, DOCUMENT_TYPES } from '@/types/policy-management';

interface PolicyFormProps {
  policy?: Policy;
  profiles?: any[];
  onSubmit: (data: CreatePolicyRequest | UpdatePolicyRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PolicyForm: React.FC<PolicyFormProps> = ({
  policy,
  profiles = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    title: policy?.title || '',
    description: policy?.description || '',
    category: policy?.category || 'Segurança da Informação' as PolicyCategory,
    document_type: policy?.document_type || 'Política' as DocumentType,
    version: policy?.version || '1.0',
    owner_id: policy?.owner_id || '',
    tags: policy?.tags?.join(', ') || '',
    compliance_frameworks: policy?.compliance_frameworks?.join(', ') || '',
    impact_areas: policy?.impact_areas?.join(', ') || ''
  });

  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(
    policy?.effective_date ? new Date(policy.effective_date) : undefined
  );
  const [reviewDate, setReviewDate] = useState<Date | undefined>(
    policy?.review_date ? new Date(policy.review_date) : undefined
  );
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    policy?.expiration_date ? new Date(policy.expiration_date) : undefined
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Versão é obrigatória';
    }

    if (effectiveDate && reviewDate && effectiveDate >= reviewDate) {
      newErrors.review_date = 'Data de revisão deve ser posterior à data de vigência';
    }

    if (effectiveDate && expirationDate && effectiveDate >= expirationDate) {
      newErrors.expiration_date = 'Data de expiração deve ser posterior à data de vigência';
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
        category: formData.category,
        document_type: formData.document_type,
        version: formData.version.trim(),
        owner_id: formData.owner_id || undefined,
        effective_date: effectiveDate,
        review_date: reviewDate,
        expiration_date: expirationDate,
        tags: formData.tags ? 
          formData.tags.split(',').map(t => t.trim()).filter(t => t) : 
          undefined,
        compliance_frameworks: formData.compliance_frameworks ? 
          formData.compliance_frameworks.split(',').map(f => f.trim()).filter(f => f) : 
          undefined,
        impact_areas: formData.impact_areas ? 
          formData.impact_areas.split(',').map(a => a.trim()).filter(a => a) : 
          undefined
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Informações Básicas</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="title">
              Título da Política *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Política de Segurança da Informação"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">
              Categoria *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as PolicyCategory })}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(POLICY_CATEGORIES).map(([key, description]) => (
                  <SelectItem key={key} value={key} title={description}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <Label htmlFor="document_type">
              Tipo de Documento
            </Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData({ ...formData, document_type: value as DocumentType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPES).map(([key, description]) => (
                  <SelectItem key={key} value={key} title={description}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="version">
              Versão *
            </Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="1.0"
              className={errors.version ? 'border-red-500' : ''}
            />
            {errors.version && (
              <p className="text-sm text-red-600 mt-1">{errors.version}</p>
            )}
          </div>

          <div>
            <Label htmlFor="owner_id">
              Proprietário
            </Label>
            <Select
              value={formData.owner_id || undefined}
              onValueChange={(value) => setFormData({ ...formData, owner_id: value || '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um proprietãrio" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>
                    {profile.full_name} - {profile.job_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Descreva o objetivo, escopo e principais diretrizes da polãtica..."
            />
          </div>
        </div>
      </div>

      {/* Datas */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Cronograma</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Data de Vigência</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !effectiveDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {effectiveDate ? format(effectiveDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={effectiveDate}
                  onSelect={setEffectiveDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Data de Revisão</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !reviewDate && "text-muted-foreground",
                    errors.review_date && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reviewDate ? format(reviewDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reviewDate}
                  onSelect={setReviewDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.review_date && (
              <p className="text-sm text-red-600 mt-1">{errors.review_date}</p>
            )}
          </div>

          <div>
            <Label>Data de Expiração</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expirationDate && "text-muted-foreground",
                    errors.expiration_date && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.expiration_date && (
              <p className="text-sm text-red-600 mt-1">{errors.expiration_date}</p>
            )}
          </div>
        </div>
      </div>

      {/* Metadados */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Metadados</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tags">
              Tags (separadas por vírgula)
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="seguranãa, gdpr, iso27001"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use tags para facilitar a busca e categorização
            </p>
          </div>

          <div>
            <Label htmlFor="compliance_frameworks">
              Frameworks de Compliance
            </Label>
            <Input
              id="compliance_frameworks"
              value={formData.compliance_frameworks}
              onChange={(e) => setFormData({ ...formData, compliance_frameworks: e.target.value })}
              placeholder="ISO 27001, LGPD, SOX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Frameworks de conformidade relacionados
            </p>
          </div>

          <div className="col-span-2">
            <Label htmlFor="impact_areas">
              áreas de Impacto
            </Label>
            <Input
              id="impact_areas"
              value={formData.impact_areas}
              onChange={(e) => setFormData({ ...formData, impact_areas: e.target.value })}
              placeholder="TI, RH, Financeiro, Operações"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Departamentos ou áreas impactados por esta polãtica
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Salvando...' : (policy ? 'Atualizar' : 'Criar Política')}
        </Button>
      </div>
    </form>
  );
};

export default PolicyForm;