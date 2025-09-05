import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Settings,
  AlertTriangle,
  CheckCircle,
  Star,
  Shield,
  Lock,
  Grid,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  Square,
  Circle,
  ChevronDown,
  CheckSquare,
  Paperclip,
  Edit3,
  Info,
  Minus,
  Heading,
  Calculator,
  Upload,
  Link,
  GitBranch,
  FileText,
  HelpCircle,
  X,
  Save,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner';

// Types
import { 
  CustomFieldDefinition,
  CustomFieldType,
  FieldOption,
  ValidationRule,
  FieldTypeConfig,
  FieldUIConfig,
  ComplianceMapping,
  CUSTOM_FIELD_TYPES,
  getFieldTypeIcon,
  validateFieldName,
  sanitizeFieldName
} from '@/types/compliance-process-templates';
import { ComplianceFramework, COMPLIANCE_FRAMEWORKS } from '@/types/compliance-management';

// ============================================================================
// SORTABLE FIELD ITEM
// ============================================================================

interface SortableFieldItemProps {
  field: CustomFieldDefinition;
  onEdit: (field: CustomFieldDefinition) => void;
  onDelete: (fieldId: string) => void;
  onToggleVisibility: (fieldId: string) => void;
  onClone: (field: CustomFieldDefinition) => void;
  readonly?: boolean;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  onEdit,
  onDelete,
  onToggleVisibility,
  onClone,
  readonly = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldIcon = getFieldTypeIcon(field.type);
  const IconComponent = {
    Type, Hash, Calendar, ToggleLeft, Square, Circle, ChevronDown,
    CheckSquare, Paperclip, Edit3, Info, Minus, Heading, Calculator,
    Upload, Link, GitBranch, FileText, HelpCircle, Shield, Star, Grid, Eye
  }[fieldIcon] || HelpCircle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group border rounded-lg p-4 bg-white hover:shadow-md transition-all ${
        isDragging ? 'shadow-lg' : ''
      } ${field.required ? 'border-l-4 border-l-orange-400' : ''}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Drag handle and field info */}
        <div className="flex items-center space-x-3">
          {!readonly && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              field.sensitive ? 'bg-red-100 text-red-600' :
              field.required ? 'bg-orange-100 text-orange-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <IconComponent className="h-4 w-4" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{field.label}</span>
                {field.required && <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">Obrigatório</Badge>}
                {field.sensitive && <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Sensível</Badge>}
                {field.readonly && <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">Somente Leitura</Badge>}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{field.name}</span>
                <span>•</span>
                <span className="capitalize">{field.type.replace('_', ' ')}</span>
                {field.description && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-32">{field.description}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        {!readonly && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(field.id)}
              title={`${field.ui?.visible === false ? 'Mostrar' : 'Ocultar'} campo`}
            >
              {field.ui?.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClone(field)}
              title="Duplicar campo"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(field)}
              title="Editar campo"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(field.id)}
              title="Excluir campo"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Field preview */}
      {field.type === 'select' && field.options && field.options.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-muted-foreground mb-1">Opções:</div>
          <div className="flex flex-wrap gap-1">
            {field.options.slice(0, 5).map((option, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {option.label}
              </Badge>
            ))}
            {field.options.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{field.options.length - 5} mais
              </Badge>
            )}
          </div>
        </div>
      )}

      {field.validations && field.validations.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-muted-foreground mb-1">Validações:</div>
          <div className="flex flex-wrap gap-1">
            {field.validations.map((validation, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {validation.type}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FIELD EDITOR DIALOG
// ============================================================================

interface FieldEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  field?: CustomFieldDefinition | null;
  framework: ComplianceFramework;
  existingFieldNames: string[];
  onSave: (field: CustomFieldDefinition) => void;
}

const FieldEditorDialog: React.FC<FieldEditorDialogProps> = ({
  isOpen,
  onClose,
  field: editingField,
  framework,
  existingFieldNames,
  onSave
}) => {
  const [field, setField] = useState<Partial<CustomFieldDefinition>>({
    id: '',
    name: '',
    label: '',
    description: '',
    type: 'text',
    required: false,
    readonly: false,
    sensitive: false,
    validations: [],
    options: [],
    config: {},
    ui: {
      width: 'full',
      variant: 'default',
      size: 'medium'
    },
    visibility_conditions: [],
    auto_populate: undefined,
    audit_trail: true,
    compliance_mapping: [],
    help_text: '',
    placeholder: '',
    default_value: undefined,
    weight: 1,
    order: 0
  });

  // Initialize field when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      if (editingField) {
        setField(editingField);
      } else {
        // Reset for new field
        setField({
          id: `field_${Date.now()}`,
          name: '',
          label: '',
          description: '',
          type: 'text',
          required: false,
          readonly: false,
          sensitive: false,
          validations: [],
          options: [],
          config: {},
          ui: {
            width: 'full',
            variant: 'default',
            size: 'medium'
          },
          visibility_conditions: [],
          auto_populate: undefined,
          audit_trail: true,
          compliance_mapping: [],
          help_text: '',
          placeholder: '',
          default_value: undefined,
          weight: 1,
          order: 0
        });
      }
    }
  }, [isOpen, editingField]);

  // Auto-generate name from label
  React.useEffect(() => {
    if (field.label && (!editingField || !field.name)) {
      const sanitizedName = sanitizeFieldName(field.label);
      if (sanitizedName !== field.name) {
        setField(prev => ({ ...prev, name: sanitizedName }));
      }
    }
  }, [field.label, editingField, field.name]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setField(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleConfigChange = (configKey: string, value: any) => {
    setField(prev => ({
      ...prev,
      config: { ...prev.config, [configKey]: value }
    }));
  };

  const handleUIConfigChange = (uiKey: string, value: any) => {
    setField(prev => ({
      ...prev,
      ui: { ...prev.ui, [uiKey]: value }
    }));
  };

  const addOption = () => {
    const newOption: FieldOption = {
      value: `option_${(field.options?.length || 0) + 1}`,
      label: `Opção ${(field.options?.length || 0) + 1}`,
    };
    setField(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
  };

  const updateOption = (index: number, option: Partial<FieldOption>) => {
    setField(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? { ...opt, ...option } : opt) || []
    }));
  };

  const removeOption = (index: number) => {
    setField(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const addValidation = () => {
    const newValidation: ValidationRule = {
      type: 'required',
      message: 'Este campo é obrigatório'
    };
    setField(prev => ({
      ...prev,
      validations: [...(prev.validations || []), newValidation]
    }));
  };

  const updateValidation = (index: number, validation: Partial<ValidationRule>) => {
    setField(prev => ({
      ...prev,
      validations: prev.validations?.map((val, i) => i === index ? { ...val, ...validation } : val) || []
    }));
  };

  const removeValidation = (index: number) => {
    setField(prev => ({
      ...prev,
      validations: prev.validations?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!field.name || !field.label || !field.type) {
      toast.error('Nome, label e tipo são obrigatórios');
      return;
    }

    // Validate field name
    if (!validateFieldName(field.name)) {
      toast.error('Nome do campo deve ser alfanumérico e começar com letra');
      return;
    }

    // Check for duplicate names
    if (!editingField && existingFieldNames.includes(field.name)) {
      toast.error('Já existe um campo com este nome');
      return;
    }

    onSave(field as CustomFieldDefinition);
    onClose();
  };

  const requiresOptions = ['select', 'multiselect', 'radio', 'checkbox'].includes(field.type!);
  const isComplianceSpecific = ['compliance_status', 'maturity_rating', 'evidence_upload', 'control_test', 'risk_matrix', 'framework_mapping'].includes(field.type!);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingField ? 'Editar Campo' : 'Novo Campo'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 p-1">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Informações Básicas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-label">Label do Campo *</Label>
                    <Input
                      id="field-label"
                      placeholder="Ex: Nível de Maturidade"
                      value={field.label || ''}
                      onChange={(e) => handleFieldChange('label', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-name">Nome Técnico *</Label>
                    <Input
                      id="field-name"
                      placeholder="Ex: maturity_level"
                      value={field.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-type">Tipo de Campo *</Label>
                  <Select
                    value={field.type || ''}
                    onValueChange={(value) => handleFieldChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">TIPOS BÁSICOS</div>
                        {['text', 'textarea', 'number', 'boolean', 'date', 'datetime'].map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center space-x-2">
                              <span className="capitalize">{type.replace('_', ' ')}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">SELEÇÃO</div>
                        {['select', 'multiselect', 'radio', 'checkbox'].map((type) => (
                          <SelectItem key={type} value={type}>
                            <span className="capitalize">{type}</span>
                          </SelectItem>
                        ))}
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">COMPLIANCE</div>
                        {['compliance_status', 'maturity_rating', 'evidence_upload', 'control_test', 'risk_matrix', 'framework_mapping'].map((type) => (
                          <SelectItem key={type} value={type}>
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </SelectItem>
                        ))}
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="p-2">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">AVANÇADOS</div>
                        {['file_upload', 'signature', 'approval_workflow', 'audit_trail', 'calculated_field'].map((type) => (
                          <SelectItem key={type} value={type}>
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-description">Descrição</Label>
                  <Textarea
                    id="field-description"
                    placeholder="Descreva o propósito deste campo..."
                    value={field.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required || false}
                      onCheckedChange={(checked) => handleFieldChange('required', checked)}
                    />
                    <Label>Obrigatório</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.readonly || false}
                      onCheckedChange={(checked) => handleFieldChange('readonly', checked)}
                    />
                    <Label>Somente Leitura</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.sensitive || false}
                      onCheckedChange={(checked) => handleFieldChange('sensitive', checked)}
                    />
                    <Label>Dados Sensíveis</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options (for select types) */}
            {requiresOptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ChevronDown className="h-5 w-5" />
                      <span>Opções</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {field.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Valor"
                            value={option.value}
                            onChange={(e) => updateOption(index, { value: e.target.value })}
                          />
                          <Input
                            placeholder="Label"
                            value={option.label}
                            onChange={(e) => updateOption(index, { label: e.target.value })}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {(!field.options || field.options.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ChevronDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma opção adicionada</p>
                        <p className="text-sm">Clique em "Adicionar Opção" para começar</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Type-specific configuration */}
            {isComplianceSpecific && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Configuração de Compliance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {field.type === 'maturity_rating' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Valor Mínimo</Label>
                          <Input
                            type="number"
                            value={field.config?.scale_min || 1}
                            onChange={(e) => handleConfigChange('scale_min', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Máximo</Label>
                          <Input
                            type="number"
                            value={field.config?.scale_max || 5}
                            onChange={(e) => handleConfigChange('scale_max', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {field.type === 'file_upload' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipos Aceitos</Label>
                        <Input
                          placeholder=".pdf,.doc,.docx"
                          value={field.config?.accepted_types?.join(',') || ''}
                          onChange={(e) => handleConfigChange('accepted_types', e.target.value.split(',').map(t => t.trim()))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tamanho Máximo (MB)</Label>
                        <Input
                          type="number"
                          value={field.config?.max_file_size || 10}
                          onChange={(e) => handleConfigChange('max_file_size', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* UI Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Configuração de Interface</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Largura</Label>
                    <Select
                      value={field.ui?.width || 'full'}
                      onValueChange={(value) => handleUIConfigChange('width', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Largura Total</SelectItem>
                        <SelectItem value="half">Meia Largura</SelectItem>
                        <SelectItem value="third">Um Terço</SelectItem>
                        <SelectItem value="quarter">Um Quarto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Variante</Label>
                    <Select
                      value={field.ui?.variant || 'default'}
                      onValueChange={(value) => handleUIConfigChange('variant', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="bordered">Com Borda</SelectItem>
                        <SelectItem value="filled">Preenchido</SelectItem>
                        <SelectItem value="outlined">Contornado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanho</Label>
                    <Select
                      value={field.ui?.size || 'medium'}
                      onValueChange={(value) => handleUIConfigChange('size', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeno</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input
                      placeholder="Texto de placeholder..."
                      value={field.placeholder || ''}
                      onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Texto de Ajuda</Label>
                    <Input
                      placeholder="Texto explicativo..."
                      value={field.help_text || ''}
                      onChange={(e) => handleFieldChange('help_text', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-sm text-muted-foreground">
            {field.name && <span>Nome: <code>{field.name}</code></span>}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {editingField ? 'Salvar Alterações' : 'Criar Campo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN FIELD BUILDER PANEL
// ============================================================================

interface FieldBuilderPanelProps {
  fields: CustomFieldDefinition[];
  onChange: (fields: CustomFieldDefinition[]) => void;
  framework: ComplianceFramework;
  readonly?: boolean;
}

export const FieldBuilderPanel: React.FC<FieldBuilderPanelProps> = ({
  fields,
  onChange,
  framework,
  readonly = false
}) => {
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtered and sorted fields
  const filteredFields = useMemo(() => {
    return fields
      .filter(field => {
        const matchesSearch = !searchTerm || 
          field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === 'all' || field.type === filterType;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [fields, searchTerm, filterType]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      
      const reorderedFields = arrayMove(fields, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index
      }));
      
      onChange(reorderedFields);
    }
  };

  const handleCreateField = () => {
    setEditingField(null);
    setIsFieldDialogOpen(true);
  };

  const handleEditField = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setIsFieldDialogOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    if (confirm('Tem certeza que deseja excluir este campo?')) {
      onChange(fields.filter(field => field.id !== fieldId));
      toast.success('Campo excluído com sucesso');
    }
  };

  const handleCloneField = (field: CustomFieldDefinition) => {
    const clonedField: CustomFieldDefinition = {
      ...field,
      id: `field_${Date.now()}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Cópia)`,
      order: fields.length
    };
    onChange([...fields, clonedField]);
    toast.success('Campo duplicado com sucesso');
  };

  const handleToggleVisibility = (fieldId: string) => {
    onChange(fields.map(field => 
      field.id === fieldId 
        ? { ...field, ui: { ...field.ui, visible: !(field.ui?.visible === false) } }
        : field
    ));
  };

  const handleSaveField = (field: CustomFieldDefinition) => {
    if (editingField) {
      // Update existing field
      onChange(fields.map(f => f.id === field.id ? field : f));
      toast.success('Campo atualizado com sucesso');
    } else {
      // Add new field
      const newField = { ...field, order: fields.length };
      onChange([...fields, newField]);
      toast.success('Campo criado com sucesso');
    }
  };

  const existingFieldNames = fields.filter(f => f.id !== editingField?.id).map(f => f.name);

  // Quick add templates for compliance
  const addComplianceTemplate = (templateType: string) => {
    const templates: Record<string, Partial<CustomFieldDefinition>> = {
      maturity: {
        name: 'maturity_level',
        label: 'Nível de Maturidade',
        type: 'maturity_rating',
        required: true,
        description: 'Avaliação do nível de maturidade (1-5)',
        config: { scale_min: 1, scale_max: 5 },
        compliance_mapping: [{ framework, control_id: 'MATURITY', requirement_text: 'Avaliação de maturidade', weight: 1 }]
      },
      evidence: {
        name: 'evidence_files',
        label: 'Evidências',
        type: 'evidence_upload',
        required: false,
        description: 'Upload de arquivos de evidência',
        config: { accepted_types: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'], max_file_size: 50, max_files: 10 }
      },
      status: {
        name: 'compliance_status',
        label: 'Status de Conformidade',
        type: 'compliance_status',
        required: true,
        description: 'Status atual de conformidade',
        options: [
          { value: 'not_started', label: 'Não Iniciado' },
          { value: 'in_progress', label: 'Em Andamento' },
          { value: 'compliant', label: 'Conforme' },
          { value: 'non_compliant', label: 'Não Conforme' }
        ]
      },
      comments: {
        name: 'implementation_notes',
        label: 'Notas de Implementação',
        type: 'textarea',
        required: false,
        description: 'Comentários sobre a implementação',
        config: { max_length: 2000 }
      }
    };

    const template = templates[templateType];
    if (template) {
      const newField: CustomFieldDefinition = {
        id: `field_${Date.now()}`,
        audit_trail: true,
        order: fields.length,
        validations: [],
        options: [],
        config: {},
        ui: { width: 'full', variant: 'default', size: 'medium' },
        visibility_conditions: [],
        compliance_mapping: [],
        weight: 1,
        ...template
      } as CustomFieldDefinition;
      
      onChange([...fields, newField]);
      toast.success(`Template "${template.label}" adicionado`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Construtor de Campos</h3>
            <p className="text-sm text-muted-foreground">
              Configure os campos personalizados para o framework {framework}
            </p>
          </div>
          
          {!readonly && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => addComplianceTemplate('maturity')}>
                <Wand2 className="h-4 w-4 mr-2" />
                Template Rápido
              </Button>
              <Button onClick={handleCreateField}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Campo
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Pesquisar campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {CUSTOM_FIELD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick add templates */}
        {!readonly && (
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-xs text-muted-foreground">Templates rápidos:</span>
            <Button variant="ghost" size="sm" onClick={() => addComplianceTemplate('status')}>
              <Shield className="h-3 w-3 mr-1" />
              Status
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addComplianceTemplate('maturity')}>
              <Star className="h-3 w-3 mr-1" />
              Maturidade
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addComplianceTemplate('evidence')}>
              <Paperclip className="h-3 w-3 mr-1" />
              Evidências
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addComplianceTemplate('comments')}>
              <FileText className="h-3 w-3 mr-1" />
              Comentários
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {filteredFields.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Grid className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {fields.length === 0 ? 'Nenhum campo criado' : 'Nenhum campo encontrado'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {fields.length === 0 
                  ? 'Comece criando seu primeiro campo personalizado' 
                  : 'Tente ajustar os filtros de pesquisa'
                }
              </p>
              {!readonly && fields.length === 0 && (
                <Button onClick={handleCreateField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Campo
                </Button>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={filteredFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {filteredFields.map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      onEdit={handleEditField}
                      onDelete={handleDeleteField}
                      onClone={handleCloneField}
                      onToggleVisibility={handleToggleVisibility}
                      readonly={readonly}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      {/* Stats footer */}
      {fields.length > 0 && (
        <div className="flex-shrink-0 px-6 py-3 border-t bg-gray-50 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{fields.length} campo(s) total • {filteredFields.length} exibido(s)</span>
            <div className="flex items-center space-x-4">
              <span>{fields.filter(f => f.required).length} obrigatório(s)</span>
              <span>{fields.filter(f => f.sensitive).length} sensível(is)</span>
            </div>
          </div>
        </div>
      )}

      {/* Field Editor Dialog */}
      <FieldEditorDialog
        isOpen={isFieldDialogOpen}
        onClose={() => setIsFieldDialogOpen(false)}
        field={editingField}
        framework={framework}
        existingFieldNames={existingFieldNames}
        onSave={handleSaveField}
      />
    </div>
  );
};