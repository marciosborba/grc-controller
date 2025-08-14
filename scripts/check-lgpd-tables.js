#!/usr/bin/env node
/**
 * Script para verificar se as tabelas do módulo LGPD existem
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

const lgpdTables = [
  'data_discovery_sources',
  'data_discovery_results', 
  'data_inventory',
  'legal_bases',
  'consents',
  'processing_activities',
  'dpia_assessments',
  'data_subject_requests',
  'privacy_incidents',
  'anpd_communications',
  'privacy_training',
  'privacy_audits'
];

async function checkTables() {
  console.log('🔍 Verificando tabelas do módulo LGPD...\n');

  for (const table of lgpdTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  // Verificar tabelas existentes
  console.log('\n📋 Listando todas as tabelas disponíveis...');
  try {
    const { data, error } = await supabase.rpc('get_table_names');
    if (data) {
      console.log('Tabelas encontradas:', data);
    } else {
      console.log('Erro ao listar tabelas:', error);
    }
  } catch (err) {
    console.log('Erro:', err.message);
  }
}

checkTables();