const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres'
});

async function main() {
    await client.connect();

    const query = `
    -- Alter sistemas table to add missing Asset and Application columns
    ALTER TABLE public.sistemas
    ADD COLUMN IF NOT EXISTS mac_address VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hostname VARCHAR(255),
    ADD COLUMN IF NOT EXISTS domain VARCHAR(255),
    ADD COLUMN IF NOT EXISTS network_zone VARCHAR(100),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS building VARCHAR(255),
    ADD COLUMN IF NOT EXISTS floor VARCHAR(100),
    ADD COLUMN IF NOT EXISTS room VARCHAR(100),
    ADD COLUMN IF NOT EXISTS rack VARCHAR(100),
    ADD COLUMN IF NOT EXISTS os VARCHAR(100),
    ADD COLUMN IF NOT EXISTS os_version VARCHAR(100),
    ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255),
    ADD COLUMN IF NOT EXISTS model VARCHAR(255),
    ADD COLUMN IF NOT EXISTS serial_number VARCHAR(255),
    ADD COLUMN IF NOT EXISTS asset_tag VARCHAR(100),
    ADD COLUMN IF NOT EXISTS department VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cost_center VARCHAR(100),
    ADD COLUMN IF NOT EXISTS business_unit VARCHAR(255),
    ADD COLUMN IF NOT EXISTS technical_contact VARCHAR(255),
    ADD COLUMN IF NOT EXISTS purchase_date DATE,
    ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
    ADD COLUMN IF NOT EXISTS security_classification VARCHAR(100),
    ADD COLUMN IF NOT EXISTS encryption_required BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS backup_required BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS monitoring_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS ambiente VARCHAR(100),
    ADD COLUMN IF NOT EXISTS classificacao_dados VARCHAR(100);

    -- Alter vulnerabilities table to add remediation_effort
    ALTER TABLE public.vulnerabilities
    ADD COLUMN IF NOT EXISTS remediation_effort VARCHAR(100) DEFAULT 'Medium';

    -- Trigger schema reload for postgrest
    NOTIFY pgrst, 'reload schema';
  `;

    try {
        console.log("Applying schema changes...");
        await client.query(query);
        console.log("Successfully added missing columns to 'sistemas' and 'vulnerabilities'.");
    } catch (error) {
        console.error("Error applying migration:", error);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
