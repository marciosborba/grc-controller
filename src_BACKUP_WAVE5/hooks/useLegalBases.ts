import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LegalBasis, LegalBasisType, LegalBasisStatus } from '@/types/privacy-management';
import { sanitizeString } from '@/utils/validation';
import { logSecurityEvent } from '@/utils/securityLogger';
import { useAuth} from '@/contexts/AuthContextOptimized';

export interface LegalBasisFilters {
  status?: LegalBasisStatus;
  legal_basis_type?: LegalBasisType;
  legal_responsible_id?: string;
  expiring_soon?: boolean;
  search?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface LegalBasisStats {
  total: number;
  active: number;
  suspended: number;
  expired: number;
  expiring_soon: number;
  by_type: Record<LegalBasisType, number>;
  thisMonth: number;
}

export interface LegalBasisValidation {
  basis_id: string;
  is_valid: boolean;
  validation_notes?: string;
  validated_by: string;
  validation_date: string;
}

export interface LegalBasisUsage {
  basis_id: string;
  usage_context: string;
  processing_activity_id?: string;
  data_categories: string[];
  usage_start_date: string;
  usage_end_date?: string;
}

export function useLegalBases() {
  const { user } = useAuth();
  const [legalBases, setLegalBases] = useState<LegalBasis[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LegalBasisStats>({
    total: 0,
    active: 0,
    suspended: 0,
    expired: 0,
    expiring_soon: 0,
    by_type: {
      consentimento: 0,
      contrato: 0,
      obrigacao_legal: 0,
      protecao_vida: 0,
      interesse_publico: 0,
      interesse_legitimo: 0,
      exercicio_direitos: 0
    },
    thisMonth: 0
  });

  // Fetch legal bases with optional filters
  const fetchLegalBases = async (filters: LegalBasisFilters = {}) => {
    try {
      setLoading(true);

      let query = supabase
        .from('legal_bases')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.legal_basis_type) {
        query = query.eq('legal_basis_type', filters.legal_basis_type);
      }

      if (filters.legal_responsible_id) {
        query = query.eq('legal_responsible_id', filters.legal_responsible_id);
      }

      if (filters.expiring_soon) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        query = query
          .not('valid_until', 'is', null)
          .lt('valid_until', thirtyDaysFromNow.toISOString())
          .eq('status', 'active');
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,justification.ilike.%${filters.search}%`);
      }

      if (filters.date_range) {
        query = query
          .gte('valid_from', filters.date_range.start)
          .lte('valid_from', filters.date_range.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLegalBases(data || []);
      await calculateStats();

    } catch (error) {
      console.error('Error fetching legal bases:', error);
      try {

        await logSecurityEvent({
        event: 'legal_bases_fetch_error',
        description: `Error fetching legal bases: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'medium'
      });

      } catch (logError) {

        console.warn('Warning: Could not log security event:', logError);

      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Calculate legal basis statistics
  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_bases')
        .select('status, legal_basis_type, valid_from, valid_until, created_at');

      if (error) throw error;

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const typeStats: Record<LegalBasisType, number> = {
        consentimento: 0,
        contrato: 0,
        obrigacao_legal: 0,
        protecao_vida: 0,
        interesse_publico: 0,
        interesse_legitimo: 0,
        exercicio_direitos: 0
      };

      data?.forEach(basis => {
        typeStats[basis.legal_basis_type as LegalBasisType] += 1;
      });

      const calculatedStats: LegalBasisStats = {
        total: data?.length || 0,
        active: data?.filter(d => d.status === 'active').length || 0,
        suspended: data?.filter(d => d.status === 'suspended').length || 0,
        expired: data?.filter(d => d.status === 'expired').length || 0,
        expiring_soon: data?.filter(d => {
          return d.valid_until && 
                 d.status === 'active' &&
                 new Date(d.valid_until) < thirtyDaysFromNow;
        }).length || 0,
        by_type: typeStats,
        thisMonth: data?.filter(d => {
          return new Date(d.created_at) >= startOfMonth;
        }).length || 0
      };

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error calculating legal basis stats:', error);
    }
  };

  // Create new legal basis
  const createLegalBasis = async (basisData: Partial<LegalBasis>): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      // Sanitize input data
      const sanitizedData = {
        ...basisData,
        name: sanitizeString(basisData.name || ''),
        description: sanitizeString(basisData.description || ''),
        justification: sanitizeString(basisData.justification || ''),
        legal_article: sanitizeString(basisData.legal_article || '')
      };

      const finalData = {
        ...sanitizedData,
        status: 'active' as LegalBasisStatus,
        legal_responsible_id: sanitizedData.legal_responsible_id || null,
        created_by: user?.id,
        updated_by: user?.id
      };

      const { data, error } = await supabase
        .from('legal_bases')
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;

      // Log success without throwing error if logging fails
      try {
        try {

          await logSecurityEvent({
          event: 'legal_basis_created',
          description: `New legal basis created: ${basisData.name} (${basisData.legal_basis_type})`,
          severity: 'low',
          metadata: {
            legal_basis_id: data.id,
            legal_basis_type: basisData.legal_basis_type,
            legal_responsible_id: basisData.legal_responsible_id
          }
        });

        } catch (logError) {

          console.warn('Warning: Could not log security event:', logError);

        }
      } catch (logError) {
        console.warn('Warning: Could not log security event:', logError);
      }

      await fetchLegalBases(); // Refresh data

      return { success: true, id: data.id };

    } catch (error) {
      console.error('Error creating legal basis:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar base legal'
      };
    }
  };

  // Update legal basis
  const updateLegalBasis = async (id: string, updates: Partial<LegalBasis>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Sanitize input data
      const sanitizedUpdates = {
        ...updates,
        name: updates.name ? sanitizeString(updates.name) : undefined,
        description: updates.description ? sanitizeString(updates.description) : undefined,
        justification: updates.justification ? sanitizeString(updates.justification) : undefined,
        legal_article: updates.legal_article ? sanitizeString(updates.legal_article) : undefined,
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(sanitizedUpdates).filter(([_, value]) => value !== undefined)
      );

      const { error } = await supabase
        .from('legal_bases')
        .update(cleanUpdates)
        .eq('id', id);

      if (error) throw error;

      try {


        await logSecurityEvent({
        event: 'legal_basis_updated',
        description: `Legal basis updated: ${id}`,
        severity: 'low',
        metadata: {
          legal_basis_id: id,
          updates: Object.keys(cleanUpdates)
        }
      });


      } catch (logError) {


        console.warn('Warning: Could not log security event:', logError);


      }

      await fetchLegalBases(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error updating legal basis:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar base legal'
      };
    }
  };

  // Suspend/revoke legal basis
  const suspendLegalBasis = async (id: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedReason = sanitizeString(reason);

      const { error } = await supabase
        .from('legal_bases')
        .update({
          status: 'suspended' as LegalBasisStatus,
          suspension_reason: sanitizedReason,
          suspended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      try {


        await logSecurityEvent({
        event: 'legal_basis_suspended',
        description: `Legal basis suspended: ${id}`,
        severity: 'medium',
        metadata: {
          legal_basis_id: id,
          suspension_reason: sanitizedReason
        }
      });


      } catch (logError) {


        console.warn('Warning: Could not log security event:', logError);


      }

      await fetchLegalBases(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error suspending legal basis:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao suspender base legal'
      };
    }
  };

  // Reactivate legal basis
  const reactivateLegalBasis = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('legal_bases')
        .update({
          status: 'active' as LegalBasisStatus,
          suspension_reason: null,
          suspended_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      try {


        await logSecurityEvent({
        event: 'legal_basis_reactivated',
        description: `Legal basis reactivated: ${id}`,
        severity: 'low',
        metadata: {
          legal_basis_id: id
        }
      });


      } catch (logError) {


        console.warn('Warning: Could not log security event:', logError);


      }

      await fetchLegalBases(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error reactivating legal basis:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao reativar base legal'
      };
    }
  };

  // Validate legal basis (legal review)
  const validateLegalBasis = async (validationData: LegalBasisValidation): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedNotes = validationData.validation_notes ? 
        sanitizeString(validationData.validation_notes) : undefined;

      // Update the legal basis with validation info
      const { error } = await supabase
        .from('legal_bases')
        .update({
          is_validated: validationData.is_valid,
          validation_notes: sanitizedNotes,
          validated_by: validationData.validated_by,
          validated_at: validationData.validation_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', validationData.basis_id);

      if (error) throw error;

      try {


        await logSecurityEvent({
        event: 'legal_basis_validated',
        description: `Legal basis validation: ${validationData.basis_id} - ${validationData.is_valid ? 'Valid' : 'Invalid'}`,
        severity: validationData.is_valid ? 'low' : 'medium',
        metadata: {
          legal_basis_id: validationData.basis_id,
          is_valid: validationData.is_valid,
          validated_by: validationData.validated_by
        }
      });


      } catch (logError) {


        console.warn('Warning: Could not log security event:', logError);


      }

      await fetchLegalBases(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error validating legal basis:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao validar base legal'
      };
    }
  };

  // Check expiring legal bases
  const checkExpiringBases = async (): Promise<{ expiring: LegalBasis[]; expired: LegalBasis[] }> => {
    try {
      const currentDate = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Get expiring bases (within 30 days)
      const { data: expiringData, error: expiringError } = await supabase
        .from('legal_bases')
        .select('*')
        .eq('status', 'active')
        .not('valid_until', 'is', null)
        .gte('valid_until', currentDate.toISOString())
        .lt('valid_until', thirtyDaysFromNow.toISOString());

      if (expiringError) throw expiringError;

      // Get expired bases (past due date but still active)
      const { data: expiredData, error: expiredError } = await supabase
        .from('legal_bases')
        .select('*')
        .eq('status', 'active')
        .not('valid_until', 'is', null)
        .lt('valid_until', currentDate.toISOString());

      if (expiredError) throw expiredError;

      // Auto-expire the expired ones
      if (expiredData && expiredData.length > 0) {
        const expiredIds = expiredData.map(basis => basis.id);
        await supabase
          .from('legal_bases')
          .update({
            status: 'expired' as LegalBasisStatus,
            updated_at: currentDate.toISOString()
          })
          .in('id', expiredIds);

        try {


          await logSecurityEvent({
          event: 'legal_bases_auto_expired',
          description: `${expiredData.length} legal bases automatically expired`,
          severity: 'medium',
          metadata: {
            expired_basis_ids: expiredIds
          }
        });


        } catch (logError) {


          console.warn('Warning: Could not log security event:', logError);


        }
      }

      return {
        expiring: expiringData || [],
        expired: expiredData || []
      };

    } catch (error) {
      console.error('Error checking expiring bases:', error);
      return { expiring: [], expired: [] };
    }
  };

  // Get legal bases applicable to specific data categories
  const getApplicableBases = async (dataCategories: string[], processingContext?: string): Promise<LegalBasis[]> => {
    try {
      let query = supabase
        .from('legal_bases')
        .select('*')
        .eq('status', 'active');

      // Filter by applicable categories
      if (dataCategories.length > 0) {
        query = query.or(
          dataCategories.map(category => `applies_to_categories.cs.{${category}}`).join(',')
        );
      }

      // Filter by processing context if provided
      if (processingContext) {
        query = query.or(`applies_to_processing.cs.{${processingContext}}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error getting applicable bases:', error);
      return [];
    }
  };

  // Get legal basis usage report
  const getLegalBasisUsageReport = async (basisId: string) => {
    try {
      // In a real implementation, this would query multiple tables to find
      // where this legal basis is being used (processing activities, consents, etc.)
      const { data, error } = await supabase
        .from('processing_activities')
        .select('id, name, purpose, data_categories')
        .eq('legal_basis_id', basisId);

      if (error) throw error;

      return {
        processing_activities: data || [],
        total_usage_count: data?.length || 0
      };

    } catch (error) {
      console.error('Error getting usage report:', error);
      return { processing_activities: [], total_usage_count: 0 };
    }
  };

  // Initialize hook
  useEffect(() => {
    fetchLegalBases();
  }, []);

  return {
    legalBases,
    loading,
    stats,
    fetchLegalBases,
    createLegalBasis,
    updateLegalBasis,
    suspendLegalBasis,
    reactivateLegalBasis,
    validateLegalBasis,
    checkExpiringBases,
    getApplicableBases,
    getLegalBasisUsageReport,
    refresh: () => fetchLegalBases()
  };
}