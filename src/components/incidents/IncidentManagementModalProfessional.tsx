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
  Clock,
  Users,
  Shield,
  FileText,
  DollarSign,
  Save,
  X,
  Loader2,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye
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
  // Informações Básicas
  title: string;
  description: string;
  incident_number: string;
  type: string;
  category: string;
  
  // Classificação
  severity: string;
  priority: string;
  
  // Status e Datas
  status: string;
  detection_date: string;
  response_start_date: string;
  resolution_date: string;
  
  // Sistemas e Impacto
  affected_systems: string[];
  affected_users_count: number;
  business_impact: string;
  financial_impact: number;
  
  // Responsabilidade
  reported_by: string;
  assigned_to: string;
  
  // Localização e Contexto
  location: string;
  source_ip: string;
  
  // Comunicação
  public_communication: boolean;
  regulatory_notification_required: boolean;
  
  // Recuperação
  recovery_actions: string;
  lessons_learned: string;
  preventive_measures: string;
  
  // Metadados
  tags: string[];
  external_reference: string;
}

interface Profile {
  id: string;
  full_name: string;
  job_title: string;
  email: string;
}

const IncidentManagementModalProfessional: React.FC<IncidentManagementModalProps> = ({
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
    incident_number: '',
    type: 'security_breach',
    category: 'Segurança da Informação',
    severity: 'medium',
    priority: 'medium',
    status: 'open',
    detection_date: new Date().toISOString().slice(0, 16),
    response_start_date: '',
    resolution_date: '',
    affected_systems: [],
    affected_users_count: 0,
    business_impact: '',
    financial_impact: 0,
    reported_by: 'unspecified',
    assigned_to: 'unassigned',
    location: '',
    source_ip: '',
    public_communication: false,
    regulatory_notification_required: false,
    recovery_actions: '',
    lessons_learned: '',
    preventive_measures: '',
    tags: [],
    external_reference: ''
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [newSystem, setNewSystem] = useState('');
  const [newTag, setNewTag] = useState('');

  // Gerar número do incidente automaticamente
  const generateIncidentNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    return `INC-${year}${month}${day}-${time}`;
  };

  // Carregar perfis de usuários
  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        console.log('🔄 Carregando perfis. TenantId:', tenantId, 'isPlatformAdmin:', user?.isPlatformAdmin);
        
        let query = supabase
          .from('profiles')
          .select('id, full_name, job_title, email')
          .order('full_name', { ascending: true });

        // Se tiver tenant_id e não for platform admin, filtrar por tenant
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
        incident_number: incident.incident_number || generateIncidentNumber(),
        type: incident.type || 'security_breach',
        category: incident.category || 'Segurança da Informação',
        severity: incident.severity || 'medium',
        priority: incident.priority || 'medium',
        status: incident.status || 'open',
        detection_date: incident.detection_date ? new Date(incident.detection_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        response_start_date: incident.response_start_date ? new Date(incident.response_start_date).toISOString().slice(0, 16) : '',
        resolution_date: incident.resolution_date ? new Date(incident.resolution_date).toISOString().slice(0, 16) : '',
        affected_systems: incident.affected_systems || [],
        affected_users_count: incident.affected_users_count || 0,
        business_impact: incident.business_impact || '',
        financial_impact: incident.financial_impact || 0,
        reported_by: incident.reported_by || 'unspecified',
        assigned_to: incident.assigned_to || 'unassigned',
        location: incident.location || '',
        source_ip: incident.source_ip || '',
        public_communication: incident.public_communication || false,
        regulatory_notification_required: incident.regulatory_notification_required || false,
        recovery_actions: incident.recovery_actions || '',
        lessons_learned: incident.lessons_learned || '',
        preventive_measures: incident.preventive_measures || '',
        tags: incident.tags || [],
        external_reference: incident.external_reference || ''
      });
      setErrors({});
    } else {
      // Reset para novo incidente
      setFormData({
        title: '',
        description: '',
        incident_number: generateIncidentNumber(),
        type: 'security_breach',
        category: 'Segurança da Informação',
        severity: 'medium',
        priority: 'medium',
        status: 'open',
        detection_date: new Date().toISOString().slice(0, 16),
        response_start_date: '',
        resolution_date: '',
        affected_systems: [],
        affected_users_count: 0,
        business_impact: '',
        financial_impact: 0,
        reported_by: user?.id || 'unspecified',
        assigned_to: 'unassigned',
        location: '',
        source_ip: '',
        public_communication: false,
        regulatory_notification_required: false,
        recovery_actions: '',
        lessons_learned: '',
        preventive_measures: '',
        tags: [],
        external_reference: ''
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

    if (!formData.detection_date) {
      newErrors.detection_date = 'Data de detecção é obrigatória';
    }

    // Validar tenant_id para usuários não platform admin
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
    if (newSystem.trim() && !formData.affected_systems.includes(newSystem.trim())) {
      updateFormData('affected_systems', [...formData.affected_systems, newSystem.trim()]);
      setNewSystem('');
    }
  };

  // Remover sistema afetado
  const removeAffectedSystem = (system: string) => {
    updateFormData('affected_systems', formData.affected_systems.filter(s => s !== system));
  };

  // Adicionar tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tag: string) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag));
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
      // Preparar dados para o Supabase - usando apenas campos que existem na tabela
      const incidentData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        category: formData.category,
        severity: formData.severity,
        priority: formData.priority,
        status: formData.status,
        detection_date: formData.detection_date ? new Date(formData.detection_date).toISOString() : new Date().toISOString(),
        resolution_date: formData.resolution_date ? new Date(formData.resolution_date).toISOString() : null,
        affected_systems: formData.affected_systems.length > 0 ? formData.affected_systems : null,
        business_impact: formData.business_impact.trim() || null,
        reporter_id: formData.reported_by === 'unspecified' ? null : formData.reported_by || null,
        assignee_id: formData.assigned_to === 'unassigned' ? null : formData.assigned_to || null,
        tenant_id: tenantId || null
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

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'investigating': return <Eye className="h-4 w-4" />;
      case 'contained': return <Shield className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'escalated': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Função para obter cor da severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {incident ? 'Editar Incidente de Segurança' : 'Novo Incidente de Segurança'}
          </DialogTitle>
          <DialogDescription>
            {incident
              ? 'Edite as informações do incidente de segurança seguindo as melhores práticas de ITIL e ISO 27001'
              : 'Registre um novo incidente de segurança com informações detalhadas para gestão eficaz'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="classification" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Classificação
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Impacto
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Atribuição
              </TabsTrigger>
              <TabsTrigger value="response" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Resposta
              </TabsTrigger>
            </TabsList>

            {/* Aba Básico */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
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
                  <Label htmlFor="incident_number">Número do Incidente</Label>
                  <Input
                    id="incident_number"
                    value={formData.incident_number}
                    onChange={(e) => updateFormData('incident_number', e.target.value)}
                    placeholder="INC-YYYYMMDD-HHMM"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="detection_date">Data de Detecção *</Label>
                  <Input
                    id="detection_date"
                    type="datetime-local"
                    value={formData.detection_date}
                    onChange={(e) => updateFormData('detection_date', e.target.value)}
                    className={errors.detection_date ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.detection_date && <p className="text-sm text-red-500 mt-1">{errors.detection_date}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={4}
                    placeholder="Descreva detalhadamente o incidente, incluindo como foi detectado, sintomas observados e contexto..."
                    disabled={isSubmitting}
                  />
                </div>

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
                      <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                      <SelectItem value="Terceiros">Terceiros</SelectItem>
                      <SelectItem value="Processo">Processo</SelectItem>
                      <SelectItem value="Ambiental">Ambiental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Aba Classificação */}
            <TabsContent value="classification" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Baixa</Badge>
                          <span>Impacto mínimo nas operações</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
                          <span>Impacto moderado nas operações</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
                          <span>Impacto significativo nas operações</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">Crítica</Badge>
                          <span>Impacto severo, requer ação imediata</span>
                        </div>
                      </SelectItem>
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
                      <SelectItem value="low">Baixa - Pode ser tratado em horário normal</SelectItem>
                      <SelectItem value="medium">Média - Deve ser tratado em prazo razoável</SelectItem>
                      <SelectItem value="high">Alta - Requer atenção prioritária</SelectItem>
                      <SelectItem value="critical">Crítica - Requer ação imediata 24/7</SelectItem>
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
                        <SelectItem value="open">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('open')}
                            <span>Aberto</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="investigating">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('investigating')}
                            <span>Investigando</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="contained">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('contained')}
                            <span>Contido</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="resolved">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('resolved')}
                            <span>Resolvido</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="closed">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('closed')}
                            <span>Fechado</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('cancelled')}
                            <span>Cancelado</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="escalated">
                          <div className="flex items-center gap-2">
                            {getStatusIcon('escalated')}
                            <span>Escalado</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Aba Impacto */}
            <TabsContent value="impact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="affected_users_count">Usuários Afetados</Label>
                  <Input
                    id="affected_users_count"
                    type="number"
                    min="0"
                    value={formData.affected_users_count}
                    onChange={(e) => updateFormData('affected_users_count', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="financial_impact">Impacto Financeiro (R$)</Label>
                  <Input
                    id="financial_impact"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.financial_impact}
                    onChange={(e) => updateFormData('financial_impact', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="business_impact">Impacto no Negócio</Label>
                  <Textarea
                    id="business_impact"
                    value={formData.business_impact}
                    onChange={(e) => updateFormData('business_impact', e.target.value)}
                    rows={3}
                    placeholder="Descreva o impacto no negócio, processos afetados, perda de produtividade..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="col-span-2">
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

                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="Ex: Escritório São Paulo, Datacenter AWS"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="source_ip">IP de Origem</Label>
                  <Input
                    id="source_ip"
                    value={formData.source_ip}
                    onChange={(e) => updateFormData('source_ip', e.target.value)}
                    placeholder="Ex: 192.168.1.100"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="public_communication"
                    checked={formData.public_communication}
                    onChange={(e) => updateFormData('public_communication', e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="public_communication">Comunicação Pública Necessária</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="regulatory_notification_required"
                    checked={formData.regulatory_notification_required}
                    onChange={(e) => updateFormData('regulatory_notification_required', e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="regulatory_notification_required">Notificação Regulatória Obrigatória</Label>
                </div>
              </div>
            </TabsContent>

            {/* Aba Resposta */}
            <TabsContent value="response" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="response_start_date">Início da Resposta</Label>
                  <Input
                    id="response_start_date"
                    type="datetime-local"
                    value={formData.response_start_date}
                    onChange={(e) => updateFormData('response_start_date', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="resolution_date">Data de Resolução</Label>
                  <Input
                    id="resolution_date"
                    type="datetime-local"
                    value={formData.resolution_date}
                    onChange={(e) => updateFormData('resolution_date', e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="recovery_actions">Ações de Recuperação</Label>
                  <Textarea
                    id="recovery_actions"
                    value={formData.recovery_actions}
                    onChange={(e) => updateFormData('recovery_actions', e.target.value)}
                    rows={3}
                    placeholder="Descreva as ações tomadas para recuperar os sistemas e serviços..."
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="lessons_learned">Lições Aprendidas</Label>
                  <Textarea
                    id="lessons_learned"
                    value={formData.lessons_learned}
                    onChange={(e) => updateFormData('lessons_learned', e.target.value)}
                    rows={3}
                    placeholder="Documente as lições aprendidas e melhorias identificadas..."
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="preventive_measures">Medidas Preventivas</Label>
                  <Textarea
                    id="preventive_measures"
                    value={formData.preventive_measures}
                    onChange={(e) => updateFormData('preventive_measures', e.target.value)}
                    rows={3}
                    placeholder="Descreva as medidas preventivas para evitar incidentes similares..."
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="external_reference">Referência Externa</Label>
                  <Input
                    id="external_reference"
                    value={formData.external_reference}
                    onChange={(e) => updateFormData('external_reference', e.target.value)}
                    placeholder="Ex: Ticket do fornecedor, número do caso CERT"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Adicionar tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTag}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
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
          <DialogFooter className="flex justify-between items-center pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {incident && (
                <>
                  <Badge className={getSeverityColor(formData.severity)}>
                    {formData.severity.toUpperCase()}
                  </Badge>
                  <span>•</span>
                  <span>#{formData.incident_number}</span>
                </>
              )}
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

export default IncidentManagementModalProfessional;