// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

        // Verify caller is an admin
        const token = authHeader.replace('Bearer ', '')
        const supabaseUser = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token)
        if (userError || !user) throw new Error('Unauthorized')

        const { data: platformAdmin } = await supabaseAdmin
            .from('platform_admins').select('user_id').eq('user_id', user.id).single()
        const isPlatformAdmin = !!platformAdmin

        if (!isPlatformAdmin) {
            const { data: userRoles } = await supabaseAdmin
                .from('user_roles').select('role').eq('user_id', user.id)
            const isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'tenant_admin')
            if (!isAdmin) throw new Error('Sem permissão para excluir usuários.')
        }

        const { profile_id, user_id } = await req.json()
        if (!profile_id) throw new Error('profile_id is required')

        console.log(`🗑️ Deleting user: profile_id=${profile_id}, user_id=${user_id}`)

        // 1. Delete from user_roles
        if (user_id) {
            const { error: rolesErr } = await supabaseAdmin
                .from('user_roles')
                .delete()
                .eq('user_id', user_id)
            if (rolesErr) console.warn('user_roles delete warn:', rolesErr.message)
            else console.log('✅ user_roles deleted')
        }

        // 2. Delete from risk_stakeholders (by email)
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', profile_id)
            .single()

        if (profile?.email) {
            await supabaseAdmin
                .from('risk_stakeholders')
                .delete()
                .eq('email', profile.email)
            console.log('✅ risk_stakeholders cleaned for', profile.email)
        }

        // 3. Delete from profiles
        const { error: profileErr } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', profile_id)
        if (profileErr) {
            console.error('Profile delete error:', profileErr.message)
            throw new Error('Erro ao excluir perfil: ' + profileErr.message)
        }
        console.log('✅ Profile deleted')

        // 4. Delete from auth.users (if user_id provided)
        if (user_id) {
            const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(user_id)
            if (authErr) console.warn('auth.users delete warn:', authErr.message)
            else console.log('✅ auth.users deleted')
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err: any) {
        console.error('delete-user-admin error:', err.message)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
