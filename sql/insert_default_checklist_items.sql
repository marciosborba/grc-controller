-- Script para inserir os itens padrão do checklist de due diligence
-- Este script deve ser executado após a criação das tabelas

-- Função para inserir itens padrão para todos os tenants existentes
CREATE OR REPLACE FUNCTION insert_default_checklist_for_all_tenants()
RETURNS void AS $$
DECLARE
    tenant_record RECORD;
BEGIN
    -- Para cada tenant existente, inserir os itens padrão
    FOR tenant_record IN SELECT id FROM tenants LOOP
        -- Verificar se já existem itens para este tenant
        IF NOT EXISTS (
            SELECT 1 FROM vendor_checklist_templates 
            WHERE tenant_id = tenant_record.id AND is_default = true
        ) THEN
            -- Inserir os 5 itens padrão especificados
            INSERT INTO vendor_checklist_templates (
                tenant_id, title, description, required, category, order_index, is_default, created_by
            ) VALUES
            (
                tenant_record.id,
                'Registro Empresarial Válido (CNPJ)',
                'CNPJ ativo na Receita Federal com situação cadastral regular',
                true,
                'legal',
                1,
                true,
                NULL -- Sistema criado
            ),
            (
                tenant_record.id,
                'Cláusula Contratual de Privacidade',
                'Cláusulas específicas sobre proteção de dados e privacidade conforme LGPD',
                true,
                'legal',
                2,
                true,
                NULL
            ),
            (
                tenant_record.id,
                'Cláusulas Contratuais de Segurança da Informação',
                'Disposições contratuais sobre segurança da informação e proteção de dados',
                true,
                'security',
                3,
                true,
                NULL
            ),
            (
                tenant_record.id,
                'Cláusula Contratual de NDA',
                'Acordo de confidencialidade (Non-Disclosure Agreement) assinado',
                true,
                'legal',
                4,
                true,
                NULL
            ),
            (
                tenant_record.id,
                'Cláusula Contratual de SLA',
                'Service Level Agreement com métricas e penalidades definidas',
                true,
                'operational',
                5,
                true,
                NULL
            );
            
            RAISE NOTICE 'Itens padrão inseridos para tenant: %', tenant_record.id;
        ELSE
            RAISE NOTICE 'Tenant % já possui itens padrão', tenant_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a função para inserir os itens padrão
SELECT insert_default_checklist_for_all_tenants();

-- Remover a função após o uso
DROP FUNCTION insert_default_checklist_for_all_tenants();

-- Trigger para inserir itens padrão automaticamente quando um novo tenant for criado
CREATE OR REPLACE FUNCTION create_default_checklist_for_new_tenant()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir os 5 itens padrão para o novo tenant
    INSERT INTO vendor_checklist_templates (
        tenant_id, title, description, required, category, order_index, is_default, created_by
    ) VALUES
    (
        NEW.id,
        'Registro Empresarial Válido (CNPJ)',
        'CNPJ ativo na Receita Federal com situação cadastral regular',
        true,
        'legal',
        1,
        true,
        NULL
    ),
    (
        NEW.id,
        'Cláusula Contratual de Privacidade',
        'Cláusulas específicas sobre proteção de dados e privacidade conforme LGPD',
        true,
        'legal',
        2,
        true,
        NULL
    ),
    (
        NEW.id,
        'Cláusulas Contratuais de Segurança da Informação',
        'Disposições contratuais sobre segurança da informação e proteção de dados',
        true,
        'security',
        3,
        true,
        NULL
    ),
    (
        NEW.id,
        'Cláusula Contratual de NDA',
        'Acordo de confidencialidade (Non-Disclosure Agreement) assinado',
        true,
        'legal',
        4,
        true,
        NULL
    ),
    (
        NEW.id,
        'Cláusula Contratual de SLA',
        'Service Level Agreement com métricas e penalidades definidas',
        true,
        'operational',
        5,
        true,
        NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger para novos tenants
CREATE TRIGGER create_default_checklist_on_tenant_creation
    AFTER INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION create_default_checklist_for_new_tenant();

COMMENT ON FUNCTION create_default_checklist_for_new_tenant() IS 'Cria automaticamente os itens padrão do checklist quando um novo tenant é criado';