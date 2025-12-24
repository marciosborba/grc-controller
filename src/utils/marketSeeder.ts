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
                for (const q of ctrl.questions) {
                    await supabase.from('assessment_questions').insert({
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
                    });
                }
            }
        }
        return { success: true, action: 'seeded' };
    } catch (e: any) {
        console.error("Seed Error", e);
        throw e;
    }
};

// --- ISO 27001:2022 SEEDER (Expanded) ---
export const seedISO27001 = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'ISO-27001')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando ISO 27001:2022 Completo...');
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
                nome: 'A.5 Controles Organizacionais', codigo: 'A.5', ordem: 1, peso: 25,
                controls: [
                    {
                        codigo: 'A.5.1', titulo: 'Políticas de Segurança da Informação', tipo: 'preventivo', obj: 'Assegurar adequação e apoio da direção.',
                        questions: [
                            { pergunta: 'Existe uma política de segurança da informação definida e aprovada pela alta direção?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'As políticas são revisadas em intervalos planejados ou quando ocorrem mudanças significativas?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'A.5.7', titulo: 'Inteligência de Ameaças', tipo: 'detectivo', obj: 'Coletar e analisar informações sobre ameaças para mitigação.',
                        questions: [
                            { pergunta: 'A organização coleta e analisa informações sobre ameaças de segurança técnica e não técnica?', tipo: 'escala_1_5', evidencia: true },
                            { pergunta: 'As informações de ameaças são usadas para atualizar as avaliações de risco?', tipo: 'sim_nao', evidencia: false }
                        ]
                    },
                    {
                        codigo: 'A.5.23', titulo: 'Segurança da Informação no Uso de Serviços em Nuvem', tipo: 'preventivo', obj: 'Garantir a proteção em serviços cloud.',
                        questions: [
                            { pergunta: 'Os requisitos de segurança para uso de serviços em nuvem foram definidos e acordados?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'A.6 Controles de Pessoas', codigo: 'A.6', ordem: 2, peso: 25,
                controls: [
                    {
                        codigo: 'A.6.1', titulo: 'Seleção (Screening)', tipo: 'preventivo', obj: 'Garantir que colaboradores sejam adequados às funções.',
                        questions: [
                            { pergunta: 'São realizadas verificações de antecedentes (background checks) para todos os candidatos antes da contratação?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'A.6.3', titulo: 'Conscientização e Treinamento', tipo: 'preventivo', obj: 'Assegurar que pessoal esteja ciente das responsabilidades.',
                        questions: [
                            { pergunta: 'Existe um programa formal de conscientização em segurança para todos os funcionários?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os treinamentos cobrem engenharia social e phishing?', tipo: 'multipla_escolha', evidencia: true, opcoes: [{ text: 'Sim, ambos', value: 'both' }, { text: 'Apenas Phishing', value: 'phishing' }, { text: 'Nenhum', value: 'none' }] }
                        ]
                    }
                ]
            },
            {
                nome: 'A.7 Controles Físicos', codigo: 'A.7', ordem: 3, peso: 25,
                controls: [
                    {
                        codigo: 'A.7.1', titulo: 'Perímetros de Segurança Física', tipo: 'preventivo', obj: 'Impedir acesso físico não autorizado.',
                        questions: [
                            { pergunta: 'Existem controles de acesso físico (catracas, crachás) em todas as entradas?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'A.7.4', titulo: 'Monitoramento da Segurança Física', tipo: 'detectivo', obj: 'Detectar acessos físicos não autorizados.',
                        questions: [
                            { pergunta: 'As instalações são monitoradas continuamente (câmeras, alarmes)?', tipo: 'escala_1_5', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'A.8 Controles Tecnológicos', codigo: 'A.8', ordem: 4, peso: 25,
                controls: [
                    {
                        codigo: 'A.8.1', titulo: 'Dispositivos do Usuário Final (Endpoint)', tipo: 'preventivo', obj: 'Proteger informações em dispositivos.',
                        questions: [
                            { pergunta: 'Os dispositivos (laptops, celulares) possuem criptografia de disco habilitada?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Existe bloqueio automático de tela após inatividade?', tipo: 'sim_nao', evidencia: false }
                        ]
                    },
                    {
                        codigo: 'A.8.7', titulo: 'Proteção contra Malware', tipo: 'preventivo', obj: 'Garantir proteção contra software malicioso.',
                        questions: [
                            { pergunta: 'O software antivírus/EDR está instalado e atualizado em todos os endpoints?', tipo: 'escala_1_5', evidencia: true },
                            { pergunta: 'Existem varreduras periódicas automatizadas?', tipo: 'sim_nao', evidencia: false }
                        ]
                    },
                    {
                        codigo: 'A.8.12', titulo: 'Prevenção de Vazamento de Dados (DLP)', tipo: 'preventivo', obj: 'Prevenir divulgação não autorizada.',
                        questions: [
                            { pergunta: 'Existem controles técnicos (DLP) para impedir exfiltração de dados sensíveis?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        toast.success('ISO 27001 Completo Criado');
        return true;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro ISO 27001'); return false; }
};

// --- LGPD SEEDER (Expanded) ---
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
                nome: 'Princípios e Bases Legais', codigo: 'PRIN', ordem: 1, peso: 20,
                controls: [
                    {
                        codigo: 'ART.6', titulo: 'Princípios de Tratamento', tipo: 'preventivo', obj: 'Garantir finalidade, adequação e necessidade.',
                        questions: [
                            { pergunta: 'Para cada atividade de tratamento, a finalidade específica foi documentada?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os dados coletados são os mínimos necessários para a finalidade (Minimização)?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'ART.7', titulo: 'Bases Legais', tipo: 'preventivo', obj: 'Assegurar legalidade do tratamento.',
                        questions: [
                            { pergunta: 'Todas as atividades de tratamento possuem uma base legal atribuída (Consentimento, Legítimo Interesse, etc.)?', tipo: 'escala_1_5', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Direitos dos Titulares', codigo: 'DIR', ordem: 2, peso: 20,
                controls: [
                    {
                        codigo: 'ART.18', titulo: 'Gestão de Requisições', tipo: 'corretivo', obj: 'Atender aos direitos dos titulares.',
                        questions: [
                            { pergunta: 'Existe um canal oficial e acessível para recebimento de solicitações dos titulares?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Existe um processo definido para responder em até 15 dias (se completo)?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Governança e DPO', codigo: 'GOV', ordem: 3, peso: 20,
                controls: [
                    {
                        codigo: 'ART.41', titulo: 'Encarregado (DPO)', tipo: 'preventivo', obj: 'Nomear pessoa para comunicação.',
                        questions: [
                            { pergunta: 'O Encarregado pelo Tratamento de Dados Pessoais (DPO) foi nomeado formalmente?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'A identidade e contatos do DPO estão divulgados publicamente no site?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Segurança e Incidentes', codigo: 'SEC', ordem: 4, peso: 20,
                controls: [
                    {
                        codigo: 'ART.46', titulo: 'Medidas de Segurança', tipo: 'preventivo', obj: 'Proteger dados pessoais contra acessos ilícitos.',
                        questions: [
                            { pergunta: 'Medidas técnicas (criptografia, firewalls) estão implementadas para proteger dados pessoais?', tipo: 'escala_1_5', evidencia: true },
                            { pergunta: 'O controle de acesso aos dados pessoais é restrito por necessidade (Need-to-know)?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'ART.48', titulo: 'Notificação de Incidentes', tipo: 'corretivo', obj: 'Comunicar violações à ANPD e titulares.',
                        questions: [
                            { pergunta: 'Existe um plano de resposta a incidentes que inclui notificação à ANPD em prazo razoável?', tipo: 'sim_nao', evidencia: true }
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

// --- NIST CSF 2.0 SEEDER (Expanded) ---
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
                        codigo: 'GV.OC', titulo: 'Contexto Organizacional', tipo: 'preventivo', obj: 'Entender missão e expectativas.',
                        questions: [{ pergunta: 'A missão, objetivos e apetite de risco da organização são compreendidos e comunicados?', tipo: 'escala_1_5', evidencia: true }]
                    },
                    {
                        codigo: 'GV.RM', titulo: 'Gestão de Riscos', tipo: 'preventivo', obj: 'Estabelecer estratégia de gestão de riscos.',
                        questions: [{ pergunta: 'Existe uma estratégia de gestão de riscos de cadeia de suprimentos estabelecida?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Identificação (Identify)', codigo: 'ID', ordem: 2, peso: 15,
                controls: [
                    {
                        codigo: 'ID.AM', titulo: 'Gestão de Ativos', tipo: 'preventivo', obj: 'Inventariar ativos físicos, software e dados.',
                        questions: [
                            { pergunta: 'Os ativos de hardware são inventariados e gerenciados?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os ativos de software e sistemas operacionais são inventariados?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'ID.RA', titulo: 'Avaliação de Riscos', tipo: 'preventivo', obj: 'Identificar e analisar riscos cibernéticos.',
                        questions: [{ pergunta: 'Vulnerabilidades de ativos são identificadas e documentadas?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Proteção (Protect)', codigo: 'PR', ordem: 3, peso: 20,
                controls: [
                    {
                        codigo: 'PR.AA', titulo: 'Controle de Acesso', tipo: 'preventivo', obj: 'Limitar acesso lógico e físico a ativos.',
                        questions: [
                            { pergunta: 'As identidades e credenciais são gerenciadas (MFA, senhas fortes)?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'O acesso é concedido com base no princípio do menor privilégio?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'PR.DS', titulo: 'Segurança de Dados', tipo: 'preventivo', obj: 'Proteger confidencialidade, integridade e disponibilidade.',
                        questions: [{ pergunta: 'Dados em repouso são protegidos (ex: criptografia)?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Detecção (Detect)', codigo: 'DE', ordem: 4, peso: 15,
                controls: [
                    {
                        codigo: 'DE.AE', titulo: 'Anomalias e Eventos', tipo: 'detectivo', obj: 'Detectar atividades anômalas.',
                        questions: [{ pergunta: 'Logs de eventos são coletados e analisados centralmente (SIEM)?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Resposta (Respond)', codigo: 'RS', ordem: 5, peso: 15,
                controls: [
                    {
                        codigo: 'RS.MA', titulo: 'Gestão de Incidentes', tipo: 'corretivo', obj: 'Agir sobre incidentes detectados.',
                        questions: [{ pergunta: 'Existe um plano de resposta a incidentes testado anualmente?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Recuperação (Recover)', codigo: 'RC', ordem: 6, peso: 20,
                controls: [
                    {
                        codigo: 'RC.RP', titulo: 'Planejamento de Recuperação', tipo: 'corretivo', obj: 'Restaurar capacidades.',
                        questions: [{ pergunta: 'Os processos de backup e recuperação são testados regularmente?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('NIST CSF Completo Criado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro NIST'); throw e; }
};

// --- COBIT 2019 SEEDER ---
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
                        codigo: 'EDM01', titulo: 'Assegurar a definição e manutenção do framework de governança', tipo: 'preventivo', obj: 'Garantir que a governança de TI esteja alinhada aos objetivos.',
                        questions: [{ pergunta: 'Os princípios de governança de TI foram definidos e comunicados?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Alinhar, Planejar e Organizar (APO)', codigo: 'APO', ordem: 2, peso: 20,
                controls: [
                    {
                        codigo: 'APO01', titulo: 'Gerenciar a estrutura de gestão de TI', tipo: 'preventivo', obj: 'Estabelecer estrutura organizacional de TI.',
                        questions: [{ pergunta: 'A estrutura organizacional de TI está documentada e comunicada?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'APO12', titulo: 'Gerenciar Riscos', tipo: 'preventivo', obj: 'Identificar e mitigar riscos de TI.',
                        questions: [{ pergunta: 'Existe um processo formal para identificação e avaliação de riscos de TI?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Construir, Adquirir e Implementar (BAI)', codigo: 'BAI', ordem: 3, peso: 20,
                controls: [
                    {
                        codigo: 'BAI06', titulo: 'Gerenciar mudanças', tipo: 'preventivo', obj: 'Minimizar impacto de mudanças.',
                        questions: [{ pergunta: 'Todas as mudanças em produção seguem um fluxo de aprovação formal?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Entregar, Servir e Suportar (DSS)', codigo: 'DSS', ordem: 4, peso: 20,
                controls: [
                    {
                        codigo: 'DSS01', titulo: 'Gerenciar operações', tipo: 'preventivo', obj: 'Garantir entrega de serviços.',
                        questions: [{ pergunta: 'Os procedimentos operacionais (backups, jobs) são monitorados diariamente?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'DSS05', titulo: 'Gerenciar serviços de segurança', tipo: 'preventivo', obj: 'Proteger informações da organização.',
                        questions: [{ pergunta: 'O controle de acesso lógico é revisado periodicamente?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('COBIT 2019 Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro COBIT'); throw e; }
};

// --- ITIL 4 SEEDER ---
export const seedITIL = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'ITIL-4')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando ITIL 4 Best Practices...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'ITIL 4 Service Management',
            codigo: 'ITIL-4',
            descricao: 'Melhores práticas para gerenciamento de serviços de TI (ITSM)',
            versao: '4',
            tipo_framework: 'CUSTOM', // Mapear para custom/outro se não houver tipo especifico
            categoria: 'Gestão de Serviços'
        }, [
            {
                nome: 'Práticas Gerais de Gerenciamento', codigo: 'GEN', ordem: 1, peso: 30,
                controls: [
                    {
                        codigo: 'IPM', titulo: 'Gerenciamento de Segurança da Informação', tipo: 'preventivo', obj: 'Proteger a informação da organização.',
                        questions: [{ pergunta: 'As políticas de segurança estão alinhadas com as necessidades do negócio?', tipo: 'escala_1_5', evidencia: true }]
                    },
                    {
                        codigo: 'RM', titulo: 'Gerenciamento de Relacionamento', tipo: 'preventivo', obj: 'Manter boas relações com stakeholders.',
                        questions: [{ pergunta: 'Existe um registro de stakeholders e suas necessidades?', tipo: 'sim_nao', evidencia: false }]
                    }
                ]
            },
            {
                nome: 'Práticas de Gerenciamento de Serviço', codigo: 'SERV', ordem: 2, peso: 40,
                controls: [
                    {
                        codigo: 'IM', titulo: 'Gerenciamento de Incidentes', tipo: 'corretivo', obj: 'Restaurar a operação normal do serviço rapidamente.',
                        questions: [
                            { pergunta: 'Existe um processo formal para registro e classificação de incidentes?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Os tempos de resposta e resolução (SLAs) são monitorados?', tipo: 'sim_nao', evidencia: true }
                        ]
                    },
                    {
                        codigo: 'CHM', titulo: 'Habilitação de Mudança', tipo: 'preventivo', obj: 'Maximizar mudanças de sucesso.',
                        questions: [{ pergunta: 'Existe um CAB (Change Advisory Board) para aprovar mudanças críticas?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('ITIL 4 Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro ITIL'); throw e; }
};

// --- PCI DSS 4.0 SEEDER ---
export const seedPCI = async (tenantId: string) => {
    if (await checkFrameworkExists(tenantId, 'PCI-DSS-4.0')) return { success: true, action: 'skipped' };

    const toastId = toast.loading('Semeando PCI DSS 4.0...');
    try {
        const result = await seedFramework(tenantId, {
            nome: 'PCI DSS 4.0',
            codigo: 'PCI-DSS-4.0',
            descricao: 'Padrão de Segurança de Dados para a Indústria de Cartões de Pagamento',
            versao: '4.0',
            tipo_framework: 'PCI_DSS',
            categoria: 'Pagamentos'
        }, [
            {
                nome: 'Construir e Manter Redes Seguras', codigo: 'REQ-1-2', ordem: 1, peso: 20,
                controls: [
                    {
                        codigo: 'REQ.1', titulo: 'Instalar e manter controles de segurança de rede', tipo: 'preventivo', obj: 'Proteger dados de titular de cartão.',
                        questions: [{ pergunta: 'O tráfego de entrada e saída é restrito ao necessário pelo firewall?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'REQ.2', titulo: 'Aplicar configurações seguras', tipo: 'preventivo', obj: 'Não usar padrões de fornecedores.',
                        questions: [{ pergunta: 'As senhas padrão de fornecedores foram alteradas antes da implementação?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Proteger Dados da Conta', codigo: 'REQ-3-4', ordem: 2, peso: 20,
                controls: [
                    {
                        codigo: 'REQ.3', titulo: 'Proteger dados de conta armazenados', tipo: 'preventivo', obj: 'Criptografia e retenção mínima.',
                        questions: [{ pergunta: 'O PAN (Número do Cartão) é armazenado de forma ilegível (criptografado/truncado)?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'REQ.4', titulo: 'Proteger dados em transmissão', tipo: 'preventivo', obj: 'Criptografia forte em redes públicas.',
                        questions: [{ pergunta: 'A transmissão de PAN em redes públicas (internet) utiliza criptografia forte (TLS 1.2+)?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('PCI DSS 4.0 Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro PCI DSS'); throw e; }
};

// --- GDPR SEEDER ---
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
                        codigo: 'ART.5', titulo: 'Principles relating to processing', tipo: 'preventivo', obj: 'Ensure lawfulness, fairness and transparency.',
                        questions: [{ pergunta: 'Are personal data processed lawfully, fairly and in a transparent manner?', tipo: 'escala_1_5', evidencia: true }]
                    }
                ]
            },
            {
                nome: 'Chapter 3 - Rights of the Data Subject', codigo: 'CH3', ordem: 2, peso: 25,
                controls: [
                    {
                        codigo: 'ART.15', titulo: 'Right of access', tipo: 'corretivo', obj: 'Provide access to data subject.',
                        questions: [{ pergunta: 'Is there a procedure to provide a copy of personal data undergoing processing?', tipo: 'sim_nao', evidencia: true }]
                    },
                    {
                        codigo: 'ART.17', titulo: 'Right to erasure (Right to be forgotten)', tipo: 'corretivo', obj: 'Erase personal data without undue delay.',
                        questions: [{ pergunta: 'Can the organization identify and erase personal data upon request?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('GDPR Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro GDPR'); throw e; }
};

// --- SOX SEEDER ---
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
                nome: 'Access Control', codigo: 'AC', ordem: 1, peso: 30,
                controls: [
                    {
                        codigo: 'AC.1', titulo: 'User Provisioning/Deprovisioning', tipo: 'preventivo', obj: 'Ensure only authorized users have access.',
                        questions: [
                            { pergunta: 'Are user access requests formally approved by management?', tipo: 'sim_nao', evidencia: true },
                            { pergunta: 'Is access revoked immediately upon termination?', tipo: 'sim_nao', evidencia: true }
                        ]
                    }
                ]
            },
            {
                nome: 'Change Management', codigo: 'CM', ordem: 2, peso: 30,
                controls: [
                    {
                        codigo: 'CM.1', titulo: 'Change Authorization', tipo: 'preventivo', obj: 'Prevent unauthorized changes to financial systems.',
                        questions: [{ pergunta: 'Are all changes to financial applications tested and approved before production?', tipo: 'sim_nao', evidencia: true }]
                    }
                ]
            }
        ]);
        toast.dismiss(toastId);
        if (result.action === 'seeded') toast.success('SOX Semeado');
        return result;
    } catch (e) { toast.dismiss(toastId); toast.error('Erro SOX'); throw e; }
};
