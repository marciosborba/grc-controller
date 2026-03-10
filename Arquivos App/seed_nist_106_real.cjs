const DatabaseManager = require('./database-manager.cjs');

// === NIST CSF 2.0 FULL (106 CONTROLS) ===
// Structure based on official 2.0 Core:
// GOVERN (GV): 31 (OC:5, RM:7, RR:4, PO:2, OV:3, SC:10)
// IDENTIFY (ID): 17 (AM:7, RA:7, IM:3)
// PROTECT (PR): 29 (AA:8, AT:4, DS:10, PS:4, IR:3)
// DETECT (DE): 10 (AE:4, CM:4, DP:2)
// RESPOND (RS): 11 (MA:3, AN:4, CO:2, MI:2)
// RECOVER (RC): 8 (RP:3, IM:2, CO:3)
// TOTAL: 106

const NIST_DATA = {
    data: {
        nome: 'NIST Cybersecurity Framework 2.0', codigo: 'NIST-CSF-2.0', descricao: 'Framework Oficial NIST CSF 2.0 (Completo - 106 Controles)', versao: '2.0', tipo_framework: 'NIST', categoria: 'Cibersegurança', is_standard: true, publico: true, status: 'ativo'
    },
    domains: [
        {
            nome: 'GOVERN (GV)', codigo: 'GV', ordem: 1, peso: 20,
            controls: [
                // GV.OC (5)
                { codigo: 'GV.OC-01', titulo: 'Mission & Vision', tipo: 'preventivo', obj: 'Organizational Context.', questions: [{ pergunta: 'A missão é compreendida e informa a gestão de riscos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.OC-02', titulo: 'Internal/External Stakeholders', tipo: 'preventivo', obj: 'Context.', questions: [{ pergunta: 'Requisitos das partes interessadas são compreendidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.OC-03', titulo: 'Legal & Regulatory', tipo: 'preventivo', obj: 'Compliance.', questions: [{ pergunta: 'Requisitos legais e contratuais são gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.OC-04', titulo: 'Critical Objectives', tipo: 'preventivo', obj: 'Objectives.', questions: [{ pergunta: 'Objetivos críticos de serviço são identificados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.OC-05', titulo: 'Outcomes', tipo: 'preventivo', obj: 'Performance.', questions: [{ pergunta: 'Resultados de desempenho são priorizados?', tipo: 'sim_nao', evidencia: true }] },
                // GV.RM (7)
                { codigo: 'GV.RM-01', titulo: 'Risk Strategy', tipo: 'preventivo', obj: 'Risk Mgmt.', questions: [{ pergunta: 'Estratégia de risco é estabelecida?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RM-02', titulo: 'Risk Appetite', tipo: 'diretivo', obj: 'Risk Appetite.', questions: [{ pergunta: 'Apetite ao risco é definido?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RM-03', titulo: 'Risk Assessment Context', tipo: 'preventivo', obj: 'Context.', questions: [{ pergunta: 'O contexto para avaliações de risco é estabelecido?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RM-04', titulo: 'Risk Taxonomy', tipo: 'preventivo', obj: 'Taxonomy.', questions: [{ pergunta: 'Uma taxonomia de risco padronizada é usada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RM-05', titulo: 'Risk Improvement', tipo: 'preventivo', obj: 'Improvement.', questions: [{ pergunta: 'A gestão de riscos é melhorada continuamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RM-06', titulo: 'Risk Reporting', tipo: 'detectivo', obj: 'Reporting.', questions: [{ pergunta: 'Riscos são reportados aos níveis apropriados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RM-07', titulo: 'Risk Culture', tipo: 'preventivo', obj: 'Culture.', questions: [{ pergunta: 'Uma cultura de consciência de risco é promovida?', tipo: 'sim_nao', evidencia: false }] },
                // GV.RR (4)
                { codigo: 'GV.RR-01', titulo: 'Leadership', tipo: 'preventivo', obj: 'Roles.', questions: [{ pergunta: 'A liderança demonstra compromisso com a cibersegurança?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RR-02', titulo: 'Roles & Resp', tipo: 'preventivo', obj: 'Assignment.', questions: [{ pergunta: 'Responsabilidades de segurança são atribuídas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RR-03', titulo: 'Resources', tipo: 'preventivo', obj: 'Allocation.', questions: [{ pergunta: 'Recursos adequados são alocados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.RR-04', titulo: 'Personnel Vetting', tipo: 'preventivo', obj: 'Vetting.', questions: [{ pergunta: 'A verificação de pessoal é realizada?', tipo: 'sim_nao', evidencia: true }] },
                // GV.PO (2)
                { codigo: 'GV.PO-01', titulo: 'Policies Estab', tipo: 'diretivo', obj: 'Policy.', questions: [{ pergunta: 'Políticas organizacionais são estabelecidas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.PO-02', titulo: 'Policy Comms', tipo: 'preventivo', obj: 'Comms.', questions: [{ pergunta: 'Políticas são comunicadas e reforçadas?', tipo: 'sim_nao', evidencia: true }] },
                // GV.OV (3)
                { codigo: 'GV.OV-01', titulo: 'Program Monitoring', tipo: 'detectivo', obj: 'Oversight.', questions: [{ pergunta: 'O desempenho do programa de segurança é monitorado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.OV-02', titulo: 'Corrective Action', tipo: 'corretivo', obj: 'Action.', questions: [{ pergunta: 'Ações corretivas são tomadas para deficiências?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.OV-03', titulo: 'Program Review', tipo: 'detectivo', obj: 'Review.', questions: [{ pergunta: 'O programa é revisado periodicamente?', tipo: 'sim_nao', evidencia: true }] },
                // GV.SC (10)
                { codigo: 'GV.SC-01', titulo: 'SCRM Strategy', tipo: 'preventivo', obj: 'SCRM.', questions: [{ pergunta: 'Estratégia de risco da cadeia de suprimentos definida?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-02', titulo: 'Supplier Requirements', tipo: 'preventivo', obj: 'Requirements.', questions: [{ pergunta: 'Requisitos de segurança para fornecedores definidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-03', titulo: 'Supplier Contracts', tipo: 'preventivo', obj: 'Contracts.', questions: [{ pergunta: 'Contratos incluem cláusulas de segurança?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-04', titulo: 'Supplier Assessment', tipo: 'detectivo', obj: 'Assessment.', questions: [{ pergunta: 'Fornecedores são avaliados antes da contratação?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-05', titulo: 'Supplier Monitoring', tipo: 'detectivo', obj: 'Monitoring.', questions: [{ pergunta: 'Fornecedores são monitorados continuamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-06', titulo: 'Supplier Termination', tipo: 'preventivo', obj: 'Termination.', questions: [{ pergunta: 'Processos de encerramento de fornecedores definidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-07', titulo: 'SCRM Response', tipo: 'corretivo', obj: 'Response.', questions: [{ pergunta: 'Incidentes na cadeia de suprimentos são gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-08', titulo: 'SCRM Improvement', tipo: 'preventivo', obj: 'Improvement.', questions: [{ pergunta: 'O processo SCRM é melhorado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-09', titulo: 'SCRM Integration', tipo: 'preventivo', obj: 'Integration.', questions: [{ pergunta: 'SCRM integrado ao risco corporativo?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'GV.SC-10', titulo: 'Technology Acquisition', tipo: 'preventivo', obj: 'Acquisition.', questions: [{ pergunta: 'Segurança considerada na aquisição de tecnologia?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'IDENTIFY (ID)', codigo: 'ID', ordem: 2, peso: 15,
            controls: [
                // ID.AM (7)
                { codigo: 'ID.AM-01', titulo: 'Hardware Inventory', tipo: 'preventivo', obj: 'Assets.', questions: [{ pergunta: 'Inventário de hardware gerenciado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.AM-02', titulo: 'Software Inventory', tipo: 'preventivo', obj: 'Assets.', questions: [{ pergunta: 'Inventário de software gerenciado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.AM-03', titulo: 'Data Flow', tipo: 'detectivo', obj: 'Mapping.', questions: [{ pergunta: 'Fluxo de dados mapeado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.AM-04', titulo: 'External Systems', tipo: 'preventivo', obj: 'Catalog.', questions: [{ pergunta: 'Sistemas externos catalogados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.AM-05', titulo: 'Asset Criticality', tipo: 'preventivo', obj: 'Prioritization.', questions: [{ pergunta: 'Ativos priorizados por criticidade?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.AM-06', titulo: 'Dependency Mapping', tipo: 'detectivo', obj: 'Dependencies.', questions: [{ pergunta: 'Dependências de sistemas mapeadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.AM-07', titulo: 'Lifecycle Mgmt', tipo: 'preventivo', obj: 'Lifecycle.', questions: [{ pergunta: 'Ciclo de vida dos ativos gerenciado?', tipo: 'sim_nao', evidencia: true }] },
                // ID.RA (7)
                { codigo: 'ID.RA-01', titulo: 'Vulnerability Mgmt', tipo: 'detectivo', obj: 'Vulns.', questions: [{ pergunta: 'Vulnerabilidades identificadas e gerenciadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.RA-02', titulo: 'Threat Analysis', tipo: 'detectivo', obj: 'Threats.', questions: [{ pergunta: 'Inteligência de ameaças utilizada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.RA-03', titulo: 'Internal Threats', tipo: 'detectivo', obj: 'Internal.', questions: [{ pergunta: 'Ameaças internas consideradas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.RA-04', titulo: 'Business Impact', tipo: 'preventivo', obj: 'BIA.', questions: [{ pergunta: 'Impactos nos negócios analisados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.RA-05', titulo: 'Likelihood', tipo: 'preventivo', obj: 'Risk.', questions: [{ pergunta: 'Probabilidade de risco determinada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.RA-06', titulo: 'Risk Register', tipo: 'preventivo', obj: 'Register.', questions: [{ pergunta: 'Registro de riscos mantido?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.RA-07', titulo: 'Risk Responses', tipo: 'preventivo', obj: 'Responses.', questions: [{ pergunta: 'Respostas aos riscos priorizadas?', tipo: 'sim_nao', evidencia: true }] },
                // ID.IM (3)
                { codigo: 'ID.IM-01', titulo: 'Improvement Plans', tipo: 'preventivo', obj: 'Plans.', questions: [{ pergunta: 'Planos de melhoria estabelecidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.IM-02', titulo: 'Strategy Update', tipo: 'preventivo', obj: 'Update.', questions: [{ pergunta: 'Estratégia atualizada com lições aprendidas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'ID.IM-03', titulo: 'Testing & Exercises', tipo: 'detectivo', obj: 'Testing.', questions: [{ pergunta: 'Planos testados regularmente?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'PROTECT (PR)', codigo: 'PR', ordem: 3, peso: 20,
            controls: [
                // PR.AA (8)
                { codigo: 'PR.AA-01', titulo: 'Identity Mgmt', tipo: 'preventivo', obj: 'IAM.', questions: [{ pergunta: 'Identidades gerenciadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AA-02', titulo: 'Physical Access', tipo: 'preventivo', obj: 'Physical.', questions: [{ pergunta: 'Acesso físico gerido?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AA-03', titulo: 'Remote Access', tipo: 'preventivo', obj: 'Remote.', questions: [{ pergunta: 'Acesso remoto protegido?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AA-04', titulo: 'Authorizations', tipo: 'preventivo', obj: 'Authz.', questions: [{ pergunta: 'Permissões gerenciadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AA-05', titulo: 'Least Privilege', tipo: 'preventivo', obj: 'Least Priv.', questions: [{ pergunta: 'Menor privilégio aplicado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AA-06', titulo: 'Separation of Duties', tipo: 'preventivo', obj: 'SoD.', questions: [{ pergunta: 'Segregação de funções aplicada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AA-07', titulo: 'Authentication', tipo: 'preventivo', obj: 'Authn.', questions: [{ pergunta: 'Autenticação forte utilizada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AA-08', titulo: 'Audit Logs', tipo: 'detectivo', obj: 'Logs.', questions: [{ pergunta: 'Atividades de usuário logadas?', tipo: 'sim_nao', evidencia: true }] },
                // PR.AT (4)
                { codigo: 'PR.AT-01', titulo: 'Awareness Program', tipo: 'preventivo', obj: 'Training.', questions: [{ pergunta: 'Programa de conscientização ativo?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AT-02', titulo: 'Privileged Users', tipo: 'preventivo', obj: 'Privileged.', questions: [{ pergunta: 'Treinamento para usuários privilegiados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AT-03', titulo: 'Role-Based Training', tipo: 'preventivo', obj: 'Roles.', questions: [{ pergunta: 'Treinamento baseado em função?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.AT-04', titulo: '3rd Party Training', tipo: 'preventivo', obj: 'Partners.', questions: [{ pergunta: 'Treinamento para terceiros/parceiros?', tipo: 'sim_nao', evidencia: false }] },
                // PR.DS (10)
                { codigo: 'PR.DS-01', titulo: 'Data at Rest', tipo: 'preventivo', obj: 'Rest.', questions: [{ pergunta: 'Dados em repouso protegidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-02', titulo: 'Data in Transit', tipo: 'preventivo', obj: 'Transit.', questions: [{ pergunta: 'Dados em trânsito protegidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-03', titulo: 'Asset Management', tipo: 'preventivo', obj: 'Assets.', questions: [{ pergunta: 'Mudanças em ativos controladas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-04', titulo: 'Capacity Mgmt', tipo: 'preventivo', obj: 'Capacity.', questions: [{ pergunta: 'Capacidade gerenciada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-05', titulo: 'Data Leakage', tipo: 'preventivo', obj: 'DLP.', questions: [{ pergunta: 'Proteção contra vazamento de dados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-06', titulo: 'Integrity Checking', tipo: 'detectivo', obj: 'Integrity.', questions: [{ pergunta: 'Integridade verificada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-09', titulo: 'Backups', tipo: 'preventivo', obj: 'Backup.', questions: [{ pergunta: 'Backups mantidos e testados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-10', titulo: 'Development Env', tipo: 'preventivo', obj: 'Dev.', questions: [{ pergunta: 'Ambientes de desenvolvimento protegidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-11', titulo: 'Data Destruction', tipo: 'preventivo', obj: 'Destruction.', questions: [{ pergunta: 'Descarte seguro de dados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.DS-12', titulo: 'Availability', tipo: 'preventivo', obj: 'Avail.', questions: [{ pergunta: 'Disponibilidade mantida?', tipo: 'sim_nao', evidencia: true }] },
                // PR.PS (4)
                { codigo: 'PR.PS-01', titulo: 'Config Mgmt', tipo: 'preventivo', obj: 'Baseline.', questions: [{ pergunta: 'Configurações de base mantidas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.PS-02', titulo: 'Change Control', tipo: 'preventivo', obj: 'Change.', questions: [{ pergunta: 'Controle de mudanças implementado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.PS-03', titulo: 'Software Install', tipo: 'preventivo', obj: 'Install.', questions: [{ pergunta: 'Instalação de software controlada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.PS-04', titulo: 'Log Management', tipo: 'detectivo', obj: 'Logs.', questions: [{ pergunta: 'Logs configurados e mantidos?', tipo: 'sim_nao', evidencia: true }] },
                // PR.IR (3)
                { codigo: 'PR.IR-01', titulo: 'Resilient Networks', tipo: 'preventivo', obj: 'Infra.', questions: [{ pergunta: 'Redes resilientes implementadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.IR-02', titulo: 'Resilient Systems', tipo: 'preventivo', obj: 'Systems.', questions: [{ pergunta: 'Sistemas resilientes implementados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'PR.IR-03', titulo: 'Virtualization', tipo: 'preventivo', obj: 'Virtual.', questions: [{ pergunta: 'Virtualização segura?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'DETECT (DE)', codigo: 'DE', ordem: 4, peso: 15,
            controls: [
                // DE.AE (4)
                { codigo: 'DE.AE-02', titulo: 'Event Detection', tipo: 'detectivo', obj: 'Events.', questions: [{ pergunta: 'Eventos detectados em tempo hábil?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'DE.AE-03', titulo: 'Event Analysis', tipo: 'detectivo', obj: 'Analysis.', questions: [{ pergunta: 'Eventos analisados para entender alvos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'DE.AE-04', titulo: 'Impact Analysis', tipo: 'detectivo', obj: 'Impact.', questions: [{ pergunta: 'Impacto de eventos determinado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'DE.AE-06', titulo: 'Thresholds', tipo: 'detectivo', obj: 'Alerts.', questions: [{ pergunta: 'Limites de alerta estabelecidos?', tipo: 'sim_nao', evidencia: true }] },
                // DE.CM (4)
                { codigo: 'DE.CM-01', titulo: 'Network Monitoring', tipo: 'detectivo', obj: 'Network.', questions: [{ pergunta: 'Monitoramento de rede ativo?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'DE.CM-02', titulo: 'Physical Monitoring', tipo: 'detectivo', obj: 'Physical.', questions: [{ pergunta: 'Monitoramento de ambiente físico?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'DE.CM-03', titulo: 'Personnel Activity', tipo: 'detectivo', obj: 'Admin.', questions: [{ pergunta: 'Atividade de pessoal monitorada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'DE.CM-06', titulo: 'External Monitoring', tipo: 'detectivo', obj: 'Service Provider.', questions: [{ pergunta: 'Monitoramento de serviços externos?', tipo: 'sim_nao', evidencia: true }] },
                // DE.DP (2)
                { codigo: 'DE.DP-01', titulo: 'Roles & Resp', tipo: 'preventivo', obj: 'Roles.', questions: [{ pergunta: 'Papéis de detecção definidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'DE.DP-04', titulo: 'Event Info Comm', tipo: 'detectivo', obj: 'Comms.', questions: [{ pergunta: 'Informação de eventos comunicada?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'RESPOND (RS)', codigo: 'RS', ordem: 5, peso: 15,
            controls: [
                // RS.MA (3)
                { codigo: 'RS.MA-01', titulo: 'Incident Plan', tipo: 'preventivo', obj: 'Plan.', questions: [{ pergunta: 'Plano de resposta executado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RS.MA-02', titulo: 'Incident Report', tipo: 'detectivo', obj: 'Reporting.', questions: [{ pergunta: 'Incidentes reportados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RS.MA-03', titulo: 'Personnel Support', tipo: 'corretivo', obj: 'Support.', questions: [{ pergunta: 'Suporte a pessoal durante incidentes?', tipo: 'sim_nao', evidencia: true }] },
                // RS.AN (4)
                { codigo: 'RS.AN-03', titulo: 'Forensics', tipo: 'corretivo', obj: 'Forensics.', questions: [{ pergunta: 'Análise forense realizada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RS.AN-04', titulo: 'Categorization', tipo: 'corretivo', obj: 'Cat.', questions: [{ pergunta: 'Incidentes categorizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RS.AN-05', titulo: 'Vulnerability Mit', tipo: 'corretivo', obj: 'Vuln.', questions: [{ pergunta: 'Vulnerabilidades exploradas mitigadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RS.AN-06', titulo: 'Response Coord', tipo: 'corretivo', obj: 'Coord.', questions: [{ pergunta: 'Resposta coordenada?', tipo: 'sim_nao', evidencia: true }] },
                // RS.CO (2)
                { codigo: 'RS.CO-02', titulo: 'Stakeholders', tipo: 'corretivo', obj: 'Comms.', questions: [{ pergunta: 'Stakeholders notificados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RS.CO-03', titulo: 'Public Relation', tipo: 'corretivo', obj: 'PR.', questions: [{ pergunta: 'Comunicação pública gerenciada?', tipo: 'sim_nao', evidencia: true }] },
                // RS.MI (2)
                { codigo: 'RS.MI-01', titulo: 'Containment', tipo: 'corretivo', obj: 'Contain.', questions: [{ pergunta: 'Incidentes contidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RS.MI-02', titulo: 'Eradication', tipo: 'corretivo', obj: 'Eradicate.', questions: [{ pergunta: 'Ameaças erradicadas?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: 'RECOVER (RC)', codigo: 'RC', ordem: 6, peso: 15,
            controls: [
                // RC.RP (3)
                { codigo: 'RC.RP-01', titulo: 'Recovery Plan', tipo: 'corretivo', obj: 'Plan.', questions: [{ pergunta: 'Plano de recuperação executado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RC.RP-02', titulo: 'Recovery Scope', tipo: 'corretivo', obj: 'Scope.', questions: [{ pergunta: 'Escopo de recuperação definido?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RC.RP-03', titulo: 'Recovery Time', tipo: 'corretivo', obj: 'Time.', questions: [{ pergunta: 'Tempos de recuperação atingidos?', tipo: 'sim_nao', evidencia: true }] },
                // RC.IM (2)
                { codigo: 'RC.IM-01', titulo: 'Lessons Learned', tipo: 'preventivo', obj: 'Lessons.', questions: [{ pergunta: 'Lições aprendidas incorporadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RC.IM-02', titulo: 'Plan Update', tipo: 'preventivo', obj: 'Update.', questions: [{ pergunta: 'Estratégias atualizadas?', tipo: 'sim_nao', evidencia: true }] },
                // RC.CO (3)
                { codigo: 'RC.CO-01', titulo: 'Public Relations', tipo: 'corretivo', obj: 'PR.', questions: [{ pergunta: 'RP gerenciado durante recuperação?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RC.CO-02', titulo: 'Reputation', tipo: 'corretivo', obj: 'Reputation.', questions: [{ pergunta: 'Reputação reparada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: 'RC.CO-03', titulo: 'Status Comms', tipo: 'corretivo', obj: 'Status.', questions: [{ pergunta: 'Status de recuperação comunicado?', tipo: 'sim_nao', evidencia: true }] }
            ]
        }
    ]
};

async function seedNISTFull() {
    console.log("🚀 Seeding NIST CSF 2.0 FULL 106...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    const client = db.client;

    try {
        const fw = NIST_DATA;
        // 1. Force Clean
        const getFw = await client.query("SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true", [TENANT_ID, fw.data.codigo]);
        if (getFw.rows.length > 0) {
            const fid = getFw.rows[0].id;
            console.log("  🗑️ Cleaning existing NIST...");
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
                [fwId, d.nome, d.codigo, 'Function: ' + d.nome, d.ordem, d.peso, TENANT_ID, true]
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
        console.log("🎉 NIST 106 seeded!");
    } catch (e) { console.error(e); } finally { await db.disconnect(); }
}
seedNISTFull();
