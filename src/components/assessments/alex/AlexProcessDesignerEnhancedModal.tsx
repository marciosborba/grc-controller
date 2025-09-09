import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  X, 
  Settings2, 
  Eye, 
  Save, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Trash2, 
  ChevronRight,
  Upload,
  Download,
  Copy,
  Layers,
  Workflow,
  Grid3x3,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Square,
  Circle,
  GitBranch,
  GitMerge,
  Timer,
  Bell,
  CheckCircle,
  Settings,
  Target,
  GripVertical,
  Users,
  Database,
  FileText,
  Mail,
  AlertTriangle,
  Clock,
  Activity,
  Zap,
  Shield,
  Link2,
  Layout,
  PaintBucket,
  Type,
  Image,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  MapPin,
  Filter,
  Search,
  MoreVertical,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minimize,
  Monitor,
  Smartphone,
  Tablet,
  PenTool,
  Palette,
  Sparkles,
  Cpu,
  CloudDownload,
  Star
} from 'lucide-react';

import { useProcessManagement } from '@/hooks/useProcessManagement';

// Professional Workflow Node Types with Enhanced Configuration
interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'timer' | 'notification' | 'process' | 'database' | 'integration';
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: {
    label: string;
    description?: string;
    properties?: Record<string, any>;
    style?: {
      backgroundColor?: string;
      borderColor?: string;
      textColor?: string;
      borderWidth?: number;
      borderRadius?: number;
    };
  };
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'smooth' | 'step' | 'straight';
  style?: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    animated?: boolean;
  };
  label?: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  validation?: any;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
}

interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  estimatedTime: string;
  category: string;
  fields: FormField[];
  workflow: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
  };
}

interface AlexProcessDesignerEnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  processId?: string;
  initialData?: ProcessTemplate | null;
  onSave?: (processData: any) => void;
}

// Professional Canvas Grid Component
const CanvasGrid: React.FC<{ scale: number; offset: { x: number; y: number } }> = ({ scale, offset }) => {
  const gridSize = 20 * scale;
  const patternId = 'canvas-grid';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id={patternId}
            x={offset.x % gridSize}
            y={offset.y % gridSize}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-300 dark:text-gray-600"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

// Professional Canvas Controls
const CanvasControls: React.FC<{
  scale: number;
  onScaleChange: (scale: number) => void;
  onReset: () => void;
  onFitToScreen: () => void;
}> = ({ scale, onScaleChange, onReset, onFitToScreen }) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20 z-40">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-blue-100"
          onClick={() => onScaleChange(Math.min(3, scale + 0.2))}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="text-xs font-medium text-gray-600 min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-blue-100"
          onClick={() => onScaleChange(Math.max(0.2, scale - 0.2))}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs justify-start px-2"
          onClick={onFitToScreen}
          title="Ajustar à Tela"
        >
          <Monitor className="h-3 w-3 mr-1" />
          Ajustar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs justify-start px-2"
          onClick={onReset}
          title="Resetar Vista"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
};

// Professional Form Builder Component
const FormBuilderSection: React.FC<{
  formFields: FormField[];
  setFormFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  editingField: FormField | null;
  setEditingField: React.Dispatch<React.SetStateAction<FormField | null>>;
  showFieldModal: boolean;
  setShowFieldModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFieldType: string;
  setSelectedFieldType: React.Dispatch<React.SetStateAction<string>>;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<'form-builder' | 'workflow-designer'>>;
  gridConfig: { columns: number; rows: number; gap: number };
  setGridConfig: React.Dispatch<React.SetStateAction<{ columns: number; rows: number; gap: number }>>;
}> = ({ 
  formFields, setFormFields, editingField, setEditingField,
  showFieldModal, setShowFieldModal, selectedFieldType, setSelectedFieldType,
  setHasUnsavedChanges, setCurrentStep, gridConfig, setGridConfig 
}) => {
  // Drag and Drop states
  const [draggedField, setDraggedField] = useState<FormField | null>(null);
  const [dropTarget, setDropTarget] = useState<{row: number, col: number} | null>(null);
  const [showColumnControls, setShowColumnControls] = useState(false);
  
  // Grid sizing states
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  
  // Flexible rows system - each row can have different number of columns
  const [rowStructure, setRowStructure] = useState<{[rowIndex: number]: number}>({});
  
  // Initialize and update arrays when grid changes
  React.useEffect(() => {
    setColumnWidths(prev => {
      const newWidths = Array.from({ length: gridConfig.columns }, (_, i) => prev[i] || 1);
      return newWidths;
    });
    setRowHeights(prev => {
      const newHeights = Array.from({ length: gridConfig.rows }, (_, i) => prev[i] || 1);
      return newHeights;
    });
  }, [gridConfig.columns, gridConfig.rows]);

  // Calculate minimum row structure required by fields only
  const getMinimumRowStructure = () => {
    const structure: {[rowIndex: number]: number} = {};
    
    // Find maximum row from fields
    const maxRow = Math.max(1, formFields.reduce((max, field) => {
      const row = parseInt(field.gridRow || '1');
      return Math.max(max, row);
    }, 1));
    
    // Initialize all rows with 1 column minimum
    for (let row = 1; row <= maxRow; row++) {
      structure[row] = 1;
    }
    
    // Calculate minimum columns needed per row based on fields
    formFields.forEach(field => {
      const row = parseInt(field.gridRow || '1');
      const col = parseInt(field.gridColumn || '1');
      if (row && col) {
        structure[row] = Math.max(structure[row] || 1, col);
      }
    });
    
    return structure;
  };

  // Initialize row structure only when formFields change (no circular dependency)
  React.useEffect(() => {
    const minimumStructure = getMinimumRowStructure();
    
    setRowStructure(prev => {
      const newStructure = {...prev};
      
      // For each row in minimum structure, ensure we have at least that many columns
      Object.keys(minimumStructure).forEach(rowKey => {
        const rowNum = parseInt(rowKey);
        const minCols = minimumStructure[rowNum];
        newStructure[rowNum] = Math.max(newStructure[rowNum] || 1, minCols);
      });
      
      // Remove rows that no longer have any fields and no manual columns
      Object.keys(newStructure).forEach(rowKey => {
        const rowNum = parseInt(rowKey);
        if (!minimumStructure[rowNum] && newStructure[rowNum] === 1) {
          delete newStructure[rowNum];
        }
      });
      
      return Object.keys(newStructure).length > 0 ? newStructure : {1: 1};
    });
  }, [formFields]);
  
  // Update gridConfig when rowStructure changes
  React.useEffect(() => {
    if (Object.keys(rowStructure).length > 0) {
      const maxRows = Math.max(1, Object.keys(rowStructure).length);
      const maxCols = Math.max(1, ...Object.values(rowStructure));
      
      setGridConfig(prev => ({
        ...prev,
        rows: maxRows,
        columns: maxCols
      }));
    }
  }, [rowStructure]);
  
  const fieldTypes = [
    // Campos Básicos
    { type: 'text', label: 'Texto', icon: Type, description: 'Campo de texto simples', category: 'basic' },
    { type: 'textarea', label: 'Texto Longo', icon: FileText, description: 'Área de texto multi-linha', category: 'basic' },
    { type: 'number', label: 'Número', icon: BarChart3, description: 'Campo numérico', category: 'basic' },
    { type: 'email', label: 'E-mail', icon: Mail, description: 'Campo de e-mail', category: 'basic' },
    { type: 'password', label: 'Senha', icon: Shield, description: 'Campo de senha', category: 'basic' },
    { type: 'url', label: 'URL', icon: Link2, description: 'Campo de URL', category: 'basic' },
    
    // Campos Brasileiros
    { type: 'cpf', label: 'CPF', icon: Users, description: 'Campo de CPF brasileiro', category: 'brazilian' },
    { type: 'cnpj', label: 'CNPJ', icon: Database, description: 'Campo de CNPJ', category: 'brazilian' },
    { type: 'cep', label: 'CEP', icon: MapPin, description: 'Código postal brasileiro', category: 'brazilian' },
    { type: 'phone', label: 'Telefone', icon: Users, description: 'Telefone brasileiro', category: 'brazilian' },
    
    // Campos de Data/Tempo
    { type: 'date', label: 'Data', icon: Calendar, description: 'Seletor de data', category: 'datetime' },
    { type: 'time', label: 'Hora', icon: Clock, description: 'Seletor de hora', category: 'datetime' },
    { type: 'datetime', label: 'Data e Hora', icon: Calendar, description: 'Data e hora juntos', category: 'datetime' },
    { type: 'daterange', label: 'Período', icon: Calendar, description: 'Intervalo de datas', category: 'datetime' },
    
    // Campos de Seleção
    { type: 'select', label: 'Dropdown', icon: Filter, description: 'Lista suspensa de opções', category: 'selection' },
    { type: 'multiselect', label: 'Multi-seleção', icon: CheckCircle, description: 'Múltiplas opções dropdown', category: 'selection' },
    { type: 'radio', label: 'Radio', icon: Circle, description: 'Botões de rádio', category: 'selection' },
    { type: 'checkbox', label: 'Checkbox', icon: CheckCircle, description: 'Caixas de seleção', category: 'selection' },
    { type: 'checkbox-group', label: 'Grupo Checkbox', icon: Grid3x3, description: 'Grupo de checkboxes', category: 'selection' },
    { type: 'toggle', label: 'Toggle', icon: Settings, description: 'Interruptor on/off', category: 'selection' },
    
    // Campos Avançados
    { type: 'file', label: 'Upload', icon: Upload, description: 'Upload de arquivo', category: 'advanced' },
    { type: 'file-multiple', label: 'Upload Múltiplo', icon: Upload, description: 'Upload de múltiplos arquivos', category: 'advanced' },
    { type: 'image', label: 'Imagem', icon: Image, description: 'Upload de imagem', category: 'advanced' },
    { type: 'signature', label: 'Assinatura', icon: PenTool, description: 'Campo de assinatura digital', category: 'advanced' },
    { type: 'rating', label: 'Avaliação', icon: Star, description: 'Sistema de estrelas', category: 'advanced' },
    { type: 'slider', label: 'Slider', icon: Settings, description: 'Controle deslizante', category: 'advanced' },
    { type: 'color', label: 'Cor', icon: Palette, description: 'Seletor de cores', category: 'advanced' },
    { type: 'matrix', label: 'Matriz', icon: Grid3x3, description: 'Grid de dados', category: 'advanced' },
    { type: 'code', label: 'Código', icon: Monitor, description: 'Editor de código', category: 'advanced' },
    
    // Campos de Moeda/Financeiro
    { type: 'currency', label: 'Moeda', icon: BarChart3, description: 'Valores monetários', category: 'financial' },
    { type: 'percentage', label: 'Porcentagem', icon: PieChart, description: 'Valores percentuais', category: 'financial' },
    
    // Campos Especiais
    { type: 'calculated', label: 'Calculado', icon: Cpu, description: 'Campo com fórmula', category: 'special' },
    { type: 'user-select', label: 'Usuário', icon: Users, description: 'Seletor de usuários', category: 'special' },
    { type: 'location', label: 'Localização', icon: MapPin, description: 'Campo de localização', category: 'special' },
    { type: 'qrcode', label: 'QR Code', icon: Square, description: 'Gerador de QR Code', category: 'special' },
    { type: 'hidden', label: 'Oculto', icon: Eye, description: 'Campo oculto', category: 'special' },
    
    // Campos de Layout
    { type: 'separator', label: 'Separador', icon: Minimize, description: 'Linha divisória', category: 'layout' },
    { type: 'heading', label: 'Título', icon: Type, description: 'Título de seção', category: 'layout' },
    { type: 'info', label: 'Informação', icon: AlertTriangle, description: 'Texto informativo', category: 'layout' },
    { type: 'spacer', label: 'Espaçador', icon: Move, description: 'Espaço em branco', category: 'layout' }
  ];

  const addField = (type: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `${fieldTypes.find(f => f.type === type)?.label} ${formFields.length + 1}`,
      required: false,
      placeholder: '',
      description: '',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Opção 1'] : undefined
    };
    
    setFormFields(prev => [...prev, newField]);
    setHasUnsavedChanges(true);
    setEditingField(newField);
    setShowFieldModal(true);
  };

  const updateField = (updatedField: FormField) => {
    setFormFields(prev => prev.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
    setHasUnsavedChanges(true);
  };

  const removeField = (fieldId: string) => {
    setFormFields(prev => prev.filter(field => field.id !== fieldId));
    setHasUnsavedChanges(true);
  };

  const moveField = (dragIndex: number, dropIndex: number) => {
    const updatedFields = [...formFields];
    const draggedItem = updatedFields[dragIndex];
    updatedFields.splice(dragIndex, 1);
    updatedFields.splice(dropIndex, 0, draggedItem);
    setFormFields(updatedFields);
    setHasUnsavedChanges(true);
  };

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, field: FormField) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', field.id);
  };

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget({ row, col });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    
    const fieldType = e.dataTransfer.getData('fieldType');
    
    if (fieldType) {
      // Creating new field from palette
      const newField = {
        id: `field-${Date.now()}`,
        type: fieldType as const,
        label: `Campo ${formFields.length + 1}`,
        required: false,
        gridRow: targetRow.toString(),
        gridColumn: targetCol.toString()
      };
      
      // If this is the first field, create at least 1 line
      if (formFields.length === 0) {
        setGridConfig(prev => ({ 
          ...prev, 
          columns: Math.max(1, targetCol),
          rows: Math.max(1, targetRow)
        }));
      }
      
      setFormFields(prev => [...prev, newField]);
      setHasUnsavedChanges(true);
    } else if (draggedField) {
      // Moving existing field
      const updatedFields = formFields.map(field => 
        field.id === draggedField.id 
          ? { ...field, gridRow: targetRow.toString(), gridColumn: targetCol.toString() }
          : field
      );
      setFormFields(updatedFields);
      setHasUnsavedChanges(true);
    }
    
    setDraggedField(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
    setDropTarget(null);
  };

  return (
    <div className="flex flex-1 h-full">
      {/* Field Types Palette */}
      <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Tipos de Campo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Arraste ou clique para adicionar</p>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Agrupar por categoria */}
            {Object.entries(
              fieldTypes.reduce((acc, field) => {
                const category = field.category || 'other';
                if (!acc[category]) acc[category] = [];
                acc[category].push(field);
                return acc;
              }, {} as Record<string, typeof fieldTypes>)
            ).map(([category, fields]) => {
              const categoryLabels = {
                basic: 'Campos Básicos',
                brazilian: 'Campos Brasileiros', 
                datetime: 'Data e Tempo',
                selection: 'Seleção',
                advanced: 'Avançados',
                financial: 'Financeiro',
                special: 'Especiais',
                layout: 'Layout'
              };
              
              const categoryColors = {
                basic: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
                brazilian: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
                datetime: 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20',
                selection: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
                advanced: 'from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20',
                financial: 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
                special: 'from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20',
                layout: 'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20'
              };

              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    {categoryLabels[category] || category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map(({ type, label, icon: Icon, description }) => (
                      <div
                        key={type}
                        className={`group relative cursor-move p-3 rounded-lg bg-gradient-to-br ${categoryColors[category] || categoryColors.basic}
                                   border border-gray-200/50 dark:border-gray-700/50
                                   hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200
                                   hover:scale-105 active:scale-95`}
                        onClick={() => addField(type)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('fieldType', type);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        title={description + ' - Clique ou arraste para o grid'}
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-md 
                                       group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                            <Icon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 block truncate">{label}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 block truncate">{description}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Form Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Form Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground">Preview do Formulário</h3>
              <p className="text-muted-foreground">
                {formFields.length === 0 
                  ? 'Adicione campos usando a paleta lateral' 
                  : `${formFields.length} campo${formFields.length > 1 ? 's' : ''} adicionado${formFields.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Controles simplificados - linhas e colunas são gerenciadas automaticamente */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Espaçamento:</Label>
                <Select 
                  value={gridConfig.gap.toString()} 
                  onValueChange={(value) => setGridConfig(prev => ({ ...prev, gap: parseInt(value) }))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">4px</SelectItem>
                    <SelectItem value="2">8px</SelectItem>
                    <SelectItem value="3">12px</SelectItem>
                    <SelectItem value="4">16px</SelectItem>
                    <SelectItem value="5">20px</SelectItem>
                    <SelectItem value="6">24px</SelectItem>
                    <SelectItem value="8">32px</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Advanced Column Controls Toggle - moved here */}
                <Button
                  size="sm"
                  variant={showColumnControls ? "default" : "outline"}
                  onClick={() => setShowColumnControls(!showColumnControls)}
                  className="px-3 h-8 text-xs"
                  title="Controles avançados de largura"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Larguras
                </Button>
              </div>
              
              {formFields.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (formFields.length > 0) {
                        setCurrentStep('workflow-designer');
                      }
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Próximo: Workflow Designer
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Advanced Grid Controls */}
          {showColumnControls && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="space-y-4">
                {/* Column Widths */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Largura das Colunas</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const maxCols = Object.values(rowStructure).length > 0 ? Math.max(...Object.values(rowStructure)) : 1;
                        setColumnWidths(Array.from({ length: maxCols }, () => 1));
                      }}
                      className="px-2 py-1 h-6 text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${Math.min(Object.values(rowStructure).length > 0 ? Math.max(...Object.values(rowStructure)) : 1, 12)}, 1fr)`}}>
                    {Array.from({ length: Object.values(rowStructure).length > 0 ? Math.max(...Object.values(rowStructure)) : 1 }, (_, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">C{index + 1}</label>
                        <input
                          type="range"
                          min="0.3"
                          max="4"
                          step="0.1"
                          value={columnWidths[index] || 1}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          title={`Ajustar largura da coluna ${index + 1}`}
                          onChange={(e) => {
                            const newWidths = [...columnWidths];
                            newWidths[index] = parseFloat(e.target.value);
                            setColumnWidths(newWidths);
                          }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(columnWidths[index] || 1).toFixed(1)}fr
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row Heights */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Altura das Linhas</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const numRows = Math.max(Object.keys(rowStructure).length, 1);
                        setRowHeights(Array.from({ length: numRows }, () => 1));
                      }}
                      className="px-2 py-1 h-6 text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${Math.min(Math.max(Object.keys(rowStructure).length, 1), 10)}, 1fr)`}}>
                    {Array.from({ length: Math.max(Object.keys(rowStructure).length, 1) }, (_, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1">L{index + 1}</label>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={rowHeights[index] || 1}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          title={`Ajustar altura da linha ${index + 1}`}
                          onChange={(e) => {
                            const newHeights = [...rowHeights];
                            newHeights[index] = parseFloat(e.target.value);
                            setRowHeights(newHeights);
                          }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {((rowHeights[index] || 1) * 120).toFixed(0)}px
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Grid Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  Estrutura: {Math.max(Object.keys(rowStructure).length, 1)} linha{Math.max(Object.keys(rowStructure).length, 1) !== 1 ? 's' : ''} • Máx. colunas: {Object.values(rowStructure).length > 0 ? Math.max(...Object.values(rowStructure)) : 1}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Fields List */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative">
          {/* Grid Visualization */}
          {formFields.length === 0 ? (
            <div className="absolute inset-0">
              {/* Full area drop zone for first field */}
              <div 
                className={`absolute inset-0 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100/20 dark:bg-gray-800/20 transition-all duration-300 ${
                  dropTarget ? 'border-green-400 dark:border-green-500 bg-green-50/30 dark:bg-green-900/30' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'copy';
                  setDropTarget({ row: 1, col: 1 });
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => handleDrop(e, 1, 1)}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-12 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-800/50 rounded-full flex items-center justify-center">
                      <Type className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Canvas Vazio</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm text-sm leading-relaxed">
                      <strong>Arraste um campo</strong> da paleta lateral para começar a criar seu formulário.
                      <br />O grid será criado automaticamente.
                    </p>
                    <div className="flex flex-col items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>ou</span>
                      <Button
                        onClick={() => {
                          addField('text');
                          setGridConfig({ columns: 1, rows: 1, gap: 4 });
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Campo de Texto
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 relative space-y-4">
              {/* Render flexible rows */}
              {Object.entries(rowStructure)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([rowIndex, columnsInRow]) => {
                  const rowNum = parseInt(rowIndex);
                  
                  return (
                    <div key={`row-${rowNum}`} className="flex gap-4 min-h-[120px]">
                      {/* Row Controls */}
                      <div className="flex flex-col items-center justify-center w-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{rowNum}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            // Remove all fields from this row
                            setFormFields(prev => prev.filter(field => parseInt(field.gridRow || '1') !== rowNum));
                            setHasUnsavedChanges(true);
                          }}
                          title="Remover linha"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Row Content */}
                      <div className="flex-1 grid gap-4" style={{
                        gridTemplateColumns: columnsInRow > 1 && columnWidths.length > 0 
                          ? Array.from({ length: columnsInRow }, (_, i) => `${columnWidths[i] || 1}fr`).join(' ')
                          : `repeat(${columnsInRow}, 1fr)`,
                        minHeight: rowHeights[rowNum - 1] 
                          ? `${(rowHeights[rowNum - 1] * 120)}px` 
                          : '120px'
                      }}>
                        {Array.from({ length: columnsInRow }, (_, colIndex) => {
                          const col = colIndex + 1;
                          const fieldInPosition = formFields.find(field => 
                            parseInt(field.gridRow || '1') === rowNum && 
                            parseInt(field.gridColumn || '1') === col
                          );
                          
                          // If there's a field, render the field
                          if (fieldInPosition) {
                            return (
                              <div
                                key={fieldInPosition.id}
                                className={`bg-card dark:bg-card/50 rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 group relative min-h-[120px] cursor-move ${
                                  draggedField?.id === fieldInPosition.id ? 'opacity-50 scale-95' : ''
                                }`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, fieldInPosition)}
                                onDragEnd={handleDragEnd}
                              >
                                {/* Drag Handle */}
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-70 transition-opacity">
                                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                </div>
                                
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                      {(() => {
                                        const fieldType = fieldTypes.find(f => f.type === fieldInPosition.type);
                                        const IconComponent = fieldType?.icon || Type;
                                        return <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
                                      })()}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{fieldInPosition.label}</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {fieldTypes.find(f => f.type === fieldInPosition.type)?.label}
                                        {fieldInPosition.required && <span className="text-red-500 ml-1">*</span>}
                                      </p>
                                      {fieldInPosition.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{fieldInPosition.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {/* Grid Position Indicator */}
                                    {fieldInPosition.gridRow && fieldInPosition.gridColumn && (
                                      <div className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                                        L{fieldInPosition.gridRow}:C{fieldInPosition.gridColumn}
                                      </div>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingField(fieldInPosition);
                                        setShowFieldModal(true);
                                      }}
                                      className="h-8 w-8 p-0"
                                      title="Editar campo"
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setFormFields(prev => prev.filter(f => f.id !== fieldInPosition.id));
                                        setHasUnsavedChanges(true);
                                      }}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                      title="Remover campo"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Field Preview */}
                                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {fieldInPosition.label}
                                    {fieldInPosition.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  
                                  {fieldInPosition.type === 'text' && (
                                    <Input
                                      placeholder={fieldInPosition.placeholder || 'Digite aqui...'}
                                      disabled
                                      className="mt-2"
                                    />
                                  )}
                                  
                                  {fieldInPosition.type === 'textarea' && (
                                    <Textarea
                                      placeholder={fieldInPosition.placeholder || 'Digite sua resposta aqui...'}
                                      disabled
                                      className="mt-2"
                                    />
                                  )}
                                  
                                  {fieldInPosition.type === 'select' && (
                                    <Select disabled>
                                      <SelectTrigger className="mt-2">
                                        <SelectValue placeholder={fieldInPosition.placeholder || 'Selecione uma opção'} />
                                      </SelectTrigger>
                                    </Select>
                                  )}
                                  
                                  {/* Add other field type previews as needed */}
                                </div>
                              </div>
                            );
                          }
                          
                          // If no field, render empty slot
                          
                          return (
                            <div
                              key={`empty-${rowNum}-${col}`}
                              className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100/30 dark:bg-gray-800/20 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer min-h-[120px] ${
                                dropTarget?.row === rowNum && dropTarget?.col === col ? 'border-green-400 bg-green-50/50 dark:bg-green-900/20' : ''
                              }`}
                              onClick={() => {
                                const newField = {
                                  id: `field-${Date.now()}`,
                                  type: 'text' as const,
                                  label: `Campo ${formFields.length + 1}`,
                                  required: false,
                                  gridRow: rowNum.toString(),
                                  gridColumn: col.toString()
                                };
                                setFormFields(prev => [...prev, newField]);
                                setHasUnsavedChanges(true);
                              }}
                              title={`Posição Linha ${rowNum}, Coluna ${col} - Clique para adicionar campo`}
                              onDragOver={(e) => handleDragOver(e, rowNum, col)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, rowNum, col)}
                            >
                              <div className="text-center">
                                <Plus className="w-5 h-5 mx-auto mb-1 opacity-50" />
                                <span className="block text-xs">L{rowNum}:C{col}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Add Column Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-auto py-12 px-4 border-dashed"
                        onClick={() => {
                          const newStructure = {...rowStructure};
                          newStructure[rowNum] = (newStructure[rowNum] || 1) + 1;
                          setRowStructure(newStructure);
                          
                          // Update gridConfig to reflect the new structure
                          const maxCols = Math.max(...Object.values(newStructure));
                          setGridConfig(prev => ({
                            ...prev,
                            columns: maxCols
                          }));
                          
                          setHasUnsavedChanges(true);
                        }}
                        title={`Adicionar coluna à linha ${rowNum}`}
                      >
                        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                          <Plus className="w-5 h-5 mb-1" />
                          <span className="text-xs">Coluna</span>
                        </div>
                      </Button>
                    </div>
                  );
                })}
                
              {/* Add Row Button */}
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  className="border-dashed"
                  onClick={() => {
                    const nextRowNum = Math.max(...Object.keys(rowStructure).map(k => parseInt(k))) + 1;
                    const newStructure = {...rowStructure};
                    newStructure[nextRowNum] = 1;
                    setRowStructure(newStructure);
                    
                    // Update gridConfig to reflect the new structure
                    setGridConfig(prev => ({
                      ...prev,
                      rows: Math.max(...Object.keys(newStructure).map(k => parseInt(k)))
                    }));
                    
                    setHasUnsavedChanges(true);
                  }}
                  title="Adicionar nova linha"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Linha
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Field Configuration Modal */}
      {showFieldModal && editingField && (
        <FieldConfigModal
          field={editingField}
          isOpen={showFieldModal}
          onClose={() => {
            setShowFieldModal(false);
            setEditingField(null);
          }}
          onSave={(updatedField) => {
            updateField(updatedField);
            setShowFieldModal(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

// Field Configuration Modal Component
const FieldConfigModal: React.FC<{
  field: FormField;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}> = ({ field, isOpen, onClose, onSave }) => {
  const [localField, setLocalField] = useState<FormField>(field);
  
  useEffect(() => {
    setLocalField(field);
  }, [field]);

  const handleSave = () => {
    onSave(localField);
  };

  const addOption = () => {
    setLocalField(prev => ({
      ...prev,
      options: [...(prev.options || []), `Opção ${(prev.options?.length || 0) + 1}`]
    }));
  };

  const removeOption = (index: number) => {
    setLocalField(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setLocalField(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt)
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Configurar Campo - {localField.label}</DialogTitle>
          <DialogDescription>
            Configure todas as propriedades e comportamentos do campo
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
            <TabsTrigger value="validation">Validação</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="max-h-[60vh] w-full">
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rótulo do Campo</Label>
                  <Input
                    value={localField.label}
                    onChange={(e) => setLocalField(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Nome do campo"
                  />
                </div>
                <div>
                  <Label>Nome Interno (ID)</Label>
                  <Input
                    value={localField.name || ''}
                    onChange={(e) => setLocalField(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="campo_exemplo"
                  />
                </div>
              </div>
              
              <div>
                <Label>Descrição/Instruções</Label>
                <Textarea
                  value={localField.description || ''}
                  onChange={(e) => setLocalField(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição detalhada ou instruções para preenchimento"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={localField.placeholder || ''}
                    onChange={(e) => setLocalField(prev => ({ ...prev, placeholder: e.target.value }))}
                    placeholder="Texto de exemplo"
                  />
                </div>
                <div>
                  <Label>Valor Padrão</Label>
                  <Input
                    value={localField.defaultValue || ''}
                    onChange={(e) => setLocalField(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder="Valor inicial"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localField.required}
                    onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, required: checked }))}
                  />
                  <Label>Obrigatório</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localField.disabled}
                    onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, disabled: checked }))}
                  />
                  <Label>Desabilitado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localField.readonly}
                    onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, readonly: checked }))}
                  />
                  <Label>Somente leitura</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localField.visible !== false}
                    onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, visible: checked }))}
                  />
                  <Label>Visível</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localField.showLabel !== false}
                    onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, showLabel: checked }))}
                  />
                  <Label>Mostrar rótulo</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 mt-4">
              {/* Configurações específicas por tipo de campo */}
              
              {/* Options for selection fields */}
              {(localField.type === 'select' || localField.type === 'radio' || localField.type === 'checkbox' || 
                localField.type === 'multiselect' || localField.type === 'checkbox-group') && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Opções de Seleção</h4>
                  <div className="space-y-2">
                    {localField.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeOption(index)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                  
                  {localField.type === 'select' && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={localField.allowSearch || false}
                          onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, allowSearch: checked }))}
                        />
                        <Label>Permitir busca</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={localField.clearable !== false}
                          onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, clearable: checked }))}
                        />
                        <Label>Permitir limpar</Label>
                      </div>
                    </div>
                  )}
                </div>
              )}

          {/* Propriedades específicas por tipo de campo */}
          
          {/* Campos Brasileiros */}
          {(localField.type === 'cpf' || localField.type === 'cnpj' || localField.type === 'cep' || localField.type === 'phone') && (
            <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">Configurações Brasileiras</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={localField.autoValidate !== false}
                  onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, autoValidate: checked }))}
                />
                <Label>Validação automática</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={localField.autoFormat !== false}
                  onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, autoFormat: checked }))}
                />
                <Label>Formatação automática</Label>
              </div>
              {localField.type === 'phone' && (
                <div>
                  <Label>Tipo de Telefone</Label>
                  <Select 
                    value={localField.phoneType || 'mobile'}
                    onValueChange={(value) => setLocalField(prev => ({ ...prev, phoneType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Celular</SelectItem>
                      <SelectItem value="landline">Fixo</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Campos de Upload */}
          {(localField.type === 'file' || localField.type === 'file-multiple' || localField.type === 'image') && (
            <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Configurações de Upload</h4>
              <div>
                <Label>Tipos aceitos</Label>
                <Input
                  value={localField.acceptedTypes || ''}
                  onChange={(e) => setLocalField(prev => ({ ...prev, acceptedTypes: e.target.value }))}
                  placeholder={localField.type === 'image' ? '.jpg,.png,.gif,.svg' : '.pdf,.doc,.txt,.xlsx'}
                />
              </div>
              <div>
                <Label>Tamanho máximo (MB)</Label>
                <Input
                  type="number"
                  value={localField.maxFileSize || ''}
                  onChange={(e) => setLocalField(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  placeholder="10"
                />
              </div>
              {localField.type === 'file-multiple' && (
                <div>
                  <Label>Máximo de arquivos</Label>
                  <Input
                    type="number"
                    value={localField.maxFiles || ''}
                    onChange={(e) => setLocalField(prev => ({ ...prev, maxFiles: parseInt(e.target.value) }))}
                    placeholder="5"
                  />
                </div>
              )}
            </div>
          )}

          {/* Campo de Rating */}
          {localField.type === 'rating' && (
            <div className="space-y-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Configurações de Avaliação</h4>
              <div>
                <Label>Número de estrelas</Label>
                <Select 
                  value={localField.maxRating?.toString() || '5'}
                  onValueChange={(value) => setLocalField(prev => ({ ...prev, maxRating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 estrelas</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                    <SelectItem value="10">10 estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={localField.allowHalf || false}
                  onCheckedChange={(checked) => setLocalField(prev => ({ ...prev, allowHalf: checked }))}
                />
                <Label>Permitir meio ponto</Label>
              </div>
            </div>
          )}

          {/* Campo de Slider */}
          {localField.type === 'slider' && (
            <div className="space-y-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200">Configurações de Slider</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor mínimo</Label>
                  <Input
                    type="number"
                    value={localField.sliderMin || '0'}
                    onChange={(e) => setLocalField(prev => ({ ...prev, sliderMin: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Valor máximo</Label>
                  <Input
                    type="number"
                    value={localField.sliderMax || '100'}
                    onChange={(e) => setLocalField(prev => ({ ...prev, sliderMax: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label>Passo</Label>
                <Input
                  type="number"
                  value={localField.sliderStep || '1'}
                  onChange={(e) => setLocalField(prev => ({ ...prev, sliderStep: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          )}

          {/* Campo Calculado */}
          {localField.type === 'calculated' && (
            <div className="space-y-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200">Configurações de Cálculo</h4>
              <div>
                <Label>Fórmula</Label>
                <Textarea
                  value={localField.formula || ''}
                  onChange={(e) => setLocalField(prev => ({ ...prev, formula: e.target.value }))}
                  placeholder="Ex: {campo1} + {campo2} * 0.1"
                  rows={3}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Use {`{nomeCampo}`} para referenciar outros campos
                </p>
              </div>
            </div>
          )}

          {/* Campo de Moeda */}
          {localField.type === 'currency' && (
            <div className="space-y-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Configurações de Moeda</h4>
              <div>
                <Label>Moeda</Label>
                <Select 
                  value={localField.currency || 'BRL'}
                  onValueChange={(value) => setLocalField(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Casas decimais</Label>
                <Select 
                  value={localField.decimalPlaces?.toString() || '2'}
                  onValueChange={(value) => setLocalField(prev => ({ ...prev, decimalPlaces: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Campo de Assinatura */}
          {localField.type === 'signature' && (
            <div className="space-y-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Configurações de Assinatura</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Largura (px)</Label>
                  <Input
                    type="number"
                    value={localField.signatureWidth || '400'}
                    onChange={(e) => setLocalField(prev => ({ ...prev, signatureWidth: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Altura (px)</Label>
                  <Input
                    type="number"
                    value={localField.signatureHeight || '150'}
                    onChange={(e) => setLocalField(prev => ({ ...prev, signatureHeight: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          )}
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Regras de Validação</h3>
                
                {/* Validação para campos de texto */}
                {(localField.type === 'text' || localField.type === 'textarea' || localField.type === 'email') && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-3">Validação de Texto</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Comprimento Mínimo</Label>
                        <Input
                          type="number"
                          value={localField.minLength || ''}
                          onChange={(e) => setLocalField(prev => ({ ...prev, minLength: parseInt(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Comprimento Máximo</Label>
                        <Input
                          type="number"
                          value={localField.maxLength || ''}
                          onChange={(e) => setLocalField(prev => ({ ...prev, maxLength: parseInt(e.target.value) }))}
                          placeholder="255"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Padrão RegEx</Label>
                      <Input
                        value={localField.pattern || ''}
                        onChange={(e) => setLocalField(prev => ({ ...prev, pattern: e.target.value }))}
                        placeholder="^[A-Za-z0-9]+$"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Expressão regular para validação</p>
                    </div>
                  </div>
                )}
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Mensagens de Erro</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Mensagem de Campo Obrigatório</Label>
                      <Input
                        value={localField.errorRequired || ''}
                        onChange={(e) => setLocalField(prev => ({ ...prev, errorRequired: e.target.value }))}
                        placeholder="Este campo é obrigatório"
                      />
                    </div>
                    <div>
                      <Label>Mensagem de Formato Inválido</Label>
                      <Input
                        value={localField.errorFormat || ''}
                        onChange={(e) => setLocalField(prev => ({ ...prev, errorFormat: e.target.value }))}
                        placeholder="Formato inválido"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações de Layout</h3>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Posicionamento no Grid</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Span Colunas</Label>
                      <Select 
                        value={localField.gridColumnSpan?.toString() || '1'}
                        onValueChange={(value) => setLocalField(prev => ({ 
                          ...prev, 
                          gridColumnSpan: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 coluna</SelectItem>
                          <SelectItem value="2">2 colunas</SelectItem>
                          <SelectItem value="3">3 colunas</SelectItem>
                          <SelectItem value="4">4 colunas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Largura</Label>
                      <Select 
                        value={localField.width || 'full'}
                        onValueChange={(value) => setLocalField(prev => ({ ...prev, width: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">100%</SelectItem>
                          <SelectItem value="3/4">75%</SelectItem>
                          <SelectItem value="1/2">50%</SelectItem>
                          <SelectItem value="1/3">33%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Espaçamento</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Margem Superior</Label>
                      <Select 
                        value={localField.marginTop || '0'}
                        onValueChange={(value) => setLocalField(prev => ({ ...prev, marginTop: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="2">8px</SelectItem>
                          <SelectItem value="4">16px</SelectItem>
                          <SelectItem value="6">24px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Margem Inferior</Label>
                      <Select 
                        value={localField.marginBottom || '4'}
                        onValueChange={(value) => setLocalField(prev => ({ ...prev, marginBottom: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="2">8px</SelectItem>
                          <SelectItem value="4">16px</SelectItem>
                          <SelectItem value="6">24px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Salvar Campo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Professional Node Palette
const NodePalette: React.FC<{
  onNodeAdd: (type: WorkflowNode['type'], position: { x: number; y: number }) => void;
}> = ({ onNodeAdd }) => {
  const nodeTypes = [
    { type: 'start', label: 'Início', icon: Play, color: 'from-emerald-500 to-teal-600' },
    { type: 'end', label: 'Fim', icon: Square, color: 'from-red-500 to-rose-600' },
    { type: 'task', label: 'Tarefa', icon: CheckCircle, color: 'from-blue-500 to-indigo-600' },
    { type: 'decision', label: 'Decisão', icon: GitBranch, color: 'from-amber-400 to-orange-500' },
    { type: 'parallel', label: 'Paralelo', icon: GitMerge, color: 'from-purple-500 to-indigo-600' },
    { type: 'timer', label: 'Timer', icon: Timer, color: 'from-orange-500 to-red-500' },
    { type: 'notification', label: 'Notificação', icon: Bell, color: 'from-pink-500 to-rose-600' },
    { type: 'process', label: 'Processo', icon: Settings, color: 'from-cyan-500 to-blue-600' },
    { type: 'database', label: 'Database', icon: Database, color: 'from-green-500 to-emerald-600' },
    { type: 'integration', label: 'Integração', icon: Link2, color: 'from-violet-500 to-purple-600' }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Elementos</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Arraste para o canvas</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3">
          {nodeTypes.map(({ type, label, icon: Icon, color }) => (
            <div
              key={type}
              className={`relative group cursor-pointer p-3 rounded-xl bg-gradient-to-br ${color} 
                         hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg
                         hover:shadow-xl border border-white/20`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/reactflow', JSON.stringify({ type }));
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={() => {
                // Add node at center of canvas when clicked
                const centerX = 400;
                const centerY = 300;
                onNodeAdd(type as WorkflowNode['type'], { x: centerX, y: centerY });
              }}
              title={`Adicionar ${label}`}
            >
              <div className="flex flex-col items-center text-white">
                <div className="p-2 bg-white/20 rounded-lg mb-2 backdrop-blur-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{label}</span>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export const AlexProcessDesignerEnhancedModal: React.FC<AlexProcessDesignerEnhancedModalProps> = ({
  isOpen,
  onClose,
  mode,
  processId,
  initialData,
  onSave
}) => {
  // Main state
  const [currentStep, setCurrentStep] = useState<'form-builder' | 'workflow-designer'>('form-builder');
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  const [processName, setProcessName] = useState('');
  
  // Form Builder state
  const [selectedFieldType, setSelectedFieldType] = useState<string>('');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [draggedField, setDraggedField] = useState<FormField | null>(null);
  const [formGridConfig, setFormGridConfig] = useState({ columns: 1, rows: 1, gap: 4 });

  // Canvas state
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Workflow state
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [workflowConnections, setWorkflowConnections] = useState<WorkflowConnection[]>([]);
  const [selectedWorkflowNode, setSelectedWorkflowNode] = useState<WorkflowNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState<WorkflowNode | null>(null);
  const [tempConnection, setTempConnection] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

  // Form state
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formPreviewOpen, setIsFormPreviewOpen] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(1);

  const { saveProcess, updateProcess, loadProcess, loading: saveLoading, error } = useProcessManagement();

  // Load initial data when component mounts or initialData changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setProcessName(initialData.name || '');
      // Convert ProcessTemplate to WorkflowNodes and WorkflowConnections if needed
      if (initialData.workflow?.nodes) {
        setWorkflowNodes(initialData.workflow.nodes);
      }
      if (initialData.workflow?.connections) {
        setWorkflowConnections(initialData.workflow.connections);
      }
      if (initialData.fields) {
        setFormFields(initialData.fields);
      }
    }
  }, [initialData, mode]);

  // Professional Node Creation System
  const createNode = useCallback((
    type: WorkflowNode['type'], 
    position: { x: number; y: number },
    customData?: Partial<WorkflowNode['data']>
  ): WorkflowNode => {
    const nodeDefaults = {
      start: { width: 120, height: 120, label: 'Início' },
      end: { width: 120, height: 80, label: 'Fim' },
      task: { width: 160, height: 100, label: 'Nova Tarefa' },
      decision: { width: 120, height: 120, label: 'Decisão' },
      parallel: { width: 180, height: 80, label: 'Processo Paralelo' },
      timer: { width: 140, height: 90, label: 'Timer' },
      notification: { width: 150, height: 90, label: 'Notificação' },
      process: { width: 160, height: 100, label: 'Processo' },
      database: { width: 140, height: 100, label: 'Base de Dados' },
      integration: { width: 160, height: 90, label: 'Integração' }
    };

    const defaults = nodeDefaults[type];
    
    return {
      id: `node-${nodeIdCounter.current++}`,
      type,
      position,
      size: { width: defaults.width, height: defaults.height },
      data: {
        label: defaults.label,
        description: '',
        properties: {},
        ...customData
      }
    };
  }, []);

  // Add node to canvas
  const addNode = useCallback((type: WorkflowNode['type'], position: { x: number; y: number }) => {
    const newNode = createNode(type, position);
    setWorkflowNodes(prev => [...prev, newNode]);
    setSelectedWorkflowNode(newNode);
    setHasUnsavedChanges(true);
    toast.success(`Elemento ${newNode.data.label} adicionado`);
  }, [createNode]);

  // Professional Canvas Event Handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      e.preventDefault();
    } else if (e.target === e.currentTarget) {
      // Clicked on empty canvas
      setSelectedWorkflowNode(null);
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionSource(null);
        setTempConnection(null);
      }
    }
  }, [canvasOffset, isConnecting]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
    
    if (isConnecting && connectionSource && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
      const canvasY = (e.clientY - rect.top - canvasOffset.y) / canvasScale;
      
      setTempConnection({
        start: {
          x: connectionSource.position.x + connectionSource.size.width / 2,
          y: connectionSource.position.y + connectionSource.size.height / 2
        },
        end: { x: canvasX, y: canvasY }
      });
    }
  }, [isPanning, panStart, isConnecting, connectionSource, canvasOffset, canvasScale]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Professional Node Interaction System
  const handleNodeClick = useCallback((node: WorkflowNode) => {
    if (isConnecting && connectionSource && connectionSource.id !== node.id) {
      // Complete connection
      const newConnection: WorkflowConnection = {
        id: `connection-${Date.now()}`,
        source: connectionSource.id,
        target: node.id,
        type: 'smooth',
        style: {
          strokeColor: '#3b82f6',
          strokeWidth: 2,
          animated: true
        }
      };
      
      setWorkflowConnections(prev => [...prev, newConnection]);
      setIsConnecting(false);
      setConnectionSource(null);
      setTempConnection(null);
      setHasUnsavedChanges(true);
      toast.success('Conexão criada com sucesso');
    } else {
      setSelectedWorkflowNode(node);
    }
  }, [isConnecting, connectionSource]);

  const startConnection = useCallback((node: WorkflowNode) => {
    setIsConnecting(true);
    setConnectionSource(node);
    toast.info('Clique em outro elemento para conectar');
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setWorkflowNodes(prev => prev.filter(node => node.id !== nodeId));
    setWorkflowConnections(prev => prev.filter(conn => conn.source !== nodeId && conn.target !== nodeId));
    setSelectedWorkflowNode(null);
    setHasUnsavedChanges(true);
    toast.success('Elemento removido');
  }, []);

  // Canvas controls
  const handleZoom = useCallback((delta: number) => {
    setCanvasScale(prev => Math.min(3, Math.max(0.2, prev + delta)));
  }, []);

  const resetCanvas = useCallback(() => {
    setCanvasScale(1);
    setCanvasOffset({ x: 0, y: 0 });
  }, []);

  const fitToScreen = useCallback(() => {
    if (workflowNodes.length === 0) return;

    const padding = 100;
    const minX = Math.min(...workflowNodes.map(n => n.position.x));
    const minY = Math.min(...workflowNodes.map(n => n.position.y));
    const maxX = Math.max(...workflowNodes.map(n => n.position.x + n.size.width));
    const maxY = Math.max(...workflowNodes.map(n => n.position.y + n.size.height));

    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    if (canvasRef.current) {
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;
      
      const scaleX = canvasWidth / contentWidth;
      const scaleY = canvasHeight / contentHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setCanvasScale(newScale);
      setCanvasOffset({
        x: (canvasWidth - contentWidth * newScale) / 2 - minX * newScale + padding * newScale,
        y: (canvasHeight - contentHeight * newScale) / 2 - minY * newScale + padding * newScale
      });
    }
  }, [workflowNodes]);

  // Professional Node Rendering System
  const renderWorkflowNodes = useCallback(() => {
    if (!workflowNodes || workflowNodes.length === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-300/30 shadow-xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Workflow className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Canvas Vazio</h3>
            <p className="text-gray-600 mb-4 max-w-xs">Arraste elementos da barra lateral ou clique nos botões para criar seu workflow profissional</p>
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                onClick={() => addNode('start', { x: 200, y: 200 })}
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Adicionar Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return workflowNodes.map((node) => {
      if (!node || !node.id || !node.position) {
        return null;
      }

      const isSelected = selectedWorkflowNode?.id === node.id;
      
      // Professional node styling system
      const getNodeStyles = (nodeType: WorkflowNode['type']) => {
        const styleMap = {
          start: {
            gradient: 'from-emerald-400 via-emerald-500 to-teal-600',
            border: 'border-emerald-300',
            icon: Play,
            shape: 'rounded-full',
            glow: 'shadow-emerald-500/30'
          },
          end: {
            gradient: 'from-red-400 via-red-500 to-rose-600',
            border: 'border-red-300',
            icon: Square,
            shape: 'rounded-xl',
            glow: 'shadow-red-500/30'
          },
          task: {
            gradient: 'from-blue-400 via-blue-500 to-indigo-600',
            border: 'border-blue-300',
            icon: CheckCircle,
            shape: 'rounded-xl',
            glow: 'shadow-blue-500/30'
          },
          decision: {
            gradient: 'from-amber-400 via-yellow-500 to-orange-500',
            border: 'border-amber-300',
            icon: GitBranch,
            shape: 'rounded-lg transform rotate-45',
            glow: 'shadow-amber-500/30'
          },
          parallel: {
            gradient: 'from-purple-400 via-purple-500 to-indigo-600',
            border: 'border-purple-300',
            icon: GitMerge,
            shape: 'rounded-xl',
            glow: 'shadow-purple-500/30'
          },
          timer: {
            gradient: 'from-orange-400 via-orange-500 to-red-500',
            border: 'border-orange-300',
            icon: Timer,
            shape: 'rounded-xl',
            glow: 'shadow-orange-500/30'
          },
          notification: {
            gradient: 'from-pink-400 via-pink-500 to-rose-600',
            border: 'border-pink-300',
            icon: Bell,
            shape: 'rounded-xl',
            glow: 'shadow-pink-500/30'
          },
          process: {
            gradient: 'from-cyan-400 via-cyan-500 to-blue-600',
            border: 'border-cyan-300',
            icon: Settings,
            shape: 'rounded-xl',
            glow: 'shadow-cyan-500/30'
          },
          database: {
            gradient: 'from-green-400 via-green-500 to-emerald-600',
            border: 'border-green-300',
            icon: Database,
            shape: 'rounded-xl',
            glow: 'shadow-green-500/30'
          },
          integration: {
            gradient: 'from-violet-400 via-violet-500 to-purple-600',
            border: 'border-violet-300',
            icon: Link2,
            shape: 'rounded-xl',
            glow: 'shadow-violet-500/30'
          }
        };

        return styleMap[nodeType] || styleMap.task;
      };

      const nodeStyles = getNodeStyles(node.type);
      const IconComponent = nodeStyles.icon;
      const isDecision = node.type === 'decision';

      return (
        <div
          key={node.id}
          className={`absolute cursor-pointer select-none transition-all duration-300 ease-out group
                     hover:scale-105 active:scale-95 ${isSelected ? 'z-50' : 'z-20'}`}
          style={{
            left: `${node.position.x}px`,
            top: `${node.position.y}px`,
            width: `${node.size.width}px`,
            height: `${node.size.height}px`,
            transform: `scale(${isSelected ? 1.05 : 1})`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleNodeClick(node);
          }}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${nodeStyles.gradient} ${nodeStyles.shape} 
                          blur-lg opacity-20 scale-110 ${nodeStyles.glow}`}></div>
          
          {/* Main node */}
          <div className={`relative w-full h-full bg-gradient-to-br ${nodeStyles.gradient} 
                          border-3 ${nodeStyles.border} ${nodeStyles.shape} 
                          shadow-2xl ${nodeStyles.glow} backdrop-blur-sm 
                          flex flex-col items-center justify-center text-white
                          ${isSelected ? 'ring-4 ring-white/50' : 'hover:ring-2 hover:ring-white/30'}`}>
            
            {/* Content */}
            <div className={`flex flex-col items-center justify-center p-3 ${isDecision ? 'transform -rotate-45' : ''}`}>
              {/* Icon */}
              <div className="mb-2 p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <IconComponent className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              
              {/* Label */}
              <div className="text-sm font-bold text-center leading-tight max-w-full">
                <div className="truncate px-1">
                  {node.data.label}
                </div>
              </div>
              
              {/* Description */}
              {node.data.description && (
                <div className="text-xs text-white/90 text-center mt-1 leading-tight max-w-full">
                  <div className="truncate px-1">
                    {node.data.description}
                  </div>
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            <div className="absolute bottom-2 right-2">
              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-white/60'}`}></div>
            </div>
          </div>

          {/* Professional Action Toolbar */}
          {isSelected && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 
                           bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-3 
                           shadow-2xl border border-white/20 flex items-center gap-3
                           animate-in slide-in-from-top-2 duration-500">
              
              <Button
                size="sm"
                variant="ghost"
                className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
                  isConnecting && connectionSource?.id === node.id 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white hover:scale-110 shadow-lg`}
                onClick={(e) => {
                  e.stopPropagation();
                  startConnection(node);
                }}
                title="Conectar elemento"
              >
                {isConnecting && connectionSource?.id === node.id ? (
                  <Target className="h-5 w-5" />
                ) : (
                  <Link2 className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl 
                          hover:scale-110 transition-all duration-200 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  // Future: Open configuration panel
                  toast.info('Configuração em desenvolvimento');
                }}
                title="Configurar elemento"
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-10 w-10 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl 
                          hover:scale-110 transition-all duration-200 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                title="Remover elemento"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  }, [workflowNodes, selectedWorkflowNode, isConnecting, connectionSource, handleNodeClick, startConnection, deleteNode, addNode]);

  // Professional Connection Rendering
  const renderConnections = useCallback(() => {
    const allConnections = [...workflowConnections];
    
    if (tempConnection) {
      allConnections.push({
        id: 'temp',
        source: 'temp',
        target: 'temp',
        type: 'smooth',
        style: {
          strokeColor: '#f59e0b',
          strokeWidth: 3,
          strokeDasharray: '10,5',
          animated: true
        }
      } as any);
    }

    return (
      <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 5 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="8"
            refX="11"
            refY="4"
            orient="auto"
            className="fill-current text-blue-500"
          >
            <polygon points="0 0, 12 4, 0 8" />
          </marker>
          <marker
            id="arrowhead-temp"
            markerWidth="12"
            markerHeight="8"
            refX="11"
            refY="4"
            orient="auto"
            className="fill-current text-amber-500"
          >
            <polygon points="0 0, 12 4, 0 8" />
          </marker>
        </defs>
        
        {allConnections.map((connection) => {
          let sourcePoint, targetPoint;
          
          if (connection.id === 'temp' && tempConnection) {
            sourcePoint = tempConnection.start;
            targetPoint = tempConnection.end;
          } else {
            const sourceNode = workflowNodes.find(n => n.id === connection.source);
            const targetNode = workflowNodes.find(n => n.id === connection.target);
            
            if (!sourceNode || !targetNode) return null;
            
            sourcePoint = {
              x: sourceNode.position.x + sourceNode.size.width / 2,
              y: sourceNode.position.y + sourceNode.size.height / 2
            };
            targetPoint = {
              x: targetNode.position.x + targetNode.size.width / 2,
              y: targetNode.position.y + targetNode.size.height / 2
            };
          }

          const isTemp = connection.id === 'temp';
          const strokeColor = isTemp ? '#f59e0b' : (connection.style?.strokeColor || '#3b82f6');
          const strokeWidth = isTemp ? 3 : (connection.style?.strokeWidth || 2);
          const strokeDasharray = isTemp ? '10,5' : connection.style?.strokeDasharray;
          const markerId = isTemp ? 'arrowhead-temp' : 'arrowhead';

          return (
            <g key={connection.id}>
              {/* Background stroke for better visibility */}
              <line
                x1={sourcePoint.x} y1={sourcePoint.y}
                x2={targetPoint.x} y2={targetPoint.y}
                stroke="white" strokeWidth={strokeWidth + 4}
                strokeLinecap="round" opacity="0.3"
              />
              
              {/* Main connection line */}
              <line
                x1={sourcePoint.x} y1={sourcePoint.y}
                x2={targetPoint.x} y2={targetPoint.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                markerEnd={`url(#${markerId})`}
                className={connection.style?.animated ? 'animate-pulse' : ''}
              />
              
              {/* Connection label */}
              {connection.label && (
                <text
                  x={(sourcePoint.x + targetPoint.x) / 2}
                  y={(sourcePoint.y + targetPoint.y) / 2}
                  textAnchor="middle"
                  className="fill-current text-gray-700 text-sm font-medium"
                  style={{ dominantBaseline: 'middle' }}
                >
                  <tspan className="bg-white px-2 py-1 rounded">{connection.label}</tspan>
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [workflowConnections, workflowNodes, tempConnection]);

  // Save functionality
  const handleSave = useCallback(async () => {
    if (!processName.trim()) {
      toast.error('Nome do processo é obrigatório');
      return;
    }

    const processData = {
      name: processName,
      description: 'Processo criado com Process Designer Enhanced',
      category: 'custom' as const,
      framework: 'CUSTOM',
      formFields,
      formRows: [],
      workflowNodes,
      workflowConnections
    };

    try {
      if (mode === 'create') {
        const processId = await saveProcess(processData);
        if (processId) {
          setHasUnsavedChanges(false);
          toast.success('Processo salvo com sucesso!');
          onSave?.(processData);
        }
      } else if (mode === 'edit' && processId) {
        const success = await updateProcess(processId, processData);
        if (success) {
          setHasUnsavedChanges(false);
          toast.success('Processo atualizado com sucesso!');
          onSave?.(processData);
        }
      }
    } catch (error) {
      console.error('Error saving process:', error);
      toast.error('Erro ao salvar processo');
    }
  }, [processName, formFields, workflowNodes, workflowConnections, mode, processId, saveProcess, updateProcess, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className={`bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 ${
        isMaximized 
          ? 'w-full h-full max-w-none max-h-none rounded-none' 
          : 'w-[95vw] h-[95vh] max-w-7xl rounded-2xl'
      }`}>
        
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
              <Workflow className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {mode === 'create' ? 'Criar Novo' : 'Editar'} - Process Designer Professional
              </h1>
              {processName && (
                <h2 className="text-lg font-semibold text-blue-100">
                  {processName}
                </h2>
              )}
              <p className="text-sm text-blue-100/80">
                {currentStep === 'form-builder' 
                  ? 'Etapa 1: Construtor de Formulários • Campos Dinâmicos • Validações Inteligentes'
                  : 'Etapa 2: Designer de Workflow • Canvas Profissional • Elementos Inteligentes'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100 border-yellow-400/30">
                <Circle className="w-2 h-2 mr-2 fill-current animate-pulse" />
                Não salvo
              </Badge>
            )}
            
            <Input
              placeholder="Nome do processo..."
              value={processName}
              onChange={(e) => {
                setProcessName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="w-64 bg-white/10 border-white/20 text-white placeholder-white/60"
            />
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-white hover:bg-white/10"
              title={isMaximized ? "Restaurar" : "Maximizar"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            <Button 
              onClick={handleSave}
              disabled={!processName.trim() || saveLoading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              size="sm"
            >
              {saveLoading ? (
                <React.Fragment>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </React.Fragment>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-8">
            {/* Step 1 */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              currentStep === 'form-builder' 
                ? 'bg-blue-100 text-blue-700 shadow-md' 
                : formFields.length > 0 
                  ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200'
            }`} onClick={() => setCurrentStep('form-builder')}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 'form-builder' 
                  ? 'bg-blue-500 text-white' 
                  : formFields.length > 0 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {formFields.length > 0 ? '✓' : '1'}
              </div>
              <div>
                <p className="font-medium">Construtor de Formulários</p>
                <p className="text-xs opacity-75">
                  {formFields.length > 0 ? `${formFields.length} campos criados` : 'Criar campos do formulário'}
                </p>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="text-gray-400">
              <ChevronRight className="w-5 h-5" />
            </div>
            
            {/* Step 2 */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              currentStep === 'workflow-designer' 
                ? 'bg-blue-100 text-blue-700 shadow-md' 
                : formFields.length > 0 
                  ? 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`} onClick={() => {
              if (formFields.length > 0) {
                setCurrentStep('workflow-designer');
              }
            }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 'workflow-designer' 
                  ? 'bg-blue-500 text-white' 
                  : workflowNodes.length > 0 
                    ? 'bg-green-500 text-white' 
                    : formFields.length > 0 
                      ? 'bg-gray-300 text-gray-600' 
                      : 'bg-gray-200 text-gray-400'
              }`}>
                {workflowNodes.length > 0 ? '✓' : '2'}
              </div>
              <div>
                <p className={`font-medium ${formFields.length === 0 ? 'text-gray-400' : ''}`}>
                  Designer de Workflow
                </p>
                <p className="text-xs opacity-75">
                  {formFields.length === 0 
                    ? 'Complete a etapa 1 primeiro' 
                    : workflowNodes.length > 0 
                      ? `${workflowNodes.length} elementos no workflow` 
                      : 'Desenhar o fluxo do processo'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex h-[calc(100%-160px)]">
          {/* Step 1: Form Builder */}
          {currentStep === 'form-builder' && (
            <FormBuilderSection 
              formFields={formFields}
              setFormFields={setFormFields}
              editingField={editingField}
              setEditingField={setEditingField}
              showFieldModal={showFieldModal}
              setShowFieldModal={setShowFieldModal}
              selectedFieldType={selectedFieldType}
              setSelectedFieldType={setSelectedFieldType}
              setHasUnsavedChanges={setHasUnsavedChanges}
              setCurrentStep={setCurrentStep}
              gridConfig={formGridConfig}
              setGridConfig={setFormGridConfig}
            />
          )}
          
          {/* Step 2: Workflow Designer */}
          {currentStep === 'workflow-designer' && (
            <React.Fragment>
              {/* Node Palette */}
              <NodePalette onNodeAdd={addNode} />
              
              {/* Professional Canvas */}
              <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <div
                  ref={canvasRef}
                  className="w-full h-full relative cursor-grab active:cursor-grabbing"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    handleZoom(delta);
                  }}
                >
                  {/* Professional Grid */}
                  <CanvasGrid scale={canvasScale} offset={canvasOffset} />
                  
                  {/* Canvas Content */}
                  <div
                    className="absolute inset-0 transition-transform duration-100"
                    style={{
                      transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`
                    }}
                  >
                    {/* Render Nodes */}
                    {renderWorkflowNodes()}
                    
                    {/* Render Connections */}
                    {renderConnections()}
                  </div>
                  
                  {/* Canvas Controls */}
                  <CanvasControls
                    scale={canvasScale}
                    onScaleChange={setCanvasScale}
                    onReset={resetCanvas}
                    onFitToScreen={fitToScreen}
                  />
                  
                  {/* Canvas Info */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Elementos: {workflowNodes.length}</span>
                      <span>Conexões: {workflowConnections.length}</span>
                      <span>Zoom: {Math.round(canvasScale * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlexProcessDesignerEnhancedModal;