-- Tabela para templates de checklist editáveis por tenant
CREATE TABLE IF NOT EXISTS vendor_checklist_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    required BOOLEAN DEFAULT false,
    category TEXT NOT NULL DEFAULT 'operational',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para respostas do checklist por vendor
CREATE TABLE IF NOT EXISTS vendor_checklist_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendor_registry(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES vendor_checklist_templates(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('compliant', 'non_compliant', 'compliant_with_reservation')),
    justification TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    responded_by UUID REFERENCES auth.users(id),
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, item_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vendor_checklist_templates_tenant_id ON vendor_checklist_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendor_checklist_templates_order ON vendor_checklist_templates(tenant_id, order_index);
CREATE INDEX IF NOT EXISTS idx_vendor_checklist_responses_vendor_id ON vendor_checklist_responses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_checklist_responses_item_id ON vendor_checklist_responses(item_id);

-- RLS (Row Level Security) policies
ALTER TABLE vendor_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_checklist_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para vendor_checklist_templates
CREATE POLICY "Users can view checklist templates from their tenant" ON vendor_checklist_templates
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM user_tenant_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert checklist templates for their tenant" ON vendor_checklist_templates
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM user_tenant_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update checklist templates from their tenant" ON vendor_checklist_templates
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM user_tenant_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete checklist templates from their tenant" ON vendor_checklist_templates
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM user_tenant_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas para vendor_checklist_responses
CREATE POLICY "Users can view checklist responses from their tenant" ON vendor_checklist_responses
    FOR SELECT USING (
        vendor_id IN (
            SELECT id FROM vendor_registry 
            WHERE tenant_id IN (
                SELECT tenant_id FROM user_tenant_roles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert checklist responses for their tenant" ON vendor_checklist_responses
    FOR INSERT WITH CHECK (
        vendor_id IN (
            SELECT id FROM vendor_registry 
            WHERE tenant_id IN (
                SELECT tenant_id FROM user_tenant_roles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update checklist responses from their tenant" ON vendor_checklist_responses
    FOR UPDATE USING (
        vendor_id IN (
            SELECT id FROM vendor_registry 
            WHERE tenant_id IN (
                SELECT tenant_id FROM user_tenant_roles 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete checklist responses from their tenant" ON vendor_checklist_responses
    FOR DELETE USING (
        vendor_id IN (
            SELECT id FROM vendor_registry 
            WHERE tenant_id IN (
                SELECT tenant_id FROM user_tenant_roles 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_checklist_templates_updated_at 
    BEFORE UPDATE ON vendor_checklist_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_checklist_responses_updated_at 
    BEFORE UPDATE ON vendor_checklist_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE vendor_checklist_templates IS 'Templates de checklist editáveis por tenant para due diligence de fornecedores';
COMMENT ON TABLE vendor_checklist_responses IS 'Respostas do checklist de due diligence por fornecedor';

COMMENT ON COLUMN vendor_checklist_templates.title IS 'Título da questão do checklist';
COMMENT ON COLUMN vendor_checklist_templates.description IS 'Descrição detalhada da questão';
COMMENT ON COLUMN vendor_checklist_templates.required IS 'Se a questão é obrigatória para completar o due diligence';
COMMENT ON COLUMN vendor_checklist_templates.category IS 'Categoria da questão (legal, security, operational, etc.)';
COMMENT ON COLUMN vendor_checklist_templates.order_index IS 'Ordem de exibição da questão';
COMMENT ON COLUMN vendor_checklist_templates.is_default IS 'Se é uma questão padrão do sistema';

COMMENT ON COLUMN vendor_checklist_responses.status IS 'Status da resposta: compliant, non_compliant, compliant_with_reservation';
COMMENT ON COLUMN vendor_checklist_responses.justification IS 'Justificativa para a resposta';
COMMENT ON COLUMN vendor_checklist_responses.attachments IS 'Array JSON com URLs ou IDs de anexos';