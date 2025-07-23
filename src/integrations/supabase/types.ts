export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_chat_logs: {
        Row: {
          ai_type: string
          content: string
          context: Json | null
          created_at: string
          error_message: string | null
          id: string
          message_type: string
          response_time: number | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_type: string
          content: string
          context?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_type: string
          response_time?: number | null
          session_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_type?: string
          content?: string
          context?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_type?: string
          response_time?: number | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          framework: string | null
          id: string
          max_score: number | null
          questionnaire_data: Json | null
          responses: Json | null
          score: number | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          framework?: string | null
          id?: string
          max_score?: number | null
          questionnaire_data?: Json | null
          responses?: Json | null
          score?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          framework?: string | null
          id?: string
          max_score?: number | null
          questionnaire_data?: Json | null
          responses?: Json | null
          score?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_reports: {
        Row: {
          audit_type: string
          auditor_id: string | null
          created_at: string
          end_date: string | null
          findings: string | null
          id: string
          recommendations: string | null
          scope: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audit_type: string
          auditor_id?: string | null
          created_at?: string
          end_date?: string | null
          findings?: string | null
          id?: string
          recommendations?: string | null
          scope?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audit_type?: string
          auditor_id?: string | null
          created_at?: string
          end_date?: string | null
          findings?: string | null
          id?: string
          recommendations?: string | null
          scope?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_records: {
        Row: {
          compliance_status: string
          control_description: string
          control_id: string
          created_at: string
          created_by: string | null
          evidence_url: string | null
          framework: string
          id: string
          last_assessment_date: string | null
          next_assessment_date: string | null
          responsible_person: string | null
          updated_at: string
        }
        Insert: {
          compliance_status: string
          control_description: string
          control_id: string
          created_at?: string
          created_by?: string | null
          evidence_url?: string | null
          framework: string
          id?: string
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          responsible_person?: string | null
          updated_at?: string
        }
        Update: {
          compliance_status?: string
          control_description?: string
          control_id?: string
          created_at?: string
          created_by?: string | null
          evidence_url?: string | null
          framework?: string
          id?: string
          last_assessment_date?: string | null
          next_assessment_date?: string | null
          responsible_person?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      controls: {
        Row: {
          control_id: string
          control_type: string
          created_at: string
          created_by: string | null
          description: string | null
          effectiveness: string | null
          id: string
          implementation_status: string
          last_review_date: string | null
          next_review_date: string | null
          owner_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          control_id: string
          control_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          effectiveness?: string | null
          id?: string
          implementation_status?: string
          last_review_date?: string | null
          next_review_date?: string | null
          owner_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          control_id?: string
          control_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          effectiveness?: string | null
          id?: string
          implementation_status?: string
          last_review_date?: string | null
          next_review_date?: string | null
          owner_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ethics_reports: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          is_anonymous: boolean
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          document_type: string | null
          document_url: string | null
          effective_date: string | null
          id: string
          owner_id: string | null
          review_date: string | null
          status: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          owner_id?: string | null
          review_date?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          document_url?: string | null
          effective_date?: string | null
          id?: string
          owner_id?: string | null
          review_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      policy_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          policy_id: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          policy_id: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          policy_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_approvals_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name: string
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          impact_score: number
          likelihood_score: number
          probability: string
          risk_category: string
          risk_score: number | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score: number
          likelihood_score: number
          probability: string
          risk_category: string
          risk_score?: number | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number
          likelihood_score?: number
          probability?: string
          risk_category?: string
          risk_score?: number | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          affected_systems: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          detection_date: string
          id: string
          incident_type: string
          reported_by: string | null
          resolution_date: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          detection_date: string
          id?: string
          incident_type: string
          reported_by?: string | null
          resolution_date?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          detection_date?: string
          id?: string
          incident_type?: string
          reported_by?: string | null
          resolution_date?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_assessments: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          evidence_files: Json | null
          id: string
          questionnaire_data: Json | null
          responses: Json | null
          risk_rating: string | null
          score: number | null
          status: string
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          evidence_files?: Json | null
          id?: string
          questionnaire_data?: Json | null
          responses?: Json | null
          risk_rating?: string | null
          score?: number | null
          status?: string
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          evidence_files?: Json | null
          id?: string
          questionnaire_data?: Json | null
          responses?: Json | null
          risk_rating?: string | null
          score?: number | null
          status?: string
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assessments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          category: string
          contact_person: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          last_assessment_date: string | null
          name: string
          next_assessment_date: string | null
          phone: string | null
          risk_level: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          contact_person?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_assessment_date?: string | null
          name: string
          next_assessment_date?: string | null
          phone?: string | null
          risk_level?: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          contact_person?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_assessment_date?: string | null
          name?: string
          next_assessment_date?: string | null
          phone?: string | null
          risk_level?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "ciso"
        | "risk_manager"
        | "compliance_officer"
        | "auditor"
        | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "ciso",
        "risk_manager",
        "compliance_officer",
        "auditor",
        "user",
      ],
    },
  },
} as const
