import { Tenant } from '@/contexts/AuthContextOptimized';

interface TenantCompanyData {
  corporate_name?: string;
  trading_name?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  industry?: string;
  size?: string;
  description?: string;
}

/**
 * Obtém o nome de exibição da tenant, priorizando o nome fantasia
 * @param tenant - Objeto da tenant
 * @returns Nome de exibição da tenant
 */
export const getTenantDisplayName = (tenant?: Tenant): string => {
  // Se não há tenant, retornar texto padrão
  if (!tenant) {
    return 'Governança • Riscos • Compliance';
  }

  // Se há tenant mas não há dados de empresa, usar o nome da tenant
  if (!tenant.settings?.company_data) {
    return tenant.name?.trim() || 'Governança • Riscos • Compliance';
  }

  // Buscar dados da empresa nas configurações da tenant
  const companyData = tenant.settings.company_data as TenantCompanyData;

  // Prioridade: Nome fantasia > Razão social > Nome da tenant > Texto padrão
  return companyData.trading_name?.trim() ||
    companyData.corporate_name?.trim() ||
    tenant.name?.trim() ||
    'Governança • Riscos • Compliance';
};

/**
 * Obtém o nome fantasia da tenant especificamente
 * @param tenant - Objeto da tenant
 * @returns Nome fantasia ou undefined se não existir
 */
export const getTenantTradingName = (tenant?: Tenant): string | undefined => {
  if (!tenant) return undefined;

  const companyData = tenant.settings?.company_data as TenantCompanyData || {};
  return companyData.trading_name?.trim() || undefined;
};

/**
 * Obtém a razão social da tenant
 * @param tenant - Objeto da tenant
 * @returns Razão social ou undefined se não existir
 */
export const getTenantCorporateName = (tenant?: Tenant): string | undefined => {
  if (!tenant) return undefined;

  const companyData = tenant.settings?.company_data as TenantCompanyData || {};
  return companyData.corporate_name?.trim() || undefined;
};

/**
 * Verifica se a tenant tem dados de empresa configurados
 * @param tenant - Objeto da tenant
 * @returns true se tem dados de empresa configurados
 */
export const hasTenantCompanyData = (tenant?: Tenant): boolean => {
  if (!tenant) return false;

  const companyData = tenant.settings?.company_data as TenantCompanyData || {};
  return !!(companyData.trading_name || companyData.corporate_name || companyData.tax_id);
};