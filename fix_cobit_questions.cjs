const DatabaseManager = require('./database-manager.cjs');

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

async function main() {
    const db = new DatabaseManager();
    await db.connect();

    console.log('--- Refining COBIT Questions ---');
    for (const [shortQ, longQ] of Object.entries(cobit_improvements)) {
        // Escape quotes
        const safeShort = shortQ.replace(/'/g, "''");
        const safeLong = longQ.replace(/'/g, "''");

        const result = await db.executeSQL(
            `UPDATE assessment_questions SET texto = '${safeLong}' WHERE texto = '${safeShort}';`
        );
        if (result.rowCount === 0) {
            console.warn(`Warning: Could not find question "${shortQ}" to update.`);
        } else {
            console.log(`Updated: "${shortQ}" -> "${longQ}"`);
        }
    }

    console.log('✅ Questions refined successfully!');
    await db.disconnect();
}

main().catch(console.error);
