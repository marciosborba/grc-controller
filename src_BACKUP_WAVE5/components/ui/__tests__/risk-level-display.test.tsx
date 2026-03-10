import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RiskLevelDisplay } from '../risk-level-display';

// Mock do hook useTenantSettings
jest.mock('@/hooks/useTenantSettings', () => ({
  useTenantSettings: () => ({
    tenantSettings: {
      risk_matrix: {
        type: '5x5',
        risk_levels_custom: [
          { id: '1', name: 'Muito Baixo', value: 1, color: '#3b82f6', minValue: 1, maxValue: 2 },
          { id: '2', name: 'Baixo', value: 2, color: '#22c55e', minValue: 3, maxValue: 4 },
          { id: '3', name: 'Médio', value: 3, color: '#eab308', minValue: 5, maxValue: 8 },
          { id: '4', name: 'Alto', value: 4, color: '#f97316', minValue: 9, maxValue: 16 },
          { id: '5', name: 'Muito Alto', value: 5, color: '#ef4444', minValue: 17, maxValue: 25 }
        ]
      }
    },
    getRiskLevels: () => ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'],
    isLoading: false
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('RiskLevelDisplay', () => {
  const mockRisks = [
    { risk_level: 'Alto' },
    { risk_level: 'Alto' },
    { risk_level: 'Médio' },
    { risk_level: 'Baixo' },
    { risk_level: 'Muito Alto' }
  ];

  it('renders risk levels with correct counts', () => {
    render(
      <RiskLevelDisplay risks={mockRisks} />,
      { wrapper: createWrapper() }
    );

    // Verifica se os níveis são exibidos
    expect(screen.getByText('Muito Baixo')).toBeInTheDocument();
    expect(screen.getByText('Baixo')).toBeInTheDocument();
    expect(screen.getByText('Médio')).toBeInTheDocument();
    expect(screen.getByText('Alto')).toBeInTheDocument();
    expect(screen.getByText('Muito Alto')).toBeInTheDocument();

    // Verifica as contagens
    expect(screen.getByText('0')).toBeInTheDocument(); // Muito Baixo
    expect(screen.getByText('1')).toBeInTheDocument(); // Baixo, Médio, Muito Alto
    expect(screen.getByText('2')).toBeInTheDocument(); // Alto
  });

  it('renders only levels when showOnlyLevels is true', () => {
    render(
      <RiskLevelDisplay showOnlyLevels={true} />,
      { wrapper: createWrapper() }
    );

    // Verifica se mostra "Nível X" em vez dos nomes dos níveis
    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    expect(screen.getByText('Nível 2')).toBeInTheDocument();
    expect(screen.getByText('Nível 3')).toBeInTheDocument();
    expect(screen.getByText('Nível 4')).toBeInTheDocument();
    expect(screen.getByText('Nível 5')).toBeInTheDocument();

    // Verifica se mostra números sequenciais
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies responsive classes by default', () => {
    const { container } = render(
      <RiskLevelDisplay risks={mockRisks} />,
      { wrapper: createWrapper() }
    );

    const gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass('grid-cols-2', 'md:grid-cols-5');
  });

  it('applies fixed layout when responsive is false', () => {
    const { container } = render(
      <RiskLevelDisplay risks={mockRisks} responsive={false} />,
      { wrapper: createWrapper() }
    );

    const gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass('grid-cols-5');
    expect(gridElement).not.toHaveClass('grid-cols-2', 'md:grid-cols-5');
  });

  it('applies correct size classes', () => {
    const { container: smallContainer } = render(
      <RiskLevelDisplay risks={mockRisks} size="sm" />,
      { wrapper: createWrapper() }
    );

    const { container: largeContainer } = render(
      <RiskLevelDisplay risks={mockRisks} size="lg" />,
      { wrapper: createWrapper() }
    );

    // Verifica se as classes de tamanho são aplicadas
    const smallCards = smallContainer.querySelectorAll('.h-12');
    const largeCards = largeContainer.querySelectorAll('.h-24');

    expect(smallCards.length).toBeGreaterThan(0);
    expect(largeCards.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <RiskLevelDisplay risks={mockRisks} className="custom-class" />,
      { wrapper: createWrapper() }
    );

    const gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass('custom-class');
  });

  it('handles empty risks array', () => {
    render(
      <RiskLevelDisplay risks={[]} />,
      { wrapper: createWrapper() }
    );

    // Todos os níveis devem mostrar 0
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(5); // 5 níveis na matriz 5x5
  });

  it('handles risks with riskLevel property', () => {
    const risksWithRiskLevel = [
      { riskLevel: 'Alto' },
      { riskLevel: 'Médio' }
    ];

    render(
      <RiskLevelDisplay risks={risksWithRiskLevel} />,
      { wrapper: createWrapper() }
    );

    // Verifica se conta corretamente usando a propriedade riskLevel
    expect(screen.getByText('1')).toBeInTheDocument(); // Alto e Médio
  });
});

// Teste para matriz 4x4
describe('RiskLevelDisplay with 4x4 matrix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.doMock('@/hooks/useTenantSettings', () => ({
      useTenantSettings: () => ({
        tenantSettings: {
          risk_matrix: {
            type: '4x4'
          }
        },
        getRiskLevels: () => ['Baixo', 'Médio', 'Alto', 'Crítico'],
        isLoading: false
      })
    }));
  });

  it('renders 4 levels for 4x4 matrix', () => {
    // Re-import para pegar o mock atualizado
    const { RiskLevelDisplay: RiskLevelDisplay4x4 } = require('../risk-level-display');
    
    render(
      <RiskLevelDisplay4x4 showOnlyLevels={true} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    expect(screen.getByText('Nível 2')).toBeInTheDocument();
    expect(screen.getByText('Nível 3')).toBeInTheDocument();
    expect(screen.getByText('Nível 4')).toBeInTheDocument();
    expect(screen.queryByText('Nível 5')).not.toBeInTheDocument();
  });
});

// Teste para estado de carregamento
describe('RiskLevelDisplay loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.doMock('@/hooks/useTenantSettings', () => ({
      useTenantSettings: () => ({
        tenantSettings: null,
        getRiskLevels: () => [],
        isLoading: true
      })
    }));
  });

  it('renders loading skeleton', () => {
    const { RiskLevelDisplay: LoadingRiskLevelDisplay } = require('../risk-level-display');
    
    const { container } = render(
      <LoadingRiskLevelDisplay />,
      { wrapper: createWrapper() }
    );

    // Verifica se os elementos de loading estão presentes
    const skeletonElements = container.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});