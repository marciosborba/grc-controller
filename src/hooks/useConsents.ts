import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Consent, ConsentStatus, CollectionMethod } from '@/types/privacy-management';
import { sanitizeString } from '@/utils/validation';
import { logSecurityEvent } from '@/utils/securityLogger';

export interface ConsentFilters {
  status?: ConsentStatus;
  collection_method?: CollectionMethod;
  legal_basis_id?: string;
  expiring_soon?: boolean;
  expired?: boolean;
  search?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ConsentStats {
  total: number;
  granted: number;
  revoked: number;
  expired: number;
  pending: number;
  expiring_soon: number;
  by_collection_method: Record<CollectionMethod, number>;
  by_purpose: Record<string, number>;
  thisMonth: number;
}

export interface ConsentRevocation {
  consent_id: string;
  revocation_reason?: string;
  revoked_by?: string;
  notification_method?: 'email' | 'phone' | 'mail' | 'in_person';
}

export interface ConsentRenewal {
  consent_id: string;
  new_expiry_date: string;
  renewal_method: CollectionMethod;
  renewal_evidence_url?: string;
  renewed_by?: string;
}

export function useConsents() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ConsentStats>({
    total: 0,
    granted: 0,
    revoked: 0,
    expired: 0,
    pending: 0,
    expiring_soon: 0,
    by_collection_method: {
      website_form: 0,
      mobile_app: 0,
      phone_call: 0,
      email: 0,
      physical_form: 0,
      api: 0,
      import: 0,
      other: 0
    },
    by_purpose: {},
    thisMonth: 0
  });

  // Fetch consents with optional filters
  const fetchConsents = async (filters: ConsentFilters = {}) => {
    try {
      setLoading(true);

      let query = supabase
        .from('consents')
        .select(`
          *,
          legal_basis:legal_basis_id(name, legal_basis_type),
          created_by_user:created_by(email, raw_user_meta_data),
          updated_by_user:updated_by(email, raw_user_meta_data)
        `)
        .order('granted_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.collection_method) {
        query = query.eq('collection_method', filters.collection_method);
      }

      if (filters.legal_basis_id) {
        query = query.eq('legal_basis_id', filters.legal_basis_id);
      }

      if (filters.expiring_soon) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        query = query
          .eq('status', 'granted')
          .not('expired_at', 'is', null)
          .lt('expired_at', thirtyDaysFromNow.toISOString())
          .gt('expired_at', new Date().toISOString());
      }

      if (filters.expired) {
        const now = new Date().toISOString();
        query = query
          .not('expired_at', 'is', null)
          .lt('expired_at', now);
      }

      if (filters.search) {
        query = query.or(`data_subject_name.ilike.%${filters.search}%,data_subject_email.ilike.%${filters.search}%,purpose.ilike.%${filters.search}%`);
      }

      if (filters.date_range) {
        query = query
          .gte('granted_at', filters.date_range.start)
          .lte('granted_at', filters.date_range.end);
      }

      const { data, error } = await query;

      if (error) throw error;

      setConsents(data || []);
      await calculateStats();

    } catch (error) {
      console.error('Error fetching consents:', error);
      await logSecurityEvent({
        event: 'consents_fetch_error',
        description: `Error fetching consents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'medium'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Calculate consent statistics
  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('consents')
        .select('status, collection_method, purpose, granted_at, expired_at');

      if (error) throw error;

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const methodStats: Record<CollectionMethod, number> = {
        website_form: 0,
        mobile_app: 0,
        phone_call: 0,
        email: 0,
        physical_form: 0,
        api: 0,
        import: 0,
        other: 0
      };

      const purposeStats: Record<string, number> = {};

      data?.forEach(consent => {
        methodStats[consent.collection_method as CollectionMethod] += 1;
        
        if (consent.purpose) {
          const purpose = consent.purpose.toLowerCase();
          purposeStats[purpose] = (purposeStats[purpose] || 0) + 1;
        }
      });

      const calculatedStats: ConsentStats = {
        total: data?.length || 0,
        granted: data?.filter(d => d.status === 'granted').length || 0,
        revoked: data?.filter(d => d.status === 'revoked').length || 0,
        expired: data?.filter(d => d.status === 'expired').length || 0,
        pending: data?.filter(d => d.status === 'pending').length || 0,
        expiring_soon: data?.filter(d => {
          return d.status === 'granted' && 
                 d.expired_at && 
                 new Date(d.expired_at) < thirtyDaysFromNow &&
                 new Date(d.expired_at) > currentDate;
        }).length || 0,
        by_collection_method: methodStats,
        by_purpose: purposeStats,
        thisMonth: data?.filter(d => {
          return new Date(d.granted_at) >= startOfMonth;
        }).length || 0
      };

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error calculating consent stats:', error);
    }
  };

  // Create new consent record
  const createConsent = async (consentData: Partial<Consent>): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      // Sanitize input data
      const sanitizedData = {
        ...consentData,
        data_subject_email: sanitizeString(consentData.data_subject_email || ''),
        data_subject_name: consentData.data_subject_name ? sanitizeString(consentData.data_subject_name) : undefined,
        purpose: sanitizeString(consentData.purpose || ''),
        collection_source: consentData.collection_source ? sanitizeString(consentData.collection_source) : undefined
      };

      const finalData = {
        ...sanitizedData,
        status: 'granted' as ConsentStatus,
        granted_at: new Date().toISOString(),
        is_informed: true,
        is_specific: true,
        is_free: true,
        is_unambiguous: true,
        language: 'pt-BR'
      };

      const { data, error } = await supabase
        .from('consents')
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;

      await logSecurityEvent({
        event: 'consent_created',
        description: `New consent created for ${consentData.data_subject_email}`,
        severity: 'low',
        metadata: {
          consent_id: data.id,
          data_subject_email: consentData.data_subject_email,
          purpose: consentData.purpose,
          collection_method: consentData.collection_method
        }
      });

      await fetchConsents(); // Refresh data

      return { success: true, id: data.id };

    } catch (error) {
      console.error('Error creating consent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar consentimento'
      };
    }
  };

  // Revoke consent
  const revokeConsent = async (revocationData: ConsentRevocation): Promise<{ success: boolean; error?: string }> => {
    try {
      const sanitizedReason = revocationData.revocation_reason ? 
        sanitizeString(revocationData.revocation_reason) : undefined;

      const { error } = await supabase
        .from('consents')
        .update({
          status: 'revoked' as ConsentStatus,
          revoked_at: new Date().toISOString(),
          revocation_reason: sanitizedReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', revocationData.consent_id);

      if (error) throw error;

      await logSecurityEvent({
        event: 'consent_revoked',
        description: `Consent revoked: ${revocationData.consent_id}`,
        severity: 'medium',
        metadata: {
          consent_id: revocationData.consent_id,
          revocation_reason: sanitizedReason,
          revoked_by: revocationData.revoked_by,
          notification_method: revocationData.notification_method
        }
      });

      await fetchConsents(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error revoking consent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao revogar consentimento'
      };
    }
  };

  // Renew consent
  const renewConsent = async (renewalData: ConsentRenewal): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('consents')
        .update({
          status: 'granted' as ConsentStatus,
          expired_at: renewalData.new_expiry_date,
          collection_method: renewalData.renewal_method,
          evidence_url: renewalData.renewal_evidence_url,
          granted_at: new Date().toISOString(), // New grant date for renewal
          updated_at: new Date().toISOString()
        })
        .eq('id', renewalData.consent_id);

      if (error) throw error;

      await logSecurityEvent({
        event: 'consent_renewed',
        description: `Consent renewed: ${renewalData.consent_id}`,
        severity: 'low',
        metadata: {
          consent_id: renewalData.consent_id,
          new_expiry_date: renewalData.new_expiry_date,
          renewal_method: renewalData.renewal_method,
          renewed_by: renewalData.renewed_by
        }
      });

      await fetchConsents(); // Refresh data

      return { success: true };

    } catch (error) {
      console.error('Error renewing consent:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao renovar consentimento'
      };
    }
  };

  // Check expiring consents
  const checkExpiringConsents = async (): Promise<{ expiring: Consent[]; expired: Consent[] }> => {
    try {
      const currentDate = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      // Get expiring consents (within 30 days)
      const { data: expiringData, error: expiringError } = await supabase
        .from('consents')
        .select('*')
        .eq('status', 'granted')
        .not('expired_at', 'is', null)
        .gte('expired_at', currentDate.toISOString())
        .lt('expired_at', thirtyDaysFromNow.toISOString());

      if (expiringError) throw expiringError;

      // Get expired consents (past expiry date but still active)
      const { data: expiredData, error: expiredError } = await supabase
        .from('consents')
        .select('*')
        .eq('status', 'granted')
        .not('expired_at', 'is', null)
        .lt('expired_at', currentDate.toISOString());

      if (expiredError) throw expiredError;

      // Auto-expire the expired ones
      if (expiredData && expiredData.length > 0) {
        const expiredIds = expiredData.map(consent => consent.id);
        await supabase
          .from('consents')
          .update({
            status: 'expired' as ConsentStatus,
            updated_at: currentDate.toISOString()
          })
          .in('id', expiredIds);

        await logSecurityEvent({
          event: 'consents_auto_expired',
          description: `${expiredData.length} consents automatically expired`,
          severity: 'medium',
          metadata: {
            expired_consent_ids: expiredIds
          }
        });
      }

      return {
        expiring: expiringData || [],
        expired: expiredData || []
      };

    } catch (error) {
      console.error('Error checking expiring consents:', error);
      return { expiring: [], expired: [] };
    }
  };

  // Get consents by data subject
  const getConsentsByDataSubject = async (email: string): Promise<Consent[]> => {
    try {
      const { data, error } = await supabase
        .from('consents')
        .select(`
          *,
          legal_basis:legal_basis_id(name, legal_basis_type)
        `)
        .eq('data_subject_email', email.toLowerCase())
        .order('granted_at', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error getting consents by data subject:', error);
      return [];
    }
  };

  // Bulk revoke consents by criteria
  const bulkRevokeConsents = async (criteria: {
    email?: string;
    purpose?: string;
    legal_basis_id?: string;
    reason: string;
  }): Promise<{ success: boolean; error?: string; revokedCount: number }> => {
    try {
      let query = supabase
        .from('consents')
        .select('id')
        .eq('status', 'granted');

      if (criteria.email) {
        query = query.eq('data_subject_email', criteria.email.toLowerCase());
      }

      if (criteria.purpose) {
        query = query.ilike('purpose', `%${criteria.purpose}%`);
      }

      if (criteria.legal_basis_id) {
        query = query.eq('legal_basis_id', criteria.legal_basis_id);
      }

      const { data: consentIds, error: selectError } = await query;

      if (selectError) throw selectError;

      if (!consentIds || consentIds.length === 0) {
        return { success: true, revokedCount: 0 };
      }

      const ids = consentIds.map(c => c.id);
      const sanitizedReason = sanitizeString(criteria.reason);

      const { error: updateError } = await supabase
        .from('consents')
        .update({
          status: 'revoked' as ConsentStatus,
          revoked_at: new Date().toISOString(),
          revocation_reason: sanitizedReason,
          updated_at: new Date().toISOString()
        })
        .in('id', ids);

      if (updateError) throw updateError;

      await logSecurityEvent({
        event: 'consents_bulk_revoked',
        description: `${ids.length} consents bulk revoked`,
        severity: 'high',
        metadata: {
          criteria,
          revoked_consent_ids: ids,
          revocation_reason: sanitizedReason
        }
      });

      await fetchConsents(); // Refresh data

      return { success: true, revokedCount: ids.length };

    } catch (error) {
      console.error('Error bulk revoking consents:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao revogar consentimentos em massa',
        revokedCount: 0
      };
    }
  };

  // Generate consent report
  const generateConsentReport = async (filters: ConsentFilters = {}) => {
    try {
      const { data, error } = await supabase
        .from('consents')
        .select(`
          *,
          legal_basis:legal_basis_id(name, legal_basis_type)
        `)
        .order('granted_at', { ascending: false });

      if (error) throw error;

      // Apply client-side filtering if needed
      let filteredData = data || [];

      if (filters.status) {
        filteredData = filteredData.filter(c => c.status === filters.status);
      }

      if (filters.collection_method) {
        filteredData = filteredData.filter(c => c.collection_method === filters.collection_method);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(c => 
          c.data_subject_name?.toLowerCase().includes(searchTerm) ||
          c.data_subject_email.toLowerCase().includes(searchTerm) ||
          c.purpose.toLowerCase().includes(searchTerm)
        );
      }

      return {
        consents: filteredData,
        summary: {
          total: filteredData.length,
          granted: filteredData.filter(c => c.status === 'granted').length,
          revoked: filteredData.filter(c => c.status === 'revoked').length,
          expired: filteredData.filter(c => c.status === 'expired').length,
          by_method: filteredData.reduce((acc: Record<string, number>, c) => {
            acc[c.collection_method] = (acc[c.collection_method] || 0) + 1;
            return acc;
          }, {})
        }
      };

    } catch (error) {
      console.error('Error generating consent report:', error);
      return { consents: [], summary: {} };
    }
  };

  // Initialize hook
  useEffect(() => {
    fetchConsents();
  }, []);

  return {
    consents,
    loading,
    stats,
    fetchConsents,
    createConsent,
    revokeConsent,
    renewConsent,
    checkExpiringConsents,
    getConsentsByDataSubject,
    bulkRevokeConsents,
    generateConsentReport,
    refresh: () => fetchConsents()
  };
}