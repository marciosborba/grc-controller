export interface CompanyInfo {
  id: string;
  tenant_id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  legal_representative: string;
  legal_representative_position: string;
  legal_representative_cpf: string;
  created_at: string;
  updated_at: string;
}

export const mockCompanies: CompanyInfo[] = [
  {
    id: '1',
    tenant_id: 'tenant-1',
    name: 'TechCorp Soluções Ltda',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Tecnologias, 1234, Sala 567',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01234-567',
    phone: '(11) 9999-8888',
    email: 'contato@techcorp.com.br',
    website: 'https://www.techcorp.com.br',
    logo_url: '/logos/techcorp-logo.png',
    legal_representative: 'João Silva Santos',
    legal_representative_position: 'Diretor Geral',
    legal_representative_cpf: '123.456.789-00',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z'
  },
  {
    id: '2',
    tenant_id: 'tenant-2',
    name: 'Inovação Digital S.A.',
    cnpj: '98.765.432/0001-11',
    address: 'Avenida Paulista, 2000, 15º andar',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310-300',
    phone: '(11) 3000-4000',
    email: 'contato@inovacaodigital.com.br',
    website: 'https://www.inovacaodigital.com.br',
    logo_url: '/logos/inovacao-digital-logo.png',
    legal_representative: 'Maria Fernanda Costa',
    legal_representative_position: 'CEO',
    legal_representative_cpf: '987.654.321-00',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z'
  },
  {
    id: '3',
    tenant_id: 'tenant-3',
    name: 'Segurança Plus Consultoria',
    cnpj: '11.222.333/0001-44',
    address: 'Rua da Segurança, 555, Conjunto 1001',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip_code: '20040-020',
    phone: '(21) 2500-3500',
    email: 'info@segurancaplus.com.br',
    website: 'https://www.segurancaplus.com.br',
    logo_url: '/logos/seguranca-plus-logo.png',
    legal_representative: 'Carlos Eduardo Oliveira',
    legal_representative_position: 'Diretor de Operações',
    legal_representative_cpf: '456.789.123-00',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-07-30T00:00:00Z'
  },
  {
    id: '4',
    tenant_id: 'tenant-4',
    name: 'Compliance & Governança Brasil',
    cnpj: '33.444.555/0001-66',
    address: 'Alameda dos Estados, 4500, Torre A, 22º andar',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01451-000',
    phone: '(11) 4000-5000',
    email: 'contato@compliancegov.com.br',
    website: 'https://www.compliancegov.com.br',
    logo_url: '/logos/compliance-gov-logo.png',
    legal_representative: 'Ana Paula Rodriguez',
    legal_representative_position: 'Diretora Presidente',
    legal_representative_cpf: '789.123.456-00',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-08-10T00:00:00Z'
  },
  {
    id: '5',
    tenant_id: 'tenant-5',
    name: 'Fintech Secure Solutions',
    cnpj: '55.666.777/0001-88',
    address: 'Rua do Comércio, 1888, 8º andar, Sala 801',
    city: 'Belo Horizonte',
    state: 'MG',
    zip_code: '30112-000',
    phone: '(31) 3500-4500',
    email: 'hello@fintechsecure.com.br',
    website: 'https://www.fintechsecure.com.br',
    logo_url: '/logos/fintech-secure-logo.png',
    legal_representative: 'Roberto Almeida Junior',
    legal_representative_position: 'CTO',
    legal_representative_cpf: '321.654.987-00',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-08-07T00:00:00Z'
  },
  {
    id: '6',
    tenant_id: 'tenant-6',
    name: 'Healthcare Data Protection',
    cnpj: '77.888.999/0001-00',
    address: 'Av. das Américas, 3500, Bloco 2, Sala 1205',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip_code: '22640-102',
    phone: '(21) 3800-4900',
    email: 'contato@healthcaredata.com.br',
    website: 'https://www.healthcaredata.com.br',
    logo_url: '/logos/healthcare-data-logo.png',
    legal_representative: 'Dra. Patricia Mendes Silva',
    legal_representative_position: 'Diretora Médica',
    legal_representative_cpf: '654.321.789-00',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-08-12T00:00:00Z'
  }
];

export const getCompanyByTenant = (tenantId: string): CompanyInfo | null => {
  return mockCompanies.find(company => company.tenant_id === tenantId) || null;
};

export const getAllCompanies = (): CompanyInfo[] => {
  return mockCompanies;
};

export const createOrUpdateCompany = (companyData: Partial<CompanyInfo>): CompanyInfo => {
  const existingCompanyIndex = mockCompanies.findIndex(c => c.id === companyData.id);
  
  if (existingCompanyIndex !== -1) {
    // Update existing
    mockCompanies[existingCompanyIndex] = {
      ...mockCompanies[existingCompanyIndex],
      ...companyData,
      updated_at: new Date().toISOString()
    };
    return mockCompanies[existingCompanyIndex];
  } else {
    // Create new
    const newCompany: CompanyInfo = {
      id: Date.now().toString(),
      tenant_id: companyData.tenant_id || 'tenant-1',
      name: companyData.name || '',
      cnpj: companyData.cnpj || '',
      address: companyData.address || '',
      city: companyData.city || '',
      state: companyData.state || '',
      zip_code: companyData.zip_code || '',
      phone: companyData.phone || '',
      email: companyData.email || '',
      website: companyData.website,
      logo_url: companyData.logo_url,
      legal_representative: companyData.legal_representative || '',
      legal_representative_position: companyData.legal_representative_position || '',
      legal_representative_cpf: companyData.legal_representative_cpf || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockCompanies.push(newCompany);
    return newCompany;
  }
};