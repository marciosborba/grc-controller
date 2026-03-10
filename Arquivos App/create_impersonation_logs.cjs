const { Client } = require('pg');

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

const sql = `
-- Tabela de auditoria para impersonação de usuários pelo Super Admin
CREATE TABLE IF NOT EXISTS impersonation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  admin_email TEXT,
  target_user_id UUID NOT NULL,
  target_email TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

COMMENT ON TABLE impersonation_logs IS 'Auditoria de impersonação de usuários por Super Admins globais';

-- Habilitar RLS
ALTER TABLE impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Apenas platform_admins podem ver e inserir logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'impersonation_logs' AND policyname = 'platform_admins_access_impersonation_logs'
  ) THEN
    CREATE POLICY "platform_admins_access_impersonation_logs" ON impersonation_logs
      FOR ALL TO public
      USING (
        EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
      );
  END IF;
END
$$;
`;

client.connect()
    .then(() => client.query(sql))
    .then(() => {
        console.log('✅ Tabela impersonation_logs criada com sucesso!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Erro ao criar tabela:', err.message);
        client.end();
    });
