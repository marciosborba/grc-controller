-- ============================================================================
-- MIGRATION: Adicionar módulos de portais ao sistema de módulos por tenant
-- ============================================================================
-- Insere Risk Portal, Vendor Portal e Vulnerability Portal na tabela de módulos
-- para que possam ser habilitados/desabilitados por tenant via aba Módulos.

INSERT INTO modules (key, name, description, category, is_active)
VALUES
  (
    'risk_portal',
    'Portal de Riscos',
    'Portal para partes interessadas acompanharem riscos atribuídos e responderem comunicações',
    'portals',
    true
  ),
  (
    'vendor_portal',
    'Portal do Fornecedor',
    'Portal externo para fornecedores responderem avaliações de risco (TPRM) e atualizarem cadastros',
    'portals',
    true
  ),
  (
    'vulnerability_portal',
    'Portal de Vulnerabilidades',
    'Portal para equipes externas e partes interessadas acompanharem vulnerabilidades atribuídas',
    'portals',
    true
  )
ON CONFLICT (key) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  category    = EXCLUDED.category,
  is_active   = EXCLUDED.is_active,
  updated_at  = NOW();
