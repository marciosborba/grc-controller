-- Add new fields to processos table for better categorization and management
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS departamento VARCHAR(255),
ADD COLUMN IF NOT EXISTS criticidade VARCHAR(50) CHECK (criticidade IN ('Baixa', 'Média', 'Alta', 'Crítica')),
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) CHECK (tipo IN ('Operacional', 'Gerencial', 'Suporte', 'Estratégico')),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Em Revisão', 'Descontinuado'));
