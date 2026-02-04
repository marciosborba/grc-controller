import { useState } from 'react';
import { PDFGenerator } from '@/utils/pdfGenerator';
import type { Risk, RiskAcceptanceLetter } from '@/types/risk-management';

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

// Dados padrão da empresa (podem ser customizados via configurações)
const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "Sua Empresa Ltda",
  cnpj: "12.345.678/0001-90",
  address: "Rua Principal, 123",
  city: "São Paulo",
  state: "SP",
  zipCode: "01000-000",
  phone: "(11) 1234-5678",
  email: "contato@suaempresa.com.br"
};

export const useRiskPDF = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Converter Risk para o formato esperado pelo PDFGenerator
  const convertRiskToLegacyFormat = (risk: Risk): any => {
    return {
      id: risk.id,
      title: risk.name,
      description: risk.description || '',
      category: risk.category,
      impact_level: `${risk.impact}/5`,
      likelihood_level: `${risk.probability}/5`,
      risk_level: risk.riskLevel,
      treatment_type: risk.treatmentType,
      treatment_details: risk.actionPlan?.description || 'Não especificado',
      identified_date: risk.identifiedDate.toISOString(),
      target_date: risk.dueDate?.toISOString() || new Date().toISOString(),
      responsible_person: risk.assignedTo || risk.owner,
      communications: risk.communications?.map(comm => ({
        id: comm.id,
        person_name: comm.recipientName,
        email: comm.recipientEmail,
        position: comm.recipientTitle || '',
        communicated_at: comm.sentAt?.toISOString() || comm.createdAt.toISOString(),
        acknowledgment_status: comm.decision === 'Aceitar' ? 'Confirmado' : 
                              comm.decision === 'Rejeitar' ? 'Rejeitado' : 'Pendente'
      })) || []
    };
  };

  // Gerar PDF da carta de aceitação de risco
  const generateAcceptanceLetter = async (
    risk: Risk, 
    acceptanceLetter?: RiskAcceptanceLetter,
    companyInfo?: Partial<CompanyInfo>
  ) => {
    setIsGenerating(true);
    
    try {
      const pdfGenerator = new PDFGenerator();
      const company = { ...DEFAULT_COMPANY_INFO, ...companyInfo };
      
      // Adicionar informações da carta de aceitação se disponível
      const riskData = convertRiskToLegacyFormat(risk);
      if (acceptanceLetter) {
        riskData.treatment_details = `${acceptanceLetter.justification}\n\nControles Compensatórios: ${acceptanceLetter.compensatingControls}\n\nJustificativa de Negócio: ${acceptanceLetter.businessJustification}`;
      }
      
      pdfGenerator.generateRiskAcceptanceLetter(company, riskData);
      
      return {
        success: true,
        fileName: `carta-aceite-risco-${risk.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      console.error('Erro ao gerar PDF da carta de aceitação:', error);
      return {
        success: false,
        error: 'Erro ao gerar PDF da carta de aceitação'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar PDF do plano de ação
  const generateActionPlan = async (
    risk: Risk,
    companyInfo?: Partial<CompanyInfo>
  ) => {
    setIsGenerating(true);
    
    try {
      const pdfGenerator = new PDFGenerator();
      const company = { ...DEFAULT_COMPANY_INFO, ...companyInfo };
      
      const riskData = convertRiskToLegacyFormat(risk);
      
      // Adicionar detalhes do plano de ação
      if (risk.actionPlan?.activities) {
        const activitiesText = risk.actionPlan.activities.map((activity, index) => 
          `${index + 1}. ${activity.name}\n   Responsável: ${activity.responsible}\n   Prazo: ${activity.dueDate ? activity.dueDate.toLocaleDateString('pt-BR') : 'Não definido'}\n   Status: ${activity.status}\n   Detalhes: ${activity.details || 'N/A'}`
        ).join('\n\n');
        
        riskData.treatment_details = `Estratégia: ${risk.treatmentType}\n\nAtividades do Plano de Ação:\n\n${activitiesText}`;
      }
      
      // Personalizar título para plano de ação
      const customPdfGenerator = new (class extends PDFGenerator {
        generateActionPlan(companyInfo: CompanyInfo, risk: any): void {
          let currentY = this.addHeader(companyInfo);
          currentY = this.addTitle("PLANO DE AÇÃO PARA GESTÃO DE RISCO", currentY);
          
          // Informações do risco
          currentY = this.addSection(
            "1. IDENTIFICAÇÃO DO RISCO",
            `Título: ${risk.title}\n\nDescrição: ${risk.description}\n\nCategoria: ${risk.category}\n\nNível de Risco: ${risk.risk_level}\n\nResponsável: ${risk.responsible_person}`,
            currentY
          );
          
          // Matriz de riscos
          currentY = this.addRiskMatrix(risk, currentY);
          
          // Plano de ação
          currentY = this.addSection(
            "2. PLANO DE TRATAMENTO",
            risk.treatment_details,
            currentY
          );
          
          // Cronograma
          currentY = this.addSection(
            "3. CRONOGRAMA",
            `Data de Início: ${new Date(risk.identified_date).toLocaleDateString('pt-BR')}\nData Limite: ${new Date(risk.target_date).toLocaleDateString('pt-BR')}`,
            currentY
          );
          
          this.addFooter();
          
          const fileName = `plano-acao-risco-${risk.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
          this.doc.save(fileName);
        }
      })();
      
      (customPdfGenerator as any).generateActionPlan(company, riskData);
      
      return {
        success: true,
        fileName: `plano-acao-risco-${risk.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      console.error('Erro ao gerar PDF do plano de ação:', error);
      return {
        success: false,
        error: 'Erro ao gerar PDF do plano de ação'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar relatório de múltiplos riscos
  const generateRiskReport = async (
    risks: Risk[],
    companyInfo?: Partial<CompanyInfo>
  ) => {
    setIsGenerating(true);
    
    try {
      const pdfGenerator = new PDFGenerator();
      const company = { ...DEFAULT_COMPANY_INFO, ...companyInfo };
      
      const risksData = risks.map(convertRiskToLegacyFormat);
      
      pdfGenerator.generateRiskReport(company, risksData);
      
      return {
        success: true,
        fileName: `relatorio-riscos-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de riscos:', error);
      return {
        success: false,
        error: 'Erro ao gerar relatório de riscos'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar matriz de riscos visual
  const generateRiskMatrix = async (
    risks: Risk[],
    companyInfo?: Partial<CompanyInfo>
  ) => {
    setIsGenerating(true);
    
    try {
      const pdfGenerator = new PDFGenerator();
      const company = { ...DEFAULT_COMPANY_INFO, ...companyInfo };
      
      const customPdfGenerator = new (class extends PDFGenerator {
        generateRiskMatrixReport(companyInfo: CompanyInfo, risks: any[]): void {
          let currentY = this.addHeader(companyInfo);
          currentY = this.addTitle("MATRIZ DE RISCOS CORPORATIVOS", currentY);
          
          // Criar matriz visual
          const matrixSize = 5;
          const cellSize = 25;
          const startX = 40;
          const startY = currentY + 20;
          
          // Labels dos eixos
          this.doc.setFontSize(10);
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('PROBABILIDADE', startX + (matrixSize * cellSize / 2) - 20, startY - 5);
          
          // Rotacionar texto para eixo Y
          this.doc.text('IMPACTO', 15, startY + (matrixSize * cellSize / 2) + 10);
          
          // Desenhar matriz
          for (let i = 0; i <= matrixSize; i++) {
            for (let j = 0; j <= matrixSize; j++) {
              const x = startX + (i * cellSize);
              const y = startY + (j * cellSize);
              
              // Cor baseada na combinação de impacto/probabilidade
              const riskScore = (matrixSize - j) * (i);
              let color = { r: 200, g: 230, b: 200 }; // Baixo
              
              if (riskScore >= 20) color = { r: 244, g: 67, b: 54 }; // Muito Alto
              else if (riskScore >= 15) color = { r: 255, g: 152, b: 0 }; // Alto
              else if (riskScore >= 8) color = { r: 255, g: 235, b: 59 }; // Médio
              
              if (i > 0 && j > 0) {
                this.doc.setFillColor(color.r, color.g, color.b);
                this.doc.rect(x, y, cellSize, cellSize, 'F');
              }
              
              this.doc.rect(x, y, cellSize, cellSize);
              
              // Labels
              if (i === 0 && j > 0) {
                this.doc.setFontSize(8);
                this.doc.text(`${matrixSize - j + 1}`, x + cellSize/2 - 2, y + cellSize/2 + 2);
              }
              if (j === 0 && i > 0) {
                this.doc.setFontSize(8);
                this.doc.text(`${i}`, x + cellSize/2 - 2, y + cellSize/2 + 2);
              }
            }
          }
          
          // Plotar riscos na matriz
          this.doc.setFontSize(8);
          this.doc.setTextColor(0, 0, 0);
          risks.forEach((risk, index) => {
            const x = startX + (risk.likelihood_score * cellSize) + (cellSize/2) - 2;
            const y = startY + ((6 - risk.impact_score) * cellSize) + (cellSize/2) + 2;
            
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`R${index + 1}`, x, y);
          });
          
          currentY = startY + (matrixSize + 1) * cellSize + 20;
          
          // Legenda
          currentY = this.addSection(
            "LEGENDA DOS RISCOS",
            risks.map((risk, index) => `R${index + 1}: ${risk.title}`).join('\n'),
            currentY
          );
          
          this.addFooter();
          
          const fileName = `matriz-riscos-${new Date().toISOString().split('T')[0]}.pdf`;
          this.doc.save(fileName);
        }
      })();
      
      const risksData = risks.map(convertRiskToLegacyFormat);
      (customPdfGenerator as any).generateRiskMatrixReport(company, risksData);
      
      return {
        success: true,
        fileName: `matriz-riscos-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      console.error('Erro ao gerar matriz de riscos:', error);
      return {
        success: false,
        error: 'Erro ao gerar matriz de riscos'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateAcceptanceLetter,
    generateActionPlan,
    generateRiskReport,
    generateRiskMatrix
  };
};