import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized_data?: any;
}

interface AuditProjectData {
  codigo: string;
  titulo: string;
  descricao?: string;
  universo_auditavel_id: string;
  tipo_auditoria: string;
  data_inicio: string;
  data_fim_planejada: string;
  chefe_auditoria: string;
  horas_orcadas: number;
  tenant_id: string;
}

function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>&"']/g, (match) => {
      const escape: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escape[match];
    })
    .trim();
}

function validateProjectData(data: AuditProjectData): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};

  // Validação e sanitização do código
  if (!data.codigo || data.codigo.trim().length === 0) {
    errors.push('Código é obrigatório');
  } else if (data.codigo.length > 50) {
    errors.push('Código deve ter no máximo 50 caracteres');
  } else {
    sanitized.codigo = sanitizeString(data.codigo);
  }

  // Validação e sanitização do título
  if (!data.titulo || data.titulo.trim().length === 0) {
    errors.push('Título é obrigatório');
  } else if (data.titulo.length > 200) {
    errors.push('Título deve ter no máximo 200 caracteres');
  } else {
    sanitized.titulo = sanitizeString(data.titulo);
  }

  // Validação de descrição (opcional)
  if (data.descricao) {
    if (data.descricao.length > 1000) {
      errors.push('Descrição deve ter no máximo 1000 caracteres');
    } else {
      sanitized.descricao = sanitizeString(data.descricao);
    }
  }

  // Validação de universo auditável
  if (!data.universo_auditavel_id) {
    errors.push('Universo auditável é obrigatório');
  } else {
    // Validar UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.universo_auditavel_id)) {
      errors.push('ID do universo auditável inválido');
    } else {
      sanitized.universo_auditavel_id = data.universo_auditavel_id;
    }
  }

  // Validação de tipo de auditoria
  const tiposValidos = ['interna', 'externa', 'regulatoria', 'especial'];
  if (!data.tipo_auditoria || !tiposValidos.includes(data.tipo_auditoria)) {
    errors.push('Tipo de auditoria deve ser: interna, externa, regulatoria ou especial');
  } else {
    sanitized.tipo_auditoria = data.tipo_auditoria;
  }

  // Validação de datas
  const dataInicio = new Date(data.data_inicio);
  const dataFim = new Date(data.data_fim_planejada);
  
  if (isNaN(dataInicio.getTime())) {
    errors.push('Data de início inválida');
  } else {
    sanitized.data_inicio = data.data_inicio;
  }

  if (isNaN(dataFim.getTime())) {
    errors.push('Data de fim planejada inválida');
  } else if (dataFim <= dataInicio) {
    errors.push('Data de fim deve ser posterior à data de início');
  } else {
    sanitized.data_fim_planejada = data.data_fim_planejada;
  }

  // Validação de chefe de auditoria
  if (!data.chefe_auditoria) {
    errors.push('Chefe de auditoria é obrigatório');
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.chefe_auditoria)) {
      errors.push('ID do chefe de auditoria inválido');
    } else {
      sanitized.chefe_auditoria = data.chefe_auditoria;
    }
  }

  // Validação de horas orçadas
  if (typeof data.horas_orcadas !== 'number' || data.horas_orcadas < 0) {
    errors.push('Horas orçadas deve ser um número positivo');
  } else if (data.horas_orcadas > 10000) {
    errors.push('Horas orçadas não pode exceder 10.000 horas');
  } else {
    sanitized.horas_orcadas = data.horas_orcadas;
  }

  // Validação de tenant_id
  if (!data.tenant_id) {
    errors.push('Tenant ID é obrigatório');
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.tenant_id)) {
      errors.push('Tenant ID inválido');
    } else {
      sanitized.tenant_id = data.tenant_id;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized_data: errors.length === 0 ? sanitized : undefined
  };
}

async function validateBusinessRules(supabase: any, data: AuditProjectData): Promise<string[]> {
  const errors: string[] = [];

  try {
    // Verificar se código já existe para o tenant
    const { data: existing, error: existingError } = await supabase
      .from('projetos_auditoria')
      .select('id')
      .eq('codigo', data.codigo)
      .eq('tenant_id', data.tenant_id)
      .maybeSingle();

    if (existingError) {
      console.error('Erro ao verificar código existente:', existingError);
    } else if (existing) {
      errors.push('Já existe um projeto com este código');
    }

    // Verificar se universo auditável existe e está ativo
    const { data: universo, error: universoError } = await supabase
      .from('universo_auditavel')
      .select('status')
      .eq('id', data.universo_auditavel_id)
      .eq('tenant_id', data.tenant_id)
      .maybeSingle();

    if (universoError) {
      console.error('Erro ao verificar universo auditável:', universoError);
      errors.push('Erro ao validar universo auditável');
    } else if (!universo) {
      errors.push('Universo auditável não encontrado');
    } else if (universo.status !== 'ativo') {
      errors.push('Universo auditável deve estar ativo');
    }

    // Verificar se chefe de auditoria existe e pertence ao tenant
    const { data: chefe, error: chefeError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.chefe_auditoria)
      .eq('tenant_id', data.tenant_id)
      .maybeSingle();

    if (chefeError) {
      console.error('Erro ao verificar chefe de auditoria:', chefeError);
      errors.push('Erro ao validar chefe de auditoria');
    } else if (!chefe) {
      errors.push('Chefe de auditoria não encontrado ou não pertence ao tenant');
    }

  } catch (error) {
    console.error('Erro na validação de regras de negócio:', error);
    errors.push('Erro interno na validação');
  }

  return errors;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: requestData } = await req.json()
    
    // Validação básica e sanitização
    const validation = validateProjectData(requestData);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: validation.errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    // Validação de regras de negócio
    const businessErrors = await validateBusinessRules(supabaseClient, requestData);
    
    if (businessErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: businessErrors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        sanitized_data: validation.sanitized_data,
        message: 'Dados validados com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro na função de validação:', error)
    return new Response(
      JSON.stringify({
        success: false,
        errors: ['Erro interno do servidor']
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})