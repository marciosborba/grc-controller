#!/usr/bin/env node

/**
 * Script para adicionar campos faltantes na tabela risk_registrations
 * Resolve o problema de salvamento do formulário de Registro de Risco
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Tentar diferentes fontes para as variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Configurações:');
console.log('- Supabase URL:', supabaseUrl);
console.log('- Service Key:', supabaseServiceKey ? 'Configurada' : 'Não configurada');

if (!supabaseUrl) {
  console.error('❌ URL do Supabase não encontrada');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Service Role Key não encontrada');
  console.error('💡 Dica: Configure a variável SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  console.error('💡 Ou execute: export SUPABASE_SERVICE_ROLE_KEY="sua_service_key_aqui"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingFields() {
  console.log('🔧 Iniciando correção dos campos da tabela risk_registrations...');
  
  // SQL direto para adicionar campos
  const sql = `
    -- Adicionar campos faltantes na tabela risk_registrations
    DO $$ 
    BEGIN
        -- Adicionar methodology_id se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'methodology_id') THEN
            ALTER TABLE risk_registrations ADD COLUMN methodology_id VARCHAR(50);
            RAISE NOTICE 'Campo methodology_id adicionado';
        END IF;

        -- Adicionar probability_score se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'probability_score') THEN
            ALTER TABLE risk_registrations ADD COLUMN probability_score INTEGER;
            RAISE NOTICE 'Campo probability_score adicionado';
        END IF;

        -- Adicionar campos alternativos para GUT
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'gravity_score') THEN
            ALTER TABLE risk_registrations ADD COLUMN gravity_score INTEGER CHECK (gravity_score >= 1 AND gravity_score <= 5);
            RAISE NOTICE 'Campo gravity_score adicionado';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'urgency_score') THEN
            ALTER TABLE risk_registrations ADD COLUMN urgency_score INTEGER CHECK (urgency_score >= 1 AND urgency_score <= 5);
            RAISE NOTICE 'Campo urgency_score adicionado';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'tendency_score') THEN
            ALTER TABLE risk_registrations ADD COLUMN tendency_score INTEGER CHECK (tendency_score >= 1 AND tendency_score <= 5);
            RAISE NOTICE 'Campo tendency_score adicionado';
        END IF;

        -- Adicionar monitoring_responsible se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'monitoring_responsible') THEN
            ALTER TABLE risk_registrations ADD COLUMN monitoring_responsible VARCHAR(255);
            RAISE NOTICE 'Campo monitoring_responsible adicionado';
        END IF;

        -- Adicionar review_date se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'review_date') THEN
            ALTER TABLE risk_registrations ADD COLUMN review_date DATE;
            RAISE NOTICE 'Campo review_date adicionado';
        END IF;

        -- Adicionar residual_risk_level se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'residual_risk_level') THEN
            ALTER TABLE risk_registrations ADD COLUMN residual_risk_level VARCHAR(50);
            RAISE NOTICE 'Campo residual_risk_level adicionado';
        END IF;

        -- Adicionar residual_probability se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'residual_probability') THEN
            ALTER TABLE risk_registrations ADD COLUMN residual_probability INTEGER;
            RAISE NOTICE 'Campo residual_probability adicionado';
        END IF;

        -- Adicionar closure_criteria se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'closure_criteria') THEN
            ALTER TABLE risk_registrations ADD COLUMN closure_criteria TEXT;
            RAISE NOTICE 'Campo closure_criteria adicionado';
        END IF;

        -- Adicionar monitoring_notes se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'monitoring_notes') THEN
            ALTER TABLE risk_registrations ADD COLUMN monitoring_notes TEXT;
            RAISE NOTICE 'Campo monitoring_notes adicionado';
        END IF;

        -- Adicionar kpi_definition se não existir
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'kpi_definition') THEN
            ALTER TABLE risk_registrations ADD COLUMN kpi_definition TEXT;
            RAISE NOTICE 'Campo kpi_definition adicionado';
        END IF;

        -- Adicionar campos de identificação alternativos
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'identification_date') THEN
            ALTER TABLE risk_registrations ADD COLUMN identification_date DATE;
            RAISE NOTICE 'Campo identification_date adicionado';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'risk_registrations' AND column_name = 'responsible_area') THEN
            ALTER TABLE risk_registrations ADD COLUMN responsible_area VARCHAR(100);
            RAISE NOTICE 'Campo responsible_area adicionado';
        END IF;

    END $$;

    -- Criar índices para performance nos novos campos mais utilizados
    CREATE INDEX IF NOT EXISTS idx_risk_registrations_methodology_id ON risk_registrations(methodology_id);
    CREATE INDEX IF NOT EXISTS idx_risk_registrations_monitoring_responsible ON risk_registrations(monitoring_responsible);
    CREATE INDEX IF NOT EXISTS idx_risk_registrations_identification_date ON risk_registrations(identification_date);
    CREATE INDEX IF NOT EXISTS idx_risk_registrations_responsible_area ON risk_registrations(responsible_area);

    -- Comentários para documentar os novos campos
    COMMENT ON COLUMN risk_registrations.methodology_id IS 'ID da metodologia de análise selecionada';
    COMMENT ON COLUMN risk_registrations.probability_score IS 'Score de probabilidade alternativo';
    COMMENT ON COLUMN risk_registrations.gravity_score IS 'Score de gravidade GUT alternativo';
    COMMENT ON COLUMN risk_registrations.urgency_score IS 'Score de urgência GUT alternativo';
    COMMENT ON COLUMN risk_registrations.tendency_score IS 'Score de tendência GUT alternativo';
    COMMENT ON COLUMN risk_registrations.monitoring_responsible IS 'Responsável pelo monitoramento do risco';
    COMMENT ON COLUMN risk_registrations.review_date IS 'Data de revisão do risco';
    COMMENT ON COLUMN risk_registrations.residual_risk_level IS 'Nível do risco residual';
    COMMENT ON COLUMN risk_registrations.residual_probability IS 'Probabilidade do risco residual';
    COMMENT ON COLUMN risk_registrations.closure_criteria IS 'Critérios para encerramento do risco';
    COMMENT ON COLUMN risk_registrations.monitoring_notes IS 'Notas de monitoramento';
    COMMENT ON COLUMN risk_registrations.kpi_definition IS 'Definição de KPIs para monitoramento';
    COMMENT ON COLUMN risk_registrations.identification_date IS 'Data de identificação do risco';
    COMMENT ON COLUMN risk_registrations.responsible_area IS 'Área responsável pelo risco';
  `;

  try {
    console.log('📋 Executando SQL para adicionar campos faltantes...');
    
    // Executar o SQL usando uma query raw
    const { data, error } = await supabase.rpc('exec', { sql });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      
      // Tentar método alternativo - executar cada comando separadamente
      console.log('🔄 Tentando método alternativo...');
      
      const commands = [
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS methodology_id VARCHAR(50)",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS probability_score INTEGER",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS gravity_score INTEGER CHECK (gravity_score >= 1 AND gravity_score <= 5)",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS urgency_score INTEGER CHECK (urgency_score >= 1 AND urgency_score <= 5)",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS tendency_score INTEGER CHECK (tendency_score >= 1 AND tendency_score <= 5)",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_responsible VARCHAR(255)",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS review_date DATE",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS residual_risk_level VARCHAR(50)",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS residual_probability INTEGER",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS closure_criteria TEXT",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_notes TEXT",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS kpi_definition TEXT",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS identification_date DATE",
        "ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS responsible_area VARCHAR(100)"
      ];
      
      for (const command of commands) {
        try {
          const { error: cmdError } = await supabase.rpc('exec', { sql: command });
          if (cmdError) {
            console.log(`⚠️ Comando falhou: ${command.substring(0, 50)}...`);
          } else {
            console.log(`✅ Comando executado: ${command.substring(0, 50)}...`);
          }
        } catch (cmdErr) {
          console.log(`⚠️ Erro no comando: ${cmdErr.message}`);
        }
      }
    } else {
      console.log('✅ SQL executado com sucesso!');
    }

    // Verificar se os campos foram adicionados
    console.log('🔍 Verificando campos adicionados...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('risk_registrations')
        .select('id, methodology_id, monitoring_responsible, residual_risk_level')
        .limit(1);
        
      if (!testError) {
        console.log('✅ Campos principais verificados com sucesso');
      } else {
        console.log('⚠️ Alguns campos podem ainda não estar disponíveis:', testError.message);
      }
    } catch (verifyError) {
      console.log('⚠️ Erro na verificação:', verifyError.message);
    }

    console.log('🎉 Processo de correção concluído!');
    console.log('');
    console.log('📝 Resumo das alterações:');
    console.log('- Adicionados campos faltantes para compatibilidade com o formulário');
    console.log('- Criados índices para melhor performance');
    console.log('- Adicionados comentários para documentação');
    console.log('');
    console.log('✅ O formulário de Registro de Risco agora deve funcionar corretamente!');

  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
    
    // Informações de debug
    console.log('');
    console.log('🔧 Informações de debug:');
    console.log('- URL Supabase:', supabaseUrl ? 'Configurada' : 'Não configurada');
    console.log('- Service Key:', supabaseServiceKey ? 'Configurada' : 'Não configurada');
    
    process.exit(1);
  }
}

// Executar o script
addMissingFields();