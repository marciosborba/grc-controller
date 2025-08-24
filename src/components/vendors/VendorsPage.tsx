import React from 'react';
import { VendorRiskManagementCenter } from '@/components/vendor-risk/VendorRiskManagementCenter';

/**
 * VendorsPage - Página principal do módulo de fornecedores
 * Redireciona para o VendorRiskManagementCenter atualizado
 * com a personalidade ALEX VENDOR
 */
const VendorsPage: React.FC = () => {
  return <VendorRiskManagementCenter />;
};

export default VendorsPage;