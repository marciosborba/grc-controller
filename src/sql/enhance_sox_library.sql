
ALTER TABLE biblioteca_controles_sox 
ADD COLUMN IF NOT EXISTS assercoes_financeiras text[],
ADD COLUMN IF NOT EXISTS dono_controle text;
