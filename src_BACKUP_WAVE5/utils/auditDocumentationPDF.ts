import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class AuditDocumentationPDF {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margins: { top: number; left: number; right: number; bottom: number };
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margins = { top: 15, left: 15, right: 15, bottom: 15 };
    this.currentY = this.margins.top;
    this.lineHeight = 4.5;
  }

  private addPageBreak(): void {
    this.doc.addPage();
    this.currentY = this.margins.top;
  }

  private checkPageSpace(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margins.bottom) {
      this.addPageBreak();
    }
  }

  private addHeader1(title: string): void {
    this.checkPageSpace(15);
    this.currentY += 4;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(52, 152, 219); // Azul do padrão Ética
    
    this.doc.text(title, this.margins.left, this.currentY);
    this.currentY += 4;
    
    // Linha separadora azul
    this.doc.setDrawColor(52, 152, 219);
    this.doc.setLineWidth(0.8);
    this.doc.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
    this.currentY += 5;
  }

  private addHeader2(title: string): void {
    this.checkPageSpace(12);
    this.currentY += 3;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(46, 125, 50); // Verde do padrão Ética
    
    this.doc.text(title, this.margins.left, this.currentY);
    this.currentY += 4;
  }

  private addHeader3(title: string): void {
    this.checkPageSpace(10);
    this.currentY += 2;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(156, 39, 176); // Roxo do padrão Ética
    
    this.doc.text(title, this.margins.left, this.currentY);
    this.currentY += 3.5;
  }

  private addParagraph(text: string): void {
    this.checkPageSpace(10);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 55, 55);
    
    const maxWidth = this.pageWidth - this.margins.left - this.margins.right;
    const lines = this.doc.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.checkPageSpace(5);
      this.doc.text(line, this.margins.left, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    this.currentY += 2;
  }

  private addBulletList(items: string[]): void {
    items.forEach(item => {
      this.checkPageSpace(8);
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(55, 55, 55);
      
      // Bullet azul
      this.doc.setTextColor(52, 152, 219);
      this.doc.text('•', this.margins.left + 3, this.currentY);
      
      // Texto do item
      this.doc.setTextColor(55, 55, 55);
      const maxWidth = this.pageWidth - this.margins.left - this.margins.right - 12;
      const lines = this.doc.splitTextToSize(item, maxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) this.checkPageSpace(4.5);
        this.doc.text(lines[i], this.margins.left + 12, this.currentY);
        if (i < lines.length - 1) this.currentY += this.lineHeight;
      }
      
      this.currentY += this.lineHeight + 1;
    });
    
    this.currentY += 2;
  }

  private addNumberedList(items: string[]): void {
    items.forEach((item, index) => {
      this.checkPageSpace(8);
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(55, 55, 55);
      
      // Número verde
      this.doc.setTextColor(46, 125, 50);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${index + 1}.`, this.margins.left + 3, this.currentY);
      
      // Texto do item
      this.doc.setTextColor(55, 55, 55);
      this.doc.setFont('helvetica', 'normal');
      const maxWidth = this.pageWidth - this.margins.left - this.margins.right - 15;
      const lines = this.doc.splitTextToSize(item, maxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) this.checkPageSpace(4.5);
        this.doc.text(lines[i], this.margins.left + 15, this.currentY);
        if (i < lines.length - 1) this.currentY += this.lineHeight;
      }
      
      this.currentY += this.lineHeight + 1;
    });
    
    this.currentY += 2;
  }

  private addCaseStudy(title: string, scenario: string, steps: string[]): void {
    this.addHeader3(`CASO DE USO: ${title}`);
    this.addParagraph(scenario);
    this.addParagraph('Passos para execucao:');
    this.addNumberedList(steps);
  }

  private addCoverPage(): void {
    // Título principal
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(52, 152, 219); // Azul principal
    this.doc.text('MANUAL DO USUARIO', this.pageWidth / 2, 50, { align: 'center' });
    
    this.doc.setFontSize(18);
    this.doc.setTextColor(46, 125, 50); // Verde
    this.doc.text('Modulo de Auditoria', this.pageWidth / 2, 70, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(55, 55, 55);
    this.doc.text('Sistema GRC - Auditoria Interna', this.pageWidth / 2, 85, { align: 'center' });
    
    // Box informativo com cores
    this.doc.setDrawColor(52, 152, 219);
    this.doc.setFillColor(240, 248, 255);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.margins.left, 100, this.pageWidth - this.margins.left - this.margins.right, 35, 3, 3, 'FD');
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(52, 152, 219);
    this.doc.text('VISAO GERAL', this.margins.left + 5, 110);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(55, 55, 55);
    const overview = 'Sistema corporativo completo para gestao de auditorias internas e externas, planejamento estrategico, avaliacao de riscos e acompanhamento de recomendacoes.';
    const overviewLines = this.doc.splitTextToSize(overview, this.pageWidth - this.margins.left - this.margins.right - 10);
    let overviewY = 118;
    overviewLines.forEach((line: string) => {
      this.doc.text(line, this.margins.left + 5, overviewY);
      overviewY += 4.5;
    });
    
    // Data
    this.doc.setFontSize(9);
    this.doc.setTextColor(150, 150, 150);
    const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: ptBR });
    this.doc.text(`Versao 1.0 - ${currentDate}`, this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
  }

  public generateDocumentation(): void {
    // 1. CAPA
    this.addCoverPage();
    
    // 2. VISAO GERAL
    this.addPageBreak();
    this.addHeader1('VISAO GERAL');
    
    this.addParagraph('O Modulo de Auditoria e um sistema corporativo abrangente para gestao de auditorias internas e externas, planejamento estrategico, avaliacao de riscos e acompanhamento de recomendacoes.');
    
    this.addHeader2('Principais Funcionalidades');
    const mainFeatures = [
      'Gestao Completa de Projetos de Auditoria: Planejamento, execucao e acompanhamento',
      'Matriz de Risco Configuravel: Suporte para matrizes 3x3, 4x4 ou 5x5 por tenant',
      'Planejamento Estrategico: Gestao de planos, objetivos e iniciativas estrategicas',
      'Amostragem Estatistica: Multiplos metodos (Aleatoria, Sistematica, Estratificada, MUS)',
      'Relatorios Avancados: Geracao automatica de relatorios executivos e tecnicos',
      'Dashboard Executivo: KPIs e metricas em tempo real',
      'Integracao com Universo Auditavel: Mapeamento completo de processos'
    ];
    this.addBulletList(mainFeatures);
    
    // 3. ABA DASHBOARD
    this.addHeader1('1. ABA DASHBOARD - Visao Executiva');
    
    this.addHeader2('Acesso');
    this.addBulletList([
      'Navegue para o modulo de Auditoria',
      'A aba Dashboard e a primeira a ser exibida'
    ]);
    
    this.addHeader2('KPIs Principais');
    
    this.addHeader3('Metricas de Volume:');
    const volumeMetrics = [
      'Total de Projetos: Numero total de projetos de auditoria',
      'Projetos Ativos: Auditorias em execucao',
      'Concluidos: Projetos finalizados no periodo',
      'Universo Auditavel: Total de entidades mapeadas',
      'Apontamentos Criticos: Issues de alta severidade identificados'
    ];
    this.addBulletList(volumeMetrics);
    
    this.addHeader3('Acoes Rapidas:');
    const quickActions = [
      'Botao Novo Projeto: Criacao rapida de projeto de auditoria',
      'Botao Relatorios: Acesso direto aos relatorios gerenciais',
      'Botao Matriz de Risco: Configuracao e visualizacao da matriz'
    ];
    this.addBulletList(quickActions);
    
    // CASES DE USO - DASHBOARD
    this.addCaseStudy(
      'Monitoramento Executivo Diario',
      'O Diretor de Auditoria acessa o sistema para acompanhar o status geral das auditorias.',
      [
        'Acesse o modulo Auditoria - Dashboard abre automaticamente',
        'Verifique card "Projetos Ativos" - auditorias em andamento',
        'Analise card "Alto Risco" - processos nivel >= 4 precisam atencao',
        'Monitore "Taxa de Cobertura" - meta minima 80% anual',
        'Use "Novo Projeto" se identificar lacunas de cobertura'
      ]
    );
    
    this.addCaseStudy(
      'Configuracao de KPIs para Comite',
      'Preparacao de dados para reuniao mensal do Comite de Auditoria.',
      [
        'Acesse Dashboard e anote metricas atuais',
        'Total de Projetos: registre numero para comparativo',
        'Apontamentos Criticos: identifique trends negativas',
        'Percentual de Conclusao: calcule media mensal',
        'Use botao "Relatorios" para gerar sumario executivo',
        'Exporte graficos para apresentacao'
      ]
    );

    this.addCaseStudy(
      'Criacao Rapida de Projeto de Emergencia',
      'Situacao de fraude descoberta - necessario criar auditoria imediata.',
      [
        'No Dashboard, clique "Novo Projeto"',
        'Tipo: "Especial - Investigativa"',
        'Prioridade: "Critica"',
        'Prazo: Defina 15 dias uteis',
        'Equipe: Selecione auditores senior disponiveis',
        'Status: "Em Execucao" (pulando planejamento)'
      ]
    );
    
    // 4. ABA UNIVERSO AUDITAVEL
    this.addHeader1('2. ABA UNIVERSO AUDITAVEL');
    
    this.addParagraph('Mapeia todos os processos da organizacao que podem ser auditados, definindo criticidade, frequencia e responsaveis.');
    
    this.addHeader2('Campos Principais');
    const universeFields = [
      'CODIGO: Identificador unico (ex: PROC-001)',
      'NOME: Titulo do processo auditavel',
      'TIPO: Categoria do processo (financeiro, operacional, TI)',
      'CRITICIDADE: baixa, media, alta, critica',
      'FREQUENCIA_AUDITORIA: Intervalos em meses (12, 24, 36)',
      'RESPONSAVEL: Usuario responsavel pelo processo'
    ];
    this.addBulletList(universeFields);
    
    // CASES DE USO - UNIVERSO AUDITAVEL
    this.addCaseStudy(
      'Mapeamento de Novo Processo Critico',
      'A empresa implementou um novo sistema ERP financeiro que precisa ser incluido no universo auditavel.',
      [
        'Acesse aba "Universo Auditavel"',
        'Clique "Adicionar Item"',
        'Codigo: "SYS-ERP-001"',
        'Nome: "Sistema ERP Financeiro - Modulo Contas a Pagar"',
        'Tipo: "Sistema de TI"',
        'Criticidade: "critica" (impacto alto em demonstracoes)',
        'Frequencia: 12 meses (sistema critico)',
        'Responsavel: Gerente de TI'
      ]
    );
    
    this.addCaseStudy(
      'Reavaliacao de Criticidade pos-Pandemia',
      'Processo de Work From Home mudou perfil de risco - necessaria reavaliacao.',
      [
        'Filtre por "Tipo: Operacional"',
        'Localize "Processo de Gestao de Pessoas"',
        'Clique no icone de edicao',
        'Criticidade: Altere de "media" para "alta"',
        'Justificativa: "Controles presenciais comprometidos"',
        'Frequencia: Reduza de 36 para 24 meses',
        'Salve as alteracoes'
      ]
    );

    this.addCaseStudy(
      'Filtros Avancados para Planejamento Anual',
      'Identificar todos os processos criticos que devem ser auditados no proximo ano.',
      [
        'Use filtro "Criticidade: critica"',
        'Adicione filtro "Ultima Auditoria: > 12 meses"',
        'Ordene por "Data Ultima Auditoria"',
        'Exporte lista para Excel',
        'Use dados para montar cronograma anual',
        'Estime horas totais necessarias'
      ]
    );
    
    // 5. ABA PROJETOS
    this.addPageBreak();
    this.addHeader1('3. ABA PROJETOS - Gestao de Auditorias');
    
    this.addHeader2('Sistema de Filtros');
    const filters = [
      'Status: Planejamento, Em Execucao, Em Revisao, Concluido, Suspenso',
      'Tipo: Interna, Externa, Regulatoria, Especial',
      'Periodo: Data de inicio e fim planejados',
      'Chefe de Auditoria: Filtro por responsavel'
    ];
    this.addBulletList(filters);
    
    this.addHeader2('Cards Expansiveis');
    const cardFeatures = [
      'Codigo: Identificador unico (ex: PROJ-AUD-2025-001)',
      'Titulo: Nome descritivo do projeto',
      'Status: Badge colorido com estado atual',
      'Chefe: Responsavel pela auditoria',
      'Progresso: Percentual de conclusao visual'
    ];
    this.addBulletList(cardFeatures);
    
    // CASES DE USO - PROJETOS
    this.addCaseStudy(
      'Criacao de Auditoria SOX Anual',
      'Inicio do ano fiscal - criar projeto de auditoria Sarbanes-Oxley para compliance.',
      [
        'Acesse aba "Projetos"',
        'Clique "Novo Projeto"',
        'Codigo: "AUD-SOX-2025-001"',
        'Titulo: "Auditoria SOX - Controles Internos 2025"',
        'Tipo: "Regulatoria"',
        'Chefe: Auditor Senior certificado',
        'Datas: 01/02/2025 a 30/04/2025',
        'Horas: 480 horas',
        'Status: "Planejamento"'
      ]
    );
    
    this.addCaseStudy(
      'Gestao de Equipe em Projeto Complexo',
      'Auditoria de multiplas filiais requer coordenacao de equipe distribuida.',
      [
        'Abra projeto "Auditoria Filiais Nordeste"',
        'Aba "Equipe": Adicione 3 auditores junior',
        'Defina supervisor para cada estado',
        'Configure notificacoes automaticas',
        'Estabeleca reunioes semanais de status',
        'Use chat interno para comunicacao'
      ]
    );

    this.addCaseStudy(
      'Reprogramacao de Projeto por Prioridade',
      'Auditoria regular deve ser postergada devido a investigacao urgente.',
      [
        'Localize projeto "Auditoria Estoques Q4"',
        'Altere status para "Suspenso"',
        'Justificativa: "Prioridade dada a investigacao fraude"',
        'Reagende datas: +60 dias',
        'Notifique automaticamente a equipe',
        'Atualize cronograma anual'
      ]
    );

    this.addCaseStudy(
      'Filtros para Auditoria de Performance',
      'Diretor quer visao consolidada de performance da area.',
      [
        'Filtro Status: "Concluido"',
        'Filtro Periodo: "Ultimos 12 meses"',
        'Filtro Chefe: "Maria Silva" (sua equipe)',
        'Ordene por "Data Conclusao"',
        'Analise tempo medio de execucao',
        'Compare horas orcadas vs realizadas'
      ]
    );
    
    // 6. ABA PAPEIS DE TRABALHO
    this.addHeader1('4. ABA PAPEIS DE TRABALHO');
    
    this.addParagraph('Documenta procedimentos de auditoria com evidencias e resultados.');
    
    this.addHeader2('Tipos de Procedimentos');
    const procedureTypes = [
      'ANALYTICAL: Procedimentos analiticos (comparacoes, tendencias)',
      'SUBSTANTIVE: Testes substantivos (confirmacoes, vouching)',
      'COMPLIANCE: Testes de conformidade (controles internos)',
      'WALKTHROUGH: Testes de percurso (mapeamento de processos)',
      'INQUIRY: Investigacao (entrevistas, questionarios)',
      'OBSERVATION: Observacao direta (visitas, inspecoes)'
    ];
    this.addBulletList(procedureTypes);
    
    // CASES DE USO - PAPEIS DE TRABALHO
    this.addCaseStudy(
      'Teste de Controle de Aprovacao de Pagamentos',
      'Documentar teste de efetividade do controle de dupla aprovacao para pagamentos > R$ 10.000.',
      [
        'Acesse aba "Papeis de Trabalho"',
        'Clique "Novo Procedimento"',
        'Codigo: "PT-001-APROV-PAG"',
        'Tipo: "COMPLIANCE"',
        'Controle: "Aprovacao dupla pagamentos > R$ 10.000"',
        'Amostra: 25 pagamentos',
        'Criterio: "100% devem ter 2 aprovacoes"',
        'Anexar prints das aprovacoes',
        'Resultado: "2 excecoes - sem segunda aprovacao"'
      ]
    );
    
    this.addCaseStudy(
      'Procedimento Analitico de Vendas',
      'Identificar flutuacoes anormais nas receitas trimestrais usando analise horizontal.',
      [
        'Tipo: "ANALYTICAL"',
        'Codigo: "PT-002-ANAL-VENDAS"',
        'Periodo: "Q1 2024 vs Q1 2023"',
        'Metodo: "Analise horizontal de receitas"',
        'Expectativa: "Crescimento 15% baseado em mercado"',
        'Realizado: "Crescimento 45% - investigate"',
        'Conclusao: "Nova linha de produtos lancada"'
      ]
    );

    this.addCaseStudy(
      'Walkthrough do Processo de Compras',
      'Mapear fluxo completo desde requisicao ate pagamento para identificar controles.',
      [
        'Tipo: "WALKTHROUGH"',
        'Selecione amostra: "Compra de equipamentos TI"',
        'Etapa 1: Requisicao - verificar aprovacao gerencial',
        'Etapa 2: Cotacao - minimo 3 fornecedores',
        'Etapa 3: Aprovacao - conforme alcada',
        'Etapa 4: Recebimento - conferencia fisica',
        'Documente gaps de controle identificados'
      ]
    );

    this.addCaseStudy(
      'Teste Substantivo de Provisoes',
      'Validar adequacao de provisoes trabalhistas usando confirmacao com advogados.',
      [
        'Tipo: "SUBSTANTIVE"',
        'Populacao: "Todas as provisoes trabalhistas"',
        'Amostra: "Processos > R$ 50.000"',
        'Procedimento: "Confirmacao com escritorios"',
        'Criterio: "Diferenca < 5% considerada imaterial"',
        'Anexar respostas dos advogados',
        'Concluir sobre adequacao das provisoes'
      ]
    );
    
    // 7. ABA MATRIZ DE RISCO
    this.addPageBreak();
    this.addHeader1('5. ABA MATRIZ DE RISCO');
    
    this.addParagraph('Avalia riscos usando matriz configuravel por tenant (3x3, 4x4 ou 5x5).');
    
    this.addHeader2('Configuracoes de Matriz');
    const matrixTypes = [
      'MATRIZ 3x3: Baixo (1), Medio (2), Alto (3)',
      'MATRIZ 4x4: Muito Baixo (1), Baixo (2), Medio (3), Alto (4)',
      'MATRIZ 5x5: Muito Baixo (1), Baixo (2), Medio (3), Alto (4), Muito Alto (5)'
    ];
    this.addBulletList(matrixTypes);
    
    // CASES DE USO - MATRIZ DE RISCO
    this.addCaseStudy(
      'Avaliacao de Risco de Fraude em Compras',
      'Avaliar risco de fraude no processo de compras usando matriz 5x5.',
      [
        'Acesse aba "Matriz de Risco"',
        'Selecione "Compras e Suprimentos"',
        'Risco: "Fraude em processo de compras"',
        'Probabilidade: 3 (Media - controles existem mas ha gaps)',
        'Impacto: 4 (Alto - perdas financeiras)',
        'Sistema calcula: 3 x 4 = 12 (Risco Alto)',
        'Acao: Incluir no plano proximo trimestre'
      ]
    );
    
    this.addCaseStudy(
      'Configuracao de Matriz Customizada por Tenant',
      'Empresa de pequeno porte prefere matriz 3x3 mais simples.',
      [
        'Acesse "Configuracoes da Matriz"',
        'Selecione "Matriz 3x3"',
        'Defina niveis: Baixo (1-3), Medio (4-6), Alto (7-9)',
        'Configure cores: Verde, Amarelo, Vermelho',
        'Salve configuracao para todo o tenant',
        'Teste com risco piloto para validar'
      ]
    );

    this.addCaseStudy(
      'Mapa de Calor Executivo',
      'Preparar visualizacao consolidada para apresentacao ao board.',
      [
        'Filtre por "Criticidade: Alta"',
        'Agrupe por "Area de Negocio"',
        'Gere mapa de calor visual',
        'Identifique concentracoes de risco',
        'Anote top 3 riscos por area',
        'Exporte grafico para slides'
      ]
    );

    this.addCaseStudy(
      'Reavaliacao Trimestral de Riscos',
      'Processo regular de atualizacao da matriz baseado em novos eventos.',
      [
        'Filtre riscos "Vencidos para reavaliacao"',
        'Para cada risco, revisar:',
        '- Mudancas no ambiente de controle',
        '- Novos fatores externos (economia, regulacao)',
        '- Efetividade de mitigacoes implementadas',
        'Atualize scores conforme necessario',
        'Documente justificativas das mudancas'
      ]
    );
    
    // 8. ABA AMOSTRAGEM
    this.addHeader1('6. ABA AMOSTRAGEM - Metodos Estatisticos');
    
    this.addParagraph('Calcula amostras usando metodologias reconhecidas internacionalmente.');
    
    this.addHeader2('Metodos Disponiveis');
    const samplingMethods = [
      'RANDOM: Cada item tem igual probabilidade',
      'SYSTEMATIC: Selecao a intervalos regulares K=N/n',
      'STRATIFIED: Populacao dividida em grupos homogeneos',
      'MUS: Baseada em valores monetarios - foca maiores valores',
      'CLUSTER: Amostragem por grupos geograficos'
    ];
    this.addBulletList(samplingMethods);
    
    // CASES DE USO - AMOSTRAGEM
    this.addCaseStudy(
      'Amostragem MUS para Teste de Faturas',
      'Testar faturas usando Monetary Unit Sampling para focar nos valores maiores.',
      [
        'Acesse aba "Amostragem"',
        'Metodo: "MUS (Monetary Unit)"',
        'Populacao: 15.000 faturas',
        'Valor: R$ 25.000.000',
        'Confianca: 95%',
        'Erro toleravel: 3%',
        'Sistema calcula: 89 faturas para teste',
        'Exportar lista para equipe de campo'
      ]
    );
    
    this.addCaseStudy(
      'Amostragem Estratificada por Regiao',
      'Testar controles de vendas considerando diferencas regionais.',
      [
        'Metodo: "STRATIFIED"',
        'Estratos: "Norte, Nordeste, Sul, Sudeste"',
        'Populacao total: 50.000 vendas',
        'Distribua proporcionalmente por regiao',
        'Norte: 15% da populacao = 18 amostras',
        'Configure diferentes criterios por estrato',
        'Sistema gera amostra balanceada'
      ]
    );

    this.addCaseStudy(
      'Amostragem Sistematica para Folha de Pagamento',
      'Testar calculos de folha usando intervalos regulares.',
      [
        'Metodo: "SYSTEMATIC"',
        'Populacao: 5.000 funcionarios',
        'Amostra desejada: 100 funcionarios',
        'Intervalo K = 5000/100 = 50',
        'Inicio aleatorio: funcionario #23',
        'Selecao: 23, 73, 123, 173... ate 100 itens',
        'Exportar para planilha de teste'
      ]
    );

    this.addCaseStudy(
      'Comparativo de Metodos para Auditoria de Estoques',
      'Escolher melhor metodo considerando natureza heterogenea dos produtos.',
      [
        'Analise opcoes:',
        '- RANDOM: Para produtos homogeneos',
        '- MUS: Para focar em itens de alto valor',
        '- STRATIFIED: Para categorias diferentes',
        'Decisao: STRATIFIED por categoria',
        'Estratos: A (alto giro), B (medio), C (baixo)',
        'Configure amostras proporcionais'
      ]
    );
    
    // 9. ABA PLANEJAMENTO
    this.addPageBreak();
    this.addHeader1('7. ABA PLANEJAMENTO - Estrategico');
    
    this.addParagraph('Gestao hierarquica: Planos → Objetivos → Iniciativas.');
    
    this.addHeader2('Estrutura de 3 Niveis');
    const planningLevels = [
      'Planos Estrategicos: Visao macro 3-5 anos com orcamento total',
      'Objetivos Estrategicos: Metas especificas SMART mensuravelmente',
      'Iniciativas Estrategicas: Projetos concretos com cronograma'
    ];
    this.addBulletList(planningLevels);
    
    // CASES DE USO - PLANEJAMENTO
    this.addCaseStudy(
      'Criacao de Plano Estrategico Trienal',
      'Criar plano estrategico 2025-2027 com foco em transformacao digital.',
      [
        'Acesse aba "Planejamento"',
        'Clique "Novo Plano Estrategico"',
        'Titulo: "Transformacao Digital Auditoria"',
        'Periodo: 2025-2027',
        'Orcamento: R$ 2.500.000',
        'Objetivo: "Automatizar 80% dos testes"',
        'Iniciativa: "Implementacao RPA"',
        'Monitorar pelos cards expansiveis'
      ]
    );
    
    this.addCaseStudy(
      'Gestao de Objetivos com KPIs SMART',
      'Definir objetivos mensuravelmente para aumento de cobertura de auditoria.',
      [
        'Clique "Novo Objetivo Estrategico"',
        'Titulo: "Aumentar Cobertura Auditoria"',
        'Meta SMART: "Auditar 85% do universo critico ate dez/2025"',
        'Indicador: "% Processos criticos auditados"',
        'Baseline: 65% (atual)',
        'Meta: 85%',
        'Configure alertas de acompanhamento mensal'
      ]
    );

    this.addCaseStudy(
      'Iniciativa de Capacitacao da Equipe',
      'Projeto especifico para desenvolvimento de competencias em auditoria digital.',
      [
        'Vinculado ao objetivo "Transformacao Digital"',
        'Titulo: "Capacitacao Ferramentas Digitais"',
        'Duracao: 6 meses',
        'Budget: R$ 150.000',
        'Entregas: Certificacao de 15 auditores',
        'Status: Acompanhe por semaforo (Verde/Amarelo/Vermelho)',
        'Milestone: Reviews mensais obrigatórios'
      ]
    );

    this.addCaseStudy(
      'Dashboard de Performance Estrategica',
      'Preparar visao consolidada do progresso estrategico para board.',
      [
        'Use cards expansiveis para visao rapida',
        'Filtre por "Status: Em Andamento"',
        'Ordene por "% Conclusao" (menor primeiro)',
        'Identifique iniciativas em risco (vermelho)',
        'Prepare plano de acao para iniciativas amarelas',
        'Export summary para apresentacao'
      ]
    );
    
    // 10. ABA RELATORIOS
    this.addHeader1('8. ABA RELATORIOS - Geracao Automatica');
    
    this.addParagraph('Gera relatorios profissionais em multiplos formatos.');
    
    this.addHeader2('Tipos de Relatorio');
    const reportTypes = [
      'PRELIMINAR: Relatorio inicial com achados parciais',
      'FINAL: Relatorio completo com conclusoes',
      'EXECUTIVO: Resumo para alta direcao com KPIs',
      'SEGUIMENTO: Acompanhamento de recomendacoes'
    ];
    this.addBulletList(reportTypes);
    
    // CASES DE USO - RELATORIOS
    this.addCaseStudy(
      'Geracao de Relatorio Final de Auditoria',
      'Finalizar auditoria de TI e gerar relatorio final profissional.',
      [
        'Acesse aba "Relatorios"',
        'Tipo: "Final"',
        'Projeto: "Auditoria Seguranca TI 2025"',
        'Preencher "Resumo Executivo"',
        'Detalhar "Metodologia e Testes"',
        'Listar "Recomendacoes" por prioridade',
        'Status: Rascunho → Revisao → Aprovado',
        'Gerar PDF e distribuir'
      ]
    );
    
    this.addCaseStudy(
      'Relatorio Preliminar para Gestao',
      'Comunicacao rapida de achados criticos antes da finalizacao.',
      [
        'Tipo: "Preliminar"',
        'Foco: Apenas achados criticos e altos',
        'Template simplificado - 3 paginas max',
        'Seções: Contexto, Achados, Next Steps',
        'Prazo: 24h para revisao da gestao',
        'Automaticamente notifica gestores',
        'Agendar reuniao de alinhamento'
      ]
    );

    this.addCaseStudy(
      'Dashboard Executivo Mensal',
      'Relatorio automatico com KPIs para diretoria.',
      [
        'Tipo: "Executivo"',
        'Periodicidade: Mensal automatica',
        'Metricas: Projetos concluidos, riscos, cobertura',
        'Graficos: Tendencias ultimos 12 meses',
        'Benchmark: Comparacao com metas anuais',
        'Distribuicao automatica via email',
        'Agendar apresentacao mensal'
      ]
    );

    this.addCaseStudy(
      'Relatorio de Follow-up de Recomendacoes',
      'Acompanhar implementacao de recomendacoes de auditorias anteriores.',
      [
        'Tipo: "Seguimento"',
        'Filtrar: Recomendacoes em aberto',
        'Status: Implementado, Em Andamento, Pendente',
        'Prazo: Destacar overdue em vermelho',
        'Evidencias: Solicitar comprovacao de implementacao',
        'Escalonamento: Identificar nao-conformidades',
        'Proximos passos para cada recomendacao'
      ]
    );

    this.addCaseStudy(
      'Customizacao de Template por Area',
      'Adaptar formato de relatorio conforme necessidade da area auditada.',
      [
        'Area TI: Foco em controles automatizados',
        'Area Financeira: Enfase em compliance contábil',
        'Area Operacional: Destaque para eficiencia',
        'Salvar template personalizado',
        'Configurar campos obrigatorios por area',
        'Auto-aplicar template baseado no universo auditavel'
      ]
    );
    
    // 11. CONFIGURACAO INICIAL
    this.addPageBreak();
    this.addHeader1('CONFIGURACAO INICIAL');
    
    this.addHeader2('Primeiro Acesso');
    const initialSetup = [
      'Configure Matriz de Risco (3x3, 4x4 ou 5x5)',
      'Mapeie processos criticos no Universo Auditavel',
      'Cadastre equipe com permissoes adequadas',
      'Crie plano anual baseado em riscos',
      'Execute projeto piloto para validar'
    ];
    this.addNumberedList(initialSetup);
    
    // 12. SOLUCAO DE PROBLEMAS
    this.addHeader1('SOLUCAO DE PROBLEMAS');
    
    this.addHeader2('Problemas Comuns');
    
    this.addHeader3('Dashboard Nao Carrega:');
    const dashboardIssues = [
      'Verifique permissoes do usuario',
      'Confirme tenant ID correto',
      'Valide conexao com banco de dados'
    ];
    this.addNumberedList(dashboardIssues);
    
    this.addHeader3('PDF Nao Gera:');
    const pdfIssues = [
      'Desabilite bloqueador de pop-up',
      'Teste em navegador diferente',
      'Verifique dados para geracao'
    ];
    this.addNumberedList(pdfIssues);
    
    // 13. GLOSSARIO
    this.addHeader1('GLOSSARIO');
    
    const glossaryTerms = [
      'Universo Auditavel: Processos passiveis de auditoria',
      'Matriz de Risco: Ferramenta visual probabilidade vs impacto',
      'MUS: Monetary Unit Sampling - amostragem monetaria',
      'Apontamento: Deficiencia identificada na auditoria',
      'Follow-up: Acompanhamento de recomendacoes'
    ];
    this.addBulletList(glossaryTerms);
    
    // Numeracao de paginas
    const totalPages = this.doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      if (i > 1) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text(`Pagina ${i - 1} de ${totalPages - 1}`, this.pageWidth / 2, this.pageHeight - 8, { align: 'center' });
      }
    }
  }

  public save(): void {
    this.generateDocumentation();
    const fileName = `Manual_Auditoria_${format(new Date(), 'dd-MM-yyyy_HHmm', { locale: ptBR })}.pdf`;
    this.doc.save(fileName);
  }
}