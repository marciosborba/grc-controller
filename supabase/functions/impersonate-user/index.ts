import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const token = authHeader.replace('Bearer ', '')

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Verificar quem está chamando
        const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token)
        if (callerError || !callerUser) {
            console.error('Caller auth error:', callerError)
            return new Response(JSON.stringify({ error: 'Unauthorized: invalid token' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Verificar se é PLATFORM ADMIN (Super Admin global)
        const { data: platformAdmin, error: platformError } = await supabaseAdmin
            .from('platform_admins')
            .select('user_id')
            .eq('user_id', callerUser.id)
            .maybeSingle()

        if (platformError) {
            console.error('Platform admin check error:', platformError)
            return new Response(JSON.stringify({ error: 'Erro ao verificar permissões: ' + platformError.message }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (!platformAdmin) {
            return new Response(JSON.stringify({
                error: 'Acesso negado. Apenas Super Admins globais podem impersonar usuários.'
            }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const body = await req.json()
        const { target_user_id, reason, redirect_url } = body

        if (!target_user_id) {
            return new Response(JSON.stringify({ error: 'target_user_id é obrigatório' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (target_user_id === callerUser.id) {
            return new Response(JSON.stringify({ error: 'Não é possível impersonar o próprio usuário' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Buscar dados do usuário alvo
        const { data: targetData, error: targetError } = await supabaseAdmin.auth.admin.getUserById(target_user_id)
        if (targetError || !targetData?.user) {
            console.error('Get target user error:', targetError)
            return new Response(JSON.stringify({ error: 'Usuário alvo não encontrado: ' + (targetError?.message || 'unknown') }), {
                status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const targetUser = targetData.user
        if (!targetUser.email) {
            return new Response(JSON.stringify({ error: 'Usuário alvo não possui email configurado' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Determinar redirect URL — usa o que o frontend enviou, ou o SITE_URL configurado
        const redirectTo = redirect_url || Deno.env.get('SITE_URL') || ''

        console.log(`Generating magic link for ${targetUser.email}, redirectTo: ${redirectTo}`)

        // Gerar magic link com redirect para a origem correta
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: targetUser.email,
            options: {
                redirectTo: redirectTo || undefined
            }
        })

        if (linkError || !linkData?.properties?.action_link) {
            console.error('Generate link error:', linkError)
            return new Response(JSON.stringify({ error: 'Erro ao gerar link: ' + (linkError?.message || 'unknown') }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Registrar log de auditoria
        try {
            await supabaseAdmin.from('impersonation_logs').insert({
                admin_user_id: callerUser.id,
                admin_email: callerUser.email,
                target_user_id: targetUser.id,
                target_email: targetUser.email,
                reason: reason || null,
                expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
            })
        } catch (logErr) {
            console.warn('Erro ao registrar log:', logErr)
        }

        return new Response(
            JSON.stringify({
                success: true,
                impersonation_url: linkData.properties.action_link,
                target_email: targetUser.email,
                target_name: targetUser.user_metadata?.full_name || targetUser.email,
                admin_email: callerUser.email,
                expires_in_minutes: 60
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(JSON.stringify({ error: 'Erro interno: ' + (error instanceof Error ? error.message : String(error)) }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
