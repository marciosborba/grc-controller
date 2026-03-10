
// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing authorization header')

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Validate the calling user is authenticated and is an admin
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
        if (userError || !user) throw new Error('Unauthorized')

        // Check if platform admin or tenant admin
        const { data: platformAdmin } = await supabaseAdmin
            .from('platform_admins').select('user_id').eq('user_id', user.id).maybeSingle()

        let isAdmin = !!platformAdmin
        if (!isAdmin) {
            const { data: userRoles } = await supabaseAdmin
                .from('user_roles').select('role').eq('user_id', user.id)
            isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'tenant_admin')
        }

        if (!isAdmin) throw new Error('Sem permissão para alterar status de usuários.')

        const { email, vendor_id, is_active } = await req.json()
        if (!email || !vendor_id) throw new Error('email and vendor_id are required')

        const emailNorm = email.trim().toLowerCase()

        console.log(`[INFO] Toggling vendor user active: email=${emailNorm}, vendor_id=${vendor_id}, is_active=${is_active}`)

        // 1. Update vendor_users
        const { data: vendorUser, error: vuErr } = await supabaseAdmin
            .from('vendor_users')
            .update({ is_active })
            .eq('email', emailNorm)
            .eq('vendor_id', vendor_id)
            .select('auth_user_id')
            .maybeSingle()

        if (vuErr) console.warn('[WARN] vendor_users update:', vuErr.message)

        // 2. Update vendor_portal_users
        const { error: vpuErr } = await supabaseAdmin
            .from('vendor_portal_users')
            .update({ is_active })
            .eq('email', emailNorm)
            .eq('vendor_id', vendor_id)

        if (vpuErr) console.warn('[WARN] vendor_portal_users update:', vpuErr.message)

        // 3. If deactivating, terminate sessions if auth_user_id exists
        const authUserId = vendorUser?.auth_user_id
        if (!is_active && authUserId) {
            console.log(`[INFO] Deactivating sessions for user_id=${authUserId}`)
            const { error: signOutErr } = await supabaseAdmin.auth.admin.signOut(authUserId, 'global')
            if (signOutErr) console.warn('[WARN] Global signout failed:', signOutErr.message)
            else console.log(`[SUCCESS] Sessions terminated for user ${emailNorm}`)
        }

        return new Response(
            JSON.stringify({ success: true, message: is_active ? 'Usuário reativado' : 'Usuário desativado e sessões encerradas' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Error in toggle-vendor-user-active:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
