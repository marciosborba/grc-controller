-- Insert demo users with proper auth setup
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@cyberguard.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User","job_title":"CISO"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'risk@cyberguard.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Risk Manager","job_title":"Risk Manager"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'compliance@cyberguard.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Compliance Officer","job_title":"Compliance Officer"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'auditor@cyberguard.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Auditor User","job_title":"Auditor"}', now(), now(), '', '', '', '');

-- Assign roles to demo users
WITH demo_users AS (
  SELECT id, email FROM auth.users WHERE email LIKE '%@cyberguard.com'
)
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN email = 'admin@cyberguard.com' THEN 'admin'::app_role
    WHEN email = 'risk@cyberguard.com' THEN 'risk_manager'::app_role
    WHEN email = 'compliance@cyberguard.com' THEN 'compliance_officer'::app_role
    WHEN email = 'auditor@cyberguard.com' THEN 'auditor'::app_role
  END as role
FROM demo_users;