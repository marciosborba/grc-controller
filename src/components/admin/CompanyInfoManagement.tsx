import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getCompanyByTenant, createOrUpdateCompany } from '@/data/mockCompanies';
import { 
  Building, 
  Save, 
  Edit3, 
  Upload, 
  Check, 
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  Users,
  Shield
} from 'lucide-react';

interface CompanyInfo {
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

export const CompanyInfoManagement: React.FC = () => {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState<Partial<CompanyInfo>>({});

  // Load company data - em produção, isso viria do Supabase
  useEffect(() => {
    // Simular carregamento de dados do tenant atual
    const currentTenantId = 'tenant-1'; // Em produção, viria do contexto de auth
    
    setTimeout(() => {
      const existingCompany = getCompanyByTenant(currentTenantId);
      
      if (existingCompany) {
        setCompanyInfo(existingCompany);
        setEditForm(existingCompany);
      } else {
        // Se não existe, deixa vazio para configuração
        setCompanyInfo(null);
        setEditForm({});
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedCompany = createOrUpdateCompany({
        ...companyInfo,
        ...editForm,
        tenant_id: 'tenant-1' // Em produção, viria do contexto de auth
      });
      
      setCompanyInfo(savedCompany);
      setIsEditing(false);
      
      toast({
        title: "Informações Salvas",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(companyInfo || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando informações da empresa...</p>
        </CardContent>
      </Card>
    );
  }

  if (!companyInfo) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhuma informação da empresa configurada</p>
          <Button onClick={() => setIsEditing(true)}>
            <Building className="h-4 w-4 mr-2" />
            Configurar Empresa
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Informações da Empresa</h1>
          <p className="text-muted-foreground">
            Configure as informações que aparecerão nos documentos PDF gerados
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEditClick}>
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Company Logo and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editForm.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome da empresa"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              {isEditing ? (
                <Input
                  id="cnpj"
                  value={editForm.cnpj || ''}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.cnpj}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@empresa.com.br"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                  <Mail className="h-4 w-4" />
                  {companyInfo.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editForm.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 9999-8888"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                  <Phone className="h-4 w-4" />
                  {companyInfo.phone}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Opcional)</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={editForm.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.empresa.com.br"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.website || 'Não informado'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={editForm.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
                className="min-h-[60px]"
              />
            ) : (
              <div className="p-2 bg-muted rounded text-sm">
                {companyInfo.address}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={editForm.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="São Paulo"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.city}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              {isEditing ? (
                <Input
                  id="state"
                  value={editForm.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.state}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              {isEditing ? (
                <Input
                  id="zip_code"
                  value={editForm.zip_code || ''}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  placeholder="00000-000"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.zip_code}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Representative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Representante Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="legal_representative">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="legal_representative"
                  value={editForm.legal_representative || ''}
                  onChange={(e) => handleInputChange('legal_representative', e.target.value)}
                  placeholder="Nome do representante legal"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.legal_representative}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal_representative_position">Cargo</Label>
              {isEditing ? (
                <Input
                  id="legal_representative_position"
                  value={editForm.legal_representative_position || ''}
                  onChange={(e) => handleInputChange('legal_representative_position', e.target.value)}
                  placeholder="Diretor Geral"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.legal_representative_position}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal_representative_cpf">CPF</Label>
              {isEditing ? (
                <Input
                  id="legal_representative_cpf"
                  value={editForm.legal_representative_cpf || ''}
                  onChange={(e) => handleInputChange('legal_representative_cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {companyInfo.legal_representative_cpf}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Logo da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Logo atual (será exibida nos documentos PDF)
              </p>
              {companyInfo.logo_url ? (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <Building className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Logo configurada</p>
                    <p className="text-xs text-muted-foreground">{companyInfo.logo_url}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 border rounded-lg border-dashed">
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nenhuma logo configurada</p>
                    <p className="text-xs text-muted-foreground">Clique em "Editar" para fazer upload</p>
                  </div>
                </div>
              )}
            </div>
            
            {isEditing && (
              <Button variant="outline" disabled={isSaving}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>
                Última atualização: {new Date(companyInfo.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <Badge variant={companyInfo.name ? "default" : "secondary"}>
              {companyInfo.name ? "Configurado" : "Pendente"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyInfoManagement;