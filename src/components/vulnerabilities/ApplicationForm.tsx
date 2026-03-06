import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Layers,
  Globe,
  Smartphone,
  Code,
  Database,
  Cloud,
  Monitor,
  Edit
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

interface Application {
  id: string;
  name: string;
  type: string;
  status: string;
  url: string;
  technology: string;
  owner: string;
  description?: string;
  environment?: string;
  criticality?: string;
  dataClassification?: string;
  businessOwner?: string;
  technicalOwner?: string;
  lgpd?: boolean;
  sox?: boolean;
  acn?: boolean;
  internet?: boolean;
}

const APPLICATION_TYPES = [
  { value: 'Web Application', label: 'Aplicação Web', icon: Globe },
  { value: 'Mobile App', label: 'Aplicativo Mobile', icon: Smartphone },
  { value: 'API', label: 'API', icon: Code },
  { value: 'Database', label: 'Banco de Dados', icon: Database },
  { value: 'Cloud Service', label: 'Serviço em Nuvem', icon: Cloud },
  { value: 'Desktop App', label: 'Aplicativo Desktop', icon: Monitor },
];

const APPLICATION_STATUS = [
  { value: 'Active', label: 'Ativo' },
  { value: 'Development', label: 'Desenvolvimento' },
  { value: 'Testing', label: 'Teste' },
  { value: 'Maintenance', label: 'Manutenção' },
  { value: 'Deprecated', label: 'Descontinuado' },
];

const ENVIRONMENTS = [
  { value: 'Production', label: 'Produção' },
  { value: 'Staging', label: 'Homologação' },
  { value: 'Development', label: 'Desenvolvimento' },
  { value: 'Testing', label: 'Teste' },
];

const CRITICALITY_LEVELS = [
  { value: 'Critical', label: 'Crítica' },
  { value: 'High', label: 'Alta' },
  { value: 'Medium', label: 'Média' },
  { value: 'Low', label: 'Baixa' },
];

const DATA_CLASSIFICATIONS = [
  { value: 'Public', label: 'Público' },
  { value: 'Internal', label: 'Interno' },
  { value: 'Confidential', label: 'Confidencial' },
  { value: 'Restricted', label: 'Restrito' },
];

export interface ApplicationFormProps {
  applicationId?: string;
  isEmbedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ApplicationForm({
  applicationId,
  isEmbedded = false,
  onSuccess,
  onCancel
}: ApplicationFormProps = {}) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = applicationId || paramId;
  const isEditing = Boolean(id);
  const tenantId = useCurrentTenantId();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [formData, setFormData] = useState<Partial<Application>>({
    name: '',
    type: '',
    status: 'Development',
    url: '',
    technology: '',
    owner: '',
    description: '',
    environment: 'Development',
    criticality: 'Medium',
    dataClassification: 'Internal',
    businessOwner: '',
    technicalOwner: '',
    lgpd: false,
    sox: false,
    acn: false,
    internet: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, email');
        if (profiles) {
          setUsers(profiles);
        }
      } catch (err) {
        console.error('Error fetching profiles', err);
      }

      if (isEditing && id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('sistemas')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            setFormData({
              id: data.id,
              name: data.nome || '',
              type: data.tipo || 'Web Application',
              status: data.status || 'Active',
              url: data.documentacao_link || '',
              technology: data.fornecedor || '',
              owner: data.responsavel_tecnico || '',
              description: data.descricao || '',
              environment: 'Production',
              criticality: data.criticidade || 'Medium',
              dataClassification: 'Internal',
              businessOwner: data.responsavel_negocio || '',
              technicalOwner: data.responsavel_tecnico || '',
              lgpd: data.is_lgpd === true || data.lgpd === true || data.lgpd === 'Sim',
              sox: data.is_sox === true || data.sox === true || data.sox === 'Sim',
              acn: data.acn === true || data.is_acn === true || data.acn === 'Sim',
              internet: data.internet_facing === true || data.internet === true || data.internet === 'Sim' || data.internet_exposto === true || data.internet_exposto === 'Sim'
            });
          }
        } catch (error) {
          console.error("Error loading application:", error);
          toast.error('Erro ao carregar aplicação');
        } finally {
          setLoading(false);
        }
      }
    }
    loadData();
  }, [isEditing, id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome da aplicação é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo da aplicação é obrigatório';
    }

    if (!formData.status) {
      newErrors.status = 'Status é obrigatório';
    }

    if (!formData.technology?.trim()) {
      newErrors.technology = 'Tecnologia é obrigatória';
    }

    if (!formData.owner?.trim()) {
      newErrors.owner = 'Responsável é obrigatório';
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Por favor, insira uma URL válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    if (!tenantId) {
      toast.error('Selecione uma organização/empresa antes de salvar.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nome: formData.name,
        tipo: formData.type,
        status: formData.status,
        documentacao_link: formData.url,
        fornecedor: formData.technology,
        responsavel_tecnico: isValidUUID(formData.owner) ? formData.owner : null,
        descricao: formData.description,
        criticidade: formData.criticality,
        responsavel_negocio: isValidUUID(formData.businessOwner) ? formData.businessOwner : null,
        is_lgpd: formData.lgpd || false,
        is_sox: formData.sox || false,
        is_acn: formData.acn || false,
        internet_facing: formData.internet || false,
        tenant_id: tenantId,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('sistemas')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
        toast.success('Aplicação atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('sistemas')
          .insert([payload]);

        if (error) throw error;
        toast.success('Aplicação criada com sucesso');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/vulnerabilities/applications');
      }
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error('Erro ao salvar aplicação');
    } finally {
      setLoading(false);
    }
  };

  const isValidUUID = (uuid?: string) => {
    if (!uuid) return false;
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  const handleInputChange = (field: keyof Application, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleToggleChange = (field: keyof Application, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTypeIcon = (type: string) => {
    const appType = APPLICATION_TYPES.find(t => t.value === type);
    const IconComponent = appType?.icon || Globe;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "space-y-4" : "space-y-4 p-4"}>
      {/* Header - Row 1: Back + Title */}
      {!isEmbedded && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3 flex-shrink-0" onClick={() => navigate('/vulnerabilities/applications')}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Voltar</span>
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-1.5 truncate">
                <Layers className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="truncate">{isEditing ? 'Editar Aplicação' : 'Nova Aplicação'}</span>
              </h1>
            </div>
          </div>
          {/* Row 2: Action Buttons */}
          <div className="flex gap-1.5 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => navigate('/vulnerabilities/applications')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" form="app-form" size="sm" className="flex-1 h-8 text-xs" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-border border-t-primary mr-1"></div>
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      )}

      {isEmbedded && (
        <div className="flex justify-between items-center bg-muted/20 p-2 rounded-md border border-border/50">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Editar Aplicação
          </h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancel && onCancel()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" form="app-form" size="sm" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-border border-t-primary mr-1"></div>
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              Atualizar
            </Button>
          </div>
        </div>
      )}

      <form id="app-form" onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="flex overflow-x-auto w-full h-auto gap-0.5">
            <TabsTrigger value="basic" className="text-xs px-2 py-1.5 flex-shrink-0">Básico</TabsTrigger>
            <TabsTrigger value="technical" className="text-xs px-2 py-1.5 flex-shrink-0">Técnico</TabsTrigger>
            <TabsTrigger value="business" className="text-xs px-2 py-1.5 flex-shrink-0">Negócio</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-3">
            <Card>
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Aplicação *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="ex: Portal do Cliente"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo da Aplicação *</Label>
                    <Select value={formData.type || ''} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o tipo da aplicação" />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_TYPES.map(type => (
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status || ''} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUS.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Ambiente</Label>
                    <Select value={formData.environment || ''} onValueChange={(value) => handleInputChange('environment', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVIRONMENTS.map(env => (
                          <SelectItem key={env.value} value={env.value}>
                            {env.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url || ''}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://exemplo.com"
                    className={errors.url ? 'border-red-500' : ''}
                  />
                  {errors.url && (
                    <p className="text-sm text-red-500">{errors.url}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Breve descrição da aplicação"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4 mt-3">
            <Card>
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Detalhes Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="technology">Stack de Tecnologia *</Label>
                    <Input
                      id="technology"
                      value={formData.technology || ''}
                      onChange={(e) => handleInputChange('technology', e.target.value)}
                      placeholder="ex: React/Node.js, Java/Spring"
                      className={errors.technology ? 'border-red-500' : ''}
                    />
                    {errors.technology && (
                      <p className="text-sm text-red-500">{errors.technology}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner">Responsável Técnico *</Label>
                    <Select value={formData.owner || ''} onValueChange={(value) => handleInputChange('owner', value)}>
                      <SelectTrigger className={errors.owner ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o responsável técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.full_name || u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.owner && (
                      <p className="text-sm text-red-500">{errors.owner}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-4 mt-3">
            <Card>
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Informações de Negócio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessOwner">Proprietário do Negócio</Label>
                    <Select value={formData.businessOwner || ''} onValueChange={(value) => handleInputChange('businessOwner', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o proprietário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.full_name || u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technicalOwner">Contato Técnico (Opcional)</Label>
                    <Select value={formData.technicalOwner || ''} onValueChange={(value) => handleInputChange('technicalOwner', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o contato técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.full_name || u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="criticality">Criticidade do Negócio</Label>
                    <Select value={formData.criticality || ''} onValueChange={(value) => handleInputChange('criticality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a criticidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {CRITICALITY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataClassification">Classificação de Dados</Label>
                    <Select value={formData.dataClassification || ''} onValueChange={(value) => handleInputChange('dataClassification', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a classificação" />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_CLASSIFICATIONS.map(classification => (
                          <SelectItem key={classification.value} value={classification.value}>
                            {classification.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Compliance and Regulatory Toggles */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Conformidade e Regulamentação</Label>
                    <p className="text-sm text-muted-foreground">Indique quais regulamentações se aplicam a esta aplicação</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="lgpd" className="font-medium">LGPD</Label>
                        <p className="text-xs text-muted-foreground">Lei Geral de Proteção de Dados</p>
                      </div>
                      <Switch
                        id="lgpd"
                        checked={formData.lgpd || false}
                        onCheckedChange={(checked) => handleToggleChange('lgpd', checked)}
                        className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                        style={{
                          backgroundColor: formData.lgpd ? 'hsl(198 87% 50%)' : undefined
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="sox" className="font-medium">SOX</Label>
                        <p className="text-xs text-muted-foreground">Sarbanes-Oxley Act</p>
                      </div>
                      <Switch
                        id="sox"
                        checked={formData.sox || false}
                        onCheckedChange={(checked) => handleToggleChange('sox', checked)}
                        className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                        style={{
                          backgroundColor: formData.sox ? 'hsl(198 87% 50%)' : undefined
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="acn" className="font-medium">ACN</Label>
                        <p className="text-xs text-muted-foreground">Ativo Crítico de Negócio</p>
                      </div>
                      <Switch
                        id="acn"
                        checked={formData.acn || false}
                        onCheckedChange={(checked) => handleToggleChange('acn', checked)}
                        className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                        style={{
                          backgroundColor: formData.acn ? 'hsl(198 87% 50%)' : undefined
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="internet" className="font-medium">Internet</Label>
                        <p className="text-xs text-muted-foreground">Aplicação acessível via internet</p>
                      </div>
                      <Switch
                        id="internet"
                        checked={formData.internet || false}
                        onCheckedChange={(checked) => handleToggleChange('internet', checked)}
                        className="data-[state=checked]:!bg-[hsl(198_87%_50%)] data-[state=unchecked]:bg-input"
                        style={{
                          backgroundColor: formData.internet ? 'hsl(198 87% 50%)' : undefined
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}