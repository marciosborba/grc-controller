import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompanyInfo {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  logo?: string;
}

interface RiskAcceptance {
  id: string;
  risk_id: string;
  riskCode?: string;
  risk_title: string;
  risk_description: string;
  risk_category: string;
  risk_level: string;
  risk_score: number;
  residual_risk_score: number;
  acceptance_reason: string;
  accepted_by: string;
  accepted_by_role: string;
  accepted_by_email: string;
  acceptance_date: string;
  review_schedule: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  next_review_date: string;
  status: 'active' | 'under_review' | 'expired' | 'renewed';
  monitoring_frequency: string;
  created_at: string;
  updated_at: string;
}

export class RiskLetterDOCGenerator {
  private formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  }

  private getReviewFrequencyText(frequency: string): string {
    switch (frequency) {
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      case 'biannual': return 'Semestral';
      case 'annual': return 'Anual';
      default: return frequency;
    }
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Ativo';
      case 'under_review': return 'Em Revisão';
      case 'expired': return 'Expirado';
      case 'renewed': return 'Renovado';
      default: return status;
    }
  }

  public generateRiskAcceptanceLetter(
    companyInfo: CompanyInfo,
    riskAcceptance: RiskAcceptance
  ): void {
    try {
      console.log('Gerando documento DOC para carta de risco:', riskAcceptance.risk_title);

      // Criar conteúdo HTML que será convertido para DOC
      const htmlContent = this.createHTMLContent(companyInfo, riskAcceptance);
      
      // Criar blob com conteúdo HTML formatado como DOC
      const blob = new Blob([htmlContent], {
        type: 'application/msword'
      });

      // Criar link para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carta-aceitacao-risco-${riskAcceptance.risk_title.replace(/[^a-zA-Z0-9]/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.doc`;
      
      // Adicionar ao DOM temporariamente e clicar
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Documento DOC gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar documento DOC:', error);
      throw new Error(`Falha na geração do documento DOC: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private createHTMLContent(companyInfo: CompanyInfo, riskAcceptance: RiskAcceptance): string {
    const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Carta de Aceitação de Risco - ${riskAcceptance.risk_title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2962FF;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2962FF;
            margin-bottom: 5px;
        }
        .company-info {
            font-size: 12px;
            color: #666;
        }
        .document-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            color: #2962FF;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2962FF;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .info-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #495057;
        }
        .signature-section {
            margin-top: 50px;
            border-top: 1px solid #ddd;
            padding-top: 30px;
        }
        .signature-box {
            border: 1px solid #ddd;
            padding: 20px;
            margin: 20px 0;
            min-height: 80px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${companyInfo.name}</div>
        <div class="company-info">
            CNPJ: ${companyInfo.cnpj}<br>
            ${companyInfo.address}, ${companyInfo.city} - ${companyInfo.state}<br>
            Telefone: ${companyInfo.phone} | E-mail: ${companyInfo.email}
        </div>
    </div>

    <div class="document-title">
        CARTA DE ACEITAÇÃO DE RISCO
    </div>

    <div class="section">
        <div class="info-box">
            <table>
                <tr>
                    <td><span class="info-label">Documento Nº:</span></td>
                    <td>RA-${riskAcceptance.riskCode || riskAcceptance.risk_id.substring(0, 8).toUpperCase()}</td>
                </tr>
                <tr>
                    <td><span class="info-label">Data de Emissão:</span></td>
                    <td>${currentDate}</td>
                </tr>
                <tr>
                    <td><span class="info-label">Status:</span></td>
                    <td>${this.getStatusText(riskAcceptance.status)}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="section">
        <div class="section-title">1. IDENTIFICAÇÃO DO RISCO</div>
        <div class="info-box">
            <p><span class="info-label">Título do Risco:</span><br>
            ${riskAcceptance.risk_title}</p>
            
            <p><span class="info-label">Descrição:</span><br>
            ${riskAcceptance.risk_description}</p>
            
            <p><span class="info-label">Categoria:</span> ${riskAcceptance.risk_category}</p>
            
            <p><span class="info-label">Nível de Risco:</span> ${riskAcceptance.risk_level}</p>
            
            <p><span class="info-label">Score Original:</span> ${riskAcceptance.risk_score}/10</p>
            
            <p><span class="info-label">Score Residual:</span> ${riskAcceptance.residual_risk_score}/10</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">2. JUSTIFICATIVA PARA ACEITAÇÃO</div>
        <div class="info-box">
            <p>${riskAcceptance.acceptance_reason}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">3. RESPONSÁVEL PELA ACEITAÇÃO</div>
        <div class="info-box">
            <p><span class="info-label">Nome:</span> ${riskAcceptance.accepted_by}</p>
            <p><span class="info-label">Cargo:</span> ${riskAcceptance.accepted_by_role}</p>
            <p><span class="info-label">E-mail:</span> ${riskAcceptance.accepted_by_email}</p>
            <p><span class="info-label">Data de Aceitação:</span> ${this.formatDate(riskAcceptance.acceptance_date)}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">4. MONITORAMENTO E REVISÃO</div>
        <div class="info-box">
            <p><span class="info-label">Frequência de Monitoramento:</span> ${riskAcceptance.monitoring_frequency}</p>
            <p><span class="info-label">Cronograma de Revisão:</span> ${this.getReviewFrequencyText(riskAcceptance.review_schedule)}</p>
            <p><span class="info-label">Próxima Revisão:</span> ${this.formatDate(riskAcceptance.next_review_date)}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">5. DECLARAÇÃO DE ACEITAÇÃO</div>
        <div class="info-box">
            <p>Declaro que, após análise detalhada dos riscos apresentados neste documento, 
            a organização <strong>${companyInfo.name}</strong> (CNPJ: ${companyInfo.cnpj}) decide formalmente 
            <strong>ACEITAR</strong> o risco descrito, assumindo conscientemente suas implicações e 
            comprometendo-se com o monitoramento contínuo conforme estabelecido nesta carta.</p>
            
            <p>Esta decisão foi tomada considerando o perfil de apetite ao risco da organização, 
            as estratégias de negócio vigentes e as análises técnicas realizadas.</p>
            
            <p>O presente documento possui validade jurídica e constitui evidência formal 
            da decisão de aceitação do risco para fins de auditoria e compliance.</p>
        </div>
    </div>

    <div class="signature-section">
        <div class="section-title">6. ASSINATURAS</div>
        
        <div class="signature-box">
            <p><strong>RESPONSÁVEL PELO RISCO</strong></p>
            <p>Nome: ${riskAcceptance.accepted_by}</p>
            <p>Cargo: ${riskAcceptance.accepted_by_role}</p>
            <p>Data: _______________</p>
            <p>Assinatura: _________________________________</p>
        </div>

        <div class="signature-box">
            <p><strong>APROVADOR FINAL</strong></p>
            <p>Nome: _________________________________</p>
            <p>Cargo: _________________________________</p>
            <p>Data: _______________</p>
            <p>Assinatura: _________________________________</p>
        </div>
    </div>

    <div class="footer">
        <p>Documento gerado automaticamente pelo Sistema de Gestão de Riscos em ${currentDate}</p>
        <p>Este documento possui validade jurídica e deve ser arquivado conforme políticas de retenção da organização.</p>
        <p>${companyInfo.name} - ${companyInfo.city}, ${companyInfo.state}</p>
    </div>
</body>
</html>`;
  }
}

export default RiskLetterDOCGenerator;