import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PrivacyIncident } from '@/types/privacy-management';

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
        .select(`
          *,
          discovered_by_user:discovered_by(email, raw_user_meta_data),
          incident_manager_user:incident_manager_id(email, raw_user_meta_data),
          dpo_user:dpo_id(email, raw_user_meta_data),
          anpd_communications(*)
        `)
        .order('discovered_at', { ascending: false });

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

  // Calculate incident statistics
  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('privacy_incidents')
        .select('status, severity_level, anpd_notification_required, anpd_notified, discovered_at');

      if (error) throw error;

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const seventyTwoHoursAgo = new Date();
      seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

      const calculatedStats: IncidentStats = {
        total: data?.length || 0,
        open: data?.filter(d => ['open', 'investigating', 'escalated'].includes(d.status)).length || 0,
        resolved: data?.filter(d => ['resolved', 'closed'].includes(d.status)).length || 0,
        critical: data?.filter(d => d.severity_level === 'critical').length || 0,
        requiresANPDNotification: data?.filter(d => d.anpd_notification_required).length || 0,
        anpdNotified: data?.filter(d => d.anpd_notified).length || 0,
        overdue: data?.filter(d => {
          return d.anpd_notification_required && 
                 !d.anpd_notified && 
                 new Date(d.discovered_at) <= seventyTwoHoursAgo;
        }).length || 0,
        thisMonth: data?.filter(d => {
          return new Date(d.discovered_at) >= startOfMonth;
        }).length || 0
      };

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error calculating incident stats:', error);
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