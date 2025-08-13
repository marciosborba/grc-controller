export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      anpd_communications: {
        Row: {
          actions_required: string[] | null
          attachments: string[] | null
          communication_date: string
          communication_type: string
          compliance_status: string | null
          content: string
          created_at: string | null
          created_by: string
          dpia_assessment_id: string | null
          dpo_id: string | null
          id: string
          legal_responsible_id: string | null
          method: string
          privacy_incident_id: string | null
          reference_number: string | null
          response_attachments: string[] | null
          response_content: string | null
          response_date: string | null
          response_deadline: string | null
          response_received: boolean | null
          response_required: boolean | null
          sent_by: string
          subject: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actions_required?: string[] | null
          attachments?: string[] | null
          communication_date: string
          communication_type: string
          compliance_status?: string | null
          content: string
          created_at?: string | null
          created_by: string
          dpia_assessment_id?: string | null
          dpo_id?: string | null
          id?: string
          legal_responsible_id?: string | null
          method: string
          privacy_incident_id?: string | null
          reference_number?: string | null
          response_attachments?: string[] | null
          response_content?: string | null
          response_date?: string | null
          response_deadline?: string | null
          response_received?: boolean | null
          response_required?: boolean | null
          sent_by: string
          subject: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actions_required?: string[] | null
          attachments?: string[] | null
          communication_date?: string
          communication_type?: string
          compliance_status?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          dpia_assessment_id?: string | null
          dpo_id?: string | null
          id?: string
          legal_responsible_id?: string | null
          method?: string
          privacy_incident_id?: string | null
          reference_number?: string | null
          response_attachments?: string[] | null
          response_content?: string | null
          response_date?: string | null
          response_deadline?: string | null
          response_received?: boolean | null
          response_required?: boolean | null
          sent_by?: string
          subject?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anpd_communications_dpia_assessment_id_fkey"
            columns: ["dpia_assessment_id"]
            isOneToOne: false
            referencedRelation: "dpia_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anpd_communications_privacy_incident_id_fkey"
            columns: ["privacy_incident_id"]
            isOneToOne: false
            referencedRelation: "privacy_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          collection_method: string
          collection_source: string | null
          created_at: string | null
          created_by: string | null
          data_categories: string[]
          data_subject_document: string | null
          data_subject_email: string
          data_subject_name: string | null
          evidence_url: string | null
          expired_at: string | null
          granted_at: string
          id: string
          is_free: boolean
          is_informed: boolean
          is_specific: boolean
          is_unambiguous: boolean
          language: string | null
          legal_basis_id: string | null
          privacy_policy_version: string | null
          purpose: string
          revoked_at: string | null
          status: string
          terms_of_service_version: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          collection_method: string
          collection_source?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories: string[]
          data_subject_document?: string | null
          data_subject_email: string
          data_subject_name?: string | null
          evidence_url?: string | null
          expired_at?: string | null
          granted_at: string
          id?: string
          is_free?: boolean
          is_informed?: boolean
          is_specific?: boolean
          is_unambiguous?: boolean
          language?: string | null
          legal_basis_id?: string | null
          privacy_policy_version?: string | null
          purpose: string
          revoked_at?: string | null
          status?: string
          terms_of_service_version?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          collection_method?: string
          collection_source?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: string[]
          data_subject_document?: string | null
          data_subject_email?: string
          data_subject_name?: string | null
          evidence_url?: string | null
          expired_at?: string | null
          granted_at?: string
          id?: string
          is_free?: boolean
          is_informed?: boolean
          is_specific?: boolean
          is_unambiguous?: boolean
          language?: string | null
          legal_basis_id?: string | null
          privacy_policy_version?: string | null
          purpose?: string
          revoked_at?: string | null
          status?: string
          terms_of_service_version?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_legal_basis_id_fkey"
            columns: ["legal_basis_id"]
            isOneToOne: false
            referencedRelation: "legal_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      data_discovery_results: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data_category: string
          data_type: string
          discovered_at: string | null
          estimated_records: number | null
          field_name: string | null
          file_path: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          sample_data: string | null
          sensitivity_level: string
          source_id: string
          status: string
          table_name: string | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data_category: string
          data_type: string
          discovered_at?: string | null
          estimated_records?: number | null
          field_name?: string | null
          file_path?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_data?: string | null
          sensitivity_level: string
          source_id: string
          status?: string
          table_name?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data_category?: string
          data_type?: string
          discovered_at?: string | null
          estimated_records?: number | null
          field_name?: string | null
          file_path?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_data?: string | null
          sensitivity_level?: string
          source_id?: string
          status?: string
          table_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_discovery_results_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_discovery_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      data_discovery_sources: {
        Row: {
          connection_string: string | null
          created_at: string | null
          created_by: string
          credentials_stored: boolean | null
          data_steward_id: string | null
          description: string | null
          id: string
          last_scan_at: string | null
          location: string
          name: string
          scan_frequency: string | null
          status: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          connection_string?: string | null
          created_at?: string | null
          created_by: string
          credentials_stored?: boolean | null
          data_steward_id?: string | null
          description?: string | null
          id?: string
          last_scan_at?: string | null
          location: string
          name: string
          scan_frequency?: string | null
          status?: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          connection_string?: string | null
          created_at?: string | null
          created_by?: string
          credentials_stored?: boolean | null
          data_steward_id?: string | null
          description?: string | null
          id?: string
          last_scan_at?: string | null
          location?: string
          name?: string
          scan_frequency?: string | null
          status?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      data_inventory: {
        Row: {
          created_at: string | null
          created_by: string
          data_category: string
          data_controller_id: string
          data_origin: string
          data_processor_id: string | null
          data_steward_id: string
          data_types: string[]
          database_name: string | null
          description: string
          estimated_volume: number | null
          file_locations: string[] | null
          id: string
          last_reviewed_at: string | null
          name: string
          next_review_date: string | null
          retention_justification: string | null
          retention_period_months: number | null
          sensitivity_level: string
          status: string
          system_name: string
          table_field_names: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          data_category: string
          data_controller_id: string
          data_origin: string
          data_processor_id?: string | null
          data_steward_id: string
          data_types: string[]
          database_name?: string | null
          description: string
          estimated_volume?: number | null
          file_locations?: string[] | null
          id?: string
          last_reviewed_at?: string | null
          name: string
          next_review_date?: string | null
          retention_justification?: string | null
          retention_period_months?: number | null
          sensitivity_level: string
          status?: string
          system_name: string
          table_field_names?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          data_category?: string
          data_controller_id?: string
          data_origin?: string
          data_processor_id?: string | null
          data_steward_id?: string
          data_types?: string[]
          database_name?: string | null
          description?: string
          estimated_volume?: number | null
          file_locations?: string[] | null
          id?: string
          last_reviewed_at?: string | null
          name?: string
          next_review_date?: string | null
          retention_justification?: string | null
          retention_period_months?: number | null
          sensitivity_level?: string
          status?: string
          system_name?: string
          table_field_names?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      data_subject_requests: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          data_categories: string[] | null
          due_date: string
          escalated: boolean | null
          escalated_at: string | null
          escalated_to: string | null
          escalation_reason: string | null
          id: string
          identity_verified: boolean | null
          internal_notes: string | null
          received_at: string | null
          request_description: string | null
          request_type: string
          requester_document: string | null
          requester_email: string
          requester_name: string
          requester_phone: string | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          response_attachments: string[] | null
          response_method: string | null
          specific_data_requested: string | null
          status: string
          updated_at: string | null
          updated_by: string | null
          verification_documents: string[] | null
          verification_method: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: string[] | null
          due_date: string
          escalated?: boolean | null
          escalated_at?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          id?: string
          identity_verified?: boolean | null
          internal_notes?: string | null
          received_at?: string | null
          request_description?: string | null
          request_type: string
          requester_document?: string | null
          requester_email: string
          requester_name: string
          requester_phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_attachments?: string[] | null
          response_method?: string | null
          specific_data_requested?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          verification_documents?: string[] | null
          verification_method?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: string[] | null
          due_date?: string
          escalated?: boolean | null
          escalated_at?: string | null
          escalated_to?: string | null
          escalation_reason?: string | null
          id?: string
          identity_verified?: boolean | null
          internal_notes?: string | null
          received_at?: string | null
          request_description?: string | null
          request_type?: string
          requester_document?: string | null
          requester_email?: string
          requester_name?: string
          requester_phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          response_attachments?: string[] | null
          response_method?: string | null
          specific_data_requested?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          verification_documents?: string[] | null
          verification_method?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      dpia_assessments: {
        Row: {
          anpd_consultation_date: string | null
          anpd_consultation_required: boolean | null
          anpd_recommendation: string | null
          anpd_response_date: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          conducted_by: string
          created_at: string | null
          created_by: string
          description: string
          dpia_justification: string
          dpia_required: boolean
          dpo_id: string | null
          id: string
          impact_assessment: number | null
          involves_automated_decisions: boolean
          involves_high_risk: boolean
          involves_large_scale: boolean
          involves_new_technology: boolean
          involves_profiling: boolean
          involves_sensitive_data: boolean
          involves_vulnerable_individuals: boolean
          likelihood_assessment: number | null
          mitigation_measures: string[] | null
          privacy_risks: string[] | null
          processing_activity_id: string | null
          residual_risk_level: string | null
          reviewed_by: string | null
          risk_level: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          anpd_consultation_date?: string | null
          anpd_consultation_required?: boolean | null
          anpd_recommendation?: string | null
          anpd_response_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          conducted_by: string
          created_at?: string | null
          created_by: string
          description: string
          dpia_justification: string
          dpia_required?: boolean
          dpo_id?: string | null
          id?: string
          impact_assessment?: number | null
          involves_automated_decisions?: boolean
          involves_high_risk?: boolean
          involves_large_scale?: boolean
          involves_new_technology?: boolean
          involves_profiling?: boolean
          involves_sensitive_data?: boolean
          involves_vulnerable_individuals?: boolean
          likelihood_assessment?: number | null
          mitigation_measures?: string[] | null
          privacy_risks?: string[] | null
          processing_activity_id?: string | null
          residual_risk_level?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          anpd_consultation_date?: string | null
          anpd_consultation_required?: boolean | null
          anpd_recommendation?: string | null
          anpd_response_date?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          conducted_by?: string
          created_at?: string | null
          created_by?: string
          description?: string
          dpia_justification?: string
          dpia_required?: boolean
          dpo_id?: string | null
          id?: string
          impact_assessment?: number | null
          involves_automated_decisions?: boolean
          involves_high_risk?: boolean
          involves_large_scale?: boolean
          involves_new_technology?: boolean
          involves_profiling?: boolean
          involves_sensitive_data?: boolean
          involves_vulnerable_individuals?: boolean
          likelihood_assessment?: number | null
          mitigation_measures?: string[] | null
          privacy_risks?: string[] | null
          processing_activity_id?: string | null
          residual_risk_level?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dpia_assessments_processing_activity_id_fkey"
            columns: ["processing_activity_id"]
            isOneToOne: false
            referencedRelation: "processing_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_bases: {
        Row: {
          applies_to_categories: string[]
          applies_to_processing: string[]
          created_at: string | null
          created_by: string
          description: string
          id: string
          justification: string
          legal_article: string
          legal_basis_type: string
          legal_responsible_id: string
          name: string
          status: string
          updated_at: string | null
          updated_by: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to_categories: string[]
          applies_to_processing: string[]
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          justification: string
          legal_article: string
          legal_basis_type: string
          legal_responsible_id: string
          name: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          valid_from: string
          valid_until?: string | null
        }
        Update: {
          applies_to_categories?: string[]
          applies_to_processing?: string[]
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          justification?: string
          legal_article?: string
          legal_basis_type?: string
          legal_responsible_id?: string
          name?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      privacy_audits: {
        Row: {
          action_plan_due_date: string | null
          actual_end_date: string | null
          actual_start_date: string | null
          audit_criteria: string[] | null
          audit_framework: string | null
          audit_procedures: string[] | null
          audit_report_url: string | null
          audit_team_ids: string[] | null
          audit_type: string
          auditee_area: string
          auditee_responsible_id: string
          corrective_actions: string[] | null
          created_at: string | null
          created_by: string
          description: string | null
          evidence_documents: string[] | null
          findings: string[] | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          lead_auditor_id: string
          non_conformities: string[] | null
          opportunities_improvement: string[] | null
          overall_rating: string | null
          planned_end_date: string
          planned_start_date: string
          scope: string
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          action_plan_due_date?: string | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          audit_criteria?: string[] | null
          audit_framework?: string | null
          audit_procedures?: string[] | null
          audit_report_url?: string | null
          audit_team_ids?: string[] | null
          audit_type: string
          auditee_area: string
          auditee_responsible_id: string
          corrective_actions?: string[] | null
          created_at?: string | null
          created_by: string
          description?: string | null
          evidence_documents?: string[] | null
          findings?: string[] | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          lead_auditor_id: string
          non_conformities?: string[] | null
          opportunities_improvement?: string[] | null
          overall_rating?: string | null
          planned_end_date: string
          planned_start_date: string
          scope: string
          status?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          action_plan_due_date?: string | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          audit_criteria?: string[] | null
          audit_framework?: string | null
          audit_procedures?: string[] | null
          audit_report_url?: string | null
          audit_team_ids?: string[] | null
          audit_type?: string
          auditee_area?: string
          auditee_responsible_id?: string
          corrective_actions?: string[] | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          evidence_documents?: string[] | null
          findings?: string[] | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          lead_auditor_id?: string
          non_conformities?: string[] | null
          opportunities_improvement?: string[] | null
          overall_rating?: string | null
          planned_end_date?: string
          planned_start_date?: string
          scope?: string
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      privacy_incidents: {
        Row: {
          affected_data_categories: string[]
          anpd_notification_date: string | null
          anpd_notification_required: boolean | null
          anpd_notified: boolean | null
          anpd_reference_number: string | null
          anpd_response_date: string | null
          anpd_response_received: boolean | null
          closed_at: string | null
          contained_at: string | null
          containment_measures: string[] | null
          corrective_actions: string[] | null
          created_at: string | null
          created_by: string
          data_subjects_notification_date: string | null
          data_subjects_notification_required: boolean | null
          data_subjects_notified: boolean | null
          description: string
          discovered_at: string
          discovered_by: string | null
          dpo_id: string | null
          estimated_affected_individuals: number | null
          financial_impact: number | null
          id: string
          impact_description: string | null
          incident_manager_id: string
          incident_source: string | null
          incident_type: string
          internal_notification_sent: boolean | null
          internal_notified_at: string | null
          investigation_findings: string | null
          legal_team_notified: boolean | null
          notification_method: string | null
          occurred_at: string | null
          regulatory_impact_risk: string | null
          reputational_impact: string | null
          root_cause: string | null
          severity_level: string
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          affected_data_categories: string[]
          anpd_notification_date?: string | null
          anpd_notification_required?: boolean | null
          anpd_notified?: boolean | null
          anpd_reference_number?: string | null
          anpd_response_date?: string | null
          anpd_response_received?: boolean | null
          closed_at?: string | null
          contained_at?: string | null
          containment_measures?: string[] | null
          corrective_actions?: string[] | null
          created_at?: string | null
          created_by: string
          data_subjects_notification_date?: string | null
          data_subjects_notification_required?: boolean | null
          data_subjects_notified?: boolean | null
          description: string
          discovered_at: string
          discovered_by?: string | null
          dpo_id?: string | null
          estimated_affected_individuals?: number | null
          financial_impact?: number | null
          id?: string
          impact_description?: string | null
          incident_manager_id: string
          incident_source?: string | null
          incident_type: string
          internal_notification_sent?: boolean | null
          internal_notified_at?: string | null
          investigation_findings?: string | null
          legal_team_notified?: boolean | null
          notification_method?: string | null
          occurred_at?: string | null
          regulatory_impact_risk?: string | null
          reputational_impact?: string | null
          root_cause?: string | null
          severity_level: string
          status?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          affected_data_categories?: string[]
          anpd_notification_date?: string | null
          anpd_notification_required?: boolean | null
          anpd_notified?: boolean | null
          anpd_reference_number?: string | null
          anpd_response_date?: string | null
          anpd_response_received?: boolean | null
          closed_at?: string | null
          contained_at?: string | null
          containment_measures?: string[] | null
          corrective_actions?: string[] | null
          created_at?: string | null
          created_by?: string
          data_subjects_notification_date?: string | null
          data_subjects_notification_required?: boolean | null
          data_subjects_notified?: boolean | null
          description?: string
          discovered_at?: string
          discovered_by?: string | null
          dpo_id?: string | null
          estimated_affected_individuals?: number | null
          financial_impact?: number | null
          id?: string
          impact_description?: string | null
          incident_manager_id?: string
          incident_source?: string | null
          incident_type?: string
          internal_notification_sent?: boolean | null
          internal_notified_at?: string | null
          investigation_findings?: string | null
          legal_team_notified?: boolean | null
          notification_method?: string | null
          occurred_at?: string | null
          regulatory_impact_risk?: string | null
          reputational_impact?: string | null
          root_cause?: string | null
          severity_level?: string
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      privacy_training: {
        Row: {
          assessment_score: number | null
          certificate_url: string | null
          certificate_valid_until: string | null
          certification_issued: boolean | null
          completed_date: string | null
          completion_method: string | null
          content_topics: string[]
          created_at: string | null
          created_by: string
          description: string | null
          duration_hours: number
          id: string
          instructor_id: string | null
          participant_id: string
          scheduled_date: string | null
          status: string
          target_audience: string[]
          title: string
          training_materials: string[] | null
          training_type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assessment_score?: number | null
          certificate_url?: string | null
          certificate_valid_until?: string | null
          certification_issued?: boolean | null
          completed_date?: string | null
          completion_method?: string | null
          content_topics: string[]
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_hours: number
          id?: string
          instructor_id?: string | null
          participant_id: string
          scheduled_date?: string | null
          status?: string
          target_audience: string[]
          title: string
          training_materials?: string[] | null
          training_type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assessment_score?: number | null
          certificate_url?: string | null
          certificate_valid_until?: string | null
          certification_issued?: boolean | null
          completed_date?: string | null
          completion_method?: string | null
          content_topics?: string[]
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_hours?: number
          id?: string
          instructor_id?: string | null
          participant_id?: string
          scheduled_date?: string | null
          status?: string
          target_audience?: string[]
          title?: string
          training_materials?: string[] | null
          training_type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      processing_activities: {
        Row: {
          created_at: string | null
          created_by: string
          data_categories: string[]
          data_controller_contact: string
          data_controller_name: string
          data_processor_contact: string | null
          data_processor_name: string | null
          data_protection_officer_id: string | null
          data_sharing_third_parties: string[] | null
          data_subjects_categories: string[]
          data_types: string[]
          deletion_procedure: string | null
          description: string
          id: string
          international_transfer: boolean | null
          international_transfer_countries: string[] | null
          international_transfer_safeguards: string | null
          last_reviewed_at: string | null
          legal_basis_id: string
          legal_basis_justification: string
          name: string
          next_review_date: string
          organizational_measures: string | null
          purpose: string
          responsible_area: string
          responsible_person_id: string
          retention_criteria: string
          retention_period_months: number
          security_measures: string[]
          status: string
          technical_measures: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          data_categories: string[]
          data_controller_contact: string
          data_controller_name: string
          data_processor_contact?: string | null
          data_processor_name?: string | null
          data_protection_officer_id?: string | null
          data_sharing_third_parties?: string[] | null
          data_subjects_categories: string[]
          data_types: string[]
          deletion_procedure?: string | null
          description: string
          id?: string
          international_transfer?: boolean | null
          international_transfer_countries?: string[] | null
          international_transfer_safeguards?: string | null
          last_reviewed_at?: string | null
          legal_basis_id: string
          legal_basis_justification: string
          name: string
          next_review_date: string
          organizational_measures?: string | null
          purpose: string
          responsible_area: string
          responsible_person_id: string
          retention_criteria: string
          retention_period_months: number
          security_measures: string[]
          status?: string
          technical_measures?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          data_categories?: string[]
          data_controller_contact?: string
          data_controller_name?: string
          data_processor_contact?: string | null
          data_processor_name?: string | null
          data_protection_officer_id?: string | null
          data_sharing_third_parties?: string[] | null
          data_subjects_categories?: string[]
          data_types?: string[]
          deletion_procedure?: string | null
          description?: string
          id?: string
          international_transfer?: boolean | null
          international_transfer_countries?: string[] | null
          international_transfer_safeguards?: string | null
          last_reviewed_at?: string | null
          legal_basis_id?: string
          legal_basis_justification?: string
          name?: string
          next_review_date?: string
          organizational_measures?: string | null
          purpose?: string
          responsible_area?: string
          responsible_person_id?: string
          retention_criteria?: string
          retention_period_months?: number
          security_measures?: string[]
          status?: string
          technical_measures?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_activities_legal_basis_id_fkey"
            columns: ["legal_basis_id"]
            isOneToOne: false
            referencedRelation: "legal_bases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_privacy_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_lgpd_compliance: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_privacy_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

