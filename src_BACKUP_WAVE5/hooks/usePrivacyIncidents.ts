import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PrivacyIncident } from '@/types/privacy-management';
import { useAuth } from '@/contexts/AuthContextOptimized';

export interface IncidentFilters {
  status?: string;
  severity?: string;
  requiresANPD?: boolean;
  overdue?: boolean;
  recentIncidents?: boolean;
}

export interface IncidentStats {
  total: number;
  open: number;
  resolved: number;
  critical: number;
  requiresANPDNotification: number;
  anpdNotified: number;
  overdue: number;
  thisMonth: number;
}

export interface ANPDNotificationData {
  incident_id: string;
  notification_date: string;
  notification_method: 'online_portal' | 'email' | 'phone' | 'mail';
  reference_number?: string;
  acknowledgment_received?: boolean;
  anpd_response?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  notified_by: string;
}

export function usePrivacyIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<PrivacyIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<IncidentStats>({
    total: 0,
    open: 0,
    resolved: 0,
    critical: 0,
    requiresANPDNotification: 0,
    anpdNotified: 0,
    overdue: 0,
    thisMonth: 0
  });

  // Fetch incidents with optional filters
  const fetchIncidents = async (filters: IncidentFilters = {}) => {
    try {
      setLoading(true);

      let query = supabase
        .from('privacy_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.severity) {
        query = query.eq('severity_level', filters.severity);
      }

      if (filters.requiresANPD) {
        query = query.eq('anpd_notification_required', true);
      }

      if (filters.recentIncidents) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('discovered_at', thirtyDaysAgo.toISOString());
      }

      if (filters.overdue) {
        const seventyTwoHoursAgo = new Date();
        seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

        query = query
          .eq('anpd_notification_required', true)
          .eq('anpd_notified', false)
          .lte('discovered_at', seventyTwoHoursAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setIncidents(data || []);
      await calculateStats();

    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Calculate incident statistics using RPC function for reliable data
  const calculateStats = async () => {
    try {
      // Use the RPC function as the source of truth
      const { data: rpcData, error: rpcError } = await supabase.rpc('calculate_privacy_metrics');

      if (rpcError || !rpcData) {
        console.warn('RPC function not available, showing zero stats:', rpcError?.message);
        setStats({
          total: 0,
          open: 0,
          resolved: 0,
          critical: 0,
          requiresANPDNotification: 0,
          anpdNotified: 0,
          overdue: 0,
          thisMonth: 0
        });
        return;
      }

      // Extract privacy incidents data from RPC response
      const incidentsData = rpcData.privacy_incidents || {};
      const total = incidentsData.total_incidents || 0;

      // Use RPC data for accurate counts, distribute for realistic stats
      const calculatedStats: IncidentStats = {
        total,
        open: incidentsData.open_incidents ?? 0,
        resolved: incidentsData.resolved_incidents ?? 0,
        critical: incidentsData.critical_incidents ?? 0,
        requiresANPDNotification: incidentsData.anpd_notifications_required ?? 0,
        anpdNotified: incidentsData.anpd_notified ?? 0,
        overdue: incidentsData.overdue_incidents ?? 0,
        thisMonth: incidentsData.this_month ?? 0
      };

      setStats(calculatedStats);
      console.log('Updated incident stats from RPC:', calculatedStats);

    } catch (error) {
      console.error('Error calculating incident stats:', error);
      setStats({
        total: 0,
        open: 0,
        resolved: 0,
        critical: 0,
        requiresANPDNotification: 0,
        anpdNotified: 0,
        overdue: 0,
        thisMonth: 0
      });
    }
  };

  // Create new incident
  const createIncident = async (incidentData: Partial<PrivacyIncident>): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      setLoading(true);

      // Auto-determine ANPD notification requirement based on severity and data categories
      const requiresNotification =
        incidentData.severity_level === 'critical' ||
        incidentData.severity_level === 'high' ||
        (incidentData.estimated_affected_individuals && incidentData.estimated_affected_individuals > 100);

      const { data, error } = await supabase
        .from('privacy_incidents')
        .insert([{
          ...incidentData,
          anpd_notification_required: requiresNotification,
          status: incidentData.status || 'open',
          discovered_at: incidentData.discovered_at || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchIncidents();
      return { success: true, id: data.id };

    } catch (error: any) {
      console.error('Error creating incident:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update incident
  const updateIncident = async (id: string, updates: Partial<PrivacyIncident>): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('privacy_incidents')
        .update({

          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchIncidents();
      return { success: true };

    } catch (error: any) {
      console.error('Error updating incident:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete incident
  const deleteIncident = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('privacy_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchIncidents();
      return { success: true };

    } catch (error: any) {
      console.error('Error deleting incident:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Notify ANPD about incident
  const notifyANPD = async (
    incidentId: string,
    notificationData: ANPDNotificationData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Create ANPD communication record
      const { error: commError } = await supabase
        .from('anpd_communications')
        .insert([{
          ...notificationData,
          incident_id: incidentId,
          communication_type: 'incident_notification',
          status: 'sent',
          sent_at: new Date().toISOString()
        }]);

      if (commError) throw commError;

      // Update incident with ANPD notification info
      const { error: updateError } = await supabase
        .from('privacy_incidents')
        .update({

          anpd_notified: true,
          anpd_notification_date: notificationData.notification_date,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (updateError) throw updateError;

      await fetchIncidents();
      return { success: true };

    } catch (error: any) {
      console.error('Error notifying ANPD:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Generate ANPD notification document
  const generateANPDNotification = async (
    incidentId: string
  ): Promise<{ success: boolean; error?: string; document?: any }> => {
    try {
      const incident = incidents.find(i => i.id === incidentId);
      if (!incident) {
        throw new Error('Incident not found');
      }

      // Generate notification document based on ANPD requirements
      const document = {
        incident_id: incidentId,
        title: incident.title,
        description: incident.description,
        discovery_date: incident.discovered_at,
        occurrence_date: incident.occurred_at,
        severity: incident.severity_level,
        affected_individuals: incident.estimated_affected_individuals,
        data_categories: incident.affected_data_categories,
        containment_measures: incident.containment_measures,
        impact_assessment: incident.impact_description,
        corrective_actions: incident.corrective_actions,
        notification_to_subjects: incident.data_subjects_notified,
        timeline: {
          occurred: incident.occurred_at,
          discovered: incident.discovered_at,
          contained: incident.contained_at,
          notification_planned: new Date().toISOString()
        }
      };

      return { success: true, document };

    } catch (error: any) {
      console.error('Error generating ANPD notification:', error);
      return { success: false, error: error.message };
    }
  };

  // Check for overdue ANPD notifications
  const checkOverdueNotifications = async (): Promise<{
    success: boolean;
    error?: string;
    overdueIncidents?: PrivacyIncident[]
  }> => {
    try {
      const seventyTwoHoursAgo = new Date();
      seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

      const { data, error } = await supabase
        .from('privacy_incidents')
        .select('*')
        .eq('anpd_notification_required', true)
        .eq('anpd_notified', false)
        .lte('discovered_at', seventyTwoHoursAgo.toISOString());

      if (error) throw error;

      return {
        success: true,
        overdueIncidents: data || []
      };

    } catch (error: any) {
      console.error('Error checking overdue notifications:', error);
      return { success: false, error: error.message };
    }
  };

  // Get ANPD communications for an incident
  const getANPDCommunications = async (incidentId: string) => {
    try {
      const { data, error } = await supabase
        .from('anpd_communications')
        .select('*')
        .eq('incident_id', incidentId)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };

    } catch (error: any) {
      console.error('Error fetching ANPD communications:', error);
      return { success: false, error: error.message, data: [] };
    }
  };

  // Mark incident as contained
  const containIncident = async (
    incidentId: string,
    containmentMeasures: string[]
  ): Promise<{ success: boolean; error?: string }> => {
    return updateIncident(incidentId, {
      contained_at: new Date().toISOString(),
      containment_measures: containmentMeasures,
      status: 'investigating'
    });
  };

  // Close incident
  const closeIncident = async (
    incidentId: string,
    finalReport: string
  ): Promise<{ success: boolean; error?: string }> => {
    return updateIncident(incidentId, {
      status: 'closed',
      investigation_findings: finalReport,
      closed_at: new Date().toISOString()
    });
  };

  // Initialize data on hook mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  return {
    incidents,
    loading,
    stats,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
    notifyANPD,
    generateANPDNotification,
    checkOverdueNotifications,
    getANPDCommunications,
    containIncident,
    closeIncident
  };
}