import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Info,
  Server,
  Network,
  MapPin,
  User,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssetCustomFields, AssetCustomField } from './hooks/useAssetCustomFields';
import { useAuth } from '@/contexts/AuthContextSimple';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'boolean', label: 'Sim/Não' },
  { value: 'select', label: 'Lista de Opções' },
  { value: 'textarea', label: 'Texto Longo' },
  { value: 'email', label: 'E-mail' },
  { value: 'url', label: 'URL' },
  { value: 'phone', label: 'Telefone' }
];

const TABS = [
  { value: 'basic', label: 'Informações Básicas', icon: Server },
  { value: 'network', label: 'Detalhes de Rede', icon: Network },
  { value: 'location', label: 'Localização', icon: MapPin },
  { value: 'management', label: 'Gestão', icon: User },
  { value: 'security', label: 'Segurança', icon: Shield }
];

export default function AssetFieldsCustomization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    customFields,
    loading,
    canManageFields,
    createCustomField,
    updateCustomField,
    deleteCustomField
  } = useAssetCustomFields();

  const [isCreating, setIsCreating] = useState(false);
  const [editingField, setEditingField] = useState<AssetCustomField | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text' as AssetCustomField['type'],
    required: false,
    visible: true,
    tab: 'basic' as AssetCustomField['tab'],
    description: '',
    placeholder: '',
    defaultValue: '',
    options: [] as string[],
    sectionTitle: '',
    sectionSubtitle: '',
    validation: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      pattern: '',
      message: ''
    }
  });
  const [newOption, setNewOption] = useState('');

  // Check if user has permission
  if (!canManageFields) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/vulnerabilities/cmdb')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              Customização de Campos - Ativos
            </h1>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Acesso Restrito:</strong> Apenas administradores da tenant podem customizar campos de ativos. 
            Entre em contato com seu administrador para solicitar acesso.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.label) {
      return;
    }

    const fieldData = {
      ...formData,
      order: customFields.length + 1,
      options: formData.type === 'select' ? formData.options : undefined,
      validation: formData.validation.pattern || formData.validation.min || formData.validation.max 
        ? formData.validation 
        : undefined
    };

    let success = false;
    if (editingField) {
      success = await updateCustomField(editingField.id, fieldData);
    } else {
      success = await createCustomField(fieldData);
    }

    if (success) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      visible: true,
      tab: 'basic',
      description: '',
      placeholder: '',
      defaultValue: '',
      options: [],
      sectionTitle: '',
      sectionSubtitle: '',
      validation: {
        min: undefined,
        max: undefined,
        pattern: '',
        message: ''
      }
    });
    setNewOption('');
    setIsCreating(false);
    setEditingField(null);
  };

  const handleEdit = (field: AssetCustomField) => {
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      visible: field.visible,
      tab: field.tab,
      description: field.description || '',
      placeholder: field.placeholder || '',
      defaultValue: field.defaultValue || '',
      options: field.options || [],
      sectionTitle: field.sectionTitle || '',
      sectionSubtitle: field.sectionSubtitle || '',
      validation: field.validation || {
        min: undefined,
        max: undefined,
        pattern: '',
        message: ''
      }
    });
    setEditingField(field);
    setIsCreating(true);
  };

  const handleDelete = async (field: AssetCustomField) => {
    if (window.confirm(`Tem certeza que deseja excluir o campo "${field.label}"?`)) {
      await deleteCustomField(field.id);
    }
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const removeOption = (option: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt !== option)
    }));
  };

  const getTabIcon = (tab: string) => {
    const tabConfig = TABS.find(t => t.value === tab);
    const IconComponent = tabConfig?.icon || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

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
              <Settings className="h-8 w-8 text-primary" />
              Customização de Campos - Ativos
            </h1>
            <p className="text-muted-foreground">
              Configure campos personalizados para o formulário de ativos
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Campo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        {isCreating && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingField ? 'Editar Campo' : 'Novo Campo'}
                </CardTitle>
                <CardDescription>
                  Configure as propriedades do campo personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Campo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ex: data_classification"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="label">Rótulo *</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="ex: Classificação de Dados"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Campo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as AssetCustomField['type'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tab">Aba</Label>
                    <Select value={formData.tab} onValueChange={(value) => setFormData(prev => ({ ...prev, tab: value as AssetCustomField['tab'] }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TABS.map(tab => (
                          <SelectItem key={tab.value} value={tab.value}>
                            <div className="flex items-center gap-2">
                              <tab.icon className="h-4 w-4" />
                              {tab.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do campo..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                      id="placeholder"
                      value={formData.placeholder}
                      onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                      placeholder="Texto de exemplo..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Seção Personalizada</Label>
                      <p className="text-sm text-muted-foreground">Configure um título e subtítulo para agrupar os campos customizados</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sectionTitle">Título da Seção</Label>
                      <Input
                        id="sectionTitle"
                        value={formData.sectionTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, sectionTitle: e.target.value }))}
                        placeholder="ex: Campos Personalizados"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sectionSubtitle">Subtítulo da Seção</Label>
                      <Textarea
                        id="sectionSubtitle"
                        value={formData.sectionSubtitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, sectionSubtitle: e.target.value }))}
                        placeholder="ex: Campos customizados configurados para sua organização"
                        rows={2}
                      />
                    </div>
                  </div>

                  {formData.type === 'select' && (
                    <div className="space-y-2">
                      <Label>Opções</Label>
                      <div className="space-y-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input value={option} readOnly />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(option)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            placeholder="Nova opção..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                          />
                          <Button type="button" onClick={addOption}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.required}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
                    />
                    <Label>Campo obrigatório</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.visible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visible: checked }))}
                    />
                    <Label>Campo visível</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingField ? 'Atualizar' : 'Criar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fields List */}
        <div className={isCreating ? "lg:col-span-2" : "lg:col-span-3"}>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos os Campos</TabsTrigger>
              {TABS.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <div className="flex items-center gap-1">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campos Personalizados ({customFields.length})</CardTitle>
                  <CardDescription>
                    Lista de todos os campos personalizados configurados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {customFields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Nenhum campo personalizado</p>
                      <p>Clique em "Novo Campo" para criar seu primeiro campo personalizado</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customFields.map((field) => (
                        <div key={field.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{field.label}</h3>
                                <Badge variant="outline">{FIELD_TYPES.find(t => t.value === field.type)?.label}</Badge>
                                {field.required && <Badge variant="secondary">Obrigatório</Badge>}
                                {!field.visible && <Badge variant="destructive">Oculto</Badge>}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Nome: {field.name}</span>
                                <span className="flex items-center gap-1">
                                  {getTabIcon(field.tab)}
                                  {TABS.find(t => t.value === field.tab)?.label}
                                </span>
                              </div>
                              {field.description && (
                                <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(field)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(field)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {TABS.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </CardTitle>
                    <CardDescription>
                      Campos personalizados na aba {tab.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {customFields.filter(field => field.tab === tab.value).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <tab.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum campo personalizado nesta aba</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customFields
                          .filter(field => field.tab === tab.value)
                          .map((field) => (
                            <div key={field.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-medium">{field.label}</h3>
                                    <Badge variant="outline">{FIELD_TYPES.find(t => t.value === field.type)?.label}</Badge>
                                    {field.required && <Badge variant="secondary">Obrigatório</Badge>}
                                    {!field.visible && <Badge variant="destructive">Oculto</Badge>}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <span>Nome: {field.name}</span>
                                  </div>
                                  {field.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(field)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(field)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}