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
      setVulnerabilities(data || []);
      setTotalCount(count || 0);
      setTableExists(true);
      setInitialized(true);
      setAttemptCount(0); // Reset attempt count on success
      loadedTenantRef.current = effectiveTenantId;
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
    
    // If table doesn't exist, return empty metrics
    if (tableExists === false) {
      const emptyMetrics: VulnerabilityMetrics = {
        total_vulnerabilities: 0,
        by_severity: {
          Critical: 0,
          High: 0,
          Medium: 0,
          Low: 0,
          Info: 0,
        },
        by_status: {
          Open: 0,
          In_Progress: 0,
          Testing: 0,
          Resolved: 0,
          Accepted: 0,
          False_Positive: 0,
          Duplicate: 0,
        },
        by_source: {
          Pentest: 0,
          SAST: 0,
          DAST: 0,
          Cloud: 0,
          Infrastructure: 0,
          Manual: 0,
          Risk_Register: 0,
          Bug_Bounty: 0,
          Compliance_Audit: 0,
        },
        sla_compliance: 100,
        avg_resolution_time: 0,
        overdue_count: 0,
        critical_open: 0,
        high_open: 0,
        trend_data: [],
      };
      setMetrics(emptyMetrics);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('severity, status, source_type, created_at, resolved_at, due_date, sla_breach')
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      const vulnerabilities = data || [];
      const now = new Date();

      // Calculate metrics
      const metrics: VulnerabilityMetrics = {
        total_vulnerabilities: vulnerabilities.length,
        by_severity: {
          Critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
          High: vulnerabilities.filter(v => v.severity === 'High').length,
          Medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
          Low: vulnerabilities.filter(v => v.severity === 'Low').length,
          Info: vulnerabilities.filter(v => v.severity === 'Info').length,
        },
        by_status: {
          Open: vulnerabilities.filter(v => v.status === 'Open').length,
          In_Progress: vulnerabilities.filter(v => v.status === 'In_Progress').length,
          Testing: vulnerabilities.filter(v => v.status === 'Testing').length,
          Resolved: vulnerabilities.filter(v => v.status === 'Resolved').length,
          Accepted: vulnerabilities.filter(v => v.status === 'Accepted').length,
          False_Positive: vulnerabilities.filter(v => v.status === 'False_Positive').length,
          Duplicate: vulnerabilities.filter(v => v.status === 'Duplicate').length,
        },
        by_source: {
          Pentest: vulnerabilities.filter(v => v.source_type === 'Pentest').length,
          SAST: vulnerabilities.filter(v => v.source_type === 'SAST').length,
          DAST: vulnerabilities.filter(v => v.source_type === 'DAST').length,
          Cloud: vulnerabilities.filter(v => v.source_type === 'Cloud').length,
          Infrastructure: vulnerabilities.filter(v => v.source_type === 'Infrastructure').length,
          Manual: vulnerabilities.filter(v => v.source_type === 'Manual').length,
          Risk_Register: vulnerabilities.filter(v => v.source_type === 'Risk_Register').length,
          Bug_Bounty: vulnerabilities.filter(v => v.source_type === 'Bug_Bounty').length,
          Compliance_Audit: vulnerabilities.filter(v => v.source_type === 'Compliance_Audit').length,
        },
        sla_compliance: vulnerabilities.length > 0 
          ? Math.round((vulnerabilities.filter(v => !v.sla_breach).length / vulnerabilities.length) * 100)
          : 100,
        avg_resolution_time: calculateAverageResolutionTime(vulnerabilities),
        overdue_count: vulnerabilities.filter(v => 
          v.due_date && new Date(v.due_date) < now && !['Resolved', 'Accepted', 'False_Positive'].includes(v.status)
        ).length,
        critical_open: vulnerabilities.filter(v => 
          v.severity === 'Critical' && !['Resolved', 'Accepted', 'False_Positive'].includes(v.status)
        ).length,
        high_open: vulnerabilities.filter(v => 
          v.severity === 'High' && !['Resolved', 'Accepted', 'False_Positive'].includes(v.status)
        ).length,
        trend_data: calculateTrendData(vulnerabilities),
      };

      setMetrics(metrics);
    } catch (err) {
      console.error('Error loading metrics:', err);
      // If metrics fail to load due to table not existing, handle gracefully
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('relation "vulnerabilities" does not exist') || 
          errorMessage.includes('table "vulnerabilities" does not exist') ||
          errorMessage.includes('relation does not exist')) {
        setTableExists(false);
      }
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
    if (effectiveTenantId && (loadedTenantRef.current !== effectiveTenantId || forceRefresh)) {
      loadVulnerabilities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTenantId, forceRefresh]);

  // Load metrics after vulnerabilities are loaded
  useEffect(() => {
    if (effectiveTenantId && initialized && tableExists === true) {
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

// Helper functions
function calculateAverageResolutionTime(vulnerabilities: any[]): number {
  const resolved = vulnerabilities.filter(v => v.resolved_at && v.created_at);
  if (resolved.length === 0) return 0;

  const totalTime = resolved.reduce((sum, v) => {
    const created = new Date(v.created_at);
    const resolved = new Date(v.resolved_at);
    return sum + (resolved.getTime() - created.getTime());
  }, 0);

  return Math.round(totalTime / resolved.length / (1000 * 60 * 60 * 24)); // Days
}

function calculateTrendData(vulnerabilities: any[]): any[] {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last30Days.map(date => {
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const newVulns = vulnerabilities.filter(v => {
      const created = new Date(v.created_at);
      return created >= dayStart && created <= dayEnd;
    }).length;

    const resolvedVulns = vulnerabilities.filter(v => {
      if (!v.resolved_at) return false;
      const resolved = new Date(v.resolved_at);
      return resolved >= dayStart && resolved <= dayEnd;
    }).length;

    const totalAtEndOfDay = vulnerabilities.filter(v => {
      const created = new Date(v.created_at);
      const resolved = v.resolved_at ? new Date(v.resolved_at) : null;
      return created <= dayEnd && (!resolved || resolved > dayEnd);
    }).length;

    return {
      date,
      total: totalAtEndOfDay,
      resolved: resolvedVulns,
      new: newVulns,
    };
  });
}