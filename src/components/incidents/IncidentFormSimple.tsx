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
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';

// Tipo baseado na estrutura real da tabela incidents
interface SimpleIncident {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  assignee_id?: string;
  reporter_id?: string;
  tenant_id?: string;
  created_at: string;
  updated_at?: string;
}

interface IncidentFormSimpleProps {
  incident?: SimpleIncident;
  profiles?: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const IncidentFormSimple: React.FC<IncidentFormSimpleProps> = ({
  incident,
  profiles = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  console.log('🎯 [IncidentFormSimple] Renderizando formulário');
  console.log('📋 [IncidentFormSimple] Incident:', incident);
  console.log('👥 [IncidentFormSimple] Profiles:', profiles);

  const [formData, setFormData] = useState({
    title: incident?.title || '',
    description: incident?.description || '',
    category: incident?.category || 'Segurança da Informação',
    priority: incident?.priority || 'medium',
    status: incident?.status || 'open',
    reported_by: incident?.reporter_id || 'unspecified',
    assigned_to: incident?.assignee_id || 'unassigned'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar formulário quando incidente mudar
  useEffect(() => {
    if (incident) {
      console.log('🔄 [IncidentFormSimple] Atualizando formulário com dados do incidente');
      setFormData({
        title: incident.title || '',
        description: incident.description || '',
        category: incident.category || 'Segurança da Informação',
        priority: incident.priority || 'medium',
        status: incident.status || 'open',
        reported_by: incident.reporter_id || 'unspecified',
        assigned_to: incident.assignee_id || 'unassigned'
      });
      setErrors({});
    }
  }, [incident]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.priority) {
      newErrors.priority = 'Prioridade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [IncidentFormSimple] SUBMIT INICIADO');
    console.log('📋 [IncidentFormSimple] Dados do formulário:', formData);
    console.log('🔍 [IncidentFormSimple] Incident atual:', incident);

    if (!validateForm()) {
      console.log('❌ [IncidentFormSimple] Validação falhou');
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      console.log('✅ [IncidentFormSimple] Validação passou, enviando dados...');
      
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        reported_by: formData.reported_by === 'unspecified' ? undefined : formData.reported_by || undefined,
        assigned_to: formData.assigned_to === 'unassigned' ? undefined : formData.assigned_to || undefined
      };

      console.log('📤 [IncidentFormSimple] Dados para envio:', submitData);
      await onSubmit(submitData);
      console.log('✅ [IncidentFormSimple] Submit concluído com sucesso');
    } catch (error) {
      console.error('❌ [IncidentFormSimple] Erro no submit:', error);
    }
  };

  const updateFormData = (field: string, value: any) => {
    console.log(`🔄 [IncidentFormSimple] Atualizando campo ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData('category', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Segurança da Informação">Segurança da Informação</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="Aplicações">Aplicações</SelectItem>
                  <SelectItem value="Dados e Privacidade">Dados e Privacidade</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Segurança Física">Segurança Física</SelectItem>
                  <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="Terceiros">Terceiros</SelectItem>
                  <SelectItem value="Processo">Processo</SelectItem>
                  <SelectItem value="Ambiental">Ambiental</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="priority">Prioridade *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => updateFormData('priority', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority}</p>}
            </div>

            {incident && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData('status', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="investigating">Investigando</SelectItem>
                    <SelectItem value="contained">Contido</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Atribuição */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Atribuição</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reported_by">Reportado por</Label>
              <Select
                value={formData.reported_by}
                onValueChange={(value) => updateFormData('reported_by', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unspecified">Não especificado</SelectItem>
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
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Não atribuído</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.full_name} - {profile.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : incident ? 'Atualizar' : 'Criar'} Incidente
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IncidentFormSimple;