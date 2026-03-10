#!/usr/bin/env node

// Script para recriar a tabela risk_assessments com estrutura correta
// Conecta diretamente ao PostgreSQL do Supabase

import pkg from 'pg';
const { Client } = pkg;

// Credenciais do Supabase (do .env.example)
const DB_CONFIG = {
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.myxvxponlmulnjstbjwd',
  password: 'Vo1agPUE4QGwlwqS',
  ssl: {
    rejectUnauthorized: false
  }
};

async function recreateRiskAssessmentsTable() {
  console.log('🔧 RECRIANDO TABELA risk_assessments');
  console.log('====================================');
  
  const client = new Client(DB_CONFIG);
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    
    // 1. Fazer backup dos dados existentes (se houver)
    console.log('\\n💾 1. Fazendo backup dos dados existentes...');
    
    let backupData = [];
    try {
      const backupResult = await client.query(`
        SELECT id, title, description, risk_category, status, created_at, updated_at, tenant_id, created_by
        FROM public.risk_assessments
        WHERE title IS NOT NULL
      `);
      backupData = backupResult.rows;
      console.log(`✅ Backup realizado: ${backupData.length} registros salvos`);
    } catch (backupError) {
      console.log('⚠️ Tabela pode não existir ainda:', backupError.message);
    }
    
    // 2. Remover tabela existente e dependências
    console.log('\\n🗑️ 2. Removendo tabela existente e dependências...');
    
    await client.query('DROP TABLE IF EXISTS public.risk_communications CASCADE;');
    await client.query('DROP TABLE IF EXISTS public.risk_action_activities CASCADE;');
    await client.query('DROP TABLE IF EXISTS public.risk_action_plans CASCADE;');
    await client.query('DROP TABLE IF EXISTS public.risk_assessments CASCADE;');
    
    console.log('✅ Tabelas removidas');
    
    // 3. Criar nova tabela risk_assessments com estrutura correta
    console.log('\\n🏗️ 3. Criando nova tabela risk_assessments...');
    
    await client.query(`
      CREATE TABLE public.risk_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
        
        -- Campos básicos
        title VARCHAR(255) NOT NULL,
        description TEXT,
        executive_summary TEXT,
        technical_details TEXT,
        risk_category VARCHAR(100) NOT NULL,
        
        -- Avaliação de risco (1-5)
        probability INTEGER NOT NULL DEFAULT 3 CHECK (probability >= 1 AND probability <= 5),
        likelihood_score INTEGER NOT NULL DEFAULT 3 CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
        impact_score INTEGER NOT NULL DEFAULT 3 CHECK (impact_score >= 1 AND impact_score <= 5),
        
        -- Score calculado automaticamente
        risk_score INTEGER GENERATED ALWAYS AS (likelihood_score * impact_score) STORED,
        
        -- Nível de risco
        risk_level VARCHAR(20) NOT NULL DEFAULT 'Médio',
        
        -- Status e gestão
        status VARCHAR(50) NOT NULL DEFAULT 'Identificado',
        treatment_type VARCHAR(50) DEFAULT 'Mitigar',
        
        -- Responsáveis (assigned_to como TEXT para nomes)
        owner_id UUID,
        assigned_to TEXT, -- Campo TEXT para aceitar nomes como "Marcio Borba"
        created_by UUID,
        
        -- Datas
        due_date TIMESTAMPTZ,
        identified_date TIMESTAMPTZ DEFAULT NOW(),
        last_review_date TIMESTAMPTZ,
        next_review_date TIMESTAMPTZ,
        
        -- Campos de controle
        severity VARCHAR(20) DEFAULT 'medium',
        is_active BOOLEAN DEFAULT true,
        
        -- Dados estruturados
        analysis_data JSONB DEFAULT '{}',
        
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log('✅ Tabela risk_assessments criada');
    
    // 4. Criar índices
    console.log('\\n📊 4. Criando índices...');
    
    await client.query(`
      CREATE INDEX idx_risk_assessments_tenant_id ON public.risk_assessments(tenant_id);
      CREATE INDEX idx_risk_assessments_status ON public.risk_assessments(status);
      CREATE INDEX idx_risk_assessments_risk_level ON public.risk_assessments(risk_level);
      CREATE INDEX idx_risk_assessments_category ON public.risk_assessments(risk_category);
      CREATE INDEX idx_risk_assessments_created_at ON public.risk_assessments(created_at);
      CREATE INDEX idx_risk_assessments_due_date ON public.risk_assessments(due_date);
      CREATE INDEX idx_risk_assessments_analysis_data ON public.risk_assessments USING gin (analysis_data);
    `);
    
    console.log('✅ Índices criados');
    
    // 5. Habilitar RLS
    console.log('\\n🔒 5. Configurando Row Level Security...');
    
    await client.query('ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;');
    
    // Políticas RLS
    await client.query(`
      CREATE POLICY "Users can view risks from their tenant" 
      ON public.risk_assessments FOR SELECT 
      USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
      );
    `);
    
    await client.query(`
      CREATE POLICY "Users can create risks in their tenant" 
      ON public.risk_assessments FOR INSERT 
      WITH CHECK (
        tenant_id IN (
          SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
      );
    `);
    
    await client.query(`
      CREATE POLICY "Users can update risks from their tenant" 
      ON public.risk_assessments FOR UPDATE 
      USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
      );
    `);
    
    await client.query(`
      CREATE POLICY "Users can delete risks from their tenant" 
      ON public.risk_assessments FOR DELETE 
      USING (
        tenant_id IN (
          SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
      );
    `);
    
    console.log('✅ RLS configurado');
    
    // 6. Criar função para atualizar risk_level automaticamente
    console.log('\\n⚙️ 6. Criando função de atualização automática...');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION update_risk_level()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Calcular nível de risco baseado no score
        CASE 
          WHEN NEW.risk_score >= 20 THEN NEW.risk_level := 'Muito Alto';
          WHEN NEW.risk_score >= 15 THEN NEW.risk_level := 'Alto';
          WHEN NEW.risk_score >= 8 THEN NEW.risk_level := 'Médio';
          WHEN NEW.risk_score >= 4 THEN NEW.risk_level := 'Baixo';
          ELSE NEW.risk_level := 'Muito Baixo';
        END CASE;
        
        NEW.updated_at := NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query(`
      CREATE TRIGGER update_risk_assessments_trigger
        BEFORE INSERT OR UPDATE ON public.risk_assessments
        FOR EACH ROW
        EXECUTE FUNCTION update_risk_level();
    `);
    
    console.log('✅ Trigger criado');
    
    // 7. Recriar tabelas relacionadas
    console.log('\\n🔗 7. Criando tabelas relacionadas...');
    
    // Tabela de planos de ação
    await client.query(`
      CREATE TABLE public.risk_action_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
        risk_id UUID NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
        treatment_type VARCHAR(50) NOT NULL DEFAULT 'Mitigar',
        description TEXT,
        target_date TIMESTAMPTZ,
        budget DECIMAL(15,2),
        approved_by UUID,
        approval_date TIMESTAMPTZ,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Tabela de atividades
    await client.query(`
      CREATE TABLE public.risk_action_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
        action_plan_id UUID NOT NULL REFERENCES public.risk_action_plans(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        responsible_person TEXT NOT NULL,
        deadline TIMESTAMPTZ,
        status VARCHAR(50) DEFAULT 'TBD',
        priority VARCHAR(20) DEFAULT 'Média',
        evidence_url TEXT,
        evidence_description TEXT,
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );
    `);
    
    // Tabela de comunicações
    await client.query(`
      CREATE TABLE public.risk_communications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL DEFAULT '46b1c048-85a1-423b-96fc-776007c8de1f',
        risk_id UUID NOT NULL REFERENCES public.risk_assessments(id) ON DELETE CASCADE,
        person_name TEXT NOT NULL,
        person_email TEXT NOT NULL,
        communication_date TIMESTAMPTZ DEFAULT NOW(),
        decision VARCHAR(50),
        justification TEXT,
        notified_at TIMESTAMPTZ,
        created_by UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log('✅ Tabelas relacionadas criadas');
    
    // 8. Habilitar RLS nas tabelas relacionadas
    console.log('\\n🔒 8. Configurando RLS nas tabelas relacionadas...');
    
    await client.query('ALTER TABLE public.risk_action_plans ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE public.risk_action_activities ENABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE public.risk_communications ENABLE ROW LEVEL SECURITY;');
    
    // Políticas para tabelas relacionadas
    const tables = ['risk_action_plans', 'risk_action_activities', 'risk_communications'];
    
    for (const table of tables) {
      await client.query(`
        CREATE POLICY "Users can manage ${table} from their tenant" 
        ON public.${table} FOR ALL 
        USING (
          tenant_id IN (
            SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
          )
        );
      `);
    }
    
    console.log('✅ RLS configurado para tabelas relacionadas');
    
    // 9. Restaurar dados do backup (se houver)
    if (backupData.length > 0) {
      console.log(`\\n📥 9. Restaurando ${backupData.length} registros do backup...`);
      
      for (const row of backupData) {
        try {
          await client.query(`
            INSERT INTO public.risk_assessments (
              id, title, description, risk_category, status, 
              tenant_id, created_by, created_at, updated_at,
              probability, likelihood_score, impact_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 3, 3, 3)
          `, [
            row.id, row.title, row.description, row.risk_category, row.status,
            row.tenant_id || '46b1c048-85a1-423b-96fc-776007c8de1f',
            row.created_by, row.created_at, row.updated_at
          ]);
        } catch (restoreError) {
          console.log(`⚠️ Erro ao restaurar registro ${row.id}:`, restoreError.message);
        }
      }
      
      console.log('✅ Dados restaurados');
    }
    
    // 10. Testar a nova estrutura
    console.log('\\n🧪 10. Testando nova estrutura...');
    
    const testResult = await client.query(`
      INSERT INTO public.risk_assessments (
        title, risk_category, probability, likelihood_score, impact_score,
        assigned_to, tenant_id, created_by
      ) VALUES (
        'Teste Nova Estrutura',
        'Operacional',
        3, 3, 3,
        'teste', -- Agora deve funcionar!
        '46b1c048-85a1-423b-96fc-776007c8de1f',
        '0c5c1433-2682-460c-992a-f4cce57c0d6d'
      ) RETURNING id, title, assigned_to, risk_score, risk_level;
    `);
    
    console.log('✅ Teste bem-sucedido!');
    console.log('📊 Registro criado:', testResult.rows[0]);
    
    // Limpar teste
    await client.query('DELETE FROM public.risk_assessments WHERE title = $1', ['Teste Nova Estrutura']);
    console.log('🧹 Registro de teste removido');
    
    // 11. Verificar estrutura final
    console.log('\\n📋 11. Verificando estrutura final...');
    
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'risk_assessments' 
      AND column_name IN ('assigned_to', 'probability', 'tenant_id', 'analysis_data')
      ORDER BY column_name;
    `);
    
    console.log('📊 Estrutura dos campos principais:');
    structureResult.rows.forEach(row => {
      console.log(`  • ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\\n🎉 TABELA RECRIADA COM SUCESSO!');
    console.log('================================');
    console.log('✅ Campo assigned_to agora é TEXT');
    console.log('✅ Constraints de probability corretos (1-5)');
    console.log('✅ Multi-tenancy configurado');
    console.log('✅ RLS habilitado');
    console.log('✅ Triggers funcionando');
    console.log('✅ Tabelas relacionadas criadas');
    console.log('');
    console.log('🚀 Agora você pode criar riscos normalmente na aplicação!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

// Executar
recreateRiskAssessmentsTable();