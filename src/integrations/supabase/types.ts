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
      assessment_evidence: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          response_id: string
          uploaded_at: string
          uploaded_by_user_id: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          response_id: string
          uploaded_at?: string
          uploaded_by_user_id?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          response_id?: string
          uploaded_at?: string
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_evidence_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "assessment_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          answered_at: string | null
          answered_by_user_id: string | null
          assessee_response: string | null
          assessment_id: string
          assessor_analysis: string | null
          auditor_comments: string | null
          auditor_maturity_level: number | null
          control_id: string
          created_at: string
          evaluated_at: string | null
          evaluated_by_user_id: string | null
          id: string
          last_updated_by_user_id: string | null
          maturity_level: number | null
          question_status: string | null
          respondent_comments: string | null
          respondent_maturity_level: number | null
          updated_at: string
        }
        Insert: {
          answered_at?: string | null
          answered_by_user_id?: string | null
          assessee_response?: string | null
          assessment_id: string
          assessor_analysis?: string | null
          auditor_comments?: string | null
          auditor_maturity_level?: number | null
          control_id: string
          created_at?: string
          evaluated_at?: string | null
          evaluated_by_user_id?: string | null
          id?: string
          last_updated_by_user_id?: string | null
          maturity_level?: number | null
          question_status?: string | null
          respondent_comments?: string | null
          respondent_maturity_level?: number | null
          updated_at?: string
        }
        Update: {
          answered_at?: string | null
          answered_by_user_id?: string | null
          assessee_response?: string | null
          assessment_id?: string
          assessor_analysis?: string | null
          auditor_comments?: string | null
          auditor_maturity_level?: number | null
          control_id?: string
          created_at?: string
          evaluated_at?: string | null
          evaluated_by_user_id?: string | null
          id?: string
          last_updated_by_user_id?: string | null
          maturity_level?: number | null
          question_status?: string | null
          respondent_comments?: string | null
          respondent_maturity_level?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "framework_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_user_roles: {
        Row: {
          assessment_id: string
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_user_roles_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          due_date: string | null
          framework_id_on_creation: string
          id: string
          name: string
          progress: number | null
          status: Database["public"]["Enums"]["assessment_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          due_date?: string | null
          framework_id_on_creation: string
          id?: string
          name: string
          progress?: number | null
          status?: Database["public"]["Enums"]["assessment_status"]
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          due_date?: string | null
          framework_id_on_creation?: string
          id?: string
          name?: string
          progress?: number | null
          status?: Database["public"]["Enums"]["assessment_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_framework_id_on_creation_fkey"
            columns: ["framework_id_on_creation"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
        ]
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
      compliance_assessments: {
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
      framework_controls: {
        Row: {
          control_code: string
          control_reference: string | null
          control_text: string
          created_at: string
          domain: string | null
          framework_id: string
          id: string
          updated_at: string
        }
        Insert: {
          control_code: string
          control_reference?: string | null
          control_text: string
          created_at?: string
          domain?: string | null
          framework_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          control_code?: string
          control_reference?: string | null
          control_text?: string
          created_at?: string
          domain?: string | null
          framework_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "framework_controls_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          category: string
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          name: string
          short_name: string
          tenant_id: string
          updated_at: string
          version: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name: string
          short_name: string
          tenant_id?: string
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name?: string
          short_name?: string
          tenant_id?: string
          updated_at?: string
          version?: string
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
      policy_approvers: {
        Row: {
          approver_id: string
          approver_role: string
          created_at: string
          created_by: string | null
          id: string
          is_required: boolean
          order_sequence: number
          policy_id: string
        }
        Insert: {
          approver_id: string
          approver_role: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_required?: boolean
          order_sequence?: number
          policy_id: string
        }
        Update: {
          approver_id?: string
          approver_role?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_required?: boolean
          order_sequence?: number
          policy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_approvers_policy_id_fkey"
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
          email: string | null
          email_verified: boolean | null
          failed_login_attempts: number | null
          full_name: string
          id: string
          is_active: boolean | null
          job_title: string | null
          language: string | null
          last_login: string | null
          last_login_at: string | null
          locked_until: string | null
          login_count: number | null
          must_change_password: boolean | null
          notification_preferences: Json | null
          password_changed_at: string | null
          permissions: string[] | null
          phone: string | null
          tenant_id: string | null
          theme: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          email_verified?: boolean | null
          failed_login_attempts?: number | null
          full_name: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          language?: string | null
          last_login?: string | null
          last_login_at?: string | null
          locked_until?: string | null
          login_count?: number | null
          must_change_password?: boolean | null
          notification_preferences?: Json | null
          password_changed_at?: string | null
          permissions?: string[] | null
          phone?: string | null
          tenant_id?: string | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          email_verified?: boolean | null
          failed_login_attempts?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          language?: string | null
          last_login?: string | null
          last_login_at?: string | null
          locked_until?: string | null
          login_count?: number | null
          must_change_password?: boolean | null
          notification_preferences?: Json | null
          password_changed_at?: string | null
          permissions?: string[] | null
          phone?: string | null
          tenant_id?: string | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_action_activities: {
        Row: {
          action_plan_id: string
          created_at: string
          deadline: string | null
          description: string
          evidence_description: string | null
          evidence_url: string | null
          id: string
          responsible_person: string
          status: string
          updated_at: string
        }
        Insert: {
          action_plan_id: string
          created_at?: string
          deadline?: string | null
          description: string
          evidence_description?: string | null
          evidence_url?: string | null
          id?: string
          responsible_person: string
          status?: string
          updated_at?: string
        }
        Update: {
          action_plan_id?: string
          created_at?: string
          deadline?: string | null
          description?: string
          evidence_description?: string | null
          evidence_url?: string | null
          id?: string
          responsible_person?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_action_activities_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "risk_action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_action_plans: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          risk_id: string
          treatment_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          risk_id: string
          treatment_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          risk_id?: string
          treatment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_action_plans_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
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
          risk_level: string | null
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
          risk_level?: string | null
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
          risk_level?: string | null
          risk_score?: number | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_communications: {
        Row: {
          communication_date: string
          created_at: string
          created_by: string | null
          decision: string | null
          id: string
          justification: string | null
          notified_at: string | null
          person_email: string
          person_name: string
          risk_id: string
          updated_at: string
        }
        Insert: {
          communication_date?: string
          created_at?: string
          created_by?: string | null
          decision?: string | null
          id?: string
          justification?: string | null
          notified_at?: string | null
          person_email: string
          person_name: string
          risk_id: string
          updated_at?: string
        }
        Update: {
          communication_date?: string
          created_at?: string
          created_by?: string | null
          decision?: string | null
          id?: string
          justification?: string | null
          notified_at?: string | null
          person_email?: string
          person_name?: string
          risk_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_communications_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_assessment_progress: {
        Args: { assessment_id_param: string }
        Returns: number
      }
      calculate_cmmi_average: {
        Args: { assessment_id_param: string }
        Returns: number
      }
      calculate_risk_level: {
        Args: { impact_score: number; likelihood_score: number }
        Returns: string
      }
      can_manage_user: {
        Args: { _manager_id: string; _target_user_id: string }
        Returns: boolean
      }
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
      make_user_admin: {
        Args: { email_to_promote: string }
        Returns: boolean
      }
      rpc_log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_details?: Json
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
      assessment_status:
        | "Não Iniciado"
        | "Em Andamento"
        | "Em Revisão"
        | "Concluído"
      maturity_level: "1" | "2" | "3" | "4" | "5"
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
      assessment_status: [
        "Não Iniciado",
        "Em Andamento",
        "Em Revisão",
        "Concluído",
      ],
      maturity_level: ["1", "2", "3", "4", "5"],
    },
  },
} as const
