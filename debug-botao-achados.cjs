#!/usr/bin/env node

/**
 * Script para debugar o problema específico do botão "achados" no card AUD-2025-003
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function debugAchadosButton() {
  console.log('🔍 Debugando botão "achados" no card AUD-2025-003...\n');

  try {
    // 1. Verificar se o projeto AUD-2025-003 existe
    console.log('1. Verificando projeto AUD-2025-003...');
    const { data: project, error: projectError } = await supabase
      .from('projetos_auditoria')
      .select('*')
      .eq('codigo', 'AUD-2025-003')
      .single();

    if (projectError) {
      console.error('❌ Erro ao buscar projeto:', projectError.message);
      return;
    }

    if (!project) {
      console.log('❌ Projeto AUD-2025-003 não encontrado');
      return;
    }

    console.log('✅ Projeto encontrado:', project.codigo, '-', project.titulo);
    console.log('   Fase atual:', project.fase_atual);
    console.log('   Fases visitadas:', project.fases_visitadas);
    console.log('   Completude achados:', project.completude_achados, '%');

    // 2. Verificar se a tabela apontamentos_auditoria existe
    console.log('\n2. Verificando tabela apontamentos_auditoria...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('apontamentos_auditoria')
      .select('count(*)')
      .eq('projeto_id', project.id)
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao acessar tabela apontamentos_auditoria:', tableError.message);
      console.log('   Isso pode indicar que a tabela não existe ou há problema de permissão');
    } else {
      console.log('✅ Tabela apontamentos_auditoria acessível');
      console.log('   Achados no projeto:', tableCheck?.[0]?.count || 0);
    }

    // 3. Verificar se há problemas de permissão
    console.log('\n3. Testando operações na fase achados...');
    
    // Simular carregamento da fase achados
    const { data: achados, error: achadosError } = await supabase
      .from('apontamentos_auditoria')
      .select('*')
      .eq('projeto_id', project.id)
      .order('created_at', { ascending: false });

    if (achadosError) {
      console.log('❌ Erro ao carregar achados:', achadosError.message);
      console.log('   Código do erro:', achadosError.code);
      console.log('   Detalhes:', achadosError.details);
    } else {
      console.log('✅ Achados carregados com sucesso');
      console.log('   Total de achados:', achados?.length || 0);
    }

    // 4. Verificar configuração do tenant
    console.log('\n4. Verificando configuração do tenant...');
    console.log('   Tenant ID do projeto:', project.tenant_id);
    
    // 5. Simular navegação para fase achados
    console.log('\n5. Simulando navegação para fase achados...');
    const { error: updateError } = await supabase
      .from('projetos_auditoria')
      .update({
        fase_atual: 'achados',
        fases_visitadas: [...new Set([...(project.fases_visitadas || []), 'achados'])],
        updated_at: new Date().toISOString()
      })
      .eq('id', project.id);

    if (updateError) {
      console.log('❌ Erro ao atualizar fase para achados:', updateError.message);
    } else {
      console.log('✅ Navegação para fase achados simulada com sucesso');
    }

    // 6. Verificar estado final
    console.log('\n6. Verificando estado final...');
    const { data: finalProject, error: finalError } = await supabase
      .from('projetos_auditoria')
      .select('fase_atual, fases_visitadas, completude_achados')
      .eq('id', project.id)
      .single();

    if (finalError) {
      console.log('❌ Erro ao verificar estado final:', finalError.message);
    } else {
      console.log('✅ Estado final verificado:');
      console.log('   Fase atual:', finalProject.fase_atual);
      console.log('   Fases visitadas:', finalProject.fases_visitadas);
      console.log('   Completude achados:', finalProject.completude_achados, '%');
    }

    // 7. Diagnóstico e recomendações
    console.log('\n📋 DIAGNÓSTICO:');
    
    if (project.fase_atual !== 'achados' && !project.fases_visitadas?.includes('achados')) {
      console.log('⚠️  Fase "achados" não está nas fases visitadas');
      console.log('   Recomendação: Adicionar "achados" às fases visitadas');
    }
    
    if (project.completude_achados === 0) {
      console.log('⚠️  Completude da fase achados é 0%');
      console.log('   Recomendação: Definir completude inicial para facilitar navegação');
    }
    
    if (tableError) {
      console.log('❌ Problema crítico: Tabela apontamentos_auditoria inacessível');
      console.log('   Recomendação: Verificar se a tabela existe e as permissões RLS');
    }

    console.log('\n🎯 SOLUÇÕES RECOMENDADAS:');
    console.log('1. Garantir que "achados" esteja nas fases_visitadas');
    console.log('2. Definir completude_achados > 0 para indicar progresso');
    console.log('3. Verificar se a tabela apontamentos_auditoria existe');
    console.log('4. Testar navegação no frontend com console aberto (F12)');
    console.log('5. Verificar logs de erro no navegador');

  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  }
}

// Executar debug
debugAchadosButton();