-- Add permissions, isActive, and theme columns to public.profiles table
ALTER TABLE public.profiles
ADD COLUMN permissions TEXT[] DEFAULT '{}',
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN theme TEXT DEFAULT 'light';

-- Update handle_new_user function to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, job_title, permissions, isactive, theme)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'User'),
    '{}', -- Default empty array for permissions
    TRUE,  -- Default active user
    'light' -- Default theme
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
