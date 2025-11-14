// VERSÃO CORRIGIDA - DIFERENCIAÇÃO REAL DE CONTEÚDO

// Substituir a função generateReportHTML por esta versão:

const generateReportHTML = (projeto: any, projetoDetalhado: any, tipo: string) => {
  // DIFERENCIAÇÃO REAL: Gerar HTML completamente diferente por tipo
  if (tipo === 'tecnico') {
    return generateTechnicalReportHTML(projeto, projetoDetalhado);
  }
  return generateExecutiveReportHTML(projeto, projetoDetalhado, tipo);
};

const generateTechnicalReportHTML = (projeto: any, projetoDetalhado: any) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const totalApontamentos = projetoDetalhado?.apontamentos_auditoria?.length || 0;
  const apontamentosCriticos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'critica').length || 0;
  const totalTrabalhos = projetoDetalhado?.trabalhos_auditoria?.length || 0;
  const trabalhosConcluidos = projetoDetalhado?.trabalhos_auditoria?.filter(t => t.status === 'concluido').length || 0;
  const totalHorasAuditoria = projetoDetalhado?.trabalhos_auditoria?.reduce((sum, t) => sum + (t.horas_trabalhadas || 0), 0) || 0;
  const complianceScore = totalApontamentos > 0 ? Math.max(0, 100 - (apontamentosCriticos * 25)) : 95;
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <title>RELATÓRIO TÉCNICO DE AUDITORIA - ${projeto.titulo}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', sans-serif; color: #1a1a1a; font-size: 13px; margin: 0; }
        .page { max-width: 210mm; margin: 0 auto; background: white; min-height: 297mm; }
        .header-page { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 45px 35px; text-align: center; }
        .main-title { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
        .project-title { font-size: 20px; font-weight: 500; margin-bottom: 25px; }
        .content { padding: 35px 30px; }
        .section { margin-bottom: 35px; }
        .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .technical-summary { background: #f1f5f9; border-left: 4px solid #0f172a; padding: 25px; border-radius: 8px; margin: 20px 0; }
        .procedure-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin: 15px 0; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .procedure-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .status-badge { padding: 4px 12px; border-radius: 16px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .status-concluido { background: #dcfce7; color: #166534; }
        .status-pendente { background: #fef3c7; color: #92400e; }
        .finding-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; padding: 20px; }
        .finding-section { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #64748b; }
        .finding-section h5 { color: #0f172a; font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; }
        .footer { background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 25px; text-align: center; color: #6b7280; font-size: 10px; }
        @media print { .page { box-shadow: none; margin: 0; } @page { margin: 0.75in 0.5in; size: A4; } }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- CABEÇALHO TÉCNICO -->
        <div class="header-page">
          <h1 class="main-title">RELATÓRIO TÉCNICO DE AUDITORIA</h1>
          <h2 class="project-title">${projeto.titulo}</h2>
          <p>Código: ${projeto.codigo} | Horas: ${totalHorasAuditoria}h | Compliance: ${complianceScore}%</p>
        </div>
        
        <!-- CONTEÚDO TÉCNICO -->
        <div class="content">
          <!-- SUMÁRIO TÉCNICO -->
          <div class="section">
            <h2 class="section-title">SUMÁRIO EXECUTIVO TÉCNICO</h2>
            <div class="technical-summary">
              <p><strong>Escopo:</strong> ${projeto.escopo || 'Avaliação técnica abrangente dos controles internos e processos operacionais.'}</p>
              <p><strong>Metodologia:</strong> ${projeto.metodologia || 'Técnicas de auditoria baseadas em riscos, testes substantivos e análise documental.'}</p>
              <p><strong>Período:</strong> ${new Date(projeto.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}</p>
              <p><strong>Equipe:</strong> ${projeto.auditor_lider || projeto.chefe_auditoria} (Auditor Líder)</p>
            </div>
          </div>
          
          <!-- PROCEDIMENTOS EXECUTADOS -->
          <div class="section">
            <h2 class="section-title">PROCEDIMENTOS DE AUDITORIA EXECUTADOS</h2>
            ${projetoDetalhado?.trabalhos_auditoria?.map((trabalho, index) => `
              <div class="procedure-item">
                <div class="procedure-header">
                  <h4>${trabalho.titulo || 'Procedimento ' + (index + 1)}</h4>
                  <span class="status-badge status-${trabalho.status || 'pendente'}">
                    ${trabalho.status === 'concluido' ? 'CONCLUÍDO' : 'EM ANDAMENTO'}
                  </span>
                </div>
                <p><strong>Descrição:</strong> ${trabalho.descricao || 'Procedimento de auditoria para avaliação de controles internos.'}</p>
                <p><strong>Horas:</strong> ${trabalho.horas_trabalhadas || 0}h | <strong>Responsável:</strong> ${trabalho.responsavel || projeto.auditor_lider}</p>
                <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #3b82f6; margin-top: 12px;">
                  <p style="margin: 0; font-size: 11px;"><strong>Resultados:</strong> ${trabalho.resultados || 'Procedimento executado conforme planejado.'}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- ACHADOS DETALHADOS (CCCE) -->
          <div class="section">
            <h2 class="section-title">ACHADOS DETALHADOS (CCCE)</h2>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 20px;">Estrutura CCCE: Condição, Critério, Causa, Efeito</p>
            
            ${projetoDetalhado?.apontamentos_auditoria?.map((apontamento, index) => `
              <div class="finding-item">
                <div class="procedure-header">
                  <h4>${apontamento.titulo || 'Achado ' + (index + 1)}</h4>
                  <span style="padding: 4px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; text-transform: uppercase; background: #fef2f2; color: #dc2626;">
                    ${(apontamento.criticidade || 'baixa').toUpperCase()}
                  </span>
                </div>
                
                <div class="finding-section">
                  <h5>CONDIÇÃO IDENTIFICADA</h5>
                  <p style="font-size: 11px;">${apontamento.descricao || 'Deficiência identificada nos controles internos.'}</p>
                </div>
                
                <div class="finding-section">
                  <h5>CRITÉRIO DE AVALIAÇÃO</h5>
                  <p style="font-size: 11px;">Políticas internas, melhores práticas de mercado e requisitos regulatórios (SOX, COSO, ISO 27001).</p>
                </div>
                
                <div class="finding-section">
                  <h5>CAUSA RAIZ</h5>
                  <p style="font-size: 11px;">${apontamento.causa_raiz || 'Ausência de controles adequados ou falhas na execução de procedimentos.'}</p>
                </div>
                
                <div class="finding-section">
                  <h5>EFEITO/IMPACTO</h5>
                  <p style="font-size: 11px;">${apontamento.impacto || 'Risco de falhas operacionais e exposição a perdas financeiras.'}</p>
                </div>
                
                <div class="finding-section">
                  <h5>RECOMENDAÇÃO TÉCNICA</h5>
                  <p style="font-size: 11px;">${apontamento.recomendacao || 'Implementar controles compensatórios e revisar procedimentos operacionais.'}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- CONCLUSÕES TÉCNICAS -->
          <div class="section">
            <h2 class="section-title">CONCLUSÕES TÉCNICAS</h2>
            <div class="technical-summary">
              <h3>Avaliação Geral do Ambiente de Controles</h3>
              <p><strong>Ambiente de Controle:</strong> ${complianceScore >= 80 ? 'Adequadamente estruturado' : 'Necessita melhorias'}</p>
              <p><strong>Gestão de Riscos:</strong> ${apontamentosCriticos === 0 ? 'Adequada' : 'Requer atenção'}</p>
              <p><strong>Execução de Controles:</strong> ${trabalhosConcluidos === totalTrabalhos ? 'Efetiva' : 'Parcialmente efetiva'}</p>
              
              <h3 style="margin-top: 20px;">Opinião Técnica</h3>
              <div style="padding: 15px; border-left: 4px solid ${complianceScore >= 80 ? '#059669' : '#d97706'}; background: ${complianceScore >= 80 ? '#f0fdf4' : '#fffbeb'}; margin-top: 10px;">
                <p><strong>${complianceScore >= 80 ? 'OPINIÃO POSITIVA' : 'OPINIÃO COM RESSALVAS'}:</strong></p>
                <p style="font-size: 12px;">${complianceScore >= 80 ? 
                  'Os controles internos são adequados e efetivos para mitigar os riscos identificados.' :
                  'Os controles apresentam adequação parcial, necessitando melhorias para fortalecer o ambiente de controle.'
                }</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- RODAPÉ TÉCNICO -->
        <div class="footer">
          <p><strong>Sistema GRC - Relatório Técnico</strong></p>
          <p>Gerado em ${timestamp} | Auditor: ${projeto.auditor_lider || projeto.chefe_auditoria}</p>
          <p>Este documento contém análises técnicas detalhadas para gestores operacionais.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateExecutiveReportHTML = (projeto: any, projetoDetalhado: any, tipo: string) => {
  // MANTER TODO O CÓDIGO HTML ORIGINAL DO RELATÓRIO EXECUTIVO AQUI
  // (o código atual que já funciona para o executivo)
  
  const timestamp = new Date().toLocaleString('pt-BR');
  // ... resto do código original
  
  return `<!-- HTML do relatório executivo original -->`;
};