import { useState, useEffect, useCallback } from 'react';
import { Vulnerability, VulnerabilityFilter, VulnerabilityMetrics } from '../types/vulnerability';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
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

  const {
    filters = {},
    page = 1,
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  // Load vulnerabilities with filters
  const loadVulnerabilities = useCallback(async () => {
    if (!effectiveTenantId) return;

    setLoading(true);
    setError(null);

    try {
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
    } catch (err) {
      console.error('Error loading vulnerabilities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vulnerabilities');
      toast.error('Failed to load vulnerabilities');
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, filters, page, limit, sortBy, sortOrder]);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    if (!effectiveTenantId) return;

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

  useEffect(() => {
    loadVulnerabilities();
  }, [loadVulnerabilities]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    vulnerabilities,
    metrics,
    loading,
    error,
    totalCount,
    createVulnerability,
    updateVulnerability,
    deleteVulnerability,
    bulkUpdateVulnerabilities,
    refetch: loadVulnerabilities,
    refetchMetrics: loadMetrics,
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