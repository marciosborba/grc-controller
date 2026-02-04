import jsPDF from 'jspdf';


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
  communications?: {
    id: string;
    person_name: string;
    email: string;
    position: string;
    communicated_at: string;
    acknowledgment_status: string;
  }[];
}

export class PDFGenerator {
  protected doc: jsPDF;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  private async validateAndLoadImage(imageUrl: string): Promise<boolean> {
    try {
      // Verificar se a URL é válida
      if (!imageUrl || imageUrl.trim() === '') {
        return false;
      }

      // Para URLs relativas, tentar carregar da pasta public
      if (imageUrl.startsWith('/')) {
        const response = await fetch(imageUrl);
        return response.ok;
      }

      // Para URLs absolutas, verificar se são válidas
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        const response = await fetch(imageUrl);
        return response.ok;
      }

      // Se não for URL válida, retornar false
      return false;
    } catch (error) {
      console.warn('Erro ao validar imagem:', error);
      return false;
    }
  }

  protected addHeader(companyInfo: CompanyInfo) {
    let hasLogo = false;
    
    // Tentar adicionar logo da empresa apenas se existir e for válida
    if (companyInfo.logo && companyInfo.logo.trim() !== '') {
      try {
        // Verificar se é uma URL de dados (base64) ou tentar carregar
        if (companyInfo.logo.startsWith('data:image/')) {
          this.doc.addImage(companyInfo.logo, 'PNG', 15, 15, 30, 15);
          hasLogo = true;
        } else {
          // Para outras URLs, pular o logo para evitar erro de PNG corrupto
          console.warn('Logo URL não suportada ou inválida:', companyInfo.logo);
          hasLogo = false;
        }
      } catch (error) {
        console.warn('Erro ao adicionar logo ao PDF:', error);
        hasLogo = false;
      }
    }

    // Nome da empresa
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyInfo.name, hasLogo ? 50 : 15, 25);

    // Informações da empresa
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`CNPJ: ${companyInfo.cnpj}`, hasLogo ? 50 : 15, 32);
    this.doc.text(`${companyInfo.address}, ${companyInfo.city} - ${companyInfo.state}, ${companyInfo.zipCode}`, 
                  hasLogo ? 50 : 15, 37);
    this.doc.text(`Tel: ${companyInfo.phone} | Email: ${companyInfo.email}`, 
                  hasLogo ? 50 : 15, 42);

    // Linha separadora
    this.doc.setDrawColor(0, 0, 0);
    this.doc.line(15, 50, 195, 50);

    return 60; // Retorna a posição Y após o header
  }

  protected addTitle(title: string, yPosition: number): number {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 15, yPosition);
    
    return yPosition + 15;
  }

  protected addSection(title: string, content: string, yPosition: number): number {
    // Título da seção
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 15, yPosition);
    
    // Conteúdo da seção
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const lines = this.doc.splitTextToSize(content, 180);
    this.doc.text(lines, 15, yPosition + 8);
    
    return yPosition + 8 + (lines.length * 4) + 5;
  }

  protected addRiskMatrix(risk: RiskData, yPosition: number): number {
    const matrixTitle = "MATRIZ DE RISCOS";
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(matrixTitle, 15, yPosition);

    // Tabela da matriz de riscos
    const tableY = yPosition + 10;
    const cellHeight = 8;
    const cellWidth = 45;

    // Headers
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    
    // Desenhar bordas da tabela
    this.doc.rect(15, tableY, cellWidth, cellHeight); // Categoria
    this.doc.rect(15 + cellWidth, tableY, cellWidth, cellHeight); // Impacto
    this.doc.rect(15 + cellWidth * 2, tableY, cellWidth, cellHeight); // Probabilidade
    this.doc.rect(15 + cellWidth * 3, tableY, cellWidth, cellHeight); // Nível Final

    this.doc.text('Categoria', 17, tableY + 5);
    this.doc.text('Impacto', 17 + cellWidth, tableY + 5);
    this.doc.text('Probabilidade', 17 + cellWidth * 2, tableY + 5);
    this.doc.text('Nível de Risco', 17 + cellWidth * 3, tableY + 5);

    // Dados
    this.doc.setFont('helvetica', 'normal');
    const dataY = tableY + cellHeight;
    
    this.doc.rect(15, dataY, cellWidth, cellHeight);
    this.doc.rect(15 + cellWidth, dataY, cellWidth, cellHeight);
    this.doc.rect(15 + cellWidth * 2, dataY, cellWidth, cellHeight);
    this.doc.rect(15 + cellWidth * 3, dataY, cellWidth, cellHeight);

    this.doc.text(risk.category, 17, dataY + 5);
    this.doc.text(risk.impact_level, 17 + cellWidth, dataY + 5);
    this.doc.text(risk.likelihood_level, 17 + cellWidth * 2, dataY + 5);
    
    // Colorir célula do nível de risco baseado no nível
    const riskColor = this.getRiskLevelColor(risk.risk_level);
    this.doc.setFillColor(riskColor.r, riskColor.g, riskColor.b);
    this.doc.rect(15 + cellWidth * 3, dataY, cellWidth, cellHeight, 'F');
    this.doc.text(risk.risk_level, 17 + cellWidth * 3, dataY + 5);

    return dataY + cellHeight + 10;
  }

  private getRiskLevelColor(level: string): { r: number; g: number; b: number } {
    const colors = {
      'Muito Baixo': { r: 200, g: 230, b: 200 },
      'Baixo': { r: 200, g: 230, b: 200 },
      'Médio': { r: 255, g: 235, b: 59 },
      'Alto': { r: 255, g: 152, b: 0 },
      'Muito Alto': { r: 244, g: 67, b: 54 },
      'Crítico': { r: 244, g: 67, b: 54 }
    };
    return colors[level as keyof typeof colors] || { r: 200, g: 200, b: 200 };
  }

  private addCommunicationTable(communications: RiskData['communications'], yPosition: number): number {
    if (!communications || communications.length === 0) {
      return yPosition;
    }

    const tableTitle = "COMUNICAÇÕES E ACEITE DO RISCO";
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(tableTitle, 15, yPosition);

    const tableY = yPosition + 10;
    const cellHeight = 6;
    const colWidths = [40, 60, 40, 35];
    let currentX = 15;

    // Headers
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    
    const headers = ['Nome', 'Email', 'Cargo', 'Status'];
    headers.forEach((header, index) => {
      this.doc.rect(currentX, tableY, colWidths[index], cellHeight);
      this.doc.text(header, currentX + 2, tableY + 4);
      currentX += colWidths[index];
    });

    // Dados
    this.doc.setFont('helvetica', 'normal');
    let dataY = tableY + cellHeight;

    communications.forEach((comm) => {
      currentX = 15;
      
      // Quebrar linha se necessário
      if (dataY > 270) {
        this.doc.addPage();
        dataY = 20;
      }

      this.doc.rect(currentX, dataY, colWidths[0], cellHeight);
      this.doc.text(comm.person_name || '', currentX + 2, dataY + 4);
      currentX += colWidths[0];

      this.doc.rect(currentX, dataY, colWidths[1], cellHeight);
      this.doc.text(comm.email || '', currentX + 2, dataY + 4);
      currentX += colWidths[1];

      this.doc.rect(currentX, dataY, colWidths[2], cellHeight);
      this.doc.text(comm.position || '', currentX + 2, dataY + 4);
      currentX += colWidths[2];

      this.doc.rect(currentX, dataY, colWidths[3], cellHeight);
      const statusColor = comm.acknowledgment_status === 'Confirmado' ? 
        { r: 200, g: 230, b: 200 } : { r: 255, g: 235, b: 59 };
      this.doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
      this.doc.rect(currentX, dataY, colWidths[3], cellHeight, 'F');
      this.doc.text(comm.acknowledgment_status || 'Pendente', currentX + 2, dataY + 4);

      dataY += cellHeight;
    });

    return dataY + 10;
  }

  protected addFooter() {
    const pageHeight = this.doc.internal.pageSize.height;
    const footerY = pageHeight - 20;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(`Documento gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}`, 15, footerY);
    this.doc.text(`Página ${this.doc.getNumberOfPages()}`, 180, footerY);
  }

  public generateRiskAcceptanceLetter(companyInfo: CompanyInfo, risk: RiskData): void {
    let currentY = this.addHeader(companyInfo);
    
    currentY = this.addTitle("CARTA DE ACEITE DE RISCO", currentY);
    
    // Informações básicas do risco
    currentY = this.addSection(
      "1. IDENTIFICAÇÃO DO RISCO",
      `Título: ${risk.title}\n\nDescrição: ${risk.description}\n\nCategoria: ${risk.category}\n\nData de Identificação: ${new Date(risk.identified_date).toLocaleDateString('pt-BR')}\n\nResponsável: ${risk.responsible_person}`,
      currentY
    );

    // Matriz de riscos
    currentY = this.addRiskMatrix(risk, currentY);

    // Tratamento
    currentY = this.addSection(
      "2. TRATAMENTO DO RISCO",
      `Tipo de Tratamento: ${risk.treatment_type}\n\nJustificativa: ${risk.treatment_details}`,
      currentY
    );

    // Decisão de aceite
    currentY = this.addSection(
      "3. DECISÃO DE ACEITE",
      `Após análise cuidadosa dos riscos apresentados, a organização ${companyInfo.name} decide ACEITAR este risco, entendendo suas implicações e mantendo-se ciente dos possíveis impactos. Esta decisão foi tomada considerando o perfil de apetite ao risco da organização e as estratégias de negócio vigentes.`,
      currentY
    );

    // Comunicações
    if (risk.communications && risk.communications.length > 0) {
      currentY = this.addCommunicationTable(risk.communications, currentY);
    }

    // Data limite
    currentY = this.addSection(
      "4. VIGÊNCIA",
      `Este aceite de risco é válido até ${new Date(risk.target_date).toLocaleDateString('pt-BR')}, devendo ser revisado antes desta data.`,
      currentY
    );

    this.addFooter();

    // Salvar o PDF
    const fileName = `carta-aceite-risco-${risk.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(fileName);
  }

  public generateRiskReport(companyInfo: CompanyInfo, risks: RiskData[]): void {
    let currentY = this.addHeader(companyInfo);
    
    currentY = this.addTitle("RELATÓRIO GERAL DE RISCOS", currentY);
    
    // Resumo executivo
    const totalRisks = risks.length;
    const risksByLevel = risks.reduce((acc, risk) => {
      acc[risk.risk_level] = (acc[risk.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let summaryText = `Total de Riscos: ${totalRisks}\n\n`;
    Object.entries(risksByLevel).forEach(([level, count]) => {
      summaryText += `${level}: ${count} riscos\n`;
    });

    currentY = this.addSection("RESUMO EXECUTIVO", summaryText, currentY);

    // Lista dos riscos
    risks.forEach((risk, index) => {
      if (currentY > 250) {
        this.doc.addPage();
        currentY = 20;
      }

      currentY = this.addSection(
        `RISCO ${index + 1}: ${risk.title}`,
        `Descrição: ${risk.description}\nCategoria: ${risk.category}\nNível: ${risk.risk_level}\nTratamento: ${risk.treatment_type}\nResponsável: ${risk.responsible_person}`,
        currentY
      );
    });

    this.addFooter();
    
    const fileName = `relatorio-riscos-${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(fileName);
  }
}

export default PDFGenerator;