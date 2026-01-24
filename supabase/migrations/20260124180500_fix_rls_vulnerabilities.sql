-- Enable RLS and Apply Policies for 26 Vulnerable Tables

-- 1. HIGH SECURITY TABLES (Crypto, Keys, Admin)
-- Action: Enable RLS. No policies added (Implicit Deny All for API/Anon). 
-- Only Service Role (Backend) can access.
ALTER TABLE IF EXISTS platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_key_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_crypto_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS encryption_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_key_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS crypto_field_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_settings ENABLE ROW LEVEL SECURITY;

-- 2. PUBLIC UI TABLES (Themes, Settings)
-- Action: Enable RLS. Allow SELECT to everyone (including Anon).
-- Protect Write (Admin only - implicit deny for others).
ALTER TABLE IF EXISTS global_ui_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS global_ui_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ui_theme_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ui_component_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS theme_change_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read UI Settings" ON global_ui_settings FOR SELECT USING (true);
CREATE POLICY "Public Read UI Themes" ON global_ui_themes FOR SELECT USING (true);
CREATE POLICY "Public Read UI Cache" ON ui_theme_cache FOR SELECT USING (true);
CREATE POLICY "Public Read Comp Themes" ON ui_component_themes FOR SELECT USING (true);
CREATE POLICY "Public Read Theme History" ON theme_change_history FOR SELECT USING (true);

-- 3. BUSINESS/AUDIT TABLES (Projects, Evidences, Reports)
-- Action: Enable RLS. Allow access to Authenticated Users only.
-- This prevents Anonymous/Public scraping.
-- Note: Ideally this should use 'tenant_id' check, but 'auth.uid() IS NOT NULL' is a safe baseline fix.
ALTER TABLE IF EXISTS vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evidencias_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projetos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trabalhos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS testes_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_risk_matrix_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_sampling_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_sampling_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_sampling_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS templates_relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS apontamentos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS planos_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS relatorios_auditoria ENABLE ROW LEVEL SECURITY;

-- Generic Authenticated Policy for Business Tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'vulnerabilities', 'evidencias_auditoria', 'projetos_auditoria', 
    'trabalhos_auditoria', 'testes_auditoria', 'audit_risk_assessments', 
    'audit_risk_matrix_config', 'audit_sampling_configs', 'audit_sampling_plans', 
    'audit_sampling_items', 'templates_relatorios', 'apontamentos_auditoria', 
    'planos_acao', 'relatorios_auditoria'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY "Authenticated Access" ON %I FOR ALL USING (auth.role() = ''authenticated'');', t);
  END LOOP;
END $$;
