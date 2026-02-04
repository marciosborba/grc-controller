#!/usr/bin/env node

/**
 * Script para executar a limpeza de configurações globais do banco de dados
 * Este script remove todas as configurações globais que possam ter sido adicionadas
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis de ambiente');
    console.log('💡 Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY com a chave de serviço do Supabase');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeCleanup() {
    try {
        console.log('🧹 Iniciando limpeza de configurações globais...\n');

        // Ler o arquivo SQL
        const sqlFilePath = path.join(__dirname, 'remove_global_configurations.sql');
        
        if (!fs.existsSync(sqlFilePath)) {
            throw new Error(`Arquivo SQL não encontrado: ${sqlFilePath}`);
        }

        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log('📄 Arquivo SQL carregado com sucesso');
        console.log('⚠️  ATENÇÃO: Esta operação irá remover TODAS as configurações globais do banco de dados');
        
        // Confirmar execução
        if (process.argv.includes('--confirm')) {
            console.log('✅ Confirmação recebida via parâmetro --confirm');
        } else {
            console.log('❌ OPERAÇÃO CANCELADA');
            console.log('💡 Para executar a limpeza, use: node execute_global_config_cleanup.js --confirm');
            return;
        }

        console.log('\n🔄 Executando limpeza...');

        // Dividir o SQL em comandos individuais (separados por ponto e vírgula)
        const sqlCommands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < sqlCommands.length; i++) {
            const command = sqlCommands[i];
            
            if (command.includes('RAISE NOTICE') || command.includes('DO $$')) {
                // Pular comandos de notificação e blocos DO
                continue;
            }

            try {
                console.log(`📝 Executando comando ${i + 1}/${sqlCommands.length}...`);
                
                const { error } = await supabase.rpc('exec_sql', { 
                    sql_query: command + ';' 
                });

                if (error) {
                    console.log(`⚠️  Aviso no comando ${i + 1}: ${error.message}`);
                    // Não contar como erro se for algo esperado (tabela não existe, etc.)
                    if (!error.message.includes('does not exist') && 
                        !error.message.includes('não existe')) {
                        errorCount++;
                    }
                } else {
                    successCount++;
                }
            } catch (err) {
                console.log(`❌ Erro no comando ${i + 1}: ${err.message}`);
                errorCount++;
            }
        }

        console.log('\n📊 RELATÓRIO DE EXECUÇÃO:');
        console.log(`✅ Comandos executados com sucesso: ${successCount}`);
        console.log(`⚠️  Comandos com avisos/erros: ${errorCount}`);

        // Verificar se a limpeza foi bem-sucedida
        console.log('\n🔍 Verificando resultado da limpeza...');
        
        try {
            // Verificar se ainda existem tabelas relacionadas
            const { data: tables, error: tablesError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .or('table_name.like.%global%,table_name.like.%platform_config%');

            if (tablesError) {
                console.log('⚠️  Não foi possível verificar tabelas restantes');
            } else {
                const globalTables = tables?.filter(t => 
                    t.table_name.includes('global') || 
                    t.table_name.includes('platform_config')
                ) || [];
                
                console.log(`📋 Tabelas relacionadas restantes: ${globalTables.length}`);
                if (globalTables.length > 0) {
                    globalTables.forEach(t => console.log(`   - ${t.table_name}`));
                }
            }

            // Verificar configurações nos tenants
            const { data: tenants, error: tenantsError } = await supabase
                .from('tenants')
                .select('id, settings')
                .not('settings', 'is', null);

            if (tenantsError) {
                console.log('⚠️  Não foi possível verificar configurações dos tenants');
            } else {
                const tenantsWithGlobalConfig = tenants?.filter(t => {
                    const settings = JSON.stringify(t.settings || {});
                    return settings.includes('global') || settings.includes('platform');
                }) || [];
                
                console.log(`🏢 Tenants com configurações globais restantes: ${tenantsWithGlobalConfig.length}`);
            }

        } catch (verificationError) {
            console.log('⚠️  Erro na verificação final:', verificationError.message);
        }

        console.log('\n✅ LIMPEZA CONCLUÍDA!');
        console.log('💡 Verifique os logs acima para detalhes sobre a operação');

    } catch (error) {
        console.error('\n❌ ERRO DURANTE A LIMPEZA:', error.message);
        console.error('📋 Stack trace:', error.stack);
        process.exit(1);
    }
}

// Função auxiliar para criar a função exec_sql se não existir
async function ensureExecSqlFunction() {
    const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
        RETURNS TEXT
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE sql_query;
            RETURN 'SUCCESS';
        EXCEPTION WHEN OTHERS THEN
            RETURN 'ERROR: ' || SQLERRM;
        END;
        $$;
    `;

    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: createFunctionSQL });
        if (error && !error.message.includes('already exists')) {
            console.log('⚠️  Aviso ao criar função auxiliar:', error.message);
        }
    } catch (err) {
        // Função pode não existir ainda, tentaremos criar via SQL direto
        console.log('📝 Criando função auxiliar para execução SQL...');
    }
}

// Executar o script
if (require.main === module) {
    ensureExecSqlFunction().then(() => {
        executeCleanup();
    });
}

module.exports = { executeCleanup };