/**
 * HOOK MÍNIMO PARA TESTE DE PERFORMANCE
 * 
 * Versão simplificada do useRiskManagement que não faz queries ao banco.
 * Usado para testar se o problema está nas queries ou em outro lugar.
 */

import { useState, useEffect } from 'react';

// Dados mockados para teste
const MOCK_RISKS = [
  {
    id: '1',
    title: 'Risco de Segurança Cibernética',
    description: 'Vulnerabilidades em sistemas críticos',
    impact_score: 4,
    likelihood_score: 3,
    risk_score: 12,
    risk_level: 'Alto',
    status: 'Ativo',
    category: 'Tecnologia',
    owner: 'TI',
    created_at: '2024-01-15',
    updated_at: '2024-01-20'
  },
  {
    id: '2',
    title: 'Risco de Compliance LGPD',
    description: 'Não conformidade com regulamentações de privacidade',
    impact_score: 3,
    likelihood_score: 2,
    risk_score: 6,
    risk_level: 'Médio',
    status: 'Ativo',
    category: 'Compliance',
    owner: 'Jurídico',
    created_at: '2024-01-10',
    updated_at: '2024-01-18'
  },
  {
    id: '3',
    title: 'Risco Operacional',
    description: 'Falhas em processos operacionais críticos',
    impact_score: 2,
    likelihood_score: 4,
    risk_score: 8,
    risk_level: 'Médio',
    status: 'Ativo',
    category: 'Operacional',
    owner: 'Operações',
    created_at: '2024-01-12',
    updated_at: '2024-01-19'
  },
  {
    id: '4',
    title: 'Risco Financeiro',
    description: 'Exposição a perdas financeiras significativas',
    impact_score: 4,
    likelihood_score: 4,
    risk_score: 16,
    risk_level: 'Muito Alto',
    status: 'Ativo',
    category: 'Financeiro',
    owner: 'Financeiro',
    created_at: '2024-01-08',
    updated_at: '2024-01-22'
  },
  {
    id: '5',
    title: 'Risco de Reputação',
    description: 'Danos à imagem da organização',
    impact_score: 3,
    likelihood_score: 3,
    risk_score: 9,
    risk_level: 'Alto',
    status: 'Ativo',
    category: 'Reputacional',
    owner: 'Marketing',
    created_at: '2024-01-14',
    updated_at: '2024-01-21'
  }
];

interface UseRiskManagementReturn {
  risks: any[];
  isLoading: boolean;
  error: Error | null;
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  refreshRisks: () => void;
  createRisk: (riskData: any) => Promise<boolean>;
  updateRisk: (id: string, riskData: any) => Promise<boolean>;
  deleteRisk: (id: string) => Promise<boolean>;
}

export const useRiskManagementMinimal = (): UseRiskManagementReturn => {
  console.log('🚀 useRiskManagementMinimal iniciado em:', new Date().toISOString());
  
  const [risks, setRisks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Simular carregamento de dados
  useEffect(() => {
    const loadMockData = async () => {
      console.log('📊 useRiskManagementMinimal: Carregando dados mockados...');
      setIsLoading(true);
      setError(null);

      try {
        // Simular delay de rede (muito pequeno)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setRisks(MOCK_RISKS);
        console.log('✅ useRiskManagementMinimal: Dados mockados carregados:', MOCK_RISKS.length, 'riscos');
      } catch (err) {
        console.error('❌ useRiskManagementMinimal: Erro ao carregar dados mockados:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMockData();
  }, []);

  // Calcular estatísticas
  const totalRisks = risks.length;
  const criticalRisks = risks.filter(r => r.risk_level === 'Muito Alto').length;
  const highRisks = risks.filter(r => r.risk_level === 'Alto').length;
  const mediumRisks = risks.filter(r => r.risk_level === 'Médio').length;
  const lowRisks = risks.filter(r => r.risk_level === 'Baixo' || r.risk_level === 'Muito Baixo').length;

  // Funções mockadas
  const refreshRisks = () => {
    console.log('🔄 useRiskManagementMinimal: Refresh solicitado (mockado)');
    setRisks([...MOCK_RISKS]); // Simular refresh
  };

  const createRisk = async (riskData: any): Promise<boolean> => {
    console.log('➕ useRiskManagementMinimal: Criar risco (mockado):', riskData);
    // Simular criação
    const newRisk = {
      ...riskData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setRisks(prev => [...prev, newRisk]);
    return true;
  };

  const updateRisk = async (id: string, riskData: any): Promise<boolean> => {
    console.log('✏️ useRiskManagementMinimal: Atualizar risco (mockado):', id, riskData);
    // Simular atualização
    setRisks(prev => prev.map(risk => 
      risk.id === id 
        ? { ...risk, ...riskData, updated_at: new Date().toISOString() }
        : risk
    ));
    return true;
  };

  const deleteRisk = async (id: string): Promise<boolean> => {
    console.log('🗑️ useRiskManagementMinimal: Deletar risco (mockado):', id);
    // Simular deleção
    setRisks(prev => prev.filter(risk => risk.id !== id));
    return true;
  };

  console.log('📊 useRiskManagementMinimal: Estado atual:', {
    totalRisks,
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    isLoading,
    hasError: !!error
  });

  return {
    risks,
    isLoading,
    error,
    totalRisks,
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    refreshRisks,
    createRisk,
    updateRisk,
    deleteRisk
  };
};