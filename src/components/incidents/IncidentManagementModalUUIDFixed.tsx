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
  Shield,
  Plus
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
  // Campos opcionais que podem ou não existir na tabela
  type?: string;
  severity?: string;
  detection_date?: string;
  resolution_date?: string;
  affected_systems?: string[];
  business_impact?: string;
  tags?: string[];
}

interface Profile {
  id: string;
  full_name: string;
  job_title: string;
  email: string;
}

const IncidentManagementModalUUIDFixed: React.FC<IncidentManagementModalProps> = ({
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
    reported_by: 'unspecified',
    assigned_to: 'unassigned',
    type: 'security_breach',
    severity: 'medium',
    detection_date: new Date().toISOString().slice(0, 16),
    resolution_date: '',
    affected_systems: [],
    business_impact: '',
    tags: []
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [newSystem, setNewSystem] = useState('');
  const [newTag, setNewTag] = useState('');
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  // Função para validar se um valor é um UUID válido
  const isValidUUID = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  // Verificar campos disponíveis na tabela
  useEffect(() => {
    const checkAvailableFields = async () => {
      try {
        console.log('🔍 Verificando campos disponíveis na tabela incidents...');
        
        const { data: incidents, error } = await supabase
          .from('incidents')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('❌ Erro ao verificar campos:', error);
          return;
        }
        
        if (incidents && incidents.length > 0) {
          const fields = Object.keys(incidents[0]);
          console.log('📊 Campos disponíveis:', fields);
          setAvailableFields(fields);
        } else {
          // Se não há incidentes, usar campos básicos
          setAvailableFields(['id', 'title', 'description', 'category', 'priority', 'status', 'created_at', 'updated_at']);
        }
        
      } catch (error) {
        console.error('❌ Erro ao verificar campos disponíveis:', error);
        // Fallback para campos básicos
        setAvailableFields(['id', 'title', 'description', 'category', 'priority', 'status', 'created_at', 'updated_at']);
      }
    };

    if (isOpen) {
      checkAvailableFields();
    }
  }, [isOpen]);

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
        console.log('📋 Perfis detalhados:', data);
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
        assigned_to: incident.assigned_to || 'unassigned',
        type: incident.type || 'security_breach',
        severity: incident.severity || 'medium',
        detection_date: incident.detection_date ? new Date(incident.detection_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        resolution_date: incident.resolution_date ? new Date(incident.resolution_date).toISOString().slice(0, 16) : '',
        affected_systems: incident.affected_systems || [],
        business_impact: incident.business_impact || '',
        tags: incident.tags || []
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
        assigned_to: 'unassigned',
        type: 'security_breach',
        severity: 'medium',
        detection_date: new Date().toISOString().slice(0, 16),
        resolution_date: '',
        affected_systems: [],
        business_impact: '',
        tags: []
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

    // Validar UUIDs se os campos existirem
    if (availableFields.includes('reporter_id') && formData.reported_by && formData.reported_by !== 'unspecified') {
      if (!isValidUUID(formData.reported_by)) {
        newErrors.reported_by = 'ID do usuário reportador inválido';
      }
    }

    if (availableFields.includes('assignee_id') && formData.assigned_to && formData.assigned_to !== 'unassigned') {
      if (!isValidUUID(formData.assigned_to)) {
        newErrors.assigned_to = 'ID do usuário responsável inválido';
      }
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

  // Adicionar sistema afetado
  const addAffectedSystem = () => {
    if (newSystem.trim() && !formData.affected_systems?.includes(newSystem.trim())) {
      updateFormData('affected_systems', [...(formData.affected_systems || []), newSystem.trim()]);
      setNewSystem('');
    }
  };

  // Remover sistema afetado
  const removeAffectedSystem = (system: string) => {
    updateFormData('affected_systems', formData.affected_systems?.filter(s => s !== system) || []);
  };

  // Adicionar tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      updateFormData('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tag: string) => {
    updateFormData('tags', formData.tags?.filter(t => t !== tag) || []);
  };

  // Função para criar dados seguros baseados nos campos disponíveis
  const createSafeUpdateData = (formData: FormData) => {
    const safeData: any = {};
    
    console.log('🔧 Criando dados seguros para update...');
    console.log('📋 FormData recebido:', formData);
    console.log('📊 Campos disponíveis:', availableFields);
    
    // Campos básicos que sempre devem existir
    safeData.title = formData.title.trim();
    safeData.description = formData.description.trim() || null;
    safeData.category = formData.category;
    safeData.priority = formData.priority;
    safeData.status = formData.status;
    
    // Campos opcionais baseados na disponibilidade
    if (availableFields.includes('type') && formData.type) {
      safeData.type = formData.type;
    }
    
    if (availableFields.includes('severity') && formData.severity) {
      safeData.severity = formData.severity;
    }
    
    if (availableFields.includes('detection_date') && formData.detection_date) {
      safeData.detection_date = new Date(formData.detection_date).toISOString();
    }
    
    if (availableFields.includes('resolution_date') && formData.resolution_date) {
      safeData.resolution_date = new Date(formData.resolution_date).toISOString();
    }
    
    if (availableFields.includes('affected_systems') && formData.affected_systems && formData.affected_systems.length > 0) {
      safeData.affected_systems = formData.affected_systems;
    }
    
    if (availableFields.includes('business_impact') && formData.business_impact) {
      safeData.business_impact = formData.business_impact.trim();
    }
    
    // CORREÇÃO CRÍTICA: Validar UUIDs antes de inserir
    if (availableFields.includes('reporter_id') && formData.reported_by && formData.reported_by !== 'unspecified') {
      if (isValidUUID(formData.reported_by)) {
        safeData.reporter_id = formData.reported_by;
        console.log('✅ reporter_id válido:', formData.reported_by);
      } else {
        console.warn('⚠️ reporter_id inválido (não é UUID):', formData.reported_by);
        // Não incluir o campo se não for um UUID válido
      }
    }
    
    if (availableFields.includes('assignee_id') && formData.assigned_to && formData.assigned_to !== 'unassigned') {
      if (isValidUUID(formData.assigned_to)) {
        safeData.assignee_id = formData.assigned_to;
        console.log('✅ assignee_id válido:', formData.assigned_to);
      } else {
        console.warn('⚠️ assignee_id inválido (não é UUID):', formData.assigned_to);
        // Não incluir o campo se não for um UUID válido
      }
    }
    
    if (availableFields.includes('tenant_id') && tenantId) {
      if (isValidUUID(tenantId)) {
        safeData.tenant_id = tenantId;
        console.log('✅ tenant_id válido:', tenantId);
      } else {
        console.warn('⚠️ tenant_id inválido (não é UUID):', tenantId);
        // Não incluir o campo se não for um UUID válido
      }
    }
    
    if (availableFields.includes('tags') && formData.tags && formData.tags.length > 0) {
      safeData.tags = formData.tags;
    }
    
    console.log('📤 Dados seguros finais:', safeData);
    return safeData;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 SUBMIT INICIADO - handleSubmit chamado');
    console.log('📋 Dados do formulário:', formData);
    console.log('🔍 Incident atual:', incident);
    console.log('🏢 Tenant ID:', tenantId);
    console.log('👤 User:', user);
    console.log('📊 Campos disponíveis:', availableFields);

    const isValid = validateForm();
    if (!isValid) {
      console.log('❌ Validação falhou - interrompendo submit');
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Criar dados seguros baseados nos campos disponíveis
      const incidentData = createSafeUpdateData(formData);
      
      console.log('📤 Dados SEGUROS para o Supabase:', incidentData);

      let result;
      
      if (incident) {
        // Atualizar incidente existente
        console.log('🔄 MODO EDIÇÃO - Atualizando incidente existente');
        console.log('🆔 ID do incidente:', incident.id);
        
        // Adicionar updated_at se o campo existir
        if (availableFields.includes('updated_at')) {
          incidentData.updated_at = new Date().toISOString();
        }
        
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
          console.error('📊 Campos disponíveis:', availableFields);
          
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

  // Verificar se um campo está disponível
  const isFieldAvailable = (fieldName: string) => {
    return availableFields.includes(fieldName);
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
              ? 'Edite as informações do incidente de segurança'
              : 'Registre um novo incidente de segurança'
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
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Avançado
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {errors.reported_by && <p className="text-sm text-red-500 mt-1">{errors.reported_by}</p>}
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
                  {errors.assigned_to && <p className="text-sm text-red-500 mt-1">{errors.assigned_to}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Aba Avançado */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                {isFieldAvailable('business_impact') && (
                  <div>
                    <Label htmlFor="business_impact">Impacto no Negócio</Label>
                    <Textarea
                      id="business_impact"
                      value={formData.business_impact}
                      onChange={(e) => updateFormData('business_impact', e.target.value)}
                      rows={3}
                      placeholder="Descreva o impacto no negócio..."
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {isFieldAvailable('affected_systems') && (
                  <div>
                    <Label>Sistemas Afetados</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSystem}
                        onChange={(e) => setNewSystem(e.target.value)}
                        placeholder="Nome do sistema ou aplicação"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAffectedSystem())}
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAffectedSystem}
                        disabled={isSubmitting}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.affected_systems?.map((system, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {system}
                          <button
                            type="button"
                            onClick={() => removeAffectedSystem(system)}
                            className="ml-1 hover:text-red-500"
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              <strong>Debug:</strong> Campos disponíveis: {availableFields.join(', ')}
              <br />
              <strong>Perfis carregados:</strong> {profiles.length}
              <br />
              <strong>User ID:</strong> {user?.id}
              <br />
              <strong>Tenant ID:</strong> {tenantId}
            </div>
          )}

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

export default IncidentManagementModalUUIDFixed;