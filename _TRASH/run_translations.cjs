const DatabaseManager = require('./database-manager.cjs');

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

async function main() {
    const db = new DatabaseManager();
    await db.connect();

    console.log('--- Applying GDPR Translations ---');
    for (const [eng, pt] of Object.entries(gdpr_controls)) {
        await db.executeSQL(`UPDATE assessment_controls SET titulo = '${pt}' WHERE titulo = '${eng}' AND framework_id = '3771789b-b8b4-411b-b8b6-c1a38f0cbe92';`);
    }
    for (const [eng, pt] of Object.entries(gdpr_questions)) {
        // Escape quotes in English text
        const safeEng = eng.replace(/'/g, "''");
        const safePt = pt.replace(/'/g, "''");
        await db.executeSQL(`UPDATE assessment_questions SET texto = '${safePt}' WHERE texto = '${safeEng}';`);
    }

    console.log('--- Applying NIST Translations ---');
    for (const [eng, pt] of Object.entries(nist_controls)) {
        await db.executeSQL(`UPDATE assessment_controls SET titulo = '${pt}' WHERE titulo = '${eng}' AND framework_id = '66b9a622-7ff1-48ea-bed4-ba50b8c1dea5';`);
    }

    console.log('--- Applying COBIT Translations ---');
    for (const [eng, pt] of Object.entries(cobit_controls)) {
        await db.executeSQL(`UPDATE assessment_controls SET titulo = '${pt}' WHERE titulo = '${eng}' AND framework_id = '65ab7d32-58a3-4fea-b168-7bd0156ad864';`);
    }

    console.log('✅ Translations applied successfully!');
    await db.disconnect();
}

main().catch(console.error);
