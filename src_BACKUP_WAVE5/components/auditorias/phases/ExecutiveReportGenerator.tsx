import React from 'react';

// Gerador específico para Relatório Executivo de Auditoria - Estilo Profissional
export const generateExecutiveReportHTML = (projeto: any, projetoDetalhado: any) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Análise dos dados específicos para relatório executivo
  const totalApontamentos = projetoDetalhado?.apontamentos_auditoria?.length || 0;
  const apontamentosCriticos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'critica').length || 0;
  const apontamentosAltos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'alta').length || 0;
  const apontamentosMedios = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'media').length || 0;
  const apontamentosBaixos = projetoDetalhado?.apontamentos_auditoria?.filter(a => a.criticidade === 'baixa').length || 0;
  const totalTrabalhos = projetoDetalhado?.trabalhos_auditoria?.length || 0;
  const trabalhosConcluidos = projetoDetalhado?.trabalhos_auditoria?.filter(t => t.status === 'concluido').length || 0;
  const totalHorasAuditoria = projetoDetalhado?.trabalhos_auditoria?.reduce((sum, t) => sum + (t.horas_trabalhadas || 0), 0) || 0;
  const planosAcao = projetoDetalhado?.planos_acao?.length || 0;
  const planosConcluidos = projetoDetalhado?.planos_acao?.filter(p => p.status === 'concluido').length || 0;
  
  // Cálculo do score de compliance executivo
  const complianceScore = totalApontamentos > 0 ? 
    Math.max(0, 100 - (apontamentosCriticos * 25 + apontamentosAltos * 15 + apontamentosMedios * 8 + apontamentosBaixos * 3)) : 95;
  
  // Análise de risco executivo
  const nivelRisco = apontamentosCriticos > 0 ? 'ALTO' : 
                    apontamentosAltos > 2 ? 'MÉDIO-ALTO' : 
                    apontamentosAltos > 0 ? 'MÉDIO' : 'BAIXO';
  
  const corRisco = nivelRisco === 'ALTO' ? '#dc2626' : 
                   nivelRisco === 'MÉDIO-ALTO' ? '#ea580c' : 
                   nivelRisco === 'MÉDIO' ? '#d97706' : '#059669';
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <title>RELATÓRIO EXECUTIVO DE AUDITORIA INTERNA - ${projeto.titulo}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          line-height: 1.4; 
          color: #1a1a1a; 
          background: #ffffff;
          font-size: 12px;
        }
        
        .page { 
          max-width: 210mm; 
          margin: 0 auto; 
          background: white; 
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          min-height: 297mm;
        }
        
        .header-page {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        
        .main-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .project-title {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 20px;
          opacity: 0.95;
        }
        
        .executive-badge {
          background: rgba(255,255,255,0.2);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 10px;
          display: inline-block;
        }
        
        .header-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }
        
        .info-item {
          background: rgba(255,255,255,0.15);
          padding: 10px;
          border-radius: 6px;
          backdrop-filter: blur(10px);
        }
        
        .info-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.8;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 12px;
          font-weight: 600;
        }
        
        .content {
          padding: 30px 25px;
        }
        
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 15px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .section-number {
          background: #1e3a8a;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }
        
        .executive-summary {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e1;
          border-left: 4px solid #1e3a8a;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .summary-highlight {
          background: #1e3a8a;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
        }
        
        .risk-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 16px;
          font-weight: 600;
          font-size: 11px;
          background: ${corRisco};
          color: white;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }
        
        .metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px 15px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: transform 0.2s;
          position: relative;
        }
        
        .metric-card:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .metric-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1;
        }
        
        .metric-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        
        .metric-description {
          font-size: 10px;
          color: #9ca3af;
          line-height: 1.3;
        }
        

        
        .findings-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .findings-table th {
          background: #f8fafc;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .findings-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
          font-size: 11px;
        }
        
        .findings-table tr:hover {
          background: #f9fafb;
        }
        
        .severity-badge {
          padding: 3px 6px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .severity-critica { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .severity-alta { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
        .severity-media { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
        .severity-baixa { background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0; }
        
        .recommendations {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #a7f3d0;
          border-left: 4px solid #059669;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .recommendation-item {
          background: white;
          border: 1px solid #d1fae5;
          border-radius: 6px;
          padding: 15px;
          margin: 12px 0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .recommendation-priority {
          background: #059669;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .strategic-insights {
          background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%);
          border: 1px solid #d8b4fe;
          border-left: 4px solid #7c3aed;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 12px 0;
        }
        
        .insight-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 600;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .footer {
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 9px;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .footer-section h4 {
          color: #374151;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 10px;
        }
        
        .compliance-score {
          font-size: 36px;
          font-weight: 700;
          color: ${complianceScore >= 80 ? '#059669' : complianceScore >= 60 ? '#d97706' : '#dc2626'};
        }
        
        @media print {
          .page { box-shadow: none; margin: 0; }
          body { background: white; margin: 0 !important; padding: 0 !important; }
          .print-button { display: none !important; }
          
          @page {
            margin: 0.75in 0.5in 0.5in 0.5in;
            size: A4;
          }
          
          .page { padding: 0 !important; margin: 0 !important; }
          .header-page { padding: 25px 20px !important; }
          .content { padding: 20px !important; }
          .footer { padding: 15px !important; }
          .section { margin-bottom: 25px !important; page-break-inside: avoid; }
          
          html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- CABEÇALHO EXECUTIVO PROFISSIONAL -->
        <div class="header-page">
          <h1 class="main-title">RELATÓRIO EXECUTIVO DE AUDITORIA INTERNA</h1>
          <h2 class="project-title">${projeto.titulo}</h2>
          <div class="executive-badge">📊 VISÃO ESTRATÉGICA PARA ALTA ADMINISTRAÇÃO</div>
          
          <div class="header-info">
            <div class="info-item">
              <div class="info-label">Código do Projeto</div>
              <div class="info-value">${projeto.codigo}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Auditor Líder</div>
              <div class="info-value">${projeto.auditor_lider || projeto.chefe_auditoria}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nível de Risco</div>
              <div class="info-value">${nivelRisco}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data do Relatório</div>
              <div class="info-value">${dataFormatada}</div>
            </div>
          </div>
        </div>
        
        <!-- CONTEÚDO EXECUTIVO PROFISSIONAL -->
        <div class="content">
          <!-- 1. RESUMO EXECUTIVO -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">1</span>
              RESUMO EXECUTIVO
            </h2>
            
            <div class="executive-summary">
              <p style="font-size: 12px; margin-bottom: 12px; font-weight: 500; line-height: 1.4;">
                <strong>Objetivo Estratégico:</strong> Este relatório apresenta uma visão executiva dos resultados da auditoria realizada em "${projeto.titulo}", 
                executada no período de ${new Date(projeto.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}, 
                com foco na avaliação estratégica dos controles internos e identificação de oportunidades de melhoria organizacional.
              </p>
              
              <div class="summary-highlight">
                <strong>CONCLUSÃO ESTRATÉGICA:</strong> ${totalApontamentos === 0 ? 
                  'Os controles avaliados demonstram adequação e efetividade, proporcionando um ambiente de controle robusto que suporta os objetivos estratégicos da organização.' :
                  `Identificadas ${totalApontamentos} oportunidades de melhoria, sendo ${apontamentosCriticos} de alta prioridade que requerem atenção imediata da alta administração para mitigação de riscos estratégicos.`
                }
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 12px 0;">
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #1e3a8a; font-size: 11px; font-weight: 600; margin-bottom: 6px;">🎯 ESCOPO ESTRATÉGICO</h4>
                  <p style="font-size: 10px; line-height: 1.3;">${projeto.escopo || 'Avaliação abrangente dos controles internos críticos para o negócio, incluindo análise de conformidade regulatória, eficiência operacional e mitigação de riscos estratégicos.'}</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #1e3a8a; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📈 IMPACTO NO NEGÓCIO</h4>
                  <p style="font-size: 10px; line-height: 1.3;">Fortalecimento da governança corporativa, redução de riscos operacionais e melhoria da eficiência dos processos críticos para o alcance dos objetivos estratégicos.</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #1e3a8a; font-size: 11px; font-weight: 600; margin-bottom: 6px;">⏱️ PERÍODO DE EXECUÇÃO</h4>
                  <p style="font-size: 10px; line-height: 1.3;"><strong>Início:</strong> ${new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}<br>
                  <strong>Conclusão:</strong> ${new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}<br>
                  <strong>Investimento:</strong> ${totalHorasAuditoria}h de auditoria</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 12px; margin-top: 15px;">
                <span style="font-weight: 600; font-size: 11px;">Classificação de Risco Estratégico:</span>
                <span class="risk-indicator">🚨 ${nivelRisco}</span>
              </div>
            </div>
          </div>
          
          <!-- 2. INDICADORES ESTRATÉGICOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">2</span>
              INDICADORES ESTRATÉGICOS DE PERFORMANCE
            </h2>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value" style="color: #1e3a8a;">${totalApontamentos}</div>
                <div class="metric-label">Total de Oportunidades</div>
                <div class="metric-description">Melhorias identificadas para otimização dos controles</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value" style="color: #dc2626;">${apontamentosCriticos}</div>
                <div class="metric-label">Prioridade Estratégica</div>
                <div class="metric-description">Requerem atenção imediata da alta administração</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value compliance-score">${complianceScore}%</div>
                <div class="metric-label">Índice de Conformidade</div>
                <div class="metric-description">Score geral de adequação dos controles</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value" style="color: #059669;">${trabalhosConcluidos}/${totalTrabalhos}</div>
                <div class="metric-label">Procedimentos Executados</div>
                <div class="metric-description">Cobertura completa dos processos auditados</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value" style="color: #ea580c;">${apontamentosAltos}</div>
                <div class="metric-label">Atenção Gerencial</div>
                <div class="metric-description">Necessitam priorização pelos gestores</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value" style="color: #7c3aed;">${planosAcao}</div>
                <div class="metric-label">Planos de Ação</div>
                <div class="metric-description">Iniciativas de melhoria propostas</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value" style="color: #059669;">${planosConcluidos}</div>
                <div class="metric-label">Melhorias Implementadas</div>
                <div class="metric-description">Ações corretivas já concluídas</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value" style="color: #0891b2;">${totalHorasAuditoria}h</div>
                <div class="metric-label">Investimento em Auditoria</div>
                <div class="metric-description">Recursos dedicados à avaliação</div>
              </div>
            </div>
          </div>
          
          ${totalApontamentos > 0 ? `
          <!-- 3. PRINCIPAIS ACHADOS ESTRATÉGICOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">3</span>
              PRINCIPAIS ACHADOS ESTRATÉGICOS
            </h2>
            
            <table class="findings-table">
              <thead>
                <tr>
                  <th style="width: 35%;">Oportunidade de Melhoria</th>
                  <th style="width: 15%;">Prioridade</th>
                  <th style="width: 20%;">Área de Impacto</th>
                  <th style="width: 15%;">Status Atual</th>
                  <th style="width: 15%;">Impacto Estimado</th>
                </tr>
              </thead>
              <tbody>
                ${projetoDetalhado?.apontamentos_auditoria?.slice(0, 8).map((apontamento, index) => `
                  <tr>
                    <td>
                      <strong style="font-size: 11px;">${apontamento.titulo || 'Oportunidade de Melhoria ' + (index + 1)}</strong>
                      <br><small style="color: #6b7280; font-size: 9px;">${apontamento.descricao ? apontamento.descricao.substring(0, 80) + '...' : 'Descrição estratégica não disponível'}</small>
                    </td>
                    <td>
                      <span class="severity-badge severity-${apontamento.criticidade || 'baixa'}">
                        ${apontamento.criticidade === 'critica' ? 'ESTRATÉGICA' : 
                          apontamento.criticidade === 'alta' ? 'ALTA' : 
                          apontamento.criticidade === 'media' ? 'MÉDIA' : 'BAIXA'}
                      </span>
                    </td>
                    <td style="font-size: 10px;">${(apontamento.categoria || 'Governança Geral').replace('_', ' ')}</td>
                    <td style="font-size: 10px;">${apontamento.status || 'Identificado'}</td>
                    <td style="text-align: right; font-size: 10px;">
                      ${apontamento.valor_impacto ? 
                        'R$ ' + apontamento.valor_impacto.toLocaleString('pt-BR') : 
                        'Qualitativo'
                      }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <!-- 4. INSIGHTS ESTRATÉGICOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">4</span>
              INSIGHTS ESTRATÉGICOS PARA A ALTA ADMINISTRAÇÃO
            </h2>
            
            <div class="strategic-insights">
              <h3 style="color: #7c3aed; margin-bottom: 15px; font-size: 14px; font-weight: 600;">💡 Análise Estratégica dos Resultados</h3>
              
              <div class="insight-item">
                <span class="insight-icon" style="background: ${complianceScore >= 80 ? '#059669' : complianceScore >= 60 ? '#d97706' : '#dc2626'}; color: white;">G</span>
                <p style="font-size: 11px; margin: 0;"><strong>Governança Corporativa:</strong> ${complianceScore >= 80 ? 'Estrutura de governança demonstra maturidade e alinhamento com as melhores práticas de mercado, proporcionando base sólida para o crescimento sustentável.' : complianceScore >= 60 ? 'Estrutura de governança parcialmente adequada, com oportunidades de fortalecimento para suportar melhor os objetivos estratégicos da organização.' : 'Estrutura de governança necessita fortalecimento significativo para assegurar o alcance dos objetivos estratégicos e mitigação adequada de riscos.'}</p>
              </div>
              
              <div class="insight-item">
                <span class="insight-icon" style="background: ${apontamentosCriticos === 0 ? '#059669' : apontamentosCriticos <= 2 ? '#d97706' : '#dc2626'}; color: white;">R</span>
                <p style="font-size: 11px; margin: 0;"><strong>Gestão de Riscos Estratégicos:</strong> ${apontamentosCriticos === 0 ? 'Riscos estratégicos adequadamente identificados e mitigados, demonstrando maturidade na gestão de riscos organizacionais e proteção dos ativos.' : apontamentosCriticos <= 2 ? 'Alguns riscos estratégicos identificados requerem atenção prioritária da alta administração para assegurar a continuidade dos negócios.' : 'Múltiplos riscos estratégicos críticos identificados, necessitando ação urgente e priorização de recursos para proteção dos objetivos organizacionais.'}</p>
              </div>
              
              <div class="insight-item">
                <span class="insight-icon" style="background: ${trabalhosConcluidos === totalTrabalhos ? '#059669' : trabalhosConcluidos >= totalTrabalhos * 0.7 ? '#d97706' : '#dc2626'}; color: white;">O</span>
                <p style="font-size: 11px; margin: 0;"><strong>Eficiência Operacional:</strong> ${trabalhosConcluidos === totalTrabalhos ? 'Processos operacionais demonstram alta eficiência e aderência aos padrões estabelecidos, contribuindo para a otimização de recursos e resultados.' : trabalhosConcluidos >= totalTrabalhos * 0.7 ? 'Processos operacionais apresentam boa eficiência, com oportunidades pontuais de otimização para maximizar o retorno sobre investimentos.' : 'Processos operacionais apresentam oportunidades significativas de melhoria para aumentar a eficiência e competitividade organizacional.'}</p>
              </div>
              
              <div class="insight-item">
                <span class="insight-icon" style="background: ${planosConcluidos > 0 ? '#059669' : planosAcao > 0 ? '#d97706' : '#dc2626'}; color: white;">M</span>
                <p style="font-size: 11px; margin: 0;"><strong>Melhoria Contínua:</strong> ${planosConcluidos > 0 ? 'Evidências claras de compromisso com a melhoria contínua, demonstrando capacidade organizacional de evolução e adaptação às demandas do mercado.' : planosAcao > 0 ? 'Iniciativas de melhoria estabelecidas, necessitando acompanhamento executivo para assegurar implementação efetiva e resultados sustentáveis.' : 'Oportunidade de estabelecer programa estruturado de melhoria contínua para impulsionar a inovação e competitividade organizacional.'}</p>
              </div>
            </div>
          </div>
          
          <!-- 5. RECOMENDAÇÕES ESTRATÉGICAS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">5</span>
              RECOMENDAÇÕES ESTRATÉGICAS
            </h2>
            
            <div class="recommendations">
              <h3 style="color: #059669; margin-bottom: 15px; font-size: 14px; font-weight: 600;">🎯 Plano de Ação Estratégico</h3>
              
              ${apontamentosCriticos > 0 ? `
              <div class="recommendation-item">
                <div class="recommendation-priority">1</div>
                <div>
                  <strong style="font-size: 12px;">Prioridade Estratégica - Riscos Críticos</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Implementar ações corretivas imediatas para os ${apontamentosCriticos} riscos estratégicos identificados. 
                  <strong>Prazo:</strong> 30 dias. <strong>Responsabilidade:</strong> Alta Administração e Conselho.</p>
                </div>
              </div>
              ` : ''}
              
              ${apontamentosAltos > 0 ? `
              <div class="recommendation-item">
                <div class="recommendation-priority">2</div>
                <div>
                  <strong style="font-size: 12px;">Otimização de Processos Críticos</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Desenvolver iniciativas de melhoria para os ${apontamentosAltos} processos críticos identificados. 
                  <strong>Prazo:</strong> 60-90 dias. <strong>Responsabilidade:</strong> Diretoria Executiva.</p>
                </div>
              </div>
              ` : ''}
              
              <div class="recommendation-item">
                <div class="recommendation-priority">3</div>
                <div>
                  <strong style="font-size: 12px;">Fortalecimento da Governança Corporativa</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Implementar programa de monitoramento contínuo e revisões periódicas dos controles estratégicos. 
                  Estabelecer KPIs de governança e métricas de performance organizacional.</p>
                </div>
              </div>
              
              <div class="recommendation-item">
                <div class="recommendation-priority">4</div>
                <div>
                  <strong style="font-size: 12px;">Cultura de Compliance e Inovação</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Desenvolver programa de capacitação executiva e cultura organizacional focada em compliance, 
                  gestão de riscos e inovação contínua para sustentabilidade competitiva.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- RODAPÉ EXECUTIVO PROFISSIONAL -->
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-section">
              <h4>👥 Liderança de Auditoria</h4>
              <p>Auditor Líder: ${projeto.auditor_lider || projeto.chefe_auditoria}</p>
              <p>Data de Conclusão: ${dataFormatada}</p>
              <p>Investimento: ${totalHorasAuditoria}h</p>
            </div>
            <div class="footer-section">
              <h4>📋 Classificação Executiva</h4>
              <p>Documento: Estratégico</p>
              <p>Audiência: Alta Administração</p>
              <p>Confidencialidade: Restrita</p>
            </div>
            <div class="footer-section">
              <h4>📊 Indicadores Chave</h4>
              <p>Score de Compliance: ${complianceScore}%</p>
              <p>Cobertura: ${trabalhosConcluidos}/${totalTrabalhos}</p>
              <p>Oportunidades: ${totalApontamentos}</p>
            </div>
            <div class="footer-section">
              <h4>🎯 Próximas Etapas</h4>
              <p>Follow-up Executivo: 30 dias</p>
              <p>Revisão Estratégica: Trimestral</p>
              <p>Monitoramento: Contínuo</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #d1d5db; padding-top: 12px; margin-top: 12px;">
            <p style="font-size: 10px;"><strong>🏢 Sistema GRC - Governance, Risk & Compliance</strong></p>
            <p style="font-size: 9px;">Relatório executivo estratégico gerado automaticamente em ${timestamp}</p>
            <p style="font-size: 8px; margin-top: 6px; line-height: 1.3;">
              Este documento contém informações estratégicas confidenciais destinadas à alta administração. 
              As análises apresentadas baseiam-se em metodologia de auditoria interna e melhores práticas de governança corporativa.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateExecutiveReportHTML;