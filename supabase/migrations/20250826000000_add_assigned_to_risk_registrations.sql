-- Migration para adicionar campo assigned_to na tabela risk_registrations
-- Data: 2025-08-26
-- Objetivo: Corrigir erro "Could not find the 'assigned_to' column of 'risk_registrations'"

-- Adicionar campo assigned_to para armazenar o responsável pelo risco
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_risk_registrations_assigned_to ON risk_registrations(assigned_to);

-- Comentário para documentar o novo campo
COMMENT ON COLUMN risk_registrations.assigned_to IS 'ID do usuário responsável pelo risco';

-- Opcionalmente, adicionar um campo de nome do responsável para casos onde não há usuário cadastrado
ALTER TABLE risk_registrations 
ADD COLUMN IF NOT EXISTS assigned_to_name VARCHAR(255);

-- Comentário para o campo de nome
COMMENT ON COLUMN risk_registrations.assigned_to_name IS 'Nome do responsável pelo risco (usado quando não há usuário cadastrado)';