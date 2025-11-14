import React from 'react';

// Gerador específico para Relatório de Compliance - Melhores Práticas de Mercado
export const generateComplianceReportHTML = (projeto: any, projetoDetalhado: any) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Análise dos dados específicos para relatório de compliance
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
  
  // Cálculo do score de compliance regulatório
  const complianceScore = totalApontamentos > 0 ? 
    Math.max(0, 100 - (apontamentosCriticos * 30 + apontamentosAltos * 20 + apontamentosMedios * 10 + apontamentosBaixos * 5)) : 98;
  
  // Análise de conformidade regulatória
  const nivelConformidade = complianceScore >= 95 ? 'CONFORME' : 
                           complianceScore >= 80 ? 'PARCIALMENTE CONFORME' : 
                           complianceScore >= 60 ? 'NÃO CONFORME' : 'CRÍTICO';
  
  // Classificação de risco regulatório
  const riscoRegulatório = apontamentosCriticos > 0 ? 'ALTO' : 
                          apontamentosAltos > 1 ? 'MÉDIO' : 'BAIXO';
  
  // Avaliação por framework de compliance
  const lgpdCompliance = complianceScore >= 85 ? 'ADEQUADO' : complianceScore >= 70 ? 'PARCIAL' : 'INADEQUADO';
  const soxCompliance = apontamentosCriticos === 0 ? 'EFETIVO' : apontamentosCriticos <= 1 ? 'PARCIAL' : 'DEFICIENTE';
  const iso27001Compliance = trabalhosConcluidos === totalTrabalhos ? 'CONFORME' : trabalhosConcluidos >= totalTrabalhos * 0.8 ? 'PARCIAL' : 'NÃO CONFORME';
  const cobitCompliance = planosConcluidos > 0 ? 'IMPLEMENTADO' : planosAcao > 0 ? 'EM IMPLEMENTAÇÃO' : 'NÃO IMPLEMENTADO';
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <title>RELATÓRIO DE COMPLIANCE E CONFORMIDADE REGULATÓRIA - ${projeto.titulo}</title>
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
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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
        
        .compliance-badge {
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
          color: #059669;
          margin-bottom: 15px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .section-number {
          background: #059669;
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
        
        .compliance-summary {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          border-left: 4px solid #059669;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .framework-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin: 15px 0;
        }
        
        .framework-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .framework-card h4 {
          color: #059669;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .compliance-status {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          float: right;
        }
        
        .status-conforme { background: #dcfce7; color: #166534; }
        .status-parcial { background: #fef3c7; color: #92400e; }
        .status-nao-conforme { background: #fee2e2; color: #991b1b; }
        .status-critico { background: #fecaca; color: #7f1d1d; }
        
        .regulatory-matrix {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .regulatory-matrix th {
          background: #f8fafc;
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .regulatory-matrix td {
          padding: 10px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
          font-size: 11px;
        }
        
        .regulatory-matrix tr:hover {
          background: #f9fafb;
        }
        
        .compliance-level {
          padding: 3px 6px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .level-alto { background: #fee2e2; color: #991b1b; }
        .level-medio { background: #fef3c7; color: #92400e; }
        .level-baixo { background: #dcfce7; color: #166534; }
        
        .control-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 12px 0;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .control-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .control-number {
          background: #059669;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
          margin-right: 8px;
        }
        
        .control-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin: 10px 0;
        }
        
        .detail-field {
          background: #f8fafc;
          padding: 8px;
          border-radius: 4px;
          border-left: 3px solid #64748b;
        }
        
        .detail-field label {
          font-size: 9px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 3px;
        }
        
        .detail-field span {
          font-size: 11px;
          color: #1e293b;
          font-weight: 500;
        }
        
        .gap-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 15px 0;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .gap-header {
          background: #f8fafc;
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .gap-number {
          background: #dc2626;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 600;
          margin-right: 8px;
        }
        
        .regulatory-classification {
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .critical-gap { background: #fee2e2; color: #991b1b; }
        .high-gap { background: #fef3c7; color: #92400e; }
        .medium-gap { background: #f0f9ff; color: #1e40af; }
        .low-gap { background: #f0fdf4; color: #166534; }
        
        .gap-content {
          padding: 15px;
        }
        
        .regulatory-section {
          margin: 12px 0;
          padding: 12px;
          background: #f8fafc;
          border-radius: 4px;
          border-left: 3px solid #64748b;
        }
        
        .regulatory-section h5 {
          color: #059669;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .regulatory-icon {
          width: 14px;
          height: 14px;
          background: #64748b;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 8px;
          font-weight: 600;
        }
        
        .regulatory-section p {
          font-size: 10px;
          line-height: 1.4;
          color: #475569;
          margin: 4px 0;
        }
        
        .compliance-framework {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #93c5fd;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .framework-assessment {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 15px;
        }
        
        .framework-component {
          background: white;
          border: 1px solid #dbeafe;
          border-radius: 4px;
          padding: 12px;
        }
        
        .framework-component h4 {
          color: #3b82f6;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .framework-component p {
          font-size: 10px;
          line-height: 1.3;
          color: #1e40af;
          margin-bottom: 8px;
        }
        
        .framework-score {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .score-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .score-conforme { background: #059669; }
        .score-parcial { background: #d97706; }
        .score-nao-conforme { background: #dc2626; }
        
        .action-plan {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 10px 0;
          padding: 12px;
        }
        
        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .priority-badge {
          padding: 3px 6px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .priority-critica { background: #fee2e2; color: #991b1b; }
        .priority-alta { background: #fef3c7; color: #92400e; }
        .priority-media { background: #f0f9ff; color: #1e40af; }
        .priority-baixa { background: #dcfce7; color: #166534; }
        
        .compliance-conclusions {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e1;
          border-left: 4px solid #059669;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .opinion-box {
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid;
          margin-top: 12px;
        }
        
        .opinion-conforme {
          background: #f0fdf4;
          border-left-color: #059669;
          color: #166534;
        }
        
        .opinion-parcial {
          background: #fffbeb;
          border-left-color: #d97706;
          color: #92400e;
        }
        
        .opinion-nao-conforme {
          background: #fef2f2;
          border-left-color: #dc2626;
          color: #991b1b;
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
        
        .references {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }
        
        .references h4 {
          color: #059669;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .references ul {
          list-style: none;
          padding: 0;
        }
        
        .references li {
          font-size: 10px;
          margin: 4px 0;
          padding-left: 12px;
          position: relative;
        }
        
        .references li:before {
          content: "•";
          color: #059669;
          font-weight: bold;
          position: absolute;
          left: 0;
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
        <!-- CABEÇALHO DE COMPLIANCE PROFISSIONAL -->
        <div class="header-page">
          <h1 class="main-title">RELATÓRIO DE COMPLIANCE E CONFORMIDADE REGULATÓRIA</h1>
          <h2 class="project-title">${projeto.titulo}</h2>
          <div class="compliance-badge">⚖️ CONFORME FRAMEWORKS REGULATÓRIOS</div>
          
          <div class="header-info">
            <div class="info-item">
              <div class="info-label">Código do Projeto</div>
              <div class="info-value">${projeto.codigo}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Auditor de Compliance</div>
              <div class="info-value">${projeto.auditor_lider || projeto.chefe_auditoria}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nível de Conformidade</div>
              <div class="info-value">${nivelConformidade}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Score de Compliance</div>
              <div class="info-value">${complianceScore}%</div>
            </div>
            <div class="info-item">
              <div class="info-label">Risco Regulatório</div>
              <div class="info-value">${riscoRegulatório}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data da Avaliação</div>
              <div class="info-value">${dataFormatada}</div>
            </div>
          </div>
        </div>
        
        <!-- CONTEÚDO DE COMPLIANCE PROFISSIONAL -->
        <div class="content">
          <!-- 1. SUMÁRIO DE CONFORMIDADE REGULATÓRIA -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">1</span>
              SUMÁRIO DE CONFORMIDADE REGULATÓRIA
            </h2>
            
            <div class="compliance-summary">
              <p style="font-size: 12px; margin-bottom: 12px; font-weight: 500; line-height: 1.4;">
                <strong>Objetivo da Avaliação:</strong> Verificar a conformidade dos controles internos e processos organizacionais com os principais frameworks regulatórios e normativos aplicáveis, 
                incluindo LGPD, SOX, ISO 27001, COBIT e demais regulamentações setoriais vigentes.
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin: 12px 0;">
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #059669; font-size: 11px; font-weight: 600; margin-bottom: 6px;">⚖️ ESCOPO REGULATÓRIO</h4>
                  <p style="font-size: 10px; line-height: 1.3;">Avaliação abrangente da conformidade com LGPD, SOX, ISO 27001, COBIT, regulamentações setoriais e melhores práticas de governança corporativa.</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #059669; font-size: 11px; font-weight: 600; margin-bottom: 6px;">🔍 METODOLOGIA APLICADA</h4>
                  <p style="font-size: 10px; line-height: 1.3;">Análise documental, testes de conformidade, verificação de controles, entrevistas estruturadas e benchmarking com melhores práticas de mercado.</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #059669; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📊 RESULTADO GERAL</h4>
                  <p style="font-size: 10px; line-height: 1.3;"><strong>Score:</strong> ${complianceScore}%<br>
                  <strong>Classificação:</strong> ${nivelConformidade}<br>
                  <strong>Gaps Identificados:</strong> ${totalApontamentos}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 2. AVALIAÇÃO POR FRAMEWORK REGULATÓRIO -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">2</span>
              AVALIAÇÃO POR FRAMEWORK REGULATÓRIO
            </h2>
            
            <div class="framework-grid">
              <div class="framework-card">
                <h4>🛡️ LGPD - Lei Geral de Proteção de Dados <span class="compliance-status status-${lgpdCompliance === 'ADEQUADO' ? 'conforme' : lgpdCompliance === 'PARCIAL' ? 'parcial' : 'nao-conforme'}">${lgpdCompliance}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Avaliação da conformidade com os princípios de proteção de dados pessoais, direitos dos titulares e obrigações do controlador.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Artigos Avaliados:</strong> 6º, 7º, 8º, 9º, 46º, 48º, 49º</p>
              </div>
              
              <div class="framework-card">
                <h4>📊 SOX - Sarbanes-Oxley Act <span class="compliance-status status-${soxCompliance === 'EFETIVO' ? 'conforme' : soxCompliance === 'PARCIAL' ? 'parcial' : 'nao-conforme'}">${soxCompliance}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Verificação dos controles internos sobre relatórios financeiros e governança corporativa.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Seções Avaliadas:</strong> 302, 404, 906, 1107</p>
              </div>
              
              <div class="framework-card">
                <h4>🔒 ISO 27001 - Segurança da Informação <span class="compliance-status status-${iso27001Compliance === 'CONFORME' ? 'conforme' : iso27001Compliance === 'PARCIAL' ? 'parcial' : 'nao-conforme'}">${iso27001Compliance}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Análise do Sistema de Gestão de Segurança da Informação e controles de segurança implementados.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Anexo A:</strong> 114 controles avaliados</p>
              </div>
              
              <div class="framework-card">
                <h4>💻 COBIT 2019 - Governança de TI <span class="compliance-status status-${cobitCompliance === 'IMPLEMENTADO' ? 'conforme' : cobitCompliance === 'EM IMPLEMENTAÇÃO' ? 'parcial' : 'nao-conforme'}">${cobitCompliance}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Avaliação da governança e gestão de TI corporativa conforme melhores práticas.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Domínios:</strong> EDM, APO, BAI, DSS, MEA</p>
              </div>
            </div>
          </div>
          
          <!-- 3. MATRIZ DE CONFORMIDADE REGULATÓRIA -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">3</span>
              MATRIZ DE CONFORMIDADE REGULATÓRIA
            </h2>
            
            <table class="regulatory-matrix">
              <thead>
                <tr>
                  <th style="width: 25%;">Framework/Regulamentação</th>
                  <th style="width: 20%;">Requisito Avaliado</th>
                  <th style="width: 15%;">Status</th>
                  <th style="width: 15%;">Score</th>
                  <th style="width: 15%;">Risco</th>
                  <th style="width: 10%;">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 500;">LGPD - Art. 46º</td>
                  <td>Medidas de Segurança Técnicas</td>
                  <td><span class="compliance-level level-${lgpdCompliance === 'ADEQUADO' ? 'baixo' : lgpdCompliance === 'PARCIAL' ? 'medio' : 'alto'}">${lgpdCompliance}</span></td>
                  <td>${complianceScore >= 85 ? '85%' : complianceScore >= 70 ? '70%' : '45%'}</td>
                  <td><span class="compliance-level level-${riscoRegulatório === 'BAIXO' ? 'baixo' : riscoRegulatório === 'MÉDIO' ? 'medio' : 'alto'}">${riscoRegulatório}</span></td>
                  <td>${lgpdCompliance === 'ADEQUADO' ? 'Manter' : 'Corrigir'}</td>
                </tr>
                <tr>
                  <td style="font-weight: 500;">SOX - Seção 404</td>
                  <td>Controles Internos Financeiros</td>
                  <td><span class="compliance-level level-${soxCompliance === 'EFETIVO' ? 'baixo' : soxCompliance === 'PARCIAL' ? 'medio' : 'alto'}">${soxCompliance}</span></td>
                  <td>${apontamentosCriticos === 0 ? '95%' : apontamentosCriticos <= 1 ? '75%' : '50%'}</td>
                  <td><span class="compliance-level level-${apontamentosCriticos === 0 ? 'baixo' : apontamentosCriticos <= 1 ? 'medio' : 'alto'}">${apontamentosCriticos === 0 ? 'BAIXO' : apontamentosCriticos <= 1 ? 'MÉDIO' : 'ALTO'}</span></td>
                  <td>${soxCompliance === 'EFETIVO' ? 'Manter' : 'Implementar'}</td>
                </tr>
                <tr>
                  <td style="font-weight: 500;">ISO 27001</td>
                  <td>SGSI - Sistema de Gestão</td>
                  <td><span class="compliance-level level-${iso27001Compliance === 'CONFORME' ? 'baixo' : iso27001Compliance === 'PARCIAL' ? 'medio' : 'alto'}">${iso27001Compliance}</span></td>
                  <td>${trabalhosConcluidos === totalTrabalhos ? '90%' : trabalhosConcluidos >= totalTrabalhos * 0.8 ? '75%' : '60%'}</td>
                  <td><span class="compliance-level level-${trabalhosConcluidos === totalTrabalhos ? 'baixo' : trabalhosConcluidos >= totalTrabalhos * 0.8 ? 'medio' : 'alto'}">${trabalhosConcluidos === totalTrabalhos ? 'BAIXO' : trabalhosConcluidos >= totalTrabalhos * 0.8 ? 'MÉDIO' : 'ALTO'}</span></td>
                  <td>${iso27001Compliance === 'CONFORME' ? 'Manter' : 'Adequar'}</td>
                </tr>
                <tr>
                  <td style="font-weight: 500;">COBIT 2019</td>
                  <td>Governança de TI</td>
                  <td><span class="compliance-level level-${cobitCompliance === 'IMPLEMENTADO' ? 'baixo' : cobitCompliance === 'EM IMPLEMENTAÇÃO' ? 'medio' : 'alto'}">${cobitCompliance}</span></td>
                  <td>${planosConcluidos > 0 ? '80%' : planosAcao > 0 ? '65%' : '40%'}</td>
                  <td><span class="compliance-level level-${planosConcluidos > 0 ? 'baixo' : planosAcao > 0 ? 'medio' : 'alto'}">${planosConcluidos > 0 ? 'BAIXO' : planosAcao > 0 ? 'MÉDIO' : 'ALTO'}</span></td>
                  <td>${cobitCompliance === 'IMPLEMENTADO' ? 'Manter' : 'Implementar'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 4. CONTROLES DE COMPLIANCE AVALIADOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">4</span>
              CONTROLES DE COMPLIANCE AVALIADOS
            </h2>
            
            <p style="font-size: 11px; color: #6b7280; margin-bottom: 15px;">
              Controles avaliados conforme metodologia de compliance baseada em frameworks regulatórios e melhores práticas de mercado.
            </p>
            
            ${projetoDetalhado?.trabalhos_auditoria?.map((trabalho, index) => `
              <div class="control-item">
                <div class="control-header">
                  <h4 style="display: flex; align-items: center;">
                    <span class="control-number">${index + 1}</span>
                    ${trabalho.titulo || 'Controle de Compliance ' + (index + 1)}
                  </h4>
                  <span class="compliance-status status-${trabalho.status === 'concluido' ? 'conforme' : trabalho.status === 'em_andamento' ? 'parcial' : 'nao-conforme'}">
                    ${trabalho.status === 'concluido' ? '✅ CONFORME' : trabalho.status === 'em_andamento' ? '🔄 EM AVALIAÇÃO' : '⏳ PENDENTE'}
                  </span>
                </div>
                
                <div class="control-details">
                  <div class="detail-field">
                    <label>Framework Aplicável</label>
                    <span>${trabalho.framework || 'LGPD, SOX, ISO 27001'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Tipo de Controle</label>
                    <span>${trabalho.tipo_controle || 'Preventivo, Detectivo'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Frequência de Teste</label>
                    <span>${trabalho.frequencia || 'Anual'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Horas de Avaliação</label>
                    <span>${trabalho.horas_trabalhadas || 0}h</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Responsável Compliance</label>
                    <span>${trabalho.responsavel || projeto.auditor_lider || 'Equipe de Compliance'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Evidência (Ref.)</label>
                    <span>EV-${projeto.codigo}-${String(index + 1).padStart(2, '0')}</span>
                  </div>
                </div>
                
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border-left: 3px solid #3b82f6; margin-top: 10px;">
                  <h5 style="color: #059669; font-size: 11px; font-weight: 600; margin-bottom: 6px;">🎯 RESULTADO DA AVALIAÇÃO</h5>
                  <p style="font-size: 10px; line-height: 1.4; margin: 4px 0;">${trabalho.resultado_compliance || 'Controle avaliado conforme metodologia de compliance. Evidências coletadas e documentadas adequadamente conforme frameworks regulatórios aplicáveis.'}</p>
                  
                  ${trabalho.status === 'concluido' ? `
                    <div style="background: #dcfce7; color: #166534; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 10px; font-weight: 500;">
                      ✅ <strong>Conformidade:</strong> Controle em conformidade com requisitos regulatórios. Evidências suficientes obtidas e documentadas.
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 5. GAPS DE CONFORMIDADE IDENTIFICADOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">5</span>
              GAPS DE CONFORMIDADE IDENTIFICADOS
            </h2>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <h4 style="color: #059669; font-size: 12px; font-weight: 600; margin-bottom: 10px;">📊 RESUMO DOS GAPS REGULATÓRIOS</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                <div style="text-align: center; padding: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #dc2626;">${apontamentosCriticos}</div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #6b7280;">Gaps Críticos</div>
                </div>
                <div style="text-align: center; padding: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #ea580c;">${apontamentosAltos}</div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #6b7280;">Gaps Altos</div>
                </div>
                <div style="text-align: center; padding: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #d97706;">${apontamentosMedios}</div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #6b7280;">Gaps Médios</div>
                </div>
                <div style="text-align: center; padding: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #059669;">${apontamentosBaixos}</div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #6b7280;">Gaps Baixos</div>
                </div>
              </div>
            </div>
            
            ${projetoDetalhado?.apontamentos_auditoria?.map((apontamento, index) => `
              <div class="gap-item">
                <div class="gap-header">
                  <h4 style="display: flex; align-items: center;">
                    <span class="gap-number">${index + 1}</span>
                    ${apontamento.titulo || 'Gap de Conformidade ' + (index + 1)}
                  </h4>
                  <span class="regulatory-classification ${apontamento.criticidade === 'critica' ? 'critical-gap' : apontamento.criticidade === 'alta' ? 'high-gap' : apontamento.criticidade === 'media' ? 'medium-gap' : 'low-gap'}">
                    ${apontamento.criticidade === 'critica' ? 'GAP CRÍTICO' : apontamento.criticidade === 'alta' ? 'GAP ALTO' : apontamento.criticidade === 'media' ? 'GAP MÉDIO' : 'GAP BAIXO'}
                  </span>
                </div>
                
                <div class="gap-content">
                  <div class="regulatory-section">
                    <h5>
                      <span class="regulatory-icon">R</span>
                      REQUISITO REGULATÓRIO
                    </h5>
                    <p>${apontamento.requisito_regulatorio || 'Requisito de conformidade conforme LGPD Art. 46º, SOX Seção 404, ISO 27001 ou COBIT 2019, dependendo da natureza do gap identificado.'}</p>
                  </div>
                  
                  <div class="regulatory-section">
                    <h5>
                      <span class="regulatory-icon">G</span>
                      GAP IDENTIFICADO
                    </h5>
                    <p>${apontamento.descricao || 'Gap de conformidade identificado que pode impactar a aderência aos requisitos regulatórios e expor a organização a riscos de não conformidade.'}</p>
                  </div>
                  
                  <div class="regulatory-section">
                    <h5>
                      <span class="regulatory-icon">I</span>
                      IMPACTO REGULATÓRIO
                    </h5>
                    <p>${apontamento.impacto_regulatorio || 'Risco de não conformidade com requisitos regulatórios, possíveis sanções, multas, perda de licenças operacionais e comprometimento da reputação organizacional perante órgãos reguladores.'}</p>
                    ${apontamento.valor_impacto ? `<p style="margin-top: 6px; font-weight: 600;"><strong>💰 Impacto Financeiro Estimado:</strong> R$ ${apontamento.valor_impacto.toLocaleString('pt-BR')}</p>` : ''}
                  </div>
                  
                  <div class="regulatory-section" style="border-left-color: #059669; background: #f0fdf4;">
                    <h5 style="color: #059669;">
                      <span class="regulatory-icon" style="background: #059669;">A</span>
                      AÇÃO CORRETIVA RECOMENDADA
                    </h5>
                    <p style="color: #065f46;">${apontamento.acao_corretiva || 'Implementar controles adequados para atender aos requisitos regulatórios, estabelecer procedimentos de monitoramento contínuo, promover capacitação das equipes e considerar assessoria jurídica especializada.'}</p>
                  </div>
                  
                  <div style="background: #f1f5f9; padding: 10px; border-radius: 4px; margin-top: 10px;">
                    <p style="font-size: 10px; color: #475569;"><strong>Framework:</strong> ${apontamento.framework || 'LGPD, SOX, ISO 27001'} | <strong>Evidência:</strong> EV-${projeto.codigo}-GAP-${String(index + 1).padStart(2, '0')} | <strong>Prazo:</strong> ${apontamento.prazo || '90 dias'}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 6. PLANOS DE ADEQUAÇÃO REGULATÓRIA -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">6</span>
              PLANOS DE ADEQUAÇÃO REGULATÓRIA
            </h2>
            
            ${projetoDetalhado?.planos_acao?.map((plano, index) => `
              <div class="action-plan">
                <div class="action-header">
                  <h4 style="font-size: 12px; font-weight: 600; color: #059669;">${plano.titulo || 'Plano de Adequação ' + (index + 1)}</h4>
                  <span class="priority-badge priority-${plano.prioridade === 'alta' ? 'critica' : plano.prioridade === 'media' ? 'alta' : 'baixa'}">
                    ${(plano.prioridade || 'media').toUpperCase()}
                  </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin: 8px 0;">
                  <div class="detail-field">
                    <label>Responsável</label>
                    <span>${plano.responsavel || 'Compliance Officer'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Prazo Regulatório</label>
                    <span>${plano.prazo ? new Date(plano.prazo).toLocaleDateString('pt-BR') : '90 dias'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Status</label>
                    <span>${plano.status || 'Em Implementação'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>% Conclusão</label>
                    <span>${plano.percentual_conclusao || 0}%</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Framework</label>
                    <span>${plano.framework || 'LGPD, SOX'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Custo Estimado</label>
                    <span>${plano.custo ? 'R$ ' + plano.custo.toLocaleString('pt-BR') : 'A definir'}</span>
                  </div>
                </div>
                
                <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong>Descrição:</strong> ${plano.descricao || 'Implementar ações de adequação conforme requisitos regulatórios identificados na avaliação de compliance.'}</p>
              </div>
            `).join('')}
          </div>
          
          <!-- 7. CONCLUSÕES E OPINIÃO DE COMPLIANCE -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">7</span>
              CONCLUSÕES E OPINIÃO DE COMPLIANCE
            </h2>
            
            <div class="compliance-conclusions">
              <h3 style="color: #059669; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Avaliação Geral de Conformidade Regulatória</h3>
              <p style="font-size: 11px; margin-bottom: 12px; line-height: 1.4;">
                Com base na avaliação de compliance executada, análises regulatórias realizadas e verificação dos frameworks aplicáveis, 
                apresentamos as seguintes conclusões sobre a conformidade organizacional:
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin: 12px 0;">
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${complianceScore >= 95 ? '#059669' : complianceScore >= 80 ? '#d97706' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>LGPD - Proteção de Dados:</strong> ${complianceScore >= 85 ? 'Controles adequados implementados, demonstrando conformidade com os princípios de proteção de dados e direitos dos titulares.' : complianceScore >= 70 ? 'Controles parcialmente adequados, necessitando melhorias pontuais para plena conformidade com a LGPD.' : 'Controles necessitam fortalecimento significativo para atender aos requisitos da LGPD e evitar sanções regulatórias.'}</p>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${apontamentosCriticos === 0 ? '#059669' : apontamentosCriticos <= 1 ? '#d97706' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>SOX - Controles Financeiros:</strong> ${apontamentosCriticos === 0 ? 'Controles internos sobre relatórios financeiros operando efetivamente conforme requisitos SOX.' : apontamentosCriticos <= 1 ? 'Alguns controles necessitam ajustes para plena conformidade com os requisitos SOX.' : 'Controles apresentam deficiências que podem impactar a conformidade SOX.'}</p>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${trabalhosConcluidos === totalTrabalhos ? '#059669' : trabalhosConcluidos >= totalTrabalhos * 0.8 ? '#d97706' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>ISO 27001 - Segurança:</strong> ${trabalhosConcluidos === totalTrabalhos ? 'Sistema de Gestão de Segurança da Informação conforme padrões ISO 27001.' : trabalhosConcluidos >= totalTrabalhos * 0.8 ? 'SGSI parcialmente implementado, necessitando adequações pontuais.' : 'SGSI necessita implementação de controles adicionais para conformidade ISO 27001.'}</p>
                </div>
              </div>
              
              <div style="margin-top: 20px;">
                <h3 style="color: #059669; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Opinião de Compliance</h3>
                <div class="opinion-box ${nivelConformidade === 'CONFORME' ? 'opinion-conforme' : nivelConformidade === 'PARCIALMENTE CONFORME' ? 'opinion-parcial' : 'opinion-nao-conforme'}">
                  <p style="font-size: 11px; margin: 6px 0; font-weight: 600;">
                    ${nivelConformidade === 'CONFORME' ? '✅ OPINIÃO DE CONFORMIDADE POSITIVA' : nivelConformidade === 'PARCIALMENTE CONFORME' ? '⚠️ OPINIÃO DE CONFORMIDADE COM RESSALVAS' : '❌ OPINIÃO DE NÃO CONFORMIDADE'}
                  </p>
                  <p style="font-size: 11px; line-height: 1.4; margin: 6px 0;">
                    ${nivelConformidade === 'CONFORME' ? 
                      'Os controles avaliados demonstram conformidade adequada com os principais frameworks regulatórios aplicáveis. A organização mantém aderência satisfatória aos requisitos de LGPD, SOX, ISO 27001 e COBIT, demonstrando maturidade em compliance e gestão de riscos regulatórios.' :
                      nivelConformidade === 'PARCIALMENTE CONFORME' ? 
                      'Os controles apresentam conformidade parcial com os frameworks regulatórios, necessitando implementação das ações corretivas identificadas para plena adequação. As melhorias recomendadas devem ser priorizadas para assegurar conformidade regulatória completa.' :
                      'Os controles apresentam gaps significativos de conformidade que expõem a organização a riscos regulatórios. É necessária ação imediata para implementar as correções identificadas e assegurar adequação aos frameworks regulatórios aplicáveis.'
                    }
                  </p>
                  
                  <p style="font-size: 10px; margin: 10px 0 0 0; font-style: italic;">
                    Esta opinião é baseada na avaliação de compliance conforme metodologia aplicada, 
                    frameworks regulatórios vigentes e melhores práticas de mercado em conformidade regulatória.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 8. REFERÊNCIAS REGULATÓRIAS E NORMATIVAS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">8</span>
              REFERÊNCIAS REGULATÓRIAS E NORMATIVAS
            </h2>
            
            <div class="references">
              <h4>📚 Frameworks e Regulamentações Aplicadas</h4>
              <ul>
                <li>Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais (LGPD)</li>
                <li>Sarbanes-Oxley Act of 2002 - Seções 302, 404, 906, 1107</li>
                <li>ISO/IEC 27001:2013 - Information Security Management Systems</li>
                <li>ISO/IEC 27002:2013 - Code of Practice for Information Security Controls</li>
                <li>COBIT 2019 - Control Objectives for Information and Related Technologies</li>
                <li>NIST Cybersecurity Framework v1.1</li>
                <li>Resolução CMN nº 4.658/2018 - Política de Segurança Cibernética</li>
                <li>Circular SUSEP nº 612/2020 - Política de Segurança Cibernética</li>
              </ul>
            </div>
            
            <div class="references">
              <h4>📋 Evidências e Documentação</h4>
              <ul>
                <li>EV-${projeto.codigo}-01 a EV-${projeto.codigo}-${String(totalTrabalhos).padStart(2, '0')} - Evidências de Controles</li>
                <li>EV-${projeto.codigo}-GAP-01 a EV-${projeto.codigo}-GAP-${String(totalApontamentos).padStart(2, '0')} - Gaps Identificados</li>
                <li>EV-${projeto.codigo}-LGPD - Avaliação de Conformidade LGPD</li>
                <li>EV-${projeto.codigo}-SOX - Avaliação de Controles SOX</li>
                <li>EV-${projeto.codigo}-ISO - Avaliação ISO 27001</li>
                <li>EV-${projeto.codigo}-COBIT - Avaliação COBIT 2019</li>
              </ul>
            </div>
            
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin: 12px 0;">
              <h4 style="color: #059669; font-size: 11px; font-weight: 600; margin-bottom: 8px;">⚖️ Declaração de Independência e Competência</h4>
              <p style="font-size: 10px; line-height: 1.3;">
                A equipe de compliance declara que manteve independência e objetividade durante a execução da avaliação, 
                conforme padrões éticos aplicáveis e competência técnica em frameworks regulatórios e melhores práticas de compliance.
              </p>
            </div>
          </div>
        </div>
        
        <!-- RODAPÉ DE COMPLIANCE PROFISSIONAL -->
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-section">
              <h4>⚖️ Equipe de Compliance</h4>
              <p>Auditor de Compliance: ${projeto.auditor_lider || projeto.chefe_auditoria}</p>
              <p>Data de Conclusão: ${dataFormatada}</p>
              <p>Horas de Avaliação: ${totalHorasAuditoria}h</p>
            </div>
            <div class="footer-section">
              <h4>📋 Classificação</h4>
              <p>Documento: Compliance</p>
              <p>Distribuição: Compliance Officer</p>
              <p>Confidencialidade: Restrita</p>
            </div>
            <div class="footer-section">
              <h4>📊 Indicadores de Compliance</h4>
              <p>Score de Conformidade: ${complianceScore}%</p>
              <p>Controles Avaliados: ${trabalhosConcluidos}/${totalTrabalhos}</p>
              <p>Gaps Identificados: ${totalApontamentos}</p>
            </div>
            <div class="footer-section">
              <h4>🎯 Próximos Passos</h4>
              <p>Follow-up: 30 dias</p>
              <p>Reavaliação: Semestral</p>
              <p>Monitoramento: Contínuo</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #d1d5db; padding-top: 12px; margin-top: 12px;">
            <p style="font-size: 10px;"><strong>🏢 Sistema GRC - Governance, Risk & Compliance</strong></p>
            <p style="font-size: 9px;">Relatório de compliance regulatório gerado automaticamente em ${timestamp}</p>
            <p style="font-size: 8px; margin-top: 6px; line-height: 1.3;">
              Este documento contém avaliação de conformidade regulatória conforme frameworks aplicáveis. 
              As análises apresentadas baseiam-se em metodologia de compliance e melhores práticas de mercado.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateComplianceReportHTML;