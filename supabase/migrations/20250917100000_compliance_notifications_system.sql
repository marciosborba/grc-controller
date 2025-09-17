-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES DE CONFORMIDADE
-- Criado em: 2025-09-17
-- Descrição: Sistema completo de notificações automáticas para compliance
-- =====================================================

-- 1. REGRAS DE NOTIFICAÇÃO
-- Configuração de regras automáticas de notificação
CREATE TABLE IF NOT EXISTS regras_notificacao_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Tipo e trigger
    tipo_evento VARCHAR(100) NOT NULL, -- 'prazo_vencimento', 'nao_conformidade_criada', 'plano_acao_atrasado', etc.
    objeto_monitorado VARCHAR(100) NOT NULL, -- 'avaliacoes_conformidade', 'nao_conformidades', 'planos_acao_conformidade'
    
    -- Condições para disparo
    condicoes_disparo JSONB NOT NULL DEFAULT '{}', -- Condições específicas
    dias_antecedencia INTEGER, -- Para notificações de prazo (ex: 7 dias antes do vencimento)
    
    -- Configuração da notificação
    canal_notificacao VARCHAR(50)[] DEFAULT ARRAY['email'], -- 'email', 'sms', 'push', 'sistema'
    prioridade VARCHAR(20) CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
    
    -- Destinatários
    destinatarios_fixos UUID[], -- IDs de usuários específicos
    papeis_destinatarios VARCHAR(50)[], -- Papéis/roles que devem receber
    campo_responsavel VARCHAR(100), -- Campo do objeto que indica o responsável
    incluir_gestores BOOLEAN DEFAULT FALSE,
    incluir_administradores BOOLEAN DEFAULT FALSE,
    
    -- Template da mensagem
    template_assunto VARCHAR(500) NOT NULL,
    template_corpo TEXT NOT NULL,
    template_variaveis JSONB DEFAULT '{}', -- Variáveis disponíveis no template
    
    -- Configurações avançadas
    ativa BOOLEAN DEFAULT TRUE,
    frequencia_maxima INTEGER DEFAULT 1, -- Máximo de notificações por período
    periodo_frequencia VARCHAR(20) DEFAULT 'diario', -- 'diario', 'semanal', 'mensal'
    horario_envio TIME DEFAULT '09:00:00', -- Horário preferencial para envio
    dias_semana INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Dias da semana (1=domingo)
    
    -- Escalonamento
    escalonamento_ativo BOOLEAN DEFAULT FALSE,
    regras_escalonamento JSONB DEFAULT '[]', -- Regras de escalonamento
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_regra_notif_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 2. FILA DE NOTIFICAÇÕES
-- Fila de processamento de notificações
CREATE TABLE IF NOT EXISTS fila_notificacoes_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Origem da notificação
    regra_id UUID NOT NULL REFERENCES regras_notificacao_compliance(id) ON DELETE CASCADE,
    objeto_id UUID NOT NULL, -- ID do objeto que gerou a notificação
    objeto_tipo VARCHAR(100) NOT NULL, -- Tipo do objeto
    
    -- Destinatário
    destinatario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    canal VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'sistema'
    
    -- Conteúdo da notificação
    assunto VARCHAR(500) NOT NULL,
    corpo TEXT NOT NULL,
    dados_contexto JSONB DEFAULT '{}', -- Dados do objeto para contexto
    
    -- Status e processamento
    status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'enviado', 'erro', 'cancelado')),
    prioridade VARCHAR(20) CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
    
    -- Agendamento
    data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
    data_processamento TIMESTAMP WITH TIME ZONE,
    data_envio TIMESTAMP WITH TIME ZONE,
    
    -- Resultado
    tentativas_envio INTEGER DEFAULT 0,
    max_tentativas INTEGER DEFAULT 3,
    resultado_envio TEXT, -- Resultado/erro do envio
    confirmacao_leitura TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HISTÓRICO DE NOTIFICAÇÕES
-- Log histórico de todas as notificações enviadas
CREATE TABLE IF NOT EXISTS historico_notificacoes_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Referência original
    fila_notificacao_id UUID REFERENCES fila_notificacoes_compliance(id),
    regra_id UUID NOT NULL REFERENCES regras_notificacao_compliance(id),
    
    -- Destinatário e contexto
    destinatario_id UUID NOT NULL REFERENCES profiles(id),
    destinatario_nome VARCHAR(255) NOT NULL,
    destinatario_email VARCHAR(255),
    
    -- Conteúdo enviado
    canal VARCHAR(50) NOT NULL,
    assunto VARCHAR(500) NOT NULL,
    corpo TEXT NOT NULL,
    
    -- Objeto relacionado
    objeto_id UUID NOT NULL,
    objeto_tipo VARCHAR(100) NOT NULL,
    objeto_descricao TEXT,
    
    -- Status final
    status_final VARCHAR(30) NOT NULL,
    data_envio TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmacao_leitura TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PREFERÊNCIAS DE NOTIFICAÇÃO
-- Preferências individuais de usuários
CREATE TABLE IF NOT EXISTS preferencias_notificacao_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Canais preferidos por tipo de evento
    preferencias_canais JSONB NOT NULL DEFAULT '{}', -- {"prazo_vencimento": ["email"], "nao_conformidade": ["email", "push"]}
    
    -- Configurações gerais
    receber_notificacoes BOOLEAN DEFAULT TRUE,
    receber_resumos_diarios BOOLEAN DEFAULT TRUE,
    receber_resumos_semanais BOOLEAN DEFAULT FALSE,
    
    -- Horários preferenciais
    horario_preferencial_inicio TIME DEFAULT '08:00:00',
    horario_preferencial_fim TIME DEFAULT '18:00:00',
    fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Dias da semana
    dias_nao_receber INTEGER[] DEFAULT '{}', -- Dias para não receber (1=domingo)
    
    -- Filtros
    apenas_alta_prioridade BOOLEAN DEFAULT FALSE,
    apenas_responsabilidades_diretas BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT uk_pref_notif_user_tenant UNIQUE (tenant_id, user_id)
);

-- =====================================================
-- FUNCTIONS PARA PROCESSAMENTO DE NOTIFICAÇÕES
-- =====================================================

-- Function para processar notificações automáticas
CREATE OR REPLACE FUNCTION processar_notificacoes_compliance()
RETURNS INTEGER AS $$
DECLARE
    regra RECORD;
    objeto RECORD;
    destinatario RECORD;
    notificacao_id UUID;
    total_processadas INTEGER := 0;
BEGIN
    -- Processar cada regra ativa
    FOR regra IN 
        SELECT * FROM regras_notificacao_compliance 
        WHERE ativa = TRUE
    LOOP
        -- Processar baseado no tipo de evento
        CASE regra.tipo_evento
            WHEN 'prazo_vencimento_avaliacao' THEN
                -- Avaliar avaliações próximas do vencimento
                FOR objeto IN 
                    EXECUTE format('
                        SELECT * FROM %I 
                        WHERE tenant_id = %L 
                        AND data_proxima_avaliacao <= (CURRENT_DATE + INTERVAL ''%s days'')
                        AND data_proxima_avaliacao > CURRENT_DATE
                    ', regra.objeto_monitorado, regra.tenant_id, regra.dias_antecedencia)
                LOOP
                    -- Criar notificação para cada destinatário
                    PERFORM criar_notificacao_objeto(regra, objeto);
                    total_processadas := total_processadas + 1;
                END LOOP;
                
            WHEN 'plano_acao_atrasado' THEN
                -- Avaliar planos de ação em atraso
                FOR objeto IN 
                    EXECUTE format('
                        SELECT * FROM %I 
                        WHERE tenant_id = %L 
                        AND data_fim_planejada < CURRENT_DATE
                        AND status IN (''planejada'', ''aprovada'', ''em_execucao'')
                    ', regra.objeto_monitorado, regra.tenant_id)
                LOOP
                    PERFORM criar_notificacao_objeto(regra, objeto);
                    total_processadas := total_processadas + 1;
                END LOOP;
                
            WHEN 'nao_conformidade_critica' THEN
                -- Avaliar não conformidades críticas
                FOR objeto IN 
                    EXECUTE format('
                        SELECT * FROM %I 
                        WHERE tenant_id = %L 
                        AND criticidade = ''critica''
                        AND status = ''aberta''
                    ', regra.objeto_monitorado, regra.tenant_id)
                LOOP
                    PERFORM criar_notificacao_objeto(regra, objeto);
                    total_processadas := total_processadas + 1;
                END LOOP;
        END CASE;
    END LOOP;
    
    RETURN total_processadas;
END;
$$ LANGUAGE plpgsql;

-- Function auxiliar para criar notificação de objeto
CREATE OR REPLACE FUNCTION criar_notificacao_objeto(regra regras_notificacao_compliance, objeto RECORD)
RETURNS VOID AS $$
DECLARE
    destinatario_id UUID;
    canal TEXT;
    assunto_processado TEXT;
    corpo_processado TEXT;
BEGIN
    -- Determinar destinatários
    -- Se há campo responsável definido, usar ele
    IF regra.campo_responsavel IS NOT NULL THEN
        EXECUTE format('SELECT %I FROM %I WHERE id = %L', 
                      regra.campo_responsavel, regra.objeto_monitorado, objeto.id) 
        INTO destinatario_id;
        
        IF destinatario_id IS NOT NULL THEN
            -- Criar notificação para cada canal
            FOREACH canal IN ARRAY regra.canal_notificacao
            LOOP
                -- Processar templates
                assunto_processado := processar_template(regra.template_assunto, objeto);
                corpo_processado := processar_template(regra.template_corpo, objeto);
                
                -- Inserir na fila
                INSERT INTO fila_notificacoes_compliance (
                    tenant_id, regra_id, objeto_id, objeto_tipo,
                    destinatario_id, canal, assunto, corpo,
                    data_agendamento, prioridade, dados_contexto
                ) VALUES (
                    regra.tenant_id, regra.id, objeto.id, regra.objeto_monitorado,
                    destinatario_id, canal, assunto_processado, corpo_processado,
                    NOW() + INTERVAL '5 minutes', regra.prioridade, to_jsonb(objeto)
                );
            END LOOP;
        END IF;
    END IF;
    
    -- Processar destinatários fixos
    IF array_length(regra.destinatarios_fixos, 1) > 0 THEN
        FOREACH destinatario_id IN ARRAY regra.destinatarios_fixos
        LOOP
            FOREACH canal IN ARRAY regra.canal_notificacao
            LOOP
                assunto_processado := processar_template(regra.template_assunto, objeto);
                corpo_processado := processar_template(regra.template_corpo, objeto);
                
                INSERT INTO fila_notificacoes_compliance (
                    tenant_id, regra_id, objeto_id, objeto_tipo,
                    destinatario_id, canal, assunto, corpo,
                    data_agendamento, prioridade, dados_contexto
                ) VALUES (
                    regra.tenant_id, regra.id, objeto.id, regra.objeto_monitorado,
                    destinatario_id, canal, assunto_processado, corpo_processado,
                    NOW() + INTERVAL '5 minutes', regra.prioridade, to_jsonb(objeto)
                );
            END LOOP;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function para processar templates de mensagem
CREATE OR REPLACE FUNCTION processar_template(template TEXT, objeto RECORD)
RETURNS TEXT AS $$
DECLARE
    resultado TEXT;
BEGIN
    resultado := template;
    
    -- Substituir variáveis comuns
    resultado := replace(resultado, '{{titulo}}', COALESCE(objeto.titulo, ''));
    resultado := replace(resultado, '{{codigo}}', COALESCE(objeto.codigo, ''));
    resultado := replace(resultado, '{{data_hoje}}', CURRENT_DATE::TEXT);
    resultado := replace(resultado, '{{data_vencimento}}', COALESCE(objeto.data_fim_planejada, objeto.prazo_resolucao, '')::TEXT);
    
    -- Adicionar mais substituições conforme necessário
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Function para processar fila de notificações
CREATE OR REPLACE FUNCTION enviar_notificacoes_pendentes()
RETURNS INTEGER AS $$
DECLARE
    notificacao RECORD;
    total_enviadas INTEGER := 0;
BEGIN
    -- Processar notificações pendentes que chegaram na hora
    FOR notificacao IN 
        SELECT * FROM fila_notificacoes_compliance 
        WHERE status = 'pendente' 
        AND data_agendamento <= NOW()
        ORDER BY prioridade DESC, created_at
        LIMIT 100
    LOOP
        BEGIN
            -- Atualizar status para processando
            UPDATE fila_notificacoes_compliance 
            SET status = 'processando', data_processamento = NOW()
            WHERE id = notificacao.id;
            
            -- Simular envio (aqui seria integração real com serviços de email/SMS/push)
            PERFORM pg_sleep(0.1); -- Simular latência de envio
            
            -- Marcar como enviado
            UPDATE fila_notificacoes_compliance 
            SET status = 'enviado', 
                data_envio = NOW(),
                tentativas_envio = tentativas_envio + 1,
                resultado_envio = 'Enviado com sucesso'
            WHERE id = notificacao.id;
            
            -- Criar histórico
            INSERT INTO historico_notificacoes_compliance (
                tenant_id, fila_notificacao_id, regra_id,
                destinatario_id, destinatario_nome, destinatario_email,
                canal, assunto, corpo,
                objeto_id, objeto_tipo, objeto_descricao,
                status_final, data_envio
            ) 
            SELECT 
                fn.tenant_id, fn.id, fn.regra_id,
                fn.destinatario_id, p.full_name, p.email,
                fn.canal, fn.assunto, fn.corpo,
                fn.objeto_id, fn.objeto_tipo, fn.assunto,
                'enviado', fn.data_envio
            FROM fila_notificacoes_compliance fn
            JOIN profiles p ON fn.destinatario_id = p.id
            WHERE fn.id = notificacao.id;
            
            total_enviadas := total_enviadas + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Em caso de erro, marcar como erro e incrementar tentativas
            UPDATE fila_notificacoes_compliance 
            SET status = CASE 
                    WHEN tentativas_envio + 1 >= max_tentativas THEN 'erro'
                    ELSE 'pendente'
                END,
                tentativas_envio = tentativas_envio + 1,
                resultado_envio = SQLERRM,
                data_agendamento = CASE 
                    WHEN tentativas_envio + 1 < max_tentativas THEN NOW() + INTERVAL '1 hour'
                    ELSE data_agendamento
                END
            WHERE id = notificacao.id;
        END;
    END LOOP;
    
    RETURN total_enviadas;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Trigger para criar notificações quando nova não conformidade crítica é criada
CREATE OR REPLACE FUNCTION trigger_notificacao_nao_conformidade_critica()
RETURNS TRIGGER AS $$
BEGIN
    -- Se é uma não conformidade crítica nova
    IF NEW.criticidade = 'critica' AND NEW.status = 'aberta' THEN
        -- Processar regras de notificação para este evento
        PERFORM processar_evento_notificacao(
            NEW.tenant_id,
            'nao_conformidade_critica',
            'nao_conformidades',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function auxiliar para processar evento específico
CREATE OR REPLACE FUNCTION processar_evento_notificacao(
    tenant_id_param UUID,
    tipo_evento_param VARCHAR(100),
    objeto_tipo_param VARCHAR(100),
    objeto_id_param UUID
)
RETURNS VOID AS $$
DECLARE
    regra RECORD;
    objeto RECORD;
BEGIN
    -- Buscar regras ativas para este tipo de evento
    FOR regra IN 
        SELECT * FROM regras_notificacao_compliance 
        WHERE tenant_id = tenant_id_param
        AND tipo_evento = tipo_evento_param
        AND objeto_monitorado = objeto_tipo_param
        AND ativa = TRUE
    LOOP
        -- Buscar o objeto
        EXECUTE format('SELECT * FROM %I WHERE id = %L', objeto_tipo_param, objeto_id_param)
        INTO objeto;
        
        IF objeto IS NOT NULL THEN
            PERFORM criar_notificacao_objeto(regra, objeto);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER tr_notif_nao_conformidade_critica
    AFTER INSERT OR UPDATE ON nao_conformidades
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notificacao_nao_conformidade_critica();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Regras de notificação
CREATE INDEX IF NOT EXISTS idx_regras_notif_tenant_ativa ON regras_notificacao_compliance(tenant_id, ativa);
CREATE INDEX IF NOT EXISTS idx_regras_notif_tipo_evento ON regras_notificacao_compliance(tipo_evento, objeto_monitorado);

-- Fila de notificações
CREATE INDEX IF NOT EXISTS idx_fila_notif_tenant ON fila_notificacoes_compliance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fila_notif_status_agendamento ON fila_notificacoes_compliance(status, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_fila_notif_destinatario ON fila_notificacoes_compliance(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_fila_notif_prioridade ON fila_notificacoes_compliance(prioridade, created_at);

-- Histórico
CREATE INDEX IF NOT EXISTS idx_hist_notif_tenant_data ON historico_notificacoes_compliance(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hist_notif_destinatario ON historico_notificacoes_compliance(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_hist_notif_objeto ON historico_notificacoes_compliance(objeto_tipo, objeto_id);

-- Preferências
CREATE INDEX IF NOT EXISTS idx_pref_notif_tenant_user ON preferencias_notificacao_compliance(tenant_id, user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE regras_notificacao_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_notificacoes_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_notificacoes_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferencias_notificacao_compliance ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY regras_notif_tenant_policy ON regras_notificacao_compliance
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY fila_notif_tenant_policy ON fila_notificacoes_compliance
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY hist_notif_tenant_policy ON historico_notificacoes_compliance
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY pref_notif_user_policy ON preferencias_notificacao_compliance
    USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- DADOS INICIAIS - REGRAS PADRÃO
-- =====================================================

-- Inserir regras de notificação padrão para um tenant específico
DO $$
DECLARE
    tenant_uuid UUID := '46b1c048-85a1-423b-96fc-776007c8de1f';
    admin_user_id UUID;
BEGIN
    -- Buscar um usuário admin para associar como criador
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE tenant_id = tenant_uuid 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Regra 1: Notificar sobre avaliações próximas do vencimento
        INSERT INTO regras_notificacao_compliance (
            tenant_id, codigo, nome, descricao,
            tipo_evento, objeto_monitorado,
            dias_antecedencia, canal_notificacao, prioridade,
            campo_responsavel, incluir_administradores,
            template_assunto, template_corpo,
            created_by, updated_by
        ) VALUES (
            tenant_uuid, 'NOTIF-001', 'Avaliação Próxima do Vencimento',
            'Notifica responsáveis sobre avaliações de conformidade que vencem em breve',
            'prazo_vencimento_avaliacao', 'requisitos_compliance',
            7, ARRAY['email'], 'alta',
            'responsavel_conformidade', true,
            'Avaliação de Conformidade Vencendo - {{titulo}}',
            'Olá! A avaliação de conformidade "{{titulo}}" ({{codigo}}) está programada para {{data_vencimento}}. Por favor, providencie a avaliação o quanto antes.',
            admin_user_id, admin_user_id
        );
        
        -- Regra 2: Notificar sobre não conformidades críticas
        INSERT INTO regras_notificacao_compliance (
            tenant_id, codigo, nome, descricao,
            tipo_evento, objeto_monitorado,
            canal_notificacao, prioridade,
            campo_responsavel, incluir_administradores,
            template_assunto, template_corpo,
            created_by, updated_by
        ) VALUES (
            tenant_uuid, 'NOTIF-002', 'Não Conformidade Crítica Identificada',
            'Notifica sobre identificação de não conformidades críticas',
            'nao_conformidade_critica', 'nao_conformidades',
            ARRAY['email'], 'urgente',
            'responsavel_tratamento', true,
            'URGENTE: Não Conformidade Crítica - {{titulo}}',
            'Uma não conformidade crítica foi identificada: "{{titulo}}" ({{codigo}}). É necessária ação imediata para tratar esta situação. Acesse o sistema para mais detalhes.',
            admin_user_id, admin_user_id
        );
        
        -- Regra 3: Notificar sobre planos de ação em atraso
        INSERT INTO regras_notificacao_compliance (
            tenant_id, codigo, nome, descricao,
            tipo_evento, objeto_monitorado,
            canal_notificacao, prioridade,
            campo_responsavel, incluir_administradores,
            template_assunto, template_corpo,
            frequencia_maxima, periodo_frequencia,
            created_by, updated_by
        ) VALUES (
            tenant_uuid, 'NOTIF-003', 'Plano de Ação em Atraso',
            'Notifica sobre planos de ação que passaram do prazo',
            'plano_acao_atrasado', 'planos_acao_conformidade',
            ARRAY['email'], 'alta',
            'responsavel_execucao', true,
            'Plano de Ação em Atraso - {{titulo}}',
            'O plano de ação "{{titulo}}" ({{codigo}}) estava previsto para conclusão em {{data_vencimento}} e está em atraso. Por favor, atualize o status ou revise o cronograma.',
            1, 'diario',
            admin_user_id, admin_user_id
        );
    END IF;
END $$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE regras_notificacao_compliance IS 'Regras de notificação automática para eventos de compliance';
COMMENT ON TABLE fila_notificacoes_compliance IS 'Fila de processamento de notificações pendentes';
COMMENT ON TABLE historico_notificacoes_compliance IS 'Histórico de todas as notificações enviadas';
COMMENT ON TABLE preferencias_notificacao_compliance IS 'Preferências individuais de notificação dos usuários';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================