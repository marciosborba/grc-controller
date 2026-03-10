import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getTenantMatrixConfig, generateMatrixData, findRiskPositionInMatrix } from '@/utils/risk-analysis';
import type { MatrixSize } from '@/types/risk-management';

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

interface RiskAcceptanceLetter {
  id?: string;
  risk_id: string;
  letter_number: string;
  title: string;
  risk_description: string;
  business_justification: string;
  acceptance_rationale: string;
  residual_risk_level: string;
  residual_risk_score: number;
  financial_exposure: number;
  acceptance_period_start: Date;
  acceptance_period_end: Date;
  monitoring_requirements: string[];
  escalation_triggers: string[];
  review_frequency: string;
  next_review_date: Date;
  conditions_and_limitations: string[];
  compensating_controls: string[];
  stakeholder_notifications: string[];
  status: string;
  
  // Campos para matriz de risco
  probability_score?: number;
  impact_score?: number;
  tenant_id?: string;
  
  manager_approval_status?: string;
  manager_comments?: string;
  manager_approved_by?: string;
  manager_approved_at?: string;
  director_approval_status?: string;
  director_comments?: string;
  director_approved_by?: string;
  director_approved_at?: string;
  cro_approval_status?: string;
  cro_comments?: string;
  cro_approved_by?: string;
  cro_approved_at?: string;
  board_approval_status?: string;
  board_comments?: string;
  board_approved_by?: string;
  board_approved_at?: string;
  
  created_at?: string;
  created_by?: string;
  final_approval_date?: string;
}

interface RiskData {
  id: string;
  title: string;
  description: string;
  category: string;
  impact_level: string;
  likelihood_level: string;
  risk_level: string;
  treatment_type: string;
  treatment_details: string;
  identified_date: string;
  target_date: string;
  responsible_person: string;
}

interface PDFOptions {
  primaryColor?: string;
}

export class RiskLetterPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private contentWidth: number;
  private footerHeight: number = 20; // Altura reservada para o rodapé
  private primaryColor: [number, number, number] = [41, 98, 255];
  private lightGray: [number, number, number] = [248, 249, 250];
  private darkGray: [number, number, number] = [100, 100, 100];

  constructor(options?: PDFOptions) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 15;
    this.contentWidth = this.pageWidth - (this.margin * 2);
    
    // Aplicar cor personalizada se fornecida
    if (options?.primaryColor) {
      this.primaryColor = this.hexToRgb(options.primaryColor);
    }
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [41, 98, 255]; // Fallback para azul padrão
  }

  private getMaxContentY(): number {
    return this.pageHeight - this.footerHeight;
  }

  private addHeader(companyInfo: CompanyInfo): number {
    const currentY = this.margin;

    // Cabeçalho com gradiente sutil
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    
    // Linha decorativa inferior
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 28, this.pageWidth, 2, 'F');

    // Logo da empresa (se disponível)
    if (companyInfo.logo && companyInfo.logo.startsWith('data:image/')) {
      try {
        this.doc.addImage(companyInfo.logo, 'PNG', this.margin, 6, 20, 12);
      } catch (error) {
        console.warn('Erro ao adicionar logo:', error);
      }
    }

    // Nome da empresa
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyInfo.name, companyInfo.logo ? this.margin + 25 : this.margin, 14);

    // Subtítulo
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('GESTÃO DE RISCOS', companyInfo.logo ? this.margin + 25 : this.margin, 20);

    // Informações da empresa no lado direito
    this.doc.setFontSize(7);
    const rightX = this.pageWidth - this.margin;
    this.doc.text(`CNPJ: ${companyInfo.cnpj}`, rightX, 10, { align: 'right' });
    this.doc.text(`${companyInfo.phone} | ${companyInfo.email}`, rightX, 15, { align: 'right' });
    this.doc.text(`${companyInfo.city} - ${companyInfo.state}`, rightX, 20, { align: 'right' });

    // Reset cor do texto
    this.doc.setTextColor(0, 0, 0);

    return 40;
  }

  private addTitle(title: string, subtitle: string, yPosition: number): number {
    // Verificar se precisa de nova página
    if (yPosition > this.getMaxContentY() - 30) {
      this.doc.addPage();
      yPosition = this.margin;
    }

    // Título principal
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title, this.margin, yPosition);

    // Subtítulo
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.darkGray);
    this.doc.text(subtitle, this.margin, yPosition + 6);

    // Linha decorativa
    this.doc.setDrawColor(...this.primaryColor);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, yPosition + 9, this.pageWidth - this.margin, yPosition + 9);

    this.doc.setTextColor(0, 0, 0);
    return yPosition + 15;
  }

  private addInfoBox(title: string, content: string, yPosition: number, bgColor: [number, number, number] = this.lightGray): number {
    const boxHeight = 18;
    
    // Verificar se precisa de nova página
    if (yPosition + boxHeight > this.getMaxContentY()) {
      this.doc.addPage();
      yPosition = this.margin;
    }
    
    // Fundo da caixa
    this.doc.setFillColor(...bgColor);
    this.doc.rect(this.margin, yPosition, this.contentWidth, boxHeight, 'F');
    
    // Borda sutil
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(0.1);
    this.doc.rect(this.margin, yPosition, this.contentWidth, boxHeight);
    
    // Título
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title, this.margin + 3, yPosition + 5);
    
    // Conteúdo
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    const lines = this.doc.splitTextToSize(content, this.contentWidth - 6);
    this.doc.text(lines, this.margin + 3, yPosition + 10);
    
    return yPosition + boxHeight + 4;
  }

  private addSection(title: string, content: string, yPosition: number): number {
    const sectionHeaderHeight = 8;
    const estimatedContentHeight = content ? Math.ceil(content.length / 80) * 4 : 0;
    const totalSectionHeight = sectionHeaderHeight + estimatedContentHeight + 10;
    
    // Verificar se precisa de nova página
    if (yPosition + totalSectionHeight > this.getMaxContentY()) {
      this.doc.addPage();
      yPosition = this.margin;
    }

    // Título da seção com fundo
    this.doc.setFillColor(...this.lightGray);
    this.doc.rect(this.margin, yPosition, this.contentWidth, sectionHeaderHeight, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.primaryColor);
    this.doc.text(title, this.margin + 2, yPosition + 5);
    
    // Linha divisória
    this.doc.setDrawColor(...this.primaryColor);
    this.doc.setLineWidth(0.2);
    this.doc.line(this.margin, yPosition + sectionHeaderHeight, this.pageWidth - this.margin, yPosition + sectionHeaderHeight);
    
    // Conteúdo
    if (content) {
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      
      const lines = this.doc.splitTextToSize(content, this.contentWidth);
      let contentY = yPosition + sectionHeaderHeight + 6;
      
      // Verificar se o conteúdo cabe na página atual
      if (contentY + (lines.length * 3) > this.getMaxContentY()) {
        this.doc.addPage();
        contentY = this.margin;
        
        // Repetir o título da seção na nova página
        this.doc.setFillColor(...this.lightGray);
        this.doc.rect(this.margin, contentY, this.contentWidth, sectionHeaderHeight, 'F');
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.primaryColor);
        this.doc.text(title + ' (continuação)', this.margin + 2, contentY + 5);
        this.doc.setDrawColor(...this.primaryColor);
        this.doc.setLineWidth(0.2);
        this.doc.line(this.margin, contentY + sectionHeaderHeight, this.pageWidth - this.margin, contentY + sectionHeaderHeight);
        contentY += sectionHeaderHeight + 6;
        
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
      }
      
      this.doc.text(lines, this.margin, contentY);
      return contentY + (lines.length * 3) + 6;
    }
    
    return yPosition + sectionHeaderHeight + 6;
  }

  private addTable(headers: string[], data: string[][], yPosition: number): number {
    const cellHeight = 6;
    const colWidth = this.contentWidth / headers.length;
    const totalTableHeight = (data.length + 1) * cellHeight;
    
    // Verificar se precisa de nova página
    if (yPosition + totalTableHeight > this.getMaxContentY()) {
      this.doc.addPage();
      yPosition = this.margin;
    }
    
    // Headers
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.margin, yPosition, this.contentWidth, cellHeight, 'F');
    
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    
    headers.forEach((header, index) => {
      const x = this.margin + (index * colWidth) + 1;
      this.doc.text(header, x, yPosition + 4);
    });
    
    // Dados
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    data.forEach((row, rowIndex) => {
      const rowY = yPosition + cellHeight + (rowIndex * cellHeight);
      
      // Fundo alternado
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(...this.lightGray);
        this.doc.rect(this.margin, rowY, this.contentWidth, cellHeight, 'F');
      }
      
      // Bordas
      this.doc.setDrawColor(220, 220, 220);
      this.doc.setLineWidth(0.1);
      this.doc.rect(this.margin, rowY, this.contentWidth, cellHeight);
      
      row.forEach((cell, cellIndex) => {
        const x = this.margin + (cellIndex * colWidth) + 1;
        const cellText = this.doc.splitTextToSize(cell, colWidth - 2);
        this.doc.text(cellText, x, rowY + 4);
      });
    });
    
    return yPosition + cellHeight + (data.length * cellHeight) + 4;
  }

  private addApprovalSection(letter: RiskAcceptanceLetter, yPosition: number): number {
    const approvals = [
      { level: 'Gerente', status: letter.manager_approval_status, approver: letter.manager_approved_by, date: letter.manager_approved_at, comments: letter.manager_comments },
      { level: 'Diretor', status: letter.director_approval_status, approver: letter.director_approved_by, date: letter.director_approved_at, comments: letter.director_comments },
      { level: 'CRO', status: letter.cro_approval_status, approver: letter.cro_approved_by, date: letter.cro_approved_at, comments: letter.cro_comments },
      { level: 'Conselho', status: letter.board_approval_status, approver: letter.board_approved_by, date: letter.board_approved_at, comments: letter.board_comments }
    ];

    const approvedApprovals = approvals.filter(a => a.status === 'approved');
    
    if (approvedApprovals.length === 0) {
      return yPosition;
    }

    yPosition = this.addSection('6. APROVAÇÕES', '', yPosition);

    const tableData = approvedApprovals.map(approval => [
      approval.level,
      approval.status || 'Pendente',
      approval.approver || 'N/A',
      approval.date ? format(new Date(approval.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A',
      (approval.comments || 'Sem comentários').substring(0, 50) + (approval.comments && approval.comments.length > 50 ? '...' : '')
    ]);

    return this.addTable(
      ['Nível', 'Status', 'Aprovador', 'Data/Hora', 'Comentários'],
      tableData,
      yPosition
    );
  }

  private addSignatureSection(yPosition: number): number {
    const signatureBoxHeight = 20;
    
    // Verificar se precisa de nova página
    if (yPosition + signatureBoxHeight + 10 > this.getMaxContentY()) {
      this.doc.addPage();
      yPosition = this.margin;
    }

    yPosition = this.addSection('7. ASSINATURAS E VALIDAÇÃO JURÍDICA', '', yPosition);

    const signatureBoxWidth = (this.contentWidth - 8) / 2;

    // Caixa de assinatura do responsável
    this.doc.setDrawColor(...this.darkGray);
    this.doc.setLineWidth(0.2);
    this.doc.rect(this.margin, yPosition, signatureBoxWidth, signatureBoxHeight);
    
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RESPONSÁVEL PELO RISCO', this.margin + 2, yPosition + 4);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Nome: _________________________', this.margin + 2, yPosition + 9);
    this.doc.text('Cargo: ________________________', this.margin + 2, yPosition + 12);
    this.doc.text('Data: _____ Assinatura: _________', this.margin + 2, yPosition + 15);

    // Caixa de assinatura do aprovador final
    this.doc.rect(this.margin + signatureBoxWidth + 4, yPosition, signatureBoxWidth, signatureBoxHeight);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('APROVADOR FINAL (CRO/CEO)', this.margin + signatureBoxWidth + 6, yPosition + 4);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Nome: _________________________', this.margin + signatureBoxWidth + 6, yPosition + 9);
    this.doc.text('Cargo: ________________________', this.margin + signatureBoxWidth + 6, yPosition + 12);
    this.doc.text('Data: _____ Assinatura: _________', this.margin + signatureBoxWidth + 6, yPosition + 15);

    return yPosition + signatureBoxHeight + 8;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 12;
    
    // Linha separadora
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(0.1);
    this.doc.line(this.margin, footerY - 3, this.pageWidth - this.margin, footerY - 3);
    
    // Informações do rodapé
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(...this.darkGray);
    
    const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    this.doc.text(`Documento gerado automaticamente em ${currentDate}`, this.margin, footerY);
    
    const pageNumber = this.doc.getNumberOfPages();
    this.doc.text(`Página ${pageNumber}`, this.pageWidth - this.margin, footerY, { align: 'right' });
    
    // Texto de validade jurídica
    this.doc.setFontSize(5);
    this.doc.text('Este documento possui validade jurídica e deve ser arquivado conforme políticas de retenção da organização.', 
                  this.pageWidth / 2, footerY + 3, { align: 'center' });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  }

  private async addRiskMatrix(
    letter: RiskAcceptanceLetter,
    yPosition: number
  ): Promise<number> {
    // Verificar se temos dados suficientes para gerar a matriz
    if (!letter.probability_score || !letter.impact_score) {
      // Dados insuficientes para gerar matriz de risco
      return yPosition;
    }

    try {
      // Obter configuração da matriz da tenant
      const matrixConfig = await getTenantMatrixConfig(letter.tenant_id);
      // Configuração da matriz obtida

      // Gerar dados da matriz
      const matrixData = generateMatrixData(matrixConfig.type);
      
      // Encontrar posição do risco na matriz
      const riskPosition = findRiskPositionInMatrix(
        letter.probability_score,
        letter.impact_score,
        matrixConfig.type
      );

      const matrixSize = matrixConfig.type === '4x4' ? 4 : 5;
      const cellSize = 15; // Tamanho de cada célula em mm
      const matrixWidth = matrixSize * cellSize;
      const matrixHeight = matrixSize * cellSize;
      const startX = this.margin + 35; // Aumentado de 20 para 35 para dar mais espaço
      const legendWidth = 60;
      
      // Verificar se precisa de nova página
      if (yPosition + matrixHeight + 40 > this.getMaxContentY()) {
        this.doc.addPage();
        yPosition = this.margin;
      }

      // Título da seção
      yPosition = this.addSection('MATRIZ DE RISCO', '', yPosition);
      
      // Calcular o nível de risco real baseado na posição na matriz
      const realRiskLevel = matrixData[riskPosition.y][riskPosition.x].level;
      
      // Adicionar informações da matriz
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`Nível de Risco: ${realRiskLevel}`, this.margin, yPosition);
      
      yPosition += 8;

      // Desenhar labels de impacto (eixo Y - lado esquerdo)
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.darkGray);
      
      for (let i = 0; i < matrixSize; i++) {
        const labelIndex = matrixSize - 1 - i; // Inverter para mostrar do maior para o menor
        const label = matrixConfig.impact_labels[labelIndex] || `${labelIndex + 1}`;
        const y = yPosition + (i * cellSize) + (cellSize / 2) + 1;
        this.doc.text(label, startX - 2, y, { align: 'right' });
      }

      // Desenhar labels de probabilidade (eixo X - parte inferior)
      for (let i = 0; i < matrixSize; i++) {
        const label = matrixConfig.likelihood_labels?.[i] || `${i + 1}`;
        const x = startX + (i * cellSize) + (cellSize / 2);
        this.doc.text(label, x, yPosition + matrixHeight + 8, { align: 'center' });
      }

      // Desenhar a matriz
      matrixData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const x = startX + (colIndex * cellSize);
          const y = yPosition + (rowIndex * cellSize);
          
          // Cor de fundo baseada no nível de risco
          const rgb = this.hexToRgb(cell.color);
          this.doc.setFillColor(...rgb);
          this.doc.rect(x, y, cellSize, cellSize, 'F');
          
          // Borda
          this.doc.setDrawColor(255, 255, 255);
          this.doc.setLineWidth(0.5);
          this.doc.rect(x, y, cellSize, cellSize);
          
          // Valor da célula
          this.doc.setFontSize(7);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(255, 255, 255);
          const cellValue = cell.probability * cell.impact;
          this.doc.text(cellValue.toString(), x + cellSize/2, y + cellSize/2 + 1, { align: 'center' });
          
          // Destacar a posição do risco atual
          if (colIndex === riskPosition.x && rowIndex === riskPosition.y) {
            // Círculo destacando a posição do risco
            this.doc.setDrawColor(0, 0, 0);
            this.doc.setLineWidth(2);
            this.doc.circle(x + cellSize/2, y + cellSize/2, cellSize/3, 'S');
          }
        });
      });

      // Adicionar legenda
      const legendX = startX + matrixWidth + 10;
      let legendY = yPosition;
      
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text('LEGENDA:', legendX, legendY);
      
      legendY += 6;
      
      // Cores da legenda baseadas no tipo de matriz
      const legendItems = matrixConfig.type === '5x5' ? [
        { level: 'Muito Baixo', color: '#3b82f6' },
        { level: 'Baixo', color: '#22c55e' },
        { level: 'Médio', color: '#eab308' },
        { level: 'Alto', color: '#f97316' },
        { level: 'Muito Alto', color: '#ef4444' }
      ] : [
        { level: 'Baixo', color: '#22c55e' },
        { level: 'Médio', color: '#eab308' },
        { level: 'Alto', color: '#f97316' },
        { level: 'Muito Alto', color: '#ef4444' }
      ];
      
      legendItems.forEach((item, index) => {
        const itemY = legendY + (index * 6);
        
        // Quadrado colorido
        const rgb = this.hexToRgb(item.color);
        this.doc.setFillColor(...rgb);
        this.doc.rect(legendX, itemY - 2, 4, 4, 'F');
        
        // Texto
        this.doc.setFontSize(6);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(item.level, legendX + 6, itemY + 1);
      });

      // Indicador visual já está na matriz (círculo preto)
      
      // Adicionar labels dos eixos
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.primaryColor);
      
      // Label do eixo Y (Impacto) - rotacionado
      this.doc.text('IMPACTO', startX - 18, yPosition + matrixHeight/2, { angle: 90 });
      
      // Label do eixo X (Probabilidade)
      this.doc.text('PROBABILIDADE', startX + matrixWidth/2, yPosition + matrixHeight + 15, { align: 'center' });

      return yPosition + matrixHeight + 25;
      
    } catch (error) {
      console.error('Erro ao gerar matriz de risco:', error);
      // Em caso de erro, apenas adicionar uma nota
      this.doc.setFontSize(8);
      this.doc.setTextColor(255, 0, 0);
      this.doc.text('Erro ao gerar matriz de risco. Verifique a configuração da tenant.', this.margin, yPosition);
      return yPosition + 10;
    }
  }

  public async generateRiskAcceptanceLetter(
    companyInfo: CompanyInfo, 
    letter: RiskAcceptanceLetter, 
    riskData?: RiskData
  ): Promise<void> {
    try {
      // Gerador de PDF iniciado
      // Iniciando geração do PDF
      // Dados da empresa recebidos
      // Dados da carta recebidos
      // jsPDF disponível
      // Instância do documento criada
      
      let currentY = this.addHeader(companyInfo);
      
      currentY = this.addTitle(
        'GESTÃO DE RISCOS',
        `Documento Nº ${letter.letter_number} | Status: ${letter.status.toUpperCase()}`,
        currentY
      );

      // Informações básicas em caixas destacadas
      currentY = this.addInfoBox(
        'NÚMERO DA CARTA',
        letter.letter_number,
        currentY,
        [239, 246, 255]
      );

      currentY = this.addInfoBox(
        'TÍTULO DO RISCO',
        letter.title,
        currentY
      );

      // Seção 1: Identificação do Risco
      currentY = this.addSection(
        '1. IDENTIFICAÇÃO DO RISCO',
        `DESCRIÇÃO: ${letter.risk_description}\n\n` +
        `CATEGORIA: ${riskData?.category || 'Não especificada'}\n\n` +
        `NÍVEL DE RISCO RESIDUAL: ${letter.residual_risk_level}\n\n` +
        `SCORE DE RISCO: ${letter.residual_risk_score}\n\n` +
        `EXPOSIÇÃO FINANCEIRA: ${this.formatCurrency(letter.financial_exposure)}`,
        currentY
      );

      // Adicionar Matriz de Risco (se dados disponíveis)
      if (letter.probability_score && letter.impact_score) {
        currentY = await this.addRiskMatrix(letter, currentY);
      }

      // Seção 2: Justificativa de Negócio
      currentY = this.addSection(
        '2. JUSTIFICATIVA DE NEGÓCIO',
        letter.business_justification,
        currentY
      );

      // Seção 3: Racional da Aceitação
      currentY = this.addSection(
        '3. RACIONAL DA ACEITAÇÃO',
        letter.acceptance_rationale,
        currentY
      );

      // Seção 4: Período de Vigência
      currentY = this.addSection(
        '4. PERÍODO DE VIGÊNCIA',
        `INÍCIO: ${this.formatDate(letter.acceptance_period_start)}\n\n` +
        `TÉRMINO: ${this.formatDate(letter.acceptance_period_end)}\n\n` +
        `FREQUÊNCIA DE REVISÃO: ${letter.review_frequency}\n\n` +
        `PRÓXIMA REVISÃO: ${this.formatDate(letter.next_review_date)}`,
        currentY
      );

      // Seção 5: Controles e Monitoramento
      let controlsText = '';
      
      if (letter.compensating_controls && letter.compensating_controls.length > 0) {
        controlsText += 'CONTROLES COMPENSATÓRIOS:\n';
        letter.compensating_controls.forEach((control, index) => {
          if (control.trim()) {
            controlsText += `${index + 1}. ${control}\n`;
          }
        });
        controlsText += '\n';
      }
      
      if (letter.monitoring_requirements && letter.monitoring_requirements.length > 0) {
        controlsText += 'REQUISITOS DE MONITORAMENTO:\n';
        letter.monitoring_requirements.forEach((req, index) => {
          if (req.trim()) {
            controlsText += `${index + 1}. ${req}\n`;
          }
        });
        controlsText += '\n';
      }
      
      if (letter.escalation_triggers && letter.escalation_triggers.length > 0) {
        controlsText += 'GATILHOS DE ESCALAÇÃO:\n';
        letter.escalation_triggers.forEach((trigger, index) => {
          if (trigger.trim()) {
            controlsText += `${index + 1}. ${trigger}\n`;
          }
        });
      }

      if (controlsText) {
        currentY = this.addSection(
          '5. CONTROLES E MONITORAMENTO',
          controlsText,
          currentY
        );
      }

      // Seção de Aprovações
      currentY = this.addApprovalSection(letter, currentY);

      // Seção de Assinaturas
      currentY = this.addSignatureSection(currentY);

      // Declaração final
      currentY = this.addSection(
        '8. DECLARAÇÃO DE ACEITAÇÃO',
        `Declaro que, após análise detalhada dos riscos apresentados neste documento, ` +
        `a organização ${companyInfo.name} (CNPJ: ${companyInfo.cnpj}) decide formalmente ` +
        `ACEITAR o risco descrito, assumindo conscientemente suas implicações e ` +
        `comprometendo-se com o monitoramento contínuo conforme estabelecido nesta carta.\n\n` +
        `Esta decisão foi tomada considerando o perfil de apetite ao risco da organização, ` +
        `as estratégias de negócio vigentes e as análises técnicas realizadas.\n\n` +
        `O presente documento possui validade jurídica e constitui evidência formal ` +
        `da decisão de aceitação do risco para fins de auditoria e compliance.`,
        currentY
      );

      // Adicionar rodapé em todas as páginas
      const totalPages = this.doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addFooter();
      }

      // PDF estruturado, iniciando download
      
      const fileName = `carta-aceitacao-risco-${letter.letter_number}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      // Nome do arquivo definido
      // Chamando save do documento
      
      // Verificar se o navegador permite downloads
      if (typeof document === 'undefined') {
        throw new Error('Documento não disponível (ambiente não é navegador)');
      }
      
      // Tentar salvar o arquivo
      try {
        this.doc.save(fileName);
      } catch (saveError) {
        console.error('Erro específico ao salvar:', saveError);
        throw new Error(`Erro ao salvar PDF: ${saveError instanceof Error ? saveError.message : 'Erro desconhecido no save'}`);
      }
      
      // PDF salvo com sucesso
      // Arquivo salvo
      // Processo de geração concluído
      
    } catch (error) {
      console.error('Erro na geração do PDF:', error);
      throw new Error(`Falha na geração do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

export default RiskLetterPDFGenerator;
