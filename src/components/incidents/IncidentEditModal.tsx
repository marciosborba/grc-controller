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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import type { Incident } from '@/types/incident-management';

interface IncidentEditModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  reported_by: string;
  assigned_to: string;
}

interface Profile {
  id: string;
  full_name: string;
  job_title: string;
  email: string;
}

const IncidentEditModal: React.FC<IncidentEditModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const tenantId = useCurrentTenantId();
  
  // Estados do formulário
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'Segurança da Informação',
    priority: 'medium',
    status: 'open',
    reported_by: '',
    assigned_to: ''
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar perfis de usuários
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, job_title, email')
          .order('full_name', { ascending: true });

        if (error) throw error;
        setProfiles(data || []);
      } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        toast.error('Erro ao carregar lista de usuários');
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  // Preencher formulário quando incidente for carregado
  useEffect(() => {
    if (incident) {
      console.log('🔄 Carregando dados do incidente:', incident);
      
      setFormData({
        title: incident.title || '',
        description: incident.description || '',
        category: incident.category || 'Segurança da Informação',
        priority: incident.priority || 'medium',
        status: incident.status || 'open',
        reported_by: incident.reported_by || 'unspecified',
        assigned_to: incident.assigned_to || 'unassigned'
      });
      setErrors({});
    } else {
      // Reset para novo incidente
      setFormData({
        title: '',
        description: '',
        category: 'Segurança da Informação',
        priority: 'medium',
        status: 'open',
        reported_by: user?.id || 'unspecified',
        assigned_to: 'unassigned'
      });
      setErrors({});
    }
  }, [incident, user]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    // Categoria e prioridade são opcionais na tabela, mas vamos manter valores padrão
    // if (!formData.category) {
    //   newErrors.category = 'Categoria é obrigatória';
    // }

    // if (!formData.priority) {
    //   newErrors.priority = 'Prioridade é obrigatória';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar campo do formulário
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 SUBMIT INICIADO - handleSubmit chamado');
    console.log('📋 Dados do formulário:', formData);
    console.log('🔍 Incident atual:', incident);
    console.log('🏢 Tenant ID:', tenantId);
    console.log('👤 User:', user);

    console.log('🔍 Iniciando validação...');
    const isValid = validateForm();
    console.log('✅ Resultado da validação:', isValid);
    console.log('📝 Erros encontrados:', errors);
    
    if (!isValid) {
      console.log('❌ Validação falhou - interrompendo submit');
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    
    console.log('✅ Validação passou - continuando...');

    console.log('🔄 Definindo isSubmitting = true');
    setIsSubmitting(true);

    try {
      console.log('🎯 Entrando no bloco try...');
      // Preparar dados para o Supabase
      const incidentData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category || 'Segurança da Informação',
        priority: formData.priority || 'medium',
        status: formData.status || 'open',
        reporter_id: formData.reported_by === 'unspecified' ? null : formData.reported_by || null,
        assignee_id: formData.assigned_to === 'unassigned' ? null : formData.assigned_to || null,
        tenant_id: tenantId
      };
      
      // Adicionar updated_at apenas para updates
      if (incident) {
        incidentData.updated_at = new Date().toISOString();
      }

      console.log('📤 Enviando dados para o Supabase:', incidentData);

      let result;
      
      if (incident) {
        // Atualizar incidente existente
        console.log('🔄 MODO EDIÇÃO - Atualizando incidente existente');
        console.log('🆔 ID do incidente:', incident.id);
        console.log('📤 Dados que serão enviados:', incidentData);
        
        console.log('🌐 Executando query UPDATE no Supabase...');
        const { data, error } = await supabase
          .from('incidents')
          .update(incidentData)
          .eq('id', incident.id)
          .select()
          .single();
        
        console.log('📥 Resposta do Supabase UPDATE:', { data, error });

        if (error) {
          console.error('❌ Erro retornado pelo Supabase:', error);
          throw error;
        }
        
        result = data;
        console.log('✅ UPDATE bem-sucedido - resultado:', result);
        toast.success('Incidente atualizado com sucesso!');
      } else {
        // Criar novo incidente
        console.log('➕ Criando novo incidente...');
        
        const createData = {
          ...incidentData,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('incidents')
          .insert(createData)
          .select()
          .single();

        if (error) throw error;
        result = data;
        
        console.log('✅ Incidente criado com sucesso:', result);
        toast.success('Incidente criado com sucesso!');
      }

      // Fechar modal e notificar sucesso
      console.log('🎉 Operação concluída - chamando callbacks...');
      console.log('📞 Chamando onSuccess...');
      onSuccess();
      console.log('🚪 Chamando onClose...');
      onClose();

    } catch (error: any) {
      console.error('❌ ERRO CAPTURADO no catch:', error);
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Stack trace:', error.stack);
      toast.error(`Erro ao salvar incidente: ${error.message}`);
    } finally {
      console.log('🔄 Definindo isSubmitting = false (finally)');
      setIsSubmitting(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    console.log('❌ Cancelando edição...');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {incident ? 'Editar Incidente' : 'Novo Incidente'}
          </DialogTitle>
          <DialogDescription>
            {incident
              ? 'Edite as informações do incidente existente'
              : 'Crie um novo incidente de segurança'
            }
          </DialogDescription>
        </DialogHeader>

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
                  disabled={isSubmitting || isLoadingProfiles}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unspecified">Não especificado</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
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
                  disabled={isSubmitting || isLoadingProfiles}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name} - {profile.job_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Ações do Formulário */}
          <DialogFooter className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
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
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {incident ? 'Atualizar' : 'Criar'} Incidente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentEditModal;