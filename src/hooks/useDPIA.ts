import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DPIAAssessment } from '@/types/privacy-management';

export interface DPIAFilters {
  status?: string;
  riskLevel?: string;
  dueThisMonth?: boolean;
  overdue?: boolean;
  requiresANPDConsultation?: boolean;
}

export interface DPIAStats {
  total: number;
  pending: number;
  approved: number;
  inProgress: number;
  requiresConsultation: number;
  overdue: number;
  highRisk: number;
}

export function useDPIA() {
  const [dpias, setDpias] = useState<DPIAAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DPIAStats>({
    total: 0,
    pending: 0,
    approved: 0,
    inProgress: 0,
    requiresConsultation: 0,
    overdue: 0,
    highRisk: 0
  });

  // Fetch DPIAs with optional filters
  const fetchDPIAs = async (filters: DPIAFilters = {}) => {
    try {
      setLoading(true);

      let query = supabase
        .from('dpia_assessments')
        .select(`
          *,
          processing_activity:processing_activities(name, description),
          conducted_by_user:conducted_by(email, raw_user_meta_data),
          reviewed_by_user:reviewed_by(email, raw_user_meta_data)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel);
      }

      if (filters.requiresANPDConsultation) {
        query = query.eq('anpd_consultation_required', true);
      }

      if (filters.dueThisMonth) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
        
        query = query
          .gte('started_at', startOfMonth.toISOString())
          .lte('started_at', endOfMonth.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setDpias(data || []);
      await calculateStats();

    } catch (error) {
      console.error('Error fetching DPIAs:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Calculate DPIA statistics
  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('dpia_assessments')
        .select('status, risk_level, anpd_consultation_required, started_at');

      if (error) throw error;

      const currentDate = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const calculatedStats: DPIAStats = {
        total: data?.length || 0,
        pending: data?.filter(d => d.status === 'pending_approval').length || 0,
        approved: data?.filter(d => d.status === 'approved').length || 0,
        inProgress: data?.filter(d => d.status === 'in_progress').length || 0,
        requiresConsultation: data?.filter(d => d.anpd_consultation_required).length || 0,
        overdue: data?.filter(d => {
          if (!d.started_at) return false;
          const startDate = new Date(d.started_at);
          return startDate < thirtyDaysAgo && ['in_progress', 'pending_approval'].includes(d.status);
        }).length || 0,
        highRisk: data?.filter(d => d.risk_level === 'high').length || 0
      };

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error calculating DPIA stats:', error);
    }
  };

  // Create new DPIA
  const createDPIA = async (dpiaData: Partial<DPIAAssessment>): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('dpia_assessments')
        .insert([{
          ...dpiaData,
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchDPIAs();
      return { success: true, id: data.id };

    } catch (error: any) {
      console.error('Error creating DPIA:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update DPIA
  const updateDPIA = async (id: string, updates: Partial<DPIAAssessment>): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('dpia_assessments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchDPIAs();
      return { success: true };

    } catch (error: any) {
      console.error('Error updating DPIA:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete DPIA
  const deleteDPIA = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('dpia_assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchDPIAs();
      return { success: true };

    } catch (error: any) {
      console.error('Error deleting DPIA:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Approve DPIA
  const approveDPIA = async (id: string, approvalNotes?: string): Promise<{ success: boolean; error?: string }> => {
    return updateDPIA(id, {
      status: 'approved',
      approval_notes: approvalNotes
    });
  };

  // Reject DPIA
  const rejectDPIA = async (id: string, rejectionReason: string): Promise<{ success: boolean; error?: string }> => {
    return updateDPIA(id, {
      status: 'rejected',
      rejection_reason: rejectionReason
    });
  };

  // Mark DPIA as requiring ANPD consultation
  const requireANPDConsultation = async (id: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    return updateDPIA(id, {
      anpd_consultation_required: true,
      anpd_consultation_reason: reason,
      status: 'pending_anpd_consultation'
    });
  };

  // Export DPIA to PDF/document
  const exportDPIA = async (id: string): Promise<{ success: boolean; error?: string; url?: string }> => {
    try {
      // This would integrate with a document generation service
      // For now, we'll return a placeholder
      return { 
        success: true, 
        url: `/api/privacy/dpia/${id}/export` 
      };
    } catch (error: any) {
      console.error('Error exporting DPIA:', error);
      return { success: false, error: error.message };
    }
  };

  // Duplicate DPIA (useful for similar assessments)
  const duplicateDPIA = async (id: string): Promise<{ success: boolean; error?: string; newId?: string }> => {
    try {
      setLoading(true);

      const { data: original, error: fetchError } = await supabase
        .from('dpia_assessments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { 
        id: _,
        created_at: __,
        updated_at: ___,
        started_at: ____,
        ...duplicateData 
      } = original;

      const newDPIA = {
        ...duplicateData,
        title: `${original.title} (Cópia)`,
        status: 'draft',
        started_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('dpia_assessments')
        .insert([newDPIA])
        .select()
        .single();

      if (error) throw error;

      await fetchDPIAs();
      return { success: true, newId: data.id };

    } catch (error: any) {
      console.error('Error duplicating DPIA:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get processing activities for DPIA creation
  const getProcessingActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('processing_activities')
        .select('id, name, description')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      return { success: true, data: data || [] };

    } catch (error: any) {
      console.error('Error fetching processing activities:', error);
      return { success: false, error: error.message, data: [] };
    }
  };

  // Initialize data on hook mount
  useEffect(() => {
    fetchDPIAs();
  }, []);

  return {
    dpias,
    loading,
    stats,
    fetchDPIAs,
    createDPIA,
    updateDPIA,
    deleteDPIA,
    approveDPIA,
    rejectDPIA,
    requireANPDConsultation,
    exportDPIA,
    duplicateDPIA,
    getProcessingActivities
  };
}