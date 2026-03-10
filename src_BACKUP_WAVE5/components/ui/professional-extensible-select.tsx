// ============================================================================
// COMPONENTE PROFISSIONAL DE SELECT EXTENSÍVEL
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Search, X, Check, ChevronDown, Building2, Briefcase, Shield, AlertTriangle, Zap } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
    searchPlaceholder: 'Buscar departamentos...',
    emptyMessage: 'Nenhum departamento encontrado',
    color: 'blue'
  },
  jobTitles: {
    icon: Briefcase,
    label: 'Cargo',
    addLabel: 'Adicionar Novo Cargo',
    placeholder: 'Selecione um cargo...',
    searchPlaceholder: 'Buscar cargos...',
    emptyMessage: 'Nenhum cargo encontrado',
    color: 'green'
  },
  complianceFrameworks: {
    icon: Shield,
    label: 'Framework',
    addLabel: 'Adicionar Novo Framework',
    placeholder: 'Selecione um framework...',
    searchPlaceholder: 'Buscar frameworks...',
    emptyMessage: 'Nenhum framework encontrado',
    color: 'purple'
  },
  riskCategories: {
    icon: AlertTriangle,
    label: 'Categoria de Risco',
    addLabel: 'Adicionar Nova Categoria',
    placeholder: 'Selecione uma categoria...',
    searchPlaceholder: 'Buscar categorias...',
    emptyMessage: 'Nenhuma categoria encontrada',
    color: 'orange'
  },
  incidentTypes: {
    icon: Zap,
    label: 'Tipo de Incidente',
    addLabel: 'Adicionar Novo Tipo',
    placeholder: 'Selecione um tipo...',
    searchPlaceholder: 'Buscar tipos...',
    emptyMessage: 'Nenhum tipo encontrado',
    color: 'red'
  }
} as const;

export const ProfessionalExtensibleSelect: React.FC<ExtensibleSelectProps> = ({
  value,
  onValueChange,
  type,
  placeholder,
  disabled = false,
  className,
  allowClear = true,
  showDescription = true,
  maxItems = 100,
  canAddNew = true,
  hasAddPermission = true,
  validateNewItem,
  onItemAdded,
  onItemUpdated,
  onItemDeleted
}) => {
  // Store
  const { getItems, addItem, searchItems } = useDropdownStore();
  
  // Estado local
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Configuração do tipo
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  // Dados filtrados
  const allItems = useMemo(() => getItems(type), [getItems, type]);
  
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allItems.slice(0, maxItems);
    }
    return searchItems(type, searchQuery).slice(0, maxItems);
  }, [allItems, searchItems, type, searchQuery, maxItems]);

  // Item selecionado
  const selectedItem = useMemo(() => {
    return allItems.find(item => item.id === value);
  }, [allItems, value]);

  // Handlers
  const handleSelect = useCallback((itemId: string) => {
    if (itemId === '__add_new__') {
      if (canAddNew && hasAddPermission) {
        setShowAddDialog(true);
      } else {
        toast.error('Você não tem permissão para adicionar novos itens');
      }
    } else {
      onValueChange(itemId);
      setOpen(false);
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
      
      toast.success(`${config.label} adicionado com sucesso`);
      
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
      setOpen(false);
      
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

  // Render do item
  const renderItem = useCallback((item: ExtensibleDropdownItem) => (
    <div className="flex items-start gap-3 py-1">
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
  ), [Icon, showDescription, type]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-[40px] px-3 py-2",
              !selectedItem && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedItem ? (
                <>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="truncate font-medium">{selectedItem.label}</div>
                    {showDescription && selectedItem.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {selectedItem.description}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {placeholder || config.placeholder}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {allowClear && selectedItem && (
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
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={config.searchPlaceholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>{config.emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Check
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        {renderItem(item)}
                      </div>
                    </div>
                  </CommandItem>
                ))}
                
                {/* Opção "Adicionar Novo" */}
                {canAddNew && hasAddPermission && (
                  <>
                    <Separator className="my-1" />
                    <CommandItem
                      value="__add_new__"
                      onSelect={handleSelect}
                      className="cursor-pointer text-primary"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Plus className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{config.addLabel}</span>
                      </div>
                    </CommandItem>
                  </>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

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