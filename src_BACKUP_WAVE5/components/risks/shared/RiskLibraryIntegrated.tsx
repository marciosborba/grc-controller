import React from 'react';
import { RiskLibraryFixed } from './RiskLibraryFixed';
import type { RiskTemplate as DBRiskTemplate } from '@/types/riskTemplate';

// Usar interface do banco de dados
type RiskTemplate = DBRiskTemplate;

interface RiskLibraryIntegratedProps {
  onSelectTemplate: (template: RiskTemplate) => void;
}

// Componente principal que usa a versão corrigida
export const RiskLibraryIntegrated: React.FC<RiskLibraryIntegratedProps> = ({
  onSelectTemplate
}) => {
  return <RiskLibraryFixed onSelectTemplate={onSelectTemplate} />;
};