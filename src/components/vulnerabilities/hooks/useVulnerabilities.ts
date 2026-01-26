import { useState, useEffect, useCallback, useRef } from 'react';
import { Vulnerability, VulnerabilityFilter, VulnerabilityMetrics } from '../types/vulnerability';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Temporary test client - reverting to normal supabase client
// The service role key in .env has example values, so let's use the normal client
// and check if RLS is the issue
import { toast } from 'sonner';

interface UseVulnerabilitiesOptions {
  filters?: VulnerabilityFilter;
  page?: number;
  limit?: number;
  sortBy?: keyof Vulnerability;
  sortOrder?: 'asc' | 'desc';
}

export const useVulnerabilities = (options: UseVulnerabilitiesOptions = {}) => {
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [metrics, setMetrics] = useState<VulnerabilityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [suppressToasts, setSuppressToasts] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const loadedTenantRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const {
    filters = {},
    page = 1,
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  // Load vulnerabilities with filters
  const loadVulnerabilities = useCallback(async () => {
    if (!effectiveTenantId) {
      console.log('❌ [HOOK] No effectiveTenantId, returning early');
      return;
    }

    console.log('🔍 [HOOK] Starting loadVulnerabilities with tenant:', effectiveTenantId);

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      console.log('🔄 [HOOK] Already loading, skipping...');
      return;
    }

    console.log('🔍 [HOOK] Loading vulnerabilities for tenant:', effectiveTenantId);
    isLoadingRef.current = true;

    // If we already know the table doesn't exist, don't try again (unless forced)
    if (tableExists === false && !forceRefresh) {
      setVulnerabilities([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    // Reset force refresh flag
    if (forceRefresh) {
      setForceRefresh(false);
      setTableExists(null);
      setInitialized(false);
      setAttemptCount(0);
      setSuppressToasts(false);
    }

    // If we've tried multiple times and failed, assume table doesn't exist
    if (attemptCount >= 3) {
      console.warn('Multiple attempts failed, assuming table does not exist');
      setTableExists(false);
      setInitialized(true);
      setSuppressToasts(true);
      setVulnerabilities([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setAttemptCount(prev => prev + 1);

    try {
      // Use normal supabase client (with RLS)
      let query = supabase
        .from('vulnerabilities')
        .select('*', { count: 'exact' })
        .eq('tenant_id', effectiveTenantId);

      // Apply filters
      if (filters.severity?.length) {
        query = query.in('severity', filters.severity);
      }
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.source_type?.length) {
        query = query.in('source_type', filters.source_type);
      }
      if (filters.asset_type?.length) {
        query = query.in('asset_type', filters.asset_type);
      }
      if (filters.assigned_to?.length) {
        query = query.in('assigned_to', filters.assigned_to);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,asset_name.ilike.%${filters.search}%`);
      }
      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.start.toISOString())
          .lte('created_at', filters.date_range.end.toISOString());
      }
      if (filters.cvss_range) {
        query = query
          .gte('cvss_score', filters.cvss_range.min)
          .lte('cvss_score', filters.cvss_range.max);
      }
      if (filters.sla_breach !== undefined) {
        query = query.eq('sla_breach', filters.sla_breach);
      }
      if (filters.overdue) {
        query = query.lt('due_date', new Date().toISOString());
      }

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      console.log('✅ [HOOK] Successfully loaded vulnerabilities:', {
        count: data?.length || 0,
        totalCount: count || 0,
        tenant: effectiveTenantId
      });

      setVulnerabilities(data || []);
      setTotalCount(count || 0);
      setTableExists(true);
      setInitialized(true);
      setAttemptCount(0); // Reset attempt count on success
      loadedTenantRef.current = effectiveTenantId;

      // Load metrics immediately after vulnerabilities are loaded
      console.log('📊 [HOOK] Triggering metrics load after vulnerabilities loaded');
      // Call loadMetrics directly since we have the data
      await loadMetrics();
    } catch (err) {
      console.error('Error loading vulnerabilities:', err);

      // Check if the error is due to table not existing
      const errorMessage = err instanceof Error ? err.message : String(err);

      // More comprehensive check for table not existing
      const tableNotExistsPatterns = [
        'relation "vulnerabilities" does not exist',
        'table "vulnerabilities" does not exist',
        'relation does not exist',
        'table does not exist',
        'does not exist',
        'relation "public.vulnerabilities" does not exist',
        'table "public.vulnerabilities" does not exist'
      ];

      const isTableNotExist = tableNotExistsPatterns.some(pattern =>
        errorMessage.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isTableNotExist) {
        console.warn('Vulnerabilities table does not exist in database');
        setTableExists(false);
        setInitialized(true);
        setSuppressToasts(true);
        setError('Vulnerabilities table not found. Please create the table in your database.');
        // Don't show toast error for missing table, just log it
      } else {
        setError(errorMessage);
        // Only show toast for non-table-missing errors and if not suppressed
        if (!suppressToasts) {
          toast.error('Failed to load vulnerabilities');
        }
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [effectiveTenantId, JSON.stringify(filters), page, limit, sortBy, sortOrder, tableExists, attemptCount, forceRefresh]);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    if (!effectiveTenantId) return;

    // If table existence is unknown or false, metrics might fail, but let's try the RPC
    // RPC is safer as it handles empty states internally

    try {
      console.log('📊 [HOOK] Loading metrics via RPC for tenant:', effectiveTenantId);

      const { data, error } = await supabase
        .rpc('get_vulnerability_metrics', { p_tenant_id: effectiveTenantId });

      if (error) throw error;

      console.log('✅ [HOOK] Metrics loaded via RPC:', {
        total: (data as any)?.total_vulnerabilities
      });

      setMetrics(data as VulnerabilityMetrics);
    } catch (err) {
      console.error('Error loading metrics:', err);
      // Graceful degradation handled by UI checks
    }
  }, [effectiveTenantId]);

  // Create vulnerability
  const createVulnerability = useCallback(async (vulnerability: Omit<Vulnerability, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!effectiveTenantId || !user) return null;

    try {
      const { data, error } = await supabase
        .from('vulnerabilities')
        .insert([{
          ...vulnerability,
          tenant_id: effectiveTenantId,
          created_by: user.id,
          updated_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Vulnerability created successfully');
      await loadVulnerabilities();
      await loadMetrics();

      return data;
    } catch (err) {
      console.error('Error creating vulnerability:', err);
      toast.error('Failed to create vulnerability');
      return null;
    }
  }, [effectiveTenantId, user, loadVulnerabilities, loadMetrics]);

  // Update vulnerability
  const updateVulnerability = useCallback(async (id: string, updates: Partial<Vulnerability>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('vulnerabilities')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Vulnerability updated successfully');
      await loadVulnerabilities();
      await loadMetrics();

      return true;
    } catch (err) {
      console.error('Error updating vulnerability:', err);
      toast.error('Failed to update vulnerability');
      return false;
    }
  }, [user, effectiveTenantId, loadVulnerabilities, loadMetrics]);

  // Delete vulnerability
  const deleteVulnerability = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('vulnerabilities')
        .delete()
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Vulnerability deleted successfully');
      await loadVulnerabilities();
      await loadMetrics();

      return true;
    } catch (err) {
      console.error('Error deleting vulnerability:', err);
      toast.error('Failed to delete vulnerability');
      return false;
    }
  }, [effectiveTenantId, loadVulnerabilities, loadMetrics]);

  // Bulk update vulnerabilities
  const bulkUpdateVulnerabilities = useCallback(async (ids: string[], updates: Partial<Vulnerability>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('vulnerabilities')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success(`${ids.length} vulnerabilities updated successfully`);
      await loadVulnerabilities();
      await loadMetrics();

      return true;
    } catch (err) {
      console.error('Error bulk updating vulnerabilities:', err);
      toast.error('Failed to update vulnerabilities');
      return false;
    }
  }, [user, effectiveTenantId, loadVulnerabilities, loadMetrics]);

  // Force refresh function
  const forceRefreshData = useCallback(() => {
    console.log('Forcing refresh of vulnerability data...');
    setForceRefresh(true);
  }, []);

  // Load data when tenant changes or on force refresh
  useEffect(() => {
    console.log('🔄 [HOOK] useEffect triggered:', {
      effectiveTenantId,
      loadedTenant: loadedTenantRef.current,
      forceRefresh,
      shouldLoad: effectiveTenantId && (loadedTenantRef.current !== effectiveTenantId || forceRefresh)
    });

    if (effectiveTenantId && (loadedTenantRef.current !== effectiveTenantId || forceRefresh)) {
      loadVulnerabilities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTenantId, forceRefresh]);

  // Load metrics after vulnerabilities are loaded
  useEffect(() => {
    console.log('📊 [HOOK] Metrics useEffect triggered:', {
      effectiveTenantId,
      initialized,
      tableExists,
      shouldLoadMetrics: effectiveTenantId && initialized && tableExists === true
    });

    if (effectiveTenantId && initialized && tableExists === true) {
      console.log('📊 [HOOK] Loading metrics...');
      loadMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTenantId, initialized, tableExists]);

  return {
    vulnerabilities,
    metrics,
    loading,
    error,
    totalCount,
    tableExists,
    createVulnerability,
    updateVulnerability,
    deleteVulnerability,
    bulkUpdateVulnerabilities,
    refetch: loadVulnerabilities,
    refetchMetrics: loadMetrics,
    forceRefresh: forceRefreshData,
  };
};
