import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Server,
  Save,
  ArrowLeft,
  X,
  Plus,
  User,
  MapPin,
  Shield,
  Network,
  Monitor,
  Smartphone,
  HardDrive,
  Building,
  Globe,
  Cpu
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAssetCustomFields } from './hooks/useAssetCustomFields';

interface Asset {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  criticality: string;
  ip_address: string;
  mac_address?: string;
  hostname?: string;
  domain?: string;
  network_zone?: string;
  location?: string;
  building?: string;
  floor?: string;
  room?: string;
  rack?: string;
  os?: string;
  os_version?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  asset_tag?: string;
  owner: string;
  department?: string;
  cost_center?: string;
  business_unit?: string;
  technical_contact?: string;
  compliance_frameworks?: string[];
  security_classification: string;
  encryption_required: boolean;
  backup_required: boolean;
  monitoring_enabled: boolean;
  purchase_date?: string;
  warranty_expiry?: string;
  eol_date?: string;
  last_audit_date?: string;
  next_audit_date?: string;
  tags: string[];
  notes?: string;
}

const ASSET_TYPE_OPTIONS = [
  { value: 'Server', label: 'Servidor', icon: Server },
  { value: 'Workstation', label: 'Workstation', icon: Monitor },
  { value: 'Network Device', label: 'Dispositivo de Rede', icon: Network },
  { value: 'Mobile Device', label: 'Dispositivo Móvel', icon: Smartphone },
  { value: 'Storage', label: 'Armazenamento', icon: HardDrive },
  { value: 'Infrastructure', label: 'Infraestrutura', icon: Building },
  { value: 'Cloud Service', label: 'Serviço em Nuvem', icon: Globe },
  { value: 'Virtual Machine', label: 'Máquina Virtual', icon: Cpu }
];

const STATUS_OPTIONS = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Inativo', label: 'Inativo' },
  { value: 'Manutenção', label: 'Manutenção' },
  { value: 'Descomissionado', label: 'Descomissionado' },
  { value: 'Em Teste', label: 'Em Teste' }
];

const CRITICALITY_OPTIONS = [
  { value: 'Critical', label: 'Crítico', color: 'bg-red-100 text-red-800' },
  { value: 'High', label: 'Alto', color: 'bg-orange-100 text-orange-800' },
  { value: 'Medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Low', label: 'Baixo', color: 'bg-green-100 text-green-800' }
];

const SECURITY_CLASSIFICATION_OPTIONS = [
  { value: 'Public', label: 'Público' },
  { value: 'Internal', label: 'Interno' },
  { value: 'Confidential', label: 'Confidencial' },
  { value: 'Restricted', label: 'Restrito' }
];

const NETWORK_ZONES = [
  { value: 'DMZ', label: 'DMZ' },
  { value: 'Internal', label: 'Rede Interna' },
  { value: 'Management', label: 'Rede de Gerência' },
  { value: 'Guest', label: 'Rede de Convidados' },
  { value: 'Production', label: 'Produção' },
  { value: 'Development', label: 'Desenvolvimento' }
];



export default function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { customFields, getFieldValues, saveFieldValues } = useAssetCustomFields();
  const isEditing = Boolean(id);
  

  
  const [loading, setLoading] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<Partial<Asset>>({
    id: '',
    name: '',
    type: '',
    description: '',
    status: 'Ativo',
    criticality: 'Medium',
    ip_address: '',
    mac_address: '',
    hostname: '',
    domain: '',
    network_zone: '',
    location: '',
    building: '',
    floor: '',
    room: '',
    rack: '',
    os: '',
    os_version: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    asset_tag: '',
    owner: '',
    department: '',
    cost_center: '',
    business_unit: '',
    technical_contact: '',
    compliance_frameworks: [],
    security_classification: 'Internal',
    encryption_required: false,
    backup_required: true,
    monitoring_enabled: true,
    purchase_date: '',
    warranty_expiry: '',
    eol_date: '',
    last_audit_date: '',
    next_audit_date: '',
    tags: [],
    notes: ''
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      loadAsset(id);
      loadCustomFieldValues(id);
    }
  }, [id, isEditing]);

  const loadCustomFieldValues = async (assetId: string) => {
    try {
      const values = await getFieldValues(assetId);
      setCustomFieldValues(values);
    } catch (error) {
      console.error('Error loading custom field values:', error);
    }
  };

  const loadAsset = async (assetId: string) => {
    setLoading(true);
    try {
      // Em uma aplicação real, isso buscaria os dados do ativo
      setTimeout(() => {
        // Dados simulados para edição
        setFormData({
          id: id,
          name: 'Web Server 01',
          type: 'Server',
          description: 'Servidor web principal da aplicação',
          status: 'Ativo',
          criticality: 'High',
          ip_address: '192.168.1.10',
          mac_address: '00:1B:44:11:3A:B7',
          hostname: 'srv-web-01',
          domain: 'empresa.local',
          network_zone: 'DMZ',
          location: 'Datacenter SP',
          building: 'Prédio A',
          floor: '2º andar',
          room: 'Sala 201',
          rack: 'Rack A-01',
          os: 'Ubuntu 22.04 LTS',
          os_version: '22.04.3',
          manufacturer: 'Dell',
          model: 'PowerEdge R740',
          serial_number: 'ABC123456',
          asset_tag: 'AST-001',
          owner: 'João Silva',
          department: 'TI',
          cost_center: 'CC-001-TI',
          business_unit: 'Operações',
          technical_contact: 'admin@empresa.com',
          compliance_frameworks: [],
          security_classification: 'Confidential',
          encryption_required: true,
          backup_required: true,
          monitoring_enabled: true,
          purchase_date: '2023-01-15',
          warranty_expiry: '2026-01-15',
          eol_date: '2028-01-15',
          tags: ['servidor', 'web', 'produção'],
          notes: 'Servidor crítico para operação'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading asset:', error);
      toast.error('Erro ao carregar ativo');
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome do ativo é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo do ativo é obrigatório';
    }

    if (!formData.ip_address?.trim()) {
      newErrors.ip_address = 'Endereço IP é obrigatório';
    } else {
      // Basic IP validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ip_address)) {
        newErrors.ip_address = 'Formato de IP inválido';
      }
    }

    if (!formData.owner?.trim()) {
      newErrors.owner = 'Responsável é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save custom field values
      const assetId = id || 'new-' + Date.now();
      await saveFieldValues(assetId, customFieldValues);

      if (isEditing) {
        toast.success('Ativo atualizado com sucesso');
      } else {
        toast.success('Ativo criado com sucesso');
      }

      navigate('/vulnerabilities/cmdb');
    } catch (error) {
      toast.error('Erro ao salvar ativo');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Asset, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggleChange = (field: keyof Asset, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };



  const getTypeIcon = (type: string) => {
    const assetType = ASSET_TYPE_OPTIONS.find(t => t.value === type);
    const IconComponent = assetType?.icon || Server;
    return <IconComponent className="h-4 w-4" />;
  };

  const renderCustomField = (field: any) => {
    const value = customFieldValues[field.name] || field.defaultValue || '';
    
    const updateCustomFieldValue = (fieldName: string, newValue: any) => {
      setCustomFieldValues(prev => ({
        ...prev,
        [fieldName]: newValue
      }));
    };

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select 
              value={value} 
              onValueChange={(newValue) => updateCustomFieldValue(field.name, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Selecione ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => updateCustomFieldValue(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={Boolean(value)}
                onCheckedChange={(checked) => updateCustomFieldValue(field.name, checked)}
                className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                style={{
                  backgroundColor: Boolean(value) ? 'hsl(198 87% 50%)' : undefined
                }}
              />
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => updateCustomFieldValue(field.name, e.target.value)}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => updateCustomFieldValue(field.name, e.target.value)}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="email"
              value={value}
              onChange={(e) => updateCustomFieldValue(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      case 'url':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="url"
              value={value}
              onChange={(e) => updateCustomFieldValue(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
      
      default: // text, phone
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type === 'phone' ? 'tel' : 'text'}
              value={value}
              onChange={(e) => updateCustomFieldValue(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/vulnerabilities/cmdb')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Server className="h-8 w-8 text-primary" />
              {isEditing ? 'Editar Ativo' : 'Novo Ativo'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualizar informações do ativo' : 'Adicionar um novo ativo ao inventário CMDB'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="network">Detalhes de Rede</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
            <TabsTrigger value="management">Gestão</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Informações essenciais sobre o ativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id">ID do Ativo</Label>
                    <Input
                      id="id"
                      value={formData.id || ''}
                      onChange={(e) => handleInputChange('id', e.target.value)}
                      placeholder="ex: AST-001, SRV-WEB-01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Ativo *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="ex: Web Server 01"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo do Ativo *</Label>
                    <Select value={formData.type || ''} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o tipo do ativo" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPE_OPTIONS.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-500">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="criticality">Criticidade</Label>
                    <Select value={formData.criticality || ''} onValueChange={(value) => handleInputChange('criticality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a criticidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {CRITICALITY_OPTIONS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={level.color}>{level.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Breve descrição do ativo"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Fabricante</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer || ''}
                      onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                      placeholder="ex: Dell, HP, Cisco"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      value={formData.model || ''}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      placeholder="ex: PowerEdge R740"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serial_number">Número de Série</Label>
                    <Input
                      id="serial_number"
                      value={formData.serial_number || ''}
                      onChange={(e) => handleInputChange('serial_number', e.target.value)}
                      placeholder="Número de série do equipamento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset_tag">Tag do Ativo</Label>
                    <Input
                      id="asset_tag"
                      value={formData.asset_tag || ''}
                      onChange={(e) => handleInputChange('asset_tag', e.target.value)}
                      placeholder="Tag de identificação interna"
                    />
                  </div>
                </div>

                {/* Custom Fields for Basic Tab */}
                {customFields.filter(field => field.tab === 'basic').length > 0 && (
                  <div className="space-y-4">
                    {/* Render section title/subtitle if available */}
                    {(() => {
                      const firstField = customFields.find(field => field.tab === 'basic' && (field.sectionTitle || field.sectionSubtitle));
                      if (firstField && (firstField.sectionTitle || firstField.sectionSubtitle)) {
                        return (
                          <div>
                            {firstField.sectionTitle && (
                              <Label className="text-base font-semibold">{firstField.sectionTitle}</Label>
                            )}
                            {firstField.sectionSubtitle && (
                              <p className="text-sm text-muted-foreground">{firstField.sectionSubtitle}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields
                        .filter(field => field.tab === 'basic')
                        .sort((a, b) => a.order - b.order)
                        .map(field => renderCustomField(field))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes de Rede</CardTitle>
                <CardDescription>
                  Informações de conectividade e configuração de rede
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">Endereço IP *</Label>
                    <Input
                      id="ip_address"
                      value={formData.ip_address || ''}
                      onChange={(e) => handleInputChange('ip_address', e.target.value)}
                      placeholder="ex: 192.168.1.10"
                      className={errors.ip_address ? 'border-red-500' : ''}
                    />
                    {errors.ip_address && (
                      <p className="text-sm text-red-500">{errors.ip_address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mac_address">Endereço MAC</Label>
                    <Input
                      id="mac_address"
                      value={formData.mac_address || ''}
                      onChange={(e) => handleInputChange('mac_address', e.target.value)}
                      placeholder="ex: 00:1B:44:11:3A:B7"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hostname">Hostname</Label>
                    <Input
                      id="hostname"
                      value={formData.hostname || ''}
                      onChange={(e) => handleInputChange('hostname', e.target.value)}
                      placeholder="ex: srv-web-01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Domínio</Label>
                    <Input
                      id="domain"
                      value={formData.domain || ''}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      placeholder="ex: empresa.local"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="network_zone">Zona de Rede</Label>
                    <Select value={formData.network_zone || ''} onValueChange={(value) => handleInputChange('network_zone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a zona de rede" />
                      </SelectTrigger>
                      <SelectContent>
                        {NETWORK_ZONES.map(zone => (
                          <SelectItem key={zone.value} value={zone.value}>
                            {zone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="os">Sistema Operacional</Label>
                    <Input
                      id="os"
                      value={formData.os || ''}
                      onChange={(e) => handleInputChange('os', e.target.value)}
                      placeholder="ex: Ubuntu 22.04 LTS"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="os_version">Versão do SO</Label>
                  <Input
                    id="os_version"
                    value={formData.os_version || ''}
                    onChange={(e) => handleInputChange('os_version', e.target.value)}
                    placeholder="ex: 22.04.3 LTS"
                  />
                </div>

                {/* Custom Fields for Network Tab */}
                {customFields.filter(field => field.tab === 'network').length > 0 && (
                  <div className="space-y-4">
                    {/* Render section title/subtitle if available */}
                    {(() => {
                      const firstField = customFields.find(field => field.tab === 'network' && (field.sectionTitle || field.sectionSubtitle));
                      if (firstField && (firstField.sectionTitle || firstField.sectionSubtitle)) {
                        return (
                          <div>
                            {firstField.sectionTitle && (
                              <Label className="text-base font-semibold">{firstField.sectionTitle}</Label>
                            )}
                            {firstField.sectionSubtitle && (
                              <p className="text-sm text-muted-foreground">{firstField.sectionSubtitle}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields
                        .filter(field => field.tab === 'network')
                        .sort((a, b) => a.order - b.order)
                        .map(field => renderCustomField(field))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
                <CardDescription>
                  Informações sobre a localização física do ativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização Principal</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="ex: Datacenter SP, Escritório RJ, Filial BH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building">Prédio</Label>
                    <Input
                      id="building"
                      value={formData.building || ''}
                      onChange={(e) => handleInputChange('building', e.target.value)}
                      placeholder="ex: Prédio A, Torre Norte"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">Andar</Label>
                    <Input
                      id="floor"
                      value={formData.floor || ''}
                      onChange={(e) => handleInputChange('floor', e.target.value)}
                      placeholder="ex: 5º andar"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Sala</Label>
                    <Input
                      id="room"
                      value={formData.room || ''}
                      onChange={(e) => handleInputChange('room', e.target.value)}
                      placeholder="ex: Sala 501"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rack">Rack</Label>
                    <Input
                      id="rack"
                      value={formData.rack || ''}
                      onChange={(e) => handleInputChange('rack', e.target.value)}
                      placeholder="ex: Rack A-01"
                    />
                  </div>
                </div>

                {/* Custom Fields for Location Tab */}
                {customFields.filter(field => field.tab === 'location').length > 0 && (
                  <div className="space-y-4">
                    {/* Render section title/subtitle if available */}
                    {(() => {
                      const firstField = customFields.find(field => field.tab === 'location' && (field.sectionTitle || field.sectionSubtitle));
                      if (firstField && (firstField.sectionTitle || firstField.sectionSubtitle)) {
                        return (
                          <div>
                            {firstField.sectionTitle && (
                              <Label className="text-base font-semibold">{firstField.sectionTitle}</Label>
                            )}
                            {firstField.sectionSubtitle && (
                              <p className="text-sm text-muted-foreground">{firstField.sectionSubtitle}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields
                        .filter(field => field.tab === 'location')
                        .sort((a, b) => a.order - b.order)
                        .map(field => renderCustomField(field))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão</CardTitle>
                <CardDescription>
                  Informações de propriedade e gestão do ativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner">Responsável Principal *</Label>
                    <Input
                      id="owner"
                      value={formData.owner || ''}
                      onChange={(e) => handleInputChange('owner', e.target.value)}
                      placeholder="ex: João Silva"
                      className={errors.owner ? 'border-red-500' : ''}
                    />
                    {errors.owner && (
                      <p className="text-sm text-red-500">{errors.owner}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technical_contact">Contato Técnico</Label>
                    <Input
                      id="technical_contact"
                      value={formData.technical_contact || ''}
                      onChange={(e) => handleInputChange('technical_contact', e.target.value)}
                      placeholder="ex: admin@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="ex: TI, Financeiro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_unit">Unidade de Negócio</Label>
                    <Input
                      id="business_unit"
                      value={formData.business_unit || ''}
                      onChange={(e) => handleInputChange('business_unit', e.target.value)}
                      placeholder="ex: Operações, Vendas"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_center">Centro de Custo</Label>
                  <Input
                    id="cost_center"
                    value={formData.cost_center || ''}
                    onChange={(e) => handleInputChange('cost_center', e.target.value)}
                    placeholder="ex: CC-001-TI"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Data de Aquisição</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date || ''}
                      onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warranty_expiry">Fim da Garantia</Label>
                    <Input
                      id="warranty_expiry"
                      type="date"
                      value={formData.warranty_expiry || ''}
                      onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eol_date">End of Life</Label>
                    <Input
                      id="eol_date"
                      type="date"
                      value={formData.eol_date || ''}
                      onChange={(e) => handleInputChange('eol_date', e.target.value)}
                    />
                  </div>
                </div>

                {/* Custom Fields for Management Tab */}
                {customFields.filter(field => field.tab === 'management').length > 0 && (
                  <div className="space-y-4">
                    {/* Render section title/subtitle if available */}
                    {(() => {
                      const firstField = customFields.find(field => field.tab === 'management' && (field.sectionTitle || field.sectionSubtitle));
                      if (firstField && (firstField.sectionTitle || firstField.sectionSubtitle)) {
                        return (
                          <div>
                            {firstField.sectionTitle && (
                              <Label className="text-base font-semibold">{firstField.sectionTitle}</Label>
                            )}
                            {firstField.sectionSubtitle && (
                              <p className="text-sm text-muted-foreground">{firstField.sectionSubtitle}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields
                        .filter(field => field.tab === 'management')
                        .sort((a, b) => a.order - b.order)
                        .map(field => renderCustomField(field))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Configurações de segurança e conformidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="security_classification">Classificação de Segurança</Label>
                  <Select value={formData.security_classification || ''} onValueChange={(value) => handleInputChange('security_classification', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classificação" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECURITY_CLASSIFICATION_OPTIONS.map(classification => (
                        <SelectItem key={classification.value} value={classification.value}>
                          {classification.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Security Toggles */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Configurações de Segurança</Label>
                    <p className="text-sm text-muted-foreground">Configure as políticas de segurança para este ativo</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="encryption_required" className="font-medium">Criptografia Obrigatória</Label>
                        <p className="text-xs text-muted-foreground">Dados devem ser criptografados</p>
                      </div>
                      <Switch
                        id="encryption_required"
                        checked={formData.encryption_required || false}
                        onCheckedChange={(checked) => handleToggleChange('encryption_required', checked)}
                        className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                        style={{
                          backgroundColor: formData.encryption_required ? 'hsl(198 87% 50%)' : undefined
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="backup_required" className="font-medium">Backup Obrigatório</Label>
                        <p className="text-xs text-muted-foreground">Backup regular é necessário</p>
                      </div>
                      <Switch
                        id="backup_required"
                        checked={formData.backup_required || false}
                        onCheckedChange={(checked) => handleToggleChange('backup_required', checked)}
                        className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                        style={{
                          backgroundColor: formData.backup_required ? 'hsl(198 87% 50%)' : undefined
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="monitoring_enabled" className="font-medium">Monitoramento Ativo</Label>
                        <p className="text-xs text-muted-foreground">Monitoramento 24/7 habilitado</p>
                      </div>
                      <Switch
                        id="monitoring_enabled"
                        checked={formData.monitoring_enabled || false}
                        onCheckedChange={(checked) => handleToggleChange('monitoring_enabled', checked)}
                        className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                        style={{
                          backgroundColor: formData.monitoring_enabled ? 'hsl(198 87% 50%)' : undefined
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Nova tag"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionais</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Informações adicionais sobre o ativo..."
                    rows={3}
                  />
                </div>

              {/* Custom Fields for Security Tab */}
              {customFields.filter(field => field.tab === 'security').length > 0 && (
                <div className="space-y-4">
                  {/* Render section title/subtitle if available */}
                  {(() => {
                    const firstField = customFields.find(field => field.tab === 'security' && (field.sectionTitle || field.sectionSubtitle));
                    if (firstField && (firstField.sectionTitle || firstField.sectionSubtitle)) {
                      return (
                        <div>
                          {firstField.sectionTitle && (
                            <Label className="text-base font-semibold">{firstField.sectionTitle}</Label>
                          )}
                          {firstField.sectionSubtitle && (
                            <p className="text-sm text-muted-foreground">{firstField.sectionSubtitle}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFields
                      .filter(field => field.tab === 'security')
                      .sort((a, b) => a.order - b.order)
                      .map(field => renderCustomField(field))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/vulnerabilities/cmdb')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-border border-t-primary mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Atualizar Ativo' : 'Criar Ativo'}
          </Button>
        </div>
      </form>
    </div>
  );
}