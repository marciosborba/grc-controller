import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AssessmentFramework } from '@/types/assessment';

// --- HELPER to check existence ---
const checkFrameworkExists = async (tenantId: string, code: string) => {
    const { data } = await supabase.from('assessment_frameworks')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('codigo', code)
        .eq('is_standard', true)
        .maybeSingle();
    return !!data;
};

// --- HELPER to create framework structure ---
const seedFramework = async (
    tenantId: string,
    fwData: Partial<AssessmentFramework>,
    domains: {
        nome: string; codigo: string; ordem: number; peso: number;
        controls: {
            titulo: string; codigo: string; tipo: 'preventivo' | 'detectivo' | 'corretivo'; obj: string;
            questions: { pergunta: string; tipo: 'sim_nao' | 'escala_1_5' | 'texto_livre' | 'multipla_escolha'; evidencia: boolean; opcoes?: any[] }[]
        }[]
    }[]
) => {
    try {
        // 0. Check for existence (Idempotency)
        const { data: existing } = await supabase.from('assessment_frameworks')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('codigo', fwData.codigo)
            .eq('is_standard', true)
            .maybeSingle();

        if (existing) {
            console.log(`[Seeder] Framework ${fwData.codigo} already exists. Skipping.`);
            return { success: true, action: 'skipped' };
        }

        // 1. Create Framework
        const { data: fw, error: fwError } = await supabase.from('assessment_frameworks').insert({
            ...fwData,
            tenant_id: tenantId,
            is_standard: true,
            publico: true,
            status: 'ativo'
        }).select().single();

        if (fwError) throw fwError;

        for (const dom of domains) {
            // 2. Create Domain
            const { data: d, error: dError } = await supabase.from('assessment_domains').insert({
                framework_id: fw.id,
                nome: dom.nome,
                codigo: dom.codigo,
                descricao: `Domínio: ${dom.nome}`,
                ordem: dom.ordem,
                peso: dom.peso,
                tenant_id: tenantId,
                ativo: true
            }).select().single();

            if (dError) throw dError;

            for (const ctrl of dom.controls) {
                // 3. Create Control
                const { data: c, error: cError } = await supabase.from('assessment_controls').insert({
                    domain_id: d.id,
                    framework_id: fw.id,
                    codigo: ctrl.codigo,
                    titulo: ctrl.titulo,
                    descricao: `Implementação de ${ctrl.titulo}`,
                    objetivo: ctrl.obj,
                    tipo_controle: ctrl.tipo,
                    criticidade: 'alta',
                    peso: 10,
                    ordem: 1,
                    tenant_id: tenantId,
                    ativo: true
                }).select().single();

                if (cError) throw cError;

                // 4. Create Questions
                const questionsToInsert = ctrl.questions.map(q => ({
                    control_id: c.id,
                    texto: q.pergunta,
                    tipo_pergunta: q.tipo,
                    evidencias_requeridas: q.evidencia,
                    opcoes_resposta: q.opcoes,
                    peso: 1,
                    ordem: 1,
                    tenant_id: tenantId,
                    codigo: `${ctrl.codigo}-Q`,
                    ativa: true
                }));

                if (questionsToInsert.length > 0) {
                    await supabase.from('assessment_questions').insert(questionsToInsert);
                }
            }
        }
        return { success: true, action: 'seeded' };
    } catch (e: any) {
        console.error("Seed Error", e);
        throw e;
    }
};

// --- ISO 27001:2022 FULL (93 Controls) ---
export const seedISO27001 = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'ISO-27001')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando ISO 27001:2022 Completo (93 Controles)...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'ISO/IEC 27001:2022',
            codigo: 'ISO-27001',
            descricao: 'Padrão internacional para Gestão de Segurança da Informação (SGSI)',
            versao: '2022',
            tipo_framework: 'ISO27001',
            categoria: 'Segurança da Informação'
        }, [
            {
                nome: 'A.5 Controles Organizacionais', codigo: 'A.5', ordem: 5, peso: 20,
                controls: [
                    { codigo: 'A.5.1', titulo: 'Políticas de Segurança da Informação', tipo: 'preventivo', obj: 'Orientação da direção.', questions: [{ pergunta: 'As políticas de segurança estão definidas e aprovadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.2', titulo: 'Papéis e Responsabilidades', tipo: 'preventivo', obj: 'Definir responsabilidades.', questions: [{ pergunta: 'As responsabilidades de segurança estão definidas e atribuídas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.3', titulo: 'Segregação de Funções', tipo: 'preventivo', obj: 'Reduzir riscos de uso indevido.', questions: [{ pergunta: 'Funções conflitantes estão segregadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.4', titulo: 'Responsabilidades da Direção', tipo: 'preventivo', obj: 'Apoio da direção.', questions: [{ pergunta: 'A direção exige que os funcionários apliquem a segurança?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.5', titulo: 'Contato com Autoridades', tipo: 'corretivo', obj: 'Comunicação legal.', questions: [{ pergunta: 'Existem contatos estabelecidos com autoridades relevantes?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.6', titulo: 'Contato com Grupos Especiais', tipo: 'preventivo', obj: 'Atualização de conhecimento.', questions: [{ pergunta: 'Existem contatos com grupos de interesse ou especialistas?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.7', titulo: 'Inteligência de Ameaças', tipo: 'detectivo', obj: 'Coletar e analisar informações sobre ameaças.', questions: [{ pergunta: 'A organização coleta e analisa informações sobre ameaças?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.8', titulo: 'Segurança em Projetos', tipo: 'preventivo', obj: 'Segurança desde o início.', questions: [{ pergunta: 'A segurança da informação é considerada no gerenciamento de projetos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.9', titulo: 'Inventário de Ativos', tipo: 'preventivo', obj: 'Conhecer os ativos.', questions: [{ pergunta: 'Existe um inventário de ativos atualizado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.10', titulo: 'Uso Aceitável de Ativos', tipo: 'preventivo', obj: 'Regras de uso.', questions: [{ pergunta: 'Existem regras documentadas para o uso aceitável dos ativos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.11', titulo: 'Devolução de Ativos', tipo: 'preventivo', obj: 'Proteger ativos no desligamento.', questions: [{ pergunta: 'Os ativos são devolvidos após o término do contrato?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.12', titulo: 'Classificação da Informação', tipo: 'preventivo', obj: 'Proteger conforme o valor.', questions: [{ pergunta: 'A informação é classificada conforme sua sensibilidade e criticidade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.13', titulo: 'Rotulagem da Informação', tipo: 'preventivo', obj: 'Identificar classificação.', questions: [{ pergunta: 'A rotulagem adequada é aplicada conforme o esquema de classificação?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.14', titulo: 'Transferência de Informação', tipo: 'preventivo', obj: 'Proteger em trânsito.', questions: [{ pergunta: 'Existem regras para proteção na transferência de informações?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.15', titulo: 'Controle de Acesso', tipo: 'preventivo', obj: 'Limitar acesso.', questions: [{ pergunta: 'As regras de controle de acesso estão documentadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.16', titulo: 'Gestão de Identidades', tipo: 'preventivo', obj: 'Ciclo de vida de identidades.', questions: [{ pergunta: 'O ciclo de vida das identidades é gerenciado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.17', titulo: 'Informações de Autenticação', tipo: 'preventivo', obj: 'Gerir senhas e segredos.', questions: [{ pergunta: 'A alocação de informações de autenticação secreta é controlada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.18', titulo: 'Direitos de Acesso', tipo: 'preventivo', obj: 'Gerir permissões.', questions: [{ pergunta: 'Os direitos de acesso são provisionados e revisados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.19', titulo: 'Segurança na Cadeia de Suprimentos', tipo: 'preventivo', obj: 'Gerir riscos de terceiros.', questions: [{ pergunta: 'Existem requisitos de segurança nos contratos com fornecedores?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.20', titulo: 'Segurança, Fornecedores e Contratos', tipo: 'preventivo', obj: 'Acordos de segurança.', questions: [{ pergunta: 'Os requisitos de segurança estão acordados com cada fornecedor?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.21', titulo: 'Gestão da Cadeia de Suprimentos TIC', tipo: 'preventivo', obj: 'Riscos na cadeia TIC.', questions: [{ pergunta: 'Os riscos associados à cadeia de suprimentos de TIC são gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.22', titulo: 'Monitoramento de Fornecedores', tipo: 'detectivo', obj: 'Verificar conformidade.', questions: [{ pergunta: 'Os serviços dos fornecedores são monitorados e avaliados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.23', titulo: 'Segurança em Serviços Cloud', tipo: 'preventivo', obj: 'Segurança na nuvem.', questions: [{ pergunta: 'Os requisitos de segurança para uso de serviços em nuvem foram definidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.24', titulo: 'Planejamento de Comunicação de Incidentes', tipo: 'preventivo', obj: 'Preparação para resposta.', questions: [{ pergunta: 'O planejamento para gestão de incidentes está documentado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.25', titulo: 'Avaliação de Eventos de Segurança', tipo: 'detectivo', obj: 'Triagem de eventos.', questions: [{ pergunta: 'Existe um processo para avaliar se eventos são incidentes?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.26', titulo: 'Resposta a Incidentes', tipo: 'corretivo', obj: 'Agir sobre incidentes.', questions: [{ pergunta: 'Os incidentes são respondidos de acordo com procedimentos documentados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.27', titulo: 'Aprendizado com Incidentes', tipo: 'preventivo', obj: 'Melhoria contínua.', questions: [{ pergunta: 'O conhecimento obtido com incidentes é usado para fortalecer os controles?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.28', titulo: 'Coleta de Evidências', tipo: 'detectivo', obj: 'Forensics.', questions: [{ pergunta: 'Existem procedimentos para coleta e preservação de evidências?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.29', titulo: 'Segurança na Interrupção', tipo: 'preventivo', obj: 'Continuidade de Negócio.', questions: [{ pergunta: 'A organização planeja a continuidade da segurança durante interrupções?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.30', titulo: 'Prontidão da TIC para Continuidade', tipo: 'preventivo', obj: 'DRP de TI.', questions: [{ pergunta: 'A prontidão da TIC é planejada e testada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.31', titulo: 'Requisitos Legais', tipo: 'preventivo', obj: 'Conformidade legal.', questions: [{ pergunta: 'Os requisitos legais e contratuais são identificados e mantidos atualizados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.32', titulo: 'Direitos de Propriedade Intelectual', tipo: 'preventivo', obj: 'Proteger IP.', questions: [{ pergunta: 'Os direitos de propriedade intelectual são respeitados e protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.33', titulo: 'Proteção de Registros (Records)', tipo: 'preventivo', obj: 'Proteger arquivos.', questions: [{ pergunta: 'Os registros são protegidos contra perda, destruição e falsificação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.34', titulo: 'Privacidade e Proteção de PII', tipo: 'preventivo', obj: 'Dados pessoais.', questions: [{ pergunta: 'A privacidade e proteção de dados pessoais são asseguradas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.35', titulo: 'Revisão Independente', tipo: 'detectivo', obj: 'Auditoria.', questions: [{ pergunta: 'A segurança da informação é revisada independentemente em intervalos planejados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.36', titulo: 'Conformidade com Políticas', tipo: 'detectivo', obj: 'Compliance interno.', questions: [{ pergunta: 'A conformidade com as políticas é revisada regularmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.37', titulo: 'Procedimentos Operacionais Documentados', tipo: 'preventivo', obj: 'Padronização.', questions: [{ pergunta: 'Os procedimentos operacionais estão documentados?', tipo: 'sim_nao', evidencia: true }] },
                ]
            },
            {
                nome: 'A.6 Controles de Pessoas', codigo: 'A.6', ordem: 6, peso: 15,
                controls: [
                    { codigo: 'A.6.1', titulo: 'Seleção (Screening)', tipo: 'preventivo', obj: 'Background check.', questions: [{ pergunta: 'Verificações de antecedentes são realizadas para todos os candidatos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.2', titulo: 'Termos e Condições de Emprego', tipo: 'preventivo', obj: 'Contratos.', questions: [{ pergunta: 'Os contratos de trabalho declaram as responsabilidades de segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.3', titulo: 'Conscientização e Treinamento', tipo: 'preventivo', obj: 'Cultura de segurança.', questions: [{ pergunta: 'Os funcionários recebem treinamento de conscientização apropriado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.4', titulo: 'Processo Disciplinar', tipo: 'corretivo', obj: 'Sanções.', questions: [{ pergunta: 'Existe um processo disciplinar formal para violações de segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.5', titulo: 'Responsabilidades no Encerramento', tipo: 'preventivo', obj: 'Offboarding.', questions: [{ pergunta: 'As responsabilidades após o encerramento do contrato estão definidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.6', titulo: 'Confidencialidade (NDA)', tipo: 'preventivo', obj: 'Acordos de sigilo.', questions: [{ pergunta: 'Acordos de confidencialidade são assinados por funcionários e terceiros?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.7', titulo: 'Trabalho Remoto', tipo: 'preventivo', obj: 'Segurança em Home Office.', questions: [{ pergunta: 'Existem políticas para proteger o trabalho remoto?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.8', titulo: 'Reporte de Eventos de Segurança', tipo: 'detectivo', obj: 'Canal de denúncia.', questions: [{ pergunta: 'Existe um canal para reporte rápido de eventos de segurança?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'A.7 Controles Físicos', codigo: 'A.7', ordem: 7, peso: 15,
                controls: [
                    { codigo: 'A.7.1', titulo: 'Perímetros de Segurança Física', tipo: 'preventivo', obj: 'Barreiras físicas.', questions: [{ pergunta: 'Os perímetros de segurança são definidos para proteger áreas sensíveis?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.2', titulo: 'Entrada Física', tipo: 'preventivo', obj: 'Controle de acesso físico.', questions: [{ pergunta: 'O acesso físico é protegido por controles de entrada apropriados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.3', titulo: 'Segurança de Escritórios e Instalações', tipo: 'preventivo', obj: 'Segurança predial.', questions: [{ pergunta: 'Os escritórios e instalações são projetados com segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.4', titulo: 'Monitoramento Físico', tipo: 'detectivo', obj: 'CFTV e Alarmes.', questions: [{ pergunta: 'As instalações são monitoradas continuamente contra acesso não autorizado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.5', titulo: 'Proteção contra Ameaças Físicas', tipo: 'preventivo', obj: 'Fogo, inundações.', questions: [{ pergunta: 'Existe proteção contra desastres naturais, fogo e outras ameaças físicas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.6', titulo: 'Trabalho em Áreas Seguras', tipo: 'preventivo', obj: 'Áreas restritas.', questions: [{ pergunta: 'Existem protocolos para trabalho em áreas seguras?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.7', titulo: 'Mesa Limpa e Tela Limpa', tipo: 'preventivo', obj: 'Proteção visual.', questions: [{ pergunta: 'A política de mesa limpa e tela limpa é aplicada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.8', titulo: 'Posicionamento e Proteção de Equipamentos', tipo: 'preventivo', obj: 'Proteção de hardware.', questions: [{ pergunta: 'Os equipamentos estão posicionados para reduzir riscos?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.7.9', titulo: 'Segurança de Ativos Fora das Instalações', tipo: 'preventivo', obj: 'Equipamentos externos.', questions: [{ pergunta: 'Os ativos fora das instalações são protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.10', titulo: 'Mídia de Armazenamento', tipo: 'preventivo', obj: 'Gestão de mídia.', questions: [{ pergunta: 'As mídias removíveis são gerenciadas e protegidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.11', titulo: 'Serviços de Utilidade Pública (Utilities)', tipo: 'preventivo', obj: 'Energia, internet.', questions: [{ pergunta: 'Os serviços de apoio (energia, telecom) são protegidos contra falhas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.12', titulo: 'Segurança do Cabeamento', tipo: 'preventivo', obj: 'Proteção de cabos.', questions: [{ pergunta: 'O cabeamento de energia e dados é protegido contra interceptação e danos?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.7.13', titulo: 'Manutenção de Equipamentos', tipo: 'preventivo', obj: 'Manutenção segura.', questions: [{ pergunta: 'Os equipamentos são mantidos para assegurar disponibilidade e integridade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.14', titulo: 'Descarte Seguro ou Reutilização', tipo: 'preventivo', obj: 'Sanitização.', questions: [{ pergunta: 'Os itens contendo mídia de armazenamento são sanitizados antes do descarte?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'A.8 Controles Tecnológicos', codigo: 'A.8', ordem: 8, peso: 30,
                controls: [
                    { codigo: 'A.8.1', titulo: 'Dispositivos do Usuário Final', tipo: 'preventivo', obj: 'Endpoint security.', questions: [{ pergunta: 'Os dispositivos dos usuários são protegidos e gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.2', titulo: 'Direitos de Acesso Privilegiado', tipo: 'preventivo', obj: 'PAM.', questions: [{ pergunta: 'O acesso privilegiado é restrito e monitorado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.3', titulo: 'Restrição de Acesso à Informação', tipo: 'preventivo', obj: 'ACLs.', questions: [{ pergunta: 'O acesso à informação é restrito conforme a política de controle de acesso?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.4', titulo: 'Acesso ao Código-Fonte', tipo: 'preventivo', obj: 'Proteção de código.', questions: [{ pergunta: 'O acesso ao código-fonte é estritamente controlado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.5', titulo: 'Autenticação Segura', tipo: 'preventivo', obj: 'MFA.', questions: [{ pergunta: 'O uso de autenticação forte (como MFA) é implementado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.6', titulo: 'Gestão de Capacidade', tipo: 'preventivo', obj: 'Capacity planning.', questions: [{ pergunta: 'A capacidade dos recursos é monitorada e projetada para atender à demanda?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.7', titulo: 'Proteção contra Malware', tipo: 'preventivo', obj: 'Antivírus.', questions: [{ pergunta: 'Proteção contra malware está implementada e atualizada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.8', titulo: 'Gestão de Vulnerabilidades Técnicas', tipo: 'preventivo', obj: 'Vuln Management.', questions: [{ pergunta: 'Vulnerabilidades técnicas são identificadas e corrigidas prontamente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.9', titulo: 'Gestão de Configuração', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Configurações seguras são definidas e implementadas para hardware e software?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.10', titulo: 'Exclusão de Informações', tipo: 'preventivo', obj: 'Secure delete.', questions: [{ pergunta: 'A exclusão de informações é realizada de forma segura?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.11', titulo: 'Mascaramento de Dados', tipo: 'preventivo', obj: 'Obfuscation.', questions: [{ pergunta: 'O mascaramento de dados é usado conforme a política de controle de acesso?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.12', titulo: 'Prevenção de Vazamento de Dados (DLP)', tipo: 'preventivo', obj: 'DLP.', questions: [{ pergunta: 'Medidas de DLP estão aplicadas a dados sensíveis?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.13', titulo: 'Backup de Informações', tipo: 'preventivo', obj: 'Backup.', questions: [{ pergunta: 'Backups são realizados regularmente e testados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.14', titulo: 'Redundância de Infraestrutura', tipo: 'preventivo', obj: 'HA.', questions: [{ pergunta: 'A infraestrutura possui redundância para atender aos requisitos de disponibilidade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.15', titulo: 'Log de Eventos (Logging)', tipo: 'detectivo', obj: 'Logs.', questions: [{ pergunta: 'Logs de eventos são gerados, armazenados e protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.16', titulo: 'Atividades de Monitoramento', tipo: 'detectivo', obj: 'Monitoring.', questions: [{ pergunta: 'A rede e sistemas são monitorados para anomalias?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.17', titulo: 'Sincronização de Relógios', tipo: 'preventivo', obj: 'NTP.', questions: [{ pergunta: 'Os relógios de todos os sistemas estão sincronizados?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.8.18', titulo: 'Uso de Programas Utilitários Privilegiados', tipo: 'preventivo', obj: 'Admin tools.', questions: [{ pergunta: 'O uso de utilitários privilegiados é controlado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.19', titulo: 'Instalação de Software', tipo: 'preventivo', obj: 'Software autorizado.', questions: [{ pergunta: 'A instalação de software é controlada e segue regras definidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.20', titulo: 'Segurança em Redes', tipo: 'preventivo', obj: 'Network security.', questions: [{ pergunta: 'As redes são gerenciadas e controladas para proteger a informação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.21', titulo: 'Segurança em Serviços de Rede', tipo: 'preventivo', obj: 'SLA de segurança.', questions: [{ pergunta: 'Os requisitos de segurança para serviços de rede estão definidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.22', titulo: 'Segregação de Redes', tipo: 'preventivo', obj: 'Segmentação.', questions: [{ pergunta: 'Redes com diferentes níveis de confiança estão segregadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.23', titulo: 'Filtragem Web', tipo: 'preventivo', obj: 'Web filter.', questions: [{ pergunta: 'O acesso a websites externos é filtrado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.24', titulo: 'Uso de Criptografia', tipo: 'preventivo', obj: 'Gestão de chaves.', questions: [{ pergunta: 'Existem regras para o uso eficaz de criptografia e gestão de chaves?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.25', titulo: 'Ciclo de Vida de Desenvolvimento Seguro', tipo: 'preventivo', obj: 'SDLC.', questions: [{ pergunta: 'Regras de desenvolvimento seguro são aplicadas em todo o ciclo de vida?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.26', titulo: 'Requisitos de Segurança da Aplicação', tipo: 'preventivo', obj: 'Reqs.', questions: [{ pergunta: 'Os requisitos de segurança são identificados ao adquirir ou desenvolver aplicações?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.27', titulo: 'Arquitetura e Engenharia de Sistemas Seguros', tipo: 'preventivo', obj: 'Security by design.', questions: [{ pergunta: 'Princípios de engenharia segura são aplicados?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.8.28', titulo: 'Codificação Segura', tipo: 'preventivo', obj: 'Secure coding.', questions: [{ pergunta: 'Práticas de codificação segura são aplicadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.29', titulo: 'Testes de Segurança', tipo: 'detectivo', obj: 'Pentest/DAST.', questions: [{ pergunta: 'Testes de segurança são realizados durante o desenvolvimento e aceitação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.30', titulo: 'Desenvolvimento Terceirizado', tipo: 'preventivo', obj: 'Outsourcing.', questions: [{ pergunta: 'O desenvolvimento terceirizado é supervisionado e monitorado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.31', titulo: 'Separação de Ambientes', tipo: 'preventivo', obj: 'Dev/Test/Prod.', questions: [{ pergunta: 'Ambientes de desenvolvimento, teste e produção estão separados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.32', titulo: 'Gestão de Mudanças', tipo: 'preventivo', obj: 'Change Mgmt.', questions: [{ pergunta: 'Mudanças são documentadas, testadas e aprovadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.33', titulo: 'Informações de Teste', tipo: 'preventivo', obj: 'Dados de teste.', questions: [{ pergunta: 'Os dados de teste são protegidos e anonimizados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.34', titulo: 'Proteção de Sistemas de Informação durante Auditoria', tipo: 'preventivo', obj: 'Impacto de auditoria.', questions: [{ pergunta: 'As atividades de auditoria são planejadas para minimizar impacto nos negócios?', tipo: 'sim_nao', evidencia: false }] }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('ISO 27001 Completo Criado');
        return true;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro ISO 27001'); return false; }
};

// --- PCI DSS 4.0 FULL (12 Requirements) ---
export const seedPCI = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'PCI-DSS-4.0')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando PCI DSS 4.0 Completo (12 Requisitos)...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'PCI DSS 4.0',
            codigo: 'PCI-DSS-4.0',
            descricao: 'Padrão de Segurança de Dados para a Indústria de Cartões de Pagamento (12 Requisitos)',
            versao: '4.0',
            tipo_framework: 'PCI_DSS',
            categoria: 'Pagamentos'
        }, [
            {
                nome: 'Req 1: Segurança de Rede', codigo: 'REQ-1', ordem: 1, peso: 8,
                controls: [{ codigo: '1.1', titulo: 'Controles de Segurança de Rede', tipo: 'preventivo', obj: 'Firewalls e controles.', questions: [{ pergunta: 'Controles de segurança de rede (NSC) estão instalados e mantidos?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 2: Configurações Seguras', codigo: 'REQ-2', ordem: 2, peso: 8,
                controls: [{ codigo: '2.1', titulo: 'Endurecimento de Sistemas', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Configurações seguras são aplicadas a todos os componentes do sistema?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 3: Proteção de Dados de Conta', codigo: 'REQ-3', ordem: 3, peso: 10,
                controls: [{ codigo: '3.1', titulo: 'Proteção de Dados Armazenados', tipo: 'preventivo', obj: 'Criptografia em repouso.', questions: [{ pergunta: 'Os dados da conta armazenados são protegidos (criptografados)?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 4: Transmissão Segura', codigo: 'REQ-4', ordem: 4, peso: 8,
                controls: [{ codigo: '4.1', titulo: 'Criptografia em Redes Públicas', tipo: 'preventivo', obj: 'TLS.', questions: [{ pergunta: 'A criptografia forte é usada para transmissões em redes públicas?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 5: Proteção contra Malware', codigo: 'REQ-5', ordem: 5, peso: 8,
                controls: [{ codigo: '5.1', titulo: 'Antivírus', tipo: 'detectivo', obj: 'Malware defense.', questions: [{ pergunta: 'Proteção contra malware está ativa e atualizada?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 6: Sistemas Seguros', codigo: 'REQ-6', ordem: 6, peso: 8,
                controls: [{ codigo: '6.1', titulo: 'Desenvolvimento Seguro', tipo: 'preventivo', obj: 'Patches e SDLC.', questions: [{ pergunta: 'Sistemas e softwares são desenvolvidos de forma segura?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 7: Restrição de Acesso', codigo: 'REQ-7', ordem: 7, peso: 8,
                controls: [{ codigo: '7.1', titulo: 'Need to Know', tipo: 'preventivo', obj: 'Acesso restrito.', questions: [{ pergunta: 'O acesso aos dados é restrito pela necessidade de saber?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 8: Identificação e Autenticação', codigo: 'REQ-8', ordem: 8, peso: 8,
                controls: [{ codigo: '8.1', titulo: 'Identificação de Usuários', tipo: 'preventivo', obj: 'ID único e MFA.', questions: [{ pergunta: 'O acesso é identificado e autenticado (MFA)?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 9: Acesso Físico', codigo: 'REQ-9', ordem: 9, peso: 8,
                controls: [{ codigo: '9.1', titulo: 'Segurança Física', tipo: 'preventivo', obj: 'Controle de acesso físico.', questions: [{ pergunta: 'O acesso físico aos dados do titular do cartão é restrito?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 10: Log e Monitoramento', codigo: 'REQ-10', ordem: 10, peso: 8,
                controls: [{ codigo: '10.1', titulo: 'Auditoria e Logs', tipo: 'detectivo', obj: 'Logging.', questions: [{ pergunta: 'Todo acesso aos recursos de rede e dados é rastreado e monitorado?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 11: Testes de Segurança', codigo: 'REQ-11', ordem: 11, peso: 8,
                controls: [{ codigo: '11.1', titulo: 'Testes Regulares', tipo: 'detectivo', obj: 'Pentests e Scans.', questions: [{ pergunta: 'A segurança de sistemas e redes é testada regularmente?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 12: Gestão de Políticas', codigo: 'REQ-12', ordem: 12, peso: 10,
                controls: [{ codigo: '12.1', titulo: 'Políticas de Segurança', tipo: 'preventivo', obj: 'Governança.', questions: [{ pergunta: 'As políticas de segurança são mantidas e disseminadas?', tipo: 'sim_nao', evidencia: true }] }]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('PCI DSS 4.0 Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro PCI DSS'); throw e; }
};

// Re-export others unchanged for now (placeholder imports to avoid errors if referenced)
export { seedLGPD, seedNIST, seedCOBIT, seedITIL, seedGDPR, seedSOX } from './marketSeeder';
