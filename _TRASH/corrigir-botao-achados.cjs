#!/usr/bin/env node

/**
 * Script para corrigir especificamente o problema do botão "achados" no card AUD-2025-003
 */

const { execSync } = require('child_process');

console.log('🔧 Corrigindo problema do botão "achados" no card AUD-2025-003...\n');

try {
  // 1. Verificar estado atual do projeto
  console.log('1. Verificando estado atual do projeto AUD-2025-003...');
  execSync('node database-manager.cjs execute-sql "SELECT codigo, fase_atual, fases_visitadas, completude_achados FROM projetos_auditoria WHERE codigo = \'AUD-2025-003\';"', { stdio: 'inherit' });

  // 2. Garantir que a fase "achados" esteja nas fases visitadas
  console.log('\n2. Adicionando "achados" às fases visitadas...');
  execSync('node database-manager.cjs execute-sql "UPDATE projetos_auditoria SET fases_visitadas = \'[\\\"planejamento\\\", \\\"execucao\\\", \\\"achados\\\"]\', completude_achados = 30 WHERE codigo = \'AUD-2025-003\';"', { stdio: 'inherit' });

  // 3. Criar alguns achados de exemplo para teste
  console.log('\n3. Criando achados de exemplo para teste...');
  
  // Primeiro, obter o ID do projeto
  const projectIdResult = execSync('node database-manager.cjs execute-sql "SELECT id FROM projetos_auditoria WHERE codigo = \'AUD-2025-003\';"', { encoding: 'utf8' });
  
  // Criar achado de exemplo
  execSync(`node database-manager.cjs execute-sql "INSERT INTO apontamentos_auditoria (tenant_id, projeto_id, codigo, titulo, descricao, criticidade, categoria, causa_raiz, impacto, recomendacao, responsavel_area, valor_impacto, status) SELECT '46b1c048-85a1-423b-96fc-776007c8de1f', id, 'ACH-001', 'Achado de Teste - Controle de Acesso', 'Identificada falha no controle de acesso ao sistema', 'alta', 'controle_interno', 'Falta de segregação de funções', 'Risco de acesso não autorizado', 'Implementar controles de acesso adequados', 'TI', 15000.00, 'identificado' FROM projetos_auditoria WHERE codigo = 'AUD-2025-003' ON CONFLICT DO NOTHING;"`, { stdio: 'inherit' });

  execSync(`node database-manager.cjs execute-sql "INSERT INTO apontamentos_auditoria (tenant_id, projeto_id, codigo, titulo, descricao, criticidade, categoria, causa_raiz, impacto, recomendacao, responsavel_area, valor_impacto, status) SELECT '46b1c048-85a1-423b-96fc-776007c8de1f', id, 'ACH-002', 'Achado de Teste - Processo Financeiro', 'Processo de conciliação bancária inadequado', 'media', 'financeiro', 'Falta de procedimento formal', 'Possíveis divergências não identificadas', 'Criar procedimento formal de conciliação', 'Financeiro', 8000.00, 'validado' FROM projetos_auditoria WHERE codigo = 'AUD-2025-003' ON CONFLICT DO NOTHING;"`, { stdio: 'inherit' });

  // 4. Verificar se os achados foram criados
  console.log('\n4. Verificando achados criados...');
  execSync('node database-manager.cjs execute-sql "SELECT COUNT(*) as total_achados FROM apontamentos_auditoria WHERE projeto_id = (SELECT id FROM projetos_auditoria WHERE codigo = \'AUD-2025-003\');"', { stdio: 'inherit' });

  // 5. Verificar estado final
  console.log('\n5. Verificando estado final do projeto...');
  execSync('node database-manager.cjs execute-sql "SELECT codigo, fase_atual, fases_visitadas, completude_achados FROM projetos_auditoria WHERE codigo = \'AUD-2025-003\';"', { stdio: 'inherit' });

  console.log('\n✅ CORREÇÕES APLICADAS COM SUCESSO!');
  console.log('\n📋 Resumo das correções:');
  console.log('1. ✅ Fase "achados" adicionada às fases visitadas');
  console.log('2. ✅ Completude da fase achados definida como 30%');
  console.log('3. ✅ Achados de exemplo criados para teste');
  console.log('4. ✅ Projeto configurado corretamente');

  console.log('\n🧪 COMO TESTAR:');
  console.log('1. Acesse: http://localhost:8080/auditorias');
  console.log('2. Encontre o card "AUD-2025-003"');
  console.log('3. Expanda o card clicando na seta');
  console.log('4. Clique no botão "Achados" nas abas');
  console.log('5. Verifique se a navegação funciona e os achados aparecem');
  console.log('6. Abra o console do navegador (F12) para ver logs de debug');

  console.log('\n🔍 POSSÍVEIS PROBLEMAS RESTANTES:');
  console.log('- Se ainda não funcionar, verifique o console do navegador');
  console.log('- Pode haver problema de cache - tente Ctrl+F5');
  console.log('- Verifique se há erros de JavaScript no console');
  console.log('- Confirme se o componente FindingsPhase está sendo carregado');

} catch (error) {
  console.error('❌ Erro durante correção:', error.message);
  process.exit(1);
}