import React from 'react';

// Gerador específico para Relatório Técnico de Auditoria - Melhores Práticas
export const generateTechnicalReportHTML = (projeto: any, projetoDetalhado: any) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Análise dos dados específicos para relatório técnico
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
  
  // Cálculo do score de compliance técnico
  const complianceScore = totalApontamentos > 0 ? 
    Math.max(0, 100 - (apontamentosCriticos * 25 + apontamentosAltos * 15 + apontamentosMedios * 8 + apontamentosBaixos * 3)) : 95;
  
  // Análise de risco técnico
  const nivelRisco = apontamentosCriticos > 0 ? 'ALTO' : 
                    apontamentosAltos > 2 ? 'MÉDIO-ALTO' : 
                    apontamentosAltos > 0 ? 'MÉDIO' : 'BAIXO';
  
  // Classificação SOX/COSO de deficiências
  const materialWeakness = apontamentosCriticos;
  const significantDeficiency = apontamentosAltos;
  const controlDeficiency = apontamentosMedios + apontamentosBaixos;
  
  // Avaliação COSO por componente
  const cosoAmbienteControle = complianceScore >= 80 ? 'EFETIVO' : complianceScore >= 60 ? 'PARCIAL' : 'DEFICIENTE';
  const cosoAvaliacaoRiscos = apontamentosCriticos === 0 ? 'EFETIVO' : apontamentosCriticos <= 2 ? 'PARCIAL' : 'DEFICIENTE';
  const cosoAtividadesControle = trabalhosConcluidos === totalTrabalhos ? 'EFETIVO' : trabalhosConcluidos >= totalTrabalhos * 0.7 ? 'PARCIAL' : 'DEFICIENTE';
  const cosoInformacaoComunicacao = totalApontamentos <= 2 ? 'EFETIVO' : totalApontamentos <= 5 ? 'PARCIAL' : 'DEFICIENTE';
  const cosoMonitoramento = planosConcluidos > 0 ? 'EFETIVO' : planosAcao > 0 ? 'PARCIAL' : 'DEFICIENTE';
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <title>RELATÓRIO TÉCNICO DE AUDITORIA INTERNA - ${projeto.titulo}</title>
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
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
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
        
        .technical-badge {
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
          color: #0f172a;
          margin-bottom: 15px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .section-number {
          background: #0f172a;
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
        
        .technical-summary {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e1;
          border-left: 4px solid #0f172a;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .objectives-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
          margin: 15px 0;
        }
        
        .objective-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .objective-card h4 {
          color: #0f172a;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .objective-status {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          float: right;
        }
        
        .status-atendido { background: #dcfce7; color: #166534; }
        .status-parcial { background: #fef3c7; color: #92400e; }
        .status-nao-atendido { background: #fee2e2; color: #991b1b; }
        
        .risk-matrix {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .risk-matrix th {
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
        
        .risk-matrix td {
          padding: 10px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
          font-size: 11px;
        }
        
        .risk-matrix tr:hover {
          background: #f9fafb;
        }
        
        .risk-level {
          padding: 3px 6px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .risk-alto { background: #fee2e2; color: #991b1b; }
        .risk-medio { background: #fef3c7; color: #92400e; }
        .risk-baixo { background: #dcfce7; color: #166534; }
        
        .procedure-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 12px 0;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .procedure-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .procedure-number {
          background: #0f172a;
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
        
        .status-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-concluido { background: #dcfce7; color: #166534; }
        .status-em_andamento { background: #fef3c7; color: #92400e; }
        .status-pendente { background: #fee2e2; color: #991b1b; }
        
        .procedure-details {
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
        
        .finding-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin: 15px 0;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .finding-header {
          background: #f8fafc;
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .finding-number {
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
        
        .sox-classification {
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .material-weakness { background: #fee2e2; color: #991b1b; }
        .significant-deficiency { background: #fef3c7; color: #92400e; }
        .control-deficiency { background: #f0f9ff; color: #1e40af; }
        
        .finding-content {
          padding: 15px;
        }
        
        .ccce-section {
          margin: 12px 0;
          padding: 12px;
          background: #f8fafc;
          border-radius: 4px;
          border-left: 3px solid #64748b;
        }
        
        .ccce-section h5 {
          color: #0f172a;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .ccce-icon {
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
        
        .ccce-section p {
          font-size: 10px;
          line-height: 1.4;
          color: #475569;
          margin: 4px 0;
        }
        
        .coso-framework {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #a7f3d0;
          border-left: 4px solid #059669;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .coso-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-top: 15px;
        }
        
        .coso-component {
          background: white;
          border: 1px solid #d1fae5;
          border-radius: 4px;
          padding: 12px;
        }
        
        .coso-component h4 {
          color: #059669;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .coso-component p {
          font-size: 10px;
          line-height: 1.3;
          color: #065f46;
          margin-bottom: 8px;
        }
        
        .coso-score {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .score-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .score-efetivo { background: #059669; }
        .score-parcial { background: #d97706; }
        .score-deficiente { background: #dc2626; }
        
        .materiality-matrix {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          margin: 15px 0;
        }
        
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
        
        .priority-alta { background: #fee2e2; color: #991b1b; }
        .priority-media { background: #fef3c7; color: #92400e; }
        .priority-baixa { background: #dcfce7; color: #166534; }
        
        .technical-conclusions {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 1px solid #cbd5e1;
          border-left: 4px solid #0f172a;
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
        
        .opinion-positive {
          background: #f0fdf4;
          border-left-color: #059669;
          color: #166534;
        }
        
        .opinion-qualified {
          background: #fffbeb;
          border-left-color: #d97706;
          color: #92400e;
        }
        
        .opinion-adverse {
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
          color: #0f172a;
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
          color: #0f172a;
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
        <!-- CABEÇALHO TÉCNICO PROFISSIONAL -->
        <div class="header-page">
          <h1 class="main-title">RELATÓRIO TÉCNICO DE AUDITORIA INTERNA</h1>
          <h2 class="project-title">${projeto.titulo}</h2>
          <div class="technical-badge">🔧 CONFORME PADRÕES IIA/COSO/SOX</div>
          
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
              <div class="info-label">Horas de Auditoria</div>
              <div class="info-value">${totalHorasAuditoria}h</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nível de Risco</div>
              <div class="info-value">${nivelRisco}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Score COSO</div>
              <div class="info-value">${complianceScore}%</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data do Relatório</div>
              <div class="info-value">${dataFormatada}</div>
            </div>
          </div>
        </div>
        
        <!-- CONTEÚDO TÉCNICO PROFISSIONAL -->
        <div class="content">
          <!-- 1. SUMÁRIO EXECUTIVO TÉCNICO -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">1</span>
              SUMÁRIO EXECUTIVO TÉCNICO
            </h2>
            
            <div class="technical-summary">
              <p style="font-size: 12px; margin-bottom: 12px; font-weight: 500; line-height: 1.4;">
                <strong>Objetivo da Auditoria:</strong> Avaliar a adequação e efetividade dos controles internos implementados em "${projeto.titulo}", 
                conforme metodologia baseada no framework COSO e padrões do Institute of Internal Auditors (IIA).
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin: 12px 0;">
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #0f172a; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📋 ESCOPO DE AUDITORIA</h4>
                  <p style="font-size: 10px; line-height: 1.3;">${projeto.escopo || 'Avaliação abrangente dos controles internos, incluindo ambiente de controle, avaliação de riscos, atividades de controle, informação e comunicação, e monitoramento.'}</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #0f172a; font-size: 11px; font-weight: 600; margin-bottom: 6px;">🔬 METODOLOGIA APLICADA</h4>
                  <p style="font-size: 10px; line-height: 1.3;">Testes de controles baseados em riscos, análise documental, entrevistas estruturadas, observação direta e análise de sistemas conforme padrões IIA.</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px;">
                  <h4 style="color: #0f172a; font-size: 11px; font-weight: 600; margin-bottom: 6px;">📅 PERÍODO DE EXECUÇÃO</h4>
                  <p style="font-size: 10px; line-height: 1.3;"><strong>Início:</strong> ${new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}<br>
                  <strong>Conclusão:</strong> ${new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}<br>
                  <strong>Duração:</strong> ${Math.ceil((new Date(projeto.data_fim_prevista) - new Date(projeto.data_inicio)) / (1000 * 60 * 60 * 24))} dias úteis</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 2. OBJETIVOS E ESCOPO DE AUDITORIA -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">2</span>
              OBJETIVOS E ESCOPO DE AUDITORIA
            </h2>
            
            <div class="objectives-grid">
              <div class="objective-card">
                <h4>Objetivo 1: Ambiente de Controle <span class="objective-status status-${cosoAmbienteControle === 'EFETIVO' ? 'atendido' : cosoAmbienteControle === 'PARCIAL' ? 'parcial' : 'nao-atendido'}">${cosoAmbienteControle}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Avaliar a estrutura organizacional, políticas de integridade e competência profissional.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Critério:</strong> COSO 2013 - Componente 1</p>
              </div>
              
              <div class="objective-card">
                <h4>Objetivo 2: Avaliação de Riscos <span class="objective-status status-${cosoAvaliacaoRiscos === 'EFETIVO' ? 'atendido' : cosoAvaliacaoRiscos === 'PARCIAL' ? 'parcial' : 'nao-atendido'}">${cosoAvaliacaoRiscos}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Verificar a identificação, análise e resposta aos riscos organizacionais.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Critério:</strong> COSO 2013 - Componente 2</p>
              </div>
              
              <div class="objective-card">
                <h4>Objetivo 3: Atividades de Controle <span class="objective-status status-${cosoAtividadesControle === 'EFETIVO' ? 'atendido' : cosoAtividadesControle === 'PARCIAL' ? 'parcial' : 'nao-atendido'}">${cosoAtividadesControle}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Testar a efetividade das políticas e procedimentos de controle.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Critério:</strong> COSO 2013 - Componente 3</p>
              </div>
              
              <div class="objective-card">
                <h4>Objetivo 4: Informação e Comunicação <span class="objective-status status-${cosoInformacaoComunicacao === 'EFETIVO' ? 'atendido' : cosoInformacaoComunicacao === 'PARCIAL' ? 'parcial' : 'nao-atendido'}">${cosoInformacaoComunicacao}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Avaliar a qualidade das informações e efetividade da comunicação.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Critério:</strong> COSO 2013 - Componente 4</p>
              </div>
              
              <div class="objective-card">
                <h4>Objetivo 5: Monitoramento <span class="objective-status status-${cosoMonitoramento === 'EFETIVO' ? 'atendido' : cosoMonitoramento === 'PARCIAL' ? 'parcial' : 'nao-atendido'}">${cosoMonitoramento}</span></h4>
                <p style="font-size: 11px; margin: 6px 0;">Verificar as atividades de monitoramento contínuo e avaliações independentes.</p>
                <p style="font-size: 10px; color: #6b7280;"><strong>Critério:</strong> COSO 2013 - Componente 5</p>
              </div>
            </div>
          </div>
          
          <!-- 3. MATRIZ DE RISCOS E CONTROLES -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">3</span>
              MATRIZ DE RISCOS E CONTROLES
            </h2>
            
            <table class="risk-matrix">
              <thead>
                <tr>
                  <th style="width: 25%;">Processo/Área</th>
                  <th style="width: 20%;">Risco Identificado</th>
                  <th style="width: 15%;">Probabilidade</th>
                  <th style="width: 15%;">Impacto</th>
                  <th style="width: 15%;">Nível de Risco</th>
                  <th style="width: 10%;">Controle</th>
                </tr>
              </thead>
              <tbody>
                ${projetoDetalhado?.apontamentos_auditoria?.map((apontamento, index) => `
                  <tr>
                    <td style="font-weight: 500;">${apontamento.categoria || 'Processo Geral'}</td>
                    <td>${apontamento.titulo || 'Risco ' + (index + 1)}</td>
                    <td>Alta</td>
                    <td>${apontamento.criticidade === 'critica' ? 'Alto' : apontamento.criticidade === 'alta' ? 'Médio' : 'Baixo'}</td>
                    <td><span class="risk-level risk-${apontamento.criticidade === 'critica' ? 'alto' : apontamento.criticidade === 'alta' ? 'medio' : 'baixo'}">${apontamento.criticidade === 'critica' ? 'ALTO' : apontamento.criticidade === 'alta' ? 'MÉDIO' : 'BAIXO'}</span></td>
                    <td>${apontamento.criticidade === 'critica' ? 'Deficiente' : apontamento.criticidade === 'alta' ? 'Parcial' : 'Adequado'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- 4. PROCEDIMENTOS DE AUDITORIA EXECUTADOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">4</span>
              PROCEDIMENTOS DE AUDITORIA EXECUTADOS
            </h2>
            
            <p style="font-size: 11px; color: #6b7280; margin-bottom: 15px;">
              Procedimentos executados conforme metodologia baseada em riscos e padrões do Institute of Internal Auditors (IIA).
            </p>
            
            ${projetoDetalhado?.trabalhos_auditoria?.map((trabalho, index) => `
              <div class="procedure-item">
                <div class="procedure-header">
                  <h4 style="display: flex; align-items: center;">
                    <span class="procedure-number">${index + 1}</span>
                    ${trabalho.titulo || 'Procedimento de Auditoria ' + (index + 1)}
                  </h4>
                  <span class="status-badge status-${trabalho.status || 'pendente'}">
                    ${trabalho.status === 'concluido' ? '✅ CONCLUÍDO' : trabalho.status === 'em_andamento' ? '🔄 EM ANDAMENTO' : '⏳ PENDENTE'}
                  </span>
                </div>
                
                <div class="procedure-details">
                  <div class="detail-field">
                    <label>Objetivo do Teste</label>
                    <span>${trabalho.objetivo || 'Verificar a adequação e efetividade dos controles implementados'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Metodologia Aplicada</label>
                    <span>Testes substantivos, análise documental, entrevistas</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Tamanho da Amostra</label>
                    <span>${trabalho.amostra || 'Conforme materialidade'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Horas Trabalhadas</label>
                    <span>${trabalho.horas_trabalhadas || 0}h</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Responsável Técnico</label>
                    <span>${trabalho.responsavel || projeto.auditor_lider || 'Equipe de Auditoria'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Referência (Papel de Trabalho)</label>
                    <span>PT-${projeto.codigo}-${String(index + 1).padStart(2, '0')}</span>
                  </div>
                </div>
                
                <div style="background: #f8fafc; padding: 12px; border-radius: 4px; border-left: 3px solid #3b82f6; margin-top: 10px;">
                  <h5 style="color: #0f172a; font-size: 11px; font-weight: 600; margin-bottom: 6px;">🎯 RESULTADOS E EVIDÊNCIAS</h5>
                  <p style="font-size: 10px; line-height: 1.4; margin: 4px 0;">${trabalho.resultados || 'Procedimento executado conforme planejado. Evidências coletadas e documentadas adequadamente conforme padrões de auditoria.'}</p>
                  
                  ${trabalho.status === 'concluido' ? `
                    <div style="background: #dcfce7; color: #166534; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 10px; font-weight: 500;">
                      ✅ <strong>Conclusão:</strong> Procedimento concluído com sucesso. Objetivos de auditoria atingidos e evidências suficientes obtidas.
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 5. DEFICIÊNCIAS IDENTIFICADAS (SOX/COSO) -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">5</span>
              DEFICIÊNCIAS IDENTIFICADAS (CLASSIFICAÇÃO SOX/COSO)
            </h2>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <h4 style="color: #0f172a; font-size: 12px; font-weight: 600; margin-bottom: 10px;">📊 RESUMO DAS DEFICIÊNCIAS</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                <div style="text-align: center; padding: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #dc2626;">${materialWeakness}</div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #6b7280;">Material Weakness</div>
                </div>
                <div style="text-align: center; padding: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #ea580c;">${significantDeficiency}</div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #6b7280;">Significant Deficiency</div>
                </div>
                <div style="text-align: center; padding: 8px;">
                  <div style="font-size: 18px; font-weight: 700; color: #1e40af;">${controlDeficiency}</div>
                  <div style="font-size: 9px; text-transform: uppercase; color: #6b7280;">Control Deficiency</div>
                </div>
              </div>
            </div>
            
            <p style="font-size: 11px; color: #6b7280; margin-bottom: 15px;">
              <strong>Estrutura CCCE:</strong> Condição (o que foi encontrado), Critério (padrão esperado), Causa (por que ocorreu), Efeito (impacto/consequência)
            </p>
            
            ${projetoDetalhado?.apontamentos_auditoria?.map((apontamento, index) => `
              <div class="finding-item">
                <div class="finding-header">
                  <h4 style="display: flex; align-items: center;">
                    <span class="finding-number">${index + 1}</span>
                    ${apontamento.titulo || 'Deficiência Identificada ' + (index + 1)}
                  </h4>
                  <span class="sox-classification ${apontamento.criticidade === 'critica' ? 'material-weakness' : apontamento.criticidade === 'alta' ? 'significant-deficiency' : 'control-deficiency'}">
                    ${apontamento.criticidade === 'critica' ? 'MATERIAL WEAKNESS' : apontamento.criticidade === 'alta' ? 'SIGNIFICANT DEFICIENCY' : 'CONTROL DEFICIENCY'}
                  </span>
                </div>
                
                <div class="finding-content">
                  <div class="ccce-section">
                    <h5>
                      <span class="ccce-icon">C</span>
                      CONDIÇÃO IDENTIFICADA
                    </h5>
                    <p>${apontamento.descricao || 'Deficiência identificada nos controles internos que pode impactar a efetividade dos processos operacionais e a confiabilidade das informações financeiras.'}</p>
                  </div>
                  
                  <div class="ccce-section">
                    <h5>
                      <span class="ccce-icon">C</span>
                      CRITÉRIO DE AVALIAÇÃO
                    </h5>
                    <p>Políticas e procedimentos internos da organização, framework COSO 2013, requisitos SOX (Sarbanes-Oxley), ISO 27001/27002, COBIT 2019 e padrões internacionais do Institute of Internal Auditors (IIA).</p>
                  </div>
                  
                  <div class="ccce-section">
                    <h5>
                      <span class="ccce-icon">C</span>
                      CAUSA RAIZ
                    </h5>
                    <p>${apontamento.causa_raiz || 'Ausência de controles adequados, falhas na execução de procedimentos estabelecidos, deficiências no desenho dos processos, falta de capacitação adequada das equipes responsáveis ou limitações nos sistemas de informação.'}</p>
                  </div>
                  
                  <div class="ccce-section">
                    <h5>
                      <span class="ccce-icon">E</span>
                      EFEITO/IMPACTO
                    </h5>
                    <p>${apontamento.impacto || 'Risco de falhas operacionais, exposição a perdas financeiras, não conformidade com requisitos regulatórios, comprometimento da integridade das informações gerenciais e possível impacto na reputação organizacional.'}</p>
                    ${apontamento.valor_impacto ? `<p style="margin-top: 6px; font-weight: 600;"><strong>💰 Impacto Financeiro Estimado:</strong> R$ ${apontamento.valor_impacto.toLocaleString('pt-BR')}</p>` : ''}
                  </div>
                  
                  <div class="ccce-section" style="border-left-color: #059669; background: #f0fdf4;">
                    <h5 style="color: #059669;">
                      <span class="ccce-icon" style="background: #059669;">R</span>
                      RECOMENDAÇÃO TÉCNICA
                    </h5>
                    <p style="color: #065f46;">${apontamento.recomendacao || 'Implementar controles compensatórios adequados, revisar e atualizar procedimentos operacionais, estabelecer monitoramento contínuo das atividades críticas, promover capacitação das equipes envolvidas e considerar melhorias nos sistemas de informação.'}</p>
                  </div>
                  
                  <div style="background: #f1f5f9; padding: 10px; border-radius: 4px; margin-top: 10px;">
                    <p style="font-size: 10px; color: #475569;"><strong>Referência:</strong> PT-${projeto.codigo}-ACH-${String(index + 1).padStart(2, '0')} | <strong>Evidência:</strong> Documentada conforme padrões IIA</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 6. AVALIAÇÃO DO FRAMEWORK COSO -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">6</span>
              AVALIAÇÃO DO FRAMEWORK COSO 2013
            </h2>
            
            <div class="coso-framework">
              <h3 style="color: #059669; margin-bottom: 15px; font-size: 14px; font-weight: 600;">Avaliação dos 5 Componentes do Framework COSO</h3>
              <p style="font-size: 11px; margin-bottom: 15px; color: #065f46;">Análise baseada nos 17 princípios do COSO 2013 para controles internos efetivos.</p>
              
              <div class="coso-grid">
                <div class="coso-component">
                  <h4>🏛️ Ambiente de Controle</h4>
                  <p>Avaliação da estrutura organizacional, políticas de integridade, competência profissional e filosofia de gestão.</p>
                  <div class="coso-score">
                    <span class="score-indicator score-${cosoAmbienteControle === 'EFETIVO' ? 'efetivo' : cosoAmbienteControle === 'PARCIAL' ? 'parcial' : 'deficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${cosoAmbienteControle}</span>
                  </div>
                  <p style="font-size: 9px; margin-top: 6px; color: #6b7280;">Princípios 1-5 do COSO</p>
                </div>
                
                <div class="coso-component">
                  <h4>🎯 Avaliação de Riscos</h4>
                  <p>Análise da identificação, avaliação e resposta aos riscos que podem impactar o alcance dos objetivos organizacionais.</p>
                  <div class="coso-score">
                    <span class="score-indicator score-${cosoAvaliacaoRiscos === 'EFETIVO' ? 'efetivo' : cosoAvaliacaoRiscos === 'PARCIAL' ? 'parcial' : 'deficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${cosoAvaliacaoRiscos}</span>
                  </div>
                  <p style="font-size: 9px; margin-top: 6px; color: #6b7280;">Princípios 6-9 do COSO</p>
                </div>
                
                <div class="coso-component">
                  <h4>⚙️ Atividades de Controle</h4>
                  <p>Avaliação das políticas e procedimentos que ajudam a assegurar que as diretrizes da administração sejam executadas.</p>
                  <div class="coso-score">
                    <span class="score-indicator score-${cosoAtividadesControle === 'EFETIVO' ? 'efetivo' : cosoAtividadesControle === 'PARCIAL' ? 'parcial' : 'deficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${cosoAtividadesControle}</span>
                  </div>
                  <p style="font-size: 9px; margin-top: 6px; color: #6b7280;">Princípios 10-12 do COSO</p>
                </div>
                
                <div class="coso-component">
                  <h4>📡 Informação e Comunicação</h4>
                  <p>Análise da qualidade das informações e efetividade dos canais de comunicação internos e externos.</p>
                  <div class="coso-score">
                    <span class="score-indicator score-${cosoInformacaoComunicacao === 'EFETIVO' ? 'efetivo' : cosoInformacaoComunicacao === 'PARCIAL' ? 'parcial' : 'deficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${cosoInformacaoComunicacao}</span>
                  </div>
                  <p style="font-size: 9px; margin-top: 6px; color: #6b7280;">Princípios 13-15 do COSO</p>
                </div>
                
                <div class="coso-component">
                  <h4>📊 Monitoramento</h4>
                  <p>Avaliação das atividades de monitoramento contínuo e avaliações independentes da efetividade dos controles.</p>
                  <div class="coso-score">
                    <span class="score-indicator score-${cosoMonitoramento === 'EFETIVO' ? 'efetivo' : cosoMonitoramento === 'PARCIAL' ? 'parcial' : 'deficiente'}"></span>
                    <span style="font-size: 10px; font-weight: 600;">${cosoMonitoramento}</span>
                  </div>
                  <p style="font-size: 9px; margin-top: 6px; color: #6b7280;">Princípios 16-17 do COSO</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 7. MATRIZ DE MATERIALIDADE -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">7</span>
              MATRIZ DE MATERIALIDADE
            </h2>
            
            <div class="materiality-matrix">
              <h4 style="color: #0f172a; font-size: 12px; font-weight: 600; margin-bottom: 10px;">📊 Critérios de Materialidade Aplicados</h4>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <h5 style="color: #dc2626; font-size: 11px; margin-bottom: 6px;">🚨 Material Weakness</h5>
                  <p style="font-size: 10px; line-height: 1.3;">Deficiência que resulta em mais que uma possibilidade remota de que uma distorção material não seja prevenida ou detectada.</p>
                  <p style="font-size: 9px; color: #6b7280; margin-top: 4px;"><strong>Identificadas:</strong> ${materialWeakness}</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <h5 style="color: #ea580c; font-size: 11px; margin-bottom: 6px;">⚠️ Significant Deficiency</h5>
                  <p style="font-size: 10px; line-height: 1.3;">Deficiência menos severa que uma Material Weakness, mas importante o suficiente para merecer atenção da administração.</p>
                  <p style="font-size: 9px; color: #6b7280; margin-top: 4px;"><strong>Identificadas:</strong> ${significantDeficiency}</p>
                </div>
                
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px;">
                  <h5 style="color: #1e40af; font-size: 11px; margin-bottom: 6px;">ℹ️ Control Deficiency</h5>
                  <p style="font-size: 10px; line-height: 1.3;">Deficiência no desenho ou operação de um controle que não permite que funcionários prevenham ou detectem distorções.</p>
                  <p style="font-size: 9px; color: #6b7280; margin-top: 4px;"><strong>Identificadas:</strong> ${controlDeficiency}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 8. PLANOS DE AÇÃO E CRONOGRAMA -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">8</span>
              PLANOS DE AÇÃO E CRONOGRAMA
            </h2>
            
            ${projetoDetalhado?.planos_acao?.map((plano, index) => `
              <div class="action-plan">
                <div class="action-header">
                  <h4 style="font-size: 12px; font-weight: 600; color: #0f172a;">${plano.titulo || 'Plano de Ação ' + (index + 1)}</h4>
                  <span class="priority-badge priority-${plano.prioridade || 'media'}">
                    ${(plano.prioridade || 'media').toUpperCase()}
                  </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin: 8px 0;">
                  <div class="detail-field">
                    <label>Responsável</label>
                    <span>${plano.responsavel || 'A definir'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Prazo</label>
                    <span>${plano.prazo ? new Date(plano.prazo).toLocaleDateString('pt-BR') : 'A definir'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>Status</label>
                    <span>${plano.status || 'Pendente'}</span>
                  </div>
                  
                  <div class="detail-field">
                    <label>% Conclusão</label>
                    <span>${plano.percentual_conclusao || 0}%</span>
                  </div>
                </div>
                
                <p style="font-size: 11px; margin: 6px 0; line-height: 1.4;"><strong>Descrição:</strong> ${plano.descricao || 'Implementar ações corretivas conforme recomendações de auditoria.'}</p>
              </div>
            `).join('')}
          </div>
          
          <!-- 9. CONCLUSÕES E OPINIÃO TÉCNICA -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">9</span>
              CONCLUSÕES E OPINIÃO TÉCNICA
            </h2>
            
            <div class="technical-conclusions">
              <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Avaliação Geral do Sistema de Controles Internos</h3>
              <p style="font-size: 11px; margin-bottom: 12px; line-height: 1.4;">
                Com base nos procedimentos de auditoria executados, análises técnicas realizadas e avaliação do framework COSO 2013, 
                apresentamos as seguintes conclusões técnicas:
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin: 12px 0;">
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${complianceScore >= 80 ? '#059669' : complianceScore >= 60 ? '#d97706' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>Ambiente de Controle:</strong> ${complianceScore >= 80 ? 'Adequadamente estruturado com políticas e procedimentos bem definidos, demonstrando maturidade organizacional.' : complianceScore >= 60 ? 'Parcialmente adequado, necessitando melhorias pontuais na estrutura de governança.' : 'Requer fortalecimento significativo da estrutura de controles e governança corporativa.'}</p>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${apontamentosCriticos === 0 ? '#059669' : apontamentosCriticos <= 2 ? '#d97706' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>Gestão de Riscos:</strong> ${apontamentosCriticos === 0 ? 'Riscos adequadamente identificados e mitigados através de controles efetivos.' : apontamentosCriticos <= 2 ? 'Alguns riscos críticos identificados, requerendo atenção imediata da administração.' : 'Múltiplos riscos críticos identificados, necessitando ação urgente.'}</p>
                </div>
                
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: ${trabalhosConcluidos === totalTrabalhos ? '#059669' : trabalhosConcluidos >= totalTrabalhos * 0.7 ? '#d97706' : '#dc2626'}; margin-top: 4px; flex-shrink: 0;"></span>
                  <p style="font-size: 11px; margin: 0;"><strong>Execução de Controles:</strong> ${trabalhosConcluidos === totalTrabalhos ? 'Controles operando conforme desenho e expectativas, demonstrando efetividade operacional.' : trabalhosConcluidos >= totalTrabalhos * 0.7 ? 'Alguns controles necessitam ajustes para maior efetividade.' : 'Controles apresentam deficiências significativas na execução.'}</p>
                </div>
              </div>
              
              <div style="margin-top: 20px;">
                <h3 style="color: #0f172a; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Opinião Técnica de Auditoria</h3>
                <div class="opinion-box ${complianceScore >= 80 ? 'opinion-positive' : complianceScore >= 60 ? 'opinion-qualified' : 'opinion-adverse'}">
                  <p style="font-size: 11px; margin: 6px 0; font-weight: 600;">
                    ${complianceScore >= 80 ? '✅ OPINIÃO TÉCNICA POSITIVA' : complianceScore >= 60 ? '⚠️ OPINIÃO TÉCNICA COM RESSALVAS' : '❌ OPINIÃO TÉCNICA ADVERSA'}
                  </p>
                  <p style="font-size: 11px; line-height: 1.4; margin: 6px 0;">
                    ${complianceScore >= 80 ? 
                      'Os controles internos avaliados são adequados e efetivos para mitigar os riscos identificados. O ambiente de controle demonstra maturidade organizacional e aderência às melhores práticas de mercado conforme framework COSO 2013. As deficiências identificadas são de natureza menor e não comprometem a efetividade geral do sistema de controles internos.' :
                      complianceScore >= 60 ? 
                      'Os controles internos apresentam adequação parcial, com algumas deficiências que necessitam correção para fortalecer o ambiente de controle. As melhorias recomendadas devem ser implementadas dentro dos prazos estabelecidos para assegurar a efetividade do sistema de controles conforme padrões COSO.' :
                      'Os controles internos apresentam deficiências significativas que comprometem sua efetividade na mitigação de riscos. É necessária ação imediata da administração para implementar as correções recomendadas e fortalecer o ambiente de controle organizacional conforme framework COSO 2013.'
                    }
                  </p>
                  
                  <p style="font-size: 10px; margin: 10px 0 0 0; font-style: italic;">
                    Esta opinião é baseada na avaliação técnica dos controles internos conforme metodologia de auditoria aplicada, 
                    framework COSO 2013, requisitos SOX e padrões internacionais do Institute of Internal Auditors (IIA).
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 10. REFERÊNCIAS NORMATIVAS E ANEXOS -->
          <div class="section">
            <h2 class="section-title">
              <span class="section-number">10</span>
              REFERÊNCIAS NORMATIVAS E ANEXOS
            </h2>
            
            <div class="references">
              <h4>📚 Frameworks e Normas Aplicadas</h4>
              <ul>
                <li>COSO 2013 - Internal Control - Integrated Framework</li>
                <li>SOX (Sarbanes-Oxley Act) - Seções 302 e 404</li>
                <li>IIA Standards - International Standards for the Professional Practice of Internal Auditing</li>
                <li>ISO 27001:2013 - Information Security Management Systems</li>
                <li>ISO 27002:2013 - Code of Practice for Information Security Controls</li>
                <li>COBIT 2019 - Control Objectives for Information and Related Technologies</li>
                <li>NIST Cybersecurity Framework</li>
                <li>CVM Instrução 552/2014 - Apresentação de informações sobre governança corporativa</li>
              </ul>
            </div>
            
            <div class="references">
              <h4>📋 Papéis de Trabalho e Evidências</h4>
              <ul>
                <li>PT-${projeto.codigo}-01 a PT-${projeto.codigo}-${String(totalTrabalhos).padStart(2, '0')} - Procedimentos de Auditoria</li>
                <li>PT-${projeto.codigo}-ACH-01 a PT-${projeto.codigo}-ACH-${String(totalApontamentos).padStart(2, '0')} - Achados de Auditoria</li>
                <li>PT-${projeto.codigo}-COSO - Avaliação do Framework COSO</li>
                <li>PT-${projeto.codigo}-MAT - Matriz de Materialidade</li>
                <li>PT-${projeto.codigo}-RISK - Matriz de Riscos e Controles</li>
                <li>PT-${projeto.codigo}-CONC - Memorando de Conclusões</li>
              </ul>
            </div>
            
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin: 12px 0;">
              <h4 style="color: #0f172a; font-size: 11px; font-weight: 600; margin-bottom: 8px;">⚖️ Declaração de Independência</h4>
              <p style="font-size: 10px; line-height: 1.3;">
                A equipe de auditoria interna declara que manteve independência e objetividade durante a execução dos trabalhos, 
                conforme padrões éticos do Institute of Internal Auditors (IIA) e políticas internas da organização.
              </p>
            </div>
          </div>
        </div>
        
        <!-- RODAPÉ TÉCNICO PROFISSIONAL -->
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-section">
              <h4>🔧 Equipe Técnica</h4>
              <p>Auditor Líder: ${projeto.auditor_lider || projeto.chefe_auditoria}</p>
              <p>Data de Conclusão: ${dataFormatada}</p>
              <p>Horas de Auditoria: ${totalHorasAuditoria}h</p>
            </div>
            <div class="footer-section">
              <h4>📋 Classificação</h4>
              <p>Documento: Técnico Especializado</p>
              <p>Distribuição: Gestores Operacionais</p>
              <p>Confidencialidade: Restrita</p>
            </div>
            <div class="footer-section">
              <h4>📊 Indicadores Técnicos</h4>
              <p>Score COSO: ${complianceScore}%</p>
              <p>Procedimentos: ${trabalhosConcluidos}/${totalTrabalhos}</p>
              <p>Deficiências: ${totalApontamentos}</p>
            </div>
            <div class="footer-section">
              <h4>🎯 Próximos Passos</h4>
              <p>Follow-up: 30 dias</p>
              <p>Revisão: Trimestral</p>
              <p>Monitoramento: Contínuo</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid #d1d5db; padding-top: 12px; margin-top: 12px;">
            <p style="font-size: 10px;"><strong>🏢 Sistema GRC - Governance, Risk & Compliance</strong></p>
            <p style="font-size: 9px;">Relatório técnico especializado gerado automaticamente em ${timestamp}</p>
            <p style="font-size: 8px; margin-top: 6px; line-height: 1.3;">
              Este documento contém análises técnicas detalhadas conforme padrões internacionais de auditoria interna (IIA), 
              framework COSO 2013 e requisitos SOX. Destinado a gestores operacionais, equipes técnicas e especialistas em controles internos.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default generateTechnicalReportHTML;