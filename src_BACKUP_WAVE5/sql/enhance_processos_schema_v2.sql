-- Enhance processos table with comprehensive fields for professional process management
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS macro_processo VARCHAR(255),
ADD COLUMN IF NOT EXISTS objetivo TEXT,
ADD COLUMN IF NOT EXISTS entradas TEXT, -- Can be a list or detailed text
ADD COLUMN IF NOT EXISTS saidas TEXT,   -- Can be a list or detailed text
ADD COLUMN IF NOT EXISTS frequencia VARCHAR(50) CHECK (frequencia IN ('Diária', 'Semanal', 'Mensal', 'Trimestral', 'Anual', 'Sob Demanda')),
ADD COLUMN IF NOT EXISTS documentacao_referencia TEXT, -- Links to internal docs
ADD COLUMN IF NOT EXISTS aprovador UUID REFERENCES auth.users(id);

-- If not already added by previous script
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS departamento VARCHAR(255),
ADD COLUMN IF NOT EXISTS criticidade VARCHAR(50) CHECK (criticidade IN ('Baixa', 'Média', 'Alta', 'Crítica')),
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) CHECK (tipo IN ('Operacional', 'Gerencial', 'Suporte', 'Estratégico')),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Em Revisão', 'Descontinuado'));
