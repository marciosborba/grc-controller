ALTER TABLE assessment_questions 
ADD COLUMN IF NOT EXISTS evidencias_requeridas BOOLEAN DEFAULT FALSE;

-- Also checking for mapping mismatch columns, just to be safe, though refactor is better.
-- But wait, if I rename columns in DB it breaks other things. Better to update UI code.
