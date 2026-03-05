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
  Plus,
  Calendar,
  Clock,
  Activity,
  Target,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { incidentService } from '@/services/incidentService';
import type { Incident } from '@/types/incident-management';
import { cn } from '@/lib/utils';
import { useCustomFields } from '@/hooks/useCustomFields';
import { CustomFieldInputs } from '@/components/shared/CustomFieldInputs';

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
  target_resolution_date: string;
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

  // Custom Fields hook
  const { fields: customFields, fieldValues: customFieldValues, setFieldValues: setCustomFieldValues } = useCustomFields('incident', effectiveTenantId);

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
    target_resolution_date: ''
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
        business_impact: incident.business_impact || '',
        target_resolution_date: incident.target_resolution_date
          ? (typeof incident.target_resolution_date === 'string'
            ? incident.target_resolution_date.split('T')[0]
            : incident.target_resolution_date.toISOString().split('T')[0])
          : ''
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
        business_impact: '',
        target_resolution_date: ''
      });
      setActiveTab('basic');
    }
  }, [incident, user]);

  // Load initial custom field values when incident changes
  useEffect(() => {
    if (incident?.metadata?.custom_fields) {
      setCustomFieldValues(incident.metadata.custom_fields);
    } else {
      setCustomFieldValues({});
    }
  }, [incident, setCustomFieldValues]);

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
    console.log('🔍 [DEBUG] createSafeUpdateData - Input:', formData);
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
      tenant_id: effectiveTenantId,
      metadata: {
        ...(incident?.metadata || {}),
        custom_fields: customFieldValues as Record<string, any>,
      }
    };

    // Adicionar resolution_date apenas se preenchido
    if (formData.resolution_date) {
      safeData.resolution_date = new Date(formData.resolution_date).toISOString();
    }

    // Adicionar target_resolution_date apenas se preenchido
    if (formData.target_resolution_date) {
      // Adicionar horário final do dia para o prazo (23:59:59)
      // Adicionar T00:00:00 para garantir que o Date seja criado no fuso horário local, não UTC
      const date = new Date(formData.target_resolution_date + 'T00:00:00');
      date.setHours(23, 59, 59, 999);
      safeData.target_resolution_date = date.toISOString();
      console.log('🔍 [DEBUG] Added target_resolution_date:', safeData.target_resolution_date);
    } else {
      console.log('🔍 [DEBUG] No target_resolution_date in formData');
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
      console.log('🔍 [DEBUG] Submitting incident data:', incidentData);

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

  // Helper para cores de severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background">
        <div className="p-6 border-b bg-muted/10">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className={cn("p-2 rounded-lg", incident ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400")}>
                  {incident ? <AlertCircle className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                {incident ? 'Editar Incidente' : 'Novo Incidente'}
              </DialogTitle>
              {incident && (
                <Badge variant="outline" className={cn("capitalize", getSeverityColor(incident.severity))}>
                  {incident.severity}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-base">
              {incident
                ? 'Atualize as informações do incidente para manter o registro preciso.'
                : 'Preencha os detalhes abaixo para registrar um novo incidente de segurança.'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50 p-1">
                <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Detalhes</span>
                </TabsTrigger>
                <TabsTrigger value="classification" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Classificação</span>
                </TabsTrigger>
                <TabsTrigger value="assignment" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Equipe</span>
                </TabsTrigger>
                <TabsTrigger value="impact" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Impacto</span>
                </TabsTrigger>
              </TabsList>

              {/* Aba Básico */}
              <TabsContent value="basic" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                      Título do Incidente <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="Ex: Tentativa de acesso não autorizado no ERP"
                      disabled={isSubmitting}
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => updateFormData('category', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-11">
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

                    <div className="space-y-2">
                      <Label htmlFor="detection_date" className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        Data de Detecção
                      </Label>
                      <Input
                        id="detection_date"
                        type="datetime-local"
                        value={formData.detection_date}
                        onChange={(e) => updateFormData('detection_date', e.target.value)}
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="target_resolution_date" className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Prazo para Tratamento
                      </Label>
                      <Input
                        id="target_resolution_date"
                        type="date"
                        value={formData.target_resolution_date}
                        onChange={(e) => updateFormData('target_resolution_date', e.target.value)}
                        disabled={isSubmitting}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Descrição Detalhada</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={6}
                      placeholder="Descreva o que aconteceu, como foi detectado e as ações iniciais tomadas..."
                      disabled={isSubmitting}
                      className="resize-none min-h-[120px]"
                    />
                  </div>

                  {/* Informações Adicionais */}
                  {customFields.length > 0 && (
                    <div className="pt-4 border-t mt-6">
                      <h3 className="text-sm font-semibold mb-4 text-violet-700 dark:text-violet-400">Informações Adicionais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CustomFieldInputs
                          fields={customFields}
                          values={customFieldValues}
                          onChange={setCustomFieldValues}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Aba Classificação */}
              <TabsContent value="classification" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">Natureza do Incidente</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => updateFormData('type', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-11">
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

                    {incident && (
                      <div className="space-y-2">
                        <Label htmlFor="status">Status Atual</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => updateFormData('status', value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="h-11">
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

                  <div className="space-y-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold">Criticidade</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="severity">Severidade</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value) => updateFormData('severity', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-11">
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

                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => updateFormData('priority', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-11">
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
                </div>
              </TabsContent>

              {/* Aba Atribuição */}
              <TabsContent value="assignment" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-300">Responsável</h4>
                          <p className="text-xs text-blue-700 dark:text-blue-400">Quem está cuidando deste incidente?</p>
                        </div>
                      </div>

                      <Select
                        value={formData.assigned_to}
                        onValueChange={(value) => updateFormData('assigned_to', value)}
                        disabled={isSubmitting || isLoadingProfiles}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-background">
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

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-gray-50/50 dark:bg-gray-900/10 border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-300">Reportado por</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Quem identificou o incidente?</p>
                        </div>
                      </div>

                      <Select
                        value={formData.reported_by}
                        onValueChange={(value) => updateFormData('reported_by', value)}
                        disabled={isSubmitting || isLoadingProfiles}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-background">
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
                  </div>
                </div>
              </TabsContent>

              {/* Aba Impacto */}
              <TabsContent value="impact" className="space-y-6 mt-0">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Sistemas Afetados</Label>
                    <div className="p-4 rounded-lg border bg-card shadow-sm space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newSystem}
                          onChange={(e) => setNewSystem(e.target.value)}
                          placeholder="Digite o nome do sistema e pressione Enter..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAffectedSystem())}
                          disabled={isSubmitting}
                          className="h-11"
                        />
                        <Button
                          type="button"
                          onClick={addAffectedSystem}
                          disabled={isSubmitting}
                          className="h-11 px-4"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-muted/30 rounded-md border border-dashed">
                        {formData.affected_systems.length === 0 && (
                          <span className="text-sm text-muted-foreground self-center px-2">Nenhum sistema adicionado</span>
                        )}
                        {formData.affected_systems.map((system, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
                            {system}
                            <button
                              type="button"
                              onClick={() => removeAffectedSystem(system)}
                              className="ml-1 hover:text-destructive focus:outline-none rounded-full p-0.5 hover:bg-destructive/10 transition-colors"
                              disabled={isSubmitting}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_impact" className="text-sm font-medium">Impacto no Negócio</Label>
                    <Textarea
                      id="business_impact"
                      value={formData.business_impact}
                      onChange={(e) => updateFormData('business_impact', e.target.value)}
                      rows={4}
                      placeholder="Descreva o impacto financeiro, operacional ou reputacional..."
                      disabled={isSubmitting}
                      className="resize-none"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-6 border-t bg-muted/10 mt-auto">
            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[140px] h-11 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {incident ? 'Salvar Alterações' : 'Criar Incidente'}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentManagementModalSeverityFixed;