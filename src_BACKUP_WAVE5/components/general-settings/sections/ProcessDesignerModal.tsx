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
  Star,
  BookOpen,
  Heart,
  AlertCircle
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
      opacity?: number;
      rotation?: number;
      shadow?: string;
      animation?: string;
      theme?: string;
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

interface ProcessDesignerModalProps {
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
      <div className="w-64 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-foreground">Tipos de Campo</h3>
          <p className="text-xs text-muted-foreground">Arraste ou clique para adicionar</p>
        </div>
        
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-4">
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
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    {categoryLabels[category] || category}
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {fields.map(({ type, label, icon: Icon, description }) => (
                      <div
                        key={type}
                        className={`group relative cursor-move p-2 rounded-md bg-gradient-to-br ${categoryColors[category] || categoryColors.basic}
                                   border border-gray-200/50 dark:border-gray-700/50
                                   hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200
                                   hover:scale-105 active:scale-95`}
                        onClick={() => addField(type)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('fieldType', type);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        title={description + ' - Clique ou arraste para o grid'}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-sm 
                                       group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                            <Icon className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 block truncate leading-tight">{label}</span>
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-background">
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
    <div className="w-52 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-foreground">Elementos</h3>
        <p className="text-xs text-muted-foreground">Arraste para o canvas</p>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="grid grid-cols-2 gap-2">
          {nodeTypes.map(({ type, label, icon: Icon, color }) => (
            <div
              key={type}
              className={`relative group cursor-pointer p-2 rounded-lg bg-gradient-to-br ${color} 
                         hover:scale-105 active:scale-95 transition-all duration-200 shadow-md
                         hover:shadow-lg border border-white/20`}
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
                <div className="p-1.5 bg-white/20 rounded-md mb-1.5 backdrop-blur-sm">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{label}</span>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export const ProcessDesignerModal: React.FC<ProcessDesignerModalProps> = ({
  isOpen,
  onClose,
  mode,
  processId,
  initialData,
  onSave
}) => {
  // Main state
  const [showInitialChoice, setShowInitialChoice] = useState(true);
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
  
  // Node configuration modal state
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [configuratingNode, setConfiguratingNode] = useState<WorkflowNode | null>(null);
  const [nodeConfigData, setNodeConfigData] = useState<{
    label: string;
    description: string;
    properties: Record<string, any>;
  }>({
    label: '',
    description: '',
    properties: {}
  });

  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState<WorkflowNode | null>(null);
  const [tempConnection, setTempConnection] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  
  // Node dragging state
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState<WorkflowNode | null>(null);

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
      start: { width: 80, height: 80, label: 'Início' },
      end: { width: 80, height: 60, label: 'Fim' },
      task: { width: 110, height: 70, label: 'Nova Tarefa' },
      decision: { width: 80, height: 80, label: 'Decisão' },
      parallel: { width: 120, height: 60, label: 'Processo Paralelo' },
      timer: { width: 100, height: 65, label: 'Timer' },
      notification: { width: 105, height: 65, label: 'Notificação' },
      process: { width: 120, height: 70, label: 'Processo' },
      database: { width: 90, height: 65, label: 'Base de Dados' },
      integration: { width: 110, height: 65, label: 'Integração' }
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
    } else if (e.target === e.currentTarget && !isDraggingNode) {
      // Clicked on empty canvas
      setSelectedWorkflowNode(null);
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionSource(null);
        setTempConnection(null);
      }
    }
  }, [canvasOffset, isConnecting, isDraggingNode]);

  // Node mouse move handler (must be declared before handleCanvasMouseMove)
  const handleNodeMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingNode && draggedNode && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - canvasRect.left - canvasOffset.x) / canvasScale - dragOffset.x;
      const newY = (e.clientY - canvasRect.top - canvasOffset.y) / canvasScale - dragOffset.y;
      
      // Update node position
      setWorkflowNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggedNode.id
            ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
            : node
        )
      );
    }
  }, [isDraggingNode, draggedNode, canvasRef, canvasOffset, canvasScale, dragOffset]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
    
    // Handle node dragging
    if (isDraggingNode) {
      handleNodeMouseMove(e);
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
  }, [isPanning, panStart, isDraggingNode, handleNodeMouseMove, isConnecting, connectionSource, canvasOffset, canvasScale]);

  // Canvas drag and drop handlers
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const nodeDataStr = e.dataTransfer.getData('application/reactflow');
      if (nodeDataStr) {
        const nodeData = JSON.parse(nodeDataStr);
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (canvasRect) {
          // Calculate position relative to canvas with zoom and pan offset
          const x = (e.clientX - canvasRect.left - canvasOffset.x) / canvasScale;
          const y = (e.clientY - canvasRect.top - canvasOffset.y) / canvasScale;
          
          addNode(nodeData.type as WorkflowNode['type'], { x, y });
        }
      }
    } catch (error) {
      console.error('Error parsing dropped node data:', error);
    }
  }, [canvasRef, canvasOffset, canvasScale, addNode]);

  // Node dragging handlers
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    
    // Don't start dragging if we're connecting
    if (isConnecting) {
      handleNodeClick(node);
      return;
    }
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const nodeX = (e.clientX - canvasRect.left - canvasOffset.x) / canvasScale;
      const nodeY = (e.clientY - canvasRect.top - canvasOffset.y) / canvasScale;
      
      setIsDraggingNode(true);
      setDraggedNode(node);
      setDragOffset({
        x: nodeX - node.position.x,
        y: nodeY - node.position.y
      });
      setSelectedWorkflowNode(node);
    }
  }, [isConnecting, canvasRef, canvasOffset, canvasScale]);


  const handleNodeMouseUp = useCallback(() => {
    setIsDraggingNode(false);
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    handleNodeMouseUp();
  }, [handleNodeMouseUp]);

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
    const nodeToDelete = workflowNodes.find(n => n.id === nodeId);
    if (nodeToDelete) {
      setWorkflowNodes(prev => prev.filter(node => node.id !== nodeId));
      setWorkflowConnections(prev => prev.filter(conn => conn.source !== nodeId && conn.target !== nodeId));
      setSelectedWorkflowNode(null);
      setHasUnsavedChanges(true);
      toast.success(`${nodeToDelete.data.label} removido`);
    }
  }, [workflowNodes]);

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
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDraggingNode) {
              handleNodeClick(node);
            }
          }}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${nodeStyles.gradient} ${nodeStyles.shape} 
                          blur-lg opacity-20 scale-110 ${nodeStyles.glow}`}></div>
          
          {/* Main node */}
          <div className={`
              ${node.data.style?.animation === 'pulse' ? 'animate-pulse' :
                node.data.style?.animation === 'bounce' ? 'animate-bounce' :
                node.data.style?.animation === 'spin' ? 'animate-spin' : ''} 
              relative w-full h-full ${nodeStyles.shape}
              ${!node.data.style ? `bg-gradient-to-br ${nodeStyles.gradient} border-3 ${nodeStyles.border}` : ''} 
              shadow-2xl ${nodeStyles.glow} backdrop-blur-sm 
              flex flex-col items-center justify-center text-white
              ${isSelected ? 'ring-4 ring-white/50' : 'hover:ring-2 hover:ring-white/30'}
            `}
            style={node.data.style ? {
              backgroundColor: node.data.style.backgroundColor,
              borderColor: node.data.style.borderColor,
              borderWidth: `${node.data.style.borderWidth}px`,
              borderRadius: `${node.data.style.borderRadius}px`,
              borderStyle: 'solid',
              color: node.data.style.textColor,
              opacity: node.data.style.opacity || 1,
              transform: `rotate(${node.data.style.rotation || 0}deg)`,
              boxShadow: {
                'none': 'none',
                'small': '0 1px 3px rgba(0,0,0,0.1)',
                'medium': '0 4px 6px rgba(0,0,0,0.1)',
                'large': '0 10px 15px rgba(0,0,0,0.1)',
                'glow': `0 0 20px ${node.data.style.backgroundColor}40`
              }[node.data.style.shadow || 'none']
            } : {}}>
            {/* Removed duplicate className - animation styles already applied */}
            
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

          {/* Connection anchor points */}
          <div className={`absolute inset-0 pointer-events-none ${isSelected || isConnecting ? 'opacity-100' : 'opacity-0 group-hover:opacity-75'} transition-opacity duration-200`}>
            {/* Top connection point */}
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400 border border-white rounded-full shadow-sm"></div>
            {/* Bottom connection point */}
            <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400 border border-white rounded-full shadow-sm"></div>
            {/* Left connection point */}
            <div className="absolute top-1/2 -left-1.5 transform -translate-y-1/2 w-3 h-3 bg-green-400 border border-white rounded-full shadow-sm"></div>
            {/* Right connection point */}
            <div className="absolute top-1/2 -right-1.5 transform -translate-y-1/2 w-3 h-3 bg-green-400 border border-white rounded-full shadow-sm"></div>
          </div>

          {/* Professional Action Toolbar */}
          {selectedWorkflowNode?.id === node.id && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                           bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg px-1.5 py-1.5 
                           shadow-lg border border-white/20 dark:border-gray-600/20 flex items-center gap-1.5
                           animate-in slide-in-from-top-1 duration-200">
              
              <Button
                size="sm"
                variant="ghost"
                className={`h-6 w-6 p-0 rounded-md transition-all duration-200 ${
                  isConnecting && connectionSource?.id === node.id 
                    ? 'bg-orange-500 hover:bg-orange-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white hover:scale-105 shadow-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  startConnection(node);
                }}
                title={isConnecting && connectionSource?.id === node.id ? "Clique em outro nó para conectar" : "Iniciar conexão"}
              >
                {isConnecting && connectionSource?.id === node.id ? (
                  <Target className="h-3 w-3" />
                ) : (
                  <Link2 className="h-3 w-3" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md 
                          hover:scale-105 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfiguratingNode(node);
                  setNodeConfigData({
                    label: node.data.label,
                    description: node.data.description || '',
                    properties: node.data.properties || {}
                  });
                  setShowNodeConfig(true);
                }}
                title="Configurar elemento"
              >
                <Settings className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md 
                          hover:scale-105 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                title="Remover elemento"
              >
                <Trash2 className="h-3 w-3" />
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
            markerWidth="16"
            markerHeight="12"
            refX="14"
            refY="6"
            orient="auto"
            fill="#3b82f6"
          >
            <path d="M0,0 L0,12 L16,6 z" />
          </marker>
          <marker
            id="arrowhead-temp"
            markerWidth="16"
            markerHeight="12"
            refX="14"
            refY="6"
            orient="auto"
            fill="#f59e0b"
          >
            <path d="M0,0 L0,12 L16,6 z" />
          </marker>
          <marker
            id="arrowhead-dark"
            markerWidth="16"
            markerHeight="12"
            refX="14"
            refY="6"
            orient="auto"
            fill="#60a5fa"
          >
            <path d="M0,0 L0,12 L16,6 z" />
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
          const strokeWidth = isTemp ? 4 : (connection.style?.strokeWidth || 3);
          const strokeDasharray = isTemp ? '8,4' : connection.style?.strokeDasharray;
          const markerId = isTemp ? 'arrowhead-temp' : 'arrowhead';

          return (
            <g key={connection.id}>
              {/* Background stroke for better visibility */}
              <line
                x1={sourcePoint.x} y1={sourcePoint.y}
                x2={targetPoint.x} y2={targetPoint.y}
                stroke="rgba(255,255,255,0.8)" strokeWidth={strokeWidth + 2}
                strokeLinecap="round"
                className="dark:stroke-gray-800"
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
                className={`${connection.style?.animated ? 'animate-pulse' : ''} drop-shadow-sm`}
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
      description: 'Processo criado com Designer de Processos',
      category: 'custom' as const,
      framework: 'CUSTOM',
      formFields,
      formRows: [],
      workflowNodes,
      workflowConnections,
      analytics: processConfigData.analytics,
      integrations: {
        ...processConfigData.integrations,
        automation_config: processConfigData.automation,
        security_config: processConfigData.security,
        workflow_settings: processConfigData.workflow_settings
      }
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

  // Save node configuration handler
  const saveNodeConfiguration = useCallback(() => {
    if (!configuratingNode) return;

    const updatedNode: WorkflowNode = {
      ...configuratingNode,
      data: {
        ...configuratingNode.data,
        label: nodeConfigData.label,
        description: nodeConfigData.description,
        properties: nodeConfigData.properties
      }
    };

    setWorkflowNodes(prev => prev.map(node => 
      node.id === configuratingNode.id ? updatedNode : node
    ));

    if (selectedWorkflowNode?.id === configuratingNode.id) {
      setSelectedWorkflowNode(updatedNode);
    }

    setShowNodeConfig(false);
    setConfiguratingNode(null);
    setHasUnsavedChanges(true);
    toast.success('Configuração do elemento salva');
  }, [configuratingNode, nodeConfigData, selectedWorkflowNode?.id]);

  // Process and workflow configuration state
  const [showProcessConfig, setShowProcessConfig] = useState(false);
  const [processConfigData, setProcessConfigData] = useState({
    analytics: { enabled: false, kpis: [], reports: [] },
    automation: { 
      notifications_enabled: true, 
      auto_assignment: false, 
      webhook_triggers: [], 
      ai_assistance: false 
    },
    security: { 
      encryption_required: false, 
      access_level: 'internal', 
      audit_trail: true,
      data_retention_days: 2555,
      pii_handling: 'encrypt' 
    },
    integrations: {},
    workflow_settings: {
      parallel_execution: false,
      timeout_minutes: 60,
      retry_attempts: 3,
      escalation_enabled: false
    }
  });

  // Node configuration modal
  const NodeConfigurationModal = useCallback(() => {
    if (!showNodeConfig || !configuratingNode) return null;

    const nodeTypeConfig = {
      start: { label: 'Início', description: 'Define o início do processo', icon: Play },
      end: { label: 'Fim', description: 'Define o fim do processo', icon: Square },
      task: { label: 'Tarefa', description: 'Representa uma atividade ou tarefa', icon: CheckCircle },
      decision: { label: 'Decisão', description: 'Ponto de decisão com múltiplas saídas', icon: GitBranch },
      parallel: { label: 'Paralelo', description: 'Execução paralela de tarefas', icon: GitMerge },
      timer: { label: 'Timer', description: 'Aguarda por um tempo específico', icon: Timer },
      notification: { label: 'Notificação', description: 'Envia notificações ou alertas', icon: Bell },
      process: { label: 'Processo', description: 'Subprocesso ou processo integrado', icon: Settings },
      database: { label: 'Database', description: 'Operações de banco de dados', icon: Database },
      integration: { label: 'Integração', description: 'Integração com sistemas externos', icon: Link2 }
    };

    const config = nodeTypeConfig[configuratingNode.type];

    return (
      <Dialog open={showNodeConfig} onOpenChange={setShowNodeConfig}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <config.icon className="h-5 w-5 text-blue-600" />
              Configuração do Elemento: {config.label}
            </DialogTitle>
            <DialogDescription>
              {config.description}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="properties">Propriedades</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nodeLabel">Nome do Elemento</Label>
                    <Input
                      id="nodeLabel"
                      value={nodeConfigData.label}
                      onChange={(e) => setNodeConfigData(prev => ({
                        ...prev,
                        label: e.target.value
                      }))}
                      placeholder="Digite o nome do elemento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nodeType">Tipo</Label>
                    <Input
                      id="nodeType"
                      value={config.label}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nodeDescription">Descrição</Label>
                  <Textarea
                    id="nodeDescription"
                    value={nodeConfigData.description}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="Digite a descrição do elemento"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>


            <TabsContent value="properties" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Propriedades Específicas
                </h3>

                {/* Type-specific Properties */}
                {configuratingNode.type === 'task' && (
                  <div className="space-y-4">
                <h3 className="text-lg font-semibold">Propriedades da Tarefa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskPriority">Prioridade</Label>
                    <Select
                      value={nodeConfigData.properties.priority || 'medium'}
                      onValueChange={(value) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, priority: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taskDuration">Duração Estimada</Label>
                    <Input
                      id="taskDuration"
                      value={nodeConfigData.properties.duration || ''}
                      onChange={(e) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, duration: e.target.value }
                      }))}
                      placeholder="Ex: 2 horas, 1 dia"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskAssignee">Responsável</Label>
                  <Input
                    id="taskAssignee"
                    value={nodeConfigData.properties.assignee || ''}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      properties: { ...prev.properties, assignee: e.target.value }
                    }))}
                    placeholder="Nome ou cargo do responsável"
                  />
                </div>
                  </div>
                )}

                {configuratingNode.type === 'decision' && (
                  <div className="space-y-4">
                <h3 className="text-lg font-semibold">Propriedades da Decisão</h3>
                <div className="space-y-2">
                  <Label htmlFor="decisionCondition">Condição de Decisão</Label>
                  <Textarea
                    id="decisionCondition"
                    value={nodeConfigData.properties.condition || ''}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      properties: { ...prev.properties, condition: e.target.value }
                    }))}
                    placeholder="Ex: Se valor > 1000, então..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decisionRules">Regras de Negócio</Label>
                  <Textarea
                    id="decisionRules"
                    value={nodeConfigData.properties.rules || ''}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      properties: { ...prev.properties, rules: e.target.value }
                    }))}
                    placeholder="Descreva as regras de negócio"
                    rows={3}
                  />
                </div>
                  </div>
                )}

                {configuratingNode.type === 'timer' && (
                  <div className="space-y-4">
                <h3 className="text-lg font-semibold">Propriedades do Timer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timerDuration">Duração</Label>
                    <Input
                      id="timerDuration"
                      value={nodeConfigData.properties.timerDuration || ''}
                      onChange={(e) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, timerDuration: e.target.value }
                      }))}
                      placeholder="Ex: 30 minutos, 2 horas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timerType">Tipo de Timer</Label>
                    <Select
                      value={nodeConfigData.properties.timerType || 'fixed'}
                      onValueChange={(value) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, timerType: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixo</SelectItem>
                        <SelectItem value="recurring">Recorrente</SelectItem>
                        <SelectItem value="conditional">Condicional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                  </div>
                )}

                {configuratingNode.type === 'notification' && (
                  <div className="space-y-4">
                <h3 className="text-lg font-semibold">Propriedades da Notificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notificationType">Tipo de Notificação</Label>
                    <Select
                      value={nodeConfigData.properties.notificationType || 'email'}
                      onValueChange={(value) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, notificationType: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notificationRecipients">Destinatários</Label>
                    <Input
                      id="notificationRecipients"
                      value={nodeConfigData.properties.recipients || ''}
                      onChange={(e) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, recipients: e.target.value }
                      }))}
                      placeholder="Ex: admin@empresa.com, gerente@empresa.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationMessage">Mensagem</Label>
                  <Textarea
                    id="notificationMessage"
                    value={nodeConfigData.properties.message || ''}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      properties: { ...prev.properties, message: e.target.value }
                    }))}
                    placeholder="Digite a mensagem da notificação"
                    rows={3}
                  />
                </div>
                  </div>
                )}

                {configuratingNode.type === 'database' && (
                  <div className="space-y-4">
                <h3 className="text-lg font-semibold">Propriedades do Database</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbOperation">Operação</Label>
                    <Select
                      value={nodeConfigData.properties.operation || 'select'}
                      onValueChange={(value) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, operation: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Consultar</SelectItem>
                        <SelectItem value="insert">Inserir</SelectItem>
                        <SelectItem value="update">Atualizar</SelectItem>
                        <SelectItem value="delete">Excluir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dbTable">Tabela</Label>
                    <Input
                      id="dbTable"
                      value={nodeConfigData.properties.table || ''}
                      onChange={(e) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, table: e.target.value }
                      }))}
                      placeholder="Nome da tabela"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbQuery">Query/Comando</Label>
                  <Textarea
                    id="dbQuery"
                    value={nodeConfigData.properties.query || ''}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      properties: { ...prev.properties, query: e.target.value }
                    }))}
                    placeholder="SQL ou comando do banco de dados"
                    rows={4}
                  />
                </div>
                  </div>
                )}

                {configuratingNode.type === 'integration' && (
                  <div className="space-y-4">
                <h3 className="text-lg font-semibold">Propriedades da Integração</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="integrationEndpoint">Endpoint/URL</Label>
                    <Input
                      id="integrationEndpoint"
                      value={nodeConfigData.properties.endpoint || ''}
                      onChange={(e) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, endpoint: e.target.value }
                      }))}
                      placeholder="https://api.sistema.com/endpoint"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="integrationMethod">Método HTTP</Label>
                    <Select
                      value={nodeConfigData.properties.method || 'GET'}
                      onValueChange={(value) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, method: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="integrationHeaders">Headers (JSON)</Label>
                  <Textarea
                    id="integrationHeaders"
                    value={nodeConfigData.properties.headers || ''}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      properties: { ...prev.properties, headers: e.target.value }
                    }))}
                    placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                    rows={3}
                  />
                </div>
                  </div>
                )}

                {/* Propriedades para elementos Start e End */}
                {(configuratingNode.type === 'start' || configuratingNode.type === 'end') && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Propriedades do {configuratingNode.type === 'start' ? 'Início' : 'Fim'}</h3>
                    <div className="space-y-2">
                      <Label htmlFor="triggerCondition">Condição de Trigger</Label>
                      <Textarea
                        id="triggerCondition"
                        value={nodeConfigData.properties.triggerCondition || ''}
                        onChange={(e) => setNodeConfigData(prev => ({
                          ...prev,
                          properties: { ...prev.properties, triggerCondition: e.target.value }
                        }))}
                        placeholder="Ex: Quando formulário for submetido, Ao receber documento..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="autoTrigger">Trigger Automático</Label>
                        <Switch
                          checked={nodeConfigData.properties.autoTrigger || false}
                          onCheckedChange={(checked) => setNodeConfigData(prev => ({
                            ...prev,
                            properties: { ...prev.properties, autoTrigger: checked }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="requiresApproval">Requer Aprovação</Label>
                        <Switch
                          checked={nodeConfigData.properties.requiresApproval || false}
                          onCheckedChange={(checked) => setNodeConfigData(prev => ({
                            ...prev,
                            properties: { ...prev.properties, requiresApproval: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Propriedades para Parallel */}
                {configuratingNode.type === 'parallel' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Propriedades do Processo Paralelo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxConcurrency">Máximo de Processos Simultâneos</Label>
                        <Input
                          id="maxConcurrency"
                          type="number"
                          value={nodeConfigData.properties.maxConcurrency || 3}
                          onChange={(e) => setNodeConfigData(prev => ({
                            ...prev,
                            properties: { ...prev.properties, maxConcurrency: parseInt(e.target.value) }
                          }))}
                          min={1}
                          max={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="waitForAll">Aguardar Todas as Tarefas</Label>
                        <Switch
                          checked={nodeConfigData.properties.waitForAll || true}
                          onCheckedChange={(checked) => setNodeConfigData(prev => ({
                            ...prev,
                            properties: { ...prev.properties, waitForAll: checked }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parallelTasks">Tarefas Paralelas (uma por linha)</Label>
                      <Textarea
                        id="parallelTasks"
                        value={nodeConfigData.properties.parallelTasks?.join('\n') || ''}
                        onChange={(e) => setNodeConfigData(prev => ({
                          ...prev,
                          properties: { 
                            ...prev.properties, 
                            parallelTasks: e.target.value.split('\n').filter(task => task.trim())
                          }
                        }))}
                        placeholder="Tarefa A&#10;Tarefa B&#10;Tarefa C"
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                {/* Propriedades para Process */}
                {configuratingNode.type === 'process' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Propriedades do Subprocesso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subprocessType">Tipo de Subprocesso</Label>
                        <Select
                          value={nodeConfigData.properties.subprocessType || 'embedded'}
                          onValueChange={(value) => setNodeConfigData(prev => ({
                            ...prev,
                            properties: { ...prev.properties, subprocessType: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="embedded">Embutido</SelectItem>
                            <SelectItem value="call_activity">Atividade de Chamada</SelectItem>
                            <SelectItem value="event_subprocess">Subprocesso de Evento</SelectItem>
                            <SelectItem value="transaction">Transação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="processId">ID do Processo</Label>
                        <Input
                          id="processId"
                          value={nodeConfigData.properties.processId || ''}
                          onChange={(e) => setNodeConfigData(prev => ({
                            ...prev,
                            properties: { ...prev.properties, processId: e.target.value }
                          }))}
                          placeholder="process_001"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inputParameters">Parâmetros de Entrada (JSON)</Label>
                      <Textarea
                        id="inputParameters"
                        value={nodeConfigData.properties.inputParameters || ''}
                        onChange={(e) => setNodeConfigData(prev => ({
                          ...prev,
                          properties: { ...prev.properties, inputParameters: e.target.value }
                        }))}
                        placeholder='{"param1": "value1", "param2": "value2"}'
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Fallback para tipos sem propriedades específicas */}
                {!['task', 'decision', 'timer', 'notification', 'database', 'integration', 'start', 'end', 'parallel', 'process'].includes(configuratingNode.type) && (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Propriedades Genéricas
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Este tipo de elemento não possui propriedades específicas configuráveis
                      </p>
                      <div className="space-y-2">
                        <Label>Configurações Personalizadas</Label>
                        <Textarea
                          placeholder='{"custom_property": "value", "other_config": true}'
                          value={JSON.stringify(nodeConfigData.properties || {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setNodeConfigData(prev => ({
                                ...prev,
                                properties: parsed
                              }));
                            } catch (err) {
                              // Invalid JSON, ignore for now
                            }
                          }}
                          rows={4}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Biblioteca de Templates
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione um template pré-configurado e customize de acordo com suas necessidades.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Template: Processo de Auditoria */}
                  <div className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer group"
                       onClick={() => {
                         const auditTemplate = {
                           name: 'Processo de Auditoria Interna',
                           description: 'Template completo para auditoria interna com todas as etapas',
                           formFields: [
                             {
                               id: 'audit_title',
                               type: 'text' as const,
                               label: 'Título da Auditoria',
                               required: true,
                               placeholder: 'Ex: Auditoria de Controles de TI'
                             },
                             {
                               id: 'audit_scope',
                               type: 'textarea' as const,
                               label: 'Escopo da Auditoria',
                               required: true,
                               placeholder: 'Descreva o escopo detalhado...'
                             },
                             {
                               id: 'auditor',
                               type: 'select' as const,
                               label: 'Auditor Responsável',
                               required: true,
                               options: ['Auditor Sênior', 'Auditor Pleno', 'Auditor Júnior']
                             },
                             {
                               id: 'deadline',
                               type: 'date' as const,
                               label: 'Data Limite',
                               required: true
                             }
                           ],
                           workflowNodes: [
                             {
                               id: 'start-audit',
                               type: 'start' as const,
                               position: { x: 100, y: 100 },
                               size: { width: 80, height: 80 },
                               data: {
                                 label: 'Início da Auditoria',
                                 description: 'Ponto de partida do processo de auditoria',
                                 properties: {
                                   trigger_type: 'manual',
                                   notification_enabled: true
                                 }
                               }
                             },
                             {
                               id: 'planning-task',
                               type: 'task' as const,
                               position: { x: 250, y: 100 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Planejamento',
                                 description: 'Elaboração do plano de auditoria',
                                 properties: {
                                   priority: 'high',
                                   duration: '3 dias',
                                   assignee: 'Auditor Responsável',
                                   checklist: ['Definir objetivos', 'Identificar riscos', 'Preparar cronograma'],
                                   resources: ['Documentos anteriores', 'Normas aplicáveis']
                                 }
                               }
                             },
                             {
                               id: 'approval-decision',
                               type: 'decision' as const,
                               position: { x: 420, y: 100 },
                               size: { width: 100, height: 100 },
                               data: {
                                 label: 'Aprovação do Plano',
                                 description: 'Decisão sobre aprovação do plano de auditoria',
                                 properties: {
                                   conditions: ['Plano completo', 'Recursos disponíveis', 'Cronograma viável'],
                                   criteria: 'Aprovação da gerência',
                                   timeout: '2 dias',
                                   fallback_action: 'Retornar para planejamento'
                                 }
                               }
                             },
                             {
                               id: 'execution-task',
                               type: 'task' as const,
                               position: { x: 580, y: 100 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Execução',
                                 description: 'Execução dos testes e procedimentos de auditoria',
                                 properties: {
                                   priority: 'medium',
                                   duration: '5 dias',
                                   assignee: 'Equipe de Auditoria',
                                   checklist: ['Coletar evidências', 'Executar testes', 'Documentar achados'],
                                   resources: ['Sistemas auditados', 'Documentação', 'Ferramentas de teste']
                                 }
                               }
                             },
                             {
                               id: 'reporting-task',
                               type: 'task' as const,
                               position: { x: 750, y: 100 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Relatório',
                                 description: 'Elaboração do relatório de auditoria',
                                 properties: {
                                   priority: 'high',
                                   duration: '2 dias',
                                   assignee: 'Auditor Responsável',
                                   checklist: ['Consolidar achados', 'Redigir recomendações', 'Revisar relatório'],
                                   resources: ['Template de relatório', 'Evidências coletadas']
                                 }
                               }
                             },
                             {
                               id: 'end-audit',
                               type: 'end' as const,
                               position: { x: 920, y: 100 },
                               size: { width: 80, height: 80 },
                               data: {
                                 label: 'Fim da Auditoria',
                                 description: 'Conclusão do processo de auditoria',
                                 properties: {
                                   completion_actions: ['Arquivar documentos', 'Notificar stakeholders'],
                                   notification_enabled: true
                                 }
                               }
                             }
                           ],
                           workflowConnections: [
                             { id: 'c1', source: 'start-audit', target: 'planning-task', type: 'default' as const, label: 'Iniciar' },
                             { id: 'c2', source: 'planning-task', target: 'approval-decision', type: 'default' as const, label: 'Plano Pronto' },
                             { id: 'c3', source: 'approval-decision', target: 'execution-task', type: 'default' as const, label: 'Aprovado' },
                             { id: 'c4', source: 'approval-decision', target: 'planning-task', type: 'default' as const, label: 'Rejeitado' },
                             { id: 'c5', source: 'execution-task', target: 'reporting-task', type: 'default' as const, label: 'Execução Concluída' },
                             { id: 'c6', source: 'reporting-task', target: 'end-audit', type: 'default' as const, label: 'Relatório Finalizado' }
                           ]
                         };
                         
                         // Aplicar template
                         setProcessName(auditTemplate.name);
                         setFormFields(auditTemplate.formFields);
                         setWorkflowNodes(auditTemplate.workflowNodes);
                         setWorkflowConnections(auditTemplate.workflowConnections);
                         setHasUnsavedChanges(true);
                         toast.success('Template "Processo de Auditoria" aplicado com sucesso!');
                       }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm group-hover:text-blue-600">
                          Processo de Auditoria Interna
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Template completo com planejamento, execução e relatório. Inclui 4 campos de formulário e 6 elementos de workflow.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">Auditoria</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">Controles</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template: Gestão de Riscos */}
                  <div className="border rounded-lg p-4 hover:border-green-300 cursor-pointer group"
                       onClick={() => {
                         const riskTemplate = {
                           name: 'Processo de Gestão de Riscos',
                           description: 'Template para identificação, avaliação e tratamento de riscos',
                           formFields: [
                             {
                               id: 'risk_title',
                               type: 'text' as const,
                               label: 'Nome do Risco',
                               required: true,
                               placeholder: 'Ex: Risco de Segurança da Informação'
                             },
                             {
                               id: 'risk_category',
                               type: 'select' as const,
                               label: 'Categoria',
                               required: true,
                               options: ['Operacional', 'Financeiro', 'Estratégico', 'Compliance', 'Tecnológico']
                             },
                             {
                               id: 'risk_impact',
                               type: 'number' as const,
                               label: 'Impacto (1-5)',
                               required: true,
                               placeholder: '1'
                             },
                             {
                               id: 'risk_likelihood',
                               type: 'number' as const,
                               label: 'Probabilidade (1-5)',
                               required: true,
                               placeholder: '1'
                             }
                           ],
                           workflowNodes: [
                             {
                               id: 'start-risk',
                               type: 'start' as const,
                               position: { x: 100, y: 150 },
                               size: { width: 80, height: 80 },
                               data: {
                                 label: 'Identificação',
                                 description: 'Início do processo de gestão de riscos',
                                 properties: { trigger_type: 'event', notification_enabled: true }
                               }
                             },
                             {
                               id: 'assessment-task',
                               type: 'task' as const,
                               position: { x: 250, y: 150 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Avaliação',
                                 description: 'Análise e avaliação do risco identificado',
                                 properties: {
                                   priority: 'high',
                                   duration: '2 dias',
                                   assignee: 'Analista de Riscos',
                                   checklist: ['Avaliar impacto', 'Calcular probabilidade', 'Classificar risco'],
                                   resources: ['Matriz de riscos', 'Histórico de ocorrências']
                                 }
                               }
                             },
                             {
                               id: 'risk-level-decision',
                               type: 'decision' as const,
                               position: { x: 420, y: 150 },
                               size: { width: 100, height: 100 },
                               data: {
                                 label: 'Nível de Risco',
                                 description: 'Classificação do nível de risco',
                                 properties: {
                                   conditions: ['Impacto x Probabilidade >= 15', 'Risco crítico'],
                                   criteria: 'Alto risco requer aprovação',
                                   timeout: '1 dia',
                                   fallback_action: 'Escalação automática'
                                 }
                               }
                             },
                             {
                               id: 'treatment-task',
                               type: 'task' as const,
                               position: { x: 580, y: 150 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Tratamento',
                                 description: 'Implementação de ações de tratamento',
                                 properties: {
                                   priority: 'medium',
                                   duration: '7 dias',
                                   assignee: 'Responsável pelo Processo',
                                   checklist: ['Definir ações', 'Implementar controles', 'Monitorar eficácia'],
                                   resources: ['Plano de ação', 'Orçamento aprovado']
                                 }
                               }
                             },
                             {
                               id: 'monitoring-timer',
                               type: 'timer' as const,
                               position: { x: 750, y: 150 },
                               size: { width: 100, height: 80 },
                               data: {
                                 label: 'Monitoramento',
                                 description: 'Acompanhamento periódico do risco',
                                 properties: {
                                   duration: '30 dias',
                                   timer_type: 'recurring',
                                   recurrence: 'monthly',
                                   actions: ['Revisar controles', 'Atualizar avaliação']
                                 }
                               }
                             }
                           ],
                           workflowConnections: [
                             { id: 'r1', source: 'start-risk', target: 'assessment-task', type: 'default' as const, label: 'Identificado' },
                             { id: 'r2', source: 'assessment-task', target: 'risk-level-decision', type: 'default' as const, label: 'Avaliado' },
                             { id: 'r3', source: 'risk-level-decision', target: 'treatment-task', type: 'default' as const, label: 'Alto Risco' },
                             { id: 'r4', source: 'risk-level-decision', target: 'monitoring-timer', type: 'default' as const, label: 'Baixo Risco' },
                             { id: 'r5', source: 'treatment-task', target: 'monitoring-timer', type: 'default' as const, label: 'Tratado' }
                           ]
                         };
                         
                         setProcessName(riskTemplate.name);
                         setFormFields(riskTemplate.formFields);
                         setWorkflowNodes(riskTemplate.workflowNodes);
                         setWorkflowConnections(riskTemplate.workflowConnections);
                         setHasUnsavedChanges(true);
                         toast.success('Template "Gestão de Riscos" aplicado com sucesso!');
                       }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm group-hover:text-green-600">
                          Processo de Gestão de Riscos
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Workflow para identificar, avaliar e tratar riscos. Inclui 4 campos e 5 elementos com timer de monitoramento.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">Riscos</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">Monitoramento</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template: Aprovação de Documentos */}
                  <div className="border rounded-lg p-4 hover:border-purple-300 cursor-pointer group"
                       onClick={() => {
                         const approvalTemplate = {
                           name: 'Processo de Aprovação de Documentos',
                           description: 'Template para fluxo de aprovação com múltiplos níveis',
                           formFields: [
                             {
                               id: 'document_title',
                               type: 'text' as const,
                               label: 'Título do Documento',
                               required: true,
                               placeholder: 'Ex: Política de Segurança da Informação'
                             },
                             {
                               id: 'document_type',
                               type: 'select' as const,
                               label: 'Tipo de Documento',
                               required: true,
                               options: ['Política', 'Procedimento', 'Norma', 'Manual', 'Instrução']
                             },
                             {
                               id: 'author',
                               type: 'text' as const,
                               label: 'Autor',
                               required: true,
                               placeholder: 'Nome do autor'
                             },
                             {
                               id: 'priority',
                               type: 'select' as const,
                               label: 'Prioridade',
                               required: true,
                               options: ['Baixa', 'Normal', 'Alta', 'Crítica']
                             }
                           ],
                           workflowNodes: [
                             {
                               id: 'start-approval',
                               type: 'start' as const,
                               position: { x: 100, y: 200 },
                               size: { width: 80, height: 80 },
                               data: {
                                 label: 'Submissão',
                                 description: 'Documento submetido para aprovação',
                                 properties: { trigger_type: 'manual', notification_enabled: true }
                               }
                             },
                             {
                               id: 'review-task',
                               type: 'task' as const,
                               position: { x: 250, y: 200 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Revisão Técnica',
                                 description: 'Revisão técnica do conteúdo',
                                 properties: {
                                   priority: 'medium',
                                   duration: '3 dias',
                                   assignee: 'Revisor Técnico',
                                   checklist: ['Verificar conteúdo', 'Validar referências', 'Revisar formatação'],
                                   resources: ['Padrões da empresa', 'Templates aprovados']
                                 }
                               }
                             },
                             {
                               id: 'manager-decision',
                               type: 'decision' as const,
                               position: { x: 420, y: 200 },
                               size: { width: 100, height: 100 },
                               data: {
                                 label: 'Aprovação Gerencial',
                                 description: 'Decisão do gerente responsável',
                                 properties: {
                                   conditions: ['Revisão técnica OK', 'Conteúdo adequado'],
                                   criteria: 'Aprovação do gerente',
                                   timeout: '5 dias',
                                   fallback_action: 'Escalar para direção'
                                 }
                               }
                             },
                             {
                               id: 'director-decision',
                               type: 'decision' as const,
                               position: { x: 580, y: 120 },
                               size: { width: 100, height: 100 },
                               data: {
                                 label: 'Aprovação Diretoria',
                                 description: 'Aprovação final da diretoria (documentos críticos)',
                                 properties: {
                                   conditions: ['Prioridade >= Alta', 'Impacto organizacional'],
                                   criteria: 'Aprovação da diretoria',
                                   timeout: '7 dias',
                                   fallback_action: 'Reunião de comitê'
                                 }
                               }
                             },
                             {
                               id: 'publish-task',
                               type: 'task' as const,
                               position: { x: 750, y: 200 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Publicação',
                                 description: 'Publicação e divulgação do documento',
                                 properties: {
                                   priority: 'high',
                                   duration: '1 dia',
                                   assignee: 'Administrador de Documentos',
                                   checklist: ['Publicar no portal', 'Notificar usuários', 'Arquivar versão anterior'],
                                   resources: ['Sistema de gestão documental', 'Lista de distribuição']
                                 }
                               }
                             },
                             {
                               id: 'notification',
                               type: 'notification' as const,
                               position: { x: 920, y: 200 },
                               size: { width: 100, height: 80 },
                               data: {
                                 label: 'Notificação',
                                 description: 'Notificação de documento aprovado',
                                 properties: {
                                   recipients: ['Autor', 'Gestores', 'Usuários finais'],
                                   template: 'document_approved',
                                   channel: 'email',
                                   urgency: 'normal'
                                 }
                               }
                             }
                           ],
                           workflowConnections: [
                             { id: 'a1', source: 'start-approval', target: 'review-task', type: 'default' as const, label: 'Submetido' },
                             { id: 'a2', source: 'review-task', target: 'manager-decision', type: 'default' as const, label: 'Revisado' },
                             { id: 'a3', source: 'manager-decision', target: 'director-decision', type: 'default' as const, label: 'Crítico' },
                             { id: 'a4', source: 'manager-decision', target: 'publish-task', type: 'default' as const, label: 'Aprovado Normal' },
                             { id: 'a5', source: 'director-decision', target: 'publish-task', type: 'default' as const, label: 'Aprovado Crítico' },
                             { id: 'a6', source: 'publish-task', target: 'notification', type: 'default' as const, label: 'Publicado' },
                             { id: 'a7', source: 'manager-decision', target: 'review-task', type: 'default' as const, label: 'Rejeitado' },
                             { id: 'a8', source: 'director-decision', target: 'review-task', type: 'default' as const, label: 'Rejeitado' }
                           ]
                         };
                         
                         setProcessName(approvalTemplate.name);
                         setFormFields(approvalTemplate.formFields);
                         setWorkflowNodes(approvalTemplate.workflowNodes);
                         setWorkflowConnections(approvalTemplate.workflowConnections);
                         setHasUnsavedChanges(true);
                         toast.success('Template "Aprovação de Documentos" aplicado com sucesso!');
                       }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm group-hover:text-purple-600">
                          Processo de Aprovação de Documentos
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Fluxo completo com múltiplos níveis de aprovação. Inclui 4 campos e 6 elementos com notificações automáticas.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">Documentos</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">Aprovação</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template: Onboarding de Funcionários */}
                  <div className="border rounded-lg p-4 hover:border-orange-300 cursor-pointer group"
                       onClick={() => {
                         const onboardingTemplate = {
                           name: 'Processo de Onboarding de Funcionários',
                           description: 'Template para integração de novos funcionários',
                           formFields: [
                             {
                               id: 'employee_name',
                               type: 'text' as const,
                               label: 'Nome do Funcionário',
                               required: true,
                               placeholder: 'Nome completo'
                             },
                             {
                               id: 'department',
                               type: 'select' as const,
                               label: 'Departamento',
                               required: true,
                               options: ['TI', 'RH', 'Financeiro', 'Comercial', 'Operações', 'Auditoria']
                             },
                             {
                               id: 'position',
                               type: 'text' as const,
                               label: 'Cargo',
                               required: true,
                               placeholder: 'Ex: Analista de Sistemas'
                             },
                             {
                               id: 'start_date',
                               type: 'date' as const,
                               label: 'Data de Início',
                               required: true
                             },
                             {
                               id: 'manager',
                               type: 'text' as const,
                               label: 'Gestor Direto',
                               required: true,
                               placeholder: 'Nome do gestor'
                             }
                           ],
                           workflowNodes: [
                             {
                               id: 'start-onboarding',
                               type: 'start' as const,
                               position: { x: 100, y: 250 },
                               size: { width: 80, height: 80 },
                               data: {
                                 label: 'Admissão',
                                 description: 'Início do processo de onboarding',
                                 properties: { trigger_type: 'manual', notification_enabled: true }
                               }
                             },
                             {
                               id: 'hr-setup',
                               type: 'parallel' as const,
                               position: { x: 250, y: 250 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Preparação RH',
                                 description: 'Atividades paralelas do RH',
                                 properties: {
                                   parallel_tasks: [
                                     'Preparar documentos',
                                     'Configurar sistemas',
                                     'Solicitar equipamentos'
                                   ],
                                   sync_required: true
                                 }
                               }
                             },
                             {
                               id: 'it-setup',
                               type: 'task' as const,
                               position: { x: 420, y: 180 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Configuração TI',
                                 description: 'Setup de sistemas e acessos',
                                 properties: {
                                   priority: 'high',
                                   duration: '2 dias',
                                   assignee: 'Equipe de TI',
                                   checklist: ['Criar usuário AD', 'Configurar email', 'Instalar software', 'Definir permissões'],
                                   resources: ['Lista de sistemas', 'Perfil de acesso por cargo']
                                 }
                               }
                             },
                             {
                               id: 'welcome-task',
                               type: 'task' as const,
                               position: { x: 420, y: 320 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Boas-vindas',
                                 description: 'Recepção e apresentação da empresa',
                                 properties: {
                                   priority: 'medium',
                                   duration: '1 dia',
                                   assignee: 'Gestor Direto',
                                   checklist: ['Tour pela empresa', 'Apresentar equipe', 'Explicar cultura', 'Entregar kit'],
                                   resources: ['Kit de boas-vindas', 'Apresentação da empresa']
                                 }
                               }
                             },
                             {
                               id: 'training-integration',
                               type: 'integration' as const,
                               position: { x: 580, y: 250 },
                               size: { width: 120, height: 80 },
                               data: {
                                 label: 'Sistema de Treinamento',
                                 description: 'Integração com plataforma de treinamento',
                                 properties: {
                                   endpoint: '/api/training/enroll',
                                   method: 'POST',
                                   authentication: 'bearer_token',
                                   headers: { 'Content-Type': 'application/json' },
                                   timeout: 30000
                                 }
                               }
                             },
                             {
                               id: 'followup-timer',
                               type: 'timer' as const,
                               position: { x: 750, y: 250 },
                               size: { width: 100, height: 80 },
                               data: {
                                 label: 'Follow-up',
                                 description: 'Acompanhamento periódico',
                                 properties: {
                                   duration: '7 dias',
                                   timer_type: 'recurring',
                                   recurrence: 'weekly',
                                   actions: ['Verificar adaptação', 'Coletar feedback', 'Ajustar processo']
                                 }
                               }
                             }
                           ],
                           workflowConnections: [
                             { id: 'o1', source: 'start-onboarding', target: 'hr-setup', type: 'default' as const, label: 'Admitido' },
                             { id: 'o2', source: 'hr-setup', target: 'it-setup', type: 'default' as const, label: 'Preparação TI' },
                             { id: 'o3', source: 'hr-setup', target: 'welcome-task', type: 'default' as const, label: 'Boas-vindas' },
                             { id: 'o4', source: 'it-setup', target: 'training-integration', type: 'default' as const, label: 'Setup Completo' },
                             { id: 'o5', source: 'welcome-task', target: 'training-integration', type: 'default' as const, label: 'Integrado' },
                             { id: 'o6', source: 'training-integration', target: 'followup-timer', type: 'default' as const, label: 'Treinamento Iniciado' }
                           ]
                         };
                         
                         setProcessName(onboardingTemplate.name);
                         setFormFields(onboardingTemplate.formFields);
                         setWorkflowNodes(onboardingTemplate.workflowNodes);
                         setWorkflowConnections(onboardingTemplate.workflowConnections);
                         setHasUnsavedChanges(true);
                         toast.success('Template "Onboarding de Funcionários" aplicado com sucesso!');
                       }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm group-hover:text-orange-600">
                          Processo de Onboarding de Funcionários
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Processo completo de integração com atividades paralelas. Inclui 5 campos e 6 elementos com integrações automáticas.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded">RH</span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">Integração</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">
                    💡 Como usar os templates
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Clique em qualquer template para aplicá-lo instantaneamente</li>
                    <li>• Todos os campos do formulário e elementos do workflow serão preenchidos</li>
                    <li>• Você pode editar e customizar qualquer parte após aplicar o template</li>
                    <li>• Use as abas "Propriedades" e "Avançado" para personalizar cada elemento</li>
                    <li>• Salve o processo após as customizações para persistir no banco de dados</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Configurações Avançadas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID do Elemento</Label>
                    <Input
                      value={configuratingNode.id}
                      disabled
                      className="bg-muted font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posição (X, Y)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={configuratingNode.position.x}
                        disabled
                        className="bg-muted"
                      />
                      <Input
                        type="number"
                        value={configuratingNode.position.y}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Largura x Altura</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={configuratingNode.size.width}
                        disabled
                        className="bg-muted"
                      />
                      <Input
                        type="number"
                        value={configuratingNode.size.height}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={nodeConfigData.properties.status || 'active'}
                      onValueChange={(value) => setNodeConfigData(prev => ({
                        ...prev,
                        properties: { ...prev.properties, status: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="disabled">Desabilitado</SelectItem>
                        <SelectItem value="deprecated">Descontinuado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Metadados Personalizados</Label>
                  <Textarea
                    placeholder='{"custom_field": "value", "metadata": {}}'
                    value={JSON.stringify(nodeConfigData.properties.metadata || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setNodeConfigData(prev => ({
                          ...prev,
                          properties: { ...prev.properties, metadata: parsed }
                        }));
                      } catch (err) {
                        // Invalid JSON, ignore for now
                      }
                    }}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Documentação/Notas</Label>
                  <Textarea
                    placeholder="Adicione documentação, notas técnicas ou instruções específicas para este elemento..."
                    value={nodeConfigData.properties.documentation || ''}
                    onChange={(e) => setNodeConfigData(prev => ({
                      ...prev,
                      properties: { ...prev.properties, documentation: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNodeConfig(false)}>
              Cancelar
            </Button>
            <Button onClick={saveNodeConfiguration}>
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [showNodeConfig, configuratingNode, nodeConfigData, saveNodeConfiguration]);

  // Process Configuration Modal
  const ProcessConfigurationModal = useCallback(() => {
    if (!showProcessConfig) return null;

    return (
      <Dialog open={showProcessConfig} onOpenChange={setShowProcessConfig}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configurações Avançadas do Processo
            </DialogTitle>
            <DialogDescription>
              Configure analytics, automação, segurança, integrações e configurações de workflow
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="automation">Automação</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.analytics.enabled}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      analytics: { ...prev.analytics, enabled: checked }
                    }))}
                  />
                  <Label>Habilitar Analytics</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>KPIs de Acompanhamento</Label>
                  <Textarea
                    placeholder="Ex: Tempo médio de processamento, Taxa de aprovação, Número de rejeições..."
                    value={processConfigData.analytics.kpis.join('\n')}
                    onChange={(e) => setProcessConfigData(prev => ({
                      ...prev,
                      analytics: { 
                        ...prev.analytics, 
                        kpis: e.target.value.split('\n').filter(kpi => kpi.trim())
                      }
                    }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Relatórios Automáticos</Label>
                  <Textarea
                    placeholder="Ex: Relatório Diário, Relatório Semanal, Dashboard Executivo..."
                    value={processConfigData.analytics.reports.join('\n')}
                    onChange={(e) => setProcessConfigData(prev => ({
                      ...prev,
                      analytics: { 
                        ...prev.analytics, 
                        reports: e.target.value.split('\n').filter(report => report.trim())
                      }
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.automation.notifications_enabled}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      automation: { ...prev.automation, notifications_enabled: checked }
                    }))}
                  />
                  <Label>Notificações Automáticas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.automation.auto_assignment}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      automation: { ...prev.automation, auto_assignment: checked }
                    }))}
                  />
                  <Label>Atribuição Automática</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.automation.ai_assistance}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      automation: { ...prev.automation, ai_assistance: checked }
                    }))}
                  />
                  <Label>Assistência de IA</Label>
                </div>

                <div className="space-y-2">
                  <Label>Webhooks (URLs)</Label>
                  <Textarea
                    placeholder="Ex: https://api.sistema.com/webhook1..."
                    value={processConfigData.automation.webhook_triggers.join('\n')}
                    onChange={(e) => setProcessConfigData(prev => ({
                      ...prev,
                      automation: { 
                        ...prev.automation, 
                        webhook_triggers: e.target.value.split('\n').filter(url => url.trim())
                      }
                    }))}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.security.encryption_required}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      security: { ...prev.security, encryption_required: checked }
                    }))}
                  />
                  <Label>Criptografia Obrigatória</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.security.audit_trail}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      security: { ...prev.security, audit_trail: checked }
                    }))}
                  />
                  <Label>Trilha de Auditoria</Label>
                </div>

                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select
                    value={processConfigData.security.access_level}
                    onValueChange={(value) => setProcessConfigData(prev => ({
                      ...prev,
                      security: { ...prev.security, access_level: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="internal">Interno</SelectItem>
                      <SelectItem value="confidential">Confidencial</SelectItem>
                      <SelectItem value="restricted">Restrito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Retenção de Dados (dias): {processConfigData.security.data_retention_days}</Label>
                  <Slider
                    value={[processConfigData.security.data_retention_days]}
                    onValueChange={(value) => setProcessConfigData(prev => ({
                      ...prev,
                      security: { ...prev.security, data_retention_days: value[0] }
                    }))}
                    min={30}
                    max={3650}
                    step={30}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tratamento de PII</Label>
                  <Select
                    value={processConfigData.security.pii_handling}
                    onValueChange={(value) => setProcessConfigData(prev => ({
                      ...prev,
                      security: { ...prev.security, pii_handling: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum PII</SelectItem>
                      <SelectItem value="mask">Mascarar</SelectItem>
                      <SelectItem value="encrypt">Criptografar</SelectItem>
                      <SelectItem value="anonymize">Anonimizar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Integrações</h3>
                  <p className="text-gray-500 mb-4">Configure integrações com sistemas externos</p>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Nome da integração"
                      className="mb-2"
                    />
                    <Input
                      placeholder="Endpoint/URL da API"
                      className="mb-2"
                    />
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de autenticação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Integração
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.workflow_settings.parallel_execution}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      workflow_settings: { ...prev.workflow_settings, parallel_execution: checked }
                    }))}
                  />
                  <Label>Execução Paralela</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={processConfigData.workflow_settings.escalation_enabled}
                    onCheckedChange={(checked) => setProcessConfigData(prev => ({
                      ...prev,
                      workflow_settings: { ...prev.workflow_settings, escalation_enabled: checked }
                    }))}
                  />
                  <Label>Escalação Automática</Label>
                </div>

                <div className="space-y-2">
                  <Label>Timeout (minutos): {processConfigData.workflow_settings.timeout_minutes}</Label>
                  <Slider
                    value={[processConfigData.workflow_settings.timeout_minutes]}
                    onValueChange={(value) => setProcessConfigData(prev => ({
                      ...prev,
                      workflow_settings: { ...prev.workflow_settings, timeout_minutes: value[0] }
                    }))}
                    min={5}
                    max={1440}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tentativas de Retry: {processConfigData.workflow_settings.retry_attempts}</Label>
                  <Slider
                    value={[processConfigData.workflow_settings.retry_attempts]}
                    onValueChange={(value) => setProcessConfigData(prev => ({
                      ...prev,
                      workflow_settings: { ...prev.workflow_settings, retry_attempts: value[0] }
                    }))}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessConfig(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setHasUnsavedChanges(true);
              setShowProcessConfig(false);
              toast.success('Configurações do processo atualizadas');
            }}>
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [showProcessConfig, processConfigData]);

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
              onClick={() => setShowProcessConfig(true)}
              className="text-white hover:bg-white/10"
              title="Configurações Avançadas do Processo"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
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

        {/* Step Navigation - Dark Mode Fixed */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-8">
            {/* Step 1 */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              currentStep === 'form-builder' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-md' 
                : formFields.length > 0 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-pointer hover:bg-green-200 dark:hover:bg-green-800' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
            }`} onClick={() => setCurrentStep('form-builder')}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep === 'form-builder' 
                  ? 'bg-blue-500 text-white' 
                  : formFields.length > 0 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
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
            <div className="text-gray-400 dark:text-gray-500">
              <ChevronRight className="w-5 h-5" />
            </div>
            
            {/* Step 2 */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${
              currentStep === 'workflow-designer' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-md' 
                : formFields.length > 0 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
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
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                {workflowNodes.length > 0 ? '✓' : '2'}
              </div>
              <div>
                <p className={`font-medium ${formFields.length === 0 ? 'text-gray-400 dark:text-gray-500' : ''}`}>
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
          {/* Initial Choice Screen - Template Library */}
          {showInitialChoice ? (
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Como você gostaria de começar?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Escolha entre usar um template profissional pré-configurado ou criar um processo completamente do zero.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Template Library */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Biblioteca de Templates
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Templates prontos e testados para começar rapidamente
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-96">
                      <div className="p-6 space-y-4">
                        {/* Template: Gestão de Riscos - Processo Guiado Completo */}
                        <div className="border rounded-lg p-4 hover:border-red-300 cursor-pointer group"
                             onClick={() => {
                               const riskManagementTemplate = {
                                 name: 'Gestão de Riscos - Processo Guiado Completo',
                                 description: 'Sistema completo de gestão de riscos com 7 etapas integradas baseado no modelo Alex Risk',
                                 formFields: [
                                   // ETAPA 1: IDENTIFICAÇÃO DO RISCO
                                   { id: 'risk_title', type: 'text' as const, label: '📋 Título do Risco', required: true, placeholder: 'Ex: Falha no sistema de backup crítico', section: 'Etapa 1: Identificação' },
                                   { id: 'risk_description', type: 'textarea' as const, label: '📝 Descrição Detalhada', required: true, placeholder: 'Descreva o evento de risco, suas causas e contexto...', section: 'Etapa 1: Identificação' },
                                   { id: 'risk_category', type: 'select' as const, label: '🏷️ Categoria do Risco', required: true, options: ['Estratégico', 'Operacional', 'Financeiro', 'Compliance', 'Reputacional', 'Tecnológico', 'Ambiental', 'Segurança', 'Legal', 'Mercado'], section: 'Etapa 1: Identificação' },
                                   { id: 'risk_source', type: 'select' as const, label: '📍 Fonte do Risco', required: true, options: ['Auditoria Interna', 'Auditoria Externa', 'Revisão de Compliance', 'Relatório de Incidente', 'Mudança Regulatória', 'Relato de Funcionário', 'Avaliação de Fornecedor'], section: 'Etapa 1: Identificação' },
                                   { id: 'business_area', type: 'select' as const, label: '🏢 Área de Negócio Afetada', required: true, options: ['Governança', 'Financeiro', 'Operações', 'Tecnologia', 'Recursos Humanos', 'Jurídico', 'Compliance', 'Vendas', 'Marketing'], section: 'Etapa 1: Identificação' },
                                   { id: 'identification_date', type: 'date' as const, label: '📅 Data de Identificação', required: true, section: 'Etapa 1: Identificação' },
                                   
                                   // ETAPA 2: ANÁLISE DO RISCO
                                   { id: 'analysis_methodology', type: 'select' as const, label: '🔬 Metodologia de Análise', required: true, options: ['Qualitativa (1-5)', 'Quantitativa (VaR)', 'Semi-Quantitativa', 'COSO ERM', 'ISO 31000'], section: 'Etapa 2: Análise' },
                                   { id: 'impact_score', type: 'select' as const, label: '💥 Pontuação de Impacto', required: true, options: ['1 - Muito Baixo', '2 - Baixo', '3 - Médio', '4 - Alto', '5 - Muito Alto'], section: 'Etapa 2: Análise' },
                                   { id: 'likelihood_score', type: 'select' as const, label: '🎯 Pontuação de Probabilidade', required: true, options: ['1 - Muito Baixa', '2 - Baixa', '3 - Média', '4 - Alta', '5 - Muito Alta'], section: 'Etapa 2: Análise' },
                                   { id: 'risk_score', type: 'number' as const, label: '📊 Score do Risco (Calculado)', required: false, placeholder: 'Calculado automaticamente', section: 'Etapa 2: Análise' },
                                   { id: 'risk_level', type: 'select' as const, label: '⚡ Nível do Risco', required: false, options: ['Baixo (1-8)', 'Médio (9-15)', 'Alto (16-20)', 'Crítico (21-25)'], section: 'Etapa 2: Análise' },
                                   
                                   // ETAPA 3: CLASSIFICAÇÃO GUT
                                   { id: 'gut_gravity', type: 'select' as const, label: '⚖️ Gravidade (GUT)', required: true, options: ['1 - Sem gravidade', '2 - Pouco grave', '3 - Grave', '4 - Muito grave', '5 - Extremamente grave'], section: 'Etapa 3: Classificação GUT' },
                                   { id: 'gut_urgency', type: 'select' as const, label: '⏰ Urgência (GUT)', required: true, options: ['1 - Pode esperar', '2 - Pouco urgente', '3 - Urgente', '4 - Muito urgente', '5 - Extremamente urgente'], section: 'Etapa 3: Classificação GUT' },
                                   { id: 'gut_tendency', type: 'select' as const, label: '📈 Tendência (GUT)', required: true, options: ['1 - Não vai piorar', '2 - Vai piorar a longo prazo', '3 - Vai piorar a médio prazo', '4 - Vai piorar a curto prazo', '5 - Vai piorar rapidamente'], section: 'Etapa 3: Classificação GUT' },
                                   { id: 'gut_score', type: 'number' as const, label: '🎯 Score GUT (Calculado)', required: false, placeholder: 'Calculado automaticamente', section: 'Etapa 3: Classificação GUT' },
                                   
                                   // ETAPA 4: ESTRATÉGIA DE TRATAMENTO
                                   { id: 'treatment_strategy', type: 'select' as const, label: '🛡️ Estratégia de Tratamento', required: true, options: ['Evitar', 'Mitigar', 'Transferir', 'Aceitar'], section: 'Etapa 4: Tratamento' },
                                   { id: 'treatment_rationale', type: 'textarea' as const, label: '💭 Justificativa da Estratégia', required: true, placeholder: 'Explique por que esta estratégia foi escolhida...', section: 'Etapa 4: Tratamento' },
                                   { id: 'treatment_cost', type: 'number' as const, label: '💰 Custo Estimado do Tratamento (R$)', required: false, placeholder: '0', section: 'Etapa 4: Tratamento' },
                                   { id: 'treatment_timeline', type: 'text' as const, label: '⏱️ Prazo para Implementação', required: false, placeholder: 'Ex: 90 dias', section: 'Etapa 4: Tratamento' },
                                   
                                   // ETAPA 5: PLANO DE AÇÃO
                                   { id: 'activity_1_name', type: 'text' as const, label: '📝 Nome da Atividade Principal', required: false, placeholder: 'Ex: Implementar backup redundante', section: 'Etapa 5: Plano de Ação' },
                                   { id: 'activity_1_description', type: 'textarea' as const, label: '📄 Descrição da Atividade', required: false, placeholder: 'Descreva detalhadamente a atividade...', section: 'Etapa 5: Plano de Ação' },
                                   { id: 'activity_1_responsible', type: 'text' as const, label: '👤 Responsável pela Atividade', required: false, placeholder: 'Nome do responsável', section: 'Etapa 5: Plano de Ação' },
                                   { id: 'activity_1_email', type: 'email' as const, label: '📧 E-mail do Responsável', required: false, placeholder: 'email@empresa.com', section: 'Etapa 5: Plano de Ação' },
                                   { id: 'activity_1_due_date', type: 'date' as const, label: '📅 Data de Vencimento', required: false, section: 'Etapa 5: Plano de Ação' },
                                   { id: 'activity_1_priority', type: 'select' as const, label: '⚡ Prioridade', required: false, options: ['Baixa', 'Média', 'Alta', 'Crítica'], section: 'Etapa 5: Plano de Ação' },
                                   
                                   // ETAPA 6: COMUNICAÇÃO E STAKEHOLDERS
                                   { id: 'approval_person_name', type: 'text' as const, label: '👨‍💼 Nome do Aprovador', required: true, placeholder: 'Nome do gestor aprovador', section: 'Etapa 6: Comunicação' },
                                   { id: 'approval_person_position', type: 'text' as const, label: '💼 Cargo do Aprovador', required: true, placeholder: 'Ex: Diretor de Riscos', section: 'Etapa 6: Comunicação' },
                                   { id: 'approval_person_email', type: 'email' as const, label: '📧 E-mail do Aprovador', required: true, placeholder: 'aprovador@empresa.com', section: 'Etapa 6: Comunicação' },
                                   { id: 'awareness_person_name', type: 'text' as const, label: '👥 Nome para Ciência', required: false, placeholder: 'Nome da pessoa para ciência', section: 'Etapa 6: Comunicação' },
                                   { id: 'awareness_person_email', type: 'email' as const, label: '📧 E-mail para Ciência', required: false, placeholder: 'ciencia@empresa.com', section: 'Etapa 6: Comunicação' },
                                   
                                   // ETAPA 7: MONITORAMENTO
                                   { id: 'monitoring_frequency', type: 'select' as const, label: '📊 Frequência de Monitoramento', required: false, options: ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'], section: 'Etapa 7: Monitoramento' },
                                   { id: 'monitoring_responsible', type: 'text' as const, label: '👤 Responsável pelo Monitoramento', required: false, placeholder: 'Nome do responsável', section: 'Etapa 7: Monitoramento' },
                                   { id: 'residual_impact', type: 'select' as const, label: '📉 Impacto Residual', required: false, options: ['1 - Muito Baixo', '2 - Baixo', '3 - Médio', '4 - Alto', '5 - Muito Alto'], section: 'Etapa 7: Monitoramento' },
                                   { id: 'residual_likelihood', type: 'select' as const, label: '📊 Probabilidade Residual', required: false, options: ['1 - Muito Baixa', '2 - Baixa', '3 - Média', '4 - Alta', '5 - Muito Alta'], section: 'Etapa 7: Monitoramento' },
                                   { id: 'closure_criteria', type: 'textarea' as const, label: '✅ Critérios de Encerramento', required: false, placeholder: 'Defina os critérios para encerramento do risco...', section: 'Etapa 7: Monitoramento' },
                                   { id: 'closure_date', type: 'date' as const, label: '📅 Data Prevista de Encerramento', required: false, section: 'Etapa 7: Monitoramento' }
                                 ],
                                 workflowNodes: [
                                   // ETAPA 1: IDENTIFICAÇÃO DO RISCO
                                   {
                                     id: 'step1-identification',
                                     type: 'start' as const,
                                     position: { x: 50, y: 200 },
                                     size: { width: 120, height: 100 },
                                     data: {
                                       label: '1️⃣ Identificação',
                                       description: 'Dados básicos do risco: título, descrição, categoria, fonte',
                                       properties: {
                                         step: 1,
                                         form_fields: ['risk_title', 'risk_description', 'risk_category', 'risk_source', 'business_area', 'identification_date'],
                                         validation_rules: ['risk_title required', 'risk_category required', 'risk_description required'],
                                         wizard_component: 'Step1Identification',
                                         progress_weight: 14.3,
                                         icon: 'FileText',
                                         color: 'blue',
                                         responsible: 'Identificador do Risco',
                                         sla: 'Imediato',
                                         help_text: 'Preencha as informações básicas sobre o risco identificado'
                                       }
                                     }
                                   },
                                   
                                   // ETAPA 2: ANÁLISE DO RISCO
                                   {
                                     id: 'step2-analysis',
                                     type: 'task' as const,
                                     position: { x: 220, y: 200 },
                                     size: { width: 120, height: 100 },
                                     data: {
                                       label: '2️⃣ Análise',
                                       description: 'Metodologia e avaliação: probabilidade, impacto, score do risco',
                                       properties: {
                                         step: 2,
                                         form_fields: ['analysis_methodology', 'impact_score', 'likelihood_score', 'risk_score', 'risk_level'],
                                         validation_rules: ['analysis_methodology required', 'impact_score required', 'likelihood_score required'],
                                         wizard_component: 'Step2Analysis',
                                         progress_weight: 14.3,
                                         icon: 'BarChart3',
                                         color: 'orange',
                                         responsible: 'Analista de Riscos',
                                         duration: '1-2 dias',
                                         help_text: 'Analise qualitativa ou quantitativa do risco',
                                         auto_calculate: ['risk_score = impact_score * likelihood_score', 'risk_level based on risk_score'],
                                         methodology_options: ['COSO ERM', 'ISO 31000', 'Qualitativa (1-5)', 'Quantitativa (VaR)']
                                       }
                                     }
                                   },
                                   
                                   // ETAPA 3: CLASSIFICAÇÃO GUT
                                   {
                                     id: 'step3-classification',
                                     type: 'task' as const,
                                     position: { x: 390, y: 200 },
                                     size: { width: 120, height: 100 },
                                     data: {
                                       label: '3️⃣ Classificação',
                                       description: 'Metodologia GUT: Gravidade, Urgência e Tendência',
                                       properties: {
                                         step: 3,
                                         form_fields: ['gut_gravity', 'gut_urgency', 'gut_tendency', 'gut_score'],
                                         validation_rules: ['gut_gravity required', 'gut_urgency required', 'gut_tendency required'],
                                         wizard_component: 'Step3Classification',
                                         progress_weight: 14.3,
                                         icon: 'Target',
                                         color: 'purple',
                                         responsible: 'Analista de Riscos',
                                         duration: '30 min',
                                         help_text: 'Classifique o risco usando metodologia GUT',
                                         auto_calculate: ['gut_score = gut_gravity * gut_urgency * gut_tendency'],
                                         priority_ranges: ['1-64: Baixa', '65-100: Média', '101-125: Alta']
                                       }
                                     }
                                   },
                                   
                                   // ETAPA 4: ESTRATÉGIA DE TRATAMENTO
                                   {
                                     id: 'step4-treatment',
                                     type: 'task' as const,
                                     position: { x: 560, y: 200 },
                                     size: { width: 120, height: 100 },
                                     data: {
                                       label: '4️⃣ Tratamento',
                                       description: 'Estratégia de resposta: evitar, mitigar, transferir ou aceitar',
                                       properties: {
                                         step: 4,
                                         form_fields: ['treatment_strategy', 'treatment_rationale', 'treatment_cost', 'treatment_timeline'],
                                         validation_rules: ['treatment_strategy required', 'treatment_rationale required'],
                                         wizard_component: 'Step4Treatment',
                                         progress_weight: 14.3,
                                         icon: 'Shield',
                                         color: 'green',
                                         responsible: 'Gestor de Riscos',
                                         duration: '1-2 dias',
                                         help_text: 'Defina a estratégia mais adequada para tratar o risco',
                                         strategy_options: ['Evitar', 'Mitigar', 'Transferir', 'Aceitar'],
                                         conditional_logic: 'Se Aceitar, pular para Etapa 6'
                                       }
                                     }
                                   },
                                   
                                   // ETAPA 5: PLANO DE AÇÃO (Condicional)
                                   {
                                     id: 'step5-action-plan',
                                     type: 'task' as const,
                                     position: { x: 730, y: 120 },
                                     size: { width: 120, height: 100 },
                                     data: {
                                       label: '5️⃣ Plano de Ação',
                                       description: 'Atividades e responsáveis para implementar o tratamento',
                                       properties: {
                                         step: 5,
                                         form_fields: ['activity_1_name', 'activity_1_description', 'activity_1_responsible', 'activity_1_email', 'activity_1_due_date', 'activity_1_priority'],
                                         validation_rules: [],
                                         wizard_component: 'Step5ActionPlan',
                                         progress_weight: 14.3,
                                         icon: 'ClipboardList',
                                         color: 'indigo',
                                         responsible: 'Responsável pelas Ações',
                                         duration: '1-3 dias',
                                         help_text: 'Detalhe as atividades necessárias para tratar o risco',
                                         conditional: 'Executa apenas se estratégia != Aceitar',
                                         multiple_actions: true
                                       }
                                     }
                                   },
                                   
                                   // ETAPA 6: COMUNICAÇÃO E STAKEHOLDERS
                                   {
                                     id: 'step6-communication',
                                     type: 'task' as const,
                                     position: { x: 730, y: 280 },
                                     size: { width: 120, height: 100 },
                                     data: {
                                       label: '6️⃣ Comunicação',
                                       description: 'Stakeholders e aprovação do registro de risco',
                                       properties: {
                                         step: 6,
                                         form_fields: ['approval_person_name', 'approval_person_position', 'approval_person_email', 'awareness_person_name', 'awareness_person_email'],
                                         validation_rules: ['approval_person_name required', 'approval_person_email required'],
                                         wizard_component: 'Step6Communication',
                                         progress_weight: 14.3,
                                         icon: 'Users',
                                         color: 'cyan',
                                         responsible: 'Proprietário do Risco',
                                         duration: '1-2 dias',
                                         help_text: 'Defina quem deve aprovar e ser notificado sobre o risco',
                                         notification_types: ['Aprovação', 'Ciência'],
                                         auto_notify: true
                                       }
                                     }
                                   },
                                   
                                   // ETAPA 7: MONITORAMENTO E ENCERRAMENTO
                                   {
                                     id: 'step7-monitoring',
                                     type: 'task' as const,
                                     position: { x: 900, y: 200 },
                                     size: { width: 120, height: 100 },
                                     data: {
                                       label: '7️⃣ Monitoramento',
                                       description: 'Acompanhamento e critérios de encerramento do risco',
                                       properties: {
                                         step: 7,
                                         form_fields: ['monitoring_frequency', 'monitoring_responsible', 'residual_impact', 'residual_likelihood', 'closure_criteria', 'closure_date'],
                                         validation_rules: [],
                                         wizard_component: 'Step7Monitoring',
                                         progress_weight: 14.2,
                                         icon: 'Eye',
                                         color: 'gray',
                                         responsible: 'Proprietário do Risco',
                                         duration: 'Contínuo',
                                         help_text: 'Configure como o risco será monitorado ao longo do tempo',
                                         monitoring_options: ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'],
                                         residual_calculation: true,
                                         closure_automation: true
                                       }
                                     }
                                   },
                                   
                                   // FINALIZAÇÃO: REGISTRO COMPLETO
                                   {
                                     id: 'completion-notification',
                                     type: 'notification' as const,
                                     position: { x: 1070, y: 200 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: '✅ Registro Completo',
                                       description: 'Notificação automática de conclusão do registro',
                                       properties: {
                                         recipients: ['Proprietário do Risco', 'Gestor da Área', 'Comitê de Riscos'],
                                         template: 'risk_registration_complete',
                                         channel: 'email_dashboard',
                                         urgency: 'medium',
                                         auto_trigger: true,
                                         includes: ['Resumo do risco', 'Score calculado', 'Estratégia definida', 'Próximos passos'],
                                         retention_period: '5 anos',
                                         compliance_report: true
                                       }
                                     }
                                   }
                                 ],
                                 workflowConnections: [
                                   // FLUXO SEQUENCIAL DO PROCESSO GUIADO DE RISCOS
                                   { id: 'risk-conn-1', source: 'step1-identification', target: 'step2-analysis', type: 'default' as const, label: '1→ 2: Dados Básicos Completos' },
                                   { id: 'risk-conn-2', source: 'step2-analysis', target: 'step3-classification', type: 'default' as const, label: '2→ 3: Análise Concluída' },
                                   { id: 'risk-conn-3', source: 'step3-classification', target: 'step4-treatment', type: 'default' as const, label: '3→ 4: GUT Calculado' },
                                   
                                   // FLUXO CONDICIONAL BASEADO NA ESTRATÉGIA
                                   { id: 'risk-conn-4a', source: 'step4-treatment', target: 'step5-action-plan', type: 'default' as const, label: '4→ 5: Mitigar/Evitar/Transferir' },
                                   { id: 'risk-conn-4b', source: 'step4-treatment', target: 'step6-communication', type: 'default' as const, label: '4→ 6: Aceitar (Pular Plano)' },
                                   
                                   // CONVERGÊNCIA PARA COMUNICAÇÃO
                                   { id: 'risk-conn-5', source: 'step5-action-plan', target: 'step6-communication', type: 'default' as const, label: '5→ 6: Plano Definido' },
                                   
                                   // FINALIZAÇÃO DO PROCESSO
                                   { id: 'risk-conn-6', source: 'step6-communication', target: 'step7-monitoring', type: 'default' as const, label: '6→ 7: Stakeholders Definidos' },
                                   { id: 'risk-conn-7', source: 'step7-monitoring', target: 'completion-notification', type: 'default' as const, label: '7→ Fim: Registro Finalizado' }
                                 ]
                               };
                               
                               setProcessName(riskManagementTemplate.name);
                               setFormFields(riskManagementTemplate.formFields);
                               setWorkflowNodes(riskManagementTemplate.workflowNodes);
                               setWorkflowConnections(riskManagementTemplate.workflowConnections);
                               setShowInitialChoice(false);
                               setHasUnsavedChanges(true);
                               toast.success('Template "Gestão de Riscos - Processo Guiado" aplicado com sucesso!');
                             }}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm group-hover:text-red-600">
                                🧠 Gestão de Riscos - Processo Guiado Completo (Alex Risk)
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Sistema profissional de 7 etapas integradas baseado no wizard Alex Risk. Inclui 33 campos especializados, fluxos condicionais, cálculos automáticos e integração com biblioteca de riscos.
                              </p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded">Alex Risk IA</span>
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">Wizard Guiado</span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">7 Etapas</span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">Profissional</span>
                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded">Multi-Formulários</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Template: Auditoria Interna - Processo Profissional Completo */}
                        <div className="border rounded-lg p-4 hover:border-blue-300 cursor-pointer group"
                             onClick={() => {
                               const auditTemplate = {
                                 name: 'Auditoria Interna - Processo Profissional Completo',
                                 description: 'Sistema completo de auditoria interna com workflow estruturado, múltiplos formulários integrados e conformidade ISO 19011',
                                 formFields: [
                                   // Formulário de Identificação do Risco
                                   { id: 'risk_id', type: 'text' as const, label: 'ID do Risco', required: true, placeholder: 'RSK-OP-2024-001' },
                                   { id: 'risk_title', type: 'text' as const, label: 'Título do Risco', required: true, placeholder: 'Ex: Indisponibilidade do Sistema ERP Crítico' },
                                   { id: 'risk_category', type: 'select' as const, label: 'Categoria do Risco', required: true, options: ['Operacional', 'Estratégico', 'Financeiro', 'Compliance', 'Tecnológico', 'Reputacional', 'Legal'] },
                                   { id: 'risk_description', type: 'textarea' as const, label: 'Descrição Detalhada', required: true, placeholder: 'Descrição completa do evento de risco, suas causas potenciais e contexto...' },
                                   { id: 'risk_source', type: 'select' as const, label: 'Fonte do Risco', required: true, options: ['Interna - Processo', 'Interna - Pessoa', 'Interna - Sistema', 'Externa - Fornecedor', 'Externa - Regulatória', 'Externa - Mercado', 'Externa - Natural'] },
                                   { id: 'business_process', type: 'text' as const, label: 'Processo de Negócio Afetado', required: true, placeholder: 'Ex: Vendas, Produção, Logística...' },
                                   { id: 'identified_by', type: 'text' as const, label: 'Identificado Por', required: true, placeholder: 'Nome e cargo do identificador' },
                                   { id: 'identification_date', type: 'date' as const, label: 'Data de Identificação', required: true },
                                   
                                   // Formulário de Análise Qualitativa
                                   { id: 'probability_qualitative', type: 'select' as const, label: 'Probabilidade (Qualitativa)', required: true, options: ['Muito Baixa (0-5%)', 'Baixa (6-25%)', 'Média (26-50%)', 'Alta (51-75%)', 'Muito Alta (76-100%)'] },
                                   { id: 'impact_financial', type: 'select' as const, label: 'Impacto Financeiro', required: true, options: ['< R$ 10k', 'R$ 10k - R$ 100k', 'R$ 100k - R$ 1M', 'R$ 1M - R$ 10M', '> R$ 10M'] },
                                   { id: 'impact_operational', type: 'select' as const, label: 'Impacto Operacional', required: true, options: ['Mínimo', 'Menor', 'Moderado', 'Maior', 'Severo'] },
                                   { id: 'impact_reputational', type: 'select' as const, label: 'Impacto Reputacional', required: true, options: ['Nenhum', 'Local', 'Regional', 'Nacional', 'Internacional'] },
                                   { id: 'impact_regulatory', type: 'select' as const, label: 'Impacto Regulatório', required: true, options: ['Nenhum', 'Advertência', 'Multa Menor', 'Multa Significativa', 'Perda de Licença'] },
                                   
                                   // Formulário de Análise Quantitativa (quando aplicável)
                                   { id: 'annual_loss_expectancy', type: 'number' as const, label: 'Expectativa de Perda Anual (R$)', required: false, placeholder: '0' },
                                   { id: 'maximum_loss_potential', type: 'number' as const, label: 'Potencial de Perda Máxima (R$)', required: false, placeholder: '0' },
                                   { id: 'frequency_historical', type: 'text' as const, label: 'Frequência Histórica', required: false, placeholder: 'Ex: 2 vezes nos últimos 5 anos' },
                                   
                                   // Formulário de Avaliação de Controles Existentes
                                   { id: 'existing_controls', type: 'textarea' as const, label: 'Controles Existentes', required: false, placeholder: 'Lista e descrição dos controles já implementados...' },
                                   { id: 'control_effectiveness', type: 'select' as const, label: 'Eficácia dos Controles', required: false, options: ['Inexistente', 'Fraca', 'Adequada', 'Forte', 'Muito Forte'] },
                                   
                                   // Formulário de Tratamento do Risco
                                   { id: 'treatment_strategy', type: 'select' as const, label: 'Estratégia de Tratamento', required: false, options: ['Evitar', 'Mitigar', 'Transferir', 'Aceitar'] },
                                   { id: 'action_plan', type: 'textarea' as const, label: 'Plano de Ação', required: false, placeholder: 'Ações específicas para tratar o risco...' },
                                   { id: 'risk_owner', type: 'text' as const, label: 'Proprietário do Risco', required: true, placeholder: 'Gestor responsável pelo processo afetado' },
                                   { id: 'action_owner', type: 'text' as const, label: 'Responsável pelas Ações', required: false, placeholder: 'Pessoa responsável por implementar as ações' },
                                   { id: 'target_date', type: 'date' as const, label: 'Data Alvo para Conclusão', required: false },
                                   { id: 'budget_required', type: 'number' as const, label: 'Orçamento Necessário (R$)', required: false, placeholder: '0' },
                                   
                                   // Formulário de Monitoramento
                                   { id: 'kri_indicators', type: 'textarea' as const, label: 'Indicadores Chave de Risco (KRIs)', required: false, placeholder: 'Lista de KRIs para monitoramento...' },
                                   { id: 'review_frequency', type: 'select' as const, label: 'Frequência de Revisão', required: false, options: ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'] },
                                   { id: 'next_review_date', type: 'date' as const, label: 'Próxima Revisão', required: false },
                                   { id: 'risk_appetite_limit', type: 'text' as const, label: 'Limite de Apetite ao Risco', required: false, placeholder: 'Limites definidos pela organização' }
                                 ],
                                 workflowNodes: [
                                   // Início - Identificação
                                   {
                                     id: 'risk-identification-start',
                                     type: 'start' as const,
                                     position: { x: 50, y: 250 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Identificação de Risco',
                                       description: 'Novo risco identificado no ambiente de negócio',
                                       properties: { 
                                         trigger_type: 'event_continuous',
                                         notification_enabled: true,
                                         responsible: 'Qualquer colaborador',
                                         sla: 'Imediato'
                                       }
                                     }
                                   },
                                   
                                   // Registro Inicial
                                   {
                                     id: 'initial-registration',
                                     type: 'task' as const,
                                     position: { x: 220, y: 250 },
                                     size: { width: 140, height: 100 },
                                     data: {
                                       label: 'Registro Inicial',
                                       description: 'Captura das informações básicas do risco',
                                       properties: {
                                         priority: 'high',
                                         duration: '1 hora',
                                         assignee: 'Identificador + Gestor do Processo',
                                         form_fields: ['risk_id', 'risk_title', 'risk_category', 'risk_description', 'risk_source', 'business_process', 'identified_by', 'identification_date'],
                                         checklist: [
                                           'Descrever o risco claramente',
                                           'Identificar processo afetado',
                                           'Classificar categoria inicial',
                                           'Definir ID único do risco',
                                           'Registrar fonte e contexto'
                                         ],
                                         resources: ['Taxonomia de riscos', 'Registro de riscos central'],
                                         deliverables: ['Ficha inicial do risco preenchida']
                                       }
                                     }
                                   },
                                   
                                   // Triagem Inicial
                                   {
                                     id: 'initial-triage',
                                     type: 'decision' as const,
                                     position: { x: 410, y: 250 },
                                     size: { width: 120, height: 120 },
                                     data: {
                                       label: 'Triagem de Criticidade',
                                       description: 'Avaliação inicial de criticidade para priorização',
                                       properties: {
                                         conditions: [
                                           'Risco crítico - análise imediata',
                                           'Risco significativo - análise prioritária',
                                           'Risco baixo - análise programada'
                                         ],
                                         criteria: 'Avaliação preliminar de impacto e urgência',
                                         timeout: '4 horas',
                                         fallback_action: 'Escalar para comitê de riscos',
                                         responsible: 'Coordenador de Riscos'
                                       }
                                     }
                                   },
                                   
                                   // Análise Qualitativa Detalhada
                                   {
                                     id: 'qualitative-analysis',
                                     type: 'task' as const,
                                     position: { x: 580, y: 150 },
                                     size: { width: 150, height: 110 },
                                     data: {
                                       label: 'Análise Qualitativa',
                                       description: 'Avaliação detalhada de probabilidade e impactos',
                                       properties: {
                                         priority: 'critical',
                                         duration: '1-2 dias',
                                         assignee: 'Analista de Riscos + Especialista do Processo',
                                         form_fields: ['probability_qualitative', 'impact_financial', 'impact_operational', 'impact_reputational', 'impact_regulatory'],
                                         checklist: [
                                           'Avaliar probabilidade com dados históricos',
                                           'Quantificar impacto financeiro',
                                           'Analisar impacto operacional',
                                           'Avaliar consequências reputacionais',
                                           'Verificar implicações regulatórias',
                                           'Calcular score de risco qualitativo'
                                         ],
                                         resources: ['Matriz de probabilidade/impacto', 'Base histórica de eventos', 'Critérios de impacto'],
                                         deliverables: ['Score de risco qualitativo', 'Mapa de calor atualizado']
                                       }
                                     }
                                   },
                                   
                                   // Análise Quantitativa (para riscos significativos)
                                   {
                                     id: 'quantitative-analysis',
                                     type: 'task' as const,
                                     position: { x: 580, y: 350 },
                                     size: { width: 150, height: 110 },
                                     data: {
                                       label: 'Análise Quantitativa',
                                       description: 'Modelagem estatística e análise financeira detalhada',
                                       properties: {
                                         priority: 'high',
                                         duration: '2-5 dias',
                                         assignee: 'Especialista Quantitativo + Analista Financeiro',
                                         form_fields: ['annual_loss_expectancy', 'maximum_loss_potential', 'frequency_historical'],
                                         checklist: [
                                           'Modelar distribuição de perdas',
                                           'Calcular VaR (Value at Risk)',
                                           'Determinar ALE (Annual Loss Expectancy)',
                                           'Estimar MLP (Maximum Loss Potential)',
                                           'Realizar análise de sensibilidade',
                                           'Validar modelos com dados históricos'
                                         ],
                                         resources: ['Ferramentas estatísticas', 'Dados históricos de perdas', 'Modelos de risco'],
                                         deliverables: ['Modelo quantitativo de risco', 'Relatório de análise estatística']
                                       }
                                     }
                                   },
                                   
                                   // Avaliação de Controles
                                   {
                                     id: 'control-assessment',
                                     type: 'task' as const,
                                     position: { x: 780, y: 250 },
                                     size: { width: 140, height: 100 },
                                     data: {
                                       label: 'Avaliação de Controles',
                                       description: 'Análise da eficácia dos controles existentes',
                                       properties: {
                                         priority: 'high',
                                         duration: '1-2 dias',
                                         assignee: 'Auditor Interno + Gestor do Processo',
                                         form_fields: ['existing_controls', 'control_effectiveness'],
                                         checklist: [
                                           'Mapear controles preventivos',
                                           'Identificar controles detectivos',
                                           'Avaliar controles corretivos',
                                           'Testar eficácia dos controles',
                                           'Identificar gaps de controle',
                                           'Calcular risco residual'
                                         ],
                                         resources: ['Matriz de controles', 'Procedimentos de teste', 'Framework de controles'],
                                         deliverables: ['Matriz de controles avaliada', 'Score de eficácia', 'Risco residual calculado']
                                       }
                                     }
                                   },
                                   
                                   // Decisão de Tratamento
                                   {
                                     id: 'treatment-decision',
                                     type: 'decision' as const,
                                     position: { x: 970, y: 250 },
                                     size: { width: 120, height: 120 },
                                     data: {
                                       label: 'Estratégia de Tratamento',
                                       description: 'Decisão sobre como tratar o risco residual',
                                       properties: {
                                         conditions: [
                                           'Evitar - Eliminar atividade',
                                           'Mitigar - Reduzir probabilidade/impacto',
                                           'Transferir - Seguros/outsourcing',
                                           'Aceitar - Dentro do apetite'
                                         ],
                                         criteria: 'Apetite ao risco vs custo/benefício',
                                         timeout: '2 dias',
                                         fallback_action: 'Reunião do comitê executivo',
                                         responsible: 'Proprietário do Risco + Comitê'
                                       }
                                     }
                                   },
                                   
                                   // Implementação de Ações (Mitigar)
                                   {
                                     id: 'action-implementation',
                                     type: 'task' as const,
                                     position: { x: 1160, y: 120 },
                                     size: { width: 150, height: 110 },
                                     data: {
                                       label: 'Implementação de Ações',
                                       description: 'Execução do plano de tratamento do risco',
                                       properties: {
                                         priority: 'high',
                                         duration: '30-180 dias',
                                         assignee: 'Responsável pelas Ações + Equipe',
                                         form_fields: ['treatment_strategy', 'action_plan', 'action_owner', 'target_date', 'budget_required'],
                                         checklist: [
                                           'Elaborar plano detalhado de ações',
                                           'Alocar recursos necessários',
                                           'Definir cronograma de implementação',
                                           'Estabelecer marcos de controle',
                                           'Implementar controles adicionais',
                                           'Validar eficácia das ações'
                                         ],
                                         resources: ['Orçamento aprovado', 'Equipe de projeto', 'Fornecedores especializados'],
                                         deliverables: ['Controles implementados', 'Relatório de eficácia', 'Risco residual atualizado']
                                       }
                                     }
                                   },
                                   
                                   // Transferência de Risco
                                   {
                                     id: 'risk-transfer',
                                     type: 'task' as const,
                                     position: { x: 1160, y: 280 },
                                     size: { width: 150, height: 110 },
                                     data: {
                                       label: 'Transferência de Risco',
                                       description: 'Implementação de mecanismos de transferência',
                                       properties: {
                                         priority: 'medium',
                                         duration: '15-60 dias',
                                         assignee: 'Gestor de Seguros + Jurídico',
                                         checklist: [
                                           'Avaliar opções de seguros',
                                           'Negociar contratos de transferência',
                                           'Implementar cláusulas de proteção',
                                           'Estabelecer SLAs com terceiros',
                                           'Monitorar performance de terceiros'
                                         ],
                                         resources: ['Corretores de seguro', 'Assessoria jurídica', 'Fornecedores qualificados'],
                                         deliverables: ['Contratos de transferência', 'Apólices de seguro', 'Acordos de SLA']
                                       }
                                     }
                                   },
                                   
                                   // Aceitação Formal
                                   {
                                     id: 'risk-acceptance',
                                     type: 'task' as const,
                                     position: { x: 1160, y: 430 },
                                     size: { width: 150, height: 110 },
                                     data: {
                                       label: 'Aceitação Formal',
                                       description: 'Formalização da aceitação do risco residual',
                                       properties: {
                                         priority: 'medium',
                                         duration: '1-2 dias',
                                         assignee: 'Proprietário do Risco + Direção',
                                         checklist: [
                                           'Documentar justificativa da aceitação',
                                           'Obter aprovação da direção',
                                           'Estabelecer limites de monitoramento',
                                           'Definir gatilhos de reavaliação',
                                           'Comunicar decisão aos stakeholders'
                                         ],
                                         resources: ['Template de aceitação', 'Política de riscos'],
                                         deliverables: ['Termo de aceitação assinado', 'Limites documentados']
                                       }
                                     }
                                   },
                                   
                                   // Monitoramento Contínuo
                                   {
                                     id: 'continuous-monitoring',
                                     type: 'task' as const,
                                     position: { x: 1360, y: 250 },
                                     size: { width: 140, height: 100 },
                                     data: {
                                       label: 'Monitoramento Contínuo',
                                       description: 'Acompanhamento sistemático do risco e controles',
                                       properties: {
                                         priority: 'medium',
                                         duration: 'Contínuo',
                                         assignee: 'Proprietário do Risco + Analista',
                                         form_fields: ['kri_indicators', 'review_frequency', 'next_review_date', 'risk_appetite_limit'],
                                         checklist: [
                                           'Monitorar KRIs estabelecidos',
                                           'Acompanhar eficácia dos controles',
                                           'Verificar mudanças no contexto',
                                           'Atualizar avaliação periodicamente',
                                           'Reportar status à direção',
                                           'Identificar novos riscos emergentes'
                                         ],
                                         resources: ['Dashboard de riscos', 'Sistema de monitoramento', 'Relatórios automatizados'],
                                         deliverables: ['Relatórios de monitoramento', 'Alertas de limite', 'Atualizações de status']
                                       }
                                     }
                                   },
                                   
                                   // Revisão e Atualização
                                   {
                                     id: 'review-update',
                                     type: 'task' as const,
                                     position: { x: 1550, y: 250 },
                                     size: { width: 140, height: 100 },
                                     data: {
                                       label: 'Revisão Periódica',
                                       description: 'Revisão formal e atualização do registro',
                                       properties: {
                                         priority: 'medium',
                                         duration: '1-2 dias',
                                         assignee: 'Analista de Riscos + Proprietário',
                                         checklist: [
                                           'Revisar todas as informações do risco',
                                           'Atualizar avaliações se necessário',
                                           'Verificar eficácia das ações',
                                           'Ajustar estratégia se necessário',
                                           'Documentar mudanças',
                                           'Agendar próxima revisão'
                                         ],
                                         resources: ['Histórico do risco', 'Dados atualizados'],
                                         deliverables: ['Registro atualizado', 'Novas recomendações']
                                       }
                                     }
                                   },
                                   
                                   // Comunicação e Reporte
                                   {
                                     id: 'communication-reporting',
                                     type: 'notification' as const,
                                     position: { x: 1740, y: 250 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Comunicação e Reporte',
                                       description: 'Comunicação sistemática sobre o status do risco',
                                       properties: {
                                         recipients: ['Proprietário do Risco', 'Comitê de Riscos', 'Direção', 'Stakeholders Afetados'],
                                         template: 'risk_status_report',
                                         channel: 'email_dashboard',
                                         urgency: 'medium',
                                         frequency: 'Conforme definido',
                                         escalation_rules: 'Alertas automáticos para desvios'
                                       }
                                     }
                                   }
                                 ],
                                 workflowConnections: [
                                   // Fluxo principal de identificação
                                   { id: 'risk-conn1', source: 'risk-identification-start', target: 'initial-registration', type: 'default' as const, label: 'Risco Identificado' },
                                   { id: 'risk-conn2', source: 'initial-registration', target: 'initial-triage', type: 'default' as const, label: 'Registrado' },
                                   
                                   // Bifurcação para análises
                                   { id: 'risk-conn3a', source: 'initial-triage', target: 'qualitative-analysis', type: 'default' as const, label: 'Todos os Riscos' },
                                   { id: 'risk-conn3b', source: 'initial-triage', target: 'quantitative-analysis', type: 'default' as const, label: 'Riscos Significativos' },
                                   
                                   // Convergência para avaliação de controles
                                   { id: 'risk-conn4a', source: 'qualitative-analysis', target: 'control-assessment', type: 'default' as const, label: 'Análise Qualitativa Completa' },
                                   { id: 'risk-conn4b', source: 'quantitative-analysis', target: 'control-assessment', type: 'default' as const, label: 'Análise Quantitativa Completa' },
                                   
                                   // Decisão de tratamento
                                   { id: 'risk-conn5', source: 'control-assessment', target: 'treatment-decision', type: 'default' as const, label: 'Controles Avaliados' },
                                   
                                   // Caminhos de tratamento
                                   { id: 'risk-conn6a', source: 'treatment-decision', target: 'action-implementation', type: 'default' as const, label: 'Mitigar' },
                                   { id: 'risk-conn6b', source: 'treatment-decision', target: 'risk-transfer', type: 'default' as const, label: 'Transferir' },
                                   { id: 'risk-conn6c', source: 'treatment-decision', target: 'risk-acceptance', type: 'default' as const, label: 'Aceitar' },
                                   
                                   // Convergência para monitoramento
                                   { id: 'risk-conn7a', source: 'action-implementation', target: 'continuous-monitoring', type: 'default' as const, label: 'Ações Implementadas' },
                                   { id: 'risk-conn7b', source: 'risk-transfer', target: 'continuous-monitoring', type: 'default' as const, label: 'Transferência Efetuada' },
                                   { id: 'risk-conn7c', source: 'risk-acceptance', target: 'continuous-monitoring', type: 'default' as const, label: 'Aceitação Formalizada' },
                                   
                                   // Ciclo de revisão
                                   { id: 'risk-conn8', source: 'continuous-monitoring', target: 'review-update', type: 'default' as const, label: 'Período de Revisão' },
                                   { id: 'risk-conn9', source: 'review-update', target: 'communication-reporting', type: 'default' as const, label: 'Revisão Completa' },
                                   
                                   // Ciclo contínuo
                                   { id: 'risk-conn10', source: 'communication-reporting', target: 'continuous-monitoring', type: 'default' as const, label: 'Continuar Monitoramento' },
                                   { id: 'risk-conn11', source: 'review-update', target: 'treatment-decision', type: 'default' as const, label: 'Requer Nova Estratégia' }
                                 ]
                               };
                               
                               setProcessName(auditTemplate.name);
                               setFormFields(auditTemplate.formFields);
                               setWorkflowNodes(auditTemplate.workflowNodes);
                               setWorkflowConnections(auditTemplate.workflowConnections);
                               setShowInitialChoice(false);
                               setHasUnsavedChanges(true);
                               toast.success('Template "Auditoria Interna Profissional" aplicado com sucesso!');
                             }}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm group-hover:text-blue-600">
                                🔍 Auditoria Interna - Processo Profissional Completo
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Sistema completo de auditoria interna baseado em ISO 19011. Workflow estruturado com múltiplas fases, formulários especializados, coleta de evidências e relatórios automáticos.
                              </p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">ISO 19011</span>
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">Auditoria</span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">Evidências</span>
                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded">Relatórios</span>
                                <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs rounded">Profissional</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Template: Aprovação de Documentos */}
                        <div className="border rounded-lg p-4 hover:border-purple-300 cursor-pointer group"
                             onClick={() => {
                               const approvalTemplate = {
                                 name: 'Processo de Aprovação de Documentos',
                                 description: 'Template para aprovação de políticas e procedimentos',
                                 formFields: [
                                   {
                                     id: 'document_title',
                                     type: 'text' as const,
                                     label: 'Título do Documento',
                                     required: true,
                                     placeholder: 'Ex: Política de Segurança da Informação'
                                   },
                                   {
                                     id: 'document_type',
                                     type: 'select' as const,
                                     label: 'Tipo de Documento',
                                     required: true,
                                     options: ['Política', 'Procedimento', 'Norma', 'Manual', 'Instrução']
                                   },
                                   {
                                     id: 'author',
                                     type: 'text' as const,
                                     label: 'Autor',
                                     required: true,
                                     placeholder: 'Nome do autor'
                                   },
                                   {
                                     id: 'priority',
                                     type: 'select' as const,
                                     label: 'Prioridade',
                                     required: true,
                                     options: ['Baixa', 'Normal', 'Alta', 'Crítica']
                                   }
                                 ],
                                 workflowNodes: [
                                   {
                                     id: 'start-approval',
                                     type: 'start' as const,
                                     position: { x: 100, y: 200 },
                                     size: { width: 80, height: 80 },
                                     data: {
                                       label: 'Submissão',
                                       description: 'Documento submetido para aprovação',
                                       properties: { trigger_type: 'manual', notification_enabled: true }
                                     }
                                   },
                                   {
                                     id: 'review-task',
                                     type: 'task' as const,
                                     position: { x: 250, y: 200 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Revisão Técnica',
                                       description: 'Revisão técnica do conteúdo',
                                       properties: {
                                         priority: 'medium',
                                         duration: '3 dias',
                                         assignee: 'Revisor Técnico',
                                         checklist: ['Verificar conteúdo', 'Validar referências', 'Revisar formatação'],
                                         resources: ['Padrões da empresa', 'Templates aprovados']
                                       }
                                     }
                                   },
                                   {
                                     id: 'manager-decision',
                                     type: 'decision' as const,
                                     position: { x: 420, y: 200 },
                                     size: { width: 100, height: 100 },
                                     data: {
                                       label: 'Aprovação Gerencial',
                                       description: 'Decisão do gerente responsável',
                                       properties: {
                                         conditions: ['Revisão técnica OK', 'Conteúdo adequado'],
                                         criteria: 'Aprovação do gerente',
                                         timeout: '5 dias',
                                         fallback_action: 'Escalar para direção'
                                       }
                                     }
                                   },
                                   {
                                     id: 'publish-task',
                                     type: 'task' as const,
                                     position: { x: 590, y: 200 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Publicação',
                                       description: 'Publicação e divulgação do documento',
                                       properties: {
                                         priority: 'high',
                                         duration: '1 dia',
                                         assignee: 'Administrador de Documentos',
                                         checklist: ['Publicar no portal', 'Notificar usuários', 'Arquivar versão anterior'],
                                         resources: ['Sistema de gestão documental', 'Lista de distribuição']
                                       }
                                     }
                                   }
                                 ],
                                 workflowConnections: [
                                   { id: 'a1', source: 'start-approval', target: 'review-task', type: 'default' as const, label: 'Submetido' },
                                   { id: 'a2', source: 'review-task', target: 'manager-decision', type: 'default' as const, label: 'Revisado' },
                                   { id: 'a3', source: 'manager-decision', target: 'publish-task', type: 'default' as const, label: 'Aprovado' },
                                   { id: 'a4', source: 'manager-decision', target: 'review-task', type: 'default' as const, label: 'Rejeitado' }
                                 ]
                               };
                               
                               setProcessName(approvalTemplate.name);
                               setFormFields(approvalTemplate.formFields);
                               setWorkflowNodes(approvalTemplate.workflowNodes);
                               setWorkflowConnections(approvalTemplate.workflowConnections);
                               setShowInitialChoice(false);
                               setHasUnsavedChanges(true);
                               toast.success('Template "Aprovação de Documentos" aplicado com sucesso!');
                             }}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm group-hover:text-purple-600">
                                Processo de Aprovação de Documentos
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Fluxo de aprovação com múltiplos níveis. Inclui 4 campos e 4 elementos com notificações.
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">Documentos</span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">Aprovação</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Template: Onboarding */}
                        <div className="border rounded-lg p-4 hover:border-green-300 cursor-pointer group"
                             onClick={() => {
                               const onboardingTemplate = {
                                 name: 'Processo de Onboarding de Funcionários',
                                 description: 'Template para integração de novos funcionários',
                                 formFields: [
                                   {
                                     id: 'employee_name',
                                     type: 'text' as const,
                                     label: 'Nome do Funcionário',
                                     required: true,
                                     placeholder: 'Nome completo'
                                   },
                                   {
                                     id: 'department',
                                     type: 'select' as const,
                                     label: 'Departamento',
                                     required: true,
                                     options: ['TI', 'RH', 'Financeiro', 'Comercial', 'Operações', 'Auditoria']
                                   },
                                   {
                                     id: 'position',
                                     type: 'text' as const,
                                     label: 'Cargo',
                                     required: true,
                                     placeholder: 'Ex: Analista de Sistemas'
                                   },
                                   {
                                     id: 'start_date',
                                     type: 'date' as const,
                                     label: 'Data de Início',
                                     required: true
                                   },
                                   {
                                     id: 'manager',
                                     type: 'text' as const,
                                     label: 'Gestor Direto',
                                     required: true,
                                     placeholder: 'Nome do gestor'
                                   }
                                 ],
                                 workflowNodes: [
                                   {
                                     id: 'start-onboarding',
                                     type: 'start' as const,
                                     position: { x: 100, y: 180 },
                                     size: { width: 80, height: 80 },
                                     data: {
                                       label: 'Novo Funcionário',
                                       description: 'Início do processo de integração',
                                       properties: { trigger_type: 'manual', notification_enabled: true }
                                     }
                                   },
                                   {
                                     id: 'documentation-task',
                                     type: 'task' as const,
                                     position: { x: 250, y: 180 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Documentação',
                                       description: 'Preparar documentação necessária',
                                       properties: {
                                         priority: 'high',
                                         duration: '1 dia',
                                         assignee: 'RH',
                                         checklist: ['Contrato de trabalho', 'Termo de confidencialidade', 'Políticas da empresa'],
                                         resources: ['Templates contratuais', 'Políticas atualizadas']
                                       }
                                     }
                                   },
                                   {
                                     id: 'setup-task',
                                     type: 'task' as const,
                                     position: { x: 420, y: 180 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Setup Inicial',
                                       description: 'Configurar acesso e recursos',
                                       properties: {
                                         priority: 'critical',
                                         duration: '2 dias',
                                         assignee: 'TI',
                                         checklist: ['Criar usuário', 'Configurar email', 'Instalar softwares', 'Definir permissões'],
                                         resources: ['Servidor de domínio', 'Licenças de software']
                                       }
                                     }
                                   },
                                   {
                                     id: 'training-task',
                                     type: 'task' as const,
                                     position: { x: 590, y: 180 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Treinamento',
                                       description: 'Treinamento inicial e apresentações',
                                       properties: {
                                         priority: 'medium',
                                         duration: '5 dias',
                                         assignee: 'Gestor Direto',
                                         checklist: ['Apresentar equipe', 'Explicar processos', 'Tour pelas instalações'],
                                         resources: ['Materiais de treinamento', 'Plano de integração']
                                       }
                                     }
                                   },
                                   {
                                     id: 'evaluation-task',
                                     type: 'task' as const,
                                     position: { x: 760, y: 180 },
                                     size: { width: 120, height: 80 },
                                     data: {
                                       label: 'Avaliação',
                                       description: 'Avaliação do período de experiência',
                                       properties: {
                                         priority: 'medium',
                                         duration: '90 dias',
                                         assignee: 'Gestor Direto + RH',
                                         checklist: ['Avaliar desempenho', 'Coletar feedback', 'Definir próximos passos'],
                                         resources: ['Formulário de avaliação', 'Métricas de desempenho']
                                       }
                                     }
                                   }
                                 ],
                                 workflowConnections: [
                                   { id: 'o1', source: 'start-onboarding', target: 'documentation-task', type: 'default' as const, label: 'Contratado' },
                                   { id: 'o2', source: 'documentation-task', target: 'setup-task', type: 'default' as const, label: 'Documentado' },
                                   { id: 'o3', source: 'setup-task', target: 'training-task', type: 'default' as const, label: 'Configurado' },
                                   { id: 'o4', source: 'training-task', target: 'evaluation-task', type: 'default' as const, label: 'Treinado' }
                                 ]
                               };
                               
                               setProcessName(onboardingTemplate.name);
                               setFormFields(onboardingTemplate.formFields);
                               setWorkflowNodes(onboardingTemplate.workflowNodes);
                               setWorkflowConnections(onboardingTemplate.workflowConnections);
                               setShowInitialChoice(false);
                               setHasUnsavedChanges(true);
                               toast.success('Template "Onboarding de Funcionários" aplicado com sucesso!');
                             }}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm group-hover:text-green-600">
                                Processo de Onboarding de Funcionários
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Integração completa de novos funcionários. Inclui 5 campos e 5 elementos com avaliação.
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">RH</span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">Onboarding</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Create from Scratch */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                          <PenTool className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Criar do Zero
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Construa um processo personalizado desde o início
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Construção Personalizada
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Crie um processo único para suas necessidades específicas usando nosso designer avançado
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                              <Layout className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                              <div className="font-medium">Form Builder</div>
                              <div className="text-xs text-muted-foreground">Campos customizados</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                              <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                              <div className="font-medium">Workflow</div>
                              <div className="text-xs text-muted-foreground">Fluxos complexos</div>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => setShowInitialChoice(false)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-medium"
                          >
                            <PenTool className="w-4 h-4 mr-2" />
                            Começar do Zero
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
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
              <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div
                  ref={canvasRef}
                  className="w-full h-full relative cursor-grab active:cursor-grabbing"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onDragOver={handleCanvasDragOver}
                  onDrop={handleCanvasDrop}
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
                  
                  {/* Connection Mode Indicator */}
                  {isConnecting && connectionSource && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        <span className="font-medium">Clique em outro elemento para conectar</span>
                      </div>
                    </div>
                  )}

                  {/* Canvas Info */}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>Elementos: {workflowNodes.length}</span>
                      <span>Conexões: {workflowConnections.length}</span>
                      <span>Zoom: {Math.round(canvasScale * 100)}%</span>
                      {isConnecting && (
                        <span className="text-orange-500 animate-pulse">● Conectando</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
            </>
          )}
        </div>
      </div>
      
      {/* Node Configuration Modal */}
      <NodeConfigurationModal />
      
      {/* Process Configuration Modal */}
      <ProcessConfigurationModal />
    </div>
  );
};

export default ProcessDesignerModal;