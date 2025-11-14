import React from 'react';

// Gerador específico para Relatório de Seguimento - Monitoramento de Ações Corretivas
export const generateFollowUpReportHTML = (projeto: any, projetoDetalhado: any) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Análise dos dados específicos para relatório de seguimento
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
  const planosEmAndamento = projetoDetalhado?.planos_acao?.filter(p => p.status === 'em_andamento').length || 0;
  const planosPendentes = projetoDetalhado?.planos_acao?.filter(p => p.status === 'pendente').length || 0;
  
  // Cálculo do score de implementação
  const implementationScore = planosAcao > 0 ? 
    Math.round(((planosConcluidos * 100) + (planosEmAndamento * 50)) / planosAcao) : 0;
  
  // Status geral de seguimento
  const statusSeguimento = implementationScore >= 90 ? 'EXCELENTE' : 
                          implementationScore >= 70 ? 'SATISFATÓRIO' : 
                          implementationScore >= 50 ? 'EM PROGRESSO' : 'CRÍTICO';
  
  // Análise de efetividade
  const efetividadeAcoes = planosConcluidos > 0 ? 'EFETIVA' : 
                          planosEmAndamento > 0 ? 'PARCIAL' : 'INSUFICIENTE';
  
  // Cálculo de prazos e riscos
  const prazoMedioImplementacao = planosAcao > 0 ? Math.round(planosAcao * 30) : 90; // Estimativa em dias
  const nivelRisco = apontamentosCriticos > 5 ? 'ALTO' : 
                     apontamentosCriticos > 2 ? 'MÉDIO' : 
                     apontamentosCriticos > 0 ? 'BAIXO' : 'CONTROLADO';
  const taxaImplementacao = implementationScore;
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <title>RELATÓRIO DE SEGUIMENTO E MONITORAMENTO - ${projeto.titulo}</title>
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
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
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
        
        .followup-badge {
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
          color: #7c3aed;
          margin-bottom: 15px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .section-number {
          background: #7c3aed;
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
        
        .followup-summary {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          border: 1px solid #d8b4fe;
          border-left: 4px solid #7c3aed;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 15px 0;
        }
        
        @media (max-width: 768px) {
          .status-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .status-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .status-card h4 {
          color: #7c3aed;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .implementation-status {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          float: right;
        }
        
        .status-excelente { background: #dcfce7; color: #166534; }
        .status-satisfatorio { background: #dbeafe; color: #1e40af; }
        .status-em-progresso { background: #fef3c7; color: #92400e; }
        .status-critico { background: #fee2e2; color: #991b1b; }
        
        .progress-matrix {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .progress-matrix th {
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
        
        .progress-matrix td {
          padding: 10px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
          font-size: 11px;
        }
        
        .progress-matrix tr:hover {
          background: #f9fafb;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-100 { background: #059669; width: 100%; }
        .progress-75 { background: #3b82f6; width: 75%; }
        .progress-50 { background: #f59e0b; width: 50%; }
        .progress-25 { background: #ef4444; width: 25%; }
        .progress-0 { background: #6b7280; width: 5%; }
        
        .action-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 12px 0;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .action-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .action-number {
          background: #7c3aed;
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
        
        .action-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
        
        .timeline-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 15px 0;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .timeline-header {
          background: #f8fafc;
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .timeline-number {
          background: #7c3aed;
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
        
        .timeline-status {
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-concluido { background: #dcfce7; color: #166534; }
        .status-em-andamento { background: #dbeafe; color: #1e40af; }
        .status-pendente { background: #fef3c7; color: #92400e; }
        .status-atrasado { background: #fee2e2; color: #991b1b; }
        
        .timeline-content {
          padding: 15px;
        }
        
        .milestone-section {
          margin: 12px 0;
          padding: 12px;
          background: #f8fafc;
          border-radius: 4px;
          border-left: 3px solid #64748b;
        }
        
        .milestone-section h5 {
          color: #7c3aed;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .milestone-icon {
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
        
        .milestone-section p {
          font-size: 10px;
          line-height: 1.4;
          color: #475569;
          margin: 4px 0;
        }
        
        .effectiveness-analysis {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #a7f3d0;
          border-left: 4px solid #059669;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .effectiveness-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 15px;
        }
        
        @media (max-width: 768px) {
          .effectiveness-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .effectiveness-component {
          background: white;
          border: 1px solid #d1fae5;
          border-radius: 4px;
          padding: 12px;
        }
        
        .effectiveness-component h4 {
          color: #059669;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .effectiveness-component p {
          font-size: 10px;
          line-height: 1.3;
          color: #065f46;
          margin-bottom: 8px;
        }
        
        .effectiveness-score {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .score-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .score-efetiva { background: #059669; }
        .score-parcial { background: #d97706; }
        .score-insuficiente { background: #dc2626; }
        
        .recommendations {
          background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%);
          border: 1px solid #d8b4fe;
          border-left: 4px solid #7c3aed;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .recommendation-item {
          background: white;
          border: 1px solid #e9d5ff;
          border-radius: 6px;
          padding: 15px;
          margin: 12px 0;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .recommendation-priority {
          background: #7c3aed;
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
        
        .followup-conclusions {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e1;
          border-left: 4px solid #7c3aed;
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
        
        .opinion-excelente {
          background: #f0fdf4;
          border-left-color: #059669;
          color: #166534;
        }
        
        .opinion-satisfatorio {
          background: #eff6ff;
          border-left-color: #3b82f6;
          color: #1e40af;
        }
        
        .opinion-em-progresso {
          background: #fffbeb;
          border-left-color: #f59e0b;
          color: #92400e;
        }
        
        .opinion-critico {
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
          color: #7c3aed;
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
          color: #7c3aed;
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
        <!-- CABEÇALHO DE SEGUIMENTO PROFISSIONAL -->
        <div class="header-page">
          <h1 class="main-title">RELATÓRIO DE SEGUIMENTO E MONITORAMENTO</h1>
          <h2 class="project-title">${projeto.titulo}</h2>
          <div class="followup-badge">📈 ACOMPANHAMENTO DE AÇÕES CORRETIVAS</div>
          
          <div class="header-info">
            <div class="info-item">
              <div class="info-label">Total de Planos</div>
              <div class="info-value">${planosAcao}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Taxa de Implementação</div>
              <div class="info-value">${taxaImplementacao}%</div>
            </div>
            <div class="info-item">
              <div class="info-label">Prazo Médio</div>
              <div class="info-value">${prazoMedioImplementacao} dias</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nível de Risco</div>
              <div class="info-value">${nivelRisco}</div>
            </div>
          </div>
        </div>
        
        <!-- CONTEÚDO DE SEGUIMENTO PROFISSIONAL -->
        <div class="content">
          <!-- 1. SUMÁRIO EXECUTIVO DE SEGUIMENTO -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">1</span>
              SUMÁRIO EXECUTIVO DE SEGUIMENTO
            </h2>
            
            <div class="followup-summary">
              <p style="font-size: 12px; margin-bottom: 12px; font-weight: 500; line-height: 1.4;">
                <strong>Objetivo do Seguimento:</strong> Monitorar e avaliar a implementação das ações corretivas decorrentes da auditoria realizada em "${projeto.titulo}", 
                verificando a efetividade das medidas adotadas e o progresso na mitigação dos riscos identificados.
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 12px 0;">
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #7c3aed; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📋 ESCOPO DO SEGUIMENTO</h4>
                  <p style="font-size: 10px; line-height: 1.3;">Acompanhamento de ${planosAcao} planos de ação, verificação da implementação de controles corretivos e avaliação da efetividade das medidas adotadas.</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #7c3aed; font-size: 11px; font-weight: 600; margin-bottom: 6px;">🔍 METODOLOGIA APLICADA</h4>
                  <p style="font-size: 10px; line-height: 1.3;">Revisão documental, entrevistas com responsáveis, testes de efetividade, análise de indicadores e verificação de evidências de implementação.</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #7c3aed; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📊 RESULTADO GERAL</h4>
                  <p style="font-size: 10px; line-height: 1.3;"><strong>Implementação:</strong> ${implementationScore}%<br>
                  <strong>Status:</strong> ${statusSeguimento}<br>
                  <strong>Efetividade:</strong> ${efetividadeAcoes}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 2. STATUS DE IMPLEMENTAÇÃO DAS AÇÕES -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">2</span>
              STATUS DE IMPLEMENTAÇÃO DAS AÇÕES
            </h2>
            
            <div class="status-grid">
              <div class="status-card">
                <h4>✅ Ações Concluídas <span class="implementation-status status-${planosConcluidos > 0 ? 'excelente' : 'critico'}">${planosConcluidos}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Planos de ação totalmente implementados e com efetividade comprovada.</p>
                <div class="progress-bar">
                  <div class="progress-fill progress-${planosConcluidos > 0 ? '100' : '0'}"></div>
                </div>
                <p style="font-size: 10px; color: #6b7280; margin-top: 4px;">Percentual: ${planosAcao > 0 ? Math.round((planosConcluidos / planosAcao) * 100) : 0}%</p>
              </div>
              
              <div class="status-card">
                <h4>🔄 Ações em Andamento <span class="implementation-status status-${planosEmAndamento > 0 ? 'em-progresso' : 'critico'}">${planosEmAndamento}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Planos de ação em processo de implementação com progresso parcial.</p>
                <div class="progress-bar">
                  <div class="progress-fill progress-${planosEmAndamento > 0 ? '50' : '0'}"></div>
                </div>
                <p style="font-size: 10px; color: #6b7280; margin-top: 4px;">Percentual: ${planosAcao > 0 ? Math.round((planosEmAndamento / planosAcao) * 100) : 0}%</p>
              </div>
              
              <div class="status-card">
                <h4>⏳ Ações Pendentes <span class="implementation-status status-${planosPendentes === 0 ? 'excelente' : planosPendentes <= 2 ? 'em-progresso' : 'critico'}">${planosPendentes}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Planos de ação ainda não iniciados ou com implementação não iniciada.</p>
                <div class="progress-bar">
                  <div class="progress-fill progress-${planosPendentes === 0 ? '100' : planosPendentes <= 2 ? '25' : '0'}"></div>
                </div>
                <p style="font-size: 10px; color: #6b7280; margin-top: 4px;">Percentual: ${planosAcao > 0 ? Math.round((planosPendentes / planosAcao) * 100) : 0}%</p>
              </div>
              

            </div>
          </div>
          
          <!-- 3. MATRIZ DE PROGRESSO DAS AÇÕES -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">3</span>
              MATRIZ DE PROGRESSO DAS AÇÕES
            </h2>
            
            <table class="progress-matrix">
              <thead>
                <tr>
                  <th style="width: 30%;">Plano de Ação</th>
                  <th style="width: 15%;">Responsável</th>
                  <th style="width: 15%;">Prazo</th>
                  <th style="width: 15%;">Status</th>
                  <th style="width: 15%;">Progresso</th>
                  <th style="width: 10%;">Efetividade</th>
                </tr>
              </thead>
              <tbody>
                ${projetoDetalhado?.planos_acao?.map((plano, index) => `
                  <tr>
                    <td>
                      <strong style="font-size: 11px;">${plano.titulo || 'Plano de Ação ' + (index + 1)}</strong>
                      <br><small style="color: #6b7280; font-size: 9px;">${plano.descricao ? plano.descricao.substring(0, 60) + '...' : 'Implementar ações corretivas conforme recomendações'}</small>
                    </td>
                    <td style="font-size: 10px;">${plano.responsavel || 'A definir'}</td>
                    <td style="font-size: 10px;">${plano.prazo ? new Date(plano.prazo).toLocaleDateString('pt-BR') : 'A definir'}</td>
                    <td>
                      <span class="timeline-status status-${plano.status === 'concluido' ? 'concluido' : plano.status === 'em_andamento' ? 'em-andamento' : 'pendente'}">
                        ${plano.status === 'concluido' ? 'CONCLUÍDO' : plano.status === 'em_andamento' ? 'EM ANDAMENTO' : 'PENDENTE'}
                      </span>
                    </td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill progress-${plano.status === 'concluido' ? '100' : plano.status === 'em_andamento' ? '50' : '0'}"></div>
                      </div>
                      <small style="font-size: 9px; color: #6b7280;">${plano.percentual_conclusao || (plano.status === 'concluido' ? 100 : plano.status === 'em_andamento' ? 50 : 0)}%</small>
                    </td>
                    <td style="text-align: center;">
                      ${plano.status === 'concluido' ? '✅' : plano.status === 'em_andamento' ? '🔄' : '⏳'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- 4. ACOMPANHAMENTO DETALHADO DAS AÇÕES -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">4</span>
              ACOMPANHAMENTO DETALHADO DAS AÇÕES
            </h2>
            
            <p style="font-size: 11px; color: #6b7280; margin-bottom: 15px;">
              Detalhamento do progresso de cada ação corretiva com evidências de implementação e avaliação de efetividade.
            </p>
            
            ${projetoDetalhado?.planos_acao?.map((plano, index) => `
              <div class="action-item">
                <div class="action-header">
                  <h4 style="display: flex; align-items: center;">
                    <span class="action-number">${index + 1}</span>
                    ${plano.titulo || 'Plano de Ação ' + (index + 1)}
                  </h4>
                  <span class="timeline-status status-${plano.status === 'concluido' ? 'concluido' : plano.status === 'em_andamento' ? 'em-andamento' : 'pendente'}">
                    ${plano.status === 'concluido' ? '✅ CONCLUÍDO' : plano.status === 'em_andamento' ? '🔄 EM ANDAMENTO' : '⏳ PENDENTE'}
                  </span>
                </div>
                
                <div class="action-details">
                  <div class="detail-field">
                    <label>Objetivo da Ação</label>
                    <span>${plano.objetivo || 'Implementar controles corretivos'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Responsável</label>
                    <span>${plano.responsavel || 'A definir'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Prazo Estabelecido</label>
                    <span>${plano.prazo ? new Date(plano.prazo).toLocaleDateString('pt-BR') : 'A definir'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Prioridade</label>
                    <span>${(plano.prioridade || 'media').toUpperCase()}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>% Conclusão</label>
                    <span>${plano.percentual_conclusao || (plano.status === 'concluido' ? 100 : plano.status === 'em_andamento' ? 50 : 0)}%</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Custo Estimado</label>
                    <span>${plano.custo ? 'R$ ' + plano.custo.toLocaleString('pt-BR') : 'N/A'}</span>
                  </div>
                </div>
                
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border-left: 3px solid #7c3aed; margin-top: 10px;">
                  <h5 style="color: #7c3aed; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📊 PROGRESSO E EVIDÊNCIAS</h5>
                  <p style="font-size: 10px; line-height: 1.4; margin: 4px 0;">${plano.progresso || 'Ação em acompanhamento conforme cronograma estabelecido. Evidências de implementação sendo coletadas e documentadas adequadamente.'}</p>
                  
                  ${plano.status === 'concluido' ? `
                    <div style="background: #dcfce7; color: #166534; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 10px; font-weight: 500;">
                      ✅ <strong>Implementação Concluída:</strong> Ação totalmente implementada com efetividade comprovada e controles operando adequadamente.
                    </div>
                  ` : plano.status === 'em_andamento' ? `
                    <div style="background: #dbeafe; color: #1e40af; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 10px; font-weight: 500;">
                      🔄 <strong>Em Implementação:</strong> Ação em progresso conforme cronograma. Acompanhamento contínuo sendo realizado.
                    </div>
                  ` : `
                    <div style="background: #fef3c7; color: #92400e; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 10px; font-weight: 500;">
                      ⏳ <strong>Aguardando Início:</strong> Ação ainda não iniciada. Necessário acompanhamento para início da implementação.
                    </div>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 5. CRONOGRAMA E MARCOS DE IMPLEMENTAÇÃO -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">5</span>
              CRONOGRAMA E MARCOS DE IMPLEMENTAÇÃO
            </h2>
            
            ${projetoDetalhado?.planos_acao?.map((plano, index) => `
              <div class="timeline-item">
                <div class="timeline-header">
                  <h4 style="display: flex; align-items: center;">
                    <span class="timeline-number">${index + 1}</span>
                    ${plano.titulo || 'Marco de Implementação ' + (index + 1)}
                  </h4>
                  <span class="timeline-status status-${plano.status === 'concluido' ? 'concluido' : plano.status === 'em_andamento' ? 'em-andamento' : 'pendente'}">
                    ${plano.status === 'concluido' ? 'CONCLUÍDO' : plano.status === 'em_andamento' ? 'EM ANDAMENTO' : 'PENDENTE'}
                  </span>
                </div>
                
                <div class="timeline-content">
                  <div class="milestone-section">
                    <h5>
                      <span class="milestone-icon">📅</span>
                      CRONOGRAMA PLANEJADO
                    </h5>
                    <p><strong>Início:</strong> ${plano.data_inicio ? new Date(plano.data_inicio).toLocaleDateString('pt-BR') : 'A definir'}</p>
                    <p><strong>Prazo:</strong> ${plano.prazo ? new Date(plano.prazo).toLocaleDateString('pt-BR') : 'A definir'}</p>
                    <p><strong>Duração Estimada:</strong> ${plano.duracao || '30-60 dias'}</p>
                  </div>
                  
                  <div class="milestone-section">
                    <h5>
                      <span class="milestone-icon">🎯</span>
                      MARCOS DE ENTREGA
                    </h5>
                    <p>${plano.marcos || 'Definição de controles, implementação de procedimentos, testes de efetividade, documentação de evidências e validação final.'}</p>
                  </div>
                  
                  <div class="milestone-section">
                    <h5>
                      <span class="milestone-icon">📊</span>
                      INDICADORES DE PROGRESSO
                    </h5>
                    <p>${plano.indicadores || 'Percentual de implementação, número de controles implementados, evidências coletadas, testes realizados e aprovação dos responsáveis.'}</p>
                  </div>
                  
                  <div class="milestone-section" style="border-left-color: #059669; background: #f0fdf4;">
                    <h5 style="color: #059669;">
                      <span class="milestone-icon" style="background: #059669;">✓</span>
                      STATUS ATUAL
                    </h5>
                    <p style="color: #065f46;">${plano.status_detalhado || 'Ação em acompanhamento conforme cronograma estabelecido. Progresso sendo monitorado continuamente com evidências de implementação documentadas.'}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 6. ANÁLISE DE EFETIVIDADE DAS AÇÕES -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">6</span>
              ANÁLISE DE EFETIVIDADE DAS AÇÕES
            </h2>
            
            <div class="effectiveness-analysis">
              <h3 style="color: #059669; margin-bottom: 15px; font-size: 14px; font-weight: 600;">📊 Avaliação da Efetividade das Medidas Implementadas</h3>
              
              <div class="effectiveness-grid">
                <div class="effectiveness-component">
                  <h4>🎯 Efetividade Operacional</h4>
                  <p>Avaliação do impacto das ações na melhoria dos processos e controles operacionais.</p>
                  <div class="effectiveness-score">
                    <span class="score-indicator score-${planosConcluidos > 0 ? 'efetiva' : planosEmAndamento > 0 ? 'parcial' : 'insuficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${planosConcluidos > 0 ? 'EFETIVA' : planosEmAndamento > 0 ? 'PARCIAL' : 'INSUFICIENTE'}</span>
                  </div>
                </div>
                
                <div class="effectiveness-component">
                  <h4>🔒 Mitigação de Riscos</h4>
                  <p>Análise da redução dos riscos identificados através das ações implementadas.</p>
                  <div class="effectiveness-score">
                    <span class="score-indicator score-${apontamentosCriticos === 0 ? 'efetiva' : apontamentosCriticos <= 1 ? 'parcial' : 'insuficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${apontamentosCriticos === 0 ? 'EFETIVA' : apontamentosCriticos <= 1 ? 'PARCIAL' : 'INSUFICIENTE'}</span>
                  </div>
                </div>
                

                
                <div class="effectiveness-component">
                  <h4>⚡ Tempestividade</h4>
                  <p>Avaliação do cumprimento de prazos e cronogramas estabelecidos.</p>
                  <div class="effectiveness-score">
                    <span class="score-indicator score-${planosConcluidos === planosAcao ? 'efetiva' : planosConcluidos > 0 ? 'parcial' : 'insuficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${planosConcluidos === planosAcao ? 'EFETIVA' : planosConcluidos > 0 ? 'PARCIAL' : 'INSUFICIENTE'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 7. RECOMENDAÇÕES PARA PRÓXIMOS CICLOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">7</span>
              RECOMENDAÇÕES PARA PRÓXIMOS CICLOS
            </h2>
            
            <div class="recommendations">
              <h3 style="color: #7c3aed; margin-bottom: 15px; font-size: 14px; font-weight: 600;">🎯 Plano de Ação para Continuidade</h3>
              
              ${planosPendentes > 0 ? `
              <div class="recommendation-item">
                <div class="recommendation-priority">1</div>
                <div>
                  <strong style="font-size: 12px;">Priorização de Ações Pendentes</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Acelerar a implementação das ${planosPendentes} ações pendentes, estabelecendo cronograma específico e alocação de recursos adequados. 
                  <strong>Prazo:</strong> 30 dias. <strong>Responsabilidade:</strong> Gestores de Área.</p>
                </div>
              </div>
              ` : ''}
              
              ${planosEmAndamento > 0 ? `
              <div class="recommendation-item">
                <div class="recommendation-priority">2</div>
                <div>
                  <strong style="font-size: 12px;">Acompanhamento Intensivo</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Intensificar o monitoramento das ${planosEmAndamento} ações em andamento para assegurar conclusão dentro dos prazos estabelecidos. 
                  <strong>Frequência:</strong> Quinzenal. <strong>Responsabilidade:</strong> Auditoria Interna.</p>
                </div>
              </div>
              ` : ''}
              
              <div class="recommendation-item">
                <div class="recommendation-priority">3</div>
                <div>
                  <strong style="font-size: 12px;">Monitoramento Contínuo</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Estabelecer programa de monitoramento contínuo das ações implementadas para assegurar sustentabilidade e efetividade a longo prazo. 
                  Implementar indicadores de performance e métricas de acompanhamento.</p>
                </div>
              </div>
              
              <div class="recommendation-item">
                <div class="recommendation-priority">4</div>
                <div>
                  <strong style="font-size: 12px;">Capacitação e Conscientização</strong>
                  <p style="font-size: 11px; margin: 6px 0 0 0; line-height: 1.4;">Desenvolver programa de capacitação para equipes sobre a importância da implementação tempestiva de ações corretivas 
                  e manutenção de controles internos efetivos.</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 8. CONCLUSÕES E PRÓXIMOS PASSOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">8</span>
              CONCLUSÕES E PRÓXIMOS PASSOS
            </h2>
            
            <div class="followup-conclusions">
              <h3 style="color: #7c3aed; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Avaliação Geral do Seguimento</h3>
              <p style="font-size: 11px; margin-bottom: 12px; line-height: 1.4;">
                Com base no acompanhamento realizado, análises de progresso e verificação de evidências de implementação, 
                apresentamos as seguintes conclusões sobre o status das ações corretivas:
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin: 12px 0;">
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${implementationScore >= 80 ? '#059669' : implementationScore >= 50 ? '#f59e0b' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>Implementação Geral:</strong> ${implementationScore >= 80 ? 'Progresso excelente na implementação das ações corretivas, demonstrando comprometimento organizacional com a melhoria contínua.' : implementationScore >= 50 ? 'Progresso satisfatório, mas necessitando aceleração para atingir as metas estabelecidas.' : 'Progresso insuficiente, requerendo ação imediata para evitar exposição continuada aos riscos identificados.'}</p>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${planosConcluidos > 0 ? '#059669' : planosEmAndamento > 0 ? '#f59e0b' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>Efetividade das Ações:</strong> ${planosConcluidos > 0 ? 'Ações implementadas demonstram efetividade na mitigação dos riscos e melhoria dos controles internos.' : planosEmAndamento > 0 ? 'Ações em andamento mostram potencial de efetividade, necessitando conclusão para validação completa.' : 'Efetividade ainda não pode ser avaliada devido ao baixo nível de implementação das ações.'}</p>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${planosPendentes === 0 ? '#059669' : planosPendentes <= 2 ? '#f59e0b' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>Gestão de Prazos:</strong> ${planosPendentes === 0 ? 'Excelente gestão de cronograma com todas as ações iniciadas conforme planejado.' : planosPendentes <= 2 ? 'Gestão adequada de prazos com algumas ações necessitando priorização.' : 'Gestão de prazos necessita melhoria para evitar atrasos na implementação das ações corretivas.'}</p>
                </div>
              </div>
              
              <div style="margin-top: 20px;">
                <h3 style="color: #7c3aed; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Opinião sobre o Seguimento</h3>
                <div class="opinion-box ${statusSeguimento === 'EXCELENTE' ? 'opinion-excelente' : statusSeguimento === 'SATISFATÓRIO' ? 'opinion-satisfatorio' : statusSeguimento === 'EM PROGRESSO' ? 'opinion-em-progresso' : 'opinion-critico'}">
                  <p style="font-size: 11px; margin: 6px 0; font-weight: 600;">
                    ${statusSeguimento === 'EXCELENTE' ? '✅ SEGUIMENTO EXCELENTE' : statusSeguimento === 'SATISFATÓRIO' ? '👍 SEGUIMENTO SATISFATÓRIO' : statusSeguimento === 'EM PROGRESSO' ? '🔄 SEGUIMENTO EM PROGRESSO' : '⚠️ SEGUIMENTO CRÍTICO'}
                  </p>
                  <p style="font-size: 11px; line-height: 1.4; margin: 6px 0;">
                    ${statusSeguimento === 'EXCELENTE' ? 
                      'O acompanhamento das ações corretivas demonstra excelente progresso na implementação, com evidências claras de efetividade e comprometimento organizacional. As medidas adotadas estão adequadamente mitigando os riscos identificados e fortalecendo o ambiente de controle.' :
                      statusSeguimento === 'SATISFATÓRIO' ? 
                      'O progresso na implementação das ações é satisfatório, com a maioria das medidas em andamento adequado. Recomenda-se manter o ritmo atual e intensificar o acompanhamento das ações pendentes para assegurar conclusão dentro dos prazos estabelecidos.' :
                      statusSeguimento === 'EM PROGRESSO' ?
                      'O seguimento indica progresso parcial na implementação das ações corretivas. É necessário acelerar a execução das medidas pendentes e intensificar o monitoramento para assegurar que os riscos sejam adequadamente mitigados dentro dos prazos estabelecidos.' :
                      'O seguimento revela progresso insuficiente na implementação das ações corretivas, mantendo a organização exposta aos riscos identificados. É necessária ação imediata da administração para priorizar e acelerar a implementação das medidas corretivas.'
                    }
                  </p>
                  
                  <p style="font-size: 10px; margin: 10px 0 0 0; font-style: italic;">
                    Esta avaliação é baseada no acompanhamento sistemático das ações corretivas, 
                    verificação de evidências de implementação e análise de efetividade das medidas adotadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 9. CRONOGRAMA DE PRÓXIMOS SEGUIMENTOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">9</span>
              CRONOGRAMA DE PRÓXIMOS SEGUIMENTOS
            </h2>
            
            <div class="references">
              <h4>📅 Agenda de Acompanhamento</h4>
              <ul>
                <li><strong>Próximo Seguimento:</strong> ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('pt-BR')} (30 dias)</li>
                <li><strong>Seguimento Intermediário:</strong> ${new Date(Date.now() + 60*24*60*60*1000).toLocaleDateString('pt-BR')} (60 dias)</li>
                <li><strong>Seguimento Trimestral:</strong> ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('pt-BR')} (90 dias)</li>
                <li><strong>Revisão Anual:</strong> ${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('pt-BR')} (12 meses)</li>
              </ul>
            </div>
            
            <div class="references">
              <h4>📋 Documentação de Seguimento</h4>
              <ul>
                <li>SEG-${projeto.codigo}-01 a SEG-${projeto.codigo}-${String(planosAcao).padStart(2, '0')} - Evidências de Implementação</li>
                <li>SEG-${projeto.codigo}-PROG - Relatórios de Progresso</li>
                <li>SEG-${projeto.codigo}-EFET - Testes de Efetividade</li>
                <li>SEG-${projeto.codigo}-CRON - Controle de Cronograma</li>
                <li>SEG-${projeto.codigo}-CONC - Memorando de Conclusões</li>
              </ul>
            </div>
            
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin: 12px 0;">
              <h4 style="color: #7c3aed; font-size: 11px; font-weight: 600; margin-bottom: 8px;">📊 Indicadores de Acompanhamento</h4>
              <p style="font-size: 10px; line-height: 1.3;">
                O acompanhamento contínuo será realizado através de indicadores de implementação, 
                testes de efetividade, verificação de evidências e análise de sustentabilidade das melhorias implementadas.
              </p>
            </div>
          </div>
        </div>
        
        <!-- RODAPÉ DE SEGUIMENTO PROFISSIONAL -->
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-section">
              <h4>📈 Equipe de Seguimento</h4>
              <p>Responsável: ${projeto.auditor_lider || projeto.chefe_auditoria}</p>
              <p>Data do Seguimento: ${dataFormatada}</p>
              <p>Próximo Acompanhamento: 30 dias</p>
            </div>
            <div class="footer-section">
              <h4>📋 Classificação</h4>
              <p>Documento: Seguimento</p>
              <p>Distribuição: Gestores Responsáveis</p>
              <p>Confidencialidade: Restrita</p>
            </div>
            <div class="footer-section">
              <h4>📊 Indicadores de Controle</h4>
              <p>Nível de Risco: ${nivelRisco}</p>
              <p>Efetividade: ${efetividadeAcoes}</p>
              <p>Prazo Médio: ${prazoMedioImplementacao}d</p>
            </div>
            <div class="footer-section">
              <h4>🎯 Próximas Etapas</h4>
              <p>Acompanhamento: Contínuo</p>
              <p>Revisão: Mensal</p>
              <p>Validação: Trimestral</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #d1d5db; padding-top: 12px; margin-top: 12px;">
            <p style="font-size: 10px;"><strong>🏢 Sistema GRC - Governance, Risk & Compliance</strong></p>
            <p style="font-size: 9px;">Relatório de seguimento e monitoramento gerado automaticamente em ${timestamp}</p>
            <p style="font-size: 8px; margin-top: 6px; line-height: 1.3;">
              Este documento contém acompanhamento sistemático das ações corretivas e avaliação de efetividade das medidas implementadas. 
              O monitoramento contínuo assegura a mitigação adequada dos riscos identificados e fortalecimento dos controles internos.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateFollowUpReportHTML;