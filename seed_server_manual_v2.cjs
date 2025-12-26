const DatabaseManager = require('./database-manager.cjs');

// --- FRAMEWORK DATA ---
const FRAMEWORKS = [
    // --- LGPD ---
    {
        data: {
            nome: 'Lei Geral de Proteção de Dados (LGPD)',
            codigo: 'LGPD-BR',
            descricao: 'Conformidade de privacidade baseada na Lei 13.709/2018',
            versao: '2024',
            tipo_framework: 'LGPD',
            categoria: 'Privacidade de Dados',
            is_standard: true,
            publico: true,
            status: 'ativo'
        },
        domains: [
            {
                nome: 'Cap. I e II - Princípios e Bases Legais', codigo: 'PRIN', ordem: 1, peso: 20,
                controls: [
                    {
                        codigo: 'ART.6', titulo: 'A finalidade específica foi documentada?', tipo: 'preventivo', obj: 'Garantir finalidade, adequação e necessidade.',
                        questions: [
                            { pergunta: 'Para cada atividade de tratamento, a finalidade específica foi documentada?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os dados coletados são os mínimos necessários para a finalidade (Minimização)?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'O tratamento de dados é transparente para os titulares?', tipo: 'escala_1_5', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'ART.7', titulo: 'As bases legais foram atribuídas?', tipo: 'preventivo', obj: 'Assegurar legalidade do tratamento.',
                        questions: [
                            { pergunta: 'Todas as atividades de tratamento possuem uma base legal atribuída (Consentimento, Legítimo Interesse, Execução de Contrato, etc.)?', tipo: 'escala_1_5', evidencia: true },
                            { pergunta: 'Quando baseado em legítimo interesse, foi realizado o LIA (Legitimate Interest Assessment)?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Cap. VI - Governança e DPO', codigo: 'GOV', ordem: 3, peso: 20,
                controls: [
                    {
                        codigo: 'ART.41', titulo: 'O Encarregado (DPO) foi nomeado?', tipo: 'preventivo', obj: 'Nomear pessoa para comunicação.',
                        questions: [
                            { pergunta: 'O Encarregado pelo Tratamento de Dados Pessoais (DPO) foi nomeado formalmente?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'A identidade e contatos do DPO estão divulgados publicamente no site?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'O DPO possui autonomia e recursos para desempenhar suas funções?', tipo: 'sim_nao', evidencia: false }
                        ]
                    }
                ]
            }
        ]
    }
];

// --- EXECUTION ---
async function seedAll() {
    console.log("🚀 Starting MANUAL Server-Side Seeding...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';

    const db = new DatabaseManager();
    const connected = await db.connect();
    if (!connected) return;
    const client = db.client;

    try {

        for (const fw of FRAMEWORKS) {
            console.log(`\n🌱 Seeding ${fw.data.codigo}...`);

            // 1. Check if exists
            const check = await client.query(
                "SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true",
                [TENANT_ID, fw.data.codigo]
            );

            if (check.rows.length > 0) {
                console.log("  ⚠️ Already exists. Skipping.");
                continue;
            }

            // 2. Insert Framework
            const fwRes = await client.query(
                `INSERT INTO assessment_frameworks (tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, is_standard, publico, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                [TENANT_ID, fw.data.nome, fw.data.codigo, fw.data.descricao, fw.data.versao, fw.data.tipo_framework, fw.data.categoria || '', true, true, 'ativo']
            );
            const fwId = fwRes.rows[0].id;
            console.log("  ✅ Framework Created:", fwId);

            // 3. Domains & Controls
            for (const d of fw.domains) {
                const dRes = await client.query(
                    `INSERT INTO assessment_domains (framework_id, nome, codigo, descricao, ordem, peso, tenant_id, ativo)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [fwId, d.nome, d.codigo, 'Domínio: ' + d.nome, d.ordem, d.peso, TENANT_ID, true]
                );
                const dId = dRes.rows[0].id;

                for (const c of d.controls) {
                    const cRes = await client.query(
                        `INSERT INTO assessment_controls (domain_id, framework_id, codigo, titulo, descricao, objetivo, tipo_controle, criticidade, peso, ordem, tenant_id, ativo)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                        [dId, fwId, c.codigo, c.titulo, 'Implementação de ' + c.titulo, c.obj, c.tipo, 'alta', 10, 1, TENANT_ID, true]
                    );
                    const cId = cRes.rows[0].id;

                    // Questions
                    for (const q of c.questions) {
                        await client.query(
                            `INSERT INTO assessment_questions (control_id, texto, tipo_pergunta, evidencias_requeridas, opcoes_resposta, peso, ordem, tenant_id, codigo, ativa)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                            [cId, q.pergunta, q.tipo, q.evidencia, q.opcoes ? JSON.stringify(q.opcoes) : null, 1, 1, TENANT_ID, c.codigo + '-Q', true]
                        );
                    }
                }
            }
            console.log(`  ✅ Done ${fw.data.codigo}`);
        }
        console.log("\n🎉 All seeded successfully!");

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await db.disconnect();
    }
}

seedAll();
