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
  Monitor
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

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

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
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
    if (isEditing && id) {
      // Em uma aplicação real, isso buscaria os dados da aplicação
      // Por enquanto, vamos simular o carregamento de dados existentes
      setLoading(true);
      setTimeout(() => {
        // Dados simulados para edição
        setFormData({
          id: id,
          name: 'Aplicação de Exemplo',
          type: 'Web Application',
          status: 'Active',
          url: 'https://exemplo.com',
          technology: 'React/Node.js',
          owner: 'Equipe de Desenvolvimento',
          description: 'Descrição da aplicação de exemplo',
          environment: 'Production',
          criticality: 'High',
          dataClassification: 'Confidential',
          businessOwner: 'João Silva',
          technicalOwner: 'Maria Santos',
          lgpd: true,
          sox: false,
          acn: true,
          internet: true
        });
        setLoading(false);
      }, 1000);
    }
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

    setLoading(true);

    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isEditing) {
        toast.success('Aplicação atualizada com sucesso');
      } else {
        toast.success('Aplicação criada com sucesso');
      }

      navigate('/vulnerabilities/applications');
    } catch (error) {
      toast.error('Erro ao salvar aplicação');
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/vulnerabilities/applications')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Layers className="h-8 w-8 text-primary" />
              {isEditing ? 'Editar Aplicação' : 'Nova Aplicação'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualizar informações da aplicação' : 'Adicionar uma nova aplicação ao inventário'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="technical">Detalhes Técnicos</TabsTrigger>
            <TabsTrigger value="business">Informações de Negócio</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Informações essenciais sobre a aplicação
                </CardDescription>
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

          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes Técnicos</CardTitle>
                <CardDescription>
                  Informações técnicas sobre a aplicação
                </CardDescription>
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
                    <Input
                      id="owner"
                      value={formData.owner || ''}
                      onChange={(e) => handleInputChange('owner', e.target.value)}
                      placeholder="ex: Equipe de Desenvolvimento"
                      className={errors.owner ? 'border-red-500' : ''}
                    />
                    {errors.owner && (
                      <p className="text-sm text-red-500">{errors.owner}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Negócio</CardTitle>
                <CardDescription>
                  Contexto de negócio e informações de propriedade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessOwner">Proprietário do Negócio</Label>
                    <Input
                      id="businessOwner"
                      value={formData.businessOwner || ''}
                      onChange={(e) => handleInputChange('businessOwner', e.target.value)}
                      placeholder="ex: João Silva"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technicalOwner">Contato Técnico</Label>
                    <Input
                      id="technicalOwner"
                      value={formData.technicalOwner || ''}
                      onChange={(e) => handleInputChange('technicalOwner', e.target.value)}
                      placeholder="ex: Maria Santos"
                    />
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
                    <Label className="text-base font-semibold">Conformidade e Regulamentação</Label>
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

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/vulnerabilities/applications')}
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
            {isEditing ? 'Atualizar Aplicação' : 'Criar Aplicação'}
          </Button>
        </div>
      </form>
    </div>
  );
}