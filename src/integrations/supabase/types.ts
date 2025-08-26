export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      ai_configurations: {
        Row: {
          allowed_domains: Json | null
          context_window: number | null
          created_at: string | null
          created_by: string | null
          default_provider: string
          description: string | null
          enable_audit_logging: boolean | null
          enable_content_filtering: boolean | null
          enable_context_memory: boolean | null
          enable_conversation_history: boolean | null
          enable_pii_detection: boolean | null
          id: string
          max_conversation_turns: number | null
          max_requests_per_minute: number | null
          max_tokens_per_day: number | null
          max_tokens_per_request: number | null
          module_settings: Json | null
          name: string
          require_approval_for_sensitive: boolean | null
          temperature: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          allowed_domains?: Json | null
          context_window?: number | null
          created_at?: string | null
          created_by?: string | null
          default_provider?: string
          description?: string | null
          enable_audit_logging?: boolean | null
          enable_content_filtering?: boolean | null
          enable_context_memory?: boolean | null
          enable_conversation_history?: boolean | null
          enable_pii_detection?: boolean | null
          id?: string
          max_conversation_turns?: number | null
          max_requests_per_minute?: number | null
          max_tokens_per_day?: number | null
          max_tokens_per_request?: number | null
          module_settings?: Json | null
          name: string
          require_approval_for_sensitive?: boolean | null
          temperature?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allowed_domains?: Json | null
          context_window?: number | null
          created_at?: string | null
          created_by?: string | null
          default_provider?: string
          description?: string | null
          enable_audit_logging?: boolean | null
          enable_content_filtering?: boolean | null
          enable_context_memory?: boolean | null
          enable_conversation_history?: boolean | null
          enable_pii_detection?: boolean | null
          id?: string
          max_conversation_turns?: number | null
          max_requests_per_minute?: number | null
          max_tokens_per_day?: number | null
          max_tokens_per_request?: number | null
          module_settings?: Json | null
          name?: string
          require_approval_for_sensitive?: boolean | null
          temperature?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversation_contexts: {
        Row: {
          context_name: string | null
          conversation_history: Json | null
          created_at: string | null
          current_turn: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_turns: number | null
          module_name: string
          provider_id: string | null
          session_id: string
          system_context: Json | null
          tenant_id: string | null
          total_cost_usd: number | null
          total_tokens_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context_name?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          current_turn?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_turns?: number | null
          module_name: string
          provider_id?: string | null
          session_id: string
          system_context?: Json | null
          tenant_id?: string | null
          total_cost_usd?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context_name?: string | null
          conversation_history?: Json | null
          created_at?: string | null
          current_turn?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_turns?: number | null
          module_name?: string
          provider_id?: string | null
          session_id?: string
          system_context?: Json | null
          tenant_id?: string | null
          total_cost_usd?: number | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_contexts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_grc_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversation_contexts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_grc_prompt_templates: {
        Row: {
          applicable_frameworks: Json | null
          approved_at: string | null
          approved_by: string | null
          avg_quality_rating: number | null
          category: string
          changelog: string | null
          compliance_domains: Json | null
          created_at: string | null
          created_by: string | null
          description: string
          expected_output_format: string | null
          id: string
          is_active: boolean | null
          is_global: boolean | null
          is_public: boolean | null
          maturity_levels: Json | null
          max_output_tokens: number | null
          min_context_window: number | null
          name: string
          quality_score: number | null
          recommended_model: string | null
          recommended_temperature: number | null
          requires_approval: boolean | null
          risk_categories: Json | null
          success_rate: number | null
          template_content: string
          title: string
          updated_at: string | null
          usage_count: number | null
          use_case: string
          validation_criteria: Json | null
          variables: Json | null
          version: string | null
        }
        Insert: {
          applicable_frameworks?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          avg_quality_rating?: number | null
          category: string
          changelog?: string | null
          compliance_domains?: Json | null
          created_at?: string | null
          created_by?: string | null
          description: string
          expected_output_format?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          is_public?: boolean | null
          maturity_levels?: Json | null
          max_output_tokens?: number | null
          min_context_window?: number | null
          name: string
          quality_score?: number | null
          recommended_model?: string | null
          recommended_temperature?: number | null
          requires_approval?: boolean | null
          risk_categories?: Json | null
          success_rate?: number | null
          template_content: string
          title: string
          updated_at?: string | null
          usage_count?: number | null
          use_case: string
          validation_criteria?: Json | null
          variables?: Json | null
          version?: string | null
        }
        Update: {
          applicable_frameworks?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          avg_quality_rating?: number | null
          category?: string
          changelog?: string | null
          compliance_domains?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          expected_output_format?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          is_public?: boolean | null
          maturity_levels?: Json | null
          max_output_tokens?: number | null
          min_context_window?: number | null
          name?: string
          quality_score?: number | null
          recommended_model?: string | null
          recommended_temperature?: number | null
          requires_approval?: boolean | null
          risk_categories?: Json | null
          success_rate?: number | null
          template_content?: string
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          use_case?: string
          validation_criteria?: Json | null
          variables?: Json | null
          version?: string | null
        }
        Relationships: []
      }
      ai_grc_providers: {
        Row: {
          api_key_encrypted: string
          api_version: string | null
          avg_response_time_ms: number | null
          compliance_frameworks: Json | null
          context_window: number | null
          cost_usd_today: number | null
          created_at: string | null
          created_by: string | null
          endpoint_url: string | null
          failed_requests: number | null
          fallback_on_error: boolean | null
          fallback_on_rate_limit: boolean | null
          fallback_provider_id: string | null
          frequency_penalty: number | null
          grc_specialization: Json | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_request_at: string | null
          max_output_tokens: number | null
          model_name: string
          name: string
          organization_id: string | null
          presence_penalty: number | null
          priority: number | null
          project_id: string | null
          provider_type: string
          risk_assessment_capabilities: Json | null
          successful_requests: number | null
          supported_modules: Json | null
          temperature: number | null
          tenant_id: string | null
          tokens_used_today: number | null
          top_k: number | null
          top_p: number | null
          total_requests: number | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted: string
          api_version?: string | null
          avg_response_time_ms?: number | null
          compliance_frameworks?: Json | null
          context_window?: number | null
          cost_usd_today?: number | null
          created_at?: string | null
          created_by?: string | null
          endpoint_url?: string | null
          failed_requests?: number | null
          fallback_on_error?: boolean | null
          fallback_on_rate_limit?: boolean | null
          fallback_provider_id?: string | null
          frequency_penalty?: number | null
          grc_specialization?: Json | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_request_at?: string | null
          max_output_tokens?: number | null
          model_name: string
          name: string
          organization_id?: string | null
          presence_penalty?: number | null
          priority?: number | null
          project_id?: string | null
          provider_type: string
          risk_assessment_capabilities?: Json | null
          successful_requests?: number | null
          supported_modules?: Json | null
          temperature?: number | null
          tenant_id?: string | null
          tokens_used_today?: number | null
          top_k?: number | null
          top_p?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string
          api_version?: string | null
          avg_response_time_ms?: number | null
          compliance_frameworks?: Json | null
          context_window?: number | null
          cost_usd_today?: number | null
          created_at?: string | null
          created_by?: string | null
          endpoint_url?: string | null
          failed_requests?: number | null
          fallback_on_error?: boolean | null
          fallback_on_rate_limit?: boolean | null
          fallback_provider_id?: string | null
          frequency_penalty?: number | null
          grc_specialization?: Json | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_request_at?: string | null
          max_output_tokens?: number | null
          model_name?: string
          name?: string
          organization_id?: string | null
          presence_penalty?: number | null
          priority?: number | null
          project_id?: string | null
          provider_type?: string
          risk_assessment_capabilities?: Json | null
          successful_requests?: number | null
          supported_modules?: Json | null
          temperature?: number | null
          tenant_id?: string | null
          tokens_used_today?: number | null
          top_k?: number | null
          top_p?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_grc_providers_fallback_provider_id_fkey"
            columns: ["fallback_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_grc_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_grc_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_module_prompts: {
        Row: {
          avg_execution_time_ms: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          grc_context: Json | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_sensitive: boolean | null
          last_used_at: string | null
          max_tokens: number | null
          module_name: string
          output_format: string | null
          parent_prompt_id: string | null
          prompt_content: string
          prompt_name: string
          prompt_type: string
          required_data_sources: Json | null
          requires_approval: boolean | null
          success_rate: number | null
          temperature: number | null
          tenant_id: string | null
          title: string
          updated_at: string | null
          usage_count: number | null
          version: number | null
        }
        Insert: {
          avg_execution_time_ms?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          grc_context?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_sensitive?: boolean | null
          last_used_at?: string | null
          max_tokens?: number | null
          module_name: string
          output_format?: string | null
          parent_prompt_id?: string | null
          prompt_content: string
          prompt_name: string
          prompt_type: string
          required_data_sources?: Json | null
          requires_approval?: boolean | null
          success_rate?: number | null
          temperature?: number | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          version?: number | null
        }
        Update: {
          avg_execution_time_ms?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          grc_context?: Json | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_sensitive?: boolean | null
          last_used_at?: string | null
          max_tokens?: number | null
          module_name?: string
          output_format?: string | null
          parent_prompt_id?: string | null
          prompt_content?: string
          prompt_name?: string
          prompt_type?: string
          required_data_sources?: Json | null
          requires_approval?: boolean | null
          success_rate?: number | null
          temperature?: number | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_module_prompts_parent_prompt_id_fkey"
            columns: ["parent_prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_module_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_module_prompts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          approved_by: string | null
          compliance_check_passed: boolean | null
          compliance_notes: string | null
          contains_pii: boolean | null
          contains_sensitive: boolean | null
          cost_usd: number | null
          created_at: string | null
          error_details: string | null
          has_errors: boolean | null
          id: string
          input_prompt_encrypted: string | null
          module_name: string
          operation_type: string
          output_response_encrypted: string | null
          prompt_id: string | null
          provider_id: string | null
          quality_score: number | null
          request_id: string
          response_time_ms: number | null
          retention_period_days: number | null
          session_id: string | null
          template_id: string | null
          tenant_id: string | null
          tokens_input: number | null
          tokens_output: number | null
          user_feedback: string | null
          user_id: string | null
          was_approved: boolean | null
        }
        Insert: {
          approved_by?: string | null
          compliance_check_passed?: boolean | null
          compliance_notes?: string | null
          contains_pii?: boolean | null
          contains_sensitive?: boolean | null
          cost_usd?: number | null
          created_at?: string | null
          error_details?: string | null
          has_errors?: boolean | null
          id?: string
          input_prompt_encrypted?: string | null
          module_name: string
          operation_type: string
          output_response_encrypted?: string | null
          prompt_id?: string | null
          provider_id?: string | null
          quality_score?: number | null
          request_id: string
          response_time_ms?: number | null
          retention_period_days?: number | null
          session_id?: string | null
          template_id?: string | null
          tenant_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_feedback?: string | null
          user_id?: string | null
          was_approved?: boolean | null
        }
        Update: {
          approved_by?: string | null
          compliance_check_passed?: boolean | null
          compliance_notes?: string | null
          contains_pii?: boolean | null
          contains_sensitive?: boolean | null
          cost_usd?: number | null
          created_at?: string | null
          error_details?: string | null
          has_errors?: boolean | null
          id?: string
          input_prompt_encrypted?: string | null
          module_name?: string
          operation_type?: string
          output_response_encrypted?: string | null
          prompt_id?: string | null
          provider_id?: string | null
          quality_score?: number | null
          request_id?: string
          response_time_ms?: number | null
          retention_period_days?: number | null
          session_id?: string | null
          template_id?: string | null
          tenant_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_feedback?: string | null
          user_id?: string | null
          was_approved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_prompt_fk"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_module_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_provider_fk"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_grc_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_template_fk"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "ai_grc_prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workflows: {
        Row: {
          auto_approve: boolean | null
          avg_execution_time_minutes: number | null
          created_at: string | null
          created_by: string | null
          default_provider_id: string | null
          description: string | null
          executions_count: number | null
          failed_executions: number | null
          id: string
          is_active: boolean | null
          last_execution_at: string | null
          max_execution_time_minutes: number | null
          name: string
          requires_human_review: boolean | null
          schedule_cron: string | null
          successful_executions: number | null
          tenant_id: string | null
          trigger_events: Json | null
          updated_at: string | null
          workflow_steps: Json | null
          workflow_type: string
        }
        Insert: {
          auto_approve?: boolean | null
          avg_execution_time_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          default_provider_id?: string | null
          description?: string | null
          executions_count?: number | null
          failed_executions?: number | null
          id?: string
          is_active?: boolean | null
          last_execution_at?: string | null
          max_execution_time_minutes?: number | null
          name: string
          requires_human_review?: boolean | null
          schedule_cron?: string | null
          successful_executions?: number | null
          tenant_id?: string | null
          trigger_events?: Json | null
          updated_at?: string | null
          workflow_steps?: Json | null
          workflow_type: string
        }
        Update: {
          auto_approve?: boolean | null
          avg_execution_time_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          default_provider_id?: string | null
          description?: string | null
          executions_count?: number | null
          failed_executions?: number | null
          id?: string
          is_active?: boolean | null
          last_execution_at?: string | null
          max_execution_time_minutes?: number | null
          name?: string
          requires_human_review?: boolean | null
          schedule_cron?: string | null
          successful_executions?: number | null
          tenant_id?: string | null
          trigger_events?: Json | null
          updated_at?: string | null
          workflow_steps?: Json | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workflows_default_provider_id_fkey"
            columns: ["default_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_grc_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workflows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_connections: {
        Row: {
          api_key_encrypted: string | null
          api_type: string
          auth_type: string
          avg_response_time_ms: number | null
          base_url: string
          bearer_token_encrypted: string | null
          created_at: string | null
          created_by: string | null
          failed_requests: number | null
          headers: Json | null
          id: string
          integration_id: string | null
          last_request_at: string | null
          name: string
          oauth2_config: Json | null
          password_encrypted: string | null
          rate_limit_per_minute: number | null
          retry_attempts: number | null
          retry_delay_seconds: number | null
          successful_requests: number | null
          tenant_id: string | null
          timeout_seconds: number | null
          total_requests: number | null
          updated_at: string | null
          username_encrypted: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_type: string
          auth_type: string
          avg_response_time_ms?: number | null
          base_url: string
          bearer_token_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_requests?: number | null
          headers?: Json | null
          id?: string
          integration_id?: string | null
          last_request_at?: string | null
          name: string
          oauth2_config?: Json | null
          password_encrypted?: string | null
          rate_limit_per_minute?: number | null
          retry_attempts?: number | null
          retry_delay_seconds?: number | null
          successful_requests?: number | null
          tenant_id?: string | null
          timeout_seconds?: number | null
          total_requests?: number | null
          updated_at?: string | null
          username_encrypted?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_type?: string
          auth_type?: string
          avg_response_time_ms?: number | null
          base_url?: string
          bearer_token_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          failed_requests?: number | null
          headers?: Json | null
          id?: string
          integration_id?: string | null
          last_request_at?: string | null
          name?: string
          oauth2_config?: Json | null
          password_encrypted?: string | null
          rate_limit_per_minute?: number | null
          retry_attempts?: number | null
          retry_delay_seconds?: number | null
          successful_requests?: number | null
          tenant_id?: string | null
          timeout_seconds?: number | null
          total_requests?: number | null
          updated_at?: string | null
          username_encrypted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_connections_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_evidence: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          response_id: string
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "assessment_evidence_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "assessment_responses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: string
          tenant_id?: string | null
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
          {
            foreignKeyName: "assessment_user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      audit_action_items: {
        Row: {
          completion_date: string | null
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          finding_id: string
          id: string
          owner_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          finding_id: string
          id?: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          finding_id?: string
          id?: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_action_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_action_items_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "audit_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_action_items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_attachments: {
        Row: {
          audit_id: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          filename: string
          finding_id: string | null
          id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          audit_id: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          filename: string
          finding_id?: string | null
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          audit_id?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          filename?: string
          finding_id?: string | null
          id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_attachments_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_attachments_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "audit_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_findings: {
        Row: {
          audit_id: string
          control_reference: string | null
          created_at: string
          created_by: string | null
          description: string | null
          evidence: Json | null
          id: string
          implication: string | null
          risk_rating: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audit_id: string
          control_reference?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          implication?: string | null
          risk_rating?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audit_id?: string
          control_reference?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          implication?: string | null
          risk_rating?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      audit_team_members: {
        Row: {
          added_at: string
          added_by: string | null
          audit_id: string
          id: string
          responsibilities: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          audit_id: string
          id?: string
          responsibilities?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          audit_id?: string
          id?: string
          responsibilities?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_team_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_team_members_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audits: {
        Row: {
          audit_type: string
          auditor_id: string | null
          created_at: string
          created_by: string | null
          criteria: string | null
          end_date: string | null
          id: string
          objective: string | null
          report_date: string | null
          report_path: string | null
          report_url: string | null
          scope: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audit_type: string
          auditor_id?: string | null
          created_at?: string
          created_by?: string | null
          criteria?: string | null
          end_date?: string | null
          id?: string
          objective?: string | null
          report_date?: string | null
          report_path?: string | null
          report_url?: string | null
          scope?: string | null
          start_date?: string | null
          status: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audit_type?: string
          auditor_id?: string | null
          created_at?: string
          created_by?: string | null
          criteria?: string | null
          end_date?: string | null
          id?: string
          objective?: string | null
          report_date?: string | null
          report_path?: string | null
          report_url?: string | null
          scope?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_auditor_id_fkey"
            columns: ["auditor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audits_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      backup_configurations: {
        Row: {
          backup_size_bytes: number | null
          backup_type: string
          compression_enabled: boolean | null
          conflict_resolution: string | null
          created_at: string | null
          created_by: string | null
          destination_config: Json | null
          encryption_enabled: boolean | null
          encryption_key_encrypted: string | null
          failed_backups: number | null
          ftp_host: string | null
          ftp_password_encrypted: string | null
          ftp_path: string | null
          ftp_port: number | null
          ftp_username_encrypted: string | null
          gdrive_folder_id: string | null
          gdrive_service_account_encrypted: string | null
          id: string
          include_configurations: boolean | null
          include_database: boolean | null
          include_logs: boolean | null
          include_reports: boolean | null
          include_uploads: boolean | null
          integration_id: string | null
          is_active: boolean | null
          last_backup_at: string | null
          last_failure_at: string | null
          last_failure_reason: string | null
          last_success_at: string | null
          max_backups: number | null
          name: string
          retention_days: number | null
          s3_access_key_encrypted: string | null
          s3_bucket: string | null
          s3_prefix: string | null
          s3_region: string | null
          s3_secret_key_encrypted: string | null
          schedule_day_of_month: number | null
          schedule_day_of_week: number | null
          schedule_time: string | null
          schedule_type: string | null
          successful_backups: number | null
          sync_type: string | null
          tenant_id: string | null
          total_backups: number | null
          updated_at: string | null
        }
        Insert: {
          backup_size_bytes?: number | null
          backup_type: string
          compression_enabled?: boolean | null
          conflict_resolution?: string | null
          created_at?: string | null
          created_by?: string | null
          destination_config?: Json | null
          encryption_enabled?: boolean | null
          encryption_key_encrypted?: string | null
          failed_backups?: number | null
          ftp_host?: string | null
          ftp_password_encrypted?: string | null
          ftp_path?: string | null
          ftp_port?: number | null
          ftp_username_encrypted?: string | null
          gdrive_folder_id?: string | null
          gdrive_service_account_encrypted?: string | null
          id?: string
          include_configurations?: boolean | null
          include_database?: boolean | null
          include_logs?: boolean | null
          include_reports?: boolean | null
          include_uploads?: boolean | null
          integration_id?: string | null
          is_active?: boolean | null
          last_backup_at?: string | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_success_at?: string | null
          max_backups?: number | null
          name: string
          retention_days?: number | null
          s3_access_key_encrypted?: string | null
          s3_bucket?: string | null
          s3_prefix?: string | null
          s3_region?: string | null
          s3_secret_key_encrypted?: string | null
          schedule_day_of_month?: number | null
          schedule_day_of_week?: number | null
          schedule_time?: string | null
          schedule_type?: string | null
          successful_backups?: number | null
          sync_type?: string | null
          tenant_id?: string | null
          total_backups?: number | null
          updated_at?: string | null
        }
        Update: {
          backup_size_bytes?: number | null
          backup_type?: string
          compression_enabled?: boolean | null
          conflict_resolution?: string | null
          created_at?: string | null
          created_by?: string | null
          destination_config?: Json | null
          encryption_enabled?: boolean | null
          encryption_key_encrypted?: string | null
          failed_backups?: number | null
          ftp_host?: string | null
          ftp_password_encrypted?: string | null
          ftp_path?: string | null
          ftp_port?: number | null
          ftp_username_encrypted?: string | null
          gdrive_folder_id?: string | null
          gdrive_service_account_encrypted?: string | null
          id?: string
          include_configurations?: boolean | null
          include_database?: boolean | null
          include_logs?: boolean | null
          include_reports?: boolean | null
          include_uploads?: boolean | null
          integration_id?: string | null
          is_active?: boolean | null
          last_backup_at?: string | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_success_at?: string | null
          max_backups?: number | null
          name?: string
          retention_days?: number | null
          s3_access_key_encrypted?: string | null
          s3_bucket?: string | null
          s3_prefix?: string | null
          s3_region?: string | null
          s3_secret_key_encrypted?: string | null
          schedule_day_of_month?: number | null
          schedule_day_of_week?: number | null
          schedule_time?: string | null
          schedule_type?: string | null
          successful_backups?: number | null
          sync_type?: string | null
          tenant_id?: string | null
          total_backups?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_configurations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          pdf_primary_color: string | null
          phone: string | null
          state: string | null
          tenant_id: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          pdf_primary_color?: string | null
          phone?: string | null
          state?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          pdf_primary_color?: string | null
          phone?: string | null
          state?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      consents: {
        Row: {
          collection_method: string | null
          collection_source: string | null
          created_at: string | null
          created_by: string | null
          data_categories: Json | null
          data_subject_document: string | null
          data_subject_email: string
          data_subject_name: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          is_free: boolean | null
          is_informed: boolean | null
          is_specific: boolean | null
          is_unambiguous: boolean | null
          language: string | null
          legal_basis_id: string | null
          privacy_policy_version: string | null
          purpose: string
          revoked_at: string | null
          status: string
          tenant_id: string | null
          terms_of_service_version: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          collection_method?: string | null
          collection_source?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: Json | null
          data_subject_document?: string | null
          data_subject_email: string
          data_subject_name?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_free?: boolean | null
          is_informed?: boolean | null
          is_specific?: boolean | null
          is_unambiguous?: boolean | null
          language?: string | null
          legal_basis_id?: string | null
          privacy_policy_version?: string | null
          purpose: string
          revoked_at?: string | null
          status?: string
          tenant_id?: string | null
          terms_of_service_version?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          collection_method?: string | null
          collection_source?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: Json | null
          data_subject_document?: string | null
          data_subject_email?: string
          data_subject_name?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_free?: boolean | null
          is_informed?: boolean | null
          is_specific?: boolean | null
          is_unambiguous?: boolean | null
          language?: string | null
          legal_basis_id?: string | null
          privacy_policy_version?: string | null
          purpose?: string
          revoked_at?: string | null
          status?: string
          tenant_id?: string | null
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
          {
            foreignKeyName: "consents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      custom_fonts: {
        Row: {
          created_at: string | null
          created_by: string | null
          display_name: string
          fallback_fonts: Json | null
          family: string
          font_styles: Json | null
          font_url: string | null
          font_weights: Json
          id: string
          is_active: boolean | null
          is_google_font: boolean | null
          is_preload: boolean | null
          is_system_font: boolean | null
          name: string
          subsets: Json | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          display_name: string
          fallback_fonts?: Json | null
          family: string
          font_styles?: Json | null
          font_url?: string | null
          font_weights: Json
          id?: string
          is_active?: boolean | null
          is_google_font?: boolean | null
          is_preload?: boolean | null
          is_system_font?: boolean | null
          name: string
          subsets?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          display_name?: string
          fallback_fonts?: Json | null
          family?: string
          font_styles?: Json | null
          font_url?: string | null
          font_weights?: Json
          id?: string
          is_active?: boolean | null
          is_google_font?: boolean | null
          is_preload?: boolean | null
          is_system_font?: boolean | null
          name?: string
          subsets?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_fonts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          color: string
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          permissions: string[] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          permissions?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          permissions?: string[] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      data_inventory: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_category: string
          data_controller_id: string | null
          data_origin: string | null
          data_processor_id: string | null
          data_steward_id: string | null
          data_types: Json | null
          database_name: string | null
          description: string | null
          estimated_volume: number | null
          id: string
          name: string
          next_review_date: string | null
          retention_justification: string | null
          retention_period_months: number | null
          sensitivity_level: string | null
          status: string | null
          system_name: string | null
          table_field_names: Json | null
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_category: string
          data_controller_id?: string | null
          data_origin?: string | null
          data_processor_id?: string | null
          data_steward_id?: string | null
          data_types?: Json | null
          database_name?: string | null
          description?: string | null
          estimated_volume?: number | null
          id?: string
          name: string
          next_review_date?: string | null
          retention_justification?: string | null
          retention_period_months?: number | null
          sensitivity_level?: string | null
          status?: string | null
          system_name?: string | null
          table_field_names?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_category?: string
          data_controller_id?: string | null
          data_origin?: string | null
          data_processor_id?: string | null
          data_steward_id?: string | null
          data_types?: Json | null
          database_name?: string | null
          description?: string | null
          estimated_volume?: number | null
          id?: string
          name?: string
          next_review_date?: string | null
          retention_justification?: string | null
          retention_period_months?: number | null
          sensitivity_level?: string | null
          status?: string | null
          system_name?: string | null
          table_field_names?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_inventory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      data_subject_requests: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          channel: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          data_subject_document: string | null
          data_subject_email: string
          data_subject_name: string
          data_subject_phone: string | null
          description: string | null
          due_date: string | null
          estimated_response_date: string | null
          id: string
          priority: string | null
          request_type: string
          response_details: string | null
          status: string
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          verification_code: string | null
          verification_date: string | null
          verification_method: string | null
          verification_status: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          channel?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          data_subject_document?: string | null
          data_subject_email: string
          data_subject_name: string
          data_subject_phone?: string | null
          description?: string | null
          due_date?: string | null
          estimated_response_date?: string | null
          id?: string
          priority?: string | null
          request_type: string
          response_details?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_code?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          channel?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          data_subject_document?: string | null
          data_subject_email?: string
          data_subject_name?: string
          data_subject_phone?: string | null
          description?: string | null
          due_date?: string | null
          estimated_response_date?: string | null
          id?: string
          priority?: string | null
          request_type?: string
          response_details?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_code?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_subject_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dpia_assessments: {
        Row: {
          anpd_consultation_date: string | null
          anpd_consultation_reason: string | null
          anpd_consultation_required: boolean | null
          anpd_recommendation: string | null
          anpd_response_date: string | null
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          conducted_by: string | null
          created_at: string | null
          created_by: string
          data_categories: string[] | null
          description: string
          dpia_justification: string | null
          dpia_required: boolean | null
          dpo_id: string | null
          id: string
          impact_assessment: number | null
          involves_automated_decisions: boolean | null
          involves_high_risk: boolean | null
          involves_large_scale: boolean | null
          involves_new_technology: boolean | null
          involves_profiling: boolean | null
          involves_sensitive_data: boolean | null
          involves_vulnerable_individuals: boolean | null
          likelihood_assessment: number | null
          mitigation_measures: string[] | null
          name: string | null
          privacy_risks: string[] | null
          processing_activity_id: string | null
          purpose: string | null
          rejection_reason: string | null
          residual_risk_level: string | null
          reviewed_by: string | null
          risk_level: string
          scope: string | null
          started_at: string | null
          status: string
          tenant_id: string | null
          title: string
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          anpd_consultation_date?: string | null
          anpd_consultation_reason?: string | null
          anpd_consultation_required?: boolean | null
          anpd_recommendation?: string | null
          anpd_response_date?: string | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          conducted_by?: string | null
          created_at?: string | null
          created_by: string
          data_categories?: string[] | null
          description: string
          dpia_justification?: string | null
          dpia_required?: boolean | null
          dpo_id?: string | null
          id?: string
          impact_assessment?: number | null
          involves_automated_decisions?: boolean | null
          involves_high_risk?: boolean | null
          involves_large_scale?: boolean | null
          involves_new_technology?: boolean | null
          involves_profiling?: boolean | null
          involves_sensitive_data?: boolean | null
          involves_vulnerable_individuals?: boolean | null
          likelihood_assessment?: number | null
          mitigation_measures?: string[] | null
          name?: string | null
          privacy_risks?: string[] | null
          processing_activity_id?: string | null
          purpose?: string | null
          rejection_reason?: string | null
          residual_risk_level?: string | null
          reviewed_by?: string | null
          risk_level?: string
          scope?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          anpd_consultation_date?: string | null
          anpd_consultation_reason?: string | null
          anpd_consultation_required?: boolean | null
          anpd_recommendation?: string | null
          anpd_response_date?: string | null
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          conducted_by?: string | null
          created_at?: string | null
          created_by?: string
          data_categories?: string[] | null
          description?: string
          dpia_justification?: string | null
          dpia_required?: boolean | null
          dpo_id?: string | null
          id?: string
          impact_assessment?: number | null
          involves_automated_decisions?: boolean | null
          involves_high_risk?: boolean | null
          involves_large_scale?: boolean | null
          involves_new_technology?: boolean | null
          involves_profiling?: boolean | null
          involves_sensitive_data?: boolean | null
          involves_vulnerable_individuals?: boolean | null
          likelihood_assessment?: number | null
          mitigation_measures?: string[] | null
          name?: string | null
          privacy_risks?: string[] | null
          processing_activity_id?: string | null
          purpose?: string | null
          rejection_reason?: string | null
          residual_risk_level?: string | null
          reviewed_by?: string | null
          risk_level?: string
          scope?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dpia_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dpia_processing_activity"
            columns: ["processing_activity_id"]
            isOneToOne: false
            referencedRelation: "processing_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      email_providers: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          client_id_encrypted: string | null
          client_secret_encrypted: string | null
          created_at: string | null
          created_by: string | null
          emails_bounced: number | null
          emails_clicked: number | null
          emails_delivered: number | null
          emails_opened: number | null
          emails_sent_today: number | null
          from_email: string
          from_name: string | null
          id: string
          integration_id: string | null
          last_sent_at: string | null
          name: string
          provider_type: string
          rate_limit_per_hour: number | null
          region: string | null
          reply_to: string | null
          smtp_host: string | null
          smtp_password_encrypted: string | null
          smtp_port: number | null
          smtp_secure: boolean | null
          smtp_username_encrypted: string | null
          templates: Json | null
          tenant_id: string | null
          tenant_id_graph: string | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          client_id_encrypted?: string | null
          client_secret_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          emails_sent_today?: number | null
          from_email: string
          from_name?: string | null
          id?: string
          integration_id?: string | null
          last_sent_at?: string | null
          name: string
          provider_type: string
          rate_limit_per_hour?: number | null
          region?: string | null
          reply_to?: string | null
          smtp_host?: string | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username_encrypted?: string | null
          templates?: Json | null
          tenant_id?: string | null
          tenant_id_graph?: string | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          client_id_encrypted?: string | null
          client_secret_encrypted?: string | null
          created_at?: string | null
          created_by?: string | null
          emails_bounced?: number | null
          emails_clicked?: number | null
          emails_delivered?: number | null
          emails_opened?: number | null
          emails_sent_today?: number | null
          from_email?: string
          from_name?: string | null
          id?: string
          integration_id?: string | null
          last_sent_at?: string | null
          name?: string
          provider_type?: string
          rate_limit_per_hour?: number | null
          region?: string | null
          reply_to?: string | null
          smtp_host?: string | null
          smtp_password_encrypted?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username_encrypted?: string | null
          templates?: Json | null
          tenant_id?: string | null
          tenant_id_graph?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_providers_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      font_configurations: {
        Row: {
          created_at: string | null
          created_by: string | null
          family: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string | null
          url: string | null
          weights: number[] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          family: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string | null
          url?: string | null
          weights?: number[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          family?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string | null
          url?: string | null
          weights?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "font_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      global_ui_settings: {
        Row: {
          active_theme_id: string | null
          auto_dark_mode: boolean | null
          compact_mode: boolean | null
          company_name: string | null
          created_at: string | null
          created_by: string | null
          custom_css: string | null
          custom_js: string | null
          dark_mode_end_time: string | null
          dark_mode_start_time: string | null
          default_dark_mode: boolean | null
          desktop_breakpoint: number | null
          enable_animations: boolean | null
          enable_dark_mode_toggle: boolean | null
          favicon_url: string | null
          focus_indicators: boolean | null
          high_contrast_mode: boolean | null
          id: string
          keyboard_navigation: boolean | null
          logo_url: string | null
          mobile_breakpoint: number | null
          notification_duration: number | null
          reduce_motion: boolean | null
          show_toast_notifications: boolean | null
          sidebar_collapsed_default: boolean | null
          table_density: string | null
          tablet_breakpoint: number | null
          tenant_id: string | null
          toast_position: string | null
          updated_at: string | null
        }
        Insert: {
          active_theme_id?: string | null
          auto_dark_mode?: boolean | null
          compact_mode?: boolean | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          custom_js?: string | null
          dark_mode_end_time?: string | null
          dark_mode_start_time?: string | null
          default_dark_mode?: boolean | null
          desktop_breakpoint?: number | null
          enable_animations?: boolean | null
          enable_dark_mode_toggle?: boolean | null
          favicon_url?: string | null
          focus_indicators?: boolean | null
          high_contrast_mode?: boolean | null
          id?: string
          keyboard_navigation?: boolean | null
          logo_url?: string | null
          mobile_breakpoint?: number | null
          notification_duration?: number | null
          reduce_motion?: boolean | null
          show_toast_notifications?: boolean | null
          sidebar_collapsed_default?: boolean | null
          table_density?: string | null
          tablet_breakpoint?: number | null
          tenant_id?: string | null
          toast_position?: string | null
          updated_at?: string | null
        }
        Update: {
          active_theme_id?: string | null
          auto_dark_mode?: boolean | null
          compact_mode?: boolean | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          custom_js?: string | null
          dark_mode_end_time?: string | null
          dark_mode_start_time?: string | null
          default_dark_mode?: boolean | null
          desktop_breakpoint?: number | null
          enable_animations?: boolean | null
          enable_dark_mode_toggle?: boolean | null
          favicon_url?: string | null
          focus_indicators?: boolean | null
          high_contrast_mode?: boolean | null
          id?: string
          keyboard_navigation?: boolean | null
          logo_url?: string | null
          mobile_breakpoint?: number | null
          notification_duration?: number | null
          reduce_motion?: boolean | null
          show_toast_notifications?: boolean | null
          sidebar_collapsed_default?: boolean | null
          table_density?: string | null
          tablet_breakpoint?: number | null
          tenant_id?: string | null
          toast_position?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_ui_settings_active_theme_id_fkey"
            columns: ["active_theme_id"]
            isOneToOne: false
            referencedRelation: "global_ui_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_ui_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      global_ui_themes: {
        Row: {
          accent_color: string
          accent_foreground: string
          background_color: string
          background_color_dark: string | null
          border_color: string
          border_color_dark: string | null
          border_radius: number
          card_color: string
          card_color_dark: string | null
          card_foreground: string
          card_foreground_dark: string | null
          created_at: string | null
          created_by: string | null
          custom_css_variables: Json | null
          danger_color: string
          danger_foreground: string
          danger_light: string | null
          description: string | null
          destructive_color: string
          destructive_foreground: string
          display_name: string
          font_family: string
          font_size_base: number
          font_weights: Json | null
          foreground_color: string
          foreground_color_dark: string | null
          gradients: Json | null
          id: string
          input_color: string
          input_color_dark: string | null
          is_active: boolean | null
          is_dark_mode: boolean | null
          is_native_theme: boolean | null
          is_system_theme: boolean | null
          muted_color: string
          muted_color_dark: string | null
          muted_foreground: string
          muted_foreground_dark: string | null
          name: string
          popover_color: string
          popover_color_dark: string | null
          popover_foreground: string
          popover_foreground_dark: string | null
          primary_color: string
          primary_foreground: string
          primary_glow: string | null
          primary_hover: string | null
          ring_color: string
          risk_critical: string
          risk_high: string
          risk_low: string
          risk_medium: string
          secondary_color: string
          secondary_foreground: string
          shadow_intensity: number
          shadows: Json | null
          sidebar_accent: string
          sidebar_accent_foreground: string
          sidebar_background: string
          sidebar_border: string
          sidebar_foreground: string
          sidebar_primary: string
          sidebar_primary_foreground: string
          sidebar_ring: string
          success_color: string
          success_foreground: string
          success_light: string | null
          tenant_id: string | null
          transition_fast: string | null
          transition_slow: string | null
          transition_smooth: string | null
          updated_at: string | null
          version: string | null
          warning_color: string
          warning_foreground: string
          warning_light: string | null
        }
        Insert: {
          accent_color: string
          accent_foreground: string
          background_color: string
          background_color_dark?: string | null
          border_color: string
          border_color_dark?: string | null
          border_radius?: number
          card_color: string
          card_color_dark?: string | null
          card_foreground: string
          card_foreground_dark?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css_variables?: Json | null
          danger_color: string
          danger_foreground: string
          danger_light?: string | null
          description?: string | null
          destructive_color: string
          destructive_foreground: string
          display_name: string
          font_family?: string
          font_size_base?: number
          font_weights?: Json | null
          foreground_color: string
          foreground_color_dark?: string | null
          gradients?: Json | null
          id?: string
          input_color: string
          input_color_dark?: string | null
          is_active?: boolean | null
          is_dark_mode?: boolean | null
          is_native_theme?: boolean | null
          is_system_theme?: boolean | null
          muted_color: string
          muted_color_dark?: string | null
          muted_foreground: string
          muted_foreground_dark?: string | null
          name: string
          popover_color: string
          popover_color_dark?: string | null
          popover_foreground: string
          popover_foreground_dark?: string | null
          primary_color: string
          primary_foreground: string
          primary_glow?: string | null
          primary_hover?: string | null
          ring_color: string
          risk_critical: string
          risk_high: string
          risk_low: string
          risk_medium: string
          secondary_color: string
          secondary_foreground: string
          shadow_intensity?: number
          shadows?: Json | null
          sidebar_accent: string
          sidebar_accent_foreground: string
          sidebar_background: string
          sidebar_border: string
          sidebar_foreground: string
          sidebar_primary: string
          sidebar_primary_foreground: string
          sidebar_ring: string
          success_color: string
          success_foreground: string
          success_light?: string | null
          tenant_id?: string | null
          transition_fast?: string | null
          transition_slow?: string | null
          transition_smooth?: string | null
          updated_at?: string | null
          version?: string | null
          warning_color: string
          warning_foreground: string
          warning_light?: string | null
        }
        Update: {
          accent_color?: string
          accent_foreground?: string
          background_color?: string
          background_color_dark?: string | null
          border_color?: string
          border_color_dark?: string | null
          border_radius?: number
          card_color?: string
          card_color_dark?: string | null
          card_foreground?: string
          card_foreground_dark?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css_variables?: Json | null
          danger_color?: string
          danger_foreground?: string
          danger_light?: string | null
          description?: string | null
          destructive_color?: string
          destructive_foreground?: string
          display_name?: string
          font_family?: string
          font_size_base?: number
          font_weights?: Json | null
          foreground_color?: string
          foreground_color_dark?: string | null
          gradients?: Json | null
          id?: string
          input_color?: string
          input_color_dark?: string | null
          is_active?: boolean | null
          is_dark_mode?: boolean | null
          is_native_theme?: boolean | null
          is_system_theme?: boolean | null
          muted_color?: string
          muted_color_dark?: string | null
          muted_foreground?: string
          muted_foreground_dark?: string | null
          name?: string
          popover_color?: string
          popover_color_dark?: string | null
          popover_foreground?: string
          popover_foreground_dark?: string | null
          primary_color?: string
          primary_foreground?: string
          primary_glow?: string | null
          primary_hover?: string | null
          ring_color?: string
          risk_critical?: string
          risk_high?: string
          risk_low?: string
          risk_medium?: string
          secondary_color?: string
          secondary_foreground?: string
          shadow_intensity?: number
          shadows?: Json | null
          sidebar_accent?: string
          sidebar_accent_foreground?: string
          sidebar_background?: string
          sidebar_border?: string
          sidebar_foreground?: string
          sidebar_primary?: string
          sidebar_primary_foreground?: string
          sidebar_ring?: string
          success_color?: string
          success_foreground?: string
          success_light?: string | null
          tenant_id?: string | null
          transition_fast?: string | null
          transition_slow?: string | null
          transition_smooth?: string | null
          updated_at?: string | null
          version?: string | null
          warning_color?: string
          warning_foreground?: string
          warning_light?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_ui_themes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          integration_id: string | null
          level: string | null
          log_type: string
          message: string
          request_url: string | null
          response_status: number | null
          response_time_ms: number | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          integration_id?: string | null
          level?: string | null
          log_type: string
          message: string
          request_url?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          integration_id?: string | null
          level?: string | null
          log_type?: string
          message?: string
          request_url?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config_hash: string | null
          created_at: string | null
          created_by: string | null
          error_count: number | null
          id: string
          last_error: string | null
          last_sync: string | null
          name: string
          status: string | null
          tenant_id: string | null
          type: string
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          config_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          last_error?: string | null
          last_sync?: string | null
          name: string
          status?: string | null
          tenant_id?: string | null
          type: string
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          config_hash?: string | null
          created_at?: string | null
          created_by?: string | null
          error_count?: number | null
          id?: string
          last_error?: string | null
          last_sync?: string | null
          name?: string
          status?: string | null
          tenant_id?: string | null
          type?: string
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_bases: {
        Row: {
          applies_to_categories: Json | null
          applies_to_processing: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          justification: string | null
          legal_article: string | null
          legal_basis_type: string
          legal_responsible_id: string | null
          name: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_to_categories?: Json | null
          applies_to_processing?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          justification?: string | null
          legal_article?: string | null
          legal_basis_type: string
          legal_responsible_id?: string | null
          name: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_to_categories?: Json | null
          applies_to_processing?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          justification?: string | null
          legal_article?: string | null
          legal_basis_type?: string
          legal_responsible_id?: string | null
          name?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_bases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_providers: {
        Row: {
          api_key_encrypted: string
          avg_response_time_ms: number | null
          context_profiles: Json | null
          context_window: number | null
          created_at: string | null
          created_by: string | null
          endpoint: string | null
          failed_requests: number | null
          frequency_penalty: number | null
          id: string
          integration_id: string | null
          last_request_at: string | null
          max_tokens: number | null
          model: string | null
          name: string
          organization_id: string | null
          presence_penalty: number | null
          provider_type: string
          successful_requests: number | null
          temperature: number | null
          tenant_id: string | null
          tokens_limit_per_day: number | null
          tokens_used_today: number | null
          top_p: number | null
          total_requests: number | null
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted: string
          avg_response_time_ms?: number | null
          context_profiles?: Json | null
          context_window?: number | null
          created_at?: string | null
          created_by?: string | null
          endpoint?: string | null
          failed_requests?: number | null
          frequency_penalty?: number | null
          id?: string
          integration_id?: string | null
          last_request_at?: string | null
          max_tokens?: number | null
          model?: string | null
          name: string
          organization_id?: string | null
          presence_penalty?: number | null
          provider_type: string
          successful_requests?: number | null
          temperature?: number | null
          tenant_id?: string | null
          tokens_limit_per_day?: number | null
          tokens_used_today?: number | null
          top_p?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string
          avg_response_time_ms?: number | null
          context_profiles?: Json | null
          context_window?: number | null
          created_at?: string | null
          created_by?: string | null
          endpoint?: string | null
          failed_requests?: number | null
          frequency_penalty?: number | null
          id?: string
          integration_id?: string | null
          last_request_at?: string | null
          max_tokens?: number | null
          model?: string | null
          name?: string
          organization_id?: string | null
          presence_penalty?: number | null
          provider_type?: string
          successful_requests?: number | null
          temperature?: number | null
          tenant_id?: string | null
          tokens_limit_per_day?: number | null
          tokens_used_today?: number | null
          top_p?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mcp_providers_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mcp_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["platform_role"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["platform_role"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["platform_role"] | null
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string
          content: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          document_type: string | null
          document_url: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_current_version: boolean | null
          is_template: boolean | null
          metadata: Json | null
          next_review_date: string | null
          owner_id: string | null
          parent_policy_id: string | null
          priority: string | null
          published_at: string | null
          published_by: string | null
          requires_approval: boolean | null
          requires_training: boolean | null
          review_date: string | null
          status: string
          tenant_id: string | null
          title: string
          type: string | null
          updated_at: string
          updated_by: string | null
          version: string
          workflow_stage: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category: string
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          document_url?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_current_version?: boolean | null
          is_template?: boolean | null
          metadata?: Json | null
          next_review_date?: string | null
          owner_id?: string | null
          parent_policy_id?: string | null
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          requires_approval?: boolean | null
          requires_training?: boolean | null
          review_date?: string | null
          status?: string
          tenant_id?: string | null
          title: string
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: string
          workflow_stage?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          content?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          document_url?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_current_version?: boolean | null
          is_template?: boolean | null
          metadata?: Json | null
          next_review_date?: string | null
          owner_id?: string | null
          parent_policy_id?: string | null
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          requires_approval?: boolean | null
          requires_training?: boolean | null
          review_date?: string | null
          status?: string
          tenant_id?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: string
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policies_parent_policy_id_fkey"
            columns: ["parent_policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policies_v2: {
        Row: {
          ai_generated: boolean | null
          alex_suggestions: Json | null
          applies_to_all_users: boolean | null
          approved_at: string | null
          approved_by: string | null
          category: string
          compliance_frameworks: string[] | null
          content: string | null
          created_at: string | null
          created_at_tz: string | null
          created_by: string
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          is_current_version: boolean | null
          is_mandatory: boolean | null
          keywords: string[] | null
          last_reviewed_at: string | null
          metadata: Json | null
          owner_id: string | null
          parent_policy_id: string | null
          policy_type: string
          priority: string
          requires_acknowledgment: boolean | null
          review_date: string | null
          status: string
          summary: string | null
          tags: string[] | null
          target_audience: string[] | null
          tenant_id: string
          title: string
          updated_at: string | null
          updated_at_tz: string | null
          updated_by: string | null
          version: string
          workflow_stage: string
        }
        Insert: {
          ai_generated?: boolean | null
          alex_suggestions?: Json | null
          applies_to_all_users?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          category: string
          compliance_frameworks?: string[] | null
          content?: string | null
          created_at?: string | null
          created_at_tz?: string | null
          created_by: string
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_current_version?: boolean | null
          is_mandatory?: boolean | null
          keywords?: string[] | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          owner_id?: string | null
          parent_policy_id?: string | null
          policy_type: string
          priority?: string
          requires_acknowledgment?: boolean | null
          review_date?: string | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string | null
          updated_at_tz?: string | null
          updated_by?: string | null
          version?: string
          workflow_stage?: string
        }
        Update: {
          ai_generated?: boolean | null
          alex_suggestions?: Json | null
          applies_to_all_users?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          compliance_frameworks?: string[] | null
          content?: string | null
          created_at?: string | null
          created_at_tz?: string | null
          created_by?: string
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          is_current_version?: boolean | null
          is_mandatory?: boolean | null
          keywords?: string[] | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          owner_id?: string | null
          parent_policy_id?: string | null
          policy_type?: string
          priority?: string
          requires_acknowledgment?: boolean | null
          review_date?: string | null
          status?: string
          summary?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          updated_at_tz?: string | null
          updated_by?: string | null
          version?: string
          workflow_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_v2_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_v2_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_v2_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_v2_parent_policy_id_fkey"
            columns: ["parent_policy_id"]
            isOneToOne: false
            referencedRelation: "policies_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_v2_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_v2_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acknowledgments: {
        Row: {
          acknowledged_at: string
          acknowledgment_method: string | null
          comments: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          policy_id: string
          publication_id: string
          tenant_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          acknowledgment_method?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          policy_id: string
          publication_id: string
          tenant_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          acknowledgment_method?: string | null
          comments?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          policy_id?: string
          publication_id?: string
          tenant_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "policy_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acknowledgments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      policy_change_history: {
        Row: {
          change_description: string | null
          change_source: string | null
          change_type: string
          changed_by: string
          changed_fields: Json | null
          created_at: string | null
          id: string
          impact_assessment: string | null
          new_values: Json | null
          old_values: Json | null
          policy_id: string
          reason: string | null
          tenant_id: string
        }
        Insert: {
          change_description?: string | null
          change_source?: string | null
          change_type: string
          changed_by: string
          changed_fields?: Json | null
          created_at?: string | null
          id?: string
          impact_assessment?: string | null
          new_values?: Json | null
          old_values?: Json | null
          policy_id: string
          reason?: string | null
          tenant_id: string
        }
        Update: {
          change_description?: string | null
          change_source?: string | null
          change_type?: string
          changed_by?: string
          changed_fields?: Json | null
          created_at?: string | null
          id?: string
          impact_assessment?: string | null
          new_values?: Json | null
          old_values?: Json | null
          policy_id?: string
          reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_change_history_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_change_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_metrics: {
        Row: {
          alex_insights: Json | null
          calculated_by: string | null
          calculation_date: string
          created_at: string | null
          id: string
          metadata: Json | null
          metric_category: string
          metric_type: string
          metric_unit: string | null
          metric_value: number
          period_end: string | null
          period_start: string | null
          policy_category: string | null
          policy_id: string | null
          tenant_id: string
        }
        Insert: {
          alex_insights?: Json | null
          calculated_by?: string | null
          calculation_date?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_category: string
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          period_end?: string | null
          period_start?: string | null
          policy_category?: string | null
          policy_id?: string | null
          tenant_id: string
        }
        Update: {
          alex_insights?: Json | null
          calculated_by?: string | null
          calculation_date?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_category?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          period_end?: string | null
          period_start?: string | null
          policy_category?: string | null
          policy_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_metrics_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_metrics_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_notifications: {
        Row: {
          action_required: boolean | null
          action_taken_at: string | null
          action_type: string | null
          action_url: string | null
          channels: Json | null
          created_at: string | null
          delivered_at: string | null
          id: string
          message: string
          notification_type: string
          policy_id: string | null
          priority: string | null
          read_at: string | null
          recipient_email: string | null
          recipient_id: string | null
          recipient_role: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_required?: boolean | null
          action_taken_at?: string | null
          action_type?: string | null
          action_url?: string | null
          channels?: Json | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message: string
          notification_type: string
          policy_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_required?: boolean | null
          action_taken_at?: string | null
          action_type?: string | null
          action_url?: string | null
          channels?: Json | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          policy_id?: string | null
          priority?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_role?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_notifications_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_publications: {
        Row: {
          acknowledgment_required: boolean | null
          acknowledgments_received: number | null
          announcement_content: string | null
          announcement_title: string | null
          channels: Json | null
          communication_materials: Json | null
          created_at: string | null
          effective_date: string
          id: string
          policy_id: string
          publication_date: string
          published_by: string | null
          read_receipts: number | null
          status: string
          target_audience: Json | null
          tenant_id: string
          total_recipients: number | null
          training_required: boolean | null
          updated_at: string | null
        }
        Insert: {
          acknowledgment_required?: boolean | null
          acknowledgments_received?: number | null
          announcement_content?: string | null
          announcement_title?: string | null
          channels?: Json | null
          communication_materials?: Json | null
          created_at?: string | null
          effective_date: string
          id?: string
          policy_id: string
          publication_date: string
          published_by?: string | null
          read_receipts?: number | null
          status?: string
          target_audience?: Json | null
          tenant_id: string
          total_recipients?: number | null
          training_required?: boolean | null
          updated_at?: string | null
        }
        Update: {
          acknowledgment_required?: boolean | null
          acknowledgments_received?: number | null
          announcement_content?: string | null
          announcement_title?: string | null
          channels?: Json | null
          communication_materials?: Json | null
          created_at?: string | null
          effective_date?: string
          id?: string
          policy_id?: string
          publication_date?: string
          published_by?: string | null
          read_receipts?: number | null
          status?: string
          target_audience?: Json | null
          tenant_id?: string
          total_recipients?: number | null
          training_required?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_publications_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_publications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_reviews: {
        Row: {
          alex_analysis: Json | null
          completed_at: string | null
          compliance_check: Json | null
          created_at: string | null
          findings: string | null
          id: string
          issues_found: Json | null
          overall_rating: number | null
          policy_id: string
          recommendations: Json | null
          requires_changes: boolean | null
          review_type: string
          reviewer_id: string
          started_at: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          alex_analysis?: Json | null
          completed_at?: string | null
          compliance_check?: Json | null
          created_at?: string | null
          findings?: string | null
          id?: string
          issues_found?: Json | null
          overall_rating?: number | null
          policy_id: string
          recommendations?: Json | null
          requires_changes?: boolean | null
          review_type: string
          reviewer_id: string
          started_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          alex_analysis?: Json | null
          completed_at?: string | null
          compliance_check?: Json | null
          created_at?: string | null
          findings?: string | null
          id?: string
          issues_found?: Json | null
          overall_rating?: number | null
          policy_id?: string
          recommendations?: Json | null
          requires_changes?: boolean | null
          review_type?: string
          reviewer_id?: string
          started_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_reviews_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_templates: {
        Row: {
          alex_generated: boolean | null
          alex_recommendations: Json | null
          category: string
          compliance_frameworks: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_global: boolean | null
          name: string
          policy_type: string
          rating: number | null
          regulatory_requirements: Json | null
          requires_customization: boolean | null
          sections: Json | null
          template_content: string
          tenant_id: string | null
          updated_at: string | null
          updated_by: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          alex_generated?: boolean | null
          alex_recommendations?: Json | null
          category: string
          compliance_frameworks?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          name: string
          policy_type: string
          rating?: number | null
          regulatory_requirements?: Json | null
          requires_customization?: boolean | null
          sections?: Json | null
          template_content: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          alex_generated?: boolean | null
          alex_recommendations?: Json | null
          category?: string
          compliance_frameworks?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          name?: string
          policy_type?: string
          rating?: number | null
          regulatory_requirements?: Json | null
          requires_customization?: boolean | null
          sections?: Json | null
          template_content?: string
          tenant_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_workflow_steps: {
        Row: {
          alex_assistance: Json | null
          assignee_id: string | null
          assignee_role: string | null
          attachments: Json | null
          comments: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          due_date: string | null
          id: string
          instructions: string | null
          policy_id: string
          started_at: string | null
          status: string
          step_name: string
          step_order: number
          step_type: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          alex_assistance?: Json | null
          assignee_id?: string | null
          assignee_role?: string | null
          attachments?: Json | null
          comments?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          policy_id: string
          started_at?: string | null
          status?: string
          step_name: string
          step_order: number
          step_type: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          alex_assistance?: Json | null
          assignee_id?: string | null
          assignee_role?: string | null
          attachments?: Json | null
          comments?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          policy_id?: string
          started_at?: string | null
          status?: string
          step_name?: string
          step_order?: number
          step_type?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_workflow_steps_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_workflow_steps_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_workflow_steps_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_workflow_steps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_incidents: {
        Row: {
          affected_data_subjects: number | null
          anpd_notification_date: string | null
          assigned_to: string | null
          containment_measures: string | null
          corrective_actions: string | null
          created_at: string | null
          created_by: string | null
          data_categories: Json | null
          description: string | null
          detection_date: string | null
          detection_method: string | null
          id: string
          incident_type: string
          lessons_learned: string | null
          potential_impact: string | null
          reported_by: string | null
          requires_anpd_notification: boolean | null
          requires_data_subject_notification: boolean | null
          resolved_date: string | null
          risk_assessment: string | null
          severity: string
          status: string
          tenant_id: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          affected_data_subjects?: number | null
          anpd_notification_date?: string | null
          assigned_to?: string | null
          containment_measures?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: Json | null
          description?: string | null
          detection_date?: string | null
          detection_method?: string | null
          id?: string
          incident_type: string
          lessons_learned?: string | null
          potential_impact?: string | null
          reported_by?: string | null
          requires_anpd_notification?: boolean | null
          requires_data_subject_notification?: boolean | null
          resolved_date?: string | null
          risk_assessment?: string | null
          severity: string
          status?: string
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          affected_data_subjects?: number | null
          anpd_notification_date?: string | null
          assigned_to?: string | null
          containment_measures?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: Json | null
          description?: string | null
          detection_date?: string | null
          detection_method?: string | null
          id?: string
          incident_type?: string
          lessons_learned?: string | null
          potential_impact?: string | null
          reported_by?: string | null
          requires_anpd_notification?: boolean | null
          requires_data_subject_notification?: boolean | null
          resolved_date?: string | null
          risk_assessment?: string | null
          severity?: string
          status?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "privacy_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_activities: {
        Row: {
          automated_decision_description: string | null
          automated_decision_making: boolean | null
          controller_role: string | null
          created_at: string | null
          created_by: string | null
          data_categories: Json | null
          data_controller_id: string | null
          data_recipients: Json | null
          data_subjects: Json | null
          description: string | null
          id: string
          international_transfers: boolean | null
          name: string
          processor_role: string | null
          purpose: string
          requires_dpia: boolean | null
          retention_criteria: string | null
          retention_period: string | null
          risk_level: string | null
          security_measures: Json | null
          status: string | null
          tenant_id: string | null
          transfer_countries: Json | null
          transfer_safeguards: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          automated_decision_description?: string | null
          automated_decision_making?: boolean | null
          controller_role?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: Json | null
          data_controller_id?: string | null
          data_recipients?: Json | null
          data_subjects?: Json | null
          description?: string | null
          id?: string
          international_transfers?: boolean | null
          name: string
          processor_role?: string | null
          purpose: string
          requires_dpia?: boolean | null
          retention_criteria?: string | null
          retention_period?: string | null
          risk_level?: string | null
          security_measures?: Json | null
          status?: string | null
          tenant_id?: string | null
          transfer_countries?: Json | null
          transfer_safeguards?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          automated_decision_description?: string | null
          automated_decision_making?: boolean | null
          controller_role?: string | null
          created_at?: string | null
          created_by?: string | null
          data_categories?: Json | null
          data_controller_id?: string | null
          data_recipients?: Json | null
          data_subjects?: Json | null
          description?: string | null
          id?: string
          international_transfers?: boolean | null
          name?: string
          processor_role?: string | null
          purpose?: string
          requires_dpia?: boolean | null
          retention_criteria?: string | null
          retention_period?: string | null
          risk_level?: string | null
          security_measures?: Json | null
          status?: string | null
          tenant_id?: string | null
          transfer_countries?: Json | null
          transfer_safeguards?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processing_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          role: string | null
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
          role?: string | null
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
          role?: string | null
          tenant_id?: string | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_acceptance_letters: {
        Row: {
          acceptance_period_end: string
          acceptance_period_start: string
          acceptance_rationale: string
          audit_trail: Json | null
          board_approval_status: string | null
          board_approved_at: string | null
          board_approved_by: string | null
          board_comments: string | null
          business_justification: string
          compensating_controls: string[] | null
          conditions_and_limitations: string[] | null
          created_at: string | null
          created_by: string | null
          cro_approval_status: string | null
          cro_approved_at: string | null
          cro_approved_by: string | null
          cro_comments: string | null
          director_approval_status: string | null
          director_approved_at: string | null
          director_approved_by: string | null
          director_comments: string | null
          document_version: number | null
          escalation_triggers: string[] | null
          final_approval_date: string | null
          financial_exposure: number | null
          id: string
          letter_number: string
          manager_approval_status: string | null
          manager_approved_at: string | null
          manager_approved_by: string | null
          manager_comments: string | null
          monitoring_requirements: string[] | null
          next_review_date: string | null
          parent_letter_id: string | null
          rejection_reason: string | null
          residual_risk_level: string
          residual_risk_score: number | null
          review_frequency: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          risk_description: string
          risk_id: string | null
          stakeholder_notifications: string[] | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acceptance_period_end: string
          acceptance_period_start: string
          acceptance_rationale: string
          audit_trail?: Json | null
          board_approval_status?: string | null
          board_approved_at?: string | null
          board_approved_by?: string | null
          board_comments?: string | null
          business_justification: string
          compensating_controls?: string[] | null
          conditions_and_limitations?: string[] | null
          created_at?: string | null
          created_by?: string | null
          cro_approval_status?: string | null
          cro_approved_at?: string | null
          cro_approved_by?: string | null
          cro_comments?: string | null
          director_approval_status?: string | null
          director_approved_at?: string | null
          director_approved_by?: string | null
          director_comments?: string | null
          document_version?: number | null
          escalation_triggers?: string[] | null
          final_approval_date?: string | null
          financial_exposure?: number | null
          id?: string
          letter_number: string
          manager_approval_status?: string | null
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          manager_comments?: string | null
          monitoring_requirements?: string[] | null
          next_review_date?: string | null
          parent_letter_id?: string | null
          rejection_reason?: string | null
          residual_risk_level: string
          residual_risk_score?: number | null
          review_frequency?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          risk_description: string
          risk_id?: string | null
          stakeholder_notifications?: string[] | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acceptance_period_end?: string
          acceptance_period_start?: string
          acceptance_rationale?: string
          audit_trail?: Json | null
          board_approval_status?: string | null
          board_approved_at?: string | null
          board_approved_by?: string | null
          board_comments?: string | null
          business_justification?: string
          compensating_controls?: string[] | null
          conditions_and_limitations?: string[] | null
          created_at?: string | null
          created_by?: string | null
          cro_approval_status?: string | null
          cro_approved_at?: string | null
          cro_approved_by?: string | null
          cro_comments?: string | null
          director_approval_status?: string | null
          director_approved_at?: string | null
          director_approved_by?: string | null
          director_comments?: string | null
          document_version?: number | null
          escalation_triggers?: string[] | null
          final_approval_date?: string | null
          financial_exposure?: number | null
          id?: string
          letter_number?: string
          manager_approval_status?: string | null
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          manager_comments?: string | null
          monitoring_requirements?: string[] | null
          next_review_date?: string | null
          parent_letter_id?: string | null
          rejection_reason?: string | null
          residual_risk_level?: string
          residual_risk_score?: number | null
          review_frequency?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          risk_description?: string
          risk_id?: string | null
          stakeholder_notifications?: string[] | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_acceptance_letters_parent_letter_id_fkey"
            columns: ["parent_letter_id"]
            isOneToOne: false
            referencedRelation: "risk_acceptance_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_acceptance_letters_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_acceptance_monitoring: {
        Row: {
          action_assigned_to: string | null
          action_description: string | null
          action_due_date: string | null
          action_required: boolean | null
          control_effectiveness: Json | null
          created_at: string | null
          created_by: string | null
          financial_exposure_current: number | null
          id: string
          incidents_occurred: string[] | null
          letter_id: string | null
          monitoring_date: string
          monitoring_notes: string | null
          monitoring_status: string | null
          risk_level_current: string | null
          risk_score_current: number | null
          triggers_activated: string[] | null
        }
        Insert: {
          action_assigned_to?: string | null
          action_description?: string | null
          action_due_date?: string | null
          action_required?: boolean | null
          control_effectiveness?: Json | null
          created_at?: string | null
          created_by?: string | null
          financial_exposure_current?: number | null
          id?: string
          incidents_occurred?: string[] | null
          letter_id?: string | null
          monitoring_date: string
          monitoring_notes?: string | null
          monitoring_status?: string | null
          risk_level_current?: string | null
          risk_score_current?: number | null
          triggers_activated?: string[] | null
        }
        Update: {
          action_assigned_to?: string | null
          action_description?: string | null
          action_due_date?: string | null
          action_required?: boolean | null
          control_effectiveness?: Json | null
          created_at?: string | null
          created_by?: string | null
          financial_exposure_current?: number | null
          id?: string
          incidents_occurred?: string[] | null
          letter_id?: string | null
          monitoring_date?: string
          monitoring_notes?: string | null
          monitoring_status?: string | null
          risk_level_current?: string | null
          risk_score_current?: number | null
          triggers_activated?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_acceptance_monitoring_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "risk_acceptance_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_action_activities: {
        Row: {
          action_plan_id: string
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string
          evidence_description: string | null
          evidence_url: string | null
          id: string
          priority: string | null
          responsible_person: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          action_plan_id: string
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description: string
          evidence_description?: string | null
          evidence_url?: string | null
          id?: string
          priority?: string | null
          responsible_person: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          action_plan_id?: string
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string
          evidence_description?: string | null
          evidence_url?: string | null
          id?: string
          priority?: string | null
          responsible_person?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
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
          approval_date: string | null
          approved_by: string | null
          budget: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          risk_id: string
          target_date: string | null
          tenant_id: string
          treatment_type: string
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          risk_id: string
          target_date?: string | null
          tenant_id?: string
          treatment_type?: string
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          risk_id?: string
          target_date?: string | null
          tenant_id?: string
          treatment_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_action_plans_risk_registration_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_advanced_analyses: {
        Row: {
          analysis_type: string
          analyst_notes: string | null
          assumptions: string[] | null
          bow_tie_analysis: Json | null
          calculation_results: Json | null
          confidence_level: number | null
          created_at: string | null
          created_by: string | null
          event_tree_analysis: Json | null
          fault_tree_analysis: Json | null
          fmea_analysis: Json | null
          hazop_analysis: Json | null
          id: string
          input_parameters: Json | null
          limitations: string[] | null
          methodology_id: string | null
          monte_carlo_results: Json | null
          recommendations: string[] | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_id: string | null
          scenario_analysis: Json | null
          sensitivity_analysis: Json | null
          uncertainty_range: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis_type: string
          analyst_notes?: string | null
          assumptions?: string[] | null
          bow_tie_analysis?: Json | null
          calculation_results?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          created_by?: string | null
          event_tree_analysis?: Json | null
          fault_tree_analysis?: Json | null
          fmea_analysis?: Json | null
          hazop_analysis?: Json | null
          id?: string
          input_parameters?: Json | null
          limitations?: string[] | null
          methodology_id?: string | null
          monte_carlo_results?: Json | null
          recommendations?: string[] | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_id?: string | null
          scenario_analysis?: Json | null
          sensitivity_analysis?: Json | null
          uncertainty_range?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis_type?: string
          analyst_notes?: string | null
          assumptions?: string[] | null
          bow_tie_analysis?: Json | null
          calculation_results?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          created_by?: string | null
          event_tree_analysis?: Json | null
          fault_tree_analysis?: Json | null
          fmea_analysis?: Json | null
          hazop_analysis?: Json | null
          id?: string
          input_parameters?: Json | null
          limitations?: string[] | null
          methodology_id?: string | null
          monte_carlo_results?: Json | null
          recommendations?: string[] | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_id?: string | null
          scenario_analysis?: Json | null
          sensitivity_analysis?: Json | null
          uncertainty_range?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_advanced_analyses_methodology_id_fkey"
            columns: ["methodology_id"]
            isOneToOne: false
            referencedRelation: "risk_analysis_methodologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_advanced_analyses_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_analysis_methodologies: {
        Row: {
          calculation_formula: string | null
          created_at: string | null
          description: string | null
          framework: string | null
          id: string
          is_active: boolean | null
          methodology_type: string
          name: string
          parameters: Json | null
          updated_at: string | null
        }
        Insert: {
          calculation_formula?: string | null
          created_at?: string | null
          description?: string | null
          framework?: string | null
          id?: string
          is_active?: boolean | null
          methodology_type: string
          name: string
          parameters?: Json | null
          updated_at?: string | null
        }
        Update: {
          calculation_formula?: string | null
          created_at?: string | null
          description?: string | null
          framework?: string | null
          id?: string
          is_active?: boolean | null
          methodology_type?: string
          name?: string
          parameters?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          analysis_data: Json | null
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          executive_summary: string | null
          id: string
          identified_date: string | null
          impact_score: number
          is_active: boolean | null
          last_review_date: string | null
          likelihood_score: number
          next_review_date: string | null
          owner_id: string | null
          probability: number
          risk_category: string
          risk_level: string
          risk_score: number | null
          severity: string | null
          status: string
          technical_details: string | null
          tenant_id: string
          title: string
          treatment_type: string | null
          updated_at: string | null
        }
        Insert: {
          analysis_data?: Json | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          executive_summary?: string | null
          id?: string
          identified_date?: string | null
          impact_score?: number
          is_active?: boolean | null
          last_review_date?: string | null
          likelihood_score?: number
          next_review_date?: string | null
          owner_id?: string | null
          probability?: number
          risk_category: string
          risk_level?: string
          risk_score?: number | null
          severity?: string | null
          status?: string
          technical_details?: string | null
          tenant_id?: string
          title: string
          treatment_type?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis_data?: Json | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          executive_summary?: string | null
          id?: string
          identified_date?: string | null
          impact_score?: number
          is_active?: boolean | null
          last_review_date?: string | null
          likelihood_score?: number
          next_review_date?: string | null
          owner_id?: string | null
          probability?: number
          risk_category?: string
          risk_level?: string
          risk_score?: number | null
          severity?: string | null
          status?: string
          technical_details?: string | null
          tenant_id?: string
          title?: string
          treatment_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_bowtie_analyses: {
        Row: {
          barrier_dependencies: Json | null
          barrier_effectiveness: Json | null
          central_event: string
          common_cause_failures: Json | null
          consequence_events: Json | null
          created_at: string | null
          created_by: string | null
          escalation_factors: Json | null
          event_description: string | null
          id: string
          preventive_barriers: Json | null
          protective_barriers: Json | null
          recovery_measures: Json | null
          risk_id: string | null
          threat_events: Json | null
          updated_at: string | null
        }
        Insert: {
          barrier_dependencies?: Json | null
          barrier_effectiveness?: Json | null
          central_event: string
          common_cause_failures?: Json | null
          consequence_events?: Json | null
          created_at?: string | null
          created_by?: string | null
          escalation_factors?: Json | null
          event_description?: string | null
          id?: string
          preventive_barriers?: Json | null
          protective_barriers?: Json | null
          recovery_measures?: Json | null
          risk_id?: string | null
          threat_events?: Json | null
          updated_at?: string | null
        }
        Update: {
          barrier_dependencies?: Json | null
          barrier_effectiveness?: Json | null
          central_event?: string
          common_cause_failures?: Json | null
          consequence_events?: Json | null
          created_at?: string | null
          created_by?: string | null
          escalation_factors?: Json | null
          event_description?: string | null
          id?: string
          preventive_barriers?: Json | null
          protective_barriers?: Json | null
          recovery_measures?: Json | null
          risk_id?: string | null
          threat_events?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_bowtie_analyses_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_communications: {
        Row: {
          communication_date: string | null
          created_at: string | null
          created_by: string | null
          decision: string | null
          id: string
          justification: string | null
          notified_at: string | null
          person_email: string
          person_name: string
          risk_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          communication_date?: string | null
          created_at?: string | null
          created_by?: string | null
          decision?: string | null
          id?: string
          justification?: string | null
          notified_at?: string | null
          person_email: string
          person_name: string
          risk_id: string
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          communication_date?: string | null
          created_at?: string | null
          created_by?: string | null
          decision?: string | null
          id?: string
          justification?: string | null
          notified_at?: string | null
          person_email?: string
          person_name?: string
          risk_id?: string
          tenant_id?: string
          updated_at?: string | null
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
      risk_intelligent_analyses: {
        Row: {
          ai_assessment: Json | null
          analysis_type: string
          confidence_score: number | null
          cost_benefit_analysis: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          impact_factors: Json | null
          input_data: Json | null
          mitigation_strategies: Json | null
          probability_factors: Json | null
          recommendations: string[] | null
          regulatory_compliance: Json | null
          risk_id: string | null
          risk_score_calculated: number | null
          stakeholder_impact: Json | null
          timeline_analysis: Json | null
        }
        Insert: {
          ai_assessment?: Json | null
          analysis_type: string
          confidence_score?: number | null
          cost_benefit_analysis?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          impact_factors?: Json | null
          input_data?: Json | null
          mitigation_strategies?: Json | null
          probability_factors?: Json | null
          recommendations?: string[] | null
          regulatory_compliance?: Json | null
          risk_id?: string | null
          risk_score_calculated?: number | null
          stakeholder_impact?: Json | null
          timeline_analysis?: Json | null
        }
        Update: {
          ai_assessment?: Json | null
          analysis_type?: string
          confidence_score?: number | null
          cost_benefit_analysis?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          impact_factors?: Json | null
          input_data?: Json | null
          mitigation_strategies?: Json | null
          probability_factors?: Json | null
          recommendations?: string[] | null
          regulatory_compliance?: Json | null
          risk_id?: string | null
          risk_score_calculated?: number | null
          stakeholder_impact?: Json | null
          timeline_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_intelligent_analyses_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_letter_templates: {
        Row: {
          body_template: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          subject_template: string | null
          template_type: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          body_template?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          subject_template?: string | null
          template_type?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          body_template?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          subject_template?: string | null
          template_type?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_letter_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_library_templates: {
        Row: {
          category: string
          control_measures: string[] | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          impact_description: string | null
          industry_sector: string[] | null
          is_public: boolean | null
          kpis: string[] | null
          likelihood_factors: string[] | null
          name: string
          rating: number | null
          regulatory_references: string[] | null
          risk_level: string | null
          subcategory: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          control_measures?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          impact_description?: string | null
          industry_sector?: string[] | null
          is_public?: boolean | null
          kpis?: string[] | null
          likelihood_factors?: string[] | null
          name: string
          rating?: number | null
          regulatory_references?: string[] | null
          risk_level?: string | null
          subcategory: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          control_measures?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          impact_description?: string | null
          industry_sector?: string[] | null
          is_public?: boolean | null
          kpis?: string[] | null
          likelihood_factors?: string[] | null
          name?: string
          rating?: number | null
          regulatory_references?: string[] | null
          risk_level?: string | null
          subcategory?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      risk_methodologies: {
        Row: {
          code: string
          config_schema: Json | null
          created_at: string | null
          default_config: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          config_schema?: Json | null
          created_at?: string | null
          default_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          config_schema?: Json | null
          created_at?: string | null
          default_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_methodologies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_quantitative_models: {
        Row: {
          back_testing_results: Json | null
          confidence_levels: number[] | null
          correlation_matrix: Json | null
          created_at: string | null
          created_by: string | null
          distribution_parameters: Json | null
          expected_shortfall: Json | null
          id: string
          model_accuracy: number | null
          model_description: string | null
          model_name: string
          model_type: string
          probability_distribution: string | null
          risk_id: string | null
          simulation_results: Json | null
          stress_test_results: Json | null
          time_horizon: number | null
          updated_at: string | null
          validation_date: string | null
          validation_notes: string | null
          validation_status: string | null
          var_results: Json | null
        }
        Insert: {
          back_testing_results?: Json | null
          confidence_levels?: number[] | null
          correlation_matrix?: Json | null
          created_at?: string | null
          created_by?: string | null
          distribution_parameters?: Json | null
          expected_shortfall?: Json | null
          id?: string
          model_accuracy?: number | null
          model_description?: string | null
          model_name: string
          model_type: string
          probability_distribution?: string | null
          risk_id?: string | null
          simulation_results?: Json | null
          stress_test_results?: Json | null
          time_horizon?: number | null
          updated_at?: string | null
          validation_date?: string | null
          validation_notes?: string | null
          validation_status?: string | null
          var_results?: Json | null
        }
        Update: {
          back_testing_results?: Json | null
          confidence_levels?: number[] | null
          correlation_matrix?: Json | null
          created_at?: string | null
          created_by?: string | null
          distribution_parameters?: Json | null
          expected_shortfall?: Json | null
          id?: string
          model_accuracy?: number | null
          model_description?: string | null
          model_name?: string
          model_type?: string
          probability_distribution?: string | null
          risk_id?: string | null
          simulation_results?: Json | null
          stress_test_results?: Json | null
          time_horizon?: number | null
          updated_at?: string | null
          validation_date?: string | null
          validation_notes?: string | null
          validation_status?: string | null
          var_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_quantitative_models_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_registration_action_plans: {
        Row: {
          activity_description: string | null
          activity_name: string
          created_at: string | null
          created_by: string | null
          due_date: string
          id: string
          priority: string
          responsible_email: string
          responsible_name: string
          risk_registration_id: string
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_name: string
          created_at?: string | null
          created_by?: string | null
          due_date: string
          id?: string
          priority?: string
          responsible_email: string
          responsible_name: string
          risk_registration_id: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_name?: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string
          id?: string
          priority?: string
          responsible_email?: string
          responsible_name?: string
          risk_registration_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_registration_action_plans_risk_registration_id_fkey"
            columns: ["risk_registration_id"]
            isOneToOne: false
            referencedRelation: "risk_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_registration_history: {
        Row: {
          completed_at: string | null
          completed_by: string
          id: string
          notes: string | null
          risk_registration_id: string
          step_data: Json | null
          step_name: string
          step_number: number
        }
        Insert: {
          completed_at?: string | null
          completed_by: string
          id?: string
          notes?: string | null
          risk_registration_id: string
          step_data?: Json | null
          step_name: string
          step_number: number
        }
        Update: {
          completed_at?: string | null
          completed_by?: string
          id?: string
          notes?: string | null
          risk_registration_id?: string
          step_data?: Json | null
          step_name?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_registration_history_risk_registration_id_fkey"
            columns: ["risk_registration_id"]
            isOneToOne: false
            referencedRelation: "risk_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_registrations: {
        Row: {
          analysis_methodology: string | null
          analysis_notes: string | null
          assigned_to: string | null
          assigned_to_name: string | null
          business_area: string | null
          closure_criteria: string | null
          closure_date: string | null
          closure_notes: string | null
          communication_plan: Json | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string
          current_step: number | null
          gravity_score: number | null
          gut_gravity: number | null
          gut_priority: string | null
          gut_score: number | null
          gut_tendency: number | null
          gut_urgency: number | null
          id: string
          identification_date: string | null
          identified_date: string | null
          impact_score: number | null
          kpi_definition: string | null
          likelihood_score: number | null
          methodology_config: Json | null
          methodology_id: string | null
          monitoring_frequency: string | null
          monitoring_indicators: string[] | null
          monitoring_notes: string | null
          monitoring_responsible: string | null
          probability_score: number | null
          requires_approval: boolean | null
          residual_impact: number | null
          residual_likelihood: number | null
          residual_probability: number | null
          residual_risk_level: string | null
          residual_score: number | null
          responsible_area: string | null
          review_date: string | null
          risk_category: string | null
          risk_code: string | null
          risk_description: string | null
          risk_level: string | null
          risk_score: number | null
          risk_source: string | null
          risk_title: string | null
          status: string | null
          tenant_id: string
          tendency_score: number | null
          treatment_cost: number | null
          treatment_rationale: string | null
          treatment_strategy: string | null
          treatment_timeline: string | null
          updated_at: string | null
          urgency_score: number | null
        }
        Insert: {
          analysis_methodology?: string | null
          analysis_notes?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          business_area?: string | null
          closure_criteria?: string | null
          closure_date?: string | null
          closure_notes?: string | null
          communication_plan?: Json | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by: string
          current_step?: number | null
          gravity_score?: number | null
          gut_gravity?: number | null
          gut_priority?: string | null
          gut_score?: number | null
          gut_tendency?: number | null
          gut_urgency?: number | null
          id?: string
          identification_date?: string | null
          identified_date?: string | null
          impact_score?: number | null
          kpi_definition?: string | null
          likelihood_score?: number | null
          methodology_config?: Json | null
          methodology_id?: string | null
          monitoring_frequency?: string | null
          monitoring_indicators?: string[] | null
          monitoring_notes?: string | null
          monitoring_responsible?: string | null
          probability_score?: number | null
          requires_approval?: boolean | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          residual_probability?: number | null
          residual_risk_level?: string | null
          residual_score?: number | null
          responsible_area?: string | null
          review_date?: string | null
          risk_category?: string | null
          risk_code?: string | null
          risk_description?: string | null
          risk_level?: string | null
          risk_score?: number | null
          risk_source?: string | null
          risk_title?: string | null
          status?: string | null
          tenant_id: string
          tendency_score?: number | null
          treatment_cost?: number | null
          treatment_rationale?: string | null
          treatment_strategy?: string | null
          treatment_timeline?: string | null
          updated_at?: string | null
          urgency_score?: number | null
        }
        Update: {
          analysis_methodology?: string | null
          analysis_notes?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          business_area?: string | null
          closure_criteria?: string | null
          closure_date?: string | null
          closure_notes?: string | null
          communication_plan?: Json | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string
          current_step?: number | null
          gravity_score?: number | null
          gut_gravity?: number | null
          gut_priority?: string | null
          gut_score?: number | null
          gut_tendency?: number | null
          gut_urgency?: number | null
          id?: string
          identification_date?: string | null
          identified_date?: string | null
          impact_score?: number | null
          kpi_definition?: string | null
          likelihood_score?: number | null
          methodology_config?: Json | null
          methodology_id?: string | null
          monitoring_frequency?: string | null
          monitoring_indicators?: string[] | null
          monitoring_notes?: string | null
          monitoring_responsible?: string | null
          probability_score?: number | null
          requires_approval?: boolean | null
          residual_impact?: number | null
          residual_likelihood?: number | null
          residual_probability?: number | null
          residual_risk_level?: string | null
          residual_score?: number | null
          responsible_area?: string | null
          review_date?: string | null
          risk_category?: string | null
          risk_code?: string | null
          risk_description?: string | null
          risk_level?: string | null
          risk_score?: number | null
          risk_source?: string | null
          risk_title?: string | null
          status?: string | null
          tenant_id?: string
          tendency_score?: number | null
          treatment_cost?: number | null
          treatment_rationale?: string | null
          treatment_strategy?: string | null
          treatment_timeline?: string | null
          updated_at?: string | null
          urgency_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_registrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_report_configs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filters: Json | null
          format: string | null
          id: string
          name: string
          report_type: string
          schedule: Json | null
          sections: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          name: string
          report_type: string
          schedule?: Json | null
          sections?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          name?: string
          report_type?: string
          schedule?: Json | null
          sections?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      risk_scenario_analyses: {
        Row: {
          created_at: string | null
          created_by: string | null
          critical_dependencies: string[] | null
          duration_estimate: number | null
          economic_factors: Json | null
          environmental_factors: Json | null
          id: string
          impact_estimate: number | null
          key_assumptions: string[] | null
          operational_factors: Json | null
          probability_estimate: number | null
          regulatory_factors: Json | null
          risk_id: string | null
          scenario_description: string | null
          scenario_name: string
          scenario_results: Json | null
          scenario_type: string
          sensitivity_factors: Json | null
          technological_factors: Json | null
          time_to_impact: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          critical_dependencies?: string[] | null
          duration_estimate?: number | null
          economic_factors?: Json | null
          environmental_factors?: Json | null
          id?: string
          impact_estimate?: number | null
          key_assumptions?: string[] | null
          operational_factors?: Json | null
          probability_estimate?: number | null
          regulatory_factors?: Json | null
          risk_id?: string | null
          scenario_description?: string | null
          scenario_name: string
          scenario_results?: Json | null
          scenario_type: string
          sensitivity_factors?: Json | null
          technological_factors?: Json | null
          time_to_impact?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          critical_dependencies?: string[] | null
          duration_estimate?: number | null
          economic_factors?: Json | null
          environmental_factors?: Json | null
          id?: string
          impact_estimate?: number | null
          key_assumptions?: string[] | null
          operational_factors?: Json | null
          probability_estimate?: number | null
          regulatory_factors?: Json | null
          risk_id?: string | null
          scenario_description?: string | null
          scenario_name?: string
          scenario_results?: Json | null
          scenario_type?: string
          sensitivity_factors?: Json | null
          technological_factors?: Json | null
          time_to_impact?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_scenario_analyses_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_stakeholders: {
        Row: {
          acknowledged_at: string | null
          approved_at: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          notification_type: string | null
          notified_at: string | null
          phone: string | null
          position: string | null
          response_notes: string | null
          response_status: string | null
          risk_registration_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          approved_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          notification_type?: string | null
          notified_at?: string | null
          phone?: string | null
          position?: string | null
          response_notes?: string | null
          response_status?: string | null
          risk_registration_id: string
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          approved_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notification_type?: string | null
          notified_at?: string | null
          phone?: string | null
          position?: string | null
          response_notes?: string | null
          response_status?: string | null
          risk_registration_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_stakeholders_risk_registration_id_fkey"
            columns: ["risk_registration_id"]
            isOneToOne: false
            referencedRelation: "risk_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_template_audit: {
        Row: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          changed_by: string
          created_at: string | null
          id: number
          new_values: Json | null
          old_values: Json | null
          template_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          changed_by: string
          created_at?: string | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          template_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action_enum"]
          changed_by?: string
          created_at?: string | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          template_id?: string
        }
        Relationships: []
      }
      risk_template_controls: {
        Row: {
          control_description: string
          control_order: number
          created_at: string | null
          id: number
          template_id: string
        }
        Insert: {
          control_description: string
          control_order: number
          created_at?: string | null
          id?: number
          template_id: string
        }
        Update: {
          control_description?: string
          control_order?: number
          created_at?: string | null
          id?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_template_controls_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "risk_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_template_favorites: {
        Row: {
          created_at: string | null
          id: string
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_template_favorites_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "risk_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_template_kris: {
        Row: {
          created_at: string | null
          id: number
          kri_description: string
          kri_order: number
          template_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          kri_description: string
          kri_order: number
          template_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          kri_description?: string
          kri_order?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_template_kris_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "risk_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_template_ratings: {
        Row: {
          created_at: string | null
          id: number
          rating: number
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          rating: number
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          rating?: number
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_template_ratings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "risk_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_template_tags: {
        Row: {
          created_at: string | null
          id: number
          tag: string
          template_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          tag: string
          template_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          tag?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_template_tags_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "risk_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_templates: {
        Row: {
          alex_risk_suggested: boolean | null
          category: string
          created_at: string | null
          created_by: string
          description: string
          id: string
          impact: number
          industry: string
          is_favorite: boolean | null
          is_popular: boolean | null
          methodology: string
          name: string
          probability: number
          rating: number | null
          risk_level: Database["public"]["Enums"]["risk_level_enum"]
          status: Database["public"]["Enums"]["template_status_enum"] | null
          total_ratings: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          alex_risk_suggested?: boolean | null
          category: string
          created_at?: string | null
          created_by: string
          description: string
          id: string
          impact: number
          industry: string
          is_favorite?: boolean | null
          is_popular?: boolean | null
          methodology: string
          name: string
          probability: number
          rating?: number | null
          risk_level: Database["public"]["Enums"]["risk_level_enum"]
          status?: Database["public"]["Enums"]["template_status_enum"] | null
          total_ratings?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          alex_risk_suggested?: boolean | null
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          impact?: number
          industry?: string
          is_favorite?: boolean | null
          is_popular?: boolean | null
          methodology?: string
          name?: string
          probability?: number
          rating?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level_enum"]
          status?: Database["public"]["Enums"]["template_status_enum"] | null
          total_ratings?: number | null
          updated_at?: string | null
          usage_count?: number | null
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
      sso_providers: {
        Row: {
          attribute_mapping: Json | null
          authorization_url: string | null
          auto_provisioning: boolean | null
          client_id_encrypted: string
          client_secret_encrypted: string
          created_at: string | null
          created_by: string | null
          default_roles: Json | null
          failed_logins: number | null
          id: string
          integration_id: string | null
          jwks_url: string | null
          last_login_at: string | null
          logins_today: number | null
          metadata_url: string | null
          name: string
          provider_type: string
          require_2fa: boolean | null
          saml_certificate: string | null
          saml_entity_id: string | null
          saml_sso_url: string | null
          scopes: Json | null
          session_timeout_minutes: number | null
          successful_logins: number | null
          tenant_id: string | null
          tenant_id_provider: string | null
          token_url: string | null
          updated_at: string | null
          userinfo_url: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          authorization_url?: string | null
          auto_provisioning?: boolean | null
          client_id_encrypted: string
          client_secret_encrypted: string
          created_at?: string | null
          created_by?: string | null
          default_roles?: Json | null
          failed_logins?: number | null
          id?: string
          integration_id?: string | null
          jwks_url?: string | null
          last_login_at?: string | null
          logins_today?: number | null
          metadata_url?: string | null
          name: string
          provider_type: string
          require_2fa?: boolean | null
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_sso_url?: string | null
          scopes?: Json | null
          session_timeout_minutes?: number | null
          successful_logins?: number | null
          tenant_id?: string | null
          tenant_id_provider?: string | null
          token_url?: string | null
          updated_at?: string | null
          userinfo_url?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          authorization_url?: string | null
          auto_provisioning?: boolean | null
          client_id_encrypted?: string
          client_secret_encrypted?: string
          created_at?: string | null
          created_by?: string | null
          default_roles?: Json | null
          failed_logins?: number | null
          id?: string
          integration_id?: string | null
          jwks_url?: string | null
          last_login_at?: string | null
          logins_today?: number | null
          metadata_url?: string | null
          name?: string
          provider_type?: string
          require_2fa?: boolean | null
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_sso_url?: string | null
          scopes?: Json | null
          session_timeout_minutes?: number | null
          successful_logins?: number | null
          tenant_id?: string | null
          tenant_id_provider?: string | null
          token_url?: string | null
          updated_at?: string | null
          userinfo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_providers_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sso_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          contact_email: string
          created_at: string | null
          current_users_count: number | null
          id: string
          is_active: boolean | null
          max_users: number
          name: string
          settings: Json | null
          slug: string
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email: string
          created_at?: string | null
          current_users_count?: number | null
          id?: string
          is_active?: boolean | null
          max_users?: number
          name: string
          settings?: Json | null
          slug: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string
          created_at?: string | null
          current_users_count?: number | null
          id?: string
          is_active?: boolean | null
          max_users?: number
          name?: string
          settings?: Json | null
          slug?: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      theme_change_history: {
        Row: {
          automatic_change: boolean | null
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          new_config: Json | null
          new_theme_id: string | null
          previous_config: Json | null
          previous_theme_id: string | null
          tenant_id: string | null
        }
        Insert: {
          automatic_change?: boolean | null
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_config?: Json | null
          new_theme_id?: string | null
          previous_config?: Json | null
          previous_theme_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          automatic_change?: boolean | null
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_config?: Json | null
          new_theme_id?: string | null
          previous_config?: Json | null
          previous_theme_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "theme_change_history_new_theme_id_fkey"
            columns: ["new_theme_id"]
            isOneToOne: false
            referencedRelation: "global_ui_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theme_change_history_previous_theme_id_fkey"
            columns: ["previous_theme_id"]
            isOneToOne: false
            referencedRelation: "global_ui_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theme_change_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_configurations: {
        Row: {
          accent_color: string
          background_color: string
          border_color: string
          border_radius: number | null
          created_at: string | null
          created_by: string | null
          error_color: string
          font_family: string | null
          font_size_base: number | null
          id: string
          info_color: string
          is_active: boolean | null
          is_dark_mode: boolean | null
          name: string
          primary_color: string
          secondary_color: string
          shadow_intensity: number | null
          success_color: string
          surface_color: string
          tenant_id: string | null
          text_color: string
          updated_at: string | null
          warning_color: string
        }
        Insert: {
          accent_color: string
          background_color: string
          border_color: string
          border_radius?: number | null
          created_at?: string | null
          created_by?: string | null
          error_color: string
          font_family?: string | null
          font_size_base?: number | null
          id?: string
          info_color: string
          is_active?: boolean | null
          is_dark_mode?: boolean | null
          name: string
          primary_color: string
          secondary_color: string
          shadow_intensity?: number | null
          success_color: string
          surface_color: string
          tenant_id?: string | null
          text_color: string
          updated_at?: string | null
          warning_color: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          border_color?: string
          border_radius?: number | null
          created_at?: string | null
          created_by?: string | null
          error_color?: string
          font_family?: string | null
          font_size_base?: number | null
          id?: string
          info_color?: string
          is_active?: boolean | null
          is_dark_mode?: boolean | null
          name?: string
          primary_color?: string
          secondary_color?: string
          shadow_intensity?: number | null
          success_color?: string
          surface_color?: string
          tenant_id?: string | null
          text_color?: string
          updated_at?: string | null
          warning_color?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_assessment_frameworks: {
        Row: {
          alex_recommendations: Json | null
          created_at: string | null
          created_by: string | null
          customization_level: string | null
          description: string | null
          framework_type: string
          id: string
          industry: string | null
          is_active: boolean | null
          is_inherited: boolean | null
          master_template_id: string | null
          name: string
          questions: Json
          scoring_model: Json
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          version: string | null
        }
        Insert: {
          alex_recommendations?: Json | null
          created_at?: string | null
          created_by?: string | null
          customization_level?: string | null
          description?: string | null
          framework_type: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_inherited?: boolean | null
          master_template_id?: string | null
          name: string
          questions?: Json
          scoring_model?: Json
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
        }
        Update: {
          alex_recommendations?: Json | null
          created_at?: string | null
          created_by?: string | null
          customization_level?: string | null
          description?: string | null
          framework_type?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_inherited?: boolean | null
          master_template_id?: string | null
          name?: string
          questions?: Json
          scoring_model?: Json
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assessment_frameworks_master_template_id_fkey"
            columns: ["master_template_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessment_master_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_assessment_master_templates: {
        Row: {
          alex_recommendations: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          framework_type: string
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          questions: Json
          scoring_model: Json
          updated_at: string | null
          version: string | null
        }
        Insert: {
          alex_recommendations?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          framework_type: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          questions?: Json
          scoring_model?: Json
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          alex_recommendations?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          framework_type?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          questions?: Json
          scoring_model?: Json
          updated_at?: string | null
          version?: string | null
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_assessments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_audit_logs: {
        Row: {
          action_type: string
          alex_context: Json | null
          assessment_id: string | null
          changed_fields: string[] | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          notes: string | null
          old_values: Json | null
          risk_id: string | null
          session_id: string | null
          tenant_id: string
          user_agent: string | null
          user_email: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          action_type: string
          alex_context?: Json | null
          assessment_id?: string | null
          changed_fields?: string[] | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          risk_id?: string | null
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_email?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          action_type?: string
          alex_context?: Json | null
          assessment_id?: string | null
          changed_fields?: string[] | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          risk_id?: string | null
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_audit_logs_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_audit_logs_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "vendor_risks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_audit_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_certifications: {
        Row: {
          alex_validation: Json | null
          attachments: Json | null
          certificate_number: string | null
          certificate_url: string | null
          certification_name: string
          certification_type: string
          created_at: string | null
          created_by: string | null
          expiry_date: string
          id: string
          issue_date: string
          issuing_authority: string
          notes: string | null
          scope: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          vendor_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          alex_validation?: Json | null
          attachments?: Json | null
          certificate_number?: string | null
          certificate_url?: string | null
          certification_name: string
          certification_type: string
          created_at?: string | null
          created_by?: string | null
          expiry_date: string
          id?: string
          issue_date: string
          issuing_authority: string
          notes?: string | null
          scope?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          alex_validation?: Json | null
          attachments?: Json | null
          certificate_number?: string | null
          certificate_url?: string | null
          certification_name?: string
          certification_type?: string
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string
          id?: string
          issue_date?: string
          issuing_authority?: string
          notes?: string | null
          scope?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_certifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_checklist_responses: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          item_id: string
          justification: string | null
          responded_at: string | null
          responded_by: string | null
          status: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          item_id: string
          justification?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          item_id?: string
          justification?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_checklist_responses_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "vendor_checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_checklist_responses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_checklist_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          order_index: number
          required: boolean | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          order_index?: number
          required?: boolean | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          order_index?: number
          required?: boolean | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_checklist_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_communications: {
        Row: {
          alex_sentiment_analysis: Json | null
          alex_suggested_actions: Json | null
          assessment_id: string | null
          attachments: Json | null
          communication_type: string
          content: string
          created_at: string | null
          created_by: string | null
          direction: string
          id: string
          incident_id: string | null
          metadata: Json | null
          priority: string | null
          read_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          responded_at: string | null
          sender_email: string | null
          sender_name: string | null
          sent_at: string | null
          status: string | null
          subject: string
          tenant_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          alex_sentiment_analysis?: Json | null
          alex_suggested_actions?: Json | null
          assessment_id?: string | null
          attachments?: Json | null
          communication_type: string
          content: string
          created_at?: string | null
          created_by?: string | null
          direction: string
          id?: string
          incident_id?: string | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          responded_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          tenant_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          alex_sentiment_analysis?: Json | null
          alex_suggested_actions?: Json | null
          assessment_id?: string | null
          attachments?: Json | null
          communication_type?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          direction?: string
          id?: string
          incident_id?: string | null
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          responded_at?: string | null
          sender_email?: string | null
          sender_name?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          tenant_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_communications_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_communications_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "vendor_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_communications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contacts: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          id: string
          is_active: boolean | null
          is_compliance_contact: boolean | null
          is_primary: boolean | null
          is_security_contact: boolean | null
          is_technical_contact: boolean | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_compliance_contact?: boolean | null
          is_primary?: boolean | null
          is_security_contact?: boolean | null
          is_technical_contact?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_compliance_contact?: boolean | null
          is_primary?: boolean | null
          is_security_contact?: boolean | null
          is_technical_contact?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_contracts: {
        Row: {
          alex_recommendations: Json | null
          alex_risk_analysis: Json | null
          attachments: Json | null
          auto_renewal: boolean | null
          compliance_requirements: Json | null
          contract_name: string
          contract_number: string | null
          contract_type: string
          contract_value: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          end_date: string
          id: string
          insurance_requirements: string | null
          key_clauses: Json | null
          liability_limits: number | null
          next_review_date: string | null
          payment_terms: string | null
          renewal_notice_days: number | null
          review_date: string | null
          security_requirements: Json | null
          sla_requirements: Json | null
          start_date: string
          status: string | null
          tenant_id: string
          termination_clauses: string | null
          updated_at: string | null
          updated_by: string | null
          vendor_id: string
        }
        Insert: {
          alex_recommendations?: Json | null
          alex_risk_analysis?: Json | null
          attachments?: Json | null
          auto_renewal?: boolean | null
          compliance_requirements?: Json | null
          contract_name: string
          contract_number?: string | null
          contract_type: string
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          end_date: string
          id?: string
          insurance_requirements?: string | null
          key_clauses?: Json | null
          liability_limits?: number | null
          next_review_date?: string | null
          payment_terms?: string | null
          renewal_notice_days?: number | null
          review_date?: string | null
          security_requirements?: Json | null
          sla_requirements?: Json | null
          start_date: string
          status?: string | null
          tenant_id: string
          termination_clauses?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id: string
        }
        Update: {
          alex_recommendations?: Json | null
          alex_risk_analysis?: Json | null
          attachments?: Json | null
          auto_renewal?: boolean | null
          compliance_requirements?: Json | null
          contract_name?: string
          contract_number?: string | null
          contract_type?: string
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          end_date?: string
          id?: string
          insurance_requirements?: string | null
          key_clauses?: Json | null
          liability_limits?: number | null
          next_review_date?: string | null
          payment_terms?: string | null
          renewal_notice_days?: number | null
          review_date?: string | null
          security_requirements?: Json | null
          sla_requirements?: Json | null
          start_date?: string
          status?: string | null
          tenant_id?: string
          termination_clauses?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_incidents: {
        Row: {
          alex_analysis: Json | null
          alex_recommendations: Json | null
          assigned_to: string | null
          attachments: Json | null
          client_notification_required: boolean | null
          client_notification_sent: boolean | null
          created_at: string | null
          created_by: string | null
          description: string
          detected_at: string | null
          escalated_to: string | null
          external_reference: string | null
          id: string
          impact_assessment: string | null
          incident_type: string
          lessons_learned: string | null
          metadata: Json | null
          occurred_at: string
          regulatory_notification_required: boolean | null
          regulatory_notification_sent: boolean | null
          reported_by: string | null
          resolution_summary: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
          updated_by: string | null
          vendor_id: string
        }
        Insert: {
          alex_analysis?: Json | null
          alex_recommendations?: Json | null
          assigned_to?: string | null
          attachments?: Json | null
          client_notification_required?: boolean | null
          client_notification_sent?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description: string
          detected_at?: string | null
          escalated_to?: string | null
          external_reference?: string | null
          id?: string
          impact_assessment?: string | null
          incident_type: string
          lessons_learned?: string | null
          metadata?: Json | null
          occurred_at: string
          regulatory_notification_required?: boolean | null
          regulatory_notification_sent?: boolean | null
          reported_by?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id: string
        }
        Update: {
          alex_analysis?: Json | null
          alex_recommendations?: Json | null
          assigned_to?: string | null
          attachments?: Json | null
          client_notification_required?: boolean | null
          client_notification_sent?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          detected_at?: string | null
          escalated_to?: string | null
          external_reference?: string | null
          id?: string
          impact_assessment?: string | null
          incident_type?: string
          lessons_learned?: string | null
          metadata?: Json | null
          occurred_at?: string
          regulatory_notification_required?: boolean | null
          regulatory_notification_sent?: boolean | null
          reported_by?: string | null
          resolution_summary?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_incidents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_notifications: {
        Row: {
          alex_personalization: Json | null
          assessment_id: string | null
          created_at: string | null
          created_by: string | null
          delivered_at: string | null
          delivery_method: string | null
          id: string
          incident_id: string | null
          max_retries: number | null
          message: string
          metadata: Json | null
          notification_type: string
          priority: string | null
          read_at: string | null
          recipient_email: string | null
          recipient_type: string | null
          recipient_user_id: string | null
          retry_count: number | null
          risk_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          alex_personalization?: Json | null
          assessment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          incident_id?: string | null
          max_retries?: number | null
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_type?: string | null
          recipient_user_id?: string | null
          retry_count?: number | null
          risk_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          alex_personalization?: Json | null
          assessment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          delivery_method?: string | null
          id?: string
          incident_id?: string | null
          max_retries?: number | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          recipient_email?: string | null
          recipient_type?: string | null
          recipient_user_id?: string | null
          retry_count?: number | null
          risk_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_notifications_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_notifications_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "vendor_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_notifications_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "vendor_risks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_notifications_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_performance_metrics: {
        Row: {
          alex_analysis: Json | null
          benchmark_value: number | null
          created_at: string | null
          created_by: string | null
          data_source: string | null
          id: string
          measurement_date: string
          measurement_period: string | null
          metric_category: string
          metric_name: string
          metric_value: number
          notes: string | null
          status: string | null
          target_value: number | null
          tenant_id: string
          trend: string | null
          unit: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          alex_analysis?: Json | null
          benchmark_value?: number | null
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          id?: string
          measurement_date: string
          measurement_period?: string | null
          metric_category: string
          metric_name: string
          metric_value: number
          notes?: string | null
          status?: string | null
          target_value?: number | null
          tenant_id: string
          trend?: string | null
          unit?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          alex_analysis?: Json | null
          benchmark_value?: number | null
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          id?: string
          measurement_date?: string
          measurement_period?: string | null
          metric_category?: string
          metric_name?: string
          metric_value?: number
          notes?: string | null
          status?: string | null
          target_value?: number | null
          tenant_id?: string
          trend?: string | null
          unit?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_performance_metrics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_registry: {
        Row: {
          address: Json | null
          alex_analysis: Json | null
          annual_spend: number | null
          business_category: string
          contract_end_date: string | null
          contract_start_date: string | null
          contract_status: string | null
          contract_value: number | null
          created_at: string | null
          created_by: string | null
          criticality_level: string
          description: string | null
          id: string
          last_assessment_date: string | null
          legal_name: string | null
          metadata: Json | null
          name: string
          next_assessment_due: string | null
          onboarding_progress: number | null
          onboarding_status: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          registration_number: string | null
          risk_score: number | null
          status: string | null
          tax_id: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          vendor_type: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          alex_analysis?: Json | null
          annual_spend?: number | null
          business_category: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          criticality_level?: string
          description?: string | null
          id?: string
          last_assessment_date?: string | null
          legal_name?: string | null
          metadata?: Json | null
          name: string
          next_assessment_due?: string | null
          onboarding_progress?: number | null
          onboarding_status?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          risk_score?: number | null
          status?: string | null
          tax_id?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_type: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          alex_analysis?: Json | null
          annual_spend?: number | null
          business_category?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          criticality_level?: string
          description?: string | null
          id?: string
          last_assessment_date?: string | null
          legal_name?: string | null
          metadata?: Json | null
          name?: string
          next_assessment_due?: string | null
          onboarding_progress?: number | null
          onboarding_status?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          registration_number?: string | null
          risk_score?: number | null
          status?: string | null
          tax_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_type?: string
          website?: string | null
        }
        Relationships: []
      }
      vendor_risk_action_plans: {
        Row: {
          action_type: string | null
          actual_cost: number | null
          alex_insights: Json | null
          assigned_to: string | null
          completion_date: string | null
          created_at: string | null
          created_by: string | null
          dependencies: string[] | null
          description: string
          due_date: string
          effectiveness_rating: number | null
          estimated_cost: number | null
          id: string
          milestones: Json | null
          notes: string | null
          priority: string | null
          progress_percentage: number | null
          risk_id: string
          start_date: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
          updated_by: string | null
          vendor_id: string
          verification_evidence: string | null
          verification_method: string | null
        }
        Insert: {
          action_type?: string | null
          actual_cost?: number | null
          alex_insights?: Json | null
          assigned_to?: string | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          dependencies?: string[] | null
          description: string
          due_date: string
          effectiveness_rating?: number | null
          estimated_cost?: number | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          priority?: string | null
          progress_percentage?: number | null
          risk_id: string
          start_date?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id: string
          verification_evidence?: string | null
          verification_method?: string | null
        }
        Update: {
          action_type?: string | null
          actual_cost?: number | null
          alex_insights?: Json | null
          assigned_to?: string | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          dependencies?: string[] | null
          description?: string
          due_date?: string
          effectiveness_rating?: number | null
          estimated_cost?: number | null
          id?: string
          milestones?: Json | null
          notes?: string | null
          priority?: string | null
          progress_percentage?: number | null
          risk_id?: string
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string
          verification_evidence?: string | null
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_risk_action_plans_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "vendor_risks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_risk_action_plans_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_risks: {
        Row: {
          alex_analysis: Json | null
          alex_recommendations: Json | null
          assessment_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          identified_date: string | null
          impact_score: number
          last_review_date: string | null
          likelihood_score: number
          metadata: Json | null
          next_review_date: string | null
          overall_score: number
          owner_user_id: string | null
          risk_category: string
          risk_level: string
          risk_type: string
          status: string | null
          tenant_id: string
          title: string
          treatment_strategy: string | null
          updated_at: string | null
          updated_by: string | null
          vendor_id: string
        }
        Insert: {
          alex_analysis?: Json | null
          alex_recommendations?: Json | null
          assessment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          identified_date?: string | null
          impact_score: number
          last_review_date?: string | null
          likelihood_score: number
          metadata?: Json | null
          next_review_date?: string | null
          overall_score: number
          owner_user_id?: string | null
          risk_category: string
          risk_level: string
          risk_type: string
          status?: string | null
          tenant_id: string
          title: string
          treatment_strategy?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id: string
        }
        Update: {
          alex_analysis?: Json | null
          alex_recommendations?: Json | null
          assessment_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          identified_date?: string | null
          impact_score?: number
          last_review_date?: string | null
          likelihood_score?: number
          metadata?: Json | null
          next_review_date?: string | null
          overall_score?: number
          owner_user_id?: string | null
          risk_category?: string
          risk_level?: string
          risk_type?: string
          status?: string | null
          tenant_id?: string
          title?: string
          treatment_strategy?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_risks_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_risks_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_registry"
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
      webhook_endpoints: {
        Row: {
          avg_response_time_ms: number | null
          created_at: string | null
          created_by: string | null
          custom_headers: Json | null
          deliveries_today: number | null
          events: Json
          failed_deliveries: number | null
          hmac_secret_encrypted: string | null
          id: string
          integration_id: string | null
          is_active: boolean | null
          last_delivery_at: string | null
          last_failure_at: string | null
          last_failure_reason: string | null
          last_success_at: string | null
          method: string | null
          name: string
          retry_attempts: number | null
          retry_delay_seconds: number | null
          successful_deliveries: number | null
          tenant_id: string | null
          timeout_seconds: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_headers?: Json | null
          deliveries_today?: number | null
          events: Json
          failed_deliveries?: number | null
          hmac_secret_encrypted?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          last_delivery_at?: string | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_success_at?: string | null
          method?: string | null
          name: string
          retry_attempts?: number | null
          retry_delay_seconds?: number | null
          successful_deliveries?: number | null
          tenant_id?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_headers?: Json | null
          deliveries_today?: number | null
          events?: Json
          failed_deliveries?: number | null
          hmac_secret_encrypted?: string | null
          id?: string
          integration_id?: string | null
          is_active?: boolean | null
          last_delivery_at?: string | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_success_at?: string | null
          method?: string | null
          name?: string
          retry_attempts?: number | null
          retry_delay_seconds?: number | null
          successful_deliveries?: number | null
          tenant_id?: string | null
          timeout_seconds?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_endpoints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_font_globally: {
        Args: { font_id: string }
        Returns: boolean
      }
      apply_theme: {
        Args: { tenant_uuid?: string; theme_uuid: string }
        Returns: boolean
      }
      apply_theme_globally: {
        Args: { theme_id: string }
        Returns: boolean
      }
      calculate_assessment_progress: {
        Args: { assessment_id_param: string }
        Returns: number
      }
      calculate_cmmi_average: {
        Args: { assessment_id_param: string }
        Returns: number
      }
      calculate_policy_metrics: {
        Args: { policy_uuid: string }
        Returns: Json
      }
      calculate_privacy_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      calculate_prompt_quality_score: {
        Args: { prompt_uuid: string }
        Returns: number
      }
      calculate_risk_level: {
        Args: { impact_score: number; likelihood_score: number }
        Returns: string
      }
      calculate_vendor_risk_score: {
        Args: { vendor_id: string }
        Returns: number
      }
      can_manage_user: {
        Args: { _manager_id: string; _target_user_id: string }
        Returns: boolean
      }
      capture_native_ui_theme: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_expired_ai_conversations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string; key_name?: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data: string; key_name?: string }
        Returns: string
      }
      get_active_theme: {
        Args: { tenant_uuid?: string }
        Returns: Json
      }
      get_ai_usage_stats: {
        Args: { days_back?: number; tenant_uuid: string }
        Returns: Json
      }
      get_expiring_policies: {
        Args: { days_ahead?: number }
        Returns: {
          days_until_expiry: number
          expiry_date: string
          policy_id: string
          title: string
        }[]
      }
      get_integration_stats: {
        Args: { tenant_uuid: string }
        Returns: Json
      }
      get_tenant_settings: {
        Args: { category_filter?: string; tenant_uuid: string }
        Returns: {
          category: string
          is_global: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
        }[]
      }
      get_vendor_dashboard_metrics: {
        Args: { tenant_uuid: string }
        Returns: Json
      }
      get_vendor_risk_distribution: {
        Args: { tenant_uuid: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      inherit_master_templates_for_tenant: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      is_platform_admin: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: unknown
          p_resource_id?: string
          p_resource_type: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      make_user_admin: {
        Args: { email_to_promote: string }
        Returns: boolean
      }
      rpc_log_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: string
      }
      rpc_manage_tenant: {
        Args: { action: string; tenant_data?: Json; tenant_id_param?: string }
        Returns: Json
      }
      sync_theme_state: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      test_dpia_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
      audit_action_enum:
        | "create"
        | "update"
        | "delete"
        | "activate"
        | "deactivate"
      maturity_level: "1" | "2" | "3" | "4" | "5"
      platform_role: "platform_admin" | "tenant_admin" | "user"
      risk_level_enum: "Muito Alto" | "Alto" | "Médio" | "Baixo" | "Muito Baixo"
      template_status_enum: "active" | "inactive" | "draft"
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
      audit_action_enum: [
        "create",
        "update",
        "delete",
        "activate",
        "deactivate",
      ],
      maturity_level: ["1", "2", "3", "4", "5"],
      platform_role: ["platform_admin", "tenant_admin", "user"],
      risk_level_enum: ["Muito Alto", "Alto", "Médio", "Baixo", "Muito Baixo"],
      template_status_enum: ["active", "inactive", "draft"],
    },
  },
} as const
