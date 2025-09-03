import { useState } from 'react';
import { RiskLetterPDFGenerator } from '@/utils/riskLetterPDFGenerator';
import { RiskLetterDOCGenerator } from '@/utils/riskLetterDOCGenerator';
import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Campos para matriz de risco
  probability_score?: number;
  impact_score?: number;
}

export const useRiskAcceptancePrint = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar informações da empresa do tenant do usuário logado
  const getCompanyInfo = async (): Promise<CompanyInfo> => {
    try {
      console.log('=== CARREGAMENTO DE DADOS DA EMPRESA ===');
      console.log('Usuário logado:', {
        id: user?.id,
        email: user?.email,
        tenantId: user?.tenantId,
        tenantName: user?.tenant?.name
      });
      
      if (!user?.tenantId) {
        console.warn('Usuário sem tenantId, usando dados padrão');
        return {
          name: 'Empresa Não Configurada',
          cnpj: '00.000.000/0001-00',
          address: 'Endereço não configurado',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000',
          phone: '(11) 1234-5678',
          email: 'contato@empresa.com.br'
        };
      }

      // 1. Tentar carregar dados do tenant primeiro
      console.log('1. Tentando carregar dados do tenant...');
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.tenantId)
        .maybeSingle();

      if (tenantError) {
        console.warn('Erro ao carregar tenant:', tenantError);
      } else if (tenantData) {
        console.log('Dados do tenant carregados:', tenantData);
      }

      // 2. Tentar carregar configurações específicas da empresa
      console.log('2. Tentando carregar company_settings...');
      const { data: companyData, error: companyError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('tenant_id', user.tenantId)
        .maybeSingle();

      if (companyError) {
        console.warn('Erro ao carregar company_settings:', companyError);
      } else if (companyData) {
        console.log('Dados de company_settings carregados:', companyData);
      }

      // 3. Montar informações da empresa com prioridade
      const companyInfo: CompanyInfo = {
        // Nome: prioridade para company_settings, depois tenant, depois fallback
        name: companyData?.company_name || 
              tenantData?.name || 
              user?.tenant?.name || 
              'Empresa Não Configurada',
              
        // CNPJ: prioridade para company_settings, depois tenant
        cnpj: companyData?.cnpj || 
              tenantData?.cnpj || 
              '00.000.000/0001-00',
              
        // Endereço: prioridade para company_settings
        address: companyData?.address || 
                tenantData?.address || 
                'Endereço não configurado',
                
        city: companyData?.city || 
              tenantData?.city || 
              'São Paulo',
              
        state: companyData?.state || 
               tenantData?.state || 
               'SP',
               
        zipCode: companyData?.zip_code || 
                tenantData?.zip_code || 
                '01000-000',
                
        // Contato: prioridade para company_settings, depois tenant
        phone: companyData?.phone || 
               tenantData?.phone || 
               '(11) 1234-5678',
               
        email: companyData?.email || 
               tenantData?.contact_email || 
               user?.tenant?.contact_email || 
               user?.email || 
               'contato@empresa.com.br',
               
        // Logo: apenas de company_settings
        logo: companyData?.logo_url
      };

      console.log('=== DADOS FINAIS DA EMPRESA ===');
      console.log('CompanyInfo montado:', companyInfo);
      console.log('Nome da empresa que será usado no documento:', companyInfo.name);
      
      return companyInfo;
      
    } catch (error) {
      console.error('Erro crítico ao carregar informações da empresa:', error);
      
      // Fallback final usando dados do contexto de autenticação
      const fallbackInfo: CompanyInfo = {
        name: user?.tenant?.name || 'Empresa Não Configurada',
        cnpj: '00.000.000/0001-00',
        address: 'Endereço não configurado',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        phone: '(11) 1234-5678',
        email: user?.tenant?.contact_email || user?.email || 'contato@empresa.com.br'
      };
      
      console.log('Usando fallback:', fallbackInfo);
      return fallbackInfo;
    }
  };

  // Carregar cor personalizada do PDF
  const getPDFColor = async (): Promise<string> => {
    try {
      if (!user?.tenantId) {
        return '#2962FF'; // Azul padrão
      }

      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('pdf_primary_color')
        .eq('tenant_id', user.tenantId)
        .maybeSingle();

      if (error) {
        console.warn('Erro ao carregar cor do PDF:', error);
        return '#2962FF';
      }

      const color = settings?.pdf_primary_color || '#2962FF';
      console.log('Cor do PDF carregada:', color);
      return color;
    } catch (error) {
      console.error('Erro ao carregar cor do PDF:', error);
      return '#2962FF';
    }
  };

  const printRiskAcceptancePDF = async (riskAcceptance: RiskAcceptance) => {
    console.log('=== INÍCIO DA GERAÇÃO DE PDF ===');
    console.log('Dados do risco recebidos:', riskAcceptance);
    
    if (!riskAcceptance) {
      console.error('Nenhuma carta de risco fornecida');
      toast({
        title: 'Erro',
        description: 'Nenhuma carta de risco selecionada para impressão',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    console.log('Estado isGenerating definido como true');

    try {
      console.log('Iniciando geração de PDF para carta de risco aceito:', riskAcceptance.risk_title);
      
      // Carregar informações da empresa do tenant
      const companyInfo = await getCompanyInfo();
      console.log('Informações da empresa carregadas para PDF:', companyInfo.name);
      
      // Carregar cor personalizada
      const pdfColor = await getPDFColor();
      console.log('Cor personalizada do PDF:', pdfColor);

      // Converter RiskAcceptance para RiskAcceptanceLetter
      const riskLetter = {
        id: riskAcceptance.id,
        risk_id: riskAcceptance.risk_id,
        letter_number: `RA-${riskAcceptance.riskCode || riskAcceptance.risk_id.substring(0, 8).toUpperCase()}`,
        title: riskAcceptance.risk_title,
        risk_description: riskAcceptance.risk_description,
        business_justification: riskAcceptance.acceptance_reason,
        acceptance_rationale: `Risco aceito devido a: ${riskAcceptance.acceptance_reason}`,
        residual_risk_level: riskAcceptance.risk_level,
        residual_risk_score: riskAcceptance.residual_risk_score,
        financial_exposure: 0, // Não disponível no RiskAcceptance
        acceptance_period_start: new Date(riskAcceptance.acceptance_date),
        acceptance_period_end: new Date(riskAcceptance.next_review_date),
        monitoring_requirements: [riskAcceptance.monitoring_frequency],
        escalation_triggers: ['Mudança no nível de risco', 'Incidentes relacionados'],
        review_frequency: riskAcceptance.review_schedule,
        next_review_date: new Date(riskAcceptance.next_review_date),
        conditions_and_limitations: ['Sujeito a revisão periódica'],
        compensating_controls: ['Monitoramento contínuo'],
        stakeholder_notifications: [riskAcceptance.accepted_by],
        status: riskAcceptance.status,
        
        // Dados para matriz de risco
        probability_score: riskAcceptance.probability_score || Math.min(4, Math.max(1, Math.ceil((riskAcceptance.risk_score || 1) / 4))), // Estimar probabilidade (1-4)
        impact_score: riskAcceptance.impact_score || Math.min(4, Math.max(1, Math.ceil((riskAcceptance.risk_score || 1) / 4))), // Estimar impacto (1-4)
        tenant_id: user?.tenantId,
        
        manager_approval_status: 'approved',
        manager_approved_by: riskAcceptance.accepted_by,
        manager_approved_at: riskAcceptance.acceptance_date,
        manager_comments: 'Aprovado conforme análise',
        created_at: riskAcceptance.created_at,
        created_by: user?.id
      };

      // Criar instância do gerador de PDF com cor personalizada
      const pdfGenerator = new RiskLetterPDFGenerator({ primaryColor: pdfColor });
      console.log('Gerador de PDF criado com cor:', pdfColor);

      // Gerar o PDF
      await pdfGenerator.generateRiskAcceptanceLetter(companyInfo, riskLetter);
      console.log('PDF gerado com sucesso');

      // Registrar a ação de impressão no log de auditoria
      try {
        await supabase
          .from('activity_logs')
          .insert({
            action: 'risk_acceptance_printed_pdf',
            resource_type: 'risk_acceptance',
            resource_id: riskAcceptance.id,
            details: {
              risk_title: riskAcceptance.risk_title,
              company_name: companyInfo.name,
              tenant_id: user?.tenantId,
              pdf_color: pdfColor,
              printed_at: new Date().toISOString()
            }
          });
        console.log('Log de auditoria registrado');
      } catch (logError) {
        console.warn('Erro ao registrar log de impressão:', logError);
      }

      toast({
        title: 'Carta Impressa em PDF',
        description: `Carta de ${riskAcceptance.risk_title} de ${companyInfo.name} gerada com sucesso`,
      });

    } catch (error) {
      console.error('=== ERRO NA GERAÇÃO DE PDF ===');
      console.error('Tipo do erro:', typeof error);
      console.error('Erro completo:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      toast({
        title: 'Erro na Impressão PDF',
        description: `Não foi possível gerar o PDF da carta. Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      console.log('Finalizando geração de PDF, definindo isGenerating como false');
      setIsGenerating(false);
    }
  };

  const printRiskAcceptanceDOC = async (riskAcceptance: RiskAcceptance) => {
    if (!riskAcceptance) {
      toast({
        title: 'Erro',
        description: 'Nenhuma carta de risco selecionada para impressão',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Iniciando geração de DOC para carta de risco aceito:', riskAcceptance.risk_title);
      
      // Carregar informações da empresa do tenant
      const companyInfo = await getCompanyInfo();
      console.log('Informações da empresa carregadas para DOC:', companyInfo.name);

      // Criar instância do gerador de DOC
      const docGenerator = new RiskLetterDOCGenerator();
      console.log('Gerador de DOC criado');

      // Gerar o DOC
      docGenerator.generateRiskAcceptanceLetter(companyInfo, riskAcceptance);
      console.log('DOC gerado com sucesso');

      // Registrar a ação de impressão no log de auditoria
      try {
        await supabase
          .from('activity_logs')
          .insert({
            action: 'risk_acceptance_printed_doc',
            resource_type: 'risk_acceptance',
            resource_id: riskAcceptance.id,
            details: {
              risk_title: riskAcceptance.risk_title,
              company_name: companyInfo.name,
              tenant_id: user?.tenantId,
              printed_at: new Date().toISOString()
            }
          });
        console.log('Log de auditoria registrado');
      } catch (logError) {
        console.warn('Erro ao registrar log de impressão:', logError);
      }

      toast({
        title: 'Carta Impressa em DOC',
        description: `Carta de ${riskAcceptance.risk_title} de ${companyInfo.name} gerada com sucesso`,
      });

    } catch (error) {
      console.error('Erro ao gerar DOC da carta:', error);
      toast({
        title: 'Erro na Impressão DOC',
        description: `Não foi possível gerar o DOC da carta. Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const printMultipleRiskAcceptances = async (riskAcceptances: RiskAcceptance[], format: 'pdf' | 'doc') => {
    if (!riskAcceptances || riskAcceptances.length === 0) {
      toast({
        title: 'Erro',
        description: 'Nenhuma carta selecionada para impressão',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const companyInfo = await getCompanyInfo();
      
      for (const riskAcceptance of riskAcceptances) {
        if (format === 'pdf') {
          await printRiskAcceptancePDF(riskAcceptance);
        } else {
          await printRiskAcceptanceDOC(riskAcceptance);
        }
        
        // Pequena pausa entre downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: 'Cartas Impressas',
        description: `${riskAcceptances.length} cartas de ${companyInfo.name} geradas com sucesso em ${format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Erro ao gerar documentos das cartas:', error);
      toast({
        title: 'Erro na Impressão',
        description: 'Erro ao gerar algumas cartas. Verifique os logs.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    printRiskAcceptancePDF,
    printRiskAcceptanceDOC,
    printMultipleRiskAcceptances,
    isGenerating
  };
};

export default useRiskAcceptancePrint;