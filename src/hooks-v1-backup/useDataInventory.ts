import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DataInventory, 
  DataInventoryForm,
  PrivacyFilters,
  PrivacySort,
  PrivacyComponentState
} from '@/types/privacy-management';

export function useDataInventory() {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<DataInventory[]>([]);
  const [state, setState] = useState<PrivacyComponentState>({
    loading: false,
    error: null,
    filters: {},
    sort: { field: 'created_at', direction: 'desc' },
    pagination: { page: 1, limit: 20, total: 0 }
  });

  // ============================================================================
  // INVENTORY MANAGEMENT
  // ============================================================================

  const fetchInventoryItems = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let query = supabase
        .from('data_inventory')
        .select('*');

      // Apply filters
      if (state.filters.status && state.filters.status.length > 0) {
        query = query.in('status', state.filters.status);
      }

      if (state.filters.sensitivity_level && state.filters.sensitivity_level.length > 0) {
        query = query.in('sensitivity_level', state.filters.sensitivity_level);
      }

      if (state.filters.data_category && state.filters.data_category.length > 0) {
        query = query.in('data_category', state.filters.data_category);
      }

      if (state.filters.assigned_to && state.filters.assigned_to.length > 0) {
        query = query.in('data_steward_id', state.filters.assigned_to);
      }

      // Apply sorting
      query = query.order(state.sort.field, { ascending: state.sort.direction === 'asc' });

      // Apply pagination
      const from = (state.pagination.page - 1) * state.pagination.limit;
      const to = from + state.pagination.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setInventoryItems(data || []);
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, total: count || 0 },
        loading: false
      }));

    } catch (error: any) {
      console.error('Error fetching inventory items:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao carregar inventário de dados',
        loading: false
      }));
    }
  }, [user, state.filters, state.sort, state.pagination.page, state.pagination.limit]);

  const createInventoryItem = useCallback(async (itemData: DataInventoryForm) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('data_inventory')
        .insert({
          ...itemData,
          created_by: user.id,
          updated_by: user.id
        })
        .select('*')
        .single();

      if (error) throw error;

      // Atualizar lista de itens
      setInventoryItems(prev => [data, ...prev]);

      setState(prev => ({ ...prev, loading: false }));

      return { success: true, data };

    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao criar item do inventário',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  const updateInventoryItem = useCallback(async (id: string, updates: Partial<DataInventoryForm>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('data_inventory')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      // Atualizar lista de itens
      setInventoryItems(prev => prev.map(item => item.id === id ? data : item));

      setState(prev => ({ ...prev, loading: false }));

      return { success: true, data };

    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao atualizar item do inventário',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase
        .from('data_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remover da lista de itens
      setInventoryItems(prev => prev.filter(item => item.id !== id));

      setState(prev => ({ ...prev, loading: false }));

      return { success: true };

    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao deletar item do inventário',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  // ============================================================================
  // REVIEW MANAGEMENT
  // ============================================================================

  const markAsReviewed = useCallback(async (id: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      // Calcular próxima data de revisão (12 meses por padrão)
      const nextReviewDate = new Date();
      nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

      const result = await updateInventoryItem(id, {
        last_reviewed_at: new Date().toISOString(),
        next_review_date: nextReviewDate.toISOString().split('T')[0]
      } as any);

      return result;

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updateInventoryItem]);

  const bulkMarkAsReviewed = useCallback(async (itemIds: string[]) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const nextReviewDate = new Date();
      nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

      const { data, error } = await supabase
        .from('data_inventory')
        .update({
          last_reviewed_at: new Date().toISOString(),
          next_review_date: nextReviewDate.toISOString().split('T')[0],
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .in('id', itemIds)
        .select('*');

      if (error) throw error;

      // Atualizar lista de itens
      setInventoryItems(prev => prev.map(item => {
        const updated = data.find(d => d.id === item.id);
        return updated || item;
      }));

      setState(prev => ({ ...prev, loading: false }));

      return { success: true, data };

    } catch (error: any) {
      console.error('Error bulk updating inventory items:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao atualizar itens',
        loading: false
      }));

      return { success: false, error: error.message };
    }
  }, [user]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const setFilters = useCallback((filters: PrivacyFilters) => {
    setState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, page: 1 } // Reset to first page when filtering
    }));
  }, []);

  const setSort = useCallback((sort: PrivacySort) => {
    setState(prev => ({ ...prev, sort }));
  }, []);

  const setPagination = useCallback((page: number, limit?: number) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page,
        limit: limit || prev.pagination.limit
      }
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Estatísticas do inventário
  const getInventoryStats = useCallback(async () => {
    try {
      // Get real count from database
      const { count: totalItems, error: countError } = await supabase
        .from('data_inventory')
        .select('*', { count: 'exact', head: true });

      if (countError || !totalItems) {
        // Return zero stats if table not accessible or empty
        return {
          totalItems: 0,
          activeItems: 0,
          criticalItems: 0,
          highSensitivityItems: 0,
          needsReview: 0,
          overdueReview: 0,
          totalVolume: 0,
          byCategory: {},
          bySensitivity: {}
        };
      }

      // If we have data, try to get detailed stats
      const { data, error } = await supabase
        .from('data_inventory')
        .select('status, sensitivity_level, next_review_date, estimated_volume, data_category');

      if (error || !data) {
        // Return basic stats with just the count
        return {
          totalItems,
          activeItems: 0,
          criticalItems: 0,
          highSensitivityItems: 0,
          needsReview: 0,
          overdueReview: 0,
          totalVolume: 0,
          byCategory: {},
          bySensitivity: {}
        };
      }

      const activeItems = data.filter(item => item.status === 'active').length;
      const criticalItems = data.filter(item => item.sensitivity_level === 'critica').length;
      const highSensitivityItems = data.filter(item => 
        item.sensitivity_level === 'alta' || item.sensitivity_level === 'critica'
      ).length;
    
      // Itens que precisam de revisão (próximos 30 dias)
      const needsReview = data.filter(item => {
        if (!item.next_review_date) return false;
        const reviewDate = new Date(item.next_review_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return reviewDate <= thirtyDaysFromNow;
      }).length;

      // Itens vencidos (revisão em atraso)
      const overdueReview = data.filter(item => {
        if (!item.next_review_date) return false;
        const reviewDate = new Date(item.next_review_date);
        return reviewDate < new Date();
      }).length;

      // Volume total estimado
      const totalVolume = data.reduce((sum, item) => sum + (item.estimated_volume || 0), 0);

      // Distribuição por categoria
      const byCategory: Record<string, number> = {};
      data.forEach(item => {
        if (item.data_category) {
          byCategory[item.data_category] = (byCategory[item.data_category] || 0) + 1;
        }
      });

      // Distribuição por sensibilidade
      const bySensitivity: Record<string, number> = {};
      data.forEach(item => {
        if (item.sensitivity_level) {
          bySensitivity[item.sensitivity_level] = (bySensitivity[item.sensitivity_level] || 0) + 1;
        }
      });
      
      return {
        totalItems,
        activeItems,
        criticalItems,
        highSensitivityItems,
        needsReview,
        overdueReview,
        totalVolume,
        byCategory,
        bySensitivity
      };

    } catch (error) {
      console.error('Error calculating inventory stats:', error);
      return {
        totalItems: 0,
        activeItems: 0,
        criticalItems: 0,
        highSensitivityItems: 0,
        needsReview: 0,
        overdueReview: 0,
        totalVolume: 0,
        byCategory: {},
        bySensitivity: {}
      };
    }
  }, []);

  // Buscar itens que precisam de revisão
  const getItemsNeedingReview = useCallback(() => {
    return inventoryItems.filter(item => {
      if (!item.next_review_date || item.status !== 'active') return false;
      const reviewDate = new Date(item.next_review_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return reviewDate <= thirtyDaysFromNow;
    }).sort((a, b) => 
      new Date(a.next_review_date!).getTime() - new Date(b.next_review_date!).getTime()
    );
  }, [inventoryItems]);

  // Buscar itens por data steward
  const getItemsByDataSteward = useCallback((stewardId: string) => {
    return inventoryItems.filter(item => item.data_steward_id === stewardId);
  }, [inventoryItems]);

  return {
    // State
    inventoryItems,
    state,
    
    // Actions
    fetchInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    markAsReviewed,
    bulkMarkAsReviewed,
    
    // Utility
    setFilters,
    setSort,
    setPagination,
    clearError,
    getInventoryStats,
    getItemsNeedingReview,
    getItemsByDataSteward
  };
}