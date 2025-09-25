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
      action_plan_activities: {
        Row: {
          action_plan_id: string
          atividade_pai: string | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          criterios_aceitacao: string[] | null
          custo_estimado: number | null
          custo_real: number | null
          data_fim_planejada: string
          data_fim_real: string | null
          data_inicio_planejada: string
          data_inicio_real: string | null
          dependencias: string[] | null
          descricao: string | null
          documentos_trabalho: Json | null
          duracao_estimada_horas: number | null
          duracao_real_horas: number | null
          entregaveis_esperados: string[] | null
          equipe_execucao: string[] | null
          evidencias_conclusao: Json | null
          id: string
          impacto_atraso: string | null
          metadados: Json | null
          observacoes: string | null
          ordem_execucao: number | null
          percentual_conclusao: number | null
          prioridade: string | null
          problemas_enfrentados: string | null
          qualidade_entrega: number | null
          recursos_necessarios: string[] | null
          responsavel_aprovacao: string | null
          responsavel_execucao: string | null
          resultados_obtidos: string | null
          riscos_identificados: Json | null
          solucoes_aplicadas: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          tipo_atividade: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          action_plan_id: string
          atividade_pai?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_aceitacao?: string[] | null
          custo_estimado?: number | null
          custo_real?: number | null
          data_fim_planejada: string
          data_fim_real?: string | null
          data_inicio_planejada: string
          data_inicio_real?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          documentos_trabalho?: Json | null
          duracao_estimada_horas?: number | null
          duracao_real_horas?: number | null
          entregaveis_esperados?: string[] | null
          equipe_execucao?: string[] | null
          evidencias_conclusao?: Json | null
          id?: string
          impacto_atraso?: string | null
          metadados?: Json | null
          observacoes?: string | null
          ordem_execucao?: number | null
          percentual_conclusao?: number | null
          prioridade?: string | null
          problemas_enfrentados?: string | null
          qualidade_entrega?: number | null
          recursos_necessarios?: string[] | null
          responsavel_aprovacao?: string | null
          responsavel_execucao?: string | null
          resultados_obtidos?: string | null
          riscos_identificados?: Json | null
          solucoes_aplicadas?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          tipo_atividade?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          action_plan_id?: string
          atividade_pai?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_aceitacao?: string[] | null
          custo_estimado?: number | null
          custo_real?: number | null
          data_fim_planejada?: string
          data_fim_real?: string | null
          data_inicio_planejada?: string
          data_inicio_real?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          documentos_trabalho?: Json | null
          duracao_estimada_horas?: number | null
          duracao_real_horas?: number | null
          entregaveis_esperados?: string[] | null
          equipe_execucao?: string[] | null
          evidencias_conclusao?: Json | null
          id?: string
          impacto_atraso?: string | null
          metadados?: Json | null
          observacoes?: string | null
          ordem_execucao?: number | null
          percentual_conclusao?: number | null
          prioridade?: string | null
          problemas_enfrentados?: string | null
          qualidade_entrega?: number | null
          recursos_necessarios?: string[] | null
          responsavel_aprovacao?: string | null
          responsavel_execucao?: string | null
          resultados_obtidos?: string | null
          riscos_identificados?: Json | null
          solucoes_aplicadas?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          tipo_atividade?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_activities_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_activities_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "vw_action_plans_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_activities_atividade_pai_fkey"
            columns: ["atividade_pai"]
            isOneToOne: false
            referencedRelation: "action_plan_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_activities_responsavel_aprovacao_fkey"
            columns: ["responsavel_aprovacao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_activities_responsavel_execucao_fkey"
            columns: ["responsavel_execucao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "action_plan_activities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_categories: {
        Row: {
          ativo: boolean | null
          codigo: string
          cor_categoria: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          icone: string | null
          id: string
          metadados: Json | null
          nome: string
          ordem_exibicao: number | null
          permite_subcategorias: boolean | null
          requer_aprovacao: boolean | null
          template_padrao: Json | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          cor_categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          metadados?: Json | null
          nome: string
          ordem_exibicao?: number | null
          permite_subcategorias?: boolean | null
          requer_aprovacao?: boolean | null
          template_padrao?: Json | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          cor_categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          metadados?: Json | null
          nome?: string
          ordem_exibicao?: number | null
          permite_subcategorias?: boolean | null
          requer_aprovacao?: boolean | null
          template_padrao?: Json | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "action_plan_categories_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_comments: {
        Row: {
          action_plan_id: string | null
          activity_id: string | null
          anexos: Json | null
          autor: string
          comentario_pai: string | null
          conteudo: string
          data_comentario: string | null
          editado_em: string | null
          editado_por: string | null
          id: string
          metadados: Json | null
          notificar_responsaveis: boolean | null
          notificar_stakeholders: boolean | null
          prioridade: string | null
          tenant_id: string
          tipo_comentario: string | null
          visibilidade: string | null
        }
        Insert: {
          action_plan_id?: string | null
          activity_id?: string | null
          anexos?: Json | null
          autor: string
          comentario_pai?: string | null
          conteudo: string
          data_comentario?: string | null
          editado_em?: string | null
          editado_por?: string | null
          id?: string
          metadados?: Json | null
          notificar_responsaveis?: boolean | null
          notificar_stakeholders?: boolean | null
          prioridade?: string | null
          tenant_id: string
          tipo_comentario?: string | null
          visibilidade?: string | null
        }
        Update: {
          action_plan_id?: string | null
          activity_id?: string | null
          anexos?: Json | null
          autor?: string
          comentario_pai?: string | null
          conteudo?: string
          data_comentario?: string | null
          editado_em?: string | null
          editado_por?: string | null
          id?: string
          metadados?: Json | null
          notificar_responsaveis?: boolean | null
          notificar_stakeholders?: boolean | null
          prioridade?: string | null
          tenant_id?: string
          tipo_comentario?: string | null
          visibilidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_comments_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_comments_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "vw_action_plans_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "action_plan_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_comments_autor_fkey"
            columns: ["autor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_comments_comentario_pai_fkey"
            columns: ["comentario_pai"]
            isOneToOne: false
            referencedRelation: "action_plan_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_comments_editado_por_fkey"
            columns: ["editado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      action_plan_history: {
        Row: {
          action_plan_id: string | null
          activity_id: string | null
          campo_alterado: string | null
          data_acao: string | null
          id: string
          ip_origem: unknown | null
          metadados: Json | null
          observacoes: string | null
          tenant_id: string
          tipo_alteracao: string
          user_agent: string | null
          usuario_acao: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          action_plan_id?: string | null
          activity_id?: string | null
          campo_alterado?: string | null
          data_acao?: string | null
          id?: string
          ip_origem?: unknown | null
          metadados?: Json | null
          observacoes?: string | null
          tenant_id: string
          tipo_alteracao: string
          user_agent?: string | null
          usuario_acao?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          action_plan_id?: string | null
          activity_id?: string | null
          campo_alterado?: string | null
          data_acao?: string | null
          id?: string
          ip_origem?: unknown | null
          metadados?: Json | null
          observacoes?: string | null
          tenant_id?: string
          tipo_alteracao?: string
          user_agent?: string | null
          usuario_acao?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_history_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_history_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "vw_action_plans_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_history_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "action_plan_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "action_plan_history_usuario_acao_fkey"
            columns: ["usuario_acao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_notifications: {
        Row: {
          action_plan_id: string | null
          activity_id: string | null
          canal_email: boolean | null
          canal_sistema: boolean | null
          canal_slack: boolean | null
          canal_whatsapp: boolean | null
          created_at: string | null
          data_agendamento: string | null
          data_envio: string | null
          data_leitura: string | null
          destinatario_id: string
          erro_envio: string | null
          id: string
          mensagem: string
          metadados: Json | null
          prioridade: string | null
          status_envio: string | null
          tenant_id: string
          tentativas_envio: number | null
          tipo_destinatario: string | null
          tipo_notificacao: string
          titulo: string
        }
        Insert: {
          action_plan_id?: string | null
          activity_id?: string | null
          canal_email?: boolean | null
          canal_sistema?: boolean | null
          canal_slack?: boolean | null
          canal_whatsapp?: boolean | null
          created_at?: string | null
          data_agendamento?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          destinatario_id: string
          erro_envio?: string | null
          id?: string
          mensagem: string
          metadados?: Json | null
          prioridade?: string | null
          status_envio?: string | null
          tenant_id: string
          tentativas_envio?: number | null
          tipo_destinatario?: string | null
          tipo_notificacao: string
          titulo: string
        }
        Update: {
          action_plan_id?: string | null
          activity_id?: string | null
          canal_email?: boolean | null
          canal_sistema?: boolean | null
          canal_slack?: boolean | null
          canal_whatsapp?: boolean | null
          created_at?: string | null
          data_agendamento?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          destinatario_id?: string
          erro_envio?: string | null
          id?: string
          mensagem?: string
          metadados?: Json | null
          prioridade?: string | null
          status_envio?: string | null
          tenant_id?: string
          tentativas_envio?: number | null
          tipo_destinatario?: string | null
          tipo_notificacao?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_notifications_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_notifications_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "vw_action_plans_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_notifications_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "action_plan_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_notifications_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      action_plan_templates: {
        Row: {
          atividades_padrao: Json | null
          ativo: boolean | null
          category_id: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          descricao: string | null
          id: string
          metadados: Json | null
          modulo_aplicavel: string | null
          nome: string
          ordem_exibicao: number | null
          publico: boolean | null
          tags: string[] | null
          template_plano: Json
          tenant_id: string
          tipo_situacao: string | null
          updated_at: string | null
          updated_by: string | null
          versao: string | null
        }
        Insert: {
          atividades_padrao?: Json | null
          ativo?: boolean | null
          category_id?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          metadados?: Json | null
          modulo_aplicavel?: string | null
          nome: string
          ordem_exibicao?: number | null
          publico?: boolean | null
          tags?: string[] | null
          template_plano: Json
          tenant_id: string
          tipo_situacao?: string | null
          updated_at?: string | null
          updated_by?: string | null
          versao?: string | null
        }
        Update: {
          atividades_padrao?: Json | null
          ativo?: boolean | null
          category_id?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          id?: string
          metadados?: Json | null
          modulo_aplicavel?: string | null
          nome?: string
          ordem_exibicao?: number | null
          publico?: boolean | null
          tags?: string[] | null
          template_plano?: Json
          tenant_id?: string
          tipo_situacao?: string | null
          updated_at?: string | null
          updated_by?: string | null
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "action_plan_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plan_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "action_plan_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          aprovado_por: string | null
          category_id: string
          codigo: string
          complexidade: string | null
          configuracao_alertas: Json | null
          contexto_adicional: Json | null
          created_at: string | null
          created_by: string | null
          criticidade: string | null
          data_aprovacao: string | null
          data_fim_planejada: string | null
          data_fim_real: string | null
          data_inicio_planejada: string | null
          data_inicio_real: string | null
          data_proxima_revisao: string | null
          descricao: string | null
          documentos_anexos: Json | null
          efetividade_percentual: number | null
          entidade_origem_id: string | null
          entidade_origem_tipo: string | null
          equipe_responsavel: string[] | null
          fase_atual: string | null
          frequencia_relatorios: string | null
          gut_gravidade: number | null
          gut_score: number | null
          gut_tendencia: number | null
          gut_urgencia: number | null
          id: string
          kpis_definidos: Json | null
          licoes_aprendidas: string | null
          links_relacionados: Json | null
          metadados: Json | null
          modulo_origem: string
          objetivo: string | null
          observacoes_aprovacao: string | null
          orcamento_planejado: number | null
          orcamento_realizado: number | null
          percentual_conclusao: number | null
          plano_comunicacao: Json | null
          prioridade: string | null
          proxima_notificacao: string | null
          recursos_alocados: Json | null
          recursos_necessarios: string[] | null
          requer_aprovacao: boolean | null
          responsavel_aprovacao: string | null
          responsavel_plano: string | null
          resultados_alcancados: Json | null
          stakeholders: string[] | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          titulo: string
          updated_at: string | null
          updated_by: string | null
          workflow_config: Json | null
        }
        Insert: {
          aprovado_por?: string | null
          category_id: string
          codigo: string
          complexidade?: string | null
          configuracao_alertas?: Json | null
          contexto_adicional?: Json | null
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          data_aprovacao?: string | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio_planejada?: string | null
          data_inicio_real?: string | null
          data_proxima_revisao?: string | null
          descricao?: string | null
          documentos_anexos?: Json | null
          efetividade_percentual?: number | null
          entidade_origem_id?: string | null
          entidade_origem_tipo?: string | null
          equipe_responsavel?: string[] | null
          fase_atual?: string | null
          frequencia_relatorios?: string | null
          gut_gravidade?: number | null
          gut_score?: number | null
          gut_tendencia?: number | null
          gut_urgencia?: number | null
          id?: string
          kpis_definidos?: Json | null
          licoes_aprendidas?: string | null
          links_relacionados?: Json | null
          metadados?: Json | null
          modulo_origem: string
          objetivo?: string | null
          observacoes_aprovacao?: string | null
          orcamento_planejado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          plano_comunicacao?: Json | null
          prioridade?: string | null
          proxima_notificacao?: string | null
          recursos_alocados?: Json | null
          recursos_necessarios?: string[] | null
          requer_aprovacao?: boolean | null
          responsavel_aprovacao?: string | null
          responsavel_plano?: string | null
          resultados_alcancados?: Json | null
          stakeholders?: string[] | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
          workflow_config?: Json | null
        }
        Update: {
          aprovado_por?: string | null
          category_id?: string
          codigo?: string
          complexidade?: string | null
          configuracao_alertas?: Json | null
          contexto_adicional?: Json | null
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          data_aprovacao?: string | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio_planejada?: string | null
          data_inicio_real?: string | null
          data_proxima_revisao?: string | null
          descricao?: string | null
          documentos_anexos?: Json | null
          efetividade_percentual?: number | null
          entidade_origem_id?: string | null
          entidade_origem_tipo?: string | null
          equipe_responsavel?: string[] | null
          fase_atual?: string | null
          frequencia_relatorios?: string | null
          gut_gravidade?: number | null
          gut_score?: number | null
          gut_tendencia?: number | null
          gut_urgencia?: number | null
          id?: string
          kpis_definidos?: Json | null
          licoes_aprendidas?: string | null
          links_relacionados?: Json | null
          metadados?: Json | null
          modulo_origem?: string
          objetivo?: string | null
          observacoes_aprovacao?: string | null
          orcamento_planejado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          plano_comunicacao?: Json | null
          prioridade?: string | null
          proxima_notificacao?: string | null
          recursos_alocados?: Json | null
          recursos_necessarios?: string[] | null
          requer_aprovacao?: boolean | null
          responsavel_aprovacao?: string | null
          responsavel_plano?: string | null
          resultados_alcancados?: Json | null
          stakeholders?: string[] | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
          workflow_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "action_plan_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_responsavel_aprovacao_fkey"
            columns: ["responsavel_aprovacao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_responsavel_plano_fkey"
            columns: ["responsavel_plano"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "action_plans_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
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
          {
            foreignKeyName: "ai_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "ai_conversation_contexts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          use_case?: string
          validation_criteria?: Json | null
          variables?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_grc_prompt_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_grc_prompt_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
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
          {
            foreignKeyName: "ai_grc_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "ai_module_prompts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "ai_workflows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "api_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      apontamentos: {
        Row: {
          causa: string
          classificacao_risco: string
          codigo: string
          comunicado_para: string | null
          condicao: string
          created_at: string | null
          created_by: string | null
          criterio: string
          data_comunicacao: string | null
          efeito: string
          execucao_teste_id: string | null
          id: string
          impacto_financeiro: number | null
          impacto_operacional: string | null
          impacto_regulatorio: string | null
          impacto_reputacional: string | null
          metadados: Json | null
          prazo_sugerido: number | null
          projeto_id: string
          recomendacao: string
          recomendacoes_adicionais: string[] | null
          status: string | null
          tenant_id: string
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          causa: string
          classificacao_risco: string
          codigo: string
          comunicado_para?: string | null
          condicao: string
          created_at?: string | null
          created_by?: string | null
          criterio: string
          data_comunicacao?: string | null
          efeito: string
          execucao_teste_id?: string | null
          id?: string
          impacto_financeiro?: number | null
          impacto_operacional?: string | null
          impacto_regulatorio?: string | null
          impacto_reputacional?: string | null
          metadados?: Json | null
          prazo_sugerido?: number | null
          projeto_id: string
          recomendacao: string
          recomendacoes_adicionais?: string[] | null
          status?: string | null
          tenant_id: string
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          causa?: string
          classificacao_risco?: string
          codigo?: string
          comunicado_para?: string | null
          condicao?: string
          created_at?: string | null
          created_by?: string | null
          criterio?: string
          data_comunicacao?: string | null
          efeito?: string
          execucao_teste_id?: string | null
          id?: string
          impacto_financeiro?: number | null
          impacto_operacional?: string | null
          impacto_regulatorio?: string | null
          impacto_reputacional?: string | null
          metadados?: Json | null
          prazo_sugerido?: number | null
          projeto_id?: string
          recomendacao?: string
          recomendacoes_adicionais?: string[] | null
          status?: string | null
          tenant_id?: string
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apontamentos_comunicado_para_fkey"
            columns: ["comunicado_para"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_execucao_teste_id_fkey"
            columns: ["execucao_teste_id"]
            isOneToOne: false
            referencedRelation: "execucoes_teste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos_auditoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "apontamentos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_action_items: {
        Row: {
          action_plan_id: string
          categoria: string | null
          codigo: string | null
          colaboradores: string[] | null
          comentarios: string | null
          control_id: string | null
          created_at: string | null
          created_by: string | null
          criterios_aceitacao: string[] | null
          custo_estimado: number | null
          data_fim_planejada: string | null
          data_fim_real: string | null
          data_inicio_planejada: string | null
          data_inicio_real: string | null
          descricao: string | null
          entregaveis: string[] | null
          evidencias_conclusao: string[] | null
          id: string
          impacto_estimado: string | null
          observacoes: string | null
          ordem: number | null
          percentual_conclusao: number | null
          prioridade: string | null
          responsavel: string | null
          response_id: string | null
          status: string | null
          tenant_id: string
          tipo_acao: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          action_plan_id: string
          categoria?: string | null
          codigo?: string | null
          colaboradores?: string[] | null
          comentarios?: string | null
          control_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_aceitacao?: string[] | null
          custo_estimado?: number | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio_planejada?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          entregaveis?: string[] | null
          evidencias_conclusao?: string[] | null
          id?: string
          impacto_estimado?: string | null
          observacoes?: string | null
          ordem?: number | null
          percentual_conclusao?: number | null
          prioridade?: string | null
          responsavel?: string | null
          response_id?: string | null
          status?: string | null
          tenant_id: string
          tipo_acao?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          action_plan_id?: string
          categoria?: string | null
          codigo?: string | null
          colaboradores?: string[] | null
          comentarios?: string | null
          control_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_aceitacao?: string[] | null
          custo_estimado?: number | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio_planejada?: string | null
          data_inicio_real?: string | null
          descricao?: string | null
          entregaveis?: string[] | null
          evidencias_conclusao?: string[] | null
          id?: string
          impacto_estimado?: string | null
          observacoes?: string | null
          ordem?: number | null
          percentual_conclusao?: number | null
          prioridade?: string | null
          responsavel?: string | null
          response_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo_acao?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_action_items_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "assessment_action_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_items_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "assessment_controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_items_responsavel_fkey"
            columns: ["responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_items_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "assessment_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "assessment_action_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_action_plans: {
        Row: {
          assessment_id: string
          beneficios_esperados: string[] | null
          codigo: string
          created_at: string | null
          created_by: string | null
          data_fim_planejada: string | null
          data_fim_real: string | null
          data_inicio_planejada: string | null
          data_inicio_real: string | null
          dependencias: string[] | null
          descricao: string | null
          equipe_responsavel: string[] | null
          id: string
          impacto_esperado: string | null
          objetivo: string | null
          orcamento_aprovado: number | null
          orcamento_estimado: number | null
          percentual_conclusao: number
          prerequisitos: string[] | null
          prioridade: string
          recursos_necessarios: string[] | null
          responsavel_plano: string | null
          status: string
          tenant_id: string
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assessment_id: string
          beneficios_esperados?: string[] | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio_planejada?: string | null
          data_inicio_real?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          equipe_responsavel?: string[] | null
          id?: string
          impacto_esperado?: string | null
          objetivo?: string | null
          orcamento_aprovado?: number | null
          orcamento_estimado?: number | null
          percentual_conclusao?: number
          prerequisitos?: string[] | null
          prioridade?: string
          recursos_necessarios?: string[] | null
          responsavel_plano?: string | null
          status?: string
          tenant_id: string
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assessment_id?: string
          beneficios_esperados?: string[] | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio_planejada?: string | null
          data_inicio_real?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          equipe_responsavel?: string[] | null
          id?: string
          impacto_esperado?: string | null
          objetivo?: string | null
          orcamento_aprovado?: number | null
          orcamento_estimado?: number | null
          percentual_conclusao?: number
          prerequisitos?: string[] | null
          prioridade?: string
          recursos_necessarios?: string[] | null
          responsavel_plano?: string | null
          status?: string
          tenant_id?: string
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_action_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_plans_responsavel_plano_fkey"
            columns: ["responsavel_plano"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_action_plans_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_controls: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          criticidade: string | null
          descricao: string | null
          domain_id: string | null
          evidencias_necessarias: string[] | null
          framework_id: string
          guia_implementacao: string | null
          id: string
          impacto_potencial: string | null
          objetivo: string | null
          obrigatorio: boolean | null
          ordem: number
          peso: number
          peso_percentual: number | null
          pontuacao_maxima: number | null
          referencias_normativas: string[] | null
          subcategoria: string | null
          tenant_id: string
          tipo_controle: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          descricao?: string | null
          domain_id?: string | null
          evidencias_necessarias?: string[] | null
          framework_id: string
          guia_implementacao?: string | null
          id?: string
          impacto_potencial?: string | null
          objetivo?: string | null
          obrigatorio?: boolean | null
          ordem?: number
          peso?: number
          peso_percentual?: number | null
          pontuacao_maxima?: number | null
          referencias_normativas?: string[] | null
          subcategoria?: string | null
          tenant_id: string
          tipo_controle?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          descricao?: string | null
          domain_id?: string | null
          evidencias_necessarias?: string[] | null
          framework_id?: string
          guia_implementacao?: string | null
          id?: string
          impacto_potencial?: string | null
          objetivo?: string | null
          obrigatorio?: boolean | null
          ordem?: number
          peso?: number
          peso_percentual?: number | null
          pontuacao_maxima?: number | null
          referencias_normativas?: string[] | null
          subcategoria?: string | null
          tenant_id?: string
          tipo_controle?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_controls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_controls_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "assessment_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_controls_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "assessment_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_controls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_controls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "assessment_controls_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_domains: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          created_by: string | null
          descricao: string | null
          framework_id: string
          id: string
          nome: string
          ordem: number
          peso: number
          peso_percentual: number | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          framework_id: string
          id?: string
          nome: string
          ordem?: number
          peso?: number
          peso_percentual?: number | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          framework_id?: string
          id?: string
          nome?: string
          ordem?: number
          peso?: number
          peso_percentual?: number | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_domains_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_domains_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "assessment_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "assessment_domains_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_frameworks: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          criterios_pontuacao: Json | null
          descricao: string | null
          escala_maturidade: Json
          id: string
          industria_aplicavel: string[] | null
          nome: string
          padrao_origem: string | null
          peso_total: number
          publico: boolean
          status: string
          tenant_id: string
          tipo_framework: string
          updated_at: string | null
          updated_by: string | null
          versao: string
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          criterios_pontuacao?: Json | null
          descricao?: string | null
          escala_maturidade?: Json
          id?: string
          industria_aplicavel?: string[] | null
          nome: string
          padrao_origem?: string | null
          peso_total?: number
          publico?: boolean
          status?: string
          tenant_id: string
          tipo_framework: string
          updated_at?: string | null
          updated_by?: string | null
          versao?: string
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          criterios_pontuacao?: Json | null
          descricao?: string | null
          escala_maturidade?: Json
          id?: string
          industria_aplicavel?: string[] | null
          nome?: string
          padrao_origem?: string | null
          peso_total?: number
          publico?: boolean
          status?: string
          tenant_id?: string
          tipo_framework?: string
          updated_at?: string | null
          updated_by?: string | null
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_frameworks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_frameworks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_history: {
        Row: {
          acao: string
          assessment_id: string
          campo_alterado: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          data_acao: string | null
          descricao: string | null
          id: string
          ip_address: unknown | null
          metadados: Json | null
          tenant_id: string
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          assessment_id: string
          campo_alterado?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_acao?: string | null
          descricao?: string | null
          id?: string
          ip_address?: unknown | null
          metadados?: Json | null
          tenant_id: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          assessment_id?: string
          campo_alterado?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          data_acao?: string | null
          descricao?: string | null
          id?: string
          ip_address?: unknown | null
          metadados?: Json | null
          tenant_id?: string
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_history_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "assessment_history_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          ativa: boolean | null
          codigo: string | null
          condicoes_exibicao: Json | null
          control_id: string
          created_at: string | null
          created_by: string | null
          dependencias: string[] | null
          descricao: string | null
          exemplos: string[] | null
          id: string
          mapeamento_pontuacao: Json | null
          obrigatoria: boolean | null
          opcoes_resposta: Json | null
          ordem: number
          peso: number
          referencias: string[] | null
          regex_validacao: string | null
          tenant_id: string
          texto: string
          texto_ajuda: string | null
          tipo_pergunta: string
          updated_at: string | null
          updated_by: string | null
          valor_maximo: number | null
          valor_minimo: number | null
        }
        Insert: {
          ativa?: boolean | null
          codigo?: string | null
          condicoes_exibicao?: Json | null
          control_id: string
          created_at?: string | null
          created_by?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          exemplos?: string[] | null
          id?: string
          mapeamento_pontuacao?: Json | null
          obrigatoria?: boolean | null
          opcoes_resposta?: Json | null
          ordem?: number
          peso?: number
          referencias?: string[] | null
          regex_validacao?: string | null
          tenant_id: string
          texto: string
          texto_ajuda?: string | null
          tipo_pergunta?: string
          updated_at?: string | null
          updated_by?: string | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Update: {
          ativa?: boolean | null
          codigo?: string | null
          condicoes_exibicao?: Json | null
          control_id?: string
          created_at?: string | null
          created_by?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          exemplos?: string[] | null
          id?: string
          mapeamento_pontuacao?: Json | null
          obrigatoria?: boolean | null
          opcoes_resposta?: Json | null
          ordem?: number
          peso?: number
          referencias?: string[] | null
          regex_validacao?: string | null
          tenant_id?: string
          texto?: string
          texto_ajuda?: string | null
          tipo_pergunta?: string
          updated_at?: string | null
          updated_by?: string | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "assessment_controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "assessment_questions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          aprovado: boolean
          assessment_id: string
          comentarios: string | null
          comentarios_revisao: string | null
          confiabilidade_resposta: number | null
          control_id: string | null
          created_at: string | null
          criticidade_gap: string | null
          data_resposta: string | null
          data_revisao: string | null
          evidencias: string[] | null
          fonte_informacao: string | null
          gap_identificado: boolean
          id: string
          justificativa: string | null
          necessita_revisao: boolean
          nivel_maturidade: number | null
          observacoes_avaliador: string | null
          percentual_conformidade: number | null
          pontuacao_maxima: number | null
          pontuacao_obtida: number | null
          question_id: string | null
          respondido_por: string | null
          resposta_arquivo_urls: string[] | null
          resposta_booleana: boolean | null
          resposta_data: string | null
          resposta_multipla_escolha: string[] | null
          resposta_numerica: number | null
          resposta_texto: string | null
          revisado: boolean
          revisado_por: string | null
          status_conformidade: string | null
          tempo_resposta_minutos: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          aprovado?: boolean
          assessment_id: string
          comentarios?: string | null
          comentarios_revisao?: string | null
          confiabilidade_resposta?: number | null
          control_id?: string | null
          created_at?: string | null
          criticidade_gap?: string | null
          data_resposta?: string | null
          data_revisao?: string | null
          evidencias?: string[] | null
          fonte_informacao?: string | null
          gap_identificado?: boolean
          id?: string
          justificativa?: string | null
          necessita_revisao?: boolean
          nivel_maturidade?: number | null
          observacoes_avaliador?: string | null
          percentual_conformidade?: number | null
          pontuacao_maxima?: number | null
          pontuacao_obtida?: number | null
          question_id?: string | null
          respondido_por?: string | null
          resposta_arquivo_urls?: string[] | null
          resposta_booleana?: boolean | null
          resposta_data?: string | null
          resposta_multipla_escolha?: string[] | null
          resposta_numerica?: number | null
          resposta_texto?: string | null
          revisado?: boolean
          revisado_por?: string | null
          status_conformidade?: string | null
          tempo_resposta_minutos?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          aprovado?: boolean
          assessment_id?: string
          comentarios?: string | null
          comentarios_revisao?: string | null
          confiabilidade_resposta?: number | null
          control_id?: string | null
          created_at?: string | null
          criticidade_gap?: string | null
          data_resposta?: string | null
          data_revisao?: string | null
          evidencias?: string[] | null
          fonte_informacao?: string | null
          gap_identificado?: boolean
          id?: string
          justificativa?: string | null
          necessita_revisao?: boolean
          nivel_maturidade?: number | null
          observacoes_avaliador?: string | null
          percentual_conformidade?: number | null
          pontuacao_maxima?: number | null
          pontuacao_obtida?: number | null
          question_id?: string | null
          respondido_por?: string | null
          resposta_arquivo_urls?: string[] | null
          resposta_booleana?: boolean | null
          resposta_data?: string | null
          resposta_multipla_escolha?: string[] | null
          resposta_numerica?: number | null
          resposta_texto?: string | null
          revisado?: boolean
          revisado_por?: string | null
          status_conformidade?: string | null
          tempo_resposta_minutos?: number | null
          tenant_id?: string
          updated_at?: string | null
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
            foreignKeyName: "assessment_responses_respondido_por_fkey"
            columns: ["respondido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          area_avaliada: string | null
          avaliadores: string[] | null
          codigo: string
          compliance_framework_id: string | null
          configuracoes_especiais: Json | null
          controles_avaliados: number
          controles_conformes: number
          controles_nao_conformes: number
          controles_parcialmente_conformes: number
          coordenador_assessment: string | null
          created_at: string | null
          created_by: string | null
          data_fim_planejada: string | null
          data_fim_real: string | null
          data_inicio: string | null
          descricao: string | null
          dominios_avaliados: number
          duracao_planejada_dias: number | null
          escopo: string | null
          fase_atual: string
          framework_id: string
          gaps_identificados: number
          id: string
          nivel_maturidade_geral: number | null
          nivel_maturidade_nome: string | null
          objetivos: string[] | null
          participantes: string[] | null
          percentual_conclusao: number
          percentual_maturidade: number | null
          pontuacao_maxima_possivel: number | null
          pontuacao_total: number | null
          projeto_auditoria_id: string | null
          responsavel_assessment: string | null
          risco_associado_id: string | null
          status: string
          tags: string[] | null
          tenant_id: string
          titulo: string
          unidade_organizacional: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          area_avaliada?: string | null
          avaliadores?: string[] | null
          codigo: string
          compliance_framework_id?: string | null
          configuracoes_especiais?: Json | null
          controles_avaliados?: number
          controles_conformes?: number
          controles_nao_conformes?: number
          controles_parcialmente_conformes?: number
          coordenador_assessment?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dominios_avaliados?: number
          duracao_planejada_dias?: number | null
          escopo?: string | null
          fase_atual?: string
          framework_id: string
          gaps_identificados?: number
          id?: string
          nivel_maturidade_geral?: number | null
          nivel_maturidade_nome?: string | null
          objetivos?: string[] | null
          participantes?: string[] | null
          percentual_conclusao?: number
          percentual_maturidade?: number | null
          pontuacao_maxima_possivel?: number | null
          pontuacao_total?: number | null
          projeto_auditoria_id?: string | null
          responsavel_assessment?: string | null
          risco_associado_id?: string | null
          status?: string
          tags?: string[] | null
          tenant_id: string
          titulo: string
          unidade_organizacional?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          area_avaliada?: string | null
          avaliadores?: string[] | null
          codigo?: string
          compliance_framework_id?: string | null
          configuracoes_especiais?: Json | null
          controles_avaliados?: number
          controles_conformes?: number
          controles_nao_conformes?: number
          controles_parcialmente_conformes?: number
          coordenador_assessment?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          dominios_avaliados?: number
          duracao_planejada_dias?: number | null
          escopo?: string | null
          fase_atual?: string
          framework_id?: string
          gaps_identificados?: number
          id?: string
          nivel_maturidade_geral?: number | null
          nivel_maturidade_nome?: string | null
          objetivos?: string[] | null
          participantes?: string[] | null
          percentual_conclusao?: number
          percentual_maturidade?: number | null
          pontuacao_maxima_possivel?: number | null
          pontuacao_total?: number | null
          projeto_auditoria_id?: string | null
          responsavel_assessment?: string | null
          risco_associado_id?: string | null
          status?: string
          tags?: string[] | null
          tenant_id?: string
          titulo?: string
          unidade_organizacional?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_coordenador_assessment_fkey"
            columns: ["coordenador_assessment"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "assessment_frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_responsavel_assessment_fkey"
            columns: ["responsavel_assessment"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          tenant_id: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          tenant_id: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          tenant_id?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_audit_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      audit_object_links: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          properties: Json | null
          relationship_type: string
          source_id: string
          source_table: string
          strength: number | null
          target_id: string
          target_table: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          properties?: Json | null
          relationship_type: string
          source_id: string
          source_table: string
          strength?: number | null
          target_id: string
          target_table: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          properties?: Json | null
          relationship_type?: string
          source_id?: string
          source_table?: string
          strength?: number | null
          target_id?: string
          target_table?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_object_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_object_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_object_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          changed_fields: string[] | null
          hash_current: string | null
          hash_previous: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          reason: string | null
          record_id: string
          session_id: string | null
          table_name: string
          tenant_id: string
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          changed_fields?: string[] | null
          hash_current?: string | null
          hash_previous?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          reason?: string | null
          record_id: string
          session_id?: string | null
          table_name: string
          tenant_id: string
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          changed_fields?: string[] | null
          hash_current?: string | null
          hash_previous?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          reason?: string | null
          record_id?: string
          session_id?: string | null
          table_name?: string
          tenant_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_conformidade: {
        Row: {
          amostra_testada: number | null
          arquivos_evidencia: Json | null
          avaliador_responsavel: string
          codigo: string
          created_at: string | null
          created_by: string | null
          criterios_amostragem: string | null
          data_conclusao: string | null
          data_inicio: string | null
          data_planejada: string
          descricao: string | null
          equipe_avaliacao: string[] | null
          evidencias_coletadas: string[] | null
          id: string
          limitacoes_avaliacao: string | null
          metadados: Json | null
          metodologia: string | null
          observacoes: string | null
          pontos_conformes: number | null
          pontos_nao_conformes: number | null
          populacao_total: number | null
          recomendacoes: string | null
          relatorio_avaliacao: string | null
          requisito_id: string
          resultado_conformidade: string | null
          score_conformidade: number | null
          status: string | null
          tenant_id: string
          tipo_avaliacao: string | null
          titulo: string
          total_pontos_avaliados: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amostra_testada?: number | null
          arquivos_evidencia?: Json | null
          avaliador_responsavel: string
          codigo: string
          created_at?: string | null
          created_by?: string | null
          criterios_amostragem?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_planejada: string
          descricao?: string | null
          equipe_avaliacao?: string[] | null
          evidencias_coletadas?: string[] | null
          id?: string
          limitacoes_avaliacao?: string | null
          metadados?: Json | null
          metodologia?: string | null
          observacoes?: string | null
          pontos_conformes?: number | null
          pontos_nao_conformes?: number | null
          populacao_total?: number | null
          recomendacoes?: string | null
          relatorio_avaliacao?: string | null
          requisito_id: string
          resultado_conformidade?: string | null
          score_conformidade?: number | null
          status?: string | null
          tenant_id: string
          tipo_avaliacao?: string | null
          titulo: string
          total_pontos_avaliados?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amostra_testada?: number | null
          arquivos_evidencia?: Json | null
          avaliador_responsavel?: string
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          criterios_amostragem?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_planejada?: string
          descricao?: string | null
          equipe_avaliacao?: string[] | null
          evidencias_coletadas?: string[] | null
          id?: string
          limitacoes_avaliacao?: string | null
          metadados?: Json | null
          metodologia?: string | null
          observacoes?: string | null
          pontos_conformes?: number | null
          pontos_nao_conformes?: number | null
          populacao_total?: number | null
          recomendacoes?: string | null
          relatorio_avaliacao?: string | null
          requisito_id?: string
          resultado_conformidade?: string | null
          score_conformidade?: number | null
          status?: string | null
          tenant_id?: string
          tipo_avaliacao?: string | null
          titulo?: string
          total_pontos_avaliados?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_conformidade_avaliador_responsavel_fkey"
            columns: ["avaliador_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conformidade_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conformidade_requisito_id_fkey"
            columns: ["requisito_id"]
            isOneToOne: false
            referencedRelation: "requisitos_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "avaliacoes_conformidade_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          {
            foreignKeyName: "backup_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      biblioteca_controles_sox: {
        Row: {
          atividades_controle: string
          categoria: string
          codigo: string
          created_at: string | null
          created_by: string | null
          criticidade: string
          descricao: string
          evidencias_funcionamento: string[] | null
          frequencia: string
          id: string
          is_global: boolean | null
          metodo_teste: string | null
          natureza: string
          nivel: string
          objetivo_controle: string
          risco_processo: string | null
          sistemas_aplicaveis: string[] | null
          subcategoria: string | null
          tenant_id: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          atividades_controle: string
          categoria: string
          codigo: string
          created_at?: string | null
          created_by?: string | null
          criticidade?: string
          descricao: string
          evidencias_funcionamento?: string[] | null
          frequencia: string
          id?: string
          is_global?: boolean | null
          metodo_teste?: string | null
          natureza: string
          nivel: string
          objetivo_controle: string
          risco_processo?: string | null
          sistemas_aplicaveis?: string[] | null
          subcategoria?: string | null
          tenant_id?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          atividades_controle?: string
          categoria?: string
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          criticidade?: string
          descricao?: string
          evidencias_funcionamento?: string[] | null
          frequencia?: string
          id?: string
          is_global?: boolean | null
          metodo_teste?: string | null
          natureza?: string
          nivel?: string
          objetivo_controle?: string
          risco_processo?: string | null
          sistemas_aplicaveis?: string[] | null
          subcategoria?: string | null
          tenant_id?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_controles_sox_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_controles_sox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biblioteca_controles_sox_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "company_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
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
          {
            foreignKeyName: "consents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      controles_auditoria: {
        Row: {
          avaliado_por: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          data_ultima_avaliacao: string | null
          descricao: string
          design_adequado: boolean | null
          documentacao_controle: string | null
          evidencias_esperadas: string[] | null
          frequencia: string | null
          id: string
          metadados: Json | null
          natureza: string | null
          opera_efetivamente: boolean | null
          responsavel_design: string | null
          responsavel_operacao: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          avaliado_por?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_ultima_avaliacao?: string | null
          descricao: string
          design_adequado?: boolean | null
          documentacao_controle?: string | null
          evidencias_esperadas?: string[] | null
          frequencia?: string | null
          id?: string
          metadados?: Json | null
          natureza?: string | null
          opera_efetivamente?: boolean | null
          responsavel_design?: string | null
          responsavel_operacao?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          avaliado_por?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_ultima_avaliacao?: string | null
          descricao?: string
          design_adequado?: boolean | null
          documentacao_controle?: string | null
          evidencias_esperadas?: string[] | null
          frequencia?: string | null
          id?: string
          metadados?: Json | null
          natureza?: string | null
          opera_efetivamente?: boolean | null
          responsavel_design?: string | null
          responsavel_operacao?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "controles_auditoria_avaliado_por_fkey"
            columns: ["avaliado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_auditoria_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_auditoria_responsavel_design_fkey"
            columns: ["responsavel_design"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_auditoria_responsavel_operacao_fkey"
            columns: ["responsavel_operacao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "controles_auditoria_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      controles_conformidade: {
        Row: {
          atividades_controle: string
          codigo: string
          created_at: string | null
          created_by: string | null
          data_identificacao_deficiencia: string | null
          deficiencias_identificadas: string | null
          descricao: string
          documentacao_suporte: string[] | null
          evidencias_funcionamento: string[] | null
          executor_controle: string | null
          frequencia: string | null
          gravidade_deficiencia: string | null
          id: string
          metadados: Json | null
          metodo_teste: string | null
          momento_execucao: string | null
          natureza: string | null
          nivel: string | null
          nivel_maturidade: number | null
          objetivo_controle: string
          proprietario_controle: string
          proximo_teste_planejado: string | null
          requisito_id: string
          resultado_ultimo_teste: string | null
          revisor_controle: string | null
          score_efetividade: number | null
          sistemas_utilizados: string[] | null
          status: string | null
          tenant_id: string
          tipo: string | null
          titulo: string
          ultima_data_teste: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          atividades_controle: string
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_identificacao_deficiencia?: string | null
          deficiencias_identificadas?: string | null
          descricao: string
          documentacao_suporte?: string[] | null
          evidencias_funcionamento?: string[] | null
          executor_controle?: string | null
          frequencia?: string | null
          gravidade_deficiencia?: string | null
          id?: string
          metadados?: Json | null
          metodo_teste?: string | null
          momento_execucao?: string | null
          natureza?: string | null
          nivel?: string | null
          nivel_maturidade?: number | null
          objetivo_controle: string
          proprietario_controle: string
          proximo_teste_planejado?: string | null
          requisito_id: string
          resultado_ultimo_teste?: string | null
          revisor_controle?: string | null
          score_efetividade?: number | null
          sistemas_utilizados?: string[] | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          titulo: string
          ultima_data_teste?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          atividades_controle?: string
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_identificacao_deficiencia?: string | null
          deficiencias_identificadas?: string | null
          descricao?: string
          documentacao_suporte?: string[] | null
          evidencias_funcionamento?: string[] | null
          executor_controle?: string | null
          frequencia?: string | null
          gravidade_deficiencia?: string | null
          id?: string
          metadados?: Json | null
          metodo_teste?: string | null
          momento_execucao?: string | null
          natureza?: string | null
          nivel?: string | null
          nivel_maturidade?: number | null
          objetivo_controle?: string
          proprietario_controle?: string
          proximo_teste_planejado?: string | null
          requisito_id?: string
          resultado_ultimo_teste?: string | null
          revisor_controle?: string | null
          score_efetividade?: number | null
          sistemas_utilizados?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          titulo?: string
          ultima_data_teste?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "controles_conformidade_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_conformidade_executor_controle_fkey"
            columns: ["executor_controle"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_conformidade_proprietario_controle_fkey"
            columns: ["proprietario_controle"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_conformidade_requisito_id_fkey"
            columns: ["requisito_id"]
            isOneToOne: false
            referencedRelation: "requisitos_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_conformidade_revisor_controle_fkey"
            columns: ["revisor_controle"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controles_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "controles_conformidade_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cronograma_atividades: {
        Row: {
          atividade_pai_id: string | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          critica: boolean | null
          data_fim_planejada: string
          data_fim_real: string | null
          data_inicio_planejada: string
          data_inicio_real: string | null
          dependencias: string[] | null
          descricao: string | null
          duracao_planejada: number | null
          duracao_real: number | null
          horas_planejadas: number | null
          horas_realizadas: number | null
          id: string
          iniciativa_id: string
          metadados: Json | null
          nivel: number | null
          ordem_exibicao: number | null
          percentual_conclusao: number | null
          recursos_ids: string[] | null
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          tipo_dependencia: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          atividade_pai_id?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          critica?: boolean | null
          data_fim_planejada: string
          data_fim_real?: string | null
          data_inicio_planejada: string
          data_inicio_real?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          duracao_planejada?: number | null
          duracao_real?: number | null
          horas_planejadas?: number | null
          horas_realizadas?: number | null
          id?: string
          iniciativa_id: string
          metadados?: Json | null
          nivel?: number | null
          ordem_exibicao?: number | null
          percentual_conclusao?: number | null
          recursos_ids?: string[] | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          tipo_dependencia?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          atividade_pai_id?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          critica?: boolean | null
          data_fim_planejada?: string
          data_fim_real?: string | null
          data_inicio_planejada?: string
          data_inicio_real?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          duracao_planejada?: number | null
          duracao_real?: number | null
          horas_planejadas?: number | null
          horas_realizadas?: number | null
          id?: string
          iniciativa_id?: string
          metadados?: Json | null
          nivel?: number | null
          ordem_exibicao?: number | null
          percentual_conclusao?: number | null
          recursos_ids?: string[] | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          tipo_dependencia?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_atividades_atividade_pai_id_fkey"
            columns: ["atividade_pai_id"]
            isOneToOne: false
            referencedRelation: "cronograma_atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_iniciativa_id_fkey"
            columns: ["iniciativa_id"]
            isOneToOne: false
            referencedRelation: "iniciativas_estrategicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_atividades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "cronograma_atividades_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cronograma_auditoria: {
        Row: {
          atividade: string
          created_at: string | null
          criticidade: string | null
          data_fim: string
          data_inicio: string
          dependencias: string[] | null
          descricao: string | null
          e_marco: boolean | null
          fase: string
          horas_alocadas: number | null
          id: string
          observacoes: string | null
          percentual_conclusao: number | null
          recursos_necessarios: string[] | null
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          trabalho_id: string
          updated_at: string | null
        }
        Insert: {
          atividade: string
          created_at?: string | null
          criticidade?: string | null
          data_fim: string
          data_inicio: string
          dependencias?: string[] | null
          descricao?: string | null
          e_marco?: boolean | null
          fase: string
          horas_alocadas?: number | null
          id?: string
          observacoes?: string | null
          percentual_conclusao?: number | null
          recursos_necessarios?: string[] | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          trabalho_id: string
          updated_at?: string | null
        }
        Update: {
          atividade?: string
          created_at?: string | null
          criticidade?: string | null
          data_fim?: string
          data_inicio?: string
          dependencias?: string[] | null
          descricao?: string | null
          e_marco?: boolean | null
          fase?: string
          horas_alocadas?: number | null
          id?: string
          observacoes?: string | null
          percentual_conclusao?: number | null
          recursos_necessarios?: string[] | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          trabalho_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_auditoria_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronograma_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "cronograma_auditoria_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos_auditoria"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_field_mapping: {
        Row: {
          created_at: string | null
          data_classification: string | null
          description: string | null
          encryption_purpose: string
          field_name: string
          id: string
          is_active: boolean | null
          module_name: string
          retention_days: number | null
          table_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_classification?: string | null
          description?: string | null
          encryption_purpose: string
          field_name: string
          id?: string
          is_active?: boolean | null
          module_name: string
          retention_days?: number | null
          table_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_classification?: string | null
          description?: string | null
          encryption_purpose?: string
          field_name?: string
          id?: string
          is_active?: boolean | null
          module_name?: string
          retention_days?: number | null
          table_name?: string
          updated_at?: string | null
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
          {
            foreignKeyName: "custom_fonts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "custom_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      dashboards_planejamento: {
        Row: {
          ativo: boolean | null
          auto_refresh: boolean | null
          configuracao: Json
          created_at: string | null
          created_by: string | null
          descricao: string | null
          filtros_padrao: Json | null
          id: string
          layout: Json | null
          nome: string
          proprietario_id: string
          refresh_interval: number | null
          roles_acesso: string[] | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          updated_by: string | null
          usuarios_acesso: string[] | null
          visibilidade: string | null
        }
        Insert: {
          ativo?: boolean | null
          auto_refresh?: boolean | null
          configuracao?: Json
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          filtros_padrao?: Json | null
          id?: string
          layout?: Json | null
          nome: string
          proprietario_id: string
          refresh_interval?: number | null
          roles_acesso?: string[] | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usuarios_acesso?: string[] | null
          visibilidade?: string | null
        }
        Update: {
          ativo?: boolean | null
          auto_refresh?: boolean | null
          configuracao?: Json
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          filtros_padrao?: Json | null
          id?: string
          layout?: Json | null
          nome?: string
          proprietario_id?: string
          refresh_interval?: number | null
          roles_acesso?: string[] | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          usuarios_acesso?: string[] | null
          visibilidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_planejamento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_planejamento_proprietario_id_fkey"
            columns: ["proprietario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "dashboards_planejamento_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "data_inventory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "data_subject_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "email_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      encryption_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ethics_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          performed_by: string | null
          performed_by_name: string | null
          report_id: string
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          report_id: string
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          report_id?: string
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ethics_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_activities_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "ethics_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ethics_attachments: {
        Row: {
          communication_id: string | null
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_confidential: boolean | null
          is_evidence: boolean | null
          metadata: Json | null
          report_id: string
          tenant_id: string
          uploaded_by: string | null
          uploaded_by_name: string | null
        }
        Insert: {
          communication_id?: string | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_confidential?: boolean | null
          is_evidence?: boolean | null
          metadata?: Json | null
          report_id: string
          tenant_id: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Update: {
          communication_id?: string | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_confidential?: boolean | null
          is_evidence?: boolean | null
          metadata?: Json | null
          report_id?: string
          tenant_id?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ethics_attachments_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "ethics_communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_attachments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "ethics_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "ethics_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ethics_categories: {
        Row: {
          auto_assign_to: string | null
          code: string
          color: string | null
          created_at: string | null
          created_by: string | null
          default_priority: string | null
          default_severity: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_template: string | null
          requires_investigation: boolean | null
          sla_days: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          auto_assign_to?: string | null
          code: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_priority?: string | null
          default_severity?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_template?: string | null
          requires_investigation?: boolean | null
          sla_days?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          auto_assign_to?: string | null
          code?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_priority?: string | null
          default_severity?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_template?: string | null
          requires_investigation?: boolean | null
          sla_days?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ethics_categories_auto_assign_to_fkey"
            columns: ["auto_assign_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ethics_communications: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          is_read: boolean | null
          message: string
          message_type: string
          metadata: Json | null
          read_at: string | null
          report_id: string
          sender_id: string | null
          sender_type: string
          subject: string | null
          tenant_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_read?: boolean | null
          message: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          report_id: string
          sender_id?: string | null
          sender_type: string
          subject?: string | null
          tenant_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          is_read?: boolean | null
          message?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          report_id?: string
          sender_id?: string | null
          sender_type?: string
          subject?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethics_communications_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "ethics_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_communications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_communications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ethics_notification_templates: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          subject: string | null
          template_type: string
          tenant_id: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          subject?: string | null
          template_type: string
          tenant_id: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          subject?: string | null
          template_type?: string
          tenant_id?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ethics_notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_notification_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_notification_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ethics_reports: {
        Row: {
          assigned_to: string | null
          category: string
          closure_reason: string | null
          created_at: string
          created_by_user_id: string | null
          description: string
          due_date: string | null
          evidence_files: Json | null
          id: string
          investigation_summary: string | null
          is_anonymous: boolean
          last_activity_at: string | null
          priority: string | null
          protocol_number: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          reporter_type: string | null
          resolution: string | null
          resolved_at: string | null
          satisfied_resolution: boolean | null
          severity: string
          sla_breach: boolean | null
          source: string | null
          status: string
          tags: string[] | null
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          closure_reason?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description: string
          due_date?: string | null
          evidence_files?: Json | null
          id?: string
          investigation_summary?: string | null
          is_anonymous?: boolean
          last_activity_at?: string | null
          priority?: string | null
          protocol_number?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          reporter_type?: string | null
          resolution?: string | null
          resolved_at?: string | null
          satisfied_resolution?: boolean | null
          severity?: string
          sla_breach?: boolean | null
          source?: string | null
          status?: string
          tags?: string[] | null
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          closure_reason?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string
          due_date?: string | null
          evidence_files?: Json | null
          id?: string
          investigation_summary?: string | null
          is_anonymous?: boolean
          last_activity_at?: string | null
          priority?: string | null
          protocol_number?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          reporter_type?: string | null
          resolution?: string | null
          resolved_at?: string | null
          satisfied_resolution?: boolean | null
          severity?: string
          sla_breach?: boolean | null
          source?: string | null
          status?: string
          tags?: string[] | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethics_reports_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ethics_settings: {
        Row: {
          anonymous_submissions_enabled: boolean | null
          auto_acknowledge: boolean | null
          closure_approval_required: boolean | null
          closure_message: string | null
          created_at: string | null
          created_by: string | null
          default_investigator_id: string | null
          default_sla_days: number | null
          disclaimer_text: string | null
          email_notifications_enabled: boolean | null
          escalation_days: number | null
          escalation_emails: string[] | null
          ethics_committee_emails: string[] | null
          id: string
          metadata: Json | null
          module_enabled: boolean | null
          notify_on_new_report: boolean | null
          notify_on_sla_breach: boolean | null
          notify_on_status_change: boolean | null
          protocol_format: string | null
          protocol_prefix: string | null
          public_submissions_enabled: boolean | null
          require_evidence: boolean | null
          sms_notifications_enabled: boolean | null
          tenant_id: string
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          anonymous_submissions_enabled?: boolean | null
          auto_acknowledge?: boolean | null
          closure_approval_required?: boolean | null
          closure_message?: string | null
          created_at?: string | null
          created_by?: string | null
          default_investigator_id?: string | null
          default_sla_days?: number | null
          disclaimer_text?: string | null
          email_notifications_enabled?: boolean | null
          escalation_days?: number | null
          escalation_emails?: string[] | null
          ethics_committee_emails?: string[] | null
          id?: string
          metadata?: Json | null
          module_enabled?: boolean | null
          notify_on_new_report?: boolean | null
          notify_on_sla_breach?: boolean | null
          notify_on_status_change?: boolean | null
          protocol_format?: string | null
          protocol_prefix?: string | null
          public_submissions_enabled?: boolean | null
          require_evidence?: boolean | null
          sms_notifications_enabled?: boolean | null
          tenant_id: string
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          anonymous_submissions_enabled?: boolean | null
          auto_acknowledge?: boolean | null
          closure_approval_required?: boolean | null
          closure_message?: string | null
          created_at?: string | null
          created_by?: string | null
          default_investigator_id?: string | null
          default_sla_days?: number | null
          disclaimer_text?: string | null
          email_notifications_enabled?: boolean | null
          escalation_days?: number | null
          escalation_emails?: string[] | null
          ethics_committee_emails?: string[] | null
          id?: string
          metadata?: Json | null
          module_enabled?: boolean | null
          notify_on_new_report?: boolean | null
          notify_on_sla_breach?: boolean | null
          notify_on_status_change?: boolean | null
          protocol_format?: string | null
          protocol_prefix?: string | null
          public_submissions_enabled?: boolean | null
          require_evidence?: boolean | null
          sms_notifications_enabled?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ethics_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_settings_default_investigator_id_fkey"
            columns: ["default_investigator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethics_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      execucoes_teste: {
        Row: {
          arquivos_evidencia: Json | null
          auditor_responsavel: string
          conclusao: string | null
          created_at: string | null
          created_by: string | null
          criterio_selecao_usado: string | null
          data_execucao: string | null
          data_planejada: string | null
          evidencias_obtidas: string[] | null
          horas_realizadas: number | null
          id: string
          itens_com_excecao: number | null
          itens_selecionados: Json | null
          limitacoes: string | null
          metadados: Json | null
          observacoes: string | null
          populacao_total: number | null
          procedimento_executado: string | null
          projeto_id: string
          resultado: string | null
          status: string | null
          tamanho_amostra_real: number | null
          taxa_erro: number | null
          tenant_id: string
          teste_id: string
          total_itens_testados: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          arquivos_evidencia?: Json | null
          auditor_responsavel: string
          conclusao?: string | null
          created_at?: string | null
          created_by?: string | null
          criterio_selecao_usado?: string | null
          data_execucao?: string | null
          data_planejada?: string | null
          evidencias_obtidas?: string[] | null
          horas_realizadas?: number | null
          id?: string
          itens_com_excecao?: number | null
          itens_selecionados?: Json | null
          limitacoes?: string | null
          metadados?: Json | null
          observacoes?: string | null
          populacao_total?: number | null
          procedimento_executado?: string | null
          projeto_id: string
          resultado?: string | null
          status?: string | null
          tamanho_amostra_real?: number | null
          taxa_erro?: number | null
          tenant_id: string
          teste_id: string
          total_itens_testados?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          arquivos_evidencia?: Json | null
          auditor_responsavel?: string
          conclusao?: string | null
          created_at?: string | null
          created_by?: string | null
          criterio_selecao_usado?: string | null
          data_execucao?: string | null
          data_planejada?: string | null
          evidencias_obtidas?: string[] | null
          horas_realizadas?: number | null
          id?: string
          itens_com_excecao?: number | null
          itens_selecionados?: Json | null
          limitacoes?: string | null
          metadados?: Json | null
          observacoes?: string | null
          populacao_total?: number | null
          procedimento_executado?: string | null
          projeto_id?: string
          resultado?: string | null
          status?: string | null
          tamanho_amostra_real?: number | null
          taxa_erro?: number | null
          tenant_id?: string
          teste_id?: string
          total_itens_testados?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_teste_auditor_responsavel_fkey"
            columns: ["auditor_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_teste_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_teste_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos_auditoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_teste_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_teste_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "execucoes_teste_teste_id_fkey"
            columns: ["teste_id"]
            isOneToOne: false
            referencedRelation: "testes_auditoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_teste_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fila_notificacoes_compliance: {
        Row: {
          assunto: string
          canal: string
          confirmacao_leitura: string | null
          corpo: string
          created_at: string | null
          dados_contexto: Json | null
          data_agendamento: string
          data_envio: string | null
          data_processamento: string | null
          destinatario_id: string
          id: string
          max_tentativas: number | null
          metadados: Json | null
          objeto_id: string
          objeto_tipo: string
          prioridade: string | null
          regra_id: string
          resultado_envio: string | null
          status: string | null
          tenant_id: string
          tentativas_envio: number | null
        }
        Insert: {
          assunto: string
          canal: string
          confirmacao_leitura?: string | null
          corpo: string
          created_at?: string | null
          dados_contexto?: Json | null
          data_agendamento: string
          data_envio?: string | null
          data_processamento?: string | null
          destinatario_id: string
          id?: string
          max_tentativas?: number | null
          metadados?: Json | null
          objeto_id: string
          objeto_tipo: string
          prioridade?: string | null
          regra_id: string
          resultado_envio?: string | null
          status?: string | null
          tenant_id: string
          tentativas_envio?: number | null
        }
        Update: {
          assunto?: string
          canal?: string
          confirmacao_leitura?: string | null
          corpo?: string
          created_at?: string | null
          dados_contexto?: Json | null
          data_agendamento?: string
          data_envio?: string | null
          data_processamento?: string | null
          destinatario_id?: string
          id?: string
          max_tentativas?: number | null
          metadados?: Json | null
          objeto_id?: string
          objeto_tipo?: string
          prioridade?: string | null
          regra_id?: string
          resultado_envio?: string | null
          status?: string | null
          tenant_id?: string
          tentativas_envio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fila_notificacoes_compliance_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_notificacoes_compliance_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_notificacao_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_notificacoes_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fila_notificacoes_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
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
          {
            foreignKeyName: "font_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      frameworks_compliance: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          data_atualizacao: string | null
          data_vigencia: string | null
          descricao: string | null
          documentos_relacionados: string[] | null
          escopo_aplicacao: string[] | null
          id: string
          jurisdicao: string | null
          metadados: Json | null
          nivel_aplicabilidade: string | null
          nome: string
          origem: string | null
          status: string | null
          subcategoria: string | null
          tags: string[] | null
          tenant_id: string
          tipo: string | null
          updated_at: string | null
          updated_by: string | null
          url_referencia: string | null
          versao: string | null
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_atualizacao?: string | null
          data_vigencia?: string | null
          descricao?: string | null
          documentos_relacionados?: string[] | null
          escopo_aplicacao?: string[] | null
          id?: string
          jurisdicao?: string | null
          metadados?: Json | null
          nivel_aplicabilidade?: string | null
          nome: string
          origem?: string | null
          status?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tenant_id: string
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          url_referencia?: string | null
          versao?: string | null
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_atualizacao?: string | null
          data_vigencia?: string | null
          descricao?: string | null
          documentos_relacionados?: string[] | null
          escopo_aplicacao?: string[] | null
          id?: string
          jurisdicao?: string | null
          metadados?: Json | null
          nivel_aplicabilidade?: string | null
          nome?: string
          origem?: string | null
          status?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tenant_id?: string
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          url_referencia?: string | null
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frameworks_compliance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frameworks_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frameworks_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "frameworks_compliance_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "global_ui_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          button_primary_color: string | null
          button_primary_color_dark: string | null
          button_secondary_color: string | null
          button_secondary_color_dark: string | null
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
          sidebar_background_color: string | null
          sidebar_background_color_dark: string | null
          sidebar_border: string
          sidebar_foreground: string
          sidebar_primary: string
          sidebar_primary_foreground: string
          sidebar_ring: string
          sidebar_text_color: string | null
          sidebar_text_color_dark: string | null
          success_color: string
          success_foreground: string
          success_light: string | null
          tenant_id: string | null
          tertiary_color: string | null
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
          button_primary_color?: string | null
          button_primary_color_dark?: string | null
          button_secondary_color?: string | null
          button_secondary_color_dark?: string | null
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
          sidebar_background_color?: string | null
          sidebar_background_color_dark?: string | null
          sidebar_border: string
          sidebar_foreground: string
          sidebar_primary: string
          sidebar_primary_foreground: string
          sidebar_ring: string
          sidebar_text_color?: string | null
          sidebar_text_color_dark?: string | null
          success_color: string
          success_foreground: string
          success_light?: string | null
          tenant_id?: string | null
          tertiary_color?: string | null
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
          button_primary_color?: string | null
          button_primary_color_dark?: string | null
          button_secondary_color?: string | null
          button_secondary_color_dark?: string | null
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
          sidebar_background_color?: string | null
          sidebar_background_color_dark?: string | null
          sidebar_border?: string
          sidebar_foreground?: string
          sidebar_primary?: string
          sidebar_primary_foreground?: string
          sidebar_ring?: string
          sidebar_text_color?: string | null
          sidebar_text_color_dark?: string | null
          success_color?: string
          success_foreground?: string
          success_light?: string | null
          tenant_id?: string | null
          tertiary_color?: string | null
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
          {
            foreignKeyName: "global_ui_themes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      historico_notificacoes_compliance: {
        Row: {
          assunto: string
          canal: string
          confirmacao_leitura: string | null
          corpo: string
          created_at: string | null
          data_envio: string
          destinatario_email: string | null
          destinatario_id: string
          destinatario_nome: string
          fila_notificacao_id: string | null
          id: string
          objeto_descricao: string | null
          objeto_id: string
          objeto_tipo: string
          regra_id: string
          status_final: string
          tenant_id: string
        }
        Insert: {
          assunto: string
          canal: string
          confirmacao_leitura?: string | null
          corpo: string
          created_at?: string | null
          data_envio: string
          destinatario_email?: string | null
          destinatario_id: string
          destinatario_nome: string
          fila_notificacao_id?: string | null
          id?: string
          objeto_descricao?: string | null
          objeto_id: string
          objeto_tipo: string
          regra_id: string
          status_final: string
          tenant_id: string
        }
        Update: {
          assunto?: string
          canal?: string
          confirmacao_leitura?: string | null
          corpo?: string
          created_at?: string | null
          data_envio?: string
          destinatario_email?: string | null
          destinatario_id?: string
          destinatario_nome?: string
          fila_notificacao_id?: string | null
          id?: string
          objeto_descricao?: string | null
          objeto_id?: string
          objeto_tipo?: string
          regra_id?: string
          status_final?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_notificacoes_compliance_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_notificacoes_compliance_fila_notificacao_id_fkey"
            columns: ["fila_notificacao_id"]
            isOneToOne: false
            referencedRelation: "fila_notificacoes_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_notificacoes_compliance_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_notificacao_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_notificacoes_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_notificacoes_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      iniciativas_estrategicas: {
        Row: {
          beneficios_esperados: string | null
          beneficios_realizados: string | null
          categoria: string | null
          codigo: string
          complexidade: string | null
          created_at: string | null
          created_by: string | null
          data_fim_planejada: string
          data_fim_real: string | null
          data_inicio: string
          deliverables: string[] | null
          descricao: string
          duracao_planejada: number | null
          duracao_real: number | null
          equipe_ids: string[] | null
          gerente_projeto_id: string | null
          horas_planejadas: number | null
          horas_realizadas: number | null
          id: string
          metadados: Json | null
          objetivo_id: string
          orcamento_aprovado: number | null
          orcamento_planejado: number | null
          orcamento_realizado: number | null
          percentual_conclusao: number | null
          responsavel_id: string
          saude_projeto: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          beneficios_esperados?: string | null
          beneficios_realizados?: string | null
          categoria?: string | null
          codigo: string
          complexidade?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada: string
          data_fim_real?: string | null
          data_inicio: string
          deliverables?: string[] | null
          descricao: string
          duracao_planejada?: number | null
          duracao_real?: number | null
          equipe_ids?: string[] | null
          gerente_projeto_id?: string | null
          horas_planejadas?: number | null
          horas_realizadas?: number | null
          id?: string
          metadados?: Json | null
          objetivo_id: string
          orcamento_aprovado?: number | null
          orcamento_planejado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          responsavel_id: string
          saude_projeto?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          beneficios_esperados?: string | null
          beneficios_realizados?: string | null
          categoria?: string | null
          codigo?: string
          complexidade?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string
          data_fim_real?: string | null
          data_inicio?: string
          deliverables?: string[] | null
          descricao?: string
          duracao_planejada?: number | null
          duracao_real?: number | null
          equipe_ids?: string[] | null
          gerente_projeto_id?: string | null
          horas_planejadas?: number | null
          horas_realizadas?: number | null
          id?: string
          metadados?: Json | null
          objetivo_id?: string
          orcamento_aprovado?: number | null
          orcamento_planejado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          responsavel_id?: string
          saude_projeto?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iniciativas_estrategicas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iniciativas_estrategicas_gerente_projeto_id_fkey"
            columns: ["gerente_projeto_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iniciativas_estrategicas_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iniciativas_estrategicas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iniciativas_estrategicas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iniciativas_estrategicas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "iniciativas_estrategicas_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instancias_relatorios_conformidade: {
        Row: {
          arquivo_relatorio: string | null
          codigo_instancia: string
          dados_relatorio: Json | null
          data_distribuicao: string | null
          data_fim_periodo: string
          data_geracao: string | null
          data_inicio_periodo: string
          destinatarios_enviados: string[] | null
          distribuido: boolean | null
          gerado_por: string | null
          graficos_dados: Json | null
          hash_arquivo: string | null
          id: string
          mensagem_erro: string | null
          metadados: Json | null
          metricas_calculadas: Json | null
          relatorio_id: string
          status_geracao: string | null
          tamanho_arquivo: number | null
          tempo_processamento: number | null
          tenant_id: string
          titulo: string
        }
        Insert: {
          arquivo_relatorio?: string | null
          codigo_instancia: string
          dados_relatorio?: Json | null
          data_distribuicao?: string | null
          data_fim_periodo: string
          data_geracao?: string | null
          data_inicio_periodo: string
          destinatarios_enviados?: string[] | null
          distribuido?: boolean | null
          gerado_por?: string | null
          graficos_dados?: Json | null
          hash_arquivo?: string | null
          id?: string
          mensagem_erro?: string | null
          metadados?: Json | null
          metricas_calculadas?: Json | null
          relatorio_id: string
          status_geracao?: string | null
          tamanho_arquivo?: number | null
          tempo_processamento?: number | null
          tenant_id: string
          titulo: string
        }
        Update: {
          arquivo_relatorio?: string | null
          codigo_instancia?: string
          dados_relatorio?: Json | null
          data_distribuicao?: string | null
          data_fim_periodo?: string
          data_geracao?: string | null
          data_inicio_periodo?: string
          destinatarios_enviados?: string[] | null
          distribuido?: boolean | null
          gerado_por?: string | null
          graficos_dados?: Json | null
          hash_arquivo?: string | null
          id?: string
          mensagem_erro?: string | null
          metadados?: Json | null
          metricas_calculadas?: Json | null
          relatorio_id?: string
          status_geracao?: string | null
          tamanho_arquivo?: number | null
          tempo_processamento?: number | null
          tenant_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "instancias_relatorios_conformidade_gerado_por_fkey"
            columns: ["gerado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instancias_relatorios_conformidade_relatorio_id_fkey"
            columns: ["relatorio_id"]
            isOneToOne: false
            referencedRelation: "relatorios_conformidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instancias_relatorios_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instancias_relatorios_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "integration_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      kpis_planejamento: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          created_by: string | null
          descricao: string | null
          direcao_melhoria: string | null
          fonte_dados: string | null
          formula_calculo: string | null
          frequencia_coleta: string | null
          id: string
          iniciativa_id: string | null
          limite_amarelo: number | null
          limite_vermelho: number | null
          meta_valor: number
          metadados: Json | null
          nome: string
          objetivo_id: string | null
          responsavel_analise_id: string | null
          responsavel_coleta_id: string | null
          sistema_origem: string | null
          tenant_id: string
          tipo_metrica: string | null
          unidade_medida: string | null
          updated_at: string | null
          updated_by: string | null
          valor_baseline: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          direcao_melhoria?: string | null
          fonte_dados?: string | null
          formula_calculo?: string | null
          frequencia_coleta?: string | null
          id?: string
          iniciativa_id?: string | null
          limite_amarelo?: number | null
          limite_vermelho?: number | null
          meta_valor: number
          metadados?: Json | null
          nome: string
          objetivo_id?: string | null
          responsavel_analise_id?: string | null
          responsavel_coleta_id?: string | null
          sistema_origem?: string | null
          tenant_id: string
          tipo_metrica?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_baseline?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          direcao_melhoria?: string | null
          fonte_dados?: string | null
          formula_calculo?: string | null
          frequencia_coleta?: string | null
          id?: string
          iniciativa_id?: string | null
          limite_amarelo?: number | null
          limite_vermelho?: number | null
          meta_valor?: number
          metadados?: Json | null
          nome?: string
          objetivo_id?: string | null
          responsavel_analise_id?: string | null
          responsavel_coleta_id?: string | null
          sistema_origem?: string | null
          tenant_id?: string
          tipo_metrica?: string | null
          unidade_medida?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_baseline?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpis_planejamento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_planejamento_iniciativa_id_fkey"
            columns: ["iniciativa_id"]
            isOneToOne: false
            referencedRelation: "iniciativas_estrategicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_planejamento_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_planejamento_responsavel_analise_id_fkey"
            columns: ["responsavel_analise_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_planejamento_responsavel_coleta_id_fkey"
            columns: ["responsavel_coleta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "kpis_planejamento_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "legal_bases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      marcos_planejamento: {
        Row: {
          aprovador_id: string | null
          created_at: string | null
          created_by: string | null
          criterios_sucesso: string[] | null
          criticidade: string | null
          data_aprovacao: string | null
          data_baseline: string | null
          data_planejada: string
          data_real: string | null
          descricao: string | null
          evidencias_conclusao: string[] | null
          id: string
          iniciativa_id: string | null
          metadados: Json | null
          objetivo_id: string | null
          plano_estrategico_id: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          aprovador_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_sucesso?: string[] | null
          criticidade?: string | null
          data_aprovacao?: string | null
          data_baseline?: string | null
          data_planejada: string
          data_real?: string | null
          descricao?: string | null
          evidencias_conclusao?: string[] | null
          id?: string
          iniciativa_id?: string | null
          metadados?: Json | null
          objetivo_id?: string | null
          plano_estrategico_id?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          aprovador_id?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_sucesso?: string[] | null
          criticidade?: string | null
          data_aprovacao?: string | null
          data_baseline?: string | null
          data_planejada?: string
          data_real?: string | null
          descricao?: string | null
          evidencias_conclusao?: string[] | null
          id?: string
          iniciativa_id?: string | null
          metadados?: Json | null
          objetivo_id?: string | null
          plano_estrategico_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marcos_planejamento_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marcos_planejamento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marcos_planejamento_iniciativa_id_fkey"
            columns: ["iniciativa_id"]
            isOneToOne: false
            referencedRelation: "iniciativas_estrategicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marcos_planejamento_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marcos_planejamento_plano_estrategico_id_fkey"
            columns: ["plano_estrategico_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marcos_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marcos_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "marcos_planejamento_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "mcp_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      medicoes_kpi: {
        Row: {
          aprovado_por: string | null
          coletado_por: string | null
          comentario: string | null
          created_at: string | null
          created_by: string | null
          data_aprovacao: string | null
          data_medicao: string
          desvio_percentual: number | null
          evidencias: Json | null
          id: string
          kpi_id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          status_medicao: string | null
          tenant_id: string
          valor_acumulado: number | null
          valor_medido: number
        }
        Insert: {
          aprovado_por?: string | null
          coletado_por?: string | null
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          data_medicao: string
          desvio_percentual?: number | null
          evidencias?: Json | null
          id?: string
          kpi_id: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status_medicao?: string | null
          tenant_id: string
          valor_acumulado?: number | null
          valor_medido: number
        }
        Update: {
          aprovado_por?: string | null
          coletado_por?: string | null
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          data_medicao?: string
          desvio_percentual?: number | null
          evidencias?: Json | null
          id?: string
          kpi_id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status_medicao?: string | null
          tenant_id?: string
          valor_acumulado?: number | null
          valor_medido?: number
        }
        Relationships: [
          {
            foreignKeyName: "medicoes_kpi_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_kpi_coletado_por_fkey"
            columns: ["coletado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_kpi_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_kpi_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpis_planejamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_kpi_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_kpi_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      metricas_conformidade: {
        Row: {
          alerta_gerado: boolean | null
          coletado_por: string | null
          data_coleta: string
          destinatarios_alerta: string[] | null
          fatores_influencia: string[] | null
          id: string
          metadados: Json | null
          monitoramento_id: string
          observacoes: string | null
          percentual_variacao: number | null
          status_conformidade: string | null
          tenant_id: string
          tipo_alerta: string | null
          unidade_medida: string | null
          valor_coletado: number
          variacao_anterior: number | null
        }
        Insert: {
          alerta_gerado?: boolean | null
          coletado_por?: string | null
          data_coleta?: string
          destinatarios_alerta?: string[] | null
          fatores_influencia?: string[] | null
          id?: string
          metadados?: Json | null
          monitoramento_id: string
          observacoes?: string | null
          percentual_variacao?: number | null
          status_conformidade?: string | null
          tenant_id: string
          tipo_alerta?: string | null
          unidade_medida?: string | null
          valor_coletado: number
          variacao_anterior?: number | null
        }
        Update: {
          alerta_gerado?: boolean | null
          coletado_por?: string | null
          data_coleta?: string
          destinatarios_alerta?: string[] | null
          fatores_influencia?: string[] | null
          id?: string
          metadados?: Json | null
          monitoramento_id?: string
          observacoes?: string | null
          percentual_variacao?: number | null
          status_conformidade?: string | null
          tenant_id?: string
          tipo_alerta?: string | null
          unidade_medida?: string | null
          valor_coletado?: number
          variacao_anterior?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_conformidade_coletado_por_fkey"
            columns: ["coletado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metricas_conformidade_monitoramento_id_fkey"
            columns: ["monitoramento_id"]
            isOneToOne: false
            referencedRelation: "monitoramento_conformidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metricas_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metricas_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      monitoramento_conformidade: {
        Row: {
          aprovador_alertas: string | null
          automatizado: boolean | null
          codigo: string
          created_at: string | null
          data_proxima_coleta: string | null
          data_ultima_coleta: string | null
          descricao: string | null
          fonte_dados: string | null
          frequencia: string | null
          id: string
          limite_critico: number | null
          limite_inferior: number | null
          limite_superior: number | null
          metadados: Json | null
          metrica_monitorada: string
          nome: string
          objeto_id: string
          parametros_coleta: Json | null
          query_dados: string | null
          requer_aprovacao_manual: boolean | null
          responsavel_monitoramento: string
          status: string | null
          tenant_id: string
          tipo_objeto: string | null
          ultimo_valor_coletado: number | null
          unidade_medida: string | null
          updated_at: string | null
          valor_alvo: number | null
        }
        Insert: {
          aprovador_alertas?: string | null
          automatizado?: boolean | null
          codigo: string
          created_at?: string | null
          data_proxima_coleta?: string | null
          data_ultima_coleta?: string | null
          descricao?: string | null
          fonte_dados?: string | null
          frequencia?: string | null
          id?: string
          limite_critico?: number | null
          limite_inferior?: number | null
          limite_superior?: number | null
          metadados?: Json | null
          metrica_monitorada: string
          nome: string
          objeto_id: string
          parametros_coleta?: Json | null
          query_dados?: string | null
          requer_aprovacao_manual?: boolean | null
          responsavel_monitoramento: string
          status?: string | null
          tenant_id: string
          tipo_objeto?: string | null
          ultimo_valor_coletado?: number | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_alvo?: number | null
        }
        Update: {
          aprovador_alertas?: string | null
          automatizado?: boolean | null
          codigo?: string
          created_at?: string | null
          data_proxima_coleta?: string | null
          data_ultima_coleta?: string | null
          descricao?: string | null
          fonte_dados?: string | null
          frequencia?: string | null
          id?: string
          limite_critico?: number | null
          limite_inferior?: number | null
          limite_superior?: number | null
          metadados?: Json | null
          metrica_monitorada?: string
          nome?: string
          objeto_id?: string
          parametros_coleta?: Json | null
          query_dados?: string | null
          requer_aprovacao_manual?: boolean | null
          responsavel_monitoramento?: string
          status?: string | null
          tenant_id?: string
          tipo_objeto?: string | null
          ultimo_valor_coletado?: number | null
          unidade_medida?: string | null
          updated_at?: string | null
          valor_alvo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoramento_conformidade_aprovador_alertas_fkey"
            columns: ["aprovador_alertas"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoramento_conformidade_responsavel_monitoramento_fkey"
            columns: ["responsavel_monitoramento"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoramento_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoramento_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      nao_conformidades: {
        Row: {
          acoes_imediatas_tomadas: string | null
          avaliacao_id: string | null
          categoria: string | null
          codigo: string
          como_identificado: string | null
          created_at: string | null
          created_by: string | null
          criticidade: string | null
          data_identificacao: string
          data_resolucao: string | null
          e_recorrente: boolean | null
          evidencias_nao_conformidade: string[] | null
          id: string
          impacto_detalhado: string | null
          impacto_financeiro: number | null
          impacto_operacional: number | null
          impacto_regulatorio: number | null
          impacto_reputacional: number | null
          justificativa_status: string | null
          metadados: Json | null
          nao_conformidade_origem: string | null
          o_que: string
          onde: string | null
          origem_identificacao: string | null
          por_que: string | null
          prazo_resolucao: string | null
          quando: string | null
          quantidade_recorrencias: number | null
          quanto_impacto: string | null
          quem: string | null
          requisito_id: string
          responsavel_tratamento: string | null
          risco_score: number | null
          status: string | null
          tenant_id: string
          tipo_nao_conformidade: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          acoes_imediatas_tomadas?: string | null
          avaliacao_id?: string | null
          categoria?: string | null
          codigo: string
          como_identificado?: string | null
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          data_identificacao?: string
          data_resolucao?: string | null
          e_recorrente?: boolean | null
          evidencias_nao_conformidade?: string[] | null
          id?: string
          impacto_detalhado?: string | null
          impacto_financeiro?: number | null
          impacto_operacional?: number | null
          impacto_regulatorio?: number | null
          impacto_reputacional?: number | null
          justificativa_status?: string | null
          metadados?: Json | null
          nao_conformidade_origem?: string | null
          o_que: string
          onde?: string | null
          origem_identificacao?: string | null
          por_que?: string | null
          prazo_resolucao?: string | null
          quando?: string | null
          quantidade_recorrencias?: number | null
          quanto_impacto?: string | null
          quem?: string | null
          requisito_id: string
          responsavel_tratamento?: string | null
          risco_score?: number | null
          status?: string | null
          tenant_id: string
          tipo_nao_conformidade?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          acoes_imediatas_tomadas?: string | null
          avaliacao_id?: string | null
          categoria?: string | null
          codigo?: string
          como_identificado?: string | null
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          data_identificacao?: string
          data_resolucao?: string | null
          e_recorrente?: boolean | null
          evidencias_nao_conformidade?: string[] | null
          id?: string
          impacto_detalhado?: string | null
          impacto_financeiro?: number | null
          impacto_operacional?: number | null
          impacto_regulatorio?: number | null
          impacto_reputacional?: number | null
          justificativa_status?: string | null
          metadados?: Json | null
          nao_conformidade_origem?: string | null
          o_que?: string
          onde?: string | null
          origem_identificacao?: string | null
          por_que?: string | null
          prazo_resolucao?: string | null
          quando?: string | null
          quantidade_recorrencias?: number | null
          quanto_impacto?: string | null
          quem?: string | null
          requisito_id?: string
          responsavel_tratamento?: string | null
          risco_score?: number | null
          status?: string | null
          tenant_id?: string
          tipo_nao_conformidade?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nao_conformidades_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes_conformidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_nao_conformidade_origem_fkey"
            columns: ["nao_conformidade_origem"]
            isOneToOne: false
            referencedRelation: "nao_conformidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_requisito_id_fkey"
            columns: ["requisito_id"]
            isOneToOne: false
            referencedRelation: "requisitos_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_responsavel_tratamento_fkey"
            columns: ["responsavel_tratamento"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nao_conformidades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "nao_conformidades_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes_planejamento: {
        Row: {
          canal: string | null
          created_at: string | null
          created_by: string | null
          data_envio: string | null
          data_leitura: string | null
          destinatario_id: string | null
          entidade_id: string
          entidade_tipo: string
          enviada: boolean | null
          grupo_notificacao: string | null
          id: string
          lida: boolean | null
          mensagem: string
          proxima_execucao: string | null
          recorrente: boolean | null
          tenant_id: string
          tipo: string
          titulo: string
        }
        Insert: {
          canal?: string | null
          created_at?: string | null
          created_by?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          destinatario_id?: string | null
          entidade_id: string
          entidade_tipo: string
          enviada?: boolean | null
          grupo_notificacao?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          proxima_execucao?: string | null
          recorrente?: boolean | null
          tenant_id: string
          tipo: string
          titulo: string
        }
        Update: {
          canal?: string | null
          created_at?: string | null
          created_by?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          destinatario_id?: string | null
          entidade_id?: string
          entidade_tipo?: string
          enviada?: boolean | null
          grupo_notificacao?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          proxima_execucao?: string | null
          recorrente?: boolean | null
          tenant_id?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_planejamento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_planejamento_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      objetivos_estrategicos: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          data_fim_planejada: string
          data_fim_real: string | null
          data_inicio: string
          descricao: string
          equipe_ids: string[] | null
          id: string
          meta_descricao: string | null
          meta_valor_alvo: number | null
          meta_valor_inicial: number | null
          metadados: Json | null
          orcamento_aprovado: number | null
          orcamento_realizado: number | null
          percentual_conclusao: number | null
          plano_estrategico_id: string
          prioridade: string | null
          responsavel_id: string
          sponsors: string[] | null
          status: string | null
          tenant_id: string
          tipo: string | null
          titulo: string
          unidade_medida: string | null
          updated_at: string | null
          updated_by: string | null
          valor_atual: number | null
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada: string
          data_fim_real?: string | null
          data_inicio: string
          descricao: string
          equipe_ids?: string[] | null
          id?: string
          meta_descricao?: string | null
          meta_valor_alvo?: number | null
          meta_valor_inicial?: number | null
          metadados?: Json | null
          orcamento_aprovado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          plano_estrategico_id: string
          prioridade?: string | null
          responsavel_id: string
          sponsors?: string[] | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
          titulo: string
          unidade_medida?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_atual?: number | null
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string
          data_fim_real?: string | null
          data_inicio?: string
          descricao?: string
          equipe_ids?: string[] | null
          id?: string
          meta_descricao?: string | null
          meta_valor_alvo?: number | null
          meta_valor_inicial?: number | null
          metadados?: Json | null
          orcamento_aprovado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          plano_estrategico_id?: string
          prioridade?: string | null
          responsavel_id?: string
          sponsors?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
          titulo?: string
          unidade_medida?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valor_atual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "objetivos_estrategicos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetivos_estrategicos_plano_estrategico_id_fkey"
            columns: ["plano_estrategico_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetivos_estrategicos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetivos_estrategicos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objetivos_estrategicos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "objetivos_estrategicos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_auditoria: {
        Row: {
          aprovado: boolean | null
          aprovado_por: string | null
          categoria: string
          created_at: string | null
          data_aprovacao: string | null
          descricao: string | null
          id: string
          item: string
          observacoes: string | null
          periodo_fim: string | null
          periodo_inicio: string | null
          quantidade: number
          tenant_id: string
          trabalho_id: string
          updated_at: string | null
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          aprovado?: boolean | null
          aprovado_por?: string | null
          categoria: string
          created_at?: string | null
          data_aprovacao?: string | null
          descricao?: string | null
          id?: string
          item: string
          observacoes?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          quantidade?: number
          tenant_id: string
          trabalho_id: string
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario: number
        }
        Update: {
          aprovado?: boolean | null
          aprovado_por?: string | null
          categoria?: string
          created_at?: string | null
          data_aprovacao?: string | null
          descricao?: string | null
          id?: string
          item?: string
          observacoes?: string | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          quantidade?: number
          tenant_id?: string
          trabalho_id?: string
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_auditoria_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "orcamento_auditoria_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos_auditoria"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_acao: {
        Row: {
          apontamento_id: string
          arquivos_evidencia: Json | null
          avaliado_por: string | null
          comentario_auditoria: string | null
          comentario_responsavel: string | null
          created_at: string | null
          created_by: string | null
          data_avaliacao: string | null
          data_conclusao: string | null
          data_vencimento: string
          descricao_acao: string
          evidencias_conclusao: string[] | null
          id: string
          metadados: Json | null
          percentual_conclusao: number | null
          responsavel_id: string
          resultado_avaliacao: string | null
          status: string | null
          tenant_id: string
          ultima_atualizacao_responsavel: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          apontamento_id: string
          arquivos_evidencia?: Json | null
          avaliado_por?: string | null
          comentario_auditoria?: string | null
          comentario_responsavel?: string | null
          created_at?: string | null
          created_by?: string | null
          data_avaliacao?: string | null
          data_conclusao?: string | null
          data_vencimento: string
          descricao_acao: string
          evidencias_conclusao?: string[] | null
          id?: string
          metadados?: Json | null
          percentual_conclusao?: number | null
          responsavel_id: string
          resultado_avaliacao?: string | null
          status?: string | null
          tenant_id: string
          ultima_atualizacao_responsavel?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          apontamento_id?: string
          arquivos_evidencia?: Json | null
          avaliado_por?: string | null
          comentario_auditoria?: string | null
          comentario_responsavel?: string | null
          created_at?: string | null
          created_by?: string | null
          data_avaliacao?: string | null
          data_conclusao?: string | null
          data_vencimento?: string
          descricao_acao?: string
          evidencias_conclusao?: string[] | null
          id?: string
          metadados?: Json | null
          percentual_conclusao?: number | null
          responsavel_id?: string
          resultado_avaliacao?: string | null
          status?: string | null
          tenant_id?: string
          ultima_atualizacao_responsavel?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_acao_apontamento_id_fkey"
            columns: ["apontamento_id"]
            isOneToOne: false
            referencedRelation: "apontamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_avaliado_por_fkey"
            columns: ["avaliado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "planos_acao_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_acao_conformidade: {
        Row: {
          categoria_acao: string | null
          causa_raiz_endereçada: string | null
          codigo: string
          comunicacao_stakeholders: string | null
          created_at: string | null
          created_by: string | null
          data_fim_planejada: string
          data_fim_real: string | null
          data_inicio_planejada: string
          data_inicio_real: string | null
          data_proximo_monitoramento: string | null
          data_verificacao_efetividade: string | null
          dependencias: string[] | null
          descricao_acao: string
          documentos_relacionados: string[] | null
          efetividade_confirmada: boolean | null
          entregas_esperadas: string[] | null
          evidencias_efetividade: string[] | null
          frequencia_monitoramento: string | null
          id: string
          licoes_aprendidas: string | null
          marcos_principais: Json | null
          metadados: Json | null
          nao_conformidade_id: string
          objetivo_acao: string
          observacoes_efetividade: string | null
          orcamento_estimado: number | null
          orcamento_realizado: number | null
          percentual_conclusao: number | null
          recursos_necessarios: string[] | null
          responsavel_aprovacao: string | null
          responsavel_execucao: string
          responsavel_monitoramento: string | null
          resultados_esperados: string | null
          status: string | null
          tenant_id: string
          tipo_acao: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          categoria_acao?: string | null
          causa_raiz_endereçada?: string | null
          codigo: string
          comunicacao_stakeholders?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada: string
          data_fim_real?: string | null
          data_inicio_planejada: string
          data_inicio_real?: string | null
          data_proximo_monitoramento?: string | null
          data_verificacao_efetividade?: string | null
          dependencias?: string[] | null
          descricao_acao: string
          documentos_relacionados?: string[] | null
          efetividade_confirmada?: boolean | null
          entregas_esperadas?: string[] | null
          evidencias_efetividade?: string[] | null
          frequencia_monitoramento?: string | null
          id?: string
          licoes_aprendidas?: string | null
          marcos_principais?: Json | null
          metadados?: Json | null
          nao_conformidade_id: string
          objetivo_acao: string
          observacoes_efetividade?: string | null
          orcamento_estimado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          recursos_necessarios?: string[] | null
          responsavel_aprovacao?: string | null
          responsavel_execucao: string
          responsavel_monitoramento?: string | null
          resultados_esperados?: string | null
          status?: string | null
          tenant_id: string
          tipo_acao?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          categoria_acao?: string | null
          causa_raiz_endereçada?: string | null
          codigo?: string
          comunicacao_stakeholders?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string
          data_fim_real?: string | null
          data_inicio_planejada?: string
          data_inicio_real?: string | null
          data_proximo_monitoramento?: string | null
          data_verificacao_efetividade?: string | null
          dependencias?: string[] | null
          descricao_acao?: string
          documentos_relacionados?: string[] | null
          efetividade_confirmada?: boolean | null
          entregas_esperadas?: string[] | null
          evidencias_efetividade?: string[] | null
          frequencia_monitoramento?: string | null
          id?: string
          licoes_aprendidas?: string | null
          marcos_principais?: Json | null
          metadados?: Json | null
          nao_conformidade_id?: string
          objetivo_acao?: string
          observacoes_efetividade?: string | null
          orcamento_estimado?: number | null
          orcamento_realizado?: number | null
          percentual_conclusao?: number | null
          recursos_necessarios?: string[] | null
          responsavel_aprovacao?: string | null
          responsavel_execucao?: string
          responsavel_monitoramento?: string | null
          resultados_esperados?: string | null
          status?: string | null
          tenant_id?: string
          tipo_acao?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_acao_conformidade_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_conformidade_nao_conformidade_id_fkey"
            columns: ["nao_conformidade_id"]
            isOneToOne: false
            referencedRelation: "nao_conformidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_conformidade_responsavel_aprovacao_fkey"
            columns: ["responsavel_aprovacao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_conformidade_responsavel_execucao_fkey"
            columns: ["responsavel_execucao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_conformidade_responsavel_monitoramento_fkey"
            columns: ["responsavel_monitoramento"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "planos_acao_conformidade_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_auditoria_anuais: {
        Row: {
          ano_exercicio: number
          aprovado_por: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          data_aprovacao: string | null
          descricao: string | null
          id: string
          metadados: Json | null
          observacoes: string | null
          status: string | null
          tenant_id: string
          titulo: string
          total_horas_planejadas: number | null
          total_recursos_orcados: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ano_exercicio: number
          aprovado_por?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          descricao?: string | null
          id?: string
          metadados?: Json | null
          observacoes?: string | null
          status?: string | null
          tenant_id: string
          titulo: string
          total_horas_planejadas?: number | null
          total_recursos_orcados?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ano_exercicio?: number
          aprovado_por?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          descricao?: string | null
          id?: string
          metadados?: Json | null
          observacoes?: string | null
          status?: string | null
          tenant_id?: string
          titulo?: string
          total_horas_planejadas?: number | null
          total_recursos_orcados?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_auditoria_anuais_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_auditoria_anuais_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_auditoria_anuais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_auditoria_anuais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "planos_auditoria_anuais_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_estrategicos: {
        Row: {
          ano_fim: number
          ano_inicio: number
          aprovador_id: string | null
          codigo: string
          configuracoes: Json | null
          created_at: string | null
          created_by: string | null
          data_aprovacao: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          metadados: Json | null
          nivel: string | null
          orcamento_consumido: number | null
          orcamento_total: number | null
          percentual_conclusao: number | null
          plano_pai_id: string | null
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ano_fim: number
          ano_inicio: number
          aprovador_id?: string | null
          codigo: string
          configuracoes?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          metadados?: Json | null
          nivel?: string | null
          orcamento_consumido?: number | null
          orcamento_total?: number | null
          percentual_conclusao?: number | null
          plano_pai_id?: string | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ano_fim?: number
          ano_inicio?: number
          aprovador_id?: string | null
          codigo?: string
          configuracoes?: Json | null
          created_at?: string | null
          created_by?: string | null
          data_aprovacao?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          metadados?: Json | null
          nivel?: string | null
          orcamento_consumido?: number | null
          orcamento_total?: number | null
          percentual_conclusao?: number | null
          plano_pai_id?: string | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_estrategicos_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_plano_pai_id_fkey"
            columns: ["plano_pai_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_estrategicos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "planos_estrategicos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "platform_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
            foreignKeyName: "policies_v2_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
            foreignKeyName: "policy_acknowledgments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "policy_change_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "policy_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "policy_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "policy_publications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "policy_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
            foreignKeyName: "policy_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "policy_workflow_steps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      preferencias_notificacao_compliance: {
        Row: {
          apenas_alta_prioridade: boolean | null
          apenas_responsabilidades_diretas: boolean | null
          created_at: string | null
          dias_nao_receber: number[] | null
          fuso_horario: string | null
          horario_preferencial_fim: string | null
          horario_preferencial_inicio: string | null
          id: string
          preferencias_canais: Json
          receber_notificacoes: boolean | null
          receber_resumos_diarios: boolean | null
          receber_resumos_semanais: boolean | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apenas_alta_prioridade?: boolean | null
          apenas_responsabilidades_diretas?: boolean | null
          created_at?: string | null
          dias_nao_receber?: number[] | null
          fuso_horario?: string | null
          horario_preferencial_fim?: string | null
          horario_preferencial_inicio?: string | null
          id?: string
          preferencias_canais?: Json
          receber_notificacoes?: boolean | null
          receber_resumos_diarios?: boolean | null
          receber_resumos_semanais?: boolean | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apenas_alta_prioridade?: boolean | null
          apenas_responsabilidades_diretas?: boolean | null
          created_at?: string | null
          dias_nao_receber?: number[] | null
          fuso_horario?: string | null
          horario_preferencial_fim?: string | null
          horario_preferencial_inicio?: string | null
          id?: string
          preferencias_canais?: Json
          receber_notificacoes?: boolean | null
          receber_resumos_diarios?: boolean | null
          receber_resumos_semanais?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_notificacao_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferencias_notificacao_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "preferencias_notificacao_compliance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "privacy_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      procedimentos_auditoria: {
        Row: {
          codigo: string
          controle_testado: string | null
          created_at: string | null
          created_by: string | null
          criterios_aceitacao: string | null
          data_fim_planejada: string | null
          data_inicio_planejada: string | null
          descricao: string
          documentos_necessarios: string[] | null
          evidencias_esperadas: string[] | null
          horas_estimadas: number | null
          id: string
          metadados: Json | null
          metodo_selecao_amostra: string | null
          objetivo: string
          observacoes: string | null
          ordem_execucao: number | null
          populacao_teste: string | null
          referencias_normativas: string[] | null
          responsavel_id: string
          status: string | null
          tamanho_amostra: number | null
          tenant_id: string
          tipo_procedimento: string | null
          titulo: string
          trabalho_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          codigo: string
          controle_testado?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_aceitacao?: string | null
          data_fim_planejada?: string | null
          data_inicio_planejada?: string | null
          descricao: string
          documentos_necessarios?: string[] | null
          evidencias_esperadas?: string[] | null
          horas_estimadas?: number | null
          id?: string
          metadados?: Json | null
          metodo_selecao_amostra?: string | null
          objetivo: string
          observacoes?: string | null
          ordem_execucao?: number | null
          populacao_teste?: string | null
          referencias_normativas?: string[] | null
          responsavel_id: string
          status?: string | null
          tamanho_amostra?: number | null
          tenant_id: string
          tipo_procedimento?: string | null
          titulo: string
          trabalho_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          codigo?: string
          controle_testado?: string | null
          created_at?: string | null
          created_by?: string | null
          criterios_aceitacao?: string | null
          data_fim_planejada?: string | null
          data_inicio_planejada?: string | null
          descricao?: string
          documentos_necessarios?: string[] | null
          evidencias_esperadas?: string[] | null
          horas_estimadas?: number | null
          id?: string
          metadados?: Json | null
          metodo_selecao_amostra?: string | null
          objetivo?: string
          observacoes?: string | null
          ordem_execucao?: number | null
          populacao_teste?: string | null
          referencias_normativas?: string[] | null
          responsavel_id?: string
          status?: string | null
          tamanho_amostra?: number | null
          tenant_id?: string
          tipo_procedimento?: string | null
          titulo?: string
          trabalho_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procedimentos_auditoria_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_auditoria_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "procedimentos_auditoria_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos_auditoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimentos_auditoria_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "processing_activities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          is_platform_admin: boolean | null
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
          roles: string[] | null
          tenant_id: string | null
          theme: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string | null
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
          is_platform_admin?: boolean | null
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
          roles?: string[] | null
          tenant_id?: string | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
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
          is_platform_admin?: boolean | null
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
          roles?: string[] | null
          tenant_id?: string | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      projetos_auditoria: {
        Row: {
          apontamentos_altos: number | null
          apontamentos_baixos: number | null
          apontamentos_criticos: number | null
          apontamentos_medios: number | null
          chefe_auditoria: string
          codigo: string
          created_at: string | null
          created_by: string | null
          data_fim_planejada: string
          data_fim_real: string | null
          data_inicio: string
          descricao: string | null
          equipe_ids: string[] | null
          escopo: string | null
          fase_atual: string | null
          horas_orcadas: number | null
          horas_realizadas: number | null
          id: string
          metadados: Json | null
          objetivos: string[] | null
          rating_geral: string | null
          status: string | null
          tenant_id: string
          tipo_auditoria: string | null
          titulo: string
          total_apontamentos: number | null
          universo_auditavel_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          apontamentos_altos?: number | null
          apontamentos_baixos?: number | null
          apontamentos_criticos?: number | null
          apontamentos_medios?: number | null
          chefe_auditoria: string
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada: string
          data_fim_real?: string | null
          data_inicio: string
          descricao?: string | null
          equipe_ids?: string[] | null
          escopo?: string | null
          fase_atual?: string | null
          horas_orcadas?: number | null
          horas_realizadas?: number | null
          id?: string
          metadados?: Json | null
          objetivos?: string[] | null
          rating_geral?: string | null
          status?: string | null
          tenant_id: string
          tipo_auditoria?: string | null
          titulo: string
          total_apontamentos?: number | null
          universo_auditavel_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          apontamentos_altos?: number | null
          apontamentos_baixos?: number | null
          apontamentos_criticos?: number | null
          apontamentos_medios?: number | null
          chefe_auditoria?: string
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string
          data_fim_real?: string | null
          data_inicio?: string
          descricao?: string | null
          equipe_ids?: string[] | null
          escopo?: string | null
          fase_atual?: string | null
          horas_orcadas?: number | null
          horas_realizadas?: number | null
          id?: string
          metadados?: Json | null
          objetivos?: string[] | null
          rating_geral?: string | null
          status?: string | null
          tenant_id?: string
          tipo_auditoria?: string | null
          titulo?: string
          total_apontamentos?: number | null
          universo_auditavel_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_auditoria_chefe_auditoria_fkey"
            columns: ["chefe_auditoria"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_auditoria_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "projetos_auditoria_universo_auditavel_id_fkey"
            columns: ["universo_auditavel_id"]
            isOneToOne: false
            referencedRelation: "universo_auditavel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_auditoria_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_notificacao_compliance: {
        Row: {
          ativa: boolean | null
          campo_responsavel: string | null
          canal_notificacao: string[] | null
          codigo: string
          condicoes_disparo: Json
          created_at: string | null
          created_by: string | null
          descricao: string | null
          destinatarios_fixos: string[] | null
          dias_antecedencia: number | null
          dias_semana: number[] | null
          escalonamento_ativo: boolean | null
          frequencia_maxima: number | null
          horario_envio: string | null
          id: string
          incluir_administradores: boolean | null
          incluir_gestores: boolean | null
          nome: string
          objeto_monitorado: string
          papeis_destinatarios: string[] | null
          periodo_frequencia: string | null
          prioridade: string | null
          regras_escalonamento: Json | null
          template_assunto: string
          template_corpo: string
          template_variaveis: Json | null
          tenant_id: string
          tipo_evento: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativa?: boolean | null
          campo_responsavel?: string | null
          canal_notificacao?: string[] | null
          codigo: string
          condicoes_disparo?: Json
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          destinatarios_fixos?: string[] | null
          dias_antecedencia?: number | null
          dias_semana?: number[] | null
          escalonamento_ativo?: boolean | null
          frequencia_maxima?: number | null
          horario_envio?: string | null
          id?: string
          incluir_administradores?: boolean | null
          incluir_gestores?: boolean | null
          nome: string
          objeto_monitorado: string
          papeis_destinatarios?: string[] | null
          periodo_frequencia?: string | null
          prioridade?: string | null
          regras_escalonamento?: Json | null
          template_assunto: string
          template_corpo: string
          template_variaveis?: Json | null
          tenant_id: string
          tipo_evento: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativa?: boolean | null
          campo_responsavel?: string | null
          canal_notificacao?: string[] | null
          codigo?: string
          condicoes_disparo?: Json
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          destinatarios_fixos?: string[] | null
          dias_antecedencia?: number | null
          dias_semana?: number[] | null
          escalonamento_ativo?: boolean | null
          frequencia_maxima?: number | null
          horario_envio?: string | null
          id?: string
          incluir_administradores?: boolean | null
          incluir_gestores?: boolean | null
          nome?: string
          objeto_monitorado?: string
          papeis_destinatarios?: string[] | null
          periodo_frequencia?: string | null
          prioridade?: string | null
          regras_escalonamento?: Json | null
          template_assunto?: string
          template_corpo?: string
          template_variaveis?: Json | null
          tenant_id?: string
          tipo_evento?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regras_notificacao_compliance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_notificacao_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_notificacao_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "regras_notificacao_compliance_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_conformidade: {
        Row: {
          automatico: boolean | null
          canais_distribuicao: string[] | null
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          data_proxima_geracao: string | null
          descricao: string | null
          destinatarios: string[] | null
          emails_externos: string[] | null
          formato_saida: string | null
          frameworks_incluidos: string[] | null
          frequencia_geracao: string | null
          id: string
          metadados: Json | null
          nivel_confidencialidade: string | null
          periodo_referencia: string | null
          requisitos_incluidos: string[] | null
          roles_acesso: string[] | null
          status: string | null
          template_relatorio: Json | null
          tenant_id: string
          tipo_relatorio: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          automatico?: boolean | null
          canais_distribuicao?: string[] | null
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_proxima_geracao?: string | null
          descricao?: string | null
          destinatarios?: string[] | null
          emails_externos?: string[] | null
          formato_saida?: string | null
          frameworks_incluidos?: string[] | null
          frequencia_geracao?: string | null
          id?: string
          metadados?: Json | null
          nivel_confidencialidade?: string | null
          periodo_referencia?: string | null
          requisitos_incluidos?: string[] | null
          roles_acesso?: string[] | null
          status?: string | null
          template_relatorio?: Json | null
          tenant_id: string
          tipo_relatorio?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          automatico?: boolean | null
          canais_distribuicao?: string[] | null
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_proxima_geracao?: string | null
          descricao?: string | null
          destinatarios?: string[] | null
          emails_externos?: string[] | null
          formato_saida?: string | null
          frameworks_incluidos?: string[] | null
          frequencia_geracao?: string | null
          id?: string
          metadados?: Json | null
          nivel_confidencialidade?: string | null
          periodo_referencia?: string | null
          requisitos_incluidos?: string[] | null
          roles_acesso?: string[] | null
          status?: string | null
          template_relatorio?: Json | null
          tenant_id?: string
          tipo_relatorio?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_conformidade_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatorios_conformidade_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "relatorios_conformidade_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      requisitos_compliance: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          criterios_conformidade: string
          criticidade: string | null
          data_proxima_avaliacao: string | null
          descricao: string
          documentacao_necessaria: string[] | null
          framework_id: string
          frequencia_avaliacao: string | null
          id: string
          metadados: Json | null
          nivel: number | null
          nivel_risco_nao_conformidade: number | null
          ordem_apresentacao: number | null
          requisito_pai: string | null
          responsavel_avaliacao: string | null
          responsavel_conformidade: string | null
          status: string | null
          subcategoria: string | null
          tenant_id: string
          tipo_controle: string | null
          tipos_evidencia_esperada: string[] | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          criterios_conformidade: string
          criticidade?: string | null
          data_proxima_avaliacao?: string | null
          descricao: string
          documentacao_necessaria?: string[] | null
          framework_id: string
          frequencia_avaliacao?: string | null
          id?: string
          metadados?: Json | null
          nivel?: number | null
          nivel_risco_nao_conformidade?: number | null
          ordem_apresentacao?: number | null
          requisito_pai?: string | null
          responsavel_avaliacao?: string | null
          responsavel_conformidade?: string | null
          status?: string | null
          subcategoria?: string | null
          tenant_id: string
          tipo_controle?: string | null
          tipos_evidencia_esperada?: string[] | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          criterios_conformidade?: string
          criticidade?: string | null
          data_proxima_avaliacao?: string | null
          descricao?: string
          documentacao_necessaria?: string[] | null
          framework_id?: string
          frequencia_avaliacao?: string | null
          id?: string
          metadados?: Json | null
          nivel?: number | null
          nivel_risco_nao_conformidade?: number | null
          ordem_apresentacao?: number | null
          requisito_pai?: string | null
          responsavel_avaliacao?: string | null
          responsavel_conformidade?: string | null
          status?: string | null
          subcategoria?: string | null
          tenant_id?: string
          tipo_controle?: string | null
          tipos_evidencia_esperada?: string[] | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requisitos_compliance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_compliance_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_compliance_requisito_pai_fkey"
            columns: ["requisito_pai"]
            isOneToOne: false
            referencedRelation: "requisitos_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_compliance_responsavel_avaliacao_fkey"
            columns: ["responsavel_avaliacao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_compliance_responsavel_conformidade_fkey"
            columns: ["responsavel_conformidade"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisitos_compliance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "requisitos_compliance_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_auditoria: {
        Row: {
          apetite: number | null
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          descricao: string
          id: string
          impacto: number | null
          impacto_residual: number | null
          metadados: Json | null
          probabilidade: number | null
          probabilidade_residual: number | null
          risco_inerente: number | null
          risco_residual: number | null
          status: string | null
          subcategoria: string | null
          tenant_id: string
          titulo: string
          tolerancia: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          apetite?: number | null
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          descricao: string
          id?: string
          impacto?: number | null
          impacto_residual?: number | null
          metadados?: Json | null
          probabilidade?: number | null
          probabilidade_residual?: number | null
          risco_inerente?: number | null
          risco_residual?: number | null
          status?: string | null
          subcategoria?: string | null
          tenant_id: string
          titulo: string
          tolerancia?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          apetite?: number | null
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string
          id?: string
          impacto?: number | null
          impacto_residual?: number | null
          metadados?: Json | null
          probabilidade?: number | null
          probabilidade_residual?: number | null
          risco_inerente?: number | null
          risco_residual?: number | null
          status?: string | null
          subcategoria?: string | null
          tenant_id?: string
          titulo?: string
          tolerancia?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riscos_auditoria_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "riscos_auditoria_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_planejamento: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string | null
          created_by: string | null
          data_identificacao: string | null
          data_materializacao: string | null
          descricao: string
          estrategia_resposta: string | null
          id: string
          impacto: number | null
          impacto_pos_mitigacao: number | null
          iniciativa_id: string | null
          metadados: Json | null
          objetivo_id: string | null
          plano_contingencia: string | null
          plano_estrategico_id: string | null
          plano_mitigacao: string | null
          probabilidade: number | null
          probabilidade_pos_mitigacao: number | null
          responsavel_id: string
          risco_inerente: number | null
          risco_residual: number | null
          status: string | null
          tenant_id: string
          tipo_impacto: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_identificacao?: string | null
          data_materializacao?: string | null
          descricao: string
          estrategia_resposta?: string | null
          id?: string
          impacto?: number | null
          impacto_pos_mitigacao?: number | null
          iniciativa_id?: string | null
          metadados?: Json | null
          objetivo_id?: string | null
          plano_contingencia?: string | null
          plano_estrategico_id?: string | null
          plano_mitigacao?: string | null
          probabilidade?: number | null
          probabilidade_pos_mitigacao?: number | null
          responsavel_id: string
          risco_inerente?: number | null
          risco_residual?: number | null
          status?: string | null
          tenant_id: string
          tipo_impacto?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_identificacao?: string | null
          data_materializacao?: string | null
          descricao?: string
          estrategia_resposta?: string | null
          id?: string
          impacto?: number | null
          impacto_pos_mitigacao?: number | null
          iniciativa_id?: string | null
          metadados?: Json | null
          objetivo_id?: string | null
          plano_contingencia?: string | null
          plano_estrategico_id?: string | null
          plano_mitigacao?: string | null
          probabilidade?: number | null
          probabilidade_pos_mitigacao?: number | null
          responsavel_id?: string
          risco_inerente?: number | null
          risco_residual?: number | null
          status?: string | null
          tenant_id?: string
          tipo_impacto?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riscos_planejamento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_iniciativa_id_fkey"
            columns: ["iniciativa_id"]
            isOneToOne: false
            referencedRelation: "iniciativas_estrategicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_plano_estrategico_id_fkey"
            columns: ["plano_estrategico_id"]
            isOneToOne: false
            referencedRelation: "planos_estrategicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "riscos_planejamento_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_planejamento_auditoria: {
        Row: {
          acoes_mitigacao: string[] | null
          categoria: string | null
          codigo: string
          created_at: string | null
          descricao_risco: string
          estrategia_resposta: string | null
          id: string
          impacto: number
          observacoes: string | null
          plano_anual_id: string | null
          prazo_mitigacao: string | null
          probabilidade: number
          responsavel_mitigacao: string | null
          risco_inerente: number | null
          status: string | null
          tenant_id: string
          trabalho_id: string | null
          updated_at: string | null
        }
        Insert: {
          acoes_mitigacao?: string[] | null
          categoria?: string | null
          codigo: string
          created_at?: string | null
          descricao_risco: string
          estrategia_resposta?: string | null
          id?: string
          impacto: number
          observacoes?: string | null
          plano_anual_id?: string | null
          prazo_mitigacao?: string | null
          probabilidade: number
          responsavel_mitigacao?: string | null
          risco_inerente?: number | null
          status?: string | null
          tenant_id: string
          trabalho_id?: string | null
          updated_at?: string | null
        }
        Update: {
          acoes_mitigacao?: string[] | null
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          descricao_risco?: string
          estrategia_resposta?: string | null
          id?: string
          impacto?: number
          observacoes?: string | null
          plano_anual_id?: string | null
          prazo_mitigacao?: string | null
          probabilidade?: number
          responsavel_mitigacao?: string | null
          risco_inerente?: number | null
          status?: string | null
          tenant_id?: string
          trabalho_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riscos_planejamento_auditoria_plano_anual_id_fkey"
            columns: ["plano_anual_id"]
            isOneToOne: false
            referencedRelation: "planos_auditoria_anuais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_auditoria_responsavel_mitigacao_fkey"
            columns: ["responsavel_mitigacao"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_planejamento_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "riscos_planejamento_auditoria_trabalho_id_fkey"
            columns: ["trabalho_id"]
            isOneToOne: false
            referencedRelation: "trabalhos_auditoria"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          {
            foreignKeyName: "risk_letter_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "risk_methodologies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
        Relationships: []
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
          activity_1_description: string | null
          activity_1_due_date: string | null
          activity_1_email: string | null
          activity_1_name: string | null
          activity_1_priority: string | null
          activity_1_responsible: string | null
          activity_1_status: string | null
          analysis_methodology: string | null
          analysis_notes: string | null
          approval_person_1_email: string | null
          approval_person_1_name: string | null
          approval_person_1_position: string | null
          approval_person_1_status: string | null
          assigned_to: string | null
          assigned_to_name: string | null
          awareness_person_1_email: string | null
          awareness_person_1_name: string | null
          awareness_person_1_position: string | null
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
          activity_1_description?: string | null
          activity_1_due_date?: string | null
          activity_1_email?: string | null
          activity_1_name?: string | null
          activity_1_priority?: string | null
          activity_1_responsible?: string | null
          activity_1_status?: string | null
          analysis_methodology?: string | null
          analysis_notes?: string | null
          approval_person_1_email?: string | null
          approval_person_1_name?: string | null
          approval_person_1_position?: string | null
          approval_person_1_status?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          awareness_person_1_email?: string | null
          awareness_person_1_name?: string | null
          awareness_person_1_position?: string | null
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
          activity_1_description?: string | null
          activity_1_due_date?: string | null
          activity_1_email?: string | null
          activity_1_name?: string | null
          activity_1_priority?: string | null
          activity_1_responsible?: string | null
          activity_1_status?: string | null
          analysis_methodology?: string | null
          analysis_notes?: string | null
          approval_person_1_email?: string | null
          approval_person_1_name?: string | null
          approval_person_1_position?: string | null
          approval_person_1_status?: string | null
          assigned_to?: string | null
          assigned_to_name?: string | null
          awareness_person_1_email?: string | null
          awareness_person_1_name?: string | null
          awareness_person_1_position?: string | null
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
          {
            foreignKeyName: "risk_registrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
        Relationships: []
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
          {
            foreignKeyName: "sso_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_crypto_keys: {
        Row: {
          created_at: string | null
          encryption_version: number
          id: string
          is_active: boolean
          key_derivation_salt: string
          key_purpose: string
          master_key_encrypted: string
          retired_at: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encryption_version?: number
          id?: string
          is_active?: boolean
          key_derivation_salt: string
          key_purpose?: string
          master_key_encrypted: string
          retired_at?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encryption_version?: number
          id?: string
          is_active?: boolean
          key_derivation_salt?: string
          key_purpose?: string
          master_key_encrypted?: string
          retired_at?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_crypto_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_crypto_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_key_cache: {
        Row: {
          access_count: number | null
          decrypted_key_hash: string
          key_purpose: string
          last_accessed: string | null
          tenant_id: string
        }
        Insert: {
          access_count?: number | null
          decrypted_key_hash: string
          key_purpose: string
          last_accessed?: string | null
          tenant_id: string
        }
        Update: {
          access_count?: number | null
          decrypted_key_hash?: string
          key_purpose?: string
          last_accessed?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cache_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cache_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenant_key_history: {
        Row: {
          created_at: string | null
          id: string
          key_derivation_salt: string
          key_purpose: string
          key_version: number
          master_key_encrypted: string
          retired_at: string | null
          rotation_reason: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_derivation_salt: string
          key_purpose: string
          key_version: number
          master_key_encrypted: string
          retired_at?: string | null
          rotation_reason?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_derivation_salt?: string
          key_purpose?: string
          key_version?: number
          master_key_encrypted?: string
          retired_at?: string | null
          rotation_reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_key_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_key_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
      testes_auditoria: {
        Row: {
          codigo: string
          controle_id: string
          created_at: string | null
          created_by: string | null
          criterio_selecao: string | null
          ferramentas_necessarias: string[] | null
          frequencia: string | null
          horas_estimadas: number | null
          id: string
          metadados: Json | null
          metodologia: string | null
          nivel_experiencia: string | null
          objetivo: string
          periodo_execucao: string | null
          procedimento: string
          skills_necessarias: string[] | null
          status: string | null
          tamanho_amostra_minimo: number | null
          tenant_id: string
          tipo_amostra: string | null
          titulo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          codigo: string
          controle_id: string
          created_at?: string | null
          created_by?: string | null
          criterio_selecao?: string | null
          ferramentas_necessarias?: string[] | null
          frequencia?: string | null
          horas_estimadas?: number | null
          id?: string
          metadados?: Json | null
          metodologia?: string | null
          nivel_experiencia?: string | null
          objetivo: string
          periodo_execucao?: string | null
          procedimento: string
          skills_necessarias?: string[] | null
          status?: string | null
          tamanho_amostra_minimo?: number | null
          tenant_id: string
          tipo_amostra?: string | null
          titulo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          codigo?: string
          controle_id?: string
          created_at?: string | null
          created_by?: string | null
          criterio_selecao?: string | null
          ferramentas_necessarias?: string[] | null
          frequencia?: string | null
          horas_estimadas?: number | null
          id?: string
          metadados?: Json | null
          metodologia?: string | null
          nivel_experiencia?: string | null
          objetivo?: string
          periodo_execucao?: string | null
          procedimento?: string
          skills_necessarias?: string[] | null
          status?: string | null
          tamanho_amostra_minimo?: number | null
          tenant_id?: string
          tipo_amostra?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_auditoria_controle_id_fkey"
            columns: ["controle_id"]
            isOneToOne: false
            referencedRelation: "controles_auditoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_auditoria_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "testes_auditoria_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "theme_change_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "theme_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      trabalhos_auditoria: {
        Row: {
          area_auditada: string
          auditor_lider: string
          codigo: string
          created_at: string | null
          created_by: string | null
          data_fim_planejada: string
          data_inicio_planejada: string
          dependencias_externas: string[] | null
          descricao: string
          duracao_dias: number | null
          equipe_auditores: string[] | null
          escopo: string
          frequencia: string | null
          horas_planejadas: number
          id: string
          metadados: Json | null
          nivel_risco: string | null
          objetivos: string[]
          observacoes: string | null
          orcamento_estimado: number | null
          percentual_conclusao: number | null
          plano_anual_id: string | null
          prerequisitos: string[] | null
          prioridade: number | null
          recursos_necessarios: string[] | null
          status: string | null
          tenant_id: string
          tipo_auditoria: string
          titulo: string
          unidade_organizacional: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          area_auditada: string
          auditor_lider: string
          codigo: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada: string
          data_inicio_planejada: string
          dependencias_externas?: string[] | null
          descricao: string
          duracao_dias?: number | null
          equipe_auditores?: string[] | null
          escopo: string
          frequencia?: string | null
          horas_planejadas: number
          id?: string
          metadados?: Json | null
          nivel_risco?: string | null
          objetivos: string[]
          observacoes?: string | null
          orcamento_estimado?: number | null
          percentual_conclusao?: number | null
          plano_anual_id?: string | null
          prerequisitos?: string[] | null
          prioridade?: number | null
          recursos_necessarios?: string[] | null
          status?: string | null
          tenant_id: string
          tipo_auditoria: string
          titulo: string
          unidade_organizacional?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          area_auditada?: string
          auditor_lider?: string
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          data_fim_planejada?: string
          data_inicio_planejada?: string
          dependencias_externas?: string[] | null
          descricao?: string
          duracao_dias?: number | null
          equipe_auditores?: string[] | null
          escopo?: string
          frequencia?: string | null
          horas_planejadas?: number
          id?: string
          metadados?: Json | null
          nivel_risco?: string | null
          objetivos?: string[]
          observacoes?: string | null
          orcamento_estimado?: number | null
          percentual_conclusao?: number | null
          plano_anual_id?: string | null
          prerequisitos?: string[] | null
          prioridade?: number | null
          recursos_necessarios?: string[] | null
          status?: string | null
          tenant_id?: string
          tipo_auditoria?: string
          titulo?: string
          unidade_organizacional?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trabalhos_auditoria_auditor_lider_fkey"
            columns: ["auditor_lider"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabalhos_auditoria_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabalhos_auditoria_plano_anual_id_fkey"
            columns: ["plano_anual_id"]
            isOneToOne: false
            referencedRelation: "planos_auditoria_anuais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabalhos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabalhos_auditoria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "trabalhos_auditoria_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_component_themes: {
        Row: {
          component_config: Json
          component_name: string
          created_at: string | null
          id: string
          theme_id: string
          updated_at: string | null
        }
        Insert: {
          component_config?: Json
          component_name: string
          created_at?: string | null
          id?: string
          theme_id: string
          updated_at?: string | null
        }
        Update: {
          component_config?: Json
          component_name?: string
          created_at?: string | null
          id?: string
          theme_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_component_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "global_ui_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_configurations: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_global: boolean | null
          metadata: Json | null
          name: string
          tenant_id: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          metadata?: Json | null
          name: string
          tenant_id?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          metadata?: Json | null
          name?: string
          tenant_id?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ui_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      ui_theme_cache: {
        Row: {
          compiled_styles: string | null
          created_at: string | null
          css_variables: string
          expires_at: string | null
          hash: string
          id: string
          tenant_id: string | null
          theme_id: string
        }
        Insert: {
          compiled_styles?: string | null
          created_at?: string | null
          css_variables: string
          expires_at?: string | null
          hash: string
          id?: string
          tenant_id?: string | null
          theme_id: string
        }
        Update: {
          compiled_styles?: string | null
          created_at?: string | null
          css_variables?: string
          expires_at?: string | null
          hash?: string
          id?: string
          tenant_id?: string | null
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_theme_cache_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ui_theme_cache_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "ui_theme_cache_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "global_ui_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      universo_auditavel: {
        Row: {
          codigo: string
          created_at: string | null
          created_by: string | null
          criticidade: string | null
          descricao: string | null
          frequencia_auditoria: number | null
          id: string
          metadados: Json | null
          nivel: number
          nome: string
          proxima_auditoria: string | null
          responsavel_id: string | null
          status: string | null
          tenant_id: string
          tipo: string
          ultima_auditoria: string | null
          universo_pai: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          descricao?: string | null
          frequencia_auditoria?: number | null
          id?: string
          metadados?: Json | null
          nivel?: number
          nome: string
          proxima_auditoria?: string | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id: string
          tipo: string
          ultima_auditoria?: string | null
          universo_pai?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          criticidade?: string | null
          descricao?: string | null
          frequencia_auditoria?: number | null
          id?: string
          metadados?: Json | null
          nivel?: number
          nome?: string
          proxima_auditoria?: string | null
          responsavel_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string
          ultima_auditoria?: string | null
          universo_pai?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "universo_auditavel_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universo_auditavel_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universo_auditavel_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universo_auditavel_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "universo_auditavel_universo_pai_fkey"
            columns: ["universo_pai"]
            isOneToOne: false
            referencedRelation: "universo_auditavel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "universo_auditavel_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "vendor_checklist_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
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
          {
            foreignKeyName: "webhook_endpoints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
    }
    Views: {
      user_tenant_access: {
        Row: {
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_crypto_field_mappings: {
        Row: {
          created_at: string | null
          data_classification: string | null
          description: string | null
          encryption_purpose: string | null
          field_name: string | null
          id: string | null
          is_active: boolean | null
          module_name: string | null
          retention_days: number | null
          table_name: string | null
          tenants_using_key: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_tenant_encryption_status: {
        Row: {
          encryption_version: number | null
          is_active: boolean | null
          key_age_days: number | null
          key_created_at: string | null
          key_purpose: string | null
          key_status: string | null
          key_updated_at: string | null
          tenant_id: string | null
          tenant_name: string | null
        }
        Relationships: []
      }
      vw_action_plans_dashboard: {
        Row: {
          media_gut_score: number | null
          media_progresso: number | null
          orcamento_total_planejado: number | null
          orcamento_total_realizado: number | null
          planos_alta_prioridade: number | null
          planos_assessments: number | null
          planos_compliance: number | null
          planos_concluidos: number | null
          planos_criticos: number | null
          planos_em_execucao: number | null
          planos_pendentes: number | null
          planos_privacy: number | null
          planos_risk: number | null
          planos_urgentes: number | null
          planos_vencidos: number | null
          tenant_id: string | null
          total_planos: number | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      vw_action_plans_overview: {
        Row: {
          atividades_concluidas: number | null
          atividades_vencidas: number | null
          categoria_nome: string | null
          codigo: string | null
          cor_categoria: string | null
          created_at: string | null
          data_fim_planejada: string | null
          dias_para_vencimento: number | null
          gut_score: number | null
          id: string | null
          modulo_origem: string | null
          percentual_conclusao: number | null
          prioridade: string | null
          responsavel_email: string | null
          responsavel_nome: string | null
          status: string | null
          tenant_id: string | null
          titulo: string | null
          total_atividades: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_encryption_status"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
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
      calcular_estatisticas_compliance: {
        Args: { tenant_uuid: string }
        Returns: {
          nao_conformidades_criticas: number
          planos_em_execucao: number
          taxa_conformidade: number
          total_avaliacoes: number
          total_frameworks: number
          total_nao_conformidades: number
          total_planos_acao: number
          total_requisitos: number
        }[]
      }
      calcular_risco_nao_conformidade: {
        Args: { nao_conformidade_id_param: string }
        Returns: number
      }
      calcular_score_conformidade_framework: {
        Args: { framework_id_param: string }
        Returns: number
      }
      calculate_assessment_progress: {
        Args: { assessment_id_param: string }
        Returns: number
      }
      calculate_assessment_score: {
        Args: { assessment_uuid: string }
        Returns: {
          maturity_level: number
          maturity_percentage: number
          max_possible_score: number
          total_score: number
        }[]
      }
      calculate_cmmi_average: {
        Args: { assessment_id_param: string }
        Returns: number
      }
      calculate_domain_scores: {
        Args: { p_assessment_id: string; p_tenant_id: string }
        Returns: {
          answered_controls: number
          controls_count: number
          domain_id: string
          domain_name: string
          domain_order: number
          max_score: number
          score_percentage: number
          total_score: number
        }[]
      }
      calculate_next_notification_date: {
        Args: { p_action_plan_id: string; p_frequency: string }
        Returns: string
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
      check_ethics_sla: {
        Args: Record<PropertyKey, never>
        Returns: {
          days_elapsed: number
          days_overdue: number
          is_breach: boolean
          protocol_number: string
          report_id: string
          sla_days: number
          tenant_id: string
        }[]
      }
      cleanup_expired_ai_conversations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_key_cache: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_risk_registration_bypass_rls: {
        Args: { p_created_by: string; p_tenant_id: string }
        Returns: string
      }
      create_risk_registration_simple: {
        Args: { p_created_by: string; p_tenant_id: string }
        Returns: string
      }
      create_tenant_encryption_keys: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      criar_notificacao_objeto: {
        Args: {
          objeto: Record<string, unknown>
          regra: Database["public"]["Tables"]["regras_notificacao_compliance"]["Row"]
        }
        Returns: undefined
      }
      decrypt_field_data: {
        Args: {
          p_encrypted_text: string
          p_field_name: string
          p_table_name: string
          p_tenant_id: string
        }
        Returns: string
      }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string; key_name?: string }
        Returns: string
      }
      decrypt_tenant_data: {
        Args: {
          p_encrypted_text: string
          p_purpose?: string
          p_tenant_id: string
        }
        Returns: string
      }
      derive_tenant_key: {
        Args: {
          p_master_key: string
          p_purpose: string
          p_salt: string
          p_tenant_id: string
        }
        Returns: string
      }
      encrypt_field_data: {
        Args: {
          p_field_name: string
          p_plaintext: string
          p_table_name: string
          p_tenant_id: string
        }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data: string; key_name?: string }
        Returns: string
      }
      encrypt_tenant_data: {
        Args: { p_plaintext: string; p_purpose?: string; p_tenant_id: string }
        Returns: string
      }
      enviar_notificacoes_pendentes: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      force_inherit_global_theme: {
        Args: { tenant_id: string }
        Returns: undefined
      }
      generate_action_plan_code: {
        Args: { p_module: string; p_sequence?: number; p_tenant_id: string }
        Returns: string
      }
      generate_crypto_salt: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ethics_protocol: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      generate_tenant_master_key: {
        Args: Record<PropertyKey, never>
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
      get_current_tenant: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_encryption_purpose: {
        Args: { p_field_name: string; p_table_name: string }
        Returns: string
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
      get_fields_by_purpose: {
        Args: { p_purpose: string }
        Returns: {
          data_classification: string
          description: string
          field_name: string
          module_name: string
          table_name: string
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
      insert_framework_with_controls: {
        Args: {
          p_applicable_regions: string[]
          p_category: string
          p_compliance_domains: string[]
          p_controls: Json
          p_created_by: string
          p_description: string
          p_domains: Json
          p_industry_focus: string[]
          p_name: string
          p_short_name: string
          p_version: string
        }
        Returns: string
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
      processar_evento_notificacao: {
        Args: {
          objeto_id_param: string
          objeto_tipo_param: string
          tenant_id_param: string
          tipo_evento_param: string
        }
        Returns: undefined
      }
      processar_notificacoes_compliance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      processar_template: {
        Args: { objeto: Record<string, unknown>; template: string }
        Returns: string
      }
      rotate_tenant_key: {
        Args: { p_purpose?: string; p_reason?: string; p_tenant_id: string }
        Returns: undefined
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
      setup_default_theme_for_tenant: {
        Args: { tenant_id: string }
        Returns: undefined
      }
      sync_global_theme_to_inheriting_tenants: {
        Args: { theme_id: string }
        Returns: undefined
      }
      sync_theme_state: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      test_dpia_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_action_plan_progress: {
        Args: { p_action_plan_id: string }
        Returns: number
      }
      update_assessment_progress: {
        Args: { assessment_uuid: string }
        Returns: undefined
      }
      update_field_mapping: {
        Args: {
          p_description?: string
          p_field_name: string
          p_new_purpose: string
          p_table_name: string
        }
        Returns: boolean
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
        | "super_admin"
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
        "super_admin",
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
