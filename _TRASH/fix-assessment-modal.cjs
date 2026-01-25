#!/usr/bin/env node

/**
 * Script para corrigir problemas no modal de criação de assessment
 */

const fs = require('fs');
const path = require('path');

const filePath = 'src/components/assessments/AssessmentsDashboard.tsx';

console.log('🔧 Aplicando correções no modal de assessment...');

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Corrigir consulta de usuários - usar full_name em vez de nome
  console.log('📝 Corrigindo consulta de usuários...');
  content = content.replace(
    /\.select\('id, nome, email'\)/g,
    `.select('id, full_name, email')`
  );

  // 2. Mapear usuários para formato esperado
  content = content.replace(
    /if \(error\) throw error;\s+setAvailableUsers\(data \|\| \[\]\);/g,
    `if (error) throw error;
      
      // Mapear para o formato esperado pelo componente
      const mappedUsers = (data || []).map(user => ({
        id: user.id,
        nome: user.full_name,
        email: user.email
      }));
      
      setAvailableUsers(mappedUsers);`
  );

  // 3. Adicionar função para gerar código único
  console.log('📝 Adicionando geração de código único...');
  content = content.replace(
    /\/\/ Função para criar novo assessment/g,
    `// Função para gerar código único do assessment
  const generateAssessmentCode = () => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return \`ASS-\${timestamp}-\${random}\`;
  };

  // Função para criar novo assessment`
  );

  // 4. Corrigir dados do assessment para incluir código e campos obrigatórios
  console.log('📝 Corrigindo dados do assessment...');
  content = content.replace(
    /const assessmentData = \{[\s\S]*?updated_by: user\.id\s*\};/g,
    `// Gerar código único para o assessment
      const codigo = generateAssessmentCode();
      
      const assessmentData = {
        tenant_id: effectiveTenantId,
        codigo: codigo,
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        framework_id: assessmentType === 'framework' ? selectedFramework.id : null,
        responsavel_assessment: formData.responsavel_assessment,
        data_inicio: formData.data_inicio ? formData.data_inicio.toISOString().split('T')[0] : null,
        data_fim_planejada: formData.data_fim_planejada ? formData.data_fim_planejada.toISOString().split('T')[0] : null,
        status: 'planejado',
        fase_atual: 'preparacao',
        percentual_conclusao: 0,
        dominios_avaliados: 0,
        controles_avaliados: 0,
        controles_conformes: 0,
        controles_nao_conformes: 0,
        controles_parcialmente_conformes: 0,
        gaps_identificados: 0,
        configuracoes_especiais: {
          prioridade: formData.prioridade,
          tipo: assessmentType
        },
        created_by: user.id,
        updated_by: user.id
      };`
  );

  // 5. Adicionar logs de debug
  console.log('📝 Adicionando logs de debug...');
  content = content.replace(
    /const handleCreateAssessment = async \(\) => \{/g,
    `const handleCreateAssessment = async () => {
    console.log('🚀 Iniciando criação de assessment...');
    console.log('📋 Dados do formulário:', formData);
    console.log('🏢 Tenant ID:', effectiveTenantId);
    console.log('👤 Usuário:', user?.id);`
  );

  // Salvar arquivo corrigido
  fs.writeFileSync(filePath, content);
  console.log('✅ Correções aplicadas com sucesso!');

  console.log('\n📋 Resumo das correções:');
  console.log('  ✅ Consulta de usuários corrigida (full_name)');
  console.log('  ✅ Geração de código único adicionada');
  console.log('  ✅ Campos obrigatórios preenchidos');
  console.log('  ✅ Logs de debug adicionados');

} catch (error) {
  console.error('❌ Erro ao aplicar correções:', error.message);
  process.exit(1);
}