import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

const ALL_16_QUESTIONS = [
    { id: 'gov_1', category: 'Governança e Políticas', text: 'A organização possui uma Política de Segurança da Informação (PSI) formalmente documentada e aprovada?', question: 'A organização possui uma Política de Segurança da Informação (PSI) formalmente documentada e aprovada?', type: 'yes_no', required: true, criticality: 'alto', requires_evidence: false, weight: 10 },
    { id: 'gov_2', category: 'Governança e Políticas', text: 'Existe um responsável designado pela Segurança da Informação (CISO ou equivalente)?', question: 'Existe um responsável designado pela Segurança da Informação (CISO ou equivalente)?', type: 'yes_no', required: true, criticality: 'alto', requires_evidence: false, weight: 8 },
    { id: 'gov_3', category: 'Governança e Políticas', text: 'Os colaboradores passam por treinamentos periódicos de conscientização em segurança?', question: 'Os colaboradores passam por treinamentos periódicos de conscientização em segurança?', type: 'multiple_choice', required: true, criticality: 'medio', requires_evidence: false, weight: 8, options: 'Sim, anualmente,Sim, na admissão apenas,Não há treinamento formal,Sim, trimestralmente' },
    { id: 'access_1', category: 'Controle de Acesso', text: 'A organização utiliza Múltiplo Fator de Autenticação (MFA) para acesso a sistemas críticos?', question: 'A organização utiliza Múltiplo Fator de Autenticação (MFA) para acesso a sistemas críticos?', type: 'yes_no', required: true, criticality: 'alto', requires_evidence: false, weight: 10 },
    { id: 'access_2', category: 'Controle de Acesso', text: 'Como é realizado o processo de revogação de acessos de colaboradores desligados?', question: 'Como é realizado o processo de revogação de acessos de colaboradores desligados?', type: 'multiple_choice', required: true, criticality: 'alto', requires_evidence: false, weight: 9, options: 'Imediato (automático),Em até 24 horas,Em até 1 semana,Manual/Sob demanda' },
    { id: 'access_3', category: 'Controle de Acesso', text: 'Existe revisão periódica de direitos de acesso?', question: 'Existe revisão periódica de direitos de acesso?', type: 'yes_no', required: true, criticality: 'medio', requires_evidence: false, weight: 7 },
    { id: 'privacy_1', category: 'Privacidade e Dados', text: 'A organização mapeou os dados pessoais que processa (Data Mapping)?', question: 'A organização mapeou os dados pessoais que processa (Data Mapping)?', type: 'yes_no', required: true, criticality: 'alto', requires_evidence: false, weight: 9 },
    { id: 'privacy_2', category: 'Privacidade e Dados', text: 'Qual o nível de conformidade com a LGPD?', question: 'Qual o nível de conformidade com a LGPD?', type: 'multiple_choice', required: true, criticality: 'critico', requires_evidence: false, weight: 10, options: 'Não Iniciado,Inicial,Em Andamento,Avançado,Totalmente Conforme' },
    { id: 'privacy_3', category: 'Privacidade e Dados', text: 'Existe um processo definido para resposta a incidentes de violação de dados?', question: 'Existe um processo definido para resposta a incidentes de violação de dados?', type: 'yes_no', required: true, criticality: 'critico', requires_evidence: false, weight: 10 },
    { id: 'phys_1', category: 'Segurança Física', text: 'O acesso físico aos servidores/datacenter é restrito e monitorado?', question: 'O acesso físico aos servidores/datacenter é restrito e monitorado?', type: 'yes_no', required: true, criticality: 'medio', requires_evidence: false, weight: 6 },
    { id: 'phys_2', category: 'Segurança Física', text: 'Existem controles ambientais (energia, refrigeração, combate a incêndio) adequados?', question: 'Existem controles ambientais (energia, refrigeração, combate a incêndio) adequados?', type: 'yes_no', required: false, criticality: 'baixo', requires_evidence: false, weight: 5 },
    { id: 'inc_1', category: 'Continuidade de Negócios', text: 'A organização possui um Plano de Continuidade de Negócios (PCN) testado?', question: 'A organização possui um Plano de Continuidade de Negócios (PCN) testado?', type: 'yes_no', required: true, criticality: 'alto', requires_evidence: false, weight: 8 },
    { id: 'inc_2', category: 'Continuidade de Negócios', text: 'Com que frequência são realizados testes de restore de backup?', question: 'Com que frequência são realizados testes de restore de backup?', type: 'multiple_choice', required: true, criticality: 'alto', requires_evidence: false, weight: 9, options: 'Mensalmente,Trimestralmente,Anualmente,Nunca testado,Somente quando necessário' },
    { id: 'tp_1', category: 'Gestão de Terceiros', text: 'Os fornecedores críticos são avaliados quanto a riscos de segurança?', question: 'Os fornecedores críticos são avaliados quanto a riscos de segurança?', type: 'yes_no', required: true, criticality: 'medio', requires_evidence: false, weight: 7 },
    { id: 'evid_1', category: 'Certificações', text: 'Anexe o certificado ISO 27001 ou SOC 2 (se houver):', question: 'Anexe o certificado ISO 27001 ou SOC 2 (se houver):', type: 'text', required: false, criticality: 'baixo', requires_evidence: true, weight: 0 },
    { id: 'obs_1', category: 'Observações Finais', text: 'Descreva quaisquer outras medidas de segurança relevantes ou compensatórias:', question: 'Descreva quaisquer outras medidas de segurança relevantes ou compensatórias:', type: 'text', required: false, criticality: 'baixo', requires_evidence: false, weight: 0 }
];

async function main() {
    try {
        // Get all frameworks
        const { rows: frameworks } = await pool.query(`
            SELECT id, name, jsonb_array_length(questions) as q_count 
            FROM vendor_assessment_frameworks 
            ORDER BY name;
        `);
        console.log('Current frameworks:');
        frameworks.forEach(f => console.log(`  ${f.name}: ${f.q_count} questions`));

        // Update all frameworks that have fewer than 10 questions
        for (const fw of frameworks) {
            if (fw.q_count < 10) {
                await pool.query(
                    `UPDATE vendor_assessment_frameworks SET questions = $1, updated_at = now() WHERE id = $2`,
                    [JSON.stringify(ALL_16_QUESTIONS), fw.id]
                );
                console.log(`✅ Updated "${fw.name}" with ${ALL_16_QUESTIONS.length} questions.`);
            } else {
                console.log(`⏭️ Skipping "${fw.name}" (already has ${fw.q_count} questions).`);
            }
        }

        // Verify
        const { rows: after } = await pool.query(`
            SELECT name, jsonb_array_length(questions) as q_count 
            FROM vendor_assessment_frameworks ORDER BY name;
        `);
        console.log('\nAfter update:');
        after.forEach(f => console.log(`  ${f.name}: ${f.q_count} questions`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
