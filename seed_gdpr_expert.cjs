const DatabaseManager = require('./database-manager.cjs');

// === GDPR EXPERT DATA ===
const GDPR_DATA = {
    data: {
        nome: 'GDPR - General Data Protection Regulation', codigo: 'GDPR-EU', descricao: 'Regulamento Geral sobre a Proteção de Dados (EU) - Expert Level', versao: '2018', tipo_framework: 'GDPR', categoria: 'Privacidade', is_standard: true, publico: true, status: 'ativo'
    },
    domains: [
        {
            nome: 'Ch 2: Principles', codigo: 'CH2', ordem: 1, peso: 15, controls: [
                { codigo: 'ART.5', titulo: 'Processing Principles', tipo: 'preventivo', obj: 'Principles.', questions: [{ pergunta: 'Are data processed lawfully, fairly and transparently?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.6', titulo: 'Lawfulness', tipo: 'preventivo', obj: 'Legal Basis.', questions: [{ pergunta: 'Is there a valid legal basis for each processing activity?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.7', titulo: 'Consent', tipo: 'preventivo', obj: 'Consent.', questions: [{ pergunta: 'Are conditions for consent (freely given, specific, informed) met?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.9', titulo: 'Special Categories', tipo: 'preventivo', obj: 'Sensitive Data.', questions: [{ pergunta: 'Is processing of special categories of data prohibited unless exception applies?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'Ch 3: Rights of the Data Subject', codigo: 'CH3', ordem: 2, peso: 20, controls: [
                { codigo: 'ART.12', titulo: 'Transparent Info', tipo: 'preventivo', obj: 'Transparency.', questions: [{ pergunta: 'Is information provided to data subjects concise, transparent, and accessible?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.15', titulo: 'Right of Access', tipo: 'corretivo', obj: 'Access.', questions: [{ pergunta: 'Can the controller provide confirmation and access to personal data?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.16', titulo: 'Rectification', tipo: 'corretivo', obj: 'Correction.', questions: [{ pergunta: 'Is there a process to rectify inaccurate data without delay?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.17', titulo: 'Erasure (Right to be Forgotten)', tipo: 'corretivo', obj: 'Erasure.', questions: [{ pergunta: 'Is data erased when no longer necessary or consent is withdrawn?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.20', titulo: 'Data Portability', tipo: 'corretivo', obj: 'Portability.', questions: [{ pergunta: 'Can data be provided in a structured, machine-readable format?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.21', titulo: 'Right to Object', tipo: 'preventivo', obj: 'Objection.', questions: [{ pergunta: 'Is the right to object to processing (esp. direct marketing) respected?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'Ch 4: Controller & Processor', codigo: 'CH4', ordem: 3, peso: 30, controls: [
                { codigo: 'ART.24', titulo: 'Controller Responsibility', tipo: 'preventivo', obj: 'Accountability.', questions: [{ pergunta: 'Are technical and organisational measures implemented to ensure compliance?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.25', titulo: 'Data Protection by Design', tipo: 'preventivo', obj: 'PbD.', questions: [{ pergunta: 'Is data protection implemented by design and by default?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.28', titulo: 'Processor', tipo: 'preventivo', obj: 'Processor.', questions: [{ pergunta: 'Are processors engaged only under binding contract ensuring GDPR compliance?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.30', titulo: 'Records of Processing (ROPA)', tipo: 'detectivo', obj: 'ROPA.', questions: [{ pergunta: 'Is a record of processing activities maintained (if applicable)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.32', titulo: 'Security of Processing', tipo: 'preventivo', obj: 'Security.', questions: [{ pergunta: 'Are measures (encryption, resilience, testing) in place to ensure security?', tipo: 'escala_1_5', evidencia: true }] },
                { codigo: 'ART.33', titulo: 'Breach Notification (Auth)', tipo: 'corretivo', obj: 'Breach Auth.', questions: [{ pergunta: 'Are breaches notified to the supervisory authority within 72h?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.34', titulo: 'Breach Notification (Subject)', tipo: 'corretivo', obj: 'Breach Subj.', questions: [{ pergunta: 'Are high-risk breaches communicated to data subjects without delay?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.35', titulo: 'DPIA', tipo: 'preventivo', obj: 'DPIA.', questions: [{ pergunta: 'Is a Data Protection Impact Assessment carried out for high risks?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.37', titulo: 'DPO', tipo: 'preventivo', obj: 'DPO.', questions: [{ pergunta: 'Is a DPO designated where required?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'Ch 5: Transfers', codigo: 'CH5', ordem: 4, peso: 10, controls: [
                { codigo: 'ART.44', titulo: 'General Principle', tipo: 'preventivo', obj: 'Transfers.', questions: [{ pergunta: 'Are transfers to third countries compliant with Chapter V?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ART.46', titulo: 'Safeguards', tipo: 'preventivo', obj: 'SCCs.', questions: [{ pergunta: 'Are appropriate safeguards (e.g., SCCs, BCRs) in place if no adequacy decision exists?', tipo: 'sim_nao', evidencia: true }] }
            ]
        }
    ]
};

async function seedGDPR() {
    console.log("🚀 Seeding GDPR Expert...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';

    const db = new DatabaseManager();
    if (!await db.connect()) return;
    const client = db.client;

    try {
        const fw = GDPR_DATA;
        // 1. Force Clean
        const getFw = await client.query("SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true", [TENANT_ID, fw.data.codigo]);
        if (getFw.rows.length > 0) {
            const fid = getFw.rows[0].id;
            console.log("  🗑️ Cleaning existing...");
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
        }

        // 2. Insert
        const fwRes = await client.query(
            `INSERT INTO assessment_frameworks (tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, is_standard, publico, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [TENANT_ID, fw.data.nome, fw.data.codigo, fw.data.descricao, fw.data.versao, fw.data.tipo_framework, fw.data.categoria, true, true, 'ativo']
        );
        const fwId = fwRes.rows[0].id;

        for (const d of fw.domains) {
            const dRes = await client.query(
                `INSERT INTO assessment_domains (framework_id, nome, codigo, descricao, ordem, peso, tenant_id, ativo)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [fwId, d.nome, d.codigo, 'Domain: ' + d.nome, d.ordem, d.peso, TENANT_ID, true]
            );
            const dId = dRes.rows[0].id;

            let controlOrder = 1;
            for (const c of d.controls) {
                const cRes = await client.query(
                    `INSERT INTO assessment_controls (domain_id, framework_id, codigo, titulo, descricao, objetivo, tipo_controle, criticidade, peso, ordem, tenant_id, ativo)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                    [dId, fwId, c.codigo, c.titulo, c.titulo, c.obj, c.tipo, 'alta', 10, controlOrder++, TENANT_ID, true]
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
        console.log("🎉 GDPR Expert seeded!");
    } catch (e) { console.error(e); } finally { await db.disconnect(); }
}
seedGDPR();
