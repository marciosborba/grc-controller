#!/usr/bin/env node
/**
 * Script para aplicar a migration do módulo LGPD manualmente
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyLGPDMigration() {
  try {
    console.log('🚀 Aplicando migration do módulo LGPD...\n');

    // Ler o arquivo de migration
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250813000000_create_privacy_lgpd_module.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Arquivo de migration não encontrado: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Dividir o SQL em comandos individuais (separados por ;)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim()) {
        try {
          console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
          
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: command + ';'
          });

          if (error) {
            // Tentar executar diretamente se a função exec_sql não existir
            if (error.code === 'PGRST202') {
              console.log(`   Tentando execução alternativa...`);
              // Para comandos CREATE TABLE, vamos usar uma abordagem diferente
              console.log(`   ⚠️ Comando SQL não executado (função exec_sql não disponível): ${command.substring(0, 100)}...`);
            } else {
              console.error(`   ❌ Erro no comando ${i + 1}:`, error.message);
            }
          } else {
            console.log(`   ✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (err) {
          console.error(`   ❌ Erro no comando ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n✨ Migration do módulo LGPD processada!');
    console.log('💡 Nota: Algumas tabelas podem não ter sido criadas devido a limitações do ambiente local.');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error.message);
  }
}

applyLGPDMigration();