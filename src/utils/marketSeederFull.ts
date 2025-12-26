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
                    { codigo: 'A.5.1', titulo: 'As políticas de segurança estão definidas e aprovadas?', tipo: 'preventivo', obj: 'Orientação da direção.', questions: [{ pergunta: 'As políticas de segurança estão definidas e aprovadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.2', titulo: 'As responsabilidades de segurança estão definidas?', tipo: 'preventivo', obj: 'Definir responsabilidades.', questions: [{ pergunta: 'As responsabilidades de segurança estão definidas e atribuídas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.3', titulo: 'Funções conflitantes estão segregadas?', tipo: 'preventivo', obj: 'Reduzir riscos de uso indevido.', questions: [{ pergunta: 'Funções conflitantes estão segregadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.4', titulo: 'A direção exige conformidade c/ segurança?', tipo: 'preventivo', obj: 'Apoio da direção.', questions: [{ pergunta: 'A direção exige que os funcionários apliquem a segurança?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.5', titulo: 'Existem contatos estabelecidos com autoridades?', tipo: 'corretivo', obj: 'Comunicação legal.', questions: [{ pergunta: 'Existem contatos estabelecidos com autoridades relevantes?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.6', titulo: 'Existem contatos com grupos de interesse?', tipo: 'preventivo', obj: 'Atualização de conhecimento.', questions: [{ pergunta: 'Existem contatos com grupos de interesse ou especialistas?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.7', titulo: 'A organização coleta informações de ameaças?', tipo: 'detectivo', obj: 'Coletar e analisar informações sobre ameaças.', questions: [{ pergunta: 'A organização coleta e analisa informações sobre ameaças?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.8', titulo: 'A segurança é considerada em projetos?', tipo: 'preventivo', obj: 'Segurança desde o início.', questions: [{ pergunta: 'A segurança da informação é considerada no gerenciamento de projetos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.9', titulo: 'Existe inventário de ativos atualizado?', tipo: 'preventivo', obj: 'Conhecer os ativos.', questions: [{ pergunta: 'Existe um inventário de ativos atualizado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.10', titulo: 'Há regras para uso aceitável dos ativos?', tipo: 'preventivo', obj: 'Regras de uso.', questions: [{ pergunta: 'Existem regras documentadas para o uso aceitável dos ativos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.11', titulo: 'Ativos são devolvidos no desligamento?', tipo: 'preventivo', obj: 'Proteger ativos no desligamento.', questions: [{ pergunta: 'Os ativos são devolvidos após o término do contrato?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.12', titulo: 'A informação é classificada?', tipo: 'preventivo', obj: 'Proteger conforme o valor.', questions: [{ pergunta: 'A informação é classificada conforme sua sensibilidade e criticidade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.13', titulo: 'A rotulagem adequada é aplicada?', tipo: 'preventivo', obj: 'Identificar classificação.', questions: [{ pergunta: 'A rotulagem adequada é aplicada conforme o esquema de classificação?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.14', titulo: 'Há regras para transferência de informações?', tipo: 'preventivo', obj: 'Proteger em trânsito.', questions: [{ pergunta: 'Existem regras para proteção na transferência de informações?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.15', titulo: 'As regras de controle de acesso são documentadas?', tipo: 'preventivo', obj: 'Limitar acesso.', questions: [{ pergunta: 'As regras de controle de acesso estão documentadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.16', titulo: 'O ciclo de vida das identidades é gerenciado?', tipo: 'preventivo', obj: 'Ciclo de vida de identidades.', questions: [{ pergunta: 'O ciclo de vida das identidades é gerenciado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.17', titulo: 'Autenticação secreta é controlada?', tipo: 'preventivo', obj: 'Gerir senhas e segredos.', questions: [{ pergunta: 'A alocação de informações de autenticação secreta é controlada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.18', titulo: 'Direitos de acesso são revisados?', tipo: 'preventivo', obj: 'Gerir permissões.', questions: [{ pergunta: 'Os direitos de acesso são provisionados e revisados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.19', titulo: 'Há segurança nos contratos com fornecedores?', tipo: 'preventivo', obj: 'Gerir riscos de terceiros.', questions: [{ pergunta: 'Existem requisitos de segurança nos contratos com fornecedores?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.20', titulo: 'Requisitos de segurança acordados com fornecedor?', tipo: 'preventivo', obj: 'Acordos de segurança.', questions: [{ pergunta: 'Os requisitos de segurança estão acordados com cada fornecedor?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.21', titulo: 'Riscos da cadeia TIC são gerenciados?', tipo: 'preventivo', obj: 'Riscos na cadeia TIC.', questions: [{ pergunta: 'Os riscos associados à cadeia de suprimentos de TIC são gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.22', titulo: 'Serviços de fornecedores são monitorados?', tipo: 'detectivo', obj: 'Verificar conformidade.', questions: [{ pergunta: 'Os serviços dos fornecedores são monitorados e avaliados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.23', titulo: 'Segurança em nuvem está definida?', tipo: 'preventivo', obj: 'Segurança na nuvem.', questions: [{ pergunta: 'Os requisitos de segurança para uso de serviços em nuvem foram definidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.24', titulo: 'Gestão de incidentes está documentada?', tipo: 'preventivo', obj: 'Preparação para resposta.', questions: [{ pergunta: 'O planejamento para gestão de incidentes está documentado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.25', titulo: 'Há processo para avaliar eventos de segurança?', tipo: 'detectivo', obj: 'Triagem de eventos.', questions: [{ pergunta: 'Existe um processo para avaliar se eventos são incidentes?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.26', titulo: 'Incidentes são respondidos formalmente?', tipo: 'corretivo', obj: 'Agir sobre incidentes.', questions: [{ pergunta: 'Os incidentes são respondidos de acordo com procedimentos documentados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.27', titulo: 'O conhecimento de incidentes é usado?', tipo: 'preventivo', obj: 'Melhoria contínua.', questions: [{ pergunta: 'O conhecimento obtido com incidentes é usado para fortalecer os controles?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.28', titulo: 'Existem procedimentos para coleta de evidências?', tipo: 'detectivo', obj: 'Forensics.', questions: [{ pergunta: 'Existem procedimentos para coleta e preservação de evidências?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.29', titulo: 'Continuidade de segurança planejada?', tipo: 'preventivo', obj: 'Continuidade de Negócio.', questions: [{ pergunta: 'A organização planeja a continuidade da segurança durante interrupções?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.30', titulo: 'Prontidão da TIC é planejada e testada?', tipo: 'preventivo', obj: 'DRP de TI.', questions: [{ pergunta: 'A prontidão da TIC é planejada e testada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.31', titulo: 'Requisitos legais são identificados?', tipo: 'preventivo', obj: 'Conformidade legal.', questions: [{ pergunta: 'Os requisitos legais e contratuais são identificados e mantidos atualizados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.32', titulo: 'Direitos de PI são respeitados?', tipo: 'preventivo', obj: 'Proteger IP.', questions: [{ pergunta: 'Os direitos de propriedade intelectual são respeitados e protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.33', titulo: 'Registros são protegidos contra perda?', tipo: 'preventivo', obj: 'Proteger arquivos.', questions: [{ pergunta: 'Os registros são protegidos contra perda, destruição e falsificação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.34', titulo: 'Dados pessoais são protegidos?', tipo: 'preventivo', obj: 'Dados pessoais.', questions: [{ pergunta: 'A privacidade e proteção de dados pessoais são asseguradas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.35', titulo: 'Segurança revisada independentemente?', tipo: 'detectivo', obj: 'Auditoria.', questions: [{ pergunta: 'A segurança da informação é revisada independentemente em intervalos planejados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.36', titulo: 'Conformidade com políticas é revisada?', tipo: 'detectivo', obj: 'Compliance interno.', questions: [{ pergunta: 'A conformidade com as políticas é revisada regularmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.37', titulo: 'Procedimentos operacionais documentados?', tipo: 'preventivo', obj: 'Padronização.', questions: [{ pergunta: 'Os procedimentos operacionais estão documentados?', tipo: 'sim_nao', evidencia: true }] },
                ]
            },
            {
                nome: 'A.6 Controles de Pessoas', codigo: 'A.6', ordem: 6, peso: 15,
                controls: [
                    { codigo: 'A.6.1', titulo: 'Antecedentes são verificados?', tipo: 'preventivo', obj: 'Background check.', questions: [{ pergunta: 'Verificações de antecedentes são realizadas para todos os candidatos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.2', titulo: 'Contratos definem responsabilidades?', tipo: 'preventivo', obj: 'Contratos.', questions: [{ pergunta: 'Os contratos de trabalho declaram as responsabilidades de segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.3', titulo: 'Funcionários recebem conscientização?', tipo: 'preventivo', obj: 'Cultura de segurança.', questions: [{ pergunta: 'Os funcionários recebem treinamento de conscientização apropriado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.4', titulo: 'Existe processo disciplinar?', tipo: 'corretivo', obj: 'Sanções.', questions: [{ pergunta: 'Existe um processo disciplinar formal para violações de segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.5', titulo: 'Responsabilidades de saída definidas?', tipo: 'preventivo', obj: 'Offboarding.', questions: [{ pergunta: 'As responsabilidades após o encerramento do contrato estão definidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.6', titulo: 'Acordos de confidencialidade assinados?', tipo: 'preventivo', obj: 'Acordos de sigilo.', questions: [{ pergunta: 'Acordos de confidencialidade são assinados por funcionários e terceiros?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.7', titulo: 'Há segurança no trabalho remoto?', tipo: 'preventivo', obj: 'Segurança em Home Office.', questions: [{ pergunta: 'Existem políticas para proteger o trabalho remoto?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.8', titulo: 'Existe canal para denúncia?', tipo: 'detectivo', obj: 'Canal de denúncia.', questions: [{ pergunta: 'Existe um canal para reporte rápido de eventos de segurança?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'A.7 Controles Físicos', codigo: 'A.7', ordem: 7, peso: 15,
                controls: [
                    { codigo: 'A.7.1', titulo: 'Perímetros de segurança definidos?', tipo: 'preventivo', obj: 'Barreiras físicas.', questions: [{ pergunta: 'Os perímetros de segurança são definidos para proteger áreas sensíveis?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.2', titulo: 'Acesso físico é protegido?', tipo: 'preventivo', obj: 'Controle de acesso físico.', questions: [{ pergunta: 'O acesso físico é protegido por controles de entrada apropriados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.3', titulo: 'Instalações são seguras?', tipo: 'preventivo', obj: 'Segurança predial.', questions: [{ pergunta: 'Os escritórios e instalações são projetados com segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.4', titulo: 'Instalações são monitoradas?', tipo: 'detectivo', obj: 'CFTV e Alarmes.', questions: [{ pergunta: 'As instalações são monitoradas continuamente contra acesso não autorizado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.5', titulo: 'Proteção contra desastres físicos?', tipo: 'preventivo', obj: 'Fogo, inundações.', questions: [{ pergunta: 'Existe proteção contra desastres naturais, fogo e outras ameaças físicas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.6', titulo: 'Existem áreas seguras?', tipo: 'preventivo', obj: 'Áreas restritas.', questions: [{ pergunta: 'Existem protocolos para trabalho em áreas seguras?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.7', titulo: 'Política de mesa limpa aplicada?', tipo: 'preventivo', obj: 'Proteção visual.', questions: [{ pergunta: 'A política de mesa limpa e tela limpa é aplicada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.8', titulo: 'Equipamentos protegidos fisicamente?', tipo: 'preventivo', obj: 'Proteção de hardware.', questions: [{ pergunta: 'Os equipamentos estão posicionados para reduzir riscos?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.7.9', titulo: 'Ativos externos são protegidos?', tipo: 'preventivo', obj: 'Equipamentos externos.', questions: [{ pergunta: 'Os ativos fora das instalações são protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.10', titulo: 'Mídias removíveis são protegidas?', tipo: 'preventivo', obj: 'Gestão de mídia.', questions: [{ pergunta: 'As mídias removíveis são gerenciadas e protegidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.11', titulo: 'Serviços de apoio são protegidos?', tipo: 'preventivo', obj: 'Energia, internet.', questions: [{ pergunta: 'Os serviços de apoio (energia, telecom) são protegidos contra falhas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.12', titulo: 'Cabeamento é protegido?', tipo: 'preventivo', obj: 'Proteção de cabos.', questions: [{ pergunta: 'O cabeamento de energia e dados é protegido contra interceptação e danos?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.7.13', titulo: 'Manutenção de equipamentos é feita?', tipo: 'preventivo', obj: 'Manutenção segura.', questions: [{ pergunta: 'Os equipamentos são mantidos para assegurar disponibilidade e integridade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.14', titulo: 'Descarte seguro de mídia?', tipo: 'preventivo', obj: 'Sanitização.', questions: [{ pergunta: 'Os itens contendo mídia de armazenamento são sanitizados antes do descarte?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'A.8 Controles Tecnológicos', codigo: 'A.8', ordem: 8, peso: 30,
                controls: [
                    { codigo: 'A.8.1', titulo: 'Dispositivos de usuário protegidos?', tipo: 'preventivo', obj: 'Endpoint security.', questions: [{ pergunta: 'Os dispositivos dos usuários são protegidos e gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.2', titulo: 'Acesso privilegiado restrito?', tipo: 'preventivo', obj: 'PAM.', questions: [{ pergunta: 'O acesso privilegiado é restrito e monitorado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.3', titulo: 'Acesso à informação restrito?', tipo: 'preventivo', obj: 'ACLs.', questions: [{ pergunta: 'O acesso à informação é restrito conforme a política de controle de acesso?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.4', titulo: 'Acesso ao código-fonte controlado?', tipo: 'preventivo', obj: 'Proteção de código.', questions: [{ pergunta: 'O acesso ao código-fonte é estritamente controlado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.5', titulo: 'Autenticação forte implementada?', tipo: 'preventivo', obj: 'MFA.', questions: [{ pergunta: 'O uso de autenticação forte (como MFA) é implementado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.6', titulo: 'Gestão de capacidade realizada?', tipo: 'preventivo', obj: 'Capacity planning.', questions: [{ pergunta: 'A capacidade dos recursos é monitorada e projetada para atender à demanda?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.7', titulo: 'Proteção contra malware ativa?', tipo: 'preventivo', obj: 'Antivírus.', questions: [{ pergunta: 'Proteção contra malware está implementada e atualizada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.8', titulo: 'Vulnerabilidades gerenciadas?', tipo: 'preventivo', obj: 'Vuln Management.', questions: [{ pergunta: 'Vulnerabilidades técnicas são identificadas e corrigidas prontamente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.9', titulo: 'Hardening implementado?', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Configurações seguras são definidas e implementadas para hardware e software?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.10', titulo: 'Exclusão segura de informações?', tipo: 'preventivo', obj: 'Secure delete.', questions: [{ pergunta: 'A exclusão de informações é realizada de forma segura?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.11', titulo: 'Mascaramento de dados usado?', tipo: 'preventivo', obj: 'Obfuscation.', questions: [{ pergunta: 'O mascaramento de dados é usado conforme a política de controle de acesso?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.12', titulo: 'DLP implementado?', tipo: 'preventivo', obj: 'DLP.', questions: [{ pergunta: 'Medidas de DLP estão aplicadas a dados sensíveis?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.13', titulo: 'Backups realizados e testados?', tipo: 'preventivo', obj: 'Backup.', questions: [{ pergunta: 'Backups são realizados regularmente e testados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.14', titulo: 'Infraestrutura redundante?', tipo: 'preventivo', obj: 'HA.', questions: [{ pergunta: 'A infraestrutura possui redundância para atender aos requisitos de disponibilidade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.15', titulo: 'Logs protegidos e gerados?', tipo: 'detectivo', obj: 'Logs.', questions: [{ pergunta: 'Logs de eventos são gerados, armazenados e protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.16', titulo: 'Monitoramento contínuo?', tipo: 'detectivo', obj: 'Monitoring.', questions: [{ pergunta: 'A rede e sistemas são monitorados para anomalias?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.17', titulo: 'Relógios sincronizados?', tipo: 'preventivo', obj: 'NTP.', questions: [{ pergunta: 'Os relógios de todos os sistemas estão sincronizados?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.8.18', titulo: 'Utilitários privilegiados controlados?', tipo: 'preventivo', obj: 'Admin tools.', questions: [{ pergunta: 'O uso de utilitários privilegiados é controlado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.19', titulo: 'Instalação de software controlada?', tipo: 'preventivo', obj: 'Software autorizado.', questions: [{ pergunta: 'A instalação de software é controlada e segue regras definidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.20', titulo: 'Redes seguras e gerenciadas?', tipo: 'preventivo', obj: 'Network security.', questions: [{ pergunta: 'As redes são gerenciadas e controladas para proteger a informação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.21', titulo: 'Serviços de rede seguros?', tipo: 'preventivo', obj: 'SLA de segurança.', questions: [{ pergunta: 'Os requisitos de segurança para serviços de rede estão definidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.22', titulo: 'Redes segregadas?', tipo: 'preventivo', obj: 'Segmentação.', questions: [{ pergunta: 'Redes com diferentes níveis de confiança estão segregadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.23', titulo: 'Filtragem web ativa?', tipo: 'preventivo', obj: 'Web filter.', questions: [{ pergunta: 'O acesso a websites externos é filtrado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.24', titulo: 'Criptografia e chaves gerenciadas?', tipo: 'preventivo', obj: 'Gestão de chaves.', questions: [{ pergunta: 'Existem regras para o uso eficaz de criptografia e gestão de chaves?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.25', titulo: 'SDLC seguro implementado?', tipo: 'preventivo', obj: 'SDLC.', questions: [{ pergunta: 'Regras de desenvolvimento seguro são aplicadas em todo o ciclo de vida?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.26', titulo: 'Requisitos de segurança em apps?', tipo: 'preventivo', obj: 'Reqs.', questions: [{ pergunta: 'Os requisitos de segurança são identificados ao adquirir ou desenvolver aplicações?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.27', titulo: 'Arquitetura segura aplicada?', tipo: 'preventivo', obj: 'Security by design.', questions: [{ pergunta: 'Princípios de engenharia segura são aplicados?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.8.28', titulo: 'Codificação segura aplicada?', tipo: 'preventivo', obj: 'Secure coding.', questions: [{ pergunta: 'Práticas de codificação segura são aplicadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.29', titulo: 'Testes de segurança realizados?', tipo: 'detectivo', obj: 'Pentest/DAST.', questions: [{ pergunta: 'Testes de segurança são realizados durante o desenvolvimento e aceitação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.30', titulo: 'Desenv. terceirizado monitorado?', tipo: 'preventivo', obj: 'Outsourcing.', questions: [{ pergunta: 'O desenvolvimento terceirizado é supervisionado e monitorado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.31', titulo: 'Ambientes segregados?', tipo: 'preventivo', obj: 'Dev/Test/Prod.', questions: [{ pergunta: 'Ambientes de desenvolvimento, teste e produção estão separados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.32', titulo: 'Gestão de mudanças eficaz?', tipo: 'preventivo', obj: 'Change Mgmt.', questions: [{ pergunta: 'Mudanças são documentadas, testadas e aprovadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.33', titulo: 'Dados de teste protegidos?', tipo: 'preventivo', obj: 'Dados de teste.', questions: [{ pergunta: 'Os dados de teste são protegidos e anonimizados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.34', titulo: 'Auditoria minimiza impacto?', tipo: 'preventivo', obj: 'Impacto de auditoria.', questions: [{ pergunta: 'As atividades de auditoria são planejadas para minimizar impacto nos negócios?', tipo: 'sim_nao', evidencia: false }] }
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
                controls: [{ codigo: '1.1', titulo: 'Controles de rede (NSC) ativos?', tipo: 'preventivo', obj: 'Firewalls e controles.', questions: [{ pergunta: 'Controles de segurança de rede (NSC) estão instalados e mantidos?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 2: Configurações Seguras', codigo: 'REQ-2', ordem: 2, peso: 8,
                controls: [{ codigo: '2.1', titulo: 'Configurações seguras aplicadas?', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Configurações seguras são aplicadas a todos os componentes do sistema?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 3: Proteção de Dados de Conta', codigo: 'REQ-3', ordem: 3, peso: 10,
                controls: [{ codigo: '3.1', titulo: 'Dados armazenados protegidos?', tipo: 'preventivo', obj: 'Criptografia em repouso.', questions: [{ pergunta: 'Os dados da conta armazenados são protegidos (criptografados)?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 4: Transmissão Segura', codigo: 'REQ-4', ordem: 4, peso: 8,
                controls: [{ codigo: '4.1', titulo: 'Criptografia em redes públicas?', tipo: 'preventivo', obj: 'TLS.', questions: [{ pergunta: 'A criptografia forte é usada para transmissões em redes públicas?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 5: Proteção contra Malware', codigo: 'REQ-5', ordem: 5, peso: 8,
                controls: [{ codigo: '5.1', titulo: 'Proteção malware ativa?', tipo: 'detectivo', obj: 'Malware defense.', questions: [{ pergunta: 'Proteção contra malware está ativa e atualizada?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 6: Sistemas Seguros', codigo: 'REQ-6', ordem: 6, peso: 8,
                controls: [{ codigo: '6.1', titulo: 'Desenvolvimento seguro seguido?', tipo: 'preventivo', obj: 'Patches e SDLC.', questions: [{ pergunta: 'Sistemas e softwares são desenvolvidos de forma segura?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 7: Restrição de Acesso', codigo: 'REQ-7', ordem: 7, peso: 8,
                controls: [{ codigo: '7.1', titulo: 'Acesso restrito (Need to Know)?', tipo: 'preventivo', obj: 'Acesso restrito.', questions: [{ pergunta: 'O acesso aos dados é restrito pela necessidade de saber?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 8: Identificação e Autenticação', codigo: 'REQ-8', ordem: 8, peso: 8,
                controls: [{ codigo: '8.1', titulo: 'Identificação e MFA ativos?', tipo: 'preventivo', obj: 'ID único e MFA.', questions: [{ pergunta: 'O acesso é identificado e autenticado (MFA)?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 9: Acesso Físico', codigo: 'REQ-9', ordem: 9, peso: 8,
                controls: [{ codigo: '9.1', titulo: 'Acesso físico restrito?', tipo: 'preventivo', obj: 'Controle de acesso físico.', questions: [{ pergunta: 'O acesso físico aos dados do titular do cartão é restrito?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 10: Log e Monitoramento', codigo: 'REQ-10', ordem: 10, peso: 8,
                controls: [{ codigo: '10.1', titulo: 'Auditoria e logs ativos?', tipo: 'detectivo', obj: 'Logging.', questions: [{ pergunta: 'Todo acesso aos recursos de rede e dados é rastreado e monitorado?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 11: Testes de Segurança', codigo: 'REQ-11', ordem: 11, peso: 8,
                controls: [{ codigo: '11.1', titulo: 'Testes regulares realizados?', tipo: 'detectivo', obj: 'Pentests e Scans.', questions: [{ pergunta: 'A segurança de sistemas e redes é testada regularmente?', tipo: 'sim_nao', evidencia: true }] }]
            },
            {
                nome: 'Req 12: Gestão de Políticas', codigo: 'REQ-12', ordem: 12, peso: 10,
                controls: [{ codigo: '12.1', titulo: 'Políticas mantidas?', tipo: 'preventivo', obj: 'Governança.', questions: [{ pergunta: 'As políticas de segurança são mantidas e disseminadas?', tipo: 'sim_nao', evidencia: true }] }]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('PCI DSS 4.0 Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro PCI DSS'); throw e; }
};

// --- LGPD SEEDER (Adapted as Questions) ---
export const seedLGPD = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'LGPD-BR')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando LGPD com Melhores Práticas...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'Lei Geral de Proteção de Dados (LGPD)',
            codigo: 'LGPD-BR',
            descricao: 'Conformidade de privacidade baseada na Lei 13.709/2018',
            versao: '2024',
            tipo_framework: 'LGPD',
            categoria: 'Privacidade de Dados'
        }, [
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
                nome: 'Cap. III - Direitos dos Titulares', codigo: 'DIR', ordem: 2, peso: 20,
                controls: [
                    {
                        codigo: 'ART.18', titulo: 'Existe canal para requisições de titulares?', tipo: 'corretivo', obj: 'Atender aos direitos dos titulares.',
                        questions: [
                            { pergunta: 'Existe um canal oficial e acessível para recebimento de solicitações dos titulares?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Existe um processo definido para responder em até 15 dias (se completo) ou imediatamente (se simplificado)?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'A organização consegue realizar a portabilidade dos dados quando solicitado?', tipo: 'sim_nao', evidencia: false }
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
                    },
                    {
                        codigo: 'ART.50', titulo: 'Possui inventário de dados (ROPA)?', tipo: 'preventivo', obj: 'Estabelecer programa de governança em privacidade.',
                        questions: [
                            { pergunta: 'A organização possui um inventário de dados pessoais (ROPA) atualizado?', tipo: 'escala_1_5', evidencia: true },
                            { pergunta: 'É realizada a Análise de Impacto (DPIA/RIPD) para tratamentos de alto risco?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Cap. VII - Segurança e Incidentes', codigo: 'SEC', ordem: 4, peso: 20,
                controls: [
                    {
                        codigo: 'ART.46', titulo: 'Há medidas técnicas de proteção?', tipo: 'preventivo', obj: 'Proteger dados pessoais contra acessos ilícitos.',
                        questions: [
                            { pergunta: 'Medidas técnicas (criptografia, firewalls, controles de acesso) estão implementadas para proteger dados pessoais?', tipo: 'escala_1_5', evidencia: true },
                            { pergunta: 'O controle de acesso aos dados pessoais é restrito por necessidade (Need-to-know)?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'ART.48', titulo: 'Há plano de resposta a incidentes?', tipo: 'corretivo', obj: 'Comunicar violações à ANPD e titulares.',
                        questions: [
                            { pergunta: 'Existe um plano de resposta a incidentes que inclui notificação à ANPD em prazo razoável?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os incidentes de segurança são registrados e analisados quanto ao risco aos titulares?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Transferência Internacional', codigo: 'TRANS', ordem: 5, peso: 10,
                controls: [
                    {
                        codigo: 'ART.33', titulo: 'Transferências internacionais mapeadas?', tipo: 'preventivo', obj: 'Regular a transferência de dados para outros países.',
                        questions: [
                            { pergunta: 'A organização identifica e mapeia todas as transferências internacionais de dados?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'São utilizadas Cláusulas Padrão Contratuais (SCCs) ou outro mecanismo legal para transferências?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('LGPD Completa Criada');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro LGPD'); throw e; }
};

// --- NIST CSF 2.0 SEEDER (Adapted as Questions) ---
export const seedNIST = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'NIST-CSF-2.0')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando NIST CSF 2.0 Completo...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'NIST Cybersecurity Framework 2.0',
            codigo: 'NIST-CSF-2.0',
            descricao: 'Framework para redução de riscos de infraestrutura crítica (Funções: GV, ID, PR, DE, RS, RC)',
            versao: '2.0',
            tipo_framework: 'NIST',
            categoria: 'Cibersegurança'
        }, [
            {
                nome: 'Governança (Govern)', codigo: 'GV', ordem: 1, peso: 15,
                controls: [
                    {
                        codigo: 'GV.OC', titulo: 'A missão e riscos são compreendidos?', tipo: 'preventivo', obj: 'Entender missão e expectativas.',
                        questions: [{ pergunta: 'A missão, objetivos e apetite de risco da organização são compreendidos e comunicados?', tipo: 'escala_1_5', evidencia: true }]
                    },
                    {
                        codigo: 'GV.RM', titulo: 'Há estratégia de riscos de suprimentos?', tipo: 'preventivo', obj: 'Estabelecer estratégia de gestão de riscos.',
                        questions: [{ pergunta: 'Existe uma estratégia de gestão de riscos de cadeia de suprimentos estabelecida?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'GV.PO', titulo: 'Políticas de cibersegurança estabelecidas?', tipo: 'diretivo', obj: 'Estabelecer e comunicar políticas de cibersegurança.',
                        questions: [{ pergunta: 'As políticas de cibersegurança organizacionais são estabelecidas, comunicadas e aplicadas?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Identificação (Identify)', codigo: 'ID', ordem: 2, peso: 15,
                controls: [
                    {
                        codigo: 'ID.AM', titulo: 'Ativos são inventariados?', tipo: 'preventivo', obj: 'Inventariar ativos físicos, software e dados.',
                        questions: [
                            { pergunta: 'Os ativos de hardware são inventariados e gerenciados?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os ativos de software e sistemas operacionais são inventariados?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'ID.RA', titulo: 'Vulnerabilidades são identificadas?', tipo: 'preventivo', obj: 'Identificar e analisar riscos cibernéticos.',
                        questions: [{ pergunta: 'Vulnerabilidades de ativos são identificadas e documentadas?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Proteção (Protect)', codigo: 'PR', ordem: 3, peso: 20,
                controls: [
                    {
                        codigo: 'PR.AA', titulo: 'Credenciais são gerenciadas?', tipo: 'preventivo', obj: 'Limitar acesso lógico e físico a ativos.',
                        questions: [
                            { pergunta: 'As identidades e credenciais são gerenciadas (MFA, senhas fortes)?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'O acesso é concedido com base no princípio do menor privilégio?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'PR.DS', titulo: 'Dados em repouso protegidos?', tipo: 'preventivo', obj: 'Proteger confidencialidade, integridade e disponibilidade.',
                        questions: [{ pergunta: 'Dados em repouso são protegidos (ex: criptografia)?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'PR.IR', titulo: 'Backups são testados?', tipo: 'preventivo', obj: 'Gerenciar a resiliência dos sistemas.',
                        questions: [{ pergunta: 'Backups de dados são protegidos e testados regularmente?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Detecção (Detect)', codigo: 'DE', ordem: 4, peso: 15,
                controls: [
                    {
                        codigo: 'DE.AE', titulo: 'Logs são centralizados (SIEM)?', tipo: 'detectivo', obj: 'Detectar atividades anômalas.',
                        questions: [{ pergunta: 'Logs de eventos são coletados e analisados centralmente (SIEM)?', tipo: 'escala_1_5', evidencia: true }]
                    },
                    {
                        codigo: 'DE.CM', titulo: 'A rede é monitorada?', tipo: 'detectivo', obj: 'Monitorar a rede para detectar eventos potenciais.',
                        questions: [{ pergunta: 'A rede é monitorada para detectar pessoal, conexões, dispositivos e softwares não autorizados?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Resposta (Respond)', codigo: 'RS', ordem: 5, peso: 15,
                controls: [
                    {
                        codigo: 'RS.MA', titulo: 'Há plano de resposta a incidentes?', tipo: 'corretivo', obj: 'Agir sobre incidentes detectados.',
                        questions: [{ pergunta: 'Existe um plano de resposta a incidentes documentado e testado anualmente?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'RS.AN', titulo: 'Incidentes são analisados?', tipo: 'corretivo', obj: 'Analisar incidentes para entender impacto.',
                        questions: [{ pergunta: 'Incidentes são analisados para entender alvos e métodos de ataque?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Recuperação (Recover)', codigo: 'RC', ordem: 6, peso: 10,
                controls: [
                    {
                        codigo: 'RC.RP', titulo: 'Planos DRP e BCP gerenciados?', tipo: 'corretivo', obj: 'Restaurar capacidades.',
                        questions: [{ pergunta: 'Os planos de recuperação de desastres (DRP) e continuidade de negócios (BCP) são gerenciados?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('NIST CSF Completo Criado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro NIST'); throw e; }
};

// --- COBIT 2019 SEEDER (Adapted) ---
export const seedCOBIT = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'COBIT-2019')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando COBIT 2019 (Core)...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'COBIT 2019 Enterprise Edition',
            codigo: 'COBIT-2019',
            descricao: 'Framework de governança e gestão de TI corporativo (EDM, APO, BAI, DSS, MEA)',
            versao: '2019',
            tipo_framework: 'COBIT',
            categoria: 'Governança de TI'
        }, [
            {
                nome: 'Avaliar, Dirigir e Monitorar (EDM)', codigo: 'EDM', ordem: 1, peso: 20,
                controls: [
                    {
                        codigo: 'EDM01', titulo: 'Princípios de governança definidos?', tipo: 'preventivo', obj: 'Garantir que a governança de TI esteja alinhada aos objetivos.',
                        questions: [{ pergunta: 'Os princípios de governança de TI foram definidos e comunicados?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'EDM03', titulo: 'Apetite ao risco definido?', tipo: 'diretivo', obj: 'Garantir que o apetite e tolerância a risco sejam entendidos.',
                        questions: [{ pergunta: 'O apetite ao risco da organização foi definido e comunicado?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Alinhar, Planejar e Organizar (APO)', codigo: 'APO', ordem: 2, peso: 20,
                controls: [
                    {
                        codigo: 'APO01', titulo: 'Estrutura org. de TI documentada?', tipo: 'preventivo', obj: 'Estabelecer estrutura organizacional de TI.',
                        questions: [{ pergunta: 'A estrutura organizacional de TI está documentada e comunicada?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'APO12', titulo: 'Há processo formal de riscos?', tipo: 'preventivo', obj: 'Identificar e mitigar riscos de TI.',
                        questions: [{ pergunta: 'Existe um processo formal para identificação e avaliação de riscos de TI?', tipo: 'escala_1_5', evidencia: true }]
                    },
                    {
                        codigo: 'APO13', titulo: 'SGSI estabelecido?', tipo: 'preventivo', obj: 'Definir, operar e monitorar sistema de gestão de segurança.',
                        questions: [{ pergunta: 'Existe um Sistema de Gestão de Segurança da Informação (SGSI) estabelecido?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Construir, Adquirir e Implementar (BAI)', codigo: 'BAI', ordem: 3, peso: 20,
                controls: [
                    {
                        codigo: 'BAI06', titulo: 'Mudanças seguem fluxo formal?', tipo: 'preventivo', obj: 'Minimizar impacto de mudanças.',
                        questions: [{ pergunta: 'Todas as mudanças em produção seguem um fluxo de aprovação formal?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Entregar, Servir e Suportar (DSS)', codigo: 'DSS', ordem: 4, peso: 20,
                controls: [
                    {
                        codigo: 'DSS01', titulo: 'Jobs monitorados diariamente?', tipo: 'preventivo', obj: 'Garantir entrega de serviços.',
                        questions: [{ pergunta: 'Os procedimentos operacionais (backups, jobs) são monitorados diariamente?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'DSS05', titulo: 'Acesso lógico revisado?', tipo: 'preventivo', obj: 'Proteger informações da organização.',
                        questions: [{ pergunta: 'O controle de acesso lógico é revisado periodicamente?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Monitorar, Avaliar e Analisar (MEA)', codigo: 'MEA', ordem: 5, peso: 20,
                controls: [
                    {
                        codigo: 'MEA01', titulo: 'Auditorias regulares realizadas?', tipo: 'detectivo', obj: 'Monitorar a conformidade com leis e regulamentos.',
                        questions: [{ pergunta: 'São realizadas auditorias regulares de conformidade?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('COBIT 2019 Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro COBIT'); throw e; }
};

// --- ITIL 4 SEEDER (Adapted) ---
export const seedITIL = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'ITIL-4')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando ITIL 4 Best Practices...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'ITIL 4 Service Management',
            codigo: 'ITIL-4',
            descricao: 'Melhores práticas para gerenciamento de serviços de TI (ITSM)',
            versao: '4',
            tipo_framework: 'ITIL',
            categoria: 'Gestão de Serviços'
        }, [
            {
                nome: 'Práticas Gerais de Gerenciamento', codigo: 'GEN', ordem: 1, peso: 30,
                controls: [
                    {
                        codigo: 'IPM', titulo: 'Políticas alinhadas ao negócio?', tipo: 'preventivo', obj: 'Proteger a informação da organização.',
                        questions: [{ pergunta: 'As políticas de segurança estão alinhadas com as necessidades do negócio?', tipo: 'escala_1_5', evidencia: true }]
                    },
                    {
                        codigo: 'RM', titulo: 'Stakeholders registrados?', tipo: 'preventivo', obj: 'Manter boas relações com stakeholders.',
                        questions: [{ pergunta: 'Existe um registro de stakeholders e suas necessidades?', tipo: 'sim_nao', evidencia: false }]
                    }
                ]
            },
            {
                nome: 'Práticas de Gerenciamento de Serviço', codigo: 'SERV', ordem: 2, peso: 40,
                controls: [
                    {
                        codigo: 'IM', titulo: 'Processo formal para incidentes?', tipo: 'corretivo', obj: 'Restaurar a operação normal do serviço rapidamente.',
                        questions: [
                            { pergunta: 'Existe um processo formal para registro e classificação de incidentes?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os tempos de resposta e resolução (SLAs) são monitorados?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'CHM', titulo: 'CAB para mudanças críticas?', tipo: 'preventivo', obj: 'Maximizar mudanças de sucesso.',
                        questions: [{ pergunta: 'Existe um CAB (Change Advisory Board) para aprovar mudanças críticas?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'SD', titulo: 'Service Desk é SPOC?', tipo: 'detectivo', obj: 'Ponto único de contato para usuários.',
                        questions: [{ pergunta: 'O Service Desk opera como ponto único de contato (SPOC) para usuários?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Práticas de Gerenciamento Técnico', codigo: 'TECH', ordem: 3, peso: 30,
                controls: [
                    {
                        codigo: 'DM', titulo: 'Implantações testadas pré-prod?', tipo: 'preventivo', obj: 'Mover hardware/software para produção.',
                        questions: [{ pergunta: 'As implantações são planejadas e testadas antes de ir para produção?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('ITIL 4 Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro ITIL'); throw e; }
};

// --- GDPR SEEDER (Adapted) ---
export const seedGDPR = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'GDPR-EU')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando GDPR...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'GDPR - General Data Protection Regulation',
            codigo: 'GDPR-EU',
            descricao: 'Regulamento Geral sobre a Proteção de Dados (União Europeia)',
            versao: '2018',
            tipo_framework: 'GDPR',
            categoria: 'Privacidade'
        }, [
            {
                nome: 'Chapter 2 - Principles', codigo: 'CH2', ordem: 1, peso: 25,
                controls: [
                    {
                        codigo: 'ART.5', titulo: 'Principles (Lawful, Fair, Transparent)?', tipo: 'preventivo', obj: 'Ensure lawfulness, fairness and transparency.',
                        questions: [{ pergunta: 'Are personal data processed lawfully, fairly and in a transparent manner?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Chapter 3 - Rights of the Data Subject', codigo: 'CH3', ordem: 2, peso: 25,
                controls: [
                    {
                        codigo: 'ART.15', titulo: 'Procedure to provide data copy?', tipo: 'corretivo', obj: 'Provide access to data subject.',
                        questions: [{ pergunta: 'Is there a procedure to provide a copy of personal data undergoing processing?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'ART.17', titulo: 'Can erase data upon request?', tipo: 'corretivo', obj: 'Erase personal data without undue delay.',
                        questions: [{ pergunta: 'Can the organization identify and erase personal data upon request?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Chapter 4 - Controller and Processor', codigo: 'CH4', ordem: 3, peso: 25,
                controls: [
                    {
                        codigo: 'ART.32', titulo: 'Encryption measures implemented?', tipo: 'preventivo', obj: 'Implement technical and organisational measures.',
                        questions: [{ pergunta: 'Are measures such as encryption and pseudonymisation implemented?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('GDPR Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro GDPR'); throw e; }
};

// --- SOX SEEDER (Adapted) ---
export const seedSOX = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'SOX-ITGC')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando SOX (ITGC)...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'SOX IT General Controls',
            codigo: 'SOX-ITGC',
            descricao: 'Controles Gerais de TI para conformidade Sarbanes-Oxley',
            versao: '2024',
            tipo_framework: 'SOX',
            categoria: 'Financeiro/Contábil'
        }, [
            {
                nome: 'Access Control (Logical Security)', codigo: 'AC', ordem: 1, peso: 30,
                controls: [
                    {
                        codigo: 'AC.1', titulo: 'Access formal approval required?', tipo: 'preventivo', obj: 'Ensure only authorized users have access.',
                        questions: [
                            { pergunta: 'Are user access requests formally approved by management before access is granted?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Is access revoked immediately (e.g. within 24 hours) upon termination?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'AC.2', titulo: 'Admin access restricted?', tipo: 'preventivo', obj: 'Restrict powerful accounts.',
                        questions: [
                            { pergunta: 'Is administrative access restricted to authorized personnel only?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Are activities of privileged users logged and reviewed?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'AC.3', titulo: 'Access reviewed quarterly?', tipo: 'detectivo', obj: 'Validate access appropriateness.',
                        questions: [
                            { pergunta: 'Are user access rights reviewed periodically (e.g., quarterly) by business owners?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Change Management', codigo: 'CM', ordem: 2, peso: 30,
                controls: [
                    {
                        codigo: 'CM.1', titulo: 'Changes tested and approved?', tipo: 'preventivo', obj: 'Prevent unauthorized changes to financial systems.',
                        questions: [
                            { pergunta: 'Are all changes to financial applications tested and approved before production?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Is there a segregation of duties between developers and those who move code to production?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'IT Operations', codigo: 'OPS', ordem: 3, peso: 20,
                controls: [
                    {
                        codigo: 'OPS.1', titulo: 'Jobs monitored for failure?', tipo: 'preventivo', obj: 'Ensure batch processing accuracy.',
                        questions: [{ pergunta: 'Are batch jobs monitored for failures, and are errors resolved timely?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'OPS.2', titulo: 'Financial backups performed?', tipo: 'corretivo', obj: 'Ensure data availability.',
                        questions: [{ pergunta: 'Are backups of financial data performed daily and verified?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('SOX Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro SOX'); throw e; }
};
