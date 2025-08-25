import React, { useEffect } from 'react';
import { Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VendorRiskManagementCenter } from '@/components/vendor-risk/VendorRiskManagementCenter';
import useVendorRiskManagement from '@/hooks/useVendorRiskManagement';
import { useAuth } from '@/contexts/AuthContext';

/**
 * VendorsPage - Página principal do módulo de fornecedores
 * Inclui cabeçalho com título e subtítulo similar à página de privacidade
 */
const VendorsPage: React.FC = () => {
  const { user } = useAuth();
  const { vendors, fetchVendors } = useVendorRiskManagement();
  
  // Garantir que os fornecedores sejam carregados
  useEffect(() => {
    if (user?.tenantId || user?.tenant_id) {
      fetchVendors();
    }
  }, [user?.tenantId, user?.tenant_id, fetchVendors]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestão de Riscos de Fornecedores</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Avaliação, monitoramento e gestão completa de riscos de fornecedores
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1">
            <Building className="w-3 h-3" />
            {vendors?.length || 0} fornecedores
          </Badge>
        </div>
      </div>

      {/* Conteúdo principal */}
      <VendorRiskManagementCenter />
    </div>
  );
};

export default VendorsPage;