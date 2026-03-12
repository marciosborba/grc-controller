-- ============================================================================
-- MIGRATION: Habilitar Exclusão em Cascata para Usuários (ROBUSTO)
-- ============================================================================
-- Descrição: Altera restrições de chave estrangeira para ON DELETE CASCADE
-- permitindo que a exclusão de um usuário remova automaticamente seus dados vinculados.

-- 1. FRAMEWORKS
DO $$ 
BEGIN 
    ALTER TABLE public.frameworks DROP CONSTRAINT IF EXISTS frameworks_created_by_user_id_fkey;
    ALTER TABLE public.frameworks ADD CONSTRAINT frameworks_created_by_user_id_fkey 
        FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Skipping frameworks: %', SQLERRM;
END $$;

-- 2. ASSESSMENTS
DO $$ 
BEGIN 
    ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS assessments_created_by_fkey;
    ALTER TABLE public.assessments ADD CONSTRAINT assessments_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Skipping assessments: %', SQLERRM;
END $$;

-- 3. ASSESSMENT RESPONSES
DO $$ 
BEGIN 
    ALTER TABLE public.assessment_responses DROP CONSTRAINT IF EXISTS assessment_responses_respondent_id_fkey;
    ALTER TABLE public.assessment_responses ADD CONSTRAINT assessment_responses_respondent_id_fkey 
        FOREIGN KEY (respondent_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Skipping assessment_responses (respondent): %', SQLERRM;
END $$;

DO $$ 
BEGIN 
    ALTER TABLE public.assessment_responses DROP CONSTRAINT IF EXISTS assessment_responses_reviewer_id_fkey;
    ALTER TABLE public.assessment_responses ADD CONSTRAINT assessment_responses_reviewer_id_fkey 
        FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN 
    RAISE NOTICE 'Skipping assessment_responses (reviewer): %', SQLERRM;
END $$;

-- 4. VENDOR RISKS
DO $$ 
BEGIN 
    ALTER TABLE public.vendor_risks DROP CONSTRAINT IF EXISTS vendor_risks_risk_owner_fkey;
    ALTER TABLE public.vendor_risks ADD CONSTRAINT vendor_risks_risk_owner_fkey FOREIGN KEY (risk_owner) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping vendor_risks (owner): %', SQLERRM;
END $$;

DO $$ 
BEGIN 
    ALTER TABLE public.vendor_risks DROP CONSTRAINT IF EXISTS vendor_risks_created_by_fkey;
    ALTER TABLE public.vendor_risks ADD CONSTRAINT vendor_risks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping vendor_risks (created): %', SQLERRM;
END $$;

DO $$ 
BEGIN 
    ALTER TABLE public.vendor_risks DROP CONSTRAINT IF EXISTS vendor_risks_updated_by_fkey;
    ALTER TABLE public.vendor_risks ADD CONSTRAINT vendor_risks_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping vendor_risks (updated): %', SQLERRM;
END $$;

-- 5. VENDOR RISK ACTIONS
DO $$ 
BEGIN 
    ALTER TABLE public.vendor_risk_actions DROP CONSTRAINT IF EXISTS vendor_risk_actions_created_by_fkey;
    ALTER TABLE public.vendor_risk_actions ADD CONSTRAINT vendor_risk_actions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping vendor_risk_actions: %', SQLERRM;
END $$;

-- 6. VENDOR COMMUNICATIONS
DO $$ 
BEGIN 
    ALTER TABLE public.vendor_communications DROP CONSTRAINT IF EXISTS vendor_communications_created_by_fkey;
    ALTER TABLE public.vendor_communications ADD CONSTRAINT vendor_communications_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping vendor_communications: %', SQLERRM;
END $$;

-- 7. ETHICS REPORTS
DO $$ 
BEGIN 
    ALTER TABLE public.ethics_reports DROP CONSTRAINT IF EXISTS ethics_reports_created_by_user_id_fkey;
    ALTER TABLE public.ethics_reports ADD CONSTRAINT ethics_reports_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping ethics_reports: %', SQLERRM;
END $$;

-- 8. ETHICS CATEGORIES
DO $$ 
BEGIN 
    ALTER TABLE public.ethics_categories DROP CONSTRAINT IF EXISTS ethics_categories_auto_assign_to_fkey;
    ALTER TABLE public.ethics_categories ADD CONSTRAINT ethics_categories_auto_assign_to_fkey FOREIGN KEY (auto_assign_to) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping ethics_categories (assign): %', SQLERRM;
END $$;

DO $$ 
BEGIN 
    ALTER TABLE public.ethics_categories DROP CONSTRAINT IF EXISTS ethics_categories_created_by_fkey;
    ALTER TABLE public.ethics_categories ADD CONSTRAINT ethics_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping ethics_categories (created): %', SQLERRM;
END $$;

-- 9. ETHICS COMMUNICATIONS
DO $$ 
BEGIN 
    ALTER TABLE public.ethics_communications DROP CONSTRAINT IF EXISTS ethics_communications_sender_id_fkey;
    ALTER TABLE public.ethics_communications ADD CONSTRAINT ethics_communications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping ethics_communications: %', SQLERRM;
END $$;

-- 10. ETHICS ACTIVITIES
DO $$ 
BEGIN 
    ALTER TABLE public.ethics_activities DROP CONSTRAINT IF EXISTS ethics_activities_performed_by_fkey;
    ALTER TABLE public.ethics_activities ADD CONSTRAINT ethics_activities_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping ethics_activities: %', SQLERRM;
END $$;

-- 11. ETHICS ATTACHMENTS
DO $$ 
BEGIN 
    ALTER TABLE public.ethics_attachments DROP CONSTRAINT IF EXISTS ethics_attachments_uploaded_by_fkey;
    ALTER TABLE public.ethics_attachments ADD CONSTRAINT ethics_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping ethics_attachments: %', SQLERRM;
END $$;
