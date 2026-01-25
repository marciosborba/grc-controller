const DatabaseManager = require('./database-manager.cjs');

// Mappings from run_translations.cjs
const gdpr_controls = {
    'Processing Principles': 'Princípios de Processamento',
    'Lawfulness': 'Legalidade',
    'Consent': 'Consentimento',
    'Special Categories': 'Categorias Especiais',
    'Transparent Info': 'Informação Transparente',
    'Right of Access': 'Direito de Acesso',
    'Rectification': 'Retificação',
    'Erasure (Right to be Forgotten)': 'Exclusão (Direito ao Esquecimento)',
    'Data Portability': 'Portabilidade de Dados',
    'Right to Object': 'Direito de Oposição',
    'Controller Responsibility': 'Responsabilidade do Controlador',
    'Data Protection by Design': 'Proteção de Dados por Design',
    'Processor': 'Processador',
    'Records of Processing (ROPA)': 'Registros de Processamento (ROPA)',
    'Security of Processing': 'Segurança do Processamento',
    'Breach Notification (Auth)': 'Notificação de Violação (Autoridade)',
    'Breach Notification (Subject)': 'Notificação de Violação (Titular)',
    'DPIA': 'DPIA (Avaliação de Impacto)',
    'DPO': 'Encarregado (DPO)',
    'General Principle': 'Princípios Gerais',
    'Safeguards': 'Salvaguardas'
};

const gdpr_questions = {
    'Are data processed lawfully, fairly and transparently?': 'Os dados são processados de forma lícita, justa e transparente?',
    'Is there a valid legal basis for each processing activity?': 'Existe uma base legal válida para cada atividade de processamento?',
    'Are conditions for consent (freely given, specific, informed) met?': 'As condições para consentimento (livre, específico, informado) são atendidas?',
    'Is processing of special categories of data prohibited unless exception applies?': 'O processamento de categorias especiais de dados é proibido, salvo exceções?',
    'Is information provided to data subjects concise, transparent, and accessible?': 'As informações fornecidas aos titulares são concisas, transparentes e acessíveis?',
    'Can the controller provide confirmation and access to personal data?': 'O controlador pode fornecer confirmação e acesso aos dados pessoais?',
    'Is there a process to rectify inaccurate data without delay?': 'Existe um processo para retificar dados imprecisos sem demora?',
    'Is data erased when no longer necessary or consent is withdrawn?': 'Os dados são apagados quando não são mais necessários ou o consentimento é retirado?',
    'Can data be provided in a structured, machine-readable format?': 'Os dados podem ser fornecidos em formato estruturado e legível por máquina?',
    'Is the right to object to processing (esp. direct marketing) respected?': 'O direito de oposição ao processamento (esp. marketing direto) é respeitado?',
    'Are technical and organisational measures implemented to ensure compliance?': 'Medidas técnicas e organizacionais são implementadas para garantir a conformidade?',
    'Is data protection implemented by design and by default?': 'A proteção de dados é implementada desde a concepção e por padrão?',
    'Are processors engaged only under binding contract ensuring GDPR compliance?': 'Os processadores são contratados apenas sob contrato vinculativo garantindo conformidade?',
    'Is a record of processing activities maintained (if applicable)?': 'O registro das atividades de processamento é mantido (se aplicável)?',
    'Are measures (encryption, resilience, testing) in place to ensure security?': 'Medidas (criptografia, resiliência, testes) estão em vigor para garantir a segurança?',
    'Are breaches notified to the supervisory authority within 72h?': 'As violações são notificadas à autoridade supervisora em até 72h?',
    'Are high-risk breaches communicated to data subjects without delay?': 'Violações de alto risco são comunicadas aos titulares sem demora?',
    'Is a Data Protection Impact Assessment carried out for high risks?': 'Uma Avaliação de Impacto (DPIA) é realizada para riscos elevados?',
    'Is a DPO designated where required?': 'Um DPO (Encarregado) foi designado onde exigido?',
    'Are transfers to third countries compliant with Chapter V?': 'As transferências para países terceiros estão em conformidade com o Capítulo V?',
    'Are appropriate safeguards (e.g., SCCs, BCRs) in place if no adequacy decision exists?': 'Existem salvaguardas apropriadas (ex: SCCs, BCRs) caso não exista decisão de adequação?'
};

const nist_controls = {
    'Mission & Vision': 'Missão e Visão',
    'Internal/External Stakeholders': 'Partes Interessadas Internas/Externas',
    'Legal & Regulatory': 'Legal e Regulatório',
    'Critical Objectives': 'Objetivos Críticos',
    'Outcomes': 'Resultados',
    'Risk Strategy': 'Estratégia de Risco',
    'Risk Appetite': 'Apetite ao Risco',
    'Risk Assessment Context': 'Contexto da Avaliação de Risco',
    'Risk Taxonomy': 'Taxonomia de Risco',
    'Risk Improvement': 'Melhoria de Risco',
    'Risk Reporting': 'Relatórios de Risco',
    'Risk Culture': 'Cultura de Risco',
    'Leadership': 'Liderança',
    'Roles & Resp': 'Papéis e Responsabilidades',
    'Resources': 'Recursos',
    'Personnel Vetting': 'Verificação de Pessoal',
    'Policies Estab': 'Estabelecimento de Políticas',
    'Policy Comms': 'Comunicação de Políticas',
    'Program Monitoring': 'Monitoramento do Programa',
    'Corrective Action': 'Ação Corretiva',
    'Program Review': 'Revisão do Programa',
    'SCRM Strategy': 'Estratégia de SCRM',
    'Supplier Requirements': 'Requisitos de Fornecedores',
    'Supplier Contracts': 'Contratos com Fornecedores',
    'Supplier Assessment': 'Avaliação de Fornecedores',
    'Supplier Monitoring': 'Monitoramento de Fornecedores',
    'Supplier Termination': 'Encerramento de Fornecedores',
    'SCRM Response': 'Resposta SCRM',
    'SCRM Improvement': 'Melhoria SCRM',
    'SCRM Integration': 'Integração SCRM',
    'Technology Acquisition': 'Aquisição de Tecnologia',
    'Hardware Inventory': 'Inventário de Hardware',
    'Software Inventory': 'Inventário de Software',
    'Data Flow': 'Fluxo de Dados',
    'External Systems': 'Sistemas Externos',
    'Asset Criticality': 'Criticidade dos Ativos',
    'Dependency Mapping': 'Mapeamento de Dependências',
    'Lifecycle Mgmt': 'Gestão do Ciclo de Vida',
    'Vulnerability Mgmt': 'Gestão de Vulnerabilidades',
    'Threat Analysis': 'Análise de Ameaças',
    'Internal Threats': 'Ameaças Internas',
    'Business Impact': 'Impacto no Negócio',
    'Likelihood': 'Probabilidade',
    'Risk Register': 'Registro de Riscos',
    'Risk Responses': 'Respostas a Riscos',
    'Improvement Plans': 'Planos de Melhoria',
    'Strategy Update': 'Atualização da Estratégia',
    'Testing & Exercises': 'Testes e Exercícios',
    'Identity Mgmt': 'Gestão de Identidade',
    'Physical Access': 'Acesso Físico',
    'Remote Access': 'Acesso Remoto',
    'Authorizations': 'Autorizações',
    'Least Privilege': 'Menor Privilégio',
    'Separation of Duties': 'Segregação de Funções',
    'Authentication': 'Autenticação',
    'Audit Logs': 'Logs de Auditoria',
    'Awareness Program': 'Programa de Conscientização',
    'Privileged Users': 'Usuários Privilegiados',
    'Role-Based Training': 'Treinamento Baseado em Função',
    '3rd Party Training': 'Treinamento de Terceiros',
    'Data at Rest': 'Dados em Repouso',
    'Data in Transit': 'Dados em Trânsito',
    'Asset Management': 'Gestão de Ativos',
    'Capacity Mgmt': 'Gestão de Capacidade',
    'Data Leakage': 'Vazamento de Dados',
    'Integrity Checking': 'Verificação de Integridade',
    'Backups': 'Backups',
    'Development Env': 'Ambiente de Desenvolvimento',
    'Data Destruction': 'Destruição de Dados',
    'Availability': 'Disponibilidade',
    'Config Mgmt': 'Gestão de Configuração',
    'Change Control': 'Controle de Mudanças',
    'Software Install': 'Instalação de Software',
    'Log Management': 'Gestão de Logs',
    'Resilient Networks': 'Redes Resilientes',
    'Resilient Systems': 'Sistemas Resilientes',
    'Virtualization': 'Virtualização',
    'Event Detection': 'Detecção de Eventos',
    'Event Analysis': 'Análise de Eventos',
    'Impact Analysis': 'Análise de Impacto',
    'Thresholds': 'Limiares',
    'Network Monitoring': 'Monitoramento de Rede',
    'Physical Monitoring': 'Monitoramento Físico',
    'Personnel Activity': 'Atividade de Pessoal',
    'External Monitoring': 'Monitoramento Externo',
    'Event Info Comm': 'Comunicação de Eventos',
    'Incident Plan': 'Plano de Incidentes',
    'Incident Report': 'Relatório de Incidentes',
    'Personnel Support': 'Suporte ao Pessoal',
    'Forensics': 'Forense',
    'Categorization': 'Categorização',
    'Vulnerability Mit': 'Mitigação de Vulnerabilidades',
    'Response Coord': 'Coordenação de Resposta',
    'Stakeholders': 'Partes Interessadas',
    'Public Relation': 'Relações Públicas',
    'Containment': 'Contenção',
    'Eradication': 'Erradicação',
    'Recovery Plan': 'Plano de Recuperação',
    'Recovery Scope': 'Escopo de Recuperação',
    'Recovery Time': 'Tempo de Recuperação',
    'Lessons Learned': 'Lições Aprendidas',
    'Plan Update': 'Atualização do Plano',
    'Public Relations': 'Relações Públicas',
    'Reputation': 'Reputação',
    'Status Comms': 'Comunicação de Status'
};

const cobit_controls = {
    'Governance Framework': 'Framework de Governança',
    'Benefits Delivery': 'Entrega de Benefícios',
    'Risk Optimization': 'Otimização de Riscos',
    'Resource Optimization': 'Otimização de Recursos',
    'Stakeholder Engagement': 'Engajamento das Partes Interessadas',
    'Management Framework': 'Framework de Gestão',
    'Strategy': 'Estratégia',
    'Enterprise Architecture': 'Arquitetura Corporativa',
    'Innovation': 'Inovação',
    'Portfolio': 'Portfólio',
    'Budget & Costs': 'Orçamento e Custos',
    'Human Resources': 'Recursos Humanos',
    'Relationships': 'Relacionamentos',
    'Service Agreements': 'Acordos de Serviço',
    'Vendors': 'Fornecedores',
    'Quality': 'Qualidade',
    'Risk': 'Risco',
    'Security': 'Segurança',
    'Data': 'Dados',
    'Programs': 'Programas',
    'Requirements': 'Requisitos',
    'Solutions Build': 'Construção de Soluções',
    'Availability & Capacity': 'Disponibilidade e Capacidade',
    'Change': 'Mudança',
    'Changes IT': 'Mudanças de TI',
    'Transition': 'Transição',
    'Knowledge': 'Conhecimento',
    'Assets': 'Ativos',
    'Configuration': 'Configuração',
    'Projects': 'Projetos',
    'Operations': 'Operações',
    'Requests & Incidents': 'Requisições e Incidentes',
    'Problems': 'Problemas',
    'Continuity': 'Continuidade',
    'Security Services': 'Serviços de Segurança',
    'Business Controls': 'Controles de Negócio',
    'Performance & Compliance': 'Desempenho e Conformidade',
    'Internal Control': 'Controle Interno',
    'External Compliance': 'Conformidade Externa',
    'Governance System': 'Sistema de Governança'
};

// Mappings from fix_cobit_questions.cjs (COBIT full questions)
const cobit_improvements = {
    'Sistema de governança estabelecido?': 'Um sistema de governança de TI foi formalmente estabelecido na organização?',
    'Entrega de valor otimizada?': 'A entrega de valor pela TI está sendo otimizada e monitorada?',
    'Risco otimizado?': 'Os riscos relacionados à TI estão sendo otimizados e mantidos dentro do apetite de risco?',
    'Recursos otimizados?': 'Os recursos de TI (pessoas, processos, tecnologia) estão sendo otimizados?',
    'Stakeholders engajados?': 'As partes interessadas (stakeholders) estão engajadas e suas necessidades são atendidas?',
    'Sistema de gestão de TI implementado?': 'Um sistema de gestão de TI robusto foi implementado?',
    'Estratégia alinhada?': 'A estratégia de TI está alinhada com os objetivos de negócio da organização?',
    'Arquitetura definida?': 'A arquitetura corporativa de TI foi definida e é mantida?',
    'Inovação gerenciada?': 'O processo de inovação em TI é gerenciado para gerar valor ao negócio?',
    'Portfólio otimizado?': 'O portfólio de produtos e serviços de TI está otimizado?',
    'Orçamento gerenciado?': 'O orçamento de TI e os custos são gerenciados com eficácia?',
    'RH de TI gerenciado?': 'Os recursos humanos de TI são gerenciados, capacitados e avaliados?',
    'Relacionamentos com negócio geridos?': 'Os relacionamentos entre a TI e as áreas de negócio são gerenciados ativamente?',
    'SLAs definidos?': 'Os Acordos de Nível de Serviço (SLAs) estão definidos e são monitorados?',
    'Fornecedores gerenciados?': 'Os fornecedores de TI são gerenciados e avaliados quanto ao desempenho e risco?',
    'Qualidade gerenciada?': 'A qualidade dos serviços e entregas de TI é gerenciada?',
    'Risco de TI gerenciado?': 'Os riscos específicos de TI são identificados, avaliados e tratados?',
    'Segurança gerenciada (SGSI)?': 'A segurança da informação é gerenciada (ex: através de um SGSI)?',
    'Dados gerenciados?': 'Os dados corporativos são gerenciados como ativos críticos?',
    'Programas gerenciados?': 'Os programas de projetos de TI são gerenciados para atingir os benefícios esperados?',
    'Requisitos definidos?': 'Os requisitos de soluções de TI são definidos com clareza antes do desenvolvimento?',
    'Soluções construídas?': 'A construção e aquisição de soluções de TI segue padrões de qualidade?',
    'Disponibilidade garantida?': 'A disponibilidade e capacidade dos serviços de TI são garantidas?',
    'Mudanças gerenciadas?': 'As mudanças no ambiente de TI são gerenciadas de forma controlada?',
    'Mudanças de TI aceitas?': 'A aceitação e transição de mudanças de TI são formalizadas?',
    'Transição implementada?': 'A transição de novos serviços para operação é gerenciada?',
    'Conhecimento gerenciado?': 'O conhecimento técnico e de negócio é capturado, mantido e compartilhado?',
    'Ativos gerenciados?': 'Os ativos de TI são gerenciados ao longo de seu ciclo de vida?',
    'Configuração gerenciada?': 'Os itens de configuração (CIs) e suas relações são gerenciados?',
    'Projetos gerenciados?': 'Os projetos de TI são gerenciados utilizando metodologias adequadas?',
    'Operações gerenciadas?': 'As operações diárias de TI são executadas e monitoradas de forma eficiente?',
    'Incidentes resolvidos?': 'Os incidentes de serviço e requisições são resolvidos tempestivamente?',
    'Problemas gerenciados?': 'A gestão de problemas é realizada para prevenir recorrências?',
    'Continuidade garantida?': 'A continuidade dos serviços de TI é planejada e testada?',
    'Serviços de segurança operados?': 'Os serviços de segurança são operados e monitorados continuamente?',
    'Controles de processo de negócio?': 'Os controles de processos de negócio dependentes de TI são gerenciados?',
    'Conformidade monitorada?': 'A conformidade com políticas e regulamentos é monitorada?',
    'Controles internos avaliados?': 'O sistema de controles internos de TI é avaliado periodicamente?',
    'Conformidade externa garantida?': 'A conformidade com requisitos externos (leis, normas) é assegurada?',
    'Sistema de governança avaliado?': 'O desempenho do sistema de governança é avaliado regularmente?'
};

// Also add English stub to Portuguese Full Question mapping for completeness
const cobit_stub_improvements = {
    'Governance system established?': 'Um sistema de governança de TI foi formalmente estabelecido na organização?',
    'Value delivery optimized?': 'A entrega de valor pela TI está sendo otimizada e monitorada?',
    'Risk optimized?': 'Os riscos relacionados à TI estão sendo otimizados e mantidos dentro do apetite de risco?',
    'Resources optimized?': 'Os recursos de TI (pessoas, processos, tecnologia) estão sendo otimizados?',
    'Stakeholder engagement?': 'As partes interessadas (stakeholders) estão engajadas e suas necessidades são atendidas?',
    'IT management system implemented?': 'Um sistema de gestão de TI robusto foi implementado?',
    'Strategy aligned?': 'A estratégia de TI está alinhada com os objetivos de negócio da organização?',
    'Architecture defined?': 'A arquitetura corporativa de TI foi definida e é mantida?',
    'Innovation managed?': 'O processo de inovação em TI é gerenciado para gerar valor ao negócio?',
    'Portfolio optimized?': 'O portfólio de produtos e serviços de TI está otimizado?',
    'Budget managed?': 'O orçamento de TI e os custos são gerenciados com eficácia?',
    'IT HR managed?': 'Os recursos humanos de TI são gerenciados, capacitados e avaliados?',
    'Business relationships managed?': 'Os relacionamentos entre a TI e as áreas de negócio são gerenciados ativamente?',
    'SLAs defined?': 'Os Acordos de Nível de Serviço (SLAs) estão definidos e são monitorados?',
    'Vendors managed?': 'Os fornecedores de TI são gerenciados e avaliados quanto ao desempenho e risco?',
    'Quality managed?': 'A qualidade dos serviços e entregas de TI é gerenciada?',
    'IT risk managed?': 'Os riscos específicos de TI são identificados, avaliados e tratados?',
    'Security managed (ISMS)?': 'A segurança da informação é gerenciada (ex: através de um SGSI)?',
    'Data managed?': 'Os dados corporativos são gerenciados como ativos críticos?',
    'Programs managed?': 'Os programas de projetos de TI são gerenciados para atingir os benefícios esperados?',
    'Requirements defined?': 'Os requisitos de soluções de TI são definidos com clareza antes do desenvolvimento?',
    'Solutions built?': 'A construção e aquisição de soluções de TI segue padrões de qualidade?',
    'Availability ensured?': 'A disponibilidade e capacidade dos serviços de TI são garantidas?',
    'Changes managed?': 'As mudanças no ambiente de TI são gerenciadas de forma controlada?',
    'IT changes accepted?': 'A aceitação e transição de mudanças de TI são formalizadas?',
    'Transition implemented?': 'A transição de novos serviços para operação é gerenciada?',
    'Knowledge managed?': 'O conhecimento técnico e de negócio é capturado, mantido e compartilhado?',
    'Assets managed?': 'Os ativos de TI são gerenciados ao longo de seu ciclo de vida?',
    'Configuration managed?': 'Os itens de configuração (CIs) e suas relações são gerenciados?',
    'Projects managed?': 'Os projetos de TI são gerenciados utilizando metodologias adequadas?',
    'Operations managed?': 'As operações diárias de TI são executadas e monitoradas de forma eficiente?',
    'Incidents resolved?': 'Os incidentes de serviço e requisições são resolvidos tempestivamente?',
    'Problems managed?': 'A gestão de problemas é realizada para prevenir recorrências?',
    'Continuity ensured?': 'A continuidade dos serviços de TI é planejada e testada?',
    'Security services operated?': 'Os serviços de segurança são operados e monitorados continuamente?',
    'Business process controls?': 'Os controles de processos de negócio dependentes de TI são gerenciados?',
    'Compliance monitored?': 'A conformidade com políticas e regulamentos é monitorada?',
    'Internal controls assessed?': 'O sistema de controles internos de TI é avaliado periodicamente?',
    'External compliance assured?': 'A conformidade com requisitos externos (leis, normas) é assegurada?',
    'Governance system assessed?': 'O desempenho do sistema de governança é avaliado regularmente?'
};

async function main() {
    const db = new DatabaseManager();
    await db.connect();

    console.log('--- Applying GLOBAL GDPR Translations ---');
    for (const [eng, pt] of Object.entries(gdpr_controls)) {
        await db.executeSQL(`UPDATE assessment_controls SET titulo = '${pt}' WHERE titulo = '${eng}';`);
    }
    for (const [eng, pt] of Object.entries(gdpr_questions)) {
        const safeEng = eng.replace(/'/g, "''");
        const safePt = pt.replace(/'/g, "''");
        await db.executeSQL(`UPDATE assessment_questions SET texto = '${safePt}' WHERE texto = '${safeEng}';`);
    }

    console.log('--- Applying GLOBAL NIST Translations ---');
    for (const [eng, pt] of Object.entries(nist_controls)) {
        await db.executeSQL(`UPDATE assessment_controls SET titulo = '${pt}' WHERE titulo = '${eng}';`);
    }

    console.log('--- Applying GLOBAL COBIT Translations ---');
    for (const [eng, pt] of Object.entries(cobit_controls)) {
        await db.executeSQL(`UPDATE assessment_controls SET titulo = '${pt}' WHERE titulo = '${eng}';`);
    }

    console.log('--- Applying GLOBAL COBIT Question Refinements (From Portuguese Short) ---');
    for (const [shortQ, longQ] of Object.entries(cobit_improvements)) {
        const safeShort = shortQ.replace(/'/g, "''");
        const safeLong = longQ.replace(/'/g, "''");
        await db.executeSQL(`UPDATE assessment_questions SET texto = '${safeLong}' WHERE texto = '${safeShort}';`);
    }

    console.log('--- Applying GLOBAL COBIT Question Translations (From English Stub) ---');
    for (const [engQ, longQ] of Object.entries(cobit_stub_improvements)) {
        const safeEng = engQ.replace(/'/g, "''");
        const safeLong = longQ.replace(/'/g, "''");
        // Find exact matches for English stubs, which might be in the database if it was never translated
        await db.executeSQL(`UPDATE assessment_questions SET texto = '${safeLong}' WHERE texto = '${safeEng}';`);
    }

    console.log('✅ Global Translations applied successfully!');
    await db.disconnect();
}

main().catch(console.error);
