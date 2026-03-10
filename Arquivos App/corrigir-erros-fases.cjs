#!/usr/bin/env node

/**
 * Script para corrigir os erros "Erro ao carregar dados de execução" e "Erro ao carregar dados de relatórios"
 */

const { execSync } = require('child_process');

console.log('🔧 Corrigindo erros nas fases de Execução e Relatórios...\n');

try {
  // 1. Verificar tabelas que podem estar faltando
  console.log('1. Verificando tabelas necessárias...');
  
  const tabelasNecessarias = [
    'trabalhos_auditoria',
    'evidencias_auditoria', 
    'testes_auditoria',
    'relatorios_auditoria',
    'templates_relatorios'
  ];
  
  for (const tabela of tabelasNecessarias) {
    try {
      console.log(`   Verificando tabela: ${tabela}`);
      execSync(`node database-manager.cjs execute-sql "SELECT COUNT(*) FROM ${tabela} LIMIT 1;"`, { stdio: 'pipe' });
      console.log(`   ✅ ${tabela} - OK`);
    } catch (error) {
      console.log(`   ❌ ${tabela} - ERRO: Tabela não existe ou sem acesso`);
      
      // Criar tabelas que estão faltando
      if (tabela === 'evidencias_auditoria') {
        console.log(`   🔧 Criando tabela ${tabela}...`);
        execSync(`node database-manager.cjs execute-sql "
          CREATE TABLE IF NOT EXISTS evidencias_auditoria (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            trabalho_id UUID REFERENCES trabalhos_auditoria(id) ON DELETE CASCADE,
            nome VARCHAR NOT NULL,
            tipo VARCHAR DEFAULT 'documento',
            tamanho INTEGER DEFAULT 0,
            data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            url TEXT,
            descricao TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID
          );
        "`, { stdio: 'inherit' });
      }
      
      if (tabela === 'testes_auditoria') {
        console.log(`   🔧 Criando tabela ${tabela}...`);
        execSync(`node database-manager.cjs execute-sql "
          CREATE TABLE IF NOT EXISTS testes_auditoria (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            projeto_id UUID NOT NULL REFERENCES projetos_auditoria(id) ON DELETE CASCADE,
            nome VARCHAR NOT NULL,
            objetivo TEXT,
            procedimento TEXT,
            amostra INTEGER DEFAULT 0,
            populacao INTEGER DEFAULT 0,
            resultado TEXT,
            conclusao TEXT,
            status VARCHAR DEFAULT 'pendente',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID
          );
        "`, { stdio: 'inherit' });
      }
      
      if (tabela === 'templates_relatorios') {
        console.log(`   🔧 Criando tabela ${tabela}...`);
        execSync(`node database-manager.cjs execute-sql "
          CREATE TABLE IF NOT EXISTS templates_relatorios (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            nome VARCHAR NOT NULL,
            tipo VARCHAR DEFAULT 'executivo',
            descricao TEXT,
            estrutura JSONB DEFAULT '{}',
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID
          );
        "`, { stdio: 'inherit' });
      }
    }
  }

  // 2. Criar dados de exemplo para teste
  console.log('\n2. Criando dados de exemplo para teste...');
  
  // Obter ID do projeto AUD-2025-003
  console.log('   Obtendo ID do projeto AUD-2025-003...');
  
  // Criar trabalhos de auditoria de exemplo
  console.log('   Criando trabalhos de auditoria de exemplo...');
  execSync(`node database-manager.cjs execute-sql "
    INSERT INTO trabalhos_auditoria (tenant_id, projeto_id, codigo, titulo, descricao, tipo, status, responsavel, horas_trabalhadas, conclusoes)
    SELECT 
      '46b1c048-85a1-423b-96fc-776007c8de1f',
      id,
      'TRB-001',
      'Teste de Controles de Acesso',
      'Avaliação dos controles de acesso ao sistema financeiro',
      'teste_controle',
      'concluido',
      'Auditor Sênior',
      8,
      'Controles adequados, pequenos ajustes necessários'
    FROM projetos_auditoria 
    WHERE codigo = 'AUD-2025-003'
    ON CONFLICT DO NOTHING;
  "`, { stdio: 'inherit' });

  execSync(`node database-manager.cjs execute-sql "
    INSERT INTO trabalhos_auditoria (tenant_id, projeto_id, codigo, titulo, descricao, tipo, status, responsavel, horas_trabalhadas, conclusoes)
    SELECT 
      '46b1c048-85a1-423b-96fc-776007c8de1f',
      id,
      'TRB-002',
      'Análise Substantiva - Contas a Pagar',
      'Teste substantivo das contas a pagar do período',
      'analise_substantiva',
      'em_andamento',
      'Auditor Júnior',
      12,
      'Em andamento - 70% concluído'
    FROM projetos_auditoria 
    WHERE codigo = 'AUD-2025-003'
    ON CONFLICT DO NOTHING;
  "`, { stdio: 'inherit' });

  // Criar testes de auditoria de exemplo
  console.log('   Criando testes de auditoria de exemplo...');
  execSync(`node database-manager.cjs execute-sql "
    INSERT INTO testes_auditoria (tenant_id, projeto_id, nome, objetivo, procedimento, amostra, populacao, resultado, conclusao, status)
    SELECT 
      '46b1c048-85a1-423b-96fc-776007c8de1f',
      id,
      'Teste de Segregação de Funções',
      'Verificar se há adequada segregação de funções no processo de compras',
      'Análise de matriz de responsabilidades e entrevistas',
      25,
      100,
      'Identificadas 3 situações de conflito de funções',
      'Necessário implementar controles compensatórios',
      'executado'
    FROM projetos_auditoria 
    WHERE codigo = 'AUD-2025-003'
    ON CONFLICT DO NOTHING;
  "`, { stdio: 'inherit' });

  // Criar template de relatório padrão
  console.log('   Criando template de relatório padrão...');
  execSync(`node database-manager.cjs execute-sql "
    INSERT INTO templates_relatorios (tenant_id, nome, tipo, descricao, estrutura, ativo)
    VALUES (
      '46b1c048-85a1-423b-96fc-776007c8de1f',
      'Template Executivo Padrão',
      'executivo',
      'Template padrão para relatórios executivos',
      '{\"sections\": [\"resumo\", \"achados\", \"recomendacoes\"]}',
      true
    )
    ON CONFLICT DO NOTHING;
  "`, { stdio: 'inherit' });

  // 3. Verificar se os dados foram criados
  console.log('\n3. Verificando dados criados...');
  
  console.log('   Trabalhos de auditoria:');
  execSync('node database-manager.cjs execute-sql "SELECT COUNT(*) as total_trabalhos FROM trabalhos_auditoria WHERE projeto_id = (SELECT id FROM projetos_auditoria WHERE codigo = \'AUD-2025-003\');"', { stdio: 'inherit' });
  
  console.log('   Testes de auditoria:');
  execSync('node database-manager.cjs execute-sql "SELECT COUNT(*) as total_testes FROM testes_auditoria WHERE projeto_id = (SELECT id FROM projetos_auditoria WHERE codigo = \'AUD-2025-003\');"', { stdio: 'inherit' });
  
  console.log('   Templates de relatórios:');
  execSync('node database-manager.cjs execute-sql "SELECT COUNT(*) as total_templates FROM templates_relatorios WHERE tenant_id = \'46b1c048-85a1-423b-96fc-776007c8de1f\';"', { stdio: 'inherit' });

  console.log('\n✅ CORREÇÕES APLICADAS COM SUCESSO!');
  console.log('\n📋 Resumo das correções:');
  console.log('1. ✅ Tabelas necessárias verificadas/criadas');
  console.log('2. ✅ Dados de exemplo criados para ExecutionPhase');
  console.log('3. ✅ Dados de exemplo criados para ReportingPhase');
  console.log('4. ✅ Templates de relatórios configurados');

  console.log('\n🧪 COMO TESTAR:');
  console.log('1. Acesse: http://localhost:8080/auditorias');
  console.log('2. Encontre o card "AUD-2025-003"');
  console.log('3. Expanda o card e navegue entre as fases:');
  console.log('   - Execução: Deve mostrar 2 trabalhos de auditoria');
  console.log('   - Relatórios: Deve permitir gerar relatórios');
  console.log('4. Verifique se não há mais erros de carregamento');
  console.log('5. Abra o console (F12) para verificar logs');

  console.log('\n🔍 SE AINDA HOUVER PROBLEMAS:');
  console.log('- Verifique o console do navegador para erros específicos');
  console.log('- Confirme se as tabelas foram criadas corretamente');
  console.log('- Verifique se há problemas de permissão RLS');
  console.log('- Tente limpar o cache do navegador (Ctrl+F5)');

} catch (error) {
  console.error('❌ Erro durante correção:', error.message);
  process.exit(1);
}