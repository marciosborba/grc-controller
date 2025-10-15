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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Settings,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  AlertTriangle,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  FileText,
  Link,
  Mail,
  Phone,
  GripVertical,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApplicationCustomFields, ApplicationCustomField } from './hooks/useApplicationCustomFields';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface FieldTemplate {
  id: string;
  name: string;
  description: string;
  fields: Omit<ApplicationCustomField, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tenant_id'>[];
  source: 'business' | 'technical' | 'security' | 'custom';
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: Type, description: 'Simple text field' },
  { value: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text field' },
  { value: 'number', label: 'Number', icon: Hash, description: 'Numeric field' },
  { value: 'date', label: 'Date', icon: Calendar, description: 'Date field' },
  { value: 'boolean', label: 'Yes/No', icon: ToggleLeft, description: 'Boolean field' },
  { value: 'select', label: 'List', icon: List, description: 'Predefined options list' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email field' },
  { value: 'url', label: 'URL', icon: Link, description: 'URL field' },
  { value: 'phone', label: 'Phone', icon: Phone, description: 'Phone field' },
];

const TABS_OPTIONS = [
  { value: 'basic', label: 'Basic Info' },
  { value: 'technical', label: 'Technical Details' },
  { value: 'business', label: 'Business Info' },
  { value: 'security', label: 'Security' },
  { value: 'custom', label: 'Custom Fields' },
];

const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    id: 'business-standard',
    name: 'Business - Standard Fields',
    description: 'Essential fields for business management of applications',
    source: 'business',
    fields: [
      {
        name: 'business_owner',
        label: 'Business Owner',
        type: 'text',
        required: false,
        visible: true,
        order: 1,
        tab: 'business',
        description: 'Business responsible for the application',
        importMapping: { csv: 'business_owner' }
      },
      {
        name: 'technical_owner',
        label: 'Technical Owner',
        type: 'text',
        required: false,
        visible: true,
        order: 2,
        tab: 'technical',
        description: 'Technical responsible for the application',
        importMapping: { csv: 'technical_owner' }
      },
      {
        name: 'criticality_level',
        label: 'Criticality Level',
        type: 'select',
        required: false,
        visible: true,
        order: 3,
        tab: 'business',
        options: ['Critical', 'High', 'Medium', 'Low'],
        description: 'Application criticality level for business',
        importMapping: { csv: 'criticality' }
      }
    ]
  }
];

export default function ApplicationFieldsCustomization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    customFields, 
    loading, 
    canManageFields, 
    createCustomField, 
    updateCustomField, 
    deleteCustomField, 
    reorderFields 
  } = useApplicationCustomFields({ includeHidden: true });
  
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingField, setEditingField] = useState<ApplicationCustomField | null>(null);
  
  const [fieldForm, setFieldForm] = useState({
    name: '',
    label: '',
    type: 'text' as ApplicationCustomField['type'],
    required: false,
    visible: true,
    tab: 'custom' as ApplicationCustomField['tab'],
    description: '',
    placeholder: '',
    defaultValue: '',
    options: [''],
    validation: {
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      pattern: '',
      message: ''
    },
    importMapping: {
      csv: '',
      api: '',
      custom: ''
    }
  });

  useEffect(() => {
    if (!canManageFields) {
      toast.error('You do not have permission to manage custom application fields');
      navigate('/vulnerabilities/applications');
    }
  }, [canManageFields, navigate]);

  const handleSaveField = async () => {
    if (!fieldForm.name.trim() || !fieldForm.label.trim()) {
      toast.error('Name and label are required');
      return;
    }

    if (!canManageFields) {
      toast.error('No permission to save fields');
      return;
    }

    try {
      const fieldData = {
        name: fieldForm.name,
        label: fieldForm.label,
        type: fieldForm.type,
        required: fieldForm.required,
        visible: fieldForm.visible,
        order: editingField?.order || customFields.length + 1,
        tab: fieldForm.tab,
        description: fieldForm.description,
        placeholder: fieldForm.placeholder,
        defaultValue: fieldForm.defaultValue,
        options: fieldForm.type === 'select' ? fieldForm.options.filter(opt => opt.trim()) : undefined,
        validation: fieldForm.validation.pattern || fieldForm.validation.min || fieldForm.validation.max 
          ? fieldForm.validation 
          : undefined,
        importMapping: Object.values(fieldForm.importMapping).some(v => v) 
          ? fieldForm.importMapping 
          : undefined,
      };

      if (editingField) {
        await updateCustomField(editingField.id, fieldData);
      } else {
        await createCustomField(fieldData);
      }

      resetFieldForm();
      setShowFieldDialog(false);
    } catch (error) {
      console.error('Error saving field:', error);
      toast.error('Error saving field: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    await deleteCustomField(fieldId);
  };

  const handleApplyTemplate = async (template: FieldTemplate) => {
    try {
      for (const field of template.fields) {
        await createCustomField({
          ...field,
          order: customFields.length + 1
        });
      }
      toast.success(`Template "${template.name}" applied successfully`);
      setShowTemplateDialog(false);
    } catch (error) {
      toast.error('Error applying template');
    }
  };

  const resetFieldForm = () => {
    setFieldForm({
      name: '',
      label: '',
      type: 'text',
      required: false,
      visible: true,
      tab: 'custom',
      description: '',
      placeholder: '',
      defaultValue: '',
      options: [''],
      validation: {
        min: undefined,
        max: undefined,
        pattern: '',
        message: ''
      },
      importMapping: {
        csv: '',
        api: '',
        custom: ''
      }
    });
    setEditingField(null);
  };

  const getFieldTypeIcon = (type: string) => {
    const fieldType = FIELD_TYPES.find(ft => ft.value === type);
    const IconComponent = fieldType?.icon || Type;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/vulnerabilities/applications')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Layers className="h-8 w-8 text-primary" />
              Application Fields Customization
            </h1>
            <p className="text-muted-foreground">
              Configure custom fields for applications
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button 
            onClick={() => {
              if (!canManageFields) {
                toast.error('No permission to create fields');
                return;
              }
              resetFieldForm();
              setShowFieldDialog(true);
            }}
            disabled={!canManageFields}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Field
          </Button>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Restricted Access:</strong> Only tenant administrators can customize application fields. 
          Changes will affect all users in the organization.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="fields" className="w-full">
        <TabsList>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="preview">Form Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Application Custom Fields ({customFields.length})</CardTitle>
                  <CardDescription>
                    Manage custom fields for applications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {customFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No custom fields</p>
                  <p>Create custom fields or apply a template</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customFields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getFieldTypeIcon(field.type)}
                              <div>
                                <h4 className="font-medium">{field.label}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {field.name} • {FIELD_TYPES.find(ft => ft.value === field.type)?.label}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteField(field.id)}
                            >
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

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
              <CardDescription>
                Preview how custom fields will appear in the application form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-muted/30">
                <h3 className="text-lg font-semibold mb-4">Application Custom Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields
                    .filter(field => field.visible)
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input disabled placeholder={field.placeholder} />
                        {field.description && (
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Field' : 'New Custom Field'}
            </DialogTitle>
            <DialogDescription>
              Configure the properties of the custom field for applications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name *</Label>
                <Input
                  id="field-name"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. business_owner"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-label">Label *</Label>
                <Input
                  id="field-label"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Business Owner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Field Type *</Label>
              <Select value={fieldForm.type} onValueChange={(value) => setFieldForm(prev => ({ ...prev, type: value as ApplicationCustomField['type'] }))}>
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
              <Label htmlFor="field-description">Description</Label>
              <Textarea
                id="field-description"
                value={fieldForm.description}
                onChange={(e) => setFieldForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Field description to help users"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fieldForm.required}
                  onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, required: checked }))}
                />
                <Label>Required field</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={fieldForm.visible}
                  onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, visible: checked }))}
                />
                <Label>Visible in form</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField}>
              <Save className="h-4 w-4 mr-2" />
              {editingField ? 'Update' : 'Create'} Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Field Templates</DialogTitle>
            <DialogDescription>
              Apply pre-configured templates for different application aspects
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {FIELD_TEMPLATES.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.fields.length} fields • Source: {template.source}
                      </p>
                    </div>
                    <Button onClick={() => handleApplyTemplate(template)}>
                      <Download className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}