#!/usr/bin/env node

/**
 * Script para verificar tabelas de IA no banco PostgreSQL via database-manager.cjs
 */

const { spawn } = require('child_process');

function runDatabaseCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['database-manager.cjs', 'execute-sql', command], {
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Command failed with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('🔍 Verificando tabelas de IA no banco PostgreSQL...\n');

  try {
    // 1. Listar tabelas relacionadas a IA
    console.log('📋 1. Verificando tabelas relacionadas a IA...');
    const tablesQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%ai%' OR table_name LIKE '%prompt%' OR table_name LIKE '%mcp%')
      ORDER BY table_name;
    `;
    
    const tablesResult = await runDatabaseCommand(tablesQuery);
    console.log('Resultado:\n', tablesResult);

    // 2. Verificar ai_grc_prompt_templates especificamente
    console.log('\n📝 2. Verificando tabela ai_grc_prompt_templates...');
    const promptsQuery = `
      SELECT COUNT(*) as total_prompts,
             COUNT(*) FILTER (WHERE is_active = true) as active_prompts
      FROM ai_grc_prompt_templates;
    `;
    
    try {
      const promptsResult = await runDatabaseCommand(promptsQuery);
      console.log('Resultado:\n', promptsResult);

      // Se há prompts, mostrar os primeiros
      const samplePromptsQuery = `
        SELECT id, name, category, is_active, created_at
        FROM ai_grc_prompt_templates
        ORDER BY created_at DESC
        LIMIT 5;
      `;
      
      const sampleResult = await runDatabaseCommand(samplePromptsQuery);
      console.log('\n📄 Exemplos de prompts:');
      console.log(sampleResult);

    } catch (err) {
      console.log('❌ Tabela ai_grc_prompt_templates não existe ou está vazia');
    }

    // 3. Verificar ai_module_prompts
    console.log('\n📝 3. Verificando tabela ai_module_prompts...');
    const modulePromptsQuery = `
      SELECT COUNT(*) as total_prompts,
             COUNT(*) FILTER (WHERE is_active = true) as active_prompts
      FROM ai_module_prompts;
    `;
    
    try {
      const moduleResult = await runDatabaseCommand(modulePromptsQuery);
      console.log('Resultado:\n', moduleResult);

      const sampleModuleQuery = `
        SELECT id, prompt_name, module_name, is_active, created_at
        FROM ai_module_prompts
        ORDER BY created_at DESC
        LIMIT 5;
      `;
      
      const sampleModuleResult = await runDatabaseCommand(sampleModuleQuery);
      console.log('\n📄 Exemplos de prompts de módulo:');
      console.log(sampleModuleResult);

    } catch (err) {
      console.log('❌ Tabela ai_module_prompts não existe ou está vazia');
    }

    // 4. Verificar mcp_providers
    console.log('\n🖥️ 4. Verificando tabela mcp_providers...');
    const mcpQuery = `
      SELECT COUNT(*) as total_providers,
             COUNT(*) FILTER (WHERE integration_id IS NOT NULL) as with_integration
      FROM mcp_providers;
    `;
    
    try {
      const mcpResult = await runDatabaseCommand(mcpQuery);
      console.log('Resultado:\n', mcpResult);

      const sampleMcpQuery = `
        SELECT id, name, provider_type, model, created_at
        FROM mcp_providers
        ORDER BY created_at DESC
        LIMIT 3;
      `;
      
      const sampleMcpResult = await runDatabaseCommand(sampleMcpQuery);
      console.log('\n🖥️ Exemplos de provedores MCP:');
      console.log(sampleMcpResult);

    } catch (err) {
      console.log('❌ Tabela mcp_providers não existe ou está vazia');
    }

    // 5. Verificar ai_grc_providers
    console.log('\n🎯 5. Verificando tabela ai_grc_providers...');
    const grcProvidersQuery = `
      SELECT COUNT(*) as total_providers,
             COUNT(*) FILTER (WHERE is_active = true) as active_providers
      FROM ai_grc_providers;
    `;
    
    try {
      const grcResult = await runDatabaseCommand(grcProvidersQuery);
      console.log('Resultado:\n', grcResult);

    } catch (err) {
      console.log('❌ Tabela ai_grc_providers não existe ou está vazia');
    }

  } catch (error) {
    console.error('💥 Erro ao executar verificação:', error.message);
  }
}

main().catch(console.error);