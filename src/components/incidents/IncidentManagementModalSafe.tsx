import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  AlertTriangle,
  Save,
  X,
  Loader2,
  FileText,
  Users,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import type { Incident } from '@/types/incident-management';

interface IncidentManagementModalProps {
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

const IncidentManagementModalSafe: React.FC<IncidentManagementModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const tenantId = useCurrentTenantId();
  
  // Estados do formulário - apenas campos básicos
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'Segurança da Informação',
    priority: 'medium',
    status: 'open',
    reported_by: 'unspecified',
    assigned_to: 'unassigned'
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  // Carregar perfis de usuários
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        console.log('🔄 Carregando perfis. TenantId:', tenantId);
        
        let query = supabase
          .from('profiles')
          .select('id, full_name, job_title, email')
          .order('full_name', { ascending: true });

        if (tenantId && !user?.isPlatformAdmin) {
          query = query.eq('tenant_id', tenantId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Erro ao carregar perfis:', error);
          throw error;
        }
        
        console.log('✅ Perfis carregados:', data?.length || 0);
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
  }, [isOpen, tenantId, user?.isPlatformAdmin]);

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
      setActiveTab('basic');
    }
  }, [incident, user]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!tenantId && !user?.isPlatformAdmin) {
      newErrors.tenant = 'Tenant ID é obrigatório. Verifique se você está logado corretamente.';
      toast.error('Erro: Tenant ID não encontrado. Verifique se você está logado corretamente.');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar campo do formulário
  const updateFormData = (field: keyof FormData, value: any) => {
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

    const isValid = validateForm();
    if (!isValid) {
      console.log('❌ Validação falhou - interrompendo submit');
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Preparar dados básicos para o Supabase
      const incidentData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        priority: formData.priority,
        status: formData.status
      };
      
      // Adicionar campos opcionais apenas se tiverem valor válido
      if (formData.reported_by && formData.reported_by !== 'unspecified') {
        incidentData.reporter_id = formData.reported_by;
      }
      
      if (formData.assigned_to && formData.assigned_to !== 'unassigned') {
        incidentData.assignee_id = formData.assigned_to;
      }
      
      if (tenantId) {
        incidentData.tenant_id = tenantId;
      }

      console.log('📤 Dados SEGUROS para o Supabase:', incidentData);

      let result;
      
      if (incident) {
        // Atualizar incidente existente
        console.log('🔄 MODO EDIÇÃO - Atualizando incidente existente');
        console.log('🆔 ID do incidente:', incident.id);
        
        // Adicionar updated_at para updates
        incidentData.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('incidents')
          .update(incidentData)
          .eq('id', incident.id)
          .select()
          .single();
        
        console.log('📥 Resposta do Supabase UPDATE:', { data, error });

        if (error) {
          console.error('❌ ERRO DETALHADO DO SUPABASE UPDATE:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            stack: error.stack,
            fullError: error
          });
          console.error('📤 Dados que causaram o erro:', incidentData);
          console.error('🆔 ID do incidente:', incident.id);
          
          // Tentar identificar o campo problemático
          if (error.message && error.message.includes('column')) {
            console.error('🔍 Possível campo inexistente na tabela');
          }
          
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

        if (error) {
          console.error('❌ Erro ao criar incidente:', error);
          throw error;
        }
        
        result = data;
        
        console.log('✅ Incidente criado com sucesso:', result);
        toast.success('Incidente criado com sucesso!');
      }

      // Fechar modal e notificar sucesso
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('❌ ERRO CAPTURADO no catch:', error);
      toast.error(`Erro ao salvar incidente: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {incident ? 'Editar Incidente de Segurança' : 'Novo Incidente de Segurança'}
          </DialogTitle>
          <DialogDescription>
            {incident
              ? 'Edite as informações básicas do incidente de segurança'
              : 'Registre um novo incidente de segurança com informações básicas'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Atribuição
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Status
              </TabsTrigger>
            </TabsList>

            {/* Aba Básico */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Título do Incidente *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="Ex: Tentativa de acesso não autorizado detectada no sistema ERP"
                    className={errors.title ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={4}
                    placeholder="Descreva detalhadamente o incidente..."
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
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Segurança da Informação">Segurança da Informação</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Aplicações">Aplicações</SelectItem>
                      <SelectItem value="Dados e Privacidade">Dados e Privacidade</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Segurança Física">Segurança Física</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => updateFormData('priority', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Aba Atribuição */}
            <TabsContent value="assignment" className="space-y-4">
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
            </TabsContent>

            {/* Aba Status */}
            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
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
            </TabsContent>
          </Tabs>

          {/* Ações do Formulário */}
          <DialogFooter className="flex justify-between items-center pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {errors.tenant && (
                <span className="text-red-500">⚠️ {errors.tenant}</span>
              )}
            </div>
            
            <div className="flex space-x-4">
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
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentManagementModalSafe;