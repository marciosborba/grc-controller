import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Incident = Database['public']['Tables']['incidents']['Row'];
export type IncidentInsert = Database['public']['Tables']['incidents']['Insert'];
export type IncidentUpdate = Database['public']['Tables']['incidents']['Update'];

export type IncidentComment = Database['public']['Tables']['incident_comments']['Row'];
export type IncidentCommentInsert = Database['public']['Tables']['incident_comments']['Insert'];

export type IncidentHistory = Database['public']['Tables']['incident_history']['Row'];

export const incidentService = {
    async getIncidents(filters?: { status?: string; priority?: string; assignee_id?: string; tenant_id?: string }) {
        let query = supabase
            .from('incidents')
            .select(`
        id, title, description, status, severity, priority, type, category, 
        created_at, updated_at, detection_date, resolution_date, target_resolution_date,
        affected_systems, business_impact, tenant_id, reporter_id, assignee_id,
        reporter:profiles!incidents_reporter_id_fkey(email, id, full_name, job_title),
        assignee:profiles!incidents_assignee_id_fkey(email, id, full_name, job_title)
      `)
            .order('created_at', { ascending: false });

        if (filters?.tenant_id) {
            query = query.eq('tenant_id', filters.tenant_id);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.priority) {
            query = query.eq('priority', filters.priority);
        }
        if (filters?.assignee_id) {
            query = query.eq('assignee_id', filters.assignee_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getIncidentById(id: string) {
        const { data, error } = await supabase
            .from('incidents')
            .select(`
        *,
        reporter:profiles!incidents_reporter_id_fkey(email, id),
        assignee:profiles!incidents_assignee_id_fkey(email, id)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createIncident(incident: IncidentInsert) {
        const { data, error } = await supabase
            .from('incidents')
            .insert(incident)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateIncident(id: string, updates: IncidentUpdate) {
        const { data, error } = await supabase
            .from('incidents')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getComments(incidentId: string) {
        const { data, error } = await supabase
            .from('incident_comments')
            .select(`
        *,
        user:profiles!incident_comments_user_id_fkey(email, id)
      `)
            .eq('incident_id', incidentId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addComment(comment: IncidentCommentInsert) {
        const { data, error } = await supabase
            .from('incident_comments')
            .insert(comment)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getHistory(incidentId: string) {
        const { data, error } = await supabase
            .from('incident_history')
            .select(`
        *,
        user:profiles!incident_history_user_id_fkey(email, id)
      `)
            .eq('incident_id', incidentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
