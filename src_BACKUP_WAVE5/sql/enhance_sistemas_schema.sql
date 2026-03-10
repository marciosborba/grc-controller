-- Migration to enhance 'sistemas' table for professional management

-- Add generic columns if they don't exist
DO $$ 
BEGIN
    -- Tipo de Sistema (Deployment Model)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'tipo') THEN
        ALTER TABLE public.sistemas ADD COLUMN tipo VARCHAR(50) DEFAULT 'SaaS';
        ALTER TABLE public.sistemas ADD CONSTRAINT sistemas_tipo_check CHECK (tipo IN ('SaaS', 'On-Premise', 'PaaS', 'IaaS', 'Legacy', 'Outro'));
    END IF;

    -- Status do Sistema
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'status') THEN
        ALTER TABLE public.sistemas ADD COLUMN status VARCHAR(50) DEFAULT 'Ativo';
        ALTER TABLE public.sistemas ADD CONSTRAINT sistemas_status_check CHECK (status IN ('Ativo', 'Em Implementação', 'Descontinuado'));
    END IF;

    -- Criticidade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'criticidade') THEN
        ALTER TABLE public.sistemas ADD COLUMN criticidade VARCHAR(50) DEFAULT 'Média';
        ALTER TABLE public.sistemas ADD CONSTRAINT sistemas_criticidade_check CHECK (criticidade IN ('Baixa', 'Média', 'Alta', 'Crítica'));
    END IF;

    -- Owners (Responsáveis)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'responsavel_tecnico') THEN
        ALTER TABLE public.sistemas ADD COLUMN responsavel_tecnico UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'responsavel_negocio') THEN
        ALTER TABLE public.sistemas ADD COLUMN responsavel_negocio UUID REFERENCES auth.users(id);
    END IF;

    -- Atributos de Segurança e Dados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'dados_sensiveis') THEN
        ALTER TABLE public.sistemas ADD COLUMN dados_sensiveis BOOLEAN DEFAULT false; /* Armazena PII/Dados Pessoais? */
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'internet_facing') THEN
        ALTER TABLE public.sistemas ADD COLUMN internet_facing BOOLEAN DEFAULT false; /* Acessível publicamente? */
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'autenticacao_sso') THEN
        ALTER TABLE public.sistemas ADD COLUMN autenticacao_sso BOOLEAN DEFAULT false; /* Tem SSO integrado? */
    END IF;

    -- Documentação
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sistemas' AND column_name = 'documentacao_link') THEN
        ALTER TABLE public.sistemas ADD COLUMN documentacao_link TEXT;
    END IF;
END $$;
