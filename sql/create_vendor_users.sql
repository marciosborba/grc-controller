-- Criar a view ou função para facilitar a associação do usuário de Auth do fornecedor 
-- ao vendor_registry.

CREATE TABLE IF NOT EXISTS public.vendor_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_registry(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'vendor_admin', -- pode expandir depois
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(vendor_id, email)
);

-- RLS
ALTER TABLE public.vendor_users ENABLE ROW LEVEL SECURITY;

-- Tenants admins can manage vendor users
CREATE POLICY "Admins can manage vendor_users" 
ON public.vendor_users 
FOR ALL TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.vendor_registry vr
        WHERE vr.id = vendor_users.vendor_id
        AND vr.tenant_id = current_setting('app.current_tenant', true)::uuid
    )
);

-- Vendors can view their own profile
CREATE POLICY "Vendors can view their own user" 
ON public.vendor_users 
FOR SELECT TO authenticated 
USING (
    auth_user_id = auth.uid()
);

-- Função utilitária para registrar a entrada de um fornecedor
CREATE OR REPLACE FUNCTION public.get_vendor_user_info()
RETURNS TABLE (
    vendor_user_id UUID,
    vendor_id UUID,
    email TEXT,
    name TEXT,
    tenant_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vu.id AS vendor_user_id,
        vu.vendor_id,
        vu.email,
        vu.name,
        vr.tenant_id
    FROM public.vendor_users vu
    JOIN public.vendor_registry vr ON vr.id = vu.vendor_id
    WHERE vu.auth_user_id = auth.uid()
    AND vu.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Permitir que o fornecedor acesse apenas suas avaliações
-- O RLS do vendor_assessments precisa ser expandido
-- Removendo política pública antiga (se existir)
DROP POLICY IF EXISTS "vendor_public_access" ON public.vendor_assessments;

-- Atualizar ou adicionar regra para que fornecedores logados vejam suas assessments
CREATE POLICY "Vendors can view their own assessments" 
ON public.vendor_assessments 
FOR SELECT TO authenticated 
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.vendor_users WHERE vendor_id = vendor_assessments.vendor_id
    )
    OR tenant_id = current_setting('app.current_tenant', true)::uuid
);

CREATE POLICY "Vendors can update their own assessments" 
ON public.vendor_assessments 
FOR UPDATE TO authenticated 
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.vendor_users WHERE vendor_id = vendor_assessments.vendor_id
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT auth_user_id FROM public.vendor_users WHERE vendor_id = vendor_assessments.vendor_id
    )
);
