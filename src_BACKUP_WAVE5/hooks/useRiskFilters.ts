import { useState } from 'react';
import type { RiskFilters } from '@/types/risk-management';

export const useRiskFilters = () => {
  const [filters, setFilters] = useState<RiskFilters>({
    searchTerm: '',
    categories: [],
    levels: [],
    statuses: [],
    owners: [],
    showOverdue: false
  });

  const updateFilters = (newFilters: Partial<RiskFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      categories: [],
      levels: [],
      statuses: [],
      owners: [],
      showOverdue: false
    });
  };

  return {
    filters,
    setFilters: updateFilters,
    clearFilters
  };
};