-- ============================================================================
-- SEED DATA: MÓDULO CONFIGURAÇÕES GERAIS
-- ============================================================================
-- Inserção de dados de exemplo para demonstração das funcionalidades

-- Primeiro, vamos obter o tenant_id padrão (assumindo que existe pelo menos um tenant)
DO $$
DECLARE
    default_tenant_id UUID;
    default_user_id UUID;
    integration_api_id UUID;
    integration_mcp_id UUID;
    integration_email_id UUID;
    integration_sso_id UUID;
    integration_webhook_id UUID;
    integration_backup_id UUID;
BEGIN
    -- Obter tenant padrão
    SELECT id INTO default_tenant_id FROM tenants LIMIT 1;
    
    -- Obter usuário padrão (admin)
    SELECT id INTO default_user_id FROM auth.users LIMIT 1;
    
    -- Se não tiver tenant, criar um para demonstração
    IF default_tenant_id IS NULL THEN
        INSERT INTO tenants (id, name, slug, description)
        VALUES (uuid_generate_v4(), 'Empresa Demo', 'empresa-demo', 'Tenant de demonstração para testes')
        RETURNING id INTO default_tenant_id;
    END IF;

    -- ========================================================================
    -- 1. INTEGRAÇÕES DE API
    -- ========================================================================
    
    -- Slack API Integration
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Slack API', 'api', 'connected', default_tenant_id, NOW() - INTERVAL '5 minutes', 98.5, default_user_id)
    RETURNING id INTO integration_api_id;
    
    INSERT INTO api_connections (
        integration_id, name, api_type, base_url, auth_type,
        bearer_token_encrypted, headers, rate_limit_per_minute,
        total_requests, successful_requests, failed_requests,
        avg_response_time_ms, tenant_id, created_by
    ) VALUES (
        integration_api_id,
        'Slack Notifications',
        'rest',
        'https://hooks.slack.com/services/',
        'bearer',
        encrypt_sensitive_data('xoxb-1234567890-1234567890-abcdef123456'),
        '{"Content-Type": "application/json", "User-Agent": "GRC-System/1.0"}',
        60,
        1250,
        1230,
        20,
        285.5,
        default_tenant_id,
        default_user_id
    );
    
    -- Microsoft Graph API Integration
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Microsoft Graph API', 'api', 'connected', default_tenant_id, NOW() - INTERVAL '2 minutes', 99.2, default_user_id)
    RETURNING id INTO integration_api_id;
    
    INSERT INTO api_connections (
        integration_id, name, api_type, base_url, auth_type,
        oauth2_config, headers, rate_limit_per_minute,
        total_requests, successful_requests, failed_requests,
        avg_response_time_ms, tenant_id, created_by
    ) VALUES (
        integration_api_id,
        'Microsoft Graph',
        'rest',
        'https://graph.microsoft.com/v1.0/',
        'oauth2',
        '{"client_id": "12345678-1234-1234-1234-123456789abc", "scope": "User.Read Mail.Send"}',
        '{"Accept": "application/json", "Content-Type": "application/json"}',
        120,
        890,
        885,
        5,
        420.3,
        default_tenant_id,
        default_user_id
    );

    -- ========================================================================
    -- 2. MODEL CONTEXT PROTOCOL (IA)
    -- ========================================================================
    
    -- Anthropic Claude Integration
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Claude MCP', 'mcp', 'connected', default_tenant_id, NOW() - INTERVAL '1 minute', 99.8, default_user_id)
    RETURNING id INTO integration_mcp_id;
    
    INSERT INTO mcp_providers (
        integration_id, name, provider_type, endpoint, model,
        api_key_encrypted, context_window, temperature, max_tokens,
        context_profiles, tokens_used_today, tokens_limit_per_day,
        total_requests, successful_requests, failed_requests,
        avg_response_time_ms, tenant_id, created_by
    ) VALUES (
        integration_mcp_id,
        'Claude 3.5 Sonnet',
        'claude',
        'https://api.anthropic.com/v1/messages',
        'claude-3-5-sonnet-20240620',
        encrypt_sensitive_data('sk-ant-api03-abcdef123456789'),
        200000,
        0.3,
        4096,
        '[
            {
                "name": "Análise de Riscos",
                "description": "Especializado em ISO 31000, COSO e NIST",
                "system_prompt": "Você é um especialista em gestão de riscos com conhecimento em ISO 31000, COSO ERM e NIST Cybersecurity Framework. Analise riscos de forma estruturada e forneça recomendações práticas."
            },
            {
                "name": "Compliance LGPD",
                "description": "Especializado em LGPD e proteção de dados",
                "system_prompt": "Você é um especialista em LGPD e proteção de dados pessoais. Analise práticas de tratamento de dados e forneça orientações de conformidade baseadas na lei brasileira."
            }
        ]',
        15420,
        50000,
        89,
        87,
        2,
        1850.7,
        default_tenant_id,
        default_user_id
    );
    
    -- OpenAI GPT Integration
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'OpenAI GPT', 'mcp', 'connected', default_tenant_id, NOW() - INTERVAL '3 minutes', 97.3, default_user_id)
    RETURNING id INTO integration_mcp_id;
    
    INSERT INTO mcp_providers (
        integration_id, name, provider_type, endpoint, model,
        api_key_encrypted, organization_id, context_window, temperature, max_tokens,
        tokens_used_today, tokens_limit_per_day,
        total_requests, successful_requests, failed_requests,
        avg_response_time_ms, tenant_id, created_by
    ) VALUES (
        integration_mcp_id,
        'GPT-4 Turbo',
        'openai',
        'https://api.openai.com/v1/chat/completions',
        'gpt-4-turbo-preview',
        encrypt_sensitive_data('sk-proj-abcdef123456789'),
        'org-123456789abcdef',
        128000,
        0.7,
        2048,
        8750,
        25000,
        45,
        43,
        2,
        2100.5,
        default_tenant_id,
        default_user_id
    );

    -- ========================================================================
    -- 3. PROVEDORES DE EMAIL
    -- ========================================================================
    
    -- SendGrid Integration
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Serviço de E-mail', 'email', 'connected', default_tenant_id, NOW() - INTERVAL '10 minutes', 99.5, default_user_id)
    RETURNING id INTO integration_email_id;
    
    INSERT INTO email_providers (
        integration_id, name, provider_type, api_key_encrypted,
        from_email, from_name, reply_to,
        templates, rate_limit_per_hour,
        emails_sent_today, emails_delivered, emails_bounced,
        emails_opened, emails_clicked, tenant_id, created_by
    ) VALUES (
        integration_email_id,
        'SendGrid Production',
        'sendgrid',
        encrypt_sensitive_data('SG.abcdef123456789.xyz987654321'),
        'noreply@empresademo.com',
        'Sistema GRC',
        'suporte@empresademo.com',
        '[
            {
                "id": "risk-notification",
                "name": "Notificação de Risco",
                "subject": "Novo Risco Identificado: {{risk_title}}",
                "body": "Um novo risco foi identificado no sistema: {{risk_title}}\nSeveridade: {{severity}}\nData: {{created_date}}\n\nAcesse o sistema para mais detalhes."
            },
            {
                "id": "assessment-completed",
                "name": "Assessment Concluído",
                "subject": "Assessment {{assessment_name}} foi concluído",
                "body": "O assessment {{assessment_name}} foi concluído com sucesso.\nResultado: {{score}}%\nData de conclusão: {{completion_date}}"
            }
        ]',
        5000,
        234,
        229,
        3,
        125,
        43,
        default_tenant_id,
        default_user_id
    );
    
    -- SMTP Integration
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'SMTP Corporativo', 'email', 'disconnected', default_tenant_id, NOW() - INTERVAL '2 hours', 85.2, default_user_id)
    RETURNING id INTO integration_email_id;
    
    INSERT INTO email_providers (
        integration_id, name, provider_type,
        smtp_host, smtp_port, smtp_secure,
        smtp_username_encrypted, smtp_password_encrypted,
        from_email, from_name,
        rate_limit_per_hour, tenant_id, created_by
    ) VALUES (
        integration_email_id,
        'SMTP Office 365',
        'smtp',
        'smtp.office365.com',
        587,
        true,
        encrypt_sensitive_data('sistema@empresademo.com'),
        encrypt_sensitive_data('senha123!'),
        'sistema@empresademo.com',
        'Sistema GRC Corporativo',
        1000,
        default_tenant_id,
        default_user_id
    );

    -- ========================================================================
    -- 4. SSO PROVIDERS
    -- ========================================================================
    
    -- Azure AD SSO
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Azure AD SSO', 'sso', 'pending', default_tenant_id, NULL, 0, default_user_id)
    RETURNING id INTO integration_sso_id;
    
    INSERT INTO sso_providers (
        integration_id, name, provider_type,
        authorization_url, token_url, userinfo_url,
        client_id_encrypted, client_secret_encrypted, tenant_id_provider,
        scopes, attribute_mapping, auto_provisioning,
        default_roles, require_2fa, session_timeout_minutes,
        tenant_id, created_by
    ) VALUES (
        integration_sso_id,
        'Azure Active Directory',
        'azure-ad',
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        'https://graph.microsoft.com/v1.0/me',
        encrypt_sensitive_data('12345678-1234-1234-1234-123456789abc'),
        encrypt_sensitive_data('client-secret-here'),
        'abcdef12-3456-7890-abcd-ef1234567890',
        '["openid", "profile", "email", "User.Read"]',
        '{"email": "mail", "name": "displayName", "department": "department"}',
        true,
        '["user"]',
        true,
        480,
        default_tenant_id,
        default_user_id
    );
    
    -- Google Workspace SSO
    INSERT INTO integrations (id, name, type, status, tenant_id, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Google SSO', 'sso', 'disconnected', default_tenant_id, 0, default_user_id)
    RETURNING id INTO integration_sso_id;
    
    INSERT INTO sso_providers (
        integration_id, name, provider_type,
        authorization_url, token_url, userinfo_url,
        client_id_encrypted, client_secret_encrypted,
        scopes, attribute_mapping, auto_provisioning,
        session_timeout_minutes, tenant_id, created_by
    ) VALUES (
        integration_sso_id,
        'Google Workspace',
        'google',
        'https://accounts.google.com/oauth/authorize',
        'https://oauth2.googleapis.com/token',
        'https://www.googleapis.com/oauth2/v2/userinfo',
        encrypt_sensitive_data('123456789-abcdef.apps.googleusercontent.com'),
        encrypt_sensitive_data('google-client-secret'),
        '["openid", "email", "profile"]',
        '{"email": "email", "name": "name", "picture": "picture"}',
        false,
        720,
        default_tenant_id,
        default_user_id
    );

    -- ========================================================================
    -- 5. WEBHOOKS
    -- ========================================================================
    
    -- Slack Webhook
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Slack Webhook', 'webhook', 'connected', default_tenant_id, NOW() - INTERVAL '30 seconds', 99.1, default_user_id)
    RETURNING id INTO integration_webhook_id;
    
    INSERT INTO webhook_endpoints (
        integration_id, name, url, method, events,
        hmac_secret_encrypted, custom_headers,
        retry_attempts, retry_delay_seconds, timeout_seconds,
        is_active, deliveries_today, successful_deliveries,
        failed_deliveries, last_delivery_at, last_success_at,
        avg_response_time_ms, tenant_id, created_by
    ) VALUES (
        integration_webhook_id,
        'Slack Risk Notifications',
        'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        'POST',
        '["risk.created", "risk.updated", "incident.created", "assessment.completed"]',
        encrypt_sensitive_data('webhook-secret-key-123'),
        '{"Content-Type": "application/json", "X-Source": "GRC-System"}',
        3,
        5,
        30,
        true,
        15,
        14,
        1,
        NOW() - INTERVAL '30 seconds',
        NOW() - INTERVAL '30 seconds',
        145.8,
        default_tenant_id,
        default_user_id
    );
    
    -- Microsoft Teams Webhook
    INSERT INTO integrations (id, name, type, status, tenant_id, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Teams Webhook', 'webhook', 'error', default_tenant_id, 75.5, default_user_id)
    RETURNING id INTO integration_webhook_id;
    
    INSERT INTO webhook_endpoints (
        integration_id, name, url, method, events,
        retry_attempts, timeout_seconds, is_active,
        deliveries_today, successful_deliveries, failed_deliveries,
        last_failure_at, last_failure_reason,
        tenant_id, created_by
    ) VALUES (
        integration_webhook_id,
        'Teams Security Alerts',
        'https://outlook.office.com/webhook/abcdef-1234-5678-9012-abcdef123456',
        'POST',
        '["security_incident.created", "compliance.violation"]',
        5,
        45,
        true,
        8,
        3,
        5,
        NOW() - INTERVAL '1 hour',
        'Connection timeout after 45 seconds',
        default_tenant_id,
        default_user_id
    );

    -- ========================================================================
    -- 6. CONFIGURAÇÕES DE BACKUP
    -- ========================================================================
    
    -- AWS S3 Backup
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'AWS S3 Backup', 'backup', 'connected', default_tenant_id, NOW() - INTERVAL '6 hours', 99.9, default_user_id)
    RETURNING id INTO integration_backup_id;
    
    INSERT INTO backup_configurations (
        integration_id, name, backup_type,
        s3_bucket, s3_region, s3_access_key_encrypted, s3_secret_key_encrypted, s3_prefix,
        schedule_type, schedule_time, include_database, include_uploads,
        include_logs, include_configurations, include_reports,
        compression_enabled, encryption_enabled, retention_days, max_backups,
        last_backup_at, last_success_at, total_backups, successful_backups,
        backup_size_bytes, tenant_id, created_by
    ) VALUES (
        integration_backup_id,
        'Backup Produção S3',
        'aws-s3',
        'grc-backups-prod',
        'us-east-1',
        encrypt_sensitive_data('AKIA1234567890ABCDEF'),
        encrypt_sensitive_data('abcdef1234567890/ABCDEF1234567890abcdef'),
        'backups/grc-system/',
        'daily',
        '03:00',
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        30,
        10,
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '6 hours',
        45,
        43,
        1572864000, -- 1.5GB
        default_tenant_id,
        default_user_id
    );
    
    -- Google Drive Backup
    INSERT INTO integrations (id, name, type, status, tenant_id, last_sync, uptime_percentage, created_by)
    VALUES (uuid_generate_v4(), 'Google Drive Backup', 'backup', 'pending', default_tenant_id, NULL, 0, default_user_id)
    RETURNING id INTO integration_backup_id;
    
    INSERT INTO backup_configurations (
        integration_id, name, backup_type,
        gdrive_folder_id, gdrive_service_account_encrypted,
        schedule_type, include_database, include_uploads,
        compression_enabled, encryption_enabled, retention_days,
        is_active, tenant_id, created_by
    ) VALUES (
        integration_backup_id,
        'Backup Desenvolvimento GDrive',
        'google-drive',
        '1BxYz2CdEfGhIjKlMnOpQrStUvWxYz3Ab',
        encrypt_sensitive_data('{"type": "service_account", "project_id": "grc-backups", "private_key_id": "abcdef123456"}'),
        'weekly',
        true,
        false,
        true,
        false,
        7,
        false,
        default_tenant_id,
        default_user_id
    );

    -- ========================================================================
    -- 7. LOGS DE EXEMPLO
    -- ========================================================================
    
    -- Logs de API
    INSERT INTO integration_logs (integration_id, log_type, level, message, details, response_status, response_time_ms, tenant_id)
    SELECT 
        i.id,
        'request',
        'info',
        'API request successful',
        '{"endpoint": "/api/notifications", "method": "POST", "payload_size": 245}',
        200,
        285,
        default_tenant_id
    FROM integrations i WHERE i.name = 'Slack API';
    
    INSERT INTO integration_logs (integration_id, log_type, level, message, details, response_status, response_time_ms, tenant_id)
    SELECT 
        i.id,
        'error',
        'error',
        'Rate limit exceeded',
        '{"error_code": "rate_limit", "reset_time": "2025-08-15T12:00:00Z"}',
        429,
        150,
        default_tenant_id
    FROM integrations i WHERE i.name = 'Microsoft Graph API';
    
    -- Logs de MCP
    INSERT INTO integration_logs (integration_id, log_type, level, message, details, response_time_ms, tenant_id)
    SELECT 
        i.id,
        'request',
        'info',
        'AI request completed successfully',
        '{"tokens_used": 150, "model": "claude-3-5-sonnet", "context_profile": "Análise de Riscos"}',
        1850,
        default_tenant_id
    FROM integrations i WHERE i.name = 'Claude MCP';
    
    -- Logs de Webhook
    INSERT INTO integration_logs (integration_id, log_type, level, message, details, response_status, response_time_ms, tenant_id)
    SELECT 
        i.id,
        'webhook',
        'info',
        'Webhook delivered successfully',
        '{"event": "risk.created", "payload_size": 512, "delivery_attempt": 1}',
        200,
        145,
        default_tenant_id
    FROM integrations i WHERE i.name = 'Slack Webhook';
    
    INSERT INTO integration_logs (integration_id, log_type, level, message, details, response_status, response_time_ms, tenant_id)
    SELECT 
        i.id,
        'webhook',
        'error',
        'Webhook delivery failed',
        '{"event": "security_incident.created", "error": "Connection timeout", "delivery_attempt": 3}',
        0,
        45000,
        default_tenant_id
    FROM integrations i WHERE i.name = 'Teams Webhook';
    
    -- Logs de Backup
    INSERT INTO integration_logs (integration_id, log_type, level, message, details, tenant_id)
    SELECT 
        i.id,
        'backup',
        'info',
        'Backup completed successfully',
        '{"backup_size": "1.5GB", "duration": "15 minutes", "files_backed_up": 25847}',
        default_tenant_id
    FROM integrations i WHERE i.name = 'AWS S3 Backup';

    -- Log da operação de seed
    INSERT INTO activity_logs (id, user_id, action, resource_type, resource_id, details, created_at)
    VALUES (
        uuid_generate_v4(),
        default_user_id,
        'SEED',
        'GENERAL_SETTINGS',
        'sample_data',
        '{"message": "Inserted sample data for General Settings module", "integrations_created": 12, "logs_created": 8}',
        NOW()
    );
    
    RAISE NOTICE 'Sample data inserted successfully for General Settings module';
    
END $$;