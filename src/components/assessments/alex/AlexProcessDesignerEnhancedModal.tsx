import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings2, Edit, Workflow, BarChart3, FileText, Network, 
  Save, Plus, Grid, Eye, Boxes, Map, Settings, PlayCircle,
  Download, RefreshCw, Share2, Globe, X, Maximize2, Minimize2,
  Trash2, Move, GripVertical, Columns, RotateCcw, Database,
  Upload, Star, Hash, Mail, Calendar, Clock, ChevronDown,
  CheckSquare, Circle, Sliders
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';

// Interfaces para o Form Builder
interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  rowId: string;
  rowIndex: number;
  column: number;
  width: number; // span de colunas (1-4)
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

interface FormRow {
  id: string;
  columns: number;
  height: string; // 'auto', 'small', 'medium', 'large', 'xl'
  columnWidths: string[]; // Array com larguras: '1fr', '2fr', '200px', 'auto', etc.
}

interface AlexProcessDesignerEnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: any;
  onSave?: (data: any) => void;
}

const AlexProcessDesignerEnhancedModal: React.FC<AlexProcessDesignerEnhancedModalProps> = ({
  isOpen,
  onClose,
  mode = 'create',
  initialData,
  onSave
}) => {
  const { user } = useAuth();
  const [activeLayer, setActiveLayer] = useState<'form' | 'workflow' | 'analytics' | 'reports' | 'integrations'>('form');
  const [isMaximized, setIsMaximized] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Estados do Form Builder
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [draggedField, setDraggedField] = useState<any | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  
  // Estados para layout de linhas e colunas - INICIA VAZIO
  const [formRows, setFormRows] = useState<FormRow[]>([]);
  
  // Definição dos tipos de campos disponíveis
  const fieldTypes = {
    basic: [
      { type: 'text', label: 'Texto', icon: Edit, color: 'bg-blue-100' },
      { type: 'number', label: 'Número', icon: Hash, color: 'bg-green-100' },
      { type: 'email', label: 'Email', icon: Mail, color: 'bg-yellow-100' },
      { type: 'date', label: 'Data', icon: Calendar, color: 'bg-purple-100' },
      { type: 'time', label: 'Hora', icon: Clock, color: 'bg-pink-100' },
      { type: 'select', label: 'Seleção', icon: ChevronDown, color: 'bg-indigo-100' },
      { type: 'textarea', label: 'Texto Longo', icon: FileText, color: 'bg-cyan-100' }
    ],
    advanced: [
      { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'bg-orange-100' },
      { type: 'radio', label: 'Radio', icon: Circle, color: 'bg-red-100' },
      { type: 'file', label: 'Upload', icon: Upload, color: 'bg-teal-100' },
      { type: 'rating', label: 'Avaliação', icon: Star, color: 'bg-amber-100' },
      { type: 'slider', label: 'Slider', icon: Sliders, color: 'bg-lime-100' }
    ]
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const data = {
      layer: activeLayer,
      formFields,
      formRows,
      timestamp: new Date().toISOString(),
      user: user?.id
    };
    
    if (onSave) {
      onSave(data);
    }
    
    setHasUnsavedChanges(false);
    toast.success(`${mode === 'create' ? 'Criado' : 'Salvo'} com sucesso!`);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // ==================== FUNÇÕES DE GERENCIAMENTO DE LINHAS ====================

  const addNewRow = useCallback((columns: number = 2) => {
    const newRow: FormRow = {
      id: `row_${Date.now()}`,
      columns: columns,
      height: 'auto',
      columnWidths: Array(columns).fill('1fr')
    };
    setFormRows(prev => [...prev, newRow]);
    setHasUnsavedChanges(true);
    toast.success(`Nova linha adicionada com ${columns} coluna${columns > 1 ? 's' : ''}!`);
  }, []);

  const removeRow = useCallback((rowId: string) => {
    if (formRows.length <= 1) {
      toast.error('Deve haver pelo menos uma linha no formulário');
      return;
    }
    
    // Remover campos da linha
    const fieldsToRemove = formFields.filter(field => field.rowId === rowId);
    const remainingFields = formFields.filter(field => field.rowId !== rowId);
    
    setFormFields(remainingFields);
    setFormRows(prev => prev.filter(row => row.id !== rowId));
    setHasUnsavedChanges(true);
    
    if (fieldsToRemove.length > 0) {
      toast.info(`${fieldsToRemove.length} campo(s) removido(s) junto com a linha`);
    }
    toast.success('Linha removida!');
  }, [formRows, formFields]);

  const updateRowColumns = useCallback((rowId: string, columns: number) => {
    setFormRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const newColumnWidths = Array(columns).fill('1fr');
        // Preservar larguras existentes quando possível
        for (let i = 0; i < Math.min(columns, row.columnWidths.length); i++) {
          newColumnWidths[i] = row.columnWidths[i];
        }
        return { ...row, columns, columnWidths: newColumnWidths };
      }
      return row;
    }));
    
    // Ajustar campos que excedem o novo número de colunas
    setFormFields(prev => prev.map(field => {
      if (field.rowId === rowId && field.column >= columns) {
        return { ...field, column: columns - 1 };
      }
      return field;
    }));
    
    setHasUnsavedChanges(true);
    toast.success(`Linha atualizada para ${columns} coluna${columns > 1 ? 's' : ''}!`);
  }, []);

  const updateRowHeight = useCallback((rowId: string, height: string) => {
    setFormRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, height } : row
    ));
    setHasUnsavedChanges(true);
    toast.success('Altura da linha atualizada!');
  }, []);

  const updateColumnWidth = useCallback((rowId: string, columnIndex: number, width: string) => {
    setFormRows(prev => prev.map(row => {
      if (row.id === rowId) {
        const newColumnWidths = [...row.columnWidths];
        newColumnWidths[columnIndex] = width;
        return { ...row, columnWidths: newColumnWidths };
      }
      return row;
    }));
    setHasUnsavedChanges(true);
    toast.success(`Largura da coluna ${columnIndex + 1} atualizada!`);
  }, []);

  // ==================== FUNÇÕES DE DRAG AND DROP ====================

  const handleDragStart = useCallback((e: React.DragEvent, field: any, isNewField: boolean = false) => {
    setDraggedField({ ...field, isNewField });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, rowId: string, column: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
    setSelectedRow(rowId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
    setSelectedRow(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRowId: string, targetColumn: number) => {
    e.preventDefault();
    setDragOverColumn(null);
    setSelectedRow(null);
    
    if (!draggedField) {
      setDraggedField(null);
      return;
    }
    
    const targetRowIndex = formRows.findIndex(r => r.id === targetRowId);
    
    if (draggedField.isNewField) {
      // Adicionando novo campo
      const newField: FormField = {
        id: `field_${Date.now()}`,
        type: draggedField.type,
        label: `Campo ${draggedField.label || draggedField.type}`,
        required: false,
        placeholder: draggedField.type === 'textarea' ? 'Digite sua resposta aqui...' : 'Digite aqui...',
        options: draggedField.type === 'select' || draggedField.type === 'radio' ? ['Opção 1', 'Opção 2'] : undefined,
        rowId: targetRowId,
        rowIndex: targetRowIndex,
        column: targetColumn,
        width: 1,
        validation: {
          minLength: draggedField.type === 'text' || draggedField.type === 'textarea' ? 0 : undefined,
          maxLength: draggedField.type === 'text' || draggedField.type === 'textarea' ? 255 : undefined,
          min: draggedField.type === 'number' ? 0 : undefined,
          max: draggedField.type === 'number' ? 100 : undefined
        }
      };
      
      setFormFields(prev => [...prev, newField]);
      setSelectedField(newField);
      setHasUnsavedChanges(true);
      toast.success(`Campo ${draggedField.label || draggedField.type} adicionado!`);
    } else {
      // Movendo campo existente
      setFormFields(prev => prev.map(field => {
        if (field.id === draggedField.id) {
          return {
            ...field,
            rowId: targetRowId,
            rowIndex: targetRowIndex,
            column: targetColumn
          };
        }
        return field;
      }));
      setHasUnsavedChanges(true);
      toast.success('Campo movido!');
    }
    
    setDraggedField(null);
  }, [draggedField, formRows]);

  // ==================== FUNÇÕES DE EDIÇÃO DE CAMPOS ====================

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFormFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(prev => prev ? { ...prev, ...updates } : null);
    }
    
    setHasUnsavedChanges(true);
  }, [selectedField]);

  const deleteField = useCallback((fieldId: string) => {
    setFormFields(prev => prev.filter(field => field.id !== fieldId));
    
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(null);
    }
    
    setHasUnsavedChanges(true);
    toast.success('Campo removido!');
  }, [selectedField]);

  const clearCanvas = useCallback(() => {
    if (window.confirm('Deseja limpar todo o canvas? Esta ação não pode ser desfeita.')) {
      setFormFields([]);
      setFormRows([]);
      setSelectedField(null);
      setHasUnsavedChanges(true);
      toast.success('Canvas limpo!');
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl transition-all duration-300 ${
        isMaximized 
          ? 'w-full h-full max-w-none max-h-none rounded-none' 
          : 'w-[95vw] h-[95vh] max-w-7xl'
      }`}>
        
        {/* Header do Modal */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl shadow-lg">
              <Settings2 className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {mode === 'create' ? 'Criar Novo' : 'Editar'} - Alex Process Designer Enhanced
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Form Builder com Canvas Dinâmico • Linhas e Colunas Ajustáveis • Drag & Drop
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              v4.2.0 Canvas Dinâmico
            </Badge>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Não salvo
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restaurar" : "Maximizar"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Navegação das Camadas */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6">
            <Tabs value={activeLayer} onValueChange={(value) => setActiveLayer(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="form" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Form Builder</span>
                  <span className="sm:hidden">Forms</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  <span className="hidden sm:inline">Workflow Engine</span>
                  <span className="sm:hidden">Workflow</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Charts</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">Reports</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  <span className="hidden sm:inline">Integrations</span>
                  <span className="sm:hidden">APIs</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Conteúdo das Camadas */}
        <div className="flex-1 p-6 overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
          <Tabs value={activeLayer} className="w-full h-full">
            {/* ETAPA 1: Form Builder com Canvas Dinâmico */}
            <TabsContent value="form" className="space-y-6 h-full">
              <div className="flex h-full gap-6">
                
                {/* Biblioteca de Componentes */}
                <div className="w-64 flex-shrink-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Boxes className="h-4 w-4" />
                        Biblioteca de Campos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto">
                      <div className="space-y-4">
                        
                        {/* Controles do Canvas */}
                        <div className="border-b pb-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                            Controles do Canvas
                          </h4>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewRow(2)}
                              className="w-full justify-start"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Nova Linha (2 cols)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewRow(3)}
                              className="w-full justify-start"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Nova Linha (3 cols)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addNewRow(4)}
                              className="w-full justify-start"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Nova Linha (4 cols)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearCanvas}
                              className="w-full justify-start"
                            >
                              <RotateCcw className="h-3 w-3 mr-2" />
                              Limpar Canvas
                            </Button>
                          </div>
                        </div>
                        
                        {/* Campos Básicos */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Campos Básicos
                          </h4>
                          <div className="space-y-1">
                            {fieldTypes.basic.map((field, index) => (
                              <div
                                key={index}
                                className="p-1.5 border rounded cursor-grab active:cursor-grabbing transition-colors flex items-center gap-1.5 hover:bg-white dark:hover:bg-gray-800"
                                draggable
                                onDragStart={(e) => handleDragStart(e, field, true)}
                              >
                                <field.icon className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                <span className="text-xs font-medium truncate">{field.label}</span>
                                <div className="text-xs text-muted-foreground">
                                  ☰
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Campos Avançados */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Campos Avançados
                          </h4>
                          <div className="space-y-1">
                            {fieldTypes.advanced.map((field, index) => (
                              <div
                                key={index}
                                className="p-1.5 border rounded cursor-grab active:cursor-grabbing transition-colors flex items-center gap-1.5 hover:bg-white dark:hover:bg-gray-800"
                                draggable
                                onDragStart={(e) => handleDragStart(e, field, true)}
                              >
                                <field.icon className="h-3 w-3 text-purple-600 flex-shrink-0" />
                                <span className="text-xs font-medium truncate">{field.label}</span>
                                <div className="text-xs text-muted-foreground">
                                  ☰
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Canvas de Edição */}
                <div className="flex-1 flex">
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                      <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 shadow-sm">
                        {/* Header do Formulário */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">Formulário Dinâmico</h3>
                              <p className="text-muted-foreground">Canvas com linhas e colunas ajustáveis</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => addNewRow(2)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Nova Linha
                              </Button>
                              <div className="text-xs text-muted-foreground">
                                {formRows.length} linha{formRows.length !== 1 ? 's' : ''} • {formFields.length} campo{formFields.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Canvas Vazio ou com Conteúdo */}
                        {formFields.length === 0 && formRows.length === 0 ? (
                          <div 
                            className={`text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${
                              draggedField ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h4 className="text-lg font-medium mb-2">Canvas Vazio</h4>
                            <p className="text-sm mb-4">
                              {draggedField ? 'Solte o campo aqui para começar' : 'Adicione uma linha para começar a criar seu formulário'}
                            </p>
                            <div className="space-y-2">
                              <Button onClick={() => addNewRow(2)} variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Primeira Linha (2 colunas)
                              </Button>
                              <div className="text-xs text-muted-foreground">
                                Ou arraste campos da biblioteca
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Renderizar linhas */}
                            {formRows.map((row, rowIndex) => {
                              const rowFields = formFields.filter(field => field.rowId === row.id);
                              
                              return (
                                <div key={row.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                  {/* Header da Linha */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-medium">Linha {rowIndex + 1}</h4>
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        {row.columns}col
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs">Cols:</Label>
                                        <Select 
                                          value={row.columns.toString()} 
                                          onValueChange={(value) => updateRowColumns(row.id, parseInt(value))}
                                        >
                                          <SelectTrigger className="w-12 h-6">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Label className="text-xs">Alt:</Label>
                                        <Select 
                                          value={row.height} 
                                          onValueChange={(value) => updateRowHeight(row.id, value)}
                                        >
                                          <SelectTrigger className="w-16 h-6">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="auto">Auto</SelectItem>
                                            <SelectItem value="small">Pequena</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="large">Grande</SelectItem>
                                            <SelectItem value="xl">Extra</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => removeRow(row.id)}
                                        disabled={formRows.length <= 1}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Grid de Colunas da Linha */}
                                  <div 
                                    className={`grid gap-2 ${
                                      row.height === 'small' ? 'min-h-12' :
                                      row.height === 'medium' ? 'min-h-20' :
                                      row.height === 'large' ? 'min-h-32' :
                                      row.height === 'xl' ? 'min-h-48' :
                                      'min-h-16' // auto
                                    }`}
                                    style={{ gridTemplateColumns: row.columnWidths.join(' ') }}
                                  >
                                    {Array.from({ length: row.columns }, (_, columnIndex) => {
                                      const columnFields = rowFields.filter(field => field.column === columnIndex);
                                      
                                      return (
                                        <div 
                                          key={`${row.id}-${columnIndex}`}
                                          className={`min-h-16 border-2 border-dashed rounded p-1.5 transition-colors ${
                                            dragOverColumn === columnIndex && selectedRow === row.id
                                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                              : 'border-gray-300 dark:border-gray-600'
                                          }`}
                                          onDragOver={(e) => handleDragOver(e, row.id, columnIndex)}
                                          onDragLeave={handleDragLeave}
                                          onDrop={(e) => handleDrop(e, row.id, columnIndex)}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <div className="text-xs text-muted-foreground">
                                              {columnIndex + 1}
                                            </div>
                                            <Select 
                                              value={row.columnWidths[columnIndex] || '1fr'} 
                                              onValueChange={(value) => updateColumnWidth(row.id, columnIndex, value)}
                                            >
                                              <SelectTrigger className="w-12 h-4 text-xs">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="auto">Auto</SelectItem>
                                                <SelectItem value="1fr">1fr</SelectItem>
                                                <SelectItem value="2fr">2fr</SelectItem>
                                                <SelectItem value="3fr">3fr</SelectItem>
                                                <SelectItem value="200px">200px</SelectItem>
                                                <SelectItem value="300px">300px</SelectItem>
                                                <SelectItem value="400px">400px</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                  
                                          <div className="space-y-1">
                                            {columnFields.length === 0 ? (
                                              <div className="text-center py-2 text-muted-foreground">
                                                <div className="text-xs">Drop aqui</div>
                                              </div>
                                            ) : (
                                              columnFields.map((field) => (
                                                <div 
                                                  key={field.id} 
                                                  className={`p-1.5 border rounded cursor-pointer transition-all group ${
                                                    selectedField?.id === field.id 
                                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                  }`}
                                                  draggable
                                                  onDragStart={(e) => handleDragStart(e, field, false)}
                                                  onClick={() => setSelectedField(field)}
                                                >
                                                  <div className="flex items-center justify-between mb-1">
                                                    <Label className="font-medium text-xs truncate">{field.label}</Label>
                                                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        className="h-4 w-4 p-0"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedField(field);
                                                        }}
                                                      >
                                                        <Edit className="h-2 w-2" />
                                                      </Button>
                                                      <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        className="h-4 w-4 p-0"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          deleteField(field.id);
                                                        }}
                                                      >
                                                        <Trash2 className="h-2 w-2" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                          
                                                  {/* Preview do Campo */}
                                                  <div className="pointer-events-none">
                                                    {field.type === 'text' && (
                                                      <Input placeholder={field.placeholder || 'Digite...'} disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'textarea' && (
                                                      <Textarea placeholder={field.placeholder || 'Digite...'} disabled rows={1} className="text-xs h-6 resize-none" />
                                                    )}
                                                    {field.type === 'number' && (
                                                      <Input type="number" placeholder="0" disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'date' && (
                                                      <Input type="date" disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'time' && (
                                                      <Input type="time" disabled className="text-xs h-6" />
                                                    )}
                                                    {field.type === 'select' && (
                                                      <Select disabled>
                                                        <SelectTrigger className="text-xs h-6">
                                                          <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                      </Select>
                                                    )}
                                                    {field.type === 'checkbox' && (
                                                      <div className="flex items-center space-x-1">
                                                        <input type="checkbox" disabled className="scale-75" />
                                                        <Label className="text-xs">Opção</Label>
                                                      </div>
                                                    )}
                                                    {field.type === 'radio' && (
                                                      <div className="flex items-center space-x-1">
                                                        <input type="radio" disabled className="scale-75" />
                                                        <Label className="text-xs">Opção 1</Label>
                                                      </div>
                                                    )}
                                                    {field.type === 'file' && (
                                                      <div className="border border-dashed border-gray-300 rounded p-1 text-center">
                                                        <Upload className="h-3 w-3 mx-auto text-gray-400" />
                                                        <div className="text-xs text-gray-500">Arquivo</div>
                                                      </div>
                                                    )}
                                                    {field.type === 'rating' && (
                                                      <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                          <Star key={i} className="h-3 w-3 text-gray-300" />
                                                        ))}
                                                      </div>
                                                    )}
                                                    {field.type === 'slider' && (
                                                      <div className="py-1">
                                                        <input type="range" disabled className="w-full h-1" />
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                                                    <span>Tipo: {field.type}</span>
                                                    <div className="flex items-center gap-1">
                                                      {field.required && <Badge variant="secondary" className="text-xs px-1 py-0">Req</Badge>}
                                                      <span className="text-xs">☰</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Painel de Propriedades */}
                <div className="w-64 flex-shrink-0">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Propriedades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto">
                      {selectedField ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs">Label do Campo</Label>
                            <Input
                              value={selectedField.label}
                              onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs">Placeholder</Label>
                            <Input
                              value={selectedField.placeholder || ''}
                              onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="required"
                              checked={selectedField.required}
                              onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="required" className="text-xs">Campo obrigatório</Label>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteField(selectedField.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover Campo
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Selecione um campo no canvas para editar suas propriedades
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Outras camadas mantidas como estavam */}
            <TabsContent value="workflow" className="space-y-6 h-full">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Workflow Engine</h3>
                  <p className="text-sm">Em desenvolvimento...</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6 h-full">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Analytics</h3>
                  <p className="text-sm">Em desenvolvimento...</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-6 h-full">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Reports</h3>
                  <p className="text-sm">Em desenvolvimento...</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="integrations" className="space-y-6 h-full">
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Integrations</h3>
                  <p className="text-sm">Em desenvolvimento...</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AlexProcessDesignerEnhancedModal;