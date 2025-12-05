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
import { incidentService } from '@/services/incidentService';
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
  type: string;
  severity: string;
  detection_date: string;
  resolution_date: string;
  affected_systems: string[];
  business_impact: string;
}

interface Profile {
  id: string;
  full_name: string;
  job_title: string;
  email: string;
}

const IncidentManagementModalSeverityFixed: React.FC<IncidentManagementModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const tenantIdFromSelector = useCurrentTenantId();

  // Determinar tenant_id correto
  const getEffectiveTenantId = (): string => {
    if (user?.isPlatformAdmin) {
      return tenantIdFromSelector || '';
    }
    return user?.tenantId || '';
  };

  const effectiveTenantId = getEffectiveTenantId();

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
    business_impact: ''
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [newSystem, setNewSystem] = useState('');

  // Função para validar se um valor é um UUID válido
  const isValidUUID = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  };

  // Carregar perfis de usuários
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        let query = supabase
          .from('profiles')
          .select('id, full_name, job_title, email')
          .order('full_name', { ascending: true });

        if (effectiveTenantId) {
          query = query.eq('tenant_id', effectiveTenantId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Erro ao carregar perfis:', error);
          throw error;
        }

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
  }, [isOpen, effectiveTenantId]);

  // Preencher formulário quando incidente for carregado
  useEffect(() => {
    if (incident) {
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
        business_impact: incident.business_impact || ''
      });
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
        business_impact: ''
      });
      setActiveTab('basic');
    }
  }, [incident, user]);

  // Validação simples e funcional
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return false;
    }

    if (!effectiveTenantId) {
      toast.error('Tenant ID não encontrado');
      return false;
    }

    return true;
  };

  // Atualizar campo do formulário
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Adicionar sistema afetado
  const addAffectedSystem = () => {
    if (newSystem.trim() && !formData.affected_systems.includes(newSystem.trim())) {
      updateFormData('affected_systems', [...formData.affected_systems, newSystem.trim()]);
      setNewSystem('');
    }
  };

  // Remover sistema afetado
  const removeAffectedSystem = (system: string) => {
    updateFormData('affected_systems', formData.affected_systems.filter(s => s !== system));
  };

  // Função para criar dados seguros para o Supabase
  const createSafeUpdateData = (formData: FormData) => {
    const safeData: any = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      type: formData.type,
      severity: formData.severity,
      detection_date: new Date(formData.detection_date).toISOString(),
      business_impact: formData.business_impact.trim() || null,
      affected_systems: formData.affected_systems.length > 0 ? formData.affected_systems : null,
      tenant_id: effectiveTenantId
    };

    // Adicionar resolution_date apenas se preenchido
    if (formData.resolution_date) {
      safeData.resolution_date = new Date(formData.resolution_date).toISOString();
    }

    // Adicionar UUIDs apenas se forem válidos
    if (formData.reported_by &&
      formData.reported_by !== 'unspecified' &&
      isValidUUID(formData.reported_by)) {
      safeData.reporter_id = formData.reported_by;
    }

    if (formData.assigned_to &&
      formData.assigned_to !== 'unassigned' &&
      isValidUUID(formData.assigned_to)) {
      safeData.assignee_id = formData.assigned_to;
    }

    return safeData;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const incidentData = createSafeUpdateData(formData);

      if (incident) {
        // Atualizar incidente existente
        incidentData.updated_at = new Date().toISOString();

        await incidentService.updateIncident(incident.id, incidentData);
        toast.success('Incidente atualizado com sucesso!');
      } else {
        // Criar novo incidente
        const createData = {
          ...incidentData,
          created_at: new Date().toISOString()
        };

        await incidentService.createIncident(createData);
        toast.success('Incidente criado com sucesso!');
      }

      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('❌ ERRO:', error);
      toast.error(`Erro ao salvar incidente: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {incident ? 'Editar Incidente de Segurança' : 'Novo Incidente de Segurança'}
          </DialogTitle>
          <DialogDescription>
            {incident
              ? 'Edite as informações do incidente de segurança'
              : 'Registre um novo incidente de segurança com informações detalhadas'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="classification" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Classificação
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Atribuição
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Impacto
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
                    disabled={isSubmitting}
                  />
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
                    <Label htmlFor="detection_date">Data de Detecção *</Label>
                    <Input
                      id="detection_date"
                      type="datetime-local"
                      value={formData.detection_date}
                      onChange={(e) => updateFormData('detection_date', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba Classificação */}
            <TabsContent value="classification" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Incidente *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => updateFormData('type', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security_breach">Violação de Segurança</SelectItem>
                      <SelectItem value="malware">Malware</SelectItem>
                      <SelectItem value="phishing">Phishing</SelectItem>
                      <SelectItem value="data_breach">Vazamento de Dados</SelectItem>
                      <SelectItem value="unauthorized_access">Acesso Não Autorizado</SelectItem>
                      <SelectItem value="ddos_attack">Ataque DDoS</SelectItem>
                      <SelectItem value="social_engineering">Engenharia Social</SelectItem>
                      <SelectItem value="system_failure">Falha de Sistema</SelectItem>
                      <SelectItem value="network_incident">Incidente de Rede</SelectItem>
                      <SelectItem value="compliance_violation">Violação de Compliance</SelectItem>
                      <SelectItem value="physical_security">Segurança Física</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Severidade *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => updateFormData('severity', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
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

            {/* Aba Impacto */}
            <TabsContent value="impact" className="space-y-4">
              <div className="space-y-4">
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
                    {formData.affected_systems.map((system, index) => (
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
              </div>
            </TabsContent>
          </Tabs>

          {/* Ações do Formulário */}
          <DialogFooter className="flex justify-end items-center pt-6 border-t space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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

export default IncidentManagementModalSeverityFixed;