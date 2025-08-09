import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserRequest {
  email: string;
  password?: string;
  full_name: string;
  job_title?: string;
  department?: string;
  phone?: string;
  tenant_id: string;
  roles: string[];
  permissions?: string[];
  send_invitation?: boolean;
  must_change_password?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar se usuário está autenticado
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Extrair token do header
    const token = authHeader.replace('Bearer ', '')
    
    // Criar cliente Supabase para verificar usuário autenticado
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verificar usuário atual usando o token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Verificar se usuário é platform admin
    const { data: platformAdmin, error: platformError } = await supabaseAdmin
      .from('platform_admins')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const isPlatformAdmin = !platformError && !!platformAdmin

    // Verificar se usuário tem permissão (platform admin OU admin com permissão)
    if (!isPlatformAdmin) {
      // Verificar se é admin com permissão users.create
      const { data: userRoles } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      const isAdmin = userRoles?.some(r => r.role === 'admin')
      
      if (!isAdmin) {
        throw new Error('Sem permissão para criar usuários. Verifique se você é administrador da plataforma ou possui a role admin.')
      }
    }

    // Processar requisição
    const userData: CreateUserRequest = await req.json()

    // Determinar tenant_id
    let targetTenantId = userData.tenant_id
    
    // Se não for admin da plataforma, usar o tenant do usuário atual
    if (!isPlatformAdmin) {
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()
      
      targetTenantId = currentProfile?.tenant_id
    }

    if (!targetTenantId) {
      throw new Error('Tenant ID é obrigatório')
    }

    // Verificar limite de usuários do tenant (apenas para não-admins da plataforma)
    if (!isPlatformAdmin) {
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .select('max_users, current_users_count')
        .eq('id', targetTenantId)
        .single()

      if (tenantError) throw new Error('Erro ao verificar limites do tenant')

      if (tenant.current_users_count >= tenant.max_users) {
        throw new Error(`Limite de usuários atingido (${tenant.max_users}). Contate o administrador da plataforma.`)
      }
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.send_invitation ? undefined : (userData.password || 'temp-password-123'),
      email_confirm: !userData.send_invitation,
      user_metadata: {
        full_name: userData.full_name,
        job_title: userData.job_title
      }
    })

    if (authError) throw authError

    // Verificar se profile já existe (pode ser criado por trigger)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', authData.user.id)
      .single()

    if (existingProfile) {
      // Profile já existe, apenas atualizar
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: userData.full_name,
          job_title: userData.job_title,
          department: userData.department,
          phone: userData.phone,
          tenant_id: targetTenantId,
          email: userData.email,
          permissions: userData.permissions || [],
          must_change_password: userData.must_change_password || userData.send_invitation
        })
        .eq('user_id', authData.user.id)

      if (updateError) throw updateError
    } else {
      // Profile não existe, criar novo
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: userData.full_name,
          job_title: userData.job_title,
          department: userData.department,
          phone: userData.phone,
          tenant_id: targetTenantId,
          email: userData.email,
          permissions: userData.permissions || [],
          must_change_password: userData.must_change_password || userData.send_invitation
        })

      if (insertError) throw insertError
    }

    // Atribuir roles (verificar se já existem)
    if (userData.roles.length > 0) {
      for (const role of userData.roles) {
        // Verificar se role já existe
        const { data: existingRole } = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .eq('user_id', authData.user.id)
          .eq('role', role)
          .single()

        // Inserir apenas se não existir
        if (!existingRole) {
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role
            })

          if (roleError) throw roleError
        }
      }
    }

    // Log da atividade
    try {
      await supabaseAdmin.rpc('rpc_log_activity', {
        p_user_id: user.id,
        p_action: 'user_created',
        p_resource_type: 'users',
        p_resource_id: authData.user.id,
        p_details: {
          created_user_email: userData.email,
          roles: userData.roles,
          via_edge_function: true
        }
      })
    } catch (logError) {
      console.warn('Erro ao registrar log:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-user-admin:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})