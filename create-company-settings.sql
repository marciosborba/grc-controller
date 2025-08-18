-- Criar tabela company_settings para armazenar configurações da empresa
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  cnpj VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  pdf_primary_color VARCHAR(7) DEFAULT '#2962FF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_company_settings_tenant_id ON company_settings(tenant_id);

-- Comentários para documentação
COMMENT ON TABLE company_settings IS 'Configurações específicas da empresa/tenant incluindo dados para PDF';
COMMENT ON COLUMN company_settings.pdf_primary_color IS 'Cor primária para PDFs em formato hexadecimal (ex: #2962FF)';
COMMENT ON COLUMN company_settings.tenant_id IS 'Referência única para o tenant - cada tenant pode ter apenas uma configuração';

-- Inserir configurações padrão para tenants existentes
INSERT INTO company_settings (tenant_id, company_name, pdf_primary_color, email, phone, address, city, state, zip_code)
SELECT 
  t.id,
  t.name,
  '#2962FF',
  COALESCE(t.contact_email, 'contato@empresa.com.br'),
  '(11) 1234-5678',
  'Endereço não configurado',
  'São Paulo',
  'SP',
  '01000-000'
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM company_settings cs WHERE cs.tenant_id = t.id
);