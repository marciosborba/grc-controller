// ============================================================================
// HOOKS PARA DROPDOWNS EXTENSÍVEIS
// ============================================================================

import { useCallback, useMemo } from 'react';
import { useDropdownStore } from '@/stores/dropdownStore';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownStore, AddItemRequest, ExtensibleDropdownItem } from '@/types/extensible-dropdowns';

// Hook genérico para qualquer tipo de dropdown
export const useExtensibleDropdown = (type: keyof DropdownStore) => {
  const { user } = useAuth();
  const { getItems, addItem, updateItem, deleteItem, searchItems } = useDropdownStore();

  const items = useMemo(() => getItems(type), [getItems, type]);

  const canAdd = useMemo(() => {
    if (!user) return false;
    return user.permissions?.includes('admin') || 
           user.permissions?.includes(`${type}.create`) ||
           user.roles?.includes('admin') ||
           user.isPlatformAdmin;
  }, [user, type]);

  const canEdit = useMemo(() => {
    if (!user) return false;
    return user.permissions?.includes('admin') || 
           user.permissions?.includes(`${type}.update`) ||
           user.roles?.includes('admin') ||
           user.isPlatformAdmin;
  }, [user, type]);

  const canDelete = useMemo(() => {
    if (!user) return false;
    return user.permissions?.includes('admin') || 
           user.permissions?.includes(`${type}.delete`) ||
           user.roles?.includes('admin') ||
           user.isPlatformAdmin;
  }, [user, type]);

  const addNewItem = useCallback(async (request: AddItemRequest) => {
    if (!canAdd) {
      throw new Error('Sem permissão para adicionar itens');
    }
    return await addItem(type, request);
  }, [addItem, type, canAdd]);

  const updateExistingItem = useCallback(async (id: string, updates: Partial<ExtensibleDropdownItem>) => {
    if (!canEdit) {
      throw new Error('Sem permissão para editar itens');
    }
    return await updateItem(type, id, updates);
  }, [updateItem, type, canEdit]);

  const deleteExistingItem = useCallback(async (id: string) => {
    if (!canDelete) {
      throw new Error('Sem permissão para deletar itens');
    }
    return await deleteItem(type, id);
  }, [deleteItem, type, canDelete]);

  const searchForItems = useCallback((query: string) => {
    return searchItems(type, query);
  }, [searchItems, type]);

  const validateNewItem = useCallback((label: string): string | null => {
    if (!label.trim()) {
      return 'Nome é obrigatório';
    }

    if (label.trim().length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }

    if (label.trim().length > 100) {
      return 'Nome deve ter no máximo 100 caracteres';
    }

    // Verificar duplicatas
    const exists = items.some(item => 
      item.label.toLowerCase() === label.trim().toLowerCase()
    );
    
    if (exists) {
      return 'Este item já existe';
    }

    // Validações específicas por tipo
    switch (type) {
      case 'departments':
        if (!/^[a-zA-ZÀ-ÿ\s\-&()]+$/.test(label.trim())) {
          return 'Nome do departamento contém caracteres inválidos';
        }
        break;
      case 'jobTitles':
        if (!/^[a-zA-ZÀ-ÿ\s\-&()\/]+$/.test(label.trim())) {
          return 'Nome do cargo contém caracteres inválidos';
        }
        break;
      case 'complianceFrameworks':
        if (!/^[a-zA-Z0-9À-ÿ\s\-&()\/\.]+$/.test(label.trim())) {
          return 'Nome do framework contém caracteres inválidos';
        }
        break;
    }

    return null;
  }, [items, type]);

  return {
    items,
    canAdd,
    canEdit,
    canDelete,
    addNewItem,
    updateExistingItem,
    deleteExistingItem,
    searchForItems,
    validateNewItem,
    isLoading: false, // Como estamos usando store local, não há loading
    error: null
  };
};

// Hooks específicos para cada tipo
export const useDepartmentOptions = () => {
  return useExtensibleDropdown('departments');
};

export const useJobTitleOptions = () => {
  return useExtensibleDropdown('jobTitles');
};

export const useComplianceFrameworkOptions = () => {
  return useExtensibleDropdown('complianceFrameworks');
};

export const useRiskCategoryOptions = () => {
  return useExtensibleDropdown('riskCategories');
};

export const useIncidentTypeOptions = () => {
  return useExtensibleDropdown('incidentTypes');
};

// Hook para estatísticas e métricas
export const useDropdownStats = () => {
  const { exportData } = useDropdownStore();

  const stats = useMemo(() => {
    const data = exportData();
    
    return {
      departments: {
        total: data.departments.length,
        active: data.departments.filter(d => d.isActive).length
      },
      jobTitles: {
        total: data.jobTitles.length,
        active: data.jobTitles.filter(j => j.isActive).length
      },
      complianceFrameworks: {
        total: data.complianceFrameworks.length,
        active: data.complianceFrameworks.filter(f => f.isActive).length
      },
      riskCategories: {
        total: data.riskCategories.length,
        active: data.riskCategories.filter(r => r.isActive).length
      },
      incidentTypes: {
        total: data.incidentTypes.length,
        active: data.incidentTypes.filter(i => i.isActive).length
      }
    };
  }, [exportData]);

  return stats;
};

// Hook para gerenciamento de dados
export const useDropdownManagement = () => {
  const { initializeDefaults, clearAll, exportData, importData } = useDropdownStore();

  const resetToDefaults = useCallback(() => {
    clearAll();
    initializeDefaults();
  }, [clearAll, initializeDefaults]);

  const exportAllData = useCallback(() => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dropdown-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportData]);

  const importFromFile = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          importData(data);
          resolve();
        } catch (error) {
          reject(new Error('Arquivo inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }, [importData]);

  return {
    resetToDefaults,
    exportAllData,
    importFromFile,
    initializeDefaults,
    clearAll
  };
};