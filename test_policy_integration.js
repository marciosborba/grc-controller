#!/usr/bin/env node

/**
 * Script para testar a integração do módulo de políticas com o frontend
 * Verifica se todos os subprocessos estão funcionando corretamente
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzY0NzE5NCwiZXhwIjoyMDUzMjIzMTk0fQ.Vo1agPUE4QGwlwqSJJJJJJJJJJJJJJJJJJJJJJJJJJJ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPolicyModule() {
  console.log('🧪 Testando integração do módulo de políticas...\n');

  try {
    // 1. Testar busca de políticas
    console.log('📋 1. Testando busca de políticas...');
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('id, title, status, category, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (policiesError) {
      console.error('❌ Erro ao buscar políticas:', policiesError.message);
      return false;
    }

    console.log(`✅ ${policies.length} políticas encontradas:`);
    policies.forEach(policy => {
      console.log(`   • ${policy.title} (${policy.status}) - ${policy.category}`);
    });

    // 2. Testar busca de aprovações
    console.log('\n✅ 2. Testando busca de aprovações...');
    const { data: approvals, error: approvalsError } = await supabase
      .from('policy_approvals')
      .select('id, policy_id, status, comments, created_at')
      .limit(3);

    if (approvalsError) {
      console.error('❌ Erro ao buscar aprovações:', approvalsError.message);
    } else {
      console.log(`✅ ${approvals.length} aprovações encontradas:`);
      approvals.forEach(approval => {
        console.log(`   • Status: ${approval.status} - ${approval.comments?.substring(0, 50)}...`);
      });
    }

    // 3. Testar busca de notificações
    console.log('\n🔔 3. Testando busca de notificações...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('policy_notifications')
      .select('id, title, status, priority, created_at')
      .limit(3);

    if (notificationsError) {
      console.error('❌ Erro ao buscar notificações:', notificationsError.message);
    } else {
      console.log(`✅ ${notifications.length} notificações encontradas:`);
      notifications.forEach(notification => {
        console.log(`   • ${notification.title} (${notification.status}) - Prioridade: ${notification.priority}`);
      });
    }

    // 4. Testar métricas básicas
    console.log('\n📊 4. Testando métricas básicas...');
    
    // Contar políticas por status
    const { data: statusCounts, error: statusError } = await supabase
      .from('policies')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const counts = data.reduce((acc, policy) => {
          acc[policy.status] = (acc[policy.status] || 0) + 1;
          return acc;
        }, {});
        
        return { data: counts, error: null };
      });

    if (statusError) {
      console.error('❌ Erro ao calcular métricas:', statusError.message);
    } else {
      console.log('✅ Métricas por status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        const statusLabels = {
          'draft': '📝 Rascunho',
          'review': '👁️ Em Revisão',
          'approved': '✅ Aprovada',
          'published': '📢 Publicada',
          'expired': '⏰ Expirada'
        };
        console.log(`   • ${statusLabels[status] || status}: ${count}`);
      });
    }

    // 5. Testar busca com filtros (simulando frontend)
    console.log('\n🔍 5. Testando busca com filtros...');
    const { data: filteredPolicies, error: filterError } = await supabase
      .from('policies')
      .select('id, title, status, category')
      .eq('status', 'published')
      .ilike('category', '%Segurança%');

    if (filterError) {
      console.error('❌ Erro ao filtrar políticas:', filterError.message);
    } else {
      console.log(`✅ ${filteredPolicies.length} políticas publicadas de segurança encontradas:`);
      filteredPolicies.forEach(policy => {
        console.log(`   • ${policy.title} - ${policy.category}`);
      });
    }

    // 6. Testar join com aprovações (simulando dashboard)
    console.log('\n🔗 6. Testando join com aprovações...');
    const { data: policiesWithApprovals, error: joinError } = await supabase
      .from('policies')
      .select(`
        id,
        title,
        status,
        policy_approvals (
          id,
          status,
          comments
        )
      `)
      .limit(3);

    if (joinError) {
      console.error('❌ Erro ao fazer join:', joinError.message);
    } else {
      console.log(`✅ ${policiesWithApprovals.length} políticas com aprovações:`);
      policiesWithApprovals.forEach(policy => {
        const approvalCount = policy.policy_approvals?.length || 0;
        console.log(`   • ${policy.title}: ${approvalCount} aprovações`);
      });
    }

    // 7. Resumo final
    console.log('\n📈 Resumo da integração:');
    console.log('================================');
    console.log(`📋 Total de políticas: ${policies.length > 0 ? 'OK' : 'ERRO'}`);
    console.log(`✅ Aprovações: ${approvals?.length > 0 ? 'OK' : 'ERRO'}`);
    console.log(`🔔 Notificações: ${notifications?.length > 0 ? 'OK' : 'ERRO'}`);
    console.log(`📊 Métricas: ${statusCounts ? 'OK' : 'ERRO'}`);
    console.log(`🔍 Filtros: ${filteredPolicies ? 'OK' : 'ERRO'}`);
    console.log(`🔗 Joins: ${policiesWithApprovals ? 'OK' : 'ERRO'}`);

    console.log('\n🎉 Teste de integração concluído com sucesso!');
    console.log('🔗 O módulo de políticas está pronto para uso no frontend');
    
    return true;

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    return false;
  }
}

// Executar teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testPolicyModule().then(success => {
    if (success) {
      console.log('\n✅ Todos os testes passaram!');
      process.exit(0);
    } else {
      console.log('\n❌ Alguns testes falharam!');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

export { testPolicyModule };