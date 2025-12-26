const DatabaseManager = require('./database-manager.cjs');

// LGPD Data (8 Controls)
const LGPD_DATA = {
    data: {
        nome: 'Lei Geral de Proteção de Dados (LGPD)', codigo: 'LGPD-BR', descricao: 'Conformidade de privacidade baseada na Lei 13.709/2018', versao: '2024', tipo_framework: 'LGPD', categoria: 'Privacidade de Dados', is_standard: true, publico: true, status: 'ativo'
    },
    domains: [
        {
            nome: 'Cap. I e II - Princípios e Bases Legais', codigo: 'PRIN', ordem: 1, peso: 20,
            controls: [
                { codigo: 'ART.6', titulo: 'A finalidade específica foi documentada?', tipo: 'preventivo', obj: 'Garantir finalidade, adequação e necessidade.', questions: [{ pergunta: 'Para cada atividade de tratamento, a finalidade específica foi documentada?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'Os dados coletados são os mínimos necessários para a finalidade (Minimização)?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'O tratamento de dados é transparente para os titulares?', tipo: 'escala_1_5', evidencia: true }] },
                { codigo: 'ART.7', titulo: 'As bases legais foram atribuídas?', tipo: 'preventivo', obj: 'Assegurar legalidade do tratamento.', questions: [{ pergunta: 'Todas as atividades de tratamento possuem uma base legal atribuída (Consentimento, Legítimo Interesse, Execução de Contrato, etc.)?', tipo: 'escala_1_5', evidencia: true }, { pergunta: 'Quando baseado em legítimo interesse, foi realizado o LIA (Legitimate Interest Assessment)?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'Cap. III - Direitos dos Titulares', codigo: 'DIR', ordem: 2, peso: 20,
            controls: [
                { codigo: 'ART.18', titulo: 'Existe canal para requisições de titulares?', tipo: 'corretivo', obj: 'Atender aos direitos dos titulares.', questions: [{ pergunta: 'Existe um canal oficial e acessível para recebimento de solicitações dos titulares?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'Existe um processo definido para responder em até 15 dias (se completo) ou imediatamente (se simplificado)?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'A organização consegue realizar a portabilidade dos dados quando solicitado?', tipo: 'sim_nao', evidencia: false }] }
            ]
        },
        {
            nome: 'Cap. VI - Governança e DPO', codigo: 'GOV', ordem: 3, peso: 20,
            controls: [
                { codigo: 'ART.41', titulo: 'O Encarregado (DPO) foi nomeado?', tipo: 'preventivo', obj: 'Nomear pessoa para comunicação.', questions: [{ pergunta: 'O Encarregado pelo Tratamento de Dados Pessoais (DPO) foi nomeado formalmente?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'A identidade e contatos do DPO estão divulgados publicamente no site?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'O DPO possui autonomia e recursos para desempenhar suas funções?', tipo: 'sim_nao', evidencia: false }] },
                { codigo: 'ART.50', titulo: 'Possui inventário de dados (ROPA)?', tipo: 'preventivo', obj: 'Estabelecer programa de governança em privacidade.', questions: [{ pergunta: 'A organização possui um inventário de dados pessoais (ROPA) atualizado?', tipo: 'escala_1_5', evidencia: true }, { pergunta: 'É realizada a Análise de Impacto (DPIA/RIPD) para tratamentos de alto risco?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'Cap. VII - Segurança e Incidentes', codigo: 'SEC', ordem: 4, peso: 20,
            controls: [
                { codigo: 'ART.46', titulo: 'Há medidas técnicas de proteção?', tipo: 'preventivo', obj: 'Proteger dados pessoais contra acessos ilícitos.', questions: [{ pergunta: 'Medidas técnicas (criptografia, firewalls, controles de acesso) estão implementadas para proteger dados pessoais?', tipo: 'escala_1_5', evidencia: true }, { pergunta: 'O controle de acesso aos dados pessoais é restrito por necessidade (Need-to-know)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.48', titulo: 'Há plano de resposta a incidentes?', tipo: 'corretivo', obj: 'Comunicar violações.', questions: [{ pergunta: 'Existe um plano de resposta a incidentes que inclui notificação à ANPD em prazo razoável?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'Os incidentes de segurança são registrados e analisados quanto ao risco aos titulares?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'Transferência Internacional', codigo: 'TRANS', ordem: 5, peso: 10,
            controls: [
                { codigo: 'ART.33', titulo: 'Transferências internacionais mapeadas?', tipo: 'preventivo', obj: 'Regular a transferência.', questions: [{ pergunta: 'A organização identifica e mapeia todas as transferências internacionais de dados?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'São utilizadas Cláusulas Padrão Contratuais (SCCs) ou outro mecanismo legal para transferências?', tipo: 'sim_nao', evidencia: true }] }
            ]
        }
    ]
};

async function seedLGPDOnly() {
    console.log("🚀 Seeding LGPD Only...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';

    const db = new DatabaseManager();
    if (!await db.connect()) return;
    const client = db.client;

    try {
        const fw = LGPD_DATA;
        console.log(`\n🌱 Seeding ${fw.data.codigo}...`);

        // 1. Force Clean
        const getFw = await client.query("SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true", [TENANT_ID, fw.data.codigo]);
        if (getFw.rows.length > 0) {
            const fid = getFw.rows[0].id;
            console.log(`  🗑️ Cleaning existing ${fw.data.codigo}...`);
            const doms = await client.query("SELECT id FROM assessment_domains WHERE framework_id = $1", [fid]);
            const domIds = doms.rows.map(d => d.id);
            if (domIds.length > 0) {
                const ctrls = await client.query("SELECT id FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                const ctrlIds = ctrls.rows.map(c => c.id);
                if (ctrlIds.length > 0) {
                    await client.query("DELETE FROM assessment_questions WHERE control_id = ANY($1)", [ctrlIds]);
                    await client.query("DELETE FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                }
                await client.query("DELETE FROM assessment_domains WHERE framework_id = $1", [fid]);
            }
            await client.query("DELETE FROM assessment_frameworks WHERE id = $1", [fid]);
            console.log("  🗑️ Cleaned.");
        }

        // 2. Insert
        const fwRes = await client.query(
            `INSERT INTO assessment_frameworks (tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, is_standard, publico, status)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [TENANT_ID, fw.data.nome, fw.data.codigo, fw.data.descricao, fw.data.versao, fw.data.tipo_framework, fw.data.categoria, true, true, 'ativo']
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

            let controlOrder = 1;
            for (const c of d.controls) {
                const cRes = await client.query(
                    `INSERT INTO assessment_controls (domain_id, framework_id, codigo, titulo, descricao, objetivo, tipo_controle, criticidade, peso, ordem, tenant_id, ativo)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                    [dId, fwId, c.codigo, c.titulo, 'Implementação de ' + c.titulo, c.obj, c.tipo, 'alta', 10, controlOrder++, TENANT_ID, true]
                );
                const cId = cRes.rows[0].id;

                for (const q of c.questions) {
                    await client.query(
                        `INSERT INTO assessment_questions (control_id, texto, tipo_pergunta, evidencias_requeridas, opcoes_resposta, peso, ordem, tenant_id, codigo, ativa)
                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [cId, q.pergunta, q.tipo, q.evidencia, q.opcoes ? JSON.stringify(q.opcoes) : null, 1, 1, TENANT_ID, c.codigo + '-Q', true]
                    );
                }
            }
        }
        console.log("🎉 LGPD seeded successfully!");

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await db.disconnect();
    }
}

seedLGPDOnly();
