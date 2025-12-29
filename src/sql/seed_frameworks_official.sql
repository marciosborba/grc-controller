-- Function to safe insert framework and return ID
CREATE OR REPLACE FUNCTION get_or_create_framework(
    p_tenant_id UUID,
    p_nome TEXT,
    p_codigo TEXT,
    p_tipo TEXT,
    p_descricao TEXT
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM frameworks_compliance 
    WHERE tenant_id = p_tenant_id AND (nome = p_nome OR codigo = p_codigo);
    
    IF v_id IS NULL THEN
        INSERT INTO frameworks_compliance (tenant_id, nome, codigo, tipo, descricao, status)
        VALUES (p_tenant_id, p_nome, p_codigo, p_tipo, p_descricao, 'ativo')
        RETURNING id INTO v_id;
    ELSE
        -- Update details if exists to ensure consistency
        UPDATE frameworks_compliance 
        SET nome = p_nome, codigo = p_codigo, tipo = p_tipo, descricao = p_descricao, status = 'ativo'
        WHERE id = v_id;
    END IF;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    v_tenant_id UUID := '46b1c048-85a1-423b-96fc-776007c8de1f'; -- GRC-Controller
    v_iso_id UUID;
    v_lgpd_id UUID;
    v_nist_id UUID;
    v_cat_id UUID;
    v_func_id UUID;
    v_default_criteria TEXT := 'Implementação deve estar documentada e evidenciada conforme política interna.';
BEGIN
    -- 1. ISO 27001:2022
    v_iso_id := get_or_create_framework(v_tenant_id, 'ISO/IEC 27001:2022', 'ISO27001', 'normativo', 'Padrão internacional para gestão de segurança da informação (Versão 2022).');
    
    DELETE FROM requisitos_compliance WHERE framework_id = v_iso_id;

    -- CATEGORY 5: Organizational
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_iso_id, v_tenant_id, 'A.5', 'Controles Organizacionais', 'Controles relacionados à estrutura e gestão da segurança.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_cat_id;
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade) VALUES
        (v_iso_id, v_tenant_id, 'A.5.1', 'Políticas de segurança da informação', 'As políticas de segurança da informação devem ser definidas e aprovadas.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.5.2', 'Papéis e responsabilidades', 'Os papéis e responsabilidades de segurança devem ser definidos.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.5.3', 'Segregação de funções', 'Deveres conflitantes devem ser segregados.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.5.4', 'Responsabilidades da direção', 'A direção deve exigir conformidade com a segurança.', v_cat_id, 2, v_default_criteria);
        -- (More ISO controls would go here, summarized for brevity in this update but implicit from previous full insert if we kept it. 
        --  NOTE: I am re-inserting the full ISO lists to be safe as I am rewriting the file. I will paste the FULL list from before).
        
    -- [Re-pasting FULL ISO content from previous step to ensure no data loss]
    -- ... Actually, to save context tokens, I will assume the previous ISO content is correct and just focus on NIST for this specific file update if possible?
    -- No, I must provide the full file content for `write_to_file`.
    -- I will construct the FULL file content with ISO, LGPD, and NIST.
    
    -- ISO 27001 (Full)
     -- CATEGORY 5
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_iso_id, v_tenant_id, 'A.5.5', 'Contato com autoridades', 'Contato com autoridades deve ser mantido.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.6', 'Contato com grupos especiais', 'Contato com grupos de interesse deve ser mantido.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.7', 'Inteligência de ameaças', 'Inteligência de ameaças deve ser coletada.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.8', 'Segurança em projetos', 'Segurança deve ser integrada em projetos.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.9', 'Inventário de ativos', 'Inventário de ativos deve ser mantido.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.10', 'Uso aceitável', 'Regras de uso aceitável devem ser definidas.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.11', 'Devolução de ativos', 'Ativos devem ser devolvidos após término.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.12', 'Classificação da informação', 'Informação deve ser classificada.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.13', 'Rotulagem da informação', 'Procedimentos de rotulagem devem ser implementados.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.14', 'Transferência de informação', 'Regras de transferência devem ser estabelecidas.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.15', 'Controle de acesso', 'Regras de controle de acesso devem ser estabelecidas.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.16', 'Gestão de identidade', 'Identidades devem ser gerenciadas.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.17', 'Informações de autenticação', 'Informações de autenticação devem ser controladas.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.18', 'Direitos de acesso', 'Direitos de acesso devem ser revisados.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.19', 'Segurança com fornecedores', 'Segurança com fornecedores deve ser gerenciada.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.20', 'Acordos com fornecedores', 'Requisitos de segurança devem constar em acordos.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.21', 'Cadeia de suprimentos de TIC', 'Riscos da cadeia de suprimentos devem ser gerenciados.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.22', 'Monitoramento de fornecedores', 'Serviços de fornecedores devem ser monitorados.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.23', 'Serviços em nuvem', 'Segurança em nuvem deve ser gerenciada.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.24', 'Planejamento de incidentes', 'Planejamento para incidentes deve ser realizado.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.25', 'Avaliação de eventos', 'Eventos de segurança devem ser avaliados.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.26', 'Resposta a incidentes', 'Incidentes devem ser respondidos.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.27', 'Aprendizado com incidentes', 'Lições aprendidas devem ser utilizadas.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.28', 'Coleta de evidências', 'Evidências devem ser coletadas.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.29', 'Segurança na interrupção', 'Segurança deve ser mantida durante interrupções.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.30', 'Prontidão de TIC', 'Prontidão de TIC deve ser assegurada.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.31', 'Requisitos legais', 'Requisitos legais devem ser identificados.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.32', 'Propriedade intelectual', 'Propriedade intelectual deve ser protegida.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.33', 'Proteção de registros', 'Registros devem ser protegidos.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.34', 'Privacidade', 'Requisitos de privacidade devem ser atendidos.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.35', 'Revisão independente', 'Segurança deve ser revisada independentemente.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.36', 'Conformidade com políticas', 'Conformidade deve ser revisada.', v_cat_id, 2, v_default_criteria),
           (v_iso_id, v_tenant_id, 'A.5.37', 'Procedimentos operacionais', 'Procedimentos devem ser documentados.', v_cat_id, 2, v_default_criteria);

    -- CATEGORY 6
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_iso_id, v_tenant_id, 'A.6', 'Controles de Pessoas', 'Controles de pessoas.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_cat_id;
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade) VALUES
        (v_iso_id, v_tenant_id, 'A.6.1', 'Triagem', 'Triagem deve ser realizada.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.6.2', 'Termos de emprego', 'Termos devem incluir segurança.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.6.3', 'Conscientização', 'Conscientização deve ser provida.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.6.4', 'Processo disciplinar', 'Processo disciplinar deve existir.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.6.5', 'Rescisão', 'Responsabilidades na rescisão devem ser definidas.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.6.6', 'Acordos de confidencialidade', 'Acordos devem ser assinados.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.6.7', 'Trabalho remoto', 'Trabalho remoto deve ser protegido.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.6.8', 'Reporte de eventos', 'Eventos devem ser reportados.', v_cat_id, 2, v_default_criteria);

     -- CATEGORY 7
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_iso_id, v_tenant_id, 'A.7', 'Controles Físicos', 'Controles físicos.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_cat_id;
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade) VALUES
        (v_iso_id, v_tenant_id, 'A.7.1', 'Perímetros físicos', 'Perímetros devem ser definidos.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.2', 'Entrada física', 'Entrada deve ser controlada.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.3', 'Segurança de escritórios', 'Escritórios devem ser seguros.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.4', 'Monitoramento físico', 'Monitoramento deve ser realizado.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.5', 'Ameaças físicas', 'Proteção contra ameaças naturais.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.6', 'Áreas seguras', 'Trabalho em áreas seguras deve seguir regras.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.7', 'Mesa limpa', 'Política de mesa limpa.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.8', 'Proteção de equipamentos', 'Equipamentos deve ser protegidos.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.9', 'Ativos fora', 'Ativos externos devem ser protegidos.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.10', 'Mídias', 'Mídias devem ser gerenciadas.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.11', 'Utilidades', 'Utilidades devem ser protegidas.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.12', 'Cabeamento', 'Cabeamento deve ser protegido.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.13', 'Manutenção', 'Manutenção deve ser realizada.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.7.14', 'Descarte seguro', 'Descarte deve ser seguro.', v_cat_id, 2, v_default_criteria);

    -- CATEGORY 8
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_iso_id, v_tenant_id, 'A.8', 'Controles Tecnológicos', 'Controles tecnológicos.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_cat_id;
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade) VALUES
        (v_iso_id, v_tenant_id, 'A.8.1', 'Dispositivos de usuário', 'Dispositivos devem ser protegidos.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.2', 'Acesso privilegiado', 'Privilégios devem ser restritos.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.3', 'Restrição de acesso', 'Acesso deve ser restrito.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.4', 'Código-fonte', 'Acesso ao código deve ser controlado.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.5', 'Autenticação', 'Autenticação segura deve ser usada.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.6', 'Capacidade', 'Capacidade deve ser gerida.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.7', 'Malware', 'Proteção contra malware.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.8', 'Vulnerabilidades', 'Vulnerabilidades devem ser geridas.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.9', 'Configuração', 'Configuração deve ser gerida.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.10', 'Exclusão', 'Exclusão segura de dados.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.11', 'Mascaramento', 'Mascaramento de dados.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.12', 'Vazamento de dados', 'Prevenção de DLP.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.13', 'Backup', 'Backup regular.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.14', 'Redundância', 'Redundância de sistemas.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.15', 'Logs', 'Logs devem ser mantidos.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.16', 'Monitoramento', 'Monitoramento deve ser ativo.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.17', 'Sincronização de relógio', 'NTP seguro.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.18', 'Utilitários privilegiados', 'Controle de utilitários.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.19', 'Instalação de software', 'Controle de instalação.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.20', 'Segurança de rede', 'Rede deve ser segura.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.21', 'Serviços de rede', 'Serviços seguros.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.22', 'Segregação de rede', 'VLANs e segregação.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.23', 'Filtro web', 'Filtro de conteúdo.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.24', 'Criptografia', 'Uso de criptografia.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.25', 'Ciclo de vida seguro', 'SDLC seguro.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.26', 'Requisitos de aplicação', 'Requisitos de segurança.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.27', 'Arquitetura segura', 'Princípios de arquitetura.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.28', 'Codificação segura', 'Práticas de código seguro.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.29', 'Testes de segurança', 'Testes de segurança.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.30', 'Desenvolvimento externo', 'Controle de terceiros.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.31', 'Separação de ambientes', 'Dev/Test/Prod separados.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.32', 'Gestão de mudanças', 'Controle de mudanças.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.33', 'Dados de teste', 'Proteção de dados de teste.', v_cat_id, 2, v_default_criteria),
        (v_iso_id, v_tenant_id, 'A.8.34', 'Auditoria', 'Proteção durante auditoria.', v_cat_id, 2, v_default_criteria);

    -- 2. LGPD
    v_lgpd_id := get_or_create_framework(v_tenant_id, 'Lei Geral de Proteção de Dados (LGPD)', 'LGPD', 'regulatorio', 'Lei brasileira sobre privacidade e proteção de dados pessoais (Lei 13.709/2018).');
    DELETE FROM requisitos_compliance WHERE framework_id = v_lgpd_id;
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_lgpd_id, v_tenant_id, 'CAP.I', 'Disposições Preliminares e Princípios', 'Princípios.', NULL, 1, v_default_criteria) RETURNING id INTO v_cat_id;
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade) VALUES
    (v_lgpd_id, v_tenant_id, 'ART.6.I', 'Finalidade', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.II', 'Adequação', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.III', 'Necessidade', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.IV', 'Livre Acesso', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.V', 'Qualidade dos Dados', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.VI', 'Transparência', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.VII', 'Segurança', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.VIII', 'Prevenção', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.IX', 'Não Discriminação', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.6.X', 'Responsabilização', '', v_cat_id, 2, v_default_criteria);

    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_lgpd_id, v_tenant_id, 'CAP.III', 'Direitos do Titular', 'Direitos.', NULL, 1, v_default_criteria) RETURNING id INTO v_cat_id;
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade) VALUES
    (v_lgpd_id, v_tenant_id, 'ART.18.I', 'Confirmação', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.II', 'Acesso', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.III', 'Correção', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.IV', 'Anonimização', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.V', 'Portabilidade', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.VI', 'Eliminação', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.VII', 'Inf. Compartilhamento', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.VIII', 'Inf. Consentimento', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.18.IX', 'Revogação', '', v_cat_id, 2, v_default_criteria);

    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_lgpd_id, v_tenant_id, 'CAP.VII', 'Segurança', 'Medidas de segurança.', NULL, 1, v_default_criteria) RETURNING id INTO v_cat_id;
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade) VALUES
    (v_lgpd_id, v_tenant_id, 'ART.46', 'Medidas de segurança', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.48', 'Comunicação de incidentes', '', v_cat_id, 2, v_default_criteria),
    (v_lgpd_id, v_tenant_id, 'ART.50', 'Governança', '', v_cat_id, 2, v_default_criteria);

    -- 3. NIST CSF 2.0
    v_nist_id := get_or_create_framework(v_tenant_id, 'NIST Cybersecurity Framework 2.0', 'NIST-CSF-2.0', 'normativo', 'NIST Cybersecurity Framework 2.0 - Framework para melhoria da segurança cibernética de infraestruturas críticas.');
    
    DELETE FROM requisitos_compliance WHERE framework_id = v_nist_id;

    -- FUNCTION: GOVERN (GV)
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_nist_id, v_tenant_id, 'GV', 'GOVERN', 'A estratégia de gerenciamento de risco de segurança cibernética, expectativas e política da organização são estabelecidas, comunicadas e monitoradas.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_func_id;

        -- Category: Organizational Context (GV.OC)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'GV.OC', 'Organizational Context', 'As circunstâncias - missão, expectativas das partes interessadas, dependências e requisitos legais, regulamentares e contratuais - são compreendidas.', v_func_id, 2, v_default_criteria);

        -- Category: Risk Management Strategy (GV.RM)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'GV.RM', 'Risk Management Strategy', 'As prioridades da organização, restrições, tolerâncias de risco e suposições são estabelecidas.', v_func_id, 2, v_default_criteria);

        -- Category: Roles, Responsibilities, and Authorities (GV.RR)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'GV.RR', 'Roles, Responsibilities, and Authorities', 'Funções, responsabilidades e autoridades de segurança cibernética são estabelecidas.', v_func_id, 2, v_default_criteria);

        -- Category: Policy (GV.PO)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'GV.PO', 'Policy', 'A política de gerenciamento de risco de segurança cibernética organizacional é estabelecida.', v_func_id, 2, v_default_criteria);

    -- FUNCTION: IDENTIFY (ID)
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_nist_id, v_tenant_id, 'ID', 'IDENTIFY', 'A compreensão atual da organização sobre a segurança cibernética e os riscos aos sistemas, ativos, dados e capacidades.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_func_id;

        -- Category: Asset Management (ID.AM)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'ID.AM', 'Asset Management', 'Ativos (dados, hardware, software, sistemas, instalações, serviços, pessoas) são identificados e gerenciados.', v_func_id, 2, v_default_criteria);

        -- Category: Risk Assessment (ID.RA)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'ID.RA', 'Risk Assessment', 'O risco de segurança cibernética para a organização, ativos e indivíduos é compreendido.', v_func_id, 2, v_default_criteria);

    -- FUNCTION: PROTECT (PR)
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_nist_id, v_tenant_id, 'PR', 'PROTECT', 'Salvaguardas para garantir a entrega de serviços de infraestrutura crítica.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_func_id;

        -- Category: Identity Management, Authentication, and Access Control (PR.AA)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'PR.AA', 'Identity Management, Authentication, and Access Control', 'O acesso a ativos e instalações é limitado.', v_func_id, 2, v_default_criteria);
        
        -- Category: Data Security (PR.DS)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'PR.DS', 'Data Security', 'Informações e registros (dados) são gerenciados consistentes com a estratégia de risco.', v_func_id, 2, v_default_criteria);

    -- FUNCTION: DETECT (DE)
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_nist_id, v_tenant_id, 'DE', 'DETECT', 'Desenvolver e implementar atividades apropriadas para identificar a ocorrência de um evento de segurança cibernética.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_func_id;

        -- Category: Anomalies and Events (DE.AE)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'DE.AE', 'Anomalies and Events', 'Anomalias e eventos são detectados e seu potencial impacto é compreendido.', v_func_id, 2, v_default_criteria);

    -- FUNCTION: RESPOND (RS)
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_nist_id, v_tenant_id, 'RS', 'RESPOND', 'Desenvolver e implementar atividades apropriadas para tomar medidas em relação a um incidente de segurança cibernética detectado.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_func_id;
        
        -- Category: Incident Management (RS.MA)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'RS.MA', 'Incident Management', 'Gerenciamento de incidentes.', v_func_id, 2, v_default_criteria);

    -- FUNCTION: RECOVER (RC)
    INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
    VALUES (v_nist_id, v_tenant_id, 'RC', 'RECOVER', 'Desenvolver e implementar atividades apropriadas para manter planos de resiliência e restaurar capacidades.', NULL, 1, v_default_criteria)
    RETURNING id INTO v_func_id;

        -- Category: Incident Recovery Plan Execution (RC.RP)
        INSERT INTO requisitos_compliance (framework_id, tenant_id, codigo, titulo, descricao, requisito_pai, nivel, criterios_conformidade)
        VALUES (v_nist_id, v_tenant_id, 'RC.RP', 'Incident Recovery Plan Execution', 'Processos de recuperação são executados para garantir a restauração oportuna dos sistemas.', v_func_id, 2, v_default_criteria);

END $$;
