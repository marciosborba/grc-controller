// ============================================================================
// COMPONENTE SIMPLIFICADO DE SELECT EXTENSÍVEL
// ============================================================================
// Versão que funciona apenas com componentes básicos do shadcn/ui

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, X, ChevronDown, Building2, Briefcase, Shield, AlertTriangle, Zap } from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDropdownStore } from '@/stores/dropdownStore';
import { ExtensibleSelectProps, DropdownStore, ExtensibleDropdownItem } from '@/types/extensible-dropdowns';

// Configurações por tipo
const TYPE_CONFIG = {
  departments: {
    icon: Building2,
    label: 'Departamento',
    addLabel: 'Adicionar Novo Departamento',
    placeholder: 'Selecione um departamento...',
    color: 'blue'
  },
  jobTitles: {
    icon: Briefcase,
    label: 'Cargo',
    addLabel: 'Adicionar Novo Cargo',
    placeholder: 'Selecione um cargo...',
    color: 'green'
  },
  complianceFrameworks: {
    icon: Shield,
    label: 'Framework',
    addLabel: 'Adicionar Novo Framework',
    placeholder: 'Selecione um framework...',
    color: 'purple'
  },
  riskCategories: {
    icon: AlertTriangle,
    label: 'Categoria de Risco',
    addLabel: 'Adicionar Nova Categoria',
    placeholder: 'Selecione uma categoria...',
    color: 'orange'
  },
  incidentTypes: {
    icon: Zap,
    label: 'Tipo de Incidente',
    addLabel: 'Adicionar Novo Tipo',
    placeholder: 'Selecione um tipo...',
    color: 'red'
  }
} as const;

export const SimpleExtensibleSelect: React.FC<ExtensibleSelectProps> = ({
  value,
  onValueChange,
  type,
  placeholder,
  disabled = false,
  className,
  allowClear = true,
  showDescription = true,
  canAddNew = true,
  hasAddPermission = true,
  validateNewItem,
  onItemAdded
}) => {
  // Store
  const store = useDropdownStore();
  const { getItems, addItem } = store;
  
  // Estado local
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Configuração do tipo
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  // Dados - forçar re-render quando store muda
  const allItems = useMemo(() => {
    const items = getItems(type);
    console.log(`Itens carregados para ${type}:`, items.length);
    return items;
  }, [getItems, type, forceUpdate, store[type]]);

  // Item selecionado
  const selectedItem = useMemo(() => {
    return allItems.find(item => item.id === value);
  }, [allItems, value]);

  // Handlers
  const handleSelect = useCallback((itemValue: string) => {
    if (itemValue === '__add_new__') {
      if (canAddNew && hasAddPermission) {
        setShowAddDialog(true);
      } else {
        toast.error('Você não tem permissão para adicionar novos itens');
      }
    } else {
      onValueChange(itemValue);
    }
  }, [canAddNew, hasAddPermission, onValueChange]);

  const handleClear = useCallback(() => {
    onValueChange('');
  }, [onValueChange]);

  const handleAddNew = useCallback(async () => {
    if (!newItemLabel.trim()) {
      setValidationError('Nome é obrigatório');
      return;
    }

    // Validação customizada
    if (validateNewItem) {
      const error = validateNewItem(newItemLabel.trim());
      if (error) {
        setValidationError(error);
        return;
      }
    }

    // Verificar duplicatas
    const exists = allItems.some(item => 
      item.label.toLowerCase() === newItemLabel.trim().toLowerCase()
    );
    
    if (exists) {
      setValidationError('Este item já existe');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const newItem = await addItem(type, {
        label: newItemLabel.trim(),
        description: newItemDescription.trim() || undefined
      });
      
      console.log('Item criado com sucesso:', newItem);
      
      // Forçar atualização da lista
      setForceUpdate(prev => prev + 1);
      
      toast.success(`${config.label} adicionado com sucesso`);
      
      // Aguardar um pouco para garantir que o item foi adicionado
      setTimeout(() => {
        // Selecionar o novo item
        onValueChange(newItem.id);
        
        // Callback
        if (onItemAdded) {
          onItemAdded(newItem);
        }
        
        // Limpar e fechar
        setNewItemLabel('');
        setNewItemDescription('');
        setShowAddDialog(false);
      }, 200);
      
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error(`Erro ao adicionar ${config.label.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [newItemLabel, newItemDescription, validateNewItem, allItems, addItem, type, config.label, onValueChange, onItemAdded]);

  const handleCloseDialog = useCallback(() => {
    setShowAddDialog(false);
    setNewItemLabel('');
    setNewItemDescription('');
    setValidationError(null);
  }, []);

  return (
    <>
      <Select value={value} onValueChange={handleSelect} disabled={disabled}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder || config.placeholder}>
            {selectedItem ? (
              <div className="flex items-center gap-2 w-full">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="truncate font-medium">{selectedItem.label}</div>
                  {showDescription && selectedItem.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {selectedItem.description}
                    </div>
                  )}
                </div>
                {allowClear && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allItems.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              <div className="flex items-start gap-3 py-1 w-full">
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.label}</div>
                  {showDescription && item.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {item.description}
                    </div>
                  )}
                  {/* Metadata específica por tipo */}
                  {type === 'riskCategories' && 'color' in item && (
                    <div className="flex items-center gap-1 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-border" 
                        style={{ backgroundColor: item.color }}
                      />
                      <Badge variant="outline" className="text-xs">
                        {item.severity}
                      </Badge>
                    </div>
                  )}
                  {type === 'jobTitles' && 'level' in item && item.level && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {item.level}
                    </Badge>
                  )}
                  {type === 'complianceFrameworks' && 'version' in item && (
                    <Badge variant="outline" className="text-xs mt-1">
                      v{item.version}
                    </Badge>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
          
          {/* Opção "Adicionar Novo" */}
          {canAddNew && hasAddPermission && (
            <>
              <Separator className="my-1" />
              <SelectItem value="__add_new__" className="text-primary font-medium">
                <div className="flex items-center gap-2 w-full">
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span>{config.addLabel}</span>
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      {/* Dialog para adicionar novo item */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {config.addLabel}
            </DialogTitle>
            <DialogDescription>
              Crie um novo {config.label.toLowerCase()} para usar no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newItemLabel}
                onChange={(e) => {
                  setNewItemLabel(e.target.value);
                  setValidationError(null);
                }}
                placeholder={`Digite o nome do ${config.label.toLowerCase()}`}
                className={validationError ? 'border-red-500' : ''}
                autoFocus
              />
              {validationError && (
                <p className="text-sm text-red-500 mt-1">{validationError}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Breve descrição (opcional)"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddNew}
              disabled={isSubmitting || !newItemLabel.trim()}
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};