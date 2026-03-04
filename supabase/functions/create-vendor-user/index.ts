import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateVendorUserRequest {
    email: string;
    password: string;
    name: string;
    vendor_id: string;
    tenant_id?: string | null;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing authorization header')
        }

        // Admin client with service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Validate the calling user is authenticated
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
            authHeader.replace('Bearer ', '')
        )
        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        const body: CreateVendorUserRequest = await req.json()
        const { email, password, name, vendor_id, tenant_id } = body

        if (!email || !password || !vendor_id) {
            throw new Error('email, password and vendor_id are required')
        }

        // Check if user already exists
        const { data: existing } = await supabaseAdmin.auth.admin.listUsers()
        const alreadyExists = existing?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

        let authUserId: string

        if (alreadyExists) {
            authUserId = alreadyExists.id
            // Update their password
            await supabaseAdmin.auth.admin.updateUserById(authUserId, { password })
        } else {
            // Create new user via Admin API (handles GoTrue auth properly)
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { name, is_vendor: true }
            })

            if (authError) throw authError
            authUserId = authData.user.id
        }

        // Upsert vendor_users
        await supabaseAdmin.from('vendor_users').upsert({
            vendor_id,
            auth_user_id: authUserId,
            email,
            name: name || 'Fornecedor',
            role: 'vendor_admin',
            is_active: true
        }, { onConflict: 'vendor_id,email' })

        // Upsert vendor_portal_users
        await supabaseAdmin.from('vendor_portal_users').upsert({
            vendor_id,
            email,
            tenant_id: tenant_id || null,
            force_password_change: true,
        }, { onConflict: 'email' })

        return new Response(
            JSON.stringify({ success: true, user_id: authUserId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Error in create-vendor-user:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
