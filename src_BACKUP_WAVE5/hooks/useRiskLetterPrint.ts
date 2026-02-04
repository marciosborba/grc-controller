import { useState } from 'react';
import { RiskLetterPDFGenerator } from '@/utils/riskLetterPDFGenerator';
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

export const useRiskLetterPrint = () => {
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
      console.log('Nome da empresa que será usado no PDF:', companyInfo.name);
      
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

  const getRiskData = async (riskId: string): Promise<RiskData | null> => {
    try {
      const { data: riskData, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('id', riskId)
        .single();

      if (error || !riskData) {
        console.warn('Dados do risco não encontrados:', error);
        return null;
      }

      return {
        id: riskData.id,
        title: riskData.title || 'Risco não especificado',
        description: riskData.description || 'Descrição não disponível',
        category: riskData.risk_category || 'Categoria não especificada',
        impact_level: riskData.impact_level || 'Não avaliado',
        likelihood_level: riskData.likelihood_level || 'Não avaliado',
        risk_level: riskData.risk_level || 'Não classificado',
        treatment_type: riskData.treatment_type || 'Não definido',
        treatment_details: riskData.treatment_details || 'Detalhes não disponíveis',
        identified_date: riskData.identified_date || new Date().toISOString(),
        target_date: riskData.target_date || new Date().toISOString(),
        responsible_person: riskData.responsible_person || 'Não atribuído'
      };
    } catch (error) {
      console.error('Erro ao carregar dados do risco:', error);
      return null;
    }
  };

  const printRiskLetter = async (letter: RiskAcceptanceLetter) => {
    if (!letter) {
      toast({
        title: 'Erro',
        description: 'Nenhuma carta selecionada para impressão',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Iniciando geração de PDF para carta:', letter.letter_number);
      
      // Carregar informações da empresa do tenant
      const companyInfo = await getCompanyInfo();
      console.log('Informações da empresa carregadas para PDF:', companyInfo.name);
      
      // Carregar cor personalizada
      const pdfColor = await getPDFColor();
      console.log('Cor personalizada do PDF:', pdfColor);
      
      // Carregar dados do risco associado
      const riskData = await getRiskData(letter.risk_id);
      console.log('Dados do risco carregados:', riskData);

      // Criar instância do gerador de PDF com cor personalizada
      const pdfGenerator = new RiskLetterPDFGenerator({ primaryColor: pdfColor });
      console.log('Gerador de PDF criado com cor:', pdfColor);

      // Gerar o PDF
      await pdfGenerator.generateRiskAcceptanceLetter(companyInfo, letter, riskData || undefined);
      console.log('PDF gerado com sucesso');

      // Registrar a ação de impressão no log de auditoria
      try {
        await supabase
          .from('activity_logs')
          .insert({
            action: 'risk_letter_printed',
            resource_type: 'risk_acceptance_letter',
            resource_id: letter.id,
            details: {
              letter_number: letter.letter_number,
              letter_title: letter.title,
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
        title: 'Carta Impressa',
        description: `Carta ${letter.letter_number} de ${companyInfo.name} gerada com sucesso`,
      });

    } catch (error) {
      console.error('Erro ao gerar PDF da carta:', error);
      toast({
        title: 'Erro na Impressão',
        description: `Não foi possível gerar o PDF da carta. Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const printMultipleLetters = async (letters: RiskAcceptanceLetter[]) => {
    if (!letters || letters.length === 0) {
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
      const pdfColor = await getPDFColor();
      
      for (const letter of letters) {
        const riskData = await getRiskData(letter.risk_id);
        const pdfGenerator = new RiskLetterPDFGenerator({ primaryColor: pdfColor });
        await pdfGenerator.generateRiskAcceptanceLetter(companyInfo, letter, riskData || undefined);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: 'Cartas Impressas',
        description: `${letters.length} cartas de ${companyInfo.name} geradas com sucesso`,
      });

    } catch (error) {
      console.error('Erro ao gerar PDFs das cartas:', error);
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
    printRiskLetter,
    printMultipleLetters,
    isGenerating
  };
};

export default useRiskLetterPrint;
