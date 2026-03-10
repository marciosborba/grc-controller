ALTER TABLE public.sistemas 
ADD COLUMN IF NOT EXISTS is_lgpd boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_sox boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_acn boolean DEFAULT false;
